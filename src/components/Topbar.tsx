import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Activity,
  Terminal,
  Shield,
  ShieldAlert,
  Calculator,
  Download,
  RotateCcw,
  Trash2,
  Zap,
  Globe,
  Radio,
  BarChart3,
  Sliders,
  Bug,
  Sparkles,
  Wrench,
  Undo2,
  Redo2,
  Flame,
  ShieldCheck,
  Trophy,
  Wand2,
  Brain,
  ChevronDown,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { ScenarioPreset, UserProfile, SimulatorThemeId, Device } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { PROBLEM_SCENARIOS } from '../data/problemScenarios';
import { EklundLogo } from './EklundLogo';
import { UserAvatar } from './UserAvatar';
import { SIMULATOR_THEMES } from '../utils/themeManager';

interface TopbarProps {
  currentScenarioId: string;
  onSelectScenario: (preset: ScenarioPreset) => void;
  onOpenScenarioModal?: () => void;
  completedScenarioCount?: number;
  onOpenCyberQuiz?: () => void;
  onOpenTerminal: () => void;
  onOpenPacketInspector: () => void;
  onOpenTrafficGen: () => void;
  onOpenSubnetCalc: () => void;
  onOpenExportImport: () => void;
  onOpenLayoutOptimizer?: () => void;
  onOpenAutoRepair?: () => void;
  onOpenCyberDefense?: () => void;
  onOpenCyberAwareness?: () => void;
  onOpenAntivirus?: () => void;
  onOpenIncidentResponse?: () => void;
  onOpenSettings?: () => void;
  incidentCount?: number;
  issueCount?: number;
  onResetDemo: () => void;
  onClearAll: () => void;
  nodeCount: number;
  linkCount: number;
  onlineCount: number;
  lastAutoSavedTime?: string | null;
  activeTab: 'canvas' | 'terminal' | 'packets' | 'traffic' | 'stats';
  setActiveTab: (tab: 'canvas' | 'terminal' | 'packets' | 'traffic' | 'stats') => void;
  showVisualDebugger?: boolean;
  onToggleVisualDebugger?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  currentUser?: { email: string; username: string } | null;
  userProfile?: UserProfile | null;
  currentThemeId?: SimulatorThemeId;
  onSelectTheme?: (themeId: SimulatorThemeId) => void;
  onLogout?: () => void;
  nodes?: Device[];
  onSelectNode?: (nodeId: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentScenarioId,
  onSelectScenario,
  onOpenScenarioModal,
  completedScenarioCount = 0,
  onOpenCyberQuiz,
  onOpenTerminal,
  onOpenPacketInspector,
  onOpenTrafficGen,
  onOpenSubnetCalc,
  onOpenExportImport,
  onOpenLayoutOptimizer,
  onOpenAutoRepair,
  onOpenCyberDefense,
  onOpenCyberAwareness,
  onOpenAntivirus,
  onOpenIncidentResponse,
  onOpenSettings,
  incidentCount = 0,
  issueCount = 0,
  onResetDemo,
  onClearAll,
  nodeCount,
  linkCount,
  onlineCount,
  lastAutoSavedTime,
  activeTab,
  setActiveTab,
  showVisualDebugger = false,
  onToggleVisualDebugger,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  currentUser = null,
  userProfile = null,
  currentThemeId = 'cyber_matrix',
  onLogout,
  nodes = [],
  onSelectNode,
}) => {
  const activeTheme = SIMULATOR_THEMES[currentThemeId] || SIMULATOR_THEMES.cyber_matrix;

  // Dropdown states
  const [securityMenuOpen, setSecurityMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const securityMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (securityMenuRef.current && !securityMenuRef.current.contains(e.target as Node)) {
        setSecurityMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setToolsMenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setActionsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return nodes.filter((node) => {
      const nameMatch = (node.name || '').toLowerCase().includes(q);
      const ipMatch = (node.ip || '').toLowerCase().includes(q);
      const macMatch = (node.mac || '').toLowerCase().includes(q);
      return nameMatch || ipMatch || macMatch;
    });
  }, [nodes, searchQuery]);

  const totalThreats = incidentCount + (issueCount > 0 ? issueCount : 0);

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90 text-slate-200 px-3.5 py-2 flex items-center justify-between gap-2 shadow-xl z-30 select-none relative transition-all duration-200">
      {/* LEFT SECTION: Logo, Telemetry Pill, Architecture Selector */}
      <div className="flex items-center gap-3 shrink-0">
        <EklundLogo size="sm" showSubtitle={false} />

        {/* Live Network Health Telemetry */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 shadow-inner">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-cyan-300 font-bold">{nodeCount}</span> noder
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">
            <span className="text-slate-200 font-bold">{linkCount}</span> länkar
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {onlineCount} online
          </span>
          {lastAutoSavedTime && (
            <>
              <span className="text-slate-700">|</span>
              <span className="text-[10px] text-slate-500 font-sans" title="Automatisk molnsynk & lokal backup var 30:e sek">
                {lastAutoSavedTime}
              </span>
            </>
          )}
        </div>

        {/* Architecture & Scenario Hub */}
        <div className="flex items-center gap-1.5">
          {onOpenScenarioModal && (
            <button
              onClick={onOpenScenarioModal}
              title="Öppna Nätverksutmaningar & Felsökningsscenarier"
              className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-teal-500/15 hover:from-amber-500/25 hover:to-teal-500/25 text-amber-200 border border-amber-500/30 hover:border-amber-400/80 transition-all text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold">Scenarier</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                {completedScenarioCount}/{PROBLEM_SCENARIOS.length}
              </span>
            </button>
          )}

          {/* Quick Architecture Dropdown */}
          <div className="relative hidden md:block">
            <select
              value={currentScenarioId || 'custom'}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  onClearAll();
                } else {
                  const found = SCENARIOS.find((s) => s.id === e.target.value);
                  if (found) onSelectScenario(found);
                }
              }}
              title="Välj fördefinierad nätverksarkitektur"
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/60 transition cursor-pointer font-medium appearance-none max-w-[140px] lg:max-w-[180px] truncate"
            >
              <option value="custom">✨ Tom arbetsyta</option>
              <optgroup label="Färdiga Arkitekturer">
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* --- DYNAMIC SEARCH BAR --- */}
        <div className="relative hidden md:block" ref={searchContainerRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchDropdownOpen(true);
              }}
              onFocus={() => setSearchDropdownOpen(true)}
              placeholder="Sök nod (namn, IP, MAC)..."
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 focus:border-cyan-500/80 rounded-lg text-xs pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all duration-200 w-44 lg:w-52 focus:w-60 text-slate-200 placeholder-slate-500 shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
                title="Rensa sökning"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {searchDropdownOpen && searchQuery.trim() !== '' && (
            <div className="absolute left-0 mt-1.5 w-72 max-h-64 overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="px-2 py-1 border-b border-slate-800/60 mb-1 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Sökresultat</span>
                <span className="font-mono text-cyan-400/80">{filteredNodes.length} funna</span>
              </div>

              {filteredNodes.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 font-medium">
                  Inga enheter matchar "{searchQuery}"
                </div>
              ) : (
                filteredNodes.map((node) => {
                  const isServer = node.type.startsWith('server_');
                  const isClient = node.type.startsWith('client_');
                  const isIoT = node.type.startsWith('iot_');
                  const isNetwork = ['switch', 'l3_switch', 'wifi_ap'].includes(node.type);
                  const isRouter = ['router', 'wifi_router'].includes(node.type);
                  const isFirewall = node.type === 'firewall';
                  const isHacker = node.type.startsWith('hacker');

                  const categoryColor = isHacker
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                    : isFirewall
                    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                    : isServer
                    ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.7)]'
                    : isRouter
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                    : isNetwork
                    ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]'
                    : isIoT
                    ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)]'
                    : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]';

                  const deviceLabel = node.type.toUpperCase().replace('_', ' ');

                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        if (onSelectNode) {
                          onSelectNode(node.id);
                        }
                        setActiveTab('canvas');
                        setSearchQuery('');
                        setSearchDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition cursor-pointer group"
                    >
                      <div className="pt-1.5 shrink-0">
                        <span className={`block w-2.5 h-2.5 rounded-full ${categoryColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 transition truncate">
                            {node.name}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-slate-500 bg-slate-900 px-1 py-0.2 rounded border border-slate-800 shrink-0">
                            {deviceLabel}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.2 text-[10px] font-mono text-slate-400 leading-normal">
                          <span className="flex items-center gap-1">
                            <span className="text-slate-600">IP:</span>
                            <span className="text-slate-300 font-semibold">{node.ip || 'DHCP'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-slate-600">MAC:</span>
                            <span className="text-slate-400">{node.mac || 'N/A'}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Segmented View Navigation with Unique Colors */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner gap-0.5">
        <button
          onClick={() => setActiveTab('canvas')}
          title="Topologisk 2D/3D Nätverkskarta"
          className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
              : 'text-sky-400/80 hover:text-sky-300 hover:bg-sky-500/10'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Topologi</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('terminal');
            onOpenTerminal();
          }}
          title="Cisco IOS & Linux Terminal CLI"
          className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
              : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Terminal</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('packets');
            onOpenPacketInspector();
          }}
          title="Wireshark-stil Nätverkspaketinspektör"
          className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'packets'
              ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25'
              : 'text-blue-400/80 hover:text-blue-300 hover:bg-blue-500/10'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Paket</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('traffic');
            onOpenTrafficGen();
          }}
          title="Trafikgenerator, DDoS & Cyberbelastning"
          className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'traffic'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Trafik</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          title="Realtidstelemetri & Nätverksprestanda"
          className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/25'
              : 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Statistik</span>
        </button>
      </div>

      {/* RIGHT SECTION: Modular Control Hub with Distinct Colored Functions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 1. AUTO-FIX & DIAGNOSTIC BUTTON */}
        {onOpenAutoRepair && (
          <button
            onClick={onOpenAutoRepair}
            title="Diagnostik & Automatisk Nätverksreparation"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              issueCount > 0
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/60 animate-pulse shadow-rose-950/40'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${issueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline font-bold">Auto-Fix</span>
            {issueCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black font-mono">
                {issueCount} fel
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono font-bold">✓</span>
            )}
          </button>
        )}

        {/* 2. CYBER SECURITY SUITE DROPDOWN (INDIGO / BLUE) */}
        <div className="relative" ref={securityMenuRef}>
          <button
            onClick={() => {
              setSecurityMenuOpen(!securityMenuOpen);
              setToolsMenuOpen(false);
              setActionsMenuOpen(false);
              setUserMenuOpen(false);
            }}
            title="Öppna Cybersäkerhetssviten (Försvar, Quiz, Incidents, Antivirus)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              securityMenuOpen
                ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400 shadow-md shadow-indigo-950/50'
                : totalThreats > 0
                ? 'bg-gradient-to-r from-rose-500/20 via-indigo-500/20 to-cyan-500/20 text-cyan-200 border-indigo-500/50 hover:border-cyan-400'
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">Säkerhet</span>
            {incidentCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black font-mono">
                {incidentCount}
              </span>
            ) : (
              <ChevronDown className={`w-3 h-3 text-indigo-400 transition-transform ${securityMenuOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Security Suite Popover Menu */}
          {securityMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-xl border border-indigo-500/40 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1.5 border-b border-indigo-900/50 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Cybersäkerhet & SOC</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                  Blue Team v3.2
                </span>
              </div>

              <div className="space-y-1">
                {onOpenCyberDefense && (
                  <button
                    onClick={() => {
                      setSecurityMenuOpen(false);
                      onOpenCyberDefense();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-cyan-950/40 hover:text-cyan-300 transition group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25 border border-cyan-500/30">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Cyberförsvar & Skydd</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">Nödisolering, honeypots & DDoS-scrubbing</p>
                    </div>
                  </button>
                )}

                {onOpenCyberQuiz && (
                  <button
                    onClick={() => {
                      setSecurityMenuOpen(false);
                      onOpenCyberQuiz();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-pink-950/40 hover:text-pink-300 transition group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400 group-hover:bg-pink-500/25 border border-pink-500/30">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Cyberquiz & Akademi</span>
                        <span className="text-[10px] font-mono font-bold text-pink-300 bg-pink-950 px-1.5 rounded border border-pink-800">
                          XP
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">Träna nätverk, klättra i ranking & quiz</p>
                    </div>
                  </button>
                )}

                {onOpenIncidentResponse && (
                  <button
                    onClick={() => {
                      setSecurityMenuOpen(false);
                      onOpenIncidentResponse();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-rose-950/40 hover:text-rose-300 transition group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25 border border-rose-500/30">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Incident Response & SOC</span>
                        {incidentCount > 0 && (
                          <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-950 px-1.5 rounded border border-rose-800">
                            {incidentCount} aktiva
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">MITRE ATT&CK kill-chain & händelselogg</p>
                    </div>
                  </button>
                )}

                {onOpenAntivirus && (
                  <button
                    onClick={() => {
                      setSecurityMenuOpen(false);
                      onOpenAntivirus();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-emerald-950/40 hover:text-emerald-300 transition group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">Antivirus & EDR-agent</div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">Installera skydd, realtidsskanning & sanering</p>
                    </div>
                  </button>
                )}

                {onOpenCyberAwareness && (
                  <button
                    onClick={() => {
                      setSecurityMenuOpen(false);
                      onOpenCyberAwareness();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-amber-950/40 hover:text-amber-300 transition group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 border border-amber-500/30">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">Hot-Map & Awareness</div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">Kartlägg sårbara noder och attackvektorer</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. NETWORK TOOLS DROPDOWN (TEAL / CYAN) */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => {
              setToolsMenuOpen(!toolsMenuOpen);
              setSecurityMenuOpen(false);
              setActionsMenuOpen(false);
              setUserMenuOpen(false);
            }}
            title="Öppna Nätverksverktyg (Layout-optimerare, Subnät-kalkylator, Visual Debugger, Export)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              toolsMenuOpen
                ? 'bg-teal-500/30 text-teal-200 border-teal-400 shadow-md shadow-teal-950/50'
                : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border-teal-500/40 hover:border-teal-400'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline font-bold">Verktyg</span>
            <ChevronDown className={`w-3 h-3 text-teal-400 transition-transform ${toolsMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Tools Menu Popover with Distinct Colors */}
          {toolsMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-xl border border-teal-500/40 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1.5 border-b border-teal-900/50 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">Verktyg & Hjälpmedel</span>
              </div>

              <div className="space-y-1">
                {onOpenLayoutOptimizer && (
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onOpenLayoutOptimizer();
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-teal-950/40 hover:text-teal-300 transition group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30">
                      <Wand2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold block">D3 Layout-optimerare</span>
                      <span className="text-[10px] text-slate-400">Snygga till nodpositioner</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setToolsMenuOpen(false);
                    if (onToggleVisualDebugger) onToggleVisualDebugger();
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-purple-950/40 hover:text-purple-300 transition group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Bug className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold flex items-center justify-between">
                      <span>Visual Debugger</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          showVisualDebugger ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {showVisualDebugger ? 'PÅ' : 'AV'}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400">IP & subnät-etiketter på canvas</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setToolsMenuOpen(false);
                    onOpenSubnetCalc();
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-sky-950/40 hover:text-sky-300 transition group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold block">Subnät-kalkylator</span>
                    <span className="text-[10px] text-slate-400">CIDR, masker & subnätberäkning</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setToolsMenuOpen(false);
                    onOpenExportImport();
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-lime-950/40 hover:text-lime-300 transition group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-lime-500/15 text-lime-400 border border-lime-500/30">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold block">Export / Import</span>
                    <span className="text-[10px] text-slate-400">Spara & ladda JSON-topologi</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. HISTORY: UNDO / REDO BUTTONS */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Ångra ändring (Ctrl+Z)"
            className={`p-1.5 rounded-md transition ${
              canUndo
                ? 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Gör om ändring (Ctrl+Y / Cmd+Shift+Z)"
            className={`p-1.5 rounded-md transition ${
              canRedo
                ? 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5. CANVAS RESET / CLEAR MENU */}
        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={() => {
              setActionsMenuOpen(!actionsMenuOpen);
              setSecurityMenuOpen(false);
              setToolsMenuOpen(false);
              setUserMenuOpen(false);
            }}
            title="Återställ eller rensa arbetsyta"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {actionsMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  setActionsMenuOpen(false);
                  onResetDemo();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-amber-950/40 hover:text-amber-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Återställ exempel</span>
              </button>
              <button
                onClick={() => {
                  setActionsMenuOpen(false);
                  onClearAll();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Rensa hela nätverket</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. GLOBAL SETTINGS BUTTON (FUCHSIA / PINK) */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Öppna Inställningar (Tema, Ljud, Bakgrundseffekter, Nätverksparametrar)"
            className="p-1.5 rounded-lg bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40 hover:border-fuchsia-400 transition cursor-pointer shadow-sm shadow-fuchsia-500/10"
          >
            <Sliders className="w-3.5 h-3.5 text-fuchsia-400" />
          </button>
        )}

        {/* 7. USER PROFILE & LOGOUT */}
        {currentUser && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setSecurityMenuOpen(false);
                setToolsMenuOpen(false);
                setActionsMenuOpen(false);
              }}
              title="Användarprofil & Kontomeny"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 pl-1.5 pr-2 py-1 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            >
              <UserAvatar
                avatarId={userProfile?.avatarId || 'avatar_cyber_hacker'}
                customUrl={userProfile?.avatarCustomUrl}
                username={userProfile?.username || currentUser.username}
                size="sm"
                status={userProfile?.statusBadge || 'active'}
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[11px] font-bold text-white font-orbitron truncate max-w-[80px] leading-tight">
                  {userProfile?.username || currentUser.username}
                </span>
                <span className="text-[9px] font-mono text-cyan-400/80 leading-none truncate max-w-[80px]">
                  {userProfile?.roleTitle || 'Nätverksarkitekt'}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Menu Popover */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-2 border-b border-slate-800 mb-1 flex items-center gap-2.5">
                  <UserAvatar
                    avatarId={userProfile?.avatarId || 'avatar_cyber_hacker'}
                    customUrl={userProfile?.avatarCustomUrl}
                    username={userProfile?.username || currentUser.username}
                    size="sm"
                    status={userProfile?.statusBadge || 'active'}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white font-orbitron truncate">
                      {userProfile?.username || currentUser.username}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {userProfile?.roleTitle || 'Nätverksarkitekt'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans truncate max-w-[130px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-850 hover:text-cyan-300 transition cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Redigera profil & inställningar</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Logga ut</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
