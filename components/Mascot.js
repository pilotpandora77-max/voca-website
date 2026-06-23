export default function Mascot({ size = 160, showSpeech = false, style = {} }) {
  const scale = size / 200;
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7C3AED" />
        </radialGradient>
        <radialGradient id="headGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
        <radialGradient id="earGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6D28D9" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ── Stars ── */}
      {/* Big star top-right */}
      <g transform="translate(155, 18) scale(1.1)">
        <polygon points="10,0 12.5,7 20,7 14,11.5 16.5,19 10,14.5 3.5,19 6,11.5 0,7 7.5,7"
          fill="#FBBF24" />
      </g>
      {/* Medium star left */}
      <g transform="translate(10, 55) scale(0.75)">
        <polygon points="10,0 12.5,7 20,7 14,11.5 16.5,19 10,14.5 3.5,19 6,11.5 0,7 7.5,7"
          fill="#FBBF24" />
      </g>
      {/* Small dot stars */}
      <circle cx="170" cy="70" r="4" fill="#FBBF24" opacity="0.85" />
      <circle cx="25" cy="110" r="3" fill="#FBBF24" opacity="0.7" />
      <circle cx="175" cy="115" r="2.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="8" cy="145" r="3.5" fill="#FBBF24" opacity="0.55" />

      {/* ── Body ── */}
      <ellipse cx="100" cy="193" rx="48" ry="38" fill="url(#bodyGrad)" filter="url(#shadow)" />
      {/* Belly */}
      <ellipse cx="100" cy="195" rx="30" ry="23" fill="#DDD6FE" opacity="0.3" />

      {/* ── Ears ── */}
      <ellipse cx="46" cy="56" rx="22" ry="26" fill="url(#earGrad)" />
      <ellipse cx="46" cy="56" rx="13" ry="17" fill="#F5D0FE" opacity="0.6" />
      <ellipse cx="154" cy="56" rx="22" ry="26" fill="url(#earGrad)" />
      <ellipse cx="154" cy="56" rx="13" ry="17" fill="#F5D0FE" opacity="0.6" />

      {/* ── Head ── */}
      <circle cx="100" cy="108" r="72" fill="url(#headGrad)" filter="url(#shadow)" />

      {/* ── Cap ── */}
      {/* Cap base band */}
      <path d="M36 88 Q36 50 100 48 Q164 50 164 88" fill="#4C1D95" />
      <ellipse cx="100" cy="88" rx="64" ry="14" fill="#5B21B6" />
      {/* Cap dome */}
      <path d="M52 88 Q52 42 100 40 Q148 42 148 88" fill="#4C1D95" />
      {/* Cap button */}
      <circle cx="100" cy="41" r="6" fill="#6D28D9" />
      {/* V badge on cap */}
      <rect x="85" y="56" width="30" height="22" rx="5" fill="#7C3AED" />
      <rect x="86" y="57" width="28" height="20" rx="4" fill="#6D28D9" />
      <text x="100" y="72" textAnchor="middle" fill="#EDE9FF" fontSize="14" fontWeight="900"
        fontFamily="Arial, sans-serif" letterSpacing="0">V</text>

      {/* ── Eyes ── */}
      {/* Left eye */}
      <circle cx="72" cy="108" r="21" fill="white" />
      <circle cx="72" cy="108" r="21" fill="white" stroke="#E9D5FF" strokeWidth="1" />
      <circle cx="75" cy="111" r="13" fill="#1F1A2E" />
      <circle cx="69" cy="103" r="5.5" fill="white" />
      <circle cx="80" cy="114" r="3" fill="white" opacity="0.6" />

      {/* Right eye */}
      <circle cx="128" cy="108" r="21" fill="white" />
      <circle cx="128" cy="108" r="21" fill="white" stroke="#E9D5FF" strokeWidth="1" />
      <circle cx="125" cy="111" r="13" fill="#1F1A2E" />
      <circle cx="122" cy="103" r="5.5" fill="white" />
      <circle cx="131" cy="114" r="3" fill="white" opacity="0.6" />

      {/* ── Cheeks ── */}
      <ellipse cx="48" cy="128" rx="16" ry="10" fill="#F0ABFC" opacity="0.45" />
      <ellipse cx="152" cy="128" rx="16" ry="10" fill="#F0ABFC" opacity="0.45" />

      {/* ── Nose ── */}
      <ellipse cx="100" cy="134" rx="9" ry="6.5" fill="#6D28D9" />
      <ellipse cx="98" cy="132" rx="3" ry="2" fill="#9F7AEA" opacity="0.5" />

      {/* ── Mouth ── */}
      <path d="M82 145 Q100 162 118 145" stroke="#6D28D9" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* ── Paws ── */}
      <ellipse cx="55" cy="213" rx="21" ry="13" fill="#8B5CF6" />
      <ellipse cx="145" cy="213" rx="21" ry="13" fill="#8B5CF6" />
      {/* Paw dots */}
      <circle cx="50" cy="214" r="3" fill="#6D28D9" opacity="0.4" />
      <circle cx="57" cy="217" r="3" fill="#6D28D9" opacity="0.4" />
      <circle cx="64" cy="214" r="3" fill="#6D28D9" opacity="0.4" />
      <circle cx="140" cy="214" r="3" fill="#6D28D9" opacity="0.4" />
      <circle cx="147" cy="217" r="3" fill="#6D28D9" opacity="0.4" />
      <circle cx="154" cy="214" r="3" fill="#6D28D9" opacity="0.4" />

      {/* ── Speech bubble (optional) ── */}
      {showSpeech && (
        <g transform="translate(155, 55)">
          <rect x="0" y="0" width="50" height="28" rx="10" fill="white"
            stroke="#E9D5FF" strokeWidth="1.5" />
          <polygon points="6,28 0,36 14,28" fill="white" />
          <polygon points="6,28 0,36 14,28" fill="white" stroke="#E9D5FF"
            strokeWidth="1.5" strokeLinejoin="round" />
          <text x="25" y="19" textAnchor="middle" fill="#7C3AED" fontSize="11"
            fontWeight="800" fontFamily="Arial, sans-serif">你好!</text>
        </g>
      )}
    </svg>
  );
}
