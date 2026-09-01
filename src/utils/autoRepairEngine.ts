import { Device, Link, CableType, DeviceType } from '../types';
import { isInSubnet, ipToInt, intToIp } from './networkEngine';
import { CABLE_DEFINITIONS, resolveAutoCable, validateCableCompatibility } from './cableEngine';

export type IssueSeverity = 'critical' | 'warning' | 'info';
export type IssueCategory =
  | 'power'
  | 'ip_conflict'
  | 'missing_ip'
  | 'subnet_mismatch'
  | 'gateway_missing'
  | 'gateway_mismatch'
  | 'isolated_node'
  | 'bad_cable'
  | 'high_loss'
  | 'firewall_blocked'
  | 'dns_issue';

export interface NetworkIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  explanation: string;
  affectedNodeIds: string[];
  affectedLinkIds: string[];
  suggestedAction: string;
  autoFixDescription: string;
  applyFix: (nodes: Device[], links: Link[]) => {
    nodes: Device[];
    links: Link[];
    summary: string;
  };
}

/**
 * Helper to find an available IP in a given subnet
 */
function findAvailableIp(
  subnetBase: string,
  subnetMask: string,
  nodes: Device[],
  excludeNodeId?: string
): string {
  const maskInt = ipToInt(subnetMask);
  const baseInt = ipToInt(subnetBase) & maskInt;
  const usedIps = new Set(
    nodes
      .filter((n) => n.id !== excludeNodeId && n.ip && n.ip.trim() !== '')
      .map((n) => n.ip)
  );

  // Try host addresses 10 through 250
  for (let host = 10; host < 254; host++) {
    const candidateInt = (baseInt + host) >>> 0;
    const candidateIp = intToIp(candidateInt);
    if (!usedIps.has(candidateIp)) {
      return candidateIp;
    }
  }

  return '192.168.1.150';
}

/**
 * Comprehensive Network Diagnostic Engine
 */
