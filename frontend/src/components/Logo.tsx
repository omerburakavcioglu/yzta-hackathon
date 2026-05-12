'use client'

interface LogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
  wordmarkClassName?: string
}

/**
 * Koopilot brand mark.
 *
 * The mark stacks three meanings:
 *   - A bold "K" monogram for Koopilot.
 *   - Three connected nodes on the right (cooperatives + SMEs networking).
 *   - A spark on top suggesting AI guidance / operational intelligence.
 *
 * Uses a gradient that reads well on both light and dark backgrounds and
 * scales cleanly because everything is SVG.
 */
export default function Logo({
  size = 36,
  showWordmark = false,
  className = '',
  wordmarkClassName = '',
}: LogoProps) {
  const gradId = 'koopilot-logo-grad'
  const sparkGradId = 'koopilot-logo-spark'

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Koopilot"
        role="img"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="55%"  stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id={sparkGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Rounded tile */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradId})`} />

        {/* Subtle inner highlight */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="white" fillOpacity="0.06" />

        {/* "K" monogram — vertical bar */}
        <rect x="11" y="12" width="4.5" height="24" rx="1.2" fill="white" />

        {/* "K" upper diagonal -> reaches toward the upper network node */}
        <path
          d="M15.5 24 L27.5 14"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
        />

        {/* "K" lower diagonal -> reaches toward the lower network node */}
        <path
          d="M15.5 24 L27.5 34"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
        />

        {/* Connecting lines between K-tip and the three network nodes */}
        <path
          d="M28 14 L35 24 M28 34 L35 24"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Network nodes (cooperatives / SMEs) */}
        <circle cx="28" cy="14" r="2.6" fill="white" />
        <circle cx="35" cy="24" r="3.2" fill="white" />
        <circle cx="28" cy="34" r="2.6" fill="white" />

        {/* AI spark — sits above the K, four-pointed glint */}
        <path
          d="M22 5.5 L23 8.5 L26 9.5 L23 10.5 L22 13.5 L21 10.5 L18 9.5 L21 8.5 Z"
          fill={`url(#${sparkGradId})`}
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300 ${wordmarkClassName}`}
        >
          Koopilot
        </span>
      )}
    </div>
  )
}
