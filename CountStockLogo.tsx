import React from 'react';

interface CountStockLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const CountStockLogo: React.FC<CountStockLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { box: 'w-16 h-16', hex: 64, title: 'text-xs', sub: 'text-[7px]' },
    md: { box: 'w-24 h-24', hex: 96, title: 'text-sm', sub: 'text-[9px]' },
    lg: { box: 'w-32 h-32', hex: 128, title: 'text-base', sub: 'text-[10px]' },
    xl: { box: 'w-44 h-44', hex: 176, title: 'text-xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* 3D Hexagon Emblem from Image 3 */}
      <div className={`relative ${currentSize.box} drop-shadow-xl flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full filter drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Red Hexagon Gradient */}
            <linearGradient id="hexRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Inner White Plate Gradient */}
            <linearGradient id="innerPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            {/* Scanner Body Gradient */}
            <linearGradient id="scannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Scanner Red Accent */}
            <linearGradient id="scannerRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            {/* Laser Beam Glow */}
            <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Outer 3D Red Hexagon Frame with Bevel */}
          <polygon
            points="100,6 182,53 182,147 100,194 18,147 18,53"
            fill="url(#hexRedGrad)"
            stroke="#7f1d1d"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Hexagon Highlight border */}
          <polygon
            points="100,12 176,56 176,144 100,188 24,144 24,56"
            fill="none"
            stroke="#fca5a5"
            strokeWidth="2"
            opacity="0.6"
            strokeLinejoin="round"
          />

          {/* 2. Inner White/Slate Shield Plate */}
          <polygon
            points="100,20 168,59 168,141 100,180 32,141 32,59"
            fill="url(#innerPlateGrad)"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* 3. Warehouse Pallet Rack (Left side) */}
          <g transform="translate(42, 45)">
            {/* Rack Uprights */}
            <rect x="0" y="0" width="4" height="85" fill="#475569" rx="1" />
            <rect x="36" y="0" width="4" height="85" fill="#475569" rx="1" />

            {/* Rack Shelves Beams (Orange/Blue industrial) */}
            <rect x="0" y="24" width="40" height="4" fill="#ea580c" rx="1" />
            <rect x="0" y="52" width="40" height="4" fill="#ea580c" rx="1" />
            <rect x="0" y="80" width="40" height="4" fill="#ea580c" rx="1" />

            {/* Shelf 1 Box (Red warehouse package) */}
            <rect x="6" y="6" width="28" height="18" fill="#dc2626" rx="2" stroke="#991b1b" strokeWidth="1" />
            <line x1="20" y1="6" x2="20" y2="24" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="2,2" />
            <rect x="14" y="10" width="12" height="6" fill="#fef08a" rx="1" opacity="0.9" />

            {/* Shelf 2 Box (Red warehouse package) */}
            <rect x="6" y="34" width="28" height="18" fill="#e11d48" rx="2" stroke="#9f1239" strokeWidth="1" />
            <line x1="20" y1="34" x2="20" y2="52" stroke="#fecdd3" strokeWidth="1.5" strokeDasharray="2,2" />
            <rect x="14" y="38" width="12" height="6" fill="#fef08a" rx="1" opacity="0.9" />

            {/* Shelf 3 Box (Red warehouse package) */}
            <rect x="6" y="62" width="28" height="18" fill="#b91c1c" rx="2" stroke="#7f1d1d" strokeWidth="1" />
            <line x1="20" y1="62" x2="20" y2="80" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="2,2" />
          </g>

          {/* 4. Clipboard with Green Checkmarks (Center) */}
          <g transform="translate(88, 48)">
            {/* Clipboard board */}
            <rect x="0" y="6" width="34" height="46" fill="#cbd5e1" rx="3" stroke="#64748b" strokeWidth="1.5" />
            {/* White Paper Sheet */}
            <rect x="3" y="10" width="28" height="39" fill="#ffffff" rx="1.5" />
            {/* Clipboard Top Clip */}
            <rect x="11" y="2" width="12" height="7" fill="#475569" rx="2" stroke="#1e293b" strokeWidth="1" />
            <circle cx="17" cy="5.5" r="1.5" fill="#f8fafc" />

            {/* Checklist Lines with Green Checks */}
            {/* Line 1 */}
            <path d="M 6 18 L 8 20 L 12 16" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="18" x2="27" y2="18" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            {/* Line 2 */}
            <path d="M 6 27 L 8 29 L 12 25" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="27" x2="27" y2="27" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            {/* Line 3 */}
            <path d="M 6 36 L 8 38 L 12 34" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="36" x2="25" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* 5. 3D Barcode Scanner Gun (Right side) */}
          <g transform="translate(105, 88)">
            {/* Scanner Gun Handle */}
            <path
              d="M 28 32 L 38 60 C 39 63 36 66 32 66 L 24 64 C 20 63 18 59 19 55 L 20 38 Z"
              fill="url(#scannerGrad)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Scanner Trigger */}
            <path d="M 23 44 C 20 44 19 47 21 50" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

            {/* Scanner Head Unit */}
            <path
              d="M 12 15 L 42 10 C 47 9 52 14 50 20 L 46 36 C 44 41 38 43 33 42 L 14 36 C 9 34 8 28 9 23 Z"
              fill="url(#scannerGrad)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Scanner Red Top Cap / Bumper */}
            <path
              d="M 16 14 L 41 10 C 44 9.5 46 12 45 15 L 43 20 L 14 24 L 14 18 C 14 16 15 14.5 16 14 Z"
              fill="url(#scannerRed)"
            />

            {/* Scanner Optical Glass Lens (Front) */}
            <polygon points="9,23 14,36 12,38 7,25" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />

            {/* Red Laser Scan Beam radiating leftwards */}
            <polygon
              points="7,27 -20,20 -20,38 7,33"
              fill="#ef4444"
              opacity="0.4"
              filter="url(#laserGlow)"
            />
            <line x1="7" y1="30" x2="-22" y2="29" stroke="#ff0000" strokeWidth="2.5" filter="url(#laserGlow)" strokeDasharray="3,1" />
          </g>
        </svg>
      </div>

      {/* Brand Typography matching Image 3 */}
      {showSubtitle && (
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className={`font-black tracking-tight text-slate-900 uppercase font-sans ${currentSize.title} drop-shadow-2xs`}>
              COUNT
            </span>
            <span className={`font-black tracking-tight text-red-600 uppercase font-sans ${currentSize.title} drop-shadow-2xs`}>
              STOCK
            </span>
          </div>

          <div className={`mt-0.5 font-extrabold tracking-widest text-slate-600 uppercase font-mono flex items-center justify-center gap-1.5 ${currentSize.sub}`}>
            <span className="text-blue-600">COUNT</span>
            <span className="text-amber-500">•</span>
            <span className="text-emerald-600">CHECK</span>
            <span className="text-amber-500">•</span>
            <span className="text-indigo-600">CONTROL</span>
          </div>
        </div>
      )}
    </div>
  );
};