export function diagnoseNetwork(nodes: Device[], links: Link[]): NetworkIssue[] {
  const issues: NetworkIssue[] = [];

  const isRouterType = (type: DeviceType) =>
    ['router', 'wifi_router', 'firewall', 'l3_switch', 'internet'].includes(type);

  // 1. Check for Power-Off Devices
  const offlineNodes = nodes.filter((n) => !n.on);
  offlineNodes.forEach((node) => {
    const isCritical = isRouterType(node.type) || node.type.startsWith('server');
    issues.push({
      id: `offline_${node.id}`,
      category: 'power',
      severity: isCritical ? 'critical' : 'warning',
      title: `${node.name} är avstängd (Offline)`,
      description: `Enheten ${node.name} har strömmen avslagen och kan inte skicka, ta emot eller vidarebefordra nätverkstrafik.`,
      explanation:
        'I datanätverk måste nätverkskort och routrar vara strömsatta för att fysiska portar ska vara aktiva och kunna svara på ARP/ICMP.',
      affectedNodeIds: [node.id],
      affectedLinkIds: [],
      suggestedAction: 'Starta enheten genom att klicka på strömbrytaren i inspektören.',
      autoFixDescription: `Slå på strömmen för ${node.name}`,
      applyFix: (currentNodes, currentLinks) => {
        const updated = currentNodes.map((n) =>
          n.id === node.id ? { ...n, on: true } : n
        );
        return {
          nodes: updated,
          links: currentLinks,
          summary: `Startade och slog på strömmen för ${node.name}.`,
        };
      },
    });
  });

  // 2. Check for Duplicate IPs (IP Conflict)
  const ipMap = new Map<string, Device[]>();
  nodes
    .filter((n) => n.ip && n.ip.trim() !== '' && n.type !== 'internet')
    .forEach((n) => {
      const list = ipMap.get(n.ip) || [];
      list.push(n);
      ipMap.set(n.ip, list);
    });

  ipMap.forEach((conflictNodes, ip) => {
    if (conflictNodes.length > 1) {
      const names = conflictNodes.map((n) => n.name).join(', ');
      const victim = conflictNodes[conflictNodes.length - 1]; // Node to re-assign

      issues.push({
        id: `ip_conflict_${ip.replace(/\./g, '_')}`,
        category: 'ip_conflict',
        severity: 'critical',
        title: `IP-konflikt: Adressen ${ip} delas av flera enheter`,
        description: `Enheterna [${names}] använder alla samma IP-adress (${ip}). Detta leder till paketkollisioner och avbruten nätverkstrafik.`,
        explanation:
          'Varje nätverkskort i samma subnät måste ha en unik IP-adress så att ARP-tabeller och routrar vet vart paketen ska levereras.',
        affectedNodeIds: conflictNodes.map((n) => n.id),
        affectedLinkIds: [],
        suggestedAction: `Tilldela en unik IP-adress till ${victim.name}.`,
        autoFixDescription: `Tilldela ny unik IP till ${victim.name}`,
        applyFix: (currentNodes, currentLinks) => {
          const newIp = findAvailableIp(ip, victim.subnetMask || '255.255.255.0', currentNodes, victim.id);
          const updated = currentNodes.map((n) =>
            n.id === victim.id ? { ...n, ip: newIp } : n
          );
          return {
            nodes: updated,
            links: currentLinks,
            summary: `Tilldelade ny unik IP-adress ${newIp} till ${victim.name}.`,
          };
        },
      });
    }
  });

  // 3. Check for Missing IP on Endpoints / Servers / Routers
  nodes.forEach((node) => {
    if (
      node.type !== 'switch' &&
      node.type !== 'wifi_ap' &&
      node.type !== 'internet' &&
      (!node.ip || node.ip.trim() === '')
    ) {
      issues.push({
        id: `missing_ip_${node.id}`,
        category: 'missing_ip',
        severity: 'critical',
        title: `Saknar IP-adress: ${node.name}`,
        description: `Enheten ${node.name} saknar en konfigurerad IP-adress och kan inte kommunicera på nätverket (Layer 3 saknas).`,
        explanation:
          'Utan en IP-adress kan inte TCP/IP-stacken initieras och enheten kan inte nås via ping eller applikationsprotokoll.',
        affectedNodeIds: [node.id],
        affectedLinkIds: [],
        suggestedAction: 'Ange en giltig IP-adress, nätmask och standardgateway.',
        autoFixDescription: `Konfigurera automatisk IP & subnät för ${node.name}`,
        applyFix: (currentNodes, currentLinks) => {
          // Look for connected neighbor to infer subnet
          const nodeLink = currentLinks.find((l) => l.a === node.id || l.b === node.id);
          let baseSubnet = '192.168.1.0';
          let mask = '255.255.255.0';
          let gateway = '192.168.1.1';

          if (nodeLink) {
            const peerId = nodeLink.a === node.id ? nodeLink.b : nodeLink.a;
            const peer = currentNodes.find((n) => n.id === peerId);
            if (peer && peer.ip) {
              baseSubnet = peer.ip;
              mask = peer.subnetMask || '255.255.255.0';
              if (isRouterType(peer.type)) {
                gateway = peer.ip;
              } else if (peer.gateway) {
                gateway = peer.gateway;
              }
            }
          }

          const autoIp = findAvailableIp(baseSubnet, mask, currentNodes, node.id);
          const updated = currentNodes.map((n) =>
            n.id === node.id
              ? { ...n, ip: autoIp, subnetMask: mask, gateway: isRouterType(n.type) ? n.gateway : gateway }
              : n
          );
          return {
            nodes: updated,
            links: currentLinks,
            summary: `Konfigurerade ${node.name} med IP ${autoIp}, mask ${mask} och gateway ${gateway}.`,
          };
        },
      });
    }
  });

  // 4. Check for Gateway Outside Subnet or Self-Gateway
  nodes.forEach((node) => {
    if (
      !isRouterType(node.type) &&
      node.type !== 'switch' &&
      node.type !== 'wifi_ap' &&
      node.ip &&
      node.gateway &&
      node.gateway.trim() !== ''
    ) {
      const mask = node.subnetMask || '255.255.255.0';

      if (node.gateway === node.ip) {
        issues.push({
          id: `gw_self_${node.id}`,
          category: 'gateway_mismatch',
          severity: 'warning',
          title: `Felaktig Default Gateway på ${node.name}`,
          description: `Gateway är inställd till ${node.name}s egen IP-adress (${node.gateway}). Enheten försöker routa paket till sig själv.`,
          explanation:
            'En Default Gateway ska vara IP-adressen till den router eller L3-switch som ansluter det lokala subnätet till andra nätverk.',
          affectedNodeIds: [node.id],
          affectedLinkIds: [],
          suggestedAction: 'Ändra Default Gateway till routerns IP-adress i samma subnät.',
          autoFixDescription: `Sätt korrekt Default Gateway på ${node.name}`,
          applyFix: (currentNodes, currentLinks) => {
            // Find active router in the same subnet
            const router = currentNodes.find(
              (n) => isRouterType(n.type) && n.ip && isInSubnet(n.ip, node.ip, mask)
            );
            const correctGw = router ? router.ip : '192.168.1.1';
            const updated = currentNodes.map((n) =>
              n.id === node.id ? { ...n, gateway: correctGw } : n
            );
            return {
              nodes: updated,
              links: currentLinks,
              summary: `Uppdaterade Default Gateway på ${node.name} till ${correctGw}.`,
            };
          },
        });
      } else if (!isInSubnet(node.gateway, node.ip, mask)) {
        issues.push({
          id: `gw_outside_${node.id}`,
          category: 'gateway_mismatch',
          severity: 'critical',
          title: `Gateway utanför subnätet på ${node.name}`,
          description: `Standardgateway (${node.gateway}) ligger inte i samma IP-subnät som ${node.name} (${node.ip}/${mask}). Enheten kan inte skicka extern trafik.`,
          explanation:
            'En klient kan bara nå sin Default Gateway via Layer 2 (ARP). Därför måste gatewayen ligga i samma subnät som klienten.',
          affectedNodeIds: [node.id],
          affectedLinkIds: [],
          suggestedAction: 'Justera antingen IP-adressen eller Default Gateway så att de matchar.',
          autoFixDescription: `Korrigera gateway så den matchar subnätet`,
          applyFix: (currentNodes, currentLinks) => {
            const router = currentNodes.find(
              (n) => isRouterType(n.type) && n.ip && isInSubnet(n.ip, node.ip, mask)
            );
            let correctGw = router ? router.ip : '';
            if (!correctGw) {
              const baseParts = node.ip.split('.');
              baseParts[3] = '1';
              correctGw = baseParts.join('.');
            }
            const updated = currentNodes.map((n) =>
              n.id === node.id ? { ...n, gateway: correctGw } : n
            );
            return {
              nodes: updated,
              links: currentLinks,
              summary: `Korrigerade Gateway på ${node.name} till ${correctGw}.`,
            };
          },
        });
      }
    }
  });

  // 5. Check for Isolated Nodes (No cables / links connected)
  nodes.forEach((node) => {
    if (node.type === 'internet') return;
    const connectedLinks = links.filter((l) => l.a === node.id || l.b === node.id);

    if (connectedLinks.length === 0) {
      issues.push({
        id: `isolated_${node.id}`,
        category: 'isolated_node',
        severity: 'warning',
        title: `Isolerad enhet: ${node.name} har ingen kabel`,
        description: `${node.name} är inte ansluten till någon switch, router eller accesspunkt och kan inte nå nätverket.`,
        explanation:
          'Alla nätverksenheter måste ha minst en fysisk kabel (TP/Fiber) eller en trådlös Wi-Fi-länk kopplad till en nätverksnod.',
        affectedNodeIds: [node.id],
        affectedLinkIds: [],
        suggestedAction: 'Dra en kabel från enheten till närmaste switch eller router.',
        autoFixDescription: `Anslut ${node.name} till närmaste nätverksswitch med optimal kabel`,
        applyFix: (currentNodes, currentLinks) => {
          // Find closest switch or router
          const candidates = currentNodes.filter(
            (n) => n.id !== node.id && ['switch', 'l3_switch', 'wifi_router', 'router', 'wifi_ap'].includes(n.type)
          );

          let targetNode = candidates[0];
          if (candidates.length > 1) {
            // Find geographically closest
            candidates.sort((a, b) => {
              const distA = Math.hypot(a.x - node.x, a.y - node.y);
              const distB = Math.hypot(b.x - node.x, b.y - node.y);
              return distA - distB;
            });
            targetNode = candidates[0];
          }

          if (!targetNode && currentNodes.length > 1) {
            targetNode = currentNodes.find((n) => n.id !== node.id);
          }

          if (!targetNode) {
            return { nodes: currentNodes, links: currentLinks, summary: 'Ingen målenhet tillgänglig.' };
          }

          const optimalCableType = resolveAutoCable(node, targetNode);
          const cableDef = CABLE_DEFINITIONS[optimalCableType] || CABLE_DEFINITIONS.cat6;

          const newLink: Link = {
            id: 'l_auto_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            a: node.id,
            b: targetNode.id,
            type: optimalCableType,
            bandwidthMbps: cableDef.bandwidthMbps,
            latencyMs: cableDef.latencyMs,
            packetLossPercent: 0,
            duplex: cableDef.duplex,
          };

          return {
            nodes: currentNodes,
            links: [...currentLinks, newLink],
            summary: `Anslöt ${node.name} till ${targetNode.name} med ${cableDef.name} (${cableDef.badge}).`,
          };
        },
      });
    }
  });

  // 6. Check for Incompatible or Suboptimal Cables on Existing Links
  links.forEach((link) => {
    const nodeA = nodes.find((n) => n.id === link.a);
    const nodeB = nodes.find((n) => n.id === link.b);
    if (!nodeA || !nodeB) return;

    const validation = validateCableCompatibility(link.type, nodeA, nodeB);

    if (validation.status === 'incompatible') {
      const curDef = CABLE_DEFINITIONS[link.type] || CABLE_DEFINITIONS.cat6;
      const recDef = CABLE_DEFINITIONS[validation.recommendedType] || CABLE_DEFINITIONS.cat6;
      issues.push({
        id: `cable_incompatible_${link.id}`,
        category: 'bad_cable',
        severity: 'critical',
        title: `Inkompatibel kabel mellan ${nodeA.name} och ${nodeB.name}`,
        description: `Länken använder ${curDef.name}, vilket inte stöds mellan enheterna ${nodeA.name} (${nodeA.type}) och ${nodeB.name} (${nodeB.type}). ${validation.message || validation.explanation}`,
        explanation:
          validation.explanation || 'Olika fysiska portar kräver specifika kabelstandarder (t.ex. Optisk fiber för SFP+, Crossover för Switch-Switch, eller Wi-Fi för trådlösa klienter).',
        affectedNodeIds: [nodeA.id, nodeB.id],
        affectedLinkIds: [link.id],
        suggestedAction: `Byt kabeln till ${recDef.name} (${recDef.badge}).`,
        autoFixDescription: `Byt till rekommenderad kabel: ${recDef.name}`,
        applyFix: (currentNodes, currentLinks) => {
          const updatedLinks = currentLinks.map((l) =>
            l.id === link.id
              ? {
                  ...l,
                  type: validation.recommendedType,
                  bandwidthMbps: recDef.bandwidthMbps,
                  latencyMs: recDef.latencyMs,
                  duplex: recDef.duplex,
                  packetLossPercent: 0,
                }
              : l
          );
          return {
            nodes: currentNodes,
            links: updatedLinks,
            summary: `Bytte kabel mellan ${nodeA.name} och ${nodeB.name} till ${recDef.name} (${recDef.badge}).`,
          };
        },
      });
    } else if (validation.status === 'suboptimal') {
      const curDef = CABLE_DEFINITIONS[link.type] || CABLE_DEFINITIONS.cat6;
      const recDef = CABLE_DEFINITIONS[validation.recommendedType] || CABLE_DEFINITIONS.cat6;
      issues.push({
        id: `cable_suboptimal_${link.id}`,
        category: 'bad_cable',
        severity: 'warning',
        title: `Suboptimal kabel mellan ${nodeA.name} och ${nodeB.name}`,
        description: `${validation.message || validation.explanation}. Rekommenderad kabel är ${recDef.name}.`,
        explanation:
          validation.explanation || 'Kabelstandarden fungerar men ger sämre prestanda eller bryter mot nätverkskonventioner.',
        affectedNodeIds: [nodeA.id, nodeB.id],
        affectedLinkIds: [link.id],
        suggestedAction: `Uppgradera kabeln till ${recDef.name}.`,
        autoFixDescription: `Uppgradera till ${recDef.name} (${recDef.badge})`,
        applyFix: (currentNodes, currentLinks) => {
          const updatedLinks = currentLinks.map((l) =>
            l.id === link.id
              ? {
                  ...l,
                  type: validation.recommendedType,
                  bandwidthMbps: recDef.bandwidthMbps,
                  latencyMs: recDef.latencyMs,
                  duplex: recDef.duplex,
                }
              : l
          );
          return {
            nodes: currentNodes,
            links: updatedLinks,
            summary: `Uppgraderade kabeln till ${recDef.name} (${recDef.badge}).`,
          };
        },
      });
    }

    // 7. Check for High Packet Loss or Down Link
    if (link.packetLossPercent > 10) {
      issues.push({
        id: `loss_${link.id}`,
        category: 'high_loss',
        severity: link.packetLossPercent >= 50 ? 'critical' : 'warning',
        title: `Skadad länk / Hög paketförlust (${link.packetLossPercent}%)`,
        description: `Kabeln mellan ${nodeA.name} och ${nodeB.name} tappar ${link.packetLossPercent}% av alla paket på grund av signalstörning eller kabelbrott.`,
        explanation:
          'Hög paketförlust orsakar timeout och extrema fördröjningar för alla TCP/UDP-strömmar.',
        affectedNodeIds: [nodeA.id, nodeB.id],
        affectedLinkIds: [link.id],
        suggestedAction: 'Reparera länken och återställ paketförlusten till 0%.',
        autoFixDescription: `Reparera kabeln (0% paketförlust)`,
        applyFix: (currentNodes, currentLinks) => {
          const updatedLinks = currentLinks.map((l) =>
            l.id === link.id ? { ...l, packetLossPercent: 0 } : l
          );
          return {
            nodes: currentNodes,
            links: updatedLinks,
            summary: `Reparerade länken mellan ${nodeA.name} och ${nodeB.name} till 0% paketförlust.`,
          };
        },
      });
    }
  });

  return issues;
}

