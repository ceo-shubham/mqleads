export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#4f46e5" />
      <path
        d="M14 33V15h5.4l9.6 11.1V15H34v18h-5.3L19 21.8V33H14Z"
        fill="#fff"
      />
      <circle cx="37" cy="37" r="5.5" fill="#c7d2fe" />
      <circle cx="37" cy="37" r="2.5" fill="#4f46e5" />
    </svg>
  );
}
