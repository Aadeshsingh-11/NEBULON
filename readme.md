<div align="center">
  <img src="VyapaarSetu/frontend/public/logo.png" alt="VyapaarSetu Logo" width="250" />
</div>

<h1 align="center">VyapaarSetu</h1>
<h3 align="center">The AI-Powered Financial CoPilot for Indian SMEs</h3>

<p align="center">
  VyapaarSetu is an enterprise-grade, full-stack SaaS platform designed to solve the financial blindspot for Small and Medium Enterprises (SMEs) in India. It converts raw financial data into an intelligent, highly visual dashboard featuring predictive machine learning and an LLM-powered 24/7 CFO assistant.
</p>

---

## 🌟 Key Features

* **Real-Time Financial Dashboard:** Stunning glassmorphism UI converting messy CSV data into beautiful KPIs, charts, and metrics.
* **AI CFO Assistant:** Integrated with lightning-fast Groq Llama-3 LLMs to answer natural language questions about your live financial data instantly.
* **ML Predictive Forecasting:** Utilizes custom Scikit-Learn (Ridge) machine learning models to forecast revenue and expenses 30 days into the future.
* **Anomaly & Threat Detection:** Automatically flags unusual expenses or drops in revenue momentum to protect cash flow.
* **Automated Business Reporting:** Generates formal, Chartered Accountant (CA) style financial summaries, complete with automated grading on your cash flow health.
* **Live Market Intelligence:** Real-time Indian business news integration (powered by Economic Times & Moneycontrol feeds).

---

## 💻 Tech Stack

**Frontend (Client)**
* React.js & Vite
* TypeScript
* Tailwind CSS (Custom Pastel Light SaaS Theme)
* Framer Motion (Animations & Interactions)
* Recharts (Complex Data Visualization)

**Backend (Server)**
* Python (Flask)
* SQLite (Encrypted Data Ingestion)
* Pandas & Scikit-Learn (Data processing, ML Forecasting)
* Groq API (Inference Engine for Llama 3)
* Web Scraping / RSS Parsers (Live News)

---

## 🚀 Quick Start (Local Setup)

### 1. Backend Setup (Flask & AI)
Navigate to the main directory and install Python dependencies:
```bash
cd VyapaarSetu
pip install -r requirements.txt
```
Create a `.env` file in the same directory and add your Groq API key:
```ini
GROQ_API_KEY=gsk_your_api_key_here
```
Run the local backend server (defaults to port 5000):
```bash
python app.py
```

### 2. Frontend Setup (React/Vite)
Open a new terminal window and navigate to the frontend directory:
```bash
cd VyapaarSetu/frontend
npm install
npm run dev
```
Your app will be live at `http://localhost:5173` (or whichever port Vite allocates).

---

## 🛡️ Privacy & Security
VyapaarSetu utilizes local SQLite database sessions ensuring strict tenant isolation. API keys input by users are transmitted securely to the backend for immediate inference, avoiding long-term permanent storage of third-party keys unless explicitly requested via the Settings panel.

---
<div align="center">
  <i>From Records to Real Insights — Built for the Next Million SMEs.</i>
</div>
