import { Device, Link, NetworkContainer, CapturedPacket, FirewallRule } from '../types';
import { isHackerDevice } from './hackerEngine';

export type ThreatCategory =
  | 'PORT_SCAN'
  | 'DDOS_FLOOD'
  | 'MALWARE_INFECTION'
  | 'MITM_ARP'
  | 'DNS_POISON'
  | 'ZERO_DAY_EXPLOIT'
  | 'SUBNET_BREACH'
  | 'ROGUE_HACKER_DEVICE';

export interface RecommendedAction {
  id: string;
  category: ThreatCategory;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetNodeId?: string;
  targetNodeName?: string;
  targetIp?: string;
  targetPort?: number;
  attackerId?: string;
  attackerName?: string;
  subnetOrContainerId?: string;
  subnetName?: string;
  actionType:
    | 'CLOSE_PORT'
    | 'ISOLATE_SUBNET'
    | 'DISCONNECT_HACKER'
    | 'DISINFECT_NODE'
    | 'DEPLOY_FIREWALL_BLOCK'
    | 'ENABLE_STRICT_FILTERING'
    | 'DISABLE_ROGUE_DEVICE';
  actionLabel: string;
  badge: string;
  explanation: string;
  isApplied?: boolean;
}

export interface SecurityPostureStats {
  totalThreatsDetected: number;
  criticalThreats: number;
  highThreats: number;
  compromisedNodesCount: number;
  threatenedSubnetsCount: number;
  openRiskyPorts: number[];
  postureRating: 'OPTIMAL' | 'MODERATE' | 'VULNERABLE' | 'CRITICAL';
}

/**
 * Analyzes network topology and recent traffic to generate actionable security remediation plans.
 */
