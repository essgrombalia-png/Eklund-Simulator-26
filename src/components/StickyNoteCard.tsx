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
  SlidersHorizontal,
  Eye,
  Type,
  X,
  Edit2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  Check,
  CaseSensitive,
  CheckSquare,
  Square,
  ListTodo,
  FileText,
  CheckCheck,
  Boxes,
  ZoomIn,
} from 'lucide-react';
import {
  StickyNote,
  StickyNoteColor,
  StickyNoteFontFamily,
  StickyNoteFontWeight,
  StickyNoteFontStyle,
  StickyNoteTextAlign,
  StickyNoteTextDecoration,
  StickyNoteLineHeight,
  StickyNoteMode,
  StickyNoteTodoItem,
} from '../types';

export interface StickyNoteCardProps {
  note: StickyNote;
  zoom: number;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect?: (id: string, e?: React.MouseEvent | React.TouchEvent) => void;
  onUpdate: (note: StickyNote) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, noteId: string) => void;
  onGroupStickyNotes?: (noteIds: string[], groupName?: string) => void;
  onUngroupStickyNotes?: (groupIdOrNoteIds: string | string[]) => void;
  allNotes?: StickyNote[];
  selectedNoteIds?: string[];
  onSelectMultiple?: (ids: string[]) => void;
}

export const COLOR_STYLES: Record<
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

export const IMPORTANT_COLOR_STYLE = {
  cardBg: 'bg-gradient-to-b from-rose-950/98 via-red-950/98 to-rose-950/98 text-rose-50 border-2 border-red-500 backdrop-blur-xl',
  border: 'border-red-500',
  headerBg: 'bg-gradient-to-r from-red-900/95 via-rose-900/95 to-red-900/95 border-b border-red-500/80',
  titleColor: 'text-red-100 font-black drop-shadow-sm',
  textColor: 'text-rose-50 placeholder-rose-400/60 font-medium',
  accentDot: 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping',
  badgeBg: 'bg-red-600/40 text-red-100 border-red-400/70 font-black',
  shadow: 'shadow-[0_15px_35px_rgba(225,29,72,0.5)]',
  glow: 'ring-2 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.7)]',
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

export interface FontFamilyOption {
  key: StickyNoteFontFamily;
  label: string;
  name: string;
  css: string;
  className: string;
  sample: string;
}

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    key: 'handwriting',
    label: 'Handskrift',
    name: 'Caveat (Autentisk Post-it)',
    css: "'Caveat', cursive, sans-serif",
    className: 'font-caveat',
    sample: 'Handstil Post-it',
  },
  {
    key: 'sans',
    label: 'Sans',
    name: 'Plus Jakarta Sans (Modern & Ren)',
    css: "'Plus Jakarta Sans', sans-serif",
    className: 'font-jakarta',
    sample: 'Modern & Ren',
  },
  {
    key: 'mono',
    label: 'Mono',
    name: 'JetBrains Mono (IP, Terminal, Kod)',
    css: "'JetBrains Mono', monospace",
    className: 'font-jetbrains',
    sample: '192.168.1.1/24',
  },
  {
    key: 'space',
    label: 'Space',
    name: 'Space Grotesk (Teknisk arkitektur)',
    css: "'Space Grotesk', sans-serif",
    className: 'font-space',
    sample: 'Arkitektur',
  },
  {
    key: 'cyber',
    label: 'Cyber',
    name: 'Orbitron (Futuristisk & NOC)',
    css: "'Orbitron', sans-serif",
    className: 'font-orbitron',
    sample: 'NOC ONLINE',
  },
  {
    key: 'serif',
    label: 'Serif',
    name: 'Merriweather (Klassisk läsbar)',
    css: "'Merriweather', serif",
    className: 'font-merriweather',
    sample: 'Dokumentation',
  },
];

const FONT_SIZE_PRESETS = [
  { size: 9, label: '9', name: 'XS' },
  { size: 11, label: '11', name: 'S' },
  { size: 13, label: '13', name: 'Std' },
  { size: 15, label: '15', name: 'M' },
  { size: 18, label: '18', name: 'L' },
  { size: 22, label: '22', name: 'XL' },
  { size: 26, label: '26', name: '2XL' },
  { size: 32, label: '32', name: '3XL' },
];

