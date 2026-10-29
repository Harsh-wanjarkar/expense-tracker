
import sqlite3
from pathlib import Path

import os

DB_PATH = Path(os.environ.get("EXPENSE_DB_PATH", Path(__file__).parent / "expenses.db"))

CATEGORIES = {"food", "transport", "bills", "fun", "other"}


def get_connection():
    """Open a connection to the SQLite database."""
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """Create the expenses table if it doesn't exist."""
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL CHECK (amount > 0),
                category TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                date TEXT NOT NULL
            )
        """)


def add_expense(amount, category, description="", date=None):
    """Add a new expense to the database."""
    from datetime import date as today_date

    if amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    category = category.strip().lower()
    if category not in CATEGORIES:
        raise ValueError(f"Invalid category. Choose from: {', '.join(sorted(CATEGORIES))}")

    if date is None:
        date = today_date.today().isoformat()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO expenses (amount, category, description, date)
            VALUES (?, ?, ?, ?)
            """,
            (amount, category, description.strip(), date),
        )
        return cursor.lastrowid


def list_expenses(month=None):
    """Return all expenses, optionally filtered by YYYY-MM."""
    with get_connection() as connection:
        if month:
            rows = connection.execute(
                """
                SELECT * FROM expenses
                WHERE date LIKE ?
                ORDER BY date DESC, id DESC
                """,
                (f"{month}-%",),
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM expenses ORDER BY date DESC, id DESC"
            ).fetchall()

    return [dict(row) for row in rows]


def delete_expense(expense_id):
    """Delete an expense by its ID. Return True if deleted."""
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM expenses WHERE id = ?",
            (expense_id,),
        )
        return cursor.rowcount > 0


def get_summary(month=None):
    """Return total spending and spending grouped by category."""
    with get_connection() as connection:
        if month:
            rows = connection.execute(
                """
                SELECT category, ROUND(SUM(amount), 2) AS total
                FROM expenses
                WHERE date LIKE ?
                GROUP BY category
                ORDER BY category
                """,
                (f"{month}-%",),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT category, ROUND(SUM(amount), 2) AS total
                FROM expenses
                GROUP BY category
                ORDER BY category
                """
            ).fetchall()

    category_totals = {row["category"]: row["total"] for row in rows}
    grand_total = round(sum(category_totals.values()), 2)

    return {
        "total": grand_total,
        "by_category": category_totals,
    }
