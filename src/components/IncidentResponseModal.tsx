import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Search,
  RefreshCw,
  Download,
  Trash2,
  X,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Flame,
  Radio,
  Server,
  Zap,
  Lock,
  ArrowRight,
  Terminal,
  Crosshair,
  FileSpreadsheet,
  Skull,
  Play,
  Check,
  Ban,
  Wrench,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  IncidentLog,
  CyberKillChainStage,
  IncidentSeverity,
  Device,
  Link,
  FirewallRule,
} from '../types';
import {
  KILL_CHAIN_STAGES_META,
  KillChainStageMeta,
} from '../utils/incidentManager';

interface IncidentResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: IncidentLog[];
  nodes: Device[];
  links: Link[];
  onUpdateNode: (node: Device) => void;
  onUpdateMultipleNodes: (nodes: Device[]) => void;
  onClearIncidents: () => void;
  onSelectNodeOnCanvas?: (nodeId: string) => void;
  onOpenAntivirus?: () => void;
}

export function IncidentResponseModal({
  isOpen,
  onClose,
  incidents,
  nodes,
  links,
  onUpdateNode,
  onUpdateMultipleNodes,
  onClearIncidents,
  onSelectNodeOnCanvas,
  onOpenAntivirus,
}: IncidentResponseModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Compute active Kill Chain stages present in logs
  const detectedStages = useMemo(() => {
    const set = new Set<CyberKillChainStage>();
    incidents.forEach((inc) => set.add(inc.stage));
    return set;
  }, [incidents]);

  // Compute stats
  const totalCount = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const activeCount = incidents.filter((i) => i.status === 'ACTIVE').length;
  const containedCount = incidents.filter((i) => i.status === 'CONTAINED' || i.isContained).length;

  const highestStage = useMemo(() => {
    const stagesInOrder: CyberKillChainStage[] = [
      'IMPACT',
      'DATA_EXFILTRATION',
      'LATERAL_MOVEMENT',
      'PERSISTENCE',
      'EXECUTION',
      'INITIAL_ACCESS',
      'RECONNAISSANCE',
    ];
    for (const st of stagesInOrder) {
      if (detectedStages.has(st)) return KILL_CHAIN_STAGES_META[st];
    }
    return null;
  }, [detectedStages]);

  // Filtered incident list
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (selectedStage !== 'ALL' && inc.stage !== selectedStage) return false;
      if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'ALL' && inc.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = inc.title.toLowerCase().includes(q);
        const matchSource = inc.sourceNodeName.toLowerCase().includes(q) || inc.sourceIp.includes(q);
        const matchTarget = inc.targetNodeName.toLowerCase().includes(q) || inc.targetIp.includes(q);
        const matchMitre = inc.mitreId.toLowerCase().includes(q) || inc.mitreName.toLowerCase().includes(q);
        const matchDesc = inc.description.toLowerCase().includes(q);
        if (!matchTitle && !matchSource && !matchTarget && !matchMitre && !matchDesc) return false;
      }

      return true;
    });
  }, [incidents, selectedStage, selectedSeverity, selectedStatus, searchQuery]);

  // Active selected incident item
  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return filteredIncidents[0] || incidents[0] || null;
    return incidents.find((i) => i.id === selectedIncidentId) || null;
  }, [incidents, filteredIncidents, selectedIncidentId]);

  if (!isOpen) return null;

  // Containment Action 1: Isolate target node (Power off or set offline)
  const handleIsolateNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    handleShowActionSuccess(`Enhet "${targetNode.name}" har isolerats och stängts av.`);
    onUpdateNode({
      ...targetNode,
      on: false,
      isInfected: false,
    });
  };

  // Containment Action 2: Clean node infection with Antivirus/EDR
  const handleCleanNodeInfection = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    handleShowActionSuccess(`EDR-sanering utförd på "${targetNode.name}". Hot borttaget.`);
    onUpdateNode({
      ...targetNode,
      isInfected: false,
      antivirusStatus: 'PROTECTED',
      antivirusLastScan: new Date().toLocaleTimeString('sv-SE'),
      antivirusLogs: [
        `[${new Date().toLocaleTimeString('sv-SE')}] Incident Response remediation: Malware sandbox cleared.`,
        ...(targetNode.antivirusLogs || []),
      ],
    });
  };

  // Containment Action 3: Add firewall block rule
  const handleBlockIpInFirewall = (sourceIpToBlock: string) => {
    const firewalls = nodes.filter((n) => n.type === 'firewall' && n.on);
    if (firewalls.length === 0) {
      handleShowActionSuccess('Ingen aktiv brandvägg hittades i nätverket. Lägg till en brandvägg från nodpaletten.');
      return;
    }

    const updatedFws = firewalls.map((fw) => {
      const existingRules = fw.firewallRules || [];
      const newRule: FirewallRule = {
        id: `rule_block_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        action: 'block',
        protocol: 'ALL',
        sourceIp: sourceIpToBlock,
        destIp: '*',
        description: `Incident Response Auto-Block: Spärra fientlig IP ${sourceIpToBlock}`,
      };
      return {
        ...fw,
        firewallRules: [newRule, ...existingRules],
      };
    });

    onUpdateMultipleNodes(updatedFws);
    handleShowActionSuccess(`Block-regel för IP ${sourceIpToBlock} lades till i ${updatedFws.length} brandvägg(ar).`);
  };

  const handleShowActionSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4000);
  };

  // Export forensic incident report
  const handleExportForensicReport = () => {
    const reportData = {
      title: 'Eklund Network Simulator - Incident Response & Forensic Cyber Report',
      timestamp: new Date().toLocaleString('sv-SE'),
      summary: {
        totalIncidents: totalCount,
        criticalSeverity: criticalCount,
        activeThreats: activeCount,
        containedThreats: containedCount,
        highestStageReached: highestStage ? highestStage.labelSv : 'Ingen känd attack',
      },
      killChainTimeline: incidents.map((inc) => ({
        id: inc.id,
        timestamp: inc.timestamp,
        stage: inc.stage,
        severity: inc.severity,
        mitreTechnique: `${inc.mitreId} - ${inc.mitreName}`,
        source: `${inc.sourceNodeName} (${inc.sourceIp})`,
        target: `${inc.targetNodeName} (${inc.targetIp})`,
        title: inc.title,
        description: inc.description,
        status: inc.status,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident_Response_Forensic_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/30 border border-rose-500/40 text-rose-400 shadow-md shadow-rose-950/40">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-wide font-sans">
                  Incident Response & Cyber Attack Dashboard
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                  MITRE ATT&CK® Correlation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Realtidsloggning av attackkedjor, sårbarhetsbrister och automatiserad containment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportForensicReport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Exportera forensisk incidentrapport i JSON-format"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Exportera Rapport</span>
            </button>

            {onClearIncidents && (
              <button
                onClick={onClearIncidents}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Rensa incidentloggen"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
                <span className="hidden sm:inline">Rensa Logg</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              title="Stäng fönster"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Metric Bar & Kill Chain Pipeline visualizer */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Aktiva Hot</p>
                <p className="text-lg font-bold font-mono text-rose-400">{activeCount}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kritiska Incidenter</p>
                <p className="text-lg font-bold font-mono text-amber-300">{criticalCount}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hanterade / Stoppade</p>
                <p className="text-lg font-bold font-mono text-emerald-400">{containedCount}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Högsta Attackstadium</p>
                <p className="text-xs font-bold font-sans text-cyan-300 truncate">
                  {highestStage ? highestStage.labelSv : 'Ingen aktiv attack'}
                </p>
              </div>
            </div>
          </div>

          {/* Cyber Kill Chain Timeline Pipeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-400" />
                Cyber Kill Chain Attack Pipeline (MITRE ATT&CK Matrix)
              </span>
              <span className="text-[11px] text-slate-400">
                Klicka på ett stadium för att filtrera händelser
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
              {(Object.keys(KILL_CHAIN_STAGES_META) as CyberKillChainStage[]).map((stageKey) => {
                const meta = KILL_CHAIN_STAGES_META[stageKey];
                const isDetected = detectedStages.has(stageKey);
                const isSelected = selectedStage === stageKey;

                return (
                  <button
                    key={stageKey}
                    onClick={() => setSelectedStage(isSelected ? 'ALL' : stageKey)}
                    className={`relative p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                        : isDetected
                        ? 'bg-slate-900 border-rose-500/50 hover:border-rose-400'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{meta.icon}</span>
                      {isDetected ? (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono text-[9px] font-bold animate-pulse">
                          DETEKTERAD
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-400">Steg {meta.stepNumber}</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-200 truncate">{meta.labelSv}</p>
                    <p className="text-[9px] font-mono text-slate-400 truncate">{meta.mitreRef.split(' ')[0]}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area: Left Incident List + Right Forensic Inspector */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Incidents Table & Filters (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-800 min-h-0 bg-slate-900/50">
            
            {/* Filter Bar */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Sök IP, nod, MITRE ID eller titel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="ALL">Alla Kill Chain-stadier</option>
                {(Object.keys(KILL_CHAIN_STAGES_META) as CyberKillChainStage[]).map((st) => (
                  <option key={st} value={st}>
                    {KILL_CHAIN_STAGES_META[st].labelSv}
                  </option>
                ))}
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="ALL">Alla Allvarlighetsgrader</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="INFO">🔵 Info</option>
              </select>
            </div>

            {/* Incidents Timeline Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredIncidents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                  <ShieldCheck className="w-12 h-12 text-emerald-500/60 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">Inga incidenter matchar sökningen</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Inga aktiva säkerhetsbrister eller attacker har loggats under valda filter.
                  </p>
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const stageMeta = KILL_CHAIN_STAGES_META[inc.stage] || KILL_CHAIN_STAGES_META.RECONNAISSANCE;

                  const severityColor =
                    inc.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : inc.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : inc.severity === 'MEDIUM'
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                          : 'bg-slate-950/60 hover:bg-slate-850 border-slate-800'
                      }`}
                    >
                      {/* Top Row: Timestamp, Stage Badge, MITRE ID */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {inc.timestamp}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border flex items-center gap-1"
                            style={{ backgroundColor: `${stageMeta.color}15`, color: stageMeta.color, borderColor: `${stageMeta.color}40` }}
                          >
                            <span>{stageMeta.icon}</span>
                            <span>{stageMeta.labelSv.split(' ')[1]}</span>
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                            {inc.mitreId}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityColor}`}>
                          {inc.severity}
                        </span>
                      </div>

                      {/* Title & Network Nodes */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          {inc.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-rose-300">
                            Källa: {inc.sourceNodeName} ({inc.sourceIp})
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                            Mål: {inc.targetNodeName} ({inc.targetIp})
                          </span>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-900/40 p-1.5 rounded border border-slate-800/60">
                        "{inc.description}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Forensic Inspector & Containment Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 p-5 overflow-y-auto">
            {selectedIncident ? (
              <div className="space-y-5">
                
                {/* Header Info */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                      MITRE ATT&CK {selectedIncident.mitreId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Logg ID: {selectedIncident.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mb-1">
                    {selectedIncident.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedIncident.mitreName}
                  </p>
                </div>

                {/* Cyber Kill Chain Stage Meta Card */}
                {KILL_CHAIN_STAGES_META[selectedIncident.stage] && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-rose-400" />
                        Kill Chain Stadium Breakdown
                      </span>
                      <span
                        className="text-xs font-bold font-mono px-2 py-0.5 rounded"
                        style={{ color: KILL_CHAIN_STAGES_META[selectedIncident.stage].color }}
                      >
                        {KILL_CHAIN_STAGES_META[selectedIncident.stage].labelSv}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {KILL_CHAIN_STAGES_META[selectedIncident.stage].description}
                    </p>
                  </div>
                )}

                {/* Packet & Payload Technical Details */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    Forensisk Paket & Payload-analys
                  </h4>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                    <p><span className="text-slate-400">Protokoll:</span> <span className="text-cyan-400 font-bold">{selectedIncident.protocol}</span></p>
                    <p><span className="text-slate-400">Avsändare IP:</span> <span className="text-rose-400">{selectedIncident.sourceIp}</span> ({selectedIncident.sourceNodeName})</p>
                    <p><span className="text-slate-400">Mottagare IP:</span> <span className="text-cyan-400">{selectedIncident.targetIp}</span> ({selectedIncident.targetNodeName})</p>
                    {selectedIncident.payloadSummary && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <p className="text-slate-400 mb-1">Payload Hex/ASCII excerpt:</p>
                        <p className="text-amber-300 bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto text-[10px]">
                          {selectedIncident.payloadSummary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Remediation Playbook */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    Rekommenderad Åtgärdsplan (Playbook)
                  </h4>
                  <p className="text-xs text-slate-300 bg-amber-950/30 p-3 rounded-lg border border-amber-500/30 leading-relaxed">
                    {selectedIncident.recommendedAction}
                  </p>
                </div>

                {/* Direct Containment Action Controls */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-rose-400" />
                    Snabb containment & Åtgärdskontroller
                  </h4>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleIsolateNode(selectedIncident.targetNodeId)}
                      className="w-full px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-rose-400" />
                        Isolera Målnod ({selectedIncident.targetNodeName})
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleBlockIpInFirewall(selectedIncident.sourceIp)}
                      className="w-full px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        Blockera IP {selectedIncident.sourceIp} i Brandvägg
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleCleanNodeInfection(selectedIncident.targetNodeId)}
                      className="w-full px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Kör EDR Antivirus-sanering på Målnod
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {onSelectNodeOnCanvas && (
                      <button
                        onClick={() => {
                          onSelectNodeOnCanvas(selectedIncident.targetNodeId);
                          onClose();
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Crosshair className="w-4 h-4 text-cyan-400" />
                          Markera Nod på Nätverksytan
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                <ShieldAlert className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-300">Ingen incident vald</p>
                <p className="text-xs text-slate-400 mt-1">
                  Välj en incident i tidslinjen till vänster för att granska forensiska detaljer och utföra containment.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
