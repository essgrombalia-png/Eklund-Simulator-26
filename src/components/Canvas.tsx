import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Bug,
  AlertTriangle,
  Cable,
  Zap,
  Magnet,
  Grid,
  Sparkles,
  Layers,
  CheckCircle2,
  Network,
  Plus,
  Cloud,
  Shield,
  Building,
  Server,
  Radio,
  Box,
  Sliders,
  Trash2,
  Move,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  X,
  Skull,
  Target,
  Flame,
  ShieldAlert,
  Heart,
  Activity,
  Wand2,
  StickyNote as StickyNoteIcon,
} from 'lucide-react';
import {
  Device,
  Link,
  DeviceType,
  CableType,
  NetworkContainer,
  ContainerType,
  ContainerColor,
  CapturedPacket,
  SimulatorThemeId,
  StickyNote,
} from '../types';
import { detectNodeWarnings } from '../utils/networkEngine';
import { CABLE_DEFINITIONS } from '../utils/cableEngine';
import {
  calculateNodeAttackImpactAndHealth,
  getHealthColor,
  isHackerDevice,
} from '../utils/hackerEngine';
import { RealisticDeviceIcon } from './RealisticDeviceIcon';
import { NodeTooltip } from './NodeTooltip';
import { Minimap } from './Minimap';
import { StickyNoteCard } from './StickyNoteCard';

interface CanvasProps {
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
  stickyNotes?: StickyNote[];
  capturedPackets?: CapturedPacket[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  selectedLinkId: string | null;
  selectedContainerId?: string | null;
  connectivityMap: Map<string, boolean>;
  testingLinkIds: string[];
  activePacketAnimations: { linkId: string; color: string; duration: number }[];
  showVisualDebugger?: boolean;
  onToggleVisualDebugger?: () => void;
  onSelectNode: (id: string | null) => void;
  onToggleMultiSelectNode?: (id: string, isMulti: boolean) => void;
  onMultiSelectNodes?: (ids: string[]) => void;
  onSelectLink: (id: string | null) => void;
  onSelectContainer?: (id: string | null) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onUpdateMultipleNodePositions?: (updates: { id: string; x: number; y: number }[]) => void;
  onUpdateContainer?: (container: NetworkContainer) => void;
  onDeleteContainer?: (id: string) => void;
  onOpenContainerModal?: (container?: NetworkContainer | null, initialNodeIds?: string[]) => void;
  onAddLink: (aId: string, bId: string) => void;
  onAddNodeAtPosition: (type: DeviceType, x: number, y: number) => void;
  onAddStickyNote?: (x?: number, y?: number) => void;
  onUpdateStickyNote?: (note: StickyNote) => void;
  onDeleteStickyNote?: (id: string) => void;
  onOpenIpModal?: (node: Device) => void;
  onOpenLayoutOptimizer?: () => void;
  onQuickAutoLayout?: () => void;
  onOpenAutoRepair?: () => void;
  onAutoRepairNode?: (nodeId: string) => void;
  activeCableType?: CableType;
  onSelectCableType?: (type: CableType) => void;
  onQuickStart?: () => void;
  onSelectScenarioPreset?: (presetId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  currentThemeId?: SimulatorThemeId;
  isLightMode?: boolean;
}

// Convert dotted-decimal subnet mask to CIDR prefix (e.g., 255.255.255.0 -> /24)
const maskToCidr = (mask?: string): string => {
  if (!mask) return '/24';
  const parts = mask.split('.');
  if (parts.length !== 4) return '/24';
  let count = 0;
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num)) continue;
    count += (num.toString(2).match(/1/g) || []).length;
  }
  return `/${count}`;
};

const CONTAINER_ICONS: Record<ContainerType, React.ComponentType<{ className?: string }>> = {
  subnet_cloud: Cloud,
  dmz: Shield,
  lan_zone: Building,
  datacenter: Server,
  vlan_boundary: Layers,
  wifi_zone: Radio,
  custom_box: Box,
};

const CONTAINER_THEMES: Record<
  ContainerColor,
  {
    bgFill: string;
    borderStroke: string;
    headerBg: string;
    headerBorder: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    cloudAura: string;
    hexColor: string;
  }
