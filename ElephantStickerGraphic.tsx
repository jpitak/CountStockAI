import React from 'react';
import { ElephantSticker } from '../data/elephantStickers';

interface ElephantStickerGraphicProps {
  sticker: ElephantSticker;
  size?: 'sm' | 'md' | 'lg' | 'picker';
  showCaption?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ElephantStickerGraphic: React.FC<ElephantStickerGraphicProps> = ({
  sticker,
  size = 'md',
  showCaption = true,
  className = '',
  onClick
}) => {
  // Determine sticker visual style: 'head', 'full_body', or 'action'
  const getStickerStyle = (): 'head' | 'full_body' | 'action' => {
    const pose = sticker.pose || '';
    const id = sticker.id || '';
    
    // Head close-up stickers
    if (pose.includes('face') || pose.includes('head') || id.endsWith('-1') || id.endsWith('-4') || id.endsWith('-7')) {
      return 'head';
    }
    // Full body mascot poses
    if (
      pose.includes('walk') || pose.includes('stand') || pose.includes('run') || 
      pose.includes('laser') || pose.includes('box') || pose.includes('carry') || 
      pose.includes('pda') || pose.includes('cheer') || pose.includes('thumbsup') ||
      id.endsWith('-2') || id.endsWith('-5') || id.endsWith('-8')
    ) {
      return 'full_body';
    }
    // Action / Message themed stickers
    return 'action';
  };

  const stickerStyle = getStickerStyle();

  // Dimensions & Padding depending on container
  const sizeConfig = {
    sm: {
      container: 'w-24 min-h-[110px] p-2',
      svgSize: 'w-14 h-14',
      captionText: 'text-[9.5px] leading-tight',
      badge: 'text-[7.5px]'
    },
    picker: {
      container: 'w-full min-h-[125px] p-2',
      svgSize: 'w-16 h-16',
      captionText: 'text-[10px] font-black leading-tight line-clamp-2',
      badge: 'text-[8px]'
    },
    md: {
      container: 'w-36 min-h-[145px] p-2.5',
      svgSize: 'w-20 h-20',
      captionText: 'text-[11px] font-black leading-snug',
      badge: 'text-[8.5px]'
    },
    lg: {
      container: 'w-48 min-h-[190px] p-3.5',
      svgSize: 'w-28 h-28',
      captionText: 'text-xs font-black leading-normal',
      badge: 'text-[9.5px]'
    }
  }[size];

  const themeColors = {
    red: { body: '#fca5a5', ear: '#f87171', shadow: '#b91c1c', hat: '#ef4444', cheek: '#f43f5e', accent: '#fee2e2' },
    sky: { body: '#bae6fd', ear: '#7dd3fc', shadow: '#0284c7', hat: '#38bdf8', cheek: '#f472b6', accent: '#e0f2fe' },
    navy: { body: '#bfdbfe', ear: '#93c5fd', shadow: '#1d4ed8', hat: '#1e40af', cheek: '#fb7185', accent: '#dbeafe' },
    orange: { body: '#fed7aa', ear: '#fdba74', shadow: '#c2410c', hat: '#f97316', cheek: '#f43f5e', accent: '#ffedd5' },
    pink: { body: '#fbcfe8', ear: '#f9a8d4', shadow: '#be185d', hat: '#ec4899', cheek: '#fb7185', accent: '#fce7f3' },
    purple: { body: '#e9d5ff', ear: '#d8b4fe', shadow: '#6b21a8', hat: '#a855f7', cheek: '#f43f5e', accent: '#f3e8ff' },
    white: { body: '#f8fafc', ear: '#e2e8f0', shadow: '#475569', hat: '#6366f1', cheek: '#fb7185', accent: '#ffffff' }
  }[sticker.themeColor || 'sky'];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-gradient-to-b ${sticker.bgGradient} shadow-md hover:shadow-xl border-2 ${sticker.borderColor} flex flex-col items-center justify-between overflow-hidden cursor-pointer transition-all active:scale-95 group select-none ${sizeConfig.container} ${className}`}
    >
      {/* 3D Glass Light Gloss Flare */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl pointer-events-none" />

      {/* TOP BADGE & PROPS EMOJI */}
      <div className="w-full flex items-center justify-between z-10 shrink-0">
        <span className={`${sizeConfig.badge} font-black uppercase tracking-wider bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-xs shadow-2xs`}>
          {stickerStyle === 'head' ? '🐘 HEAD' : stickerStyle === 'full_body' ? '🐘 3D BODY' : '⚡ ACTION'}
        </span>
        <span className="text-sm filter drop-shadow-md transform group-hover:scale-125 transition-transform">
          {sticker.propsEmoji}
        </span>
      </div>

      {/* 3D VECTOR GRAPHIC RENDERER */}
      <div className={`relative ${sizeConfig.svgSize} flex items-center justify-center z-10 my-1`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-108"
        >
          <defs>
            {/* 3D Body Radial Gradient */}
            <radialGradient id={`bodyGrad-${sticker.id}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="35%" stopColor={themeColors.body} />
              <stop offset="100%" stopColor={themeColors.shadow} />
            </radialGradient>

            {/* 3D Ear Radial Gradient */}
            <radialGradient id={`earGrad-${sticker.id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="45%" stopColor={themeColors.ear} />
              <stop offset="100%" stopColor={themeColors.shadow} />
            </radialGradient>

            {/* 3D Torso Gradient */}
            <linearGradient id={`torsoGrad-${sticker.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={themeColors.body} />
              <stop offset="100%" stopColor={themeColors.shadow} />
            </linearGradient>

            {/* Laser Beam Glow */}
            <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* 1. FULL BODY ELEPHANT MASCOT WITH POSES & PROPS */}
          {/* ======================================================== */}
          {stickerStyle === 'full_body' && (
            <g>
              {/* Back Shadow */}
              <ellipse cx="60" cy="112" rx="36" ry="6" fill="#000000" opacity="0.25" />

              {/* Elephant Feet / Legs */}
              <ellipse cx="44" cy="104" rx="11" ry="8" fill={`url(#bodyGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" />
              <ellipse cx="76" cy="104" rx="11" ry="8" fill={`url(#bodyGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" />
              {/* Toenails */}
              <circle cx="40" cy="108" r="2" fill="#ffffff" />
              <circle cx="44" cy="109" r="2" fill="#ffffff" />
              <circle cx="48" cy="108" r="2" fill="#ffffff" />
              <circle cx="72" cy="108" r="2" fill="#ffffff" />
              <circle cx="76" cy="109" r="2" fill="#ffffff" />
              <circle cx="80" cy="108" r="2" fill="#ffffff" />

              {/* Elephant Round Belly / Torso */}
              <circle cx="60" cy="80" r="26" fill={`url(#torsoGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              {/* Light Belly Highlight */}
              <ellipse cx="60" cy="84" rx="16" ry="14" fill="#ffffff" opacity="0.45" />

              {/* Left Big Ear */}
              <path d="M 36 32 C 12 18, 4 60, 28 68 C 36 65, 38 48, 36 32 Z" fill={`url(#earGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
              <path d="M 30 38 C 18 30, 14 54, 26 60 C 31 58, 33 46, 30 38 Z" fill="#fbcfe8" opacity="0.8" />

              {/* Right Big Ear */}
              <path d="M 84 32 C 108 18, 116 60, 92 68 C 84 65, 82 48, 84 32 Z" fill={`url(#earGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
              <path d="M 90 38 C 102 30, 106 54, 94 60 C 89 58, 87 46, 90 38 Z" fill="#fbcfe8" opacity="0.8" />

              {/* Head Sphere */}
              <circle cx="60" cy="46" r="26" fill={`url(#bodyGrad-${sticker.id})`} stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />

              {/* Cheeks */}
              <ellipse cx="44" cy="52" rx="4" ry="2.5" fill={themeColors.cheek} opacity="0.6" />
              <ellipse cx="76" cy="52" rx="4" ry="2.5" fill={themeColors.cheek} opacity="0.6" />

              {/* Cartoon Eyes */}
              <ellipse cx="49" cy="40" rx="3.5" ry="5" fill="#0f172a" />
              <ellipse cx="71" cy="40" rx="3.5" ry="5" fill="#0f172a" />
              <circle cx="50.5" cy="38.5" r="1.5" fill="#ffffff" />
              <circle cx="72.5" cy="38.5" r="1.5" fill="#ffffff" />

              {/* Happy Eyebrows */}
              <path d="M 45 32 Q 49 29 53 32" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 67 32 Q 71 29 75 32" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

              {/* Elephant Tusks */}
              <path d="M 54 55 Q 51 63 47 65 Q 50 61 55 57 Z" fill="#ffffff" stroke="rgba(0,0,0,0.1)" />
              <path d="M 66 55 Q 69 63 73 65 Q 70 61 65 57 Z" fill="#ffffff" stroke="rgba(0,0,0,0.1)" />

              {/* Hands & Props (Laser Scanner / Clipboard / Thumbsup) */}
              {sticker.caption.includes('สแกน') || sticker.caption.includes('ยิง') || sticker.caption.includes('บาร์โค้ด') ? (
                // Holding PDA Laser Gun
                <g>
                  {/* Trunk curled happy */}
                  <path d="M 57 48 Q 50 62 44 64 Q 40 64 45 57 Q 56 46 61 48 Z" fill={`url(#bodyGrad-${sticker.id})`} />
                  {/* Left Hand Holding PDA */}
                  <circle cx="34" cy="74" r="7" fill={`url(#bodyGrad-${sticker.id})`} />
                  {/* Right Hand Aiming Scanner */}
                  <rect x="76" y="66" width="18" height="12" rx="3" fill="#1e293b" />
                  <rect x="80" y="70" width="10" height="4" rx="1" fill="#38bdf8" />
                  <polygon points="94,72 118,65 118,79" fill="#ef4444" opacity="0.8" filter="url(#laserGlow)" />
                  <line x1="94" y1="72" x2="118" y2="72" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              ) : sticker.caption.includes('ISO') || sticker.caption.includes('SOP') || sticker.caption.includes('ตรวจ') ? (
                // Holding ISO Checklist Clipboard
                <g>
                  {/* Trunk pointing to clipboard */}
                  <path d="M 57 48 Q 60 62 60 70 Q 56 68 56 56 Z" fill={`url(#bodyGrad-${sticker.id})`} />
                  {/* Clipboard */}
                  <rect x="68" y="64" width="22" height="28" rx="3" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  <rect x="74" y="61" width="10" height="4" rx="1.5" fill="#f59e0b" />
                  <line x1="72" y1="70" x2="86" y2="70" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="72" y1="76" x2="86" y2="76" stroke="#3b82f6" strokeWidth="1.5" />
                  <line x1="72" y1="82" x2="82" y2="82" stroke="#64748b" strokeWidth="1.5" />
                  {/* Hand holding it */}
                  <circle cx="68" cy="80" r="6" fill={`url(#bodyGrad-${sticker.id})`} />
                </g>
              ) : (
                // Thumbsup / Cheering Hands
                <g>
                  <path d="M 58 48 Q 60 66 68 70 Q 73 72 71 67 Q 66 63 60 48 Z" fill={`url(#bodyGrad-${sticker.id})`} />
                  {/* Left Hand Thumbs Up */}
                  <ellipse cx="30" cy="70" rx="6" ry="8" fill={`url(#bodyGrad-${sticker.id})`} transform="rotate(-20 30 70)" />
                  <circle cx="28" cy="64" r="3.5" fill={`url(#bodyGrad-${sticker.id})`} />
                  {/* Right Hand Thumbs Up */}
                  <ellipse cx="90" cy="70" rx="6" ry="8" fill={`url(#bodyGrad-${sticker.id})`} transform="rotate(20 90 70)" />
                  <circle cx="92" cy="64" r="3.5" fill={`url(#bodyGrad-${sticker.id})`} />
                </g>
              )}

              {/* Safety Helmet */}
              <path d="M 46 25 Q 60 14 74 25 L 77 29 Q 60 26 43 29 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
              <circle cx="60" cy="18" r="3.5" fill="#eab308" />
            </g>
          )}

          {/* ======================================================== */}
          {/* 2. HEAD CLOSEUP EXPRESSIVE 3D ELEPHANT */}
          {/* ======================================================== */}
          {stickerStyle === 'head' && (
            <g>
              {/* Back Glow */}
              <circle cx="60" cy="60" r="48" fill="#ffffff" opacity="0.2" />

              {/* Left Big Flapping Ear */}
              <path d="M 32 40 C 6 26, -2 74, 24 85 C 34 81, 38 60, 34 40 Z" fill={`url(#earGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
              <path d="M 26 46 C 12 36, 8 68, 22 75 C 28 73, 30 58, 26 46 Z" fill="#fbcfe8" opacity="0.8" />

              {/* Right Big Flapping Ear */}
              <path d="M 88 40 C 114 26, 122 74, 96 85 C 86 81, 82 60, 86 40 Z" fill={`url(#earGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
              <path d="M 94 46 C 108 36, 112 68, 98 75 C 92 73, 90 58, 94 46 Z" fill="#fbcfe8" opacity="0.8" />

              {/* Head Ball */}
              <circle cx="60" cy="60" r="36" fill={`url(#bodyGrad-${sticker.id})`} stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />

              {/* Rosy Cheeks */}
              <ellipse cx="40" cy="68" rx="6" ry="3.5" fill={themeColors.cheek} opacity="0.65" />
              <ellipse cx="80" cy="68" rx="6" ry="3.5" fill={themeColors.cheek} opacity="0.65" />

              {/* Big Expressive Cartoon Eyes */}
              <ellipse cx="46" cy="52" rx="5" ry="7.5" fill="#0f172a" />
              <ellipse cx="74" cy="52" rx="5" ry="7.5" fill="#0f172a" />
              {/* Big Sparkle */}
              <circle cx="48" cy="49" r="2.5" fill="#ffffff" />
              <circle cx="44.5" cy="54" r="1.2" fill="#ffffff" />
              <circle cx="76" cy="49" r="2.5" fill="#ffffff" />
              <circle cx="72.5" cy="54" r="1.2" fill="#ffffff" />

              {/* Eyebrows */}
              <path d="M 40 40 Q 46 35 52 40" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              <path d="M 68 40 Q 74 35 80 40" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

              {/* Expressive Trunk Waving */}
              <path d="M 57 62 Q 60 82 72 86 Q 80 88 78 81 Q 70 76 63 62 Z" fill={`url(#bodyGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />

              {/* Tusks */}
              <path d="M 52 72 Q 48 82 42 85 Q 46 79 53 74 Z" fill="#ffffff" stroke="rgba(0,0,0,0.15)" />
              <path d="M 68 72 Q 72 82 78 85 Q 74 79 67 74 Z" fill="#ffffff" stroke="rgba(0,0,0,0.15)" />

              {/* Safety Cap / Storekeeper Beret */}
              <path d="M 42 30 Q 60 16 78 30 L 82 35 Q 60 31 38 35 Z" fill={themeColors.hat} stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="60" cy="20" r="4" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}

          {/* ======================================================== */}
          {/* 3. ACTION & MESSAGE-THEMED GRAPHIC (SCAN, LOCATION, ISO, ETC) */}
          {/* ======================================================== */}
          {stickerStyle === 'action' && (
            <g>
              {/* Background Theme Graphic Element */}
              {sticker.caption.includes('Location') || sticker.caption.includes('ล็อก') || sticker.caption.includes('โซน') ? (
                // Pin / Warehouse Map
                <g>
                  <circle cx="60" cy="60" r="42" fill="#ffffff" opacity="0.3" />
                  <path d="M 60 16 C 45 16 34 27 34 42 C 34 60 60 88 60 88 C 60 88 86 60 86 42 C 86 27 75 16 60 16 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="60" cy="40" r="12" fill="#ffffff" />
                  <circle cx="60" cy="40" r="7" fill="#ef4444" />
                </g>
              ) : sticker.caption.includes('100%') || sticker.caption.includes('ตรง') || sticker.caption.includes('สำเร็จ') ? (
                // Golden Star / Trophy / 100%
                <g>
                  <circle cx="60" cy="60" r="40" fill="#fef08a" opacity="0.4" />
                  <polygon points="60,18 70,42 96,44 76,60 82,86 60,72 38,86 44,60 24,44 50,42" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="60" cy="54" r="14" fill="#10b981" />
                  <path d="M 54 54 L 58 58 L 66 50" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : sticker.caption.includes('ชำรุด') || sticker.caption.includes('เสียหาย') || sticker.caption.includes('เตือน') || sticker.caption.includes('Out of Master') ? (
                // Warning Triangle
                <g>
                  <polygon points="60,16 100,84 20,84" fill="#f59e0b" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
                  <rect x="57" y="38" width="6" height="24" rx="3" fill="#ffffff" />
                  <circle cx="60" cy="72" r="4" fill="#ffffff" />
                </g>
              ) : sticker.caption.includes('Sheets') || sticker.caption.includes('ซิงค์') || sticker.caption.includes('Cloud') ? (
                // Cloud & Sync
                <g>
                  <path d="M 38 68 C 24 68 16 56 22 44 C 28 32 44 32 50 36 C 56 24 78 24 86 34 C 98 34 104 46 98 58 C 96 68 84 68 84 68 Z" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="60" cy="52" r="12" fill="#10b981" />
                  <path d="M 54 48 H 66 V 56 H 54 Z" fill="#ffffff" />
                </g>
              ) : (
                // Default Happy Sunburst
                <g>
                  <circle cx="60" cy="60" r="40" fill="#ffffff" opacity="0.3" />
                  <circle cx="60" cy="60" r="30" fill="#f59e0b" />
                </g>
              )}

              {/* Cute Elephant Face Overlay inside Action */}
              <g transform="translate(15, 30) scale(0.75)">
                {/* Ears */}
                <path d="M 30 35 C 10 25, 4 60, 26 68 C 32 65, 34 50, 30 35 Z" fill={`url(#earGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
                <path d="M 70 35 C 90 25, 96 60, 74 68 C 68 65, 66 50, 70 35 Z" fill={`url(#earGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
                {/* Face */}
                <circle cx="50" cy="50" r="24" fill={`url(#bodyGrad-${sticker.id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
                <ellipse cx="38" cy="55" rx="3.5" ry="2" fill={themeColors.cheek} opacity="0.6" />
                <ellipse cx="62" cy="55" rx="3.5" ry="2" fill={themeColors.cheek} opacity="0.6" />
                <circle cx="42" cy="46" r="3" fill="#0f172a" />
                <circle cx="58" cy="46" r="3" fill="#0f172a" />
                <circle cx="43" cy="45" r="1" fill="#ffffff" />
                <circle cx="59" cy="45" r="1" fill="#ffffff" />
                <path d="M 48 54 Q 50 66 56 68 Q 60 70 58 65 Q 54 62 50 54 Z" fill={`url(#bodyGrad-${sticker.id})`} />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* ======================================================== */}
      {/* 4. PROMINENT TEXT CAPTION BANNER (CLEAR & HIGH READABILITY) */}
      {/* ======================================================== */}
      {showCaption && (
        <div className="w-full bg-white/95 backdrop-blur-md rounded-xl p-1.5 text-center shadow-md z-10 border border-white/80 shrink-0 mt-auto">
          <p className={`${sizeConfig.captionText} font-black text-slate-900 leading-tight text-center break-words`}>
            {sticker.caption}
          </p>
        </div>
      )}
    </div>
  );
};
