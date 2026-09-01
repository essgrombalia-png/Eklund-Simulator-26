import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Flame,
  Radio,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Skull,
  Lock,
  Eye,
  Crosshair,
  SlidersHorizontal,
  FileText,
  Sparkles,
  Server,
  Laptop,
  Wifi,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import { Device, Link, NetworkContainer } from '../types';
import { isHackerDevice, ATTACK_PROFILES } from '../utils/hackerEngine';

export interface ThreatAnalysis {
  node: Device;
  status: 'INFECTED' | 'HIGH_RISK' | 'SECURE' | 'OFFLINE';
  threatScore: number; // 0 - 100
  reasons: string[];
  recommendations: string[];
}

interface CyberAwarenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
  onUpdateNode: (node: Device) => void;
  onUpdateMultipleNodes: (updatedNodes: Device[]) => void;
  onSelectNodeOnCanvas: (nodeId: string) => void;
  onOpenTrafficGen?: () => void;
}

export function evaluateNodeThreat(node: Device, allNodes: Device[], links: Link[]): ThreatAnalysis {
  const reasons: string[] = [];
  const recommendations: string[] = [];
  let threatScore = 0;

  if (!node.on) {
    return {
      node,
      status: 'OFFLINE',
      threatScore: 0,
      reasons: ['Enheten är avstängd.'],
      recommendations: ['Slå på enheten om den behövs i nätverket.'],
    };
  }

  // Hacker devices themselves
  if (isHackerDevice(node.type)) {
    return {
      node,
      status: 'INFECTED',
      threatScore: 100,
      reasons: ['Fientlig Hacker-nod / C2-server aktiv.'],
      recommendations: ['Inaktivera eller ta bort hacker-noden från nätverket.'],
    };
  }

  // Check 1: Direct infection
  if (node.isInfected) {
    threatScore += 80;
    reasons.push('☣️ SMITTAD: Enheten är infekterad med skadlig kod / Ransomware.');
    recommendations.push('Sanera enheten eller isolera den från nätverket omedelbart.');
  }

  // Check 2: Currently under attack
  if (node.hackerAttackActive) {
    threatScore += 60;
    const profile = node.hackerAttackType ? ATTACK_PROFILES[node.hackerAttackType] : null;
    const attackName = profile ? profile.name : 'Okänt angrepp';
    reasons.push(`⚡ AKTIV ATTACK: Enheten utvärderas under ${attackName}.`);
    recommendations.push('Aktivera brandväggsregler eller IDS/IPS-skydd.');
  }

  // Check 3: Same subnet / reachable by a hacker node
  const hackers = allNodes.filter((n) => n.on && isHackerDevice(n.type));
  if (hackers.length > 0) {
    const isNeighborToHacker = links.some((l) => {
      const otherId = l.a === node.id ? l.b : l.b === node.id ? l.a : null;
      return otherId && hackers.some((h) => h.id === otherId);
    });

    if (isNeighborToHacker) {
      threatScore += 45;
      reasons.push('🏴‍☠️ NÄRHET: Direkt ansluten till en aktiv hacker-nod.');
      recommendations.push('Sätt upp en brandvägg eller VLAN-segmentering.');
    } else {
      // Check subnet match
      const nodeSubnet = node.ip.split('.').slice(0, 3).join('.');
      const hackerInSubnet = hackers.some((h) => h.ip.split('.').slice(0, 3).join('.') === nodeSubnet);
      if (hackerInSubnet) {
        threatScore += 30;
        reasons.push('⚠️ SUB-NET: Delar IP-undernät med en fientlig enhet.');
        recommendations.push('Segmentera känsliga servrar i separata VLAN.');
      }
    }
  }

  // Check 4: Unprotected infrastructure (No firewall rules)
  const isNetworkEquipment = ['router', 'wifi_router', 'firewall', 'l3_switch'].includes(node.type);
  if (isNetworkEquipment && (!node.firewallRules || node.firewallRules.length === 0)) {
    threatScore += 25;
    reasons.push('🛡️ SÅRBARHET: Saknar aktiva brandväggsregler.');
    recommendations.push('Lägg till brandväggsregler (blockera skadliga portar och protokoll).');
  }

  // Check 5: Exposed services without firewall rules
  if (node.services && (node.services.http || node.services.sql || node.services.vpn)) {
    if (!node.firewallRules || node.firewallRules.length === 0) {
      threatScore += 20;
      reasons.push('🔓 TJÄNST-SÅRBARHET: Exponerade HTTP/SQL-tjänster utan brandväggsfilter.');
      recommendations.push('Konfigurera brandväggsfilter för att begränsa obehörig åtkomst.');
    }
  }

  // Check 6: Antivirus / Endpoint Protection status
  const isEndpoint = !isHackerDevice(node.type) && node.type !== 'internet';
  if (isEndpoint) {
    if (node.antivirusInstalled && node.antivirusRealtimeProtection) {
      threatScore = Math.max(0, threatScore - 30);
      reasons.push('🛡️ ANTIVIRUS: EDR-realtidsskydd är aktivt och övervakar processer.');
    } else {
      threatScore += 15;
      reasons.push('⚠️ SÅRBARHET: Enheten saknar aktivt Antivirus / EDR-skydd.');
      recommendations.push('Installera och aktivera Antivirus i Antivirus-panelen.');
    }
  }

  // Determine final status
  let status: 'INFECTED' | 'HIGH_RISK' | 'SECURE' | 'OFFLINE' = 'SECURE';
  if (node.isInfected || isHackerDevice(node.type) || threatScore >= 70) {
    status = 'INFECTED';
  } else if (threatScore >= 20 || node.hackerAttackActive) {
    status = 'HIGH_RISK';
  }

  if (reasons.length === 0) {
    reasons.push('Inga kända sårbarheter eller aktiva hot upptäckta.');
    recommendations.push('Fortsätt övervaka nätverkstrafiken regelbundet.');
  }

  return {
    node,
    status,
    threatScore: Math.min(100, threatScore),
    reasons,
    recommendations,
  };
}

