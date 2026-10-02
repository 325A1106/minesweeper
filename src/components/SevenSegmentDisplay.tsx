import React from 'react';

interface SevenSegmentDisplayProps {
  value: number;
  digits?: number;
  className?: string;
  themeColor?: string;
}

export const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({
  value,
  digits = 3,
  className = '',
  themeColor = '#ff0000',
}) => {
  // Format number into exact fixed digit string (e.g. -05 or 010 or 999)
  const isNegative = value < 0;
  const absVal = Math.min(Math.abs(value), Math.pow(10, digits) - 1);
  let strVal = absVal.toString().padStart(digits, '0');

  if (isNegative) {
    strVal = '-' + absVal.toString().padStart(digits - 1, '0');
  }

  return (
    <div
      className={`relative inline-flex items-center px-1.5 py-0.5 bg-black retro-inset select-none ${className}`}
      style={{
        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)',
      }}
    >
      {/* Background ghost 888 for authentic LED look */}
      <span
        aria-hidden="true"
        className="font-digital text-2xl tracking-widest text-[#3b0808] opacity-30 select-none pointer-events-none absolute left-1.5 top-0.5 leading-none"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        {'8'.repeat(digits)}
      </span>

      {/* Foreground glowing value */}
      <span
        className="font-digital text-2xl tracking-widest relative z-10 leading-none"
        style={{
          color: themeColor,
          fontFamily: "'VT323', monospace",
          textShadow: `0 0 5px ${themeColor}88, 0 0 8px ${themeColor}44`,
        }}
      >
        {strVal}
      </span>
    </div>
  );
};
