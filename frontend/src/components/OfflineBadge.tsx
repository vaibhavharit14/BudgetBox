"use client";

import { useState, useEffect } from "react";

export default function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-nord-12/90 backdrop-blur-sm border border-nord-12/50 rounded-lg px-4 py-3 shadow-xl flex items-center gap-3">
        <div className="w-2 h-2 bg-nord-11 rounded-full animate-pulse"></div>
        <div>
          <p className="text-sm font-semibold text-nord-6">Offline Mode</p>
          <p className="text-xs text-nord-4">Working locally. Changes will sync when online.</p>
        </div>
      </div>
    </div>
  );
}
