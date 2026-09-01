import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  BarChart3,
  LineChart,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Flame,
  ShieldAlert,
  Radio,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Server,
  Globe,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { Device, Link, CapturedPacket } from '../types';

export interface NodeDataPoint {
  timestamp: Date;
  timeStr: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  bandwidthMbps: number; // Current throughput in Mbps
  capacityMbps: number; // Node maximum throughput capacity
  utilizationPercent: number; // 0 - 100%
  latencyMs: number; // Latency in ms
  packetLossPercent: number; // Loss %
  txMbps: number;
  rxMbps: number;
}

interface NetworkStatsProps {
  nodes: Device[];
  links: Link[];
  capturedPackets?: CapturedPacket[];
  onClose?: () => void;
}

// Color palette for nodes in D3 charts
const NODE_COLORS = [
  '#38bdf8', // Cyan 400
  '#818cf8', // Indigo 400
  '#34d399', // Emerald 400
  '#f43f5e', // Rose 500
  '#fbbf24', // Amber 400
  '#a855f7', // Purple 500
  '#22d3ee', // Cyan 400
  '#f97316', // Orange 500
  '#ec4899', // Pink 500
  '#10b981', // Emerald 500
];

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  nodes,
  links,
  capturedPackets = [],
}) => {
  // Chart View Options
  const [activeView, setActiveView] = useState<'both' | 'bandwidth' | 'latency' | 'comparison'>('both');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ALL');
  const [timeWindowSec, setTimeWindowSec] = useState<number>(30); // 15, 30, 60, 120 seconds
  const [isLive, setIsLive] = useState<boolean>(true);

  // Simulation Shock Triggers
  const [activeSpikeType, setActiveSpikeType] = useState<'none' | 'ddos' | 'burst' | 'streaming'>('none');
  const spikeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Time-series history buffer: Map<nodeId, NodeDataPoint[]>
  const [metricsHistory, setMetricsHistory] = useState<NodeDataPoint[]>([]);

  // D3 SVG Container Refs
  const bandwidthSvgRef = useRef<SVGSVGElement | null>(null);
  const latencySvgRef = useRef<SVGSVGElement | null>(null);
  const comparisonSvgRef = useRef<SVGSVGElement | null>(null);

  // Map node type to color
  const getNodeColor = (nodeId: string, index: number) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.type === 'internet') return '#38bdf8';
    if (node?.type === 'firewall' || node?.type === 'hacker') return '#f43f5e';
    if (node?.type.startsWith('server_')) return '#818cf8';
    if (node?.type.includes('switch') || node?.type.includes('router')) return '#34d399';
    return NODE_COLORS[index % NODE_COLORS.length];
  };

  // Filter nodes based on category selection
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (!n.on) return false;
      if (selectedNodeId !== 'ALL' && n.id !== selectedNodeId) return false;
      if (selectedCategory === 'gateways') {
        return ['internet', 'firewall', 'router', 'wifi_router'].includes(n.type);
      }
      if (selectedCategory === 'servers') {
        return n.type.startsWith('server_');
      }
      if (selectedCategory === 'switches') {
        return ['switch', 'l3_switch', 'wifi_ap'].includes(n.type);
      }
      if (selectedCategory === 'clients') {
        return ['client_pc', 'client_laptop', 'client_mobile', 'client_printer', 'hacker'].includes(n.type);
      }
      return true;
    });
  }, [nodes, selectedCategory, selectedNodeId]);

  // Helper to get node link capacity
  const getNodeCapacityMbps = (nodeId: string): number => {
    const nodeLinks = links.filter((l) => l.a === nodeId || l.b === nodeId);
    if (nodeLinks.length === 0) return 100;
    const maxBw = Math.max(...nodeLinks.map((l) => l.bandwidthMbps));
    return maxBw || 1000;
  };

  // Real-time metrics tick generator (runs every 1000ms)
  useEffect(() => {
    if (!isLive || nodes.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('sv-SE', { hour12: false });

      const newPoints: NodeDataPoint[] = nodes.map((node) => {
        const capacity = getNodeCapacityMbps(node.id);
        const isOffline = !node.on;

        if (isOffline) {
          return {
            timestamp: now,
            timeStr,
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            bandwidthMbps: 0,
            capacityMbps: capacity,
            utilizationPercent: 0,
            latencyMs: 0,
            packetLossPercent: 100,
            txMbps: 0,
            rxMbps: 0,
          };
        }

        // Base traffic generation simulation
        let baseBw = 0;
        let baseLat = 1;

        if (node.type === 'internet') {
          baseBw = 120 + Math.random() * 80;
          baseLat = 22 + Math.random() * 8;
        } else if (node.type.startsWith('server_')) {
          baseBw = 35 + Math.random() * 45;
          baseLat = 2 + Math.random() * 4;
        } else if (node.type === 'l3_switch' || node.type === 'firewall' || node.type === 'router') {
          baseBw = 80 + Math.random() * 70;
          baseLat = 1.5 + Math.random() * 3;
        } else if (node.type === 'hacker') {
          baseBw = 15 + Math.random() * 60;
          baseLat = 12 + Math.random() * 15;
        } else {
          baseBw = 5 + Math.random() * 25;
          baseLat = 3 + Math.random() * 5;
        }

        // Add spike multiplier if active
        if (activeSpikeType === 'ddos') {
          if (node.type === 'firewall' || node.type.startsWith('server_') || node.type === 'internet' || node.type === 'hacker') {
            baseBw += 450 + Math.random() * 350;
            baseLat += 120 + Math.random() * 80;
          } else {
            baseBw += 80 + Math.random() * 60;
            baseLat += 45 + Math.random() * 30;
          }
        } else if (activeSpikeType === 'burst') {
          baseBw += 150 + Math.random() * 200;
          baseLat += 15 + Math.random() * 25;
        } else if (activeSpikeType === 'streaming') {
          baseBw += 60 + Math.random() * 90;
          baseLat += 8 + Math.random() * 10;
        }

        // Packet inspection correlation
        const recentNodePackets = capturedPackets.filter(
          (p) => p.sourceId === node.id || p.destId === node.id
        ).length;
        baseBw += Math.min(recentNodePackets * 12, 200);

        const currentBw = Math.min(Math.round((baseBw + Math.random() * 5) * 10) / 10, capacity);
        const currentLat = Math.round((baseLat + (currentBw / capacity) * 20) * 10) / 10;
        const utilPct = Math.min(Math.round((currentBw / capacity) * 1000) / 10, 100);

        const tx = Math.round((currentBw * 0.55) * 10) / 10;
        const rx = Math.round((currentBw * 0.45) * 10) / 10;

        return {
          timestamp: now,
          timeStr,
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          bandwidthMbps: currentBw,
          capacityMbps: capacity,
          utilizationPercent: utilPct,
          latencyMs: currentLat,
          packetLossPercent: utilPct > 85 ? Math.round((utilPct - 85) * 0.4 * 10) / 10 : 0,
          txMbps: tx,
          rxMbps: rx,
        };
      });

      setMetricsHistory((prev) => {
        // Keep points within maximum history window (e.g. last 180 seconds)
        const cutoff = new Date(now.getTime() - 180 * 1000);
        const filtered = prev.filter((p) => p.timestamp >= cutoff);
        return [...filtered, ...newPoints];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, nodes, links, capturedPackets, activeSpikeType]);

  // Handle Spike Triggers
  const triggerSpike = (type: 'ddos' | 'burst' | 'streaming') => {
    if (spikeTimeoutRef.current) clearTimeout(spikeTimeoutRef.current);
    setActiveSpikeType(type);
    spikeTimeoutRef.current = setTimeout(() => {
      setActiveSpikeType('none');
    }, 6000);
  };

  // Reset Metrics History
  const clearHistory = () => {
    setMetricsHistory([]);
  };

  // Compute Current Summary Metrics
  const summary = useMemo(() => {
    const latestTimestamp = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1].timestamp : null;
    if (!latestTimestamp) {
      return { totalMbps: 0, avgLat: 0, maxUtilNode: '-', highLatCount: 0, healthIndex: 100 };
    }

    const latestPoints = metricsHistory.filter(
      (p) => p.timestamp.getTime() === latestTimestamp.getTime()
    );

    const totalMbps = Math.round(latestPoints.reduce((acc, p) => acc + p.bandwidthMbps, 0) * 10) / 10;
    const avgLat = latestPoints.length > 0
      ? Math.round((latestPoints.reduce((acc, p) => acc + p.latencyMs, 0) / latestPoints.length) * 10) / 10
      : 0;

    let maxUtilNode = '-';
    let maxUtil = -1;
    latestPoints.forEach((p) => {
      if (p.utilizationPercent > maxUtil) {
        maxUtil = p.utilizationPercent;
        maxUtilNode = `${p.nodeName} (${p.bandwidthMbps} Mbps)`;
      }
    });

    const highLatCount = latestPoints.filter((p) => p.latencyMs > 60).length;
    const healthIndex = Math.max(0, Math.round(100 - highLatCount * 12 - (avgLat > 50 ? 20 : 0)));

    return { totalMbps, avgLat, maxUtilNode, highLatCount, healthIndex };
  }, [metricsHistory]);

  // ==========================================
  // D3 RENDERING: Bandwidth Time-Series Chart
  // ==========================================
  useEffect(() => {
    if (!bandwidthSvgRef.current || (activeView !== 'both' && activeView !== 'bandwidth')) return;

    const svg = d3.select(bandwidthSvgRef.current);
    svg.selectAll('*').remove(); // Clean container for re-render

    const width = bandwidthSvgRef.current.parentElement?.clientWidth || 800;
    const height = 240;
    const margin = { top: 20, right: 30, bottom: 35, left: 55 };

    svg.attr('width', width).attr('height', height);

    // Filter metrics within selected time window & filtered nodes
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowSec * 1000);

    const activeNodeIds = new Set(filteredNodes.map((n) => n.id));
    const recentData = metricsHistory.filter(
      (p) => p.timestamp >= windowStart && activeNodeIds.has(p.nodeId)
    );

    if (recentData.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '13px')
        .attr('font-family', 'sans-serif')
        .text('Samlar in realtidsdata för bandbredd...');
      return;
    }

    // X Scale (Time)
    const xScale = d3
      .scaleTime()
      .domain([windowStart, now])
      .range([margin.left, width - margin.right]);

    // Y Scale (Mbps)
    const maxBw = d3.max(recentData, (d: NodeDataPoint) => d.bandwidthMbps) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(maxBw * 1.15, 50)])
      .range([height - margin.bottom, margin.top]);

    // Gridlines
    const yGrid = d3
      .axisLeft(yScale)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat(() => '')
      .ticks(5);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d} Mbps`);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('color', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Group data by nodeId for line drawing
    const nodeGroups = d3.group(recentData, (d: NodeDataPoint) => d.nodeId);

    // D3 Line Generator
    const lineGenerator = d3
      .line<NodeDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.bandwidthMbps))
      .curve(d3.curveMonotoneX);

    // Draw lines & area fill for each node
    let index = 0;
    nodeGroups.forEach((points: NodeDataPoint[], nodeId: string) => {
      const color = getNodeColor(nodeId, index);
      index++;

      // Gradient area fill
      const areaGenerator = d3
        .area<NodeDataPoint>()
        .x((d) => xScale(d.timestamp))
        .y0(height - margin.bottom)
        .y1((d) => yScale(d.bandwidthMbps))
        .curve(d3.curveMonotoneX);

      const gradId = `grad-bw-${nodeId.replace(/[^a-zA-Z0-9]/g, '')}`;
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.25);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.0);

      // Area path
      svg
        .append('path')
        .datum(points as any)
        .attr('fill', `url(#${gradId})`)
        .attr('d', areaGenerator as any);

      // Line path
      svg
        .append('path')
        .datum(points as any)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGenerator as any);

      // Latest data point dot
      const latestPoint = points[points.length - 1];
      if (latestPoint) {
        svg
          .append('circle')
          .attr('cx', xScale(latestPoint.timestamp))
          .attr('cy', yScale(latestPoint.bandwidthMbps))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', '#020617')
          .attr('stroke-width', 2);
      }
    });

    // Crosshair & Tooltip Overlay
    const focusLine = svg
      .append('line')
      .attr('stroke', '#475569')
      .attr('stroke-dasharray', '2,2')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .style('opacity', 0);

    const overlay = svg
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      const xDate = xScale.invert(mouseX);

      focusLine
        .attr('x1', mouseX)
        .attr('x2', mouseX)
        .style('opacity', 1);
    });

    overlay.on('mouseleave', () => {
      focusLine.style('opacity', 0);
    });
  }, [metricsHistory, activeView, timeWindowSec, filteredNodes]);

  // ==========================================
  // D3 RENDERING: Latency Time-Series Chart
  // ==========================================
  useEffect(() => {
    if (!latencySvgRef.current || (activeView !== 'both' && activeView !== 'latency')) return;

    const svg = d3.select(latencySvgRef.current);
    svg.selectAll('*').remove();

    const width = latencySvgRef.current.parentElement?.clientWidth || 800;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 35, left: 55 };

    svg.attr('width', width).attr('height', height);

    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowSec * 1000);

    const activeNodeIds = new Set(filteredNodes.map((n) => n.id));
    const recentData = metricsHistory.filter(
      (p) => p.timestamp >= windowStart && activeNodeIds.has(p.nodeId)
    );

    if (recentData.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '13px')
        .attr('font-family', 'sans-serif')
        .text('Samlar in realtidsdata för latens...');
      return;
    }

    const xScale = d3
      .scaleTime()
      .domain([windowStart, now])
      .range([margin.left, width - margin.right]);

    const maxLat = d3.max(recentData, (d: NodeDataPoint) => d.latencyMs) || 50;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(maxLat * 1.2, 60)])
      .range([height - margin.bottom, margin.top]);

    // Gridlines
    const yGrid = d3
      .axisLeft(yScale)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat(() => '')
      .ticks(5);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');

    // Threshold Line for High Latency Warning (50ms)
    svg
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', yScale(50))
      .attr('y2', yScale(50))
      .attr('stroke', '#f59e0b')
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6);

    svg
      .append('text')
      .attr('x', width - margin.right - 5)
      .attr('y', yScale(50) - 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#f59e0b')
      .attr('font-size', '9px')
      .attr('font-family', 'sans-serif')
      .text('Tröskel (50ms)');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d} ms`);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('color', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Group data by nodeId
    const nodeGroups = d3.group(recentData, (d: NodeDataPoint) => d.nodeId);

    const lineGenerator = d3
      .line<NodeDataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.latencyMs))
      .curve(d3.curveMonotoneX);

    let index = 0;
    nodeGroups.forEach((points: NodeDataPoint[], nodeId: string) => {
      const color = getNodeColor(nodeId, index);
      index++;

      svg
        .append('path')
        .datum(points as any)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGenerator as any);

      const latestPoint = points[points.length - 1];
      if (latestPoint) {
        svg
          .append('circle')
          .attr('cx', xScale(latestPoint.timestamp))
          .attr('cy', yScale(latestPoint.latencyMs))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', '#020617')
          .attr('stroke-width', 2);
      }
    });
  }, [metricsHistory, activeView, timeWindowSec, filteredNodes]);

  // ==========================================
  // D3 RENDERING: Node Comparison Bar Chart
  // ==========================================
  useEffect(() => {
    if (!comparisonSvgRef.current || activeView !== 'comparison') return;

    const svg = d3.select(comparisonSvgRef.current);
    svg.selectAll('*').remove();

    const width = comparisonSvgRef.current.parentElement?.clientWidth || 800;
    const height = Math.max(300, filteredNodes.length * 36 + 60);
    const margin = { top: 20, right: 90, bottom: 35, left: 140 };

    svg.attr('width', width).attr('height', height);

    const latestTimestamp = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1].timestamp : null;
    if (!latestTimestamp) return;

    const latestPointsMap = new Map<string, NodeDataPoint>();
    metricsHistory
      .filter((p) => p.timestamp.getTime() === latestTimestamp.getTime())
      .forEach((p) => latestPointsMap.set(p.nodeId, p));

    const chartData = filteredNodes.map((n) => {
      const point = latestPointsMap.get(n.id);
      return {
        id: n.id,
        name: n.name,
        type: n.type,
        ip: n.ip,
        bandwidthMbps: point ? point.bandwidthMbps : 0,
        latencyMs: point ? point.latencyMs : 0,
        utilizationPercent: point ? point.utilizationPercent : 0,
      };
    });

    // Y Scale (Node Names)
    const yScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.25);

    // X Scale (Mbps)
    const maxBw = d3.max(chartData, (d: { bandwidthMbps: number }) => d.bandwidthMbps) || 100;
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(maxBw * 1.15, 50)])
      .range([margin.left, width - margin.right]);

    // Axes
    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => `${d} Mbps`);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('color', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-family', 'sans-serif');

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Draw Bars
    chartData.forEach((d, idx) => {
      const barY = yScale(d.name) || 0;
      const barHeight = yScale.bandwidth();
      const barWidth = Math.max(0, xScale(d.bandwidthMbps) - margin.left);
      const color = getNodeColor(d.id, idx);

      // Background Track
      svg
        .append('rect')
        .attr('x', margin.left)
        .attr('y', barY)
        .attr('width', width - margin.left - margin.right)
        .attr('height', barHeight)
        .attr('fill', '#0f172a')
        .attr('rx', 4);

      // Value Bar
      svg
        .append('rect')
        .attr('x', margin.left)
        .attr('y', barY)
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('fill', color)
        .attr('rx', 4)
        .attr('opacity', 0.85);

      // Text Label (Mbps & Latency)
      svg
        .append('text')
        .attr('x', margin.left + barWidth + 8)
        .attr('y', barY + barHeight / 2 + 4)
        .attr('fill', '#e2e8f0')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .text(`${d.bandwidthMbps} Mbps • ${d.latencyMs} ms`);
    });
  }, [metricsHistory, activeView, filteredNodes]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header & Controls */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Nätverksstatistik & Realtidsanalys
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/30">
                D3.js Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Realtidsvisualisering av bandbreddsutnyttjande (Mbps) & latens (ms) per nod
            </p>
          </div>
        </div>

        {/* View Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Sync Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            {isLive ? <Play className="w-3.5 h-3.5 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isLive ? 'Realtid Aktiv' : 'Pausad'}</span>
          </button>

          {/* Time Window Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[15, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setTimeWindowSec(sec)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                  timeWindowSec === sec ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Spike Shock Generators */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={() => triggerSpike('burst')}
              disabled={activeSpikeType !== 'none'}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-medium transition border border-slate-700 disabled:opacity-50"
              title="Simulera plötslig trafikspik"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Trafikspik</span>
            </button>
            <button
              onClick={() => triggerSpike('ddos')}
              disabled={activeSpikeType !== 'none'}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 text-[11px] font-medium transition border border-slate-700 disabled:opacity-50"
              title="Simulera kraftig DDoS överbelastning"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>DDoS-chock</span>
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Rensa statistik-historik"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="bg-slate-950 border-b border-slate-900 p-3 grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Total Bandbredd</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">{summary.totalMbps} Mbps</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Medellatens (RTT)</div>
            <div className="text-sm font-bold text-indigo-400 font-mono">{summary.avgLat} ms</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Nätverkshälsa</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{summary.healthIndex}% Stabil</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Hög Latens Noder</div>
            <div className="text-sm font-bold text-amber-400 font-mono">{summary.highLatCount} st &gt;60ms</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-[10px] text-slate-400 font-medium">Mest Trafikerad Nod</div>
            <div className="text-xs font-bold text-purple-300 font-mono truncate">{summary.maxUtilNode}</div>
          </div>
        </div>
      </div>

      {/* View Switcher & Category Filter */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Mode Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('both')}
            className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeView === 'both' ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Kombinerad Graf</span>
          </button>
          <button
            onClick={() => setActiveView('bandwidth')}
            className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeView === 'bandwidth' ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Bandbredd (Mbps)</span>
          </button>
          <button
            onClick={() => setActiveView('latency')}
            className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeView === 'latency' ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latens (ms)</span>
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeView === 'comparison' ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Nod-jämförelse (D3 Stapel)</span>
          </button>
        </div>

        {/* Category & Specific Node Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedNodeId('ALL');
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="ALL">Alla enhetskategorier</option>
            <option value="gateways">Gateways & Routrar</option>
            <option value="switches">Switchar & AP:er</option>
            <option value="servers">Servrar</option>
            <option value="clients">Slutenheter & Klienter</option>
          </select>

          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none max-w-[160px]"
          >
            <option value="ALL">Alla noder ({filteredNodes.length})</option>
            {filteredNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main D3 Charts Area */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        {/* Active Shock Alert Banner */}
        {activeSpikeType !== 'none' && (
          <div className="bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>
                {activeSpikeType === 'ddos' ? '⚠️ Aktiv DDoS Överbelastningsattack simuleras!' : '⚡ Trafikspik pågår!'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-rose-300">Observera latens och bandbreddstoppar i D3-graferna</span>
          </div>
        )}

        {/* BANDWIDTH CHART */}
        {(activeView === 'both' || activeView === 'bandwidth') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Realtid Bandbreddsutnyttjande (Mbps)
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Skala: 0 - {Math.max(100, Math.round((summary.totalMbps * 1.2) / 10) * 10)} Mbps
              </div>
            </div>

            <div className="w-full relative min-h-[240px]">
              <svg ref={bandwidthSvgRef} className="w-full h-[240px] block"></svg>
            </div>
          </div>
        )}

        {/* LATENCY CHART */}
        {(activeView === 'both' || activeView === 'latency') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Realtid Latens (RTT per nod i ms)
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Gul linje = 50ms tröskelvärde
              </div>
            </div>

            <div className="w-full relative min-h-[220px]">
              <svg ref={latencySvgRef} className="w-full h-[220px] block"></svg>
            </div>
          </div>
        )}

        {/* NODE COMPARISON BAR CHART */}
        {activeView === 'comparison' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  D3 Stapeldiagram - Nodjämförelse
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Visar aktuell Throughput (Mbps) per nod
              </div>
            </div>

            <div className="w-full relative min-h-[300px]">
              <svg ref={comparisonSvgRef} className="w-full block"></svg>
            </div>
          </div>
        )}

        {/* Node Legends Grid */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans flex items-center justify-between">
            <span>Aktiva Övervakningsnoder</span>
            <span>{filteredNodes.length} noder</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredNodes.map((n, idx) => {
              const color = getNodeColor(n.id, idx);
              const isSelected = selectedNodeId === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNodeId(isSelected ? 'ALL' : n.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 text-white shadow'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="truncate text-[11px] font-medium leading-tight">
                    <div className="truncate">{n.name}</div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">{n.ip || 'No IP'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
