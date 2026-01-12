import type { SVGProps } from 'react';

export function ReportsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <path d="M9 12v-2" />
        <path d="M15 12v-5" />
        <path d="M12 12v-1" />
    </svg>
  );
}
