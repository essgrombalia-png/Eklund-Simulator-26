import React, { useState } from 'react';
import {
  X,
  Trash2,
  Power,
  Shield,
  Wifi,
  Globe,
  Plus,
  Network,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  GitCompare,
  Zap,
  Radio,
  Terminal,
  ArrowRightLeft,
  Check,
  Info,
  Cable,
  Layers,
  Cloud,
  Box,
  Building,
  Server,
  Minimize2,
  Maximize2,
  Skull,
  ShieldAlert,
  ShieldCheck,
  Play,
  Square,
  Crosshair,
  Bot,
  Flame,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Fingerprint,
  Cpu,
  Radio as Radar,
  Unlock,
  Thermometer,
  Volume2,
  VolumeX,
  Video,
  Sun,
} from 'lucide-react';
import { Device, Link, FirewallRule, DnsRecord, CableType, NetworkContainer, IotRule, IotRuleTrigger, IotRuleAction } from '../types';
import { detectNodeWarnings } from '../utils/networkEngine';
import {
  CABLE_DEFINITIONS,
  validateCableCompatibility,
} from '../utils/cableEngine';
import {
  ATTACK_PROFILES,
  findReachableTargetsForHacker,
  calculateNodeAttackImpactAndHealth,
  isHackerDevice,
  isIoTDevice,
  evaluateIotRulesForDevice,
} from '../utils/hackerEngine';
import { RealisticDeviceIcon } from './RealisticDeviceIcon';

