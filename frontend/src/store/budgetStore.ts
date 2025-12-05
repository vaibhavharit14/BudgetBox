import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

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
  const safeEmail = email.replace(/[@.]/g, "-");
  return `budget-storage-${safeEmail}`;
}

// ✅ Polished storage adapter with correct types
function createUserStorage(): PersistStorage<BudgetState> {
  return {
    getItem: async (name: string): Promise<StorageValue<BudgetState> | null> => {
      if (typeof window === "undefined") return null;
      const userEmail = localStorage.getItem("bb_email");
      const key = getStorageKey(userEmail);
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: StorageValue<BudgetState>): Promise<void> => {
      if (typeof window === "undefined") return;
      const userEmail = localStorage.getItem("bb_email");
      const key = getStorageKey(userEmail);
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (name: string): Promise<void> => {
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
      currentUserEmail:
        typeof window !== "undefined" ? localStorage.getItem("bb_email") : null,

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
        if (currentEmail !== email) {
          set({ currentUserEmail: email });
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

          if (typeof window !== "undefined" && email) {
            const key = getStorageKey(email);
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed.state) {
                  set({
                    ...parsed.state,
                    currentUserEmail: email,
                  });
                }
              } catch {
                // ignore parse errors
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
      storage: createUserStorage(), // ✅ now correct type
    }
  )
);