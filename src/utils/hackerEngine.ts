import { Device, Link, CapturedPacket, NetworkContainer, IotRule } from '../types';

export const isHackerDevice = (type?: string): boolean => {
  if (!type) return false;
  return (
    type === 'hacker' ||
    type === 'hacker_botnet' ||
    type === 'hacker_pineapple' ||
    type === 'hacker_c2' ||
    type === 'hacker_implant' ||
    type === 'hacker_stager' ||
    type.startsWith('hacker_')
  );
};

export const isIoTDevice = (type?: string): boolean => {
  if (!type) return false;
  return (
    type.startsWith('iot_') ||
    type === 'client_camera' ||
    type === 'client_pos'
  );
};

export interface AttackProfileDef {
  id:
    | 'port_scan'
    | 'ddos'
    | 'mitm'
    | 'malware_injection'
    | 'ransomware'
    | 'zero_day'
    | 'dns_poison'
    | 'autonomous_ai';
  name: string;
  shortDesc: string;
  badge: string;
  icon: string;
  protocol: 'TCP' | 'UDP' | 'ARP' | 'DNS' | 'ICMP' | 'MALWARE';
  color: string;
  secondaryColor: string;
  glowId: string;
  threatLevel: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'APOCALYPTIC';
}

export const ATTACK_PROFILES: Record<string, AttackProfileDef> = {
  autonomous_ai: {
    id: 'autonomous_ai',
    name: 'Autonom Cyber Kill-Chain (AI)',
    shortDesc: 'Automatisk 5-stegs attacksekvens som anpassar sig efter försvaret',
    badge: 'AI-CYBER',
    icon: '🤖',
    protocol: 'MALWARE',
    color: '#8b5cf6',
    secondaryColor: '#c084fc',
    glowId: 'glow-purple',
    threatLevel: 'APOCALYPTIC',
  },
  zero_day: {
    id: 'zero_day',
    name: '0-Day Remote Code Exploit',
    shortDesc: 'Utnyttjar opatchade RCE sårbarheter och kernel exploits',
    badge: '0-DAY RCE',
    icon: '🔥',
    protocol: 'MALWARE',
    color: '#f43f5e',
    secondaryColor: '#fda4af',
    glowId: 'glow-red',
    threatLevel: 'CRITICAL',
  },
  ransomware: {
    id: 'ransomware',
    name: 'Ransomware Cryptolocker Detonation',
    shortDesc: 'Krypterar lokala lagringsenheter och raderar skuggkopior',
    badge: 'RANSOMWARE',
    icon: '🔒',
    protocol: 'MALWARE',
    color: '#ef4444',
    secondaryColor: '#f87171',
    glowId: 'glow-red',
    threatLevel: 'CRITICAL',
  },
  malware_injection: {
    id: 'malware_injection',
    name: 'Trojan / C2 Reverse Shell',
    shortDesc: 'Infiltrerar bakdörrar och etablerar C2-kommunikation',
    badge: 'C2 BOTNET',
    icon: '☣️',
    protocol: 'MALWARE',
    color: '#ec4899',
    secondaryColor: '#f472b6',
    glowId: 'glow-magenta',
    threatLevel: 'HIGH',
  },
  ddos: {
    id: 'ddos',
    name: 'DDoS SYN / UDP Botnet Flood',
    shortDesc: 'Högfrekvent överbelastningsstorm som mättar bandbredd',
    badge: 'DDOS FLOOD',
    icon: '⚡',
    protocol: 'TCP',
    color: '#dc2626',
    secondaryColor: '#fca5a5',
    glowId: 'glow-red',
    threatLevel: 'HIGH',
  },
  mitm: {
    id: 'mitm',
    name: 'ARP Poisoning & Trafiksniffning',
    shortDesc: 'Förfalskar MAC-adresser för att avlyssna och manipulera trafik',
    badge: 'MITM SNIFF',
    icon: '🕵️',
    protocol: 'ARP',
    color: '#f59e0b',
    secondaryColor: '#fde047',
    glowId: 'glow-amber',
    threatLevel: 'MEDIUM',
  },
  dns_poison: {
    id: 'dns_poison',
    name: 'DNS Cache Poisoning / Spoofing',
    shortDesc: 'Dirigerar om domännamn till skadliga servrar',
    badge: 'DNS SPOOF',
    icon: '🌐',
    protocol: 'DNS',
    color: '#06b6d4',
    secondaryColor: '#67e8f9',
    glowId: 'glow-cyan',
    threatLevel: 'MEDIUM',
  },
  port_scan: {
    id: 'port_scan',
    name: 'Stealth SYN/XMAS Portskanning',
    shortDesc: 'Kartlägger aktiva portar, tjänster och OS-fingeravtryck',
    badge: 'RECON SCAN',
    icon: '🔍',
    protocol: 'TCP',
    color: '#0ea5e9',
    secondaryColor: '#7dd3fc',
    glowId: 'glow-cyan',
    threatLevel: 'INFO',
  },
};

