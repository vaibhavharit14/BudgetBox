const API_URL = "https://budgetbox-2zg4.onrender.com";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || res.statusText;
    const error = new Error(`${msg}`) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function register(email: string, password: string, confirmPassword: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword }),
  });
  const data = await handleResponse(res);
  const token = data?.token; // ✅ सही property
  if (token) localStorage.setItem("token", token);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  const token = data?.token; // ✅ सही property
  if (token) localStorage.setItem("token", token);
  return data;
}

export async function syncBudget(payload: {
  income: string;
  monthly_bills: string;
  food: string;
  transport: string;
  subscriptions: string;
  misc: string;
  description: string;
}) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  
  const res = await fetch(`${API_URL}/budget/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getLatestBudget() {
  const token = getToken();
  if (!token) throw new Error("No token found");
  
  const res = await fetch(`${API_URL}/budget/latest`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export function logout() {
  localStorage.removeItem("token");
}