import React, { useState, useRef, useEffect } from 'react';
import {
  GripHorizontal,
  X,
  Minimize2,
  Maximize2,
  StickyNote as StickyNoteIcon,
  Layers,
} from 'lucide-react';
import { StickyNote } from '../types';
import { StickyNotesList } from './StickyNotesList';

interface FloatingStickyNotesWindowProps {
  isOpen: boolean;
  onClose: () => void;
  stickyNotes: StickyNote[];
  selectedStickyNoteId?: string | null;
  selectedStickyNoteIds?: string[];
  onFocusNote: (id: string) => void;
  onSelectNote?: (id: string) => void;
  onEditNote?: (note: StickyNote) => void;
  onUpdateNote?: (note: StickyNote) => void;
  onDeleteNote?: (id: string) => void;
  onAddStickyNote?: () => void;
}

export const FloatingStickyNotesWindow: React.FC<FloatingStickyNotesWindowProps> = ({
  isOpen,
  onClose,
  stickyNotes,
  selectedStickyNoteId,
  selectedStickyNoteIds,
  onFocusNote,
  onSelectNote,
  onEditNote,
  onUpdateNote,
  onDeleteNote,
  onAddStickyNote,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Initialize position to top-right on initial mount or when opened
  useEffect(() => {
    if (isOpen && !pos) {
      const initialRight = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 420) : 100;
      setPos({ x: initialRight, y: 75 });
    }
  }, [isOpen, pos]);

  // Window drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) return;

    e.preventDefault();
    if (!windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) return;
    if (e.touches.length !== 1) return;

    if (!windowRef.current) return;
    const touch = e.touches[0];
    const rect = windowRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const elementW = windowRef.current?.offsetWidth || 380;
      const elementH = windowRef.current?.offsetHeight || 400;

      const rawX = e.clientX - dragOffsetRef.current.offsetX;
      const rawY = e.clientY - dragOffsetRef.current.offsetY;

      const clampedX = Math.max(10, Math.min(winW - elementW - 10, rawX));
      const clampedY = Math.max(10, Math.min(winH - elementH - 10, rawY));

      setPos({ x: clampedX, y: clampedY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const elementW = windowRef.current?.offsetWidth || 380;
      const elementH = windowRef.current?.offsetHeight || 400;

      const rawX = touch.clientX - dragOffsetRef.current.offsetX;
      const rawY = touch.clientY - dragOffsetRef.current.offsetY;

      const clampedX = Math.max(10, Math.min(winW - elementW - 10, rawX));
      const clampedY = Math.max(10, Math.min(winH - elementH - 10, rawY));

      setPos({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: pos?.x ?? 80,
        top: pos?.y ?? 80,
        zIndex: 45,
      }}
      className={`flex flex-col bg-slate-950/95 border border-amber-500/50 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-shadow ${
        isDragging ? 'ring-2 ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]' : ''
      } ${isMinimized ? 'w-72' : 'w-[360px] sm:w-[390px] h-[520px] max-h-[85vh]'} overflow-hidden select-none animate-fade-in`}
    >
      {/* Draggable Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-b border-amber-500/30 cursor-move"
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-4 h-4 text-amber-400/70 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <StickyNoteIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
            <span className="text-xs font-bold text-slate-100 truncate">Post-it Översikt</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black shrink-0">
              {stickyNotes.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Maximera fönster' : 'Minimera fönster'}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Stäng flytande fönster"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <StickyNotesList
            stickyNotes={stickyNotes}
            selectedStickyNoteId={selectedStickyNoteId}
            selectedStickyNoteIds={selectedStickyNoteIds}
            onFocusNote={onFocusNote}
            onSelectNote={onSelectNote}
            onEditNote={onEditNote}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            onAddStickyNote={onAddStickyNote}
            isFloatingMode={true}
          />
        </div>
      )}
    </div>
  );
};
