"use client";

import Link from "next/link";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { email, setEmail } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  const logout = () => {
    // Clear user email from localStorage
    localStorage.removeItem("bb_email");
    localStorage.removeItem("token");
    // Reset budget store
    if (typeof window !== "undefined") {
      // Clear all budget storage keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("budget-storage-")) {
          localStorage.removeItem(key);
        }
      });
    }
    setEmail(null);
  };

  return (
    <nav
      className="bg-nord-0/95 backdrop-blur-sm border-b border-nord-3/20 sticky top-0 z-50 shadow-lg"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* ✅ Logo always left */}
        <Link
          href="/"
          className="font-bold text-xl bg-gradient-to-r from-nord-8 to-nord-9 bg-clip-text text-transparent hover:from-nord-9 hover:to-nord-10 transition-all"
          aria-label="BudgetBox Home"
        >
          <span className="mr-2">💰</span>
          BudgetBox
        </Link>

        {/* ✅ Right side: menu + links */}
        <div className="flex items-center gap-6">
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-nord-8"
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">Open Menu</span>
            <div className="space-y-1">
              <span className="block w-6 h-0.5 bg-nord-6"></span>
              <span className="block w-6 h-0.5 bg-nord-6"></span>
              <span className="block w-6 h-0.5 bg-nord-6"></span>
            </div>
          </button>

          {/* Links */}
          <div
            className={`${menuOpen ? "flex" : "hidden"
              } flex-col gap-4 absolute top-16 left-0 w-full bg-nord-0 p-4 lg:static lg:flex lg:flex-row lg:items-center lg:gap-6`}
          >
            {!isLoginPage && (
              <Link href="/" className="hover:text-nord-8" aria-label="Home Page">
                Home
              </Link>
            )}
            {!email && (
              <>
                {!isLoginPage && (
                  <Link
                    href="/login"
                    className="hover:text-nord-8"
                    aria-label="Login Page"
                  >
                    Login
                  </Link>
                )}
                <Link
                  href="/signup"
                  className="hover:text-nord-8"
                  aria-label="Signup Page"
                >
                  Sign Up
                </Link>
              </>
            )}
            {email && (
              <button
                className="btn-secondary px-3 py-1 rounded hover:bg-nord-2 focus:outline-none focus:ring-2 focus:ring-nord-8"
                onClick={logout}
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
