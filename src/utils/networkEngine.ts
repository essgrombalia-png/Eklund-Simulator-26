import { Device, Link, CapturedPacket, FirewallRule, TestResult } from '../types';

/**
 * Checks if two IP addresses are in the same subnet given a subnet mask or CIDR.
 */
export function ipToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

export function cidrToMask(bits: number): string {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return intToIp(mask);
}

export function maskToCidr(maskStr: string): number {
  const maskInt = ipToInt(maskStr);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((maskInt & (1 << i)) !== 0) count++;
    else break;
  }
  return count;
}

export function isInSubnet(ip: string, subnetIp: string, mask: string): boolean {
  try {
    const ipIntVal = ipToInt(ip);
    const subnetIntVal = ipToInt(subnetIp);
    const maskIntVal = ipToInt(mask);
    return (ipIntVal & maskIntVal) === (subnetIntVal & maskIntVal);
  } catch {
    return false;
  }
}

/**
 * Evaluates firewall rules for a device.
 */
export function evaluateFirewall(
  device: Device,
  sourceIp: string,
  destIp: string,
  protocol: 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'ALL' | 'MALWARE' | 'ARP',
  port?: number
): { allowed: boolean; ruleId?: string; reason?: string } {
  if (!device.firewallRules || device.firewallRules.length === 0) {
    return { allowed: true };
  }

  for (const rule of device.firewallRules) {
    const protoMatch =
      rule.protocol === 'ALL' || rule.protocol === protocol || protocol === 'ALL';
    const srcMatch = rule.sourceIp === '*' || rule.sourceIp === sourceIp;
    const dstMatch = rule.destIp === '*' || rule.destIp === destIp;
    const portMatch = !rule.port || !port || rule.port === port;

    if (protoMatch && srcMatch && dstMatch && portMatch) {
      if (rule.action === 'block') {
        return {
          allowed: false,
          ruleId: rule.id,
          reason: `Blockerad av brandväggsregel #${rule.id} (${rule.description || 'Säkerhetspolicy'})`,
        };
      }
      if (rule.action === 'allow') {
        return { allowed: true, ruleId: rule.id };
      }
    }
  }

  return { allowed: true };
}

/**
 * Computes network connectivity from WAN/Internet source to all nodes.
 */
