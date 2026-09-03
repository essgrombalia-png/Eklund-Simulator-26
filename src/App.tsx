import React, { useState, useEffect, useMemo } from 'react';
import { Topbar } from './components/Topbar';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { Inspector } from './components/Inspector';
import { DeviceTerminal } from './components/DeviceTerminal';
import { PacketInspector } from './components/PacketInspector';
import { NetworkStats } from './components/NetworkStats';
import { TrafficGeneratorModal } from './components/TrafficGeneratorModal';
import { SubnetCalculatorModal } from './components/SubnetCalculatorModal';
import { ExportImportModal } from './components/ExportImportModal';
import { IpConfigModal } from './components/IpConfigModal';
import { AutoRepairModal } from './components/AutoRepairModal';
import { CyberDefenseModal } from './components/CyberDefenseModal';
import { CyberAwarenessModal } from './components/CyberAwarenessModal';
import { AntivirusModal } from './components/AntivirusModal';
import { IncidentResponseModal } from './components/IncidentResponseModal';
import { ContainerModal } from './components/ContainerModal';
import { LayoutOptimizerModal } from './components/LayoutOptimizerModal';
import { ScenarioModal } from './components/ScenarioModal';
import { ScenarioBanner } from './components/ScenarioBanner';
import { CyberQuizModal } from './components/CyberQuizModal';
import { LandingPage } from './components/LandingPage';
import { MatrixRain } from './components/MatrixRain';
import { SettingsModal } from './components/SettingsModal';
import { SCENARIOS } from './data/scenarios';
import { PROBLEM_SCENARIOS } from './data/problemScenarios';
import {
  Device,
  Link,
  DeviceType,
  CableType,
  ScenarioPreset,
  ProblemScenario,
  CapturedPacket,
  NetworkContainer,
  StickyNote,
  StickyNoteColor,
  IncidentLog,
  AdvancedSettings,
  UserProfile,
  SimulatorThemeId,
} from './types';
import {
  loadSavedSettings,
  saveSettingsToStorage,
  loadSavedProfile,
  saveProfileToStorage,
  SIMULATOR_THEMES,
} from './utils/themeManager';
import {
  createIncidentFromPacket,
  generateInitialIncidentLogs,
} from './utils/incidentManager';
import {
  computeNetworkConnectivity,
  findPathAndSimulate,
  createCapturePacket,
} from './utils/networkEngine';
import {
  CABLE_DEFINITIONS,
  resolveAutoCable,
} from './utils/cableEngine';
import {
  diagnoseNetwork,
  autoRepairAll,
  autoRepairConnectionBetween,
  repairSingleDevice,
} from './utils/autoRepairEngine';
import {
  autoSelectTargetForHacker,
  findReachableTargetsForHacker,
  generateAttackDetails,
  advanceKillChainStage,
  ATTACK_PROFILES,
  isHackerDevice,
  executeWormOutbreakAttack,
} from './utils/hackerEngine';
import { playSound } from './utils/audioSynth';
import { optimizeNetworkLayout } from './utils/d3Layout';
import { Play, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Zap, Wrench, Skull, ShieldAlert, ChevronRight, ChevronLeft, Terminal } from 'lucide-react';
import { useHistory } from './hooks/useHistory';
import { useRef } from 'react';

