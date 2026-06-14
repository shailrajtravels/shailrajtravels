import React from 'react';

export function FeatherMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M6 20c0-7 4-13 12-14-1 7-4 11-8 13"
        stroke="#2FAF43"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 18c1-5 4-9 9-10"
        stroke="#0B4DBA"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="15" cy="9" r="1.6" fill="#0B4DBA" />
    </svg>
  );
}

export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17 3c-5 0-9 4-9 9 0 1.5.4 3 1 4l-3 5h2l3-3c1 .6 2.5 1 4 1 5 0 9-4 9-9V3h-7z" />
    </svg>
  );
}
