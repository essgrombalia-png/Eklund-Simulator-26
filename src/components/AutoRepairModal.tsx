import React, { useState, useMemo } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Info,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Layers,
  HelpCircle,
  Activity,
  Check,
  Cable,
  Power,
  Network,
  X,
  Play,
} from 'lucide-react';
import { Device, Link } from '../types';
import {
  NetworkIssue,
  diagnoseNetwork,
  autoRepairAll,
  autoRepairConnectionBetween,
  IssueCategory,
} from '../utils/autoRepairEngine';
import { findPathAndSimulate } from '../utils/networkEngine';

interface AutoRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Device[];
  links: Link[];
  onApplyChanges: (nodes: Device[], links: Link[], message?: string) => void;
  onSelectNode: (id: string) => void;
}

export const AutoRepairModal: React.FC<AutoRepairModalProps> = ({
  isOpen,
  onClose,
  nodes,
  links,
  onApplyChanges,
  onSelectNode,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'issues' | 'path_diagnostics' | 'guide'>('issues');
  const [repairLogs, setRepairLogs] = useState<string[]>([]);
  const [recentFixMessage, setRecentFixMessage] = useState<string | null>(null);

  // Path troubleshooter state
  const [pathSrcId, setPathSrcId] = useState<string>('');
  const [pathDstId, setPathDstId] = useState<string>('');
  const [pathTestResult, setPathTestResult] = useState<ReturnType<typeof findPathAndSimulate> | null>(null);

  // Auto-diagnose
  const issues = useMemo(() => {
    return diagnoseNetwork(nodes, links);
  }, [nodes, links]);

  // Set default path test nodes
  React.useEffect(() => {
    if (nodes.length >= 2) {
      if (!pathSrcId || !nodes.some((n) => n.id === pathSrcId)) {
        setPathSrcId(nodes[0].id);
      }
      if (!pathDstId || !nodes.some((n) => n.id === pathDstId)) {
        setPathDstId(nodes[nodes.length - 1].id);
      }
    }
  }, [nodes, pathSrcId, pathDstId]);

  if (!isOpen) return null;

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') return issue.severity === 'critical';
    if (activeFilter === 'warning') return issue.severity === 'warning';
    if (activeFilter === 'cables') return issue.category === 'bad_cable' || issue.category === 'isolated_node' || issue.category === 'high_loss';
    if (activeFilter === 'ip') return issue.category === 'ip_conflict' || issue.category === 'missing_ip' || issue.category === 'subnet_mismatch' || issue.category === 'gateway_mismatch';
    return true;
  });

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  // Network Health Score (0 - 100)
  const healthScore = Math.max(
    0,
    100 - criticalCount * 25 - warningCount * 10
  );

  // Handle single issue auto-fix
  const handleFixSingleIssue = (issue: NetworkIssue) => {
    const result = issue.applyFix(nodes, links);
    onApplyChanges(result.nodes, result.links, result.summary);
    setRecentFixMessage(result.summary);
    setRepairLogs((prev) => [result.summary, ...prev]);

    setTimeout(() => {
      setRecentFixMessage(null);
    }, 4000);
  };

  // Handle fix all issues
  const handleFixAll = () => {
    const result = autoRepairAll(nodes, links);
    onApplyChanges(result.nodes, result.links, `Automatiskt åtgärdade ${result.fixedCount} nätverksproblem.`);
    setRecentFixMessage(`Klart! ${result.fixedCount} problem har åtgärdats automatiskt.`);
    setRepairLogs((prev) => [...result.fixLogs, ...prev]);

    setTimeout(() => {
      setRecentFixMessage(null);
    }, 5000);
  };

  // Handle path connection test
  const handleRunPathTest = () => {
    if (!pathSrcId || !pathDstId) return;
    const res = findPathAndSimulate(pathSrcId, pathDstId, nodes, links, 'ICMP');
    setPathTestResult(res);
  };

  // Handle auto-repair path connection
  const handleRepairPath = () => {
    if (!pathSrcId || !pathDstId) return;
    const res = autoRepairConnectionBetween(pathSrcId, pathDstId, nodes, links);
    onApplyChanges(res.nodes, res.links, 'Förbindelse reparerad.');
    setRepairLogs((prev) => [...res.fixLogs, ...prev]);
    setRecentFixMessage(`Förbindelsen mellan enheterna har reparerats automatiskt!`);

    // Re-run test
    setTimeout(() => {
      const reTest = findPathAndSimulate(pathSrcId, pathDstId, res.nodes, res.links, 'ICMP');
      setPathTestResult(reTest);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Nätverksassistent & Automatisk Felsökning
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AI Auto-Repair
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upptäck felaktiga IP-adresser, trasiga kablar, offline-enheter och åtgärda allt med 1 klick.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Banner & Fix All Action */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular / Badge Health Indicator */}
            <div className="relative flex items-center justify-center">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border shadow-lg ${
                  healthScore === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
                    : healthScore >= 70
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20'
                }`}
              >
                {healthScore}%
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Nätverkshälsa:</span>
                {issues.length === 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Felfritt nätverk
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">
                    {issues.length} {issues.length === 1 ? 'problem upptäckt' : 'problem upptäckta'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span className="text-rose-400 font-medium">🔴 {criticalCount} Kritiska</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">🟡 {warningCount} Varningar</span>
                <span>•</span>
                <span className="text-cyan-400">{nodes.length} Enheter analyserade</span>
              </div>
            </div>
          </div>

          {/* Master Auto-Repair Button */}
          {issues.length > 0 && (
            <button
              onClick={handleFixAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition hover:scale-[1.02] active:scale-95 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Fixa alla fel automatiskt ({issues.length})</span>
            </button>
          )}
        </div>

        {/* Live Notification Bar if repair was just made */}
        {recentFixMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{recentFixMessage}</span>
            </div>
            <span className="text-[10px] opacity-75">Nätverket uppdaterat i realtid</span>
          </div>
        )}

        {/* Navigation Subtabs */}
        <div className="flex items-center px-4 pt-2.5 bg-slate-950 border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'issues'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Identifierade Problem ({issues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('path_diagnostics')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'path_diagnostics'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Förbindelsefelsökare (Ping & Rutt)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Nätverksguide & Teori</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'issues' && (
            <>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Filtrera:</span>
                {[
                  { id: 'all', label: `Alla (${issues.length})` },
                  { id: 'critical', label: `Kritiska (${criticalCount})` },
                  { id: 'warning', label: `Varningar (${warningCount})` },
                  { id: 'cables', label: 'Kablar & Portar' },
                  { id: 'ip', label: 'IP & Subnät' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      activeFilter === f.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Issues List */}
              {filteredIssues.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Inga problem hittades!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Alla nätverksenheter är korrekt konfigurerade med giltiga IP-adresser, rätt subnät, fungerande kablar och aktiverade tjänster.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => {
                    const isCritical = issue.severity === 'critical';

                    return (
                      <div
                        key={issue.id}
                        className={`p-4 rounded-xl border transition shadow-lg ${
                          isCritical
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-rose-950/30'
                            : 'bg-amber-950/20 border-amber-500/40 shadow-amber-950/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            {/* Title & Badge */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                  isCritical
                                    ? 'bg-rose-500 text-slate-950'
                                    : 'bg-amber-400 text-slate-950'
                                }`}
                              >
                                {isCritical ? 'Kritisk' : 'Varning'}
                              </span>
                              <h4 className="text-xs font-bold text-slate-100">{issue.title}</h4>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {issue.description}
                            </p>

                            {/* Educational Explanation */}
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                              <div className="text-cyan-300 font-semibold flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5" />
                                <span>Varför uppstår detta? (Nätverksteori):</span>
                              </div>
                              <p>{issue.explanation}</p>
                            </div>

                            {/* Affected Devices Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-500">Berörda enheter:</span>
                              {issue.affectedNodeIds.map((nid) => {
                                const n = nodes.find((node) => node.id === nid);
                                return (
                                  <button
                                    key={nid}
                                    onClick={() => {
                                      onSelectNode(nid);
                                      onClose();
                                    }}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono border border-slate-700 transition"
                                  >
                                    {n?.name || nid} ↗
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 1-Click Auto-Fix Button */}
                          <div className="shrink-0 flex sm:flex-col items-end gap-2 justify-end">
                            <button
                              onClick={() => handleFixSingleIssue(issue)}
                              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition hover:scale-105 active:scale-95 whitespace-nowrap"
                            >
                              <Zap className="w-3.5 h-3.5 fill-slate-950" />
                              <span>Fixa automatiskt</span>
                            </button>
                            <span className="text-[10px] text-slate-400 text-right">
                              {issue.autoFixDescription}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Tab 2: Path Troubleshooter (Ping & Layer diagnostics) */}
          {activeTab === 'path_diagnostics' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  Steg-för-steg Förbindelsefelsökare mellan två enheter
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Från (Källa):</label>
                    <select
                      value={pathSrcId}
                      onChange={(e) => setPathSrcId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.ip || 'Ingen IP'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Till (Mål):</label>
                    <select
                      value={pathDstId}
                      onChange={(e) => setPathDstId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.ip || 'Ingen IP'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleRunPathTest}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Testa Förbindelse (Ping)</span>
                  </button>

                  <button
                    onClick={handleRepairPath}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>⚡ Reparera denna förbindelse automatiskt</span>
                  </button>
                </div>
              </div>

              {/* Path Result display */}
              {pathTestResult && (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    pathTestResult.success
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {pathTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {pathTestResult.success
                          ? 'Förbindelse Upprättad (OK)'
                          : 'Förbindelse Misslyckades (Bruten Länk/Konfigurationsfel)'}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono">
                      RTT: {pathTestResult.latencyMs}ms | Paketförlust: {pathTestResult.packetLoss}%
                    </span>
                  </div>

                  {/* Logs */}
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 space-y-0.5 max-h-40 overflow-y-auto">
                    {pathTestResult.logs.map((log, idx) => (
                      <div key={idx} className={log.includes('FEL') ? 'text-rose-400 font-bold' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>

                  {!pathTestResult.success && (
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-rose-300">
                        Assistenten kan automatiskt dra kablar, slå på strömmen och konfigurera IP.
                      </span>
                      <button
                        onClick={handleRepairPath}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 fill-slate-950" />
                        <span>Fixa åt mig nu</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Interactive Guide & Learning */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Network className="w-4 h-4" />
                    <span>1. IP-adresser & Subnät</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Varje enhet behöver en unik IP (t.ex. 192.168.1.10) och en nätmask (255.255.255.0 /24). Enheter på samma switch måste dela samma subnät för att kunna prata direkt utan router.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>2. Default Gateway</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    När en dator vill skicka paket till en annan IP utanför sitt lokala subnät skickar den paketet till sin Default Gateway (routerns lokala IP).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Cable className="w-4 h-4" />
                    <span>3. Rätt kabeltyp</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Använd Cat6 TP-kablar för vanliga klienter till switchar, Crossover mellan äldre switchar, Optisk Fiber för datacenter/WAN och Wi-Fi 6 för bärbara datorer och mobiler.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Power className="w-4 h-4" />
                    <span>4. Ström och Portar</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Kontrollera att alla servrar, routrar och switchar är igång (grön lysdiod). Om en nod stängs av bryts alla länkar som passerar genom den.
                  </p>
                </div>
              </div>

              {/* Troubleshooting Checklist */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-slate-200">
                  Snabbguide: Om du kör fast i en labbuppgift:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Klicka på <strong>"Fixa alla fel automatiskt"</strong> högst upp för en omedelbar korrigering av alla inställningar.</li>
                  <li>Klicka på en enhet på canvasen och öppna <strong>Inspektören</strong> till höger för att granska IP, mask och gateway.</li>
                  <li>Slå på <strong>Visual Debugger</strong> i toppmenyn för att se IP-adresser direkt över varje nod på ritbordet.</li>
                  <li>Använd <strong>CLI Terminalen</strong> för att köra <code>ping</code>, <code>traceroute</code> och <code>ipconfig</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Repair History / Log */}
          {repairLogs.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3 h-3 text-cyan-400" />
                <span>Senaste automatiska reparationer i denna session:</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[10px] text-slate-400 space-y-1 max-h-24 overflow-y-auto">
                {repairLogs.map((log, i) => (
                  <div key={i} className="text-emerald-400/90 flex items-center gap-1.5">
                    <Check className="w-3 h-3 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-orbitron font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
            <span className="text-cyan-400 font-extrabold">EKLUND</span> SIMULATOR 26 <span className="text-slate-600">•</span> <span className="font-space text-slate-400 font-normal">Automatisk nätverksdiagnostik</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
