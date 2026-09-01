import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Eye, EyeOff, Sparkles, Sliders, Zap } from 'lucide-react';

interface MatrixRainProps {
  /** Opacity of the canvas overlay (0.0 to 1.0) */
  opacity?: number;
  /** Speed multiplier for rain drops */
  speed?: number;
  /** Color theme */
  colorTheme?: 'classic_green' | 'cyber_neon' | 'matrix_dark';
  /** Pointer events enabled or click-through */
  interactive?: boolean;
  /** Fixed background position */
  fullScreen?: boolean;
  /** Optional class name */
  className?: string;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  opacity = 0.35,
  speed = 1,
  colorTheme = 'classic_green',
  interactive = false,
  fullScreen = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [currentOpacity, setCurrentOpacity] = useState<number>(opacity);
  const [currentSpeed, setCurrentSpeed] = useState<number>(speed);
  const [currentTheme, setCurrentTheme] = useState<'classic_green' | 'cyber_neon' | 'matrix_dark'>(colorTheme);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Characters for Matrix code rain: Katakana, Hex, Cyber symbols
    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const hex = '0123456789ABCDEF';
    const cyber = '<>/\\{}[]=*+-_~#$@%!&?';
    const alphabet = katakana + latin + hex + cyber;

    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];
    let speeds: number[] = [];

    const resizeCanvas = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const width = fullScreen ? window.innerWidth : parent?.clientWidth || window.innerWidth;
      const height = fullScreen ? window.innerHeight : parent?.clientHeight || window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      columns = Math.floor(width / fontSize);
      drops = [];
      speeds = [];

      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100); // Stagger initial drop start
        speeds[i] = (Math.random() * 0.8 + 0.6) * currentSpeed;
      }
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    // Color palette resolution
    const getColors = () => {
      switch (currentTheme) {
        case 'cyber_neon':
          return {
            bg: 'rgba(3, 7, 18, 0.08)',
            lead: '#f0fdf4',
            mid: '#22c55e',
            dark: '#15803d',
            glow: '#4ade80',
          };
        case 'matrix_dark':
          return {
            bg: 'rgba(0, 5, 2, 0.09)',
            lead: '#d1fae5',
            mid: '#10b981',
            dark: '#047857',
            glow: '#34d399',
          };
        case 'classic_green':
        default:
          return {
            bg: 'rgba(5, 12, 8, 0.08)',
            lead: '#ffffff',
            mid: '#00ff66',
            dark: '#008822',
            glow: '#00ff66',
          };
      }
    };

    let lastTime = performance.now();
    const fpsInterval = 1000 / 30; // 30 FPS for authentic vintage matrix look

    const draw = (now: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const elapsed = now - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = now - (elapsed % fpsInterval);

      const palette = getColors();

      // Semi-transparent background fill creates trailing motion blur
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Courier New", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Render lead bright character
        ctx.fillStyle = palette.lead;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);

        // Render trailing dark green character slightly above
        const trailText = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillStyle = Math.random() > 0.5 ? palette.mid : palette.dark;
        ctx.shadowBlur = 0;
        ctx.fillText(trailText, x, y - fontSize);

        // Reset drop to top randomly when it exceeds canvas height
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = (Math.random() * 0.8 + 0.6) * currentSpeed;
        }

        drops[i] += speeds[i];
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled, currentTheme, currentSpeed, fullScreen]);

  return (
    <>
      {isEnabled && (
        <canvas
          ref={canvasRef}
          style={{ opacity: currentOpacity }}
          className={`${
            fullScreen ? 'fixed inset-0 z-0' : 'absolute inset-0 z-0'
          } ${interactive ? 'pointer-events-auto' : 'pointer-events-none'} transition-opacity duration-500 ${className}`}
        />
      )}

      {/* Matrix Controls Quick Widget */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 font-mono text-xs">
        {showSettings && (
          <div className="bg-slate-900/95 border border-emerald-500/40 text-slate-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl w-64 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-orbitron tracking-wider text-xs">MATRIX RAIN ENGINE</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Toggle Power */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status:</span>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isEnabled ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                <span>{isEnabled ? 'AKTIV' : 'AVSTÄNGD'}</span>
              </button>
            </div>

            {/* Opacity Slider */}
            {isEnabled && (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Intensitet / Transparens:</span>
                    <span className="text-emerald-400 font-bold">{Math.round(currentOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={currentOpacity}
                    onChange={(e) => setCurrentOpacity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Hastighet:</span>
                    <span className="text-emerald-400 font-bold">{currentSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.2"
                    value={currentSpeed}
                    onChange={(e) => setCurrentSpeed(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Theme Selector */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">Färgtema:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('classic_green')}
                      className={`py-1 text-[10px] rounded border font-bold transition cursor-pointer ${
                        currentTheme === 'classic_green'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Klassisk
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('cyber_neon')}
                      className={`py-1 text-[10px] rounded border font-bold transition cursor-pointer ${
                        currentTheme === 'cyber_neon'
                          ? 'bg-emerald-900 text-green-200 border-green-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Cyber Neon
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('matrix_dark')}
                      className={`py-1 text-[10px] rounded border font-bold transition cursor-pointer ${
                        currentTheme === 'matrix_dark'
                          ? 'bg-teal-950 text-teal-300 border-teal-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Mörk
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-full border shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isEnabled
              ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/50 hover:bg-slate-800 hover:border-emerald-400 hover:scale-105 shadow-emerald-950/50'
              : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
          title="Matrix Digital Rain Inställningar"
        >
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold font-orbitron hidden sm:inline text-emerald-300">
            MATRIX CODE
          </span>
        </button>
      </div>
    </>
  );
};
