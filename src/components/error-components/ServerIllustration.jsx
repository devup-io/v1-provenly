export default function ServerIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto animate-float">
      {/* Pulse rings */}
      <div className="pulse-ring" />
      <div className="pulse-ring" />
      <div className="pulse-ring" />

      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        {/* Server rack row 1 */}
        <rect x="14" y="22" width="72" height="18" rx="5" fill="#1a2040" stroke="#4f8ef7" strokeWidth="1.5" />
        {/* Server rack row 2 */}
        <rect x="14" y="46" width="72" height="18" rx="5" fill="#1a2040" stroke="#a78bfa" strokeWidth="1.5" />
        {/* Server rack row 3 */}
        <rect x="14" y="70" width="72" height="12" rx="5" fill="#1a2040" stroke="#34d399" strokeWidth="1.2" />

        {/* Row 1 lights */}
        <circle cx="26" cy="31" r="3.2" fill="#4f8ef7">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="36" cy="31" r="3.2" fill="#34d399">
          <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
        </circle>
        {/* Row 1 alert */}
        <circle cx="74" cy="31" r="3.8" fill="#f87171">
          <animate attributeName="opacity" values="1;0.1;1" dur="0.9s" repeatCount="indefinite" />
        </circle>
        {/* Row 1 slot lines */}
        <rect x="46" y="29" width="20" height="2" rx="1" fill="#2a3560" />
        <rect x="46" y="33" width="14" height="2" rx="1" fill="#2a3560" />

        {/* Row 2 lights */}
        <circle cx="26" cy="55" r="3.2" fill="#a78bfa">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="36" cy="55" r="3.2" fill="#4f8ef7">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        {/* Row 2 slot */}
        <rect x="46" y="53" width="20" height="2" rx="1" fill="#2a3560" />
        <rect x="46" y="57" width="14" height="2" rx="1" fill="#2a3560" />

        {/* Row 3 mini lights */}
        <circle cx="26" cy="76" r="2.2" fill="#34d399" opacity="0.5" />
        <circle cx="34" cy="76" r="2.2" fill="#34d399" opacity="0.5" />
        <circle cx="42" cy="76" r="2.2" fill="#a78bfa" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Warning badge floating above */}
        <circle cx="50" cy="10" r="9" fill="rgba(248,113,113,0.15)" stroke="#f87171" strokeWidth="1.5" />
        <text x="50" y="15" textAnchor="middle" fontSize="11" fill="#f87171" fontFamily="sans-serif" fontWeight="bold">!</text>
      </svg>
    </div>
  )
}
