import React from 'react';
import { FaceMood } from '../types/minesweeper';

// Classic 16x16 Pixel Mine
export const PixelMine: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated inline-block ${className}`}
  >
    {/* Spikes */}
    <rect x="7" y="1" width="2" height="2" fill="#111827" />
    <rect x="7" y="13" width="2" height="2" fill="#111827" />
    <rect x="1" y="7" width="2" height="2" fill="#111827" />
    <rect x="13" y="7" width="2" height="2" fill="#111827" />
    
    <rect x="3" y="3" width="2" height="2" fill="#111827" />
    <rect x="11" y="3" width="2" height="2" fill="#111827" />
    <rect x="3" y="11" width="2" height="2" fill="#111827" />
    <rect x="11" y="11" width="2" height="2" fill="#111827" />

    {/* Body */}
    <rect x="5" y="4" width="6" height="8" fill="#1f2937" />
    <rect x="4" y="5" width="8" height="6" fill="#1f2937" />
    <rect x="5" y="5" width="6" height="6" fill="#111827" />

    {/* Specular White Pixel Shine */}
    <rect x="5" y="5" width="2" height="2" fill="#ffffff" />
    <rect x="6" y="7" width="1" height="1" fill="#9ca3af" />
  </svg>
);

// Classic Pixel Flag
export const PixelFlag: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated inline-block ${className}`}
  >
    {/* Red Flag Fabric */}
    <rect x="6" y="2" width="5" height="1" fill="#dc2626" />
    <rect x="5" y="3" width="6" height="2" fill="#ef4444" />
    <rect x="7" y="3" width="3" height="1" fill="#f87171" />
    <rect x="6" y="5" width="4" height="2" fill="#dc2626" />

    {/* Black Flag Pole */}
    <rect x="9" y="2" width="2" height="9" fill="#111827" />

    {/* Base Stand */}
    <rect x="6" y="11" width="7" height="2" fill="#374151" />
    <rect x="4" y="13" width="10" height="2" fill="#111827" />
    <rect x="5" y="12" width="2" height="1" fill="#9ca3af" />
  </svg>
);

// Retro Question Mark
export const PixelQuestion: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated inline-block ${className}`}
  >
    <rect x="6" y="2" width="5" height="2" fill="#1e3a8a" />
    <rect x="4" y="3" width="2" height="3" fill="#1e3a8a" />
    <rect x="10" y="3" width="2" height="4" fill="#1e3a8a" />
    <rect x="8" y="7" width="2" height="3" fill="#1e3a8a" />
    <rect x="8" y="12" width="2" height="2" fill="#1e3a8a" />
  </svg>
);

// Exploded Mine (Red background with black mine)
export const PixelExplodedMine: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <div className={`relative flex items-center justify-center bg-red-600 w-full h-full ${className}`}>
    <PixelMine size={size} />
  </div>
);

// False Flag (Mine crossed out with red X)
export const PixelFalseFlag: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
    <PixelMine size={size} />
    <svg
      className="absolute inset-0 w-full h-full pixelated pointer-events-none"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="2" y1="2" x2="14" y2="14" stroke="#dc2626" strokeWidth="2.5" />
      <line x1="14" y1="2" x2="2" y2="14" stroke="#dc2626" strokeWidth="2.5" />
    </svg>
  </div>
);

// Classic Retro Face Button
export const PixelFace: React.FC<{ mood: FaceMood; size?: number; isPressed?: boolean }> = ({
  mood,
  size = 28,
  isPressed = false,
}) => {
  return (
    <div
      className={`w-9 h-9 flex items-center justify-center cursor-pointer select-none ${
        isPressed ? 'retro-inset bg-[#c0c0c0]' : 'retro-outset bg-[#c0c0c0] hover:bg-[#cfcfcf]'
      } active:retro-inset`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pixelated"
      >
        {/* Yellow Face Background */}
        <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#000000" strokeWidth="1.5" />

        {/* Mood Specific Features */}
        {mood === 'normal' && (
          <>
            {/* Eyes */}
            <rect x="7" y="8" width="2" height="3" fill="#000000" />
            <rect x="15" y="8" width="2" height="3" fill="#000000" />
            {/* Smile */}
            <path
              d="M7 14 C7 17, 17 17, 17 14"
              stroke="#000000"
              strokeWidth="1.8"
              strokeLinecap="square"
              fill="none"
            />
          </>
        )}

        {mood === 'pressed' && (
          <>
            {/* Wide Eyes */}
            <rect x="7" y="7" width="2" height="3" fill="#000000" />
            <rect x="15" y="7" width="2" height="3" fill="#000000" />
            {/* Surprised Round Mouth */}
            <circle cx="12" cy="15" r="3" fill="#000000" />
          </>
        )}

        {mood === 'won' && (
          <>
            {/* Pixel Sunglasses */}
            <rect x="5" y="8" width="6" height="4" fill="#000000" />
            <rect x="13" y="8" width="6" height="4" fill="#000000" />
            <rect x="11" y="9" width="2" height="2" fill="#000000" />
            <rect x="6" y="9" width="2" height="1" fill="#ffffff" />
            <rect x="14" y="9" width="2" height="1" fill="#ffffff" />
            {/* Cool Grin */}
            <path
              d="M8 15 C10 18, 14 18, 16 15"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="square"
              fill="none"
            />
          </>
        )}

        {mood === 'lost' && (
          <>
            {/* X Eyes */}
            <line x1="6" y1="7" x2="10" y2="11" stroke="#000000" strokeWidth="2" />
            <line x1="10" y1="7" x2="6" y2="11" stroke="#000000" strokeWidth="2" />
            <line x1="14" y1="7" x2="18" y2="11" stroke="#000000" strokeWidth="2" />
            <line x1="18" y1="7" x2="14" y2="11" stroke="#000000" strokeWidth="2" />
            {/* Frown */}
            <path
              d="M7 17 C7 14, 17 14, 17 17"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="square"
              fill="none"
            />
          </>
        )}
      </svg>
    </div>
  );
};

// Retro Pixel Trophy
export const PixelTrophy: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated inline-block ${className}`}
  >
    {/* Cup Rim */}
    <rect x="3" y="2" width="10" height="2" fill="#fbbf24" />
    <rect x="4" y="4" width="8" height="4" fill="#f59e0b" />
    <rect x="5" y="4" width="2" height="3" fill="#fef08a" />
    <rect x="5" y="8" width="6" height="2" fill="#d97706" />
    <rect x="6" y="10" width="4" height="2" fill="#b45309" />
    {/* Base */}
    <rect x="4" y="12" width="8" height="3" fill="#78350f" />
    <rect x="5" y="13" width="6" height="1" fill="#d97706" />
    {/* Handles */}
    <rect x="1" y="3" width="2" height="3" fill="#f59e0b" />
    <rect x="2" y="5" width="2" height="2" fill="#d97706" />
    <rect x="13" y="3" width="2" height="3" fill="#f59e0b" />
    <rect x="12" y="5" width="2" height="2" fill="#d97706" />
  </svg>
);

// Retro Pixel Clock
export const PixelClock: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated inline-block ${className}`}
  >
    <rect x="5" y="1" width="6" height="2" fill="#374151" />
    <rect x="7" y="0" width="2" height="1" fill="#9ca3af" />
    <circle cx="8" cy="9" r="6" fill="#f3f4f6" stroke="#1f2937" strokeWidth="2" />
    <rect x="7" y="5" width="2" height="4" fill="#ef4444" />
    <rect x="8" y="8" width="3" height="2" fill="#1f2937" />
  </svg>
);
