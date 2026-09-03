import { CableType, Device, Link } from '../types';

export interface CableDefinition {
  type: CableType;
  name: string;
  shortName: string;
  subtitle: string;
  category: 'copper' | 'fiber' | 'wireless' | 'wan' | 'management' | 'auto';
  description: string;
  specializedFor: string;
  bandwidthMbps: number;
  latencyMs: number;
  duplex: 'full' | 'half';
  color: string;
  accentColor: string;
  dashArray: string;
  strokeWidth: number;
  badge: string;
  iconType: string;
}

export const CABLE_DEFINITIONS: Record<CableType, CableDefinition> = {
  auto: {
    type: 'auto',
    name: 'Smart Auto-Kabel (Blixt)',
    shortName: 'Auto-kabel',
    subtitle: 'Väljer automatiskt bästa kabeltyp',
    category: 'auto',
    description: 'Känner av enheternas gränssnitt och kopplar optimal kabeltyp med korrekta hastigheter och duplex.',
    specializedFor: 'Automatisk detektering för alla enhetskombinationer',
    bandwidthMbps: 1000,
    latencyMs: 1,
    duplex: 'full',
    color: '#f59e0b',
    accentColor: '#d97706',
    dashArray: 'none',
    strokeWidth: 2.5,
    badge: 'AUTO',
    iconType: 'Zap',
  },
  cat6: {
    type: 'cat6',
    name: 'Rak TP-kabel (Cat6 Straight-Through)',
    shortName: 'Rak Cat6',
    subtitle: 'För olika nätverksskikt (MDI till MDI-X)',
    category: 'copper',
    description: 'Standard Ethernet kopparkabel med RJ-45 kontakter. Används för att koppla enheter på olika nivåer.',
    specializedFor: 'Switch ↔ PC/Laptop, Switch ↔ Router, Switch ↔ Server, Switch ↔ Brandvägg, Switch ↔ AP',
    bandwidthMbps: 1000,
    latencyMs: 1,
    duplex: 'full',
    color: '#eab308', // Vintage Golden Brass
    accentColor: '#ca8a04',
    dashArray: 'none',
    strokeWidth: 2.5,
    badge: '1 Gbps',
    iconType: 'Network',
  },
  crossover: {
    type: 'crossover',
    name: 'Korsad TP-kabel (Cat6 Crossover)',
    shortName: 'Korsad Cat6',
    subtitle: 'För direktkoppling av lika enheter (MDI till MDI)',
    category: 'copper',
    description: 'Kopparkabel med korsade TX/RX-ledare för direkt punkt-till-punkt-koppling mellan identiska nätverksskikt utan switch.',
    specializedFor: 'PC ↔ PC, Switch ↔ Switch, Router ↔ Router, Server ↔ Server, PC ↔ Server',
    bandwidthMbps: 1000,
    latencyMs: 1,
    duplex: 'full',
    color: '#f97316', // Orange
    accentColor: '#c2410c',
    dashArray: '8,4',
    strokeWidth: 2.5,
    badge: 'CROSS',
    iconType: 'GitCompare',
  },
  fiber: {
    type: 'fiber',
    name: 'Optisk Fiberkabel (10G SFP+ Single/Multi-mode)',
    shortName: 'Optisk Fiber',
    subtitle: 'Höghastighets stamnät & datacenter (10 Gbps)',
    category: 'fiber',
    description: 'Ljusledarkabel av glasfiber med minimal dämpning, immunitet mot elektromagnetiska störningar och extrem överföringshastighet.',
    specializedFor: 'Internet WAN ↔ Core Router, Core Router ↔ Brandvägg, L3 Switch ↔ Databas/Webbserver, Switch ↔ Switch Stamnät',
    bandwidthMbps: 10000,
    latencyMs: 0.2,
    duplex: 'full',
    color: '#c084fc', // Lila/Magenta
    accentColor: '#9333ea',
    dashArray: 'none',
    strokeWidth: 3.5,
    badge: '10 Gbps',
    iconType: 'Sparkles',
  },
  wifi: {
    type: 'wifi',
    name: 'Trådlös Anslutning (Wi-Fi 6 802.11ax)',
    shortName: 'Wi-Fi Länk',
    subtitle: 'Trådlös radioöverföring (2.4 GHz / 5 GHz / 6 GHz)',
    category: 'wireless',
    description: 'Elektromagnetisk radiovågslänk med OFDMA och MU-MIMO för mobila och trådlösa klienter.',
    specializedFor: 'Laptop, Mobiltelefon, Trådlös Skrivare, Kamera ↔ Wi-Fi AP / WiFi-router',
    bandwidthMbps: 1200,
    latencyMs: 6,
    duplex: 'half',
    color: '#14b8a6', // Teal
    accentColor: '#0f766e',
    dashArray: '4,5',
    strokeWidth: 2,
    badge: 'Wi-Fi 6',
    iconType: 'Wifi',
  },
  serial: {
    type: 'serial',
    name: 'Seriell WAN-kabel (Serial DCE/DTE V.35 / T1)',
    shortName: 'Seriell WAN',
    subtitle: 'Dedikerad punkt-till-punkt telekom WAN-länk',
    category: 'wan',
    description: 'Synkron seriell kommunikationskabel för långdistansförbindelser och WAN-routning mellan telekomnät.',
    specializedFor: 'Core Router ↔ Core Router (WAN), Core Router ↔ Brandvägg (WAN-port), Red Team Tap',
    bandwidthMbps: 100,
    latencyMs: 18,
    duplex: 'full',
    color: '#f43f5e', // Röd/Rose
    accentColor: '#e11d48',
    dashArray: '10,3',
    strokeWidth: 2.5,
    badge: 'WAN V.35',
    iconType: 'Activity',
  },
  coaxial: {
    type: 'coaxial',
    name: 'Koaxialkabel (DOCSIS Coax / RG-6)',
    shortName: 'Koaxialkabel',
    subtitle: 'Bredbandskabel för ISP & kabelmodem',
    category: 'copper',
    description: 'Skärmad koaxialkabel med central kopparledare för bredbandsanslutning och TV/Internet via kabel-TV-nät.',
    specializedFor: 'Internet WAN ↔ WiFi-router / Core Router / Modem',
    bandwidthMbps: 500,
    latencyMs: 7,
    duplex: 'half',
    color: '#eab308', // Guld/Gul
    accentColor: '#ca8a04',
    dashArray: 'none',
    strokeWidth: 3,
    badge: 'DOCSIS',
    iconType: 'Radio',
  },
  console: {
    type: 'console',
    name: 'Konsolkabel (Rollover RS-232 / USB-C)',
    shortName: 'Konsolkabel',
    subtitle: 'Out-of-Band seriell administration & CLI-åtkomst',
    category: 'management',
    description: 'Kabel för direktanslutning från en administratörsdator till en nätverksenhets konsolport (RJ45/USB) för direkt terminalstyrning.',
    specializedFor: 'Dator / Laptop / Hackarterminal ↔ Router, Switch, Brandvägg (Console RJ-45/USB)',
    bandwidthMbps: 1,
    latencyMs: 1,
    duplex: 'full',
    color: '#38bdf8', // Ljusblå
    accentColor: '#0284c7',
    dashArray: '3,3',
    strokeWidth: 1.5,
    badge: 'CLI CON',
    iconType: 'Terminal',
  },
};

