export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-bold ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#2C43C9" />
        <path d="M9 8h10a4 4 0 0 1 4 4v12H13a4 4 0 0 1-4-4V8z" fill="#fff" />
        <path d="M13 13h6M13 17h6" stroke="#2C43C9" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Study Planner
    </span>
  )
}
