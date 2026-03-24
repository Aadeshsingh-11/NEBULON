import os
import pandas as pd
from flask import Flask, request, jsonify, session
from dotenv import load_dotenv
from groq import Groq
import database
import json
import numpy as np
from sklearn.linear_model import Ridge
from datetime import datetime, timedelta

load_dotenv()
app = Flask(__name__)
app.secret_key = 'super_secret_biz_key'

api_key = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=api_key) if api_key else None

database.setup_db()

def get_current_user_id():
    return session.get('user_id')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    name = data.get('name', 'User')
    if not email:
        return jsonify({'status': 'error', 'message': 'Email is required'}), 400
        
    user = database.get_user_by_email(email)
    if not user:
        user_id = database.create_user(name, email)
        database.load_default_data(user_id)
    else:
        user_id = user['id']
        name = user['name']
        
    session['user_id'] = user_id
    session['user_name'] = name
    session['user_email'] = email
    
    return jsonify({'status': 'success', 'user': {'name': name, 'email': email}})

@app.route('/api/user', methods=['GET'])
def get_user():
    if not session.get('user_id'):
        return jsonify({'status': 'error', 'message': 'Not logged in'}), 401
    return jsonify({'status': 'success', 'user': {'name': session.get('user_name'), 'email': session.get('user_email')}})

@app.route('/api/data', methods=['GET'])
def get_data():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    records = database.get_financial_data(user_id)
    return jsonify({'status': 'success', 'data': records})

@app.route('/api/upload', methods=['POST'])
def upload_csv():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'})
    
    if file and file.filename.endswith('.csv'):
        try:
            df = pd.read_csv(file)
            df.columns = df.columns.astype(str).str.lower().str.strip()
            required_cols = ['month', 'revenue', 'expenses', 'category']
            if not all(col in df.columns for col in required_cols):
                return jsonify({'status': 'error', 'message': 'CSV must contain: month, revenue, expenses, category'})
            
            database.reset_financial_data(user_id)
            for _, row in df.iterrows():
                database.insert_financial_data(
                    user_id, str(row['month']), float(row['revenue']), float(row['expenses']), str(row['category'])
                )
            
            return jsonify({'status': 'success', 'message': 'Data uploaded and replaced successfully'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)})
    return jsonify({'status': 'error', 'message': 'Invalid file format'})

@app.route('/api/entry', methods=['POST'])
def add_entry():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.json
    try:
        database.insert_financial_data(
            user_id, data['month'], float(data['revenue']), float(data['expenses']), data.get('category', '')
        )
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/entry/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    try:
        database.delete_entry(entry_id, user_id)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/reset', methods=['POST'])
def reset_workspace():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    database.reset_financial_data(user_id)
    database.load_default_data(user_id)
    return jsonify({'status': 'success'})

def handle_groq_error(e):
    err_str = str(e).lower()
    if "429" in err_str or "quota" in err_str:
        return jsonify({'status': 'error', 'message': 'Groq API Quota Exceeded. Please try again later.'}), 429
    return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/forecast', methods=['POST'])
def get_forecast():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    if not groq_client: return jsonify({'status': 'error', 'message': 'Groq API Key missing'}), 500

    data = database.get_financial_data(user_id)
    prompt = f"""
    You are an expert SME financial analyst. Based on this historical data: {data}
    1. Predict the revenue and expenses for the next 3 months.
    2. Provide 3 highly actionable, specific prescriptive strategies formatted nicely for the frontend.
    Focus on Indian market context, and mention values in INR (₹).

    Respond EXPERTLY in ONLY JSON format:
    {{
      "forecast": [
        {{"month": "Month1", "revenue": 1000, "expenses": 800}},
        ...3 months total
      ],
      "recommendations": [
        "Strategy 1...", "Strategy 2...", "Strategy 3..."
      ]
    }}
    Do not include markdown blocks or any other text. Only the raw JSON.
    """
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        raw_text = completion.choices[0].message.content.strip()
        parsed = json.loads(raw_text)
        return jsonify({'status': 'success', 'data': parsed})
    except Exception as e:
        return handle_groq_error(e)

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    if not groq_client: return jsonify({'status': 'error', 'message': 'Groq API Key missing'}), 500
    
    data = database.get_financial_data(user_id)
    prompt = f"""
    Analyze this financial data for an Indian SME: {data}
    Identify the single most significant anomaly (e.g. huge expense spike, major revenue drop).
    Respond in ONLY JSON format:
    {{
      "month": "The month the anomaly occurred",
      "explanation": "A short, 1-sentence explanation of what went wrong and potential impact in ₹."
    }}
    If no major anomaly exists, pick a minor one. Do not output markdown, just raw JSON.
    """
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        raw_text = completion.choices[0].message.content.strip()
        parsed = json.loads(raw_text)
        return jsonify({'status': 'success', 'data': parsed})
    except Exception as e:
        return handle_groq_error(e)

@app.route('/api/chat', methods=['POST'])
def chat():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    if not groq_client: return jsonify({'status': 'error', 'message': 'Groq API Key missing'}), 500

    payload = request.json
    user_message = payload.get('message', '')
    history = payload.get('history', [])
    data = database.get_financial_data(user_id)

    prompt = f"""
    You are an AI Business CoPilot for an Indian SME. 
    Here is their current financial data: {data}
    Use formatting to highlight key amounts in ₹.

    Chat history so far:
    {history}

    User asked: {user_message}
    Answer intelligently based tightly on their financial data.
    """
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
        )
        return jsonify({'status': 'success', 'message': completion.choices[0].message.content.strip()})
    except Exception as e:
        return handle_groq_error(e)

