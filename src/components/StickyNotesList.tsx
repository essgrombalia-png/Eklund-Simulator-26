import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Pin,
  Target,
  Plus,
  Trash2,
  Edit3,
  Filter,
  CheckSquare,
  ListTodo,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { StickyNote, StickyNoteColor } from '../types';

interface StickyNotesListProps {
  stickyNotes: StickyNote[];
  selectedStickyNoteId?: string | null;
  selectedStickyNoteIds?: string[];
  onFocusNote: (id: string) => void;
  onSelectNote?: (id: string) => void;
  onEditNote?: (note: StickyNote) => void;
  onUpdateNote?: (note: StickyNote) => void;
  onDeleteNote?: (id: string) => void;
  onAddStickyNote?: () => void;
  onOpenFloatingWindow?: () => void;
  isFloatingMode?: boolean;
  onClose?: () => void;
}

const COLOR_BADGES: Record<StickyNoteColor, { label: string; dot: string; border: string; bg: string }> = {
  yellow: { label: 'Gul', dot: 'bg-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/10 text-amber-300' },
  cyan: { label: 'Cyan', dot: 'bg-cyan-400', border: 'border-cyan-400/40', bg: 'bg-cyan-400/10 text-cyan-300' },
  emerald: { label: 'Grön', dot: 'bg-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-400/10 text-emerald-300' },
  rose: { label: 'Röd/Rosa', dot: 'bg-rose-400', border: 'border-rose-400/40', bg: 'bg-rose-400/10 text-rose-300' },
  purple: { label: 'Lila', dot: 'bg-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10 text-purple-300' },
  blue: { label: 'Blå', dot: 'bg-blue-400', border: 'border-blue-400/40', bg: 'bg-blue-400/10 text-blue-300' },
  amber: { label: 'Bärnsten', dot: 'bg-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/10 text-amber-300' },
};

