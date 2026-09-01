import React from 'react';
import { DeviceType } from '../types';

interface RealisticDeviceIconProps {
  type: DeviceType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RealisticDeviceIcon: React.FC<RealisticDeviceIconProps> = ({
  type,
  className = '',
  size = 'md',
}) => {
  const dimensions = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  // Common glowing indicator animations to embed in SVGs
  const svgStyle = (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes blink-green { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 3px #10b981); } }
      @keyframes blink-amber { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; filter: drop-shadow(0 0 3px #f59e0b); } }
      @keyframes blink-red { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; filter: drop-shadow(0 0 4px #ef4444); } }
      @keyframes blink-cyan { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; filter: drop-shadow(0 0 3px #06b6d4); } }
      @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 0.4; } 100% { transform: scale(0.95); opacity: 0.8; } }
      @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes wave-flow { 0% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 0.9; } 100% { opacity: 0.1; transform: scale(1.3); } }
      .led-green { animation: blink-green 1.2s infinite; }
      .led-green-fast { animation: blink-green 0.6s infinite; }
      .led-amber { animation: blink-amber 1.8s infinite; }
      .led-red { animation: blink-red 1s infinite; }
      .led-cyan { animation: blink-cyan 1.4s infinite; }
      .spin-slow { transform-origin: center; animation: rotate-slow 15s linear infinite; }
      .wave-p1 { transform-origin: center; animation: wave-flow 2s infinite; }
      .wave-p2 { transform-origin: center; animation: wave-flow 2s infinite 0.7s; }
    `}} />
  );

  switch (type) {
    case 'internet':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <radialGradient id="globe-glow-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#0891b2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#155e75" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="globe-land" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="globe-lat" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
            </linearGradient>
            <filter id="shadow-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#22d3ee" floodOpacity="0.6"/>
            </filter>
          </defs>
          {/* Glowing Aura */}
          <circle cx="24" cy="24" r="21" fill="url(#globe-glow-bg)" />
          {/* Main Water Body */}
          <circle cx="24" cy="24" r="17" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.8" filter="url(#shadow-glow)" />
          
          {/* Abstract Continents (Realistic visual flair) */}
          <path d="M 13 18 Q 16 12 21 15 T 18 25 T 12 22 Z" fill="url(#globe-land)" opacity="0.85" />
          <path d="M 28 28 Q 32 24 35 29 T 31 36 T 25 32 Z" fill="url(#globe-land)" opacity="0.85" />
          <path d="M 29 16 Q 34 14 36 19 T 30 22 Z" fill="url(#globe-land)" opacity="0.85" />
          <path d="M 14 32 Q 17 35 15 38 T 11 36 Z" fill="url(#globe-land)" opacity="0.8" />

          {/* Grid Lines (Latitudes & Longitudes) */}
          <circle cx="24" cy="24" r="17" stroke="url(#globe-lat)" strokeWidth="1" fill="none" />
          <ellipse cx="24" cy="24" rx="17" ry="6" stroke="url(#globe-lat)" strokeWidth="1" fill="none" />
          <ellipse cx="24" cy="24" rx="6" ry="17" stroke="url(#globe-lat)" strokeWidth="1" fill="none" />
          <line x1="7" y1="24" x2="41" y2="24" stroke="url(#globe-lat)" strokeWidth="0.8" />
          <line x1="24" y1="7" x2="24" y2="41" stroke="url(#globe-lat)" strokeWidth="0.8" />

          {/* Orbital Com Ring & Satellite */}
          <g className="spin-slow">
            <ellipse cx="24" cy="24" rx="21" ry="4" stroke="#e0f2fe" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.7" transform="rotate(-30 24 24)" />
            <circle cx="6" cy="14" r="2.5" fill="#22d3ee" filter="url(#shadow-glow)" />
            <circle cx="6" cy="14" r="1" fill="#ffffff" />
          </g>

          {/* Sparking Connection Nodes */}
          <circle cx="18" cy="15" r="1.5" fill="#ffffff" className="led-cyan" />
          <circle cx="31" cy="29" r="1.5" fill="#ffffff" className="led-cyan" />
          <circle cx="22" cy="33" r="1.2" fill="#22d3ee" />
        </svg>
      );

    case 'firewall':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="fw-metal-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="40%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#2e0808" />
            </linearGradient>
            <linearGradient id="fw-brick-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="highlight-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
            <filter id="fire-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ef4444" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* Main 1U/2U Rugged Rack Chassis */}
          <rect x="4" y="10" width="40" height="28" rx="4" fill="url(#fw-metal-chassis)" stroke="#b91c1c" strokeWidth="1.8" />
          <rect x="5" y="11" width="38" height="26" rx="3" fill="url(#highlight-shimmer)" />

          {/* Horizontal Vent Grills */}
          <line x1="8" y1="15" x2="40" y2="15" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="15" x2="40" y2="15" stroke="#ef4444" strokeWidth="0.8" opacity="0.6" strokeDasharray="2,3" />

          {/* Secure Shaded Shield Emblem */}
          <path d="M 24 18 L 33 21 V 27 C 33 32.5 24 35.5 24 35.5 C 24 35.5 15 32.5 15 27 V 21 Z" fill="url(#fw-brick-grad)" stroke="#fca5a5" strokeWidth="1.2" />
          
          {/* Detailed Brick Pattern lines in Shield */}
          <path d="M 18 24 H 30 M 15 27.5 H 33 M 18 31 H 30 M 21 21 V 24 M 27 21 V 24 M 24 24 V 27.5 M 18 24 V 27.5 M 30 24 V 27.5 M 21 27.5 V 31 M 27 27.5 V 31 M 24 31 V 34.5" stroke="#5b0707" strokeWidth="0.8" opacity="0.85" />

          {/* Dual Fiber Interface Port */}
          <rect x="7" y="22" width="5" height="4" rx="0.5" fill="#1e1b4b" stroke="#ef4444" strokeWidth="0.5" />
          <circle cx="8.5" cy="24" r="0.8" fill="#ef4444" className="led-red" />
          <circle cx="10.5" cy="24" r="0.8" fill="#ef4444" className="led-red" />

          {/* Matrix Admin LED array */}
          <circle cx="8" cy="31" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="12" cy="31" r="1.2" fill="#ef4444" className="led-red" />
          <circle cx="36" cy="31" r="1.2" fill="#eab308" className="led-amber" />
          <circle cx="40" cy="31" r="1.2" fill="#22c55e" className="led-green-fast" />

          {/* Secure Shield Overlay Glow */}
          <circle cx="24" cy="25.5" r="1" fill="#ffffff" filter="url(#fire-glow)" />
        </svg>
      );

    case 'router':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="rtr-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="rtr-face" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="rtr-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#fbbf24" floodOpacity="0.7"/>
            </filter>
          </defs>
          {/* Dual High-Gain Antennas (isometric perspective) */}
          <g>
            <line x1="9" y1="21" x2="9" y2="4" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="4" r="1.5" fill="#f59e0b" />
            <ellipse cx="9" cy="4" rx="4" ry="1.5" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.5" className="wave-p1" />
            <ellipse cx="9" cy="4" rx="8" ry="3" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.3" className="wave-p2" />

            <line x1="39" y1="21" x2="39" y2="4" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <circle cx="39" cy="4" r="1.5" fill="#f59e0b" />
            <ellipse cx="39" cy="4" rx="4" ry="1.5" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.5" className="wave-p1" />
            <ellipse cx="39" cy="4" rx="8" ry="3" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.3" className="wave-p2" />
          </g>

          {/* Sturdy Circular Metal Base Plate Router Chassis */}
          <rect x="4" y="20" width="40" height="21" rx="4" fill="url(#rtr-case)" stroke="#f59e0b" strokeWidth="1.8" />
          
          {/* Front Air Intake/Status Panel */}
          <rect x="7" y="23" width="34" height="6" rx="1.5" fill="#020617" stroke="#334155" strokeWidth="0.8" />
          
          {/* LCD Diagnostic Display */}
          <rect x="9" y="24.5" width="11" height="3" fill="#042f2e" stroke="#0d9488" strokeWidth="0.5" />
          <line x1="10.5" y1="26" x2="18.5" y2="26" stroke="#ccfbf1" strokeWidth="0.8" />
          
          {/* RJ-45 Gigabit Ports (WAN & LAN representation) */}
          <rect x="23" y="24.5" width="4" height="3.5" rx="0.5" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="0.6" />
          <rect x="29" y="24.5" width="4" height="3.5" rx="0.5" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="0.6" />
          <rect x="35" y="24.5" width="4" height="3.5" rx="0.5" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="0.6" />

          {/* Active Status Indicators */}
          <circle cx="9" cy="34" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="14" cy="34" r="1.2" fill="#22c55e" className="led-green-fast" />
          <circle cx="19" cy="34" r="1.2" fill="#fbbf24" className="led-amber" />
          <circle cx="24" cy="34" r="1.2" fill="#38bdf8" className="led-cyan" />
          <circle cx="34" cy="34" r="0.8" fill="#22c55e" className="led-green" />
          <circle cx="38" cy="34" r="0.8" fill="#22c55e" />
        </svg>
      );

    case 'wifi_router':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="wf-rtr-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#115e59" />
              <stop offset="60%" stopColor="#042f2e" />
              <stop offset="100%" stopColor="#021412" />
            </linearGradient>
            <filter id="wf-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#14b8a6" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* Quad Stream Antennas (Angled realistic layout) */}
          <g stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round">
            <line x1="6" y1="21" x2="3" y2="6" />
            <circle cx="3" cy="6" r="1" fill="#2dd4bf" />
            <line x1="18" y1="19" x2="15" y2="3" />
            <circle cx="15" cy="3" r="1" fill="#2dd4bf" />
            <line x1="30" y1="19" x2="33" y2="3" />
            <circle cx="33" cy="3" r="1" fill="#2dd4bf" />
            <line x1="42" y1="21" x2="45" y2="6" />
            <circle cx="45" cy="6" r="1" fill="#2dd4bf" />
          </g>

          {/* Wi-Fi Waves radiating from Center */}
          <path d="M 19 14 C 22 11 26 11 29 14" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" className="wave-p1" />
          <path d="M 16 10 C 21 6 27 6 32 10" stroke="#5eead4" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" className="wave-p2" />

          {/* Futuristic High-Performance Router Chassis */}
          <rect x="5" y="19" width="38" height="22" rx="6" fill="url(#wf-rtr-case)" stroke="#14b8a6" strokeWidth="1.8" />
          
          {/* Triangular Vent Grid in Center */}
          <path d="M 24 22 L 29 27 H 19 Z" fill="#042f2e" stroke="#2dd4bf" strokeWidth="0.8" />
          <circle cx="24" cy="25" r="1.5" fill="#ffffff" filter="url(#wf-glow)" className="led-cyan" />

          {/* Diagonal Aerodynamic Vents */}
          <line x1="8" y1="26" x2="14" y2="32" stroke="#042f2e" strokeWidth="1.5" />
          <line x1="40" y1="26" x2="34" y2="32" stroke="#042f2e" strokeWidth="1.5" />

          {/* Futuristic Status Bar (Front Edge Blue Glow) */}
          <rect x="12" y="34" width="24" height="2" rx="1" fill="#0f766e" />
          <line x1="15" y1="35" x2="33" y2="35" stroke="#2dd4bf" strokeWidth="1.2" strokeDasharray="1,2" className="led-cyan" />
          
          <circle cx="10" cy="31" r="0.8" fill="#4ade80" />
          <circle cx="38" cy="31" r="0.8" fill="#4ade80" />
        </svg>
      );

    case 'l3_switch':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="l3-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="60%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#08071a" />
            </linearGradient>
            <linearGradient id="led-rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          {/* 1U Heavy Duty Enterprise Layer 3 Chassis */}
          <rect x="3" y="14" width="42" height="20" rx="3" fill="url(#l3-chassis)" stroke="#818cf8" strokeWidth="1.8" />
          
          {/* Rackmount Ears (Metal brackets with bolt holes) */}
          <path d="M 3 14 V 34 H 5 V 14 Z M 43 14 V 34 H 45 V 14 Z" fill="#4338ca" stroke="#6366f1" strokeWidth="0.5" />
          <circle cx="4" cy="18" r="0.8" fill="#94a3b8" />
          <circle cx="4" cy="30" r="0.8" fill="#94a3b8" />
          <circle cx="44" cy="18" r="0.8" fill="#94a3b8" />
          <circle cx="44" cy="30" r="0.8" fill="#94a3b8" />

          {/* Port Console Block Panel */}
          <rect x="8" y="18" width="28" height="11" rx="1.5" fill="#020617" stroke="#312e81" strokeWidth="0.8" />

          {/* 2 Rows of High-Density RJ45 Ethernet Blocks */}
          <g fill="#4338ca" stroke="#818cf8" strokeWidth="0.4">
            {/* Top row ports */}
            <rect x="10" y="20" width="3" height="3" rx="0.5" />
            <rect x="14" y="20" width="3" height="3" rx="0.5" />
            <rect x="18" y="20" width="3" height="3" rx="0.5" />
            <rect x="22" y="20" width="3" height="3" rx="0.5" />
            <rect x="26" y="20" width="3" height="3" rx="0.5" />
            <rect x="30" y="20" width="3" height="3" rx="0.5" />
            {/* Bottom row ports */}
            <rect x="10" y="24" width="3" height="3" rx="0.5" />
            <rect x="14" y="24" width="3" height="3" rx="0.5" />
            <rect x="18" y="24" width="3" height="3" rx="0.5" />
            <rect x="22" y="24" width="3" height="3" rx="0.5" />
            <rect x="26" y="24" width="3" height="3" rx="0.5" />
            <rect x="30" y="24" width="3" height="3" rx="0.5" />
          </g>

          {/* Dual SFP+ 10G Transceiver Ports (Gold & Cyan Fiber connections) */}
          <rect x="37" y="19" width="4" height="9" rx="0.5" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" />
          <rect x="38" y="20" width="2" height="3" fill="#06b6d4" rx="0.2" />
          <rect x="38" y="24" width="2" height="3" fill="#06b6d4" rx="0.2" />

          {/* Port Activity LED Status Strip (Glowing Fiber/LAN visualization) */}
          <rect x="10" y="16" width="23" height="1.2" rx="0.5" fill="#020617" />
          <line x1="10" y1="16.5" x2="33" y2="16.5" stroke="url(#led-rainbow)" strokeWidth="0.8" strokeDasharray="1,1" opacity="0.9" />

          {/* Redundancy Power & Routing LED Matrix */}
          <circle cx="11" cy="31.5" r="0.8" fill="#22c55e" className="led-green" />
          <circle cx="14" cy="31.5" r="0.8" fill="#38bdf8" className="led-cyan" />
          <circle cx="17" cy="31.5" r="0.8" fill="#22c55e" />
        </svg>
      );

    case 'switch':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="l2-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="60%" stopColor="#172554" />
              <stop offset="100%" stopColor="#080e26" />
            </linearGradient>
            <linearGradient id="cable-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          {/* Layer 2 Distribution Switch Chassis */}
          <rect x="4" y="16" width="40" height="17" rx="3" fill="url(#l2-chassis)" stroke="#3b82f6" strokeWidth="1.8" />
          
          {/* RJ-45 Port Panel Grid */}
          <rect x="7" y="20" width="26" height="8" rx="1" fill="#030712" stroke="#1d4ed8" strokeWidth="0.8" />

          {/* Modular Ethernet Ports with individual clip hooks */}
          <g fill="#1e40af" stroke="#60a5fa" strokeWidth="0.4">
            <rect x="9" y="21.5" width="2.5" height="4" rx="0.2" />
            <rect x="13" y="21.5" width="2.5" height="4" rx="0.2" />
            <rect x="17" y="21.5" width="2.5" height="4" rx="0.2" />
            <rect x="21" y="21.5" width="2.5" height="4" rx="0.2" />
            <rect x="25" y="21.5" width="2.5" height="4" rx="0.2" />
            <rect x="29" y="21.5" width="2.5" height="4" rx="0.2" />
          </g>

          {/* Active Link LED arrays above each port */}
          <circle cx="10" cy="21" r="0.6" fill="#22c55e" className="led-green" />
          <circle cx="14" cy="21" r="0.6" fill="#22c55e" className="led-green-fast" />
          <circle cx="18" cy="21" r="0.6" fill="#fbbf24" className="led-amber" />
          <circle cx="22" cy="21" r="0.6" fill="#22c55e" />
          <circle cx="26" cy="21" r="0.6" fill="#22c55e" className="led-green-fast" />
          <circle cx="30" cy="21" r="0.6" fill="#e2e8f0" />

          {/* Main Power, System, and Stack Connection LED Indicators */}
          <circle cx="37" cy="21" r="1" fill="#22c55e" className="led-green" />
          <circle cx="40" cy="21" r="1" fill="#22c55e" />
          <circle cx="37" cy="25" r="1" fill="#3b82f6" className="led-cyan" />
          <circle cx="40" cy="25" r="1" fill="#fbbf24" className="led-amber" />
        </svg>
      );

    case 'wifi_ap':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <radialGradient id="ap-disk" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#134e4a" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
            </radialGradient>
            <filter id="ap-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#2dd4bf" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* Circular Ceiling Mount Disk (UniFi Enterprise AP Style) */}
          <circle cx="24" cy="24" r="19" fill="url(#ap-disk)" stroke="#14b8a6" strokeWidth="1.8" />
          
          {/* Inner Signal Radiating Ring */}
          <circle cx="24" cy="24" r="13" fill="none" stroke="#042f2e" strokeWidth="2" opacity="0.5" />
          
          {/* Pulsing LED Ring (Real dynamic breathing visual) */}
          <circle cx="24" cy="24" r="9.5" fill="none" stroke="#2dd4bf" strokeWidth="1.6" filter="url(#ap-glow-filter)" className="wave-p1" />
          <circle cx="24" cy="24" r="9.5" fill="none" stroke="#5eead4" strokeWidth="1.2" opacity="0.6" className="wave-p2" />

          {/* Central Transmitter Module */}
          <circle cx="24" cy="24" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="1" />
          <circle cx="24" cy="24" r="2" fill="#ffffff" className="led-cyan" />
        </svg>
      );

    case 'server_web':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="srv-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="60%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#0f0c2e" />
            </linearGradient>
            <linearGradient id="drive-metallic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* 3U Rack Server Enclosure (Purple-Indigo theme) */}
          <rect x="4" y="6" width="40" height="36" rx="4" fill="url(#srv-chassis)" stroke="#818cf8" strokeWidth="1.8" />
          <rect x="5" y="7" width="38" height="34" rx="3" fill="none" stroke="#4f46e5" strokeWidth="1" />

          {/* Chassis Rack Ears */}
          <path d="M 4 6 V 42 H 6 V 6 Z M 42 6 V 42 H 44 V 6 Z" fill="#4338ca" />
          <circle cx="5" cy="10" r="0.8" fill="#cbd5e1" />
          <circle cx="5" cy="38" r="0.8" fill="#cbd5e1" />
          <circle cx="43" cy="10" r="0.8" fill="#cbd5e1" />
          <circle cx="43" cy="38" r="0.8" fill="#cbd5e1" />

          {/* BLADE 1 (Web Service Node) */}
          <g>
            <rect x="8" y="10" width="32" height="12" rx="2" fill="#070420" stroke="#6366f1" strokeWidth="1" />
            {/* Vents */}
            <line x1="12" y1="13" x2="24" y2="13" stroke="#312e81" strokeWidth="1.5" strokeDasharray="1,1" />
            <line x1="12" y1="16" x2="24" y2="16" stroke="#312e81" strokeWidth="1.5" strokeDasharray="1,1" />
            {/* Status LEDs */}
            <circle cx="28" cy="15" r="1" fill="#22c55e" className="led-green" />
            <circle cx="31" cy="15" r="1" fill="#38bdf8" className="led-cyan" />
            <circle cx="34" cy="15" r="1" fill="#fbbf24" className="led-amber" />
            {/* Mini SSD Sockets */}
            <rect x="36" y="12" width="2" height="7" fill="url(#drive-metallic)" rx="0.5" />
          </g>

          {/* BLADE 2 (SSL / App Node) */}
          <g>
            <rect x="8" y="26" width="32" height="12" rx="2" fill="#070420" stroke="#6366f1" strokeWidth="1" />
            {/* Vents */}
            <line x1="12" y1="29" x2="24" y2="29" stroke="#312e81" strokeWidth="1.5" strokeDasharray="1,1" />
            <line x1="12" y1="32" x2="24" y2="32" stroke="#312e81" strokeWidth="1.5" strokeDasharray="1,1" />
            {/* Status LEDs */}
            <circle cx="28" cy="31" r="1" fill="#22c55e" className="led-green-fast" />
            <circle cx="31" cy="31" r="1" fill="#22c55e" />
            <circle cx="34" cy="31" r="1" fill="#38bdf8" className="led-cyan" />
            {/* Mini SSD Sockets */}
            <rect x="36" y="28" width="2" height="7" fill="url(#drive-metallic)" rx="0.5" />
          </g>

          {/* Server Midplane Connector & Air Intake Grill */}
          <rect x="8" y="23" width="32" height="2" fill="#020617" />
          <line x1="10" y1="24" x2="38" y2="24" stroke="#4f46e5" strokeWidth="0.8" opacity="0.5" />
        </svg>
      );

    case 'server_dns':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="dns-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="60%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#1e0036" />
            </linearGradient>
            <filter id="dns-text-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#c084fc" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* DNS Lookup Specialized Server */}
          <rect x="4" y="8" width="40" height="32" rx="4" fill="url(#dns-chassis)" stroke="#c084fc" strokeWidth="1.8" />
          
          {/* Interactive SSH Command Console Output Screen */}
          <rect x="8" y="12" width="32" height="13" rx="2" fill="#0f0720" stroke="#a855f7" strokeWidth="1" />
          <text x="11" y="18.5" fill="#f3e8ff" fontSize="5.5" fontFamily="monospace" fontWeight="bold" filter="url(#dns-text-glow)">BIND9: OK</text>
          <text x="11" y="23.5" fill="#a7f3d0" fontSize="4.5" fontFamily="monospace" opacity="0.9">10.0.0.5:53 UDP</text>

          {/* 3 Hot-Swappable RAID Drive Bays (High-detail) */}
          <g fill="#2e1065" stroke="#a855f7" strokeWidth="0.5">
            <rect x="8" y="29" width="9" height="6" rx="1" />
            <line x1="10" y1="32" x2="15" y2="32" stroke="#d8b4fe" strokeWidth="1" />
            <circle cx="15.5" cy="30.5" r="0.6" fill="#22c55e" className="led-green" />

            <rect x="19.5" y="29" width="9" height="6" rx="1" />
            <line x1="21.5" y1="32" x2="26.5" y2="32" stroke="#d8b4fe" strokeWidth="1" />
            <circle cx="27" cy="30.5" r="0.6" fill="#22c55e" />

            <rect x="31" y="29" width="9" height="6" rx="1" />
            <line x1="33" y1="32" x2="38" y2="32" stroke="#d8b4fe" strokeWidth="1" />
            <circle cx="38.5" cy="30.5" r="0.6" fill="#fbbf24" className="led-amber" />
          </g>

          {/* Unit Air Vents & Diagnostics LED */}
          <circle cx="34" cy="15" r="1" fill="#c084fc" className="led-cyan" />
          <circle cx="37" cy="15" r="1" fill="#22c55e" className="led-green-fast" />
        </svg>
      );

    case 'server_db':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="gold-cylinder" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="30%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="gold-cap" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <filter id="gold-glow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.7"/>
            </filter>
          </defs>
          {/* Shaded Database Cylinders / Platters (Isometric Stacked Storage) */}
          <g>
            {/* Bottom Cylinder Platter */}
            <path d="M 6 26 V 34 C 6 38.5 14 41 24 41 C 34 41 42 38.5 42 34 V 26" fill="url(#gold-cylinder)" stroke="#fbbf24" strokeWidth="1.2" />
            <ellipse cx="24" cy="26" rx="18" ry="5.5" fill="url(#gold-cap)" stroke="#fbbf24" strokeWidth="1.2" />
            
            {/* Middle Cylinder Platter */}
            <path d="M 6 16 V 24 C 6 28.5 14 31 24 31 C 34 31 42 28.5 42 24 V 16" fill="url(#gold-cylinder)" stroke="#fbbf24" strokeWidth="1.2" />
            <ellipse cx="24" cy="16" rx="18" ry="5.5" fill="url(#gold-cap)" stroke="#fbbf24" strokeWidth="1.2" />
            
            {/* Top Cylinder Platter */}
            <path d="M 6 6 V 14 C 6 18.5 14 21 24 21 C 34 21 42 18.5 42 14 V 6" fill="url(#gold-cylinder)" stroke="#fbbf24" strokeWidth="1.2" filter="url(#gold-glow)" />
            <ellipse cx="24" cy="6" rx="18" ry="5.5" fill="url(#gold-cap)" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Database Disk Access Actuator Arms (Realistic visual flair) */}
          <path d="M 8 10 L 15 14" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 8 20 L 15 24" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 8 30 L 15 34" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

          {/* Disk Array Dynamic Read/Write LEDs */}
          <circle cx="15" cy="14" r="1.5" fill="#22c55e" className="led-green-fast" />
          <circle cx="34" cy="14" r="1.5" fill="#ef4444" className="led-red" />
          <circle cx="15" cy="24" r="1.5" fill="#38bdf8" className="led-cyan" />
          <circle cx="15" cy="34" r="1.5" fill="#fbbf24" className="led-amber" />
          <circle cx="34" cy="34" r="1.5" fill="#22c55e" className="led-green" />
        </svg>
      );

    case 'server_vpn':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="vpn-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#01241a" />
            </linearGradient>
            <linearGradient id="brass-lock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <filter id="vpn-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#34d399" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* Secure Cryptographic IPSec/VPN Server */}
          <rect x="4" y="9" width="40" height="30" rx="4" fill="url(#vpn-chassis)" stroke="#10b981" strokeWidth="1.8" />
          
          {/* Security Gate Guard Shackle & Lock (Sleek 3D Metal representation) */}
          <g filter="url(#vpn-glow)">
            {/* Shackle */}
            <path d="M 18 21 V 17 C 18 13.5 30 13.5 30 17 V 21" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
            {/* Lock Body */}
            <rect x="15" y="21" width="18" height="14" rx="3" fill="url(#brass-lock)" stroke="#f59e0b" strokeWidth="1" />
            {/* Keyhole */}
            <circle cx="24" cy="26" r="2" fill="#042f2e" />
            <path d="M 24 28 L 24 32 H 26 L 24 28" fill="#042f2e" />
          </g>

          {/* Encryption Tunnel Activity Lights */}
          <circle cx="9" cy="14" r="1.2" fill="#34d399" className="led-green" />
          <circle cx="13" cy="14" r="1.2" fill="#22d3ee" className="led-cyan" />
          <circle cx="35" cy="14" r="1.2" fill="#34d399" className="led-green-fast" />
          <circle cx="39" cy="14" r="1.2" fill="#34d399" />
          
          {/* Secure Tunnel Flow line */}
          <line x1="8" y1="31" x2="12" y2="31" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="36" y1="31" x2="40" y2="31" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'client_pc':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="monitor-bezel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="screen-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          {/* Curved High-End Bezel-less Monitor */}
          <rect x="3" y="6" width="31" height="23" rx="3.5" fill="url(#monitor-bezel)" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="5" y="8" width="27" height="17" rx="1.5" fill="url(#screen-gloss)" />

          {/* Screen Content Graphics (Simulated high-end IDE/Dashboard) */}
          <rect x="7" y="10" width="12" height="7" rx="0.5" fill="#020617" opacity="0.8" />
          <line x1="9" y1="12" x2="16" y2="12" stroke="#22d3ee" strokeWidth="1" />
          <line x1="9" y1="14" x2="14" y2="14" stroke="#34d399" strokeWidth="1" />
          
          <path d="M 21 21 L 24 16 L 27 19 L 30 14" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="30" cy="14" r="0.8" fill="#ef4444" />

          {/* Sleek Aluminum Column Monitor Stand */}
          <path d="M 17 29 L 14 36 H 23 L 20 29" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Vertical Enterprise Micro-ATX Desktop Tower (placed side-car style) */}
          <rect x="36" y="10" width="9" height="26" rx="2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
          
          {/* Computer Tower Front-Panel Styling */}
          <rect x="38" y="12" width="5" height="3" fill="#1e293b" rx="0.5" />
          <circle cx="40.5" cy="13.5" r="0.6" fill="#38bdf8" className="led-cyan" />
          
          {/* Vents & Fan intakes */}
          <line x1="38" y1="18" x2="43" y2="18" stroke="#334155" strokeWidth="1" />
          <line x1="38" y1="21" x2="43" y2="21" stroke="#334155" strokeWidth="1" />
          <line x1="38" y1="24" x2="43" y2="24" stroke="#334155" strokeWidth="1" />
          
          {/* Tower active power LED */}
          <circle cx="40.5" cy="31" r="1" fill="#22c55e" className="led-green" />
        </svg>
      );

    case 'client_laptop':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="lat-aluminum" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          {/* Laptop Screen Bezel */}
          <rect x="8" y="7" width="32" height="22" rx="2.5" fill="#0f172a" stroke="url(#lat-aluminum)" strokeWidth="1.5" />
          {/* Laptop Screen Content (Modern system visual) */}
          <rect x="10" y="9" width="28" height="18" rx="1" fill="#1e293b" />
          
          {/* Screen graphics details */}
          <circle cx="24" cy="18" r="4.5" fill="none" stroke="#2dd4bf" strokeWidth="1" />
          <path d="M 21 18 H 27 M 24 15 V 21" stroke="#5eead4" strokeWidth="0.8" />
          <line x1="12" y1="12" x2="16" y2="12" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="35" cy="12" r="0.8" fill="#4ade80" className="led-green" />

          {/* Sturdy Bottom Keyboard Base (Isometric projection) */}
          <path d="M 3 34 L 7 29 H 41 L 45 34 C 45 36 42 37.5 39 37.5 H 9 C 6 37.5 3 36 3 34 Z" fill="url(#lat-aluminum)" stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Keyboard Chiclet Area grid */}
          <rect x="10" y="30.5" width="28" height="3" fill="#334155" rx="0.5" />
          <line x1="13" y1="32" x2="35" y2="32" stroke="#64748b" strokeWidth="0.8" strokeDasharray="1,1" />

          {/* Integrated Trackpad */}
          <rect x="20" y="34.5" width="8" height="2.5" rx="0.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        </svg>
      );

    case 'client_mobile':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="phone-shell" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
            <linearGradient id="screen-color" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Bezel-less Premium Smartphone */}
          <rect x="13" y="4" width="22" height="40" rx="4.5" fill="url(#phone-shell)" stroke="#e2e8f0" strokeWidth="1.8" />
          <rect x="15" y="6" width="18" height="36" rx="3" fill="url(#screen-color)" />

          {/* Dynamic Speaker Notch / Camera island */}
          <rect x="20" y="7" width="8" height="1.5" rx="0.75" fill="#090d16" />
          <circle cx="21" cy="7.7" r="0.4" fill="#38bdf8" />

          {/* Dynamic UI Dashboard Display */}
          <g>
            {/* Top Stat Widget */}
            <rect x="17" y="11" width="14" height="6" rx="1" fill="#1e1b4b" stroke="#312e81" strokeWidth="0.5" />
            <circle cx="20" cy="14" r="1.2" fill="#34d399" className="led-green" />
            <line x1="23" y1="14" x2="28" y2="14" stroke="#a7f3d0" strokeWidth="0.8" />

            {/* Grid Icon 1 */}
            <rect x="17" y="19" width="5" height="5" rx="1" fill="#3b82f6" opacity="0.9" />
            <circle cx="19.5" cy="21.5" r="1" fill="#ffffff" />

            {/* Grid Icon 2 */}
            <rect x="26" y="19" width="5" height="5" rx="1" fill="#10b981" opacity="0.9" />
            <rect x="27.5" y="20.5" width="2" height="2" fill="#ffffff" />

            {/* Grid Icon 3 */}
            <rect x="17" y="26" width="5" height="5" rx="1" fill="#f59e0b" opacity="0.9" />
            
            {/* Grid Icon 4 */}
            <rect x="26" y="26" width="5" height="5" rx="1" fill="#ec4899" opacity="0.9" />
          </g>

          {/* iOS-style Swipe-to-Home Indicator Bar */}
          <line x1="19" y1="40" x2="29" y2="40" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'client_printer':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Rear High-Volume Paper Feed Loading Tray */}
          <rect x="13" y="5" width="22" height="11" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="17" y1="9" x2="31" y2="9" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="17" y1="12" x2="28" y2="12" stroke="#e2e8f0" strokeWidth="1" />

          {/* Heavy Duty Multi-Function Office Printer Chassis */}
          <rect x="6" y="14" width="36" height="20" rx="4" fill="#334155" stroke="#cbd5e1" strokeWidth="1.8" />
          
          {/* LCD Touch-Control Diagnostic Screen Panel */}
          <rect x="10" y="17" width="9" height="5" rx="0.5" fill="#020617" stroke="#38bdf8" strokeWidth="0.6" />
          <circle cx="12" cy="19.5" r="0.8" fill="#38bdf8" className="led-cyan" />
          <line x1="14" y1="19.5" x2="17" y2="19.5" stroke="#ffffff" strokeWidth="0.6" />

          {/* Action buttons (Green Copy, Red Stop) */}
          <circle cx="34" cy="19.5" r="1.2" fill="#22c55e" />
          <circle cx="38" cy="19.5" r="1.2" fill="#ef4444" />

          {/* Paper Output Slot with Emerging Printed Report */}
          <rect x="10" y="26" width="28" height="15" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Emerging Document Graphical Details (Simulated Charts) */}
          <line x1="13" y1="30" x2="26" y2="30" stroke="#475569" strokeWidth="1" />
          <line x1="13" y1="33" x2="29" y2="33" stroke="#475569" strokeWidth="1" />
          
          {/* Dynamic miniature bar-chart printed graphics */}
          <rect x="13" y="36" width="3" height="3" fill="#3b82f6" />
          <rect x="17" y="35" width="3" height="4" fill="#10b981" />
          <rect x="21" y="37" width="3" height="2" fill="#f59e0b" />
          <line x1="26" y1="37" x2="33" y2="37" stroke="#3b82f6" strokeWidth="1.2" />
        </svg>
      );

    case 'ids_ips':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="ids-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="ids-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#818cf8" floodOpacity="0.8"/>
            </filter>
          </defs>
          <rect x="4" y="9" width="40" height="30" rx="4" fill="url(#ids-case)" stroke="#818cf8" strokeWidth="1.8" />
          {/* Radar Scanner display */}
          <circle cx="24" cy="24" r="10" fill="#030712" stroke="#6366f1" strokeWidth="1.2" />
          <circle cx="24" cy="24" r="6" fill="none" stroke="#4338ca" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1="24" y1="14" x2="24" y2="34" stroke="#4338ca" strokeWidth="0.6" />
          <line x1="14" y1="24" x2="34" y2="24" stroke="#4338ca" strokeWidth="0.6" />
          {/* Rotating radar sweep ray */}
          <g className="spin-slow">
            <line x1="24" y1="24" x2="31" y2="17" stroke="#38bdf8" strokeWidth="1.5" filter="url(#ids-glow)" />
            <circle cx="29" cy="19" r="1.5" fill="#f43f5e" className="led-red" />
          </g>
          {/* LED activity */}
          <circle cx="8" cy="14" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="12" cy="14" r="1.2" fill="#818cf8" className="led-cyan" />
          <circle cx="36" cy="14" r="1.2" fill="#ef4444" className="led-red" />
          <circle cx="40" cy="14" r="1.2" fill="#22c55e" className="led-green-fast" />
        </svg>
      );

    case 'load_balancer':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="lb-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#115e59" />
              <stop offset="100%" stopColor="#042f2e" />
            </linearGradient>
          </defs>
          <rect x="4" y="9" width="40" height="30" rx="4" fill="url(#lb-chassis)" stroke="#2dd4bf" strokeWidth="1.8" />
          {/* Traffic branching arrows / distribution diagram */}
          <path d="M 12 24 H 20 M 20 24 L 28 17 H 34 M 20 24 L 28 31 H 34 M 20 24 H 34" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="24" r="2.5" fill="#2dd4bf" />
          <circle cx="34" cy="17" r="2" fill="#14b8a6" />
          <circle cx="34" cy="24" r="2" fill="#14b8a6" />
          <circle cx="34" cy="31" r="2" fill="#14b8a6" />
          {/* Status LEDs */}
          <circle cx="8" cy="14" r="1.2" fill="#2dd4bf" className="led-cyan" />
          <circle cx="40" cy="14" r="1.2" fill="#22c55e" className="led-green" />
        </svg>
      );

    case 'server_mail':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="mail-srv" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="50%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#431407" />
            </linearGradient>
          </defs>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="url(#mail-srv)" stroke="#fb923c" strokeWidth="1.8" />
          {/* Envelope with @ symbol */}
          <rect x="13" y="15" width="22" height="16" rx="2" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.2" />
          <path d="M 13 16 L 24 24 L 35 16" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="24" cy="24" r="1" fill="#ea580c" />
          {/* LED ports */}
          <circle cx="8" cy="13" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="12" cy="13" r="1.2" fill="#fbbf24" className="led-amber" />
          <circle cx="36" cy="13" r="1.2" fill="#38bdf8" className="led-cyan" />
          <circle cx="40" cy="13" r="1.2" fill="#22c55e" className="led-green-fast" />
        </svg>
      );

    case 'server_nas':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="nas-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* NAS Tower Enclosure */}
          <rect x="8" y="6" width="32" height="36" rx="4" fill="url(#nas-chassis)" stroke="#94a3b8" strokeWidth="1.8" />
          {/* 4 HDD Drive Bays */}
          <rect x="12" y="10" width="24" height="6" rx="1" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="32" cy="13" r="1" fill="#22c55e" className="led-green" />
          <line x1="15" y1="13" x2="28" y2="13" stroke="#475569" strokeWidth="1" />

          <rect x="12" y="18" width="24" height="6" rx="1" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="32" cy="21" r="1" fill="#22c55e" className="led-green-fast" />
          <line x1="15" y1="21" x2="28" y2="21" stroke="#475569" strokeWidth="1" />

          <rect x="12" y="26" width="24" height="6" rx="1" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="32" cy="29" r="1" fill="#22c55e" className="led-green" />
          <line x1="15" y1="29" x2="28" y2="29" stroke="#475569" strokeWidth="1" />

          <rect x="12" y="34" width="24" height="5" rx="1" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="32" cy="36.5" r="1" fill="#38bdf8" className="led-cyan" />
          <line x1="15" y1="36.5" x2="28" y2="36.5" stroke="#475569" strokeWidth="1" />
        </svg>
      );

    case 'client_pos':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Angled Touch POS Terminal */}
          <path d="M 10 10 L 38 10 L 35 28 L 13 28 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="14" y="12" width="20" height="13" fill="#1e293b" rx="0.5" />
          <line x1="16" y1="15" x2="24" y2="15" stroke="#38bdf8" strokeWidth="1" />
          <line x1="16" y1="18" x2="28" y2="18" stroke="#34d399" strokeWidth="1" />
          <text x="16" y="23" fill="#fbbf24" fontSize="4" fontFamily="monospace" fontWeight="bold">TOTAL $</text>
          {/* Heavy Base & Card Reader */}
          <rect x="8" y="28" width="32" height="12" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="28" y="31" width="10" height="2" fill="#020617" />
          <rect x="11" y="32" width="14" height="5" rx="1" fill="#020617" />
          <circle cx="14" cy="34.5" r="1" fill="#22c55e" className="led-green" />
          <circle cx="18" cy="34.5" r="1" fill="#ef4444" />
          <circle cx="22" cy="34.5" r="1" fill="#eab308" />
        </svg>
      );

    case 'iot_sensor':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <radialGradient id="iot-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#iot-glow)" />
          {/* Smart puck enclosure */}
          <circle cx="24" cy="24" r="15" fill="#0f172a" stroke="#10b981" strokeWidth="1.8" />
          {/* Antenna / RF signal rings */}
          <circle cx="24" cy="24" r="10" fill="none" stroke="#34d399" strokeWidth="0.8" strokeDasharray="3,3" />
          <circle cx="24" cy="24" r="6" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
          <circle cx="24" cy="24" r="2.5" fill="#34d399" className="led-green-fast" />
          {/* Sensor probe / nodes */}
          <circle cx="24" cy="7" r="2" fill="#10b981" />
          <line x1="24" y1="9" x2="24" y2="12" stroke="#10b981" strokeWidth="1.2" />
        </svg>
      );

    case 'iot_camera':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="iot-cam-lens" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          {/* Dome Wall Mount */}
          <path d="M 12 12 H 22 V 16 H 12 Z" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <path d="M 18 16 V 22" stroke="#64748b" strokeWidth="2.5" />
          {/* Camera Dome / Body */}
          <path d="M 16 22 L 36 17 L 38 31 L 18 36 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="37" cy="24" r="7" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="37" cy="24" r="4.5" fill="url(#iot-cam-lens)" />
          <circle cx="38" cy="23" r="1.5" fill="#ffffff" />
          {/* IR Nightvision LEDs */}
          <circle cx="33" cy="24" r="0.8" fill="#ef4444" className="led-red" />
          <circle cx="37" cy="20" r="0.8" fill="#ef4444" className="led-red" />
          <circle cx="41" cy="24" r="0.8" fill="#ef4444" className="led-red" />
          <circle cx="37" cy="28" r="0.8" fill="#ef4444" className="led-red" />
          {/* WiFi Indicator */}
          <path d="M 22 25 Q 24 23 26 25" stroke="#38bdf8" strokeWidth="1" fill="none" />
        </svg>
      );

    case 'iot_thermostat':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <radialGradient id="thermo-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="80%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          {/* Outer Ring Dial */}
          <circle cx="24" cy="24" r="18" fill="url(#thermo-grad)" stroke="#f97316" strokeWidth="2" />
          <circle cx="24" cy="24" r="14" fill="#020617" stroke="#fdba74" strokeWidth="0.8" />
          {/* Temperature Display */}
          <text x="24" y="27" fill="#fdba74" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">21.5°</text>
          {/* Heat Wave Arc */}
          <path d="M 12 24 A 12 12 0 0 1 36 24" stroke="#f97316" strokeWidth="2.5" strokeDasharray="3,2" fill="none" />
          <circle cx="24" cy="10" r="1.5" fill="#f97316" className="led-amber" />
        </svg>
      );

    case 'iot_smartlock':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Smart Lock Escutcheon Plate */}
          <rect x="14" y="8" width="20" height="34" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.8" />
          {/* Keypad Digits */}
          <rect x="17" y="12" width="14" height="10" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.8" />
          <circle cx="20" cy="15" r="0.9" fill="#94a3b8" />
          <circle cx="24" cy="15" r="0.9" fill="#94a3b8" />
          <circle cx="28" cy="15" r="0.9" fill="#94a3b8" />
          <circle cx="20" cy="19" r="0.9" fill="#94a3b8" />
          <circle cx="24" cy="19" r="0.9" fill="#94a3b8" />
          <circle cx="28" cy="19" r="0.9" fill="#94a3b8" />
          {/* RFID / Fingerprint Scanner */}
          <circle cx="24" cy="27" r="3.5" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
          <circle cx="24" cy="27" r="1.2" fill="#34d399" className="led-green" />
          {/* Door Handle Cylinder */}
          <rect x="22" y="34" width="4" height="5" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );

    case 'iot_light':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <radialGradient id="light-glow" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Glow Halo */}
          <circle cx="24" cy="20" r="16" fill="url(#light-glow)" opacity="0.85" />
          {/* Glass Bulb Dome */}
          <path d="M 16 20 C 16 12 32 12 32 20 C 32 25 28 27 28 32 H 20 C 20 27 16 25 16 20 Z" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />
          {/* Filament */}
          <path d="M 22 24 L 24 18 L 26 24" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Base screw thread */}
          <rect x="20" y="32" width="8" height="2" fill="#64748b" />
          <rect x="21" y="34" width="6" height="2" fill="#475569" />
          <rect x="22" y="36" width="4" height="2" rx="1" fill="#334155" />
          {/* Wireless Zigbee Radiance */}
          <circle cx="24" cy="20" r="1" fill="#ffffff" className="led-amber" />
        </svg>
      );

    case 'iot_plc':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Industrial DIN Rail Enclosure */}
          <rect x="6" y="8" width="36" height="32" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.8" />
          {/* Top Screw Terminal Blocks */}
          <rect x="8" y="10" width="32" height="5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
          <circle cx="12" cy="12.5" r="1.2" fill="#94a3b8" />
          <circle cx="18" cy="12.5" r="1.2" fill="#94a3b8" />
          <circle cx="24" cy="12.5" r="1.2" fill="#94a3b8" />
          <circle cx="30" cy="12.5" r="1.2" fill="#94a3b8" />
          <circle cx="36" cy="12.5" r="1.2" fill="#94a3b8" />
          {/* RUN/STOP/FAULT Matrix */}
          <rect x="9" y="18" width="16" height="12" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.8" />
          <text x="11" y="24" fill="#22c55e" fontSize="4" fontWeight="bold" fontFamily="monospace">RUN</text>
          <circle cx="21" cy="22.5" r="1.2" fill="#22c55e" className="led-green-fast" />
          <text x="11" y="28" fill="#94a3b8" fontSize="3.5" fontFamily="monospace">ERR</text>
          <circle cx="21" cy="27" r="1" fill="#ef4444" />
          {/* Modbus RS-485 / Profinet Port */}
          <rect x="28" y="18" width="11" height="12" rx="1" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" />
          <text x="29.5" y="25" fill="#38bdf8" fontSize="3.2" fontWeight="bold" fontFamily="monospace">RJ45</text>
          {/* Bottom I/O Terminals */}
          <rect x="8" y="33" width="32" height="5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
          <circle cx="12" cy="35.5" r="1.2" fill="#94a3b8" />
          <circle cx="18" cy="35.5" r="1.2" fill="#94a3b8" />
          <circle cx="24" cy="35.5" r="1.2" fill="#94a3b8" />
          <circle cx="30" cy="35.5" r="1.2" fill="#94a3b8" />
          <circle cx="36" cy="35.5" r="1.2" fill="#94a3b8" />
        </svg>
      );

    case 'iot_gateway':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* LoRa/Zigbee Edge Gateway Chassis */}
          <rect x="8" y="16" width="32" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.8" />
          {/* Dual External Antennas */}
          <line x1="12" y1="16" x2="10" y2="6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="6" r="1.5" fill="#22d3ee" />
          <line x1="36" y1="16" x2="38" y2="6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="38" cy="6" r="1.5" fill="#22d3ee" />
          {/* Status LEDs Array */}
          <circle cx="14" cy="26" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="18" cy="26" r="1.2" fill="#06b6d4" className="led-cyan" />
          <circle cx="22" cy="26" r="1.2" fill="#f59e0b" className="led-amber" />
          {/* Wireless Hub Logo */}
          <circle cx="30" cy="26" r="4" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="30" cy="26" r="1.5" fill="#38bdf8" />
          {/* Ethernet Uplink Base */}
          <rect x="18" y="36" width="12" height="3" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
        </svg>
      );

    case 'iot_smart_meter':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Round Smart Electric Meter Housing */}
          <circle cx="24" cy="24" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          <circle cx="24" cy="24" r="14" fill="#020617" stroke="#334155" strokeWidth="1" />
          {/* Digital kWh LCD Display */}
          <rect x="14" y="16" width="20" height="9" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" rx="1" />
          <text x="16" y="23" fill="#34d399" fontSize="5.5" fontWeight="bold" fontFamily="monospace">04821</text>
          <text x="30" y="21" fill="#10b981" fontSize="3" fontFamily="sans-serif">kWh</text>
          {/* Pulse LED (1000 imp/kWh) */}
          <circle cx="18" cy="30" r="1.5" fill="#ef4444" className="led-red" />
          <text x="21" y="31" fill="#94a3b8" fontSize="3" fontFamily="monospace">PULSE</text>
        </svg>
      );

    case 'iot_speaker':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Cylindrical Smart Speaker */}
          <ellipse cx="24" cy="12" rx="12" ry="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
          <path d="M 12 12 V 32 C 12 36 36 36 36 32 V 12 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          {/* Mesh Texture Lines */}
          <line x1="14" y1="18" x2="34" y2="18" stroke="#1e293b" strokeWidth="1" />
          <line x1="13" y1="22" x2="35" y2="22" stroke="#1e293b" strokeWidth="1" />
          <line x1="13" y1="26" x2="35" y2="26" stroke="#1e293b" strokeWidth="1" />
          {/* Glowing Top Voice Assistant Ring */}
          <ellipse cx="24" cy="12" rx="9" ry="2.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="24" cy="12" r="1.5" fill="#38bdf8" className="led-cyan" />
        </svg>
      );

    case 'hacker':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="atk-box-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c0519" />
              <stop offset="60%" stopColor="#881337" />
              <stop offset="100%" stopColor="#18000a" />
            </linearGradient>
            <filter id="hacker-text" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f43f5e" floodOpacity="0.9"/>
            </filter>
          </defs>
          {/* Rogue Hacker Terminal Machine (Crimson design) */}
          <rect x="4" y="6" width="40" height="28" rx="4" fill="url(#atk-box-grad)" stroke="#ef4444" strokeWidth="1.8" />
          
          {/* Malicious Terminal Screen (Green-Pink Contrast) */}
          <rect x="7" y="9" width="34" height="22" rx="2" fill="#090003" stroke="#f43f5e" strokeWidth="0.8" />
          
          <text x="10" y="16" fill="#f43f5e" fontSize="5.5" fontFamily="monospace" fontWeight="bold" filter="url(#hacker-text)">&gt;_ ROOT@EXPLOIT</text>
          <text x="10" y="22" fill="#4ade80" fontSize="5" fontFamily="monospace" className="led-green">&gt;_ SHELL_SPAWNED</text>
          <text x="10" y="27" fill="#fb7185" fontSize="4.5" fontFamily="monospace" opacity="0.9">&gt;_ flood.pcap 99%</text>

          {/* Rogue Shaded Skull Silhouette Overlay */}
          <path d="M 24 32 C 19 32 17 38 17 41 H 31 C 31 38 29 32 24 32 Z" fill="#9f1239" stroke="#fda4af" strokeWidth="1.2" />
          <circle cx="21" cy="36.5" r="1.5" fill="#090003" />
          <circle cx="27" cy="36.5" r="1.5" fill="#090003" />
          <path d="M 23 39 H 25" stroke="#fda4af" strokeWidth="1" />
        </svg>
      );

    case 'hacker_botnet':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <radialGradient id="botnet-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="21" fill="url(#botnet-glow)" />
          {/* Main Botnet Controller Hub */}
          <rect x="6" y="8" width="36" height="32" rx="4" fill="#180004" stroke="#dc2626" strokeWidth="2" />
          {/* Zombie Nodes Matrix (Multi-core flood generator) */}
          <circle cx="14" cy="16" r="3" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
          <circle cx="14" cy="16" r="1" fill="#fca5a5" className="led-red" />
          <circle cx="34" cy="16" r="3" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
          <circle cx="34" cy="16" r="1" fill="#fca5a5" className="led-red" />
          <circle cx="14" cy="32" r="3" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
          <circle cx="14" cy="32" r="1" fill="#fca5a5" className="led-red" />
          <circle cx="34" cy="32" r="3" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
          <circle cx="34" cy="32" r="1" fill="#fca5a5" className="led-red" />
          {/* Central Attack Core */}
          <circle cx="24" cy="24" r="5" fill="#450a0a" stroke="#f87171" strokeWidth="1.5" />
          <text x="24" y="26" fill="#fca5a5" fontSize="4.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">DDOS</text>
          {/* Syn-Flood Connection vectors */}
          <line x1="16" y1="18" x2="20" y2="21" stroke="#ef4444" strokeWidth="1.2" />
          <line x1="32" y1="18" x2="28" y2="21" stroke="#ef4444" strokeWidth="1.2" />
          <line x1="16" y1="30" x2="20" y2="27" stroke="#ef4444" strokeWidth="1.2" />
          <line x1="32" y1="30" x2="28" y2="27" stroke="#ef4444" strokeWidth="1.2" />
        </svg>
      );

    case 'hacker_pineapple':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Tactical Rogue Wireless Pineapple (Evil Twin AP) */}
          <rect x="10" y="18" width="28" height="22" rx="3" fill="#090d16" stroke="#f59e0b" strokeWidth="1.8" />
          {/* Quad Antennas */}
          <line x1="13" y1="18" x2="8" y2="6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="18" x2="18" y2="5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="18" x2="30" y2="5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <line x1="35" y1="18" x2="40" y2="6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          {/* Evil WiFi Signal Arcs */}
          <path d="M 17 28 Q 24 22 31 28" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
          <path d="M 20 32 Q 24 28 28 32" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          <circle cx="24" cy="35" r="1.5" fill="#f59e0b" className="led-amber" />
          {/* Pineapple Badge icon */}
          <text x="24" y="25" fill="#fbbf24" fontSize="4.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">🍍 MITM</text>
        </svg>
      );

    case 'hacker_c2':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* C2 Command & Control Stealth Server Rack */}
          <rect x="6" y="8" width="36" height="32" rx="3" fill="#030712" stroke="#8b5cf6" strokeWidth="1.8" />
          {/* Dark Red & Purple Server Blades */}
          <rect x="9" y="12" width="30" height="6" rx="1" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="0.8" />
          <circle cx="13" cy="15" r="1" fill="#c084fc" className="led-cyan" />
          <circle cx="17" cy="15" r="1" fill="#ef4444" className="led-red" />
          <text x="35" y="16.5" fill="#c084fc" fontSize="3.5" fontWeight="bold" fontFamily="monospace">C2-SRV</text>

          <rect x="9" y="21" width="30" height="6" rx="1" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="0.8" />
          <circle cx="13" cy="24" r="1" fill="#a855f7" />
          <circle cx="17" cy="24" r="1" fill="#22c55e" className="led-green" />
          <text x="35" y="25.5" fill="#a855f7" fontSize="3.5" fontWeight="bold" fontFamily="monospace">BEACON</text>

          <rect x="9" y="30" width="30" height="6" rx="1" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="0.8" />
          <circle cx="13" cy="33" r="1" fill="#ec4899" />
          <circle cx="17" cy="33" r="1" fill="#c084fc" />
          <text x="35" y="34.5" fill="#f472b6" fontSize="3.5" fontWeight="bold" fontFamily="monospace">EXPLOIT</text>
        </svg>
      );

    case 'hacker_implant':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Hardware Network Tap / Rogue Implant Device */}
          <rect x="8" y="12" width="32" height="24" rx="2" fill="#0f172a" stroke="#ec4899" strokeWidth="1.8" />
          {/* Dual In-line RJ45 Network Taps */}
          <rect x="12" y="16" width="9" height="7" rx="1" fill="#020617" stroke="#f472b6" strokeWidth="0.8" />
          <rect x="27" y="16" width="9" height="7" rx="1" fill="#020617" stroke="#f472b6" strokeWidth="0.8" />
          {/* Mirror / Sniff TAP Arrow */}
          <path d="M 21 19.5 H 27 M 24 17 V 30" stroke="#ec4899" strokeWidth="1.2" />
          {/* Exfiltration Chip */}
          <rect x="20" y="27" width="8" height="6" rx="1" fill="#831843" stroke="#f472b6" strokeWidth="0.8" />
          <circle cx="24" cy="30" r="1" fill="#fb7185" className="led-red" />
        </svg>
      );

    case 'hacker_stager':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          {/* Exploit & Payload Delivery Stager */}
          <rect x="6" y="8" width="36" height="32" rx="3" fill="#1c1917" stroke="#e11d48" strokeWidth="1.8" />
          {/* Syringe / Zero-Day Injector Graphic */}
          <path d="M 14 34 L 28 20" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 26 18 L 32 12" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          <path d="M 12 36 L 10 38" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
          {/* Payload Biohazard / Exploit Chamber */}
          <circle cx="34" cy="30" r="5" fill="#881337" stroke="#f43f5e" strokeWidth="1" />
          <text x="34" y="32" fill="#fda4af" fontSize="4" fontWeight="bold" fontFamily="monospace" textAnchor="middle">0DAY</text>
          <circle cx="16" cy="14" r="1.5" fill="#f43f5e" className="led-red" />
        </svg>
      );

    case 'waf':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="waf-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="50%" stopColor="#155e75" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <filter id="waf-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#06b6d4" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* WAF Chassis */}
          <rect x="4" y="9" width="40" height="30" rx="4" fill="url(#waf-case)" stroke="#06b6d4" strokeWidth="1.8" />
          {/* Central L7 App Shield */}
          <path d="M 24 14 L 33 18 V 26 C 33 31 24 35 24 35 C 24 35 15 31 15 26 V 18 Z" fill="#0e7490" stroke="#22d3ee" strokeWidth="1.4" filter="url(#waf-glow)" />
          <text x="24" y="26.5" fill="#ffffff" fontSize="4.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">WAF</text>
          {/* HTTP Filtering Beams */}
          <line x1="8" y1="24" x2="14" y2="24" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="1,1" />
          <line x1="34" y1="24" x2="40" y2="24" stroke="#10b981" strokeWidth="1.5" />
          {/* Indicators */}
          <circle cx="8" cy="14" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="12" cy="14" r="1.2" fill="#06b6d4" className="led-cyan" />
          <circle cx="36" cy="14" r="1.2" fill="#10b981" className="led-green-fast" />
          <circle cx="40" cy="14" r="1.2" fill="#06b6d4" />
        </svg>
      );

    case 'honeypot':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="honey-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
            <filter id="honey-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.8"/>
            </filter>
          </defs>
          <rect x="4" y="9" width="40" height="30" rx="4" fill="url(#honey-case)" stroke="#f59e0b" strokeWidth="1.8" />
          {/* Honeycomb Decoy Trap Grid */}
          <path d="M 24 15 L 29 18 V 24 L 24 27 L 19 24 V 18 Z" fill="#b45309" stroke="#fbbf24" strokeWidth="1.2" filter="url(#honey-glow)" />
          <path d="M 15 20 L 19 22.5 V 28 L 15 30.5 L 11 28 V 22.5 Z" fill="#92400e" stroke="#d97706" strokeWidth="0.9" />
          <path d="M 33 20 L 37 22.5 V 28 L 33 30.5 L 29 28 V 22.5 Z" fill="#92400e" stroke="#d97706" strokeWidth="0.9" />
          {/* Alert Sensor & Decoy Beacon */}
          <circle cx="24" cy="21" r="2" fill="#ef4444" className="led-red" />
          <text x="24" y="34.5" fill="#fbbf24" fontSize="3.8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">DECOY</text>
          <circle cx="8" cy="14" r="1.2" fill="#f59e0b" className="led-amber" />
          <circle cx="40" cy="14" r="1.2" fill="#ef4444" className="led-red" />
        </svg>
      );

    case 'siem_soc':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="siem-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="siem-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#818cf8" floodOpacity="0.8"/>
            </filter>
          </defs>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="url(#siem-case)" stroke="#818cf8" strokeWidth="1.8" />
          {/* SOC Multi-Telemetry Monitor Screens */}
          <rect x="8" y="13" width="14" height="10" rx="1.5" fill="#030712" stroke="#6366f1" strokeWidth="1" />
          <path d="M 10 20 L 13 16 L 16 19 L 20 15" stroke="#38bdf8" strokeWidth="1" fill="none" />
          
          <rect x="26" y="13" width="14" height="10" rx="1.5" fill="#030712" stroke="#6366f1" strokeWidth="1" />
          <circle cx="33" cy="18" r="3.5" stroke="#a855f7" strokeWidth="0.8" fill="none" />
          <circle cx="33" cy="18" r="1" fill="#ec4899" className="led-cyan" />

          {/* AI Neural Correlation Node */}
          <line x1="15" y1="28" x2="33" y2="28" stroke="#818cf8" strokeWidth="1.2" strokeDasharray="2,2" />
          <circle cx="15" cy="28" r="1.8" fill="#4f46e5" />
          <circle cx="24" cy="28" r="2.2" fill="#c084fc" filter="url(#siem-glow)" />
          <circle cx="33" cy="28" r="1.8" fill="#4f46e5" />
          <text x="24" y="36.5" fill="#c7d2fe" fontSize="3.8" fontWeight="black" fontFamily="monospace" textAnchor="middle">SOC SIEM</text>
        </svg>
      );

    case 'ddos_scrubber':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="scrub-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <filter id="scrub-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.8"/>
            </filter>
          </defs>
          <rect x="4" y="9" width="40" height="30" rx="4" fill="url(#scrub-case)" stroke="#38bdf8" strokeWidth="1.8" />
          {/* Carrier-Grade Multi-Core Scrubbing Matrix */}
          <rect x="8" y="14" width="32" height="14" rx="2" fill="#020617" stroke="#0284c7" strokeWidth="1" />
          {/* Ingress Volumetric Attack dropping into Clean Egress Stream */}
          <path d="M 12 17 L 17 21 L 12 25" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="16" x2="20" y2="26" stroke="#e0f2fe" strokeWidth="1.2" strokeDasharray="1,1" />
          <path d="M 23 21 H 36 M 33 17 L 37 21 L 33 25" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" filter="url(#scrub-glow)" />
          {/* Rate-Limiting Pulse Indicators */}
          <text x="24" y="35" fill="#38bdf8" fontSize="3.8" fontWeight="black" fontFamily="monospace" textAnchor="middle">400G SCRUB</text>
          <circle cx="8" cy="11.5" r="1" fill="#38bdf8" className="led-cyan" />
          <circle cx="40" cy="11.5" r="1" fill="#10b981" className="led-green" />
        </svg>
      );

    case 'hsm_vault':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <defs>
            <linearGradient id="hsm-case" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="hsm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="hsm-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#fbbf24" floodOpacity="0.8"/>
            </filter>
          </defs>
          {/* Armored Chassis */}
          <rect x="5" y="8" width="38" height="32" rx="3" fill="url(#hsm-case)" stroke="#e2e8f0" strokeWidth="1.8" />
          {/* Cryptographic Secure Enclave Gold Module */}
          <rect x="14" y="14" width="20" height="18" rx="2" fill="url(#hsm-gold)" stroke="#ffffff" strokeWidth="1" filter="url(#hsm-glow)" />
          {/* Key & Lock Emblem */}
          <circle cx="24" cy="21" r="3" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
          <path d="M 24 23 V 28 M 22 28 H 26" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Tamper Sensors & Zeroize Pins */}
          <circle cx="9" cy="14" r="1.2" fill="#22c55e" className="led-green" />
          <circle cx="9" cy="20" r="1.2" fill="#fbbf24" className="led-amber" />
          <circle cx="9" cy="26" r="1.2" fill="#38bdf8" className="led-cyan" />
          <text x="24" y="37" fill="#e2e8f0" fontSize="3.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">FIPS-140 HSM</text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className={`${dimensions} ${className}`}>
          {svgStyle}
          <rect x="6" y="8" width="36" height="24" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.8" />
          <path d="M 18 32 L 15 40 H 33 L 30 32" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
          <circle cx="24" cy="20" r="3" fill="#cbd5e1" />
        </svg>
      );
  }
};
