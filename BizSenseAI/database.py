import sqlite3
from sqlite3 import Error
import os

DB_FILE = "bizsense.db"

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
    except Error as e:
        print(e)
    return conn

def setup_db():
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            # Create users table
            c.execute('''CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            email TEXT UNIQUE NOT NULL
                        );''')
            # Create financials table
            c.execute('''CREATE TABLE IF NOT EXISTS financials (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            month TEXT NOT NULL,
                            revenue REAL NOT NULL,
                            expenses REAL NOT NULL,
                            category TEXT,
                            FOREIGN KEY (user_id) REFERENCES users (id)
                        );''')
            conn.commit()
        except Error as e:
            print(e)
        finally:
            conn.close()

def get_user_by_email(email):
    conn = create_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, email FROM users WHERE email=?", (email,))
    user = c.fetchone()
    conn.close()
    if user:
        return {'id': user[0], 'name': user[1], 'email': user[2]}
    return None

def create_user(name, email):
    conn = create_connection()
    c = conn.cursor()
    c.execute("INSERT INTO users(name, email) VALUES(?,?)", (name, email))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    return user_id

def update_user(user_id, name):
    conn = create_connection()
    c = conn.cursor()
    c.execute("UPDATE users SET name=? WHERE id=?", (name, user_id))
    conn.commit()
    conn.close()

def delete_entry(entry_id, user_id):
    conn = create_connection()
    c = conn.cursor()
    c.execute("DELETE FROM financials WHERE id=? AND user_id=?", (entry_id, user_id))
    conn.commit()
    conn.close()

def get_financial_data(user_id):
    conn = create_connection()
    c = conn.cursor()
    c.execute("SELECT id, month, revenue, expenses, category FROM financials WHERE user_id=? ORDER BY id ASC", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    data = []
    for row in rows:
        data.append({
            'id': row[0],
            'month': row[1],
            'revenue': row[2],
            'expenses': row[3],
            'category': row[4]
        })
    return data

def reset_financial_data(user_id):
    conn = create_connection()
    c = conn.cursor()
    c.execute("DELETE FROM financials WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()

def insert_financial_data(user_id, month, revenue, expenses, category):
    conn = create_connection()
    c = conn.cursor()
    c.execute("INSERT INTO financials(user_id, month, revenue, expenses, category) VALUES(?,?,?,?,?)", 
              (user_id, month, revenue, expenses, category))
    conn.commit()
    conn.close()

def load_default_data(user_id):
    default_data = [
        {"month": "Jan", "revenue": 15000, "expenses": 10000, "category": "Sales"},
        {"month": "Feb", "revenue": 18000, "expenses": 11500, "category": "Sales"},
        {"month": "Mar", "revenue": 16000, "expenses": 25000, "category": "Marketing"},
        {"month": "Apr", "revenue": 21000, "expenses": 11000, "category": "Sales"},
        {"month": "May", "revenue": 24000, "expenses": 12000, "category": "Sales"},
        {"month": "Jun", "revenue": 26000, "expenses": 13500, "category": "Sales"}
    ]
    for d in default_data:
        insert_financial_data(user_id, d['month'], d['revenue'], d['expenses'], d['category'])