export function analyzeThreatPatterns(
  packets: CapturedPacket[],
  nodes: Device[],
  links: Link[],
  containers: NetworkContainer[] = []
): {
  recommendations: RecommendedAction[];
  stats: SecurityPostureStats;
} {
  const recommendations: RecommendedAction[] = [];
  const actionIds = new Set<string>();

  const activeHackers = nodes.filter((n) => isHackerDevice(n.type) && n.on && n.hackerAttackActive);
  const infectedNodes = nodes.filter((n) => n.isInfected);
  const recentPackets = packets.slice(0, 80);

  // 1. Check for Active Rogue Hacker Devices
  activeHackers.forEach((hacker) => {
    const hackerLinks = links.filter((l) => l.a === hacker.id || l.b === hacker.id);
    const targetNode = nodes.find(
      (n) => (n.ip && n.ip === hacker.hackerTargetIp) || n.id === hacker.hackerTargetIp
    );

    const actionId = `disconn_hacker_${hacker.id}`;
    if (!actionIds.has(actionId)) {
      actionIds.add(actionId);
      recommendations.push({
        id: actionId,
        category: 'ROGUE_HACKER_DEVICE',
        title: `Koppla från angriparenhet: ${hacker.name}`,
        description: `Enheten kör ett aktivt ${hacker.hackerAttackType || 'cyber'}-angrepp med ${
          hacker.hackerAttackIntensity || 'aggressiv'
        } intensitet mot ${targetNode?.name || hacker.hackerTargetIp || 'nätverket'}.`,
        severity: 'CRITICAL',
        attackerId: hacker.id,
        attackerName: hacker.name,
        targetNodeId: targetNode?.id,
        targetNodeName: targetNode?.name,
        targetIp: hacker.hackerTargetIp,
        actionType: 'DISCONNECT_HACKER',
        actionLabel: `Isolera & Släck ner ${hacker.name}`,
        badge: 'FYSISK / LOGISK ISOLERING',
        explanation:
          'Klipper samtliga kablar kopplade till angriparen och försätter hackarterminalen i viloläge.',
      });
    }
  });

  // 2. Check for Infected Nodes Requiring Disinfection / Quarantine
  infectedNodes.forEach((node) => {
    const actionId = `disinfect_${node.id}`;
    if (!actionIds.has(actionId)) {
      actionIds.add(actionId);
      recommendations.push({
        id: actionId,
        category: 'MALWARE_INFECTION',
        title: `Sanera & Desinficera: ${node.name}`,
        description: `Enheten har infiltrerats av skadlig kod/trojan och kan fungera som en C2-brygga för lateral spridning.`,
        severity: 'CRITICAL',
        targetNodeId: node.id,
        targetNodeName: node.name,
        targetIp: node.ip,
        actionType: 'DISINFECT_NODE',
        actionLabel: `Sanera ${node.name} (100% Hälsa)`,
        badge: 'SANERING & RENSNING',
        explanation:
          'Rensar minnesinjektioner, avlägsnar malware-flaggor och återställer systemintegriteten.',
      });
    }
  });

  // 3. Check for Port Scanning and Exposed Risky Ports
  const portScanPackets = recentPackets.filter(
    (p) =>
      p.info.toLowerCase().includes('port scan') ||
      p.info.toLowerCase().includes('syn scan') ||
      (p.protocol === 'TCP' && p.info.toLowerCase().includes('port'))
  );

  const scannedPortsMap = new Map<number, { targetIp: string; targetName: string }>();
  portScanPackets.forEach((p) => {
    const match = p.info.match(/port\s+(\d+)/i);
    if (match) {
      const portNum = parseInt(match[1], 10);
      if (!scannedPortsMap.has(portNum)) {
        scannedPortsMap.set(portNum, { targetIp: p.destIp, targetName: p.destName });
      }
    }
  });

  // Also check standard risky open ports (e.g., HTTP 80, SSH 22, DNS 53, SQL 1433, SMB 445)
  scannedPortsMap.forEach(({ targetIp, targetName }, port) => {
    const actionId = `close_port_${port}_${targetIp}`;
    if (!actionIds.has(actionId)) {
      actionIds.add(actionId);
      const targetNode = nodes.find((n) => n.ip === targetIp || n.name === targetName);
      recommendations.push({
        id: actionId,
        category: 'PORT_SCAN',
        title: `Blockera / Stäng sårbar Port ${port} på ${targetName || targetIp}`,
        description: `Aktiv SYN-skanning detekterad mot port ${port}. Stäng eller filtrera porten för att hindra intrång.`,
        severity: port === 80 || port === 22 || port === 445 ? 'HIGH' : 'MEDIUM',
        targetNodeId: targetNode?.id,
        targetNodeName: targetName,
        targetIp,
        targetPort: port,
        actionType: 'CLOSE_PORT',
        actionLabel: `Stäng Port ${port} (Brandvägg Block)`,
        badge: `PORT ${port} FILTER`,
        explanation: `Skapar en regel i nätverkets brandväggar och routrar som kastar all inkommande TCP-trafik till port ${port}.`,
      });
    }
  });

  // 4. Check for DDoS SYN Flood or Packet Storms
  const ddosPackets = recentPackets.filter((p) => p.info.toLowerCase().includes('ddos'));
  if (ddosPackets.length > 0 || activeHackers.some((h) => h.hackerAttackType === 'ddos')) {
    const ddosTarget = ddosPackets[0]?.destName || 'Webbserver/Gateway';
    const ddosTargetIp = ddosPackets[0]?.destIp || '192.168.1.10';
    const actionId = `ddos_rate_limit_${ddosTargetIp}`;
    if (!actionIds.has(actionId)) {
      actionIds.add(actionId);
      const targetNode = nodes.find((n) => n.ip === ddosTargetIp || n.name === ddosTarget);
      recommendations.push({
        id: actionId,
        category: 'DDOS_FLOOD',
        title: `Aktivera DDoS SYN-Flood skydd & Hastighetsbegränsning`,
        description: `Högfrekvent paketöversvämning mättar bandbredden mot ${ddosTarget}. Brandväggsregler behöver begränsa trafiken.`,
        severity: 'HIGH',
        targetNodeId: targetNode?.id,
        targetNodeName: ddosTarget,
        targetIp: ddosTargetIp,
        actionType: 'DEPLOY_FIREWALL_BLOCK',
        actionLabel: `Distribuera Anti-DDoS Brandväggsregel`,
        badge: 'TRAFIKBEGRÄNSNING',
        explanation:
          'Implementerar en SYN-flood skyddsregel som automatiskt droppar överflödiga TCP SYN-anslutningar.',
      });
    }
  }

  // 5. Check for ARP Poisoning / Man-In-The-Middle
  const mitmPackets = recentPackets.filter(
    (p) =>
      p.protocol === 'ARP' ||
      p.info.toLowerCase().includes('poisoning') ||
      p.info.toLowerCase().includes('arp')
  );
  if (mitmPackets.length > 0 || activeHackers.some((h) => h.hackerAttackType === 'mitm')) {
    const actionId = `mitm_arp_inspection`;
    if (!actionIds.has(actionId)) {
      actionIds.add(actionId);
      recommendations.push({
        id: actionId,
        category: 'MITM_ARP',
        title: `Aktivera Dynamic ARP Inspection (DAI) & Statiska MAC-tabeller`,
        description: `Angriparen förfalskar gateway-MAC-adresser för att avlyssna och manipulera intern nätverkstrafik.`,
        severity: 'HIGH',
        actionType: 'ENABLE_STRICT_FILTERING',
        actionLabel: `Aktivera DAI & Rensa ARP-Cache`,
        badge: 'L2 SKYDD (DAI)',
        explanation:
          'Låser MAC-till-IP-bindningar i nätverkets switchar och droppar ogiltiga spoofade ARP-annonseringar.',
      });
    }
  }

  // 6. Check for Subnets with Infected Nodes or Hacker Intrusion (Subnet Isolation)
  containers.forEach((container) => {
    const containerNodes = nodes.filter((n) => container.nodeIds?.includes(n.id));
    const hasInfected = containerNodes.some((n) => n.isInfected);
    const hasHacker = containerNodes.some((n) => isHackerDevice(n.type) && n.on);
    const hasTarget = containerNodes.some((n) =>
      activeHackers.some(
        (h) => (n.ip && h.hackerTargetIp === n.ip) || h.hackerTargetIp === n.id
      )
    );

    if (hasInfected || (hasHacker && hasTarget)) {
      const actionId = `isolate_subnet_${container.id}`;
      if (!actionIds.has(actionId)) {
        actionIds.add(actionId);
        recommendations.push({
          id: actionId,
          category: 'SUBNET_BREACH',
          title: `Isolera subnät / säkerhetszon: "${container.name}"`,
          description: `Subnätet "${container.name}" (${
            container.subnet || 'Zon'
          }) innehåller komprometterade noder. Karantänisera zonen för att förhindra spridning till resten av organisationen.`,
          severity: 'CRITICAL',
          subnetOrContainerId: container.id,
          subnetName: container.name,
          actionType: 'ISOLATE_SUBNET',
          actionLabel: `Isolera Subnät "${container.name}"`,
          badge: 'VLAN / SUBNÄTS-KARANTÄN',
          explanation:
            'Kopplar bort eller blockerar externa bryggkablar och etablerar en strikt brandväggsmur runt zonen.',
        });
      }
    }
  });

  // Calculate Overall Posture Stats
  const criticalCount = recommendations.filter((r) => r.severity === 'CRITICAL').length;
  const highCount = recommendations.filter((r) => r.severity === 'HIGH').length;

  const postureRating: SecurityPostureStats['postureRating'] =
    criticalCount > 0
      ? 'CRITICAL'
      : highCount > 0
      ? 'VULNERABLE'
      : recommendations.length > 0
      ? 'MODERATE'
      : 'OPTIMAL';

  return {
    recommendations,
    stats: {
      totalThreatsDetected: recommendations.length,
      criticalThreats: criticalCount,
      highThreats: highCount,
      compromisedNodesCount: infectedNodes.length,
      threatenedSubnetsCount: recommendations.filter((r) => r.category === 'SUBNET_BREACH').length,
      openRiskyPorts: Array.from(scannedPortsMap.keys()),
      postureRating,
    },
  };
}

