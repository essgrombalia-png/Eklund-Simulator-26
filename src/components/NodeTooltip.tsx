import React, { useState, useEffect } from 'react';
import {
  Globe,
  Network,
  Cpu,
  AlertTriangle,
  Zap,
  Power,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Server,
  Layers,
  Radio,
  Skull,
  Lock,
} from 'lucide-react';
import { Device, Link, CapturedPacket } from '../types';
import { maskToCidr } from '../utils/networkEngine';

interface NodeTooltipProps {
  node: Device;
  nodes?: Device[];
  links?: Link[];
  capturedPackets?: CapturedPacket[];
  isConnectedWAN?: boolean;
  hasInternet?: boolean;
  hasWarning?: boolean;
  issues?: string[];
  onOpenIpModal?: (node: Device) => void;
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({
  node,
  links = [],
  capturedPackets = [],
  isConnectedWAN = false,
  hasInternet = false,
  hasWarning = false,
  issues = [],
}) => {
  // Real-time ticker for live stats micro-fluctuations
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!node.on) return;
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000);
    }, 800);
    return () => clearInterval(interval);
  }, [node.on]);

  // Find links connected to this device
  const nodeLinks = links.filter((l) => l.a === node.id || l.b === node.id);

  // Filter captured packets involving this node (source or dest)
  const nodePackets = capturedPackets.filter(
    (p) => p.sourceId === node.id || p.destId === node.id || p.sourceIp === node.ip || p.destIp === node.ip
  );

  // Calculate dynamic load percentage based on role, active links & warnings
  const calculateLoad = (): number => {
    if (!node.on) return 0;
    let base = 15;
    switch (node.type) {
      case 'firewall':
      case 'ids_ips':
      case 'waf':
      case 'ddos_scrubber':
      case 'siem_soc':
      case 'honeypot':
      case 'hsm_vault':
        base = 45;
        break;
      case 'hacker':
      case 'hacker_botnet':
      case 'hacker_c2':
        base = 65;
        break;
      case 'router':
      case 'wifi_router':
      case 'l3_switch':
      case 'load_balancer':
        base = 32;
        break;
      case 'server_web':
      case 'server_db':
      case 'server_dns':
      case 'server_vpn':
      case 'server_mail':
      case 'server_nas':
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
        base = 28;
        break;
      default:
        base = 15;
    }

    const linkBonus = nodeLinks.length * 7;
    const warningBonus = hasWarning ? 20 : 0;
    const infectionBonus = node.isInfected ? 35 : 0;
    const attackBonus = node.hackerAttackActive ? 30 : 0;

    // Smooth deterministic live micro-jitter
    const jitter = Math.sin(tick * 1.7 + (node.id.charCodeAt(0) || 0)) * 4;

    const total = base + linkBonus + warningBonus + infectionBonus + attackBonus + jitter;
    return Math.min(99, Math.max(5, Math.round(total)));
  };

  const loadPercent = calculateLoad();

  // Load status color and label
  const getLoadColor = (load: number) => {
    if (!node.on) return { text: 'text-slate-500', bg: 'bg-slate-700', label: 'Avstängd', border: 'border-slate-700' };
    if (load > 85) return { text: 'text-rose-400', bg: 'bg-rose-500', label: 'Kritisk', border: 'border-rose-500/60' };
    if (load > 60) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Hög', border: 'border-amber-500/50' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Normal', border: 'border-emerald-500/40' };
  };

  const loadStyle = getLoadColor(loadPercent);

  // Calculate Real-Time Throughput (Paketgenomströmning)
  const calculateThroughput = () => {
    if (!node.on || nodeLinks.length === 0) {
      return { rxMbps: '0.0', txMbps: '0.0', pps: 0, totalMbps: 0 };
    }

    const maxBandwidth = nodeLinks.reduce((max, l) => Math.max(max, l.bandwidthMbps), 100);
    const activityFactor = Math.min(1.0, 0.15 + nodeLinks.length * 0.2 + nodePackets.length * 0.05);

    // Live jitter for Rx and Tx
    const rxBase = maxBandwidth * 0.12 * activityFactor;
    const txBase = maxBandwidth * 0.09 * activityFactor;

    const rxJitter = Math.sin(tick * 1.3 + (node.id.charCodeAt(1) || 1)) * (rxBase * 0.2);
    const txJitter = Math.cos(tick * 1.1 + (node.id.charCodeAt(2) || 2)) * (txBase * 0.2);

    const rx = Math.max(0.1, rxBase + rxJitter);
    const tx = Math.max(0.1, txBase + txJitter);
    const pps = Math.round((rx + tx) * 85 + nodePackets.length * 15);

    return {
      rxMbps: rx >= 10 ? rx.toFixed(1) : rx.toFixed(2),
      txMbps: tx >= 10 ? tx.toFixed(1) : tx.toFixed(2),
      pps,
      totalMbps: +(rx + tx).toFixed(2),
    };
  };

  const throughput = calculateThroughput();

  // Total link capacity & average packet loss
  const maxBandwidth = nodeLinks.reduce((max, l) => Math.max(max, l.bandwidthMbps), 0);
  const avgPacketLoss =
    nodeLinks.length > 0
      ? Math.round(nodeLinks.reduce((acc, l) => acc + l.packetLossPercent, 0) / nodeLinks.length)
      : 0;

  // RAM Memory spec & usage calculation
  const getRAMSpecs = () => {
    let totalGB = 4;
    switch (node.type) {
      case 'firewall':
      case 'ids_ips':
      case 'waf':
      case 'siem_soc':
        totalGB = 16;
        break;
      case 'server_web':
      case 'server_db':
      case 'server_vpn':
        totalGB = 32;
        break;
      case 'router':
      case 'l3_switch':
      case 'load_balancer':
        totalGB = 8;
        break;
      case 'switch':
      case 'wifi_ap':
        totalGB = 2;
        break;
      case 'iot_sensor':
      case 'iot_camera':
      case 'iot_smartlock':
      case 'iot_thermostat':
        totalGB = 0.5;
        break;
      default:
        totalGB = 8;
    }

    const ramUsagePercent = Math.min(95, Math.max(12, Math.round(loadPercent * 0.7 + 15)));
    const usedGB = (totalGB * (ramUsagePercent / 100)).toFixed(1);
    return { usedGB, totalGB, ramUsagePercent };
  };

  const ram = getRAMSpecs();

  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full z-40 pointer-events-none min-w-[280px] max-w-[325px] animate-fade-in drop-shadow-2xl">
      <div className="bg-slate-950/95 border border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.4)] rounded-2xl p-3.5 text-slate-100 text-xs backdrop-blur-xl space-y-3">
        {/* Header: Name, Device Type & Real-time Status Badge */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90">
          <div className="min-w-0 pr-2">
            <div className="font-bold text-slate-100 text-xs truncate flex items-center gap-1.5">
              <span>{node.name}</span>
              {node.isInfected && (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1.5 py-0.5 rounded font-mono animate-pulse">
                  ☣️ INFEKTERAD
                </span>
              )}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>{node.type.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            {!node.on ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <Power className="w-2.5 h-2.5" /> OFF
              </span>
            ) : node.isInfected ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-2.5 h-2.5 text-rose-400" /> HOT
              </span>
            ) : hasWarning ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" /> VARNING
              </span>
            ) : isConnectedWAN || hasInternet || node.type === 'internet' ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-emerald-400" /> WAN ONLINE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <Network className="w-2.5 h-2.5 text-cyan-400" /> LAN ONLINE
              </span>
            )}
          </div>
        </div>

        {/* Section 1: IP & Network Identifiers */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 space-y-1 font-mono text-[10.5px]">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 font-sans text-[10px]">IP-Adress:</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <span>{node.type === 'internet' ? '203.0.113.1 (WAN)' : node.ip || 'Okonfigurerad'}</span>
              {node.subnetMask && node.type !== 'internet' && (
                <span className="text-cyan-400/80 font-normal">({maskToCidr(node.subnetMask)})</span>
              )}
            </span>
          </div>
          {node.type !== 'internet' && node.subnetMask && (
            <div className="flex justify-between items-center text-slate-400 text-[10px]">
              <span className="font-sans">Subnät-mask:</span>
              <span className="text-slate-300">{node.subnetMask}</span>
            </div>
          )}
          {node.gateway && node.type !== 'internet' && (
            <div className="flex justify-between items-center text-slate-400 text-[10px]">
              <span className="font-sans">Default Gateway:</span>
              <span className="text-amber-300 font-semibold">{node.gateway}</span>
            </div>
          )}
          {node.mac && (
            <div className="flex justify-between items-center text-slate-400 text-[9.5px]">
              <span className="font-sans text-slate-400">MAC-Adress:</span>
              <span className="text-emerald-400/90 tracking-wider">{node.mac}</span>
            </div>
          )}
          {node.vlanId && (
            <div className="flex justify-between items-center text-slate-400 text-[9.5px]">
              <span className="font-sans text-slate-400">VLAN Tag:</span>
              <span className="text-purple-300 font-bold px-1 rounded bg-purple-500/20 border border-purple-500/30">
                VLAN {node.vlanId}
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Real-time CPU & System Load Stats */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>CPU-Belastning</span>
            </span>
            <span className={`font-mono font-bold text-xs ${loadStyle.text} flex items-center gap-1`}>
              {node.on && <Activity className="w-3 h-3 animate-pulse" />}
              <span>{loadPercent}%</span>
              <span className="text-[9.5px] font-normal text-slate-400">({loadStyle.label})</span>
            </span>
          </div>

          {/* Dynamic Animated CPU Bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full ${loadStyle.bg} rounded-full transition-all duration-500 shadow-sm`}
              style={{ width: `${loadPercent}%` }}
            />
          </div>

          {/* Memory / RAM Row */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>RAM Minne:</span>
            </span>
            <span className="font-mono text-slate-200">
              {node.on ? (
                <>
                  <span className="text-cyan-300 font-bold">{ram.usedGB} GB</span>
                  <span className="text-slate-400"> / {ram.totalGB} GB ({ram.ramUsagePercent}%)</span>
                </>
              ) : (
                <span className="text-slate-500">0 GB</span>
              )}
            </span>
          </div>
        </div>

        {/* Section 3: Real-Time Packet Throughput (Paketgenomströmning) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Paketgenomströmning</span>
            </span>
            <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
              {node.on ? `${throughput.pps} pps` : '0 pps'}
            </span>
          </div>

          {/* Live Throughput Rx / Tx Cards */}
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            {/* Rx Inkommande */}
            <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-emerald-400">
                <ArrowDownLeft className="w-3 h-3" />
                <span className="font-sans text-[9px] text-slate-400">In (Rx):</span>
              </div>
              <span className="font-bold text-emerald-300">{node.on ? `${throughput.rxMbps} Mbps` : '0 Mbps'}</span>
            </div>

            {/* Tx Utgående */}
            <div className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-cyan-400">
                <ArrowUpRight className="w-3 h-3" />
                <span className="font-sans text-[9px] text-slate-400">Ut (Tx):</span>
              </div>
              <span className="font-bold text-cyan-300">{node.on ? `${throughput.txMbps} Mbps` : '0 Mbps'}</span>
            </div>
          </div>

          {/* Connected Links Summary */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Länkar & Paket:</span>
            </span>
            <span className="font-mono text-slate-200">
              {nodeLinks.length === 0 ? (
                <span className="text-slate-500">Inga aktiva länkar</span>
              ) : (
                <span className="text-slate-300">
                  <span className="text-emerald-400 font-bold">{nodeLinks.length}</span> länkar ({maxBandwidth} Mbps)
                  {avgPacketLoss > 0 && <span className="text-rose-400 font-bold pl-1">| {avgPacketLoss}% loss</span>}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Section 4: Device-Specific Quick Metrics */}
        {(node.firewallRules?.length || node.routes?.length || node.dhcpEnabled || node.services || node.antivirusStatus || node.hackerAttackActive) && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
            <div className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
              Enhetsspecifik Status
            </div>

            {/* Firewall Rules count */}
            {node.firewallRules && node.firewallRules.length > 0 && (
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" /> Brandväggsregler:
                </span>
                <span className="text-cyan-300 font-bold">{node.firewallRules.length} aktiva regler</span>
              </div>
            )}

            {/* Router Routes count */}
            {node.routes && node.routes.length > 0 && (
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <Network className="w-3 h-3 text-teal-400" /> Ruttabell:
                </span>
                <span className="text-teal-300 font-bold">{node.routes.length} nätverksrutter</span>
              </div>
            )}

            {/* DHCP Status */}
            {node.dhcpEnabled && (
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <Radio className="w-3 h-3 text-amber-400" /> DHCP Server:
                </span>
                <span className="text-amber-300 font-bold">Aktiv ({node.dhcpRange?.start || '192.168.1.100'})</span>
              </div>
            )}

            {/* Server Active Services */}
            {node.services && (
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <Server className="w-3 h-3 text-purple-400" /> Tjänster:
                </span>
                <div className="flex gap-1">
                  {node.services.http && <span className="px-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[9px] font-bold">HTTP</span>}
                  {node.services.dns && <span className="px-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[9px] font-bold">DNS</span>}
                  {node.services.sql && <span className="px-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">SQL</span>}
                  {node.services.vpn && <span className="px-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold">VPN</span>}
                </div>
              </div>
            )}

            {/* Antivirus Protection */}
            {node.antivirusStatus && (
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> EDR / Antivirus:
                </span>
                <span className={`font-bold ${node.antivirusStatus === 'PROTECTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {node.antivirusStatus}
                </span>
              </div>
            )}

            {/* Hacker node active attack */}
            {node.hackerAttackActive && (
              <div className="flex justify-between items-center font-mono bg-rose-950/40 p-1 rounded border border-rose-500/30">
                <span className="text-rose-300 font-sans flex items-center gap-1 font-bold">
                  <Skull className="w-3 h-3 text-rose-400" /> Angreppsfas:
                </span>
                <span className="text-rose-400 font-bold uppercase">{node.hackerKillChainStage || 'EXPLOIT'}</span>
              </div>
            )}
          </div>
        )}

        {/* Section 5: Warnings & Diagnostic Alerts */}
        {hasWarning && issues && issues.length > 0 && (
          <div className="pt-2 border-t border-rose-500/40 text-[9.5px] text-rose-300 space-y-1 bg-rose-950/30 p-2 rounded-xl border border-rose-500/30">
            <div className="font-bold flex items-center gap-1 text-rose-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Upptäckta Konfigurationsfel:</span>
            </div>
            {issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-1.5 font-sans leading-tight pl-1">
                <span className="text-rose-500">•</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tooltip Pointer Arrow */}
      <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-cyan-500/70 mx-auto -mt-px shadow-lg" />
    </div>
  );
};
