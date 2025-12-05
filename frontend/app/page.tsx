"use client";

import { useUser } from "../src/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BudgetForm from "../src/components/BudgetForm";
import SyncPanel from "../src/components/SyncPanel";
import ExportButton from "../src/components/ExportButton";
import Dashboard from "../src/components/Dashboard";
import OfflineBadge from "../src/components/OfflineBadge";
import { useUserBudget } from "../src/hooks/useUserBudget";

export default function HomePage() {
  const { email } = useUser();
  const router = useRouter();
  
  // Ensure budget store is user-specific
  useUserBudget();

  // Redirect if not logged in
  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  if (!email) {
    return <p className="text-nord-4">Redirecting to login...</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-nord-8 to-nord-9 bg-clip-text text-transparent">
          Welcome back, {email?.split('@')[0]}!
        </h1>
        <p className="text-nord-4">Manage your budget efficiently and stay on track</p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📝</span>
            <h2 className="text-xl font-semibold">Budget Planner</h2>
          </div>
          <BudgetForm email={email} />
        </section>

        <section className="card">
          <SyncPanel />
        </section>
      </div>

      {/* Dashboard Section */}
      <section className="card">
        <Dashboard />
      </section>

      {/* Export Section */}
      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📤</span>
              <h2 className="text-xl font-semibold">Export Data</h2>
            </div>
            <p className="text-sm text-nord-4">Download your budget data as XML file</p>
          </div>
          <ExportButton />
        </div>
      </section>

      {/* Offline Badge */}
      <OfflineBadge />
    </div>
  );
}