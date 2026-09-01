import {
  IncidentLog,
  CyberKillChainStage,
  IncidentSeverity,
  CapturedPacket,
  Device,
  Link,
} from '../types';
import { isHackerDevice } from './hackerEngine';

export interface KillChainStageMeta {
  stage: CyberKillChainStage;
  stepNumber: number;
  labelSv: string;
  labelEn: string;
  icon: string;
  color: string;
  bgGlow: string;
  description: string;
  mitreRef: string;
}

export const KILL_CHAIN_STAGES_META: Record<CyberKillChainStage, KillChainStageMeta> = {
  RECONNAISSANCE: {
    stage: 'RECONNAISSANCE',
    stepNumber: 1,
    labelSv: '1. Recon & Skanning',
    labelEn: 'Reconnaissance',
    icon: '🔍',
    color: '#0ea5e9', // cyan-500
    bgGlow: 'rgba(14, 165, 233, 0.2)',
    description: 'Angriparen kartlägger ip-adresser, öppna portar, OS-fingeravtryck och sårbarheter i nätverket.',
    mitreRef: 'TA0043 Reconnaissance',
  },
  INITIAL_ACCESS: {
    stage: 'INITIAL_ACCESS',
    stepNumber: 2,
    labelSv: '2. Infiltration & Access',
    labelEn: 'Initial Access',
    icon: '🎯',
    color: '#f59e0b', // amber-500
    bgGlow: 'rgba(245, 158, 11, 0.2)',
    description: 'Utnyttjande av RCE 0-day sårbarheter, phishing eller oskyddade öppna tjänster för att ta sig in.',
    mitreRef: 'TA0001 Initial Access',
  },
  EXECUTION: {
    stage: 'EXECUTION',
    stepNumber: 3,
    labelSv: '3. Kodexekvering & Trojan',
    labelEn: 'Execution',
    icon: '☣️',
    color: '#ec4899', // pink-500
    bgGlow: 'rgba(236, 72, 153, 0.2)',
    description: 'Exekvering av skadlig källkod, reverse shells eller minnesinläsning av trojaner.',
    mitreRef: 'TA0002 Execution',
  },
  PERSISTENCE: {
    stage: 'PERSISTENCE',
    stepNumber: 4,
    labelSv: '4. C2 Etablering',
    labelEn: 'Persistence & C2',
    icon: '📻',
    color: '#8b5cf6', // purple-500
    bgGlow: 'rgba(139, 92, 246, 0.2)',
    description: 'Bakdörrar installeras och C2 (Command & Control) beacons etableras för fjärrstyrning.',
    mitreRef: 'TA0003 Persistence / TA0011 Command and Control',
  },
  LATERAL_MOVEMENT: {
    stage: 'LATERAL_MOVEMENT',
    stepNumber: 5,
    labelSv: '5. Lateral Movement',
    labelEn: 'Lateral Movement',
    icon: '🔀',
    color: '#f97316', // orange-500
    bgGlow: 'rgba(249, 115, 22, 0.2)',
    description: 'Spridning från den första infekterade enheten till servrar och databaser i interna VLAN.',
    mitreRef: 'TA0008 Lateral Movement',
  },
  DATA_EXFILTRATION: {
    stage: 'DATA_EXFILTRATION',
    stepNumber: 6,
    labelSv: '6. Dataläckage & Exfiltrering',
    labelEn: 'Exfiltration',
    icon: '📡',
    color: '#e11d48', // rose-600
    bgGlow: 'rgba(225, 29, 72, 0.2)',
    description: 'Stöld av känsliga kortdata, lösenord, databaser och intern kommunikation via krypterad tunnel.',
    mitreRef: 'TA0010 Exfiltration',
  },
  IMPACT: {
    stage: 'IMPACT',
    stepNumber: 7,
    labelSv: '7. Sabotage & Ransomware',
    labelEn: 'Impact & Encrypt',
    icon: '💀',
    color: '#ef4444', // red-500
    bgGlow: 'rgba(239, 68, 68, 0.3)',
    description: 'Ransomware låser diskar, raderar backupfiler eller mättar bandbredden i en botnet DDoS-storm.',
    mitreRef: 'TA0040 Impact',
  },
};

/**
 * Creates an IncidentLog entry from a captured packet or attack event.
 */