/**
 * Traverses reachable devices connected to a hacker device (direct or across switches/routers).
 */
export function findReachableTargetsForHacker(
  hacker: Device,
  nodes: Device[],
  links: Link[]
): Device[] {
  const visited = new Set<string>();
  const queue: string[] = [hacker.id];
  visited.add(hacker.id);

  const reachableNodes: Device[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodes.find((n) => n.id === currentId);

    // Find all links connected to current node
    for (const link of links) {
      const neighborId = link.a === currentId ? link.b : link.b === currentId ? link.a : null;
      if (!neighborId || visited.has(neighborId)) continue;

      visited.add(neighborId);
      const neighborNode = nodes.find((n) => n.id === neighborId);
      if (!neighborNode || !neighborNode.on) continue;

      // If neighbor is an online target (not another hacker, and not internet WAN)
      if (
        !isHackerDevice(neighborNode.type) &&
        neighborNode.type !== 'internet'
      ) {
        reachableNodes.push(neighborNode);
      }

      // Continue traversing through intermediate network hardware (switches, routers, access points)
      if (
        neighborNode.type === 'switch' ||
        neighborNode.type === 'l3_switch' ||
        neighborNode.type === 'router' ||
        neighborNode.type === 'wifi_router' ||
        neighborNode.type === 'wifi_ap' ||
        neighborNode.type === 'firewall'
      ) {
        queue.push(neighborId);
      }
    }
  }

  // Sort targets so endpoints (servers, PCs) come first, then routers/switches
  return reachableNodes.sort((a, b) => {
    const isEndpointA = a.type.startsWith('server') || a.type.startsWith('client');
    const isEndpointB = b.type.startsWith('server') || b.type.startsWith('client');
    if (isEndpointA && !isEndpointB) return -1;
    if (!isEndpointA && isEndpointB) return 1;
    return 0;
  });
}

/**
 * Automatically selects and binds a target for a hacker node when connected.
 */
export function autoSelectTargetForHacker(
  hacker: Device,
  nodes: Device[],
  links: Link[]
): Device | null {
  // If hacker already has a target that is reachable, keep it
  if (hacker.hackerTargetIp) {
    const existing = nodes.find(
      (n) => (n.ip === hacker.hackerTargetIp || n.id === hacker.hackerTargetIp) && n.on
    );
    if (existing) return existing;
  }

  // Find reachable targets through the network graph
  const reachables = findReachableTargetsForHacker(hacker, nodes, links);
  if (reachables.length > 0) {
    return reachables[0];
  }

  // Fallback: any other active device with an IP
  const otherNode = nodes.find(
    (n) => n.id !== hacker.id && n.on && !isHackerDevice(n.type) && n.type !== 'internet' && n.ip
  );
  return otherNode || null;
}

/**
 * Progresses through the autonomous AI Kill Chain sequence.
 */
