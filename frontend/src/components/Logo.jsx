export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-brand-600" />
        <path d="M9 8h10a4 4 0 0 1 4 4v12H13a4 4 0 0 1-4-4V8z" fill="#fff" />
        <path d="M13 13.5h6M13 17.5h6" className="stroke-brand-600" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 8h4v7l-2-1.6L19 15V8z" className="fill-sun" />
      </svg>
      Study Planner
    </span>
  )
}
