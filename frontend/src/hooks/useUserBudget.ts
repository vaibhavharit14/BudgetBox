"use client";

import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useBudgetStore } from "../store/budgetStore";

/**
 * Hook to ensure budget store is reset when user changes
 * This ensures each user sees only their own budget data
 */
export function useUserBudget() {
  const { email } = useUser();
  const setUserEmail = useBudgetStore((state) => state.setUserEmail);
  const currentUserEmail = useBudgetStore((state) => state.currentUserEmail);

  useEffect(() => {
    if (email && email !== currentUserEmail) {
      // User changed - update store with new user email
      // This will reset the store and load the new user's data
      setUserEmail(email);
    } else if (!email && currentUserEmail) {
      // User logged out - reset store
      setUserEmail(null);
    }
  }, [email, currentUserEmail, setUserEmail]);
}

