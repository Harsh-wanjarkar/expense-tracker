
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API = "https://expense-tracker-api-2rar.onrender.com";
const CATEGORIES = ["food", "transport", "bills", "fun", "other"];

function today() {
  return new Date().toLocaleDateString("en-CA");
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, by_category: {} });
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "food",
    description: "",
    date: today(),
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = month ? `?month=${encodeURIComponent(month)}` : "";
      const [expenseResponse, summaryResponse] = await Promise.all([
        fetch(`${API}/expenses${query}`),
        fetch(`${API}/summary${query}`),
      ]);

      if (!expenseResponse.ok || !summaryResponse.ok) {
        throw new Error("The server could not load your expenses.");
      }

      const expenseData = await expenseResponse.json();
      const summaryData = await summaryResponse.json();

      setExpenses(expenseData);
      setSummary(summaryData);
    } catch {
      setError("Couldn't connect to the backend. Check that FastAPI is running.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.amount),
          category: form.category,
          description: form.description.trim(),
          date: form.date || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const detail = result.detail;

        let errorMessage = "Couldn't add this expense.";

        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail
            .map((item) => item.msg || JSON.stringify(item))
            .join("; ");
        } else if (detail) {
          errorMessage = JSON.stringify(detail);
        }

        throw new Error(errorMessage);
      }

      setForm({
        amount: "",
        category: "food",
        description: "",
        date: today(),
      });

      setMessage("Expense added successfully!");
      await loadData();
    } catch (err) {
      setError(err.message || "Couldn't add this expense.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Couldn't delete this expense.");
      }

      setMessage("Expense deleted successfully!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const categoryColors = {
    food: "#e9a23b",
    transport: "#5797e8",
    bills: "#9272d6",
    fun: "#df79a6",
    other: "#7c8b99",
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">₹</span>
          <span>paisa<span className="brand-light">track</span></span>
        </a>
        <span className="topbar-label">PERSONAL FINANCE</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR MONEY, IN FOCUS</p>
          <h1>Know where<br />your money goes.</h1>
          <p className="hero-copy">
            Every rupee accounted for. Your spending, all in one place.
          </p>
        </div>
        <div className="hero-mark" aria-hidden="true">₹</div>
      </section>

      {error && <div className="notice error-notice">{error}</div>}
      {message && <div className="notice success-notice">{message}</div>}

      <section className="stats-grid">
        <article className="stat-card total-card">
          <p className="stat-label">TOTAL SPENDING</p>
          <h2>{money(summary.total)}</h2>
          <p className="stat-foot">{month || "All recorded time"}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">EXPENSES</p>
          <h2>{expenses.length}</h2>
          <p className="stat-foot">Transactions in this view</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">TOP CATEGORY</p>
          <h2 className="top-category">
            {Object.entries(summary.by_category).length
              ? Object.entries(summary.by_category).sort((a, b) => b[1] - a[1])[0][0]
              : "—"}
          </h2>
          <p className="stat-foot">Based on total spending</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel add-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NEW TRANSACTION</p>
              <h2>Add an expense</h2>
            </div>
            <span className="heading-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 450"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />

            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              maxLength="200"
              placeholder="What did you spend on?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "＋  Add expense"}
            </button>
          </form>
        </article>

        <article className="panel breakdown-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SPENDING HABITS</p>
              <h2>Category breakdown</h2>
            </div>
          </div>

          {Object.keys(summary.by_category).length === 0 ? (
            <p className="empty-state">Add an expense to see your breakdown.</p>
          ) : (
            <div className="category-list">
              {Object.entries(summary.by_category)
                .sort((a, b) => b[1] - a[1])
                .map(([category, total]) => (
                  <div className="category-row" key={category}>
                    <div className="category-meta">
                      <span className="category-name">
                        <span
                          className="category-dot"
                          style={{ backgroundColor: categoryColors[category] }}
                        />
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <strong>{money(total)}</strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${summary.total ? (total / summary.total) * 100 : 0}%`,
                          backgroundColor: categoryColors[category],
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel transactions-panel">
        <div className="transactions-heading">
          <div>
            <p className="eyebrow">YOUR RECORDS</p>
            <h2>Recent expenses</h2>
          </div>
          <div className="month-filter">
            <label htmlFor="month">Filter month</label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            {month && (
              <button className="clear-filter" onClick={() => setMonth("")}>
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading your expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="empty-state">No expenses here yet. Add your first one above!</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="amount-cell">Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="description-cell">
                      <span className="transaction-icon">
                        {expense.category === "food" ? "🍜"
                          : expense.category === "transport" ? "🚕"
                          : expense.category === "bills" ? "🧾"
                          : expense.category === "fun" ? "🎟️" : "📦"}
                      </span>
                      {expense.description || "Untitled expense"}
                    </td>
                    <td>
                      <span className={`category-pill ${expense.category}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="date-cell">{expense.date}</td>
                    <td className="amount-cell">{money(expense.amount)}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(expense.id)}
                        aria-label={`Delete expense ${expense.id}`}
                        title="Delete expense"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>paisa<span className="brand-light">track</span></span>
        <span>Built with React, FastAPI & SQLite</span>
      </footer>
    </main>
  );
}

export default App;