export default function App() {
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('custom');

  // User Authentication State loaded from localStorage
  const [currentUser, setCurrentUser] = useState<{ email: string; username: string } | null>(() => {
    const saved = localStorage.getItem('eklund_current_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Advanced Settings & Theme State
  const [settings, setSettings] = useState<AdvancedSettings>(() => loadSavedSettings());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    currentUser ? loadSavedProfile(currentUser.email) : null
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleUpdateSettings = (updated: AdvancedSettings) => {
    setSettings(updated);
    saveSettingsToStorage(updated);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveProfileToStorage(updated);
  };

  // Sync user profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const p = loadSavedProfile(currentUser.email);
      setUserProfile(p);
    } else {
      setUserProfile(null);
    }
  }, [currentUser?.email]);

  // History State
  const history = useHistory({
    nodes: [],
    links: [],
    containers: [],
    stickyNotes: [],
  });
  const {
    nodes,
    links,
    containers,
    stickyNotes = [],
    canUndo,
    canRedo,
    undo,
    redo,
    pushSnapshot,
    pushSnapshotWithCustomPast,
    resetHistory,
    setPresentDirectly,
  } = history;

  const handleLogout = () => {
    localStorage.removeItem('eklund_current_user');
    resetHistory({ nodes: [], links: [], containers: [], stickyNotes: [] });
    setCurrentScenarioId('custom');
    setCurrentUser(null);
  };

  // Atomic Topology Updater Helper
  const updateTopology = (
    updater: {
      nodes?: Device[] | ((prev: Device[]) => Device[]);
      links?: Link[] | ((prev: Link[]) => Link[]);
      containers?: NetworkContainer[] | ((prev: NetworkContainer[]) => NetworkContainer[]);
      stickyNotes?: StickyNote[] | ((prev: StickyNote[]) => StickyNote[]);
    },
    label?: string
  ) => {
    const nextNodes = updater.nodes
      ? (typeof updater.nodes === 'function' ? updater.nodes(nodes) : updater.nodes)
      : nodes;
    const nextLinks = updater.links
      ? (typeof updater.links === 'function' ? updater.links(links) : updater.links)
      : links;
    const nextContainers = updater.containers
      ? (typeof updater.containers === 'function' ? updater.containers(containers) : updater.containers)
      : containers;
    const nextStickyNotes = updater.stickyNotes
      ? (typeof updater.stickyNotes === 'function' ? updater.stickyNotes(stickyNotes) : updater.stickyNotes)
      : stickyNotes;

    pushSnapshot(
      { nodes: nextNodes, links: nextLinks, containers: nextContainers, stickyNotes: nextStickyNotes },
      label || 'Ändring'
    );
  };

  // Sticky Note Handlers
  const handleAddStickyNote = (x?: number, y?: number, text?: string, color?: StickyNoteColor) => {
    const newNote: StickyNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: 'Anteckning',
      text: text ?? '',
      x: x ?? 320,
      y: y ?? 220,
      color: color || 'yellow',
      width: 240,
      height: 180,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    updateTopology({ stickyNotes: (prev) => [...prev, newNote] }, 'Lade till digital Post-it');
  };

  const handleUpdateStickyNote = (updatedNote: StickyNote) => {
    updateTopology(
      { stickyNotes: (prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)) },
      'Uppdaterade Post-it'
    );
  };

  const handleDeleteStickyNote = (id: string) => {
    updateTopology({ stickyNotes: (prev) => prev.filter((n) => n.id !== id) }, 'Tog bort Post-it');
  };

  // Backwards compatible state-setters for any other component calls
  const setNodes = (newNodesVal: Device[] | ((prev: Device[]) => Device[])) => {
    const nextNodes = typeof newNodesVal === 'function' ? newNodesVal(nodes) : newNodesVal;
    updateTopology({ nodes: nextNodes });
  };

  const setLinks = (newLinksVal: Link[] | ((prev: Link[]) => Link[])) => {
    const nextLinks = typeof newLinksVal === 'function' ? newLinksVal(links) : newLinksVal;
    updateTopology({ links: nextLinks });
  };

  const setContainers = (newContainersVal: NetworkContainer[] | ((prev: NetworkContainer[]) => NetworkContainer[])) => {
    const nextContainers = typeof newContainersVal === 'function' ? newContainersVal(containers) : newContainersVal;
    updateTopology({ containers: nextContainers });
  };

  // Auto-Save Topology to localStorage every 30 seconds
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const [hasAutoSavedBackup, setHasAutoSavedBackup] = useState<boolean>(false);

  // Check if there is an existing auto-save backup in localStorage on initial mount
  useEffect(() => {
    try {
      const backup = localStorage.getItem('eklund_topology_autosave');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
          setHasAutoSavedBackup(true);
        }
      }
    } catch (e) {
      console.warn('Could not read auto-save backup from localStorage', e);
    }
  }, []);

  // Periodic Auto-Save every 30s
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (nodes.length > 0 || links.length > 0 || containers.length > 0 || stickyNotes.length > 0) {
        try {
          const payload = {
            nodes,
            links,
            containers,
            stickyNotes,
            timestamp: new Date().toISOString(),
            formattedTime: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          localStorage.setItem('eklund_topology_autosave', JSON.stringify(payload));
          setLastAutoSavedTime(payload.formattedTime);
          setHasAutoSavedBackup(true);
        } catch (e) {
          console.warn('Auto-save to localStorage failed', e);
        }
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [nodes, links, containers, stickyNotes]);

  const handleRestoreAutoSave = () => {
    try {
      const backup = localStorage.getItem('eklund_topology_autosave');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed && Array.isArray(parsed.nodes)) {
          resetHistory({
            nodes: parsed.nodes,
            links: Array.isArray(parsed.links) ? parsed.links : [],
            containers: Array.isArray(parsed.containers) ? parsed.containers : [],
            stickyNotes: Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [],
          });
          setPingLogs((prev) => [
            `✓ Återställde automatisk säkerhetskopia från ${parsed.formattedTime || 'tidigare session'}.`,
            ...prev,
          ]);
        }
      }
    } catch (e) {
      console.error('Failed to restore auto-save', e);
    }
  };


  // Drag tracking refs
  const dragStartStateRef = useRef<{ nodes: Device[]; links: Link[]; containers: NetworkContainer[] } | null>(null);

  const handleDragStart = () => {
    dragStartStateRef.current = { nodes, links, containers };
  };

  const handleDragEnd = () => {
    if (dragStartStateRef.current) {
      pushSnapshotWithCustomPast(
        dragStartStateRef.current,
        { nodes, links, containers },
        'Flyttade enheter'
      );
      dragStartStateRef.current = null;
    }
  };

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [activeCableType, setActiveCableType] = useState<CableType>('auto');

  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  const [activeTab, setActiveTab] = useState<'canvas' | 'terminal' | 'packets' | 'traffic' | 'stats'>('canvas');
  const [showMiniTerminal, setShowMiniTerminal] = useState(false);

  // Modals
  const [showSubnetCalc, setShowSubnetCalc] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showTrafficGen, setShowTrafficGen] = useState(false);
  const [showAutoRepairModal, setShowAutoRepairModal] = useState(false);
  const [showCyberDefenseModal, setShowCyberDefenseModal] = useState(false);
  const [showCyberAwarenessModal, setShowCyberAwarenessModal] = useState(false);
  const [showAntivirusModal, setShowAntivirusModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showLayoutOptimizerModal, setShowLayoutOptimizerModal] = useState(false);
  const [showVisualDebugger, setShowVisualDebugger] = useState(false);
  const [showCyberQuizModal, setShowCyberQuizModal] = useState(false);
  const [quizScenarioId, setQuizScenarioId] = useState<string | null>(null);
  const [quizScenarioTitle, setQuizScenarioTitle] = useState<string | null>(null);

  // Incident Response Realtime Tracker State
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);

  // Seed initial incident logs if hackers/infected nodes exist in topology
  useEffect(() => {
    if (nodes.length > 0) {
      setIncidents((prev) => {
        if (prev.length === 0) {
          return generateInitialIncidentLogs(nodes, links);
        }
        return prev;
      });
    }
  }, [nodes, links]);

  // Layout Optimization Handler
  const handleApplyLayout = (updatedNodes: Device[], historyLabel: string = 'D3 Layout-optimering') => {
    updateTopology({ nodes: updatedNodes }, historyLabel);
    setPingLogs((prev) => [
      `✨ D3 Layout-optimering slutförd: ${updatedNodes.length} noder har sorterats snyggt.`,
      ...prev,
    ]);
  };

  const handleQuickAutoLayout = () => {
    if (nodes.length === 0) return;
    const canvasWidth = window.innerWidth > 1400 ? 1400 : 1200;
    const canvasHeight = window.innerHeight > 900 ? 900 : 750;

    const optimized = optimizeNetworkLayout(nodes, links, {
      algorithm: 'hierarchical',
      nodeSpacing: 140,
      ticks: 300,
      canvasWidth,
      canvasHeight,
      padding: 90,
    });

    handleApplyLayout(optimized, '⚡ 1-Klick D3 Layout-optimering');
  };
  const [ipConfigModalNode, setIpConfigModalNode] = useState<Device | null>(null);
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [editingContainer, setEditingContainer] = useState<NetworkContainer | null>(null);
  const [containerModalSelectedNodeIds, setContainerModalSelectedNodeIds] = useState<string[]>([]);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [activeProblemScenario, setActiveProblemScenario] = useState<ProblemScenario | null>(null);
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eklund_completed_scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSelectProblemScenario = (sc: ProblemScenario) => {
    setActiveProblemScenario(sc);
    setCurrentScenarioId(sc.id);
    resetHistory({
      nodes: JSON.parse(JSON.stringify(sc.initialNodes)),
      links: JSON.parse(JSON.stringify(sc.initialLinks)),
      containers: JSON.parse(JSON.stringify(sc.initialContainers || [])),
    });
    setPingLogs((prev) => [
      `🎯 Startade scenario "${sc.title}" (${sc.category} - ${sc.difficulty}).`,
      ...prev,
    ]);
  };

  const handleResetProblemScenario = () => {
    if (activeProblemScenario) {
      resetHistory({
        nodes: JSON.parse(JSON.stringify(activeProblemScenario.initialNodes)),
        links: JSON.parse(JSON.stringify(activeProblemScenario.initialLinks)),
        containers: JSON.parse(JSON.stringify(activeProblemScenario.initialContainers || [])),
      });
      setPingLogs((prev) => [
        `🔄 Återställde scenario "${activeProblemScenario.title}" till ursprungsläget.`,
        ...prev,
      ]);
    }
  };

  const handleExitProblemScenario = () => {
    setActiveProblemScenario(null);
    setCurrentScenarioId('custom');
    setPingLogs((prev) => [`Lämnade scenarioläget.`, ...prev]);
  };

  const handleScenarioCompleted = (scenarioId: string) => {
    setCompletedScenarioIds((prev) => {
      if (prev.includes(scenarioId)) return prev;
      const next = [...prev, scenarioId];
      localStorage.setItem('eklund_completed_scenarios', JSON.stringify(next));
      return next;
    });

    // Populate quiz scenario tie-in
    const foundSc = PROBLEM_SCENARIOS.find((s) => s.id === scenarioId);
    setQuizScenarioId(scenarioId);
    setQuizScenarioTitle(foundSc ? foundSc.title : 'Nätverksscenario');
  };

  // Connection Test Ping State
  const [testFromId, setTestFromId] = useState<string>('');
  const [testToId, setTestToId] = useState<string>('');
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [lastPingSuccess, setLastPingSuccess] = useState<boolean | null>(null);
  const [pingLogs, setPingLogs] = useState<string[]>([
    'Välkommen till Eklund Simulator 26. Dra enheter från paletten till det magnetiska rutnätet för att börja bygga.',
  ]);

  // Active testing links for visual animation
  const [testingLinkIds, setTestingLinkIds] = useState<string[]>([]);

  // Captured packets sniffer state
  const [capturedPackets, setCapturedPackets] = useState<CapturedPacket[]>([]);

  // Realtime diagnosed issues
  const detectedIssues = useMemo(() => {
    return diagnoseNetwork(nodes, links);
  }, [nodes, links]);

  // Calculate network connectivity (nodes connected to Internet WAN)
  const connectivityMap = useMemo(() => {
    return computeNetworkConnectivity(nodes, links);
  }, [nodes, links]);

  // Set default test dropdowns when nodes change
  useEffect(() => {
    if (nodes.length >= 2) {
      if (!testFromId || !nodes.some((n) => n.id === testFromId)) {
        setTestFromId(nodes[0].id);
      }
      if (!testToId || !nodes.some((n) => n.id === testToId)) {
        setTestToId(nodes[nodes.length - 1].id);
      }
    }
  }, [nodes]);

  // Global shortcut listeners for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.altKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  // Auto-connect hacker auto-targeting safeguard when links or nodes change
  useEffect(() => {
    let hadChanges = false;
    const updatedNodes = nodes.map((n) => {
      if (isHackerDevice(n.type) && n.on && n.hackerAutoAttack !== false) {
        const isConnected = links.some((l) => l.a === n.id || l.b === n.id);
        if (isConnected) {
          const currentTarget = nodes.find(
            (t) => (t.ip === n.hackerTargetIp || t.id === n.hackerTargetIp) && t.on
          );
          if (!currentTarget || !n.hackerAttackActive) {
            const newTarget = autoSelectTargetForHacker(n, nodes, links);
            if (newTarget) {
              hadChanges = true;
              return {
                ...n,
                hackerAttackActive: true,
                hackerTargetIp: newTarget.ip || newTarget.id,
                hackerAttackType: n.hackerAttackType || 'autonomous_ai',
                hackerKillChainStage: n.hackerKillChainStage || 'RECON',
              };
            }
          }
        }
      }
      return n;
    });

    if (hadChanges) {
      setPresentDirectly({ nodes: updatedNodes, links, containers });
    }
  }, [nodes, links, containers, setPresentDirectly]);

  // Background hacker attack scheduler
  const attackCycleCounter = useRef<Record<string, number>>({});

  useEffect(() => {
    const activeHackers = nodes.filter(
      (n) => isHackerDevice(n.type) && n.on && n.hackerAttackActive && n.hackerTargetIp
    );
    if (activeHackers.length === 0) return;

    const interval = setInterval(() => {
      activeHackers.forEach((hacker) => {
        const target = nodes.find(
          (n) => n.on && ((n.ip && n.ip === hacker.hackerTargetIp) || n.id === hacker.hackerTargetIp)
        );
        if (!target) return;

        const intensity = hacker.hackerAttackIntensity || 'aggressive';
        const attackType = hacker.hackerAttackType || 'autonomous_ai';

        // Probability check per tick
        const tickChance =
          intensity === 'low-noise'
            ? 0.35
            : intensity === 'aggressive'
            ? 0.75
            : intensity === 'brute-force-flood'
            ? 1.0
            : 1.0; // apocalyptic
        if (Math.random() > tickChance) return;

        // Number of packets per tick
        const count =
          intensity === 'apocalyptic'
            ? 8
            : intensity === 'brute-force-flood'
            ? 5
            : intensity === 'aggressive'
            ? 2
            : 1;

        // Advance AI Kill Chain stage every 3 cycles if autonomous
        if (attackType === 'autonomous_ai') {
          const currentCount = (attackCycleCounter.current[hacker.id] || 0) + 1;
          attackCycleCounter.current[hacker.id] = currentCount;
          if (currentCount % 3 === 0) {
            const nextStage = advanceKillChainStage(hacker.hackerKillChainStage);
            handleUpdateNode({
              ...hacker,
              hackerKillChainStage: nextStage,
            });
          }
        }

        for (let i = 0; i < count; i++) {
          const stage = hacker.hackerKillChainStage || 'RECON';
          const details = generateAttackDetails(hacker, target, attackType, true, stage);

          const proto = details.protocol;
          const res = findPathAndSimulate(
            hacker.id,
            target.id,
            nodes,
            links,
            proto === 'ARP' ? 'ICMP' : proto === 'DNS' ? 'DNS' : (proto as any)
          );

          const finalDetails = generateAttackDetails(hacker, target, attackType, res.success, stage);

          const newPkt = createCapturePacket(
            hacker,
            target,
            proto as any,
            res.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
            res.success
              ? finalDetails.info
              : `BLOCKED_BY_FIREWALL: Attack pattern (${finalDetails.protocol}) matched rule list. Packet dropped.`,
            res.pathNodes.length
          );

          if (finalDetails.payloadSummary) {
            newPkt.payload = finalDetails.payloadSummary;
          }

          setCapturedPackets((prev) => [newPkt, ...prev.slice(0, 199)]);

          // Push to Incident Response Real-Time Dashboard
          const incidentEntry = createIncidentFromPacket(newPkt, nodes);
          if (incidentEntry) {
            setIncidents((prev) => [incidentEntry, ...prev.slice(0, 99)]);
          }

          // Process attack consequences: Server crashes, worm propagation, and infection
          if (res.success) {
            if (attackType === 'server_crash') {
              // Server or target device crashed offline
              handleUpdateNode({
                ...target,
                on: false,
                isInfected: true,
                services: target.services
                  ? {
                      ...target.services,
                      http: false,
                      dns: false,
                      sql: false,
                      vpn: false,
                      mail: false,
                    }
                  : undefined,
              });
              playSound('alarm', true, 0.4);
            } else if (attackType === 'worm_outbreak') {
              // Global worm spread
              const wormRes = executeWormOutbreakAttack(hacker, nodes, links);
              if (wormRes.infectedCount > 0) {
                handleUpdateMultipleNodes(wormRes.updatedNodes);
                setTestingLinkIds(wormRes.animatedLinkIds);
                setTimeout(() => setTestingLinkIds([]), 1500);
              }
            } else if (attackType === 'ddos' && intensity === 'apocalyptic') {
              // Apocalyptic DDoS storm knocks device offline
              handleUpdateNode({
                ...target,
                on: false,
                isInfected: true,
              });
              playSound('alarm', true, 0.4);
            } else if (finalDetails.isBreach && !target.isInfected) {
              handleUpdateNode({
                ...target,
                isInfected: true,
              });
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nodes, links]);

  // Clear All
  const handleClearAll = () => {
    updateTopology({ nodes: [], links: [], containers: [], stickyNotes: [] }, 'Rensade ritytan');
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    setSelectedLinkId(null);
    setSelectedContainerId(null);
    setLastPingSuccess(null);
    setPingLogs(['Nätverksytan rensad.']);
  };

  // Select Scenario Preset
  const handleSelectScenario = (preset: ScenarioPreset) => {
    setCurrentScenarioId(preset.id);
    resetHistory({
      nodes: preset.nodes,
      links: preset.links,
      containers: preset.containers || [],
      stickyNotes: preset.stickyNotes || [],
    });
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    setSelectedLinkId(null);
    setSelectedContainerId(null);
    setLastPingSuccess(null);
    setPingLogs([`Exempel topologi "${preset.title}" inläst.`]);
  };

  const handleSelectScenarioPreset = (presetId: string) => {
    if (presetId === 'empty') {
      handleClearAll();
      return;
    }
    const preset = SCENARIOS.find((s) => s.id === presetId);
    if (preset) {
      handleSelectScenario(preset);
    }
  };

  // Quick Start starter topology
  const handleQuickStart = () => {
    const starterNodes: Device[] = [
      {
        id: 'n_wan',
        type: 'internet',
        name: 'Internet WAN',
        ip: '',
        subnetMask: '',
        gateway: '',
        mac: '00:50:56:00:00:01',
        x: 320,
        y: 280,
        on: true,
      },
      {
        id: 'n_router',
        type: 'router',
        name: 'Core Router 1',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:50:56:00:00:02',
        x: 520,
        y: 280,
        on: true,
        dhcpEnabled: true,
        dhcpRange: { start: '192.168.1.100', end: '192.168.1.200' },
      },
      {
        id: 'n_switch',
        type: 'switch',
        name: 'Huvudswitch 1',
        ip: '192.168.1.2',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:50:56:00:00:03',
        x: 720,
        y: 280,
        on: true,
      },
      {
        id: 'n_pc1',
        type: 'client_pc',
        name: 'Arbetsstation 1',
        ip: '192.168.1.10',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:50:56:00:00:10',
        x: 640,
        y: 440,
        on: true,
      },
      {
        id: 'n_pc2',
        type: 'client_pc',
        name: 'Arbetsstation 2',
        ip: '192.168.1.11',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:50:56:00:00:11',
        x: 800,
        y: 440,
        on: true,
      },
    ];

    const starterLinks: Link[] = [
      {
        id: 'l_wan_rtr',
        a: 'n_wan',
        b: 'n_router',
        type: 'fiber',
        bandwidthMbps: 1000,
        latencyMs: 1,
        packetLossPercent: 0,
        duplex: 'full',
      },
      {
        id: 'l_rtr_sw',
        a: 'n_router',
        b: 'n_switch',
        type: 'cat6',
        bandwidthMbps: 1000,
        latencyMs: 1,
        packetLossPercent: 0,
        duplex: 'full',
      },
      {
        id: 'l_sw_pc1',
        a: 'n_switch',
        b: 'n_pc1',
        type: 'cat6',
        bandwidthMbps: 1000,
        latencyMs: 1,
        packetLossPercent: 0,
        duplex: 'full',
      },
      {
        id: 'l_sw_pc2',
        a: 'n_switch',
        b: 'n_pc2',
        type: 'cat6',
        bandwidthMbps: 1000,
        latencyMs: 1,
        packetLossPercent: 0,
        duplex: 'full',
      },
    ];

    resetHistory({
      nodes: starterNodes,
      links: starterLinks,
      containers: [],
    });
    setSelectedNodeId(null);
    setSelectedLinkId(null);
    setLastPingSuccess(null);
    setPingLogs(['⚡ Snabbstart initialiserad: Router, Switch och 2 Arbetsstationer inlästa.']);
  };

  // Add Device Node
  const handleAddDevice = (type: DeviceType) => {
    const id = 'n_' + Date.now().toString(36);
    const count = nodes.filter((n) => n.type === type).length + 1;

    const namesMap: Record<string, string> = {
      internet: 'Internet WAN',
      firewall: `Brandvägg ${count}`,
      router: `Core Router ${count}`,
      wifi_router: `WiFi Router ${count}`,
      load_balancer: `Load Balancer ${count}`,
      ids_ips: `IDS/IPS Sensor ${count}`,
      l3_switch: `L3 Switch ${count}`,
      switch: `L2 Switch ${count}`,
      wifi_ap: `Access Point ${count}`,
      server_web: `Webbserver ${count}`,
      server_dns: `DNS Server ${count}`,
      server_db: `SQL Databas ${count}`,
      server_mail: `Mailserver ${count}`,
      server_nas: `NAS Lagring ${count}`,
      server_vpn: `VPN Gateway ${count}`,
      client_pc: `PC ${count}`,
      client_laptop: `Laptop ${count}`,
      client_mobile: `Mobil ${count}`,
      client_printer: `Skrivare ${count}`,
      client_camera: `IP-Kamera ${count}`,
      client_pos: `Kassaterminal ${count}`,
      iot_sensor: `IoT Sensor ${count}`,
      iot_camera: `Smart IP-Kamera ${count}`,
      iot_thermostat: `Smart Termostat ${count}`,
      iot_smartlock: `Smart Dörrlås ${count}`,
      iot_light: `Smart Belysning ${count}`,
      iot_plc: `PLC Styrenhet ${count}`,
      iot_gateway: `IoT Gateway ${count}`,
      iot_smart_meter: `Smart Elmätare ${count}`,
      iot_speaker: `Smart Högtalare ${count}`,
      hacker: `Hackarterminal ${count}`,
      hacker_botnet: `DDoS Botnet Master ${count}`,
      hacker_pineapple: `WiFi Pineapple ${count}`,
      hacker_c2: `C2 Server ${count}`,
      hacker_implant: `Rogue Implant TAP ${count}`,
      hacker_stager: `Exploit Stager ${count}`,
      quantum_qkd: `Kvantkryptering QKD ${count}`,
      ai_cluster: `AI Superdator ${count}`,
      sdwan_edge: `SD-WAN Gateway ${count}`,
      scada_rtu: `SCADA RTU Relä ${count}`,
      satellite_ground: `Satellitlänk Parabol ${count}`,
      casb_proxy: `CASB Zero-Trust Proxy ${count}`,
    };

    const isHacker = isHackerDevice(type);
    const defaultAttackType =
      type === 'hacker_botnet'
        ? 'ddos'
        : type === 'hacker_pineapple'
        ? 'mitm'
        : type === 'hacker_c2'
        ? 'malware_injection'
        : type === 'hacker_implant'
        ? 'mitm'
        : type === 'hacker_stager'
        ? 'zero_day'
        : 'autonomous_ai';

    const newNode: Device = {
      id,
      type,
      name: namesMap[type] || `Enhet ${count}`,
      ip: type === 'internet' ? '' : `192.168.1.${10 + nodes.length}`,
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      mac: `00:50:56:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
      x: 350 + (nodes.length % 5) * 80,
      y: 250 + Math.floor(nodes.length / 5) * 80,
      on: true,
      ...(isHacker
        ? {
            hackerAttackActive: false,
            hackerAutoAttack: true,
            hackerAttackIntensity: 'aggressive',
            hackerAttackType: defaultAttackType,
            hackerKillChainStage: 'RECON',
            hackerStealthMode: false,
          }
        : {}),
    };

    updateTopology({ nodes: [...nodes, newNode] }, `La till enhet: ${newNode.name}`);
    setSelectedNodeId(newNode.id);
    setSelectedLinkId(null);
  };

  const handleAddNodeAtPosition = (type: DeviceType, x: number, y: number) => {
    const id = 'n_' + Date.now().toString(36);
    const count = nodes.filter((n) => n.type === type).length + 1;
    const isHacker = isHackerDevice(type);
    const defaultAttackType =
      type === 'hacker_botnet'
        ? 'ddos'
        : type === 'hacker_pineapple'
        ? 'mitm'
        : type === 'hacker_c2'
        ? 'malware_injection'
        : type === 'hacker_implant'
        ? 'mitm'
        : type === 'hacker_stager'
        ? 'zero_day'
        : 'autonomous_ai';

    const newNode: Device = {
      id,
      type,
      name: `${type.toUpperCase()} ${count}`,
      ip: type === 'internet' ? '' : `192.168.1.${10 + nodes.length}`,
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      mac: `00:50:56:11:22:${Math.floor(10 + Math.random() * 89)}`,
      x,
      y,
      on: true,
      ...(isHacker
        ? {
            hackerAttackActive: false,
            hackerAutoAttack: true,
            hackerAttackIntensity: 'aggressive',
            hackerAttackType: defaultAttackType,
            hackerKillChainStage: 'RECON',
            hackerStealthMode: false,
          }
        : {}),
    };

    updateTopology({ nodes: [...nodes, newNode] }, `La till enhet: ${newNode.name}`);
    setSelectedNodeId(newNode.id);
    setSelectedLinkId(null);
  };

  // Add Link
  const handleAddLink = (aId: string, bId: string, requestedCableType?: CableType) => {
    if (aId === bId) return;
    const exists = links.some(
      (l) => (l.a === aId && l.b === bId) || (l.a === bId && l.b === aId)
    );
    if (exists) return;

    const nodeA = nodes.find((n) => n.id === aId);
    const nodeB = nodes.find((n) => n.id === bId);
    if (!nodeA || !nodeB) return;

    // Resolve cable type (if 'auto', intelligently select based on device roles)
    const cableModeToUse = requestedCableType || activeCableType;
    const resolvedType: CableType =
      cableModeToUse === 'auto'
        ? resolveAutoCable(nodeA, nodeB)
        : cableModeToUse;

    const cableDef = CABLE_DEFINITIONS[resolvedType] || CABLE_DEFINITIONS.cat6;

    const newLink: Link = {
      id: 'l_' + Date.now().toString(36),
      a: aId,
      b: bId,
      type: resolvedType,
      bandwidthMbps: cableDef.bandwidthMbps,
      latencyMs: cableDef.latencyMs,
      packetLossPercent: 0,
      duplex: cableDef.duplex,
    };

    const nextLinks = [...links, newLink];
    let nextNodes = [...nodes];
    let autoAttackMsg = '';

    // If nodeA is a hacker device, auto-lock target and start attack
    if (isHackerDevice(nodeA.type) && nodeA.hackerAutoAttack !== false) {
      const target = autoSelectTargetForHacker(nodeA, [nodeB, ...nodes], nextLinks);
      if (target) {
        const attackTypeA =
          nodeA.hackerAttackType ||
          (nodeA.type === 'hacker_botnet'
            ? 'ddos'
            : nodeA.type === 'hacker_pineapple'
            ? 'mitm'
            : nodeA.type === 'hacker_c2'
            ? 'malware_injection'
            : nodeA.type === 'hacker_implant'
            ? 'mitm'
            : nodeA.type === 'hacker_stager'
            ? 'zero_day'
            : 'autonomous_ai');

        nextNodes = nextNodes.map((n) =>
          n.id === nodeA.id
            ? {
                ...n,
                hackerAttackActive: true,
                hackerAutoAttack: true,
                hackerTargetIp: target.ip || target.id,
                hackerAttackType: attackTypeA,
                hackerKillChainStage: 'RECON',
              }
            : n
        );
        autoAttackMsg = `⚡ AUTO-ATTACK: ${nodeA.name} anslöt till ${nodeB.name} och låste automatiskt siktet på ${target.name} (${target.ip || 'LAN'})!`;
      }
    }

    // If nodeB is a hacker device, auto-lock target and start attack
    if (isHackerDevice(nodeB.type) && nodeB.hackerAutoAttack !== false) {
      const target = autoSelectTargetForHacker(nodeB, [nodeA, ...nodes], nextLinks);
      if (target) {
        const attackTypeB =
          nodeB.hackerAttackType ||
          (nodeB.type === 'hacker_botnet'
            ? 'ddos'
            : nodeB.type === 'hacker_pineapple'
            ? 'mitm'
            : nodeB.type === 'hacker_c2'
            ? 'malware_injection'
            : nodeB.type === 'hacker_implant'
            ? 'mitm'
            : nodeB.type === 'hacker_stager'
            ? 'zero_day'
            : 'autonomous_ai');

        nextNodes = nextNodes.map((n) =>
          n.id === nodeB.id
            ? {
                ...n,
                hackerAttackActive: true,
                hackerAutoAttack: true,
                hackerTargetIp: target.ip || target.id,
                hackerAttackType: attackTypeB,
                hackerKillChainStage: 'RECON',
              }
            : n
        );
        autoAttackMsg = `⚡ AUTO-ATTACK: ${nodeB.name} anslöt till ${nodeA.name} och låste automatiskt siktet på ${target.name} (${target.ip || 'LAN'})!`;
      }
    }

    updateTopology(
      { nodes: nextNodes, links: nextLinks },
      `Anslöt ${nodeA.name} med ${nodeB.name}`
    );
    setSelectedLinkId(newLink.id);
    setSelectedNodeId(null);
    setPingLogs((prev) => [
      ...prev.slice(-10),
      `Anslöt ${nodeA.name} med ${nodeB.name} via ${cableDef.name} (${cableDef.badge})`,
      ...(autoAttackMsg ? [autoAttackMsg] : []),
    ]);
  };

  // Update Node
  const handleUpdateNode = (updated: Device) => {
    const nextNodes = nodes.map((n) => (n.id === updated.id ? updated : n));
    updateTopology({ nodes: nextNodes }, `Uppdaterade enhet: ${updated.name}`);
  };

  // Update Multiple Nodes
  const handleUpdateMultipleNodes = (updatedList: Device[]) => {
    const map = new Map(updatedList.map((n) => [n.id, n]));
    const nextNodes = nodes.map((n) => map.get(n.id) || n);
    updateTopology({ nodes: nextNodes }, `Uppdaterade flera enheter`);
  };

  // Delete Node
  const handleDeleteNode = (id: string) => {
    const targetNode = nodes.find((n) => n.id === id);
    const nextNodes = nodes.filter((n) => n.id !== id);
    const nextLinks = links.filter((l) => l.a !== id && l.b !== id);
    updateTopology({ nodes: nextNodes, links: nextLinks }, `Tog bort enhet: ${targetNode?.name || 'Enhet'}`);
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Update Link
  const handleUpdateLink = (updated: Link) => {
    const nextLinks = links.map((l) => (l.id === updated.id ? updated : l));
    updateTopology({ links: nextLinks }, `Uppdaterade anslutning`);
  };

  // Update Multiple Links
  const handleUpdateMultipleLinks = (updatedList: Link[]) => {
    const map = new Map(updatedList.map((l) => [l.id, l]));
    const nextLinks = links.map((l) => map.get(l.id) || l);
    updateTopology({ links: nextLinks }, `Uppdaterade flera anslutningar`);
  };

  // Delete Link
  const handleDeleteLink = (id: string) => {
    const nextLinks = links.filter((l) => l.id !== id);
    updateTopology({ links: nextLinks }, `Tog bort anslutning`);
    if (selectedLinkId === id) setSelectedLinkId(null);
  };

  // Node position drag
  const handleUpdateNodePosition = (id: string, x: number, y: number) => {
    const nextNodes = nodes.map((n) => (n.id === id ? { ...n, x, y } : n));
    setPresentDirectly({ nodes: nextNodes, links, containers, stickyNotes });
  };

  // Multiple node positions drag
  const handleUpdateMultipleNodePositions = (updates: { id: string; x: number; y: number }[]) => {
    const updatesMap = new Map(updates.map((u) => [u.id, { x: u.x, y: u.y }]));
    const nextNodes = nodes.map((n) => {
      const match = updatesMap.get(n.id);
      if (match) {
        return { ...n, x: match.x, y: match.y };
      }
      return n;
    });
    setPresentDirectly({ nodes: nextNodes, links, containers, stickyNotes });
  };

  // Container handlers
  const handleSaveContainer = (c: NetworkContainer) => {
    let nextContainers;
    const idx = containers.findIndex((existing) => existing.id === c.id);
    if (idx >= 0) {
      nextContainers = [...containers];
      nextContainers[idx] = c;
    } else {
      nextContainers = [...containers, c];
    }
    updateTopology({ containers: nextContainers }, `Sparade container: ${c.name}`);
    setPingLogs((prev) => [...prev, `Container "${c.name}" (${c.type}) sparades.`]);
  };

  const handleUpdateContainer = (updated: NetworkContainer) => {
    const nextContainers = containers.map((c) => (c.id === updated.id ? updated : c));
    updateTopology({ containers: nextContainers }, `Uppdaterade container: ${updated.name}`);
  };

  const handleDeleteContainer = (id: string) => {
    const targetC = containers.find((c) => c.id === id);
    const nextContainers = containers.filter((c) => c.id !== id);
    updateTopology({ containers: nextContainers }, `Tog bort container: ${targetC?.name || 'Container'}`);
    if (selectedContainerId === id) setSelectedContainerId(null);
    setPingLogs((prev) => [...prev, `Container togs bort.`]);
  };

  const handleOpenContainerModal = (container?: NetworkContainer | null, initialNodeIds?: string[]) => {
    setEditingContainer(container || null);
    setContainerModalSelectedNodeIds(initialNodeIds || (selectedNodeIds.length > 0 ? selectedNodeIds : []));
    setShowContainerModal(true);
  };

  // Multi-Select handlers
  const handleToggleMultiSelectNode = (id: string, isMulti: boolean) => {
    if (!isMulti) {
      setSelectedNodeId(id);
      setSelectedNodeIds([id]);
    } else {
      setSelectedNodeIds((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((item) => item !== id);
          if (selectedNodeId === id) setSelectedNodeId(next[0] || null);
          return next;
        } else {
          setSelectedNodeId(id);
          return [...prev, id];
        }
      });
    }
    setSelectedLinkId(null);
    setSelectedContainerId(null);
  };

  const handleMultiSelectNodes = (ids: string[]) => {
    setSelectedNodeIds(ids);
    if (ids.length > 0) {
      setSelectedNodeId(ids[0]);
    } else {
      setSelectedNodeId(null);
    }
    setSelectedLinkId(null);
    setSelectedContainerId(null);
  };

  // Auto-Repair a single device's issues
  const handleRepairNode = (nodeId: string) => {
    const res = repairSingleDevice(nodeId, nodes, links);
    setNodes(res.nodes);
    setLinks(res.links);

    const nodeName = nodes.find((n) => n.id === nodeId)?.name || 'Enheten';
    setPingLogs((prev) => [
      ...prev,
      `⚡ Auto-Fix klar för ${nodeName}: ${res.fixedIssues.join(', ')}`,
    ]);
  };

  // Auto-Repair path between testFromId and testToId
  const handleRepairPath = () => {
    if (!testFromId || !testToId) return;
    const res = autoRepairConnectionBetween(testFromId, testToId, nodes, links);
    setNodes(res.nodes);
    setLinks(res.links);

    const srcName = nodes.find((n) => n.id === testFromId)?.name || 'Källa';
    const dstName = nodes.find((n) => n.id === testToId)?.name || 'Mål';

    setPingLogs((prev) => [
      ...prev,
      `⚡ Auto-Fix slutförd för ${srcName} -> ${dstName}: ${res.fixLogs.join(', ') || 'Nätverksinställningar optimerade'}`,
    ]);

    // Immediately re-run ping test with the repaired nodes and links
    setTimeout(() => {
      setIsTestingPing(true);
      const testRes = findPathAndSimulate(testFromId, testToId, res.nodes, res.links, 'ICMP');
      setTestingLinkIds(testRes.pathLinks.map((l) => l.id));
      setPingLogs(testRes.logs);
      setLastPingSuccess(testRes.success);

      const srcNode = res.nodes.find((n) => n.id === testFromId);
      const dstNode = res.nodes.find((n) => n.id === testToId);
      if (srcNode && dstNode) {
        const newPkt = createCapturePacket(
          srcNode,
          dstNode,
          'ICMP',
          testRes.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
          testRes.success
            ? `Ping reply from ${dstNode.ip}: bytes=64 time=${testRes.latencyMs}ms TTL=64`
            : `Ping failed: ${testRes.logs[testRes.logs.length - 1] || 'Unreachable'}`,
          testRes.pathNodes.length
        );
        setCapturedPackets((prev) => [newPkt, ...prev]);
      }

      setTimeout(() => {
        setTestingLinkIds([]);
        setIsTestingPing(false);
      }, 1200);
    }, 150);
  };

  // Connection Test Ping
  const handleRunPingTest = () => {
    const srcNode = nodes.find((n) => n.id === testFromId);
    const dstNode = nodes.find((n) => n.id === testToId);

    if (!srcNode || !dstNode) return;

    setIsTestingPing(true);
    const res = findPathAndSimulate(srcNode.id, dstNode.id, nodes, links, 'ICMP');

    setTestingLinkIds(res.pathLinks.map((l) => l.id));
    setPingLogs(res.logs);
    setLastPingSuccess(res.success);

    // Create captured packet log entry
    const newPkt = createCapturePacket(
      srcNode,
      dstNode,
      'ICMP',
      res.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
      res.success
        ? `Ping reply from ${dstNode.ip}: bytes=64 time=${res.latencyMs}ms TTL=64`
        : `Ping failed: ${res.logs[res.logs.length - 1] || 'Unreachable'}`,
      res.pathNodes.length
    );

    setCapturedPackets((prev) => [newPkt, ...prev]);

    setTimeout(() => {
      setTestingLinkIds([]);
      setIsTestingPing(false);
    }, 1200);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedLink = links.find((l) => l.id === selectedLinkId) || null;
  const selectedContainer = containers.find((c) => c.id === selectedContainerId) || null;

  const onlineCount = nodes.filter((n) => connectivityMap.get(n.id)).length;
  const activeTheme = SIMULATOR_THEMES[settings.themeId] || SIMULATOR_THEMES.cyber_matrix;

  if (!currentUser) {
    return (
      <LandingPage
        currentSettings={settings}
        onUpdateSettings={handleUpdateSettings}
        onLoginSuccess={(user) => {
          resetHistory({ nodes: [], links: [], containers: [] });
          setCurrentScenarioId('custom');
          setCurrentUser(user);
          setUserProfile({
            username: user.username,
            email: user.email,
            avatarId: user.avatarId || 'avatar_cyber_hacker',
            avatarCustomUrl: user.avatarCustomUrl,
            roleTitle: user.roleTitle || 'Nätverksarkitekt',
            statusBadge: 'active',
          });
        }}
      />
    );
  }

  return (
    <div
      className="flex flex-col h-screen w-screen text-slate-100 overflow-hidden font-sans relative transition-colors duration-500"
      style={{ backgroundColor: activeTheme.bgCanvas }}
    >
      {/* Matrix Digital Code Rain Background Overlay */}
      {settings.matrixRainEnabled && (
        <MatrixRain
          opacity={settings.matrixRainOpacity}
          speed={settings.matrixRainSpeed}
          colorTheme={activeTheme.matrixTheme}
        />
      )}

      {/* Top Navigation Header */}
      <Topbar
        currentScenarioId={currentScenarioId}
        onSelectScenario={handleSelectScenario}
        onOpenScenarioModal={() => setShowScenarioModal(true)}
        completedScenarioCount={completedScenarioIds.length}
        onOpenCyberQuiz={() => {
          setQuizScenarioId(null);
          setQuizScenarioTitle(null);
          setShowCyberQuizModal(true);
        }}
        onOpenTerminal={() => setActiveTab('terminal')}
        onOpenPacketInspector={() => setActiveTab('packets')}
        onOpenTrafficGen={() => setShowTrafficGen(true)}
        onOpenSubnetCalc={() => setShowSubnetCalc(true)}
        onOpenExportImport={() => setShowExportImport(true)}
        onOpenLayoutOptimizer={() => setShowLayoutOptimizerModal(true)}
        onOpenAutoRepair={() => setShowAutoRepairModal(true)}
        onOpenCyberDefense={() => setShowCyberDefenseModal(true)}
        onOpenCyberAwareness={() => setShowCyberAwarenessModal(true)}
        onOpenAntivirus={() => setShowAntivirusModal(true)}
        onOpenIncidentResponse={() => setShowIncidentModal(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        incidentCount={incidents.length}
        issueCount={detectedIssues.length}
        onResetDemo={() => {
          const preset = SCENARIOS.find((s) => s.id === currentScenarioId) || SCENARIOS[0];
          handleSelectScenario(preset);
        }}
        onClearAll={handleClearAll}
        nodeCount={nodes.length}
        linkCount={links.length}
        onlineCount={onlineCount}
        lastAutoSavedTime={lastAutoSavedTime}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showMiniTerminal={showMiniTerminal}
        onToggleMiniTerminal={() => setShowMiniTerminal((prev) => !prev)}
        showVisualDebugger={showVisualDebugger}
        onToggleVisualDebugger={() => setShowVisualDebugger((prev) => !prev)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        currentUser={currentUser}
        userProfile={userProfile}
        currentThemeId={settings.themeId}
        onSelectTheme={(themeId) => handleUpdateSettings({ ...settings, themeId })}
        onLogout={handleLogout}
        nodes={nodes}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          setSelectedNodeIds(id ? [id] : []);
          if (id) {
            setSelectedLinkId(null);
            setSelectedContainerId(null);
          }
        }}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Palette */}
        {activeTab === 'canvas' && (
          <>
            {/* Backdrop for iPad/mobile when palette is open */}
            {!isPaletteCollapsed && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
                onClick={() => setIsPaletteCollapsed(true)}
              />
            )}
            <div className={`transition-all duration-300 ease-in-out flex shrink-0 ${
              isPaletteCollapsed 
                ? 'w-0 -translate-x-full absolute lg:relative z-40' 
                : 'w-72 translate-x-0 absolute lg:static z-40 h-full'
            }`}>
              <Palette
                onAddDevice={handleAddDevice}
                onAddStickyNote={handleAddStickyNote}
                activeCableType={activeCableType}
                onSelectCableType={setActiveCableType}
                isCollapsed={isPaletteCollapsed}
                onToggleCollapse={() => setIsPaletteCollapsed((prev) => !prev)}
              />
            </div>
          </>
        )}

        {/* Floating Palette Trigger when Collapsed */}
        {activeTab === 'canvas' && isPaletteCollapsed && (
          <button
            onClick={() => setIsPaletteCollapsed(false)}
            className="absolute left-3 top-3 z-30 p-2.5 rounded-xl bg-[#14110e]/95 backdrop-blur-md border border-[#2c2219] text-amber-400 hover:text-amber-300 hover:bg-[#201812] shadow-lg shadow-black/40 transition-all flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
            title="Visa enhetspalett"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Center Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {activeProblemScenario && activeTab === 'canvas' && (
            <ScenarioBanner
              scenario={activeProblemScenario}
              nodes={nodes}
              links={links}
              onExit={handleExitProblemScenario}
              onReset={handleResetProblemScenario}
              onScenarioCompleted={handleScenarioCompleted}
              onOpenCyberQuiz={(scId, scTitle) => {
                setQuizScenarioId(scId);
                setQuizScenarioTitle(scTitle);
                setShowCyberQuizModal(true);
              }}
            />
          )}

          {activeTab === 'canvas' && (
            <Canvas
              nodes={nodes}
              links={links}
              containers={containers}
              stickyNotes={stickyNotes}
              capturedPackets={capturedPackets}
              currentThemeId={settings.themeId}
              isLightMode={activeTheme.isLight}
              onAddStickyNote={handleAddStickyNote}
              onUpdateStickyNote={handleUpdateStickyNote}
              onDeleteStickyNote={handleDeleteStickyNote}
              selectedNodeId={selectedNodeId}
              selectedNodeIds={selectedNodeIds}
              selectedLinkId={selectedLinkId}
              selectedContainerId={selectedContainerId}
              connectivityMap={connectivityMap}
              testingLinkIds={testingLinkIds}
              activePacketAnimations={[]}
              showVisualDebugger={showVisualDebugger}
              onToggleVisualDebugger={() => setShowVisualDebugger((prev) => !prev)}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                setSelectedNodeIds(id ? [id] : []);
                if (id) {
                  setSelectedLinkId(null);
                  setSelectedContainerId(null);
                }
              }}
              onToggleMultiSelectNode={handleToggleMultiSelectNode}
              onMultiSelectNodes={handleMultiSelectNodes}
              onSelectLink={(id) => {
                setSelectedLinkId(id);
                if (id) {
                  setSelectedNodeId(null);
                  setSelectedNodeIds([]);
                  setSelectedContainerId(null);
                }
              }}
              onSelectContainer={(id) => {
                setSelectedContainerId(id);
                if (id) {
                  setSelectedNodeId(null);
                  setSelectedNodeIds([]);
                  setSelectedLinkId(null);
                }
              }}
              onUpdateNodePosition={handleUpdateNodePosition}
              onUpdateMultipleNodePositions={handleUpdateMultipleNodePositions}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onUpdateContainer={handleUpdateContainer}
              onDeleteContainer={handleDeleteContainer}
              onOpenContainerModal={handleOpenContainerModal}
              onAddLink={handleAddLink}
              onAddNodeAtPosition={handleAddNodeAtPosition}
              onOpenIpModal={(node) => setIpConfigModalNode(node)}
              onOpenLayoutOptimizer={() => setShowLayoutOptimizerModal(true)}
              onQuickAutoLayout={handleQuickAutoLayout}
              onOpenAutoRepair={() => setShowAutoRepairModal(true)}
              onAutoRepairNode={handleRepairNode}
              activeCableType={activeCableType}
              onSelectCableType={setActiveCableType}
              onQuickStart={handleQuickStart}
              onSelectScenarioPreset={handleSelectScenarioPreset}
              isPaletteCollapsed={isPaletteCollapsed}
            />
          )}

          {/* Floating Mini-Terminal Overlay */}
          {activeTab === 'canvas' && showMiniTerminal && (
            <div className="absolute bottom-4 right-4 z-30 w-full max-w-xl px-2 sm:px-0">
              <DeviceTerminal
                nodes={nodes}
                links={links}
                initialNodeId={selectedNodeId}
                onUpdateNode={handleUpdateNode}
                isMini={true}
                onClose={() => setShowMiniTerminal(false)}
                onMaximize={() => {
                  setShowMiniTerminal(false);
                  setActiveTab('terminal');
                }}
              />
            </div>
          )}

          {activeTab === 'terminal' && (
            <DeviceTerminal
              nodes={nodes}
              links={links}
              initialNodeId={selectedNodeId}
              onUpdateNode={handleUpdateNode}
            />
          )}

          {activeTab === 'packets' && (
            <PacketInspector
              packets={capturedPackets}
              nodes={nodes}
              links={links}
              containers={containers}
              onClearPackets={() => setCapturedPackets([])}
              onUpdateNode={handleUpdateNode}
              onUpdateTopology={updateTopology}
            />
          )}

          {activeTab === 'stats' && (
            <NetworkStats
              nodes={nodes}
              links={links}
              capturedPackets={capturedPackets}
            />
          )}

          {activeTab === 'traffic' && (
            <div className="flex-1 p-6 flex items-center justify-center bg-slate-950">
              <button
                onClick={() => setShowTrafficGen(true)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xl text-sm"
              >
                Öppna Trafikgenerator & Attackpanel
              </button>
            </div>
          )}
        </div>

        {/* Right Inspector Drawer */}
        {activeTab === 'canvas' && (selectedNode || selectedLink || selectedContainer) && (
          <Inspector
            selectedNode={selectedNode}
            selectedLink={selectedLink}
            selectedContainer={selectedContainer}
            containers={containers}
            nodes={nodes}
            links={links}
            onClose={() => {
              setSelectedNodeId(null);
              setSelectedNodeIds([]);
              setSelectedLinkId(null);
              setSelectedContainerId(null);
            }}
            onUpdateNode={handleUpdateNode}
            onUpdateMultipleNodes={handleUpdateMultipleNodes}
            onDeleteNode={handleDeleteNode}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            onOpenIpModal={(node) => setIpConfigModalNode(node)}
            onAddLink={handleAddLink}
            onOpenAutoRepair={() => setShowAutoRepairModal(true)}
            onAutoRepairNode={handleRepairNode}
            onOpenContainerModal={handleOpenContainerModal}
            onUpdateContainer={handleUpdateContainer}
            onDeleteContainer={handleDeleteContainer}
          />
        )}
      </div>

      {/* Bottom Connection Test & Ping Console */}
      {activeTab === 'canvas' && (
        <footer className="bg-[#14110e] border-t border-[#2c2219] p-2.5 sm:p-3 flex flex-wrap lg:flex-nowrap items-center gap-3 lg:gap-4 z-20 shadow-2xl">
          {/* Test Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold text-stone-300 font-sans uppercase tracking-wider hidden sm:inline">
              Testa Ping:
            </span>

            <select
              value={testFromId}
              onChange={(e) => {
                setTestFromId(e.target.value);
                setLastPingSuccess(null);
              }}
              className="bg-[#0e0c0a] border border-[#2c2219] text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/60 max-w-[140px]"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  Från: {n.name}
                </option>
              ))}
            </select>

            <ArrowRight className="w-4 h-4 text-stone-500 shrink-0" />

            <select
              value={testToId}
              onChange={(e) => {
                setTestToId(e.target.value);
                setLastPingSuccess(null);
              }}
              className="bg-[#0e0c0a] border border-[#2c2219] text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/60 max-w-[140px]"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  Till: {n.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunPingTest}
              disabled={isTestingPing || !testFromId || !testToId}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-stone-950" />
              <span>{isTestingPing ? 'Testar...' : 'Kör Ping'}</span>
            </button>

            {/* Auto-Fix button when test fails */}
            {lastPingSuccess === false && (
              <button
                type="button"
                onClick={handleRepairPath}
                title="Reparera kablar, IP-adresser, gateways och brandväggsregler längs denna väg automatiskt!"
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-stone-950 font-black text-xs transition shadow-lg shadow-rose-500/30 flex items-center gap-1.5 animate-bounce cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                <span>Fixa automatiskt</span>
              </button>
            )}
          </div>

          {/* Test Output Console */}
          <div className="flex-1 bg-[#0e0c0a] border border-[#2c2219] rounded-xl px-3 py-1.5 font-mono text-[11px] text-amber-300 overflow-x-auto max-h-12 flex items-center justify-between gap-3 custom-scrollbar">
            <div className="flex items-center gap-3 truncate">
              <div className="shrink-0 text-stone-500 font-sans text-[10px] uppercase font-bold">
                LOGG
              </div>
              <div className="truncate text-stone-200">
                {pingLogs[pingLogs.length - 1]}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowMiniTerminal((prev) => !prev)}
                title="Växla Mini-Terminal overlay"
                className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  showMiniTerminal
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                    : 'bg-[#14110e] text-stone-400 border-[#2c2219] hover:text-stone-200 hover:bg-[#201812]'
                }`}
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>{showMiniTerminal ? 'Dölj Mini-CLI' : 'Mini-CLI'}</span>
              </button>

              {detectedIssues.length > 0 && (
                <button
                  onClick={() => setShowAutoRepairModal(true)}
                  className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>{detectedIssues.length} fel funna</span>
                </button>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* Auto Repair & Assistant Modal */}
      <AutoRepairModal
        isOpen={showAutoRepairModal}
        onClose={() => setShowAutoRepairModal(false)}
        nodes={nodes}
        links={links}
        onApplyChanges={(newNodes, newLinks) => {
          setNodes(newNodes);
          setLinks(newLinks);
          setPingLogs((prev) => [
            ...prev,
            '⚡ Auto-reparation har applicerats på nätverkstopologin.',
          ]);
        }}
        onSelectNode={(nodeId) => {
          setSelectedNodeId(nodeId);
          setSelectedLinkId(null);
          setActiveTab('canvas');
        }}
      />

      {/* Cyber Defense Center & Blue Team Operations Modal */}
      <CyberDefenseModal
        isOpen={showCyberDefenseModal}
        onClose={() => setShowCyberDefenseModal(false)}
        nodes={nodes}
        links={links}
        containers={containers}
        packets={capturedPackets}
        onUpdateNode={handleUpdateNode}
        onUpdateMultipleNodes={handleUpdateMultipleNodes}
        onUpdateLink={handleUpdateLink}
        onUpdateMultipleLinks={handleUpdateMultipleLinks}
        onAddDevice={handleAddDevice}
        onSelectNodeOnCanvas={(nodeId) => {
          setSelectedNodeId(nodeId);
          setSelectedNodeIds([nodeId]);
          setSelectedLinkId(null);
          setSelectedContainerId(null);
          setActiveTab('canvas');
        }}
        onOpenAntivirus={() => setShowAntivirusModal(true)}
        onOpenIncidentResponse={() => setShowIncidentModal(true)}
      />

      {/* Cyber Awareness & Hot-Map Dashboard */}
      <CyberAwarenessModal
        isOpen={showCyberAwarenessModal}
        onClose={() => setShowCyberAwarenessModal(false)}
        nodes={nodes}
        links={links}
        containers={containers}
        onUpdateNode={handleUpdateNode}
        onUpdateMultipleNodes={handleUpdateMultipleNodes}
        onSelectNodeOnCanvas={(nodeId) => {
          setSelectedNodeId(nodeId);
          setSelectedNodeIds([nodeId]);
          setSelectedLinkId(null);
          setSelectedContainerId(null);
          setActiveTab('canvas');
        }}
        onOpenTrafficGen={() => setShowTrafficGen(true)}
      />

      {/* Antivirus & EDR Control Center Modal */}
      <AntivirusModal
        isOpen={showAntivirusModal}
        onClose={() => setShowAntivirusModal(false)}
        nodes={nodes}
        onUpdateNode={handleUpdateNode}
        onUpdateMultipleNodes={handleUpdateMultipleNodes}
        onSelectNodeOnCanvas={(nodeId) => {
          setSelectedNodeId(nodeId);
          setSelectedNodeIds([nodeId]);
          setSelectedLinkId(null);
          setSelectedContainerId(null);
          setActiveTab('canvas');
        }}
      />

      {/* Modals */}
      {showTrafficGen && (
        <TrafficGeneratorModal
          nodes={nodes}
          links={links}
          onAddPackets={(packets) => setCapturedPackets((prev) => [...packets, ...prev])}
          onTriggerAnimation={(linkIds) => {
            setTestingLinkIds(linkIds);
            setTimeout(() => setTestingLinkIds([]), 1200);
          }}
          onUpdateNode={handleUpdateNode}
          onUpdateMultipleNodes={handleUpdateMultipleNodes}
          onClose={() => setShowTrafficGen(false)}
        />
      )}

      {showSubnetCalc && (
        <SubnetCalculatorModal onClose={() => setShowSubnetCalc(false)} />
      )}

      {showExportImport && (
        <ExportImportModal
          nodes={nodes}
          links={links}
          containers={containers}
          stickyNotes={stickyNotes}
          lastAutoSavedTime={lastAutoSavedTime}
          onImportTopology={({ nodes: newNodes, links: newLinks, containers: newContainers, stickyNotes: newStickyNotes }) => {
            resetHistory({
              nodes: newNodes,
              links: newLinks,
              containers: newContainers || [],
              stickyNotes: newStickyNotes || [],
            });
            setSelectedNodeId(null);
            setSelectedNodeIds([]);
            setSelectedLinkId(null);
            setSelectedContainerId(null);
            setLastPingSuccess(null);
          }}
          onClose={() => setShowExportImport(false)}
        />
      )}

      {/* Quick IP Configuration Modal */}
      {ipConfigModalNode && (
        <IpConfigModal
          node={ipConfigModalNode}
          nodes={nodes}
          isOpen={!!ipConfigModalNode}
          onClose={() => setIpConfigModalNode(null)}
          onSaveNode={(updatedNode) => {
            handleUpdateNode(updatedNode);
          }}
        />
      )}

      {/* Container / Subnet Grouping Modal */}
      {showContainerModal && (
        <ContainerModal
          isOpen={showContainerModal}
          onClose={() => {
            setShowContainerModal(false);
            setEditingContainer(null);
          }}
          containerToEdit={editingContainer}
          allNodes={nodes}
          preselectedNodeIds={containerModalSelectedNodeIds}
          onSaveContainer={handleSaveContainer}
          onDeleteContainer={handleDeleteContainer}
        />
      )}

      {/* D3 Layout Optimizer Modal */}
      <LayoutOptimizerModal
        isOpen={showLayoutOptimizerModal}
        onClose={() => setShowLayoutOptimizerModal(false)}
        nodes={nodes}
        links={links}
        onApplyLayout={handleApplyLayout}
      />

      {/* Problem Scenarios & Challenges Modal */}
      <ScenarioModal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        onSelectScenario={handleSelectProblemScenario}
        completedScenarioIds={completedScenarioIds}
        activeScenarioId={activeProblemScenario?.id}
        onOpenCyberQuiz={() => {
          setQuizScenarioId(null);
          setQuizScenarioTitle(null);
          setShowCyberQuizModal(true);
        }}
      />

      {/* Cyberquiz & Network Security Academy Modal */}
      <CyberQuizModal
        isOpen={showCyberQuizModal}
        onClose={() => setShowCyberQuizModal(false)}
        completedScenarioId={quizScenarioId}
        completedScenarioTitle={quizScenarioTitle}
        onClearCompletedScenario={() => {
          setQuizScenarioId(null);
          setQuizScenarioTitle(null);
        }}
      />

      {/* Incident Response & Cyber Kill-Chain Dashboard */}
      <IncidentResponseModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        incidents={incidents}
        nodes={nodes}
        links={links}
        onUpdateNode={handleUpdateNode}
        onUpdateMultipleNodes={handleUpdateMultipleNodes}
        onClearIncidents={() => setIncidents([])}
        onSelectNodeOnCanvas={(id) => {
          setSelectedNodeId(id);
          setSelectedNodeIds([id]);
        }}
        onOpenAntivirus={() => setShowAntivirusModal(true)}
      />

      {/* Global Simulator Settings & Profile Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        currentUserEmail={currentUser?.email}
        onResetAllSettings={() => {
          handleUpdateSettings(loadSavedSettings());
        }}
      />
    </div>
  );
}
