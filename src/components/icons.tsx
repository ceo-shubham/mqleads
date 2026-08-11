interface IconProps {
  className?: string;
}

export function IconHome({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 2 2 8.5V17a1 1 0 0 0 1 1h4.5v-5.5h5V18H17a1 1 0 0 0 1-1V8.5L10 2Z" />
    </svg>
  );
}

export function IconLink({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M8.5 11.5a4 4 0 0 0 5.6.1l2-2a4 4 0 0 0-5.7-5.6l-1.2 1.2M11.5 8.5a4 4 0 0 0-5.6-.1l-2 2a4 4 0 0 0 5.7 5.6l1.2-1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconLeads({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 2a5 5 0 0 1 3.9 8.2c2.2.9 3.6 2.6 3.6 4.8v2h-15v-2c0-2.2 1.4-3.9 3.6-4.8A5 5 0 0 1 10 2ZM4.5 13h11c-.6-1.3-2-2-5.5-2s-4.9.7-5.5 2Z" />
    </svg>
  );
}

export function IconTarget({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <circle cx="10" cy="10" r="4" />
      <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPulse({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M2 10h3.5l2-5 3.5 9 2-4H18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGear({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M16.4 11a6.2 6.2 0 0 0 .1-1 6.2 6.2 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a6.6 6.6 0 0 0-1.7-1L12 1.6H8l-.3 2.5a6.6 6.6 0 0 0-1.7 1l-2.4-1-2 3.4L3.6 9a6.2 6.2 0 0 0 0 2l-2 1.5 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.3 2.5h4l.3-2.5c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLogout({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8M13 14l4-4-4-4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="m4 10.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconX({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M2 10s3.5-5.5 8-5.5S18 10 18 10s-3.5 5.5-8 5.5S2 10 2 10Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

export function IconEyeOff({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m3 3 14 14M6.5 6.5C4.8 7.6 3.2 9.2 2 10s3.5 5.5 8 5.5c1.5 0 2.9-.4 4.1-1.1M10.9 5.2c.4 0 .7.1 1.1.1C15.9 6 18 10 18 10c-.5.8-1.3 1.8-2.2 2.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCopy({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="7" y="7" width="9" height="9" rx="1.5" />
      <path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" />
    </svg>
  );
}