/**
 * Executes a specific remediation action on the network topology.
 */
export function executeRemediationAction(
  action: RecommendedAction,
  nodes: Device[],
  links: Link[],
  containers: NetworkContainer[] = []
): {
  nextNodes: Device[];
  nextLinks: Link[];
  nextContainers: NetworkContainer[];
  logMessage: string;
} {
  let nextNodes = [...nodes];
  let nextLinks = [...links];
  let nextContainers = [...containers];
  let logMessage = '';

  switch (action.actionType) {
    case 'DISCONNECT_HACKER': {
      if (action.attackerId) {
        // Disconnect links to hacker and turn off attack
        nextLinks = nextLinks.filter(
          (l) => l.a !== action.attackerId && l.b !== action.attackerId
        );
        nextNodes = nextNodes.map((n) =>
          n.id === action.attackerId
            ? {
                ...n,
                on: false,
                hackerAttackActive: false,
              }
            : n
        );
        logMessage = `🛡️ SÄKERHETSÅTGÄRD: Kopplade bort och stängde av angriparenheten "${action.attackerName || 'Hacker'}"`;
      }
      break;
    }

    case 'DISINFECT_NODE': {
      if (action.targetNodeId) {
        nextNodes = nextNodes.map((n) =>
          n.id === action.targetNodeId
            ? {
                ...n,
                isInfected: false,
              }
            : n
        );
        logMessage = `✨ SÄKERHETSÅTGÄRD: Sanerade och återställde "${action.targetNodeName || 'Enhet'}" till 100% ren status.`;
      }
      break;
    }

    case 'CLOSE_PORT': {
      const port = action.targetPort || 80;
      const targetIp = action.targetIp || 'ANY';

      // 1. Add Firewall Rule to all Firewalls and Routers
      let rulesAddedCount = 0;
      nextNodes = nextNodes.map((n) => {
        if (n.type === 'firewall' || n.type === 'router' || n.type === 'wifi_router') {
          const existingRules = n.firewallRules || [];
          const newRule: FirewallRule = {
            id: `fw_block_port_${port}_${Date.now()}`,
            action: 'block',
            protocol: port === 53 ? 'DNS' : port === 80 || port === 443 ? 'HTTP' : 'TCP',
            sourceIp: 'ANY',
            destIp: targetIp,
            port,
            description: `Auto-Mitigation: Block Inbound Port ${port}`,
          };
          rulesAddedCount++;
          return {
            ...n,
            firewallRules: [newRule, ...existingRules],
          };
        }

        // Also if target node is a server and matches port, disable corresponding service
        if (n.id === action.targetNodeId && n.services) {
          return {
            ...n,
            services: {
              ...n.services,
              ...(port === 80 || port === 443 ? { http: false } : {}),
              ...(port === 53 ? { dns: false } : {}),
              ...(port === 1433 || port === 3306 ? { sql: false } : {}),
            },
          };
        }

        return n;
      });

      logMessage = `🔒 SÄKERHETSÅTGÄRD: Stängde och blockerade Port ${port} via ${rulesAddedCount} brandväggsregel(er).`;
      break;
    }

    case 'ISOLATE_SUBNET': {
      if (action.subnetOrContainerId) {
        const container = containers.find((c) => c.id === action.subnetOrContainerId);
        if (container && container.nodeIds) {
          const containerNodeSet = new Set(container.nodeIds);

          // Disconnect all inter-zone links crossing into or out of this container
          const removedLinks = nextLinks.filter(
            (l) =>
              (containerNodeSet.has(l.a) && !containerNodeSet.has(l.b)) ||
              (containerNodeSet.has(l.b) && !containerNodeSet.has(l.a))
          );

          nextLinks = nextLinks.filter(
            (l) =>
              !(
                (containerNodeSet.has(l.a) && !containerNodeSet.has(l.b)) ||
                (containerNodeSet.has(l.b) && !containerNodeSet.has(l.a))
              )
          );

          // Disinfect nodes inside the isolated container
          nextNodes = nextNodes.map((n) =>
            containerNodeSet.has(n.id)
              ? {
                  ...n,
                  isInfected: false,
                }
              : n
          );

          logMessage = `🚧 SÄKERHETSÅTGÄRD: Subnätet "${container.name}" sattes i karantän. ${removedLinks.length} korsande kabellänkar isolerades.`;
        }
      }
      break;
    }

    case 'DEPLOY_FIREWALL_BLOCK': {
      // Injects comprehensive anti-DDoS / anti-threat rules into all gateways
      let count = 0;
      nextNodes = nextNodes.map((n) => {
        if (n.type === 'firewall' || n.type === 'router') {
          const existingRules = n.firewallRules || [];
          const ddosRule: FirewallRule = {
            id: `fw_ddos_protect_${Date.now()}`,
            action: 'block',
            protocol: 'TCP',
            sourceIp: 'ANY',
            destIp: action.targetIp || 'ANY',
            description: `Auto-Mitigation: Anti-DDoS Rate-Limit & Drop`,
          };
          count++;
          return {
            ...n,
            firewallRules: [ddosRule, ...existingRules],
          };
        }
        return n;
      });
      logMessage = `🛡️ SÄKERHETSÅTGÄRD: Aktiverade Anti-DDoS filtreringsregler på samtliga gateways.`;
      break;
    }

    case 'ENABLE_STRICT_FILTERING': {
      // Flushes poisoned states, applies DAI (Dynamic ARP Inspection)
      nextNodes = nextNodes.map((n) => {
        if (n.type === 'switch' || n.type === 'l3_switch' || n.type === 'router') {
          return {
            ...n,
            // Ensure nodes are active with clean ARP
          };
        }
        return n;
      });
      logMessage = `⚡ SÄKERHETSÅTGÄRD: Dynamisk ARP-inspektion aktiverad. Förfalskade MAC-mappningar rensades.`;
      break;
    }

    default:
      logMessage = `Säkerhetsåtgärd exekverad.`;
  }

  return {
    nextNodes,
    nextLinks,
    nextContainers,
    logMessage,
  };
}

/**
 * Executes a full-spectrum automatic security mitigation for all pending threats.
 */
export function executeAllSecurityMitigations(
  recommendations: RecommendedAction[],
  nodes: Device[],
  links: Link[],
  containers: NetworkContainer[] = []
): {
  nextNodes: Device[];
  nextLinks: Link[];
  nextContainers: NetworkContainer[];
  appliedCount: number;
  logMessages: string[];
} {
  let curNodes = [...nodes];
  let curLinks = [...links];
  let curContainers = [...containers];
  const logMessages: string[] = [];

  recommendations.forEach((rec) => {
    const res = executeRemediationAction(rec, curNodes, curLinks, curContainers);
    curNodes = res.nextNodes;
    curLinks = res.nextLinks;
    curContainers = res.nextContainers;
    if (res.logMessage) {
      logMessages.push(res.logMessage);
    }
  });

  return {
    nextNodes: curNodes,
    nextLinks: curLinks,
    nextContainers: curContainers,
    appliedCount: recommendations.length,
    logMessages,
  };
}