export function advanceKillChainStage(
  currentStage?: 'RECON' | 'VULN_SCAN' | 'EXPLOIT' | 'LATERAL_MOVE' | 'IMPACT'
): 'RECON' | 'VULN_SCAN' | 'EXPLOIT' | 'LATERAL_MOVE' | 'IMPACT' {
  switch (currentStage) {
    case 'RECON':
      return 'VULN_SCAN';
    case 'VULN_SCAN':
      return 'EXPLOIT';
    case 'EXPLOIT':
      return 'LATERAL_MOVE';
    case 'LATERAL_MOVE':
      return 'IMPACT';
    case 'IMPACT':
    default:
      return 'RECON';
  }
}

/**
 * Generates rich, realistic cybersecurity attack payload details.
 */
export function generateAttackDetails(
  hacker: Device,
  target: Device,
  attackType: string,
  isSuccess: boolean,
  killChainStage?: string
): {
  info: string;
  protocol: 'TCP' | 'UDP' | 'ARP' | 'DNS' | 'ICMP' | 'MALWARE';
  payloadSummary: string;
  isBreach: boolean;
  alertTitle?: string;
  alertMsg?: string;
} {
  const randomPort = [80, 443, 22, 53, 445, 3389, 8080, 21, 8443][
    Math.floor(Math.random() * 9)
  ];
  const stealthPrefix = hacker.hackerStealthMode ? '[STEALTH SPOOFED] ' : '';

  switch (attackType) {
    case 'autonomous_ai': {
      const stage = killChainStage || 'RECON';
      if (stage === 'RECON') {
        return {
          protocol: 'TCP',
          info: `${stealthPrefix}AI-KillChain [RECON]: SYN stealth scanning ${target.ip}:${randomPort} (TCP Handshake Fingerprint)`,
          payloadSummary: 'TCP SYN Seq=0xCAFEBABE Ack=0 Win=65535 TTL=64',
          isBreach: false,
        };
      } else if (stage === 'VULN_SCAN') {
        return {
          protocol: 'TCP',
          info: `${stealthPrefix}AI-KillChain [VULN_SCAN]: Probing CVE-2024-38077 (RDL Remote Exec) on port ${randomPort}`,
          payloadSummary: 'SMBv2 Negotiate / RPC Bind Probe to UUID 338c-8509',
          isBreach: false,
        };
      } else if (stage === 'EXPLOIT') {
        return {
          protocol: 'MALWARE',
          info: `${stealthPrefix}AI-KillChain [EXPLOIT]: Levererar Heap Overflow Payload mot "${target.name}" (${target.ip})`,
          payloadSummary: 'Shellcode: \\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68\\x68\\x2f\\x62\\x69\\x6e',
          isBreach: isSuccess,
          alertTitle: 'AUTONOM EXPLOIT LYCKAD',
          alertMsg: `AI-KillChain har framgångsrikt exploaterat sårbarhet på "${target.name}". Systemminne komprometterat.`,
        };
      } else if (stage === 'LATERAL_MOVE') {
        return {
          protocol: 'ARP',
          info: `${stealthPrefix}AI-KillChain [LATERAL]: Förgiftar ARP-tabell för gateway spoofing och intern credential-dump`,
          payloadSummary: 'ARP Reply: Is-At 00:50:56:HA:CK:ER telling target gateway is poisoned',
          isBreach: isSuccess,
          alertTitle: 'LATERAL MOVEMENT DETEKTERAT',
          alertMsg: `Hackaren sprider sig i nätverket via "${target.name}". Intern avlyssning aktiv.`,
        };
      } else {
        return {
          protocol: 'MALWARE',
          info: `${stealthPrefix}AI-KillChain [IMPACT]: Ransomware LockBit v3.0 kryptering aktiverad & dataexfiltrering pågår`,
          payloadSummary: 'RSA-4096 Key Delivery + Volume Shadow Copy Purge (vssadmin delete shadows /all /quiet)',
          isBreach: isSuccess,
          alertTitle: 'KRITISK IMPACT: SYSTEM LÅST',
          alertMsg: `Total kompromettering av "${target.name}" (${target.ip}). Data krypteras och exfiltreras.`,
        };
      }
    }

    case 'zero_day': {
      const cves = [
        'CVE-2024-21762 FortiOS SSL-VPN Remote Code Execution',
        'CVE-2024-30078 Windows Wi-Fi Kernel Driver Remote Code Execution',
        'CVE-2023-46805 Ivanti Connect Secure Authentication Bypass',
        'CVE-2021-44228 Apache Log4j JNDI Remote Code Injection',
      ];
      const selectedCve = cves[Math.floor(Math.random() * cves.length)];
      return {
        protocol: 'MALWARE',
        info: `${stealthPrefix}0-Day Exploit: Utnyttjar ${selectedCve} mot port ${randomPort}`,
        payloadSummary: 'Kernel RCE Payload: NOP-sled (0x90*64) + Return-Oriented Programming (ROP) Chain',
        isBreach: isSuccess,
        alertTitle: '0-DAY EXPLOIT INJICERAD',
        alertMsg: `Kritisk 0-Day exploit lyckades penetrera "${target.name}" (${target.ip}). Root-åtkomst etablerad!`,
      };
    }

    case 'ransomware': {
      return {
        protocol: 'MALWARE',
        info: `${stealthPrefix}Ransomware Detonation: AES-256 krypteringsmodul injiceras i minnet på ${target.ip}`,
        payloadSummary: 'CryptoLocker payload + Kill Switch Bypass + VSS Purge',
        isBreach: isSuccess,
        alertTitle: 'RANSOMWARE KRYPTERING PÅGÅR',
        alertMsg: `Ransomware har infekterat "${target.name}" (${target.ip}). Lokala diskar låses.`,
      };
    }

    case 'malware_injection': {
      const trojans = [
        'Trojan.CobaltStrike Beacon reverse HTTPS callback',
        'Backdoor.Metasploit Meterpreter reverse TCP stager',
        'Spyware.Keylogger stealth memory injection',
      ];
      const selectedTrojan = trojans[Math.floor(Math.random() * trojans.length)];
      return {
        protocol: 'MALWARE',
        info: `${stealthPrefix}Trojan / C2: ${selectedTrojan} till port ${randomPort}`,
        payloadSummary: 'C2 Payload: HTTPS beaconing interval 5s, Jitter 20%',
        isBreach: isSuccess,
        alertTitle: 'C2 BAKDÖRR ETABLERAD',
        alertMsg: `En skadlig trojan etablerade kontakt på "${target.name}" (${target.ip}).`,
      };
    }

    case 'ddos': {
      return {
        protocol: 'TCP',
        info: `${stealthPrefix}DDoS Flood: Skickar 50 000 pps SYN-flood mot port ${randomPort} (1024B paket)`,
        payloadSummary: 'TCP SYN Flood Flag=SYN Win=0 Len=1024 RandomSourcePort=1024-65535',
        isBreach: false,
      };
    }

    case 'mitm': {
      return {
        protocol: 'ARP',
        info: `${stealthPrefix}ARP Poisoning: Förfalskar default gateway MAC mot "${target.name}" (${target.ip})`,
        payloadSummary: `ARP Spoofing: ${target.gateway || '192.168.1.1'} is at ${hacker.mac}`,
        isBreach: isSuccess,
        alertTitle: 'MITM TRAFIKSNIFFNING AKTIV',
        alertMsg: `Trafiken från "${target.name}" omdirigeras och sniffas i realtid.`,
      };
    }

    case 'dns_poison': {
      return {
        protocol: 'DNS',
        info: `${stealthPrefix}DNS Spoofing: Svarar med falska A-records (bank.internal -> ${hacker.ip || '192.168.1.66'})`,
        payloadSummary: `DNS Response: Query=corp.internal A=${hacker.ip || '192.168.1.66'} TTL=3600`,
        isBreach: isSuccess,
        alertTitle: 'DNS CACHE FÖRGIFTAD',
        alertMsg: `DNS-uppslag från "${target.name}" har kapats och pekas mot hackaren.`,
      };
    }

    case 'port_scan':
    default: {
      const isKnown = randomPort === 80 ? 'HTTP' : randomPort === 443 ? 'HTTPS' : randomPort === 22 ? 'SSH' : 'Okänd';
      return {
        protocol: 'TCP',
        info: `${stealthPrefix}Portskanning: SYN-sond till port ${randomPort}. ${
          isSuccess ? `PORT ÖPPEN (${isKnown})` : 'Blockerad/Stängd'
        }`,
        payloadSummary: `TCP Flags=SYN Seq=${Math.floor(Math.random() * 100000)} DstPort=${randomPort}`,
        isBreach: false,
      };
    }
  }
}

