import React from 'react';
import {
  Globe,
  Network,
  Cpu,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Power,
} from 'lucide-react';
import { Device, Link } from '../types';
import { maskToCidr } from '../utils/networkEngine';

interface NodeTooltipProps {
  node: Device;
  nodes?: Device[];
  links?: Link[];
  isConnectedWAN?: boolean;
  hasInternet?: boolean;
  hasWarning?: boolean;
  issues?: string[];
  onOpenIpModal?: (node: Device) => void;
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({
  node,
  links = [],
  isConnectedWAN = false,
  hasWarning = false,
  issues = [],
}) => {
  // Find links connected to this device
  const nodeLinks = links.filter((l) => l.a === node.id || l.b === node.id);

  // Calculate dynamic load percentage based on role, active links & warnings
  const calculateLoad = (): number => {
    if (!node.on) return 0;
    let base = 15;
    switch (node.type) {
      case 'firewall':
      case 'hacker':
        base = 45;
        break;
      case 'router':
      case 'wifi_router':
      case 'l3_switch':
        base = 32;
        break;
      case 'server_web':
      case 'server_db':
      case 'server_dns':
      case 'server_vpn':
        base = 40;
        break;
      case 'switch':
      case 'wifi_ap':
        base = 22;
        break;
      case 'client_pc':
      case 'client_laptop':
      case 'client_mobile':
      case 'client_printer':
        base = 18;
        break;
      case 'internet':
        base = 25;
        break;
    }
    const linkBonus = nodeLinks.length * 8;
    const warningBonus = hasWarning ? 20 : 0;
    return Math.min(98, Math.max(8, base + linkBonus + warningBonus));
  };

  const loadPercent = calculateLoad();

  // Load status color and label
  const getLoadColor = (load: number) => {
    if (!node.on) return { text: 'text-slate-500', bg: 'bg-slate-700', label: 'Avstängd' };
    if (load > 80) return { text: 'text-rose-400', bg: 'bg-rose-500', label: 'Kritisk' };
    if (load > 50) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Måttlig' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Normal' };
  };

  const loadStyle = getLoadColor(loadPercent);

  // Highest bandwidth link & average packet loss
  const maxBandwidth = nodeLinks.reduce((max, l) => Math.max(max, l.bandwidthMbps), 0);
  const avgPacketLoss =
    nodeLinks.length > 0
      ? Math.round(nodeLinks.reduce((acc, l) => acc + l.packetLossPercent, 0) / nodeLinks.length)
      : 0;

  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full z-40 pointer-events-none min-w-[230px] max-w-[270px] animate-fade-in drop-shadow-2xl">
      <div className="bg-slate-950/95 border border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.35)] rounded-xl p-3 text-slate-100 text-xs backdrop-blur-md space-y-2.5">
        
        {/* Header: Name, Type & Status Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="min-w-0 pr-2">
            <div className="font-bold text-slate-100 text-xs truncate flex items-center gap-1.5">
              <span>{node.name}</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-wide uppercase">
              {node.type.replace('_', ' ')}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1">
            {!node.on ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <Power className="w-2.5 h-2.5" /> OFF
              </span>
            ) : hasWarning ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" /> VARNING
              </span>
            ) : isConnectedWAN ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-emerald-400" /> WAN OK
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Network className="w-2.5 h-2.5 text-amber-400" /> LAN LOKAL
              </span>
            )}
          </div>
        </div>

        {/* Section 1: IP & Subnet Configuration */}
        <div className="space-y-1 font-mono text-[10.5px]">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 font-sans text-[10px]">IP-Adress:</span>
            <span className="font-bold text-cyan-300">
              {node.type === 'internet' ? '203.0.113.1 (WAN)' : node.ip || 'Okonfigurerad'}
            </span>
          </div>
          {node.type !== 'internet' && node.subnetMask && (
            <div className="flex justify-between items-center text-slate-400 text-[10px]">
              <span className="font-sans">Subnät / Mask:</span>
              <span className="text-slate-300">
                {node.subnetMask} <span className="text-cyan-400">({maskToCidr(node.subnetMask)})</span>
              </span>
            </div>
          )}
          {node.gateway && node.type !== 'internet' && (
            <div className="flex justify-between items-center text-slate-400 text-[10px]">
              <span className="font-sans">Default Gateway:</span>
              <span className="text-amber-300">{node.gateway}</span>
            </div>
          )}
        </div>

        {/* Section 2: Belastning (CPU & Traffic Load Bar) */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> Belastning:
            </span>
            <span className={`font-mono font-bold ${loadStyle.text}`}>
              {loadPercent}% ({loadStyle.label})
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full ${loadStyle.bg} transition-all duration-300`}
              style={{ width: `${loadPercent}%` }}
            />
          </div>
        </div>

        {/* Section 3: Länkstatus & Anslutningar */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Länkstatus:
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {nodeLinks.length === 0 ? (
                <span className="text-slate-500">Ingen länk ansluten</span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {nodeLinks.length} {nodeLinks.length === 1 ? 'aktiv länk' : 'aktiva länkar'}
                </span>
              )}
            </span>
          </div>
          {nodeLinks.length > 0 && (
            <div className="flex justify-between items-center text-slate-400 text-[9.5px]">
              <span>Kapacitet / Förlust:</span>
              <span className="font-mono text-cyan-300">
                {maxBandwidth} Mbps | <span className={avgPacketLoss > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{avgPacketLoss}% loss</span>
              </span>
            </div>
          )}
        </div>

        {/* Warning Details if Any */}
        {hasWarning && issues && issues.length > 0 && (
          <div className="pt-1.5 border-t border-rose-500/40 text-[9.5px] text-rose-300 space-y-0.5">
            {issues.slice(0, 2).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-1 font-sans">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{issue}</span>
              </div>
            ))}
          </div>
        )}

      </div>
      {/* Tooltip Pointer Arrow */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-500/70 mx-auto -mt-px" />
    </div>
  );
};
