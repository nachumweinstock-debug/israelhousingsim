/**
 * Animated night-skyline scene ported from vryfid-vibes' VibesLoader —
 * twinkling stars, blinking amber windows, moon glow, and the VryfID truck
 * driving across the street with its headlight beam. Purely decorative;
 * every element is aria-hidden.
 */

// Buildings: [x, width, height, hasSpire]
const BLDGS: Array<[number, number, number, boolean]> = [
  [0, 26, 88, false],
  [28, 16, 62, false],
  [46, 20, 118, true],
  [68, 36, 76, false],
  [106, 13, 52, false],
  [121, 30, 148, false],
  [153, 22, 96, false],
  [177, 40, 72, false],
  [219, 16, 84, false],
  [237, 26, 130, true],
  [265, 46, 74, false],
  [313, 20, 100, false],
  [335, 28, 58, false],
  [365, 32, 86, false],
  [399, 14, 68, false],
];

function buildingWindows(x: number, w: number, h: number) {
  const wins = [];
  const cols = Math.floor(w / 6);
  const rows = Math.floor(h / 10);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if ((c * 7 + r * 13 + x) % 3 !== 0) continue;
      wins.push({
        wx: x + 3 + c * 6,
        wy: 200 - h + 5 + r * 10,
        delay: ((c + r + x) % 8) * 0.6,
        dur: 2 + ((c * r + x) % 5) * 0.8,
      });
    }
  }
  return wins;
}

const WINDOWS = BLDGS.flatMap(([x, w, h]) => buildingWindows(x, w, h));

const STAR_POS: Array<[number, number, number, number, number]> = [
  [18, 12, 0.9, 2.1, 0.3], [42, 8, 0.7, 1.8, 0.9], [71, 18, 1.1, 2.5, 0.1], [95, 6, 0.8, 1.6, 1.4],
  [120, 14, 0.6, 2.0, 0.6], [148, 9, 1.0, 1.9, 0.2], [178, 5, 0.7, 2.3, 1.1], [205, 16, 0.9, 1.7, 0.7],
  [232, 7, 0.8, 2.2, 0.4], [258, 11, 1.1, 1.8, 1.3], [285, 4, 0.6, 2.4, 0.0], [310, 13, 0.9, 2.0, 0.8],
  [338, 8, 0.7, 1.6, 0.5], [358, 17, 1.0, 2.1, 1.0], [382, 5, 0.8, 1.9, 0.2], [30, 25, 0.6, 2.3, 0.7],
  [88, 22, 0.9, 1.7, 1.2], [160, 28, 0.7, 2.0, 0.3], [240, 20, 1.0, 1.8, 0.9], [320, 26, 0.8, 2.2, 0.5],
];

const CSS = `
  @keyframes skyTruckRide {
    0%   { transform: translateX(0px); }
    100% { transform: translateX(520px); }
  }
  @keyframes skyWinBlink {
    0%   { opacity: 0.2; }
    100% { opacity: 0.95; }
  }
  @keyframes skyTwinkle {
    0%   { opacity: 0.2; }
    100% { opacity: 1.0; }
  }
`;

export function CitySkyline({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden dir="ltr">
      <svg viewBox="0 0 414 200" className="block h-auto w-full" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="mb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#07051A" />
            <stop offset="100%" stopColor="#0D0A2E" />
          </linearGradient>
          <linearGradient id="mb-bldg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E1640" />
            <stop offset="100%" stopColor="#080D28" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="414" height="200" fill="url(#mb-sky)" />

        {STAR_POS.map((s, i) => (
          <circle
            key={`star-${i}`}
            cx={s[0]}
            cy={s[1]}
            r={s[2]}
            fill="rgba(255,255,255,0.7)"
            style={{ animation: `skyTwinkle ${s[3]}s ${s[4]}s ease-in-out infinite alternate` }}
          />
        ))}

        {/* Moon glow */}
        <circle cx="370" cy="32" r="22" fill="rgba(255,240,180,0.08)" />
        <circle cx="370" cy="32" r="14" fill="rgba(255,240,180,0.12)" />
        <circle cx="370" cy="32" r="8" fill="rgba(255,240,180,0.22)" />

        {BLDGS.map(([x, w, h, spire]) => (
          <g key={x}>
            <rect x={x} y={200 - h} width={w} height={h} fill="url(#mb-bldg)" />
            {spire && (
              <polygon
                points={`${x + w / 2 - 2},${200 - h - 22} ${x + w / 2 + 2},${200 - h - 22} ${x + w / 2},${200 - h - 38}`}
                fill="#0E1640"
              />
            )}
          </g>
        ))}

        {WINDOWS.map((win, i) => (
          <rect
            key={`win-${i}`}
            x={win.wx}
            y={win.wy}
            width={3}
            height={4}
            fill="#FBBF24"
            style={{ animation: `skyWinBlink ${win.dur}s ${win.delay}s ease-in-out infinite alternate`, opacity: 0.85 }}
          />
        ))}

        {/* Street */}
        <rect x="0" y="195" width="414" height="5" fill="#0a0820" />
        <rect x="0" y="196" width="414" height="1" fill="rgba(255,255,255,0.04)" />

        {/* Moving truck */}
        <g style={{ animation: "skyTruckRide 3.8s linear infinite" }}>
          <rect x="-100" y="177" width="52" height="18" rx="2" fill="#1d2a4a" />
          <text x="-90" y="189" fontSize="5" fill="#5EEAD4" fontFamily="sans-serif" fontWeight="bold">
            VRYFID
          </text>
          <rect x="-48" y="180" width="24" height="15" rx="2" fill="#243060" />
          <rect x="-44" y="182" width="10" height="8" rx="1" fill="#3ABFDB" opacity="0.7" />
          <rect x="-26" y="191" width="6" height="3" rx="1" fill="#354070" />
          <circle cx="-85" cy="195" r="4.5" fill="#1a1a2e" stroke="#2d3a6a" strokeWidth="1.5" />
          <circle cx="-85" cy="195" r="1.5" fill="#3a4a8a" />
          <circle cx="-38" cy="195" r="4.5" fill="#1a1a2e" stroke="#2d3a6a" strokeWidth="1.5" />
          <circle cx="-38" cy="195" r="1.5" fill="#3a4a8a" />
          <circle cx="-25" cy="187" r="2" fill="#FBBF24" opacity="0.9" />
          <polygon points="-23,186 -10,181 -10,193 -23,188" fill="rgba(251,191,36,0.08)" />
        </g>
      </svg>

      {/* Ambient horizon glow */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
        style={{ background: "linear-gradient(to top, rgba(13,148,136,0.12), transparent)" }}
      />
      <style>{CSS}</style>
    </div>
  );
}