export interface NodeHealthStatus {
  health: number; // 0 - 100%
  impactScore: number; // 0 - 100
  isUnderAttack: boolean;
  isInfected: boolean;
  activeAttackType?: string;
  activeAttackIntensity?: string;
  killChainStage?: string;
  attackerName?: string;
  color: {
    hex: string;
    glow: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
  };
}

/**
 * Computes smooth color interpolation from Emerald Green -> Yellow -> Orange -> Deep Crimson Red
 */
export function getHealthColor(healthPercent: number): {
  hex: string;
  glow: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
} {
  const h = Math.max(0, Math.min(100, Math.round(healthPercent)));
  let r: number, g: number, b: number;

  if (h > 65) {
    // 65..100: Emerald Green (16, 185, 129) to Yellow-Green (200, 210, 20)
    const factor = (100 - h) / 35;
    r = Math.round(16 + factor * (200 - 16));
    g = Math.round(185 + factor * (210 - 185));
    b = Math.round(129 - factor * (129 - 20));
  } else if (h > 35) {
    // 35..65: Yellow (234, 179, 8) to Orange (249, 115, 22)
    const factor = (65 - h) / 30;
    r = Math.round(234 + factor * (249 - 234));
    g = Math.round(179 - factor * (179 - 115));
    b = Math.round(8 + factor * 14);
  } else {
    // 0..35: Orange (249, 115, 22) to Deep Blood Red (220, 20, 60 / 180, 10, 30)
    const factor = (35 - h) / 35;
    r = Math.round(249 - factor * (249 - 190));
    g = Math.round(115 - factor * 95);
    b = Math.round(22 + factor * 10);
  }

  const hex = `rgb(${r}, ${g}, ${b})`;
  const glow = `rgba(${r}, ${g}, ${b}, ${h < 30 ? 0.95 : 0.65})`;

  return {
    hex,
    glow,
    textClass:
      h > 75
        ? 'text-emerald-400'
        : h > 45
        ? 'text-amber-400'
        : h > 25
        ? 'text-orange-400'
        : 'text-rose-500',
    bgClass:
      h > 75
        ? 'bg-emerald-500'
        : h > 45
        ? 'bg-amber-400'
        : h > 25
        ? 'bg-orange-500'
        : 'bg-rose-600',
    borderClass:
      h > 75
        ? 'border-emerald-500/60'
        : h > 45
        ? 'border-amber-500/60'
        : 'border-rose-500/90',
  };
}

