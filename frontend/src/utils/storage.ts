type BudgetPayload = {
  income: string;
  monthly_bills: string;
  food: string;
  transport: string;
  subscriptions: string;
  misc: string;
  description: string;
};

const KEY = "bb_budget";

export function saveLocalBudget(budget: BudgetPayload) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(budget));
}

export function loadLocalBudget(): BudgetPayload | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}