export function computeNetworkConnectivity(
  nodes: Device[],
  links: Link[]
): Map<string, boolean> {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));

  links.forEach((link) => {
    const nodeA = nodes.find((n) => n.id === link.a);
    const nodeB = nodes.find((n) => n.id === link.b);

    if (nodeA && nodeB && nodeA.on && nodeB.on) {
      adjacency.get(link.a)?.push(link.b);
      adjacency.get(link.b)?.push(link.a);
    }
  });

  const connectedSet = new Set<string>();
  const queue: string[] = [];

  // Find all Internet / WAN Gateway nodes that are ON
  nodes.forEach((n) => {
    if (n.type === 'internet' && n.on) {
      connectedSet.add(n.id);
      queue.push(n.id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current) || [];

    for (const neighborId of neighbors) {
      if (!connectedSet.has(neighborId)) {
        connectedSet.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  const result = new Map<string, boolean>();
  nodes.forEach((n) => {
    result.set(n.id, n.on ? connectedSet.has(n.id) : false);
  });

  return result;
}

/**
 * Finds shortest active path between two nodes using BFS, taking firewalls into account.
 */
export function findPathAndSimulate(
  fromId: string,
  toId: string,
  nodes: Device[],
  links: Link[],
  protocol: 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'MALWARE' | 'ARP' = 'ICMP',
  port?: number
): TestResult {
  const logs: string[] = [];
  const fromNode = nodes.find((n) => n.id === fromId);
  const toNode = nodes.find((n) => n.id === toId);

  if (!fromNode || !toNode) {
    return {
      success: false,
      pathNodes: [],
      pathLinks: [],
      latencyMs: 0,
      packetLoss: 100,
      logs: ['Nätverksenhet hittades inte.'],
    };
  }

  logs.push(`$ ping -c 4 ${toNode.name} [${toNode.ip || 'okänd IP'}] från ${fromNode.name} [${fromNode.ip}]`);

  if (!fromNode.on) {
    logs.push(`FEJL: Källenheten ${fromNode.name} är avstängd.`);
    return { success: false, pathNodes: [], pathLinks: [], latencyMs: 0, packetLoss: 100, logs };
  }

  if (!toNode.on) {
    logs.push(`FEL: Målenheten ${toNode.name} är avstängd (ingen svarssignal).`);
    return { success: false, pathNodes: [], pathLinks: [], latencyMs: 0, packetLoss: 100, logs };
  }

  if (fromId === toId) {
    logs.push(`Loopback test (127.0.0.1) -> 0 ms fördröjning, 100% lyckat.`);
    return { success: true, pathNodes: [fromId], pathLinks: [], latencyMs: 0.1, packetLoss: 0, logs };
  }

  // BFS graph traversal
  const adj = new Map<string, { to: string; link: Link }[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  links.forEach((l) => {
    const nodeA = nodes.find((n) => n.id === l.a);
    const nodeB = nodes.find((n) => n.id === l.b);
    if (nodeA && nodeB && nodeA.on && nodeB.on) {
      adj.get(l.a)?.push({ to: l.b, link: l });
      adj.get(l.b)?.push({ to: l.a, link: l });
    }
  });

  const visited = new Set<string>([fromId]);
  const queue: string[] = [fromId];
  const parent = new Map<string, { from: string; link: Link }>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) break;

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        parent.set(edge.to, { from: current, link: edge.link });
        queue.push(edge.to);
      }
    }
  }

  if (!visited.has(toId)) {
    logs.push(`FEL: Ingen fysisk eller trådlös länk hittades mellan ${fromNode.name} och ${toNode.name}.`);
    logs.push(`Status: Request timed out (Ingen rutt till värden).`);
    return { success: false, pathNodes: [], pathLinks: [], latencyMs: 0, packetLoss: 100, logs };
  }

  // Reconstruct path
  const pathNodes: string[] = [toId];
  const pathLinks: Link[] = [];
  let curr = toId;

  while (curr !== fromId) {
    const p = parent.get(curr);
    if (!p) break;
    pathLinks.unshift(p.link);
    pathNodes.unshift(p.from);
    curr = p.from;
  }

  // Evaluate firewalls along path
  let totalLatency = 0;
  let maxPacketLossProb = 0;

  for (let i = 0; i < pathNodes.length; i++) {
    const node = nodes.find((n) => n.id === pathNodes[i]);
    if (!node) continue;

    if (i > 0) {
      const link = pathLinks[i - 1];
      totalLatency += link.latencyMs;
      maxPacketLossProb = Math.max(maxPacketLossProb, link.packetLossPercent);
    }

    // Check firewall on transit/dest nodes
    const fwResult = evaluateFirewall(node, fromNode.ip, toNode.ip, protocol, port);
    if (!fwResult.allowed) {
      logs.push(`[HOPP ${i + 1}] ${node.name} [${node.ip}]: ${fwResult.reason}`);
      logs.push(`Status: Paket stoppades av brandväggsregel!`);
      return {
        success: false,
        pathNodes: pathNodes.slice(0, i + 1),
        pathLinks: pathLinks.slice(0, i),
        latencyMs: totalLatency,
        packetLoss: 100,
        logs,
      };
    }

    if (i < pathNodes.length - 1) {
      const nextNode = nodes.find((n) => n.id === pathNodes[i + 1]);
      logs.push(`[HOPP ${i + 1}] ${node.name} (${node.ip}) -> ${nextNode?.name} (${nextNode?.ip}) [${pathLinks[i].bandwidthMbps} Mbps, ${pathLinks[i].latencyMs}ms]`);
    }
  }

  const baseRoundTrip = totalLatency * 2 + Math.floor(Math.random() * 4 + 2);
  logs.push(`PING ${toNode.name}: 64 byte skickade, RTT = ${baseRoundTrip} ms.`);
  logs.push(`Paketstatistik: 4 skickade, 4 mottagna, 0% paketförlust.`);
  logs.push(`Anslutning bekräftad!`);

  return {
    success: true,
    pathNodes,
    pathLinks,
    latencyMs: baseRoundTrip,
    packetLoss: maxPacketLossProb,
    logs,
  };
}

export interface NodeWarning {
  nodeId: string;
  hasWarning: boolean;
  isRedGlow: boolean;
  issues: string[];
}

export function detectNodeWarnings(
  node: Device,
  nodes: Device[],
  links: Link[]
): NodeWarning {
  const issues: string[] = [];

  if (!node.on) {
    return { nodeId: node.id, hasWarning: false, isRedGlow: false, issues: [] };
  }

  const isRouterType = (type: string) =>
    ['router', 'wifi_router', 'firewall', 'l3_switch', 'internet'].includes(type);

  // 0. Check Missing IP on endpoints/gateways (switches, APs and Internet WAN are excluded)
  if (node.type !== 'switch' && node.type !== 'wifi_ap' && node.type !== 'internet' && (!node.ip || node.ip.trim() === '')) {
    issues.push(`Saknar IP-adress (Okonfigurerad enhet)`);
  }

  // 1. Check Duplicate IP
  if (node.type !== 'internet' && node.ip && node.ip.trim() !== '') {
    const duplicateCount = nodes.filter(
      (n) => n.on && n.id !== node.id && n.ip === node.ip
    ).length;
    if (duplicateCount > 0) {
      issues.push(`IP-konflikt: IP-adressen ${node.ip} används redan av en annan enhet`);
    }
  }

  // 2. Check Gateway Conflicts
  if (!isRouterType(node.type) && node.gateway && node.gateway.trim() !== '') {
    if (node.gateway === node.ip) {
      issues.push(`Gateway-konflikt: Gateway är inställd till enhetens eget IP (${node.gateway})`);
    } else if (node.ip && node.subnetMask && !isInSubnet(node.gateway, node.ip, node.subnetMask)) {
      issues.push(
        `Subnät-konflikt: Gateway (${node.gateway}) ligger utanför enhetens subnät (${node.ip}/${node.subnetMask})`
      );
    } else {
      const gwExists = nodes.some((n) => n.on && n.ip === node.gateway);
      if (!gwExists) {
        issues.push(`Gateway saknas: Ingen aktiv router/gateway har IP ${node.gateway}`);
      }
    }
  }

  // 3. Check Packet Loss on attached links
  const nodeLinks = links.filter((l) => l.a === node.id || l.b === node.id);
  const highLossLink = nodeLinks.find((l) => l.packetLossPercent >= 10);
  if (highLossLink) {
    issues.push(`Hög paketförlust: Ansluten länk har ${highLossLink.packetLossPercent}% paketförlust`);
  }

  // 4. Check Subnet mismatch with directly connected non-router neighbors
  if (!isRouterType(node.type) && node.ip && node.subnetMask) {
    nodeLinks.forEach((link) => {
      const neighborId = link.a === node.id ? link.b : link.a;
      const neighbor = nodes.find((n) => n.id === neighborId && n.on);
      if (neighbor && !isRouterType(neighbor.type) && neighbor.ip) {
        if (!isInSubnet(neighbor.ip, node.ip, node.subnetMask)) {
          issues.push(
            `Subnät-mismatch: Direktansluten till ${neighbor.name} (${neighbor.ip}) i ett annat subnät utan router`
          );
        }
      }
    });
  }

  const hasWarning = issues.length > 0;
  return {
    nodeId: node.id,
    hasWarning,
    isRedGlow: hasWarning,
    issues,
  };
}

/**
 * Creates a mock capture packet log entry.
 */
export function createCapturePacket(
  srcNode: Device,
  dstNode: Device,
  protocol: 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'ARP' | 'MALWARE',
  status: 'SUCCESS' | 'DROPPED_FIREWALL' | 'UNREACHABLE' | 'OFFLINE',
  info: string,
  hopsCount: number
): CapturedPacket {
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

  return {
    id: 'pkt_' + Math.random().toString(36).substring(2, 9),
    timestamp,
    sourceId: srcNode.id,
    sourceName: srcNode.name,
    sourceIp: srcNode.ip,
    destId: dstNode.id,
    destName: dstNode.name,
    destIp: dstNode.ip,
    protocol,
    info,
    status,
    ttl: 64 - hopsCount,
    hopsCount,
    payload: `PAYLOAD [${protocol}] SrcPort:${Math.floor(1024 + Math.random() * 50000)} -> DstPort:${protocol === 'HTTP' ? 80 : protocol === 'DNS' ? 53 : 443} Len=${Math.floor(64 + Math.random() * 1400)}B`,
  };
}
