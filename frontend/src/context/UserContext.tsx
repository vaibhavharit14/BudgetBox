"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  email: string | null;
  setEmail: (email: string | null) => void;
};

const Ctx = createContext<UserContextType>({
  email: null,
  setEmail: () => {}
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("bb_email") : null;
    if (stored) setEmail(stored);
  }, []);

  return <Ctx.Provider value={{ email, setEmail }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}