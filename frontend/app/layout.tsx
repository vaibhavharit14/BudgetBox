import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "../src/context/UserContext";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";

export const metadata: Metadata = {
  title: "BudgetBox",
  description: "Nord-themed DigiLocker-style budgeting app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}