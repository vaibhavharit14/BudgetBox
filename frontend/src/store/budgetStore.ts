import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

export type BudgetPayload = {
  income: string;
  monthly_bills: string;
  food: string;
  transport: string;
  subscriptions: string;
  misc: string;
  description: string;
};

type SyncStatus = "LocalOnly" | "SyncPending" | "Synced";

interface BudgetState {
  budget: BudgetPayload;
  lastLocalEditAt: number | null;
  lastServerSyncAt: number | null;
  syncStatus: SyncStatus;
  currentUserEmail: string | null;
  setField: (key: keyof BudgetPayload, value: string) => void;
  setBudget: (budget: BudgetPayload) => void;
  markSynced: (timestamp: number) => void;
  resetStore: () => void;
  setUserEmail: (email: string | null) => void;
}

// Get user-specific storage key
function getStorageKey(email: string | null): string {
  if (!email) return "budget-storage-guest";
  // Create a safe key from email (replace @ and . with -)
  const safeEmail = email.replace(/[@.]/g, "-");
  return `budget-storage-${safeEmail}`;
}

// Custom storage that uses user-specific keys
function createUserStorage(): StateStorage {
  return {
    getItem: (name: string): string | null => {
      if (typeof window === "undefined") return null;
      const userEmail = localStorage.getItem("bb_email");
      const key = getStorageKey(userEmail);
      return localStorage.getItem(key);
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === "undefined") return;
      const userEmail = localStorage.getItem("bb_email");
      const key = getStorageKey(userEmail);
      localStorage.setItem(key, value);
    },
    removeItem: (name: string): void => {
      if (typeof window === "undefined") return;
      const userEmail = localStorage.getItem("bb_email");
      const key = getStorageKey(userEmail);
      localStorage.removeItem(key);
    },
  };
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budget: {
        income: "",
        monthly_bills: "",
        food: "",
        transport: "",
        subscriptions: "",
        misc: "",
        description: "",
      },
      lastLocalEditAt: null,
      lastServerSyncAt: null,
      syncStatus: "LocalOnly",
      currentUserEmail: typeof window !== "undefined" ? localStorage.getItem("bb_email") : null,
      setField: (key, value) => {
        set((state) => {
          const updated = { ...state.budget, [key]: value };
          return {
            budget: updated,
            lastLocalEditAt: Date.now(),
            syncStatus:
              !state.lastServerSyncAt ||
              (state.lastLocalEditAt &&
                state.lastLocalEditAt > (state.lastServerSyncAt || 0))
                ? "SyncPending"
                : state.syncStatus,
          };
        });
      },
      setBudget: (newBudget) => {
        set(() => ({
          budget: newBudget,
          lastLocalEditAt: Date.now(),
        }));
      },
      markSynced: (timestamp) => {
        set(() => ({
          lastServerSyncAt: timestamp,
          syncStatus: "Synced",
        }));
      },
      resetStore: () => {
        set({
          budget: {
            income: "",
            monthly_bills: "",
            food: "",
            transport: "",
            subscriptions: "",
            misc: "",
            description: "",
          },
          lastLocalEditAt: null,
          lastServerSyncAt: null,
          syncStatus: "LocalOnly",
        });
      },
      setUserEmail: (email) => {
        const currentEmail = get().currentUserEmail;
        // If user changed, reset the store
        if (currentEmail !== email) {
          // Update user email first
          set({ currentUserEmail: email });
          
          // Reset to default state - persist middleware will load from new user's storage
          set({
            budget: {
              income: "",
              monthly_bills: "",
              food: "",
              transport: "",
              subscriptions: "",
              misc: "",
              description: "",
            },
            lastLocalEditAt: null,
            lastServerSyncAt: null,
            syncStatus: "LocalOnly",
          });
          
          // Manually load new user's data if it exists
          if (typeof window !== "undefined" && email) {
            const key = getStorageKey(email);
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed.state) {
                  // Merge loaded state
                  set({
                    ...parsed.state,
                    currentUserEmail: email,
                  });
                }
              } catch (e) {
                // Ignore parse errors, use default state
              }
            }
          }
        } else {
          set({ currentUserEmail: email });
        }
      },
    }),
    {
      name: "budget-storage",
      storage: createUserStorage(),
    }
  )
);