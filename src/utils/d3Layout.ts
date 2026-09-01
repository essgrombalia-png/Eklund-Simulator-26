import * as d3 from 'd3';
import { Device, Link, DeviceType } from '../types';

export type LayoutAlgorithm = 'hierarchical' | 'organic' | 'circular' | 'grid';

export interface LayoutOptions {
  algorithm?: LayoutAlgorithm;
  canvasWidth?: number;
  canvasHeight?: number;
  nodeSpacing?: number;
  padding?: number;
  ticks?: number;
}

// Determine hierarchy level for a device type (0 = top/gateway, 4 = leaf/client)
export function getDeviceTier(type: DeviceType): number {
  switch (type) {
    case 'internet':
    case 'hacker_c2':
      return 0;

    case 'firewall':
    case 'ids_ips':
    case 'waf':
    case 'ddos_scrubber':
    case 'router':
    case 'wifi_router':
      return 1;

    case 'load_balancer':
    case 'siem_soc':
    case 'hsm_vault':
    case 'honeypot':
    case 'l3_switch':
    case 'switch':
      return 2;

    case 'server_web':
    case 'server_dns':
    case 'server_db':
    case 'server_mail':
    case 'server_nas':
    case 'server_vpn':
    case 'wifi_ap':
    case 'iot_gateway':
    case 'hacker_botnet':
    case 'hacker_pineapple':
      return 3;

    case 'client_pc':
    case 'client_laptop':
    case 'client_mobile':
    case 'client_printer':
    case 'client_camera':
    case 'client_pos':
    case 'iot_sensor':
    case 'iot_camera':
    case 'iot_thermostat':
    case 'iot_smartlock':
    case 'iot_light':
    case 'iot_plc':
    case 'iot_smart_meter':
    case 'iot_speaker':
    case 'hacker':
    case 'hacker_implant':
    case 'hacker_stager':
    default:
      return 4;
  }
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  device: Device;
  tier: number;
  targetY?: number;
  targetX?: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

/**
 * Optimizes the layout of devices using D3 Force Simulation.
 * Returns new array of devices with updated x, y coordinates.
 */
export function optimizeNetworkLayout(
  devices: Device[],
  links: Link[],
  options: LayoutOptions = {}
): Device[] {
  if (!devices || devices.length === 0) return [];

  const width = options.canvasWidth || 1200;
  const height = options.canvasHeight || 800;
  const padding = options.padding || 80;
  const algorithm = options.algorithm || 'hierarchical';
  const nodeSpacing = options.nodeSpacing || 130;
  const ticks = options.ticks || 300;

  const centerX = width / 2;
  const centerY = height / 2;

  // Clone devices to d3 node objects
  const d3Nodes: D3Node[] = devices.map((dev) => ({
    id: dev.id,
    device: dev,
    x: dev.x,
    y: dev.y,
    tier: getDeviceTier(dev.type),
  }));

  // Filter links that reference existing devices
  const validNodeIds = new Set(devices.map((d) => d.id));
  const d3Links: D3Link[] = links
    .filter((l) => validNodeIds.has(l.a) && validNodeIds.has(l.b))
    .map((l) => ({
      source: l.a,
      target: l.b,
    }));

  if (algorithm === 'grid') {
    return applyGridAlgorithm(d3Nodes, width, height, padding);
  }

  if (algorithm === 'circular') {
    return applyCircularAlgorithm(d3Nodes, d3Links, centerX, centerY, width, height, padding);
  }

  // Create D3 Force Simulation
  const simulation = d3.forceSimulation<D3Node>(d3Nodes);

  if (algorithm === 'hierarchical') {
    // Group by tiers
    const maxTier = 4;
    const verticalStep = (height - padding * 2) / (maxTier + 1);

    d3Nodes.forEach((node) => {
      node.targetY = padding + node.tier * verticalStep + verticalStep / 2;
    });

    // Link force with custom distance
    const linkForce = d3
      .forceLink<D3Node, D3Link>(d3Links)
      .id((d) => d.id)
      .distance(nodeSpacing)
      .strength(0.4);

    // Charge/repulsion force
    const chargeForce = d3.forceManyBody<D3Node>().strength(-450);

    // Collision force to prevent overlapping boxes
    const collideForce = d3.forceCollide<D3Node>(65);

    // Y force to push nodes towards their tier height
    const yForce = d3.forceY<D3Node>((d) => d.targetY || centerY).strength(0.8);

    // X force to center graph
    const xForce = d3.forceX<D3Node>(centerX).strength(0.05);

    simulation
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('collide', collideForce)
      .force('y', yForce)
      .force('x', xForce);
  } else {
    // Organic / Force-Directed algorithm
    const linkForce = d3
      .forceLink<D3Node, D3Link>(d3Links)
      .id((d) => d.id)
      .distance(nodeSpacing + 20)
      .strength(0.5);

    const chargeForce = d3.forceManyBody<D3Node>().strength(-600);
    const collideForce = d3.forceCollide<D3Node>(75);
    const centerForce = d3.forceCenter<D3Node>(centerX, centerY);
    const xForce = d3.forceX<D3Node>(centerX).strength(0.03);
    const yForce = d3.forceY<D3Node>(centerY).strength(0.03);

    simulation
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('collide', collideForce)
      .force('center', centerForce)
      .force('x', xForce)
      .force('y', yForce);
  }

  // Run simulation ticks synchronously
  for (let i = 0; i < ticks; ++i) {
    simulation.tick();
  }

  // Map results back to Device objects with bounds clamping
  return d3Nodes.map((n) => {
    const minX = padding;
    const maxX = Math.max(padding + 200, width - padding);
    const minY = padding;
    const maxY = Math.max(padding + 200, height - padding);

    const clampedX = Math.round(Math.max(minX, Math.min(maxX, n.x || centerX)));
    const clampedY = Math.round(Math.max(minY, Math.min(maxY, n.y || centerY)));

    return {
      ...n.device,
      x: clampedX,
      y: clampedY,
    };
  });
}

/**
 * Grid layout: aligns nodes into organized subnet/category rows and columns.
 */
function applyGridAlgorithm(
  nodes: D3Node[],
  width: number,
  height: number,
  padding: number
): Device[] {
  // Sort nodes by tier then by IP / Name
  const sorted = [...nodes].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.device.name.localeCompare(b.device.name);
  });

  const columns = Math.ceil(Math.sqrt(sorted.length * 1.5));
  const colWidth = Math.max(140, Math.min(220, (width - padding * 2) / columns));
  const rowHeight = 130;

  return sorted.map((n, idx) => {
    const col = idx % columns;
    const row = Math.floor(idx / columns);

    const x = Math.round(padding + col * colWidth + colWidth / 2);
    const y = Math.round(padding + row * rowHeight + rowHeight / 2);

    return {
      ...n.device,
      x,
      y,
    };
  });
}

/**
 * Circular layout: places gateways/routers in inner ring and satellites in outer ring.
 */
function applyCircularAlgorithm(
  nodes: D3Node[],
  links: D3Link[],
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  padding: number
): Device[] {
  const coreNodes = nodes.filter((n) => n.tier <= 2);
  const leafNodes = nodes.filter((n) => n.tier > 2);

  const innerRadius = Math.min(width, height) * 0.2;
  const outerRadius = Math.min(width, height) * 0.38;

  const resultDevices: Device[] = [];

  // Core ring
  if (coreNodes.length > 0) {
    coreNodes.forEach((n, idx) => {
      const angle = (idx / coreNodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.round(centerX + Math.cos(angle) * innerRadius);
      const y = Math.round(centerY + Math.sin(angle) * innerRadius);
      resultDevices.push({
        ...n.device,
        x,
        y,
      });
    });
  }

  // Leaf ring
  if (leafNodes.length > 0) {
    leafNodes.forEach((n, idx) => {
      const angle = (idx / leafNodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.round(centerX + Math.cos(angle) * outerRadius);
      const y = Math.round(centerY + Math.sin(angle) * outerRadius);
      resultDevices.push({
        ...n.device,
        x,
        y,
      });
    });
  }

  return resultDevices;
}
