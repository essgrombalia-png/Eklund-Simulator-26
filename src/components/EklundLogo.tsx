import React from 'react';

interface EklundLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const EklundLogo: React.FC<EklundLogoProps> = ({
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-sm', badge: 'text-[9px] px-1.5 py-0.2' },
    md: { icon: 'w-10 h-10', text: 'text-base', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', badge: 'text-xs px-2.5 py-0.5' },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Premium Emblem Mark */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition-opacity duration-300 logo-glow" />

        {/* Outer Hexagon Shield Badge */}
        <div className={`relative ${sizeClasses.icon} rounded-2xl bg-slate-950 border-2 border-cyan-400/80 shadow-2xl flex items-center justify-center overflow-hidden p-1.5`}>
          {/* Subtle Background Circuit Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:8px_8px] opacity-25" />

          {/* Custom SVG Emblem: Stylized Eklund 'E' Oak-Network Emblem */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hexagonal Frame contour */}
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              stroke="url(#eklundGlow)"
              strokeWidth="4"
              strokeLinejoin="round"
              className="opacity-40"
            />

            {/* Stylized 'E' Topology Network */}
            {/* Vertical Trunk */}
            <path d="M30 25 L30 75" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

            {/* Top Branch (Stylized Oak Curve to Node) */}
            <path d="M30 25 Q 50 18 70 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            
            {/* Middle Branch */}
            <path d="M30 50 L60 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

            {/* Bottom Branch */}
            <path d="M30 75 Q 50 82 70 75" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

            {/* Network Topology Nodes (Glowing Dots at ends of E) */}
            <circle cx="70" cy="25" r="5" fill="#38bdf8" className="animate-ping opacity-75" />
            <circle cx="70" cy="25" r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />

            <circle cx="60" cy="50" r="5" fill="#14b8a6" stroke="#ffffff" strokeWidth="2" />

            <circle cx="70" cy="75" r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />

            {/* Center Core Router Node */}
            <circle cx="30" cy="50" r="7" fill="#38bdf8" stroke="#090d16" strokeWidth="2" />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="eklundGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Micro Edition Overlay Badge */}
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black font-orbitron text-[8px] px-1 py-0.2 rounded-tl shadow-md tracking-tighter">
            26
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className={`${sizeClasses.text} font-orbitron font-black tracking-wider text-white bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]`}>
            EKLUND
          </h1>
          <span className="font-space font-extrabold text-cyan-400 tracking-wider">
            SIMULATOR
          </span>
          <span className={`inline-flex items-center font-orbitron font-extrabold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] rounded-lg ${sizeClasses.badge}`}>
            v26
          </span>
        </div>

        {showSubtitle && (
          <p className="text-[11px] font-space font-semibold text-slate-400 tracking-wide flex items-center gap-2 mt-0.5">
            <span className="text-teal-400/90 font-mono text-[10px] uppercase tracking-widest">
              Enterprise Network Engine
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
