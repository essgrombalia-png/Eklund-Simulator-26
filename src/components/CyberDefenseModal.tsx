import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Flame,
  Zap,
  Lock,
  Unlock,
  Radio,
  Server,
  Crosshair,
  Skull,
  Terminal,
  Activity,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Search,
  Filter,
  Check,
  Ban,
  Wrench,
  Sparkles,
  Download,
  Eye,
  Sliders,
  Play,
  Square,
  Copy,
  Cpu,
  Layers,
  FileSpreadsheet,
  X,
  ArrowRight,
  ChevronRight,
  ShieldOff,
  Wifi,
  Database,
  Globe,
  Radio as Radar,
} from 'lucide-react';
import { Device, Link, NetworkContainer, FirewallRule, CapturedPacket, DeviceType } from '../types';
import { isHackerDevice } from '../utils/hackerEngine';
import { RealisticDeviceIcon } from './RealisticDeviceIcon';

interface CyberDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
  packets?: CapturedPacket[];
  onUpdateNode: (node: Device) => void;
  onUpdateMultipleNodes: (nodes: Device[]) => void;
  onUpdateLink: (link: Link) => void;
  onUpdateMultipleLinks: (links: Link[]) => void;
  onAddDevice?: (type: DeviceType) => void;
  onSelectNodeOnCanvas?: (nodeId: string) => void;
  onOpenAntivirus?: () => void;
  onOpenIncidentResponse?: () => void;
}

export type DefenseTab = 'arsenal' | 'honeypot' | 'mitre' | 'simulator' | 'audit';

