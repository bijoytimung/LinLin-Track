import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 120 120"
      {...props}
    >
      <defs>
        <style>
          {`
            .linlin-text {
              font-family: Gaegu, cursive;
              font-weight: 700;
              font-size: 32px;
              fill: #F2C46D;
              stroke: #D68F9B;
              stroke-width: 2;
            }
            .linlin-text-l {
              fill: #F5B8C4;
            }
            .heart { fill: #F2C46D; }
            .star { fill: #F2C46D; }
          `}
        </style>
      </defs>
      {/* Scroll Background */}
      <path
        d="M10 30 C 20 25, 100 25, 110 30 L 110 90 C 100 95, 20 95, 10 90 Z"
        fill="#FEF4E6"
        stroke="#D68F9B"
        strokeWidth="2"
      />
      {/* Scroll Ends */}
      <rect x="5" y="25" width="10" height="70" rx="5" fill="#D68F9B" />
      <rect x="105" y="25" width="10" height="70" rx="5" fill="#D68F9B" />

      {/* Text */}
      <text x="58" y="70" textAnchor="middle" className="linlin-text">
        <tspan className="linlin-text-l">L</tspan>in<tspan className="linlin-text-l">L</tspan>in
      </text>

      {/* Decorations */}
      <path
        className="heart"
        d="M38 58 a 4 4 0 0 1 0 -5.6 a 4 4 0 0 1 5.6 0 l 1.4 1.4 l 1.4 -1.4 a 4 4 0 0 1 5.6 5.6 l -7 7 z"
      />
      <path
        className="star"
        d="M68 50 l 2 4 l 4 0.5 l -3 3 l 1 4 l -4 -2 l -4 2 l 1 -4 l -3 -3 l 4 -0.5 z"
      />
      <path
        className="heart"
        d="M93 58 a 4 4 0 0 1 0 -5.6 a 4 4 0 0 1 5.6 0 l 1.4 1.4 l 1.4 -1.4 a 4 4 0 0 1 5.6 5.6 l -7 7 z"
      />

       {/* Girl */}
      <path fill="#DEB887" d="M30,35 A 15 15 0 1 1 60,35 A 15 15 0 1 1 30,35 Z" />
      <path fill="#2F2F2F" d="M28 20 Q 45 -5, 62 20  L 60 35 Q 45 20, 30 35 Z" />
      <circle cx="40" cy="32" r="2" fill="black" />
      <circle cx="50" cy="32" r="2" fill="black" />
      <path d="M42 38 Q 45 40, 48 38" stroke="black" strokeWidth="1" fill="none" />

      {/* Dog */}
       <path fill="#F5F5DC" d="M65,35 A 15 15 0 1 1 95,35 A 15 15 0 1 1 65,35 Z" />
       <path fill="#F5F5DC" d="M60 25 C 65 15, 95 15, 100 25 L 90 30 C 85 25, 75 25, 70 30 Z" />
      <circle cx="75" cy="32" r="2" fill="black" />
      <circle cx="85" cy="32" r="2" fill="black" />
       <rect x="70" y="28" width="20" height="8" rx="2" stroke="black" strokeWidth="1" fill="none" />
       <path d="M78 38 Q 80 40, 82 38" stroke="black" strokeWidth="1" fill="none" />

    </svg>
  );
}
