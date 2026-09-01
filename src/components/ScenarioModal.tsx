import React, { useState } from 'react';
import { PROBLEM_SCENARIOS } from '../data/problemScenarios';
import { ProblemScenario, ScenarioDifficulty } from '../types';
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ShieldAlert,
  Cable,
  AlertTriangle,
  Skull,
  Wifi,
  Globe,
  Lock,
  Server,
  Play,
  RotateCcw,
  Trophy,
  Award,
  Filter,
  Cloud,
  Cpu,
  Layers,
  Radio,
  Activity,
  Brain,
} from 'lucide-react';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: ProblemScenario) => void;
  completedScenarioIds: string[];
  activeScenarioId?: string | null;
  onOpenCyberQuiz?: () => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  completedScenarioIds,
  activeScenarioId,
  onOpenCyberQuiz,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const getDifficultyBadge = (diff: ScenarioDifficulty) => {
    switch (diff) {
      case 'easy':
        return { label: 'Lätt', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'medium':
        return { label: 'Medel', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'hard':
        return { label: 'Svår', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'expert':
        return { label: 'Expert', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Cable':
        return <Cable className="w-5 h-5 text-cyan-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Skull':
        return <Skull className="w-5 h-5 text-rose-500" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-indigo-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-teal-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-emerald-400" />;
      case 'Server':
        return <Server className="w-5 h-5 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-purple-400" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-sky-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-rose-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const filteredScenarios = PROBLEM_SCENARIOS.filter((sc) => {
    if (selectedDifficulty !== 'all' && sc.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== 'all' && sc.category !== selectedCategory) return false;
    return true;
  });

  const completionPercent = Math.round(
    (completedScenarioIds.length / PROBLEM_SCENARIOS.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Nätverks-Scenarier & Utmaningar
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {PROBLEM_SCENARIOS.length} Uppdrag
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Välj ett scenarioproblem, analysera nätverkstopologin och lös tekniska störningar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Framsteg:</span>
            <span className="font-bold text-cyan-400">
              {completedScenarioIds.length} av {PROBLEM_SCENARIOS.length} scenarier lösta
            </span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            {onOpenCyberQuiz && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCyberQuiz();
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-teal-500/20 hover:from-indigo-500/30 hover:to-teal-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kör Cyberquiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Svårighetsgrad:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'all', label: 'Alla' },
              { id: 'easy', label: 'Lätt 🟢' },
              { id: 'medium', label: 'Medel 🟡' },
              { id: 'hard', label: 'Svår 🔴' },
              { id: 'expert', label: 'Expert 🟣' },
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedDifficulty === diff.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span>Kategori:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
          >
            <option value="all">Alla Kategorier</option>
            <option value="Felsökning">Felsökning</option>
            <option value="Säkerhet">Säkerhet</option>
            <option value="DHCP & IP">DHCP & IP</option>
            <option value="DNS & Web">DNS & Web</option>
            <option value="VLAN & Isolation">VLAN & Isolation</option>
            <option value="Routing">Routing</option>
          </select>
        </div>

        {/* Scenario Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((sc) => {
            const isCompleted = completedScenarioIds.includes(sc.id);
            const isActive = activeScenarioId === sc.id;
            const badge = getDifficultyBadge(sc.difficulty);

            return (
              <div
                key={sc.id}
                className={`group relative bg-slate-950/60 hover:bg-slate-950 border rounded-xl p-5 transition flex flex-col justify-between ${
                  isActive
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                    : isCompleted
                    ? 'border-emerald-500/40 hover:border-emerald-500/70'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header line */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium bg-slate-800/80 px-2 py-0.5 rounded">
                        {sc.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {sc.estimatedTime}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Löst
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 group-hover:border-slate-700 transition">
                      {getIcon(sc.iconName)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition">
                        {sc.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {sc.summary}
                      </p>
                    </div>
                  </div>

                  {/* Task list preview */}
                  <div className="my-3 pt-3 border-t border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Uppdragsmål ({sc.tasks.length} st):
                    </span>
                    <ul className="space-y-1">
                      {sc.tasks.map((task, idx) => (
                        <li key={task.id} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span className="line-clamp-1">{task.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {sc.id}
                  </span>

                  <button
                    onClick={() => {
                      onSelectScenario(sc);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : isCompleted
                        ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Återstarta</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'Kör igen' : 'Starta Scenario'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