@app.route('/api/health-score', methods=['POST', 'GET'])
def get_health_score():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    data = database.get_financial_data(user_id)
    if not data: return jsonify({'status': 'error', 'message': 'No data available to analyze'})

    prompt = f"""
    You are an expert SME financial auditor. Analyze this dataset: {data}
    Provide a comprehensive business health score based on cash flow, revenue momentum, and expense control.
    Return ONLY pure JSON matching this exact structure:
    {{
      "overall_score": 72,
      "grade": "B+",
      "categories": [
        {{"name": "Revenue Growth", "score": 85, "status": "good", "insight": "Strong upward trend"}},
        {{"name": "Expense Control", "score": 60, "status": "warning", "insight": "Expenses growing"}},
        {{"name": "Profit Margin", "score": 75, "status": "good", "insight": "Consistent"}},
        {{"name": "Cash Flow Risk", "score": 55, "status": "danger", "insight": "Negative cash flow risk"}},
        {{"name": "Business Momentum", "score": 80, "status": "good", "insight": "Growth positive"}}
      ],
      "summary": "Your business shows strong growth but needs expense optimization.",
      "top_risks": ["Risk 1", "Risk 2"],
      "top_opportunities": ["Opp 1", "Opp 2"]
    }}
    Do not output markdown. Only exact raw JSON.
    """
    if not groq_client: return jsonify({'status': 'error', 'message': 'Groq client not initialized. Check API Key.'})
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        parsed = json.loads(completion.choices[0].message.content.strip())
        return jsonify({'status': 'success', 'data': parsed})
    except Exception as e:
        return handle_groq_error(e)

import urllib.request
import xml.etree.ElementTree as ET

@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        url = "https://www.moneycontrol.com/rss/business.xml"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        root = ET.fromstring(xml_data)
        news_items = []
        for item in root.findall('.//item')[:8]:
            t = item.find('title')
            l = item.find('link')
            d = item.find('description')
            p = item.find('pubDate')
            news_items.append({
                'title': t.text if t is not None else '',
                'link': l.text if l is not None else '',
                'description': d.text if d is not None else '',
                'pubDate': p.text if p is not None else ''
            })
        return jsonify({'status': 'success', 'data': news_items})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def update_settings():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    data = request.json
    new_name = data.get('name')
    if new_name:
        database.update_user(user_id, new_name)
        session['user_name'] = new_name
    return jsonify({'status': 'success', 'message': 'Updated'})

@app.route('/api/upload-daily', methods=['POST'])
def upload_daily_csv():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    if 'file' not in request.files: return jsonify({'status': 'error', 'message': 'No file part'})
    file = request.files['file']
    if file.filename == '': return jsonify({'status': 'error', 'message': 'No selected file'})
    
    if file and file.filename.endswith('.csv'):
        try:
            df = pd.read_csv(file)
            df.columns = df.columns.astype(str).str.lower().str.strip()
            if 'month' in df.columns and 'date' not in df.columns:
                df = df.rename(columns={'month': 'date'})
            
            required_cols = ['date', 'revenue', 'expenses']
            if not all(col in df.columns for col in required_cols):
                return jsonify({'status': 'error', 'message': 'CSV must contain: date, revenue, expenses'})
            
            database.reset_daily_data(user_id)
            for _, row in df.iterrows():
                database.insert_daily_data(user_id, str(row['date']), float(row['revenue']), float(row['expenses']))
            return jsonify({'status': 'success'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)})
    return jsonify({'status': 'error', 'message': 'Invalid file format'})

@app.route('/api/ml-predict', methods=['GET'])
def get_ml_prediction():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    
    data = database.get_daily_data(user_id)
    if not data or len(data) < 7:
        return jsonify({'status': 'error', 'message': 'Not enough data. Upload at least 7 days of historical transactions.'})
        
    try:
        df = pd.DataFrame(data)
        df['date_obj'] = pd.to_datetime(df['date'])
        df = df.sort_values('date_obj').reset_index(drop=True)
        
        X = df['date_obj'].map(datetime.toordinal).values.reshape(-1, 1)
        y_rev = df['revenue'].values
        y_exp = df['expenses'].values
        
        model_rev = Ridge(alpha=1.0)
        model_exp = Ridge(alpha=1.0)
        model_rev.fit(X, y_rev)
        model_exp.fit(X, y_exp)
        
        last_date = df['date_obj'].max()
        future_dates = [last_date + timedelta(days=i) for i in range(1, 31)]
        X_future = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
        
        pred_rev = model_rev.predict(X_future)
        pred_exp = model_exp.predict(X_future)
        
        historical = []
        for _, row in df.iterrows():
            historical.append({
                'date': row['date_obj'].strftime('%Y-%m-%d'),
                'revenue': round(row['revenue'], 2),
                'expenses': round(row['expenses'], 2),
                'isFuture': False
            })
            
        future = []
        for i in range(30):
            future.append({
                'date': future_dates[i].strftime('%Y-%m-%d'),
                'revenue': max(0, round(pred_rev[i], 2)),
                'expenses': max(0, round(pred_exp[i], 2)),
                'isFuture': True
            })
            
        return jsonify({'status': 'success', 'historical': historical, 'predictions': future})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'ML Training Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
