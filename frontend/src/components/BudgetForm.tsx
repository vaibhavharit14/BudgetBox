"use client";

import { useBudgetStore } from "../store/budgetStore";

const fieldLabels: Record<string, { label: string; icon: string }> = {
  income: { label: "Monthly Income", icon: "💰" },
  monthly_bills: { label: "Monthly Bills", icon: "📋" },
  food: { label: "Food & Groceries", icon: "🍔" },
  transport: { label: "Transportation", icon: "🚗" },
  subscriptions: { label: "Subscriptions", icon: "📺" },
  misc: { label: "Miscellaneous", icon: "📦" },
};

export default function BudgetForm({ email }: { email: string }) {
  const { budget, setField } = useBudgetStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setField(e.target.name as keyof typeof budget, e.target.value);
  };

  const calculateTotal = () => {
    const expenses = [
      budget.monthly_bills,
      budget.food,
      budget.transport,
      budget.subscriptions,
      budget.misc,
    ]
      .map((val) => parseFloat(val) || 0)
      .reduce((a, b) => a + b, 0);
    
    const income = parseFloat(budget.income) || 0;
    return { income, expenses, remaining: income - expenses };
  };

  const totals = calculateTotal();

  return (
    <form
      className="space-y-6 animate-fade-in"
      aria-label="Budget Form"
      role="form"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Income Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💰</span>
          <h3 className="text-lg font-semibold text-nord-6">Income</h3>
        </div>
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-nord-4 mb-2">
            Monthly Income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nord-4">₹</span>
            <input
              id="income"
              className="input pl-8 text-lg font-semibold"
              type="number"
              name="income"
              placeholder="0.00"
              value={budget.income}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-nord-6">Expenses</h3>
        </div>
        {["monthly_bills", "food", "transport", "subscriptions", "misc"].map(
          (key) => {
            const field = fieldLabels[key];
            return (
              <div key={key} className="animate-slide-up">
                <label htmlFor={key} className="block text-sm font-medium text-nord-4 mb-2">
                  <span className="mr-2">{field.icon}</span>
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nord-4">₹</span>
                  <input
                    id={key}
                    className="input pl-8"
                    type="number"
                    name={key}
                    placeholder="0.00"
                    value={(budget as any)[key]}
                    onChange={handleChange}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-nord-4 mb-2">
          <span className="mr-2">📝</span>
          Notes & Description
        </label>
        <textarea
          id="description"
          className="input min-h-[100px] resize-none"
          name="description"
          placeholder="Add any notes or descriptions about your budget..."
          value={budget.description}
          onChange={handleChange}
        />
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-nord-2/50 to-nord-3/30 rounded-lg p-4 border border-nord-8/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-nord-4 mb-1">Income</p>
            <p className="text-lg font-bold text-nord-14">₹{totals.income.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-nord-4 mb-1">Expenses</p>
            <p className="text-lg font-bold text-nord-12">₹{totals.expenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-nord-4 mb-1">Remaining</p>
            <p className={`text-lg font-bold ${totals.remaining >= 0 ? 'text-nord-14' : 'text-nord-11'}`}>
              ₹{totals.remaining.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-nord-4 flex items-center gap-2">
        <span>💾</span>
        Changes are saved automatically. Use the Sync button to upload to the server.
      </p>
    </form>
  );
}