/**
 * Calculates live Attack Impact Score & Health Bar status for a given node.
 */
export function calculateNodeAttackImpactAndHealth(
  node: Device,
  nodes: Device[],
  capturedPackets?: CapturedPacket[]
): NodeHealthStatus {
  // Check if node is targeted by an active hacker
  const attackers = nodes.filter(
    (h) =>
      isHackerDevice(h.type) &&
      h.on &&
      h.hackerAttackActive &&
      ((node.ip && h.hackerTargetIp === node.ip) || h.hackerTargetIp === node.id)
  );

  const isUnderAttack = attackers.length > 0;
  const isInfected = !!node.isInfected;

  let impactScore = 0;
  let activeAttackType: string | undefined;
  let activeAttackIntensity: string | undefined;
  let killChainStage: string | undefined;
  let attackerName: string | undefined;

  if (isUnderAttack) {
    const primaryAttacker = attackers[0];
    attackerName = primaryAttacker.name;
    activeAttackType = primaryAttacker.hackerAttackType || 'autonomous_ai';
    activeAttackIntensity = primaryAttacker.hackerAttackIntensity || 'aggressive';
    killChainStage = primaryAttacker.hackerKillChainStage || 'RECON';

    // Base impact score from intensity
    switch (activeAttackIntensity) {
      case 'low-noise':
        impactScore += 25;
        break;
      case 'aggressive':
        impactScore += 52;
        break;
      case 'brute-force-flood':
        impactScore += 78;
        break;
      case 'apocalyptic':
        impactScore += 92;
        break;
      default:
        impactScore += 50;
    }

    // Modifier from attack type & kill chain stage
    if (activeAttackType === 'autonomous_ai') {
      if (killChainStage === 'VULN_SCAN') impactScore += 8;
      else if (killChainStage === 'EXPLOIT') impactScore += 18;
      else if (killChainStage === 'LATERAL_MOVE') impactScore += 22;
      else if (killChainStage === 'IMPACT') impactScore += 28;
    } else if (activeAttackType === 'zero_day') {
      impactScore += 20;
    } else if (activeAttackType === 'ransomware') {
      impactScore += 25;
    } else if (activeAttackType === 'malware_injection') {
      impactScore += 15;
    } else if (activeAttackType === 'ddos') {
      impactScore += 18;
    } else if (activeAttackType === 'mitm') {
      impactScore += 12;
    } else if (activeAttackType === 'dns_poison') {
      impactScore += 10;
    } else {
      impactScore += 5;
    }
  }

  if (isInfected) {
    impactScore = Math.max(impactScore, 75);
  }

  // Factor in recent successful vs dropped packets for this node
  if (capturedPackets && capturedPackets.length > 0 && (isUnderAttack || isInfected)) {
    const targetPackets = capturedPackets
      .slice(0, 25)
      .filter((p) => p.destIp === node.ip || p.destName === node.name);

    const successfulAttacks = targetPackets.filter(
      (p) =>
        p.status === 'SUCCESS' &&
        (p.protocol === 'MALWARE' ||
          p.info.toLowerCase().includes('exploit') ||
          p.info.toLowerCase().includes('flood') ||
          p.info.toLowerCase().includes('poisoning'))
    ).length;

    impactScore += successfulAttacks * 4;
  }

  // Antivirus EDR Protection Mitigation
  if (node.antivirusInstalled && node.antivirusRealtimeProtection && impactScore > 0) {
    // EDR Shield reduces attack impact by 80%
    impactScore = Math.round(impactScore * 0.2);
  }

  // Bound impact score to 0..100
  impactScore = Math.max(0, Math.min(100, Math.round(impactScore)));

  // If node is completely calm (not under attack and not infected), impact is 0
  if (!isUnderAttack && !isInfected) {
    impactScore = 0;
  }

  // Health is reciprocal of impact score
  const health = Math.max(0, Math.min(100, 100 - impactScore));
  const color = getHealthColor(health);

  return {
    health,
    impactScore,
    isUnderAttack,
    isInfected,
    activeAttackType,
    activeAttackIntensity,
    killChainStage,
    attackerName,
    color,
  };
}

