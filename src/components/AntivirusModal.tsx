import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play,
  Check,
  Download,
  Activity,
  Sparkles,
  Lock,
  Unlock,
  Crosshair,
  FileCheck,
  Terminal,
  Cpu,
  Server,
  Laptop,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { Device } from '../types';
import { isHackerDevice } from '../utils/hackerEngine';

interface AntivirusModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Device[];
  onUpdateNode: (updatedNode: Device) => void;
  onUpdateMultipleNodes: (updatedNodes: Device[]) => void;
  onSelectNodeOnCanvas: (nodeId: string) => void;
}

export const AntivirusModal: React.FC<AntivirusModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onUpdateNode,
  onUpdateMultipleNodes,
  onSelectNodeOnCanvas,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PROTECTED' | 'INFECTED' | 'UNPROTECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [sigVersion, setSigVersion] = useState('v5.8.4-2026.08.31');
  const [isUpdatingSig, setIsUpdatingSig] = useState(false);

  if (!isOpen) return null;

  // Filter out hacker devices from protection target stats
  const validDevices = nodes.filter((n) => !isHackerDevice(n.type) && n.type !== 'internet');

  const protectedCount = validDevices.filter((n) => n.antivirusInstalled && n.antivirusRealtimeProtection && !n.isInfected).length;
  const infectedCount = validDevices.filter((n) => n.isInfected).length;
  const unprotectedCount = validDevices.filter((n) => !n.antivirusInstalled || !n.antivirusRealtimeProtection).length;

  const totalThreatsBlocked = validDevices.reduce((sum, n) => sum + (n.antivirusThreatsBlocked || 0), 0);

  const filteredDevices = validDevices.filter((node) => {
    if (filter === 'PROTECTED') {
      if (!node.antivirusInstalled || !node.antivirusRealtimeProtection || node.isInfected) return false;
    } else if (filter === 'INFECTED') {
      if (!node.isInfected) return false;
    } else if (filter === 'UNPROTECTED') {
      if (node.antivirusInstalled && node.antivirusRealtimeProtection && !node.isInfected) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        node.name.toLowerCase().includes(q) ||
        node.ip.toLowerCase().includes(q) ||
        node.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: Install & Enable AV on All Valid Devices
  const handleInstallAll = () => {
    const updated = nodes.map((n) => {
      if (!isHackerDevice(n.type) && n.type !== 'internet') {
        const logs = n.antivirusLogs || [];
        return {
          ...n,
          antivirusInstalled: true,
          antivirusRealtimeProtection: true,
          antivirusAutoQuarantine: true,
          antivirusEngineVersion: sigVersion,
          antivirusStatus: n.isInfected ? ('INFECTED' as const) : ('PROTECTED' as const),
          antivirusLastScan: n.antivirusLastScan || 'Nyss installerad',
          antivirusLogs: [
            ...logs,
            `[${new Date().toLocaleTimeString()}] EDR Defender Antivirus installerat och aktiverat.`,
          ],
        };
      }
      return n;
    });
    onUpdateMultipleNodes(updated);
  };

  // Action: Network-wide Scan & Clean
  const handleScanAllNetwork = () => {
    setIsScanningAll(true);
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanningAll(false);

        const nowStr = new Date().toLocaleTimeString();
        const updated = nodes.map((n) => {
          if (!isHackerDevice(n.type) && n.type !== 'internet') {
            const wasInfected = n.isInfected;
            const threatsBlocked = (n.antivirusThreatsBlocked || 0) + (wasInfected ? 1 : 0);
            const logs = n.antivirusLogs || [];

            return {
              ...n,
              antivirusInstalled: true,
              isInfected: false,
              hackerAttackActive: false,
              antivirusStatus: 'PROTECTED' as const,
              antivirusLastScan: nowStr,
              antivirusThreatsBlocked: threatsBlocked,
              antivirusLogs: [
                ...logs,
                `[${nowStr}] Skanning genomförd. ${
                  wasInfected ? '⚠️ SKADLIG KOD UPPTÄCKT OCH RENAD (Trojan/Ransomware).' : '🟢 Inga hot funna.'
                }`,
              ],
            };
          }
          return n;
        });

        onUpdateMultipleNodes(updated);
      }
    }, 300);
  };

  // Action: Enable Auto-Quarantine on All
  const handleEnableAutoQuarantineAll = () => {
    const updated = nodes.map((n) => {
      if (!isHackerDevice(n.type) && n.type !== 'internet') {
        return {
          ...n,
          antivirusInstalled: true,
          antivirusRealtimeProtection: true,
          antivirusAutoQuarantine: true,
        };
      }
      return n;
    });
    onUpdateMultipleNodes(updated);
  };

  // Action: Update Virus Definitions
  const handleUpdateSignatures = () => {
    setIsUpdatingSig(true);
    setTimeout(() => {
      const newVersion = `v5.9.0-${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}`;
      setSigVersion(newVersion);
      setIsUpdatingSig(false);

      const updated = nodes.map((n) => {
        if (n.antivirusInstalled) {
          return {
            ...n,
            antivirusEngineVersion: newVersion,
          };
        }
        return n;
      });
      onUpdateMultipleNodes(updated);
    }, 1000);
  };

  // Single Node Actions
  const handleToggleSingleAV = (node: Device) => {
    const isInstalled = !node.antivirusInstalled;
    onUpdateNode({
      ...node,
      antivirusInstalled: isInstalled,
      antivirusRealtimeProtection: isInstalled,
      antivirusAutoQuarantine: isInstalled,
      antivirusEngineVersion: sigVersion,
      antivirusStatus: node.isInfected ? 'INFECTED' : isInstalled ? 'PROTECTED' : 'NOT_INSTALLED',
      antivirusLogs: [
        ...(node.antivirusLogs || []),
        `[${new Date().toLocaleTimeString()}] Antivirus ${isInstalled ? 'installerat' : 'avinstallerat'}.`,
      ],
    });
  };

  const handleScanSingleNode = (node: Device) => {
    const nowStr = new Date().toLocaleTimeString();
    const wasInfected = node.isInfected;
    onUpdateNode({
      ...node,
      isInfected: false,
      hackerAttackActive: false,
      antivirusInstalled: true,
      antivirusStatus: 'PROTECTED',
      antivirusLastScan: nowStr,
      antivirusThreatsBlocked: (node.antivirusThreatsBlocked || 0) + (wasInfected ? 1 : 0),
      antivirusLogs: [
        ...(node.antivirusLogs || []),
        `[${nowStr}] Punkt-skanning klar på ${node.name}. ${
          wasInfected ? '☣️ Skadlig kod neutraliserad!' : '🟢 Inga sårbarheter funna.'
        }`,
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-orbitron text-slate-100 tracking-wide">
                  ANTIVIRUS & EDR ENDPOINT PROTECTION
                </h2>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REAL-TIME SHIELD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centraliserad hantering av antivirusskydd, virussignaturer och automatisk sanering.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdateSignatures}
              disabled={isUpdatingSig}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Uppdatera virussignaturer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isUpdatingSig ? 'animate-spin' : ''}`} />
              <span>{isUpdatingSig ? 'Hämtar signaturer...' : 'Signaturer'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Progress Bar when scanning network */}
        {isScanningAll && (
          <div className="bg-cyan-950/60 p-3 border-b border-cyan-500/30 font-mono space-y-1">
            <div className="flex justify-between text-xs text-cyan-300 font-bold">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                NÄTVERKSSKANNING PÅGÅR... SKANNAR {validDevices.length} ENHETER
              </span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${scanProgress}%` }}
                className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              />
            </div>
          </div>
        )}

        {/* Dashboard Metrics Overview */}
        <div className="bg-slate-900/90 p-5 border-b border-slate-800 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            {/* Protected Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Skyddade Enheter</span>
                <span className="text-2xl font-black">{protectedCount} / {validDevices.length}</span>
              </div>
            </div>

            {/* Infected / Threats Card */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-rose-400 uppercase font-bold block">Smittade / Karantän</span>
                <span className="text-2xl font-black">{infectedCount}</span>
              </div>
            </div>

            {/* Unprotected Card */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-300 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <ShieldX className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Oskyddade Enheter</span>
                <span className="text-2xl font-black">{unprotectedCount}</span>
              </div>
            </div>

            {/* Total Blocked Threats */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Neutraliserade Hot</span>
                <span className="text-2xl font-black text-cyan-400">{totalThreatsBlocked}</span>
              </div>
            </div>
          </div>

          {/* Rapid Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-slate-500">VIRUSSIGNATURER:</span>
              <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {sigVersion}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleInstallAll}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Installera på alla ({validDevices.length})</span>
              </button>

              <button
                type="button"
                onClick={handleScanAllNetwork}
                disabled={isScanningAll}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Kör Nätverksomfattande Skanning</span>
              </button>

              <button
                type="button"
                onClick={handleEnableAutoQuarantineAll}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Slå på Realtidsskydd & Karantän</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Section: Device List Grid */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Controls Header */}
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
                Alla Enheter ({validDevices.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('PROTECTED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filter === 'PROTECTED'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-emerald-400 hover:bg-emerald-950/40'
                }`}
              >
                🟢 Skyddade ({protectedCount})
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
                onClick={() => setFilter('UNPROTECTED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filter === 'UNPROTECTED'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-amber-400 hover:bg-amber-950/40'
                }`}
              >
                🟡 Oskyddade ({unprotectedCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Sök enhet eller IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>
          </div>

          {/* Device Antivirus Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDevices.map((node) => {
              const isInstalled = !!node.antivirusInstalled;
              const isRealtime = !!node.antivirusRealtimeProtection;
              const isInfected = !!node.isInfected;

              let cardBorder = 'border-slate-800 bg-slate-950';
              let badge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 font-mono">
                  ⚪ Ej installerat
                </span>
              );

              if (isInfected) {
                cardBorder = 'border-rose-500/60 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
                badge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-slate-950 animate-pulse font-mono">
                    🔴 INFEKTERAD
                  </span>
                );
              } else if (isInstalled && isRealtime) {
                cardBorder = 'border-emerald-500/50 bg-emerald-950/15';
                badge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    🟢 SKYDDAD (EDR)
                  </span>
                );
              } else if (isInstalled && !isRealtime) {
                cardBorder = 'border-amber-500/40 bg-amber-950/10';
                badge = (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    🟡 AV INAKTIVT
                  </span>
                );
              }

              return (
                <div
                  key={node.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${cardBorder}`}
                >
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{node.name}</span>
                        {!node.on && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-500">
                            OFFLINE
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] font-mono text-cyan-400">{node.ip}</span>
                    </div>
                    {badge}
                  </div>

                  {/* Settings & Toggles */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Antivirus-motor:</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSingleAV(node)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                          isInstalled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isInstalled ? 'Aktiv' : 'Installera'}
                      </button>
                    </div>

                    {isInstalled && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Realtidsskydd:</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateNode({
                              ...node,
                              antivirusRealtimeProtection: !isRealtime,
                            });
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                            isRealtime
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isRealtime ? 'TILL' : 'FRÅN'}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                      <span>Senaste skanning:</span>
                      <span className="text-slate-300">{node.antivirusLastScan || 'Aldrig'}</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleScanSingleNode(node)}
                      className="flex-1 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-cyan-400" />
                      <span>{isInfected ? 'Rensa Hot' : 'Skanna enhet'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectNodeOnCanvas(node.id);
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Visa på canvas"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredDevices.length === 0 && (
              <div className="col-span-full p-8 text-center text-slate-500 space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Inga enheter hittades för det valda filtret.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
