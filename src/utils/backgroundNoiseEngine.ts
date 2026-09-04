import { Device, Link, CapturedPacket } from '../types';
import { findPathAndSimulate, createCapturePacket } from './networkEngine';

export interface BackgroundNoiseResult {
  packet: CapturedPacket;
  linkIds: string[];
  color: string;
  duration: number;
}

interface NoiseTemplate {
  protocol: 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'ARP';
  port: number;
  color: string;
  getInfo: (src: Device, dst: Device) => string;
  getPayload: (src: Device, dst: Device) => string;
}

const NOISE_TEMPLATES: NoiseTemplate[] = [
  {
    protocol: 'ARP',
    port: 0,
    color: '#10b981', // Emerald
    getInfo: (src, dst) => `ARP Who has ${dst.ip || '192.168.1.254'}? Tell ${src.ip || '192.168.1.1'} (Låg-prio cacheuppdatering)`,
    getPayload: (src, dst) =>
      `ARP REQUEST [Hardware: Ethernet (1), Protocol: IPv4 (0x0800), Opcode: 1 (Request), Sender MAC: ${src.mac || '52:54:00:12:34:56'}, Target IP: ${dst.ip || '192.168.1.254'}] Len=42B`,
  },
  {
    protocol: 'DNS',
    port: 53,
    color: '#06b6d4', // Cyan
    getInfo: (src) => `DNS Standard query 0x${Math.floor(1000 + Math.random() * 8999).toString(16)} A ntp.pool.org (Bakgrundsuppslag från ${src.name})`,
    getPayload: (src) =>
      `DNS QUERY [Flags: 0x0100 Standard query, QNAME: time.cloudflare.com, QTYPE: A, QCLASS: IN, Client: ${src.ip || 'DHCP'}] Len=68B`,
  },
  {
    protocol: 'UDP',
    port: 123,
    color: '#f59e0b', // Amber
    getInfo: (src, dst) => `NTP v4 Tidssynkronisering (Stratum 2 keepalive probe -> ${dst.name})`,
    getPayload: (src, dst) =>
      `NTP v4 Client Request [Mode: 3 (Client), Stratum: 2, Poll: 6 (64s), Precision: 2^-18, Root Delay: 12.4ms, Transmit Timestamp: ${new Date().toISOString()}] Len=76B`,
  },
  {
    protocol: 'ICMP',
    port: 0,
    color: '#38bdf8', // Sky Blue
    getInfo: (src, dst) => `ICMP Echo heartbeat (Låg-prioritets telemetri och latency-probe mot ${dst.name})`,
    getPayload: (src, dst) =>
      `ICMP Echo Request [Type: 8, Code: 0, Checksum: 0x${Math.floor(1000 + Math.random() * 8999).toString(16)}, Identifier: 0x0001, Sequence Number: ${Math.floor(100 + Math.random() * 900)}] Len=56B`,
  },
  {
    protocol: 'UDP',
    port: 5353,
    color: '#8b5cf6', // Violet
    getInfo: (src) => `mDNS/SSDP Tjänsteannonsering (Multicast 224.0.0.251 _workstation._tcp.local från ${src.name})`,
    getPayload: (src) =>
      `mDNS [SrcPort: 5353, DstPort: 5353, Service: _http._tcp.local, Host: ${src.name.toLowerCase().replace(/\s+/g, '-')}.local, TTL: 120s, Cache-flush: True] Len=92B`,
  },
  {
    protocol: 'TCP',
    port: 443,
    color: '#a855f7', // Purple
    getInfo: (src, dst) => `TCP Keep-Alive Heartbeat [Win=65535, Len=0, Ack=${Math.floor(1000 + Math.random() * 5000)}] (${src.name} ↔ ${dst.name})`,
    getPayload: (src, dst) =>
      `TCP Segment [SrcPort: ${Math.floor(49152 + Math.random() * 10000)}, DstPort: 443, Flags: [ACK], Seq: ${Math.floor(1000 + Math.random() * 5000)}, Ack: ${Math.floor(5000 + Math.random() * 5000)}, Window: 65535, Len: 0] Len=54B`,
  },
  {
    protocol: 'UDP',
    port: 161,
    color: '#14b8a6', // Teal
    getInfo: (src, dst) => `SNMP Hälsopolling (GetNextRequest 1.3.6.1.2.1.1.1 MIB-II från ${src.name} till ${dst.name})`,
    getPayload: (src, dst) =>
      `SNMPv2c [Community: 'public', PDU: GetNextRequest, Request-ID: 0x${Math.floor(1000 + Math.random() * 8999).toString(16)}, OID: 1.3.6.1.2.1.2.2.1.10 (ifInOctets)] Len=84B`,
  },
  {
    protocol: 'UDP',
    port: 8888,
    color: '#6366f1', // Indigo
    getInfo: (src, dst) => `LLDP/CDP Grannskaps-beacon (L2 periodisk topologiannonsering från ${src.name})`,
    getPayload: (src, dst) =>
      `LLDP Frame [Chassis Subtype: MAC (${src.mac || '02:42:ac:11:00:02'}), Port Subtype: Interface Name (eth0), System Name: ${src.name}, TTL: 120s] Len=72B`,
  },
];

