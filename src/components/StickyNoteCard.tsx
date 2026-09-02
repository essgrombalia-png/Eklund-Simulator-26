import React, { useState } from 'react';
import {
  Pin,
  PinOff,
  Trash2,
  Check,
  Palette,
  Clock,
  Sparkles,
  FileText,
  ShieldAlert,
  Layers,
  ListTodo,
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

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note,
  zoom,
  onUpdate,
  onDelete,
  onDragStart,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [titleInput, setTitleInput] = useState(note.title || 'Digital Post-it');
  const [textInput, setTextInput] = useState(note.text || '');

  const theme = COLOR_STYLES[note.color] || COLOR_STYLES.yellow;
  const isYellow = note.color === 'yellow';

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleInput !== note.title) {
      onUpdate({ ...note, title: titleInput });
    }
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

  const handleInsertTemplate = (type: 'ip' | 'vlan' | 'security' | 'todo') => {
    let snippet = '';
    if (type === 'ip') {
      snippet = '\n• Subnät: 192.168.1.0/24\n• Gateway: 192.168.1.254\n• DNS: 1.1.1.1, 8.8.8.8';
    } else if (type === 'vlan') {
      snippet = '\n• VLAN 10: Ledning & Ekonomi\n• VLAN 20: Utveckling & IT\n• VLAN 30: Gäst Wi-Fi';
    } else if (type === 'security') {
      snippet = '\n🔒 Säkerhetsregel:\n- Endast HTTPS (443) tillåten från WAN\n- SSH begränsad till Bastion Host';
    } else if (type === 'todo') {
      snippet = '\n[ ] Konfigurera brandvägg\n[ ] Testa ping & routning\n[ ] Verifiera DNS-uppslagning';
    }

    const updated = (textInput ? textInput.trim() + '\n' : '') + snippet;
    setTextInput(updated);
    onUpdate({
      ...note,
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
        width: note.width || 230,
        minHeight: note.height || 160,
      }}
      className={`group rounded-2xl border ${theme.cardBg} ${theme.shadow} transition-all duration-150 z-20 overflow-hidden flex flex-col select-none`}
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

          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur();
              }}
              autoFocus
              className={`w-full text-xs font-bold bg-transparent outline-none border-b border-current ${theme.titleColor}`}
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingTitle(true)}
              title="Dubbelklicka för att ändra rubrik"
              className={`text-xs font-extrabold truncate cursor-pointer hover:underline ${theme.titleColor}`}
            >
              {note.title || 'Digital Post-it'}
            </span>
          )}
        </div>

        {/* Note Controls */}
        <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {/* Color Selector Toggle */}
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Ändra färg på Post-it"
            className={`p-1 rounded-md transition ${
              isYellow
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

      {/* Color Picker Dropdown Drawer */}
      {showColorPicker && (
        <div
          className="p-2 border-b border-current/20 bg-black/20 backdrop-blur-md flex items-center justify-around gap-1"
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

      {/* Note Body Text Area */}
      <div className="p-2.5 flex-1 flex flex-col gap-2" onMouseDown={(e) => e.stopPropagation()}>
        <textarea
          value={textInput}
          onChange={handleTextChange}
          placeholder="Skriv din nätverksdokumentation, IP-adresser, VLAN-konfiguration eller lösenordsnotat..."
          rows={4}
          className={`w-full flex-1 bg-transparent resize-none outline-none font-sans text-xs leading-relaxed font-semibold ${theme.textColor}`}
        />

        {/* Quick Insert Templates Toolbar */}
        <div className="pt-1.5 border-t border-current/15 flex items-center justify-between gap-1 text-[10px]">
          <span className="font-mono font-extrabold opacity-70 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Mallar:
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleInsertTemplate('ip')}
              title="Infoga IP & Subnät mall"
              className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer`}
            >
              IP
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('vlan')}
              title="Infoga VLAN mall"
              className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer`}
            >
              VLAN
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('security')}
              title="Infoga Säkerhetsregel mall"
              className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer`}
            >
              Säk
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('todo')}
              title="Infoga Att Göra-lista mall"
              className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold font-mono transition ${theme.badgeBg} hover:scale-105 cursor-pointer`}
            >
              Check
            </button>
          </div>
        </div>

        {/* Footer timestamp */}
        {note.updatedAt && (
          <div className="text-[9px] font-mono opacity-60 flex items-center justify-end gap-1 pt-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span>Sparad {note.updatedAt}</span>
          </div>
        )}
      </div>
    </div>
  );
};