export const TEXT_COLOR_PRESETS: { label: string; color?: string; hex?: string }[] = [
  { label: 'Auto (Tema)', color: undefined },
  { label: 'Kolsvart', color: '#0f172a', hex: '#0f172a' },
  { label: 'Snövit', color: '#ffffff', hex: '#ffffff' },
  { label: 'Cyber Cyan', color: '#06b6d4', hex: '#06b6d4' },
  { label: 'Smaragd', color: '#10b981', hex: '#10b981' },
  { label: 'Bärnsten', color: '#f59e0b', hex: '#f59e0b' },
  { label: 'Korallröd', color: '#f43f5e', hex: '#f43f5e' },
  { label: 'Neonlila', color: '#c084fc', hex: '#c084fc' },
];

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note,
  zoom,
  isSelected = false,
  isHighlighted = false,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onGroupStickyNotes,
  onUngroupStickyNotes,
  allNotes,
  selectedNoteIds,
  onSelectMultiple,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showGroupDrawer, setShowGroupDrawer] = useState(false);
  const [titleInput, setTitleInput] = useState(note.title || '');
  const [textInput, setTextInput] = useState(note.text || '');
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  const theme = note.isImportant
    ? IMPORTANT_COLOR_STYLE
    : (COLOR_STYLES[note.color] || COLOR_STYLES.yellow);
  const isYellow = !note.isImportant && note.color === 'yellow';

  const currentWidth = liveDimensions?.width ?? (note.width || 240);
  const currentHeight = liveDimensions?.height ?? (note.height || 180);
  const currentOpacity = typeof note.opacity === 'number' ? note.opacity : 1;

  // Hover expansion mode & scale for crystal clear readability:
  // Dynamically adapts based on canvas zoom so notes remain effortlessly legible even when zoomed out.
  const hoverMode = note.hoverExpandMode || 'auto';
  const isHoverExpansionActive = hoverMode !== 'off';
  const hoverScale =
    hoverMode === 'large'
      ? 1.18
      : zoom < 0.6
      ? 1.16
      : zoom < 0.85
      ? 1.11
      : 1.07;
  const isCurrentlyHoverExpanded = isHovered && !isResizing && isHoverExpansionActive;

  const handleSetHoverExpandMode = (mode: 'auto' | 'large' | 'off') => {
    onUpdate({
      ...note,
      hoverExpandMode: mode,
    });
  };

  // Typography state derived from note or defaults
  const currentFontSize = note.fontSize || 13;
  const currentTitleFontSize =
    note.titleFontSize || Math.min(24, Math.max(11, currentFontSize + 1));
  const currentFontFamily: StickyNoteFontFamily = note.fontFamily || 'sans';
  const currentFontWeight: StickyNoteFontWeight = note.fontWeight || 'semibold';
  const currentFontStyle: StickyNoteFontStyle = note.fontStyle || 'normal';
  const currentTextAlign: StickyNoteTextAlign = note.textAlign || 'left';
  const currentTextDecoration: StickyNoteTextDecoration = note.textDecoration || 'none';
  const currentLineHeight: StickyNoteLineHeight = note.lineHeight || 'normal';

  const selectedFontOption =
    FONT_FAMILY_OPTIONS.find((f) => f.key === currentFontFamily) || FONT_FAMILY_OPTIONS[1];

  const fontFamilyCss = selectedFontOption.css;

  const fontWeightNumeric =
    currentFontWeight === 'extrabold'
      ? 800
      : currentFontWeight === 'bold'
      ? 700
      : currentFontWeight === 'semibold'
      ? 600
      : currentFontWeight === 'medium'
      ? 500
      : 400;

  const lineHeightNumeric =
    currentLineHeight === 'tight' ? 1.25 : currentLineHeight === 'relaxed' ? 1.75 : 1.5;

  // Opacity
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

  // Mode & Todo List State
  const currentMode: StickyNoteMode = note.mode || 'text';
  const currentTodos: StickyNoteTodoItem[] = note.todos || [];
  const completedTodoCount = currentTodos.filter((t) => t.completed).length;
  const totalTodoCount = currentTodos.length;
  const todoProgressPercent =
    totalTodoCount > 0 ? Math.round((completedTodoCount / totalTodoCount) * 100) : 0;

  const [newTodoInput, setNewTodoInput] = useState('');
  const [focusTodoId, setFocusTodoId] = useState<string | null>(null);
  const todoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (focusTodoId && todoInputRefs.current[focusTodoId]) {
      todoInputRefs.current[focusTodoId]?.focus();
      setFocusTodoId(null);
    }
  }, [focusTodoId, note.todos]);

  // Helper to parse todos from raw text lines
  const parseTodosFromText = (text: string): StickyNoteTodoItem[] => {
    const lines = (text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      return [
        { id: `todo-${Date.now()}-1`, text: 'Konfigurera router och brandvägg', completed: false },
        { id: `todo-${Date.now()}-2`, text: 'Tilldela statiska IP-adresser & gateway', completed: false },
        { id: `todo-${Date.now()}-3`, text: 'Verifiera nätverkskablar och länkar', completed: false },
        { id: `todo-${Date.now()}-4`, text: 'Testa ping & DNS-uppslagning', completed: false },
      ];
    }
    return lines.map((line, idx) => {
      const isDone = /^(\[x\]|☑|✔️|✅)/i.test(line) || /^\s*-\s*\[x\]/i.test(line);
      const cleanText = line.replace(/^(\[[ xX]\]|\- \[[ xX]\]|•|\-|\*)\s*/, '').trim();
      return {
        id: `todo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        text: cleanText || line,
        completed: isDone,
      };
    });
  };

  const formatTodosToText = (todos: StickyNoteTodoItem[]): string => {
    return todos.map((t) => `${t.completed ? '[x]' : '[ ]'} ${t.text}`).join('\n');
  };

  const handleToggleMode = (targetMode?: StickyNoteMode) => {
    const nextMode: StickyNoteMode = targetMode || (currentMode === 'todo' ? 'text' : 'todo');
    if (nextMode === 'todo') {
      const existingTodos =
        note.todos && note.todos.length > 0 ? note.todos : parseTodosFromText(note.text);
      const formatted = formatTodosToText(existingTodos);
      setTextInput(formatted);
      onUpdate({
        ...note,
        mode: 'todo',
        todos: existingTodos,
        text: formatted,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      const todos = note.todos || [];
      const textVal = todos.length > 0 ? formatTodosToText(todos) : (note.text || '');
      setTextInput(textVal);
      onUpdate({
        ...note,
        mode: 'text',
        text: textVal,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  const handleToggleTodo = (todoId: string) => {
    const updated = currentTodos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    onUpdate({
      ...note,
      todos: updated,
      text: formatTodosToText(updated),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleUpdateTodoText = (todoId: string, newText: string) => {
    const updated = currentTodos.map((t) =>
      t.id === todoId ? { ...t, text: newText } : t
    );
    onUpdate({
      ...note,
      todos: updated,
      text: formatTodosToText(updated),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleAddTodo = (text = '', insertAfterId?: string) => {
    const newId = `todo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: StickyNoteTodoItem = {
      id: newId,
      text,
      completed: false,
    };
    let updated: StickyNoteTodoItem[];
    if (insertAfterId) {
      const idx = currentTodos.findIndex((t) => t.id === insertAfterId);
      if (idx !== -1) {
        updated = [
          ...currentTodos.slice(0, idx + 1),
          newItem,
          ...currentTodos.slice(idx + 1),
        ];
      } else {
        updated = [...currentTodos, newItem];
      }
    } else {
      updated = [...currentTodos, newItem];
    }
    setFocusTodoId(newId);
    onUpdate({
      ...note,
      mode: 'todo',
      todos: updated,
      text: formatTodosToText(updated),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    return newId;
  };

  const handleDeleteTodo = (todoId: string) => {
    const updated = currentTodos.filter((t) => t.id !== todoId);
    onUpdate({
      ...note,
      todos: updated,
      text: formatTodosToText(updated),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleTodoKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    todoId: string,
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTodo('', todoId);
    } else if (e.key === 'Backspace' && currentTodos[index]?.text === '') {
      e.preventDefault();
      if (currentTodos.length > 1) {
        handleDeleteTodo(todoId);
        const prevIndex = Math.max(0, index - 1);
        const prevId = currentTodos[prevIndex]?.id;
        if (prevId) {
          setFocusTodoId(prevId);
        }
      }
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const prevId = currentTodos[index - 1]?.id;
      if (prevId) {
        todoInputRefs.current[prevId]?.focus();
      }
    } else if (e.key === 'ArrowDown' && index < currentTodos.length - 1) {
      e.preventDefault();
      const nextId = currentTodos[index + 1]?.id;
      if (nextId) {
        todoInputRefs.current[nextId]?.focus();
      }
    }
  };

  const handleClearCompletedTodos = () => {
    const updated = currentTodos.filter((t) => !t.completed);
    onUpdate({
      ...note,
      todos: updated,
      text: formatTodosToText(updated),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleToggleAllTodos = () => {
    const allDone = currentTodos.length > 0 && currentTodos.every((t) => t.completed);
    const updated = currentTodos.map((t) => ({ ...t, completed: !allDone }));
    onUpdate({
      ...note,
      todos: updated,
      text: formatTodosToText(updated),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetColor = (color: StickyNoteColor) => {
    onUpdate({ ...note, color });
    setShowColorPicker(false);
  };

  // Typography Handlers
  const handleSetFontSize = (size: number) => {
    const clamped = Math.max(8, Math.min(48, Math.round(size)));
    onUpdate({
      ...note,
      fontSize: clamped,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleStepFontSize = (delta: number) => {
    const step = currentFontSize >= 22 ? 2 * delta : delta;
    handleSetFontSize(currentFontSize + step);
  };

  const handleSetTitleFontSize = (size: number) => {
    const clamped = Math.max(9, Math.min(32, Math.round(size)));
    onUpdate({
      ...note,
      titleFontSize: clamped,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetFontFamily = (family: StickyNoteFontFamily) => {
    onUpdate({
      ...note,
      fontFamily: family,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleToggleBold = () => {
    const nextWeight: StickyNoteFontWeight =
      currentFontWeight === 'bold' || currentFontWeight === 'extrabold' ? 'normal' : 'bold';
    onUpdate({
      ...note,
      fontWeight: nextWeight,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetFontWeight = (weight: StickyNoteFontWeight) => {
    onUpdate({
      ...note,
      fontWeight: weight,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleToggleItalic = () => {
    const nextStyle: StickyNoteFontStyle = currentFontStyle === 'italic' ? 'normal' : 'italic';
    onUpdate({
      ...note,
      fontStyle: nextStyle,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleToggleUnderline = () => {
    const nextDec: StickyNoteTextDecoration =
      currentTextDecoration === 'underline' ? 'none' : 'underline';
    onUpdate({
      ...note,
      textDecoration: nextDec,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleToggleStrikethrough = () => {
    const nextDec: StickyNoteTextDecoration =
      currentTextDecoration === 'line-through' ? 'none' : 'line-through';
    onUpdate({
      ...note,
      textDecoration: nextDec,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetTextAlign = (align: StickyNoteTextAlign) => {
    onUpdate({
      ...note,
      textAlign: align,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetLineHeight = (lineHeight: StickyNoteLineHeight) => {
    onUpdate({
      ...note,
      lineHeight,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSetTextColor = (color?: string) => {
    onUpdate({
      ...note,
      textColorCustom: color,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleResetTypography = () => {
    onUpdate({
      ...note,
      fontSize: 13,
      titleFontSize: 12,
      fontFamily: 'sans',
      fontWeight: 'semibold',
      fontStyle: 'normal',
      textAlign: 'left',
      textDecoration: 'none',
      lineHeight: 'normal',
      textColorCustom: undefined,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
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
    setIsHovered(false);
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
    if (type === 'todo') {
      const suggestedTitle =
        !titleInput.trim() || titleInput === 'Anteckning' ? 'Checklista' : titleInput;
      setTitleInput(suggestedTitle);

      const checklistItems: StickyNoteTodoItem[] = [
        { id: `todo-${Date.now()}-1`, text: 'Konfigurera brandvägg & NAT-regler', completed: false },
        { id: `todo-${Date.now()}-2`, text: 'Tilldela IP-adresser till routrar & switchar', completed: false },
        { id: `todo-${Date.now()}-3`, text: 'Testa ping mellan klienter och server', completed: false },
        { id: `todo-${Date.now()}-4`, text: 'Verifiera DNS-uppslag och gateway', completed: false },
        { id: `todo-${Date.now()}-5`, text: 'Säkerställ redundans för länkarna', completed: false },
      ];

      const textRepresentation = formatTodosToText(checklistItems);
      setTextInput(textRepresentation);

      onUpdate({
        ...note,
        mode: 'todo',
        title: suggestedTitle,
        todos: checklistItems,
        text: textRepresentation,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

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
    }

    const updated = (textInput ? textInput.trim() + '\n' : '') + snippet.trimStart();
    setTextInput(updated);

    const nextTitle =
      !titleInput.trim() || titleInput === 'Anteckning' ? suggestedTitle : titleInput;
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

  const isFontCustomized =
    (note.fontSize && note.fontSize !== 13) ||
    (note.fontFamily && note.fontFamily !== 'sans') ||
    note.fontStyle === 'italic' ||
    (note.fontWeight && note.fontWeight !== 'semibold') ||
    note.textDecoration === 'underline' ||
    note.textDecoration === 'line-through' ||
    (note.textAlign && note.textAlign !== 'left') ||
    note.textColorCustom !== undefined;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(note.id);
      }}
      onMouseEnter={() => {
        if (!isResizing) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        width: currentWidth,
        height: currentHeight,
        opacity: isCurrentlyHoverExpanded ? Math.max(0.96, currentOpacity) : currentOpacity,
        transform: isHighlighted
          ? 'scale(1.06)'
          : isCurrentlyHoverExpanded
          ? `scale(${hoverScale})`
          : isSelected
          ? 'scale(1.02)'
          : note.isImportant
          ? 'scale(1.005)'
          : 'scale(1)',
        zIndex: isHighlighted
          ? 60
          : isSelected
          ? 50
          : isCurrentlyHoverExpanded
          ? 45
          : note.isImportant
          ? 40
          : 20,
        transformOrigin: 'center center',
      }}
      className={`group rounded-2xl border ${theme.cardBg} ${theme.shadow} ${
        isHighlighted
          ? 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_50px_rgba(6,182,212,0.95)] animate-pulse'
          : isSelected
          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
          : isCurrentlyHoverExpanded
          ? 'ring-2 ring-amber-400/90 shadow-[0_24px_50px_rgba(0,0,0,0.5)]'
          : note.isImportant
          ? 'ring-2 ring-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.55)]'
          : note.groupId
          ? 'ring-1 ring-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
          : ''
      } ${
        isResizing ? 'ring-2 ring-cyan-400 shadow-2xl' : ''
      } transition-all duration-200 ease-out overflow-hidden flex flex-col select-none`}
    >
      {/* Tape / Important Pin Decorative Badge at Top */}
      {note.isImportant ? (
        <div
          title="Viktig anteckning – fäst överst med hög prioritet i z-index"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border border-red-300 shadow-[0_0_18px_rgba(239,68,68,0.9)] text-[9px] font-black uppercase tracking-wider z-40 animate-pulse pointer-events-none"
        >
          <Pin className="w-3 h-3 fill-white text-white rotate-45 shrink-0 drop-shadow" />
          <span>VIKTIGT</span>
        </div>
      ) : (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3.5 bg-white/40 backdrop-blur-sm rounded-sm border border-white/60 shadow-sm z-30 pointer-events-none" />
      )}

      {/* Header / Drag Bar */}
      <div
        onMouseDown={(e) => {
          onSelect?.(note.id, e);
          if (!note.isPinned) {
            setIsHovered(false);
            onDragStart(e, note.id);
          }
        }}
        onTouchStart={(e) => {
          onSelect?.(note.id, e);
          if (!note.isPinned) {
            setIsHovered(false);
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
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              titleInputRef.current?.focus();
            }}
            title="Klicka för att namnge anteckning i rubrikfältet"
            className={`text-xs font-extrabold truncate text-left cursor-pointer hover:underline flex items-center gap-1 min-w-0 ${theme.titleColor}`}
          >
            <span className="truncate" style={{ fontFamily: fontFamilyCss }}>
              {note.title?.trim() ? note.title : 'Anteckning (namnlös)'}
            </span>
            <Edit2 className="w-2.5 h-2.5 opacity-50 shrink-0" />
          </button>

          {note.isImportant && (
            <span
              title="Viktig / Prioriterad anteckning – hålls synlig överst i z-index"
              className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm border border-red-300"
            >
              <Pin className="w-2.5 h-2.5 fill-white" />
              <span>Viktig</span>
            </span>
          )}

          {note.groupId && (
            <span
              title={`Ingår i grupp: ${note.groupName || 'Grupp'} (flyttas som en enhet)`}
              className="px-1 py-0.5 rounded bg-black/20 text-current text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shrink-0 opacity-80"
            >
              <Boxes className="w-2.5 h-2.5" />
              <span className="max-w-[70px] truncate">{note.groupName || 'Grupp'}</span>
            </span>
          )}
        </div>

        {/* Note Controls */}
        <div
          className="flex items-center gap-1 shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Mode Toggle Button: Textanteckning vs Att-göra-lista (Checklista) */}
          <button
            type="button"
            onClick={() => handleToggleMode()}
            title={
              currentMode === 'todo'
                ? 'Växla till fritext-läge (Anteckning)'
                : 'Växla till Att-göra-lista (Checklista med kryssrutor)'
            }
            className={`px-1.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer font-bold text-[10px] ${
              currentMode === 'todo'
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 ring-1 ring-amber-700 shadow-sm'
                  : 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-300 shadow-sm'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {currentMode === 'todo' ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono text-[9px] leading-none">
                  {completedTodoCount}/{totalTodoCount}
                </span>
              </>
            ) : (
              <>
                <ListTodo className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[9px] leading-none hidden sm:inline">Att göra</span>
              </>
            )}
          </button>

          {/* Typography & Font Settings Button */}
          <button
            type="button"
            onClick={() => {
              setShowFontSettings(!showFontSettings);
              setShowSettings(false);
              setShowSizePicker(false);
              setShowColorPicker(false);
            }}
            title="Typsnitt & textstorlek (Justera font, storlek, fetstil, kursiv, radavstånd, färg m.m.)"
            className={`p-1 rounded-md transition flex items-center gap-0.5 cursor-pointer ${
              showFontSettings
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 font-bold ring-1 ring-amber-700'
                  : 'bg-cyan-500/50 text-white ring-1 ring-cyan-300'
                : isFontCustomized
                ? isYellow
                  ? 'bg-amber-400/90 text-amber-950 font-black ring-1 ring-amber-600/70 shadow-sm'
                  : 'bg-cyan-500/30 text-cyan-200 ring-1 ring-cyan-400/70 shadow-sm'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[8.5px] font-mono font-bold leading-none pr-0.5">
              {currentFontSize}px
            </span>
          </button>

          {/* Settings / Opacity Menu Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowSettings(!showSettings);
              setShowFontSettings(false);
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

          {/* Quick Note Box Size Control Button */}
          <button
            type="button"
            onClick={() => {
              setShowSizePicker(!showSizePicker);
              setShowFontSettings(false);
              setShowColorPicker(false);
              setShowSettings(false);
              setShowGroupDrawer(false);
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

          {/* Grouping / Group Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setShowGroupDrawer(!showGroupDrawer);
              setShowColorPicker(false);
              setShowFontSettings(false);
              setShowSizePicker(false);
              setShowSettings(false);
            }}
            title={
              note.groupId
                ? `Ingår i grupp: ${note.groupName || 'Grupp'} (Hantera gruppering)`
                : 'Gruppera Post-it-lappar (Klicka för 1-klicks gruppering med närliggande)'
            }
            className={`p-1 rounded-md transition flex items-center gap-0.5 cursor-pointer ${
              showGroupDrawer || note.groupId
                ? isYellow
                  ? 'bg-amber-400 text-amber-950 font-bold ring-1 ring-amber-700'
                  : 'bg-emerald-500/50 text-emerald-100 ring-1 ring-emerald-300'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950'
                : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
          </button>

          {/* Color Selector Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowFontSettings(false);
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

          {/* Important / Priority Flag Button */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !note.isImportant;
              onUpdate({
                ...note,
                isImportant: nextVal,
                color: nextVal ? 'rose' : note.color,
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            }}
            title={
              note.isImportant
                ? 'Viktig anteckning (Aktiv! Röd färgskala, fäst överst i z-index. Klicka för att ta bort)'
                : 'Markera som Viktig (Ändrar färgskala till rött tema, sätter Pin-ikon & placerar överst i z-index)'
            }
            className={`p-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
              note.isImportant
                ? 'bg-red-600 text-white font-black shadow-[0_0_12px_rgba(239,68,68,0.9)] ring-1 ring-red-300'
                : isYellow
                ? 'hover:bg-amber-400/90 text-amber-950 hover:text-red-700'
                : 'hover:bg-red-500/20 text-slate-300 hover:text-red-400'
            }`}
          >
            <Pin
              className={`w-3.5 h-3.5 transition-transform ${
                note.isImportant ? 'fill-white text-white rotate-12 scale-110' : 'text-slate-400'
              }`}
            />
            <span className="text-[8.5px] font-black uppercase tracking-wider pr-0.5">
              {note.isImportant ? 'Viktig' : 'Prio'}
            </span>
          </button>

          {/* Pin / Unpin Button (Lås fast position) */}
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

      {/* Typography & Font Settings Drawer */}
      {showFontSettings && (
        <div
          className="p-2.5 max-h-64 overflow-y-auto custom-scrollbar border-b border-current/20 bg-black/45 backdrop-blur-md flex flex-col gap-2.5 animate-fade-in text-[10px]"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Drawer Header & Quick Reset */}
          <div className="flex items-center justify-between gap-1.5 border-b border-white/15 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="p-1 rounded bg-white/10 shrink-0">
                <Type className="w-3.5 h-3.5 text-cyan-300" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-mono font-extrabold text-[10.5px] leading-tight text-white flex items-center gap-1">
                  Typsnitt & Font
                </span>
                <span className="font-mono text-[8.5px] opacity-75 truncate">
                  {selectedFontOption.label} • {currentFontSize}px
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetTypography}
                title="Återställ alla fontinställningar till standard"
                className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[9px] flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Återställ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFontSettings(false)}
                title="Stäng fontpanel"
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 1. Font Size Control (Slider + Presets + Steppers) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold opacity-85 text-[10px] flex items-center gap-1">
                <span>Textstorlek (Font Size):</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepFontSize(-1)}
                  title="Minska fontstorlek med 1px (A-)"
                  className="w-5 h-5 rounded bg-white/15 hover:bg-white/25 text-white font-mono font-black flex items-center justify-center cursor-pointer transition active:scale-95"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span
                  className={`font-mono font-black px-1.5 py-0.5 rounded text-[10px] min-w-[36px] text-center ${
                    isYellow
                      ? 'bg-amber-400 text-amber-950 font-bold'
                      : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                  }`}
                >
                  {currentFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => handleStepFontSize(1)}
                  title="Öka fontstorlek med 1px (A+)"
                  className="w-5 h-5 rounded bg-white/15 hover:bg-white/25 text-white font-mono font-black flex items-center justify-center cursor-pointer transition active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-2">
              <span className="font-mono opacity-60 text-[8.5px] shrink-0">8px</span>
              <input
                type="range"
                min="8"
                max="36"
                step="1"
                value={currentFontSize}
                onChange={(e) => handleSetFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title={`Dra för att ändra textstorlek (${currentFontSize}px)`}
              />
              <span className="font-mono opacity-60 text-[8.5px] shrink-0">36px</span>
            </div>

            {/* Size Presets */}
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              <span className="font-mono text-[9px] opacity-70 mr-0.5 shrink-0">Snabbval:</span>
              {FONT_SIZE_PRESETS.map((p) => {
                const isSelected = currentFontSize === p.size;
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => handleSetFontSize(p.size)}
                    title={`${p.name} (${p.size}px)`}
                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-sm scale-105 font-black'
                        : isYellow
                        ? 'bg-amber-400/60 hover:bg-amber-400 text-amber-950'
                        : 'bg-white/15 hover:bg-white/30 text-white'
                    }`}
                  >
                    {p.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Family Selection */}
          <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/15">
            <span className="font-mono font-bold opacity-85 text-[10px]">Typsnittsfamilj (Font):</span>
            <div className="grid grid-cols-2 gap-1">
              {FONT_FAMILY_OPTIONS.map((f) => {
                const isSelected = currentFontFamily === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => handleSetFontFamily(f.key)}
                    title={f.name}
                    className={`p-1.5 rounded-lg border text-left flex flex-col gap-0.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-950 border-white shadow-md scale-[1.02]'
                        : isYellow
                        ? 'bg-amber-400/40 hover:bg-amber-400/80 text-amber-950 border-amber-500/40'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-[9.5px] truncate">{f.label}</span>
                      {isSelected && <Check className="w-2.5 h-2.5 shrink-0 text-cyan-600 font-bold" />}
                    </div>
                    <span
                      style={{ fontFamily: f.css }}
                      className="text-xs truncate opacity-90 leading-tight"
                    >
                      {f.sample}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Formatting & Styles (Bold, Italic, Underline, Strikethrough, Align, LineHeight) */}
          <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/15">
            <span className="font-mono font-bold opacity-85 text-[10px]">Stil & Formatering:</span>

            <div className="flex items-center justify-between gap-1 flex-wrap">
              {/* Bold, Italic, Underline, Strikethrough group */}
              <div className="flex items-center gap-0.5 bg-black/25 p-0.5 rounded-lg border border-white/15">
                {/* Bold */}
                <button
                  type="button"
                  onClick={handleToggleBold}
                  title="Fetstil / Bold (Ctrl+B)"
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                    currentFontWeight === 'bold' || currentFontWeight === 'extrabold'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  onClick={handleToggleItalic}
                  title="Kursiv / Italic (Ctrl+I)"
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer ${
                    currentFontStyle === 'italic'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  onClick={handleToggleUnderline}
                  title="Understruken / Underline"
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer ${
                    currentTextDecoration === 'underline'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                {/* Strikethrough */}
                <button
                  type="button"
                  onClick={handleToggleStrikethrough}
                  title="Genomstruken (Perfekt för klara uppgifter / checklistor)"
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer ${
                    currentTextDecoration === 'line-through'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Alignment group */}
              <div className="flex items-center gap-0.5 bg-black/25 p-0.5 rounded-lg border border-white/15">
                <button
                  type="button"
                  onClick={() => handleSetTextAlign('left')}
                  title="Vänsterjustera text"
                  className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                    currentTextAlign === 'left'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTextAlign('center')}
                  title="Centrera text"
                  className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                    currentTextAlign === 'center'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTextAlign('right')}
                  title="Högerjustera text"
                  className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                    currentTextAlign === 'right'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Font Weight & Line Height chips */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Font Weight selector */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] opacity-75">Tjocklek (Weight):</span>
                <div className="flex items-center gap-1">
                  {(['normal', 'semibold', 'bold', 'extrabold'] as StickyNoteFontWeight[]).map(
                    (w) => {
                      const isSel = currentFontWeight === w;
                      const labels: Record<StickyNoteFontWeight, string> = {
                        normal: 'Vanlig',
                        medium: 'Medel',
                        semibold: 'Halvfet',
                        bold: 'Fet',
                        extrabold: 'Max',
                      };
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleSetFontWeight(w)}
                          title={`Tjocklek: ${labels[w]}`}
                          className={`flex-1 py-0.5 rounded text-[8.5px] font-mono transition cursor-pointer text-center ${
                            isSel
                              ? 'bg-white text-slate-950 font-black shadow-sm'
                              : isYellow
                              ? 'bg-amber-400/50 hover:bg-amber-400 text-amber-950'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {labels[w]}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Line Height selector */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] opacity-75">Radavstånd:</span>
                <div className="flex items-center gap-1">
                  {(['tight', 'normal', 'relaxed'] as StickyNoteLineHeight[]).map((lh) => {
                    const isSel = currentLineHeight === lh;
                    const labels: Record<StickyNoteLineHeight, string> = {
                      tight: 'Tätt',
                      normal: 'Normal',
                      relaxed: 'Luftigt',
                    };
                    return (
                      <button
                        key={lh}
                        type="button"
                        onClick={() => handleSetLineHeight(lh)}
                        title={`Radavstånd: ${labels[lh]}`}
                        className={`flex-1 py-0.5 rounded text-[8.5px] font-mono transition cursor-pointer text-center ${
                          isSel
                            ? 'bg-white text-slate-950 font-black shadow-sm'
                            : isYellow
                            ? 'bg-amber-400/50 hover:bg-amber-400 text-amber-950'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {labels[lh]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Text Color Customization */}
          <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/15">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold opacity-85 text-[10px]">
                Textfärg & Kontrast:
              </span>
              {note.textColorCustom && (
                <button
                  type="button"
                  onClick={() => handleSetTextColor(undefined)}
                  className="text-[8.5px] font-mono text-cyan-300 hover:underline cursor-pointer"
                >
                  Återställ till tema
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {TEXT_COLOR_PRESETS.map((p) => {
                const isSelected =
                  p.color === undefined ? !note.textColorCustom : note.textColorCustom === p.color;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSetTextColor(p.color)}
                    title={p.label}
                    className={`h-5 px-1.5 rounded flex items-center gap-1 border transition cursor-pointer text-[8.5px] font-mono font-bold ${
                      isSelected
                        ? 'ring-2 ring-white border-white scale-105 shadow-sm'
                        : 'border-white/20 opacity-85 hover:opacity-100 hover:scale-105'
                    } ${
                      p.color ? '' : isYellow ? 'bg-amber-950 text-amber-100' : 'bg-white/20 text-white'
                    }`}
                    style={
                      p.color
                        ? {
                            backgroundColor: p.color,
                            color: p.color === '#ffffff' || p.color === '#06b6d4' || p.color === '#10b981' || p.color === '#f59e0b' ? '#0f172a' : '#ffffff',
                          }
                        : undefined
                    }
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Title Font Size */}
          <div className="flex flex-col gap-1 pt-1.5 border-t border-white/15">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold opacity-85 text-[10px]">
                Rubrikstorlek (Title):
              </span>
              <span className="font-mono font-extrabold text-[9.5px] opacity-80">
                {currentTitleFontSize}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono opacity-60 text-[8.5px]">10px</span>
              <input
                type="range"
                min="10"
                max="26"
                step="1"
                value={currentTitleFontSize}
                onChange={(e) => handleSetTitleFontSize(Number(e.target.value))}
                className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title={`Rubrikstorlek (${currentTitleFontSize}px)`}
              />
              <span className="font-mono opacity-60 text-[8.5px]">26px</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings & Opacity Drawer */}
      {showSettings && (
        <div
          className="p-2.5 border-b border-current/20 bg-black/35 backdrop-blur-md flex flex-col gap-2 animate-fade-in text-[10px]"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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

          {/* Hover Expansion Readability Setting */}
          <div className="flex flex-col gap-1.5 pt-1.5 border-t border-current/15">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold opacity-85 flex items-center gap-1 text-[10px]">
                <ZoomIn className="w-3 h-3 text-amber-400" /> Hover-förstoring (Läsbarhet):
              </span>
              <span className="font-mono font-extrabold text-[9.5px] opacity-80">
                {hoverMode === 'off'
                  ? 'Avaktiverad'
                  : hoverMode === 'large'
                  ? 'Extra stor (+18%)'
                  : `Auto (+${Math.round((hoverScale - 1) * 100)}%)`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { key: 'auto', label: 'Auto (Zoom)', desc: 'Skalar +7% till +16% anpassat efter zoom' },
                { key: 'large', label: 'Extra stor', desc: '+18% fast förstoring' },
                { key: 'off', label: 'Av', desc: 'Ingen förstoring vid hover' },
              ].map((opt) => {
                const isSelected = (note.hoverExpandMode || 'auto') === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSetHoverExpandMode(opt.key as any)}
                    title={opt.desc}
                    className={`py-1 px-1 rounded text-center font-bold text-[9px] transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-sm scale-[1.02]'
                        : isYellow
                        ? 'bg-amber-400/40 hover:bg-amber-400/80 text-amber-950'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <div>{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Size Adjuster Drawer */}
      {showSizePicker && (
        <div
          className="p-2 border-b border-current/20 bg-black/25 backdrop-blur-md flex items-center justify-between gap-1.5 animate-fade-in text-[10px]"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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
          onTouchStart={(e) => e.stopPropagation()}
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

      {/* Group Drawer Panel */}
      {showGroupDrawer && (
        <div
          className="p-2.5 border-b border-current/20 bg-slate-950/95 text-slate-100 backdrop-blur-md animate-fade-in text-[11px] space-y-2"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Post-it Gruppering</span>
            </span>
            {note.groupId && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] border border-emerald-500/40 font-mono">
                {note.groupName || 'I grupp'}
              </span>
            )}
          </div>

          {note.groupId ? (
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-300">
                Denna lapp ingår i en grupp och rör sig tillsammans med alla andra lappar i gruppen.
              </div>
              <div className="flex gap-1.5">
                {allNotes && onSelectMultiple && (
                  <button
                    type="button"
                    onClick={() => {
                      const groupMembers = allNotes.filter((n) => n.groupId === note.groupId).map((n) => n.id);
                      onSelectMultiple(groupMembers);
                    }}
                    className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[10px] font-bold border border-slate-700 cursor-pointer"
                  >
                    Välj alla i gruppen
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (onUngroupStickyNotes && note.groupId) {
                      onUngroupStickyNotes(note.groupId);
                      setShowGroupDrawer(false);
                    }
                  }}
                  className="flex-1 py-1 px-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-lg text-[10px] font-bold border border-rose-800/80 cursor-pointer"
                >
                  Dela upp grupp
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {selectedNoteIds && selectedNoteIds.length >= 2 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onGroupStickyNotes) {
                      onGroupStickyNotes(selectedNoteIds);
                      setShowGroupDrawer(false);
                    }
                  }}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Gruppera alla {selectedNoteIds.length} markerade lappar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onGroupStickyNotes && allNotes) {
                      const nearby = allNotes.filter((n) => {
                        if (n.id === note.id) return false;
                        const dx = n.x - note.x;
                        const dy = n.y - note.y;
                        return Math.hypot(dx, dy) < 400;
                      });
                      const idsToGroup = [note.id, ...nearby.map((n) => n.id)];
                      if (idsToGroup.length >= 2) {
                        onGroupStickyNotes(idsToGroup);
                      } else {
                        const allIds = allNotes.map((n) => n.id);
                        if (allIds.length >= 2) {
                          onGroupStickyNotes(allIds);
                        }
                      }
                      setShowGroupDrawer(false);
                    }
                  }}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>⚡ Gruppera med närliggande lappar</span>
                </button>
              )}

              <div className="text-[9px] text-amber-300/90 flex items-center gap-1 font-sans pt-0.5">
                <span>💡 Tips: Håll [Shift] och klicka på flera lappar för att markera dem.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Body (Rubrikfält & Text Area) */}
      <div
        className="p-2.5 flex-1 flex flex-col gap-2 min-h-0 relative"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
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
            style={{
              fontFamily: fontFamilyCss,
              fontSize: `${currentTitleFontSize}px`,
              fontWeight: 700,
              fontStyle: currentFontStyle,
              textAlign: currentTextAlign,
              color: note.textColorCustom || undefined,
            }}
            className={`w-full bg-transparent outline-none tracking-tight ${
              note.textColorCustom ? '' : theme.titleColor
            } placeholder:opacity-50`}
          />
          {titleInput ? (
            <button
              type="button"
              onClick={() => {
                setTitleInput('');
                onUpdate({
                  ...note,
                  title: '',
                  updatedAt: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
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

        {/* Quick Typography Controls Strip: Font Family (Mono vs Sans vs Hand), Alignment (Left/Center/Right), Text Color */}
        <div className="px-2.5 py-1 flex items-center justify-between gap-1 border-b border-current/15 bg-black/10 text-[10px] shrink-0">
          {/* Teckensnittsfamilj: Sans vs Monospace vs Handskrift */}
          <div className="flex items-center gap-0.5 bg-black/20 p-0.5 rounded-md border border-current/15">
            <button
              type="button"
              onClick={() => handleSetFontFamily('sans')}
              title="Sans-serif: Plus Jakarta Sans (Modern & Ren)"
              className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold transition cursor-pointer ${
                currentFontFamily === 'sans'
                  ? isYellow ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-white text-slate-950 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Sans
            </button>
            <button
              type="button"
              onClick={() => handleSetFontFamily('mono')}
              title="Monospace: JetBrains Mono (Perfekt för IP, Subnät & Kod)"
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-0.5 ${
                currentFontFamily === 'mono'
                  ? isYellow ? 'bg-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-300' : 'bg-white text-slate-950 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-[8px]">&gt;_</span>
              <span>Mono</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetFontFamily('handwriting')}
              title="Handskrift: Caveat (Klassisk Post-it stil)"
              className={`px-1.5 py-0.5 rounded text-[9px] font-caveat font-bold transition cursor-pointer ${
                currentFontFamily === 'handwriting'
                  ? isYellow ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-white text-slate-950 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Hand
            </button>
          </div>

          {/* Textjustering: Vänster, Center, Höger */}
          <div className="flex items-center gap-0.5 bg-black/20 p-0.5 rounded-md border border-current/15">
            <button
              type="button"
              onClick={() => handleSetTextAlign('left')}
              title="Vänsterjustera text"
              className={`p-1 rounded transition cursor-pointer ${
                currentTextAlign === 'left'
                  ? isYellow ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-white text-slate-950 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <AlignLeft className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetTextAlign('center')}
              title="Centrera text"
              className={`p-1 rounded transition cursor-pointer ${
                currentTextAlign === 'center'
                  ? isYellow ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-white text-slate-950 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <AlignCenter className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetTextAlign('right')}
              title="Högerjustera text"
              className={`p-1 rounded transition cursor-pointer ${
                currentTextAlign === 'right'
                  ? isYellow ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-white text-slate-950 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <AlignRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Textfärg: Snabbpalett & Färgväljare */}
          <div className="flex items-center gap-1">
            {[
              { hex: undefined, label: 'Auto' },
              { hex: '#0f172a', label: 'Kolsvart' },
              { hex: '#ffffff', label: 'Snövit' },
              { hex: '#06b6d4', label: 'Cyber Cyan' },
              { hex: '#10b981', label: 'Smaragdgrön' },
              { hex: '#f59e0b', label: 'Bärnsten' },
            ].map((c, i) => {
              const isSel = c.hex === undefined ? !note.textColorCustom : note.textColorCustom === c.hex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSetTextColor(c.hex)}
                  title={`Textfärg: ${c.label}`}
                  className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${
                    isSel
                      ? 'ring-1.5 ring-white scale-110 shadow-sm'
                      : 'border-white/30 opacity-75 hover:opacity-100'
                  } ${c.hex === undefined ? (isYellow ? 'bg-amber-950' : 'bg-slate-300') : ''}`}
                  style={c.hex ? { backgroundColor: c.hex } : undefined}
                />
              );
            })}

            {/* Custom native color picker */}
            <label
              title="Välj anpassad textfärg"
              className="relative w-3.5 h-3.5 rounded-full border border-white/40 bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 cursor-pointer flex items-center justify-center shrink-0 overflow-hidden hover:scale-110 transition shadow-sm"
            >
              <input
                type="color"
                value={note.textColorCustom || '#f59e0b'}
                onChange={(e) => handleSetTextColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>

        {/* Content Body: Todo Checklist Mode OR Text Area Mode */}
        {currentMode === 'todo' ? (
          <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
            {/* Checklist Progress & Quick Actions Header */}
            <div className="flex items-center justify-between gap-1 px-1 py-0.5 text-[10px] shrink-0 border-b border-current/10">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono font-bold text-[10px] shrink-0">
                  {completedTodoCount} av {totalTodoCount} klara ({todoProgressPercent}%)
                </span>
                <div className="w-16 h-1.5 bg-black/20 rounded-full overflow-hidden shrink-0 border border-current/20">
                  <div
                    className={`h-full transition-all duration-300 ${
                      todoProgressPercent === 100
                        ? 'bg-emerald-400'
                        : isYellow
                        ? 'bg-amber-600'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${todoProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Toggle All Checkboxes */}
                <button
                  type="button"
                  onClick={handleToggleAllTodos}
                  title={
                    completedTodoCount === totalTodoCount && totalTodoCount > 0
                      ? 'Avmarkera alla punkter'
                      : 'Bocka av alla punkter'
                  }
                  className="p-1 rounded hover:bg-black/20 transition cursor-pointer flex items-center gap-0.5 text-[9px] opacity-80 hover:opacity-100"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {completedTodoCount === totalTodoCount && totalTodoCount > 0 ? 'Återställ' : 'Bocka alla'}
                  </span>
                </button>

                {/* Clear Completed */}
                {completedTodoCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompletedTodos}
                    title="Rensa alla avklarade punkter"
                    className="p-1 rounded hover:bg-black/20 text-rose-500 hover:text-rose-600 transition cursor-pointer flex items-center gap-0.5 text-[9px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Rensa klara</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Todo Items List */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-0.5">
              {currentTodos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center opacity-60">
                  <ListTodo className="w-6 h-6 mb-1 opacity-40" />
                  <p className="text-xs font-semibold">Inga punkter ännu</p>
                  <button
                    type="button"
                    onClick={() => handleAddTodo('Ny uppgift')}
                    className="mt-2 px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lägg till första punkten</span>
                  </button>
                </div>
              ) : (
                currentTodos.map((todo, index) => (
                  <div
                    key={todo.id}
                    className={`group/todo flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-all ${
                      todo.completed
                        ? 'bg-black/10'
                        : 'hover:bg-black/15 focus-within:bg-black/20'
                    }`}
                  >
                    {/* Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id)}
                      title={todo.completed ? 'Avmarkera uppgift' : 'Bocka av och stryk över uppgift'}
                      className={`shrink-0 p-0.5 rounded transition-transform cursor-pointer active:scale-90 ${
                        todo.completed
                          ? 'text-emerald-500 hover:text-emerald-400'
                          : isYellow
                          ? 'text-amber-950/70 hover:text-amber-950'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {todo.completed ? (
                        <CheckSquare className="w-4 h-4 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-4 h-4 opacity-70 hover:opacity-100" />
                      )}
                    </button>

                    {/* Todo Text Input with dynamic Strikethrough when completed */}
                    <input
                      ref={(el) => (todoInputRefs.current[todo.id] = el)}
                      type="text"
                      value={todo.text}
                      onChange={(e) => handleUpdateTodoText(todo.id, e.target.value)}
                      onKeyDown={(e) => handleTodoKeyDown(e, todo.id, index)}
                      placeholder="Beskriv punkt (Tryck Enter för nästa)..."
                      style={{
                        fontFamily: fontFamilyCss,
                        fontSize: `${currentFontSize}px`,
                        fontWeight: fontWeightNumeric,
                        fontStyle: todo.completed ? 'italic' : currentFontStyle,
                        textDecoration: todo.completed
                          ? 'line-through'
                          : currentTextDecoration,
                        textAlign: currentTextAlign,
                        color: note.textColorCustom || undefined,
                      }}
                      className={`flex-1 bg-transparent outline-none min-w-0 transition-opacity ${
                        todo.completed
                          ? 'opacity-55 line-through italic'
                          : 'opacity-100'
                      } ${note.textColorCustom ? '' : theme.textColor}`}
                    />

                    {/* Delete item button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTodo(todo.id)}
                      title="Ta bort denna punkt"
                      className="opacity-0 group-hover/todo:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-black/20 text-rose-500 transition cursor-pointer shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}

              {/* Quick Inline New Item Row at bottom */}
              <div className="pt-1 flex items-center gap-1.5 px-1.5">
                <button
                  type="button"
                  onClick={() => handleAddTodo('')}
                  title="Lägg till ny punkt i checklistan"
                  className={`w-full py-1 px-2 rounded-lg border border-dashed border-current/30 hover:border-current/60 hover:bg-black/15 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer opacity-80 hover:opacity-100 active:scale-98`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lägg till punkt</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Text Area with full typography styles applied */
          <textarea
            value={textInput}
            onChange={handleTextChange}
            onFocus={() => onSelect?.(note.id)}
            onClick={() => onSelect?.(note.id)}
            placeholder="Skriv anteckningar, IP-planering, VLAN, checklistor..."
            style={{
              fontFamily: fontFamilyCss,
              fontSize: `${currentFontSize}px`,
              fontWeight: fontWeightNumeric,
              fontStyle: currentFontStyle,
              textDecoration: currentTextDecoration,
              textAlign: currentTextAlign,
              lineHeight: lineHeightNumeric,
              color: note.textColorCustom || undefined,
            }}
            className={`w-full flex-1 bg-transparent resize-none outline-none custom-scrollbar ${
              note.textColorCustom ? '' : theme.textColor
            }`}
          />
        )}

        {/* Bottom Toolbar: Templates, Quick Font Stepper & Dimension Indicator */}
        <div className="pt-1.5 border-t border-current/15 flex items-center justify-between gap-1 text-[10px] shrink-0">
          {/* Quick Insert Templates */}
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

          {/* Quick Font Size Controls & Live Dimension/Timestamp */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick 1-tap font size steppers */}
            <div className="flex items-center gap-0.5 bg-black/20 px-1 py-0.5 rounded border border-current/15">
              <button
                type="button"
                onClick={() => handleStepFontSize(-1)}
                title="Minska textstorlek (A-)"
                className="w-4 h-4 rounded hover:bg-current/10 flex items-center justify-center font-mono font-black text-[9px] transition cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFontSettings(!showFontSettings);
                  setShowSettings(false);
                  setShowSizePicker(false);
                  setShowColorPicker(false);
                }}
                title={`Klicka för typsnittsinställningar (${selectedFontOption.label}, ${currentFontSize}px)`}
                className="font-mono font-black text-[9px] px-1 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{currentFontSize}px</span>
              </button>
              <button
                type="button"
                onClick={() => handleStepFontSize(1)}
                title="Öka textstorlek (A+)"
                className="w-4 h-4 rounded hover:bg-current/10 flex items-center justify-center font-mono font-black text-[9px] transition cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Timestamp / Live Dimension / Hover Readability Mode Indicator */}
            <div className="text-[9px] font-mono opacity-70 flex items-center justify-end gap-1">
              {isResizing && liveDimensions ? (
                <span className="font-bold text-cyan-400 bg-black/40 px-1 rounded">
                  {liveDimensions.width} × {liveDimensions.height}px
                </span>
              ) : isCurrentlyHoverExpanded ? (
                <span
                  className="font-bold text-amber-300 bg-black/50 px-1.5 py-0.5 rounded border border-amber-400/50 flex items-center gap-1 shadow-sm"
                  title="Hover-expanderad för förbättrad läsbarhet"
                >
                  <Eye className="w-2.5 h-2.5 text-amber-400" />
                  <span>+{Math.round((hoverScale - 1) * 100)}%</span>
                </span>
              ) : (
                note.updatedAt && (
                  <span className="flex items-center gap-0.5 opacity-80" title={`Senast uppdaterad: ${note.updatedAt}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{note.updatedAt}</span>
                  </span>
                )
              )}
            </div>
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
