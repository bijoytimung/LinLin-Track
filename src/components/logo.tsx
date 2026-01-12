import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 1.5c-2.4 2.4-2.4 6.3 0 8.7s6.3 2.4 8.7 0" />
      <path d="M12 1.5c2.4 2.4 2.4 6.3 0 8.7s-6.3 2.4-8.7 0" />
      <path d="M12 1.5c-2.4-2.4-2.4-6.3 0-8.7s6.3-2.4 8.7 0" />
      <path d="M12 1.5c2.4-2.4 2.4-6.3 0-8.7s-6.3-2.4-8.7 0" />
      <path d="M12 22.5c-2.4-2.4-2.4-6.3 0-8.7s6.3-2.4 8.7 0" />
      <path d="M12 22.5c2.4-2.4 2.4-6.3 0-8.7s-6.3-2.4-8.7 0" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}