/**
 * Generates a realistic low-priority background noise packet between active nodes in the topology.
 * Follows physical and logical topology paths with realistic protocols (ARP, DNS, NTP, mDNS, ICMP, SNMP, TCP keepalive).
 */
export function generateBackgroundNoisePacket(
  nodes: Device[],
  links: Link[]
): BackgroundNoiseResult | null {
  // Only powered-on nodes can send or receive
  const activeNodes = nodes.filter((n) => n.on);
  if (activeNodes.length < 2 || links.length === 0) {
    return null;
  }

  // Choose a random source node
  const srcNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];

  // Determine candidate destination nodes.
  // We prefer neighbors directly connected via links 60% of the time,
  // or any reachable active node 40% of the time.
  const neighborIds = links
    .filter((l) => l.a === srcNode.id || l.b === srcNode.id)
    .map((l) => (l.a === srcNode.id ? l.b : l.a));

  const neighborNodes = activeNodes.filter((n) => neighborIds.includes(n.id));

  let dstNode: Device | undefined;
  if (neighborNodes.length > 0 && Math.random() < 0.6) {
    dstNode = neighborNodes[Math.floor(Math.random() * neighborNodes.length)];
  } else {
    const nonSelf = activeNodes.filter((n) => n.id !== srcNode.id);
    if (nonSelf.length === 0) return null;
    dstNode = nonSelf[Math.floor(Math.random() * nonSelf.length)];
  }

  if (!dstNode) return null;

  // Pick a noise template
  const template = NOISE_TEMPLATES[Math.floor(Math.random() * NOISE_TEMPLATES.length)];

  // Run the network engine to trace physical links and firewall rules
  const simResult = findPathAndSimulate(
    srcNode.id,
    dstNode.id,
    nodes,
    links,
    template.protocol,
    template.port
  );

  // If no path exists, we still generate an ARP who-has broadcast on local link if neighbor exists
  const linkIds = simResult.pathLinks.map((l) => l.id);

  const status = simResult.success
    ? 'SUCCESS'
    : simResult.logs.some((l) => l.includes('brandvägg'))
    ? 'DROPPED_FIREWALL'
    : 'UNREACHABLE';

  const infoText = template.getInfo(srcNode, dstNode);
  const payloadText = template.getPayload(srcNode, dstNode);

  const hopsCount = Math.max(1, simResult.pathNodes.length);
  const rawPkt = createCapturePacket(
    srcNode,
    dstNode,
    template.protocol,
    status,
    `[Bakgrundsbrus / Låg prio] ${infoText}`,
    hopsCount
  );

  const packet: CapturedPacket = {
    ...rawPkt,
    priority: 'low',
    isNoise: true,
    payload: payloadText,
  };

  return {
    packet,
    linkIds,
    color: template.color,
    duration: 1.2,
  };
}