export function createIncidentFromPacket(
  pkt: CapturedPacket,
  nodes: Device[]
): IncidentLog | null {
  const sourceNode = nodes.find((n) => n.id === pkt.sourceId || n.ip === pkt.sourceIp);
  const targetNode = nodes.find((n) => n.id === pkt.destId || n.ip === pkt.destIp);

  const infoLower = (pkt.info || '').toLowerCase();
  const payloadLower = (pkt.payload || '').toLowerCase();
  const isBlocked = pkt.status === 'DROPPED_FIREWALL';

  let stage: CyberKillChainStage = 'RECONNAISSANCE';
  let severity: IncidentSeverity = 'INFO';
  let mitreId = 'T1046';
  let mitreName = 'Network Service Discovery';
  let title = 'Stealth Portskanning Detekterad';
  let description = `Misstänkt SYN/UDP-skanning från ${pkt.sourceName} (${pkt.sourceIp}) mot ${pkt.destName} (${pkt.destIp}).`;
  let recommendedAction = 'Konfigurera brandväggsregler för att blockera ICMP/SYN-svep och begränsa IP-adresser.';

  if (infoLower.includes('ransomware') || payloadLower.includes('cryptolocker') || payloadLower.includes('rsa-4096')) {
    stage = 'IMPACT';
    severity = 'CRITICAL';
    mitreId = 'T1486';
    mitreName = 'Data Encrypted for Impact';
    title = 'Kritiskt Ransomware-utbrott Detekterat';
    description = `Ransomware CryptoLocker exekveras på ${pkt.destName} (${pkt.destIp}). Lokala diskar krypteras med AES-256.`;
    recommendedAction = 'Isolera enheten omedelbart från nätverket! Stäng av porten eller kör Antivirus Quarantän.';
  } else if (infoLower.includes('ddos') || infoLower.includes('flood') || payloadLower.includes('syn flood')) {
    stage = 'IMPACT';
    severity = 'CRITICAL';
    mitreId = 'T1498';
    mitreName = 'Network Denial of Service';
    title = 'DDoS Volumetrisk Överbelastningsattack';
    description = `Botnet-flöde skickar över 50,000 pps mot ${pkt.destName} (${pkt.destIp}). Bandbredden mättas.`;
    recommendedAction = 'Slå på Rate Limiting eller Ingress Filtering i kantroutern / NGFW.';
  } else if (infoLower.includes('0-day') || infoLower.includes('cve-') || infoLower.includes('exploit')) {
    stage = 'INITIAL_ACCESS';
    severity = 'CRITICAL';
    mitreId = 'T1190';
    mitreName = 'Exploit Public-Facing Application';
    title = '0-Day Remote Code Execution (RCE)';
    description = `Fjärrexploatering av sårbarhet (CVE RCE) levererades från ${pkt.sourceName} till ${pkt.destName}.`;
    recommendedAction = 'Aktivera Intrusion Prevention System (IPS) och patcha sårbara tjänster.';
  } else if (infoLower.includes('trojan') || infoLower.includes('c2') || infoLower.includes('beacon') || pkt.protocol === 'MALWARE') {
    stage = 'PERSISTENCE';
    severity = 'HIGH';
    mitreId = 'T1071';
    mitreName = 'Application Layer Protocol C2';
    title = 'C2 Command & Control Reverse Shell';
    description = `Trojan etablerade en osäker C2-beacontunnel från ${pkt.destName} till hackarens IP ${pkt.sourceIp}.`;
    recommendedAction = 'Isolera den infekterade enheten och rensa minnesinlästa trojaner via EDR Antivirus.';
  } else if (infoLower.includes('arp') || infoLower.includes('mitm') || infoLower.includes('poisoning')) {
    stage = 'LATERAL_MOVEMENT';
    severity = 'HIGH';
    mitreId = 'T1557';
    mitreName = 'Adversary-in-the-Middle (ARP Spoof)';
    title = 'Man-in-the-Middle ARP Förgiftning';
    description = `Fientlig ARP Poisoning-attack försöker avlyssna och kapa gateway-trafik för ${pkt.destName}.`;
    recommendedAction = 'Aktivera Dynamic ARP Inspection (DAI) och statiska MAC-bindningar på switchen.';
  } else if (infoLower.includes('dns') || infoLower.includes('spoof') || infoLower.includes('exfiltration')) {
    stage = 'DATA_EXFILTRATION';
    severity = 'HIGH';
    mitreId = 'T1041';
    mitreName = 'Exfiltration Over C2 Channel';
    title = 'Misstänkt Dataläckage & DNS Spoofing';
    description = `Internt dataläckage eller DNS-förgiftning detekterades mellan ${pkt.sourceName} och ${pkt.destName}.`;
    recommendedAction = 'Tvinga DNSSEC-validering och blockera otillåtna externa DNS-servrar.';
  } else if (!isHackerDevice(sourceNode?.type) && !pkt.info.includes('ATTACK')) {
    // Normal traffic packet, not an incident
    return null;
  }

  if (isBlocked) {
    severity = 'INFO';
    title = `[BLOCKERAD] ${title}`;
    description += ' (Attacken stoppades automatiskt av brandväggen).';
  }

  return {
    id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    stage,
    severity,
    title,
    mitreId,
    mitreName,
    sourceNodeId: pkt.sourceId,
    sourceNodeName: pkt.sourceName,
    sourceIp: pkt.sourceIp,
    targetNodeId: pkt.destId,
    targetNodeName: pkt.destName,
    targetIp: pkt.destIp,
    protocol: pkt.protocol,
    payloadSummary: pkt.payload || pkt.info,
    description,
    recommendedAction,
    isContained: isBlocked,
    status: isBlocked ? 'CONTAINED' : 'ACTIVE',
  };
}

/**
 * Generates initial rich incident logs if the user opens the incident response board
 * so they have immediate actionable threat intelligence.
 */
