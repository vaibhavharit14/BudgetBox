export default function Footer() {
  return (
    <footer
      className="bg-nord-0/95 backdrop-blur-sm border-t border-nord-3/20 mt-12"
      role="contentinfo"
      aria-label="Site Footer"
    >
      <div className="container mx-auto px-4 py-6 text-sm flex flex-col items-center gap-2 md:flex-row md:justify-between">
        {/* Copyright */}
        <p aria-label="Copyright" className="text-nord-4">
          © {new Date().getFullYear()} BudgetBox. All rights reserved.
        </p>

        {/* Tech stack info */}
        <p className="text-nord-4 flex items-center gap-2" aria-label="Tech stack used">
          <span className="text-xs">Built with</span>
          <span className="px-2 py-1 bg-nord-2/50 rounded text-nord-8">Nord</span>
          <span className="px-2 py-1 bg-nord-2/50 rounded text-nord-9">Tailwind</span>
          <span className="px-2 py-1 bg-nord-2/50 rounded text-nord-10">Next.js</span>
        </p>
      </div>
    </footer>
  );
}