export interface CableCompatibilityResult {
  status: 'optimal' | 'compatible' | 'suboptimal' | 'incompatible';
  score: number; // 0 to 100
  title: string;
  message: string;
  explanation: string;
  recommendedType: CableType;
  badgeText: string;
}

/**
 * Resolves the smartest cable type based on two devices.
 */
export function resolveAutoCable(nodeA: Device, nodeB: Device): CableType {
  const isWirelessClient = (t: string) => ['client_mobile', 'client_laptop'].includes(t);
  const isWirelessAP = (t: string) => ['wifi_ap', 'wifi_router'].includes(t);
  const isSwitch = (t: string) => ['switch', 'l3_switch'].includes(t);
  const isRouterOrFw = (t: string) => ['router', 'firewall'].includes(t);
  const isServer = (t: string) => ['server_web', 'server_dns', 'server_db', 'server_vpn'].includes(t);
  const isClient = (t: string) => ['client_pc', 'client_laptop', 'client_printer', 'client_camera', 'hacker'].includes(t);

  // Mobile phone with Wi-Fi AP
  if ((nodeA.type === 'client_mobile' && isWirelessAP(nodeB.type)) || (nodeB.type === 'client_mobile' && isWirelessAP(nodeA.type))) {
    return 'wifi';
  }

  // Laptop with Wi-Fi AP
  if ((nodeA.type === 'client_laptop' && isWirelessAP(nodeB.type)) || (nodeB.type === 'client_laptop' && isWirelessAP(nodeA.type))) {
    return 'wifi';
  }

  // Internet WAN connection
  if (nodeA.type === 'internet' || nodeB.type === 'internet') {
    const other = nodeA.type === 'internet' ? nodeB : nodeA;
    if (other.type === 'router' || other.type === 'firewall' || other.type === 'l3_switch') {
      return 'fiber';
    }
    if (other.type === 'wifi_router') {
      return 'coaxial';
    }
    return 'fiber';
  }

  // Backbone: Core Router <-> Router / Firewall / L3 Switch
  if (isRouterOrFw(nodeA.type) && isRouterOrFw(nodeB.type)) {
    return 'fiber';
  }

  // Switch <-> Switch trunk
  if (isSwitch(nodeA.type) && isSwitch(nodeB.type)) {
    return 'fiber';
  }

  // High-performance Server <-> L3 Switch or Router
  if ((isServer(nodeA.type) && nodeB.type === 'l3_switch') || (isServer(nodeB.type) && nodeA.type === 'l3_switch')) {
    return 'fiber';
  }

  // Direct PC <-> PC or Server <-> Server without switch
  if ((isClient(nodeA.type) && isClient(nodeB.type)) || (isServer(nodeA.type) && isServer(nodeB.type)) || (isClient(nodeA.type) && isServer(nodeB.type))) {
    return 'crossover';
  }

  // Hacker terminal to Console port of Router/Switch/Firewall
  if ((nodeA.type === 'hacker' && (isRouterOrFw(nodeB.type) || isSwitch(nodeB.type))) ||
      (nodeB.type === 'hacker' && (isRouterOrFw(nodeA.type) || isSwitch(nodeA.type)))) {
    return 'cat6';
  }

  // Standard Switch <-> Client / Server / Router / AP
  return 'cat6';
}

