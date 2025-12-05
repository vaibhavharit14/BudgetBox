"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../src/context/UserContext";
import { login } from "../../src/utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("hire-me@anshumat.org");
  const [password, setPassword] = useState("HireMe@2025!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setEmail: setCtxEmail } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await login(email, password);
      if (res.success && res.token) {
        setCtxEmail(email);
        localStorage.setItem("bb_email", email);
        router.push("/");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError((err as Error).message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-nord-8 to-nord-9 rounded-full mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-nord-4">Sign in to access your budget</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-nord-4 mb-2">
              Email Address
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-nord-4 mb-2">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-nord-11/10 border border-nord-11/30 rounded-lg animate-slide-up">
              <p className="text-sm text-nord-11 flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}

          <button type="submit" className="btn w-full" disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <span className="mr-2">→</span>
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}