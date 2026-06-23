export default function Mascot({ size = 120, style = {} }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {/* Ears */}
      <ellipse cx="32" cy="30" rx="16" ry="20" fill="#C084FC" />
      <ellipse cx="88" cy="30" rx="16" ry="20" fill="#C084FC" />
      <ellipse cx="32" cy="30" rx="9" ry="13" fill="#F0ABFC" />
      <ellipse cx="88" cy="30" rx="9" ry="13" fill="#F0ABFC" />

      {/* Body */}
      <ellipse cx="60" cy="82" rx="30" ry="26" fill="#A855F7" />

      {/* Head */}
      <circle cx="60" cy="58" r="34" fill="#A855F7" />

      {/* Cheeks */}
      <ellipse cx="38" cy="66" rx="10" ry="7" fill="#F0ABFC" opacity="0.7" />
      <ellipse cx="82" cy="66" rx="10" ry="7" fill="#F0ABFC" opacity="0.7" />

      {/* Eye whites */}
      <ellipse cx="47" cy="54" rx="9" ry="10" fill="white" />
      <ellipse cx="73" cy="54" rx="9" ry="10" fill="white" />

      {/* Pupils */}
      <circle cx="49" cy="56" r="5" fill="#4C1D95" />
      <circle cx="71" cy="56" r="5" fill="#4C1D95" />

      {/* Eye shine */}
      <circle cx="51" cy="54" r="2" fill="white" />
      <circle cx="73" cy="54" r="2" fill="white" />

      {/* Nose */}
      <ellipse cx="60" cy="66" rx="5" ry="3.5" fill="#7C3AED" />

      {/* Mouth */}
      <path d="M54 71 Q60 77 66 71" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Belly */}
      <ellipse cx="60" cy="86" rx="18" ry="14" fill="#C084FC" opacity="0.5" />

      {/* Arms */}
      <ellipse cx="30" cy="88" rx="10" ry="7" fill="#A855F7" transform="rotate(-20 30 88)" />
      <ellipse cx="90" cy="88" rx="10" ry="7" fill="#A855F7" transform="rotate(20 90 88)" />

      {/* Star sparkle */}
      <g transform="translate(94, 22) scale(0.6)">
        <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#F9A8D4" opacity="0.9" />
      </g>
      <g transform="translate(6, 50) scale(0.4)">
        <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#F0ABFC" opacity="0.7" />
      </g>
    </svg>
  );
}