/**
 * Validates how well a specific cable fits the two connected devices.
 */
export function validateCableCompatibility(
  cableType: CableType,
  nodeA: Device,
  nodeB: Device
): CableCompatibilityResult {
  const autoType = resolveAutoCable(nodeA, nodeB);

  // If user used auto, it evaluates to the auto resolved type
  const activeType = cableType === 'auto' ? autoType : cableType;

  const isWirelessAP = (t: string) => ['wifi_ap', 'wifi_router'].includes(t);
  const isWirelessCapable = (t: string) => ['client_mobile', 'client_laptop', 'client_camera', 'wifi_ap', 'wifi_router'].includes(t);
  const isSwitch = (t: string) => ['switch', 'l3_switch'].includes(t);
  const isRouter = (t: string) => ['router', 'wifi_router', 'firewall', 'l3_switch'].includes(t);
  const isServer = (t: string) => ['server_web', 'server_dns', 'server_db', 'server_vpn'].includes(t);
  const isClient = (t: string) => ['client_pc', 'client_laptop', 'client_mobile', 'client_printer', 'client_camera', 'hacker'].includes(t);

  // Case 1: Wi-Fi Cable
  if (activeType === 'wifi') {
    const hasAP = isWirelessAP(nodeA.type) || isWirelessAP(nodeB.type);
    const bothWireless = isWirelessCapable(nodeA.type) && isWirelessCapable(nodeB.type);

    if (!hasAP && !bothWireless) {
      return {
        status: 'incompatible',
        score: 10,
        title: 'Inkompatibel: Trådlös länk stöds ej',
        message: `${nodeA.name} och ${nodeB.name} saknar Wi-Fi-radiomoduler eller Access Point.`,
        explanation: 'En trådlös länk kräver att minst en enhet är en Access Point / WiFi-router, och den andra en trådlös klient.',
        recommendedType: autoType,
        badgeText: 'INKOMPATIBEL',
      };
    }

    if (nodeA.type === 'switch' && nodeB.type === 'switch') {
      return {
        status: 'incompatible',
        score: 15,
        title: 'Inkompatibel: Switchar har inte Wi-Fi',
        message: 'Trådbundna switchar kräver Ethernet Cat6 eller Fiber för trunking.',
        explanation: 'Standard switchar saknar trådlösa nätverkskort.',
        recommendedType: 'fiber',
        badgeText: 'INKOMPATIBEL',
      };
    }

    if (hasAP && (nodeA.type === 'client_mobile' || nodeB.type === 'client_mobile' || nodeA.type === 'client_laptop' || nodeB.type === 'client_laptop')) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: Wi-Fi 6 Radioöverföring',
        message: 'Perfekt trådlös anslutning mellan mobil/laptop och trådlös accesspunkt.',
        explanation: 'Stödjer 802.11ax med OFDMA, 1200 Mbps kapacitet och dynamiskt roaming-stöd.',
        recommendedType: 'wifi',
        badgeText: 'OPTIMAL',
      };
    }

    return {
      status: 'compatible',
      score: 85,
      title: 'Kompatibel trådlös anslutning',
      message: 'Trådlös överföring upprättad mellan enheterna.',
      explanation: 'Fungerar med god signalstyrka och måttlig svarstid.',
      recommendedType: 'wifi',
      badgeText: 'KOMPATIBEL',
    };
  }

  // Case 2: Mobile Phone with Physical Cables
  if (nodeA.type === 'client_mobile' || nodeB.type === 'client_mobile') {
    if (activeType === 'serial' || activeType === 'coaxial' || activeType === 'fiber') {
      return {
        status: 'incompatible',
        score: 5,
        title: 'Inkompatibel fysisk port på mobiltelefon',
        message: `Mobiltelefonen saknar ${activeType === 'serial' ? 'Seriell DB9/V.35' : activeType === 'fiber' ? 'SFP+ Optisk Fiber' : 'Koaxial'} port!`,
        explanation: 'Smartphones ansluter enbart via trådlöst Wi-Fi eller i nödfall USB-Ethernet-adapter.',
        recommendedType: 'wifi',
        badgeText: 'INKOMPATIBEL',
      };
    }
  }

  // Case 3: Optical Fiber
  if (activeType === 'fiber') {
    if (nodeA.type === 'internet' || nodeB.type === 'internet' || (isRouter(nodeA.type) && isRouter(nodeB.type)) || (isSwitch(nodeA.type) && isServer(nodeB.type))) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: 10G SFP+ Optisk Fiber',
        message: 'Maximal stamnätskapacitet (10 Gbps) med 0.2 ms ultra-låg latens.',
        explanation: 'Optisk fiber eliminerar flaskhalsar och ger högsta tillförlitlighet för datacenter & ryggradsnät.',
        recommendedType: 'fiber',
        badgeText: 'OPTIMAL (10G)',
      };
    }

    if (nodeA.type === 'client_printer' || nodeB.type === 'client_printer' || nodeA.type === 'client_camera' || nodeB.type === 'client_camera') {
      return {
        status: 'suboptimal',
        score: 60,
        title: 'Överdimensionerad fiberkabel',
        message: 'Skrivare och övervakningskameror har oftast enbart standard Cat6 1GbE RJ45-port.',
        explanation: 'Fungerar med transceiver-mediaomvandlare men Cat6 är mer lämpligt.',
        recommendedType: 'cat6',
        badgeText: 'SUBOPTIMAL',
      };
    }

    return {
      status: 'compatible',
      score: 90,
      title: 'Kompatibel optisk fiberförbindelse',
      message: 'Höghastighets optisk länk mellan nätverksenheterna.',
      explanation: 'Ger 10 Gbps bandbredd med mycket god signalkvalitet.',
      recommendedType: 'fiber',
      badgeText: 'KOMPATIBEL',
    };
  }

  // Case 4: Crossover Cable
  if (activeType === 'crossover') {
    // Like devices directly connected
    const bothClients = isClient(nodeA.type) && isClient(nodeB.type);
    const bothServers = isServer(nodeA.type) && isServer(nodeB.type);
    const bothRouters = isRouter(nodeA.type) && isRouter(nodeB.type);
    const bothSwitches = isSwitch(nodeA.type) && isSwitch(nodeB.type);

    if (bothClients || bothServers || bothRouters || bothSwitches) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: Korsad Cat6 (Crossover)',
        message: 'Klassisk standard för direktkoppling mellan två enheter på samma nätverksskikt (MDI till MDI).',
        explanation: 'Korsade ledare kopplar TX-stiften direkt till RX-stiften på motparten utan switch.',
        recommendedType: 'crossover',
        badgeText: 'OPTIMAL',
      };
    }

    if ((isSwitch(nodeA.type) && isClient(nodeB.type)) || (isSwitch(nodeB.type) && isClient(nodeA.type))) {
      return {
        status: 'suboptimal',
        score: 70,
        title: 'Suboptimal: Rak Cat6 rekommenderas',
        message: 'För koppling mellan switch (MDI-X) och klient/server (MDI) används normalt Rak TP-kabel.',
        explanation: 'Moderna switchar med Auto-MDIX kan hantera detta, men enligt nätverksstandard ska Rak Cat6 användas.',
        recommendedType: 'cat6',
        badgeText: 'SUBOPTIMAL',
      };
    }

    return {
      status: 'compatible',
      score: 80,
      title: 'Kompatibel korsad kabel',
      message: 'Korsad anslutning upprättad.',
      explanation: 'Fungerar med standard Ethernet-hastighet.',
      recommendedType: 'crossover',
      badgeText: 'KOMPATIBEL',
    };
  }

  // Case 5: Straight-Through Cat6
  if (activeType === 'cat6') {
    const isSwitchToClient = (isSwitch(nodeA.type) && (isClient(nodeB.type) || isServer(nodeB.type) || isRouter(nodeB.type) || nodeB.type === 'wifi_ap')) ||
                            (isSwitch(nodeB.type) && (isClient(nodeA.type) || isServer(nodeA.type) || isRouter(nodeA.type) || nodeA.type === 'wifi_ap'));

    if (isSwitchToClient) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: Rak Cat6 Straight-Through',
        message: 'Klassisk nätverksstandard för att koppla en switch till datorer, servrar, routrar och accesspunkter.',
        explanation: 'Stiftkonfigurationen 1-till-1 ansluter MDI-port till MDI-X-port felfritt i 1 Gbps Full Duplex.',
        recommendedType: 'cat6',
        badgeText: 'OPTIMAL (1 Gbps)',
      };
    }

    const bothClients = isClient(nodeA.type) && isClient(nodeB.type);
    if (bothClients) {
      return {
        status: 'suboptimal',
        score: 70,
        title: 'Suboptimal: Direktkoppling mellan två datorer',
        message: 'Direkt koppling mellan två datorer utan switch kräver i äldre standarder en Korsad kabel (Crossover).',
        explanation: 'Fungerar med Auto-MDIX men pedagogiskt rekommenderas Korsad kabel.',
        recommendedType: 'crossover',
        badgeText: 'SUBOPTIMAL',
      };
    }

    return {
      status: 'compatible',
      score: 90,
      title: 'Kompatibel Cat6 Ethernet-kabel',
      message: '1 Gbps kopparanslutning upprättad.',
      explanation: 'Tillförlitlig anslutning med standard 1000BASE-T.',
      recommendedType: 'cat6',
      badgeText: 'KOMPATIBEL',
    };
  }

  // Case 6: Serial WAN Cable
  if (activeType === 'serial') {
    const isRouterToRouter = isRouter(nodeA.type) && isRouter(nodeB.type);
    const isWanPort = nodeA.type === 'internet' || nodeB.type === 'internet';

    if (isRouterToRouter || isWanPort) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: Seriell WAN-kabel (V.35 / T1)',
        message: 'Dedikerad punkt-till-punkt telekom WAN-länk mellan routrar.',
        explanation: 'Emulerar synkron seriell WAN-överföring med klockfrekvens och HDLC/PPP-inkapsling.',
        recommendedType: 'serial',
        badgeText: 'OPTIMAL (WAN)',
      };
    }

    if (isClient(nodeA.type) || isClient(nodeB.type)) {
      return {
        status: 'incompatible',
        score: 15,
        title: 'Inkompatibel: Seriell kabel stöds ej av klient LAN-port',
        message: 'Klientdatorer och telefoner kan inte använda seriella WAN-kablar för vanlig nätverkstrafik.',
        explanation: 'Seriella kablar är avsedda för WAN-routrar, inte standard slutenheter.',
        recommendedType: 'cat6',
        badgeText: 'INKOMPATIBEL',
      };
    }

    return {
      status: 'compatible',
      score: 75,
      title: 'Kompatibel seriell länk',
      message: 'Seriell punkt-till-punkt-kanal upprättad.',
      explanation: 'Begränsad bandbredd (100 Mbps) men stabil WAN-signal.',
      recommendedType: 'serial',
      badgeText: 'KOMPATIBEL',
    };
  }

  // Case 7: Coaxial Cable
  if (activeType === 'coaxial') {
    const isISPConnection = nodeA.type === 'internet' || nodeB.type === 'internet';
    if (isISPConnection && (nodeA.type === 'wifi_router' || nodeB.type === 'wifi_router' || nodeA.type === 'router' || nodeB.type === 'router')) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: DOCSIS Koaxial Bredbandskabel',
        message: 'Klassisk kabel-TV / bredbandsmodem-anslutning från ISP till hemmarouter.',
        explanation: 'Fungerar med hög immunitet mot yttre radiostörningar.',
        recommendedType: 'coaxial',
        badgeText: 'OPTIMAL (Bredband)',
      };
    }

    if (isClient(nodeA.type) || isClient(nodeB.type)) {
      return {
        status: 'suboptimal',
        score: 40,
        title: 'Suboptimal: Klienter saknar koaxialport',
        message: 'Moderna datorer och mobiler saknar koaxialingång (F-kontakt).',
        explanation: 'Kräver kabelmodem eller Cat6 Ethernet-kabel.',
        recommendedType: 'cat6',
        badgeText: 'SUBOPTIMAL',
      };
    }

    return {
      status: 'compatible',
      score: 80,
      title: 'Kompatibel koaxialförbindelse',
      message: 'Koaxial länk etablerad.',
      explanation: '500 Mbps överföringshastighet.',
      recommendedType: 'coaxial',
      badgeText: 'KOMPATIBEL',
    };
  }

  // Case 8: Console Cable
  if (activeType === 'console') {
    const hasAdmin = nodeA.type === 'client_pc' || nodeA.type === 'client_laptop' || nodeA.type === 'hacker' ||
                     nodeB.type === 'client_pc' || nodeB.type === 'client_laptop' || nodeB.type === 'hacker';
    const hasManaged = isRouter(nodeA.type) || isSwitch(nodeA.type) || isRouter(nodeB.type) || isSwitch(nodeB.type);

    if (hasAdmin && hasManaged) {
      return {
        status: 'optimal',
        score: 100,
        title: 'Optimal kabel: Konsol Out-of-Band Management',
        message: 'Direkt terminalkabel (RS-232 / USB) för direkt CLI-administration.',
        explanation: 'Ger åtkomst till IOS/Linux CLI även när nätverkskortet saknar IP-adress.',
        recommendedType: 'console',
        badgeText: 'OPTIMAL (CLI)',
      };
    }

    return {
      status: 'suboptimal',
      score: 50,
      title: 'Suboptimal användning av konsolkabel',
      message: 'Konsolkabel används enbart för administration mellan dator och router/switch.',
      explanation: 'Stödjer inte höghastighets IP-datatrafik (endast 115.2 kbps / 1 Mbps).',
      recommendedType: 'cat6',
      badgeText: 'SUBOPTIMAL',
    };
  }

  return {
    status: 'compatible',
    score: 85,
    title: 'Kompatibel kabel',
    message: 'Kabeln kan överföra data mellan enheterna.',
    explanation: 'Standard nätverksöverföring.',
    recommendedType: autoType,
    badgeText: 'KOMPATIBEL',
  };
}
