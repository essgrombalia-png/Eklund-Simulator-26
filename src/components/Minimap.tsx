import React, { useState, useRef, useEffect } from 'react';
import { Map, Eye, EyeOff, Maximize2, Minimize2, Compass, Layers, AlertCircle, RefreshCw, GripHorizontal, RotateCcw } from 'lucide-react';
import { Device, Link, NetworkContainer, StickyNote } from '../types';
import { isHackerDevice } from '../utils/hackerEngine';

interface MinimapProps {
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
  stickyNotes?: StickyNote[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  zoom: number;
  pan: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onZoomChange?: (newZoom: number) => void;
  onResetView?: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  nodes,
  links,
  containers = [],
  stickyNotes = [],
  selectedNodeId,
  selectedNodeIds = [],
  zoom,
  pan,
  canvasWidth,
  canvasHeight,
  containerRef,
  onPanChange,
  onZoomChange,
  onResetView,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const miniMapRef = useRef<HTMLDivElement>(null);

  // Draggable window state for the Minimap itself
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('network_simulator_minimap_pos');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [isMovingWindow, setIsMovingWindow] = useState<boolean>(false);
  const moveStartRef = useRef<{ startMouseX: number; startMouseY: number; startPosX: number; startPosY: number } | null>(null);

  // Map dimensions
  const MAP_WIDTH = 200;
  const MAP_HEIGHT = 130;

  // Compute world bounds (padded min/max of nodes or canvas default)
  let minWorldX = 0;
  let maxWorldX = canvasWidth;
  let minWorldY = 0;
  let maxWorldY = canvasHeight;

  nodes.forEach((n) => {
    if (n.x - 80 < minWorldX) minWorldX = n.x - 80;
    if (n.x + 80 > maxWorldX) maxWorldX = n.x + 80;
    if (n.y - 80 < minWorldY) minWorldY = n.y - 80;
    if (n.y + 80 > maxWorldY) maxWorldY = n.y + 80;
  });

  stickyNotes.forEach((sn) => {
    if (sn.x - 40 < minWorldX) minWorldX = sn.x - 40;
    if (sn.x + (sn.width || 240) + 40 > maxWorldX) maxWorldX = sn.x + (sn.width || 240) + 40;
    if (sn.y - 40 < minWorldY) minWorldY = sn.y - 40;
    if (sn.y + (sn.height || 180) + 40 > maxWorldY) maxWorldY = sn.y + (sn.height || 180) + 40;
  });

  const worldW = maxWorldX - minWorldX;
  const worldH = maxWorldY - minWorldY;

  const scaleX = MAP_WIDTH / worldW;
  const scaleY = MAP_HEIGHT / worldH;

  // Viewport calculation
  const containerW = containerRef.current?.clientWidth || 1000;
  const containerH = containerRef.current?.clientHeight || 700;

  // Position of visible viewport in world coords
  const viewWorldX = (-pan.x) / zoom;
  const viewWorldY = (-pan.y) / zoom;
  const viewWorldW = containerW / zoom;
  const viewWorldH = containerH / zoom;

  // Convert to mini-map coordinates
  const viewRectX = Math.max(0, Math.min(MAP_WIDTH, (viewWorldX - minWorldX) * scaleX));
  const viewRectY = Math.max(0, Math.min(MAP_HEIGHT, (viewWorldY - minWorldY) * scaleY));
  const viewRectW = Math.min(MAP_WIDTH - viewRectX, (viewWorldW) * scaleX);
  const viewRectH = Math.min(MAP_HEIGHT - viewRectY, (viewWorldH) * scaleY);

  const handlePointerNavigate = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!miniMapRef.current) return;
    const rect = miniMapRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(MAP_WIDTH, e.clientX - rect.left));
    const clickY = Math.max(0, Math.min(MAP_HEIGHT, e.clientY - rect.top));

    // Map clickX, clickY back to target world coordinates
    const targetWorldX = minWorldX + clickX / scaleX;
    const targetWorldY = minWorldY + clickY / scaleY;

    // Center viewport at targetWorldX, targetWorldY
    const newPanX = containerW / 2 - targetWorldX * zoom;
    const newPanY = containerH / 2 - targetWorldY * zoom;

    onPanChange({ x: newPanX, y: newPanY });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsNavigating(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerNavigate(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isNavigating) return;
    handlePointerNavigate(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isNavigating) {
      setIsNavigating(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture fails
      }
    }
  };

  // Window drag handlers (for moving the entire mini-map component anywhere on the screen)
  const handleWindowDragStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    const currentX = position?.x ?? (containerW > 250 ? containerW - 235 : 20);
    const currentY = position?.y ?? (containerH > 240 ? containerH - 220 : 60);

    moveStartRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: currentX,
      startPosY: currentY,
    };
    setIsMovingWindow(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleWindowDragMove = (e: React.PointerEvent) => {
    if (!isMovingWindow || !moveStartRef.current) return;
    const deltaX = e.clientX - moveStartRef.current.startMouseX;
    const deltaY = e.clientY - moveStartRef.current.startMouseY;

    const parentW = containerRef.current?.clientWidth || window.innerWidth;
    const parentH = containerRef.current?.clientHeight || window.innerHeight;

    const newX = Math.max(10, Math.min(parentW - 230, moveStartRef.current.startPosX + deltaX));
    const newY = Math.max(10, Math.min(parentH - 210, moveStartRef.current.startPosY + deltaY));

    const newPos = { x: newX, y: newY };
    setPosition(newPos);
  };

  const handleWindowDragEnd = (e: React.PointerEvent) => {
    if (isMovingWindow) {
      setIsMovingWindow(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      if (position) {
        try {
          localStorage.setItem('network_simulator_minimap_pos', JSON.stringify(position));
        } catch {
          // Ignore
        }
      }
    }
  };

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition(null);
    try {
      localStorage.removeItem('network_simulator_minimap_pos');
    } catch {
      // Ignore
    }
  };

  // Helper for node colors in minimap
  const getNodeColor = (node: Device) => {
    if (!node.on) return '#64748b'; // Off / gray
    if (node.isInfected) return '#ef4444'; // Red
    if (isHackerDevice(node.type)) return '#f43f5e'; // Rose
    if (node.type.startsWith('server_')) return '#818cf8'; // Indigo
    if (node.type.startsWith('client_')) return '#38bdf8'; // Cyan
    if (node.type.startsWith('iot_')) return '#2dd4bf'; // Teal
    if (node.type === 'router' || node.type === 'wifi_router') return '#fbbf24'; // Amber
    if (node.type === 'firewall') return '#f87171'; // Red
    return '#60a5fa'; // Blue default
  };

  // Fit view to all nodes
  const handleFitAll = () => {
    if (nodes.length === 0 && stickyNotes.length === 0) {
      if (onResetView) onResetView();
      return;
    }
    const padding = 100;
    const boundingW = maxWorldX - minWorldX + padding * 2;
    const boundingH = maxWorldY - minWorldY + padding * 2;

    const scaleFitX = containerW / boundingW;
    const scaleFitY = containerH / boundingH;
    let targetZoom = Math.min(scaleFitX, scaleFitY, 1.2);
    targetZoom = Math.max(0.4, targetZoom);

    const centerX = (minWorldX + maxWorldX) / 2;
    const centerY = (minWorldY + maxWorldY) / 2;

    const newPanX = containerW / 2 - centerX * targetZoom;
    const newPanY = containerH / 2 - centerY * targetZoom;

    if (onZoomChange) onZoomChange(targetZoom);
    onPanChange({ x: newPanX, y: newPanY });
  };

  const stylePosition: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'absolute',
      }
    : {
        bottom: '4rem',
        right: '1rem',
        position: 'absolute',
      };

  return (
    <div
      style={stylePosition}
      className="z-30 flex flex-col items-end select-none font-mono"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Collapsed Toggle Button */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/50 text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 shadow-2xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
          title="Visa Mini-map över nätverkstopologi"
        >
          <Map className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold font-orbitron hidden sm:inline">MINI-MAP</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>
      ) : (
        <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl w-[220px] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-cyan-500/20">
          {/* Header Controls & Drag Handle */}
          <div
            onPointerDown={handleWindowDragStart}
            onPointerMove={handleWindowDragMove}
            onPointerUp={handleWindowDragEnd}
            className="flex items-center justify-between border-b border-slate-800/90 pb-1.5 px-1 cursor-grab active:cursor-grabbing group select-none"
            title="Dra här för att flytta Mini-map fönstret var som helst på skärmen"
          >
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] font-orbitron">
              <GripHorizontal className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" style={{ animationDuration: '20s' }} />
              <span>MINI-MAP</span>
            </div>

            <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
              {/* Reset to Default Position */}
              {position && (
                <button
                  type="button"
                  onClick={handleResetPosition}
                  title="Återställ Mini-map till standardposition (nedre högra hörnet)"
                  className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              {/* Fit All Nodes */}
              <button
                type="button"
                onClick={handleFitAll}
                title="Centrera och anpassa vyn till alla enheter"
                className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              {/* Reset View */}
              {onResetView && (
                <button
                  type="button"
                  onClick={onResetView}
                  title="Återställ vy (100% & centrerad)"
                  className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
              {/* Collapse button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                title="Dölj Mini-map"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Mini-map Interactive Viewport Box */}
          <div
            ref={miniMapRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
            className="relative bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden cursor-crosshair shadow-inner mx-auto"
          >
            {/* Grid background on Mini-map */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

            {/* Containers Bounding Rectangles */}
            {containers.map((c) => {
              const memberNodes = nodes.filter((n) => c.nodeIds.includes(n.id));
              if (memberNodes.length === 0) return null;
              const cMinX = Math.min(...memberNodes.map((n) => n.x)) - 40;
              const cMaxX = Math.max(...memberNodes.map((n) => n.x)) + 40;
              const cMinY = Math.min(...memberNodes.map((n) => n.y)) - 40;
              const cMaxY = Math.max(...memberNodes.map((n) => n.y)) + 40;

              const cx = (cMinX - minWorldX) * scaleX;
              const cy = (cMinY - minWorldY) * scaleY;
              const cw = (cMaxX - cMinX) * scaleX;
              const ch = (cMaxY - cMinY) * scaleY;

              return (
                <div
                  key={`mini-c-${c.id}`}
                  style={{
                    left: Math.max(0, cx),
                    top: Math.max(0, cy),
                    width: Math.min(MAP_WIDTH, cw),
                    height: Math.min(MAP_HEIGHT, ch),
                  }}
                  className="absolute border border-cyan-500/40 bg-cyan-500/10 rounded pointer-events-none"
                />
              );
            })}

            {/* Sticky Notes preview boxes on Minimap */}
            {stickyNotes.map((note) => {
              const snX = (note.x - minWorldX) * scaleX;
              const snY = (note.y - minWorldY) * scaleY;
              const snW = Math.max(4, (note.width || 240) * scaleX);
              const snH = Math.max(3, (note.height || 180) * scaleY);

              return (
                <div
                  key={`mini-sn-${note.id}`}
                  style={{
                    left: Math.max(0, Math.min(MAP_WIDTH - snW, snX)),
                    top: Math.max(0, Math.min(MAP_HEIGHT - snH, snY)),
                    width: snW,
                    height: snH,
                  }}
                  className={`absolute rounded-[2px] pointer-events-none transition-all ${
                    note.isImportant
                      ? 'border border-red-500 bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.9)] z-20 scale-110'
                      : 'border border-amber-400/50 bg-amber-400/30'
                  }`}
                />
              );
            })}

            {/* Links preview lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((link) => {
                const nodeA = nodes.find((n) => n.id === link.a);
                const nodeB = nodes.find((n) => n.id === link.b);
                if (!nodeA || !nodeB) return null;

                const ax = (nodeA.x - minWorldX) * scaleX;
                const ay = (nodeA.y - minWorldY) * scaleY;
                const bx = (nodeB.x - minWorldX) * scaleX;
                const by = (nodeB.y - minWorldY) * scaleY;

                return (
                  <line
                    key={`mini-link-${link.id}`}
                    x1={ax}
                    y1={ay}
                    x2={bx}
                    y2={by}
                    stroke="#0284c7"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                );
              })}
            </svg>

            {/* Nodes preview dots */}
            {nodes.map((n) => {
              const nx = (n.x - minWorldX) * scaleX;
              const ny = (n.y - minWorldY) * scaleY;
              const isSelected = selectedNodeId === n.id || selectedNodeIds.includes(n.id);
              const color = getNodeColor(n);

              return (
                <div
                  key={`mini-node-${n.id}`}
                  style={{
                    left: `${nx}px`,
                    top: `${ny}px`,
                    backgroundColor: color,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isSelected ? `0 0 6px ${color}` : 'none',
                  }}
                  className={`absolute rounded-full pointer-events-none transition-all ${
                    isSelected ? 'w-3 h-3 ring-2 ring-white z-20' : 'w-2 h-2 opacity-90'
                  }`}
                />
              );
            })}

            {/* Viewport Frame Indicator Box */}
            <div
              style={{
                left: `${viewRectX}px`,
                top: `${viewRectY}px`,
                width: `${viewRectW}px`,
                height: `${viewRectH}px`,
              }}
              className="absolute border-2 border-cyan-400 bg-cyan-400/15 rounded shadow-[0_0_10px_rgba(34,211,238,0.3)] pointer-events-none transition-all duration-75"
            >
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-cyan-300 rounded-bl" />
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-cyan-300 rounded-tr" />
            </div>
          </div>

          {/* Footer Stats & Drag Help */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5 font-sans">
            <span>Enheter: <strong className="text-cyan-400 font-mono">{nodes.length}</strong></span>
            <span>Vy: <strong className="text-emerald-400 font-mono">{Math.round(zoom * 100)}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