interface InspectorProps {
  selectedNode: Device | null;
  selectedLink: Link | null;
  selectedContainer?: NetworkContainer | null;
  containers?: NetworkContainer[];
  nodes: Device[];
  links?: Link[];
  onClose: () => void;
  onUpdateNode: (node: Device) => void;
  onUpdateMultipleNodes?: (nodes: Device[]) => void;
  onDeleteNode: (id: string) => void;
  onUpdateLink: (link: Link) => void;
  onDeleteLink: (id: string) => void;
  onOpenIpModal?: (node: Device) => void;
  onAddLink?: (a: string, b: string, cableType?: CableType) => void;
  onOpenAutoRepair?: () => void;
  onAutoRepairNode?: (nodeId: string) => void;
  onOpenContainerModal?: (c?: NetworkContainer | null, initialNodeIds?: string[]) => void;
  onUpdateContainer?: (c: NetworkContainer) => void;
  onDeleteContainer?: (id: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedNode,
  selectedLink,
  selectedContainer,
  containers = [],
  nodes,
  links = [],
  onClose,
  onUpdateNode,
  onUpdateMultipleNodes,
  onDeleteNode,
  onUpdateLink,
  onDeleteLink,
  onOpenIpModal,
  onAddLink,
  onOpenAutoRepair,
  onAutoRepairNode,
  onOpenContainerModal,
  onUpdateContainer,
  onDeleteContainer,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [quickConnectTargetId, setQuickConnectTargetId] = useState<string>('');
  const [quickConnectCableType, setQuickConnectCableType] = useState<CableType>('auto');
  const [copiedMac, setCopiedMac] = useState(false);

  // New Firewall Rule state
  const [newFwAction, setNewFwAction] = useState<'allow' | 'block'>('block');
  const [newFwProto, setNewFwProto] = useState<
    'ALL' | 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'MALWARE'
  >('HTTP');
  const [newFwSrc, setNewFwSrc] = useState('*');
  const [newFwDst, setNewFwDst] = useState('*');
  const [newFwDesc, setNewFwDesc] = useState('');
  const [isFixingNode, setIsFixingNode] = useState(false);
  const [fixSuccessMessage, setFixSuccessMessage] = useState<string | null>(null);

  // IoT IFTTT Rule state
  const [newRuleTrigger, setNewRuleTrigger] = useState<IotRuleTrigger>('hacker_in_subnet');
  const [newRuleAction, setNewRuleAction] = useState<IotRuleAction>('turn_off');
  const [newRuleCustomName, setNewRuleCustomName] = useState<string>('');

  if (!selectedNode && !selectedLink && !selectedContainer) return null;

  // Auto-generate next available IP in 192.168.1.x subnet
  const handleAutoDhcp = (node: Device) => {
    const usedLastOctets = new Set(
      nodes
        .filter((n) => n.id !== node.id && n.ip && n.ip.startsWith('192.168.1.'))
        .map((n) => {
          const parts = n.ip.split('.');
          return parseInt(parts[3], 10);
        })
        .filter((val) => !isNaN(val))
    );

    let nextOctet = 10;
    while (usedLastOctets.has(nextOctet) && nextOctet < 254) {
      nextOctet++;
    }

    onUpdateNode({
      ...node,
      ip: `192.168.1.${nextOctet}`,
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
    });
  };

  // Generate random MAC address
  const handleRandomizeMac = (node: Device) => {
    const r = () => Math.floor(16 + Math.random() * 239).toString(16).toUpperCase();
    const newMac = `00:50:56:${r()}:${r()}:${r()}`;
    onUpdateNode({
      ...node,
      mac: newMac,
    });
  };

  const handleCopyMac = (macStr: string) => {
    navigator.clipboard.writeText(macStr);
    setCopiedMac(true);
    setTimeout(() => setCopiedMac(false), 2000);
  };

  // Batch toggle for all devices
  const handleBatchToggleVisibility = (showIp: boolean, showMac: boolean) => {
    if (onUpdateMultipleNodes) {
      const updatedAll = nodes.map((n) => ({
        ...n,
        showIpOnCanvas: showIp,
        showMacOnCanvas: showMac,
      }));
      onUpdateMultipleNodes(updatedAll);
    } else {
      nodes.forEach((n) => {
        onUpdateNode({
          ...n,
          showIpOnCanvas: showIp,
          showMacOnCanvas: showMac,
        });
      });
    }
  };

  return (
    <aside
      onMouseDown={(e) => e.stopPropagation()}
      className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden shrink-0 shadow-2xl z-30 animate-slide-left select-text"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-wider">
            {selectedNode ? 'Enhetskonfiguration' : 'Kabelkonfiguration'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {selectedNode && (() => {
          const nodeWarning = detectNodeWarnings(selectedNode, nodes, links);
          return (
            <>
              {/* Device Visual Title Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  <RealisticDeviceIcon type={selectedNode.type} size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 text-sm truncate">{selectedNode.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono tracking-tight uppercase">
                    {selectedNode.type} &bull; {selectedNode.ip || 'Ingen IP'}
                  </div>
                </div>
              </div>

              {/* Warning Notification Alert Box */}
              {nodeWarning.hasWarning && (
                <div className="bg-gradient-to-br from-rose-950/80 to-rose-900/40 border border-rose-500/70 p-3.5 rounded-xl space-y-2.5 text-rose-200 shadow-xl shadow-rose-950/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                      <span className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                      </span>
                      <span>Konfigurationsfel upptäckt</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold">
                      {nodeWarning.issues.length} {nodeWarning.issues.length === 1 ? 'problem' : 'problem'}
                    </span>
                  </div>

                  <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-200/90 leading-snug bg-slate-950/60 p-2.5 rounded-lg border border-rose-500/20">
                    {nodeWarning.issues.map((issue, idx) => (
                      <li key={idx} className="break-words">{issue}</li>
                    ))}
                  </ul>

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isFixingNode}
                      onClick={() => {
                        setIsFixingNode(true);
                        setFixSuccessMessage(null);

                        setTimeout(() => {
                          if (onAutoRepairNode) {
                            onAutoRepairNode(selectedNode.id);
                          } else if (onOpenAutoRepair) {
                            onOpenAutoRepair();
                          }
                          setIsFixingNode(false);
                          setFixSuccessMessage('Enheten har reparerats och optimerats!');
                          setTimeout(() => setFixSuccessMessage(null), 3500);
                        }, 250);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition-all cursor-pointer disabled:opacity-60"
                    >
                      <Sparkles className={`w-4 h-4 fill-slate-950 ${isFixingNode ? 'animate-spin' : 'animate-pulse'}`} />
                      <span>{isFixingNode ? 'Reparerar enhet...' : 'Fixa denna enhet automatiskt'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Temporary Fix Success Banner */}
              {fixSuccessMessage && !nodeWarning.hasWarning && (
                <div className="bg-emerald-950/70 border border-emerald-500/60 p-3 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs shadow-lg shadow-emerald-950/40 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{fixSuccessMessage}</span>
                </div>
              )}

              {/* Power Switch & Status */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Power className="w-4 h-4 text-cyan-400" />
                  <span>Strömförsörjning</span>
                </span>
                <button
                  onClick={() =>
                    onUpdateNode({ ...selectedNode, on: !selectedNode.on })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedNode.on
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedNode.on ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                    }`}
                  />
                  <span>{selectedNode.on ? 'Aktiv (PÅ)' : 'Avstängd'}</span>
                </button>
              </div>
            </div>

            {/* Live Cyber Health & Attack Impact Monitor */}
            {!isHackerDevice(selectedNode.type) && (() => {
              const healthStatus = calculateNodeAttackImpactAndHealth(selectedNode, nodes);
              return (
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    healthStatus.isUnderAttack
                      ? 'bg-rose-950/40 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse'
                      : healthStatus.impactScore > 0
                      ? 'bg-amber-950/30 border-amber-500/50'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Shield className={`w-3.5 h-3.5 ${healthStatus.color.textClass}`} />
                      <span className="text-slate-200">Enhetens Hälsa & Säkerhet</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${healthStatus.color.borderClass} ${healthStatus.color.textClass} bg-slate-900`}
                    >
                      {healthStatus.isUnderAttack
                        ? '⚡ ANGREPP PÅGÅR'
                        : healthStatus.isInfected
                        ? '☣️ INFEKTERAD'
                        : `${healthStatus.health}% OPTIMAL`}
                    </span>
                  </div>

                  {/* Health Bar Track */}
                  <div className="w-full bg-slate-900 p-0.5 rounded-full border border-slate-800 h-3 overflow-hidden flex items-center">
                    <div
                      className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{
                        width: `${Math.max(6, healthStatus.health)}%`,
                        backgroundColor: healthStatus.color.hex,
                        boxShadow: `0 0 10px ${healthStatus.color.glow}`,
                      }}
                    >
                      {healthStatus.isUnderAttack && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] mt-2 font-mono">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Hälsa:</span>
                      <strong className={healthStatus.color.textClass}>
                        {healthStatus.health}%
                      </strong>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Attack Impact:</span>
                      <strong
                        className={
                          healthStatus.impactScore > 50
                            ? 'text-rose-400 font-bold'
                            : healthStatus.impactScore > 20
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {healthStatus.impactScore} / 100
                      </strong>
                    </div>
                  </div>

                  {healthStatus.isUnderAttack && healthStatus.attackerName && (
                    <div className="mt-2 pt-2 border-t border-rose-950/60 text-[9.5px] font-mono text-rose-300 flex items-center justify-between">
                      <span>Angripare: {healthStatus.attackerName}</span>
                      <span className="uppercase text-[8.5px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-300">
                        {healthStatus.activeAttackType}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Antivirus & EDR Endpoint Protection Card */}
            {!isHackerDevice(selectedNode.type) && selectedNode.type !== 'internet' && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200 text-xs tracking-tight">
                      Antivirus & EDR-skydd
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      selectedNode.antivirusInstalled && selectedNode.antivirusRealtimeProtection
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : selectedNode.isInfected
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {selectedNode.isInfected
                      ? '☣️ INFEKTERAD'
                      : selectedNode.antivirusInstalled && selectedNode.antivirusRealtimeProtection
                      ? '🟢 SKYDDAD'
                      : '⚪ OSKYDDAD'}
                  </span>
                </div>

                {/* Antivirus Engine Status */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Antivirus Motor:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const isInstalled = !selectedNode.antivirusInstalled;
                        onUpdateNode({
                          ...selectedNode,
                          antivirusInstalled: isInstalled,
                          antivirusRealtimeProtection: isInstalled,
                          antivirusAutoQuarantine: isInstalled,
                          antivirusStatus: selectedNode.isInfected
                            ? 'INFECTED'
                            : isInstalled
                            ? 'PROTECTED'
                            : 'NOT_INSTALLED',
                          antivirusLastScan: isInstalled ? 'Just nu' : selectedNode.antivirusLastScan,
                        });
                      }}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition cursor-pointer ${
                        selectedNode.antivirusInstalled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {selectedNode.antivirusInstalled ? 'Installerad (TILL)' : 'Installera Antivirus'}
                    </button>
                  </div>

                  {selectedNode.antivirusInstalled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Realtidsskydd:</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateNode({
                              ...selectedNode,
                              antivirusRealtimeProtection: !selectedNode.antivirusRealtimeProtection,
                            });
                          }}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition cursor-pointer ${
                            selectedNode.antivirusRealtimeProtection
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {selectedNode.antivirusRealtimeProtection ? 'Aktivt' : 'Inaktivt'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Auto-Karantän:</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateNode({
                              ...selectedNode,
                              antivirusAutoQuarantine: !selectedNode.antivirusAutoQuarantine,
                            });
                          }}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition cursor-pointer ${
                            selectedNode.antivirusAutoQuarantine
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {selectedNode.antivirusAutoQuarantine ? 'Aktiv' : 'Inaktiv'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>Senaste Skanning:</span>
                        <span className="text-slate-300">{selectedNode.antivirusLastScan || 'Aldrig'}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Blockerade Hot:</span>
                        <span className="text-cyan-400 font-bold">{selectedNode.antivirusThreatsBlocked || 0} st</span>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nowStr = new Date().toLocaleTimeString();
                        const wasInfected = selectedNode.isInfected;
                        onUpdateNode({
                          ...selectedNode,
                          antivirusInstalled: true,
                          isInfected: false,
                          hackerAttackActive: false,
                          antivirusStatus: 'PROTECTED',
                          antivirusLastScan: nowStr,
                          antivirusThreatsBlocked:
                            (selectedNode.antivirusThreatsBlocked || 0) + (wasInfected ? 1 : 0),
                          antivirusLogs: [
                            ...(selectedNode.antivirusLogs || []),
                            `[${nowStr}] Punkt-skanning genomförd. ${
                              wasInfected ? '☣️ Skadlig kod sanerad!' : '🟢 Inga hot hittades.'
                            }`,
                          ],
                        });
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{selectedNode.isInfected ? 'Rensa & Sanera Hot' : 'Skanna Enhet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General Identity & IP Config */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                  Allmänt & Nätverkskort
                </div>
                {onOpenIpModal && (
                  <button
                    type="button"
                    onClick={() => onOpenIpModal(selectedNode)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Utökad IP-meny
                  </button>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Namn</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) =>
                    onUpdateNode({ ...selectedNode, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>

              {/* IP Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAutoDhcp(selectedNode)}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[10.5px] font-semibold transition border border-slate-700/60 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Auto-DHCP
                </button>
                {onOpenIpModal && (
                  <button
                    type="button"
                    onClick={() => onOpenIpModal(selectedNode)}
                    className="py-1.5 px-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded-lg text-[10.5px] font-semibold transition border border-cyan-500/30 flex items-center justify-center gap-1"
                  >
                    IP-Dialog
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-medium">
                      IP-adress
                    </label>
                  </div>
                  <input
                    type="text"
                    value={selectedNode.ip || ''}
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, ip: e.target.value })
                    }
                    placeholder="192.168.1.X"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    Subnätmask
                  </label>
                  <input
                    type="text"
                    value={selectedNode.subnetMask || ''}
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, subnetMask: e.target.value })
                    }
                    placeholder="255.255.255.0"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Default Gateway
                </label>
                <input
                  type="text"
                  value={selectedNode.gateway || ''}
                  onChange={(e) =>
                    onUpdateNode({ ...selectedNode, gateway: e.target.value })
                  }
                  placeholder="192.168.1.1"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none"
                />
              </div>

              {/* MAC Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MAC-adress (L2 Hårdvara)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyMac(selectedNode.mac || '00:50:56:00:00:00')}
                      className="text-[10px] text-slate-400 hover:text-cyan-300 transition flex items-center gap-1"
                      title="Kopiera MAC-adress"
                    >
                      {copiedMac ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Kopierad</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopiera</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRandomizeMac(selectedNode)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                      title="Slumpa en ny unik MAC-adress"
                    >
                      <RefreshCw className="w-3 h-3" /> Slumpa
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={selectedNode.mac || ''}
                  onChange={(e) =>
                    onUpdateNode({ ...selectedNode, mac: e.target.value })
                  }
                  placeholder="00:50:56:XX:XX:XX"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-1.5 text-emerald-300 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  VLAN ID (1-4094)
                </label>
                <input
                  type="number"
                  value={selectedNode.vlanId || 1}
                  onChange={(e) =>
                    onUpdateNode({
                      ...selectedNode,
                      vlanId: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Canvas On-Screen Display / Visibility Controls */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200 text-xs tracking-tight">
                    Canvas-visning & Etiketter
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Direkt på Canvas
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Välj om enhetens IP-adress och MAC-hårdvaruadress ska visas synligt bredvid ikonen på canvasen.
              </p>

              {/* IP Toggle Card */}
              <div
                onClick={() => {
                  const currentVal = selectedNode.showIpOnCanvas !== false;
                  onUpdateNode({
                    ...selectedNode,
                    showIpOnCanvas: !currentVal,
                  });
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                  selectedNode.showIpOnCanvas !== false
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      selectedNode.showIpOnCanvas !== false
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {selectedNode.showIpOnCanvas !== false ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <span>Visa IP-adress på canvas</span>
                      {selectedNode.showIpOnCanvas !== false && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {selectedNode.showIpOnCanvas !== false ? (
                        <span className="text-cyan-300 font-mono">
                          {selectedNode.type === 'internet' ? 'WAN Gateway' : selectedNode.ip || 'DHCP...'} (Synlig)
                        </span>
                      ) : (
                        <span>Dold på canvas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Switch Graphic */}
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    selectedNode.showIpOnCanvas !== false ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  } flex items-center shrink-0`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </div>
              </div>

              {/* MAC Toggle Card */}
              <div
                onClick={() => {
                  const currentVal = !!selectedNode.showMacOnCanvas;
                  onUpdateNode({
                    ...selectedNode,
                    showMacOnCanvas: !currentVal,
                  });
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                  selectedNode.showMacOnCanvas
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      selectedNode.showMacOnCanvas
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <span>Visa MAC-adress på canvas</span>
                      {selectedNode.showMacOnCanvas && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {selectedNode.showMacOnCanvas ? (
                        <span className="text-emerald-300 font-mono">
                          {selectedNode.mac || '00:50:56:...'} (Synlig)
                        </span>
                      ) : (
                        <span>Dold på canvas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Switch Graphic */}
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    selectedNode.showMacOnCanvas ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  } flex items-center shrink-0`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </div>
              </div>

              {/* Batch Actions */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchToggleVisibility(true, true)}
                  className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 rounded-lg text-[10px] font-semibold transition border border-slate-800 flex items-center justify-center gap-1"
                  title="Visa både IP och MAC för samtliga noder på ritytan"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Visa alla på canvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchToggleVisibility(true, false)}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-semibold transition border border-slate-800 flex items-center justify-center gap-1"
                  title="Dölj MAC för alla enheter (Standardvy)"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Återställ</span>
                </button>
              </div>
            </div>

            {/* Wi-Fi Range Config */}
            {(selectedNode.type === 'wifi_ap' || selectedNode.type === 'wifi_router') && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-teal-400 flex items-center gap-1.5">
                  <Wifi className="w-4 h-4" />
                  <span>Wi-Fi Täckningsradie</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="350"
                  value={selectedNode.wifiCoverageRadius || 150}
                  onChange={(e) =>
                    onUpdateNode({
                      ...selectedNode,
                      wifiCoverageRadius: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="text-right text-[11px] font-mono text-slate-400">
                  {selectedNode.wifiCoverageRadius || 150} px
                </div>
              </div>
            )}

            {/* IoT Remote Control & Terminal Console */}
            {isIoTDevice(selectedNode.type) && (() => {
              const isIotActive = selectedNode.iotState !== false;

              const getIotConfig = (type: string) => {
                switch (type) {
                  case 'iot_light':
                    return {
                      title: 'Smart Belysning (Ljusstyrning)',
                      protocol: 'MQTT / Zigbee 3.0',
                      topic: 'home/lighting/livingroom/state',
                      activeText: '💡 TÄND (100% Ljusstyrka - 4500K Varmvit)',
                      inactiveText: '🌙 SLÄCKT (0% Ljusstyrka - Passiv)',
                      toggleActionText: isIotActive ? 'Släck belysning' : 'Tänd belysning',
                      activeBg: 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                      inactiveBg: 'bg-slate-900/60 border-slate-800 text-slate-400',
                      badgeActive: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      badgeInactive: 'bg-slate-800 text-slate-500 border-slate-700',
                      icon: <Sun className={`w-5 h-5 ${isIotActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />,
                      payloadOn: JSON.stringify({ state: 'ON', brightness: 100, color_temp: 4500 }),
                      payloadOff: JSON.stringify({ state: 'OFF', brightness: 0 }),
                    };
                  case 'iot_smartlock':
                    return {
                      title: 'Smart Dörrlås (Säkerhetsbult)',
                      protocol: 'Z-Wave Plus / MQTT',
                      topic: 'security/access/frontdoor/lock',
                      activeText: '🔒 LÅST (Säkerhetsbult Tillslag)',
                      inactiveText: '🔓 UPPLÅST (Fri Tillgång / Öppen)',
                      toggleActionText: isIotActive ? 'Lås upp dörr' : 'Lås dörr',
                      activeBg: 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                      inactiveBg: 'bg-amber-950/30 border-amber-500/50 text-amber-300',
                      badgeActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                      badgeInactive: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      icon: isIotActive ? <Lock className="w-5 h-5 text-emerald-400" /> : <Unlock className="w-5 h-5 text-amber-400" />,
                      payloadOn: JSON.stringify({ door_lock: 'LOCKED', bolt: 'ENGAGED', pin_auth: true }),
                      payloadOff: JSON.stringify({ door_lock: 'UNLOCKED', bolt: 'RETRACTED' }),
                    };
                  case 'iot_thermostat':
                    return {
                      title: 'Smart Termostat (Klimatstyrning)',
                      protocol: 'BACnet / IP / MQTT',
                      topic: 'hvac/thermostat/main/target_temp',
                      activeText: '🔥 KOMFORTLÄGE (Måltemp 22.5°C Aktiv)',
                      inactiveText: '❄️ SPARLÄGE / ECO (Måltemp 16.0°C)',
                      toggleActionText: isIotActive ? 'Växla till Sparläge' : 'Växla till Komfortläge',
                      activeBg: 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
                      inactiveBg: 'bg-blue-950/30 border-blue-500/50 text-blue-300',
                      badgeActive: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                      badgeInactive: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                      icon: <Thermometer className={`w-5 h-5 ${isIotActive ? 'text-rose-400' : 'text-blue-400'}`} />,
                      payloadOn: JSON.stringify({ mode: 'HEAT', target_temp: 22.5, fan: 'AUTO' }),
                      payloadOff: JSON.stringify({ mode: 'ECO', target_temp: 16.0, fan: 'LOW' }),
                    };
                  case 'iot_camera':
                  case 'client_camera':
                    return {
                      title: 'IP-Övervakningskamera (RTSP)',
                      protocol: 'RTSP / ONVIF v2.4',
                      topic: 'security/cam/stream0/control',
                      activeText: '📹 LIVE STREAMING (1080p60 H.264)',
                      inactiveText: '⏸️ STRÖM PAUSAD (Integritetsläge)',
                      toggleActionText: isIotActive ? 'Pausa Videoström' : 'Starta Videoström',
                      activeBg: 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
                      inactiveBg: 'bg-slate-900/60 border-slate-800 text-slate-400',
                      badgeActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                      badgeInactive: 'bg-slate-800 text-slate-500 border-slate-700',
                      icon: <Video className={`w-5 h-5 ${isIotActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />,
                      payloadOn: JSON.stringify({ rtsp_stream: 'ACTIVE', fps: 60, resolution: '1920x1080' }),
                      payloadOff: JSON.stringify({ rtsp_stream: 'MUTED', privacy_shade: true }),
                    };
                  case 'iot_sensor':
                    return {
                      title: 'IoT Telemetrisensor',
                      protocol: 'CoAP / UDP / MQTT',
                      topic: 'sensors/telemetry/env/data',
                      activeText: '📡 AKTIV RAPPORTERING (Period: 5 sek)',
                      inactiveText: '💤 STANDBY (Passivt läge)',
                      toggleActionText: isIotActive ? 'Sätt i Standby' : 'Starta Telemetri',
                      activeBg: 'bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
                      inactiveBg: 'bg-slate-900/60 border-slate-800 text-slate-400',
                      badgeActive: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                      badgeInactive: 'bg-slate-800 text-slate-500 border-slate-700',
                      icon: <Activity className={`w-5 h-5 ${isIotActive ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`} />,
                      payloadOn: JSON.stringify({ sensor_rate: '5s', status: 'TRANSMITTING', metrics: ['temp', 'humidity', 'co2'] }),
                      payloadOff: JSON.stringify({ sensor_rate: 'DISABLED', status: 'SLEEP' }),
                    };
                  case 'iot_plc':
                    return {
                      title: 'PLC Industriell Styrenhet (SCADA)',
                      protocol: 'Modbus TCP / OPC UA',
                      topic: 'scada/plc/unit01/control',
                      activeText: '⚙️ STATUS: RUN (Industriellt driftläge)',
                      inactiveText: '🛑 STATUS: STOP (Manuell Nödstopp)',
                      toggleActionText: isIotActive ? 'Nödstopp PLC (STOP)' : 'Starta PLC (RUN)',
                      activeBg: 'bg-purple-950/40 border-purple-500/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
                      inactiveBg: 'bg-rose-950/30 border-rose-500/50 text-rose-300',
                      badgeActive: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                      badgeInactive: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                      icon: <Cpu className={`w-5 h-5 ${isIotActive ? 'text-purple-400' : 'text-rose-400'}`} />,
                      payloadOn: JSON.stringify({ plc_state: 'RUN', watchdog: 'OK', coils: [1, 1, 0, 1] }),
                      payloadOff: JSON.stringify({ plc_state: 'STOP', watchdog: 'HALTED' }),
                    };
                  case 'iot_speaker':
                    return {
                      title: 'Smart Nätverkshögtalare',
                      protocol: 'AirPlay 2 / DLNA / MQTT',
                      topic: 'media/speaker/livingroom/playback',
                      activeText: '🔊 SPELAR LJUD (75 dB Ljudnivå)',
                      inactiveText: '🔇 TYST / MUTED',
                      toggleActionText: isIotActive ? 'Tysta Högtalare (Mute)' : 'Spela Ljud (Unmute)',
                      activeBg: 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
                      inactiveBg: 'bg-slate-900/60 border-slate-800 text-slate-400',
                      badgeActive: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                      badgeInactive: 'bg-slate-800 text-slate-500 border-slate-700',
                      icon: isIotActive ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />,
                      payloadOn: JSON.stringify({ playback: 'PLAYING', volume: 75, track: 'Audio Stream #1' }),
                      payloadOff: JSON.stringify({ playback: 'PAUSED', volume: 0, mute: true }),
                    };
                  case 'iot_smart_meter':
                    return {
                      title: 'Smart Elmätare (Energitelemetri)',
                      protocol: 'DLMS / COSEM / IP',
                      topic: 'grid/meter/household/power',
                      activeText: '⚡ REALTIDSAVLÄSNING (3.45 kW Last)',
                      inactiveText: '🔌 MÄTNING FRÅNKOPPLAD',
                      toggleActionText: isIotActive ? 'Koppla från Mätare' : 'Starta Mätning',
                      activeBg: 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                      inactiveBg: 'bg-slate-900/60 border-slate-800 text-slate-400',
                      badgeActive: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      badgeInactive: 'bg-slate-800 text-slate-500 border-slate-700',
                      icon: <Zap className={`w-5 h-5 ${isIotActive ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />,
                      payloadOn: JSON.stringify({ meter_status: 'ONLINE', power_kw: 3.45, voltage: 230.2 }),
                      payloadOff: JSON.stringify({ meter_status: 'DISCONNECTED', power_kw: 0.0 }),
                    };
                  default: // iot_gateway, etc.
                    return {
                      title: 'IoT Edge Gateway',
                      protocol: 'MQTT Broker Relay',
                      topic: 'iot/gateway/broker/status',
                      activeText: '🌐 MQTT BROKER RELAY: ONLINE',
                      inactiveText: '⚠️ BROKER STANDBY / BYPASS',
                      toggleActionText: isIotActive ? 'Pausa Gateway Relay' : 'Starta Gateway Relay',
                      activeBg: 'bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
                      inactiveBg: 'bg-slate-900/60 border-slate-800 text-slate-400',
                      badgeActive: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                      badgeInactive: 'bg-slate-800 text-slate-500 border-slate-700',
                      icon: <Globe className={`w-5 h-5 ${isIotActive ? 'text-teal-400' : 'text-slate-500'}`} />,
                      payloadOn: JSON.stringify({ gateway_status: 'RUNNING', clients_connected: 8 }),
                      payloadOff: JSON.stringify({ gateway_status: 'STANDBY', clients_connected: 0 }),
                    };
                }
              };

              const iotConfig = getIotConfig(selectedNode.type);

              const handleToggleIotState = () => {
                const nextState = !isIotActive;
                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const payload = nextState ? iotConfig.payloadOn : iotConfig.payloadOff;
                const newLogEntry = `[${timestamp}] MQTT > mosquitto_pub -h ${selectedNode.ip || '192.168.1.X'} -t "${iotConfig.topic}" -m '${payload}'\n[${timestamp}] ACK 200 OK > Remote device state updated -> [${nextState ? 'ACTIVE / ON' : 'INACTIVE / OFF'}]`;
                
                const updatedLogs = [newLogEntry, ...(selectedNode.iotLogs || []).slice(0, 15)];

                onUpdateNode({
                  ...selectedNode,
                  iotState: nextState,
                  iotLogs: updatedLogs,
                });
              };

              const handleRunTerminalCommand = (cmdType: 'ping' | 'diagnose' | 'reset' | 'clear') => {
                if (cmdType === 'clear') {
                  onUpdateNode({
                    ...selectedNode,
                    iotLogs: [],
                  });
                  return;
                }

                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const ip = selectedNode.ip || '192.168.1.100';
                let log = '';

                if (cmdType === 'ping') {
                  log = `[${timestamp}] CLI > ping -c 3 ${ip}\n64 bytes from ${ip}: icmp_seq=1 ttl=64 time=1.24 ms\n64 bytes from ${ip}: icmp_seq=2 ttl=64 time=1.08 ms\n--- ${ip} ping statistics --- 0% packet loss, rtt avg = 1.16 ms`;
                } else if (cmdType === 'diagnose') {
                  log = `[${timestamp}] CLI > curl -s http://${ip}/api/v1/diagnostics\n{"device": "${selectedNode.name}", "ip": "${ip}", "mac": "${selectedNode.mac || '00:50:56:FE:01:A9'}", "protocol": "${iotConfig.protocol}", "status": "${isIotActive ? 'HEALTHY_ACTIVE' : 'HEALTHY_STANDBY'}", "rssi": "-42 dBm"}`;
                } else if (cmdType === 'reset') {
                  log = `[${timestamp}] CLI > ssh admin@${ip} "systemctl restart iot-device.service"\n[+] Stopping IoT daemon...\n[+] Re-initializing hardware registers...\n[+] Service restarted successfully (PID: 4092)`;
                }

                onUpdateNode({
                  ...selectedNode,
                  iotLogs: [log, ...(selectedNode.iotLogs || []).slice(0, 15)],
                });
              };

              return (
                <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/40 space-y-3.5 shadow-xl shadow-teal-950/20">
                  {/* IoT Terminal Panel Header */}
                  <div className="flex items-center justify-between border-b border-teal-950/60 pb-2">
                    <div className="flex items-center gap-2 text-teal-300">
                      <Terminal className="w-4 h-4 text-teal-400" />
                      <span className="font-orbitron font-extrabold tracking-wider uppercase text-xs">
                        IoT Fjärrstyrning & Terminal
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {iotConfig.protocol}
                    </span>
                  </div>

                  {/* Device Feature Card & Primary Interactive Toggle Button */}
                  <div className={`p-3 rounded-xl border transition-all ${isIotActive ? iotConfig.activeBg : iotConfig.inactiveBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                          {iotConfig.icon}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100">{iotConfig.title}</div>
                          <div className="text-[10px] opacity-80 font-mono mt-0.5">{iotConfig.topic}</div>
                        </div>
                      </div>
                      <span className={`text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${isIotActive ? iotConfig.badgeActive : iotConfig.badgeInactive}`}>
                        {isIotActive ? 'AKTIV' : 'AVSTÄNGD'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold my-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono">
                      {isIotActive ? iotConfig.activeText : iotConfig.inactiveText}
                    </div>

                    {/* INTERACTIVE TOGGLE BUTTON */}
                    <button
                      type="button"
                      onClick={handleToggleIotState}
                      className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between border shadow-lg ${
                        isIotActive
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border-teal-400 shadow-teal-950/40'
                          : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${isIotActive ? 'text-amber-300 animate-bounce' : 'text-slate-400'}`} />
                        <span>Fjärrstyrning: {iotConfig.toggleActionText}</span>
                      </div>

                      {/* Switch graphic */}
                      <div
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          isIotActive ? 'bg-emerald-400 justify-end' : 'bg-slate-600 justify-start'
                        } flex items-center shrink-0 ml-2`}
                      >
                        <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
                      </div>
                    </button>
                  </div>

                  {/* Interactive Command Line Terminal Console */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-teal-400" />
                        <span>Terminal Konsol & Kommandon</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRunTerminalCommand('clear')}
                        className="text-[9.5px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      >
                        Rensa logg
                      </button>
                    </div>

                    {/* Quick Command Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRunTerminalCommand('ping')}
                        className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 hover:border-teal-500/40 rounded text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>⚡ PING</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRunTerminalCommand('diagnose')}
                        className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>🔍 DIAG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRunTerminalCommand('reset')}
                        className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>🔄 REBOOT</span>
                      </button>
                    </div>

                    {/* CLI Output Log Window */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px] text-slate-300 space-y-2 max-h-44 overflow-y-auto custom-scrollbar select-text">
                      {selectedNode.iotLogs && selectedNode.iotLogs.length > 0 ? (
                        selectedNode.iotLogs.map((logStr, i) => (
                          <pre key={i} className="whitespace-pre-wrap leading-relaxed border-b border-slate-900 pb-1.5 last:border-0 last:pb-0 text-emerald-400/90">
                            {logStr}
                          </pre>
                        ))
                      ) : (
                        <div className="text-slate-500 space-y-1">
                          <p className="text-teal-400/90">admin@iot-console:~$ connect {selectedNode.ip || '192.168.1.X'} --proto={iotConfig.protocol}</p>
                          <p>[+] Ansluten till {selectedNode.name} på port 1883/MQTT.</p>
                          <p className="text-slate-600 text-[9.5px] font-sans">Klicka på "Fjärrstyrning"-knappen ovan eller kör snabbkommando för att sända paket i realtid.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logik-editor (IFTTT Automation Rules) */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-teal-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="font-orbitron font-extrabold tracking-wider uppercase text-xs">
                          Logik-editor (IFTTT-Regler)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const { updatedNode } = evaluateIotRulesForDevice(selectedNode, nodes, containers);
                          onUpdateNode(updatedNode);
                        }}
                        className="px-2 py-1 bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-500/40 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Kör utvärdering av regler nu"
                      >
                        <Play className="w-3 h-3 text-teal-300" />
                        <span>Kör logikkontroll</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Skapa automatiska villkorsregler för fjärrstyrning och nätverksskydd.
                    </p>

                    {/* Active Rules List */}
                    <div className="space-y-2">
                      {(!selectedNode.iotRules || selectedNode.iotRules.length === 0) ? (
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-500 text-center font-mono">
                          Inga IFTTT-regler aktiverade än.
                        </div>
                      ) : (
                        selectedNode.iotRules.map((rule) => {
                          const getTriggerText = (t: string) => {
                            switch (t) {
                              case 'hacker_in_subnet': return 'OM Hacker-enhet detekteras i samma subnät';
                              case 'hacker_attack_active': return 'OM Cyberattack pågår i nätverket';
                              case 'device_infected': return 'OM Enheten eller granne smittats';
                              default: return 'OM Nätverkshändelse sker';
                            }
                          };

                          const getActionText = (a: string) => {
                            switch (a) {
                              case 'turn_off': return 'SÅ Stäng av enheten (OFF)';
                              case 'turn_on': return 'SÅ Slå på enheten (ON)';
                              case 'lock_device': return 'SÅ Aktivera nödlås';
                              case 'log_alert': return 'SÅ Logga larm i konsolen';
                              default: return 'SÅ Utför åtgärd';
                            }
                          };

                          return (
                            <div key={rule.id} className={`p-2.5 rounded-xl border transition-all ${rule.enabled ? 'bg-slate-900/90 border-slate-700/80 shadow-md' : 'bg-slate-950/50 border-slate-900 opacity-60'}`}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedRules = (selectedNode.iotRules || []).map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r);
                                      const newNode = { ...selectedNode, iotRules: updatedRules };
                                      const { updatedNode } = evaluateIotRulesForDevice(newNode, nodes, containers);
                                      onUpdateNode(updatedNode);
                                    }}
                                    className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${rule.enabled ? 'bg-teal-500 justify-end' : 'bg-slate-700 justify-start'} flex items-center shrink-0`}
                                  >
                                    <div className="w-3 h-3 rounded-full bg-slate-950" />
                                  </button>
                                  <span className="font-bold text-xs text-slate-200">{rule.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedRules = (selectedNode.iotRules || []).filter((r) => r.id !== rule.id);
                                    onUpdateNode({ ...selectedNode, iotRules: updatedRules });
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                                  title="Ta bort regel"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[10.5px] font-mono space-y-0.5 pl-1">
                                <div className="text-amber-300/90 flex items-center gap-1">
                                  <span>⚡ {getTriggerText(rule.trigger)}</span>
                                </div>
                                <div className="text-teal-300/90 flex items-center gap-1">
                                  <span>➡️ {getActionText(rule.action)}</span>
                                </div>
                                {rule.lastTriggered && (
                                  <div className="text-[9.5px] text-slate-500 pt-0.5 font-sans">
                                    Senast utlöst: <span className="font-mono text-teal-400">{rule.lastTriggered}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const defaultRule: IotRule = {
                            id: 'rule_' + Date.now().toString(36),
                            name: `Auto-stäng av vid Hacker i subnät`,
                            enabled: true,
                            trigger: 'hacker_in_subnet',
                            action: 'turn_off',
                          };
                          const existingRules = selectedNode.iotRules || [];
                          const newNode = { ...selectedNode, iotRules: [...existingRules, defaultRule] };
                          const { updatedNode } = evaluateIotRulesForDevice(newNode, nodes, containers);
                          onUpdateNode(updatedNode);
                        }}
                        className="w-full py-1.5 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        <span>Snabbregel: Stäng av om Hacker detekteras i subnät</span>
                      </button>
                    </div>

                    {/* Create Custom Rule Form */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-teal-400" />
                        <span>Bygg ny IFTTT-regel</span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div>
                          <label className="block text-slate-400 mb-1 font-mono text-[10px]">1. OM (VILLKOR / TRIGGER):</label>
                          <select
                            value={newRuleTrigger}
                            onChange={(e) => setNewRuleTrigger(e.target.value as IotRuleTrigger)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-teal-500 outline-none cursor-pointer"
                          >
                            <option value="hacker_in_subnet">🏴‍☠️ Hacker-enhet detekteras i samma subnät</option>
                            <option value="hacker_attack_active">⚡ Cyberattack pågår i nätverket</option>
                            <option value="device_infected">☣️ Enheten eller granne är smittad</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 font-mono text-[10px]">2. SÅ (ÅTGÄRD / ACTION):</label>
                          <select
                            value={newRuleAction}
                            onChange={(e) => setNewRuleAction(e.target.value as IotRuleAction)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-teal-500 outline-none cursor-pointer"
                          >
                            <option value="turn_off">🛑 Stäng av enheten / Koppla ifrån (OFF)</option>
                            <option value="turn_on">🟢 Slå på enheten / Aktivera (ON)</option>
                            <option value="lock_device">🔒 Aktivera nödlås / Lockout</option>
                            <option value="log_alert">🚨 Logga säkerhetslarm i konsolen</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 font-mono text-[10px]">3. REGELNAMN (VALFRITT):</label>
                          <input
                            type="text"
                            value={newRuleCustomName}
                            onChange={(e) => setNewRuleCustomName(e.target.value)}
                            placeholder="t.ex. Auto-avstängning vid Inkräktare"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-teal-500 outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const triggerNames: Record<string, string> = {
                              hacker_in_subnet: 'Hacker i subnät',
                              hacker_attack_active: 'Aktiv Cyberattack',
                              device_infected: 'Smittad enhet',
                            };
                            const actionNames: Record<string, string> = {
                              turn_off: 'Stäng av',
                              turn_on: 'Slå på',
                              lock_device: 'Nödlås',
                              log_alert: 'Larm',
                            };

                            const ruleName = newRuleCustomName.trim() || `${actionNames[newRuleAction]} om ${triggerNames[newRuleTrigger]}`;

                            const newRule: IotRule = {
                              id: 'rule_' + Date.now().toString(36),
                              name: ruleName,
                              enabled: true,
                              trigger: newRuleTrigger,
                              action: newRuleAction,
                            };

                            const existingRules = selectedNode.iotRules || [];
                            const newNode = { ...selectedNode, iotRules: [...existingRules, newRule] };
                            const { updatedNode } = evaluateIotRulesForDevice(newNode, nodes, containers);
                            onUpdateNode(updatedNode);
                            setNewRuleCustomName('');
                          }}
                          className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-teal-950/40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Spara & Aktivera IFTTT-Regel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Hacker Settings Panel */}
            {isHackerDevice(selectedNode.type) && (() => {
              const isAutoAttack = selectedNode.hackerAutoAttack !== false;
              const reachableTargets = findReachableTargetsForHacker(selectedNode, nodes, links);
              const currentAttackProfile =
                ATTACK_PROFILES[selectedNode.hackerAttackType || 'autonomous_ai'] ||
                ATTACK_PROFILES.autonomous_ai;

              return (
                <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 space-y-3.5 shadow-xl shadow-rose-950/20">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-rose-950/50 pb-2">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <Skull className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span className="font-orbitron font-extrabold tracking-wider uppercase text-xs">
                        Avancerad Cyber-Terminal
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      V3.5 PRO
                    </span>
                  </div>

                  {/* Auto-Attack on Connect Feature Banner */}
                  <div
                    onClick={() =>
                      onUpdateNode({
                        ...selectedNode,
                        hackerAutoAttack: !isAutoAttack,
                      })
                    }
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isAutoAttack
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`w-4 h-4 ${
                          isAutoAttack ? 'text-amber-300 animate-bounce' : 'text-slate-500'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                          <span>Auto-Attack vid kabelanslutning</span>
                        </div>
                        <div className="text-[9.5px] opacity-80 mt-0.5 font-sans leading-tight">
                          {isAutoAttack
                            ? 'Låser mål och startar direkt vid ny koppling'
                            : 'Manuell start krävs vid anslutning'}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                        isAutoAttack ? 'bg-rose-500 justify-end' : 'bg-slate-700 justify-start'
                      } flex items-center shrink-0`}
                    >
                      <div className="w-3 h-3 rounded-full bg-white shadow" />
                    </div>
                  </div>

                  {/* Attack Status & Primary Play/Stop Action */}
                  <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Attack-Status
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            selectedNode.hackerAttackActive
                              ? 'bg-rose-500 animate-ping'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span
                          className={`text-xs font-mono font-bold ${
                            selectedNode.hackerAttackActive ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {selectedNode.hackerAttackActive ? 'AKTIVT ANGREPP' : 'VILOLÄGE / REDO'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateNode({
                          ...selectedNode,
                          hackerAttackActive: !selectedNode.hackerAttackActive,
                          hackerAttackIntensity:
                            selectedNode.hackerAttackIntensity || 'aggressive',
                          hackerAttackType: selectedNode.hackerAttackType || 'autonomous_ai',
                          hackerTargetIp:
                            selectedNode.hackerTargetIp ||
                            (reachableTargets[0]?.ip || reachableTargets[0]?.id || ''),
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        selectedNode.hackerAttackActive
                          ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-md shadow-rose-950/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-md'
                      }`}
                    >
                      {selectedNode.hackerAttackActive ? (
                        <>
                          <Square className="w-3 h-3 fill-current animate-pulse" />
                          <span>STOPPA</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>STARTA</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Autonomous AI Kill Chain Stage Indicator */}
                  {(selectedNode.hackerAttackType === 'autonomous_ai' ||
                    !selectedNode.hackerAttackType) && (
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-purple-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-purple-300 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span>AI Kill-Chain Fas</span>
                        </span>
                        <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                          {selectedNode.hackerKillChainStage || 'RECON'}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-center">
                        {[
                          { id: 'RECON', label: '1. Recon' },
                          { id: 'VULN_SCAN', label: '2. Sårbar' },
                          { id: 'EXPLOIT', label: '3. Exploit' },
                          { id: 'LATERAL_MOVE', label: '4. Lateral' },
                          { id: 'IMPACT', label: '5. Impact' },
                        ].map((stage) => {
                          const currentStage = selectedNode.hackerKillChainStage || 'RECON';
                          const isCurrent = currentStage === stage.id;
                          return (
                            <button
                              key={stage.id}
                              type="button"
                              onClick={() =>
                                onUpdateNode({
                                  ...selectedNode,
                                  hackerKillChainStage: stage.id as any,
                                })
                              }
                              className={`py-1 rounded text-[8.5px] font-mono font-bold transition-all ${
                                isCurrent
                                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.8)] scale-105'
                                  : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {stage.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Target Selector & Reachable Network Nodes Quick-Lock */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                        <span>Målenhet i nätverket</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {reachableTargets.length} nåbara enheter
                      </span>
                    </div>

                    <select
                      value={selectedNode.hackerTargetIp || ''}
                      onChange={(e) =>
                        onUpdateNode({
                          ...selectedNode,
                          hackerTargetIp: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500/60 rounded-lg px-2.5 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                    >
                      <option value="">-- Välj eller upptäck målenhet --</option>
                      {nodes
                        .filter((n) => n.id !== selectedNode.id && (n.ip || n.id))
                        .map((n) => {
                          const isReachable = reachableTargets.some((r) => r.id === n.id);
                          return (
                            <option key={n.id} value={n.ip || n.id}>
                              {isReachable ? '⚡ [NÅBAR] ' : ''}
                              {n.name} ({n.ip || 'Ingen IP'})
                            </option>
                          );
                        })}
                    </select>

                    {/* Reachable Targets Quick Chips */}
                    {reachableTargets.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {reachableTargets.slice(0, 4).map((rt) => {
                          const isSel =
                            selectedNode.hackerTargetIp === rt.ip ||
                            selectedNode.hackerTargetIp === rt.id;
                          return (
                            <button
                              key={rt.id}
                              type="button"
                              onClick={() =>
                                onUpdateNode({
                                  ...selectedNode,
                                  hackerTargetIp: rt.ip || rt.id,
                                  hackerAttackActive: true,
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                                isSel
                                  ? 'bg-rose-500/30 border-rose-500 text-rose-200'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                              }`}
                            >
                              🎯 {rt.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Attack Profile Selector Gallery (8 Advanced Profiles) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
                      <span>Attack-Vektor</span>
                      <span className="text-[10px] font-mono text-rose-400">8 profiler</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {Object.values(ATTACK_PROFILES).map((prof) => {
                        const isSel =
                          (selectedNode.hackerAttackType || 'autonomous_ai') === prof.id;
                        return (
                          <button
                            key={prof.id}
                            type="button"
                            onClick={() =>
                              onUpdateNode({
                                ...selectedNode,
                                hackerAttackType: prof.id as any,
                              })
                            }
                            className={`p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                              isSel
                                ? 'bg-rose-950/40 border-rose-500 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs">{prof.icon}</span>
                              <span
                                className="text-[8.5px] font-mono font-bold px-1 rounded"
                                style={{
                                  backgroundColor: `${prof.color}20`,
                                  color: prof.color,
                                }}
                              >
                                {prof.badge}
                              </span>
                            </div>
                            <div className="font-bold text-[10px] text-slate-200 mt-1 truncate">
                              {prof.name}
                            </div>
                            <div className="text-[8.5px] opacity-75 mt-0.5 leading-snug truncate font-sans">
                              {prof.shortDesc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stealth Mode & Evasion Toggle */}
                  <div
                    onClick={() =>
                      onUpdateNode({
                        ...selectedNode,
                        hackerStealthMode: !selectedNode.hackerStealthMode,
                      })
                    }
                    className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      selectedNode.hackerStealthMode
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <div className="text-[11px] font-bold">Stealth & Spoofing Mode</div>
                        <div className="text-[9px] opacity-75 font-sans">
                          Förfalskar MAC & IP för att undvika brandväggsblockering
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        selectedNode.hackerStealthMode
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {selectedNode.hackerStealthMode ? 'PÅ' : 'AV'}
                    </span>
                  </div>

                  {/* Attack Intensity Range/Slider */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 text-xs">
                      Attackens intensitet
                    </label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      {[
                        { level: 'low-noise', label: 'Smyg', desc: '1 pkt/cykel' },
                        { level: 'aggressive', label: 'Medel', desc: '2 pkt/cykel' },
                        { level: 'brute-force-flood', label: 'Flood', desc: '5 pkt/cykel' },
                        { level: 'apocalyptic', label: 'Storm', desc: '8 pkt/cykel' },
                      ].map((lvl) => {
                        const isSel =
                          (selectedNode.hackerAttackIntensity || 'aggressive') === lvl.level;
                        return (
                          <button
                            key={lvl.level}
                            type="button"
                            onClick={() =>
                              onUpdateNode({
                                ...selectedNode,
                                hackerAttackIntensity: lvl.level as any,
                              })
                            }
                            className={`py-1.5 rounded text-[9.5px] font-bold transition-all cursor-pointer text-center ${
                              isSel
                                ? 'bg-rose-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title={`${lvl.label}: ${lvl.desc}`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Global Kill Switch for all hackers */}
                  <div className="pt-2 border-t border-rose-950/40">
                    <button
                      type="button"
                      onClick={() => {
                        nodes.forEach((n) => {
                          if (n.type === 'hacker') {
                            onUpdateNode({
                              ...n,
                              on: false,
                              hackerAttackActive: false,
                            });
                          }
                        });
                        onUpdateNode({
                          ...selectedNode,
                          on: false,
                          hackerAttackActive: false,
                        });
                      }}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs border border-red-500 shadow-md shadow-red-950/40 cursor-pointer transition-all duration-200 uppercase tracking-wider"
                    >
                      <ShieldAlert className="w-4 h-4 animate-bounce" />
                      <span>Nätverks Kill Switch</span>
                    </button>
                    <p className="text-[9px] text-slate-400 mt-1 text-center font-sans">
                      Släck ner och isolera omedelbart samtliga hackarenheter i nätverket.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Container / Subnet Grouping Card */}
            {(() => {
              const memberContainer = containers.find((c) => c.nodeIds.includes(selectedNode.id));
              return (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Container & Subnet-grupp</span>
                    </span>
                    {memberContainer && (
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Tilldelad
                      </span>
                    )}
                  </div>

                  {memberContainer ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 text-xs truncate">{memberContainer.name}</div>
                            <div className="text-[10px] font-mono text-cyan-400">{memberContainer.subnet || 'Subnet-moln'}</div>
                          </div>
                        </div>
                        {onOpenContainerModal && (
                          <button
                            type="button"
                            onClick={() => onOpenContainerModal(memberContainer)}
                            className="text-[10.5px] text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded font-medium border border-slate-700 transition cursor-pointer"
                          >
                            Hantera
                          </button>
                        )}
                      </div>
                      {onUpdateContainer && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateContainer({
                              ...memberContainer,
                              nodeIds: memberContainer.nodeIds.filter((id) => id !== selectedNode.id),
                            });
                          }}
                          className="w-full py-1 text-[10.5px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        >
                          Ta bort enhet från denna container
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Denna enhet är fristående och tillhör inget Subnet-moln.
                      </p>
                      {onOpenContainerModal && (
                        <button
                          type="button"
                          onClick={() => onOpenContainerModal(null, [selectedNode.id])}
                          className="w-full py-1.5 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 rounded-lg font-semibold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Gruppera i Subnet-moln / Container</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Firewall & Defense Rules Editor */}
            {(selectedNode.type === 'firewall' ||
              selectedNode.type === 'router' ||
              selectedNode.type === 'waf' ||
              selectedNode.type === 'ids_ips' ||
              selectedNode.type === 'ddos_scrubber' ||
              selectedNode.type === 'siem_soc') && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="font-semibold text-rose-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>
                      {selectedNode.type === 'waf'
                        ? 'WAF Säkerhetsregler (L7)'
                        : selectedNode.type === 'ddos_scrubber'
                        ? 'Anti-DDoS Filterregler'
                        : selectedNode.type === 'ids_ips'
                        ? 'IDS/IPS Inspektionsregler'
                        : selectedNode.type === 'siem_soc'
                        ? 'SIEM Korrelations- & Larmregler'
                        : 'Brandväggsregler (NGFW)'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(selectedNode.firewallRules || []).length} regler
                  </span>
                </div>

                {/* List Rules */}
                <div className="space-y-1.5">
                  {(selectedNode.firewallRules || []).map((rule) => (
                    <div
                      key={rule.id}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              rule.action === 'allow'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {rule.action === 'allow' ? 'Tillåt' : 'Blockera'}
                          </span>
                          <span className="font-mono text-slate-300 font-medium">
                            {rule.protocol}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {rule.description || `${rule.sourceIp} -> ${rule.destIp}`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = (selectedNode.firewallRules || []).filter(
                            (r) => r.id !== rule.id
                          );
                          onUpdateNode({ ...selectedNode, firewallRules: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Rule Form */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300">
                    Lägg till säkerhetsregel
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newFwAction}
                      onChange={(e: any) => setNewFwAction(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs"
                    >
                      <option value="block">Blockera</option>
                      <option value="allow">Tillåt</option>
                    </select>

                    <select
                      value={newFwProto}
                      onChange={(e: any) => setNewFwProto(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs"
                    >
                      <option value="HTTP">HTTP (80)</option>
                      <option value="ICMP">ICMP Ping</option>
                      <option value="DNS">DNS (53)</option>
                      <option value="TCP">TCP</option>
                      <option value="MALWARE">Malware</option>
                      <option value="ALL">Alla protokoll</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Käll-IP (* för alla)"
                    value={newFwSrc}
                    onChange={(e) => setNewFwSrc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Mål-IP (* för alla)"
                    value={newFwDst}
                    onChange={(e) => setNewFwDst(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Beskrivning"
                    value={newFwDesc}
                    onChange={(e) => setNewFwDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                  />

                  <button
                    onClick={() => {
                      const newRule: FirewallRule = {
                        id: Date.now().toString(),
                        action: newFwAction,
                        protocol: newFwProto,
                        sourceIp: newFwSrc || '*',
                        destIp: newFwDst || '*',
                        description: newFwDesc || 'Anpassad säkerhetsregel',
                      };
                      onUpdateNode({
                        ...selectedNode,
                        firewallRules: [...(selectedNode.firewallRules || []), newRule],
                      });
                      setNewFwDesc('');
                    }}
                    className="w-full py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30 transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Spara brandväggsregel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cable Connections & Network Ports */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cable className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">Kabelanslutningar & Portar</span>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full">
                  {links.filter((l) => l.a === selectedNode.id || l.b === selectedNode.id).length} aktiva
                </span>
              </div>

              {/* Connected Links List */}
              {(() => {
                const nodeLinks = links.filter((l) => l.a === selectedNode.id || l.b === selectedNode.id);
                if (nodeLinks.length === 0) {
                  return (
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 text-center">
                      <p className="text-[11px] text-slate-400">Inga anslutna kablar till denna enhet ännu.</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Dra från den blåa kabel-ikonen på enheten på canvasen, eller välj en enhet nedan.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5">
                    {nodeLinks.map((l) => {
                      const peerId = l.a === selectedNode.id ? l.b : l.a;
                      const peerNode = nodes.find((n) => n.id === peerId);
                      const cableDef = CABLE_DEFINITIONS[l.type] || CABLE_DEFINITIONS.cat6;
                      const compat = peerNode ? validateCableCompatibility(l.type, selectedNode, peerNode) : null;

                      return (
                        <div
                          key={l.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cableDef.color }}
                            />
                            <div className="truncate">
                              <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                                <span>Till:</span>
                                <span className="text-cyan-300 font-bold">{peerNode?.name || 'Okänd'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                <span style={{ color: cableDef.color }}>{cableDef.name}</span>
                                <span>•</span>
                                <span>{l.bandwidthMbps} Mbps</span>
                                {compat && compat.status === 'incompatible' && (
                                  <span className="text-rose-400 font-bold">⚠️ Fel kabel</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onDeleteLink(l.id)}
                            title="Koppla bort denna kabel"
                            className="p-1.5 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition shrink-0 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Quick Connect New Cable */}
              {nodes.filter((n) => n.id !== selectedNode.id).length > 0 && onAddLink && (
                <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300">Koppla ny kabel direkt:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={quickConnectTargetId}
                      onChange={(e) => setQuickConnectTargetId(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="">Välj målenhet...</option>
                      {nodes
                        .filter((n) => n.id !== selectedNode.id)
                        .map((n) => {
                          const isAlreadyConnected = links.some(
                            (l) => (l.a === selectedNode.id && l.b === n.id) || (l.a === n.id && l.b === selectedNode.id)
                          );
                          return (
                            <option key={n.id} value={n.id}>
                              {n.name} ({n.type}) {isAlreadyConnected ? '✓ Ansluten' : ''}
                            </option>
                          );
                        })}
                    </select>

                    <select
                      value={quickConnectCableType}
                      onChange={(e) => setQuickConnectCableType(e.target.value as CableType)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {Object.values(CABLE_DEFINITIONS).map((def) => (
                        <option key={def.type} value={def.type}>
                          {def.name} ({def.badge})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!quickConnectTargetId}
                    onClick={() => {
                      if (quickConnectTargetId && onAddLink) {
                        onAddLink(selectedNode.id, quickConnectTargetId, quickConnectCableType);
                        setQuickConnectTargetId('');
                      }
                    }}
                    className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Cable className="w-3.5 h-3.5" />
                    <span>⚡ Upprätta kabelanslutning</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete Device */}
            <div className="pt-4 border-t border-slate-800">
              {confirmDelete ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
                  <p className="text-red-300 font-semibold text-[11px] text-center">
                    Är du säker på att du vill ta bort enheten?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDeleteNode(selectedNode.id)}
                      className="flex-1 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition"
                    >
                      Ja, ta bort
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ta bort enhet</span>
                </button>
              )}
            </div>
          </>
        );
      })()}

        {/* Selected Link/Cable */}
        {selectedLink && (() => {
          const nodeA = nodes.find((n) => n.id === selectedLink.a);
          const nodeB = nodes.find((n) => n.id === selectedLink.b);
          const activeDef = CABLE_DEFINITIONS[selectedLink.type] || CABLE_DEFINITIONS.cat6;
          const compatibility = nodeA && nodeB ? validateCableCompatibility(selectedLink.type, nodeA, nodeB) : null;

          const handleSwitchCableType = (newType: CableType) => {
            const def = CABLE_DEFINITIONS[newType];
            onUpdateLink({
              ...selectedLink,
              type: newType,
              bandwidthMbps: def.bandwidthMbps,
              latencyMs: def.latencyMs,
              duplex: def.duplex,
            });
          };

          const availableCableTypes: CableType[] = [
            'cat6',
            'crossover',
            'fiber',
            'wifi',
            'serial',
            'coaxial',
            'console',
          ];

          return (
            <div className="space-y-4">
              {/* Cable Visual Header Banner */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                      style={{ backgroundColor: activeDef.color, boxShadow: `0 0 10px ${activeDef.color}` }}
                    />
                    <span className="font-bold text-slate-100 text-xs truncate">{activeDef.name}</span>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${activeDef.color}15`,
                      color: activeDef.color,
                      borderColor: `${activeDef.color}40`,
                    }}
                  >
                    {activeDef.badge}
                  </span>
                </div>

                {/* Connected Endpoints pill */}
                <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 flex items-center justify-between text-[11px] gap-2">
                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                    {nodeA && <RealisticDeviceIcon type={nodeA.type} size="sm" />}
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{nodeA?.name || 'Enhet A'}</div>
                      <div className="text-[9.5px] font-mono text-cyan-400 truncate">{nodeA?.ip || 'Ingen IP'}</div>
                    </div>
                  </div>

                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 shrink-0" />

                  <div className="min-w-0 flex-1 flex items-center justify-end gap-1.5 text-right">
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{nodeB?.name || 'Enhet B'}</div>
                      <div className="text-[9.5px] font-mono text-cyan-400 truncate">{nodeB?.ip || 'Ingen IP'}</div>
                    </div>
                    {nodeB && <RealisticDeviceIcon type={nodeB.type} size="sm" />}
                  </div>
                </div>
              </div>

              {/* Real-time Cable Compatibility Analysis Card */}
              {compatibility && (
                <div
                  className={`p-3 rounded-xl border space-y-2 transition-all ${
                    compatibility.status === 'optimal'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      : compatibility.status === 'compatible'
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                      : compatibility.status === 'suboptimal'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-rose-500/15 border-rose-500/60 text-rose-200 animate-pulse'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {compatibility.status === 'optimal' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : compatibility.status === 'compatible' ? (
                        <Check className="w-4 h-4 text-cyan-400" />
                      ) : compatibility.status === 'suboptimal' ? (
                        <Info className="w-4 h-4 text-amber-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>{compatibility.title}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${
                        compatibility.status === 'optimal'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : compatibility.status === 'compatible'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : compatibility.status === 'suboptimal'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                      }`}
                    >
                      {compatibility.badgeText} ({compatibility.score}%)
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-90">{compatibility.message}</p>
                  <p className="text-[10px] text-slate-400 leading-snug">{compatibility.explanation}</p>

                  {/* 1-Click Recommended Cable Switcher */}
                  {compatibility.recommendedType !== selectedLink.type && (
                    <button
                      type="button"
                      onClick={() => handleSwitchCableType(compatibility.recommendedType)}
                      className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/40 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Byt till rekommenderad: {CABLE_DEFINITIONS[compatibility.recommendedType].name}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Cable Type Selector Gallery (Grid) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300 font-semibold text-[11px]">
                  <span>Välj specialiserad kabeltyp</span>
                  <span className="text-[10px] text-slate-500 font-mono">7 typer</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {availableCableTypes.map((cType) => {
                    const def = CABLE_DEFINITIONS[cType];
                    const isCurrent = selectedLink.type === cType;
                    return (
                      <button
                        key={cType}
                        type="button"
                        onClick={() => handleSwitchCableType(cType)}
                        className={`text-left p-2 rounded-xl border transition flex items-center gap-2.5 ${
                          isCurrent
                            ? 'bg-slate-800 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                            : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: def.color, boxShadow: isCurrent ? `0 0 8px ${def.color}` : 'none' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                              {def.shortName}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                              {def.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {def.specializedFor}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Performance Sliders */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Länkprestanda & Fysiska egenskaper</span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateLink({
                        ...selectedLink,
                        bandwidthMbps: activeDef.bandwidthMbps,
                        latencyMs: activeDef.latencyMs,
                        packetLossPercent: 0,
                        duplex: activeDef.duplex,
                      });
                    }}
                    className="text-[9.5px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Återställ fabriksvärden
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Bandbreddskapacitet</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {selectedLink.bandwidthMbps >= 1000
                        ? `${(selectedLink.bandwidthMbps / 1000).toFixed(selectedLink.bandwidthMbps % 1000 === 0 ? 0 : 1)} Gbps`
                        : `${selectedLink.bandwidthMbps} Mbps`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10000"
                    step="10"
                    value={selectedLink.bandwidthMbps}
                    onChange={(e) =>
                      onUpdateLink({
                        ...selectedLink,
                        bandwidthMbps: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Svarstid (Latency RTT)</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {selectedLink.latencyMs} ms
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={selectedLink.latencyMs}
                    onChange={(e) =>
                      onUpdateLink({
                        ...selectedLink,
                        latencyMs: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Paketförlust (Loss Rate)</span>
                    <span className="font-mono text-rose-400 font-bold">
                      {selectedLink.packetLossPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedLink.packetLossPercent}
                    onChange={(e) =>
                      onUpdateLink({
                        ...selectedLink,
                        packetLossPercent: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300 font-medium">Duplex-läge</span>
                  <div className="flex rounded-lg overflow-hidden border border-slate-800">
                    <button
                      type="button"
                      onClick={() => onUpdateLink({ ...selectedLink, duplex: 'full' })}
                      className={`px-2.5 py-1 text-[10px] font-bold ${
                        selectedLink.duplex === 'full'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Full Duplex
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateLink({ ...selectedLink, duplex: 'half' })}
                      className={`px-2.5 py-1 text-[10px] font-bold ${
                        selectedLink.duplex === 'half'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Half Duplex
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Link Button */}
              <div className="pt-3 border-t border-slate-800">
                {confirmDelete ? (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                    <p className="text-rose-300 font-semibold text-[11px] text-center">
                      Ta bort denna kabelanslutning?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onDeleteLink(selectedLink.id)}
                        className="flex-1 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition cursor-pointer"
                      >
                        Ja, ta bort kabel
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Koppla loss / Ta bort kabel</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Dedicated Container / Subnet Cloud Inspector */}
        {selectedContainer && !selectedNode && !selectedLink && (() => {
          const memberNodes = nodes.filter((n) => selectedContainer.nodeIds.includes(n.id));
          return (
            <div className="space-y-4">
              {/* Header Title Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 text-cyan-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 text-sm truncate">{selectedContainer.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono tracking-tight uppercase">
                    {selectedContainer.type} &bull; {selectedContainer.subnet || 'Subnet-moln'}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateContainer) {
                      onUpdateContainer({
                        ...selectedContainer,
                        isCollapsed: !selectedContainer.isCollapsed,
                      });
                    }
                  }}
                  className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {selectedContainer.isCollapsed ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Expandera vy</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Moln-vy</span>
                    </>
                  )}
                </button>

                {onOpenContainerModal && (
                  <button
                    type="button"
                    onClick={() => onOpenContainerModal(selectedContainer)}
                    className="py-2 px-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Inställningar</span>
                  </button>
                )}
              </div>

              {/* Container Details */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="font-semibold text-slate-300 text-xs flex items-center justify-between">
                  <span>Medlemmar ({memberNodes.length} enheter)</span>
                  <span className="text-[10px] font-mono text-cyan-400 capitalize">{selectedContainer.color}</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {memberNodes.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-slate-200 truncate">{n.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-400">{n.ip || 'DHCP'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ungroup / Delete Container */}
              <div className="pt-2 border-t border-slate-800">
                {confirmDelete ? (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                    <p className="text-rose-300 font-semibold text-[11px] text-center">
                      Upplös denna container? Enheterna tas inte bort.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteContainer) onDeleteContainer(selectedContainer.id);
                          setConfirmDelete(false);
                          onClose();
                        }}
                        className="flex-1 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition cursor-pointer"
                      >
                        Ja, upplös
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Upplös / Ta bort Container</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </aside>
  );
};
