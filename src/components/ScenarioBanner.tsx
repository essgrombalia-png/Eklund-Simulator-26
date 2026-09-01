import React, { useState, useRef, useEffect } from 'react';
import { ProblemScenario, ProblemScenarioValidationResult, Device, Link } from '../types';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Play,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GripVertical,
  Move,
} from 'lucide-react';

interface ScenarioBannerProps {
  scenario: ProblemScenario;
  nodes: Device[];
  links: Link[];
  onExit: () => void;
  onReset: () => void;
  onScenarioCompleted: (scenarioId: string) => void;
}

export const ScenarioBanner: React.FC<ScenarioBannerProps> = ({
  scenario,
  nodes,
  links,
  onExit,
  onReset,
  onScenarioCompleted,
}) => {
  const [showHints, setShowHints] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [validationResult, setValidationResult] = useState<ProblemScenarioValidationResult | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Position state for free dragging
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent drag when clicking interactive buttons or inside input elements
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const newX = Math.max(8, dragStartRef.current.startX + dx);
    const newY = Math.max(8, dragStartRef.current.startY + dy);

    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore if capture was already released
      }
    }
  };

  const handleVerify = () => {
    const res = scenario.validateSolution(nodes, links);
    setValidationResult(res);

    if (res.isSolved) {
      onScenarioCompleted(scenario.id);
      setShowSuccessModal(true);
    }
  };

  const getDifficultyBadge = () => {
    switch (scenario.difficulty) {
      case 'easy':
        return { label: 'Lätt 🟢', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'medium':
        return { label: 'Medel 🟡', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'hard':
        return { label: 'Svår 🔴', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'expert':
        return { label: 'Expert 🟣', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
  };

  const badge = getDifficultyBadge();
  const currentStatuses = validationResult?.taskStatuses || {};

  return (
    <>
      {/* HUD Floating Draggable Card on Canvas */}
      <div
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        className={`absolute z-40 max-w-md w-full transition-shadow ${
          isDragging ? 'shadow-cyan-500/30 ring-2 ring-cyan-400' : ''
        }`}
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-cyan-500/20">
          {/* Draggable Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between select-none touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title="Dra för att flytta rutan fritt"
          >
            <div className="flex items-center gap-2">
              <div className="text-slate-500 hover:text-slate-300 transition">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400 border border-cyan-500/30 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 tracking-tight">
                    Aktivt Scenario: {scenario.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {scenario.category} • Estimering: {scenario.estimatedTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                title={isMinimized ? 'Expandera uppdrag' : 'Minimera HUD'}
              >
                {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button
                onClick={onExit}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Lämna scenario"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body content */}
          {!isMinimized && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                {scenario.problemDescription}
              </p>

              {/* Tasks List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Uppdragsmål:
                </span>
                {scenario.tasks.map((task, idx) => {
                  const isCompleted = currentStatuses[task.id];
                  return (
                    <div
                      key={task.id}
                      className={`p-2 rounded-lg border text-xs transition flex flex-col gap-1 ${
                        isCompleted
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </span>
                          <span className={isCompleted ? 'line-through text-emerald-300/80' : ''}>
                            {task.description}
                          </span>
                        </div>
                      </div>

                      {showHints && (
                        <p className="text-[11px] text-amber-300/90 pl-6 mt-0.5 bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                          💡 <strong>Tips:</strong> {task.hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {validationResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                    validationResult.isSolved
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                  }`}
                >
                  {validationResult.isSolved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block mb-0.5">
                      {validationResult.isSolved ? 'Scenario Avklarat!' : 'Nätverkskontroll Resultat:'}
                    </span>
                    <p className="leading-relaxed">{validationResult.message}</p>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                    showHints
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHints ? 'Dölj Tips' : 'Visa Tips'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onReset}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 flex items-center gap-1 transition"
                    title="Återställ scenariot till ursprungsläget"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Återställ</span>
                  </button>

                  <button
                    onClick={handleVerify}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Testa Nätverket</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal Dialogue */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                Uppdrag slutfört!
              </span>
              <h3 className="text-2xl font-black text-slate-100">{scenario.title}</h3>
              <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {validationResult?.message}
              </p>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grattis! Nätverket är nu säkrat och godkänt.</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Stäng & Granska Nätverk
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onExit();
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
              >
                <span>Nästa Utmaning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
