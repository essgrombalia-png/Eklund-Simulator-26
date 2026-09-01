import React, { useState } from 'react';
import { Device, Link } from '../types';
import { LayoutAlgorithm, optimizeNetworkLayout } from '../utils/d3Layout';
import {
  Wand2,
  X,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  Zap,
  Grid,
  Disc,
  GitMerge,
  Sliders,
  Play,
} from 'lucide-react';

interface LayoutOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Device[];
  links: Link[];
  onApplyLayout: (updatedNodes: Device[], historyLabel: string) => void;
}

export const LayoutOptimizerModal: React.FC<LayoutOptimizerModalProps> = ({
  isOpen,
  onClose,
  nodes,
  links,
  onApplyLayout,
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<LayoutAlgorithm>('hierarchical');
  const [nodeSpacing, setNodeSpacing] = useState<number>(140);
  const [simulationTicks, setSimulationTicks] = useState<number>(300);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleRunOptimizer = (algo: LayoutAlgorithm = selectedAlgorithm) => {
    setIsApplying(true);

    setTimeout(() => {
      // Calculate canvas bounds dynamically or default
      const canvasWidth = window.innerWidth > 1400 ? 1400 : 1200;
      const canvasHeight = window.innerHeight > 900 ? 900 : 750;

      const optimized = optimizeNetworkLayout(nodes, links, {
        algorithm: algo,
        nodeSpacing,
        ticks: simulationTicks,
        canvasWidth,
        canvasHeight,
        padding: 90,
      });

      let labelName = 'Hierarkisk Trädstruktur';
      if (algo === 'organic') labelName = 'D3 Organiskt Kraftfält';
      if (algo === 'circular') labelName = 'Cirkulär Ringtopologi';
      if (algo === 'grid') labelName = 'Subnät Rutnät';

      onApplyLayout(optimized, `D3 Layout-optimering (${labelName})`);
      setIsApplying(false);
      onClose();
    }, 150);
  };

  const algoCards: {
    id: LayoutAlgorithm;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      id: 'hierarchical',
      title: 'Hierarkisk Trädstruktur',
      description:
        'Sorterar nätverket i logiska skikt: Internet & Routrar överst -> Switchar i mitten -> Servrar & Klienter nederst.',
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      badge: 'Rekommenderas',
    },
    {
      id: 'organic',
      title: 'Självorganiserande D3-Kraftfält',
      description:
        'Använder D3-force fysiksimulering med frånstötande krafter och fjädrar för att automatiskt trassla upp överlappande kabelhärvor.',
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      badge: 'D3 Fysik',
    },
    {
      id: 'circular',
      title: 'Cirkulär Ringtopologi',
      description:
        'Placerar kärnroutrar och brandväggar i en central ring, med arbetsstationer och IoT-enheter strålande utåt.',
      icon: <Disc className="w-6 h-6 text-emerald-400" />,
      badge: 'Ring & Stjärna',
    },
    {
      id: 'grid',
      title: 'Matris & Subnät Rutnät',
      description:
        'Justerar alla enheter i strukturerade rader och kolumner sorterade efter nätverkstyp och IP-intervall.',
      icon: <Grid className="w-6 h-6 text-purple-400" />,
      badge: 'Raka Linjer',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Wand2 className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  D3 Layout-optimerare
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {nodes.length} Noder • {links.length} Länkar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatisk topologi-sortering och fysikbaserad avståndshantering powered av D3-force.
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

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Algorithms Selection Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-1.5">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span>Välj Layout-Algoritm:</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {algoCards.map((algo) => {
                const isSelected = selectedAlgorithm === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    className={`text-left p-4 rounded-xl border transition flex flex-col justify-between group relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            {algo.icon}
                          </div>
                          <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition">
                            {algo.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {algo.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{algo.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end">
                      {isSelected ? (
                        <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Vald
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 group-hover:text-slate-300 font-medium">
                          Klicka för att välja
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D3 Simulation Fine-tuning Controls */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Simuleringsparametrar & Avstånd</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Finjustera avstånden mellan enheter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1 font-medium">
                  <span>Nod-avstånd (Spacing):</span>
                  <span className="text-cyan-400 font-mono font-bold">{nodeSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="260"
                  step="10"
                  value={nodeSpacing}
                  onChange={(e) => setNodeSpacing(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1 font-medium">
                  <span>D3 Simuleringsprecision:</span>
                  <span className="text-cyan-400 font-mono font-bold">{simulationTicks} ticks</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="50"
                  value={simulationTicks}
                  onChange={(e) => setSimulationTicks(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            Avbryt
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunOptimizer('organic')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Kör D3 Fysiksimulering</span>
            </button>

            <button
              onClick={() => handleRunOptimizer()}
              disabled={isApplying}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              {isApplying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Beräknar D3 Layout...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Optimera Nätverkslayout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
