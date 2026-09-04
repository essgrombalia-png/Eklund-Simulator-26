import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Filter,
  Trash2,
  Eye,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Skull,
  Download,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  ShieldCheck,
  Server,
  RefreshCw,
  Clock,
  AlertTriangle,
  Shield,
  ShieldBan,
  Lock,
  Unlock,
  Power,
  Unlink,
  Sparkles,
  Cpu,
  Globe,
  Wrench,
  Check,
  CheckCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { CapturedPacket, Device, Link, NetworkContainer, FirewallRule } from '../types';
import {
  analyzeThreatPatterns,
  executeRemediationAction,
  executeAllSecurityMitigations,
  RecommendedAction,
  SecurityPostureStats,
} from '../utils/securityResponseEngine';

interface PacketInspectorProps {
  packets: CapturedPacket[];
  nodes?: Device[];
  links?: Link[];
  containers?: NetworkContainer[];
  onClearPackets: () => void;
  onUpdateNode?: (node: Device) => void;
  onUpdateTopology?: (
    data: { nodes?: Device[]; links?: Link[]; containers?: NetworkContainer[] },
    msg?: string
  ) => void;
}

interface HistoricalDataPoint {
  time: string;
  timestamp: number;
  Hälsa: number;
  Impact: number;
  Latency: number;
  PacketLoss: number;
  ActiveAttacks: number;
  BlockedAttacks: number;
}

