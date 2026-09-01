import React from 'react';
import {
  Activity,
  Terminal,
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
  HelpCircle,
  Undo2,
  Redo2,
  Flame,
  ShieldCheck,
  Trophy,
  Wand2,
} from 'lucide-react';
import { ScenarioPreset } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { PROBLEM_SCENARIOS } from '../data/problemScenarios';
import { EklundLogo } from './EklundLogo';

interface TopbarProps {
  currentScenarioId: string;
  onSelectScenario: (preset: ScenarioPreset) => void;
  onOpenScenarioModal?: () => void;
  completedScenarioCount?: number;
  onOpenTerminal: () => void;
  onOpenPacketInspector: () => void;
  onOpenTrafficGen: () => void;
  onOpenSubnetCalc: () => void;
  onOpenExportImport: () => void;
  onOpenLayoutOptimizer?: () => void;
  onOpenAutoRepair?: () => void;
  onOpenCyberAwareness?: () => void;
  onOpenAntivirus?: () => void;
  onOpenIncidentResponse?: () => void;
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
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentScenarioId,
  onSelectScenario,
  onOpenScenarioModal,
  completedScenarioCount = 0,
  onOpenTerminal,
  onOpenPacketInspector,
  onOpenTrafficGen,
  onOpenSubnetCalc,
  onOpenExportImport,
  onOpenLayoutOptimizer,
  onOpenAutoRepair,
  onOpenCyberAwareness,
  onOpenAntivirus,
  onOpenIncidentResponse,
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
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-30">
      {/* Brand & Status */}
      <div className="flex items-center gap-4">
        <EklundLogo size="md" showSubtitle={false} />
        
        <div className="hidden xl:block h-7 w-[1px] bg-slate-800/80" />

        <p className="text-xs text-slate-400 font-mono hidden sm:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <span className="flex items-center gap-1 font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {nodeCount} Enheter
          </span>
          <span className="text-slate-600">•</span>
          <span>{linkCount} Länkar</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">{onlineCount} Online</span>
          {lastAutoSavedTime && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1" title="Topologin sparas automatiskt i LocalStorage var 30:e sekund">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Sparad {lastAutoSavedTime}</span>
              </span>
            </>
          )}
        </p>
      </div>

      {/* Preset Selector & Scenarios Button */}
      <div className="flex items-center gap-2">
        {onOpenScenarioModal && (
          <button
            onClick={onOpenScenarioModal}
            title="Öppna Nätverks-Scenarier & Utmaningar (10+ Felsökningsuppdrag)"
            className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 text-slate-100 border border-amber-500/40 hover:border-amber-400 text-xs rounded-lg px-3 py-1.5 font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Scenarier</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/30 font-mono">
              {completedScenarioCount}/{PROBLEM_SCENARIOS.length}
            </span>
          </button>
        )}

        <label className="text-xs font-medium text-slate-400 hidden lg:inline-block">
          Mönster:
        </label>
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
          className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition cursor-pointer font-medium"
        >
          <option value="custom">✨ Tom arbetsyta (Ny)</option>
          <optgroup label="Färdiga Nätverksarkitekturer">
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'canvas'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Topologi</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('terminal');
            onOpenTerminal();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'terminal'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>CLI Terminal</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('packets');
            onOpenPacketInspector();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'packets'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Paketinspektör</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stats');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'stats'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Nätverksstatistik</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('traffic');
            onOpenTrafficGen();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'traffic'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Attacker & Belastning</span>
        </button>
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-2">
        {/* Help & Auto-Fix AI Assistant Button */}
        {onOpenAutoRepair && (
          <button
            onClick={onOpenAutoRepair}
            title="Hjälp & Automatisk Felsökning (Upptäck och åtgärda nätverksfel)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              issueCount > 0
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse shadow-rose-500/20'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${issueCount > 0 ? 'text-amber-300' : 'text-emerald-400'}`} />
            <span>Hjälp & Auto-Fix</span>
            {issueCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black font-mono">
                {issueCount} fel
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-bold">✓ OK</span>
            )}
          </button>
        )}

        {/* Cyber Awareness & Hot-Map Button */}
        {onOpenCyberAwareness && (
          <button
            onClick={onOpenCyberAwareness}
            title="Öppna Cyber Awareness & Hot-Map panel (Kartläggning av smittade och sårbara enheter)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950/40 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Hot-Map & Awareness</span>
          </button>
        )}

        {/* Incident Response Dashboard Button */}
        {onOpenIncidentResponse && (
          <button
            onClick={onOpenIncidentResponse}
            title="Öppna Incident Response & Cyber Kill-Chain Dashboard (Tidslinje, MITRE ATT&CK och Containment)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gradient-to-r from-rose-500/20 via-red-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-rose-300 border border-rose-500/50 hover:border-rose-400 shadow-sm shadow-rose-950/40 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Incident Response</span>
            {incidentCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black font-mono">
                {incidentCount}
              </span>
            )}
          </button>
        )}

        {/* Antivirus System Button */}
        {onOpenAntivirus && (
          <button
            onClick={onOpenAntivirus}
            title="Öppna Antivirus & EDR Control Panel (Installera skydd, skanna enheter, rensa hot)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/40 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Antivirus System</span>
          </button>
        )}

        {/* D3 Layout Optimizer Button */}
        {onOpenLayoutOptimizer && (
          <button
            onClick={onOpenLayoutOptimizer}
            title="Öppna D3 Layout-optimerare (Snygga till nod-positioner med 1 klick)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 text-teal-300 border border-teal-500/40 hover:border-teal-400 shadow-sm shadow-teal-950/40 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
            <span>Layout-optimerare</span>
          </button>
        )}

        <button
          onClick={onToggleVisualDebugger}
          title="Växla Visual Debugger (Visa IP-adresser & subnät direkt på canvas)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            showVisualDebugger
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
          }`}
        >
          <Bug className={`w-3.5 h-3.5 ${showVisualDebugger ? 'text-cyan-400 animate-pulse' : ''}`} />
          <span>Visual Debugger</span>
          <span className={`w-2 h-2 rounded-full ${showVisualDebugger ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={onOpenSubnetCalc}
          title="Öppna Subnät-kalkylator"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition"
        >
          <Calculator className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExportImport}
          title="Exportera eller Importera Nätverk (JSON)"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-0.5" />

        {/* Undo & Redo History Buttons */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Ångra senaste ändring (Ctrl+Z / Cmd+Z)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition text-xs font-semibold ${
            canUndo
              ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 hover:border-cyan-500/50 shadow-sm cursor-pointer'
              : 'bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Ångra</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Gör om avbruten ändring (Ctrl+Y / Cmd+Shift+Z)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition text-xs font-semibold ${
            canRedo
              ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 hover:border-cyan-500/50 shadow-sm cursor-pointer'
              : 'bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Gör om</span>
        </button>

        <button
          onClick={onResetDemo}
          title="Återställ aktuellt exempel"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Återställ</span>
        </button>

        <button
          onClick={onClearAll}
          title="Rensa hela nätverket"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Rensa</span>
        </button>

        {currentUser && (
          <>
            <div className="w-px h-5 bg-slate-800 mx-0.5" />
            <div className="flex items-center gap-2.5 bg-slate-950/60 pl-3 pr-2 py-1 rounded-xl border border-slate-800/80">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Inloggad</span>
                <span className="text-xs font-bold text-cyan-400 font-orbitron truncate max-w-[110px] mt-0.5" title={currentUser.email}>
                  {currentUser.username}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Logga ut från simulatorn"
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition text-[11px] font-extrabold cursor-pointer"
              >
                Logga ut
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
