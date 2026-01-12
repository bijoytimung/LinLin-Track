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
      <path d="M4 20V10" />
      <path d="M4 7V4" />
      <path d="M10 20V16" />
      <path d="M10 13V4" />
      <path d="M16 20V13" />
      <path d="M16 10V4" />
      <path d="M22 20V18" />
      <path d="M22 15V4" />
    </svg>
  );
}