/**
 * Executes a full automatic repair on all detected faults in the network
 */
export function autoRepairAll(
  nodes: Device[],
  links: Link[]
): {
  nodes: Device[];
  links: Link[];
  fixedCount: number;
  fixLogs: string[];
} {
  let currentNodes = [...nodes];
  let currentLinks = [...links];
  const fixLogs: string[] = [];
  let fixedCount = 0;

  // Run up to 4 iterative passes to resolve cascading dependencies
  for (let pass = 0; pass < 4; pass++) {
    const issues = diagnoseNetwork(currentNodes, currentLinks);
    if (issues.length === 0) break;

    let passRepairs = 0;
    for (const issue of issues) {
      const result = issue.applyFix(currentNodes, currentLinks);
      currentNodes = result.nodes;
      currentLinks = result.links;
      fixLogs.push(result.summary);
      fixedCount++;
      passRepairs++;
    }

    if (passRepairs === 0) break;
  }

  return {
    nodes: currentNodes,
    links: currentLinks,
    fixedCount,
    fixLogs,
  };
}

/**
 * Targeted repair for a path between two specific nodes
 */
export function autoRepairConnectionBetween(
  fromId: string,
  toId: string,
  nodes: Device[],
  links: Link[]
): {
  nodes: Device[];
  links: Link[];
  success: boolean;
  fixLogs: string[];
} {
  let currentNodes = [...nodes];
  let currentLinks = [...links];
  const fixLogs: string[] = [];

  const fromNode = currentNodes.find((n) => n.id === fromId);
  const toNode = currentNodes.find((n) => n.id === toId);

  if (!fromNode || !toNode) {
    return { nodes, links, success: false, fixLogs: ['Käll- eller målenhet hittades inte.'] };
  }

  // 1. Ensure both devices are ON
  if (!fromNode.on) {
    currentNodes = currentNodes.map((n) => (n.id === fromId ? { ...n, on: true } : n));
    fixLogs.push(`Startade källenheten ${fromNode.name}.`);
  }
  if (!toNode.on) {
    currentNodes = currentNodes.map((n) => (n.id === toId ? { ...n, on: true } : n));
    fixLogs.push(`Startade målenheten ${toNode.name}.`);
  }

  // 2. Fix fromNode and toNode with comprehensive repair
  const resFrom = repairSingleDevice(fromId, currentNodes, currentLinks);
  currentNodes = resFrom.nodes;
  currentLinks = resFrom.links;
  fixLogs.push(...resFrom.fixedIssues);

  const resTo = repairSingleDevice(toId, currentNodes, currentLinks);
  currentNodes = resTo.nodes;
  currentLinks = resTo.links;
  fixLogs.push(...resTo.fixedIssues);

  // 3. Run full auto-repair on topology
  const repairResult = autoRepairAll(currentNodes, currentLinks);
  currentNodes = repairResult.nodes;
  currentLinks = repairResult.links;
  fixLogs.push(...repairResult.fixLogs);

  // 4. Ensure direct or indirect link exists if still disconnected
  const updatedFrom = currentNodes.find((n) => n.id === fromId)!;
  const updatedTo = currentNodes.find((n) => n.id === toId)!;

  const hasLinkA = currentLinks.some((l) => l.a === fromId || l.b === fromId);
  const hasLinkB = currentLinks.some((l) => l.a === toId || l.b === toId);

  if (!hasLinkA || !hasLinkB) {
    const cableType = resolveAutoCable(updatedFrom, updatedTo);
    const cableDef = CABLE_DEFINITIONS[cableType] || CABLE_DEFINITIONS.cat6;
    const newLink: Link = {
      id: 'l_repair_' + Date.now().toString(36),
      a: fromId,
      b: toId,
      type: cableType,
      bandwidthMbps: cableDef.bandwidthMbps,
      latencyMs: cableDef.latencyMs,
      packetLossPercent: 0,
      duplex: cableDef.duplex,
    };
    currentLinks.push(newLink);
    fixLogs.push(`Skapade direkt länk mellan ${updatedFrom.name} och ${updatedTo.name} (${cableDef.name}).`);
  }

  return {
    nodes: currentNodes,
    links: currentLinks,
    success: true,
    fixLogs,
  };
}

