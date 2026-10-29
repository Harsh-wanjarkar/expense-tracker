
from datetime import date as Date 
from typing import Literal, Optional
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

import storage


app = FastAPI(title="Expense Tracker API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Category = Literal["food", "transport", "bills", "fun", "other"]


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    category: Category
    description: str = Field(default="", max_length=200)
    date: Optional[Date] = None


@app.on_event("startup")
def startup():
    storage.init_db()


@app.get("/")
def home():
    return {"message": "Expense Tracker API is running!"}


@app.get("/categories")
def get_categories():
    return {"categories": sorted(storage.CATEGORIES)}


@app.post("/expenses", status_code=201)
def create_expense(expense: ExpenseCreate):
    expense_id = storage.add_expense(
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date.isoformat() if expense.date else None,
    )

    return {"message": "Expense created successfully", "id": expense_id}


@app.get("/expenses")
def get_expenses(
    month: str | None = Query(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
):
    return storage.list_expenses(month)


@app.delete("/expenses/{expense_id}")
def remove_expense(expense_id: int):
    deleted = storage.delete_expense(expense_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")

    return {"message": "Expense deleted successfully"}


@app.get("/summary")
def get_summary(
    month: str | None = Query(default=None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
):
    return storage.get_summary(month)