export function generateInitialIncidentLogs(nodes: Device[], links: Link[]): IncidentLog[] {
  const incidents: IncidentLog[] = [];
  const now = new Date();

  const hackers = nodes.filter((n) => isHackerDevice(n.type));
  const infectedNodes = nodes.filter((n) => n.isInfected && !isHackerDevice(n.type));
  const targets = nodes.filter((n) => !isHackerDevice(n.type) && n.on && n.ip);

  // If there are hackers or infected nodes, generate realistic timeline events
  if (hackers.length > 0 && targets.length > 0) {
    const hacker = hackers[0];
    const target1 = targets[0];
    const target2 = targets.length > 1 ? targets[1] : target1;

    // 1. Recon event
    incidents.push({
      id: 'inc_sample_1',
      timestamp: new Date(now.getTime() - 120000).toLocaleTimeString('sv-SE'),
      stage: 'RECONNAISSANCE',
      severity: 'INFO',
      title: 'Stealth SYN Portskanning Detekterad',
      mitreId: 'T1046',
      mitreName: 'Network Service Discovery',
      sourceNodeId: hacker.id,
      sourceNodeName: hacker.name,
      sourceIp: hacker.ip || '192.168.1.66',
      targetNodeId: target1.id,
      targetNodeName: target1.name,
      targetIp: target1.ip || '192.168.1.10',
      protocol: 'TCP',
      payloadSummary: 'SYN Scan Ports 22, 80, 445, 3389 [TTL=64]',
      description: `Inledande kartläggning av nätverkstjänster och öppna portar utfördes från ${hacker.name}.`,
      recommendedAction: 'Granska öppna portar på källnoden och stäng obehövliga nätverkstjänster.',
      status: 'INVESTIGATING',
    });

    // 2. Initial access event
    incidents.push({
      id: 'inc_sample_2',
      timestamp: new Date(now.getTime() - 90000).toLocaleTimeString('sv-SE'),
      stage: 'INITIAL_ACCESS',
      severity: 'HIGH',
      title: '0-Day Exploiteringsförsök (CVE-2024-38077)',
      mitreId: 'T1190',
      mitreName: 'Exploit Public-Facing Application',
      sourceNodeId: hacker.id,
      sourceNodeName: hacker.name,
      sourceIp: hacker.ip || '192.168.1.66',
      targetNodeId: target1.id,
      targetNodeName: target1.name,
      targetIp: target1.ip || '192.168.1.10',
      protocol: 'MALWARE',
      payloadSummary: 'SMBv2 Buffer Overflow / ROP-Chain injection',
      description: `Exploiteringspaket skickades mot ${target1.name} i ett försök att uppnå fjärrstyrning.`,
      recommendedAction: 'Installera senaste säkerhetsuppdateringar och begränsa Ingress-trafik i brandväggen.',
      status: target1.isInfected ? 'ACTIVE' : 'CONTAINED',
    });

    // 3. Lateral movement / ARP Poisoning
    incidents.push({
      id: 'inc_sample_3',
      timestamp: new Date(now.getTime() - 45000).toLocaleTimeString('sv-SE'),
      stage: 'LATERAL_MOVEMENT',
      severity: 'CRITICAL',
      title: 'Man-in-the-Middle ARP Poisoning',
      mitreId: 'T1557',
      mitreName: 'Adversary-in-the-Middle',
      sourceNodeId: hacker.id,
      sourceNodeName: hacker.name,
      sourceIp: hacker.ip || '192.168.1.66',
      targetNodeId: target2.id,
      targetNodeName: target2.name,
      targetIp: target2.ip || '192.168.1.20',
      protocol: 'ARP',
      payloadSummary: `ARP Reply: Gateway ${target2.gateway || '192.168.1.1'} is at ${hacker.mac}`,
      description: `Fientlig ARP-förgiftning kapar nätverkstrafiken mellan ${target2.name} och default gateway.`,
      recommendedAction: 'Aktivera Dynamic ARP Inspection (DAI) på switchen och isolera angriparen.',
      status: 'ACTIVE',
    });
  }

  // If any nodes are marked infected, add ransomware / impact incident
  infectedNodes.forEach((node, idx) => {
    incidents.push({
      id: `inc_inf_${idx}`,
      timestamp: new Date(now.getTime() - 15000 * (idx + 1)).toLocaleTimeString('sv-SE'),
      stage: 'IMPACT',
      severity: 'CRITICAL',
      title: 'Ransomware Krypteringsdetonation',
      mitreId: 'T1486',
      mitreName: 'Data Encrypted for Impact',
      sourceNodeId: 'c2_external',
      sourceNodeName: 'C2 Command Server',
      sourceIp: '185.220.101.5',
      targetNodeId: node.id,
      targetNodeName: node.name,
      targetIp: node.ip || '192.168.1.X',
      protocol: 'MALWARE',
      payloadSummary: 'LockBit v3.0 RSA-4096 enc_key payload delivery',
      description: `Kritiskt utbrott på ${node.name}. Minnet är infekterat och skadliga processer låser systemfiler.`,
      recommendedAction: 'Kör EDR Antivirus-sanering omedelbart eller stäng av strömmen till enheten.',
      status: 'ACTIVE',
    });
  });

  return incidents;
}