export const StickyNotesList: React.FC<StickyNotesListProps> = ({
  stickyNotes,
  selectedStickyNoteId,
  selectedStickyNoteIds = [],
  onFocusNote,
  onSelectNote,
  onEditNote,
  onUpdateNote,
  onDeleteNote,
  onAddStickyNote,
  onOpenFloatingWindow,
  isFloatingMode = false,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'important' | 'todo' | 'text' | 'grouped'>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<StickyNoteColor | 'all'>('all');
  const [sortBy, setSortBy] = useState<'important_first' | 'newest' | 'oldest' | 'alphabetical'>('important_first');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return stickyNotes
      .filter((note) => {
        // Search filter
        if (query) {
          const matchTitle = note.title?.toLowerCase().includes(query);
          const matchText = note.text?.toLowerCase().includes(query);
          const matchAuthor = note.author?.toLowerCase().includes(query);
          const matchGroup = note.groupName?.toLowerCase().includes(query);
          const matchTodos = note.todos?.some((t) => t.text.toLowerCase().includes(query));

          if (!matchTitle && !matchText && !matchAuthor && !matchGroup && !matchTodos) {
            return false;
          }
        }

        // Category filter
        if (filterCategory === 'important' && !note.isImportant) return false;
        if (filterCategory === 'todo' && note.mode !== 'todo') return false;
        if (filterCategory === 'text' && note.mode === 'todo') return false;
        if (filterCategory === 'grouped' && !note.groupId) return false;

        // Color filter
        if (selectedColorFilter !== 'all' && note.color !== selectedColorFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'important_first') {
          if (a.isImportant && !b.isImportant) return -1;
          if (!a.isImportant && b.isImportant) return 1;
        }

        if (sortBy === 'alphabetical') {
          const titleA = (a.title || a.text || '').toLowerCase();
          const titleB = (b.title || b.text || '').toLowerCase();
          return titleA.localeCompare(titleB);
        }

        if (sortBy === 'oldest') {
          return (a.id > b.id ? 1 : -1);
        }

        // Default or newest
        return (a.id < b.id ? 1 : -1);
      });
  }, [stickyNotes, searchQuery, filterCategory, selectedColorFilter, sortBy]);

  // Counts for filters
  const counts = useMemo(() => {
    return {
      total: stickyNotes.length,
      important: stickyNotes.filter((n) => n.isImportant).length,
      todo: stickyNotes.filter((n) => n.mode === 'todo').length,
      text: stickyNotes.filter((n) => n.mode !== 'todo').length,
      grouped: stickyNotes.filter((n) => !!n.groupId).length,
    };
  }, [stickyNotes]);

  const handleToggleImportant = (note: StickyNote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateNote) return;
    const nextVal = !note.isImportant;
    onUpdateNote({
      ...note,
      isImportant: nextVal,
      color: nextVal ? 'rose' : note.color === 'rose' ? 'yellow' : note.color,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Search Bar & Header Controls */}
      <div className="p-3 border-b border-slate-800 space-y-2.5 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Alla Post-it Lappar</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black">
                  {counts.total}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Klicka på en lapp för att fokusera vyn direkt</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenFloatingWindow && !isFloatingMode && (
              <button
                type="button"
                onClick={onOpenFloatingWindow}
                title="Öppna som flytande fönster på skärmen"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flytande</span>
              </button>
            )}

            {onAddStickyNote && (
              <button
                type="button"
                onClick={onAddStickyNote}
                title="Skapa ny Post-it lapp"
                className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Ny</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök rubrik, innehåll, grupp..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-800 focus:border-amber-400/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            Alla ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('important')}
            className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
              filterCategory === 'important'
                ? 'bg-red-500/25 text-red-300 border border-red-500/60'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Pin className="w-3 h-3 text-red-400 fill-red-400/50 rotate-45" />
            <span>Viktiga ({counts.important})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('todo')}
            className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
              filterCategory === 'todo'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <CheckSquare className="w-3 h-3 text-emerald-400" />
            <span>Att-göra ({counts.todo})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('grouped')}
            className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
              filterCategory === 'grouped'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/60'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Grupperade ({counts.grouped})</span>
          </button>
        </div>

        {/* Sort & Color Options */}
        <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
          <div className="flex items-center gap-1 text-slate-400">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="important_first">📌 Viktigast först</option>
              <option value="newest">🕒 Senaste först</option>
              <option value="oldest">⏳ Äldsta först</option>
              <option value="alphabetical">🔤 Namn (A-Ö)</option>
            </select>
          </div>

          {/* Color Dots Filter */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedColorFilter('all')}
              title="Alla färger"
              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                selectedColorFilter === 'all'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/20'
                  : 'border-slate-700 text-slate-500 bg-slate-900'
              }`}
            >
              *
            </button>
            {(['yellow', 'cyan', 'emerald', 'rose', 'purple', 'blue'] as StickyNoteColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColorFilter(selectedColorFilter === c ? 'all' : c)}
                title={`Filtrera: ${COLOR_BADGES[c].label}`}
                className={`w-3.5 h-3.5 rounded-full ${COLOR_BADGES[c].dot} transition-transform ${
                  selectedColorFilter === c ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notes List Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                {searchQuery || filterCategory !== 'all' || selectedColorFilter !== 'all'
                  ? 'Inga Post-it lappar matchar filtret'
                  : 'Inga Post-it lappar skapade än'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                {searchQuery || filterCategory !== 'all' || selectedColorFilter !== 'all'
                  ? 'Prova att rensa sökningen eller återställa filter.'
                  : 'Skapa digitala lappar för att dokumentera IP-adresser, nätverkspolicyer och att-göra listor.'}
              </p>
            </div>

            {searchQuery || filterCategory !== 'all' || selectedColorFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setSelectedColorFilter('all');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Rensa filter
              </button>
            ) : onAddStickyNote ? (
              <button
                type="button"
                onClick={onAddStickyNote}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Skapa första Post-it</span>
              </button>
            ) : null}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = selectedStickyNoteId === note.id || selectedStickyNoteIds.includes(note.id);
            const colorCfg = COLOR_BADGES[note.color] || COLOR_BADGES.yellow;
            const completedTodos = note.todos ? note.todos.filter((t) => t.completed).length : 0;
            const totalTodos = note.todos ? note.todos.length : 0;

            return (
              <div
                key={note.id}
                onClick={() => {
                  if (onSelectNote) onSelectNote(note.id);
                  onFocusNote(note.id);
                }}
                className={`group relative rounded-xl border p-2.5 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60'
                    : note.isImportant
                    ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400/80 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                    : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Top Row: Important Badge, Group, Title, Focus Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Color dot */}
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorCfg.dot}`} />

                    {/* Important Pin Indicator */}
                    {note.isImportant && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm border border-red-400 animate-pulse">
                        <Pin className="w-2.5 h-2.5 rotate-45 fill-white" />
                        <span>VIKTIGT</span>
                      </span>
                    )}

                    {/* Group Badge */}
                    {note.groupName && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-semibold border border-cyan-500/30 truncate max-w-[120px]">
                        <Layers className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{note.groupName}</span>
                      </span>
                    )}

                    <h4 className="font-bold text-xs text-slate-100 truncate flex-1">
                      {note.title?.trim() ? note.title : 'Anteckning (namnlös)'}
                    </h4>
                  </div>

                  {/* 🎯 Direct Focus Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusNote(note.id);
                    }}
                    title="Centrera och zooma in på denna lapp på canvassen"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 hover:text-white border border-cyan-500/50 active:scale-95 text-[10.5px] font-bold transition shrink-0 cursor-pointer shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Fokusera vy</span>
                  </button>
                </div>

                {/* Content snippet */}
                <div className="mt-1.5 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {note.mode === 'todo' && note.todos && note.todos.length > 0 ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                        <CheckSquare className="w-3 h-3" />
                        <span>
                          {completedTodos} av {totalTodos} uppgifter klara ({totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0}%)
                        </span>
                      </div>
                      <p className="text-slate-400 truncate">
                        • {note.todos.map((t) => t.text).join(' • ')}
                      </p>
                    </div>
                  ) : note.text?.trim() ? (
                    <p className="text-slate-300 whitespace-pre-line">{note.text}</p>
                  ) : (
                    <span className="text-slate-500 italic">Ingen text i denna lapp</span>
                  )}
                </div>

                {/* Footer: Metadata & Actions */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                      <MapPin className="w-2.5 h-2.5" />
                      X: {Math.round(note.x)}, Y: {Math.round(note.y)}
                    </span>
                    {note.updatedAt && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-2.5 h-2.5" />
                        {note.updatedAt}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle Important */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleImportant(note, e)}
                      title={note.isImportant ? 'Ta bort viktigt-flagga' : 'Markera som VIKTIGT (fäst överst)'}
                      className={`p-1 rounded transition cursor-pointer ${
                        note.isImportant
                          ? 'text-red-400 hover:text-red-300 bg-red-500/20'
                          : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'
                      }`}
                    >
                      <Pin className={`w-3 h-3 ${note.isImportant ? 'fill-red-400 rotate-45' : ''}`} />
                    </button>

                    {/* Edit Properties */}
                    {onEditNote && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectNote) onSelectNote(note.id);
                          onEditNote(note);
                        }}
                        title="Redigera lappens egenskaper och text"
                        className="p-1 rounded text-slate-500 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete button */}
                    {onDeleteNote && (
                      <>
                        {confirmDeleteId === note.id ? (
                          <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteNote(note.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] hover:bg-rose-500 transition cursor-pointer"
                            >
                              Ja, ta bort
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-[9px] transition cursor-pointer"
                            >
                              Avbryt
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(note.id);
                            }}
                            title="Ta bort denna Post-it lapp"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Visar {filteredNotes.length} av {counts.total} Post-its</span>
        </div>

        {onAddStickyNote && (
          <button
            type="button"
            onClick={onAddStickyNote}
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Skapa lapp</span>
          </button>
        )}
      </div>
    </div>
  );
};
