import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Brain,
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Zap,
  Shield,
  ShieldAlert,
  Flame,
  X,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Share2,
  Check,
  Target,
  ArrowRight,
  Sliders,
  Play,
  Lightbulb,
} from 'lucide-react';
import {
  CyberQuizQuestion,
  QuizCategory,
  QuizDifficulty,
  QuizRank,
} from '../types';
import { CYBER_QUIZ_QUESTIONS, QUIZ_RANKS } from '../data/cyberQuizQuestions';

interface CyberQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedScenarioId?: string | null;
  completedScenarioTitle?: string | null;
  onClearCompletedScenario?: () => void;
}

export type QuizMode = 'scenario_bonus' | 'streak' | 'speedrun' | 'practice' | 'review';

const STORAGE_KEY_XP = 'eklund_cyber_quiz_xp';
const STORAGE_KEY_BEST_STREAK = 'eklund_cyber_quiz_best_streak';
const STORAGE_KEY_STATS = 'eklund_cyber_quiz_stats';

export const CyberQuizModal: React.FC<CyberQuizModalProps> = ({
  isOpen,
  onClose,
  completedScenarioId,
  completedScenarioTitle,
  onClearCompletedScenario,
}) => {
  // Local persistence stats
  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_XP);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BEST_STREAK);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [stats, setStats] = useState<{ answered: number; correct: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? JSON.parse(saved) : { answered: 0, correct: 0 };
    } catch {
      return { answered: 0, correct: 0 };
    }
  });

  // Mode Selection
  const [mode, setMode] = useState<QuizMode>(
    completedScenarioId ? 'scenario_bonus' : 'streak'
  );

  // Filters for practice mode
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('all');

  // Active quiz session state
  const [questionQueue, setQuestionQueue] = useState<CyberQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Update mode when scenario is completed
  useEffect(() => {
    if (completedScenarioId) {
      setMode('scenario_bonus');
    }
  }, [completedScenarioId]);

  // Current Question helper
  const currentQuestion: CyberQuizQuestion | undefined = questionQueue[currentIndex];

  // Initialize questions based on mode
  const startQuizSession = useCallback(
    (targetMode: QuizMode, cat: string = selectedCategory, diff: QuizDifficulty = selectedDifficulty) => {
      let filtered = [...CYBER_QUIZ_QUESTIONS];

      if (targetMode === 'scenario_bonus' && completedScenarioId) {
        // Prioritize questions tied to this scenario or matching topic
        const related = filtered.filter((q) => q.relatedScenarioId === completedScenarioId);
        const others = filtered.filter((q) => q.relatedScenarioId !== completedScenarioId);
        // Shuffle others
        const shuffledOthers = others.sort(() => 0.5 - Math.random());
        // Pick 3-5 questions
        filtered = [...related, ...shuffledOthers].slice(0, 3);
      } else {
        if (cat !== 'all') {
          filtered = filtered.filter((q) => q.category === cat);
        }
        if (diff !== 'all') {
          filtered = filtered.filter((q) => q.difficulty === diff);
        }
        // Shuffle questions
        filtered = filtered.sort(() => 0.5 - Math.random());

        if (targetMode === 'speedrun') {
          filtered = filtered.slice(0, 10);
        }
      }

      setQuestionQueue(filtered);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setSessionScore(0);
      setSessionCorrectCount(0);
      setIsGameOver(false);
      setTimeLeft(targetMode === 'speedrun' ? 15 : 30);
    },
    [completedScenarioId, selectedCategory, selectedDifficulty]
  );

  // Initialize upon modal opening or mode change
  useEffect(() => {
    if (isOpen) {
      startQuizSession(mode);
    }
  }, [isOpen, mode, startQuizSession]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isAnswerSubmitted || isGameOver || mode === 'review' || !currentQuestion) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time out! Count as wrong answer if nothing selected
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAnswerSubmitted, isGameOver, mode, currentQuestion]);

  const handleTimeOut = () => {
    setIsAnswerSubmitted(true);
    setCurrentStreak(0);
    // update stats
    setStats((prev) => {
      const updated = { answered: prev.answered + 1, correct: prev.correct };
      try {
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (mode === 'streak') {
      setIsGameOver(true);
    }
  };

  // Keyboard shortcut listener (1, 2, 3, 4 or Enter to advance)
  useEffect(() => {
    if (!isOpen || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerSubmitted) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (index >= 0 && index < currentQuestion.options.length) {
          handleSelectOption(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentQuestion, isAnswerSubmitted]);

  // Select Option and Submit
  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    const isCorrect = index === currentQuestion.correctOptionIndex;

    // Calculate XP
    let gainedXp = 0;
    if (isCorrect) {
      const multiplier = 1 + currentStreak * 0.1; // +10% per streak point
      const bonusForScenario = mode === 'scenario_bonus' ? 1.25 : 1;
      gainedXp = Math.round(currentQuestion.xpReward * multiplier * bonusForScenario);

      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        try {
          localStorage.setItem(STORAGE_KEY_BEST_STREAK, nextStreak.toString());
        } catch {}
      }

      setSessionScore((prev) => prev + gainedXp);
      setSessionCorrectCount((prev) => prev + 1);

      // Save XP
      setTotalXp((prev) => {
        const nextXp = prev + gainedXp;
        try {
          localStorage.setItem(STORAGE_KEY_XP, nextXp.toString());
        } catch {}
        return nextXp;
      });
    } else {
      setCurrentStreak(0);
      if (mode === 'streak') {
        setIsGameOver(true);
      }
    }

    // Save global stats
    setStats((prev) => {
      const updated = {
        answered: prev.answered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
      };
      try {
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questionQueue.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(mode === 'speedrun' ? 15 : 30);
    } else {
      // Finished all questions in session!
      setIsGameOver(true);
    }
  };

  // Calculate user Rank
  const currentRank = useMemo(() => {
    let active = QUIZ_RANKS[0];
    for (const r of QUIZ_RANKS) {
      if (totalXp >= r.minXp) {
        active = r;
      }
    }
    return active;
  }, [totalXp]);

  const nextRank = useMemo(() => {
    const idx = QUIZ_RANKS.findIndex((r) => r.title === currentRank.title);
    return QUIZ_RANKS[idx + 1] || null;
  }, [currentRank]);

  const rankProgress = useMemo(() => {
    if (!nextRank) return 100;
    const range = nextRank.minXp - currentRank.minXp;
    const currentInRange = totalXp - currentRank.minXp;
    return Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
  }, [currentRank, nextRank, totalXp]);

  // Categories list
  const categoriesList: QuizCategory[] = [
    'Brandväggar & Nätverkssäkerhet',
    'Zero-Trust & Segmentering',
    'Kryptering, VPN & TLS',
    'Malware, Ransomware & EDR',
    'DDoS & Trafikmitigering',
    'DNSSEC, ARP & MITM',
    'WiFi, IoT & Trådlös Säkerhet',
    'Incidenthantering & MITRE ATT&CK',
    'Routing & Nätverksprotokoll',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans text-slate-100">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-cyan-300 font-mono">
                  CYBERQUIZ & SÄKERHETSAKADEMI
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Nätverkssäkerhet
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Testa och fördjupa dina kunskaper inom nätverksarkitektur, penetrationstestning och Blue Team-försvar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rank Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${currentRank.color}`}>
              <span>{currentRank.badge}</span>
              <div>
                <div className="text-[10px] text-slate-400 font-sans">Nivå</div>
                <div className="text-xs font-black">{currentRank.title}</div>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{totalXp} XP</span>
            </div>

            <button
              onClick={() => {
                if (onClearCompletedScenario) onClearCompletedScenario();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCENARIO VICTORY CELEBRATION BANNER (IF TRIGGERED BY SCENARIO COMPLETION) */}
        {completedScenarioTitle && (
          <div className="px-6 py-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-b border-emerald-500/40 flex items-center justify-between text-xs shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <Trophy className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="font-bold text-emerald-300 font-mono">
                  SCENARIO AVKLARAT: {completedScenarioTitle}!
                </span>
                <p className="text-[11px] text-slate-300">
                  Svara på dessa 3 snabbfrågor för att säkra dina kunskaper och få <strong className="text-amber-300">+25% Bonus-XP</strong>!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[11px]">
                Fråga {currentIndex + 1} av {questionQueue.length}
              </span>
            </div>
          </div>
        )}

        {/* GAMIFICATION & PROGRESS STRIP */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
              <span className="text-slate-400">Streak:</span>
              <span className="font-bold text-amber-300">{currentStreak} st</span>
              {currentStreak > 1 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +{(currentStreak * 10)}% XP
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-4">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Rekord:</span>
              <span className="text-slate-200 font-bold">{bestStreak} st</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-4">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Träffsäkerhet:</span>
              <span className="text-cyan-300 font-bold">
                {stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 100}%
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                ({stats.correct}/{stats.answered})
              </span>
            </div>
          </div>

          {/* XP Progress to Next Rank */}
          {nextRank && (
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-slate-400 hidden md:inline">
                Nästa rank: <strong className="text-slate-200">{nextRank.title}</strong> ({nextRank.minXp} XP)
              </span>
              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${rankProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-cyan-300 font-bold">{rankProgress}%</span>
            </div>
          )}
        </div>

        {/* QUIZ MODE TABS */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto">
          {completedScenarioId && (
            <button
              onClick={() => {
                setMode('scenario_bonus');
                startQuizSession('scenario_bonus');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 ${
                mode === 'scenario_bonus'
                  ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Scenarie-Bonus</span>
            </button>
          )}

          <button
            onClick={() => {
              setMode('streak');
              startQuizSession('streak');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 ${
              mode === 'streak'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Endless Streak Mode</span>
          </button>

          <button
            onClick={() => {
              setMode('speedrun');
              startQuizSession('speedrun');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 ${
              mode === 'speedrun'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Speedrun (10 Frågor)</span>
          </button>

          <button
            onClick={() => {
              setMode('practice');
              startQuizSession('practice');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 ${
              mode === 'practice'
                ? 'bg-slate-900 text-indigo-400 border-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kategoriträning</span>
          </button>

          <button
            onClick={() => setMode('review')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition border-b-2 ${
              mode === 'review'
                ? 'bg-slate-900 text-purple-400 border-purple-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Frågebank & Facit ({CYBER_QUIZ_QUESTIONS.length})</span>
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* MODE: REVIEW / FRÅGEBANK */}
          {mode === 'review' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 font-mono">
                  Säkerhetsfrågebank & Utbildningsguide ({CYBER_QUIZ_QUESTIONS.length} frågor)
                </h3>
                <span className="text-xs text-slate-400">
                  Läs igenom alla nätverkskoncept och Blue Team rekommendationer
                </span>
              </div>

              <div className="space-y-3">
                {CYBER_QUIZ_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-cyan-300 font-mono">{q.category}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {q.difficulty.toUpperCase()} • +{q.xpReward} XP
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                            optIdx === q.correctOptionIndex
                              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-medium'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-mono font-bold">{['A', 'B', 'C', 'D'][optIdx]}:</span>
                          <span>{opt}</span>
                          {optIdx === q.correctOptionIndex && (
                            <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Varför är detta rätt?</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      <div className="pt-1.5 border-t border-slate-800/80 text-amber-300/90 text-[11px]">
                        💡 <strong>Säkerhetstips:</strong> {q.securityTip}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isGameOver ? (
            /* GAME OVER / SESSION SUMMARY VIEW */
            <div className="max-w-md mx-auto text-center space-y-6 py-6 animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-2xl shadow-cyan-500/30 animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  Omgång Avslutad
                </span>
                <h3 className="text-2xl font-black text-slate-100 font-mono">
                  {sessionCorrectCount === questionQueue.length
                    ? '100% PERFEKT MATCH! 🌟'
                    : 'Gott Kämpat! 🛡️'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Du svarade rätt på <strong className="text-emerald-300">{sessionCorrectCount}</strong> av{' '}
                  <strong>{questionQueue.length}</strong> frågor!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Intjänad XP</div>
                  <div className="text-lg font-black text-amber-400">+{sessionScore} XP</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Högsta Streak</div>
                  <div className="text-lg font-black text-cyan-400">{currentStreak} st i rad</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => startQuizSession(mode)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Kör Igen</span>
                </button>

                <button
                  onClick={() => {
                    const text = `Jag nådde ${totalXp} XP och nivån ${currentRank.title} i Eklund CyberQuiz! Testa din nätverkssäkerhet du också.`;
                    navigator.clipboard.writeText(text);
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 3000);
                  }}
                  className="py-3 px-4 rounded-xl text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? 'Kopierat!' : 'Dela Resultat'}</span>
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            /* ACTIVE QUESTION VIEW */
            <div className="space-y-6 animate-fadeIn">
              
              {/* QUESTION TOP STRIP: CATEGORY, DIFFICULTY, TIMER */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {currentQuestion.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : currentQuestion.difficulty === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {currentQuestion.difficulty === 'easy'
                      ? 'LÄTT 🟢'
                      : currentQuestion.difficulty === 'medium'
                      ? 'MEDEL 🟡'
                      : 'SVÅR 🔴'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400">
                    Fråga <strong className="text-slate-100">{currentIndex + 1}</strong> av{' '}
                    <strong>{questionQueue.length}</strong>
                  </div>

                  {/* Countdown Timer */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                    timeLeft <= 5
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* TIMER PROGRESS BAR */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${(timeLeft / (mode === 'speedrun' ? 15 : 30)) * 100}%` }}
                />
              </div>

              {/* QUESTION CARD */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 ANSWER BUTTONS (A, B, C, D) */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((optionText, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctOptionIndex;

                  let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-900';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all text-xs sm:text-sm cursor-pointer select-none ${btnStyle}`}
                    >
                      <div className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center shrink-0 text-xs border ${
                        isAnswerSubmitted && isCorrect
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : isAnswerSubmitted && isSelected && !isCorrect
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {isAnswerSubmitted && isCorrect ? '✓' : isAnswerSubmitted && isSelected && !isCorrect ? '✕' : letter}
                      </div>

                      <div className="flex-1 pt-0.5 leading-relaxed">
                        {optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* POST-ANSWER EXPLANATION & NEXT BUTTON */}
              {isAnswerSubmitted && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedOption === currentQuestion.correctOptionIndex ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>RÄTT SVARAT! (+{currentQuestion.xpReward} XP)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                          <XCircle className="w-5 h-5" />
                          <span>FELAKTIGT SVAR</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl font-bold font-mono text-xs bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>Nästa Fråga</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-cyan-400" />
                      <span>Förklaring:</span>
                    </div>
                    <p className="leading-relaxed text-slate-200">{currentQuestion.explanation}</p>
                    <div className="pt-2 border-t border-slate-800 text-amber-300 font-mono text-[11px]">
                      💡 <strong>Nätverkstips:</strong> {currentQuestion.securityTip}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* EMPTY QUEUE FALLBACK */
            <div className="p-8 text-center space-y-3">
              <Brain className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-400">Inga frågor matchar det valda filtret.</div>
              <button
                onClick={() => startQuizSession('streak', 'all', 'all')}
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              >
                Återställ & Kör Alla Frågor
              </button>
            </div>
          )}

        </div>

        {/* BOTTOM STATUS FOOTER */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px]">Eklund Network Defense Academy • 2026 Edition</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Tangentbordsnavigering: Tryck 1-4 för att svara, Enter för nästa
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