export const PacketInspector: React.FC<PacketInspectorProps> = ({
  packets,
  nodes = [],
  links = [],
  containers = [],
  onClearPackets,
  onUpdateNode,
  onUpdateTopology,
}) => {
  const [activeTab, setActiveTab] = useState<
    'ALL_TRAFFIC' | 'HACKER_ACTIVITY' | 'SUMMARY' | 'SECURITY_RESPONSE'
  >('ALL_TRAFFIC');
  const [summaryTimeframe, setSummaryTimeframe] = useState<'30S' | '5M' | 'ALL'>('ALL');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [selectedPacket, setSelectedPacket] = useState<CapturedPacket | null>(null);

  // Security Response state
  const [appliedActionIds, setAppliedActionIds] = useState<Set<string>>(new Set());
  const [responseCategoryFilter, setResponseCategoryFilter] = useState<string>('ALL');
  const [responseSearchQuery, setResponseSearchQuery] = useState<string>('');
  const [responseAuditLogs, setResponseAuditLogs] = useState<
    Array<{ id: string; timestamp: string; title: string; message: string; severity: string }>
  >([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Analyze threats and generate dynamic recommendations
  const { recommendations, stats: securityStats } = useMemo(() => {
    return analyzeThreatPatterns(packets, nodes, links, containers);
  }, [packets, nodes, links, containers]);

  const activeRecommendations = useMemo(() => {
    return recommendations.filter((r) => !appliedActionIds.has(r.id));
  }, [recommendations, appliedActionIds]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      if (responseCategoryFilter !== 'ALL') {
        if (responseCategoryFilter === 'PORTS' && r.category !== 'PORT_SCAN') return false;
        if (responseCategoryFilter === 'SUBNETS' && r.category !== 'SUBNET_BREACH') return false;
        if (responseCategoryFilter === 'HACKERS' && r.category !== 'ROGUE_HACKER_DEVICE') return false;
        if (responseCategoryFilter === 'MALWARE' && r.category !== 'MALWARE_INFECTION') return false;
        if (responseCategoryFilter === 'DDOS' && r.category !== 'DDOS_FLOOD') return false;
      }
      if (responseSearchQuery.trim()) {
        const q = responseSearchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.explanation.toLowerCase().includes(q) ||
          (r.targetNodeName && r.targetNodeName.toLowerCase().includes(q)) ||
          (r.targetIp && r.targetIp.includes(q)) ||
          (r.subnetName && r.subnetName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [recommendations, responseCategoryFilter, responseSearchQuery]);

  // Execute a single recommended action
  const handleExecuteSingleAction = (action: RecommendedAction) => {
    if (!onUpdateTopology) return;

    const result = executeRemediationAction(action, nodes, links, containers);
    onUpdateTopology(
      {
        nodes: result.nextNodes,
        links: result.nextLinks,
        containers: result.nextContainers,
      },
      result.logMessage
    );

    setAppliedActionIds((prev) => new Set([...prev, action.id]));

    const newLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      title: action.title,
      message: result.logMessage,
      severity: action.severity,
    };
    setResponseAuditLogs((prev) => [newLog, ...prev.slice(0, 40)]);
    showToast(result.logMessage);
  };

  // Execute all active recommendations in one click
  const handleExecuteAllActions = () => {
    if (!onUpdateTopology || activeRecommendations.length === 0) return;

    const result = executeAllSecurityMitigations(activeRecommendations, nodes, links, containers);
    onUpdateTopology(
      {
        nodes: result.nextNodes,
        links: result.nextLinks,
        containers: result.nextContainers,
      },
      `🛡️ Fullständig säkerhetsmitigering: ${result.appliedCount} åtgärder verkställdes!`
    );

    const nextSet = new Set(appliedActionIds);
    activeRecommendations.forEach((r) => nextSet.add(r.id));
    setAppliedActionIds(nextSet);

    const newLogs = result.logMessages.map((msg, i) => ({
      id: `log_batch_${Date.now()}_${i}`,
      timestamp: new Date().toLocaleTimeString(),
      title: 'Batch Säkerhetsåtgärd',
      message: msg,
      severity: 'HIGH',
    }));
    setResponseAuditLogs((prev) => [...newLogs, ...prev.slice(0, 40)]);
    showToast(`⚡ Genomförde ${result.appliedCount} rekommenderade åtgärder!`);
  };

  // Quick Global Port Toggle across all Firewalls & Routers
  const handleQuickPortToggle = (port: number, currentlyBlocked: boolean) => {
    if (!onUpdateTopology) return;

    let updatedNodes = [...nodes];
    if (currentlyBlocked) {
      // Unblock port
      updatedNodes = updatedNodes.map((n) => {
        if (n.firewallRules) {
          return {
            ...n,
            firewallRules: n.firewallRules.filter((r) => r.port !== port),
          };
        }
        return n;
      });
      onUpdateTopology({ nodes: updatedNodes }, `🔓 Öppnade Port ${port} i alla brandväggar`);
      showToast(`🔓 Öppnade Port ${port}`);
    } else {
      // Block port
      updatedNodes = updatedNodes.map((n) => {
        if (n.type === 'firewall' || n.type === 'router' || n.type === 'wifi_router') {
          const existing = n.firewallRules || [];
          const rule: FirewallRule = {
            id: `quick_block_port_${port}_${Date.now()}`,
            action: 'block',
            protocol: port === 53 ? 'DNS' : port === 80 || port === 443 ? 'HTTP' : 'TCP',
            sourceIp: 'ANY',
            destIp: 'ANY',
            port,
            description: `Quick Port Block: Port ${port}`,
          };
          return { ...n, firewallRules: [rule, ...existing] };
        }
        return n;
      });
      onUpdateTopology({ nodes: updatedNodes }, `🔒 Blockerade Port ${port} i brandväggar`);
      showToast(`🔒 Blockerade Port ${port}`);
    }
  };

  // Quick Subnet Quarantine Toggle
  const handleQuickSubnetIsolate = (containerId: string) => {
    if (!onUpdateTopology) return;

    const targetContainer = containers.find((c) => c.id === containerId);
    if (!targetContainer || !targetContainer.nodeIds) return;

    const containerNodeSet = new Set(targetContainer.nodeIds);
    const isolatedLinks = links.filter(
      (l) =>
        !(
          (containerNodeSet.has(l.a) && !containerNodeSet.has(l.b)) ||
          (containerNodeSet.has(l.b) && !containerNodeSet.has(l.a))
        )
    );

    const disinfectedNodes = nodes.map((n) =>
      containerNodeSet.has(n.id) ? { ...n, isInfected: false } : n
    );

    onUpdateTopology(
      {
        nodes: disinfectedNodes,
        links: isolatedLinks,
      },
      `🚧 Subnätet "${targetContainer.name}" sattes i total isolering.`
    );
    showToast(`🚧 Subnät "${targetContainer.name}" isolerat!`);
  };

  const filteredPackets = packets.filter((p) => {
    if (protocolFilter === 'NOISE') {
      return p.isNoise === true;
    }
    if (protocolFilter !== 'ALL' && p.protocol !== protocolFilter) return false;
    return true;
  });

  const hackerPackets = useMemo(() => {
    return packets.filter((p) => {
      return (
        p.protocol === 'MALWARE' ||
        p.info.toLowerCase().includes('port scan') ||
        p.info.toLowerCase().includes('ddos') ||
        p.info.toLowerCase().includes('poisoning') ||
        p.info.toLowerCase().includes('hacker')
      );
    });
  }, [packets]);

  // Calculate live instant Attack Impact Score (based on last 30 packets)
  const recentHackerPackets = useMemo(() => hackerPackets.slice(0, 30), [hackerPackets]);
  
  const {
    finalImpactScore,
    networkHealth,
    averageLatencyPenalty,
    averagePacketLossPenalty,
    recentBlockedCount,
    recentSuccessCount,
  } = useMemo(() => {
    let rawScore = 0;
    let successfulAttacks = 0;
    let blockedAttacks = 0;
    let latencyImpact = 0;
    let packetLossImpact = 0;

    recentHackerPackets.forEach((p) => {
      const isSuccess = p.status === 'SUCCESS';
      if (isSuccess) {
        successfulAttacks++;
        if (p.protocol === 'MALWARE') {
          rawScore += 25;
          packetLossImpact += 8;
          latencyImpact += 150;
        } else if (p.info.toLowerCase().includes('ddos')) {
          rawScore += 20;
          packetLossImpact += 15;
          latencyImpact += 400;
        } else if (p.info.toLowerCase().includes('poisoning')) {
          rawScore += 15;
          latencyImpact += 80;
        } else {
          rawScore += 8;
          latencyImpact += 20;
        }
      } else {
        blockedAttacks++;
      }
    });

    const score = Math.min(100, rawScore);
    return {
      finalImpactScore: score,
      networkHealth: Math.max(0, 100 - score),
      averageLatencyPenalty: Math.min(2000, latencyImpact),
      averagePacketLossPenalty: Math.min(100, packetLossImpact),
      recentBlockedCount: blockedAttacks,
      recentSuccessCount: successfulAttacks,
    };
  }, [recentHackerPackets]);

  // Persistent historical telemetry data for timeline aggregation
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    if (history.length === 0) {
      const initialHistory: HistoricalDataPoint[] = [];
      const now = Date.now();
      for (let i = 8; i >= 0; i--) {
        const t = new Date(now - i * 3000);
        initialHistory.push({
          time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: t.getTime(),
          Hälsa: 100,
          Impact: 0,
          Latency: 10,
          PacketLoss: 0,
          ActiveAttacks: 0,
          BlockedAttacks: 0,
        });
      }
      setHistory(initialHistory);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistory((prev) => {
        const nextPoint: HistoricalDataPoint = {
          time: timeStr,
          timestamp: now.getTime(),
          Hälsa: networkHealth,
          Impact: finalImpactScore,
          Latency: Math.max(10, averageLatencyPenalty),
          PacketLoss: averagePacketLossPenalty,
          ActiveAttacks: recentSuccessCount,
          BlockedAttacks: recentBlockedCount,
        };
        const next = [...prev, nextPoint];
        // Keep up to 60 historical data samples (~3 minutes of fine-grained history)
        if (next.length > 60) next.shift();
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [networkHealth, finalImpactScore, averageLatencyPenalty, averagePacketLossPenalty, recentSuccessCount, recentBlockedCount]);

  // Filtered history based on chosen timeframe
  const displayHistory = useMemo(() => {
    if (history.length === 0) return [];
    const now = Date.now();
    if (summaryTimeframe === '30S') {
      return history.slice(-10);
    }
    if (summaryTimeframe === '5M') {
      return history.filter((pt) => now - pt.timestamp <= 5 * 60 * 1000);
    }
    return history;
  }, [history, summaryTimeframe]);

  // Aggregated Statistical Metrics over time
  const aggregatedStats = useMemo(() => {
    if (displayHistory.length === 0) {
      return {
        avgImpact: 0,
        maxImpact: 0,
        avgHealth: 100,
        minHealth: 100,
        avgLatency: 10,
        maxLatency: 10,
        avgPacketLoss: 0,
        trend: 'STABLE',
      };
    }

    const impacts = displayHistory.map((h) => h.Impact);
    const healths = displayHistory.map((h) => h.Hälsa);
    const latencies = displayHistory.map((h) => h.Latency);
    const losses = displayHistory.map((h) => h.PacketLoss);

    const sumImpact = impacts.reduce((a, b) => a + b, 0);
    const maxImpact = Math.max(...impacts);
    const avgImpact = Math.round(sumImpact / impacts.length);

    const sumHealth = healths.reduce((a, b) => a + b, 0);
    const minHealth = Math.min(...healths);
    const avgHealth = Math.round(sumHealth / healths.length);

    const sumLatency = latencies.reduce((a, b) => a + b, 0);
    const maxLatency = Math.max(...latencies);
    const avgLatency = Math.round(sumLatency / latencies.length);

    const sumLoss = losses.reduce((a, b) => a + b, 0);
    const avgPacketLoss = Math.round(sumLoss / losses.length);

    // Trend calculation: compare first half to second half
    let trend: 'IMPROVING' | 'DEGRADING' | 'STABLE' = 'STABLE';
    if (displayHistory.length >= 4) {
      const half = Math.floor(displayHistory.length / 2);
      const firstHalfAvg = displayHistory.slice(0, half).reduce((acc, h) => acc + h.Impact, 0) / half;
      const secondHalfAvg = displayHistory.slice(half).reduce((acc, h) => acc + h.Impact, 0) / (displayHistory.length - half);
      if (secondHalfAvg > firstHalfAvg + 5) trend = 'DEGRADING';
      else if (secondHalfAvg < firstHalfAvg - 5) trend = 'IMPROVING';
    }

    return {
      avgImpact,
      maxImpact,
      avgHealth,
      minHealth,
      avgLatency,
      maxLatency,
      avgPacketLoss,
      trend,
    };
  }, [displayHistory]);

  // Overall attack category breakdown across all captured hacker packets
  const attackBreakdown = useMemo(() => {
    const stats: Record<string, { total: number; blocked: number; success: number }> = {
      'Port Scan': { total: 0, blocked: 0, success: 0 },
      'DDoS Flood': { total: 0, blocked: 0, success: 0 },
      'ARP Poisoning': { total: 0, blocked: 0, success: 0 },
      'Malware Exploit': { total: 0, blocked: 0, success: 0 },
    };

    hackerPackets.forEach((p) => {
      let key = 'Port Scan';
      if (p.protocol === 'MALWARE') key = 'Malware Exploit';
      else if (p.info.toLowerCase().includes('ddos')) key = 'DDoS Flood';
      else if (p.info.toLowerCase().includes('poisoning') || p.info.toLowerCase().includes('arp')) key = 'ARP Poisoning';

      if (stats[key]) {
        stats[key].total++;
        if (p.status === 'SUCCESS') stats[key].success++;
        else stats[key].blocked++;
      }
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      blockRate: data.total > 0 ? Math.round((data.blocked / data.total) * 100) : 100,
    }));
  }, [hackerPackets]);

  // Target device vulnerability ranking
  const topTargets = useMemo(() => {
    const map = new Map<string, { ip: string; name: string; totalAttacks: number; breaches: number; blocked: number }>();
    hackerPackets.forEach((p) => {
      const key = p.destIp || 'Unknown';
      const existing = map.get(key) || {
        ip: p.destIp,
        name: p.destName,
        totalAttacks: 0,
        breaches: 0,
        blocked: 0,
      };
      existing.totalAttacks++;
      if (p.status === 'SUCCESS') existing.breaches++;
      else existing.blocked++;
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalAttacks - a.totalAttacks).slice(0, 4);
  }, [hackerPackets]);

  // Export JSON function
  const exportHackerLog = () => {
    const cleanLog = hackerPackets.map((p) => ({
      tid: p.timestamp,
      hacker_id: p.sourceName,
      source_ip: p.sourceIp,
      target_ip: p.destIp,
      target_name: p.destName,
      metod: p.protocol === 'MALWARE' ? 'Malware Payload' : p.info.split(':')[0],
      status: p.status === 'SUCCESS' ? 'ATTACK LYCKADES' : 'AVVÄRJD AV BRANDVÄGG',
      detaljer: p.info,
    }));
    const dataStr = JSON.stringify(cleanLog, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `hacker_attack_log_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Export Comprehensive Summary Report
  const exportSummaryReport = () => {
    const report = {
      genererad: new Date().toISOString(),
      aggregerade_matt: {
        genomsnittlig_attack_impact_score: `${aggregatedStats.avgImpact}%`,
        maximal_impact_score: `${aggregatedStats.maxImpact}%`,
        genomsnittlig_natverkshalsa: `${aggregatedStats.avgHealth}%`,
        lagsta_natverkshalsa: `${aggregatedStats.minHealth}%`,
        genomsnittlig_latenspaverkan_ms: `+${aggregatedStats.avgLatency}ms`,
        genomsnittlig_paketforlust: `${aggregatedStats.avgPacketLoss}%`,
        trendutveckling: aggregatedStats.trend,
      },
      attack_kategorier: attackBreakdown,
      mest_utsatta_enheter: topTargets,
      tidslinje_datapunkter: history,
    };
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `threat_summary_report_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-xs font-mono select-text">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-200 text-sm">
              Realtids Paketinspektör & Hotanalysator
            </span>
          </div>

          {/* Quick tab switch buttons */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('ALL_TRAFFIC');
                setSelectedPacket(null);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'ALL_TRAFFIC'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nätverkstrafik ({filteredPackets.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('HACKER_ACTIVITY');
                setSelectedPacket(null);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'HACKER_ACTIVITY'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <Skull className="w-3 h-3 text-rose-500" />
              <span>Hacker IDS ({hackerPackets.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('SUMMARY');
                setSelectedPacket(null);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'SUMMARY'
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <BarChart3 className="w-3 h-3 text-emerald-400" />
              <span>Sammanfattningspanel</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('SECURITY_RESPONSE');
                setSelectedPacket(null);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'SECURITY_RESPONSE'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                  : activeRecommendations.length > 0
                  ? 'text-amber-400 hover:text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <ShieldAlert
                className={`w-3.5 h-3.5 ${
                  activeRecommendations.length > 0
                    ? 'text-amber-400 animate-pulse'
                    : 'text-slate-400'
                }`}
              />
              <span>Säkerhetsåtgärder</span>
              {activeRecommendations.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9.5px] font-mono font-extrabold rounded-full animate-pulse">
                  {activeRecommendations.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SECURITY_RESPONSE' && (
            <button
              onClick={handleExecuteAllActions}
              disabled={activeRecommendations.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition shadow-md ${
                activeRecommendations.length > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-amber-950/30 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Exekvera Alla ({activeRecommendations.length})</span>
            </button>
          )}
          {activeTab === 'ALL_TRAFFIC' && (
            <>
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Alla protokoll</option>
                <option value="ICMP">ICMP Ping</option>
                <option value="HTTP">HTTP Web</option>
                <option value="DNS">DNS</option>
                <option value="TCP">TCP Syn/Ack</option>
                <option value="ARP">ARP Resolution</option>
                <option value="NOISE">Bakgrundsbrus (Noise)</option>
                <option value="MALWARE">Malware Threat</option>
              </select>
            </>
          )}

          {activeTab === 'HACKER_ACTIVITY' && (
            <button
              onClick={exportHackerLog}
              disabled={hackerPackets.length === 0}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                hackerPackets.length > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-950/20 font-bold'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportera logg (JSON)</span>
            </button>
          )}

          {activeTab === 'SUMMARY' && (
            <button
              onClick={exportSummaryReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-md shadow-emerald-950/20 font-bold text-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportera Rapport (JSON)</span>
            </button>
          )}

          <button
            onClick={onClearPackets}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 border border-slate-700 transition text-xs font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Rensa logg</span>
          </button>
        </div>
      </div>

      {/* Main Table & Inspector Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Packets Table / Hacker Activity / Summary View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'ALL_TRAFFIC' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-semibold sticky top-0 border-b border-slate-800 font-sans">
                <tr>
                  <th className="p-2.5">Tid</th>
                  <th className="p-2.5">Källa (Src)</th>
                  <th className="p-2.5">Mål (Dst)</th>
                  <th className="p-2.5">Protokoll</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">TTL</th>
                  <th className="p-2.5">Info / Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPackets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 font-sans">
                      Inga fångade paket ännu. Kör ett anslutningstest eller generera nätverkstrafik för att se inspekterade paket!
                    </td>
                  </tr>
                ) : (
                  filteredPackets.map((pkt) => {
                    const isSelected = selectedPacket?.id === pkt.id;
                    return (
                      <tr
                        key={pkt.id}
                        onClick={() => setSelectedPacket(pkt)}
                        className={`hover:bg-slate-900/80 cursor-pointer transition ${
                          isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <td className="p-2.5 text-slate-400 font-mono text-[11px]">
                          {pkt.timestamp}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-200">
                          {pkt.sourceName}{' '}
                          <span className="text-cyan-400 font-mono text-[10px]">
                            ({pkt.sourceIp})
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-200">
                          {pkt.destName}{' '}
                          <span className="text-cyan-400 font-mono text-[10px]">
                            ({pkt.destIp})
                          </span>
                        </td>
                        <td className="p-2.5 font-sans">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                pkt.protocol === 'ICMP'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : pkt.protocol === 'HTTP'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : pkt.protocol === 'DNS'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : pkt.protocol === 'ARP'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : pkt.protocol === 'MALWARE'
                                  ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {pkt.protocol}
                            </span>
                            {pkt.isNoise && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                title="Bakgrunds-brus (Låg prioritet)"
                              >
                                BRUS
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-sans">
                          {pkt.status === 'SUCCESS' ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> OK
                            </span>
                          ) : (
                            <span className="text-rose-400 font-medium flex items-center gap-1" title={pkt.info}>
                              <XCircle className="w-3.5 h-3.5" /> Blockerad
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-400">{pkt.ttl}</td>
                        <td className="p-2.5 text-slate-300 max-w-xs truncate">
                          {pkt.info}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'HACKER_ACTIVITY' && (
            /* Hacker activity specific logs view */
            <div className="p-3 space-y-4 font-sans text-slate-200">
              {/* Live Threat Dashboard Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Attack Impact Score Card */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attack Impact Score</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-extrabold font-mono tracking-tight ${finalImpactScore > 60 ? 'text-rose-500' : finalImpactScore > 30 ? 'text-amber-500' : finalImpactScore > 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                        {finalImpactScore}%
                      </span>
                      <span className="text-[9.5px] font-bold uppercase text-slate-400 font-sans">
                        {finalImpactScore > 75 ? '🔥 KRITISK' : finalImpactScore > 40 ? '⚠️ HÖG' : finalImpactScore > 15 ? '⚡ MEDEL' : finalImpactScore > 0 ? '🔍 LÅG' : '🟢 SÄKER'}
                      </span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${finalImpactScore > 50 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Skull className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                {/* Simulated Latency Penalty Card */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fördröjning (Latency)</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-extrabold font-mono tracking-tight ${averageLatencyPenalty > 500 ? 'text-rose-500 animate-pulse' : averageLatencyPenalty > 150 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        +{averageLatencyPenalty} ms
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans">Svarstid</span>
                    </div>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                {/* Simulated Packet Loss Card */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Paketförlust</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-extrabold font-mono tracking-tight ${averagePacketLossPenalty > 20 ? 'text-red-500 animate-pulse' : averagePacketLossPenalty > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {averagePacketLossPenalty}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans font-mono">Loss rate</span>
                    </div>
                  </div>
                  <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>

                {/* Defense Efficiency Ratio Card */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avvärjda hot (Mitigation)</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold font-mono tracking-tight text-emerald-400">
                        {recentBlockedCount}
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans">
                        av {recentHackerPackets.length} totalt
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Chart and Intrusion Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Network Health vs Threat Level Timeline Graph */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="font-bold text-slate-200 text-xs uppercase tracking-wider font-sans">Tidslinje: Systemhälsa vs Attackbelastning</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">Uppdateras var 3:e sek</span>
                  </div>
                  <div className="h-44 w-full text-slate-300">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                        <YAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif', paddingTop: '5px' }} />
                        <Area type="monotone" dataKey="Hälsa" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={1.5} />
                        <Area type="monotone" dataKey="Impact" name="Attack Impact" stroke="#f43f5e" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mini Advisory Intrusion Summary Column */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-bold text-slate-200 text-xs uppercase tracking-wider font-sans">Säkerhetsrekommendation</span>
                    </div>
                    {finalImpactScore === 0 ? (
                      <p className="text-[10.5px] text-emerald-400 font-sans leading-relaxed">
                        Inga aktiva cyberattacker detekterade. Systemet fungerar normalt. Fortsätt att övervaka portar och brandväggstrafik.
                      </p>
                    ) : finalImpactScore > 60 ? (
                      <p className="text-[10.5px] text-red-300 font-sans leading-relaxed">
                        ⚠️ <strong className="text-red-400">Allvarlig Störning!</strong> DDoS-flöden eller Trojan-aktivitet överstiger nätverkets tolerans. Aktivera din <strong>Nätverks Kill Switch</strong> i hacker-panelen omedelbart för att isolera angriparen.
                      </p>
                    ) : (
                      <p className="text-[10.5px] text-amber-300 font-sans leading-relaxed">
                        ⚡ <strong className="text-amber-400">Aktiv Skanning Detekterad!</strong> Angriparen försöker identifiera svagheter i dina servrar. Konfigurera ytterligare filtreringsregler i dina brandväggar för att stänga portar och avvisa anslutningar.
                      </p>
                    )}
                  </div>
                  <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400 font-sans space-y-1">
                    <div className="flex justify-between">
                      <span>Totala attacker loggade:</span>
                      <span className="font-mono text-rose-400 font-bold">{hackerPackets.length} st</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IDS Signaturskydd:</span>
                      <span className="font-mono text-emerald-400 font-bold">100% (Aktivt)</span>
                    </div>
                  </div>
                </div>
              </div>

              <table className="w-full text-left border-collapse font-mono">
                <thead className="bg-rose-950/20 text-rose-400 text-[10.5px] font-semibold border-b border-rose-950/40">
                  <tr>
                    <th className="p-2.5">Triggad Tid</th>
                    <th className="p-2.5">Hacker-Källa</th>
                    <th className="p-2.5">Mål (IP)</th>
                    <th className="p-2.5">Attackmetod</th>
                    <th className="p-2.5">Allvarlighetsgrad</th>
                    <th className="p-2.5">Status / Mitigation</th>
                    <th className="p-2.5">Beskrivning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {hackerPackets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-500">
                        <Skull className="w-8 h-8 text-slate-700 mx-auto mb-2.5" />
                        Ingen aktiv hacker-trafik upptäckt i nätverket för tillfället.
                      </td>
                    </tr>
                  ) : (
                    hackerPackets.map((pkt) => {
                      const isSelected = selectedPacket?.id === pkt.id;
                      
                      // Calculate severity
                      let severity = 'LÅG';
                      let sevClass = 'bg-slate-800 text-slate-400';
                      if (pkt.info.toLowerCase().includes('ddos') || pkt.info.toLowerCase().includes('overbelastning')) {
                        severity = 'KRITISK (DDoS)';
                        sevClass = 'bg-red-950 text-red-300 border border-red-800/40 animate-pulse';
                      } else if (pkt.protocol === 'MALWARE') {
                        severity = 'HÖG (Exploit)';
                        sevClass = 'bg-rose-950 text-rose-300 border border-rose-800/40';
                      } else if (pkt.info.toLowerCase().includes('poisoning') || pkt.info.toLowerCase().includes('arp')) {
                        severity = 'MEDEL (MITM)';
                        sevClass = 'bg-amber-950 text-amber-300 border border-amber-800/40';
                      } else if (pkt.info.toLowerCase().includes('port scan')) {
                        severity = 'INFO (Rekon)';
                        sevClass = 'bg-blue-950 text-blue-300 border border-blue-900/40';
                      }

                      return (
                        <tr
                          key={pkt.id}
                          onClick={() => setSelectedPacket(pkt)}
                          className={`hover:bg-rose-950/10 cursor-pointer transition ${
                            isSelected ? 'bg-rose-950/20 border-l-2 border-rose-500' : ''
                          }`}
                        >
                          <td className="p-2.5 text-slate-400 text-[11px]">{pkt.timestamp}</td>
                          <td className="p-2.5 text-rose-300 font-bold">{pkt.sourceName} <span className="text-[10px] font-normal opacity-70">({pkt.sourceIp})</span></td>
                          <td className="p-2.5 text-slate-200 font-semibold">{pkt.destName} <span className="text-[10px] font-normal text-cyan-400">({pkt.destIp})</span></td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-900 border border-slate-800 text-slate-300">
                              {pkt.protocol}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${sevClass}`}>
                              {severity}
                            </span>
                          </td>
                          <td className="p-2.5 font-sans text-[11px]">
                            {pkt.status === 'SUCCESS' ? (
                              <span className="text-red-400 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 shrink-0" /> ATTACK LYCKADES
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> TRÄFF BRANDVÄGG
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-300 text-[11px] max-w-sm truncate" title={pkt.info}>
                            {pkt.info}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'SUMMARY' && (
            /* Dedicated Comprehensive Threat Summary & Trend Dashboard */
            <div className="p-4 space-y-5 font-sans text-slate-200">
              {/* Summary Header Toolbar & Time Window Picker */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>Aggregerad Analys: Nätverkshälsa vs. Attack Impact Score</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Övervakning av attacktrender, genomsnittlig belastning och brandväggarnas motståndskraft över tid.
                    </p>
                  </div>
                </div>

                {/* Time Window Filter */}
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Tidsfönster:</span>
                  <button
                    onClick={() => setSummaryTimeframe('30S')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      summaryTimeframe === '30S'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Senaste 30s
                  </button>
                  <button
                    onClick={() => setSummaryTimeframe('5M')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      summaryTimeframe === '5M'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Senaste 5m
                  </button>
                  <button
                    onClick={() => setSummaryTimeframe('ALL')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      summaryTimeframe === 'ALL'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Tid
                  </button>
                </div>
              </div>

              {/* Top Aggregated KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Average Attack Impact */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Genomsnittlig Impact</span>
                    <Activity className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-extrabold font-mono ${aggregatedStats.avgImpact > 50 ? 'text-rose-500' : aggregatedStats.avgImpact > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {aggregatedStats.avgImpact}%
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      Peak: {aggregatedStats.maxImpact}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {aggregatedStats.trend === 'DEGRADING' ? (
                      <span className="text-rose-400 flex items-center gap-0.5 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" /> Ökande hotbild
                      </span>
                    ) : aggregatedStats.trend === 'IMPROVING' ? (
                      <span className="text-emerald-400 flex items-center gap-0.5 font-semibold">
                        <TrendingDown className="w-3.5 h-3.5" /> Hotbild avtar
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5 font-semibold">
                        <RefreshCw className="w-3 h-3" /> Stabil hotbild
                      </span>
                    )}
                  </div>
                </div>

                {/* Average Network Health */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Aggregerad Hälsa</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-extrabold font-mono ${aggregatedStats.avgHealth > 80 ? 'text-emerald-400' : aggregatedStats.avgHealth > 50 ? 'text-amber-400' : 'text-red-500'}`}>
                      {aggregatedStats.avgHealth}%
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      Lägst: {aggregatedStats.minHealth}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${aggregatedStats.avgHealth > 80 ? 'bg-emerald-400' : aggregatedStats.avgHealth > 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${aggregatedStats.avgHealth}%` }}
                    />
                  </div>
                </div>

                {/* Average Latency Impact */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Snitt Fördröjning</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-extrabold font-mono ${aggregatedStats.avgLatency > 300 ? 'text-rose-400' : 'text-amber-300'}`}>
                      +{aggregatedStats.avgLatency} ms
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      Max: +{aggregatedStats.maxLatency}ms
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Paketförlust: ~{aggregatedStats.avgPacketLoss}%
                  </span>
                </div>

                {/* Total Defense / Mitigation Rate */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Brandväggs-Skyddsgrad</span>
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold font-mono text-cyan-400">
                      {hackerPackets.length > 0
                        ? `${Math.round(((hackerPackets.length - hackerPackets.filter(p => p.status === 'SUCCESS').length) / hackerPackets.length) * 100)}%`
                        : '100%'}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      {hackerPackets.filter(p => p.status !== 'SUCCESS').length} avvärjda
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Totalt {hackerPackets.length} loggade hackerpaket
                  </span>
                </div>
              </div>

              {/* Main Recharts Visualizations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Graph: Aggregated Health vs. Impact Timeline */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider font-sans">
                        Tidslinje: Nätverkets Hälsa vs. Attack Impact Score (Aggregerad)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Nätverkshälsa
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> Attack Impact Score
                    </div>
                  </div>

                  <div className="h-64 w-full text-slate-300">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sumColorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                          </linearGradient>
                          <linearGradient id="sumColorImpact" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={6} />
                        <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#1e293b',
                            borderRadius: '8px',
                            color: '#cbd5e1',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                          }}
                        />
                        <ReferenceLine y={50} stroke="#e11d48" strokeDasharray="4 4" label={{ value: 'Kritisk Tröskel (50%)', fill: '#fda4af', fontSize: 9, position: 'insideTopRight' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', paddingTop: '8px' }} />
                        <Area
                          type="monotone"
                          dataKey="Hälsa"
                          name="Nätverkshälsa (%)"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#sumColorHealth)"
                        />
                        <Area
                          type="monotone"
                          dataKey="Impact"
                          name="Attack Impact Score (%)"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#sumColorImpact)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Graph: Attack Type & Mitigation BarChart */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider font-sans">
                        Attacktyper & Försvar
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attackBreakdown} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} tickMargin={4} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#1e293b',
                            borderRadius: '8px',
                            color: '#cbd5e1',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                        <Bar dataKey="blocked" name="Avvärjda av Brandvägg" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="success" name="Genomförda Intrång" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Breakdown: Latency Timeline & Target Risk Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Latency & Packet Loss Graph */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider font-sans">
                        Degradering: Latens (ms) & Paketförlust (%)
                      </span>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="Latency" name="Svarstid (ms)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="PacketLoss" name="Förlust (%)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Targeted Endpoints & Threat Recommendations */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                      <Server className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider font-sans">
                        Mest Utsatta Enheter i Nätverket
                      </span>
                    </div>

                    {topTargets.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-6">
                        Inga enheter har blivit attackerade än.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {topTargets.map((target, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-200 block">{target.name}</span>
                                <span className="text-[10px] text-cyan-400 font-mono">{target.ip}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 font-mono text-[11px]">
                              <div className="text-right">
                                <span className="text-slate-400 block text-[9px]">ATTACKER</span>
                                <span className="font-bold text-slate-200">{target.totalAttacks} st</span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-400 block text-[9px]">AVVÄRJDA</span>
                                <span className="font-bold text-emerald-400">{target.blocked}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-rose-400 block text-[9px]">INTRÅNG</span>
                                <span className={`font-bold ${target.breaches > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                  {target.breaches}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10.5px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Aktiv Brandväggsinspektion
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Uppdateras kontinuerligt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SECURITY_RESPONSE' && (
            /* Dedicated Security Response & Recommended Remediation Panel */
            <div className="p-4 space-y-5 font-sans text-slate-200">
              {/* Toast Feedback Notification */}
              {toastMessage && (
                <div className="bg-slate-900/95 border-2 border-emerald-500 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] px-4 py-3 rounded-xl flex items-center gap-3 text-xs backdrop-blur-md animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{toastMessage}</span>
                </div>
              )}

              {/* Top Security Posture & Incident Command Banner */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  securityStats.postureRating === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-500/70 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                    : securityStats.postureRating === 'VULNERABLE'
                    ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : securityStats.postureRating === 'MODERATE'
                    ? 'bg-blue-950/40 border-blue-500/50'
                    : 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        securityStats.postureRating === 'CRITICAL'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                          : securityStats.postureRating === 'VULNERABLE'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : securityStats.postureRating === 'MODERATE'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      }`}
                    >
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                          Incident Response & Mitigation Engine
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            securityStats.postureRating === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                              : securityStats.postureRating === 'VULNERABLE'
                              ? 'bg-amber-950 text-amber-300 border-amber-500'
                              : securityStats.postureRating === 'MODERATE'
                              ? 'bg-blue-950 text-blue-300 border-blue-500'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          }`}
                        >
                          {securityStats.postureRating === 'CRITICAL'
                            ? '🔴 KRITISK SITUATION'
                            : securityStats.postureRating === 'VULNERABLE'
                            ? '🟠 SÅRBART NÄTVERK'
                            : securityStats.postureRating === 'MODERATE'
                            ? '🟡 MEDELSTOR RISKNIVÅ'
                            : '🟢 OPTIMAL SÄKERHET'}
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-100 mt-1">
                        Rekommenderade Säkerhetsåtgärder
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Analysmotorn övervakar aktiv trafik, portskanningar, infektioner och föreslår omedelbara 1-klicks åtgärder för att skydda topologin.
                      </p>
                    </div>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExecuteAllActions}
                      disabled={activeRecommendations.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                        activeRecommendations.length > 0
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-500/20 cursor-pointer animate-pulse'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Exekvera Alla Åtgärder ({activeRecommendations.length})</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Aktiva Rekommendationer
                    </span>
                    <span className="text-xl font-extrabold font-mono text-amber-400">
                      {activeRecommendations.length} st
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Kritiska Hot
                    </span>
                    <span className="text-xl font-extrabold font-mono text-rose-400">
                      {securityStats.criticalThreats} st
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Infekterade Noder
                    </span>
                    <span className="text-xl font-extrabold font-mono text-rose-300">
                      {securityStats.compromisedNodesCount} st
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Utsatta Subnätszoner
                    </span>
                    <span className="text-xl font-extrabold font-mono text-cyan-400">
                      {securityStats.threatenedSubnetsCount} zoner
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setResponseCategoryFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      responseCategoryFilter === 'ALL'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Alla ({recommendations.length})
                  </button>
                  <button
                    onClick={() => setResponseCategoryFilter('PORTS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      responseCategoryFilter === 'PORTS'
                        ? 'bg-blue-500 text-white font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-blue-300 border border-slate-800'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Port-Blockering</span>
                  </button>
                  <button
                    onClick={() => setResponseCategoryFilter('SUBNETS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      responseCategoryFilter === 'SUBNETS'
                        ? 'bg-purple-500 text-white font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-purple-300 border border-slate-800'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Subnätsisolering</span>
                  </button>
                  <button
                    onClick={() => setResponseCategoryFilter('HACKERS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      responseCategoryFilter === 'HACKERS'
                        ? 'bg-rose-600 text-white font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-rose-300 border border-slate-800'
                    }`}
                  >
                    <Skull className="w-3 h-3" />
                    <span>Angripar-Isolering</span>
                  </button>
                  <button
                    onClick={() => setResponseCategoryFilter('MALWARE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      responseCategoryFilter === 'MALWARE'
                        ? 'bg-emerald-600 text-white font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Malware-Sanering</span>
                  </button>
                </div>

                {/* Search box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={responseSearchQuery}
                    onChange={(e) => setResponseSearchQuery(e.target.value)}
                    placeholder="Sök IP, port, enhet eller subnät..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Recommended Action Cards List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span>Detekterade Åtgärdsförslag ({filteredRecommendations.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {appliedActionIds.size} åtgärd(er) verkställda under sessionen
                  </span>
                </div>

                {filteredRecommendations.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-200">
                        Inga akuta hot eller sårbarhetsmönster matchar filtret!
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Nätverket är välskyddat eller så har alla rekommenderade åtgärder redan genomförts. Nya rekommendationer genereras automatiskt vid aktiv hacker-trafik.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredRecommendations.map((action) => {
                      const isApplied = appliedActionIds.has(action.id);

                      return (
                        <div
                          key={action.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            isApplied
                              ? 'bg-slate-950/60 border-slate-800 opacity-60'
                              : action.severity === 'CRITICAL'
                              ? 'bg-slate-900/95 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-400'
                              : action.severity === 'HIGH'
                              ? 'bg-slate-900/95 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.12)] hover:border-amber-400'
                              : 'bg-slate-900/95 border-blue-500/40 hover:border-blue-400'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Header: Severity, Category Badge & Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                                    action.severity === 'CRITICAL'
                                      ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                                      : action.severity === 'HIGH'
                                      ? 'bg-amber-950 text-amber-300 border-amber-500'
                                      : 'bg-blue-950 text-blue-300 border-blue-500'
                                  }`}
                                >
                                  {action.severity === 'CRITICAL'
                                    ? '🔥 KRITISK'
                                    : action.severity === 'HIGH'
                                    ? '⚠️ HÖG RISK'
                                    : '⚡ MEDEL'}
                                </span>

                                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-300 font-bold">
                                  {action.badge}
                                </span>
                              </div>

                              {isApplied && (
                                <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 px-2 py-0.5 rounded-full font-mono">
                                  <CheckCheck className="w-3.5 h-3.5" /> VERKSTÄLLD
                                </span>
                              )}
                            </div>

                            {/* Title & Description */}
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-100">
                                {action.title}
                              </h4>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {action.description}
                              </p>
                            </div>

                            {/* Target Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                              {action.targetNodeName && (
                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                  Mål: <strong className="text-cyan-400">{action.targetNodeName}</strong>
                                </span>
                              )}
                              {action.targetIp && (
                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                                  IP: {action.targetIp}
                                </span>
                              )}
                              {action.targetPort && (
                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-amber-800/60 text-amber-300 font-bold">
                                  Port: {action.targetPort}
                                </span>
                              )}
                              {action.subnetName && (
                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-purple-800/60 text-purple-300">
                                  Zon: {action.subnetName}
                                </span>
                              )}
                              {action.attackerName && (
                                <span className="bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/60 text-rose-300">
                                  Angripare: {action.attackerName}
                                </span>
                              )}
                            </div>

                            {/* Technical Explanation Box */}
                            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-sans space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider font-mono">
                                ⚙️ TEKNISK NÄTVERKSEFFEKT
                              </span>
                              <p className="leading-snug text-slate-300">
                                {action.explanation}
                              </p>
                            </div>
                          </div>

                          {/* Action Button Trigger */}
                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {action.id}
                            </span>
                            <button
                              onClick={() => handleExecuteSingleAction(action)}
                              disabled={isApplied}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                                isApplied
                                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                  : action.severity === 'CRITICAL'
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-rose-950/40 cursor-pointer animate-pulse'
                                  : action.severity === 'HIGH'
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-950/30 cursor-pointer font-extrabold'
                                  : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 shadow-cyan-950/30 cursor-pointer font-bold'
                              }`}
                            >
                              {action.actionType === 'CLOSE_PORT' && <Lock className="w-3.5 h-3.5" />}
                              {action.actionType === 'ISOLATE_SUBNET' && <Globe className="w-3.5 h-3.5" />}
                              {action.actionType === 'DISCONNECT_HACKER' && <Unlink className="w-3.5 h-3.5" />}
                              {action.actionType === 'DISINFECT_NODE' && <Sparkles className="w-3.5 h-3.5" />}
                              {action.actionType === 'DEPLOY_FIREWALL_BLOCK' && <ShieldBan className="w-3.5 h-3.5" />}
                              {action.actionType === 'ENABLE_STRICT_FILTERING' && <ShieldCheck className="w-3.5 h-3.5" />}
                              <span>{isApplied ? 'Redan Verkställd' : action.actionLabel}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Subnet & Port Quick-Mitigation Matrices */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                {/* Subnet Isolation Matrix */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                        Subnätszoner & Karantänmatris
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {containers.length} zoner konfigurerade
                    </span>
                  </div>

                  {containers.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-6">
                      Inga subnätscontainrar har skapats i canvasen än.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {containers.map((c) => {
                        const containerNodes = nodes.filter((n) => c.nodeIds?.includes(n.id));
                        const hasInfected = containerNodes.some((n) => n.isInfected);
                        const hasHacker = containerNodes.some((n) => n.type === 'hacker');

                        return (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                              hasInfected
                                ? 'bg-rose-950/30 border-rose-500/50'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  hasInfected
                                    ? 'bg-rose-500 animate-ping'
                                    : hasHacker
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              <div>
                                <span className="font-bold text-slate-200 block">{c.name}</span>
                                <span className="text-[10.5px] text-slate-400 font-mono">
                                  {c.subnet || 'Zon'} • {containerNodes.length} enheter
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleQuickSubnetIsolate(c.id)}
                              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow transition cursor-pointer flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Isolera Subnät</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Instant Port Shield Matrix */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                        Snabbmatris: Portskydd i Brandvägg
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Snabb-filter per protokoll
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { port: 80, label: 'HTTP (80)', desc: 'Webbtrafik' },
                      { port: 443, label: 'HTTPS (443)', desc: 'SSL Web' },
                      { port: 22, label: 'SSH (22)', desc: 'Fjärradmin' },
                      { port: 53, label: 'DNS (53)', desc: 'Namnuppslag' },
                      { port: 1433, label: 'SQL (1433)', desc: 'Databas' },
                      { port: 445, label: 'SMB (445)', desc: 'Fildelning' },
                    ].map(({ port, label, desc }) => {
                      const isBlocked = nodes.some(
                        (n) => n.firewallRules?.some((r) => r.port === port && r.action === 'block')
                      );

                      return (
                        <div
                          key={port}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                            isBlocked
                              ? 'bg-rose-950/20 border-rose-500/50'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200 text-xs">{label}</span>
                              <span
                                className={`text-[8.5px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
                                  isBlocked
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {isBlocked ? 'STÄNGD' : 'ÖPPEN'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-sans block">{desc}</span>
                          </div>

                          <button
                            onClick={() => handleQuickPortToggle(port, isBlocked)}
                            className={`w-full py-1 rounded-lg text-[10.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              isBlocked
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                            }`}
                          >
                            {isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isBlocked ? 'Öppna Port' : 'Stäng Port'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Applied Remediation Audit Trail */}
              {responseAuditLogs.length > 0 && (
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                        Logg över Verkställda Säkerhetsåtgärder (Audit Trail)
                      </span>
                    </div>
                    <button
                      onClick={() => setResponseAuditLogs([])}
                      className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      Rensa historik
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[11px]">
                    {responseAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                          <span className="text-emerald-400 font-semibold">{log.message}</span>
                        </div>
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {log.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Packet Header Inspector */}
        {selectedPacket && (
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 space-y-3 font-sans overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Pakethuvud-analys</span>
              </h3>
              <button
                onClick={() => setSelectedPacket(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-sans block text-[10px]">FRAME</span>
                <span className="text-slate-200 font-bold">
                  Ethernet II, Src: {selectedPacket.sourceIp}, Dst: {selectedPacket.destIp}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-sans block text-[10px]">IP HEADER</span>
                <span className="text-cyan-400">
                  Version 4, TTL {selectedPacket.ttl}, Protocol {selectedPacket.protocol}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-sans block text-[10px]">QOS & TRAFIKTYP</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-300 font-sans text-[11px]">Prioritet:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedPacket.priority === 'low'
                        ? 'bg-sky-500/20 text-sky-300'
                        : selectedPacket.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {selectedPacket.priority === 'low'
                      ? 'LÅG (0x01)'
                      : selectedPacket.priority === 'high'
                      ? 'HÖG (0x05)'
                      : 'NORMAL (0x00)'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-900">
                  <span className="text-slate-300 font-sans text-[11px]">Bakgrunds-brus:</span>
                  <span
                    className={`text-[10px] font-sans font-medium ${
                      selectedPacket.isNoise ? 'text-sky-300' : 'text-slate-400'
                    }`}
                  >
                    {selectedPacket.isNoise ? 'Ja (Simulerat brus)' : 'Nej (Applikation)'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-sans block text-[10px]">PAYLOAD HEX / ASCII</span>
                <div className="text-[10px] text-slate-300 break-all leading-tight mt-1">
                  {selectedPacket.payload || 'No extended payload data attached.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