export const CyberAwarenessModal: React.FC<CyberAwarenessModalProps> = ({
  isOpen,
  onClose,
  nodes,
  links,
  containers = [],
  onUpdateNode,
  onUpdateMultipleNodes,
  onSelectNodeOnCanvas,
  onOpenTrafficGen,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'INFECTED' | 'HIGH_RISK' | 'SECURE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluate threat analysis for all nodes
  const threatAnalyses = nodes.map((node) => evaluateNodeThreat(node, nodes, links));

  const infectedCount = threatAnalyses.filter((t) => t.status === 'INFECTED').length;
  const highRiskCount = threatAnalyses.filter((t) => t.status === 'HIGH_RISK').length;
  const secureCount = threatAnalyses.filter((t) => t.status === 'SECURE').length;
  const offlineCount = threatAnalyses.filter((t) => t.status === 'OFFLINE').length;

  // Global Threat Level Calculation
  const totalActive = nodes.filter((n) => n.on && !isHackerDevice(n.type)).length;
  const threatRatio = totalActive > 0 ? (infectedCount * 1.0 + highRiskCount * 0.4) / totalActive : 0;
  const overallThreatScore = Math.min(100, Math.round(threatRatio * 100));

  let defconLevel = 'DEFCON 5 - NORMAL OPERATIV STATUS';
  let defconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (infectedCount > 0) {
    defconLevel = 'DEFCON 1 - KRITISKT SKADLIG KOD / INTRACTION';
    defconColor = 'text-rose-400 bg-rose-500/15 border-rose-500/50 animate-pulse';
  } else if (highRiskCount > 0) {
    defconLevel = 'DEFCON 3 - FÖRHÖJD HOTNIVÅ / SÅRBARHETER';
    defconColor = 'text-amber-400 bg-amber-500/15 border-amber-500/40';
  }

  // Filtered nodes
  const filteredAnalyses = threatAnalyses.filter((t) => {
    if (filter === 'INFECTED' && t.status !== 'INFECTED') return false;
    if (filter === 'HIGH_RISK' && t.status !== 'HIGH_RISK') return false;
    if (filter === 'SECURE' && t.status !== 'SECURE') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = t.node.name.toLowerCase().includes(q);
      const matchIp = t.node.ip.toLowerCase().includes(q);
      const matchType = t.node.type.toLowerCase().includes(q);
      return matchName || matchIp || matchType;
    }
    return true;
  });

  // Action: Sanitize / Disinfect all infected nodes
  const handleDisinfectAll = () => {
    const updated = nodes.map((n) => {
      if (n.isInfected) {
        return {
          ...n,
          isInfected: false,
          hackerAttackActive: false,
        };
      }
      return n;
    });
    onUpdateMultipleNodes(updated);
  };

  // Action: Isolate all infected nodes (turn off or disconnect)
  const handleIsolateInfected = () => {
    const updated = nodes.map((n) => {
      if (n.isInfected) {
        return {
          ...n,
          on: false,
          hackerAttackActive: false,
        };
      }
      return n;
    });
    onUpdateMultipleNodes(updated);
  };

  // Action: Enable basic firewall protection on all routers/firewalls
  const handleApplyGlobalShield = () => {
    const updated = nodes.map((n) => {
      if (['router', 'wifi_router', 'firewall', 'l3_switch'].includes(n.type)) {
        const existingRules = n.firewallRules || [];
        if (existingRules.length === 0) {
          return {
            ...n,
            firewallRules: [
              {
                id: `rule-auto-shield-${Date.now()}`,
                action: 'block' as const,
                protocol: 'MALWARE' as const,
                sourceIp: 'ANY',
                destIp: 'ANY',
                description: 'Automatisk Cyber Shield: Blockera skadlig kod och botnets',
              },
            ],
          };
        }
      }
      return n;
    });
    onUpdateMultipleNodes(updated);
  };

  const selectedAnalysis = threatAnalyses.find((t) => t.node.id === selectedNodeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-950/50">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-orbitron text-slate-100 tracking-wide">
                  CYBER AWARENESS & HOT-MAP
                </h2>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  REALTIDSÖVERVAKNING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kartläggning av skadlig kod, sårbara enheter och fientliga angrepp i nätverket.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTrafficGen && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTrafficGen();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Simulera Attack</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Threat Bar & DEFCON Banner */}
        <div className="bg-slate-900/90 p-5 border-b border-slate-800/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* DEFCON Status */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${defconColor}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono tracking-widest text-slate-300 uppercase">
                  OPERATIV DEFCON-STATUS
                </span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-sm font-black font-orbitron mt-2">
                {defconLevel}
              </div>
              <p className="text-[11px] opacity-80 mt-1">
                {infectedCount > 0
                  ? `${infectedCount} enhet(er) infekterade med skadlig kod!`
                  : highRiskCount > 0
                  ? `${highRiskCount} enhet(er) har oskyddade portar eller hot.`
                  : 'Nätverket har inga kända hot eller smittor.'}
              </p>
            </div>

            {/* Overall Threat Meter */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>NÄTVERKETS HOT-INDEX</span>
                <span className="text-rose-400 font-bold">{overallThreatScore}%</span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden my-2">
                <div
                  style={{ width: `${overallThreatScore}%` }}
                  className={`h-full transition-all duration-500 ${
                    overallThreatScore > 60
                      ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                      : overallThreatScore > 20
                      ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>SÄKERT</span>
                <span>MODERAT</span>
                <span>KRITISKT</span>
              </div>
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{infectedCount}</span>
                <span className="text-[10px] uppercase text-rose-400 font-bold">🔴 Infekterade</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{highRiskCount}</span>
                <span className="text-[10px] uppercase text-amber-400 font-bold">🟡 Sårbara</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{secureCount}</span>
                <span className="text-[10px] uppercase text-emerald-400 font-bold">🟢 Säkra</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{offlineCount}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">⚪ Offline</span>
              </div>
            </div>
          </div>

          {/* Emergency Remediation Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              SÄKERHETS-ÅTGÄRDER:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDisinfectAll}
                disabled={infectedCount === 0}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sanera Alla Smittade ({infectedCount})</span>
              </button>

              <button
                type="button"
                onClick={handleIsolateInfected}
                disabled={infectedCount === 0}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Isolera Smittade Enheter</span>
              </button>

              <button
                type="button"
                onClick={handleApplyGlobalShield}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aktivera Brandväggsskydd</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Hot-Map Canvas Grid & Details */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left 2 Columns: Hot-Map Topology Grid */}
          <div className="lg:col-span-2 p-5 overflow-y-auto space-y-4 border-r border-slate-800 custom-scrollbar">
            {/* Filter & Search Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filter === 'ALL'
                      ? 'bg-slate-800 text-slate-100 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Alla ({nodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('INFECTED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filter === 'INFECTED'
                      ? 'bg-rose-500 text-slate-950 font-black'
                      : 'text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  🔴 Smittade ({infectedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('HIGH_RISK')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filter === 'HIGH_RISK'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-amber-400 hover:bg-amber-950/40'
                  }`}
                >
                  🟡 Sårbara ({highRiskCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('SECURE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    filter === 'SECURE'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-emerald-400 hover:bg-emerald-950/40'
                  }`}
                >
                  🟢 Säkra ({secureCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Sök enhet eller IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
                />
              </div>
            </div>

            {/* Visual Hot-Map Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredAnalyses.map((item) => {
                const { node, status, threatScore, reasons } = item;
                const isSelected = selectedNodeId === node.id;

                let cardBg = 'bg-slate-950 border-slate-800';
                let statusBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    🟢 SÄKER
                  </span>
                );

                if (status === 'INFECTED') {
                  cardBg = 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-slate-950 animate-pulse font-mono">
                      🔴 INFECTED
                    </span>
                  );
                } else if (status === 'HIGH_RISK') {
                  cardBg = 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      🟡 VULNERABLE
                    </span>
                  );
                } else if (status === 'OFFLINE') {
                  cardBg = 'bg-slate-950/60 border-slate-800/80 opacity-60';
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      ⚪ OFFLINE
                    </span>
                  );
                }

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-2.5 ${cardBg} ${
                      isSelected ? 'ring-2 ring-cyan-400 scale-[1.01]' : 'hover:border-slate-700'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${
                            status === 'INFECTED'
                              ? 'bg-rose-500 animate-ping'
                              : status === 'HIGH_RISK'
                              ? 'bg-amber-400'
                              : status === 'SECURE'
                              ? 'bg-emerald-400'
                              : 'bg-slate-600'
                          }`}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                            {node.name}
                          </h4>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {node.ip || 'Ingen IP'}
                          </span>
                        </div>
                      </div>

                      {statusBadge}
                    </div>

                    {/* Threat bar */}
                    {status !== 'OFFLINE' && (
                      <div className="space-y-1 font-mono">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Hotnivå:</span>
                          <span className={status === 'INFECTED' ? 'text-rose-400 font-bold' : status === 'HIGH_RISK' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                            {threatScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${threatScore}%` }}
                            className={`h-full ${
                              threatScore > 70
                                ? 'bg-rose-500'
                                : threatScore > 20
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Primary Reason snippet */}
                    <p className="text-[11px] text-slate-300 line-clamp-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 font-sans">
                      {reasons[0]}
                    </p>

                    {/* Action footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-400 font-mono uppercase">{node.type}</span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onSelectNodeOnCanvas(node.id);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Crosshair className="w-3 h-3" />
                        <span>Fokusera</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredAnalyses.length === 0 && (
                <div className="col-span-2 p-8 text-center text-slate-500 space-y-2">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                  <p className="text-xs">Inga enheter matchar det valda filtret.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Node Detailed Threat Inspector & Remedies */}
          <div className="p-5 bg-slate-950/90 overflow-y-auto space-y-5 custom-scrollbar">
            {selectedAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">HOTANALYSERING</span>
                    <h3 className="text-sm font-bold text-slate-100">{selectedAnalysis.node.name}</h3>
                    <span className="text-xs font-mono text-cyan-400">{selectedAnalysis.node.ip}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 block">RISK-INDEX</span>
                    <span className="text-xl font-black text-rose-400">{selectedAnalysis.threatScore}%</span>
                  </div>
                </div>

                {/* Status Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-mono">{selectedAnalysis.status}</span>
                  </div>

                  {selectedAnalysis.node.isInfected && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Skull className="w-4 h-4 text-rose-400" />
                        <span>Aktiv Skadlig Kod Upptäckt</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        Enheten har kompromissats. Kan sprida skadlig kod till anslutna enheter.
                      </p>
                    </div>
                  )}

                  {selectedAnalysis.node.hackerAttackActive && (
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Cyber-attack Pågår</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        Typ: {selectedAnalysis.node.hackerAttackType || 'Standard'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reasons List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Identifierade Hot & Sårbarheter:
                  </h4>
                  <div className="space-y-1.5">
                    {selectedAnalysis.reasons.map((r, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Rekommenderade Åtgärder:
                  </h4>
                  <div className="space-y-1.5">
                    {selectedAnalysis.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Node Remediation Buttons */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  {selectedAnalysis.node.isInfected && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateNode({
                          ...selectedAnalysis.node,
                          isInfected: false,
                          hackerAttackActive: false,
                        });
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Desinficera & Rensa Skadlig Kod</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateNode({
                        ...selectedAnalysis.node,
                        on: !selectedAnalysis.node.on,
                      });
                    }}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      selectedAnalysis.node.on
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    <span>{selectedAnalysis.node.on ? 'Stäng av enhet (Isolera)' : 'Starta enhet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectNodeOnCanvas(selectedAnalysis.node.id);
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    <span>Öppna i Nätverkstopologi & Inspektör</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <Flame className="w-10 h-10 text-rose-500/40 animate-pulse" />
                <p className="text-xs">
                  Välj en enhet i Hot-Map matrisen till vänster för att granska dess detaljerade sårbarhetsanalys och vidta skyddsåtgärder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