export function isDeviceInSameSubnet(
  nodeA: Device,
  nodeB: Device,
  containers: NetworkContainer[] = []
): boolean {
  if (nodeA.id === nodeB.id) return false;

  // Check container overlap
  const sharedContainer = containers.find(
    (c) => c.nodeIds?.includes(nodeA.id) && c.nodeIds?.includes(nodeB.id)
  );
  if (sharedContainer) return true;

  // Check IP prefix match (e.g. 192.168.1.X)
  if (nodeA.ip && nodeB.ip && nodeA.ip.includes('.') && nodeB.ip.includes('.')) {
    const prefixA = nodeA.ip.split('.').slice(0, 3).join('.');
    const prefixB = nodeB.ip.split('.').slice(0, 3).join('.');
    if (prefixA === prefixB && prefixA.length > 0) return true;
  }

  return false;
}

export function evaluateIotRulesForDevice(
  node: Device,
  allNodes: Device[],
  containers: NetworkContainer[] = []
): { updatedNode: Device; triggeredRules: string[] } {
  if (!isIoTDevice(node.type) || !node.iotRules || node.iotRules.length === 0) {
    return { updatedNode: node, triggeredRules: [] };
  }

  const activeHackers = allNodes.filter((n) => isHackerDevice(n.type) && n.on);
  const activeAttacks = activeHackers.some((h) => h.hackerAttackActive);

  const hackerInSubnet = activeHackers.some((hacker) =>
    isDeviceInSameSubnet(node, hacker, containers)
  );

  const deviceInfected =
    node.isInfected ||
    allNodes.some((n) => n.isInfected && isDeviceInSameSubnet(node, n, containers));

  let currentIotState = node.iotState !== false;
  let newLogs = [...(node.iotLogs || [])];
  const updatedRules: IotRule[] = [];
  const triggeredRulesNames: string[] = [];

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  for (const rule of node.iotRules) {
    if (!rule.enabled) {
      updatedRules.push(rule);
      continue;
    }

    let isTriggered = false;
    let reasonMsg = '';

    if (rule.trigger === 'hacker_in_subnet' && hackerInSubnet) {
      isTriggered = true;
      const hackerObj = activeHackers.find((h) => isDeviceInSameSubnet(node, h, containers));
      reasonMsg = `Hacker-enhet (${hackerObj?.name || 'Inkräktare'}) detekterad i samma subnät`;
    } else if (rule.trigger === 'hacker_attack_active' && activeAttacks) {
      isTriggered = true;
      reasonMsg = `Aktiv cyberattack detekterad i nätverket`;
    } else if (rule.trigger === 'device_infected' && deviceInfected) {
      isTriggered = true;
      reasonMsg = `Smitta/Skadlig kod upptäckt i lokala zonen`;
    }

    if (isTriggered) {
      triggeredRulesNames.push(rule.name);
      let actionLog = '';

      if (rule.action === 'turn_off' && currentIotState) {
        currentIotState = false;
        actionLog = `[${timestamp}] ⚡ IFTTT UTLOSTE ["${rule.name}"]: ${reasonMsg} -> STÄNGER AV ENHET (OFF)`;
      } else if (rule.action === 'turn_on' && !currentIotState) {
        currentIotState = true;
        actionLog = `[${timestamp}] ⚡ IFTTT UTLOSTE ["${rule.name}"]: ${reasonMsg} -> SLÅR PÅ ENHET (ON)`;
      } else if (rule.action === 'lock_device') {
        currentIotState = true;
        actionLog = `[${timestamp}] ⚡ IFTTT UTLOSTE ["${rule.name}"]: ${reasonMsg} -> LÅSER ENHET & AKTIVERAR NÖDLÄGE`;
      } else if (rule.action === 'log_alert') {
        actionLog = `[${timestamp}] 🚨 IFTTT LARM ["${rule.name}"]: ${reasonMsg}`;
      }

      if (actionLog) {
        newLogs.unshift(actionLog);
      }

      updatedRules.push({
        ...rule,
        lastTriggered: timestamp,
      });
    } else {
      updatedRules.push(rule);
    }
  }

  const updatedNode: Device = {
    ...node,
    iotState: currentIotState,
    iotLogs: newLogs.slice(0, 20),
    iotRules: updatedRules,
  };

  return { updatedNode, triggeredRules: triggeredRulesNames };
}

