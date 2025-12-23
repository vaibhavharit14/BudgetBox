"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { register } from "../../src/utils/api";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const { setEmail: setCtxEmail } = useUser(); // Unused now

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await register(email, password, confirm);
      if (res.success) {
        // Redirect to login page instead of auto-login
        router.push("/login");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err: any) {
      setError((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-nord-14 to-nord-9 rounded-full mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-nord-4">Start managing your budget today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-nord-4 mb-2">
              Confirm Password
            </label>
            <input
              id="confirm"
              className="input"
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                Creating account...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Create Account
              </>
            )}
          </button>

          <p className="text-center text-sm text-nord-4">
            Already have an account?{" "}
            <Link href="/login" className="text-nord-8 hover:text-nord-9 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}