> = {
  cyan: {
    bgFill: 'rgba(6, 182, 212, 0.04)',
    borderStroke: 'rgba(6, 182, 212, 0.45)',
    headerBg: 'bg-cyan-950/90',
    headerBorder: 'border-cyan-500/50',
    text: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/40',
    badgeText: 'text-cyan-200',
    cloudAura: 'shadow-[0_0_30px_rgba(6,182,212,0.35)] ring-cyan-500/50 border-cyan-500/70',
    hexColor: '#06b6d4',
  },
  emerald: {
    bgFill: 'rgba(16, 185, 129, 0.04)',
    borderStroke: 'rgba(16, 185, 129, 0.45)',
    headerBg: 'bg-emerald-950/90',
    headerBorder: 'border-emerald-500/50',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
    badgeText: 'text-emerald-200',
    cloudAura: 'shadow-[0_0_30px_rgba(16,185,129,0.35)] ring-emerald-500/50 border-emerald-500/70',
    hexColor: '#10b981',
  },
  indigo: {
    bgFill: 'rgba(99, 102, 241, 0.04)',
    borderStroke: 'rgba(99, 102, 241, 0.45)',
    headerBg: 'bg-indigo-950/90',
    headerBorder: 'border-indigo-500/50',
    text: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/20 border-indigo-500/40',
    badgeText: 'text-indigo-200',
    cloudAura: 'shadow-[0_0_30px_rgba(99,102,241,0.35)] ring-indigo-500/50 border-indigo-500/70',
    hexColor: '#6366f1',
  },
  amber: {
    bgFill: 'rgba(245, 158, 11, 0.04)',
    borderStroke: 'rgba(245, 158, 11, 0.45)',
    headerBg: 'bg-amber-950/90',
    headerBorder: 'border-amber-500/50',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 border-amber-500/40',
    badgeText: 'text-amber-200',
    cloudAura: 'shadow-[0_0_30px_rgba(245,158,11,0.35)] ring-amber-500/50 border-amber-500/70',
    hexColor: '#f59e0b',
  },
  rose: {
    bgFill: 'rgba(244, 63, 94, 0.04)',
    borderStroke: 'rgba(244, 63, 94, 0.45)',
    headerBg: 'bg-rose-950/90',
    headerBorder: 'border-rose-500/50',
    text: 'text-rose-300',
    badgeBg: 'bg-rose-500/20 border-rose-500/40',
    badgeText: 'text-rose-200',
    cloudAura: 'shadow-[0_0_30px_rgba(244,63,94,0.35)] ring-rose-500/50 border-rose-500/70',
    hexColor: '#f43f5e',
  },
  purple: {
    bgFill: 'rgba(168, 85, 247, 0.04)',
    borderStroke: 'rgba(168, 85, 247, 0.45)',
    headerBg: 'bg-purple-950/90',
    headerBorder: 'border-purple-500/50',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 border-purple-500/40',
    badgeText: 'text-purple-200',
    cloudAura: 'shadow-[0_0_30px_rgba(168,85,247,0.35)] ring-purple-500/50 border-purple-500/70',
    hexColor: '#a855f7',
  },
  teal: {
    bgFill: 'rgba(20, 184, 166, 0.04)',
    borderStroke: 'rgba(20, 184, 166, 0.45)',
    headerBg: 'bg-teal-950/90',
    headerBorder: 'border-teal-500/50',
    text: 'text-teal-300',
    badgeBg: 'bg-teal-500/20 border-teal-500/40',
    badgeText: 'text-teal-200',
    cloudAura: 'shadow-[0_0_30px_rgba(20,184,166,0.35)] ring-teal-500/50 border-teal-500/70',
    hexColor: '#14b8a6',
  },
  blue: {
    bgFill: 'rgba(59, 130, 246, 0.04)',
    borderStroke: 'rgba(59, 130, 246, 0.45)',
    headerBg: 'bg-blue-950/90',
    headerBorder: 'border-blue-500/50',
    text: 'text-blue-300',
    badgeBg: 'bg-blue-500/20 border-blue-500/40',
    badgeText: 'text-blue-200',
    cloudAura: 'shadow-[0_0_30px_rgba(59,130,246,0.35)] ring-blue-500/50 border-blue-500/70',
    hexColor: '#3b82f6',
  },
  slate: {
    bgFill: 'rgba(100, 116, 139, 0.04)',
    borderStroke: 'rgba(100, 116, 139, 0.45)',
    headerBg: 'bg-slate-950/90',
    headerBorder: 'border-slate-700/60',
    text: 'text-slate-300',
    badgeBg: 'bg-slate-800 border-slate-700',
    badgeText: 'text-slate-300',
    cloudAura: 'shadow-[0_0_30px_rgba(100,116,139,0.35)] ring-slate-600 border-slate-600',
    hexColor: '#64748b',
  },
};

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  links,
  containers = [],
  stickyNotes = [],
  capturedPackets = [],
  selectedNodeId,
  selectedNodeIds = [],
  selectedLinkId,
  selectedContainerId,
  connectivityMap,
  testingLinkIds,
  activePacketAnimations,
  showVisualDebugger = false,
  onToggleVisualDebugger,
  onSelectNode,
  onToggleMultiSelectNode,
  onMultiSelectNodes,
  onSelectLink,
  onSelectContainer,
  onUpdateNodePosition,
  onUpdateMultipleNodePositions,
  onUpdateContainer,
  onDeleteContainer,
  onOpenContainerModal,
  onAddLink,
  onAddNodeAtPosition,
  onAddStickyNote,
  onUpdateStickyNote,
  onDeleteStickyNote,
  onOpenIpModal,
  onOpenLayoutOptimizer,
  onQuickAutoLayout,
  onOpenAutoRepair,
  onAutoRepairNode,
  activeCableType = 'auto',
  onSelectCableType,
  onQuickStart,
  onSelectScenarioPreset,
  onDragStart,
  onDragEnd,
  currentThemeId,
  isLightMode,
}) => {
  const isLight = isLightMode || currentThemeId === 'blueprint_light';
  const [internalDebugger, setInternalDebugger] = useState(false);
  const isDebuggerActive = showVisualDebugger !== undefined ? showVisualDebugger : internalDebugger;
  const handleToggleDebugger = onToggleVisualDebugger || (() => setInternalDebugger(!internalDebugger));

  // Guidance / Info Banner State
  const [showEmptyGuidance, setShowEmptyGuidance] = useState<boolean>(true);

  // Magnetic Grid & Snapping State
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(40);
  const [gridStyle, setGridStyle] = useState<'dots' | 'lines' | 'blueprint' | 'off'>(
    currentThemeId === 'blueprint_light' ? 'blueprint' : 'dots'
  );
  const [smartAlign, setSmartAlign] = useState<boolean>(true);
  const [activeGuidelines, setActiveGuidelines] = useState<Array<{ type: 'x' | 'y'; coord: number; label: string }>>([]);

  const nodesWithWarningsCount = nodes.filter((n) => detectNodeWarnings(n, nodes, links).hasWarning).length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Connector drag & click state
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectingTargetNodeId, setConnectingTargetNodeId] = useState<string | null>(null);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);
  const connectStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Node dragging & hover state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Sticky Note Dragging State
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [noteDragOffset, setNoteDragOffset] = useState({ x: 0, y: 0 });

  // Container Dragging state
  const [draggingContainerId, setDraggingContainerId] = useState<string | null>(null);
  const [containerDragStart, setContainerDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialPositions: Array<{ id: string; x: number; y: number }>;
    initialCollapsedPos?: { x: number; y: number };
  } | null>(null);

  // Marquee Selection Box
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Canvas bounds
  const CANVAS_WIDTH = 1800;
  const CANVAS_HEIGHT = 1200;

  // Active Cable definition
  const currentCableDef = CABLE_DEFINITIONS[activeCableType] || CABLE_DEFINITIONS.auto;

  // Render device icon helper
  const renderDeviceIcon = (type: DeviceType) => {
    return <RealisticDeviceIcon type={type} size="lg" />;
  };

  // Helper to get category-specific styling classes for the device node box
  const getNodeCategoryClasses = (type: DeviceType, isSelected: boolean) => {
    const isServer = type.startsWith('server_');
    const isClient = type.startsWith('client_');
    const isIoT = type.startsWith('iot_');
    const isSwitchOrAp = type === 'switch' || type === 'l3_switch' || type === 'wifi_ap';
    const isRouter = type === 'router' || type === 'wifi_router';
    const isFirewall = type === 'firewall';
    const isInternet = type === 'internet';
    const isHacker = isHackerDevice(type);

    if (isServer) {
      return {
        bg: 'bg-indigo-950/50 backdrop-blur-md',
        border: isSelected
          ? 'border-indigo-400 ring-4 ring-indigo-500/30 shadow-[0_0_22px_rgba(99,102,241,0.6)] scale-105'
          : 'border-indigo-500/35 hover:border-indigo-400/80 shadow-[0_4px_14px_rgba(99,102,241,0.2)] hover:scale-105',
      };
    }
    if (isClient) {
      return {
        bg: 'bg-cyan-950/20 backdrop-blur-md',
        border: isSelected
          ? 'border-cyan-400 ring-4 ring-cyan-500/30 shadow-[0_0_18px_rgba(34,211,238,0.5)] scale-105'
          : 'border-cyan-500/25 hover:border-cyan-400/80 shadow-[0_4px_14px_rgba(34,211,238,0.15)] hover:scale-105',
      };
    }
    if (isIoT) {
      return {
        bg: 'bg-teal-950/30 backdrop-blur-md',
        border: isSelected
          ? 'border-teal-400 ring-4 ring-teal-500/30 shadow-[0_0_18px_rgba(20,184,166,0.6)] scale-105'
          : 'border-teal-500/35 hover:border-teal-400/80 shadow-[0_4px_14px_rgba(20,184,166,0.2)] hover:scale-105',
      };
    }
    if (isSwitchOrAp) {
      return {
        bg: 'bg-blue-950/25 backdrop-blur-md',
        border: isSelected
          ? 'border-blue-400 ring-4 ring-blue-500/30 shadow-[0_0_18px_rgba(59,130,246,0.5)] scale-105'
          : 'border-blue-500/25 hover:border-blue-400/80 shadow-[0_4px_14px_rgba(59,130,246,0.15)] hover:scale-105',
      };
    }
    if (isRouter) {
      return {
        bg: 'bg-amber-950/25 backdrop-blur-md',
        border: isSelected
          ? 'border-amber-400 ring-4 ring-amber-500/30 shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-105'
          : 'border-amber-500/35 hover:border-amber-400/80 shadow-[0_4px_14px_rgba(245,158,11,0.15)] hover:scale-105',
      };
    }
    if (isFirewall) {
      return {
        bg: 'bg-rose-950/25 backdrop-blur-md',
        border: isSelected
          ? 'border-rose-400 ring-4 ring-rose-500/30 shadow-[0_0_18px_rgba(239,68,68,0.5)] scale-105'
          : 'border-rose-500/35 hover:border-rose-400/80 shadow-[0_4px_14px_rgba(239,68,68,0.15)] hover:scale-105',
      };
    }
    if (isInternet) {
      return {
        bg: 'bg-emerald-950/25 backdrop-blur-md',
        border: isSelected
          ? 'border-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105'
          : 'border-emerald-500/35 hover:border-emerald-400/80 shadow-[0_4px_14px_rgba(16,185,129,0.2)] hover:scale-105',
      };
    }
    if (isHacker) {
      return {
        bg: 'bg-red-950/35 backdrop-blur-md',
        border: isSelected
          ? 'border-red-500 ring-4 ring-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.7)] scale-105 animate-pulse'
          : 'border-red-500/50 hover:border-red-400 shadow-[0_4px_14px_rgba(239,68,68,0.25)] hover:scale-105 animate-pulse',
      };
    }

    // Default fallback
    return {
      bg: 'bg-slate-900/90 backdrop-blur-md',
      border: isSelected
        ? 'border-cyan-400 ring-4 ring-cyan-500/30 shadow-cyan-500/30 scale-105'
        : 'border-slate-800 hover:border-cyan-500/60 hover:scale-105',
    };
  };

  // Curved cable SVG path helper
  const calculateLinkPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;
    const normX = -dy / dist;
    const normY = dx / dist;
    const curve = Math.min(35, dist * 0.15);
    const midX = (x1 + x2) / 2 + normX * curve;
    const midY = (y1 + y2) / 2 + normY * curve;
    return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  };

  // Refs for smooth global drag/pan event handlers
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const containersRef = useRef(containers);
  containersRef.current = containers;
  const draggingNodeIdRef = useRef<string | null>(null);
  draggingNodeIdRef.current = draggingNodeId;
  const draggingContainerIdRef = useRef<string | null>(null);
  draggingContainerIdRef.current = draggingContainerId;
  const containerDragStartRef = useRef(containerDragStart);
  containerDragStartRef.current = containerDragStart;
  const selectionBoxRef = useRef(selectionBox);
  selectionBoxRef.current = selectionBox;
  const isPanningRef = useRef(isPanning);
  isPanningRef.current = isPanning;
  const connectingNodeIdRef = useRef<string | null>(null);
  connectingNodeIdRef.current = connectingNodeId;
  const connectingTargetNodeIdRef = useRef<string | null>(null);
  connectingTargetNodeIdRef.current = connectingTargetNodeId;
  const panStartRef = useRef(panStart);
  panStartRef.current = panStart;
  const dragOffsetRef = useRef(dragOffset);
  dragOffsetRef.current = dragOffset;
  const panRef = useRef(pan);
  panRef.current = pan;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const onUpdateNodePositionRef = useRef(onUpdateNodePosition);
  onUpdateNodePositionRef.current = onUpdateNodePosition;
  const onUpdateMultipleNodePositionsRef = useRef(onUpdateMultipleNodePositions);
  onUpdateMultipleNodePositionsRef.current = onUpdateMultipleNodePositions;
  const onUpdateContainerRef = useRef(onUpdateContainer);
  onUpdateContainerRef.current = onUpdateContainer;
  const onAddLinkRef = useRef(onAddLink);
  onAddLinkRef.current = onAddLink;
  const snapToGridRef = useRef(snapToGrid);
  snapToGridRef.current = snapToGrid;
  const gridSizeRef = useRef(gridSize);
  gridSizeRef.current = gridSize;
  const smartAlignRef = useRef(smartAlign);
  smartAlignRef.current = smartAlign;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  // Sticky Notes Refs
  const stickyNotesRef = useRef(stickyNotes);
  stickyNotesRef.current = stickyNotes;
  const draggingNoteIdRef = useRef<string | null>(null);
  draggingNoteIdRef.current = draggingNoteId;
  const noteDragOffsetRef = useRef(noteDragOffset);
  noteDragOffsetRef.current = noteDragOffset;
  const onUpdateStickyNoteRef = useRef(onUpdateStickyNote);
  onUpdateStickyNoteRef.current = onUpdateStickyNote;

  // Global mousemove & mouseup listeners for ultra-smooth drag & drop / panning / cable connecting
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isPanningRef.current) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
        return;
      }

      // Dragging a Sticky Note
      if (draggingNoteIdRef.current) {
        const rawX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current - noteDragOffsetRef.current.x;
        const rawY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current - noteDragOffsetRef.current.y;

        let finalX = Math.max(20, Math.min(CANVAS_WIDTH - 150, rawX));
        let finalY = Math.max(20, Math.min(CANVAS_HEIGHT - 100, rawY));

        if (snapToGridRef.current) {
          const g = (gridSizeRef.current || 40) / 2;
          finalX = Math.round(finalX / g) * g;
          finalY = Math.round(finalY / g) * g;
        }

        const currentNote = stickyNotesRef.current.find((n) => n.id === draggingNoteIdRef.current);
        if (currentNote && onUpdateStickyNoteRef.current) {
          onUpdateStickyNoteRef.current({
            ...currentNote,
            x: finalX,
            y: finalY,
          });
        }
        return;
      }

      // Marquee selection box dragging
      if (selectionBoxRef.current) {
        const mouseCanvasX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
        const mouseCanvasY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
        setSelectionBox((prev) => (prev ? { ...prev, currentX: mouseCanvasX, currentY: mouseCanvasY } : null));
        return;
      }

      // Dragging an entire Container
      if (draggingContainerIdRef.current && containerDragStartRef.current) {
        const deltaX = (e.clientX - containerDragStartRef.current.mouseX) / zoomRef.current;
        const deltaY = (e.clientY - containerDragStartRef.current.mouseY) / zoomRef.current;

        const currentC = containersRef.current.find((c) => c.id === draggingContainerIdRef.current);
        if (currentC && currentC.isCollapsed && containerDragStartRef.current.initialCollapsedPos) {
          const newX = Math.max(60, Math.min(CANVAS_WIDTH - 60, containerDragStartRef.current.initialCollapsedPos.x + deltaX));
          const newY = Math.max(60, Math.min(CANVAS_HEIGHT - 60, containerDragStartRef.current.initialCollapsedPos.y + deltaY));
          if (onUpdateContainerRef.current) {
            onUpdateContainerRef.current({
              ...currentC,
              collapsedX: newX,
              collapsedY: newY,
            });
          }
        } else {
          // Move all member nodes simultaneously
          const updates = containerDragStartRef.current.initialPositions.map((item) => ({
            id: item.id,
            x: Math.max(40, Math.min(CANVAS_WIDTH - 40, item.x + deltaX)),
            y: Math.max(40, Math.min(CANVAS_HEIGHT - 40, item.y + deltaY)),
          }));

          if (onUpdateMultipleNodePositionsRef.current) {
            onUpdateMultipleNodePositionsRef.current(updates);
          } else {
            updates.forEach((u) => onUpdateNodePositionRef.current(u.id, u.x, u.y));
          }
        }
        return;
      }

      // Dragging a single node
      if (draggingNodeIdRef.current) {
        const rawX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current - dragOffsetRef.current.x;
        const rawY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current - dragOffsetRef.current.y;

        let finalX = rawX;
        let finalY = rawY;
        const guides: Array<{ type: 'x' | 'y'; coord: number; label: string }> = [];

        const otherNodes = nodesRef.current.filter((n) => n.id !== draggingNodeIdRef.current);

        // 1. Smart Node-to-Node Alignment
        if (smartAlignRef.current && otherNodes.length > 0) {
          const SNAP_THRESHOLD = 12; // pixels

          for (const other of otherNodes) {
            if (Math.abs(rawY - other.y) <= SNAP_THRESHOLD) {
              finalY = other.y;
              guides.push({ type: 'y', coord: other.y, label: `I linje med ${other.name}` });
              break;
            }
          }

          for (const other of otherNodes) {
            if (Math.abs(rawX - other.x) <= SNAP_THRESHOLD) {
              finalX = other.x;
              guides.push({ type: 'x', coord: other.x, label: `I linje med ${other.name}` });
              break;
            }
          }
        }

        // 2. Magnetic Grid Snapping
        if (snapToGridRef.current) {
          const g = gridSizeRef.current || 40;
          if (!guides.some((g) => g.type === 'x')) {
            finalX = Math.round(finalX / g) * g;
          }
          if (!guides.some((g) => g.type === 'y')) {
            finalY = Math.round(finalY / g) * g;
          }
        }

        setActiveGuidelines(guides);

        onUpdateNodePositionRef.current(
          draggingNodeIdRef.current,
          Math.max(40, Math.min(CANVAS_WIDTH - 40, finalX)),
          Math.max(40, Math.min(CANVAS_HEIGHT - 40, finalY))
        );
      }

      if (connectingNodeIdRef.current) {
        const mouseCanvasX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
        const mouseCanvasY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

        // Snapping: check if hovering over another node (hit-radius 55px)
        const targetNode = nodesRef.current.find(
          (n) => n.id !== connectingNodeIdRef.current && Math.hypot(n.x - mouseCanvasX, n.y - mouseCanvasY) <= 55
        );

        if (targetNode) {
          setDragPointer({ x: targetNode.x, y: targetNode.y });
          setConnectingTargetNodeId(targetNode.id);
        } else {
          setDragPointer({ x: mouseCanvasX, y: mouseCanvasY });
          setConnectingTargetNodeId(null);
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const wasDragging = draggingNodeIdRef.current || draggingContainerIdRef.current || draggingNoteIdRef.current;

      setIsPanning(false);
      setDraggingNodeId(null);
      setDraggingContainerId(null);
      setDraggingNoteId(null);
      setContainerDragStart(null);
      setActiveGuidelines([]);

      if (wasDragging) {
        onDragEndRef.current?.();
      }

      // Process Marquee Selection Box
      if (selectionBoxRef.current) {
        const { startX, startY, currentX, currentY } = selectionBoxRef.current;
        const xMin = Math.min(startX, currentX);
        const xMax = Math.max(startX, currentX);
        const yMin = Math.min(startY, currentY);
        const yMax = Math.max(startY, currentY);

        // Only select if user actually dragged more than a tiny tap
        if (Math.hypot(xMax - xMin, yMax - yMin) > 15) {
          const selected = nodesRef.current
            .filter((n) => n.x >= xMin && n.x <= xMax && n.y >= yMin && n.y <= yMax)
            .map((n) => n.id);

          if (onMultiSelectNodes) {
            onMultiSelectNodes(selected);
          }
        }
        setSelectionBox(null);
      }

      // Handle cable connecting on release
      if (connectingNodeIdRef.current) {
        const startPos = connectStartPosRef.current;
        const distMoved = startPos ? Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) : 0;

        if (distMoved > 10) {
          if (!containerRef.current) {
            setConnectingNodeId(null);
            setConnectingTargetNodeId(null);
            setDragPointer(null);
            return;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const mouseCanvasX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
          const mouseCanvasY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

          const targetNode =
            (connectingTargetNodeIdRef.current
              ? nodesRef.current.find((n) => n.id === connectingTargetNodeIdRef.current)
              : null) ||
            nodesRef.current.find(
              (n) => n.id !== connectingNodeIdRef.current && Math.hypot(n.x - mouseCanvasX, n.y - mouseCanvasY) <= 55
            );

          if (targetNode && targetNode.id !== connectingNodeIdRef.current) {
            onAddLinkRef.current(connectingNodeIdRef.current, targetNode.id);
          }

          setConnectingNodeId(null);
          setConnectingTargetNodeId(null);
          setDragPointer(null);
        }
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingNodeId(null);
        setConnectingTargetNodeId(null);
        setDragPointer(null);
        setSelectionBox(null);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || !containerRef.current) return;
      const touch = e.touches[0];
      const wasInteracting = isPanningRef.current || draggingNodeIdRef.current || draggingContainerIdRef.current || draggingNoteIdRef.current;
      if (wasInteracting) {
        e.preventDefault();
      }
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
      } as unknown as MouseEvent;
      handleGlobalMouseMove(fakeEvent);
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) {
        const fakeEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as unknown as MouseEvent;
        handleGlobalMouseUp(fakeEvent);
      } else {
        handleGlobalMouseUp({ clientX: 0, clientY: 0 } as unknown as MouseEvent);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [onMultiSelectNodes]);

  // Auto-center selected node if it's out of viewport bounds (or selected via search)
  useEffect(() => {
    if (!selectedNodeId || !containerRef.current || draggingNodeId) return;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;

    // We do a small timeout to let any mounting or rendering happen
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = node.x * zoom + pan.x;
      const screenY = node.y * zoom + pan.y;

      const isOutOfBounds =
        screenX < 100 ||
        screenX > rect.width - 100 ||
        screenY < 100 ||
        screenY > rect.height - 100;

      if (isOutOfBounds) {
        setPan({
          x: rect.width / 2 - node.x * zoom,
          y: rect.height / 2 - node.y * zoom,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedNodeId, zoom, nodes, draggingNodeId]);

  // Canvas Drag & Drop from Palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as DeviceType;
    if (!type || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left - pan.x) / zoom;
    let y = (e.clientY - rect.top - pan.y) / zoom;

    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    onAddNodeAtPosition(type, Math.max(50, Math.min(CANVAS_WIDTH - 50, x)), Math.max(50, Math.min(CANVAS_HEIGHT - 50, y)));
  };

  // Pan canvas or start Marquee selection
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      if (e.shiftKey) {
        // Shift + Drag starts selection marquee
        const rect = containerRef.current!.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        setSelectionBox({
          startX: mouseX,
          startY: mouseY,
          currentX: mouseX,
          currentY: mouseY,
        });
      } else {
        onSelectNode(null);
        onSelectLink(null);
        if (onSelectContainer) onSelectContainer(null);
        if (onMultiSelectNodes) onMultiSelectNodes([]);
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.4, Math.min(2.0, prev * zoomFactor)));
  };

  // Dynamic Background Style Generator
  const getCanvasBackground = () => {
    if (gridStyle === 'off') {
      return {
        backgroundColor: isLight ? '#f0f6fc' : '#020617',
      };
    }
    if (gridStyle === 'blueprint' || currentThemeId === 'blueprint_light') {
      return {
        backgroundColor: isLight ? '#f0f6fc' : '#041024',
        backgroundImage: isLight
          ? `
            linear-gradient(to right, rgba(2, 132, 199, 0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(2, 132, 199, 0.16) 1px, transparent 1px),
            linear-gradient(to right, rgba(2, 132, 199, 0.38) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(2, 132, 199, 0.38) 1.5px, transparent 1.5px)
          `
          : `
            linear-gradient(to right, rgba(14, 165, 233, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(14, 165, 233, 0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(56, 189, 248, 0.22) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.22) 1.5px, transparent 1.5px)
          `,
        backgroundSize: `
          ${gridSize * zoom}px ${gridSize * zoom}px,
          ${gridSize * zoom}px ${gridSize * zoom}px,
          ${gridSize * 4 * zoom}px ${gridSize * 4 * zoom}px,
          ${gridSize * 4 * zoom}px ${gridSize * 4 * zoom}px
        `,
        backgroundPosition: `
          ${pan.x}px ${pan.y}px,
          ${pan.x}px ${pan.y}px,
          ${pan.x}px ${pan.y}px,
          ${pan.x}px ${pan.y}px
        `,
      };
    }
    if (gridStyle === 'lines') {
      return {
        backgroundColor: isLight ? '#f0f6fc' : '#020617',
        backgroundImage: isLight
          ? `
            linear-gradient(to right, rgba(100, 116, 139, 0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100, 116, 139, 0.16) 1px, transparent 1px),
            linear-gradient(to right, rgba(2, 132, 199, 0.3) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(2, 132, 199, 0.3) 1.5px, transparent 1.5px)
          `
          : `
            linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
            linear-gradient(to right, rgba(56, 189, 248, 0.16) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.16) 1.5px, transparent 1.5px)
          `,
        backgroundSize: `
          ${gridSize * zoom}px ${gridSize * zoom}px,
          ${gridSize * zoom}px ${gridSize * zoom}px,
          ${gridSize * 4 * zoom}px ${gridSize * 4 * zoom}px,
          ${gridSize * 4 * zoom}px ${gridSize * 4 * zoom}px
        `,
        backgroundPosition: `
          ${pan.x}px ${pan.y}px,
          ${pan.x}px ${pan.y}px,
          ${pan.x}px ${pan.y}px,
          ${pan.x}px ${pan.y}px
        `,
      };
    }
    // Default: 'dots'
    return {
      backgroundColor: isLight ? '#f0f6fc' : '#020617',
      backgroundImage: isLight
        ? `
          radial-gradient(circle, rgba(2, 132, 199, 0.35) 1.5px, transparent 1.5px),
          radial-gradient(circle, rgba(15, 23, 42, 0.22) 2px, transparent 2px)
        `
        : `
          radial-gradient(circle, rgba(56, 189, 248, 0.18) 1.5px, transparent 1.5px),
          radial-gradient(circle, rgba(148, 163, 184, 0.3) 2px, transparent 2px)
        `,
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px, ${gridSize * 4 * zoom}px ${gridSize * 4 * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px, ${pan.x}px ${pan.y}px`,
    };
  };

  // Helper to get effective node render position (considering collapsed containers)
  const getNodeEffectivePos = (nodeId: string): { x: number; y: number; isCollapsed: boolean; containerId?: string } | null => {
    const parentContainer = containers.find((c) => c.isCollapsed && c.nodeIds.includes(nodeId));
    if (parentContainer) {
      const cMembers = nodes.filter((n) => parentContainer.nodeIds.includes(n.id));
      const cX =
        parentContainer.collapsedX ??
        (cMembers.length > 0 ? cMembers.reduce((a, n) => a + n.x, 0) / cMembers.length : 400);
      const cY =
        parentContainer.collapsedY ??
        (cMembers.length > 0 ? cMembers.reduce((a, n) => a + n.y, 0) / cMembers.length : 300);
      return { x: cX, y: cY, isCollapsed: true, containerId: parentContainer.id };
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    return { x: node.x, y: node.y, isCollapsed: false };
  };

  // Toggle container collapsed state
  const handleToggleContainerCollapse = (containerId: string) => {
    const target = containers.find((c) => c.id === containerId);
    if (!target || !onUpdateContainer) return;

    const memberNodes = nodes.filter((n) => target.nodeIds.includes(n.id));
    const avgX = memberNodes.length > 0 ? memberNodes.reduce((a, n) => a + n.x, 0) / memberNodes.length : 400;
    const avgY = memberNodes.length > 0 ? memberNodes.reduce((a, n) => a + n.y, 0) / memberNodes.length : 300;

    onUpdateContainer({
      ...target,
      isCollapsed: !target.isCollapsed,
      collapsedX: target.collapsedX ?? avgX,
      collapsedY: target.collapsedY ?? avgY,
    });
  };

  // Alignment actions for selected nodes
  const handleAlignHorizontal = () => {
    if (selectedNodeIds.length < 2 || !onUpdateMultipleNodePositions) return;
    const targetNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    const avgY = Math.round(targetNodes.reduce((acc, n) => acc + n.y, 0) / targetNodes.length);
    const updates = targetNodes.map((n) => ({ id: n.id, x: n.x, y: avgY }));
    onUpdateMultipleNodePositions(updates);
  };

  const handleAlignVertical = () => {
    if (selectedNodeIds.length < 2 || !onUpdateMultipleNodePositions) return;
    const targetNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    const avgX = Math.round(targetNodes.reduce((acc, n) => acc + n.x, 0) / targetNodes.length);
    const updates = targetNodes.map((n) => ({ id: n.id, x: avgX, y: n.y }));
    onUpdateMultipleNodePositions(updates);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      const touch = e.touches[0];
      if (touch) {
        onSelectNode(null);
        onSelectLink(null);
        if (onSelectContainer) onSelectContainer(null);
        if (onMultiSelectNodes) onMultiSelectNodes([]);
        setIsPanning(true);
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleCanvasMouseDown}
      onTouchStart={handleCanvasTouchStart}
      onWheel={handleWheel}
      className="relative flex-1 h-full bg-slate-950 overflow-hidden cursor-crosshair select-none"
      style={getCanvasBackground()}
    >
      {/* Zoom / Viewport & Grid Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg backdrop-blur-md">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
          title="Zooma in"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium text-slate-400 px-1 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          title="Zooma ut"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Återställ vy (100% & centrerad)"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        {/* Magnetic Snap Button */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          title={`Magnetiskt rutnät (${snapToGrid ? 'PÅ' : 'AV'}). Enheter snäpper automatiskt.`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            snapToGrid
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Magnet className={`w-3.5 h-3.5 ${snapToGrid ? 'text-cyan-400 animate-pulse' : ''}`} />
          <span className="font-mono text-[11px] hidden sm:inline">Magnet: {snapToGrid ? 'PÅ' : 'AV'}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${snapToGrid ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`} />
        </button>

        {/* Create Container / Subnet Cloud Button */}
        {onOpenContainerModal && (
          <button
            onClick={() => onOpenContainerModal(null, selectedNodeIds.length > 0 ? selectedNodeIds : undefined)}
            title="Skapa ny Container / Subnet-moln för att gruppera och strukturera enheter"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 shadow-sm transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium hidden md:inline">+ Container</span>
          </button>
        )}

        {/* Grid Visual Style Switcher */}
        <button
          onClick={() => {
            const styles: Array<'dots' | 'lines' | 'blueprint' | 'off'> = ['dots', 'lines', 'blueprint', 'off'];
            const next = styles[(styles.indexOf(gridStyle) + 1) % styles.length];
            setGridStyle(next);
          }}
          title="Växla rutnätsstil (Dots / Linjer / Blueprint / Dold)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] capitalize">{gridStyle}</span>
        </button>

        {/* Grid Size Cycle Button */}
        <button
          onClick={() => {
            const sizes = [20, 40, 60];
            const nextSize = sizes[(sizes.indexOf(gridSize) + 1) % sizes.length];
            setGridSize(nextSize);
          }}
          title="Justera rutnätsavstånd (20px / 40px / 60px)"
          className="px-2 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
        >
          {gridSize}px
        </button>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          onClick={handleToggleDebugger}
          title="Växla Visual Debugger (Visa IP-adresser & subnät direkt på canvas)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            isDebuggerActive
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Bug className={`w-3.5 h-3.5 ${isDebuggerActive ? 'text-cyan-400 animate-pulse' : ''}`} />
          <span className="font-mono text-[11px] hidden sm:inline">Debugger: {isDebuggerActive ? 'PÅ' : 'AV'}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isDebuggerActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`} />
        </button>

        {nodesWithWarningsCount > 0 && (
          <>
            <div className="w-px h-4 bg-slate-800 mx-0.5" />
            <button
              onClick={() => onOpenAutoRepair && onOpenAutoRepair()}
              title={`${nodesWithWarningsCount} enheter har konfigurationsfel. Klicka för att öppna Assistenten eller fixa automatiskt!`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/60 shadow-sm shadow-rose-500/20 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
              <span className="font-mono text-[11px]">{nodesWithWarningsCount} Fel</span>
              <span className="bg-rose-500 text-slate-950 px-1.5 py-0.2 text-[9px] rounded font-black">
                Fixa
              </span>
            </button>
          </>
        )}
      </div>

      {/* Connection Mode Banner */}
      {connectingNodeId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-900/95 border border-cyan-500/80 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full animate-ping"
              style={{
                backgroundColor: currentCableDef.color,
                boxShadow: `0 0 12px ${currentCableDef.color}`,
              }}
            />
            <span className="text-slate-200 font-medium">
              Kopplar kabel från{' '}
              <strong className="text-cyan-300 font-bold">
                {nodes.find((n) => n.id === connectingNodeId)?.name || 'Enhet'}
              </strong>{' '}
              med kabeltyp <span className="font-mono text-amber-300 font-bold">{currentCableDef.name} ({currentCableDef.badge})</span>
            </span>
          </div>

          <span className="text-slate-400 hidden md:inline">• Klicka på målenhet för att slutföra</span>

          <button
            type="button"
            onClick={() => {
              setConnectingNodeId(null);
              setConnectingTargetNodeId(null);
              setDragPointer(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[11px] border border-slate-700 transition cursor-pointer"
          >
            Avbryt (ESC)
          </button>
        </div>
      )}

      {/* Main Canvas World Layer */}
      <div
        className="absolute top-0 left-0 origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }}
      >
        {/* SVG Containers Background Frames & Links Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-attack-high" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" result="blur1" />
              <feGaussianBlur stdDeviation="2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-magenta" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="target-threat-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="55%" stopColor="#ef4444" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="target-malware-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#d946ef" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="target-mitm-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="target-scan-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#f43f5e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Render Expanded Containers Framing (Backdrop SVG) */}
          {containers.map((c) => {
            if (c.isCollapsed) return null;
            const memberNodes = nodes.filter((n) => c.nodeIds.includes(n.id));
            if (memberNodes.length === 0) return null;

            const minX = Math.min(...memberNodes.map((n) => n.x)) - 75;
            const maxX = Math.max(...memberNodes.map((n) => n.x)) + 75;
            const minY = Math.min(...memberNodes.map((n) => n.y)) - 85;
            const maxY = Math.max(...memberNodes.map((n) => n.y)) + 65;
            const width = Math.max(240, maxX - minX);
            const height = Math.max(160, maxY - minY);

            const theme = CONTAINER_THEMES[c.color] || CONTAINER_THEMES.cyan;
            const isSelected = selectedContainerId === c.id;

            return (
              <g key={`container-frame-${c.id}`} className="pointer-events-auto">
                <rect
                  x={minX}
                  y={minY}
                  width={width}
                  height={height}
                  rx={20}
                  ry={20}
                  fill={theme.bgFill}
                  stroke={isSelected ? theme.hexColor : theme.borderStroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={c.type === 'subnet_cloud' ? '6,6' : undefined}
                  className="transition-colors cursor-pointer"
                  onClick={() => onSelectContainer && onSelectContainer(c.id)}
                />
              </g>
            );
          })}

          {/* Wi-Fi Coverage Radii */}
          {nodes.map((node) => {
            if (!node.on || !node.wifiCoverageRadius) return null;
            return (
              <circle
                key={`wifi-rad-${node.id}`}
                cx={node.x}
                cy={node.y}
                r={node.wifiCoverageRadius}
                className="fill-teal-500/5 stroke-teal-500/20 stroke-dasharray-[4_4] animate-spin-slow pointer-events-none"
                style={{ animationDuration: '40s' }}
              />
            );
          })}

          {/* Render Cable Links */}
          {links.map((link) => {
            const posA = getNodeEffectivePos(link.a);
            const posB = getNodeEffectivePos(link.b);
            if (!posA || !posB) return null;

            // If both endpoints are inside the same collapsed container, skip internal link render
            if (posA.isCollapsed && posB.isCollapsed && posA.containerId === posB.containerId) {
              return null;
            }

            const nodeA = nodes.find((n) => n.id === link.a);
            const nodeB = nodes.find((n) => n.id === link.b);
            const isSelected = selectedLinkId === link.id;
            const isTesting = testingLinkIds.includes(link.id);
            const isUp = (nodeA?.on ?? true) && (nodeB?.on ?? true);

            const pathD = calculateLinkPath(posA.x, posA.y, posB.x, posB.y);

            const cableDef = CABLE_DEFINITIONS[link.type] || CABLE_DEFINITIONS.cat6;
            let strokeColor = cableDef.color;
            let strokeWidth = cableDef.strokeWidth;
            let dashArray = cableDef.dashArray;

            if (!isUp) {
              strokeColor = '#475569';
              dashArray = '4,6';
            }

            return (
              <g key={link.id} className="pointer-events-auto">
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="18"
                  className="cursor-pointer"
                  onClick={() => onSelectLink(link.id)}
                />

                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#a855f7' : isTesting ? '#f59e0b' : strokeColor}
                  strokeWidth={isSelected || isTesting ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={dashArray}
                  className={`transition-all duration-200 cursor-pointer ${
                    isSelected ? 'filter drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]' : ''
                  } ${isTesting ? 'filter drop-shadow-[0_0_12px_rgba(245,158,11,1)] animate-pulse' : ''}`}
                  onClick={() => onSelectLink(link.id)}
                />

                {isUp && (
                  <circle
                    r={link.type === 'fiber' ? 4 : 3.5}
                    fill={link.type === 'fiber' ? '#f472b6' : strokeColor}
                    filter="url(#glow-cyan)"
                  >
                    <animateMotion
                      path={pathD}
                      dur={`${Math.max(0.8, 3.5 - Math.min(link.bandwidthMbps, 5000) / 1200)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Real-time Infection Spreading Visual Line & Particle Effects */}
                {isUp && (nodeA?.isInfected || nodeB?.isInfected) && (
                  <g key={`link-inf-${link.id}`} className="pointer-events-none">
                    {/* Outer Plasma Glow */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth={strokeWidth + 6}
                      strokeOpacity="0.4"
                      filter="url(#glow-attack-high)"
                      className="animate-pulse"
                    />

                    {/* Animated Pulsing Laser Flow */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth={strokeWidth + 1}
                      strokeDasharray="8,6"
                      strokeOpacity="0.95"
                      className="animate-laser-flow"
                    />

                    {/* High Intensity Spark Core */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeDasharray="4,8"
                      strokeOpacity="0.9"
                      className="animate-laser-flow"
                    />

                    {/* Infection Biohazard Particle Stream */}
                    <circle r="4.5" fill="#f43f5e" filter="url(#glow-attack-high)">
                      <animateMotion path={pathD} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3.5" fill="#ffffff" filter="url(#glow-attack-high)">
                      <animateMotion path={pathD} dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="4" fill="#d946ef" filter="url(#glow-attack-high)">
                      <animateMotion path={pathD} dur="1.2s" begin="0.8s" repeatCount="indefinite" />
                    </circle>

                    {/* Midpoint Infection Warning Badge */}
                    <g transform={`translate(${(posA.x + posB.x) / 2}, ${(posA.y + posB.y) / 2})`}>
                      <rect
                        x="-44"
                        y="-10"
                        width="88"
                        height="20"
                        rx="10"
                        fill="rgba(136, 19, 55, 0.95)"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        className="animate-pulse shadow-md"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#fecdd3"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        letterSpacing="0.5"
                      >
                        ☣️ SMITTSPRIDNING
                      </text>
                    </g>
                  </g>
                )}
              </g>
            );
          })}

          {/* Active Hacker Attack Overlays, Concentric Shockwaves & Data Streams */}
          {nodes
            .filter((node) => isHackerDevice(node.type) && node.on && node.hackerAttackActive)
            .map((hackerNode) => {
              const targetNode = nodes.find(
                (n) => n.on && ((n.ip && n.ip === hackerNode.hackerTargetIp) || n.id === hackerNode.hackerTargetIp)
              );
              if (!targetNode) return null;

              const pathD = calculateLinkPath(hackerNode.x, hackerNode.y, targetNode.x, targetNode.y);
              const intensity = hackerNode.hackerAttackIntensity || 'aggressive';
              const attackType = hackerNode.hackerAttackType || 'port_scan';

              const flowDur =
                intensity === 'brute-force-flood'
                  ? '0.35s'
                  : intensity === 'aggressive'
                  ? '0.75s'
                  : '1.5s';

              const shockwaveDur =
                intensity === 'brute-force-flood'
                  ? '1.1s'
                  : intensity === 'aggressive'
                  ? '1.6s'
                  : '2.4s';

              const config = (() => {
                switch (attackType) {
                  case 'ddos':
                    return {
                      primary: '#ef4444',
                      secondary: '#fca5a5',
                      glow: 'url(#glow-attack-high)',
                      aura: 'url(#target-threat-aura)',
                      label: 'DDOS SYN-FLOOD',
                      icon: '⚡',
                      badgeBg: 'rgba(127, 29, 29, 0.9)',
                      badgeBorder: '#ef4444',
                    };
                  case 'malware_injection':
                    return {
                      primary: '#ec4899',
                      secondary: '#f472b6',
                      glow: 'url(#glow-magenta)',
                      aura: 'url(#target-malware-aura)',
                      label: 'SKADLIG KOD / EXPLOIT',
                      icon: '☣️',
                      badgeBg: 'rgba(112, 26, 117, 0.9)',
                      badgeBorder: '#ec4899',
                    };
                  case 'mitm':
                    return {
                      primary: '#f59e0b',
                      secondary: '#fde047',
                      glow: 'url(#glow-amber)',
                      aura: 'url(#target-mitm-aura)',
                      label: 'MITM ARP POISON',
                      icon: '🕵️',
                      badgeBg: 'rgba(120, 53, 15, 0.9)',
                      badgeBorder: '#f59e0b',
                    };
                  case 'port_scan':
                  default:
                    return {
                      primary: '#f43f5e',
                      secondary: '#38bdf8',
                      glow: 'url(#glow-attack-high)',
                      aura: 'url(#target-scan-aura)',
                      label: 'PORT SCANNING RECON',
                      icon: '🔍',
                      badgeBg: 'rgba(136, 19, 55, 0.9)',
                      badgeBorder: '#f43f5e',
                    };
                }
              })();

              const midX = (hackerNode.x + targetNode.x) / 2;
              const midY = (hackerNode.y + targetNode.y) / 2 - 14;

              return (
                <g key={`hacker-atk-${hackerNode.id}`}>
                  {/* --- TARGET NODE IMPACT ZONE & EXPANDING PULSES --- */}
                  {/* Danger Zone Radial Backdrop */}
                  <circle
                    cx={targetNode.x}
                    cy={targetNode.y}
                    r="62"
                    fill={config.aura}
                    className="animate-pulse"
                  />

                  {/* Concentric Expanding Shockwave Rings (Target) */}
                  <circle cx={targetNode.x} cy={targetNode.y} r="20" fill="none" stroke={config.primary} strokeWidth="2.5" opacity="0.85" filter={config.glow}>
                    <animate attributeName="r" values="22;80" dur={shockwaveDur} repeatCount="indefinite" begin="0s" />
                    <animate attributeName="opacity" values="0.9;0" dur={shockwaveDur} repeatCount="indefinite" begin="0s" />
                    <animate attributeName="stroke-width" values="3;0.5" dur={shockwaveDur} repeatCount="indefinite" begin="0s" />
                  </circle>

                  <circle cx={targetNode.x} cy={targetNode.y} r="20" fill="none" stroke={config.primary} strokeWidth="2" opacity="0.8" filter={config.glow}>
                    <animate attributeName="r" values="22;80" dur={shockwaveDur} repeatCount="indefinite" begin={`${parseFloat(shockwaveDur) * 0.33}s`} />
                    <animate attributeName="opacity" values="0.85;0" dur={shockwaveDur} repeatCount="indefinite" begin={`${parseFloat(shockwaveDur) * 0.33}s`} />
                    <animate attributeName="stroke-width" values="2.5;0.5" dur={shockwaveDur} repeatCount="indefinite" begin={`${parseFloat(shockwaveDur) * 0.33}s`} />
                  </circle>

                  <circle cx={targetNode.x} cy={targetNode.y} r="20" fill="none" stroke={config.secondary} strokeWidth="1.5" opacity="0.8">
                    <animate attributeName="r" values="22;80" dur={shockwaveDur} repeatCount="indefinite" begin={`${parseFloat(shockwaveDur) * 0.66}s`} />
                    <animate attributeName="opacity" values="0.8;0" dur={shockwaveDur} repeatCount="indefinite" begin={`${parseFloat(shockwaveDur) * 0.66}s`} />
                    <animate attributeName="stroke-width" values="2;0.5" dur={shockwaveDur} repeatCount="indefinite" begin={`${parseFloat(shockwaveDur) * 0.66}s`} />
                  </circle>

                  {/* Rotating Targeting Reticle Crosshair around Target */}
                  <g transform={`translate(${targetNode.x}, ${targetNode.y})`}>
                    <circle
                      r="46"
                      fill="none"
                      stroke={config.primary}
                      strokeWidth="1.5"
                      strokeDasharray="6,6"
                      className="animate-radar-spin"
                      strokeOpacity="0.75"
                    />
                    {/* Targeting Corner Ticks */}
                    <line x1="-38" y1="-38" x2="-30" y2="-38" stroke={config.primary} strokeWidth="2" />
                    <line x1="-38" y1="-38" x2="-38" y2="-30" stroke={config.primary} strokeWidth="2" />
                    <line x1="38" y1="-38" x2="30" y2="-38" stroke={config.primary} strokeWidth="2" />
                    <line x1="38" y1="-38" x2="38" y2="-30" stroke={config.primary} strokeWidth="2" />
                    <line x1="-38" y1="38" x2="-30" y2="38" stroke={config.primary} strokeWidth="2" />
                    <line x1="-38" y1="38" x2="-38" y2="30" stroke={config.primary} strokeWidth="2" />
                    <line x1="38" y1="38" x2="30" y2="38" stroke={config.primary} strokeWidth="2" />
                    <line x1="38" y1="38" x2="38" y2="30" stroke={config.primary} strokeWidth="2" />
                  </g>

                  {/* --- HACKER SOURCE TRANSMITTING WAVES --- */}
                  <circle cx={hackerNode.x} cy={hackerNode.y} r="18" fill="none" stroke="#f43f5e" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="18;60" dur="1.8s" repeatCount="indefinite" begin="0s" />
                    <animate attributeName="opacity" values="0.85;0" dur="1.8s" repeatCount="indefinite" begin="0s" />
                  </circle>
                  <circle cx={hackerNode.x} cy={hackerNode.y} r="18" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.8">
                    <animate attributeName="r" values="18;60" dur="1.8s" repeatCount="indefinite" begin="0.9s" />
                    <animate attributeName="opacity" values="0.85;0" dur="1.8s" repeatCount="indefinite" begin="0.9s" />
                  </circle>

                  {/* --- ANIMATED HIGH-ENERGY LASER DATA STREAM --- */}
                  {/* Outer Diffuse Plasma Halo */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={config.primary}
                    strokeWidth="14"
                    strokeOpacity="0.16"
                    filter={config.glow}
                    className="animate-pulse"
                  />

                  {/* Secondary Pulsing Laser Stream */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={config.primary}
                    strokeWidth="4"
                    strokeDasharray={intensity === 'brute-force-flood' ? '8,4' : '14,8'}
                    strokeOpacity="0.85"
                    className="animate-laser-flow"
                  />

                  {/* Core High-Frequency White Spark Beam */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="6,12"
                    strokeOpacity="0.95"
                    className="animate-laser-flow"
                  />

                  {/* Flowing Projectile Particle Packets */}
                  {/* Primary Particle 1 */}
                  <circle r="5" fill={config.primary} filter={config.glow}>
                    <animateMotion path={pathD} dur={flowDur} repeatCount="indefinite" />
                  </circle>

                  {/* Primary Particle 2 */}
                  <circle r="3.5" fill="#ffffff" filter={config.glow}>
                    <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.25}s`} repeatCount="indefinite" />
                  </circle>

                  {/* Primary Particle 3 */}
                  <circle r="4.5" fill={config.secondary} filter={config.glow}>
                    <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.5}s`} repeatCount="indefinite" />
                  </circle>

                  {/* Primary Particle 4 */}
                  <circle r="3.5" fill="#ffffff" filter={config.glow}>
                    <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.75}s`} repeatCount="indefinite" />
                  </circle>

                  {/* High Intensity Extra Particle Surge */}
                  {intensity === 'brute-force-flood' && (
                    <>
                      <circle r="4" fill={config.primary} filter={config.glow}>
                        <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.125}s`} repeatCount="indefinite" />
                      </circle>
                      <circle r="3.5" fill="#ffffff" filter={config.glow}>
                        <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.375}s`} repeatCount="indefinite" />
                      </circle>
                      <circle r="4" fill={config.primary} filter={config.glow}>
                        <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.625}s`} repeatCount="indefinite" />
                      </circle>
                      <circle r="3.5" fill="#ffffff" filter={config.glow}>
                        <animateMotion path={pathD} dur={flowDur} begin={`${parseFloat(flowDur) * 0.875}s`} repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* --- MID-PATH ATTACK VECTOR HUD CAPSULE --- */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-85"
                      y="-12"
                      width="170"
                      height="24"
                      rx="12"
                      fill={config.badgeBg}
                      stroke={config.badgeBorder}
                      strokeWidth="1.5"
                      className="shadow-lg"
                      filter={config.glow}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      {config.icon} {config.label}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Temporary Cable during Drag-to-Connect */}
          {connectingNodeId && dragPointer && (
            <path
              d={(() => {
                const sourceNode = nodes.find((n) => n.id === connectingNodeId);
                if (!sourceNode) return '';
                return calculateLinkPath(sourceNode.x, sourceNode.y, dragPointer.x, dragPointer.y);
              })()}
              fill="none"
              stroke={currentCableDef.color || '#a855f7'}
              strokeWidth={Math.max(2.5, currentCableDef.strokeWidth)}
              strokeDasharray="4,4"
              className="animate-pulse"
            />
          )}

          {/* Smart Alignment Magnetic Guidelines */}
          {activeGuidelines.map((guide, idx) => {
            if (guide.type === 'x') {
              return (
                <g key={`guide-x-${idx}`}>
                  <line
                    x1={guide.coord}
                    y1={0}
                    x2={guide.coord}
                    y2={CANVAS_HEIGHT}
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    className="opacity-90"
                  />
                  <rect
                    x={guide.coord - 45}
                    y={12}
                    width={90}
                    height={18}
                    rx={4}
                    fill="#082f49"
                    stroke="#0284c7"
                    strokeWidth={1}
                  />
                  <text
                    x={guide.coord}
                    y={24}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    X: {Math.round(guide.coord)}px
                  </text>
                </g>
              );
            }
            if (guide.type === 'y') {
              return (
                <g key={`guide-y-${idx}`}>
                  <line
                    x1={0}
                    y1={guide.coord}
                    x2={CANVAS_WIDTH}
                    y2={guide.coord}
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    className="opacity-90"
                  />
                  <rect
                    x={12}
                    y={guide.coord - 9}
                    width={90}
                    height={18}
                    rx={4}
                    fill="#082f49"
                    stroke="#0284c7"
                    strokeWidth={1}
                  />
                  <text
                    x={57}
                    y={guide.coord + 3}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Y: {Math.round(guide.coord)}px
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Marquee Selection Visual Box */}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startX, selectionBox.currentX)}
              y={Math.min(selectionBox.startY, selectionBox.currentY)}
              width={Math.abs(selectionBox.currentX - selectionBox.startX)}
              height={Math.abs(selectionBox.currentY - selectionBox.startY)}
              fill="rgba(6, 182, 212, 0.12)"
              stroke="#06b6d4"
              strokeWidth={1.5}
              strokeDasharray="4,4"
              rx={6}
            />
          )}
        </svg>

        {/* Empty Canvas Workspace State */}
        {nodes.length === 0 && showEmptyGuidance && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md p-4 pointer-events-auto animate-fade-in">
            <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-4 relative group">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowEmptyGuidance(false)}
                title="Stäng skylt (Visa ren canvas)"
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Magnet className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Tom Nätverksarbetsyta
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Dra nätverksenheter från paletten till vänster eller klicka nedan för snabbstart.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <Magnet className="w-3 h-3" />
                  Magnet: {snapToGrid ? `PÅ (${gridSize}px)` : 'AV'}
                </span>
                <span className="text-slate-600">•</span>
                <span>Subnet-grupper & Moln</span>
              </div>

              {onQuickStart && (
                <div className="w-full pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onQuickStart}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>1-Klick Snabbstart</span>
                  </button>
                  {onSelectScenarioPreset && (
                    <button
                      type="button"
                      onClick={() => onSelectScenarioPreset('office_vlan')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Exempel-scenario</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowEmptyGuidance(false)}
                className="text-[11px] text-slate-400 hover:text-cyan-300 transition cursor-pointer font-medium pt-1"
              >
                ✕ Dölj denna skylt
              </button>
            </div>
          </div>
        )}

        {/* Minimal Floating Guidance Bar when empty and dismissed */}
        {nodes.length === 0 && !showEmptyGuidance && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-full shadow-xl backdrop-blur-md text-xs text-slate-300 animate-fade-in">
            <span className="text-cyan-400 font-semibold text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tom arbetsyta
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[11px]">Dra hit enheter från vänster</span>
            <button
              type="button"
              onClick={() => setShowEmptyGuidance(true)}
              className="ml-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700 transition cursor-pointer"
            >
              Visa guide
            </button>
          </div>
        )}

        {/* Floating Canvas Top-Right Quick Layout & Note Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/90 border border-cyan-500/30 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in">
          {onAddStickyNote && (
            <button
              type="button"
              onClick={() => onAddStickyNote()}
              title="Skapa en Digital Post-it på canvassen för att dokumentera nätverket"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs shadow-md shadow-amber-400/20 transition cursor-pointer"
            >
              <StickyNoteIcon className="w-3.5 h-3.5 fill-amber-950" />
              <span>+ Ny Post-it</span>
            </button>
          )}

          {onQuickAutoLayout && nodes.length > 0 && (
            <button
              type="button"
              onClick={onQuickAutoLayout}
              title="1-Klick Automatisk D3 Layout-optimering (Trassla upp nätverk och linjera alla enheter)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 fill-slate-950" />
              <span>⚡ Auto-Layout</span>
            </button>
          )}
            {onOpenLayoutOptimizer && (
              <button
                type="button"
                onClick={onOpenLayoutOptimizer}
                title="Öppna D3 Layout-inställningar (Hierarkisk, Kraftfält, Ring, Rutnät)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-xs font-semibold transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Anpassa</span>
              </button>
            )}
          </div>

        {/* Render Expanded Container Headers & Interactive Overlays */}
        {containers.map((c) => {
          if (c.isCollapsed) return null;
          const memberNodes = nodes.filter((n) => c.nodeIds.includes(n.id));
          if (memberNodes.length === 0) return null;

          const minX = Math.min(...memberNodes.map((n) => n.x)) - 75;
          const minY = Math.min(...memberNodes.map((n) => n.y)) - 85;

          const theme = CONTAINER_THEMES[c.color] || CONTAINER_THEMES.cyan;
          const IconComp = CONTAINER_ICONS[c.type] || Cloud;

          return (
            <div
              key={`container-header-${c.id}`}
              style={{
                position: 'absolute',
                left: minX + 20,
                top: minY - 14,
              }}
              className="z-10 select-none"
            >
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingContainerId(c.id);
                  setContainerDragStart({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    initialPositions: memberNodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
                  });
                  if (onSelectContainer) onSelectContainer(c.id);
                  onDragStart?.();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  const touch = e.touches[0];
                  if (touch) {
                    setDraggingContainerId(c.id);
                    setContainerDragStart({
                      mouseX: touch.clientX,
                      mouseY: touch.clientY,
                      initialPositions: memberNodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
                    });
                    if (onSelectContainer) onSelectContainer(c.id);
                    onDragStart?.();
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${theme.headerBg} border ${theme.headerBorder} shadow-lg backdrop-blur-md cursor-move group hover:scale-[1.02] transition-transform`}
              >
                <IconComp className={`w-3.5 h-3.5 ${theme.text}`} />
                <span className="text-xs font-bold text-white tracking-tight">{c.name}</span>

                {c.subnet && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border`}>
                    {c.subnet}
                  </span>
                )}

                <span className="text-[10px] text-slate-400 font-medium">
                  ({memberNodes.length} st)
                </span>

                <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700/80">
                  {/* Collapse to Cloud button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleContainerCollapse(c.id);
                    }}
                    title="Komprimera till Subnet-moln"
                    className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>

                  {/* Edit Container button */}
                  {onOpenContainerModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenContainerModal(c);
                      }}
                      title="Redigera containerinställningar"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete / Ungroup button */}
                  {onDeleteContainer && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteContainer(c.id);
                      }}
                      title="Upplös container (Enheter tas inte bort)"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Render Collapsed Subnet Cloud Nodes */}
        {containers.map((c) => {
          if (!c.isCollapsed) return null;
          const memberNodes = nodes.filter((n) => c.nodeIds.includes(n.id));
          const centerX =
            c.collapsedX ??
            (memberNodes.length > 0 ? memberNodes.reduce((a, n) => a + n.x, 0) / memberNodes.length : 400);
          const centerY =
            c.collapsedY ??
            (memberNodes.length > 0 ? memberNodes.reduce((a, n) => a + n.y, 0) / memberNodes.length : 300);

          const theme = CONTAINER_THEMES[c.color] || CONTAINER_THEMES.cyan;
          const isSelected = selectedContainerId === c.id;

          return (
            <div
              key={`collapsed-cloud-${c.id}`}
              style={{
                position: 'absolute',
                left: centerX,
                top: centerY,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingContainerId(c.id);
                setContainerDragStart({
                  mouseX: e.clientX,
                  mouseY: e.clientY,
                  initialPositions: memberNodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
                  initialCollapsedPos: { x: centerX, y: centerY },
                });
                if (onSelectContainer) onSelectContainer(c.id);
                onDragStart?.();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleToggleContainerCollapse(c.id);
              }}
              className="z-10 group select-none cursor-move"
            >
              <div
                className={`relative px-4 py-3 rounded-2xl bg-slate-950/95 border-2 ${theme.cloudAura} flex items-center gap-3.5 backdrop-blur-xl transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-cyan-400 scale-105' : 'hover:scale-105'
                }`}
              >
                {/* Cloud icon with pulsing glow */}
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shrink-0 shadow-inner">
                  <Cloud className={`w-6 h-6 ${theme.text}`} />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${theme.badgeBg} animate-ping`} />
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white tracking-tight truncate max-w-[140px]">
                      {c.name}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono font-semibold text-cyan-300">
                    {c.subnet || 'Subnet-moln'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-medium">
                    {memberNodes.length} enheter komprimerade
                  </div>
                </div>

                {/* Expand back button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleContainerCollapse(c.id);
                  }}
                  title="Expandera nätverksenheter till normal vy"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition cursor-pointer shrink-0 shadow"
                >
                  <Maximize2 className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Render Device Nodes (Excluded if inside collapsed container) */}
        {nodes.map((node) => {
          // Check if parent container is collapsed
          const parentCollapsed = containers.find((c) => c.isCollapsed && c.nodeIds.includes(node.id));
          if (parentCollapsed) return null;

          const isSelected = selectedNodeId === node.id || selectedNodeIds.includes(node.id);
          const isConnectingSource = connectingNodeId === node.id;
          const isConnectingTarget = connectingTargetNodeId === node.id;
          const isOnline = node.on;
          const hasInternet = connectivityMap.get(node.id) ?? false;
          const warningInfo = detectNodeWarnings(node, nodes, links);
          const hasWarning = warningInfo.hasWarning;

          const healthStatus = calculateNodeAttackImpactAndHealth(node, nodes, capturedPackets);
          const isTargetOfAttack = healthStatus.isUnderAttack;
          const isHackerAttacking = isHackerDevice(node.type) && node.on && !!node.hackerAttackActive;
          const shouldShowHealthBar =
            healthStatus.isUnderAttack ||
            healthStatus.impactScore > 0 ||
            healthStatus.isInfected ||
            hoveredNodeId === node.id ||
            isSelected;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                  if (onToggleMultiSelectNode) {
                    onToggleMultiSelectNode(node.id, true);
                  }
                } else {
                  onSelectNode(node.id);
                  if (onMultiSelectNodes && !selectedNodeIds.includes(node.id)) {
                    onMultiSelectNodes([node.id]);
                  }
                  setDraggingNodeId(node.id);
                  setDragOffset({ x: 0, y: 0 });
                  onDragStart?.();
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
                if (onMultiSelectNodes && !selectedNodeIds.includes(node.id)) {
                  onMultiSelectNodes([node.id]);
                }
                setDraggingNodeId(node.id);
                setDragOffset({ x: 0, y: 0 });
                onDragStart?.();
              }}
              className="z-10 group select-none cursor-pointer"
            >
              {/* Sleek Tooltip on Hover */}
              {hoveredNodeId === node.id && !draggingNodeId && !connectingNodeId && (
                <NodeTooltip
                  node={node}
                  nodes={nodes}
                  links={links}
                  capturedPackets={capturedPackets}
                  hasInternet={hasInternet}
                  onOpenIpModal={onOpenIpModal}
                />
              )}

              {/* Active Hacker Attack HUD Badge above Target */}
              {isTargetOfAttack && (
                <div className="absolute -top-[48px] left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none animate-bounce">
                  <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.9)] rounded-full px-2.5 py-0.5 text-[10px] font-mono font-extrabold flex items-center gap-1.5 backdrop-blur-md">
                    <Skull className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>UNDER ANGREPP</span>
                  </div>
                </div>
              )}

              {/* Infected Malware HUD Badge above Node */}
              {node.isInfected && !isTargetOfAttack && (
                <div className="absolute -top-[48px] left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none animate-bounce">
                  <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.9)] rounded-full px-2.5 py-0.5 text-[10px] font-mono font-extrabold flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span className="text-rose-300 font-bold">☣️ INFEKTERAD</span>
                  </div>
                </div>
              )}

              {/* Active Hacker Transmitter HUD Badge */}
              {isHackerAttacking && !isTargetOfAttack && !node.isInfected && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none animate-pulse">
                  <div className="bg-rose-900/95 border border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.8)] rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md">
                    <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                    <span>SÄNDER ATTACK</span>
                  </div>
                </div>
              )}

              {/* Pulsing Infection Biohazard Aura Rings around Node */}
              {node.isInfected && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                  <div className="absolute w-24 h-24 rounded-full border-2 border-rose-500/70 bg-rose-500/20 animate-infection-aura" />
                  <div className="absolute w-24 h-24 rounded-full border-2 border-fuchsia-500/60 bg-fuchsia-500/15 animate-infection-aura" style={{ animationDelay: '0.7s' }} />
                </div>
              )}

              {/* Visual Health Bar (Real-Time Pulsing & Dynamic Color Shift Green -> Deep Red) */}
              {shouldShowHealthBar && !isHackerDevice(node.type) && (
                <div
                  className={`absolute ${
                    isTargetOfAttack ? '-top-[22px]' : '-top-4'
                  } left-1/2 -translate-x-1/2 z-25 w-[76px] pointer-events-none flex flex-col items-center transition-all duration-200`}
                >
                  {/* Outer Cyber Track */}
                  <div
                    className={`w-full bg-slate-950/90 p-[1.5px] rounded-full border shadow-lg backdrop-blur-md transition-all ${
                      healthStatus.isUnderAttack
                        ? `${healthStatus.color.borderClass} animate-pulse`
                        : 'border-slate-800'
                    }`}
                    style={{
                      boxShadow: healthStatus.isUnderAttack
                        ? `0 0 14px ${healthStatus.color.glow}, 0 2px 8px rgba(0,0,0,0.8)`
                        : '0 2px 6px rgba(0,0,0,0.6)',
                    }}
                  >
                    {/* Dynamic Health Fill Bar with Smooth Color Interpolation */}
                    <div
                      className="h-2 rounded-full transition-all duration-300 relative overflow-hidden flex items-center justify-end"
                      style={{
                        width: `${Math.max(8, healthStatus.health)}%`,
                        backgroundColor: healthStatus.color.hex,
                        boxShadow: `0 0 10px ${healthStatus.color.glow}`,
                      }}
                    >
                      {/* Real-time Pulsing Shimmer Light Wave when under attack */}
                      {healthStatus.isUnderAttack && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Real-time Health / Attack Impact Micro Pill */}
                  {(healthStatus.isUnderAttack ||
                    healthStatus.impactScore > 0 ||
                    hoveredNodeId === node.id ||
                    isSelected) && (
                    <div
                      className={`mt-0.5 px-1.5 py-[0.5px] rounded-full text-[8.5px] font-mono font-extrabold flex items-center gap-1 border backdrop-blur-md shadow-md transition-all ${
                        healthStatus.isUnderAttack
                          ? 'bg-slate-950/95 border-rose-500/70'
                          : 'bg-slate-950/85 border-slate-800'
                      }`}
                      style={{
                        color: healthStatus.color.hex,
                      }}
                    >
                      <Activity className="w-2.5 h-2.5 animate-pulse shrink-0" />
                      <span>{healthStatus.health}%</span>
                      {healthStatus.impactScore > 0 && (
                        <span className="text-[7.5px] text-slate-400 font-sans border-l border-slate-700 pl-1">
                          Impact {healthStatus.impactScore}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Debugger Pill (if enabled and not under attack badge) */}
              {isDebuggerActive && !isTargetOfAttack && !isHackerAttacking && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none">
                  <div
                    className={`bg-slate-950/90 border ${
                      hasWarning
                        ? 'border-rose-500/70 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        : 'border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    } rounded-full px-2 py-0.5 text-[9.5px] font-mono leading-tight flex items-center gap-1 backdrop-blur-md`}
                  >
                    <span className="font-bold">
                      {node.type === 'internet' ? '203.0.113.1 (WAN)' : node.ip ? `${node.ip}${maskToCidr(node.subnetMask)}` : 'DHCP'}
                    </span>
                    {node.vlanId && (
                      <span className="text-purple-300 font-semibold pl-1 border-l border-slate-700">VLAN {node.vlanId}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Main Device Node Box */}
              {(() => {
                const catStyles = getNodeCategoryClasses(node.type, isSelected);
                return (
                  <div
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border-2 transition-all duration-150 ${catStyles.bg} ${
                      isTargetOfAttack
                        ? 'border-rose-500 ring-4 ring-rose-500/70 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-cyber-glitch scale-105 z-20'
                        : node.isInfected
                        ? 'border-rose-500 ring-4 ring-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.95)] animate-infected-pulse scale-105 z-20'
                        : isHackerAttacking
                        ? 'border-rose-500 ring-4 ring-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse'
                        : isConnectingTarget
                        ? 'border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.9)] scale-110 animate-bounce'
                        : isConnectingSource
                        ? 'border-amber-400 ring-4 ring-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.8)] scale-105 animate-pulse'
                        : hasWarning
                        ? 'border-rose-500/80 ring-2 ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : catStyles.border
                    }`}
                  >
                    {/* Warning Icon Badge */}
                    {hasWarning && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAutoRepairNode) {
                            onAutoRepairNode(node.id);
                          } else if (onOpenAutoRepair) {
                            onOpenAutoRepair();
                          }
                        }}
                        className="absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md border border-slate-950 transition hover:scale-110 cursor-pointer"
                        title={`Varning: ${warningInfo.issues.join(' | ')}. Klicka för att konfigurera.`}
                      >
                        <AlertTriangle className="w-3 h-3 text-white stroke-[2.5]" />
                      </button>
                    )}
 
                    {/* Online / Connectivity / Infection Status LED */}
                    <div
                      className={`absolute top-1.5 right-1.5 rounded-full transition-all ${
                        node.isInfected
                          ? 'w-3 h-3 bg-rose-500 ring-2 ring-rose-300 shadow-[0_0_12px_#f43f5e] animate-ping'
                          : !isOnline
                          ? 'w-2 h-2 bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : hasInternet
                          ? 'w-2 h-2 bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'w-2 h-2 bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                      }`}
                      title={
                        node.isInfected
                          ? '⚠️ SKADLIG KOD UPPTÄCKT! Noden är infekterad.'
                          : !isOnline
                          ? 'Enhet avstängd'
                          : hasInternet
                          ? 'Ansluten till Internet (Full WAN-åtkomst)'
                          : 'Isolerat lokalnätverk (Inget Internet)'
                      }
                    />
 
                    {/* Device Icon */}
                    <div className="p-1">{renderDeviceIcon(node.type)}</div>
 
                    {/* Cable Connector Handle / Pin */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        connectStartPosRef.current = { x: e.clientX, y: e.clientY };
                        setConnectingNodeId(node.id);
                        setDragPointer({ x: node.x, y: node.y });
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (connectingNodeId && connectingNodeId !== node.id) {
                          onAddLink(connectingNodeId, node.id);
                          setConnectingNodeId(null);
                          setConnectingTargetNodeId(null);
                          setDragPointer(null);
                        } else {
                          setConnectingNodeId(node.id);
                          setDragPointer({ x: node.x, y: node.y });
                        }
                      }}
                      title="Klicka eller dra härifrån till en annan enhet för att ansluta kabel"
                      className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center cursor-crosshair transition-all shadow-md z-20 ${
                        isConnectingSource
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/60 scale-110 animate-pulse'
                          : isConnectingTarget
                          ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/80 scale-125 animate-bounce'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:scale-125 opacity-90 group-hover:opacity-100 shadow-cyan-500/50'
                      }`}
                    >
                      <Cable className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })()}

              {/* Device Labels & On-Canvas Badges */}
              <div className="mt-1.5 text-center min-w-[110px] max-w-[155px] mx-auto pointer-events-none flex flex-col items-center">
                {/* Device Name */}
                <div
                  className={`text-xs font-semibold truncate max-w-[145px] tracking-tight flex items-center justify-center gap-1 ${
                    isLight
                      ? 'text-slate-900 font-bold bg-white/95 px-2 py-0.5 rounded-lg shadow-sm border border-slate-300'
                      : 'text-slate-100 drop-shadow-md'
                  }`}
                >
                  {node.isInfected && <span className="text-rose-400 font-bold animate-pulse" title="Infekterad enhet">☣️</span>}
                  <span>{node.name}</span>
                </div>

                {/* On-Canvas IP Address (Shown by default unless showIpOnCanvas is false) */}
                {node.showIpOnCanvas !== false && (
                  <div
                    className={`text-[10px] font-mono truncate mt-0.5 flex items-center justify-center gap-1 ${
                      isLight
                        ? 'text-sky-950 font-bold bg-sky-100/95 px-1.5 py-0.5 rounded-md border border-sky-300 shadow-xs'
                        : 'text-cyan-400/90'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLight ? 'bg-sky-600' : 'bg-cyan-400'}`} />
                    <span>{node.type === 'internet' ? 'WAN Gateway' : node.ip || 'DHCP...'}</span>
                  </div>
                )}

                {/* On-Canvas MAC Address (Shown when showMacOnCanvas is true) */}
                {node.showMacOnCanvas && (
                  <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-950/95 border border-emerald-500/50 text-[9px] font-mono text-emerald-300 font-bold shadow-md shadow-emerald-950/60 backdrop-blur-md animate-fade-in whitespace-nowrap">
                    <span className="text-[7.5px] px-1 py-[0.5px] rounded bg-emerald-500/20 text-emerald-400 uppercase font-black tracking-wider">
                      MAC
                    </span>
                    <span>{node.mac || '00:50:56:00:00:00'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Digital Post-its Layer */}
        {stickyNotes.map((note) => (
          <StickyNoteCard
            key={note.id}
            note={note}
            zoom={zoom}
            onUpdate={onUpdateStickyNote ? onUpdateStickyNote : () => {}}
            onDelete={onDeleteStickyNote ? onDeleteStickyNote : () => {}}
            onDragStart={(e, noteId) => {
              e.stopPropagation();
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
              const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
              const mouseCanvasX = (clientX - rect.left - pan.x) / zoom;
              const mouseCanvasY = (clientY - rect.top - pan.y) / zoom;
              setDraggingNoteId(noteId);
              setNoteDragOffset({
                x: mouseCanvasX - note.x,
                y: mouseCanvasY - note.y,
              });
              onDragStart?.();
            }}
          />
        ))}
      </div>

      {/* Floating Multi-Selection Action Toolbar */}
      {selectedNodeIds.length >= 2 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/95 border border-cyan-500/80 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in text-xs">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Sparkles className="w-4 h-4" />
            <span>{selectedNodeIds.length} Enheter markerade</span>
          </div>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          {/* Group into Container / Subnet Cloud */}
          {onOpenContainerModal && (
            <button
              type="button"
              onClick={() => onOpenContainerModal(null, selectedNodeIds)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 fill-slate-950" />
              <span>Gruppera i Subnet-moln / Container</span>
            </button>
          )}

          {/* Align Horizontally */}
          {onUpdateMultipleNodePositions && (
            <button
              type="button"
              onClick={handleAlignHorizontal}
              title="Linjera alla markerade enheter på samma horisontella rad"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition cursor-pointer"
            >
              <AlignHorizontalJustifyCenter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Linjera Horisontellt</span>
            </button>
          )}

          {/* Align Vertically */}
          {onUpdateMultipleNodePositions && (
            <button
              type="button"
              onClick={handleAlignVertical}
              title="Linjera alla markerade enheter på samma vertikala kolumn"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition cursor-pointer"
            >
              <AlignVerticalJustifyCenter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Linjera Vertikalt</span>
            </button>
          )}

          {/* Clear multi-selection */}
          {onMultiSelectNodes && (
            <button
              type="button"
              onClick={() => onMultiSelectNodes([])}
              title="Avmarkera"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Floating Specialized Cable Quick Toolbar */}
      {onSelectCableType && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/95 border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-[95vw] overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1 px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-sans shrink-0">
            <Cable className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Kabel:</span>
          </div>

          {(
            [
              'auto',
              'cat6',
              'crossover',
              'fiber',
              'wifi',
              'serial',
              'coaxial',
              'console',
            ] as CableType[]
          ).map((cKey) => {
            const def = CABLE_DEFINITIONS[cKey];
            const isSelected = activeCableType === cKey;

            return (
              <button
                key={cKey}
                type="button"
                onClick={() => onSelectCableType(cKey)}
                title={`${def.name} (${def.badge}): ${def.specializedFor}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 border border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: def.color,
                    boxShadow: isSelected ? `0 0 8px ${def.color}` : 'none',
                  }}
                />
                <span className="text-[11px] truncate">{def.shortName}</span>
                <span
                  className="text-[9px] font-mono font-bold px-1 rounded hidden md:inline"
                  style={{
                    backgroundColor: `${def.color}15`,
                    color: def.color,
                  }}
                >
                  {def.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Network Topology Minimap View */}
      <Minimap
        nodes={nodes}
        links={links}
        containers={containers}
        selectedNodeId={selectedNodeId}
        selectedNodeIds={selectedNodeIds}
        zoom={zoom}
        pan={pan}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
        containerRef={containerRef}
        onPanChange={setPan}
        onZoomChange={setZoom}
        onResetView={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
      />
    </div>
  );
};
