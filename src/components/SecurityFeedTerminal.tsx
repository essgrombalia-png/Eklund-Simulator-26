import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Skull,
  ShieldAlert,
  Flame,
  AlertTriangle,
  ArrowRight,
  Search,
  Copy,
  Check,
  Download,
  Ban,
  ShieldCheck,
  Lock,
  Crosshair,
  RefreshCw,
  Power,
  Bug,
  Activity,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { IncidentLog, Device, Link } from '../types';
import { playSound } from '../utils/audioSynth';

interface SecurityFeedTerminalProps {
  incidents: IncidentLog[];
  nodes: Device[];
  links: Link[];
  onIsolateNode: (nodeId: string) => void;
  onCleanNodeInfection: (nodeId: string) => void;
  onBlockIpInFirewall: (ip: string) => void;
  onSelectNodeOnCanvas?: (nodeId: string) => void;
  onUpdateNode?: (node: Device) => void;
  onCloseModal?: () => void;
}

export function SecurityFeedTerminal({
  incidents,
  nodes,
  links,
  onIsolateNode,
  onCleanNodeInfection,
  onBlockIpInFirewall,
  onSelectNodeOnCanvas,
  onUpdateNode,
  onCloseModal,
}: SecurityFeedTerminalProps) {
  const [grepQuery, setGrepQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'BREACHES_ONLY' | 'ALL'>('BREACHES_ONLY');
  const [selectedVector, setSelectedVector] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedDump, setCopiedDump] = useState(false);

  // Filter to successful attacks (breaches)
  const successfulIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Breaches: not blocked by firewall, or active, or title does not include [BLOCKERAD]
      const isBlocked =
        inc.isContained ||
        inc.status === 'CONTAINED' ||
        inc.title.toLowerCase().includes('[blockerad]') ||
        inc.description.toLowerCase().includes('stoppades automatiskt');

      if (filterMode === 'BREACHES_ONLY' && isBlocked) {
        return false;
      }

      if (selectedVector !== 'ALL') {
        const v = selectedVector.toLowerCase();
        const text = (inc.title + ' ' + inc.description + ' ' + inc.mitreName).toLowerCase();
        if (!text.includes(v)) return false;
      }

      if (grepQuery.trim()) {
        const q = grepQuery.toLowerCase();
        const matchAll =
          inc.title.toLowerCase().includes(q) ||
          inc.sourceNodeName.toLowerCase().includes(q) ||
          inc.sourceIp.includes(q) ||
          inc.targetNodeName.toLowerCase().includes(q) ||
          inc.targetIp.includes(q) ||
          inc.mitreId.toLowerCase().includes(q) ||
          inc.description.toLowerCase().includes(q) ||
          (inc.payloadSummary && inc.payloadSummary.toLowerCase().includes(q));
        if (!matchAll) return false;
      }

      return true;
    });
  }, [incidents, filterMode, selectedVector, grepQuery]);

  // Aggregate HUD stats for successful attacks
  const totalBreaches = useMemo(() => {
    return incidents.filter(
      (inc) =>
        !inc.isContained &&
        inc.status === 'ACTIVE' &&
        !inc.title.toLowerCase().includes('[blockerad]')
    ).length;
  }, [incidents]);

  const compromisedNodesCount = useMemo(() => {
    return nodes.filter((n) => n.isInfected || (!n.on && n.isInfected)).length;
  }, [nodes]);

  const crashedServersCount = useMemo(() => {
    return nodes.filter(
      (n) => !n.on && (n.isInfected || n.type.startsWith('server_'))
    ).length;
  }, [nodes]);

  // Copy raw ASCII terminal dump
  const handleCopyRawDump = () => {
    playSound('click', true, 0.3);
    const lines: string[] = [
      '# =========================================================================',
      '# KALI LINUX RED-TEAM / SOC AUDIT: LIVE BREACH & EXPLOIT TIMELINE',
      `# GENERATED: ${new Date().toISOString()}`,
      `# TOTAL BREACHES: ${totalBreaches} | COMPROMISED HOSTS: ${compromisedNodesCount}`,
      '# =========================================================================',
      '',
    ];

    successfulIncidents.forEach((inc, idx) => {
      lines.push(
        `[#${idx + 1}] [${inc.timestamp}] [MITRE ${inc.mitreId}] [${inc.severity}] ${inc.title}`
      );
      lines.push(`  INTRUSION: ${inc.sourceNodeName} (${inc.sourceIp}) ===[${inc.protocol}]===> ${inc.targetNodeName} (${inc.targetIp})`);
      lines.push(`  TECHNIQUE: ${inc.mitreName}`);
      lines.push(`  DETAILS  : ${inc.description}`);
      if (inc.payloadSummary) {
        lines.push(`  PAYLOAD  : ${inc.payloadSummary}`);
      }
      lines.push(`  STATUS   : ${inc.status}`);
      lines.push('-------------------------------------------------------------------------');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedDump(true);
    setTimeout(() => setCopiedDump(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05080c] font-mono text-emerald-400 select-text overflow-hidden relative border-t border-slate-800">
      
      {/* CRT Scanline Overlay Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 3px, 6px 100%',
        }}
      />

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0f16] border-b border-emerald-900/50 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600/80 border border-rose-500 inline-block shadow-sm shadow-rose-600/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 border border-emerald-400 inline-block" />
          </div>
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">root@kali-soc:</span>
            <span className="text-cyan-400">~/threat-intel/breaches.feed</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>FEED: STREAMING</span>
          </div>

          <button
            onClick={handleCopyRawDump}
            className="px-2 py-1 bg-slate-900 hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
            title="Kopiera forensisk terminaldump"
          >
            {copiedDump ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedDump ? 'KOPIERAT!' : 'COPY LOG'}</span>
          </button>
        </div>
      </div>

      {/* Terminal HUD: Live Breach Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#080d14] border-b border-emerald-950/80 text-xs">
        <div className="p-2 rounded bg-slate-950/80 border border-rose-900/50 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Lyckade Breaches</div>
            <div className="text-base font-extrabold text-rose-400 font-mono flex items-center gap-1">
              <span>{totalBreaches}</span>
              <Skull className="w-3.5 h-3.5 text-rose-500 inline animate-pulse" />
            </div>
          </div>
          <span className="text-[9px] font-mono text-rose-400/80 bg-rose-950/40 px-1 py-0.5 rounded border border-rose-900/60">
            CONFIRMED
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/80 border border-amber-900/50 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Infekterade Noder</div>
            <div className="text-base font-extrabold text-amber-400 font-mono">
              {compromisedNodesCount} / {nodes.length}
            </div>
          </div>
          <span className="text-[9px] font-mono text-amber-400/80 bg-amber-950/40 px-1 py-0.5 rounded border border-amber-900/60">
            COMPROMISED
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/80 border border-cyan-900/50 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Kraschade Servrar</div>
            <div className="text-base font-extrabold text-cyan-300 font-mono">
              {crashedServersCount}
            </div>
          </div>
          <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/40 px-1 py-0.5 rounded border border-cyan-900/60">
            OFFLINE
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/80 border border-emerald-900/50 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Synliga Händelser</div>
            <div className="text-base font-extrabold text-emerald-400 font-mono">
              {successfulIncidents.length}
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-400/80 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-900/60">
            FILTERED
          </span>
        </div>
      </div>

      {/* Terminal Command Bar: Grep & Vector Filters */}
      <div className="p-2.5 bg-[#070b10] border-b border-emerald-950 flex flex-wrap items-center gap-2 text-xs">
        {/* Grep Input */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-2.5 top-2 text-emerald-500 font-bold select-none text-[11px]">
            grep -i
          </span>
          <input
            type="text"
            value={grepQuery}
            onChange={(e) => setGrepQuery(e.target.value)}
            placeholder=' "target_ip" | "cve" | "rce" | "kernel"...'
            className="w-full bg-slate-950/90 border border-emerald-900/60 rounded pl-16 pr-3 py-1.5 text-xs text-emerald-300 placeholder-emerald-800/70 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>

        {/* Breach vs All Mode Toggle */}
        <div className="flex items-center rounded border border-emerald-900/80 p-0.5 bg-slate-950 text-[10px] font-bold">
          <button
            onClick={() => setFilterMode('BREACHES_ONLY')}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              filterMode === 'BREACHES_ONLY'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            💥 Endast Lyckade Attacker
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Alla Loggar
          </button>
        </div>

        {/* Vector Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {[
            { id: 'ALL', label: 'Alla Vektorer' },
            { id: 'crash', label: '💥 Server Crash' },
            { id: 'mask', label: '🦠 Maskutbrott' },
            { id: 'ransomware', label: '💀 Ransomware' },
            { id: 'rce', label: '🎯 0-Day RCE' },
            { id: 'ddos', label: '⚡ DDoS' },
            { id: 'trojan', label: '📻 C2 Shell' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVector(v.id)}
              className={`px-2 py-1 rounded border transition whitespace-nowrap cursor-pointer ${
                selectedVector === v.id
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-slate-950/60 border-emerald-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output Area: Live Stream of Successful Breaches */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-[11px] leading-relaxed custom-scrollbar bg-[#05080c]">
        {successfulIncidents.length === 0 ? (
          <div className="p-8 border border-dashed border-emerald-950 rounded-xl bg-slate-950/50 text-center space-y-3">
            <div className="text-emerald-500 text-sm font-bold animate-pulse">
              [+] SOCKET_PROMISCUOUS: LISTENING FOR LIVE BREACH TELEMETRY...
            </div>
            <div className="text-slate-400 text-xs max-w-lg mx-auto">
              Inga lyckade attacker eller sårbarhetsintrång matchar det aktuella filtret just nu.
              När en angripare penetrerar brandväggen eller kraschar en nod visas hela attacktidslinjen här i realtid.
            </div>
            <div className="text-[10px] text-emerald-600 font-mono">
              Tips: Starta ett cyberangrepp från nodpaletten (t.ex. "💥 Sänk Servern" eller "🦠 Nätverksmask").
            </div>
          </div>
        ) : (
          successfulIncidents.map((inc, index) => {
            const isExpanded = expandedLogId === inc.id;
            const targetNode = nodes.find((n) => n.id === inc.targetNodeId);
            const isServerCrashed = targetNode && !targetNode.on;
            const isTargetInfected = targetNode?.isInfected;

            return (
              <div
                key={inc.id}
                className="group p-3 rounded-lg bg-[#070d14] border border-emerald-900/40 hover:border-emerald-500/60 transition-all duration-150 shadow-md shadow-black/60"
              >
                {/* Terminal Entry Header */}
                <div className="flex flex-wrap items-center justify-between gap-1 pb-2 border-b border-emerald-950 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">
                      [{inc.timestamp}]
                    </span>
                    <span className="text-slate-500">PID:{4000 + index * 17}</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      BREACH CONFIRMED
                    </span>
                    <span className="text-cyan-400 font-bold">
                      MITRE:{inc.mitreId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      SEVERITY:{inc.severity}
                    </span>
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : inc.id)}
                      className="text-slate-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer text-[9px]"
                    >
                      <span>{isExpanded ? 'DÖLJ' : 'DETALJER'}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Main Attack Description & ASCII Intrusion Vector */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-100 font-bold text-xs">
                    <span className="text-rose-400 font-mono">⚡</span>
                    <span className="text-emerald-300">{inc.title}</span>
                  </div>

                  {/* ASCII Penetration Path */}
                  <div className="p-2 rounded bg-[#03060a] border border-emerald-950 text-[10px] text-slate-300 flex flex-wrap items-center gap-1.5">
                    <span className="text-rose-400 font-bold">
                      [SRC: {inc.sourceNodeName} ({inc.sourceIp})]
                    </span>
                    <span className="text-slate-500">═══[{inc.protocol} / EXPLOIT]═══►</span>
                    <span className="text-cyan-300 font-bold">
                      [DST: {inc.targetNodeName} ({inc.targetIp})]
                    </span>
                    
                    {isServerCrashed && (
                      <span className="ml-auto px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold animate-pulse text-[9px]">
                        💥 SERVER DOWN (OFFLINE)
                      </span>
                    )}
                    {!isServerCrashed && isTargetInfected && (
                      <span className="ml-auto px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[9px]">
                        ☣️ INFECTED
                      </span>
                    )}
                  </div>

                  {/* Impact Summary */}
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-500">&gt;&gt;</span>{' '}
                    <span className="text-slate-300">{inc.description}</span>
                  </div>

                  {/* Payload Hex / ASCII */}
                  {inc.payloadSummary && (
                    <div className="text-[10px] text-amber-300/90 bg-[#04070c] p-1.5 rounded border border-emerald-950 font-mono overflow-x-auto whitespace-pre-wrap">
                      <span className="text-slate-500 select-none">PAYLOAD: </span>
                      {inc.payloadSummary}
                    </div>
                  )}

                  {/* Expanded Forensics & MITRE breakdown */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-emerald-950 space-y-1.5 text-[10px] text-slate-300 bg-black/40 p-2 rounded">
                      <p>
                        <span className="text-emerald-400 font-bold">MITRE TEKNIK:</span> {inc.mitreName} ({inc.mitreId})
                      </p>
                      <p>
                        <span className="text-emerald-400 font-bold">ATTACKSTADIUM:</span> {inc.stage}
                      </p>
                      <p>
                        <span className="text-amber-400 font-bold">REKOMMENDERAT SVAR:</span> {inc.recommendedAction}
                      </p>
                    </div>
                  )}

                  {/* Immediate Terminal Containment Controls */}
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onIsolateNode(inc.targetNodeId)}
                      className="px-2 py-1 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Stäng av och isolera målenheten"
                    >
                      <Ban className="w-3 h-3 text-rose-400" />
                      <span>ISOLERA ({inc.targetNodeName})</span>
                    </button>

                    <button
                      onClick={() => onCleanNodeInfection(inc.targetNodeId)}
                      className="px-2 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Kör EDR Antivirus desinfektion"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>EDR-SANERA</span>
                    </button>

                    <button
                      onClick={() => onBlockIpInFirewall(inc.sourceIp)}
                      className="px-2 py-1 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Blockera angriparens IP i brandväggen"
                    >
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>BLOCKERA IP ({inc.sourceIp})</span>
                    </button>

                    {targetNode && !targetNode.on && onUpdateNode && (
                      <button
                        onClick={() => {
                          onUpdateNode({
                            ...targetNode,
                            on: true,
                            isInfected: false,
                          });
                          playSound('click', true, 0.4);
                        }}
                        className="px-2 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Starta om servern / enheten"
                      >
                        <Power className="w-3 h-3 text-cyan-400" />
                        <span>STARTA OM ENHET</span>
                      </button>
                    )}

                    {onSelectNodeOnCanvas && (
                      <button
                        onClick={() => {
                          onSelectNodeOnCanvas(inc.targetNodeId);
                          if (onCloseModal) onCloseModal();
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ml-auto"
                        title="Hoppa till enhet på canvas"
                      >
                        <Crosshair className="w-3 h-3 text-cyan-400" />
                        <span>VISA PÅ CANVAS</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Blinking Cursor at bottom of stream */}
        <div className="pt-2 text-[11px] text-emerald-400 font-mono flex items-center gap-1 select-none">
          <span className="text-emerald-600">root@kali-soc:~/threat-intel#</span>
          <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse" />
        </div>
      </div>

    </div>
  );
}
