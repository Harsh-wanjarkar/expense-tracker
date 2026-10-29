# 💸 Expense Tracker

A full-stack expense tracking application built with **Python, FastAPI, SQLite, and React**. Track daily spending, organize expenses by category, and monitor monthly expenses through a simple dashboard.

## ✨ Features

- **Add Expenses** — Record an amount, category, description, and date.
- **View Expenses** — Browse your recorded transactions.
- **Delete Expenses** — Remove transactions when needed.
- **Category Breakdown** — Understand where your money goes.
- **Monthly Filtering** — Filter transactions by month.
- **Expense Summary** — View total spending and category-wise totals.
- **REST API** — Backend endpoints built using FastAPI.
- **Automated Tests** — Test the storage layer with pytest.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core logic and backend |
| FastAPI | REST API |
| SQLite | Database |
| React | Frontend |
| Vite | Frontend development server |
| Pytest | Automated testing |
| Git & GitHub | Version control |

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd expense-tracker
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository's actual URL.

### 2. Set up the Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Start the backend

```bash
uvicorn api:app --reload
```

The API will run at `http://127.0.0.1:8000`.

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 4. Start the frontend

Open a second terminal window:

```bash
cd expense-tracker/frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

### 5. Run tests

From the project root, with the virtual environment activated:

```bash
pytest -v
```

## 📁 Project Structure

```text
expense-tracker/
├── api.py
├── storage.py
├── tracker.py
├── test_storage.py
├── requirements.txt
├── .gitignore
└── frontend/
    ├── src/
    ├── package.json
    └── ...
```

## 🎯 Future Improvements

- User authentication and individual accounts
- Interactive spending charts
- Monthly budgets and spending limits
- Export expenses to CSV
- Cloud database and deployment

---

**Built as a full-stack learning project.**
