import React from 'react';
import { DeviceType } from '../types';

interface RealisticDeviceIconProps {
  type: DeviceType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const RealisticDeviceIcon: React.FC<RealisticDeviceIconProps> = ({
  type,
  className = '',
  size = 'md',
  showBadge = false,
}) => {
  const sizeMap = {
    sm: { container: 'w-6 h-6', icon: 'w-4 h-4', badge: 'text-[7px] -bottom-1 -right-1 px-0.5' },
    md: { container: 'w-9 h-9', icon: 'w-6 h-6', badge: 'text-[8.5px] -bottom-1 -right-1 px-1' },
    lg: { container: 'w-12 h-12', icon: 'w-8 h-8', badge: 'text-[9.5px] -bottom-1.5 -right-1 px-1.5' },
    xl: { container: 'w-16 h-16', icon: 'w-11 h-11', badge: 'text-[11px] -bottom-2 -right-1.5 px-2' },
  }[size];

  const renderIconSvg = () => {
    switch (type) {
      // 1. Internet / WAN
      case 'internet':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <defs>
              <radialGradient id="globe-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </radialGradient>
              <filter id="globe-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Outer Orbit Rings */}
            <ellipse cx="24" cy="24" rx="22" ry="7" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" transform="rotate(-25 24 24)" />
            <ellipse cx="24" cy="24" rx="22" ry="7" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" transform="rotate(35 24 24)" />
            {/* Planet Sphere */}
            <circle cx="24" cy="24" r="16" fill="url(#globe-grad)" filter="url(#globe-glow)" stroke="#7dd3fc" strokeWidth="1.2" />
            {/* Lat/Long Grid */}
            <ellipse cx="24" cy="24" rx="8" ry="16" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.7" />
            <line x1="8" y1="24" x2="40" y2="24" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.7" />
            <ellipse cx="24" cy="18" rx="13.8" ry="3.5" stroke="#bae6fd" strokeWidth="0.6" opacity="0.5" />
            <ellipse cx="24" cy="30" rx="13.8" ry="3.5" stroke="#bae6fd" strokeWidth="0.6" opacity="0.5" />
            {/* Pulsing Core Satellite Nodes */}
            <circle cx="10" cy="18" r="2" fill="#fbbf24" stroke="#78350f" strokeWidth="0.5" />
            <circle cx="38" cy="30" r="2" fill="#34d399" stroke="#064e3b" strokeWidth="0.5" />
            <circle cx="24" cy="24" r="3" fill="#ffffff" filter="url(#globe-glow)" />
          </svg>
        );

      // 2. Core Enterprise Router
      case 'router':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Rack Chassis */}
            <rect x="4" y="14" width="40" height="20" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Front Panel Inset */}
            <rect x="7" y="17" width="34" height="14" rx="1.5" fill="#0f172a" />
            {/* Rack Ears */}
            <rect x="2" y="15" width="2" height="18" rx="0.5" fill="#64748b" />
            <rect x="44" y="15" width="2" height="18" rx="0.5" fill="#64748b" />
            <circle cx="3" cy="17" r="0.7" fill="#0f172a" />
            <circle cx="3" cy="31" r="0.7" fill="#0f172a" />
            <circle cx="45" cy="17" r="0.7" fill="#0f172a" />
            <circle cx="45" cy="31" r="0.7" fill="#0f172a" />
            {/* 4x Gigabit RJ45 Ports with LEDs */}
            <rect x="10" y="22" width="4" height="4" rx="0.5" fill="#334155" stroke="#64748b" strokeWidth="0.5" />
            <circle cx="12" cy="20" r="0.8" fill="#22c55e" />
            <rect x="16" y="22" width="4" height="4" rx="0.5" fill="#334155" stroke="#64748b" strokeWidth="0.5" />
            <circle cx="18" cy="20" r="0.8" fill="#22c55e" />
            <rect x="22" y="22" width="4" height="4" rx="0.5" fill="#334155" stroke="#64748b" strokeWidth="0.5" />
            <circle cx="24" cy="20" r="0.8" fill="#eab308" />
            {/* Dual SFP+ Fiber Transceiver Cages */}
            <rect x="28" y="21" width="5" height="5" rx="0.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
            <rect x="34" y="21" width="5" height="5" rx="0.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="30.5" cy="19" r="0.8" fill="#38bdf8" />
            <circle cx="36.5" cy="19" r="0.8" fill="#38bdf8" />
            {/* Router Arrows Symbol On Top */}
            <path d="M16 10L24 6L32 10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 6V12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M32 38L24 42L16 38" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 42V36" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      // 3. Wi-Fi Router
      case 'wifi_router':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* 4 External Articulated Antennas */}
            <line x1="10" y1="20" x2="6" y2="4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="20" x2="16" y2="3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="20" x2="32" y2="3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="20" x2="42" y2="4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            {/* Wi-Fi Waves emanating from central antenna */}
            <path d="M20 7C22.5 5.5 25.5 5.5 28 7" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M17 4C21.5 1.5 26.5 1.5 31 4" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            {/* Router Body */}
            <rect x="6" y="20" width="36" height="18" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            {/* Glowing Center LED Bar */}
            <rect x="12" y="25" width="24" height="2" rx="1" fill="#38bdf8" />
            {/* Status Indicator Array */}
            <circle cx="14" cy="32" r="1.2" fill="#22c55e" />
            <circle cx="19" cy="32" r="1.2" fill="#22c55e" />
            <circle cx="24" cy="32" r="1.2" fill="#38bdf8" />
            <circle cx="29" cy="32" r="1.2" fill="#22c55e" />
            <circle cx="34" cy="32" r="1.2" fill="#fbbf24" />
          </svg>
        );

      // 4. Next-Gen Firewall (NGFW)
      case 'firewall':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Rugged Crimson Chassis */}
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#881337" stroke="#e11d48" strokeWidth="1.5" />
            <rect x="8" y="16" width="32" height="16" rx="2" fill="#4c0519" />
            {/* Brick pattern / Shield */}
            <path d="M24 16V32" stroke="#be123c" strokeWidth="1" />
            <path d="M8 21H40" stroke="#be123c" strokeWidth="1" />
            <path d="M8 27H40" stroke="#be123c" strokeWidth="1" />
            <path d="M16 16V21M32 16V21M12 21V27M28 21V27M16 27V32M32 27V32" stroke="#be123c" strokeWidth="1" />
            {/* Glowing Golden Security Shield */}
            <path
              d="M24 17L31 20V26C31 29.5 28 32 24 33.5C20 32 17 29.5 17 26V20L24 17Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1"
            />
            {/* Keyhole / Lock */}
            <circle cx="24" cy="24" r="1.8" fill="#78350f" />
            <path d="M23 25H25L25.5 28H22.5L23 25Z" fill="#78350f" />
            {/* Dual Red Power LEDs */}
            <circle cx="37" cy="15" r="1" fill="#22c55e" />
            <circle cx="37" cy="33" r="1" fill="#22c55e" />
          </svg>
        );

      // 5. IDS / IPS Sensor
      case 'ids_ips':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            {/* Oscilloscope Deep Packet Inspection Screen */}
            <rect x="8" y="15" width="24" height="18" rx="2" fill="#032b44" stroke="#0369a1" strokeWidth="1" />
            {/* Waveform Trace */}
            <path
              d="M9 24H14L16 18L18 30L20 21L22 26L24 24H31"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Radar Sweep Reticle */}
            <circle cx="37" cy="20" r="4" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 1" />
            <circle cx="37" cy="20" r="1" fill="#f43f5e" />
            {/* Alert Beacon */}
            <rect x="34" y="27" width="6" height="5" rx="1" fill="#e11d48" stroke="#fda4af" strokeWidth="0.5" />
            <circle cx="37" cy="29.5" r="1" fill="#fff" />
          </svg>
        );

      // 6. WAF (Web App Firewall)
      case 'waf':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
            <rect x="8" y="16" width="32" height="16" rx="2" fill="#1e1b4b" />
            {/* Layer 7 Shield */}
            <path
              d="M24 16L32 19V25C32 29.5 28.5 32 24 33.5C19.5 32 16 29.5 16 25V19L24 16Z"
              fill="#9333ea"
              stroke="#c084fc"
              strokeWidth="1"
            />
            <text x="24" y="27" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              L7
            </text>
            {/* SSL Acceleration Bars */}
            <rect x="10" y="20" width="3" height="8" rx="0.5" fill="#a855f7" />
            <rect x="35" y="20" width="3" height="8" rx="0.5" fill="#a855f7" />
          </svg>
        );

      // 7. Honeypot Decoy
      case 'honeypot':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Honeycomb Trap Array */}
            <path d="M24 17L28 19.5V24.5L24 27L20 24.5V19.5L24 17Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <path d="M16 22L20 24.5V29.5L16 32L12 29.5V24.5L16 22Z" fill="#d97706" opacity="0.8" stroke="#b45309" strokeWidth="1" />
            <path d="M32 22L36 24.5V29.5L32 32L28 29.5V24.5L32 22Z" fill="#d97706" opacity="0.8" stroke="#b45309" strokeWidth="1" />
            {/* Decoy Sensor Tripwire */}
            <circle cx="24" cy="22" r="1.5" fill="#ef4444" />
            <line x1="12" y1="16" x2="36" y2="16" stroke="#fef3c7" strokeWidth="0.8" strokeDasharray="2 2" />
          </svg>
        );

      // 8. SIEM & SOC Center
      case 'siem_soc':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="10" width="40" height="28" rx="3" fill="#09090b" stroke="#06b6d4" strokeWidth="1.5" />
            {/* Quad SOC Screen Panels */}
            <rect x="7" y="13" width="15" height="10" rx="1" fill="#082f49" stroke="#0284c7" strokeWidth="0.8" />
            <path d="M8 20L11 16L14 19L17 14L20 18" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
            <rect x="25" y="13" width="15" height="10" rx="1" fill="#082f49" stroke="#0284c7" strokeWidth="0.8" />
            <circle cx="32.5" cy="18" r="3.5" stroke="#38bdf8" strokeWidth="0.6" />
            <line x1="32.5" y1="18" x2="35" y2="16" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" />
            <rect x="7" y="25" width="33" height="10" rx="1" fill="#042f2e" stroke="#0f766e" strokeWidth="0.8" />
            <line x1="9" y1="28" x2="28" y2="28" stroke="#2dd4bf" strokeWidth="1" strokeLinecap="round" />
            <line x1="9" y1="31" x2="36" y2="31" stroke="#2dd4bf" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          </svg>
        );

      // 9. Anti-DDoS Scrubber
      case 'ddos_scrubber':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Cryogenic Cooling Fins */}
            <line x1="8" y1="16" x2="8" y2="32" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="12" y1="16" x2="12" y2="32" stroke="#0284c7" strokeWidth="1.5" />
            {/* Mitigation Cyclone Tube */}
            <circle cx="28" cy="24" r="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
            <path d="M28 18C31 20 31 28 28 30C25 28 25 20 28 18Z" fill="#38bdf8" opacity="0.7" />
            <circle cx="28" cy="24" r="2" fill="#ffffff" />
            <circle cx="41" cy="17" r="1.2" fill="#22c55e" />
            <circle cx="41" cy="24" r="1.2" fill="#22c55e" />
            <circle cx="41" cy="31" r="1.2" fill="#38bdf8" />
          </svg>
        );

      // 10. HSM Vault (Hardware Security Module)
      case 'hsm_vault':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Brushed Titanium Vault */}
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="7" y="15" width="34" height="18" rx="2" fill="#1e293b" />
            {/* Dual Key Tumblers */}
            <circle cx="15" cy="24" r="4.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="15" cy="24" r="1.5" fill="#0f172a" />
            <line x1="15" y1="24" x2="15" y2="28" stroke="#0f172a" strokeWidth="1" />
            <circle cx="33" cy="24" r="4.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="33" cy="24" r="1.5" fill="#0f172a" />
            <line x1="33" y1="24" x2="33" y2="28" stroke="#0f172a" strokeWidth="1" />
            {/* Gold FIPS 140-3 Cryptographic Seal */}
            <circle cx="24" cy="24" r="5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            <path d="M22 24L23.5 25.5L26 22.5" stroke="#713f12" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      // 11. Load Balancer
      case 'load_balancer':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Ingress traffic arrow */}
            <path d="M8 24H16M16 24L13 21M16 24L13 27" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
            {/* Dynamic load distribution branches */}
            <circle cx="22" cy="24" r="2.5" fill="#3b82f6" />
            <path d="M24 23L36 17M36 17L33 16M36 17L35 20" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M24.5 24H38M38 24L35 22M38 24L35 26" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M24 25L36 31M36 31L35 28M36 31L33 32" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
            {/* VIP Status lights */}
            <circle cx="41" cy="17" r="1.2" fill="#22c55e" />
            <circle cx="41" cy="24" r="1.2" fill="#22c55e" />
            <circle cx="41" cy="31" r="1.2" fill="#22c55e" />
          </svg>
        );

      // 12. Managed L2 Switch (24 Ports)
      case 'switch':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* 1U Switch Chassis */}
            <rect x="3" y="16" width="42" height="16" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <rect x="6" y="19" width="36" height="10" rx="1" fill="#020617" />
            {/* Rack Ears */}
            <rect x="1" y="17" width="2" height="14" rx="0.5" fill="#64748b" />
            <rect x="45" y="17" width="2" height="14" rx="0.5" fill="#64748b" />
            {/* Dual Row RJ45 Port Matrix with Activity LEDs */}
            {[8, 12, 16, 20, 24, 28].map((x, i) => (
              <g key={`port-top-${i}`}>
                <rect x={x} y="20.5" width="2.8" height="3" rx="0.4" fill="#334155" stroke="#64748b" strokeWidth="0.4" />
                <circle cx={x + 1.4} cy="19.7" r="0.5" fill={i % 2 === 0 ? '#22c55e' : '#eab308'} />
              </g>
            ))}
            {[8, 12, 16, 20, 24, 28].map((x, i) => (
              <g key={`port-bot-${i}`}>
                <rect x={x} y="24.5" width="2.8" height="3" rx="0.4" fill="#334155" stroke="#64748b" strokeWidth="0.4" />
                <circle cx={x + 1.4} cy="28.2" r="0.5" fill={i % 3 === 0 ? '#22c55e' : '#38bdf8'} />
              </g>
            ))}
            {/* Dual SFP+ Fiber Ports */}
            <rect x="34" y="21" width="3.5" height="6" rx="0.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
            <rect x="38.5" y="21" width="3.5" height="6" rx="0.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
          </svg>
        );

      // 13. Layer 3 Multilayer Switch
      case 'l3_switch':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="3" y="14" width="42" height="20" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
            <rect x="6" y="17" width="36" height="14" rx="1" fill="#0f172a" />
            {/* Routing Matrix Cross Bus */}
            <path d="M10 20H24M24 20L21 18M24 20L21 22" stroke="#818cf8" strokeWidth="1" strokeLinecap="round" />
            <path d="M24 28H10M10 28L13 26M10 28L13 30" stroke="#818cf8" strokeWidth="1" strokeLinecap="round" />
            {/* 4x 100G QSFP28 Fiber Ports */}
            <rect x="28" y="19" width="5" height="4" rx="0.5" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="0.5" />
            <rect x="35" y="19" width="5" height="4" rx="0.5" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="0.5" />
            <rect x="28" y="25" width="5" height="4" rx="0.5" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="0.5" />
            <rect x="35" y="25" width="5" height="4" rx="0.5" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="0.5" />
          </svg>
        );

      // 14. Wi-Fi Access Point (Ceiling Dome)
      case 'wifi_ap':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Concentric RF Radio Waves */}
            <circle cx="24" cy="24" r="21" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
            <circle cx="24" cy="24" r="16" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            {/* Clean White Saucer Dome AP */}
            <circle cx="24" cy="24" r="11" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
            <circle cx="24" cy="24" r="9" fill="#e2e8f0" />
            {/* Glowing Blue Status Ring */}
            <circle cx="24" cy="24" r="4.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="24" cy="24" r="2" fill="#ffffff" />
          </svg>
        );

      // 15. Web Server
      case 'server_web':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="10" width="38" height="28" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            {/* 4 NVMe Hot Swap Drives */}
            <rect x="8" y="14" width="22" height="4" rx="0.5" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
            <circle cx="10.5" cy="16" r="0.8" fill="#22c55e" />
            <rect x="8" y="20" width="22" height="4" rx="0.5" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
            <circle cx="10.5" cy="22" r="0.8" fill="#22c55e" />
            <rect x="8" y="26" width="22" height="4" rx="0.5" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
            <circle cx="10.5" cy="28" r="0.8" fill="#22c55e" />
            <rect x="8" y="32" width="22" height="4" rx="0.5" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
            <circle cx="10.5" cy="34" r="0.8" fill="#eab308" />
            {/* Nginx / Web Globe Emblem */}
            <circle cx="36" cy="24" r="4.5" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1" />
            <ellipse cx="36" cy="24" rx="2" ry="4.5" stroke="#93c5fd" strokeWidth="0.6" />
            <line x1="31.5" y1="24" x2="40.5" y2="24" stroke="#93c5fd" strokeWidth="0.6" />
          </svg>
        );

      // 16. DNS Name Server
      case 'server_dns':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="10" width="38" height="28" rx="3" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
            {/* DNS Resolver Tree Graph */}
            <circle cx="24" cy="16" r="2.5" fill="#10b981" />
            <circle cx="15" cy="26" r="2.2" fill="#34d399" />
            <circle cx="33" cy="26" r="2.2" fill="#34d399" />
            <line x1="24" y1="18.5" x2="15" y2="24" stroke="#6ee7b7" strokeWidth="1.2" />
            <line x1="24" y1="18.5" x2="33" y2="24" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="11" cy="33" r="1.5" fill="#a7f3d0" />
            <circle cx="19" cy="33" r="1.5" fill="#a7f3d0" />
            <line x1="15" y1="28" x2="11" y2="31.5" stroke="#a7f3d0" strokeWidth="1" />
            <line x1="15" y1="28" x2="19" y2="31.5" stroke="#a7f3d0" strokeWidth="1" />
            <text x="33" y="35" fill="#6ee7b7" fontSize="5.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              53
            </text>
          </svg>
        );

      // 17. SQL Database Server
      case 'server_db':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="db-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* 3 Stacked SQL Storage Platters */}
            {/* Top Disk */}
            <path d="M10 14C10 10.5 16.5 8 24 8C31.5 8 38 10.5 38 14V18C38 21.5 31.5 24 24 24C16.5 24 10 21.5 10 18V14Z" fill="url(#db-grad)" stroke="#38bdf8" strokeWidth="1.2" />
            <ellipse cx="24" cy="14" rx="14" ry="5" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1" />
            {/* Mid Disk */}
            <path d="M10 23C10 19.5 16.5 17 24 17C31.5 17 38 19.5 38 23V27C38 30.5 31.5 33 24 33C16.5 33 10 30.5 10 27V23Z" fill="url(#db-grad)" stroke="#38bdf8" strokeWidth="1.2" />
            <ellipse cx="24" cy="23" rx="14" ry="5" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.8" />
            {/* Bottom Disk */}
            <path d="M10 32C10 28.5 16.5 26 24 26C31.5 26 38 28.5 38 32V36C38 39.5 31.5 42 24 42C16.5 42 10 39.5 10 36V32Z" fill="url(#db-grad)" stroke="#38bdf8" strokeWidth="1.2" />
            <ellipse cx="24" cy="32" rx="14" ry="5" fill="#0c4a6e" stroke="#0284c7" strokeWidth="0.8" />
            {/* Live SQL Transaction LED */}
            <circle cx="34" cy="14" r="1.5" fill="#22c55e" />
            <circle cx="34" cy="23" r="1.5" fill="#eab308" />
            <circle cx="34" cy="32" r="1.5" fill="#22c55e" />
          </svg>
        );

      // 18. VPN Gateway Concentrator
      case 'server_vpn':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="10" width="38" height="28" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            {/* Encrypted Tunnel Path */}
            <path d="M9 24H16M32 24H39" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="2 1" />
            {/* Heavy Shield & Padlock */}
            <rect x="18" y="20" width="12" height="12" rx="2" fill="#4f46e5" stroke="#a5b4fc" strokeWidth="1.2" />
            <path d="M21 20V16C21 14.5 22.5 13 24 13C25.5 13 27 14.5 27 16V20" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="25" r="1.5" fill="#ffffff" />
            <line x1="24" y1="26.5" x2="24" y2="29" stroke="#ffffff" strokeWidth="1" />
          </svg>
        );

      // 19. Mail Server (SMTP/IMAP)
      case 'server_mail':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="10" width="38" height="28" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Sealed Metallic Envelope */}
            <rect x="10" y="16" width="28" height="18" rx="2" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M10 17L24 27L38 17" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="27" r="2" fill="#d97706" />
            {/* DKIM / TLS Verified Badge */}
            <circle cx="34" cy="30" r="3" fill="#22c55e" />
            <path d="M32.5 30L33.5 31L35.5 29" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );

      // 20. NAS Storage Server (8-Bay ZFS)
      case 'server_nas':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="6" y="8" width="36" height="32" rx="3" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
            {/* 8 Drive Sled Grid */}
            {[10, 24].map((colX, cIdx) => (
              <g key={`nas-col-${cIdx}`}>
                {[12, 18, 24, 30].map((rowY, rIdx) => (
                  <g key={`nas-drive-${cIdx}-${rIdx}`}>
                    <rect x={colX} y={rowY} width="12" height="4.5" rx="0.8" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
                    <circle cx={colX + 2} cy={rowY + 2.25} r="0.7" fill="#22c55e" />
                    <line x1={colX + 4.5} y1={rowY + 2.25} x2={colX + 10} y2={rowY + 2.25} stroke="#64748b" strokeWidth="0.6" />
                  </g>
                ))}
              </g>
            ))}
          </svg>
        );

      // 21. Desktop PC Workstation
      case 'client_pc':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Widescreen Curved Monitor */}
            <rect x="5" y="8" width="28" height="18" rx="2" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
            {/* Screen Content Graphic */}
            <rect x="7" y="10" width="24" height="14" rx="1" fill="#082f49" />
            <line x1="9" y1="13" x2="19" y2="13" stroke="#38bdf8" strokeWidth="1" />
            <line x1="9" y1="16" x2="25" y2="16" stroke="#22c55e" strokeWidth="0.8" />
            <line x1="9" y1="19" x2="15" y2="19" stroke="#eab308" strokeWidth="0.8" />
            {/* Monitor Stand */}
            <path d="M19 26V29M14 29H24" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            {/* Desktop Tower with RGB Strip */}
            <rect x="36" y="10" width="8" height="26" rx="1.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
            <line x1="40" y1="13" x2="40" y2="33" stroke="#ec4899" strokeWidth="1" strokeLinecap="round" />
            <circle cx="40" cy="12" r="0.7" fill="#38bdf8" />
            {/* Keyboard */}
            <rect x="6" y="32" width="26" height="4" rx="0.8" fill="#1e293b" stroke="#475569" strokeWidth="0.6" />
          </svg>
        );

      // 22. Laptop / Notebook
      case 'client_laptop':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Laptop Display (Top) */}
            <rect x="9" y="10" width="30" height="20" rx="2" fill="#020617" stroke="#94a3b8" strokeWidth="1.2" />
            <rect x="11" y="12" width="26" height="16" rx="1" fill="#0f172a" />
            {/* Terminal prompt on screen */}
            <text x="13" y="19" fill="#22c55e" fontSize="5" fontWeight="bold" fontFamily="monospace">
              root@lan:~#
            </text>
            <rect x="13" y="22" width="4" height="1" fill="#38bdf8" />
            {/* Webcam dot */}
            <circle cx="24" cy="11" r="0.5" fill="#22c55e" />
            {/* Laptop Base (Bottom) */}
            <path d="M5 32H43L40 37H8L5 32Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            {/* Trackpad */}
            <rect x="21" y="33.5" width="6" height="2.5" rx="0.5" fill="#1e293b" />
          </svg>
        );

      // 23. Smartphone / Mobile Client
      case 'client_mobile':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Sleek Smartphone Body */}
            <rect x="14" y="6" width="20" height="36" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="15.5" y="8" width="17" height="32" rx="2.5" fill="#0f172a" />
            {/* Dynamic Island / Speaker notch */}
            <rect x="21" y="9" width="6" height="1.5" rx="0.75" fill="#020617" />
            {/* 5G Status Bar */}
            <line x1="28" y1="12" x2="30" y2="12" stroke="#38bdf8" strokeWidth="0.8" />
            <line x1="28" y1="13" x2="31" y2="13" stroke="#38bdf8" strokeWidth="0.8" />
            {/* Mobile App Widgets */}
            <rect x="17.5" y="15" width="6" height="6" rx="1.5" fill="#0284c7" />
            <rect x="24.5" y="15" width="6" height="6" rx="1.5" fill="#10b981" />
            <rect x="17.5" y="23" width="6" height="6" rx="1.5" fill="#f59e0b" />
            <rect x="24.5" y="23" width="6" height="6" rx="1.5" fill="#8b5cf6" />
            {/* Home Indicator bar */}
            <rect x="20" y="37.5" width="8" height="1" rx="0.5" fill="#94a3b8" />
          </svg>
        );

      // 24. Network Laser Printer
      case 'client_printer':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Top Auto Document Feeder Tray */}
            <rect x="14" y="8" width="20" height="6" rx="1" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
            {/* Printer Main Body */}
            <rect x="8" y="14" width="32" height="20" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            {/* Paper Output Slot */}
            <rect x="12" y="20" width="24" height="4" rx="0.5" fill="#020617" />
            {/* Paper Sheet emerging */}
            <rect x="14" y="17" width="20" height="7" rx="0.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
            <line x1="16" y1="19" x2="24" y2="19" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="16" y1="21" x2="28" y2="21" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Touchscreen Control Display */}
            <rect x="30" y="27" width="7" height="5" rx="0.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
            {/* Bottom Paper Cassette Tray */}
            <rect x="10" y="30" width="18" height="3" rx="0.5" fill="#334155" />
          </svg>
        );

      // 25. IP Security Camera / PTZ Turret
      case 'client_camera':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Wall / Ceiling Mount Bracket */}
            <path d="M12 10H20V16H12Z" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <path d="M16 16L19 22" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            {/* Camera Body Turret */}
            <rect x="16" y="18" width="22" height="14" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" transform="rotate(15 27 25)" />
            {/* Lens Aperture */}
            <circle cx="34" cy="27" r="4.5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
            <circle cx="34" cy="27" r="2" fill="#020617" />
            {/* Red Live Recording LED */}
            <circle cx="21" cy="20" r="1.5" fill="#ef4444" />
          </svg>
        );

      // 26. POS Payment Terminal
      case 'client_pos':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="12" y="6" width="24" height="36" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
            {/* Top Screen */}
            <rect x="15" y="9" width="18" height="11" rx="1" fill="#0284c7" stroke="#7dd3fc" strokeWidth="0.6" />
            {/* Contactless Wave symbol */}
            <path d="M22 13C23.5 12 25 12 26 13" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M21 15C23.5 13.5 25.5 13.5 27 15" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
            {/* Numeric Keypad Matrix */}
            {[23, 27, 31, 35].map((y, rowIdx) => (
              <g key={`pos-row-${rowIdx}`}>
                {[15, 21, 27].map((x, colIdx) => (
                  <rect key={`pos-btn-${rowIdx}-${colIdx}`} x={x} y={y} width="4.5" height="2.8" rx="0.5" fill="#334155" />
                ))}
              </g>
            ))}
            {/* Bottom Chip Card Slot */}
            <rect x="16" y="39.5" width="16" height="1.5" rx="0.5" fill="#0f172a" />
          </svg>
        );

      // 27. IoT Environmental Telemetry Sensor
      case 'iot_sensor':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* External Sensor Probe Antenna */}
            <line x1="24" y1="12" x2="24" y2="4" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="24" cy="4" r="1.5" fill="#2dd4bf" />
            {/* Sensor Rugged Enclosure */}
            <rect x="12" y="12" width="24" height="28" rx="3" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
            {/* LCD Telemetry Readout Screen */}
            <rect x="15" y="16" width="18" height="11" rx="1.5" fill="#042f2e" stroke="#0d9488" strokeWidth="0.8" />
            <text x="24" y="24" fill="#2dd4bf" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              23.8°C
            </text>
            {/* Status LED row */}
            <circle cx="17" cy="32" r="1.2" fill="#22c55e" />
            <circle cx="24" cy="32" r="1.2" fill="#eab308" />
            <circle cx="31" cy="32" r="1.2" fill="#14b8a6" />
          </svg>
        );

      // 28. IoT Smart Camera / Bullet IP
      case 'iot_camera':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Wall Mount & Arm */}
            <path d="M10 14H18V20H10Z" fill="#334155" />
            <path d="M14 20L18 26" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            {/* Weatherproof Sun Shield Visor */}
            <path d="M16 20L36 16L38 21L18 25Z" fill="#14b8a6" />
            {/* Bullet Camera Body */}
            <rect x="18" y="22" width="18" height="12" rx="3" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.2" />
            {/* Optical Lens & IR Ring */}
            <circle cx="36" cy="28" r="4" fill="#042f2e" stroke="#2dd4bf" strokeWidth="1" />
            <circle cx="36" cy="28" r="1.5" fill="#ef4444" />
          </svg>
        );

      // 29. IoT Smart Thermostat
      case 'iot_thermostat':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Circular Wall Base */}
            <circle cx="24" cy="24" r="18" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="14" fill="#042f2e" stroke="#0d9488" strokeWidth="1" />
            {/* Temperature Ring */}
            <path d="M15 28C13.5 25 13.5 21 16 17C18.5 13 24 11 28 13C32 15 34.5 19 34 24" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
            {/* Current Target Display */}
            <text x="24" y="27" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              21°
            </text>
          </svg>
        );

      // 30. IoT Smart Door Lock
      case 'iot_smartlock':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Heavy Lock Escutcheon Plate */}
            <rect x="14" y="8" width="20" height="32" rx="4" fill="#1e293b" stroke="#14b8a6" strokeWidth="1.2" />
            {/* Numeric Touch Keypad */}
            <rect x="17" y="11" width="14" height="12" rx="1.5" fill="#0f172a" />
            <circle cx="20" cy="14" r="0.8" fill="#2dd4bf" />
            <circle cx="24" cy="14" r="0.8" fill="#2dd4bf" />
            <circle cx="28" cy="14" r="0.8" fill="#2dd4bf" />
            <circle cx="20" cy="17" r="0.8" fill="#2dd4bf" />
            <circle cx="24" cy="17" r="0.8" fill="#2dd4bf" />
            <circle cx="28" cy="17" r="0.8" fill="#2dd4bf" />
            <circle cx="24" cy="20" r="0.8" fill="#2dd4bf" />
            {/* Biometric Fingerprint Sensor */}
            <circle cx="24" cy="28" r="3.5" fill="#042f2e" stroke="#14b8a6" strokeWidth="1" />
            <path d="M22.5 28C23 27 25 27 25.5 28" stroke="#2dd4bf" strokeWidth="0.8" strokeLinecap="round" />
            {/* Motorized Deadbolt Status */}
            <circle cx="24" cy="35" r="1.2" fill="#22c55e" />
          </svg>
        );

      // 31. IoT Smart Light (RGBW)
      case 'iot_light':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Radiating Color Beams */}
            <line x1="24" y1="4" x2="24" y2="8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="9" x2="15" y2="12" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="36" y1="9" x2="33" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="21" x2="10" y2="21" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="42" y1="21" x2="38" y2="21" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
            {/* Glass Bulb Dome */}
            <path d="M16 21C16 16.5 19.5 13 24 13C28.5 13 32 16.5 32 21C32 24.5 30 27 28 29V33H20V29C18 27 16 24.5 16 21Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" opacity="0.9" />
            {/* Screw Base */}
            <rect x="21" y="33" width="6" height="4" rx="0.5" fill="#64748b" />
            <rect x="22" y="37" width="4" height="2" rx="0.5" fill="#475569" />
          </svg>
        );

      // 32. Industrial PLC / SCADA Unit (Siemens S7 style)
      case 'iot_plc':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* DIN-Rail Module Body */}
            <rect x="8" y="8" width="32" height="32" rx="2" fill="#1e293b" stroke="#14b8a6" strokeWidth="1.5" />
            {/* Top Screw Terminal Blocks */}
            <rect x="10" y="10" width="28" height="5" rx="0.5" fill="#334155" stroke="#64748b" strokeWidth="0.5" />
            {[12, 16, 20, 24, 28, 32].map((x, i) => (
              <circle key={`plc-t-${i}`} cx={x} cy={12.5} r="0.8" fill="#e2e8f0" />
            ))}
            {/* RUN/STOP Key Switch */}
            <circle cx="16" cy="22" r="2.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
            <line x1="16" y1="20.5" x2="16" y2="23.5" stroke="#22c55e" strokeWidth="1" />
            {/* Digital I/O LED Array */}
            {[24, 28, 32].map((x, colIdx) => (
              <g key={`plc-led-col-${colIdx}`}>
                {[19, 23, 27].map((y, rowIdx) => (
                  <circle key={`plc-led-${colIdx}-${rowIdx}`} cx={x} cy={y} r="0.8" fill={colIdx === 0 ? '#22c55e' : '#eab308'} />
                ))}
              </g>
            ))}
            {/* Bottom Screw Terminal Blocks */}
            <rect x="10" y="33" width="28" height="5" rx="0.5" fill="#334155" stroke="#64748b" strokeWidth="0.5" />
            {[12, 16, 20, 24, 28, 32].map((x, i) => (
              <circle key={`plc-b-${i}`} cx={x} cy={35.5} r="0.8" fill="#e2e8f0" />
            ))}
          </svg>
        );

      // 33. IoT Edge Gateway Hub (Multi-Radio)
      case 'iot_gateway':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Dual LoRaWAN / Zigbee Dipole Antennas */}
            <line x1="12" y1="16" x2="8" y2="4" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="36" y1="16" x2="40" y2="4" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" />
            {/* Gateway Chassis */}
            <rect x="10" y="16" width="28" height="22" rx="3" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.2" />
            {/* LoRa / MQTT Protocol Matrix */}
            <circle cx="24" cy="25" r="4.5" fill="#042f2e" stroke="#2dd4bf" strokeWidth="1" />
            <path d="M24 22V28M21 25H27" stroke="#2dd4bf" strokeWidth="1" />
            {/* Status LEDs */}
            <circle cx="15" cy="33" r="1.2" fill="#22c55e" />
            <circle cx="20" cy="33" r="1.2" fill="#38bdf8" />
            <circle cx="25" cy="33" r="1.2" fill="#eab308" />
            <circle cx="30" cy="33" r="1.2" fill="#a855f7" />
          </svg>
        );

      // 34. Smart Energy AMR Meter
      case 'iot_smart_meter':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="18" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
            {/* Digital kWh Display */}
            <rect x="14" y="16" width="20" height="9" rx="1" fill="#042f2e" stroke="#0d9488" strokeWidth="0.8" />
            <text x="24" y="23" fill="#2dd4bf" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              04829
            </text>
            {/* Pulse LED */}
            <circle cx="18" cy="30" r="1.5" fill="#ef4444" />
            <text x="22" y="32" fill="#94a3b8" fontSize="4.5" fontFamily="monospace">
              kWh/imp
            </text>
          </svg>
        );

      // 35. Smart Voice Speaker
      case 'iot_speaker':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Fabric Acoustic Cylinder */}
            <rect x="14" y="12" width="20" height="26" rx="6" fill="#1e293b" stroke="#14b8a6" strokeWidth="1.2" />
            {/* Glowing Light Ring on Top */}
            <ellipse cx="24" cy="13" rx="8" ry="2.5" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
            {/* Audio Waveform */}
            <path d="M19 25C21 22 21 28 24 25C27 22 27 28 29 25" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      // 36. Kali Linux Hacker Terminal
      case 'hacker':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="8" width="38" height="32" rx="3" fill="#050505" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="8" y="11" width="32" height="26" rx="2" fill="#170407" />
            {/* Glowing Red Skull Emblem */}
            <circle cx="24" cy="20" r="6" fill="#ef4444" opacity="0.9" />
            <rect x="21" y="24" width="6" height="4" rx="0.5" fill="#ef4444" />
            <circle cx="22" cy="19" r="1.5" fill="#050505" />
            <circle cx="26" cy="19" r="1.5" fill="#050505" />
            <path d="M22.5 26H25.5" stroke="#050505" strokeWidth="0.8" />
            {/* Glitch Exploitation prompt */}
            <text x="24" y="34" fill="#fca5a5" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              EXPLOIT::ROOT
            </text>
          </svg>
        );

      // 37. DDoS Botnet Master
      case 'hacker_botnet':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="8" width="38" height="32" rx="3" fill="#180509" stroke="#f43f5e" strokeWidth="1.5" />
            {/* Central Master Node */}
            <circle cx="24" cy="20" r="5" fill="#e11d48" stroke="#fda4af" strokeWidth="1" />
            {/* Swarm Puppet Threads */}
            <circle cx="12" cy="14" r="2" fill="#f43f5e" />
            <circle cx="36" cy="14" r="2" fill="#f43f5e" />
            <circle cx="10" cy="30" r="2" fill="#f43f5e" />
            <circle cx="38" cy="30" r="2" fill="#f43f5e" />
            <line x1="24" y1="20" x2="12" y2="14" stroke="#fb7185" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="24" y1="20" x2="36" y2="14" stroke="#fb7185" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="24" y1="20" x2="10" y2="30" stroke="#fb7185" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="24" y1="20" x2="38" y2="30" stroke="#fb7185" strokeWidth="0.8" strokeDasharray="2 1" />
            <text x="24" y="35" fill="#fca5a5" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              BOTNET
            </text>
          </svg>
        );

      // 38. Wi-Fi Pineapple Rogue AP
      case 'hacker_pineapple':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Dual High-Gain Rubber Ducky Antennas */}
            <line x1="14" y1="20" x2="10" y2="4" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="34" y1="20" x2="38" y2="4" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Evil Twin Pineapple Body */}
            <rect x="10" y="20" width="28" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
            {/* Rogue Pineapple Emblem */}
            <path d="M24 23C22 25 22 29 24 31C26 29 26 25 24 23Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
            <path d="M24 23L22 20M24 23L26 20M24 23V19" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      // 39. C2 Stealth Server
      case 'hacker_c2':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="8" width="38" height="32" rx="3" fill="#180509" stroke="#dc2626" strokeWidth="1.5" />
            {/* Stealth Reverse Shell Listener Radar */}
            <circle cx="24" cy="22" r="10" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle cx="24" cy="22" r="6" stroke="#f87171" strokeWidth="0.8" />
            <circle cx="24" cy="22" r="2.5" fill="#dc2626" />
            <line x1="24" y1="22" x2="31" y2="17" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" />
            <text x="24" y="36" fill="#fca5a5" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              C2-BEACON
            </text>
          </svg>
        );

      // 40. Rogue Hardware Implant / BadUSB
      case 'hacker_implant':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Gold USB Connector Pins */}
            <rect x="16" y="6" width="16" height="10" rx="1" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="19" y="8" width="3" height="4" rx="0.5" fill="#eab308" />
            <rect x="26" y="8" width="3" height="4" rx="0.5" fill="#eab308" />
            {/* Stealth Enclosure */}
            <rect x="12" y="16" width="24" height="24" rx="3" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            {/* Covert Microcontroller Chip */}
            <rect x="17" y="21" width="14" height="14" rx="1.5" fill="#1e293b" stroke="#f87171" strokeWidth="0.8" />
            <circle cx="24" cy="28" r="2" fill="#ef4444" />
          </svg>
        );

      // 41. Exploit Stager Server
      case 'hacker_stager':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="5" y="8" width="38" height="32" rx="3" fill="#180509" stroke="#b91c1c" strokeWidth="1.5" />
            {/* Syringe / Dropper delivery pipe */}
            <path d="M16 16L32 32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
            <circle cx="32" cy="32" r="2" fill="#22c55e" />
            <text x="24" y="36" fill="#fca5a5" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              STAGER-DROP
            </text>
          </svg>
        );

      // ==========================================
      // ADVANCED HIGH-TECH DEVICES (NEW)
      // ==========================================

      // 42. Quantum Key Distribution (QKD) Photonic Node
      case 'quantum_qkd':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <defs>
              <radialGradient id="qkd-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#581c87" />
              </radialGradient>
            </defs>
            {/* Quantum Laser Chassis */}
            <rect x="4" y="10" width="40" height="28" rx="3" fill="#1e1035" stroke="#c084fc" strokeWidth="1.5" />
            {/* Entangled Bell State Orbital Rings */}
            <ellipse cx="24" cy="24" rx="14" ry="5" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 2" transform="rotate(-30 24 24)" />
            <ellipse cx="24" cy="24" rx="14" ry="5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" transform="rotate(30 24 24)" />
            {/* Central Photonic Core */}
            <circle cx="24" cy="24" r="5" fill="url(#qkd-glow)" stroke="#e9d5ff" strokeWidth="1" />
            <circle cx="24" cy="24" r="2" fill="#ffffff" />
            {/* Quantum Key Sync Status */}
            <text x="24" y="34" fill="#d8b4fe" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              QKD::ENTANGLE
            </text>
          </svg>
        );

      // 43. AI Inference Cluster / GPU Supercomputer
      case 'ai_cluster':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="8" width="40" height="32" rx="3" fill="#042f2e" stroke="#10b981" strokeWidth="1.5" />
            {/* 8x Tensor Core GPU Dies with Gold NVLink Bridge */}
            {[8, 17, 26, 35].map((x, colIdx) => (
              <g key={`gpu-col-${colIdx}`}>
                <rect x={x} y="12" width="6" height="9" rx="1" fill="#065f46" stroke="#34d399" strokeWidth="0.8" />
                <circle cx={x + 3} cy={16.5} r="1.2" fill="#a7f3d0" />
                <rect x={x} y="24" width="6" height="9" rx="1" fill="#065f46" stroke="#34d399" strokeWidth="0.8" />
                <circle cx={x + 3} cy={28.5} r="1.2" fill="#a7f3d0" />
              </g>
            ))}
            {/* Central Gold NVLink Interconnect Bus */}
            <line x1="6" y1="22.5" x2="42" y2="22.5" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 1" />
          </svg>
        );

      // 44. SD-WAN Orchestrator Edge Gateway
      case 'sdwan_edge':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="12" width="40" height="24" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            {/* Dynamic Multi-WAN Bonding Paths (MPLS, 5G, Fiber) */}
            <path d="M8 18H20C24 18 24 24 28 24H40" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 24H40" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 30H20C24 30 24 24 28 24H40" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            {/* SLA Steering Hub */}
            <circle cx="24" cy="24" r="3" fill="#0e7490" stroke="#67e8f9" strokeWidth="1" />
          </svg>
        );

      // 45. SCADA Remote Terminal Unit (RTU)
      case 'scada_rtu':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="6" y="8" width="36" height="32" rx="3" fill="#1c1917" stroke="#ea580c" strokeWidth="1.5" />
            {/* High-Voltage Substation Bus */}
            <rect x="9" y="11" width="30" height="6" rx="1" fill="#292524" stroke="#78716c" strokeWidth="0.6" />
            <text x="24" y="16" fill="#fdba74" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              IEC-61850::GOOSE
            </text>
            {/* Isolated Optocoupler relays */}
            {[11, 18, 25, 32].map((x, i) => (
              <rect key={`rtu-relay-${i}`} x={x} y={20} width="5" height="7" rx="0.5" fill="#44403c" stroke="#f97316" strokeWidth="0.6" />
            ))}
            {/* Breaker Trip Status */}
            <circle cx="16" cy="33" r="2" fill="#22c55e" />
            <circle cx="32" cy="33" r="2" fill="#ef4444" />
          </svg>
        );

      // 46. LEO Satellite Ground Uplink Station
      case 'satellite_ground':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Base Pedestal */}
            <path d="M16 38H32L28 32H20L16 38Z" fill="#334155" stroke="#64748b" strokeWidth="1" />
            {/* Motorized Gimbal Arm */}
            <line x1="24" y1="32" x2="24" y2="24" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Parabolic Phased-Array Dish pointed at sky */}
            <path d="M10 24C10 15 38 15 38 24C38 28 10 28 10 24Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(-25 24 24)" />
            {/* RF Feed Horn & Orbital Beams */}
            <line x1="20" y1="18" x2="32" y2="6" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 1" />
            <circle cx="34" cy="4" r="2" fill="#fbbf24" />
          </svg>
        );

      // 47. SASE / CASB Zero-Trust Proxy
      case 'casb_proxy':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="4" y="10" width="40" height="28" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            {/* Cloud Umbrella */}
            <path d="M14 22C14 16 19 14 24 14C29 14 34 16 34 22H14Z" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1" />
            {/* Zero-Trust Identity Key Shield */}
            <path d="M24 22V32M21 29L24 32L27 29" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* DLP Data Loss Scanner */}
            <circle cx="24" cy="22" r="2" fill="#22c55e" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect x="6" y="12" width="36" height="24" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="5" fill="#3b82f6" />
          </svg>
        );
    }
  };

  const getBadgeText = (t: DeviceType) => {
    switch (t) {
      case 'internet': return 'WAN';
      case 'router': return 'RTR';
      case 'wifi_router': return 'WIFI';
      case 'firewall': return 'FW';
      case 'ids_ips': return 'IPS';
      case 'waf': return 'WAF';
      case 'honeypot': return 'DECOY';
      case 'siem_soc': return 'SOC';
      case 'ddos_scrubber': return 'SCRUB';
      case 'hsm_vault': return 'HSM';
      case 'load_balancer': return 'LB';
      case 'switch': return 'L2-SW';
      case 'l3_switch': return 'L3-SW';
      case 'wifi_ap': return 'AP';
      case 'server_web': return 'HTTP';
      case 'server_dns': return 'DNS';
      case 'server_db': return 'SQL';
      case 'server_vpn': return 'VPN';
      case 'server_mail': return 'MAIL';
      case 'server_nas': return 'NAS';
      case 'client_pc': return 'PC';
      case 'client_laptop': return 'LAPTOP';
      case 'client_mobile': return '5G';
      case 'client_printer': return 'PRINT';
      case 'client_camera': return 'CCTV';
      case 'client_pos': return 'POS';
      case 'iot_sensor': return 'MQTT';
      case 'iot_camera': return 'RTSP';
      case 'iot_thermostat': return 'HVAC';
      case 'iot_smartlock': return 'LOCK';
      case 'iot_light': return 'RGB';
      case 'iot_plc': return 'PLC';
      case 'iot_gateway': return 'GATEWAY';
      case 'iot_smart_meter': return 'AMR';
      case 'iot_speaker': return 'AUDIO';
      case 'hacker': return 'KALI';
      case 'hacker_botnet': return 'BOT';
      case 'hacker_pineapple': return 'PINE';
      case 'hacker_c2': return 'C2';
      case 'hacker_implant': return 'IMPLANT';
      case 'hacker_stager': return 'STAGE';
      case 'quantum_qkd': return 'QKD';
      case 'ai_cluster': return 'AI-GPU';
      case 'sdwan_edge': return 'SD-WAN';
      case 'scada_rtu': return 'SCADA';
      case 'satellite_ground': return 'SAT';
      case 'casb_proxy': return 'SASE';
      default: return '';
    }
  };

  const badgeText = getBadgeText(type);

  return (
    <div
      className={`relative select-none inline-flex items-center justify-center ${sizeMap.container} ${className}`}
      title={type}
    >
      <div className="w-full h-full flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
        {renderIconSvg()}
      </div>

      {showBadge && badgeText && (
        <span
          className={`absolute font-mono font-black border rounded shadow-md z-10 leading-none bg-slate-900/95 text-cyan-300 border-slate-700 ${sizeMap.badge}`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
};