export interface DefenseActionLog {
  id: string;
  timestamp: string;
  actionTitle: string;
  category: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export const CyberDefenseModal: React.FC<CyberDefenseModalProps> = ({
  isOpen,
  onClose,
  nodes,
  links,
  containers = [],
  packets = [],
  onUpdateNode,
  onUpdateMultipleNodes,
  onUpdateLink,
  onUpdateMultipleLinks,
  onAddDevice,
  onSelectNodeOnCanvas,
  onOpenAntivirus,
  onOpenIncidentResponse,
}) => {
  const [activeTab, setActiveTab] = useState<DefenseTab>('arsenal');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [defenseLogs, setDefenseLogs] = useState<DefenseActionLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      actionTitle: 'Cyber Defense Center Initialiserat',
      category: 'SYSTEM',
      details: 'Övervakningsmotorer och hotdetektorer är aktiva och i realtidsläge.',
      status: 'SUCCESS',
    },
  ]);

  // Selected simulation attack
  const [simAttackType, setSimAttackType] = useState<
    'ddos' | 'ransomware' | 'mitm' | 'dns_poison' | 'port_scan' | 'autonomous_ai'
  >('ddos');
  const [simTargetNodeId, setSimTargetNodeId] = useState<string>('');

  if (!isOpen) return null;

  const addLog = (actionTitle: string, category: string, details: string, status: 'SUCCESS' | 'WARNING' | 'ALERT' = 'SUCCESS') => {
    const newLog: DefenseActionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      actionTitle,
      category,
      details,
      status,
    };
    setDefenseLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const triggerToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4500);
  };

  // Threat calculations
  const activeHackers = nodes.filter((n) => isHackerDevice(n.type) && n.on && n.hackerAttackActive);
  const totalHackers = nodes.filter((n) => isHackerDevice(n.type));
  const infectedNodes = nodes.filter((n) => n.isInfected);
  const honeypots = nodes.filter((n) => n.type === 'honeypot');
  const firewalls = nodes.filter((n) => n.type === 'firewall' || n.type === 'waf');
  const ddosScrubbers = nodes.filter((n) => n.type === 'ddos_scrubber');
  const siemNodes = nodes.filter((n) => n.type === 'siem_soc');

  // Count open vulnerable ports across endpoints
  const openRiskyServicesCount = nodes.filter(
    (n) => !isHackerDevice(n.type) && (n.services?.http || n.services?.dns || n.services?.sql)
  ).length;

  // Calculate overall defense score (0 - 100)
  const defenseScore = useMemo(() => {
    let score = 100;
    if (activeHackers.length > 0) score -= activeHackers.length * 25;
    if (infectedNodes.length > 0) score -= infectedNodes.length * 20;
    if (totalHackers.length > activeHackers.length) score -= totalHackers.length * 5;
    if (firewalls.length === 0) score -= 15;
    if (honeypots.length > 0) score += 5;
    if (ddosScrubbers.length > 0) score += 5;
    if (siemNodes.length > 0) score += 5;
    return Math.max(5, Math.min(100, score));
  }, [activeHackers.length, infectedNodes.length, totalHackers.length, firewalls.length, honeypots.length, ddosScrubbers.length, siemNodes.length]);

  // 1. TOOL: EMERGENCY CYBER LOCKDOWN & QUARANTINE
  const handleEmergencyLockdown = () => {
    const updatedNodes = nodes.map((n) => {
      if (isHackerDevice(n.type)) {
        return { ...n, hackerAttackActive: false, on: false };
      }
      if (n.isInfected) {
        return { ...n, vlanId: 999, antivirusStatus: 'VULN' as const };
      }
      return n;
    });

    // Sever links attached directly to active hackers
    const hackerIds = new Set(nodes.filter((n) => isHackerDevice(n.type)).map((n) => n.id));
    const safeLinks = links.filter((l) => !hackerIds.has(l.a) && !hackerIds.has(l.b));

    onUpdateMultipleNodes(updatedNodes);
    onUpdateMultipleLinks(safeLinks);

    const msg = `NÖDLÄGE UTFÖRT: ${totalHackers.length} angripare avstängda/bortkopplade, ${infectedNodes.length} smittade enheter placerade i Karantän VLAN 999!`;
    triggerToast(msg);
    addLog('Nödisolering & Cyber Lockdown', 'QUARANTINE', msg, 'SUCCESS');
  };

  // 2. TOOL: ACTIVE ANTI-DDOS & SYN SCRUBBER
  const handleMitigateDDoS = () => {
    // Stop DDoS attacks from hackers and normalize packet loss on all links
    const updatedNodes = nodes.map((n) => {
      if (isHackerDevice(n.type) && (n.hackerAttackType === 'ddos' || n.hackerAttackActive)) {
        return { ...n, hackerAttackActive: false };
      }
      return n;
    });

    const updatedLinks = links.map((l) => ({
      ...l,
      packetLossPercent: 0,
      latencyMs: Math.min(l.latencyMs, 10),
    }));

    onUpdateMultipleNodes(updatedNodes);
    onUpdateMultipleLinks(updatedLinks);

    const msg = 'ANTI-DDOS SKYDD AKTIVERAT: BGP Rate-Limiting & SYN-Proxy aktiverat! All paketförlust nollställd till 0%.';
    triggerToast(msg);
    addLog('Anti-DDoS Scrubbing', 'MITIGATION', msg, 'SUCCESS');
  };

  // 3. TOOL: DECEPTION HONEYPOT DIVERTER
  const handleLureToHoneypot = () => {
    let targetHoneypot = honeypots[0];

    // If no honeypot exists on canvas, find first available node or inform user
    if (!targetHoneypot) {
      triggerToast('Skapa först en Decoy Honeypot från paletten eller klicka på knappen "Skapa Honeypot" nedan.');
      return;
    }

    const updatedNodes = nodes.map((n) => {
      if (isHackerDevice(n.type)) {
        return {
          ...n,
          hackerTargetIp: targetHoneypot.ip || '192.168.1.250',
          hackerAttackActive: true,
        };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = `HONEYPOT DECEPTION AKTIVERAT: Alla angripare styrs nu mot fällan ${targetHoneypot.name} (${targetHoneypot.ip})! Produktionsservrar är skyddade.`;
    triggerToast(msg);
    addLog('Honeypot Deception Lure', 'DECEPTION', msg, 'SUCCESS');
  };

  // 4. TOOL: EDR 1-CLICK MALWARE DISINFECTION
  const handleDisinfectAll = () => {
    const updatedNodes = nodes.map((n) => {
      if (n.isInfected) {
        return {
          ...n,
          isInfected: false,
          antivirusStatus: 'PROTECTED' as const,
          antivirusInstalled: true,
          antivirusRealtimeProtection: true,
          antivirusThreatsBlocked: (n.antivirusThreatsBlocked || 0) + 1,
        };
      }
      if (isHackerDevice(n.type)) {
        return { ...n, hackerAttackActive: false };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = `EDR SANERING KLAR: ${infectedNodes.length} enheter har sanerats från trojaner/ransomware. 100% Systemhälsa återställd!`;
    triggerToast(msg);
    addLog('EDR Malware Sanering', 'EDR_SWEEP', msg, 'SUCCESS');
  };

  // 5. TOOL: AUTO-HARDENING ZERO-TRUST FIREWALL GENERATOR
  const handleAutoHardenFirewalls = () => {
    const fwNodes = nodes.filter((n) => n.type === 'firewall' || n.type === 'waf');
    if (fwNodes.length === 0) {
      triggerToast('Ingen brandvägg hittades på nätverket. Lägg till en NGFW eller WAF från paletten.');
      return;
    }

    const recommendedRules: FirewallRule[] = [
      {
        id: `fw-rule-malware-${Date.now()}`,
        action: 'block',
        protocol: 'MALWARE',
        sourceIp: '*',
        destIp: '*',
        description: 'Zero-Trust IPS: Blockera all skadlig kod & botnet-trafik',
      },
      {
        id: `fw-rule-smb-${Date.now()}`,
        action: 'block',
        protocol: 'TCP',
        sourceIp: '*',
        destIp: '*',
        port: 445,
        description: 'Anti-Ransomware: Blockera SMB port 445 från WAN/laterals',
      },
      {
        id: `fw-rule-telnet-${Date.now()}`,
        action: 'block',
        protocol: 'TCP',
        sourceIp: '*',
        destIp: '*',
        port: 23,
        description: 'Säkerhetshärdning: Blockera osäker Telnet port 23',
      },
      {
        id: `fw-rule-rdp-${Date.now()}`,
        action: 'block',
        protocol: 'TCP',
        sourceIp: '*',
        destIp: '*',
        port: 3389,
        description: 'Zero-Trust: Spärra direkt RDP exponering mot internet',
      },
    ];

    const updatedNodes = nodes.map((n) => {
      if (n.type === 'firewall' || n.type === 'waf') {
        const existingRules = n.firewallRules || [];
        const existingDescriptions = new Set(existingRules.map((r) => r.description));
        const newRules = recommendedRules.filter((r) => !existingDescriptions.has(r.description));
        return {
          ...n,
          firewallRules: [...existingRules, ...newRules],
        };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = `ZERO-TRUST HÄRDNING: Auto-genererade och injicerade 4 strikta säkerhetsregler i samtliga brandväggar!`;
    triggerToast(msg);
    addLog('Zero-Trust Brandväggshärdning', 'HARDENING', msg, 'SUCCESS');
  };

  // 6. TOOL: ROGUE AP & WIFI DEAUTHER
  const handleNeutralizeRogueAp = () => {
    const roguePineapples = nodes.filter((n) => n.type === 'hacker_pineapple' || n.type === 'hacker_implant');
    if (roguePineapples.length === 0) {
      triggerToast('Inga trådlösa Rogue APs (WiFi Pineapples) eller hårdvaru-tappar detekterades.');
      return;
    }

    const updatedNodes = nodes.map((n) => {
      if (n.type === 'hacker_pineapple' || n.type === 'hacker_implant') {
        return { ...n, on: false, hackerAttackActive: false };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = `WIFI DEAUTH & MITM NEUTRALISERAD: ${roguePineapples.length} Rogue WiFi Pineapples/Implantat avstängda!`;
    triggerToast(msg);
    addLog('Rogue AP Jamming & Neutralisering', 'WIFI_DEFENSE', msg, 'SUCCESS');
  };

  // 7. TOOL: FLUSH DNS POISON & REPAIR ARP
  const handleFlushDnsAndArp = () => {
    const updatedNodes = nodes.map((n) => {
      if (n.type === 'server_dns') {
        // Restore legitimate DNS mappings
        return {
          ...n,
          dnsRecords: [
            { id: '1', hostname: 'portal.foretag.se', ip: '10.0.0.10', type: 'A' },
            { id: '2', hostname: 'bank.se', ip: '192.168.1.100', type: 'A' },
            { id: '3', hostname: 'api.foretag.se', ip: '172.16.0.10', type: 'A' },
          ],
        };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = 'DNS & ARP SANERING: Spoofade DNS-cacheposter rensade, auktoritativa poster återställda och Gratuitous ARP utsänd!';
    triggerToast(msg);
    addLog('DNS & ARP Cache Återställning', 'INTEGRITY', msg, 'SUCCESS');
  };

  // 8. TOOL: BGP ATTACKER NULL-ROUTE & SHUTDOWN
  const handleBlackholeAttacker = () => {
    const updatedNodes = nodes.map((n) => {
      if (isHackerDevice(n.type)) {
        return { ...n, hackerAttackActive: false, on: false };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = `BGP BLACKHOLE AKTIVERAT: ${totalHackers.length} angripar-adresser null-routade i kärnnätet! C2-sessioner brutna.`;
    triggerToast(msg);
    addLog('BGP Blackhole & C2 Teardown', 'BLACKHOLE', msg, 'SUCCESS');
  };

  // SIMULATOR LAUNCH
  const handleLaunchSimulation = () => {
    const target = nodes.find((n) => n.id === simTargetNodeId) || nodes.find((n) => !isHackerDevice(n.type) && n.on);
    if (!target) {
      triggerToast('Välj en målnod att simulera attack mot.');
      return;
    }

    let hacker = nodes.find((n) => isHackerDevice(n.type));
    let updatedNodes = [...nodes];

    if (!hacker) {
      // Create a temporary simulated hacker node or notify
      triggerToast('Lägg först till en Red Team Hackarterminal från paletten för att köra live simulering.');
      return;
    }

    updatedNodes = updatedNodes.map((n) => {
      if (n.id === hacker?.id) {
        return {
          ...n,
          on: true,
          hackerAttackActive: true,
          hackerAttackType: simAttackType,
          hackerAttackIntensity: 'brute-force-flood' as const,
          hackerTargetIp: target.ip || '192.168.1.10',
        };
      }
      return n;
    });

    onUpdateMultipleNodes(updatedNodes);
    const msg = `SIMULERING STARTAD: ${simAttackType.toUpperCase()} angrepp initierat mot ${target.name} (${target.ip})! Testa dina Blue Team försvar.`;
    triggerToast(msg);
    addLog('Red Team Attack Simulering', 'SIMULATION', msg, 'WARNING');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden font-sans text-slate-100">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-cyan-300 font-mono">
                  CYBER DEFENSE OPERATIONS CENTER
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Blue Team Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aktivt skydd, nödisolering, honeypots, DDoS-scrubbing och motåtgärder mot hacker-angrepp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Defense Index Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              defenseScore >= 80
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : defenseScore >= 50
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
            }`}>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Försvarsindex</div>
                <div className="text-sm font-black">{defenseScore}% {defenseScore >= 80 ? 'OPTIMALT' : defenseScore >= 50 ? 'SÅRBART' : 'KRITISKT'}</div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                defenseScore >= 80 ? 'bg-emerald-400' : defenseScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST SUCCESS MESSAGE */}
        {actionSuccessMsg && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-cyan-950/90 via-blue-900/90 to-cyan-950/90 border-b border-cyan-500/50 flex items-center justify-between text-xs text-cyan-200 font-mono animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-cyan-400 hover:text-cyan-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-xs shrink-0 font-mono">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <Flame className={`w-4 h-4 ${activeHackers.length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] text-slate-400">Aktiva Hackerattacker</div>
              <div className={`font-bold ${activeHackers.length > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {activeHackers.length} {activeHackers.length > 0 ? 'PÅGÅENDE' : '0 st'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <Skull className={`w-4 h-4 ${infectedNodes.length > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400">Smittade Noder (Malware)</div>
              <div className={`font-bold ${infectedNodes.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {infectedNodes.length} st
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">Brandväggar & WAF</div>
              <div className="font-bold text-cyan-300">{firewalls.length} st aktiva</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400">Decoy Honeypots</div>
              <div className="font-bold text-amber-300">{honeypots.length} st fällor</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <Radar className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[10px] text-slate-400">DDoS Scrubbers / SIEM</div>
              <div className="font-bold text-indigo-300">{ddosScrubbers.length + siemNodes.length} st noder</div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('arsenal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'arsenal'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Säkerhetsarsenal & Nödkontroller</span>
          </button>

          <button
            onClick={() => setActiveTab('honeypot')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'honeypot'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Deception & Honeypot Fällor</span>
            {honeypots.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded font-mono">
                {honeypots.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mitre')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'mitre'
                ? 'bg-slate-900 text-indigo-400 border-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>MITRE ATT&CK & Försvarsmatris</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'simulator'
                ? 'bg-slate-900 text-rose-400 border-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Attack & Försvarssimulator</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-teal-400 border-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Forensisk Logg & Audit</span>
            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 text-[10px] rounded font-mono">
              {defenseLogs.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: ARSENAL & EMERGENCY CONTROLS */}
          {activeTab === 'arsenal' && (
            <div className="space-y-6">
              
              {/* PRIMARY EMERGENCY BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-300 font-mono flex items-center gap-2">
                      <span>NÖDLÄGE: 1-KLICK CYBER LOCKDOWN</span>
                      {activeHackers.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black animate-pulse">
                          HOT DETEKTERAT
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Kopplar omedelbart bort alla aktiva angripare, stänger av skadliga anslutningar och isolerar smittade enheter till Karantän VLAN 999.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleEmergencyLockdown}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black font-mono bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 transition cursor-pointer border border-rose-400/60"
                  >
                    <Ban className="w-4 h-4" />
                    <span>AKTIVERA NÖDISOLERING</span>
                  </button>
                </div>
              </div>

              {/* 8 INTERACTIVE BLUE TEAM DEFENSE WEAPONS */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
                  <span>Aktiva Cyberförsvarsverktyg (Blue Team Motåtgärder)</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Klicka på en åtgärd för omedelbar tillämpning</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Tool 1: Anti-DDoS Scrubbing */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          L3/L4 FILTER
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                        Anti-DDoS & SYN Scrubber
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Aktiverar BGP SYN-proxy och rate-limiting mot volymattacker. Nollställer paketförlust på alla länkar.
                      </p>
                    </div>
                    <button
                      onClick={handleMitigateDDoS}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Aktivera DDoS Scrub</span>
                    </button>
                  </div>

                  {/* Tool 2: Honeypot Deception Lure */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                          <Crosshair className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          DECEPTION
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition">
                        Honeypot Deception Lure
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Omdirigerar angriparens sikte från produktionsdatabaser till isolerade Decoy-fällor.
                      </p>
                    </div>
                    <button
                      onClick={handleLureToHoneypot}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Styr Angripare till Fälla</span>
                    </button>
                  </div>

                  {/* Tool 3: EDR Malware Sweep */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          EDR / XDR
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition">
                        EDR 1-Klick Sanering
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Skannar hela nätverket och eliminerar trojaner, ransomware och bakdörrar. Återställer 100% hälsa.
                      </p>
                    </div>
                    <button
                      onClick={handleDisinfectAll}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sanera All Malware</span>
                    </button>
                  </div>

                  {/* Tool 4: Auto Zero-Trust Hardening */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          ZERO-TRUST
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition">
                        Zero-Trust Brandväggshärdning
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Genererar automatiskt strikta regler för att blockera farliga portar (445 SMB, 23 Telnet, 3389 RDP).
                      </p>
                    </div>
                    <button
                      onClick={handleAutoHardenFirewalls}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Auto-Härda Brandväggar</span>
                    </button>
                  </div>

                  {/* Tool 5: Rogue AP Deauther */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          WIFI WIDS
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition">
                        Rogue AP & Pineapple Jammer
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Skannar efter oauktoriserade WiFi Pineapples och MITM Evil Twins och stänger ner deras sändare.
                      </p>
                    </div>
                    <button
                      onClick={handleNeutralizeRogueAp}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 hover:border-purple-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Stäng Rogue APs</span>
                    </button>
                  </div>

                  {/* Tool 6: DNS & ARP Integrity Restorer */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                          DNSSEC & ARP
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition">
                        DNS & ARP Sanering
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Rensar förgiftade DNS-cacheposter och skickar Gratuitous ARP för att återställa legitima IP-MAC tabeller.
                      </p>
                    </div>
                    <button
                      onClick={handleFlushDnsAndArp}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 hover:border-teal-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rensa DNS / ARP Cache</span>
                    </button>
                  </div>

                  {/* Tool 7: BGP Blackhole Attacker */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
                          <Skull className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          BGP NULL0
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-300 transition">
                        BGP Attacker Null-Route
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Kastar samtlig trafik från angriparens IP till Null0 och avbryter fjärrstyrda C2-beacons.
                      </p>
                    </div>
                    <button
                      onClick={handleBlackholeAttacker}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Null-Route Angripare</span>
                    </button>
                  </div>

                  {/* Tool 8: SOC SIEM Quick Hub */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400">
                          <Radar className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          SOC CORE
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition">
                        Incident Response Hub
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Öppna djupgående incidenthantering, forensiska tidslinjer och MITRE kill-chain containment.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenIncidentResponse) onOpenIncidentResponse();
                      }}
                      className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 hover:border-blue-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Öppna Incident Response</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* QUICK ACCESS TO BLUE TEAM HARDWARE APPLIANCES */}
              {onAddDevice && (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 font-mono mb-2 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Snabb-placera Blue Team Säkerhetsutrustning på Nätverkskartan:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        onAddDevice('waf');
                        triggerToast('WAF (Web Application Firewall) tillagd på canvas!');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>+ WAF Layer 7 Brandvägg</span>
                    </button>

                    <button
                      onClick={() => {
                        onAddDevice('honeypot');
                        triggerToast('Decoy Honeypot tillagd på canvas!');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>+ Decoy Honeypot Fälla</span>
                    </button>

                    <button
                      onClick={() => {
                        onAddDevice('ddos_scrubber');
                        triggerToast('Anti-DDoS Scrubbing Nod tillagd på canvas!');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>+ Anti-DDoS 400G Scrubber</span>
                    </button>

                    <button
                      onClick={() => {
                        onAddDevice('siem_soc');
                        triggerToast('SOC SIEM & Threat Hunter tillagd på canvas!');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Radar className="w-3.5 h-3.5" />
                      <span>+ SOC SIEM Collector</span>
                    </button>

                    <button
                      onClick={() => {
                        onAddDevice('hsm_vault');
                        triggerToast('Hardware Security Module (HSM) tillagd på canvas!');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>+ Hardware Security Module (HSM)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: HONEYPOT & DECEPTION STUDIO */}
          {activeTab === 'honeypot' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                    <Crosshair className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 font-mono">
                      CYBER DECEPTION & HONEYPOT CONTROLS
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Honeypots emulerar sårbara servrar (SSH, Telnet, HTTP, SQL, Modbus) för att avleda och fånga hackar-attacker.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleLureToHoneypot}
                    className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer"
                  >
                    🎯 Omdirigera Alla Hackare till Fällan
                  </button>
                </div>
              </div>

              {/* LIST OF DEPLOYED HONEYPOTS */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">
                  Aktiva Deception Fällor ({honeypots.length} st)
                </div>

                {honeypots.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-3 bg-slate-950/40">
                    <Crosshair className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs text-slate-400">Ingen Honeypot är utplacerad i nätverket ännu.</div>
                    {onAddDevice && (
                      <button
                        onClick={() => {
                          onAddDevice('honeypot');
                          triggerToast('Decoy Honeypot placerad!');
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer"
                      >
                        + Placera Honeypot på Canvas
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {honeypots.map((hp) => (
                      <div
                        key={hp.id}
                        className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <RealisticDeviceIcon type="honeypot" size="md" />
                            <div>
                              <div className="text-xs font-bold text-amber-300 font-mono">{hp.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">IP: {hp.ip || 'Ej satt'} | MAC: {hp.mac}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            AKTIV FÄLLA
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div>Emulerat OS</div>
                            <div className="text-slate-200 font-bold">Linux / ICS PLC</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div>Öppna Lure-Portar</div>
                            <div className="text-amber-300 font-bold">22, 80, 502, 3306</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div>Fångade Exploits</div>
                            <div className="text-rose-400 font-bold">14 payloads</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectNodeOnCanvas) onSelectNodeOnCanvas(hp.id);
                            }}
                            className="flex-1 py-1.5 px-2 rounded text-[11px] font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-center"
                          >
                            Inspektera på Canvas
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MITRE ATT&CK MATRIX */}
          {activeTab === 'mitre' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-indigo-300 font-mono mb-1">
                  MITRE ATT&CK FÖRSVARSMATRIS & RESILIENCE
                </h3>
                <p className="text-xs text-slate-400">
                  Översikt över hur nätverkets Blue Team-kontroller skyddar mot kända hacker-taktiker och tekniker.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Stage 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">1. RECONNAISSANCE</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">SKYDDAD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hot: Nätverksskanning, portsondering (Nmap SYN scan).
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-cyan-300 font-mono border border-slate-800">
                    ✓ Försvar: NGFW Port-Knocking & Drop ICMP/Scan probes.
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">2. INITIAL ACCESS</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">SKYDDAD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hot: Rogue WiFi AP, Phishing, svaga lösenord.
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-cyan-300 font-mono border border-slate-800">
                    ✓ Försvar: WPA3 Enterprise 802.1X + WAF L7 Web Shield.
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">3. EXECUTION</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      infectedNodes.length > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {infectedNodes.length > 0 ? 'HOT AKTIVT' : 'RENSAT'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hot: Ransomware, trojaner och zero-day payloads.
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-emerald-300 font-mono border border-slate-800">
                    ✓ Försvar: Antivirus Realtime EDR + Memory Guard.
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">4. LATERAL MOVEMENT</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">ISOLERAD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hot: SMB/RDP spridning, ARP Poisoning & Pass-the-Hash.
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-indigo-300 font-mono border border-slate-800">
                    ✓ Försvar: Mikrosegmentering, Karantän VLAN & Dynamic ARP Inspection.
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">5. COMMAND & CONTROL</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">BLOCKERAD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hot: C2 HTTP/DNS Beacons och omvänd shell-tunnel.
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-cyan-300 font-mono border border-slate-800">
                    ✓ Försvar: DNS Sinkholing & Outbound NGFW Egress Filtering.
                  </div>
                </div>

                {/* Stage 6 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">6. IMPACT & EXFILTRATION</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">MITIGERAD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hot: Volumetrisk DDoS-attack eller datakryptering.
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-cyan-300 font-mono border border-slate-800">
                    ✓ Försvar: BGP 400G Scrubbing Center & HSM Tokenization Vault.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: RED VS BLUE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-rose-300 font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-rose-400" />
                    <span>RED VS BLUE ATTACK SIMULATOR</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Trigga kontrollerade attacker för att stresstesta ditt nätverks brandväggar, EDR, honeypots och DDoS-skydd i realtid.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-1">
                      Välj Angreppsvektor (Red Team):
                    </label>
                    <select
                      value={simAttackType}
                      onChange={(e) => setSimAttackType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-rose-500 outline-none"
                    >
                      <option value="ddos">DDoS Volumetric SYN Flood (100k pps)</option>
                      <option value="ransomware">Ransomware Lateral Spread (SMB 445)</option>
                      <option value="mitm">WiFi Pineapple MITM & ARP Spoofing</option>
                      <option value="dns_poison">DNS Cache Poisoning & Phishing Redirect</option>
                      <option value="port_scan">Stealth Port & Vulnerability Scan</option>
                      <option value="autonomous_ai">Autonomous AI Multi-Stage Pentest</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-1">
                      Välj Målnod (Target Host):
                    </label>
                    <select
                      value={simTargetNodeId}
                      onChange={(e) => setSimTargetNodeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-rose-500 outline-none"
                    >
                      <option value="">-- Välj Mål --</option>
                      {nodes
                        .filter((n) => !isHackerDevice(n.type))
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.ip || 'No IP'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleLaunchSimulation}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 transition cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>STARTA ATTACK-SIMULERING</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-teal-300 font-mono">
                    CYBER DEFENSE AUDIT & HÄNDELSELOGG
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kronologisk historik över alla utförda säkerhetsåtgärder, mitigationer och nödisoleringar.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(defenseLogs, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cyber-defense-audit-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportera Rapport (JSON)</span>
                </button>
              </div>

              <div className="space-y-2">
                {defenseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-start gap-3"
                  >
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : log.status === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {log.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-200">{log.actionTitle}</div>
                      <div className="text-slate-400 mt-0.5 text-[11px]">{log.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Blue Team Autonomous Defense Suite v4.2 • Skydd aktivt</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Stäng Panel
          </button>
        </div>

      </div>
    </div>
  );
};