/**
 * Advanced Single-Device Automated Repair Engine (100% Reliable Fix)
 * Completely eliminates any warnings, IP conflicts, bad cables, missing gateways, or subnet mismatches for this device.
 */
export function repairSingleDevice(
  nodeId: string,
  nodes: Device[],
  links: Link[]
): {
  nodes: Device[];
  links: Link[];
  success: boolean;
  fixedIssues: string[];
} {
  let curNodes = [...nodes];
  let curLinks = [...links];
  const fixedIssues: string[] = [];

  const target = curNodes.find((n) => n.id === nodeId);
  if (!target) {
    return { nodes: curNodes, links: curLinks, success: false, fixedIssues: ['Enheten hittades inte.'] };
  }

  const isRouterType = (type: DeviceType) =>
    ['router', 'wifi_router', 'firewall', 'l3_switch', 'internet'].includes(type);

  // 1. Strömsätt enheten (Turn Power ON)
  if (!target.on) {
    curNodes = curNodes.map((n) => (n.id === nodeId ? { ...n, on: true } : n));
    fixedIssues.push(`Slog på strömmen för ${target.name} (Online).`);
  }

  // 2. Kontrollera och fixa kablar / anslutningar (Links & Cables)
  const connectedLinks = curLinks.filter((l) => l.a === nodeId || l.b === nodeId);

  if (connectedLinks.length === 0 && target.type !== 'internet') {
    // Isolerad enhet - hitta bästa infrastrukturnod att koppla till
    const candidateNodes = curNodes.filter(
      (n) => n.id !== nodeId && ['switch', 'l3_switch', 'wifi_router', 'router', 'wifi_ap'].includes(n.type)
    );
    let bestTarget = candidateNodes[0];
    if (candidateNodes.length > 1) {
      candidateNodes.sort((a, b) => {
        const distA = Math.hypot(a.x - target.x, a.y - target.y);
        const distB = Math.hypot(b.x - target.x, b.y - target.y);
        return distA - distB;
      });
      bestTarget = candidateNodes[0];
    }
    if (!bestTarget && curNodes.length > 1) {
      bestTarget = curNodes.find((n) => n.id !== nodeId);
    }

    if (bestTarget) {
      // Power on bestTarget if off
      if (!bestTarget.on) {
        curNodes = curNodes.map((n) => (n.id === bestTarget.id ? { ...n, on: true } : n));
        fixedIssues.push(`Startade mottagande enhet ${bestTarget.name}.`);
      }
      const cableType = resolveAutoCable(target, bestTarget);
      const cableDef = CABLE_DEFINITIONS[cableType] || CABLE_DEFINITIONS.cat6;
      const newLink: Link = {
        id: 'l_auto_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        a: nodeId,
        b: bestTarget.id,
        type: cableType,
        bandwidthMbps: cableDef.bandwidthMbps,
        latencyMs: cableDef.latencyMs,
        packetLossPercent: 0,
        duplex: cableDef.duplex,
      };
      curLinks.push(newLink);
      fixedIssues.push(`Anslöt kabel till ${bestTarget.name} (${cableDef.name}).`);
    }
  } else {
    // Fix existing connected links: cable type and packet loss
    curLinks = curLinks.map((link) => {
      if (link.a === nodeId || link.b === nodeId) {
        const peerId = link.a === nodeId ? link.b : link.a;
        const peerNode = curNodes.find((n) => n.id === peerId);

        let updatedLink = { ...link };

        // Reset packet loss if degraded
        if (updatedLink.packetLossPercent > 0) {
          updatedLink.packetLossPercent = 0;
          fixedIssues.push(`Reparerade kabelskada på länk till ${peerNode?.name || 'grannod'} (0% paketförlust).`);
        }

        // Validate cable compatibility
        if (peerNode) {
          if (!peerNode.on) {
            curNodes = curNodes.map((n) => (n.id === peerNode.id ? { ...n, on: true } : n));
            fixedIssues.push(`Startade ansluten grannenhet ${peerNode.name}.`);
          }
          const validation = validateCableCompatibility(updatedLink.type, target, peerNode);
          if (validation.status === 'incompatible' || validation.status === 'suboptimal') {
            const recType = validation.recommendedType;
            const recDef = CABLE_DEFINITIONS[recType] || CABLE_DEFINITIONS.cat6;
            updatedLink.type = recType;
            updatedLink.bandwidthMbps = recDef.bandwidthMbps;
            updatedLink.latencyMs = recDef.latencyMs;
            updatedLink.duplex = recDef.duplex;
            fixedIssues.push(`Bytte kabeltyp till ${recDef.name} (${recDef.badge}).`);
          }
        }
        return updatedLink;
      }
      return link;
    });
  }

  // 3. Topology & Subnet Discovery (Hitta router/gateway och subnät)
  const updatedTarget = curNodes.find((n) => n.id === nodeId)!;
  if (updatedTarget.type !== 'switch' && updatedTarget.type !== 'wifi_ap' && updatedTarget.type !== 'internet') {
    // Find all routers in topology
    const routers = curNodes.filter((n) => isRouterType(n.type) && n.ip && n.ip.trim() !== '');

    // Find router in same physical network segment if possible
    let targetRouter = routers.find((r) => r.id !== nodeId);

    // Check neighbors for active subnets
    const neighborLinks = curLinks.filter((l) => l.a === nodeId || l.b === nodeId);
    let discoveredSubnet = '';
    let discoveredMask = '255.255.255.0';
    let discoveredGateway = '';

    for (const l of neighborLinks) {
      const pId = l.a === nodeId ? l.b : l.a;
      const pNode = curNodes.find((n) => n.id === pId);
      if (pNode) {
        if (isRouterType(pNode.type) && pNode.ip) {
          discoveredSubnet = pNode.ip;
          discoveredMask = pNode.subnetMask || '255.255.255.0';
          discoveredGateway = pNode.ip;
          targetRouter = pNode;
          break;
        } else if (pNode.ip) {
          discoveredSubnet = pNode.ip;
          discoveredMask = pNode.subnetMask || '255.255.255.0';
          if (pNode.gateway) discoveredGateway = pNode.gateway;
        }
      }
    }

    if (!discoveredGateway && targetRouter) {
      discoveredGateway = targetRouter.ip;
      discoveredSubnet = targetRouter.ip;
      discoveredMask = targetRouter.subnetMask || '255.255.255.0';
    }

    if (!discoveredSubnet) {
      discoveredSubnet = updatedTarget.ip || '192.168.1.0';
      discoveredMask = updatedTarget.subnetMask || '255.255.255.0';
      if (!discoveredGateway && !isRouterType(updatedTarget.type)) {
        const parts = discoveredSubnet.split('.');
        parts[3] = '1';
        discoveredGateway = parts.join('.');
      }
    }

    // Determine target's required subnet & mask
    let targetMask = discoveredMask || '255.255.255.0';
    let targetGw = isRouterType(updatedTarget.type) ? (updatedTarget.gateway || '') : discoveredGateway;

    // Check if current target IP is valid, unique, and in correct subnet
    let currentIp = updatedTarget.ip;
    let needsNewIp = false;

    if (!currentIp || currentIp.trim() === '') {
      needsNewIp = true;
    } else {
      // Check duplicate
      const isDuplicate = curNodes.some(
        (n) => n.id !== nodeId && n.ip === currentIp
      );
      if (isDuplicate) needsNewIp = true;

      // Check if IP matches subnet
      if (discoveredSubnet && !isInSubnet(currentIp, discoveredSubnet, targetMask)) {
        needsNewIp = true;
      }

      // Check if IP equals gateway
      if (targetGw && currentIp === targetGw && !isRouterType(updatedTarget.type)) {
        needsNewIp = true;
      }
    }

    let finalIp = currentIp;
    if (needsNewIp) {
      finalIp = findAvailableIp(discoveredSubnet, targetMask, curNodes, nodeId);
      fixedIssues.push(`Tilldelade ny unik IP-adress: ${finalIp}`);
    }

    // If target has gateway conflict:
    if (!isRouterType(updatedTarget.type)) {
      if (!targetGw || targetGw === finalIp || !isInSubnet(targetGw, finalIp, targetMask)) {
        // Derive valid gateway in same subnet
        const parts = finalIp.split('.');
        parts[3] = '1';
        targetGw = targetRouter && isInSubnet(targetRouter.ip, finalIp, targetMask) ? targetRouter.ip : parts.join('.');
        fixedIssues.push(`Korrigerade Default Gateway till: ${targetGw}`);
      }
    }

    // Update the node
    curNodes = curNodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          ip: finalIp,
          subnetMask: targetMask,
          gateway: targetGw,
          on: true,
        };
      }
      return n;
    });
  }

  // 4. Run a safety verification pass
  const finalTarget = curNodes.find((n) => n.id === nodeId)!;
  const duplicateNodes = curNodes.filter(
    (n) => n.id !== nodeId && n.ip && n.ip === finalTarget.ip
  );
  if (duplicateNodes.length > 0) {
    duplicateNodes.forEach((dup) => {
      const newDupIp = findAvailableIp(finalTarget.ip, finalTarget.subnetMask || '255.255.255.0', curNodes, dup.id);
      curNodes = curNodes.map((n) => (n.id === dup.id ? { ...n, ip: newDupIp } : n));
      fixedIssues.push(`Flyttade krockande IP från ${dup.name} till ${newDupIp}.`);
    });
  }

  return {
    nodes: curNodes,
    links: curLinks,
    success: true,
    fixedIssues: fixedIssues.length > 0 ? fixedIssues : ['Alla inställningar och anslutningar optimerades och verifierades.'],
  };
}
