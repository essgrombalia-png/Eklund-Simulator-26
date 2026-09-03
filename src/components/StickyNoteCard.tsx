import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  PinOff,
  Trash2,
  Palette,
  Clock,
  Sparkles,
  Scaling,
  Plus,
  Minus,
  Maximize2,
  SlidersHorizontal,
  Eye,
  Type,
  X,
  Edit2,
} from 'lucide-react';
import { StickyNote, StickyNoteColor } from '../types';

interface StickyNoteCardProps {
  note: StickyNote;
  zoom: number;
  onUpdate: (note: StickyNote) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, noteId: string) => void;
}

const COLOR_STYLES: Record<
  StickyNoteColor,
  {
    cardBg: string;
    border: string;
    headerBg: string;
    titleColor: string;
    textColor: string;
    accentDot: string;
    badgeBg: string;
    shadow: string;
    glow: string;
  }
> = {
  yellow: {
    cardBg: 'bg-amber-300/95 text-amber-950 border-amber-400/90',
    border: 'border-amber-400',
    headerBg: 'bg-amber-400/80 border-b border-amber-500/30',
    titleColor: 'text-amber-950 font-bold',
    textColor: 'text-amber-950 placeholder-amber-800/60',
    accentDot: 'bg-amber-500',
    badgeBg: 'bg-amber-400/80 text-amber-950 border-amber-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(245,158,11,0.25)]',
    glow: 'ring-2 ring-amber-400/60',
  },
  cyan: {
    cardBg: 'bg-cyan-950/95 text-cyan-100 border-cyan-500/70 backdrop-blur-xl',
    border: 'border-cyan-500/70',
    headerBg: 'bg-cyan-900/90 border-b border-cyan-500/50',
    titleColor: 'text-cyan-200 font-bold',
    textColor: 'text-cyan-100 placeholder-cyan-400/50',
    accentDot: 'bg-cyan-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(6,182,212,0.3)]',
    glow: 'ring-2 ring-cyan-400/60',
  },
  emerald: {
    cardBg: 'bg-emerald-950/95 text-emerald-100 border-emerald-500/70 backdrop-blur-xl',
    border: 'border-emerald-500/70',
    headerBg: 'bg-emerald-900/90 border-b border-emerald-500/50',
    titleColor: 'text-emerald-200 font-bold',
    textColor: 'text-emerald-100 placeholder-emerald-400/50',
    accentDot: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(16,185,129,0.3)]',
    glow: 'ring-2 ring-emerald-400/60',
  },
  rose: {
    cardBg: 'bg-rose-950/95 text-rose-100 border-rose-500/70 backdrop-blur-xl',
    border: 'border-rose-500/70',
    headerBg: 'bg-rose-900/90 border-b border-rose-500/50',
    titleColor: 'text-rose-200 font-bold',
    textColor: 'text-rose-100 placeholder-rose-400/50',
    accentDot: 'bg-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(244,63,94,0.3)]',
    glow: 'ring-2 ring-rose-400/60',
  },
  amber: {
    cardBg: 'bg-amber-950/95 text-amber-100 border-amber-500/70 backdrop-blur-xl',
    border: 'border-amber-500/70',
    headerBg: 'bg-amber-900/90 border-b border-amber-500/50',
    titleColor: 'text-amber-200 font-bold',
    textColor: 'text-amber-100 placeholder-amber-400/50',
    accentDot: 'bg-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(245,158,11,0.3)]',
    glow: 'ring-2 ring-amber-400/60',
  },
  purple: {
    cardBg: 'bg-purple-950/95 text-purple-100 border-purple-500/70 backdrop-blur-xl',
    border: 'border-purple-500/70',
    headerBg: 'bg-purple-900/90 border-b border-purple-500/50',
    titleColor: 'text-purple-200 font-bold',
    textColor: 'text-purple-100 placeholder-purple-400/50',
    accentDot: 'bg-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(168,85,247,0.3)]',
    glow: 'ring-2 ring-purple-400/60',
  },
  blue: {
    cardBg: 'bg-blue-950/95 text-blue-100 border-blue-500/70 backdrop-blur-xl',
    border: 'border-blue-500/70',
    headerBg: 'bg-blue-900/90 border-b border-blue-500/50',
    titleColor: 'text-blue-200 font-bold',
    textColor: 'text-blue-100 placeholder-blue-400/50',
    accentDot: 'bg-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
    shadow: 'shadow-[0_10px_25px_rgba(59,130,246,0.3)]',
    glow: 'ring-2 ring-blue-400/60',
  },
};

