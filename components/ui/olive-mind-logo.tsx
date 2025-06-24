interface OliveMindLogoProps {
  width?: number
  height?: number
  className?: string
}

export default function OliveMindLogo({ width = 200, height = 80, className = "" }: OliveMindLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Green Leaf */}
      <path
        d="M20 25C20 25 45 15 70 25C85 30 95 45 85 60C75 75 55 70 45 65C35 60 25 50 20 40C15 30 20 25 20 25Z"
        fill="#4ADE80"
      />

      {/* Leaf vein detail */}
      <path d="M30 35C35 32 45 30 55 35C60 37 65 42 60 47" stroke="#22C55E" strokeWidth="1.5" fill="none" />

      {/* Main green circle */}
      <circle cx="65" cy="65" r="35" stroke="#22C55E" strokeWidth="6" fill="none" />

      {/* Red dot */}
      <circle cx="75" cy="55" r="12" fill="#EF4444" />

      {/* Red dot gradient effect */}
      <defs>
        <radialGradient id="redGradient" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
      </defs>
      <circle cx="75" cy="55" r="12" fill="url(#redGradient)" />

      {/* "Live mind" text */}
      <text x="130" y="75" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="500" fill="#22C55E">
        Live mind
      </text>
    </svg>
  )
}
