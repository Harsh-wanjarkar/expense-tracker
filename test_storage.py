
import pytest
import storage


@pytest.fixture(autouse=True)
def clean_database(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "DB_PATH", tmp_path / "test_expenses.db")
    storage.init_db()
    yield


def test_add_expense():
    expense_id = storage.add_expense(250, "food", "Lunch")

    expenses = storage.list_expenses()

    assert expense_id > 0
    assert len(expenses) == 1
    assert expenses[0]["amount"] == 250
    assert expenses[0]["category"] == "food"
    assert expenses[0]["description"] == "Lunch"


def test_reject_invalid_amount():
    with pytest.raises(ValueError):
        storage.add_expense(-50, "food", "Invalid expense")


def test_reject_invalid_category():
    with pytest.raises(ValueError):
        storage.add_expense(100, "shopping", "Invalid category")


def test_delete_expense():
    expense_id = storage.add_expense(100, "transport", "Bus fare")

    assert storage.delete_expense(expense_id) is True
    assert storage.delete_expense(expense_id) is False
    assert storage.list_expenses() == []


def test_summary():
    storage.add_expense(100, "food", "Breakfast")
    storage.add_expense(200, "food", "Lunch")
    storage.add_expense(150, "transport", "Cab")

    summary = storage.get_summary()

    assert summary["total"] == 450
    assert summary["by_category"]["food"] == 300
    assert summary["by_category"]["transport"] == 150


def test_month_filter():
    storage.add_expense(100, "food", "October expense", "2026-10-10")
    storage.add_expense(200, "bills", "September expense", "2026-09-10")

    expenses = storage.list_expenses("2026-10")

    assert len(expenses) == 1
    assert expenses[0]["description"] == "October expense"
