
import storage


def show_menu():
    print("\n====== EXPENSE TRACKER ======")
    print("1. Add expense")
    print("2. View expenses")
    print("3. Delete expense")
    print("4. View summary")
    print("5. Exit")


def add_expense():
    try:
        amount = float(input("Enter amount (₹): "))
        category = input(
            "Category (food/transport/bills/fun/other): "
        ).strip().lower()
        description = input("Description: ").strip()
        date = input("Date (YYYY-MM-DD, press Enter for today): ").strip()

        expense_id = storage.add_expense(
            amount,
            category,
            description,
            date or None,
        )
        print(f"Expense added successfully! ID: {expense_id}")

    except ValueError as error:
        print(f"Error: {error}")


def view_expenses():
    month = input(
        "Filter by month (YYYY-MM, or press Enter for all): "
    ).strip()

    expenses = storage.list_expenses(month or None)

    if not expenses:
        print("No expenses found.")
        return

    print("\nID | Date | Category | Description | Amount")
    print("-" * 65)

    for expense in expenses:
        print(
            f"{expense['id']} | {expense['date']} | "
            f"{expense['category']} | {expense['description']} | "
            f"₹{expense['amount']:.2f}"
        )


def delete_expense():
    try:
        expense_id = int(input("Enter the expense ID to delete: "))
        deleted = storage.delete_expense(expense_id)

        if deleted:
            print("Expense deleted successfully!")
        else:
            print("No expense found with that ID.")

    except ValueError:
        print("Please enter a valid numeric ID.")


def view_summary():
    month = input(
        "Filter by month (YYYY-MM, or press Enter for all): "
    ).strip()

    summary = storage.get_summary(month or None)

    print("\n====== SPENDING SUMMARY ======")
    print(f"Total spending: ₹{summary['total']:.2f}")

    if summary["by_category"]:
        print("\nCategory breakdown:")
        for category, total in summary["by_category"].items():
            print(f"{category.title()}: ₹{total:.2f}")
    else:
        print("No expenses to summarize.")


def main():
    storage.init_db()

    while True:
        show_menu()
        choice = input("Choose an option (1-5): ").strip()

        if choice == "1":
            add_expense()
        elif choice == "2":
            view_expenses()
        elif choice == "3":
            delete_expense()
        elif choice == "4":
            view_summary()
        elif choice == "5":
            print("Goodbye! Keep tracking your spending.")
            break
        else:
            print("Invalid choice. Please select 1-5.")


if __name__ == "__main__":
    main()
