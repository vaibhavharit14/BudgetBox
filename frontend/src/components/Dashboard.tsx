"use client";

import { useBudgetStore } from "../store/budgetStore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { budget } = useBudgetStore();

  const income = parseFloat(budget.income || "0");
  const expenses =
    parseFloat(budget.monthly_bills || "0") +
    parseFloat(budget.food || "0") +
    parseFloat(budget.transport || "0") +
    parseFloat(budget.subscriptions || "0") +
    parseFloat(budget.misc || "0");

  // Analytics Calculations
  const burnRate = income > 0 ? (expenses / income) * 100 : 0;
  const savingsPotential = income - expenses;
  
  // Month-End Prediction (based on current trend)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const dailySpendRate = expenses / currentDay;
  const monthEndPrediction = dailySpendRate * daysInMonth;
  const monthEndSavings = income - monthEndPrediction;

  const chartData = [
    { name: "Bills", value: parseFloat(budget.monthly_bills || "0") },
    { name: "Food", value: parseFloat(budget.food || "0") },
    { name: "Transport", value: parseFloat(budget.transport || "0") },
    { name: "Subscriptions", value: parseFloat(budget.subscriptions || "0") },
    { name: "Misc", value: parseFloat(budget.misc || "0") },
  ].filter(item => item.value > 0);

  const COLORS = ["#88C0D0", "#81A1C1", "#5E81AC", "#BF616A", "#D08770"];

  // AI Suggestions / Anomaly Warnings (Rule-based)
  const warnings: string[] = [];
  if (income > 0) {
    const foodPercent = (parseFloat(budget.food || "0") / income) * 100;
    if (foodPercent > 40) {
      warnings.push(`⚠️ Food spending is ${foodPercent.toFixed(1)}% of income — reduce food spend next month.`);
    }
    
    const subsPercent = (parseFloat(budget.subscriptions || "0") / income) * 100;
    if (subsPercent > 30) {
      warnings.push(`⚠️ Subscriptions are ${subsPercent.toFixed(1)}% of your income — consider cancelling unused apps.`);
    }
    
    if (savingsPotential < 0) {
      warnings.push(`⚠️ Your expenses exceed income — negative savings!`);
    }
    
    if (burnRate > 90) {
      warnings.push(`⚠️ Burn rate is ${burnRate.toFixed(1)}% — you're spending almost all your income!`);
    }
  }

  if (income === 0 && expenses === 0) {
    return (
      <section className="card animate-fade-in" role="region" aria-label="Budget Dashboard">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        </div>
        <p className="text-nord-4 text-center py-8">
          Enter your budget data to see analytics and insights
        </p>
      </section>
    );
  }

  return (
    <section className="card animate-fade-in" role="region" aria-label="Budget Dashboard">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-nord-2/50 to-nord-3/30 rounded-lg p-4 border border-nord-8/20">
          <p className="text-xs text-nord-4 mb-1">Burn Rate</p>
          <p className="text-2xl font-bold text-nord-8">{burnRate.toFixed(1)}%</p>
          <p className="text-xs text-nord-4 mt-1">Total expenses / Income</p>
        </div>
        
        <div className="bg-gradient-to-br from-nord-2/50 to-nord-3/30 rounded-lg p-4 border border-nord-14/20">
          <p className="text-xs text-nord-4 mb-1">Savings Potential</p>
          <p className={`text-2xl font-bold ${savingsPotential >= 0 ? 'text-nord-14' : 'text-nord-11'}`}>
            ₹{savingsPotential.toLocaleString()}
          </p>
          <p className="text-xs text-nord-4 mt-1">Income - Total Spend</p>
        </div>
        
        <div className="bg-gradient-to-br from-nord-2/50 to-nord-3/30 rounded-lg p-4 border border-nord-12/20">
          <p className="text-xs text-nord-4 mb-1">Month-End Prediction</p>
          <p className={`text-2xl font-bold ${monthEndSavings >= 0 ? 'text-nord-14' : 'text-nord-11'}`}>
            ₹{monthEndPrediction.toLocaleString()}
          </p>
          <p className="text-xs text-nord-4 mt-1">Based on current trend</p>
        </div>
      </div>

      {/* Pie Chart */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="60%"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Anomaly Warnings */}
      {warnings.length > 0 && (
        <div className="mt-6 p-4 bg-nord-11/10 border border-nord-11/30 rounded-lg">
          <h3 className="font-semibold text-nord-11 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Anomaly Warnings
          </h3>
          <ul className="space-y-2">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm text-nord-11 flex items-start gap-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}