const PALETTE_COLORS: { key: StickyNoteColor; label: string; hex: string }[] = [
  { key: 'yellow', label: 'Post-it Gul', hex: '#f59e0b' },
  { key: 'cyan', label: 'Cyber Cyan', hex: '#06b6d4' },
  { key: 'emerald', label: 'Säker Grön', hex: '#10b981' },
  { key: 'rose', label: 'Varning Röd', hex: '#f43f5e' },
  { key: 'amber', label: 'Bärnsten', hex: '#d97706' },
  { key: 'purple', label: 'Lila Arkitektur', hex: '#a855f7' },
  { key: 'blue', label: 'Blå Subnät', hex: '#3b82f6' },
];

const SIZE_PRESETS = [
  { label: 'S', name: 'Liten', width: 180, height: 130 },
  { label: 'M', name: 'Standard', width: 240, height: 180 },
  { label: 'L', name: 'Stor', width: 340, height: 260 },
  { label: 'XL', name: 'Full', width: 460, height: 340 },
];

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note,
  zoom,
  onUpdate,
  onDelete,
  onDragStart,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [titleInput, setTitleInput] = useState(note.title || '');
  const [textInput, setTextInput] = useState(note.text || '');
  const [isResizing, setIsResizing] = useState(false);
  const [liveDimensions, setLiveDimensions] = useState<{ width: number; height: number } | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state with note prop changes
  useEffect(() => {
    setTextInput(note.text || '');
  }, [note.text]);

  useEffect(() => {
    setTitleInput(note.title || '');
  }, [note.title]);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const noteRef = useRef(note);
  noteRef.current = note;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const resizeStateRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: 'corner' | 'right' | 'bottom';
  } | null>(null);

  const theme = COLOR_STYLES[note.color] || COLOR_STYLES.yellow;
  const isYellow = note.color === 'yellow';

  const currentWidth = liveDimensions?.width ?? (note.width || 240);
  const currentHeight = liveDimensions?.height ?? (note.height || 180);
  const currentOpacity = typeof note.opacity === 'number' ? note.opacity : 1;

  const handleSetOpacity = (opacity: number) => {
    const clamped = Math.max(0.15, Math.min(1, Math.round(opacity * 100) / 100));
    onUpdate({
      ...note,
      opacity: clamped,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitleInput(val);
    onUpdate({
      ...note,
      title: val,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);
    onUpdate({
      ...note,
      text: val,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetColor = (color: StickyNoteColor) => {
    onUpdate({ ...note, color });
    setShowColorPicker(false);
  };

  // Resize Handlers
  const handleScaleSize = (delta: number) => {
    const w = note.width || 240;
    const h = note.height || 180;
    const nextW = Math.max(160, Math.min(800, w + delta * 40));
    const nextH = Math.max(120, Math.min(800, h + delta * 30));
    onUpdate({
      ...note,
      width: nextW,
      height: nextH,
    });
  };

  const handleApplyPresetSize = (w: number, h: number) => {
    onUpdate({
      ...note,
      width: w,
      height: h,
    });
    setShowSizePicker(false);
  };

  const startResizing = (
    e: React.MouseEvent | React.TouchEvent,
    direction: 'corner' | 'right' | 'bottom'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startW = note.width || 240;
    const startH = note.height || 180;

    resizeStateRef.current = {
      startX: clientX,
      startY: clientY,
      startWidth: startW,
      startHeight: startH,
      direction,
    };
    setIsResizing(true);
    setLiveDimensions({ width: startW, height: startH });

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!resizeStateRef.current) return;
      const moveClientX =
        'touches' in moveEvent
          ? (moveEvent as TouchEvent).touches[0].clientX
          : (moveEvent as MouseEvent).clientX;
      const moveClientY =
        'touches' in moveEvent
          ? (moveEvent as TouchEvent).touches[0].clientY
          : (moveEvent as MouseEvent).clientY;

      const deltaX =
        (moveClientX - resizeStateRef.current.startX) / (zoomRef.current || 1);
      const deltaY =
        (moveClientY - resizeStateRef.current.startY) / (zoomRef.current || 1);

      let nextW = resizeStateRef.current.startWidth;
      let nextH = resizeStateRef.current.startHeight;

      if (
        resizeStateRef.current.direction === 'corner' ||
        resizeStateRef.current.direction === 'right'
      ) {
        nextW = Math.max(
          160,
          Math.min(800, Math.round(resizeStateRef.current.startWidth + deltaX))
        );
      }
      if (
        resizeStateRef.current.direction === 'corner' ||
        resizeStateRef.current.direction === 'bottom'
      ) {
        nextH = Math.max(
          120,
          Math.min(800, Math.round(resizeStateRef.current.startHeight + deltaY))
        );
      }

      setLiveDimensions({ width: nextW, height: nextH });
      onUpdateRef.current({
        ...noteRef.current,
        width: nextW,
        height: nextH,
      });
    };

    const handleEnd = () => {
      setIsResizing(false);
      setLiveDimensions(null);
      resizeStateRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  const handleInsertTemplate = (type: 'ip' | 'vlan' | 'security' | 'todo') => {
    let snippet = '';
    let suggestedTitle = '';
    if (type === 'ip') {
      snippet = '\n• Subnät: 192.168.1.0/24\n• Gateway: 192.168.1.254\n• DNS: 1.1.1.1, 8.8.8.8';
      suggestedTitle = 'IP-planering & Subnät';
    } else if (type === 'vlan') {
      snippet = '\n• VLAN 10: Ledning & Ekonomi\n• VLAN 20: Utveckling & IT\n• VLAN 30: Gäst Wi-Fi';
      suggestedTitle = 'VLAN-arkitektur';
    } else if (type === 'security') {
      snippet = '\n🔒 Säkerhetsregel:\n- Endast HTTPS (443) tillåten från WAN\n- SSH begränsad till Bastion Host';
      suggestedTitle = 'Säkerhetsregler';
    } else if (type === 'todo') {
      snippet = '\n[ ] Konfigurera brandvägg\n[ ] Testa ping & routning\n[ ] Verifiera DNS-uppslagning';
      suggestedTitle = 'Checklista';
    }

    const updated = (textInput ? textInput.trim() + '\n' : '') + snippet.trimStart();
    setTextInput(updated);

    const nextTitle = !titleInput.trim() || titleInput === 'Anteckning' ? suggestedTitle : titleInput;
    if (nextTitle !== titleInput) {
      setTitleInput(nextTitle);
    }

    onUpdate({
      ...note,
      title: nextTitle,
      text: updated,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        width: currentWidth,
        height: currentHeight,
        opacity: currentOpacity,
      }}
      className={`group rounded-2xl border ${theme.cardBg} ${theme.shadow} ${
        isResizing ? 'ring-2 ring-cyan-400 shadow-2xl scale-[1.01]' : ''
      } transition-all duration-75 z-20 overflow-hidden flex flex-col select-none`}
    >
      {/* Tape / Pin Decorative Badge at Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3.5 bg-white/40 backdrop-blur-sm rounded-sm border border-white/60 shadow-sm z-30 pointer-events-none" />

      {/* Header / Drag Bar */}
      <div
        onMouseDown={(e) => {
          if (!note.isPinned) {
            onDragStart(e, note.id);
          }
        }}
        onTouchStart={(e) => {
          if (!note.isPinned) {
            onDragStart(e, note.id);
          }
        }}
        className={`px-3 py-2 flex items-center justify-between gap-1.5 ${theme.headerBg} ${
          note.isPinned ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={`w-2 h-2 rounded-full ${theme.accentDot} shrink-0 animate-pulse`} />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              titleInputRef.current?.focus();
            }}
            title="Klicka för att namnge anteckning i rubrikfältet"
            className={`text-xs font-extrabold truncate text-left cursor-pointer hover:underline flex items-center gap-1 min-w-0 ${theme.titleColor}`}
          >
            <span className="truncate">{note.title?.trim() ? note.title : 'Anteckning (namnlös)'}</span>
            <Edit2 className="w-2.5 h-2.5 opacity-50 shrink-0" />
          </button>
        </div>

        {/* Note Controls */}
        <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {/* Settings / Opacity Menu Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowSettings(!showSettings);
              setShowSizePicker(false);
              setShowColorPicker(false);
            }}
            title="Inställningsmeny (Opacitet & Transparens)"
            className={`p-1 rounded-md transition flex items-center gap-0.5 cursor-pointer ${
              showSettings
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 font-bold'
                  : 'bg-cyan-500/40 text-white'
                : currentOpacity < 0.95
                ? isYellow
                  ? 'bg-amber-400/80 text-amber-950 font-bold ring-1 ring-amber-600/60'
                  : 'bg-cyan-500/30 text-cyan-200 ring-1 ring-cyan-400/60'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {currentOpacity < 0.95 && (
              <span className="text-[8.5px] font-mono font-bold leading-none pr-0.5">
                {Math.round(currentOpacity * 100)}%
              </span>
            )}
          </button>

          {/* Quick Zoom / Size Control Button */}
          <button
            type="button"
            onClick={() => {
              setShowSizePicker(!showSizePicker);
              setShowColorPicker(false);
              setShowSettings(false);
            }}
            title="Ändra storlek på Post-it (Mindre/Större, S, M, L, XL)"
            className={`p-1 rounded-md transition ${
              showSizePicker
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 font-bold'
                  : 'bg-cyan-500/40 text-white'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Scaling className="w-3.5 h-3.5" />
          </button>

          {/* Color Selector Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowSizePicker(false);
              setShowSettings(false);
            }}
            title="Ändra färg på Post-it"
            className={`p-1 rounded-md transition ${
              showColorPicker
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 font-bold'
                  : 'bg-cyan-500/40 text-white'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Pin / Unpin Button */}
          <button
            type="button"
            onClick={() => onUpdate({ ...note, isPinned: !note.isPinned })}
            title={note.isPinned ? 'Lås upp position' : 'Lås fast position (Nåla fast)'}
            className={`p-1 rounded-md transition ${
              note.isPinned
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 font-bold'
                  : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            {note.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            title="Ta bort Post-it"
            className={`p-1 rounded-md transition ${
              isYellow
                ? 'hover:bg-rose-500 hover:text-white text-amber-950'
                : 'hover:bg-rose-500/20 text-slate-400 hover:text-rose-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings & Opacity Drawer */}
      {showSettings && (
        <div
          className="p-2.5 border-b border-current/20 bg-black/35 backdrop-blur-md flex flex-col gap-2 animate-fade-in text-[10px]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header of settings drawer */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="font-mono font-bold opacity-80 flex items-center gap-1 text-[10.5px]">
              <Eye className="w-3 h-3" /> Opacitet & Transparens:
            </span>
            <span
              className={`font-mono font-extrabold px-1.5 py-0.5 rounded text-[10px] ${
                isYellow
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
              }`}
            >
              {Math.round(currentOpacity * 100)}%{' '}
              {currentOpacity < 0.95 ? '(Halvtransparent)' : '(Solid)'}
            </span>
          </div>

          {/* Opacity Range Slider */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-mono opacity-60 text-[9px] shrink-0">20%</span>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={Math.round(currentOpacity * 100)}
              onChange={(e) => handleSetOpacity(Number(e.target.value) / 100)}
              className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Dra för att justera transparens (${Math.round(currentOpacity * 100)}%)`}
            />
            <span className="font-mono opacity-60 text-[9px] shrink-0">100%</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-current/15">
            <span className="font-mono text-[9px] opacity-75">Snabbval:</span>
            <div className="flex items-center gap-1">
              {[
                { label: '100%', value: 1.0, name: 'Solid' },
                { label: '75%', value: 0.75, name: 'Lätt transparent' },
                { label: '50%', value: 0.5, name: 'Halvtransparent' },
                { label: '30%', value: 0.3, name: 'Mycket transparent' },
              ].map((preset) => {
                const isSelected = Math.abs(currentOpacity - preset.value) < 0.04;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSetOpacity(preset.value)}
                    title={`${preset.name} (${preset.label})`}
                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-sm scale-105'
                        : isYellow
                        ? 'bg-amber-400/60 hover:bg-amber-400 text-amber-950'
                        : 'bg-white/10 hover:bg-white/25 text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1-Click Action Toggle: Gör Halvtransparent / Solid */}
          <button
            type="button"
            onClick={() => {
              if (currentOpacity > 0.65) {
                handleSetOpacity(0.5);
              } else {
                handleSetOpacity(1.0);
              }
            }}
            className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-98 ${
              currentOpacity <= 0.65
                ? isYellow
                  ? 'bg-amber-900/80 hover:bg-amber-900 text-amber-100'
                  : 'bg-slate-800 hover:bg-slate-700 text-stone-100 border border-slate-600'
                : isYellow
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-amber-400/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            {currentOpacity <= 0.65 ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Återställ till Solid (100% ogenomskinlig)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 opacity-80" />
                <span>⚡ Gör Halvtransparent (50% transparens)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Size Adjuster Drawer */}
      {showSizePicker && (
        <div
          className="p-2 border-b border-current/20 bg-black/25 backdrop-blur-md flex items-center justify-between gap-1.5 animate-fade-in text-[10px]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <span className="font-mono font-bold opacity-75 mr-0.5">Storlek:</span>
            {SIZE_PRESETS.map((p) => {
              const isCurrent =
                Math.abs((note.width || 240) - p.width) < 20 &&
                Math.abs((note.height || 180) - p.height) < 20;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPresetSize(p.width, p.height)}
                  title={`${p.name} (${p.width} × ${p.height}px)`}
                  className={`px-1.5 py-0.5 rounded font-mono font-bold transition ${
                    isCurrent
                      ? 'bg-white text-slate-950 shadow-sm scale-105'
                      : isYellow
                      ? 'bg-amber-400/60 hover:bg-amber-400 text-amber-950'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 border-l border-current/20 pl-1.5">
            <button
              type="button"
              onClick={() => handleScaleSize(-1)}
              title="Gör mindre (-)"
              className={`p-1 rounded transition ${
                isYellow ? 'hover:bg-amber-400/90' : 'hover:bg-white/20'
              }`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleScaleSize(1)}
              title="Gör större (+)"
              className={`p-1 rounded transition ${
                isYellow ? 'hover:bg-amber-400/90' : 'hover:bg-white/20'
              }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Color Picker Dropdown Drawer */}
      {showColorPicker && (
        <div
          className="p-2 border-b border-current/20 bg-black/20 backdrop-blur-md flex items-center justify-around gap-1 animate-fade-in"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {PALETTE_COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => handleSetColor(c.key)}
              title={c.label}
              style={{ backgroundColor: c.hex }}
              className={`w-5 h-5 rounded-full border border-white/60 hover:scale-125 transition-transform ${
                note.color === c.key ? 'ring-2 ring-white scale-110 shadow' : 'opacity-80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Note Body (Rubrikfält & Text Area) */}
      <div className="p-2.5 flex-1 flex flex-col gap-2 min-h-0 relative" onMouseDown={(e) => e.stopPropagation()}>
        {/* Dedikerat Rubrikfält för att namnge anteckningen */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all shrink-0 ${
            isYellow
              ? 'bg-amber-400/40 border-amber-600/30 focus-within:border-amber-700/60 focus-within:bg-amber-400/60'
              : 'bg-black/25 border-white/15 focus-within:border-cyan-400/50 focus-within:bg-black/40'
          }`}
          title="Rubrikfält – Namnge anteckningen här"
        >
          <Type className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <input
            ref={titleInputRef}
            type="text"
            value={titleInput}
            onChange={handleTitleChange}
            placeholder="Rubrik (namnge anteckning)..."
            className={`w-full bg-transparent outline-none font-bold text-xs tracking-tight ${theme.titleColor} placeholder:opacity-50`}
          />
          {titleInput ? (
            <button
              type="button"
              onClick={() => {
                setTitleInput('');
                onUpdate({
                  ...note,
                  title: '',
                  updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
                titleInputRef.current?.focus();
              }}
              title="Rensa rubrik"
              className="opacity-40 hover:opacity-100 transition p-0.5 rounded cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Text Area */}
        <textarea
          value={textInput}
          onChange={handleTextChange}
          placeholder="Skriv anteckningar, IP-planering, VLAN..."
          className={`w-full flex-1 bg-transparent resize-none outline-none font-sans text-xs leading-relaxed font-semibold ${theme.textColor}`}
        />

        {/* Quick Insert Templates Toolbar & Live Size Indicator */}
        <div className="pt-1.5 border-t border-current/15 flex items-center justify-between gap-1 text-[10px] shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="font-mono font-extrabold opacity-70 flex items-center gap-0.5 text-[9px] shrink-0">
              <Sparkles className="w-2.5 h-2.5" /> Mallar:
            </span>
            <button
              type="button"
              onClick={() => handleInsertTemplate('ip')}
              title="Infoga IP & Subnät mall"
              className={`px-1.5 py-0.5 rounded border text-[9px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer shrink-0`}
            >
              IP
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('vlan')}
              title="Infoga VLAN mall"
              className={`px-1.5 py-0.5 rounded border text-[9px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer shrink-0`}
            >
              VLAN
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('security')}
              title="Infoga Säkerhetsregel mall"
              className={`px-1.5 py-0.5 rounded border text-[9px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer shrink-0`}
            >
              Säk
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('todo')}
              title="Infoga Att Göra-lista mall"
              className={`px-1.5 py-0.5 rounded border text-[9px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer shrink-0`}
            >
              Check
            </button>
          </div>

          {/* Timestamp / Live Dimension Indicator */}
          <div className="text-[9px] font-mono opacity-70 flex items-center justify-end gap-1 shrink-0">
            {isResizing && liveDimensions ? (
              <span className="font-bold text-cyan-400 bg-black/40 px-1 rounded">
                {liveDimensions.width} × {liveDimensions.height}px
              </span>
            ) : (
              note.updatedAt && (
                <span className="flex items-center gap-0.5 opacity-80">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{note.updatedAt}</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Edge Resize Handle */}
      <div
        onMouseDown={(e) => startResizing(e, 'right')}
        onTouchStart={(e) => startResizing(e, 'right')}
        title="Dra för att ändra bredd"
        className="absolute top-8 right-0 bottom-6 w-2 cursor-ew-resize hover:bg-current/10 transition z-30"
      />

      {/* Bottom Edge Resize Handle */}
      <div
        onMouseDown={(e) => startResizing(e, 'bottom')}
        onTouchStart={(e) => startResizing(e, 'bottom')}
        title="Dra för att ändra höjd"
        className="absolute bottom-0 left-0 right-6 h-2 cursor-ns-resize hover:bg-current/10 transition z-30"
      />

      {/* Bottom-Right Corner Resize Grip Handle */}
      <div
        onMouseDown={(e) => startResizing(e, 'corner')}
        onTouchStart={(e) => startResizing(e, 'corner')}
        title="Dra i hörnet för att göra Post-it större eller mindre"
        className="absolute bottom-0 right-0 w-6 h-6 flex items-end justify-end p-1 cursor-nwse-resize select-none group/resize z-40"
      >
        <div className="w-3.5 h-3.5 rounded-br-md border-r-2 border-b-2 border-current opacity-40 group-hover/resize:opacity-100 group-hover/resize:scale-125 transition-all flex items-center justify-center">
          <svg className="w-2 h-2 opacity-70" viewBox="0 0 6 6" fill="currentColor">
            <circle cx="5" cy="5" r="0.8" />
            <circle cx="5" cy="2.5" r="0.8" />
            <circle cx="2.5" cy="5" r="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
};
