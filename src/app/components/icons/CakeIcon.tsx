import React from 'react';

interface CakeIconProps {
  size?: number;
  className?: string;
}

export default function CakeIcon({ size = 16, className }: CakeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 14h16v6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-6z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M4 10h16v4H4v-4z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M4 8h16c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z"
        fill="currentColor"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="4"
        fill="currentColor"
        opacity="0.7"
      />
      <ellipse
        cx="12"
        cy="2"
        rx="1"
        ry="1.5"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}
