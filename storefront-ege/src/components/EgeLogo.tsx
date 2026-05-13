interface EgeLogoProps {
  size?: number
  className?: string
}

/**
 * Ege Zeytinyağı Kooperatifi brand mark.
 * An olive fruit cradled between two leaves on a warm cream tile —
 * evokes a single olive branch tip, the source of the oil.
 */
export default function EgeLogo({ size = 32, className = '' }: EgeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ege Zeytinyağı"
      role="img"
    >
      <defs>
        <linearGradient id="ege-tile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FAF6EC" />
          <stop offset="100%" stopColor="#EFE6CE" />
        </linearGradient>
        <linearGradient id="ege-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6B8E3D" />
          <stop offset="100%" stopColor="#4A6B26" />
        </linearGradient>
        <radialGradient id="ege-olive" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%"   stopColor="#5A7A2E" />
          <stop offset="100%" stopColor="#2F4715" />
        </radialGradient>
      </defs>

      {/* Cream tile */}
      <rect x="2" y="2" width="44" height="44" rx="11" fill="url(#ege-tile)" />
      <rect x="2" y="2" width="44" height="44" rx="11" fill="none" stroke="#D9CDA8" strokeWidth="1" />

      {/* Stem */}
      <path
        d="M24 11 C 24 18, 24 24, 24 32"
        stroke="#5A7A2E"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaf */}
      <path
        d="M24 19 C 18 17, 13 19, 12 24 C 17 25, 22 23, 24 19 Z"
        fill="url(#ege-leaf)"
      />
      {/* Left leaf vein */}
      <path d="M14 23 C 18 22, 21 21, 23.5 19.5" stroke="#3E5A1F" strokeWidth="0.6" fill="none" strokeLinecap="round" />

      {/* Right leaf */}
      <path
        d="M24 22 C 30 20, 35 22, 36 27 C 31 28, 26 26, 24 22 Z"
        fill="url(#ege-leaf)"
      />
      <path d="M34 26 C 30 25, 27 24, 24.5 22.5" stroke="#3E5A1F" strokeWidth="0.6" fill="none" strokeLinecap="round" />

      {/* Olive fruit */}
      <ellipse cx="24" cy="35" rx="5" ry="6.2" fill="url(#ege-olive)" />
      {/* Highlight */}
      <ellipse cx="22.4" cy="33" rx="1.1" ry="1.8" fill="#A8C36E" opacity="0.55" />
    </svg>
  )
}
