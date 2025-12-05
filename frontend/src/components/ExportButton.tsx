"use client";

import { loadLocalBudget } from "../utils/storage";
import { toXML } from "../utils/xml";

export default function ExportButton() {
  const handleExport = () => {
    const local = loadLocalBudget();
    const xml = toXML(local || {});
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "budget.xml";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="btn"
      onClick={handleExport}
      aria-label="Export budget data as XML"
      title="Export budget data"
    >
      <span className="mr-2">📥</span>
      Export XML
    </button>
  );
}