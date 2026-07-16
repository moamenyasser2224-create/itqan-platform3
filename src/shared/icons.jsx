export function IconHome({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBook({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5.5c0-.8.6-1.5 1.5-1.5H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 5.5c0-.8-.6-1.5-1.5-1.5H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUsers({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.5 14.2c2.4.2 4 1.9 4 4.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrophy({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10" strokeLinecap="round" />
      <path d="M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" strokeLinecap="round" />
      <path d="M12 13v3.5M9 20.5h6M9.5 20.5c0-2 .8-3 2.5-3s2.5 1 2.5 3" strokeLinecap="round" />
    </svg>
  );
}

export function IconGlobe({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.2 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.2-3.8-8.5S9.5 5.9 12 3.5Z" />
    </svg>
  );
}

export function IconLogout({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 16 19 12l-4.5-4M19 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconEmpty({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="10" y="16" width="44" height="34" rx="4" stroke="currentColor" strokeWidth="1.6" opacity=".4" />
      <path d="M10 26h44" stroke="currentColor" strokeWidth="1.6" opacity=".4" />
      <circle cx="32" cy="38" r="6" stroke="currentColor" strokeWidth="1.6" opacity=".6" />
      <path d="M29.5 38h5M32 35.5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}
