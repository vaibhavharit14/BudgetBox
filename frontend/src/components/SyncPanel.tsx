"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBudgetStore } from "../store/budgetStore";
import { syncBudget, getLatestBudget } from "../utils/api";

export default function SyncPanel() {
  const { budget, syncStatus, markSynced, setBudget } = useBudgetStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Check if token exists
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  const handleSync = async () => {
    if (!hasToken) {
      setError("Please login first");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await syncBudget(budget);
      if (res.success) {
        markSynced(Date.now());
        setSuccess("✅ Synced successfully!");
      } else {
        setError(res.message || res.error || "Sync failed.");
      }
    } catch (err) {
      const error = err as Error & { status?: number };
      const errorMessage = error.message;
      const isAuthError = error.status === 401 || 
                         errorMessage.toLowerCase().includes("token") || 
                         errorMessage.toLowerCase().includes("unauthorized") ||
                         errorMessage.toLowerCase().includes("access denied");
      
      if (isAuthError) {
        setError("Session expired. Please login again.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(errorMessage || "An unexpected error occurred. Check console for details.");
        console.error("Sync error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!hasToken) {
      setError("Please login first");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await getLatestBudget();
      if (res.success && res.budget) {
        // Update the store with fetched budget
        const fetchedBudget: typeof budget = {
          income: String(res.budget.income || ""),
          monthly_bills: String(res.budget.monthly_bills || ""),
          food: String(res.budget.food || ""),
          transport: String(res.budget.transport || ""),
          subscriptions: String(res.budget.subscriptions || ""),
          misc: String(res.budget.misc || ""),
          description: String(res.budget.description || ""),
        };
        setBudget(fetchedBudget);
        markSynced(Date.now());
        setSuccess("✅ Latest budget fetched!");
      } else {
        setError(res.message || res.error || "Fetch failed.");
      }
    } catch (err) {
      const error = err as Error & { status?: number };
      const errorMessage = error.message;
      const isAuthError = error.status === 401 || 
                         errorMessage.toLowerCase().includes("token") || 
                         errorMessage.toLowerCase().includes("unauthorized") ||
                         errorMessage.toLowerCase().includes("access denied");
      
      if (isAuthError) {
        setError("Session expired. Please login again.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(errorMessage || "An unexpected error occurred. Check console for details.");
        console.error("Fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      LocalOnly: { label: "Local Only", class: "status-local", icon: "💾" },
      SyncPending: { label: "Sync Pending", class: "status-pending", icon: "⏳" },
      Synced: { label: "Synced", class: "status-synced", icon: "✅" },
    };
    const status = statusMap[syncStatus] || statusMap.LocalOnly;
    return (
      <span className={`status-badge ${status.class}`}>
        <span className="mr-1">{status.icon}</span>
        {status.label}
      </span>
    );
  };

  return (
    <section
      className="card animate-fade-in"
      role="region"
      aria-label="Budget Sync Panel"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          <h2 className="text-xl font-semibold">Sync & Cloud</h2>
        </div>
        {getStatusBadge()}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-nord-11/10 border border-nord-11/30 rounded-lg animate-slide-up">
          <p className="text-sm text-nord-11 flex items-center gap-2" role="alert">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-nord-14/10 border border-nord-14/30 rounded-lg animate-slide-up">
          <p className="text-sm text-nord-14 flex items-center gap-2">
            <span>✓</span>
            {success}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          className="btn w-full"
          onClick={handleSync}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <span className="mr-2">☁️</span>
              Sync to Cloud
            </>
          )}
        </button>
        
        <button
          className="btn-secondary w-full"
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching...
            </>
          ) : (
            <>
              <span className="mr-2">⬇️</span>
              Fetch Latest
            </>
          )}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-nord-3/20">
        <p className="text-xs text-nord-4 text-center">
          Your budget data is securely stored and synced across devices
        </p>
      </div>
    </section>
  );
}