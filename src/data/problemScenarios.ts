import { ProblemScenario, Device, Link } from '../types';

export const PROBLEM_SCENARIOS: ProblemScenario[] = [
  {
    id: 'sc_1_broken_link',
    title: '1. Den Avstängda Vägen',
    category: 'Felsökning',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    iconName: 'Cable',
    summary: 'Utvecklarens PC har tappat sin internetanslutning på grund av saknad kabel och felaktig Gateway.',
    problemDescription: 'Utvecklaren på PC 1 klagar på att internet inte fungerar. Nätverksteknikern upptäckte att nätverkskabeln mellan datorn och switchen har kopplats ur, och datorns standard-gateway pekar på ett ogiltigt IP (192.168.99.1).',
    initialNodes: [
      {
        id: 'n_internet',
        type: 'internet',
        name: 'Internet (WAN)',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:11:22:33:44:00',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_router',
        type: 'l3_switch',
        name: 'Kontorsrouter',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:11:22:33:44:01',
        x: 320,
        y: 260,
        on: true,
      },
      {
        id: 'n_sw',
        type: 'switch',
        name: 'Access Switch',
        ip: '192.168.1.2',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:11:22:33:44:02',
        x: 540,
        y: 260,
        on: true,
      },
      {
        id: 'n_pc1',
        type: 'client_pc',
        name: 'Utvecklare PC 1',
        ip: '192.168.1.50',
        subnetMask: '255.255.255.0',
        gateway: '192.168.99.1', // FEL GATEWAY!
        mac: '00:11:22:33:44:50',
        x: 780,
        y: 260,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_internet', b: 'n_router', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_router', b: 'n_sw', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      // INGEN LÄNK mellan n_sw och n_pc1!
    ],
    tasks: [
      {
        id: 't1',
        description: 'Dra en Cat6-kabel mellan Access Switch och Utvecklare PC 1.',
        hint: 'Välj verktyget "Kopparkabel Cat6" i kabelmenyn, klicka först på Switchen och sedan på PC 1.',
      },
      {
        id: 't2',
        description: 'Ändra Gateway på Utvecklare PC 1 till 192.168.1.1.',
        hint: 'Klicka på PC 1 för att öppna Enhetsinspektören eller IP-konfigurationen och uppdatera Gateway-fältet till 192.168.1.1.',
      },
      {
        id: 't3',
        description: 'Säkerställ att PC 1 når Internet utan paketförlust.',
        hint: 'Kör ett ping-test från PC 1 till 198.51.100.1 i terminalen eller klicka på "Testa Nätverk".',
      },
    ],
    validateSolution: (nodes, links) => {
      const pc1 = nodes.find((n) => n.id === 'n_pc1');
      const hasLink = links.some(
        (l) => (l.a === 'n_sw' && l.b === 'n_pc1') || (l.a === 'n_pc1' && l.b === 'n_sw')
      );
      const correctGateway = pc1?.gateway === '192.168.1.1';
      const isPc1On = pc1?.on !== false;

      const task1Done = hasLink;
      const task2Done = correctGateway;
      const task3Done = task1Done && task2Done && isPc1On;

      const isSolved = task1Done && task2Done && task3Done;

      return {
        isSolved,
        taskStatuses: {
          t1: task1Done,
          t2: task2Done,
          t3: task3Done,
        },
        message: isSolved
          ? 'Snyggt jobbat! Kabeln är ansluten och Gateway-konfigurationen är korrekt. PC 1 har full internetåtkomst!'
          : 'Nätverket har fortfarande problem. Kontrollera att kabeln är ansluten och att Gateway är 192.168.1.1.',
      };
    },
  },
  {
    id: 'sc_2_ip_conflict',
    title: '2. Kollisionen i Datacenter',
    category: 'DHCP & IP',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    iconName: 'AlertTriangle',
    summary: 'Två servrar delar exakt samma IP-adress (192.168.10.50), vilket orsakar svåra avbrott.',
    problemDescription: 'Företagets IT-avdelning upptäckte att både den publika webbservern och den interna DNS-servern har ställts in på IP-adressen 192.168.10.50. Detta orsakar paketkollisioner och förhindrar namnuppslagning.',
    initialNodes: [
      {
        id: 'n_sw',
        type: 'switch',
        name: 'Server Farm Switch',
        ip: '192.168.10.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:22:33:44:55:01',
        x: 320,
        y: 260,
        on: true,
      },
      {
        id: 'n_web',
        type: 'server_web',
        name: 'Företagsportal (Webb)',
        ip: '192.168.10.50',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:22:33:44:55:10',
        x: 600,
        y: 160,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_dns',
        type: 'server_dns',
        name: 'DNS Server',
        ip: '192.168.10.50', // KONFLIKT!
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:22:33:44:55:11',
        x: 600,
        y: 360,
        on: true,
        dnsRecords: [
          { id: '1', hostname: 'portal.se', ip: '192.168.10.50', type: 'A' },
        ],
        services: { dns: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_sw', b: 'n_web', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw', b: 'n_dns', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Ändra IP-adressen på DNS-servern till 192.168.10.53.',
        hint: 'Klicka på DNS Server, ändra fältet för IP-adress från 192.168.10.50 till 192.168.10.53.',
      },
      {
        id: 't2',
        description: 'Säkerställ att det inte finns några IP-konflikter i nätverket.',
        hint: 'Ingen enhet i samma subnät får ha identisk IP-adress.',
      },
    ],
    validateSolution: (nodes) => {
      const dns = nodes.find((n) => n.id === 'n_dns');
      const web = nodes.find((n) => n.id === 'n_web');

      const dnsFixed = dns?.ip === '192.168.10.53';
      const webFixed = web?.ip === '192.168.10.50';
      const noConflict = dns?.ip !== web?.ip;

      const isSolved = dnsFixed && webFixed && noConflict;

      return {
        isSolved,
        taskStatuses: {
          t1: dnsFixed,
          t2: noConflict,
        },
        message: isSolved
          ? 'Perfekt! IP-konflikten är löst. DNS-servern har nu IP 192.168.10.53 och båda servrarna fungerar felfritt.'
          : 'Båda servrarna har fortfarande konflikter eller felaktig IP. Ändra DNS-serverns IP till 192.168.10.53.',
      };
    },
  },
  {
    id: 'sc_3_firewall_block',
    title: '3. Brandväggsspärren',
    category: 'Säkerhet',
    difficulty: 'easy',
    estimatedTime: '4-6 min',
    iconName: 'ShieldAlert',
    summary: 'Brandväggen saknar en regel som tillåter publik HTTP-trafik till företagsportalen.',
    problemDescription: 'Företaget har lanserat sin nya kundportal på servern 172.16.50.10. Externa användare på Internet kan inte nå sidan eftersom brandväggen blockerar all oönskad inkommande HTTP-trafik från WAN.',
    initialNodes: [
      {
        id: 'n_internet',
        type: 'internet',
        name: 'Publikt Internet',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:33:44:55:66:01',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_fw',
        type: 'firewall',
        name: 'NGFW Edge Firewall',
        ip: '198.51.100.2',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:33:44:55:66:02',
        x: 340,
        y: 260,
        on: true,
        firewallRules: [], // SAKNAR TILLÅTELSE-REGEL!
      },
      {
        id: 'n_sw',
        type: 'switch',
        name: 'DMZ Switch',
        ip: '172.16.50.1',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.2',
        mac: '00:33:44:55:66:03',
        x: 580,
        y: 260,
        on: true,
      },
      {
        id: 'n_web',
        type: 'server_web',
        name: 'Kundportal Webbsystem',
        ip: '172.16.50.10',
        subnetMask: '255.255.255.0',
        gateway: '172.16.50.1',
        mac: '00:33:44:55:66:10',
        x: 820,
        y: 260,
        on: true,
        services: { http: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_internet', b: 'n_fw', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_fw', b: 'n_sw', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_sw', b: 'n_web', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Öppna Brandväggens regler på NGFW Edge Firewall.',
        hint: 'Klicka på Brandväggen på canvasen och välj fliken "Brandväggsregler".',
      },
      {
        id: 't2',
        description: 'Skapa en regel: Handling = Tillåt (allow), Protokoll = HTTP, Mål-IP = 172.16.50.10 (eller *).',
        hint: 'Klicka på "Lägg till Regel", sätt Action till ALLOW, Protocol till HTTP och Dest IP till 172.16.50.10.',
      },
    ],
    validateSolution: (nodes) => {
      const fw = nodes.find((n) => n.id === 'n_fw');
      const rules = fw?.firewallRules || [];

      const hasAllowHttp = rules.some(
        (r) =>
          r.action === 'allow' &&
          (r.protocol === 'HTTP' || r.protocol === 'ALL' || r.port === 80) &&
          (r.destIp === '172.16.50.10' || r.destIp === '*')
      );

      return {
        isSolved: hasAllowHttp,
        taskStatuses: {
          t1: rules.length > 0,
          t2: hasAllowHttp,
        },
        message: hasAllowHttp
          ? 'Utmärkt! Brandväggsregeln är aktiv och tillåter nu HTTP-trafik till kundportalen.'
          : 'Brandväggen blockerar fortfarande HTTP. Lägg till en ALLOW-regel för HTTP till 172.16.50.10.',
      };
    },
  },
  {
    id: 'sc_4_malware_outbreak',
    title: '4. Smittospridning på Ekonomiavdelningen',
    category: 'Säkerhet',
    difficulty: 'medium',
    estimatedTime: '5-8 min',
    iconName: 'Skull',
    summary: 'En infekterad laptop sprider trojaner och hotar företagets SQL-databas.',
    problemDescription: 'En anställd öppnade en skadlig e-postbilaga på datorn "Infekterad Laptop". En trojan har installerats och sprider skadlig kod i realtid mot nätverkets servrar. Företagets känsliga SQL-databas står på spel!',
    initialNodes: [
      {
        id: 'n_sw',
        type: 'switch',
        name: 'Kontorsswitch',
        ip: '10.0.0.1',
        subnetMask: '255.255.255.0',
        gateway: '10.0.0.1',
        mac: '00:44:55:66:77:01',
        x: 340,
        y: 260,
        on: true,
      },
      {
        id: 'n_inf_laptop',
        type: 'client_laptop',
        name: 'Infekterad Laptop (Trojan)',
        ip: '10.0.0.88',
        subnetMask: '255.255.255.0',
        gateway: '10.0.0.1',
        mac: '00:44:55:66:77:88',
        x: 600,
        y: 140,
        on: true,
        isInfected: true, // SMITTAD!
      },
      {
        id: 'n_db',
        type: 'server_db',
        name: 'SQL Kunddatabas',
        ip: '10.0.0.50',
        subnetMask: '255.255.255.0',
        gateway: '10.0.0.1',
        mac: '00:44:55:66:77:50',
        x: 600,
        y: 380,
        on: true,
        services: { sql: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_sw', b: 'n_inf_laptop', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw', b: 'n_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Isolera den infekterade laptopen genom att ta bort dess kabel eller stänga av enheten.',
        hint: 'Klicka på länken mellan Switchen och Laptopen och ta bort den, eller stäng av laptopen i inspektören.',
      },
      {
        id: 't2',
        description: 'Verifiera att SQL-databasen är frisk och inte längre smittas.',
        hint: 'När länken är bruten upphör spridningen till databasen.',
      },
    ],
    validateSolution: (nodes, links) => {
      const laptop = nodes.find((n) => n.id === 'n_inf_laptop');
      const db = nodes.find((n) => n.id === 'n_db');

      const isLaptopOff = laptop?.on === false;
      const isDisconnected = !links.some(
        (l) => l.a === 'n_inf_laptop' || l.b === 'n_inf_laptop'
      );
      const isIsolated = isLaptopOff || isDisconnected;
      const isDbHealthy = db?.isInfected !== true;

      const isSolved = isIsolated && isDbHealthy;

      return {
        isSolved,
        taskStatuses: {
          t1: isIsolated,
          t2: isDbHealthy,
        },
        message: isSolved
          ? 'Grymt jobbat! Den infekterade laptopen är isolerad och hotet mot databasen är neutraliserat.'
          : 'Hotet kvarstår! Ta bort kabeln från den infekterade laptopen eller stäng av den helt.',
      };
    },
  },
  {
    id: 'sc_5_dhcp_failure',
    title: '5. Gästnätverk utan IP-adresser',
    category: 'DHCP & IP',
    difficulty: 'medium',
    estimatedTime: '5-7 min',
    iconName: 'Wifi',
    summary: 'Wi-Fi Access Point har inaktiverad DHCP-server vilket gör gäster strömlösa utan IP.',
    problemDescription: 'Konferensgäster som ansluter till företagets trådlösa gästnätverk kan inte komma ut på internet. Wi-Fi Access Pointen har tappat sin DHCP-konfiguration och delar inte ut några dynamiska IP-adresser.',
    initialNodes: [
      {
        id: 'n_internet',
        type: 'internet',
        name: 'Internet Fiber',
        ip: '81.230.10.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:55:66:77:88:01',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_ap',
        type: 'wifi_ap',
        name: 'Konferens Wi-Fi AP',
        ip: '10.0.30.1',
        subnetMask: '255.255.255.0',
        gateway: '81.230.10.1',
        mac: '00:55:66:77:88:02',
        x: 360,
        y: 260,
        on: true,
        dhcpEnabled: false, // INAKTIV DHCP!
        dhcpRange: { start: '10.0.30.100', end: '10.0.30.200' },
        wifiCoverageRadius: 200,
      },
      {
        id: 'n_guest_phone',
        type: 'client_mobile',
        name: 'Gäst Mobiltelefon',
        ip: '0.0.0.0', // SAKNAR IP!
        subnetMask: '255.255.255.0',
        gateway: '10.0.30.1',
        mac: '00:55:66:77:88:99',
        x: 620,
        y: 260,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_internet', b: 'n_ap', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_ap', b: 'n_guest_phone', type: 'wifi', bandwidthMbps: 300, latencyMs: 5, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Aktivera DHCP-tjänsten på Konferens Wi-Fi AP.',
        hint: 'Klicka på Wi-Fi AP och klicka i rutan "Aktivera DHCP-Server".',
      },
      {
        id: 't2',
        description: 'Konfigurera en giltig IP-adress (t.ex. 10.0.30.105) på Gäst Mobiltelefon.',
        hint: 'Tilldela mobilen en IP-adress inom nätverket 10.0.30.0/24.',
      },
    ],
    validateSolution: (nodes) => {
      const ap = nodes.find((n) => n.id === 'n_ap');
      const phone = nodes.find((n) => n.id === 'n_guest_phone');

      const dhcpActive = ap?.dhcpEnabled === true;
      const phoneHasValidIp =
        phone?.ip && phone.ip !== '0.0.0.0' && phone.ip.startsWith('10.0.30.');

      const isSolved = dhcpActive && Boolean(phoneHasValidIp);

      return {
        isSolved,
        taskStatuses: {
          t1: dhcpActive,
          t2: Boolean(phoneHasValidIp),
        },
        message: isSolved
          ? 'Snyggt! DHCP-servern är igång och gästmobiltelefonen har tilldelats en giltig IP-adress.'
          : 'Gästen saknar fortfarande IP eller DHCP är inaktiv. Aktivera DHCP och tilldela en IP i 10.0.30.x.',
      };
    },
  },
  {
    id: 'sc_6_broken_dns',
    title: '6. Den Försvunna Domänen',
    category: 'DNS & Web',
    difficulty: 'medium',
    estimatedTime: '6-8 min',
    iconName: 'Globe',
    summary: 'Webbplatsen intranet.foretag.se fungerar inte eftersom DNS A-posten saknas.',
    problemDescription: 'Användare kan pinga webbserverns IP (192.168.10.50) direkt, men när de försöker surfa till "intranet.foretag.se" misslyckas uppslagningen. DNS-servern har ingen A-post konfigurerad för domänen.',
    initialNodes: [
      {
        id: 'n_sw',
        type: 'switch',
        name: 'Core Switch',
        ip: '192.168.10.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:66:77:88:99:01',
        x: 320,
        y: 260,
        on: true,
      },
      {
        id: 'n_web',
        type: 'server_web',
        name: 'Intranät Server',
        ip: '192.168.10.50',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:66:77:88:99:10',
        x: 580,
        y: 140,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_dns',
        type: 'server_dns',
        name: 'Företagets DNS Server',
        ip: '192.168.10.53',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:66:77:88:99:11',
        x: 580,
        y: 380,
        on: true,
        dnsRecords: [], // TOM DNS-TABELL!
        services: { dns: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_sw', b: 'n_web', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw', b: 'n_dns', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Öppna DNS-inställningarna på "Företagets DNS Server".',
        hint: 'Klicka på DNS Server och navigera till sektionen för DNS-poster.',
      },
      {
        id: 't2',
        description: 'Lägg till en A-post för "intranet.foretag.se" pekad mot 192.168.10.50.',
        hint: 'Fyll i Hostname: intranet.foretag.se och IP: 192.168.10.50 i DNS-record formuläret.',
      },
    ],
    validateSolution: (nodes) => {
      const dns = nodes.find((n) => n.id === 'n_dns');
      const records = dns?.dnsRecords || [];

      const hasArecord = records.some(
        (r) =>
          r.type === 'A' &&
          (r.hostname.toLowerCase() === 'intranet.foretag.se' || r.hostname.toLowerCase() === 'intranet') &&
          r.ip === '192.168.10.50'
      );

      return {
        isSolved: hasArecord,
        taskStatuses: {
          t1: records.length > 0 || hasArecord,
          t2: hasArecord,
        },
        message: hasArecord
          ? 'Perfekt! DNS A-posten är konfigurerad. Domänen intranet.foretag.se pekar nu rätt på 192.168.10.50.'
          : 'DNS-posten saknas fortfarande. Lägg till en A-post för intranet.foretag.se pekad på 192.168.10.50.',
      };
    },
  },
  {
    id: 'sc_7_dmz_isolation',
    title: '7. Isolera DMZ och Säkra Databasen',
    category: 'VLAN & Isolation',
    difficulty: 'hard',
    estimatedTime: '8-12 min',
    iconName: 'Lock',
    summary: 'Säkra nätverksarkitekturen genom att flytta DMZ-noder och spärra direkt extern databas-åtkomst.',
    problemDescription: 'En säkerhetsaudit visade att den interna SQL-databasen (10.100.20.50) är direkt nåbar från WAN utan begränsningar! Databasen måste skyddas med brandväggsregler medan den publika webbservern förblir öppen.',
    initialNodes: [
      {
        id: 'n_wan',
        type: 'internet',
        name: 'Internet WAN',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:77:88:99:AA:01',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_fw',
        type: 'firewall',
        name: 'Enterprise NGFW',
        ip: '198.51.100.2',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:77:88:99:AA:02',
        x: 320,
        y: 260,
        on: true,
        firewallRules: [], // INGA SKYDDSREGLER!
      },
      {
        id: 'n_sw',
        type: 'switch',
        name: 'Core Switch',
        ip: '10.100.20.1',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.2',
        mac: '00:77:88:99:AA:03',
        x: 540,
        y: 260,
        on: true,
      },
      {
        id: 'n_web',
        type: 'server_web',
        name: 'Publik Webbsida',
        ip: '172.16.50.10',
        subnetMask: '255.255.255.0',
        gateway: '10.100.20.1',
        mac: '00:77:88:99:AA:10',
        x: 780,
        y: 140,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_db',
        type: 'server_db',
        name: 'SQL Kunddatabas',
        ip: '10.100.20.50',
        subnetMask: '255.255.255.0',
        gateway: '10.100.20.1',
        mac: '00:77:88:99:AA:50',
        x: 780,
        y: 380,
        on: true,
        services: { sql: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_wan', b: 'n_fw', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_fw', b: 'n_sw', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_sw', b: 'n_web', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_sw', b: 'n_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Skapa en brandväggsregel i NGFW som blockerar all inkommande extern trafik till SQL-databasen (10.100.20.50).',
        hint: 'Sätt Action = BLOCK, Source IP = *, Dest IP = 10.100.20.50.',
      },
      {
        id: 't2',
        description: 'Skapa en brandväggsregel som tillåter HTTP-trafik till den publika webbsidan (172.16.50.10).',
        hint: 'Sätt Action = ALLOW, Protocol = HTTP, Dest IP = 172.16.50.10.',
      },
    ],
    validateSolution: (nodes) => {
      const fw = nodes.find((n) => n.id === 'n_fw');
      const rules = fw?.firewallRules || [];

      const blocksDb = rules.some(
        (r) => r.action === 'block' && (r.destIp === '10.100.20.50' || r.destIp === '*')
      );
      const allowsWeb = rules.some(
        (r) =>
          r.action === 'allow' &&
          (r.protocol === 'HTTP' || r.protocol === 'ALL' || r.port === 80) &&
          (r.destIp === '172.16.50.10' || r.destIp === '*')
      );

      const isSolved = blocksDb && allowsWeb;

      return {
        isSolved,
        taskStatuses: {
          t1: blocksDb,
          t2: allowsWeb,
        },
        message: isSolved
          ? 'Säkerhetsauditen är godkänd! Databasen är helt avskärmad från direkt yttre åtkomst medan webbsidan är öppen.'
          : 'Brandväggen är inte fullständigt konfigurerad. Blockera 10.100.20.50 och tillåt HTTP till 172.16.50.10.',
      };
    },
  },
  {
    id: 'sc_8_redundant_failover',
    title: '8. Kraschad Kärnrouter & Failover',
    category: 'Routing',
    difficulty: 'hard',
    estimatedTime: '8-10 min',
    iconName: 'Server',
    summary: 'Primära Core Router har kraschat. Koppla om nätverket till Sekundär Core Router.',
    problemDescription: 'Ett hårdvarufel har slagit ut den primära routern (Core Alpha = Avstängd). Reservroutern (Core Beta) är igång men saknar länk till reservbrandväggen och saknar korrekt gateway-routing för LAN-klienterna.',
    initialNodes: [
      {
        id: 'n_isp',
        type: 'internet',
        name: 'Internet Fiber Backbone',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:88:99:AA:BB:01',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_fw_primary',
        type: 'firewall',
        name: 'FW Primär',
        ip: '198.51.100.2',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:88:99:AA:BB:02',
        x: 300,
        y: 160,
        on: true,
      },
      {
        id: 'n_fw_backup',
        type: 'firewall',
        name: 'FW Sekundär (Backup)',
        ip: '203.0.113.2',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:88:99:AA:BB:03',
        x: 300,
        y: 360,
        on: true,
      },
      {
        id: 'n_core_alpha',
        type: 'l3_switch',
        name: 'Core Router Alpha (KRASCHAD)',
        ip: '10.100.0.1',
        subnetMask: '255.255.0.0',
        gateway: '198.51.100.2',
        mac: '00:88:99:AA:BB:10',
        x: 540,
        y: 160,
        on: false, // KRASCHAD!
      },
      {
        id: 'n_core_beta',
        type: 'l3_switch',
        name: 'Core Router Beta (Standby)',
        ip: '10.100.0.2',
        subnetMask: '255.255.0.0',
        gateway: '10.100.0.1', // FEL GATEWAY!
        mac: '00:88:99:AA:BB:11',
        x: 540,
        y: 360,
        on: true,
      },
      {
        id: 'n_sw_lan',
        type: 'switch',
        name: 'LAN Access Switch',
        ip: '10.100.10.1',
        subnetMask: '255.255.255.0',
        gateway: '10.100.0.2',
        mac: '00:88:99:AA:BB:20',
        x: 760,
        y: 360,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_isp', b: 'n_fw_primary', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_isp', b: 'n_fw_backup', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_fw_primary', b: 'n_core_alpha', type: 'fiber', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_core_beta', b: 'n_sw_lan', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      // SAKNAR LÄNK mellan FW Sekundär och Core Router Beta!
    ],
    tasks: [
      {
        id: 't1',
        description: 'Dra en Fiberkabel mellan FW Sekundär (Backup) och Core Router Beta (Standby).',
        hint: 'Använd Fiberkabel från kabelverktygen för att koppla ihop FW Sekundär med Core Router Beta.',
      },
      {
        id: 't2',
        description: 'Ändra Gateway på Core Router Beta till 203.0.113.2.',
        hint: 'Öppna Core Router Beta och ändra dess Gateway från 10.100.0.1 till 203.0.113.2 (sekundär brandvägg).',
      },
    ],
    validateSolution: (nodes, links) => {
      const coreBeta = nodes.find((n) => n.id === 'n_core_beta');
      const hasLinkToFwBackup = links.some(
        (l) =>
          (l.a === 'n_fw_backup' && l.b === 'n_core_beta') ||
          (l.a === 'n_core_beta' && l.b === 'n_fw_backup')
      );
      const correctGw = coreBeta?.gateway === '203.0.113.2';

      const isSolved = hasLinkToFwBackup && correctGw;

      return {
        isSolved,
        taskStatuses: {
          t1: hasLinkToFwBackup,
          t2: correctGw,
        },
        message: isSolved
          ? 'Failover genomförd! Trafiken är omstyrd via Core Beta och sekundär brandvägg. Nätverket är åter igång.'
          : 'Failover misslyckades. Dra en fiberkabel från FW Sekundär till Core Beta och sätt Gateway till 203.0.113.2.',
      };
    },
  },
  {
    id: 'sc_9_vlan_leak',
    title: '9. VLAN-Läckage i Gästzonen',
    category: 'VLAN & Isolation',
    difficulty: 'hard',
    estimatedTime: '8-10 min',
    iconName: 'ShieldAlert',
    summary: 'Gäst-Wi-Fi har felaktigt hamnat i företagslednings-VLAN (VLAN 20), vilket orsakar en allvarlig säkerhetsrisk.',
    problemDescription: 'En felkonfiguration i switchen har tilldelat gäst-Wi-Fi samma VLAN-ID (20) som ledningens servrar. Detta innebär att osäkra gästenheter kan komma åt konfidentiella företagsdokument.',
    initialNodes: [
      {
        id: 'n_core',
        type: 'l3_switch',
        name: 'Core Router L3',
        ip: '10.100.0.1',
        subnetMask: '255.255.0.0',
        gateway: '',
        mac: '00:99:AA:BB:CC:01',
        x: 200,
        y: 260,
        on: true,
      },
      {
        id: 'n_sw_guest',
        type: 'switch',
        name: 'Gäst Access Switch',
        ip: '10.100.20.99', // FEL SUBNET & FEL VLAN!
        subnetMask: '255.255.255.0',
        gateway: '10.100.0.1',
        mac: '00:99:AA:BB:CC:02',
        x: 480,
        y: 160,
        on: true,
        vlanId: 20, // FEL VLAN! MÅSTE VARA 30
      },
      {
        id: 'n_sw_mgmt',
        type: 'switch',
        name: 'Ledning Switch (VLAN 20)',
        ip: '10.100.20.1',
        subnetMask: '255.255.255.0',
        gateway: '10.100.0.1',
        mac: '00:99:AA:BB:CC:03',
        x: 480,
        y: 360,
        on: true,
        vlanId: 20,
      },
      {
        id: 'n_guest_laptop',
        type: 'client_laptop',
        name: 'Obehörig Gäst Laptop',
        ip: '10.100.20.155',
        subnetMask: '255.255.255.0',
        gateway: '10.100.20.99',
        mac: '00:99:AA:BB:CC:99',
        x: 740,
        y: 160,
        on: true,
      },
      {
        id: 'n_vault_db',
        type: 'server_db',
        name: 'Konfidentiell Lednings-DB',
        ip: '10.100.20.50',
        subnetMask: '255.255.255.0',
        gateway: '10.100.20.1',
        mac: '00:99:AA:BB:CC:50',
        x: 740,
        y: 360,
        on: true,
        services: { sql: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_core', b: 'n_sw_guest', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_core', b: 'n_sw_mgmt', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_sw_guest', b: 'n_guest_laptop', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_sw_mgmt', b: 'n_vault_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Ändra VLAN-ID på Gäst Access Switch från 20 till 30.',
        hint: 'Öppna Gäst Access Switch och uppdatera VLAN ID-fältet till 30.',
      },
      {
        id: 't2',
        description: 'Ändra IP-adressen på Gäst Access Switch till 10.100.30.1.',
        hint: 'Uppdatera IP till 10.100.30.1 för att tillhöra det isolerade gästsubnätet.',
      },
    ],
    validateSolution: (nodes) => {
      const guestSw = nodes.find((n) => n.id === 'n_sw_guest');

      const vlanIs30 = guestSw?.vlanId === 30;
      const ipInSubnet30 = guestSw?.ip.startsWith('10.100.30.');

      const isSolved = Boolean(vlanIs30 && ipInSubnet30);

      return {
        isSolved,
        taskStatuses: {
          t1: Boolean(vlanIs30),
          t2: Boolean(ipInSubnet30),
        },
        message: isSolved
          ? 'VLAN-isolering genomförd! Gästnätverket är nu säkert avskilt i VLAN 30 och kan inte nå ledningens databas.'
          : 'Gästnätverket är fortfarande i VLAN 20 eller har fel IP. Ändra VLAN till 30 och IP till 10.100.30.1.',
      };
    },
  },
  {
    id: 'sc_10_zero_trust_ddos',
    title: '10. Zero-Trust DDoS & Hackar-Attack',
    category: 'Säkerhet',
    difficulty: 'expert',
    estimatedTime: '10-15 min',
    iconName: 'Zap',
    summary: 'Avvärj en pågående Brute-Force/DDoS-attack från en extern hackare och sanera smittade interna noder.',
    problemDescription: 'En fientlig hackarterminal (185.220.101.5) bombarderar företagets servrar med flödestrafik (Brute-Force Flood). Samtidigt har en trojan aktiverats på en nätverksskrivare i kontorsnätverket!',
    initialNodes: [
      {
        id: 'n_hacker',
        type: 'hacker',
        name: 'Ext. Hackarterminal (DDoS)',
        ip: '185.220.101.5',
        subnetMask: '255.255.255.0',
        gateway: '185.220.101.1',
        mac: '66:66:66:66:66:66',
        x: 100,
        y: 260,
        on: true,
        hackerAttackActive: true,
        hackerAttackIntensity: 'brute-force-flood',
        hackerTargetIp: '10.0.0.10',
      },
      {
        id: 'n_internet',
        type: 'internet',
        name: 'Publikt Internet',
        ip: '185.220.101.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:AA:BB:CC:DD:01',
        x: 300,
        y: 260,
        on: true,
      },
      {
        id: 'n_fw',
        type: 'firewall',
        name: 'NGFW Defense Firewall',
        ip: '185.220.101.2',
        subnetMask: '255.255.255.0',
        gateway: '185.220.101.1',
        mac: '00:AA:BB:CC:DD:02',
        x: 520,
        y: 260,
        on: true,
        firewallRules: [], // INGA SPÄRRAR!
      },
      {
        id: 'n_sw',
        type: 'switch',
        name: 'LAN Core Switch',
        ip: '10.0.0.1',
        subnetMask: '255.255.255.0',
        gateway: '185.220.101.2',
        mac: '00:AA:BB:CC:DD:03',
        x: 740,
        y: 260,
        on: true,
      },
      {
        id: 'n_server',
        type: 'server_web',
        name: 'Företagsportal Webbsystem',
        ip: '10.0.0.10',
        subnetMask: '255.255.255.0',
        gateway: '10.0.0.1',
        mac: '00:AA:BB:CC:DD:10',
        x: 960,
        y: 140,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_printer',
        type: 'client_printer',
        name: 'Trojan-Infekterad Skrivare',
        ip: '10.0.0.200',
        subnetMask: '255.255.255.0',
        gateway: '10.0.0.1',
        mac: '00:AA:BB:CC:DD:99',
        x: 960,
        y: 380,
        on: true,
        isInfected: true, // SMITTAD!
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_hacker', b: 'n_internet', type: 'serial', bandwidthMbps: 100, latencyMs: 25, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_internet', b: 'n_fw', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_fw', b: 'n_sw', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_sw', b: 'n_server', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l5', a: 'n_sw', b: 'n_printer', type: 'cat6', bandwidthMbps: 100, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Skapa en spärregel i NGFW Defense Firewall som helt BLOCKERAR hackarens IP-adress (185.220.101.5).',
        hint: 'Sätt Action = BLOCK, Source IP = 185.220.101.5, Dest IP = *.',
      },
      {
        id: 't2',
        description: 'Stäng av eller koppla ur den trojan-infekterade nätverksskrivaren.',
        hint: 'Klicka på den infekterade skrivaren och stäng av den eller ta bort dess kabel.',
      },
      {
        id: 't3',
        description: 'Stoppa hackar-attacken så att 100% av nätverket är säkert.',
        hint: 'Klicka på Hackarterminalen och inaktivera attacken eller blockera dess IP i brandväggen.',
      },
    ],
    validateSolution: (nodes, links) => {
      const fw = nodes.find((n) => n.id === 'n_fw');
      const printer = nodes.find((n) => n.id === 'n_printer');
      const rules = fw?.firewallRules || [];

      const blocksHacker = rules.some(
        (r) => r.action === 'block' && (r.sourceIp === '185.220.101.5' || r.sourceIp === '*')
      );
      const isPrinterOff = printer?.on === false;
      const isPrinterDisconnected = !links.some(
        (l) => l.a === 'n_printer' || l.b === 'n_printer'
      );
      const printerSecured = isPrinterOff || isPrinterDisconnected;

      const isSolved = blocksHacker && printerSecured;

      return {
        isSolved,
        taskStatuses: {
          t1: blocksHacker,
          t2: printerSecured,
          t3: isSolved,
        },
        message: isSolved
          ? 'EXPERT-SEGER! Hackarens attack är helt avvärjd via brandväggen och den infekterade skrivaren är avskuren. Nätverket är 100% säkert!'
          : 'Attacken pågår fortfarande eller skrivaren sprider smitta. Blockera 185.220.101.5 och stäng av den smittade skrivaren.',
      };
    },
  },
  {
    id: 'sc_11_bgp_hijack',
    title: '11. BGP Hijack & Autonomous System Kapning',
    category: 'Routing',
    difficulty: 'expert',
    estimatedTime: '8-12 min',
    iconName: 'Globe',
    summary: 'Ett skadligt Autonomous System (AS666) sänder ut en falsk BGP-prefixannonsering och kapar företagstrafiken.',
    problemDescription: 'Ett externt kriminellt nätverk (AS666 C2 Server) har etablerat en otillåten BGP-peeringlänk till kontorets Border Router och annonserar företagets IP-prefix (10.0.0.0/8). Detta gör att all känslig finansdata styrs om till hackarens server!',
    initialNodes: [
      {
        id: 'n_internet',
        type: 'internet',
        name: 'Tier-1 ISP / BGP Core',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:11:22:33:44:00',
        x: 120,
        y: 260,
        on: true,
      },
      {
        id: 'n_border_router',
        type: 'router',
        name: 'AS100 Border Router',
        ip: '198.51.100.2',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:11:22:33:44:01',
        x: 360,
        y: 260,
        on: true,
      },
      {
        id: 'n_dc_server',
        type: 'server_web',
        name: 'Företagets Äkta Datacenter',
        ip: '10.0.1.10',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.2',
        mac: '00:11:22:33:44:10',
        x: 620,
        y: 180,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_rogue_c2',
        type: 'hacker_c2',
        name: 'AS666 Rogue C2 Kapningsserver',
        ip: '185.220.101.5',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '66:66:66:66:66:66',
        x: 620,
        y: 380,
        on: true,
        hackerAttackActive: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_internet', b: 'n_border_router', type: 'fiber', bandwidthMbps: 10000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_border_router', b: 'n_dc_server', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_border_router', b: 'n_rogue_c2', type: 'serial', bandwidthMbps: 1000, latencyMs: 10, packetLossPercent: 0, duplex: 'full' }, // SKUGGLÄNK!
    ],
    tasks: [
      {
        id: 't1',
        description: 'Koppla ur eller ta bort den skadliga BGP-peeringlänken mellan AS100 Border Router och AS666 Rogue C2.',
        hint: 'Klicka på den seriella skugglänken som går till AS666 Rogue C2 och radera den.',
      },
      {
        id: 't2',
        description: 'Stäng av AS666 Rogue C2-servern.',
        hint: 'Klicka på AS666 Rogue C2-servern och stäng av strömmen (Power Off).',
      },
      {
        id: 't3',
        description: 'Säkerställ att företagets äkta Datacenter (10.0.1.10) är uppe och anslutet till Border Routern.',
        hint: 'Verifiera att länk och ström är igång på äkta Datacenter-servern.',
      },
    ],
    validateSolution: (nodes, links) => {
      const rogueC2 = nodes.find((n) => n.id === 'n_rogue_c2');
      const dcServer = nodes.find((n) => n.id === 'n_dc_server');

      const isRogueLinkRemoved = !links.some(
        (l) =>
          (l.a === 'n_rogue_c2' && l.b === 'n_border_router') ||
          (l.b === 'n_rogue_c2' && l.a === 'n_border_router')
      );
      const isRogueOff = rogueC2?.on === false || isRogueLinkRemoved;
      const isDcActive = Boolean(dcServer?.on && links.some((l) => l.a === 'n_dc_server' || l.b === 'n_dc_server'));

      const isSolved = isRogueLinkRemoved && isRogueOff && isDcActive;

      return {
        isSolved,
        taskStatuses: {
          t1: isRogueLinkRemoved,
          t2: isRogueOff,
          t3: isDcActive,
        },
        message: isSolved
          ? 'EXPERT-BGP SEGER! BGP Hijack-kapningen är neutraliserad och trafiken går nu uteslutande till det äkta datacentret!'
          : 'AS666-kapningen pågår fortfarande. Ta bort skugglänken och stäng av C2-servern.',
      };
    },
  },
  {
    id: 'sc_12_dmz_leakage',
    title: '12. Zero-Trust DMZ-Läckage & Microsegmentation',
    category: 'VLAN & Isolation',
    difficulty: 'hard',
    estimatedTime: '6-8 min',
    iconName: 'Layers',
    summary: 'En felaktig direktkabel bryter Zero-Trust-modellen genom att exponera HR Löne-databasen direkt mot publika DMZ-webbservern.',
    problemDescription: 'Enligt Zero-Trust-arkitektur får publika DMZ-webbservrar (10.10.0.5) ALDRIG ha en direkt anslutning till interna databaser (10.200.0.50). All kommunikation måste filtreras genom NGFW Defense Firewall.',
    initialNodes: [
      {
        id: 'n_internet',
        type: 'internet',
        name: 'Publikt Internet',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:AA:11:22:33:00',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_fw',
        type: 'firewall',
        name: 'NGFW Perimeter Firewall',
        ip: '10.10.0.1',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:AA:11:22:33:01',
        x: 320,
        y: 260,
        on: true,
        firewallRules: [],
      },
      {
        id: 'n_dmz_web',
        type: 'server_web',
        name: 'DMZ Public Web Server',
        ip: '10.10.0.5',
        subnetMask: '255.255.255.0',
        gateway: '10.10.0.1',
        mac: '00:AA:11:22:33:05',
        x: 550,
        y: 160,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_hr_db',
        type: 'server_db',
        name: 'Intern HR & Löne-DB (VLAN 20)',
        ip: '10.200.0.50',
        subnetMask: '255.255.255.0',
        gateway: '10.10.0.1',
        mac: '00:AA:11:22:33:50',
        x: 550,
        y: 380,
        on: true,
        services: { sql: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_internet', b: 'n_fw', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_fw', b: 'n_dmz_web', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_fw', b: 'n_hr_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_dmz_web', b: 'n_hr_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' }, // OTILLÅTEN DIREKTKABEL!
    ],
    tasks: [
      {
        id: 't1',
        description: 'Radera den otillåtna direktkabeln mellan DMZ Public Web Server och HR Löne-DB.',
        hint: 'Klicka på kabeln som ansluter webbservern direkt till databasen och radera den.',
      },
      {
        id: 't2',
        description: 'Säkerställ att både DMZ Web och HR DB har säkra kablar till NGFW Firewall.',
        hint: 'Verifiera att båda servrarna är anslutna till brandväggen för inspektion.',
      },
    ],
    validateSolution: (nodes, links) => {
      const isDirectLinkRemoved = !links.some(
        (l) =>
          (l.a === 'n_dmz_web' && l.b === 'n_hr_db') ||
          (l.b === 'n_dmz_web' && l.a === 'n_dmz_web')
      );
      const isWebConnectedToFw = links.some(
        (l) => (l.a === 'n_dmz_web' && l.b === 'n_fw') || (l.b === 'n_dmz_web' && l.a === 'n_fw')
      );
      const isDbConnectedToFw = links.some(
        (l) => (l.a === 'n_hr_db' && l.b === 'n_fw') || (l.b === 'n_hr_db' && l.a === 'n_fw')
      );

      const isSolved = isDirectLinkRemoved && isWebConnectedToFw && isDbConnectedToFw;

      return {
        isSolved,
        taskStatuses: {
          t1: isDirectLinkRemoved,
          t2: isWebConnectedToFw && isDbConnectedToFw,
        },
        message: isSolved
          ? 'ZERO-TRUST ISOLERING SLUTFÖRD! Läckaget mellan DMZ och HR-databasen är täppt och all mikrosegmenterad trafik inspekteras nu av brandväggen.'
          : 'Zero-Trust överträds fortfarande. Radera direktkabeln mellan servrarna och se till att båda går via brandväggen.',
      };
    },
  },
  {
    id: 'sc_13_scada_ot_airgap',
    title: '13. Industriell SCADA & OT-Nätverksisolering (Stuxnet Threat)',
    category: 'Säkerhet',
    difficulty: 'expert',
    estimatedTime: '8-10 min',
    iconName: 'Cpu',
    summary: 'Fabrikens industriella PLC-turbinstyrning har av misstag anslutits till ett osäkert Wi-Fi, vilket öppnar för elakartat sabotage.',
    problemDescription: 'Tillverkningslinjens kritiska PLC Turbinstyrdon (192.168.100.20) har kopplats till en opålitlig Wi-Fi-router. En extern hackar-pineapple försöker stjäla styrsignaler! Flytta PLC-enheten till Industrial OT Gateway / IDS Sensor.',
    initialNodes: [
      {
        id: 'n_wifi_guest',
        type: 'wifi_router',
        name: 'Gäst Wi-Fi Router (Osäker)',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:EE:FF:11:22:00',
        x: 200,
        y: 180,
        on: true,
      },
      {
        id: 'n_ot_gateway',
        type: 'ids_ips',
        name: 'Industrial OT Gateway & IDS Sensor',
        ip: '192.168.100.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.100.254',
        mac: '00:EE:FF:11:22:01',
        x: 520,
        y: 280,
        on: true,
      },
      {
        id: 'n_plc_turbine',
        type: 'iot_plc',
        name: 'PLC Turbinstyrdon (Kritisk OT)',
        ip: '192.168.100.20',
        subnetMask: '255.255.255.0',
        gateway: '192.168.100.1',
        mac: '00:EE:FF:11:22:20',
        x: 200,
        y: 380,
        on: true,
      },
      {
        id: 'n_hacker_pineapple',
        type: 'hacker_pineapple',
        name: 'Rogue Wi-Fi Pineapple Attack',
        ip: '192.168.1.250',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '66:77:88:99:00:11',
        x: 400,
        y: 120,
        on: true,
        hackerAttackActive: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_wifi_guest', b: 'n_plc_turbine', type: 'wifi', bandwidthMbps: 54, latencyMs: 10, packetLossPercent: 5, duplex: 'full' }, // OSÄKER WI-FI LÄNK!
      { id: 'l2', a: 'n_wifi_guest', b: 'n_hacker_pineapple', type: 'wifi', bandwidthMbps: 54, latencyMs: 5, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Koppla ur Wi-Fi-länken mellan osäkra Gäst Wi-Fi och PLC Turbinstyrdon.',
        hint: 'Radera den trådlösa Wi-Fi-kabeln från PLC Turbinstyrdonet.',
      },
      {
        id: 't2',
        description: 'Anslut PLC Turbinstyrdon med en skärmad Cat6-kabel till Industrial OT Gateway & IDS Sensor.',
        hint: 'Välj Kopparkabel Cat6 och anslut mellan PLC Turbinstyrdon och Industrial OT Gateway.',
      },
      {
        id: 't3',
        description: 'Stäng av den fientliga Rogue Wi-Fi Pineapple-enheten.',
        hint: 'Klicka på Rogue Wi-Fi Pineapple och stäng av den.',
      },
    ],
    validateSolution: (nodes, links) => {
      const pineapple = nodes.find((n) => n.id === 'n_hacker_pineapple');

      const isWifiLinkCut = !links.some(
        (l) =>
          (l.a === 'n_plc_turbine' && l.b === 'n_wifi_guest') ||
          (l.b === 'n_plc_turbine' && l.a === 'n_wifi_guest')
      );
      const isOtConnected = links.some(
        (l) =>
          (l.a === 'n_plc_turbine' && l.b === 'n_ot_gateway') ||
          (l.b === 'n_plc_turbine' && l.a === 'n_ot_gateway')
      );
      const isPineappleDisabled = pineapple?.on === false || !links.some((l) => l.a === 'n_hacker_pineapple' || l.b === 'n_hacker_pineapple');

      const isSolved = isWifiLinkCut && isOtConnected && isPineappleDisabled;

      return {
        isSolved,
        taskStatuses: {
          t1: isWifiLinkCut,
          t2: isOtConnected,
          t3: isPineappleDisabled,
        },
        message: isSolved
          ? 'SCADA AIR-GAP SEGER! Fabrikens PLC-turbinstyrning är nu helt avskuren från opålitliga Wi-Fi-nät och säkrad i OT-zonen!'
          : 'SCADA-styrsystemet är fortfarande exponerat. Koppla bort Wi-Fi, anslut PLC till Industrial OT Gateway och stäng av Pineapple.',
      };
    },
  },
  {
    id: 'sc_14_aws_hybrid_vpn',
    title: '14. AWS Hybrid Cloud IPsec VPN Tunnel Avbrott',
    category: 'DNS & Web',
    difficulty: 'medium',
    estimatedTime: '5-7 min',
    iconName: 'Cloud',
    summary: 'Den säkra IPsec VPN-tunneln till företagsmolnet i AWS har gått ner på grund av nätverkskonfigurationsfel.',
    problemDescription: 'Utvecklare kan inte nå företagsdatabasen i AWS Cloud (10.200.1.50). On-Prem VPN Gateway har fått en felaktig nätmask (255.255.0.0 istället för 255.255.255.0) och dess VPN-krypteringstjänst har avaktiverats.',
    initialNodes: [
      {
        id: 'n_aws_gateway',
        type: 'server_vpn',
        name: 'AWS Cloud Transit Gateway',
        ip: '10.200.0.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:CC:DD:EE:FF:01',
        x: 120,
        y: 260,
        on: true,
        services: { vpn: true },
      },
      {
        id: 'n_aws_db',
        type: 'server_db',
        name: 'AWS Cloud SQL Database',
        ip: '10.200.1.50',
        subnetMask: '255.255.255.0',
        gateway: '10.200.0.1',
        mac: '00:CC:DD:EE:FF:02',
        x: 340,
        y: 260,
        on: true,
        services: { sql: true },
      },
      {
        id: 'n_onprem_vpn',
        type: 'server_vpn',
        name: 'On-Prem IPsec VPN Gateway',
        ip: '192.168.1.100',
        subnetMask: '255.255.0.0', // FEL NÄTMASK!
        gateway: '192.168.1.1',
        mac: '00:CC:DD:EE:FF:10',
        x: 600,
        y: 260,
        on: true,
        services: { vpn: false }, // FEL: VPN TJÄNST AV!
      },
      {
        id: 'n_dev_laptop',
        type: 'client_laptop',
        name: 'Utvecklar Laptop',
        ip: '192.168.1.50',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.100',
        mac: '00:CC:DD:EE:FF:50',
        x: 820,
        y: 260,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_aws_gateway', b: 'n_aws_db', type: 'fiber', bandwidthMbps: 10000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_aws_gateway', b: 'n_onprem_vpn', type: 'fiber', bandwidthMbps: 1000, latencyMs: 15, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_onprem_vpn', b: 'n_dev_laptop', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Ändra Subnet Mask på On-Prem IPsec VPN Gateway till 255.255.255.0.',
        hint: 'Klicka på On-Prem VPN Gateway och ändra Nätmask från 255.255.0.0 till 255.255.255.0.',
      },
      {
        id: 't2',
        description: 'Aktivera VPN-tjänsten på On-Prem IPsec VPN Gateway.',
        hint: 'Öppna On-Prem VPN Gateway och bocka för "VPN Service" under Aktiva Tjänster.',
      },
    ],
    validateSolution: (nodes) => {
      const vpnGateway = nodes.find((n) => n.id === 'n_onprem_vpn');

      const isSubnetCorrect = vpnGateway?.subnetMask === '255.255.255.0';
      const isVpnServiceActive = Boolean(vpnGateway?.services?.vpn);

      const isSolved = isSubnetCorrect && isVpnServiceActive;

      return {
        isSolved,
        taskStatuses: {
          t1: isSubnetCorrect,
          t2: isVpnServiceActive,
        },
        message: isSolved
          ? 'AWS IPSEC HYBRID TUNNEL ÅTERSTÄLLD! VPN-tunneln krypteras nu korrekt och utvecklarna kan sömlöst nå molndatabasen.'
          : 'VPN-tunneln är fortfarande nere. Kontrollera att nätmasken är 255.255.255.0 och att VPN-tjänsten är påslagen.',
      };
    },
  },
  {
    id: 'sc_15_rogue_wifi_pineapple',
    title: '15. Rogue AP & Evil Twin Pineapple Neutralisering',
    category: 'Säkerhet',
    difficulty: 'hard',
    estimatedTime: '6-8 min',
    iconName: 'Radio',
    summary: 'En angripare har placerat en skadlig Wi-Fi Pineapple i fikautrymmet som avlyssnar och kapar anställdas lösenord.',
    problemDescription: 'Säkerhetsvarningar visar att anställdas mobiler och laptops kopplar upp sig mot en otillåten Wi-Fi Pineapple (192.168.1.222) istället för kontorets säkra Wi-Fi Router. Inaktivera den skadliga enheten och säkra kontorsnätet.',
    initialNodes: [
      {
        id: 'n_legit_wifi',
        type: 'wifi_router',
        name: 'Säker Kontors Wi-Fi (WPA3)',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:11:22:33:44:00',
        x: 220,
        y: 200,
        on: true,
      },
      {
        id: 'n_evil_pineapple',
        type: 'hacker_pineapple',
        name: 'Rogue Evil Twin Pineapple',
        ip: '192.168.1.222',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '66:66:66:11:22:33',
        x: 520,
        y: 200,
        on: true,
        hackerAttackActive: true,
      },
      {
        id: 'n_staff_mobile',
        type: 'client_mobile',
        name: 'Anställds Mobil (Kapad)',
        ip: '192.168.1.105',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.222', // KAPAD GATEWAY!
        mac: '00:11:22:33:44:55',
        x: 370,
        y: 380,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_evil_pineapple', b: 'n_staff_mobile', type: 'wifi', bandwidthMbps: 54, latencyMs: 5, packetLossPercent: 0, duplex: 'full' }, // KAPAD LÄNK!
      { id: 'l2', a: 'n_legit_wifi', b: 'n_evil_pineapple', type: 'wifi', bandwidthMbps: 54, latencyMs: 5, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Stäng av den skadliga Rogue Evil Twin Pineapple-enheten.',
        hint: 'Klicka på Rogue Evil Twin Pineapple och stäng av strömmen (Power Off).',
      },
      {
        id: 't2',
        description: 'Anslut Anställds Mobil till Säker Kontors Wi-Fi.',
        hint: 'Skapa en Wi-Fi-länk mellan Anställds Mobil och Säker Kontors Wi-Fi.',
      },
      {
        id: 't3',
        description: 'Ändra Gateway på Anställds Mobil till 192.168.1.1.',
        hint: 'Uppdatera Gateway på mobilen till 192.168.1.1 så att den inte pekar på hackarens IP.',
      },
    ],
    validateSolution: (nodes, links) => {
      const pineapple = nodes.find((n) => n.id === 'n_evil_pineapple');
      const mobile = nodes.find((n) => n.id === 'n_staff_mobile');

      const isPineappleOff = pineapple?.on === false || !links.some((l) => l.a === 'n_evil_pineapple' || l.b === 'n_evil_pineapple');
      const isMobileConnectedToLegit = links.some(
        (l) =>
          (l.a === 'n_staff_mobile' && l.b === 'n_legit_wifi') ||
          (l.b === 'n_staff_mobile' && l.a === 'n_legit_wifi')
      );
      const isGatewayCorrect = mobile?.gateway === '192.168.1.1';

      const isSolved = isPineappleOff && isMobileConnectedToLegit && isGatewayCorrect;

      return {
        isSolved,
        taskStatuses: {
          t1: isPineappleOff,
          t2: isMobileConnectedToLegit,
          t3: isGatewayCorrect,
        },
        message: isSolved
          ? 'ROGUE AP NEUTRALISERAD! Den falska Wi-Fi Pineapplen har stängts av och de anställdas enheter är nu säkert krypterade via kontorets officiella Wi-Fi-router!'
          : 'Angreppet pågår fortfarande. Stäng av Rogue Pineapple, anslut mobilen till Säker Wi-Fi och sätt Gateway till 192.168.1.1.',
      };
    },
  },
  {
    id: 'sc_16_subnet_mismatch',
    title: '16. Subnätmask-Missen i Fabriks-LAN',
    category: 'DHCP & IP',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    iconName: 'Layers',
    summary: 'En nyinstallerad robotarm i fabriken kan inte kommunicera med styrdatorn på grund av felaktig subnätmask.',
    problemDescription: 'Under driftsättning av monteringslinjen upptäcktes att Fabriksrobot CNC-1 inte kan ta emot styrkommandon från Operatörsdatorn (192.168.1.20). Roboten har tilldelats IP 192.168.1.180 men masken ställdes felaktigt in på 255.255.255.128 (/25), vilket gör att den tror att operatörsdatorn ligger på ett annat subnät. Båda enheterna är anslutna till Fabriks-Switchen.',
    initialNodes: [
      {
        id: 'n_sw_factory',
        type: 'switch',
        name: 'Fabriks-Switch L2',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:11:22:33:88:01',
        x: 340,
        y: 260,
        on: true,
      },
      {
        id: 'n_operator_pc',
        type: 'client_pc',
        name: 'Operatörsdator Fabrik',
        ip: '192.168.1.20',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:11:22:33:88:20',
        x: 600,
        y: 160,
        on: true,
      },
      {
        id: 'n_robot_cnc',
        type: 'iot_plc',
        name: 'Fabriksrobot CNC-1',
        ip: '192.168.1.180',
        subnetMask: '255.255.255.128', // FEL MASK (/25 istället för /24)
        gateway: '192.168.1.1',
        mac: '00:11:22:33:88:30',
        x: 600,
        y: 360,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_sw_factory', b: 'n_operator_pc', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw_factory', b: 'n_robot_cnc', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Korrigera subnätmasken på "Fabriksrobot CNC-1" till 255.255.255.0.',
        hint: 'Klicka på Fabriksrobot CNC-1 och ändra nätmasken i IP-konfigurationen till 255.255.255.0.',
      },
      {
        id: 't2',
        description: 'Säkerställ att Gateway är inställd på 192.168.1.1 på Fabriksrobot CNC-1.',
        hint: 'Kontrollera att Gateway-fältet på roboten innehåller 192.168.1.1.',
      },
      {
        id: 't3',
        description: 'Säkerställ att roboten och operatörsdatorn båda är påslagna.',
        hint: 'Kontrollera att båda enheterna har grön status och att strömmen är på.',
      },
    ],
    validateSolution: (nodes) => {
      const robot = nodes.find((n) => n.id === 'n_robot_cnc');
      const opPc = nodes.find((n) => n.id === 'n_operator_pc');

      const isMaskCorrect = robot?.subnetMask === '255.255.255.0';
      const isGatewayCorrect = robot?.gateway === '192.168.1.1';
      const isBothPowered = robot?.on !== false && opPc?.on !== false;

      const isSolved = isMaskCorrect && isGatewayCorrect && isBothPowered;

      return {
        isSolved,
        taskStatuses: {
          t1: isMaskCorrect,
          t2: isGatewayCorrect,
          t3: isBothPowered,
        },
        message: isSolved
          ? 'FABRIKSNÄTVERK ÅTERSTÄLLT! Subnätmasken är nu synkroniserad till /24 (255.255.255.0) och CNC-roboten kan ta emot telemetri och styrsignaler från operatörsdatorn!'
          : 'Roboten kan fortfarande inte kommunicera. Ändra subnätmasken till 255.255.255.0 och gateway till 192.168.1.1.',
      };
    },
  },
  {
    id: 'sc_17_dns_phishing_poison',
    title: '17. DNS Spoofing & Phishing-Skydd',
    category: 'DNS & Web',
    difficulty: 'medium',
    estimatedTime: '5-7 min',
    iconName: 'Globe',
    summary: 'En manipulerad DNS-post lurar anställda till en falsk inloggningsportal vid besök på portal.foretag.se.',
    problemDescription: 'SOC-teamet har larmat om att anställda som surfar till "portal.foretag.se" hamnar på en falsk phishing-sida (198.51.100.99). Företagets interna DNS-server har komprometterats och A-posten pekar mot angriparens server istället för den legitima Autentiseringsportalen (192.168.10.25). Rätta till DNS-tabellen och säkra webbtjänsten.',
    initialNodes: [
      {
        id: 'n_sw_core',
        type: 'switch',
        name: 'Core Switch',
        ip: '192.168.10.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:44:55:66:77:01',
        x: 320,
        y: 260,
        on: true,
      },
      {
        id: 'n_dns_server',
        type: 'server_dns',
        name: 'Företagets Primära DNS',
        ip: '192.168.10.53',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:44:55:66:77:11',
        x: 580,
        y: 140,
        on: true,
        dnsRecords: [
          { id: '1', hostname: 'portal.foretag.se', ip: '198.51.100.99', type: 'A' }, // SPOOFAD POST!
        ],
        services: { dns: true },
      },
      {
        id: 'n_auth_portal',
        type: 'server_web',
        name: 'Säker Autentiseringsportal',
        ip: '192.168.10.25',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:44:55:66:77:25',
        x: 580,
        y: 380,
        on: true,
        services: { http: true },
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_sw_core', b: 'n_dns_server', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw_core', b: 'n_auth_portal', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Öppna DNS-posterna på "Företagets Primära DNS" och ändra A-posten för "portal.foretag.se" till 192.168.10.25.',
        hint: 'Klicka på DNS-servern, hitta posten för portal.foretag.se och ändra IP-adressen till den legitima servern 192.168.10.25.',
      },
      {
        id: 't2',
        description: 'Ta bort eventuella kvarvarande referenser till den skadliga IP-adressen 198.51.100.99.',
        hint: 'Säkerställ att ingen DNS-post pekar på 198.51.100.99.',
      },
      {
        id: 't3',
        description: 'Verifiera att Säker Autentiseringsportal är aktiv med HTTP-tjänst aktiverad.',
        hint: 'Se till att Autentiseringsportalen är påslagen och att HTTP-webbtjänsten är igång.',
      },
    ],
    validateSolution: (nodes) => {
      const dns = nodes.find((n) => n.id === 'n_dns_server');
      const auth = nodes.find((n) => n.id === 'n_auth_portal');
      const records = dns?.dnsRecords || [];

      const pointsToLegit = records.some(
        (r) =>
          r.type === 'A' &&
          (r.hostname.toLowerCase() === 'portal.foretag.se' || r.hostname.toLowerCase() === 'portal') &&
          r.ip === '192.168.10.25'
      );
      const hasSpoofedIp = records.some((r) => r.ip === '198.51.100.99');
      const isAuthActive = auth?.on !== false && Boolean(auth?.services?.http);

      const isSolved = pointsToLegit && !hasSpoofedIp && isAuthActive;

      return {
        isSolved,
        taskStatuses: {
          t1: pointsToLegit,
          t2: !hasSpoofedIp,
          t3: isAuthActive,
        },
        message: isSolved
          ? 'DNS-CACHE OCH POSTER RENSADE! portal.foretag.se pekar nu säkert mot 192.168.10.25 och alla inloggningsförsök skyddas mot nätfiske!'
          : 'DNS-tabellen innehåller fortfarande fel eller pekar mot fel IP. Sätt A-posten till 192.168.10.25 och ta bort 198.51.100.99.',
      };
    },
  },
  {
    id: 'sc_18_stp_broadcast_storm',
    title: '18. Switching-Loop & Broadcast Storm',
    category: 'Felsökning',
    difficulty: 'medium',
    estimatedTime: '6-8 min',
    iconName: 'Zap',
    summary: 'En felkopplad kabel mellan två access-switchar har skapat en nätverksloop som orsakar 100% paketförlust.',
    problemDescription: 'En tekniker råkade koppla en patchkabel mellan Access Switch A och Access Switch B. Eftersom båda redan är anslutna till Distributionsswitchen har en switching-loop uppstått. Detta har utlöst en broadcast storm med maximal paketförlust som paralyserat båda kontorsdatorerna.',
    initialNodes: [
      {
        id: 'n_sw_dist',
        type: 'l3_switch',
        name: 'Distributions Switch L3',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:33:44:55:66:01',
        x: 320,
        y: 260,
        on: true,
      },
      {
        id: 'n_sw_a',
        type: 'switch',
        name: 'Access Switch A (Våning 1)',
        ip: '192.168.1.2',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:33:44:55:66:02',
        x: 560,
        y: 150,
        on: true,
      },
      {
        id: 'n_sw_b',
        type: 'switch',
        name: 'Access Switch B (Våning 2)',
        ip: '192.168.1.3',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:33:44:55:66:03',
        x: 560,
        y: 370,
        on: true,
      },
      {
        id: 'n_pc_a',
        type: 'client_pc',
        name: 'Kontorsdator 1 (Vån 1)',
        ip: '192.168.1.101',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:33:44:55:66:11',
        x: 780,
        y: 150,
        on: true,
      },
      {
        id: 'n_pc_b',
        type: 'client_pc',
        name: 'Kontorsdator 2 (Vån 2)',
        ip: '192.168.1.102',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:33:44:55:66:12',
        x: 780,
        y: 370,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_sw_dist', b: 'n_sw_a', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 95, duplex: 'full' },
      { id: 'l2', a: 'n_sw_dist', b: 'n_sw_b', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 95, duplex: 'full' },
      { id: 'l_loop', a: 'n_sw_a', b: 'n_sw_b', type: 'cat6', bandwidthMbps: 1000, latencyMs: 80, packetLossPercent: 100, duplex: 'full' }, // SKADLIG LOOP-LÄNK!
      { id: 'l4', a: 'n_sw_a', b: 'n_pc_a', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 90, duplex: 'full' },
      { id: 'l5', a: 'n_sw_b', b: 'n_pc_b', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 90, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Ta bort den loopande kabeln mellan Access Switch A och Access Switch B.',
        hint: 'Klicka på länken mellan Switch A och Switch B och klicka på "Ta bort länk" (Delete Link).',
      },
      {
        id: 't2',
        description: 'Återställ paketförlusten till 0% på länkarna mellan Distributionsswitchen och access-switcharna.',
        hint: 'Klicka på länkarna och sätt Packet Loss (%) till 0 i länk-inspektören.',
      },
      {
        id: 't3',
        description: 'Säkerställ att Kontorsdator 1 och 2 båda når Distributions Switch utan paketförlust.',
        hint: 'Se till att länkarna till PC-datorerna har 0% paketförlust och att switcharna är anslutna.',
      },
    ],
    validateSolution: (nodes, links) => {
      const hasLoopLink = links.some(
        (l) => (l.a === 'n_sw_a' && l.b === 'n_sw_b') || (l.a === 'n_sw_b' && l.b === 'n_sw_a')
      );
      const isSwitchAConnected = links.some(
        (l) => (l.a === 'n_sw_dist' && l.b === 'n_sw_a') || (l.a === 'n_sw_a' && l.b === 'n_sw_dist')
      );
      const isSwitchBConnected = links.some(
        (l) => (l.a === 'n_sw_dist' && l.b === 'n_sw_b') || (l.a === 'n_sw_b' && l.b === 'n_sw_dist')
      );
      const allLossClean = links.every((l) => (l.packetLossPercent || 0) === 0);

      const task1Done = !hasLoopLink;
      const task2Done = allLossClean;
      const task3Done = isSwitchAConnected && isSwitchBConnected && allLossClean;

      const isSolved = task1Done && task2Done && task3Done;

      return {
        isSolved,
        taskStatuses: {
          t1: task1Done,
          t2: task2Done,
          t3: task3Done,
        },
        message: isSolved
          ? 'BROADCAST STORM HÄVD! Nätverksloopen har avlägsnats, paketförlusten är 0% och kontorsnätet har återfått blixtsnabb genomströmning!'
          : 'Nätverket har fortfarande problem. Ta bort länken mellan Switch A och B samt kontrollera att länkarnas paketförlust är 0%.',
      };
    },
  },
  {
    id: 'sc_19_iot_vlan_quarantine',
    title: '19. IoT Karantän & Säker VLAN-Segregering',
    category: 'VLAN & Isolation',
    difficulty: 'medium',
    estimatedTime: '6-8 min',
    iconName: 'Radio',
    summary: 'Smarta övervakningskameror och IoT-sensorer måste isoleras på ett separat IoT-VLAN (VLAN 50) för att skydda databasen.',
    problemDescription: 'En penetrationstestare upptäckte att smarta övervakningskameror och IoT-sensorer delar samma VLAN (VLAN 10) som den interna SQL Databasservern (192.168.10.50). Flytta IoT-switchen till VLAN 50 och skapa en brandväggsregel i NGFW som blockerar all IoT-trafik från att nå databasservern.',
    initialNodes: [
      {
        id: 'n_fw_ngfw',
        type: 'firewall',
        name: 'Enterprise NGFW',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:88:99:AA:BB:01',
        x: 200,
        y: 260,
        on: true,
        firewallRules: [], // INGA BRANDVÄGGSREGLER ÄNNU!
      },
      {
        id: 'n_sw_db',
        type: 'switch',
        name: 'Databas Switch (VLAN 10)',
        ip: '192.168.10.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:88:99:AA:BB:10',
        x: 460,
        y: 150,
        on: true,
        vlanId: 10,
      },
      {
        id: 'n_sw_iot',
        type: 'switch',
        name: 'IoT Kameraswitch',
        ip: '192.168.10.2', // FEL VLAN (Ligger på VLAN 10)!
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        mac: '00:88:99:AA:BB:50',
        x: 460,
        y: 370,
        on: true,
        vlanId: 10, // FELAKTIGT VLAN 10
      },
      {
        id: 'n_db_server',
        type: 'server_db',
        name: 'Känslig Kunddatabas SQL',
        ip: '192.168.10.50',
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        mac: '00:88:99:AA:BB:55',
        x: 720,
        y: 150,
        on: true,
      },
      {
        id: 'n_camera_iot',
        type: 'iot_camera',
        name: 'Smart IP Kamera Entré',
        ip: '192.168.50.21',
        subnetMask: '255.255.255.0',
        gateway: '192.168.50.1',
        mac: '00:88:99:AA:BB:77',
        x: 720,
        y: 370,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_fw_ngfw', b: 'n_sw_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_fw_ngfw', b: 'n_sw_iot', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_sw_db', b: 'n_db_server', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_sw_iot', b: 'n_camera_iot', type: 'cat6', bandwidthMbps: 100, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Ändra VLAN på "IoT Kameraswitch" till VLAN 50.',
        hint: 'Klicka på IoT Kameraswitch och ändra VLAN ID till 50 i enhetsinställningarna.',
      },
      {
        id: 't2',
        description: 'Skapa en brandväggsregel på Enterprise NGFW som blockerar ("block") trafik till destination 192.168.10.50.',
        hint: 'Klicka på Enterprise NGFW, lägg till en regel: Action: Block, Dest IP: 192.168.10.50 (eller port 5432/3306).',
      },
      {
        id: 't3',
        description: 'Säkerställ att Känslig Kunddatabas SQL är online och skyddad.',
        hint: 'Kontrollera att databasservern är påslagen och ansluten till Databas Switchen.',
      },
    ],
    validateSolution: (nodes) => {
      const iotSw = nodes.find((n) => n.id === 'n_sw_iot');
      const fw = nodes.find((n) => n.id === 'n_fw_ngfw');
      const db = nodes.find((n) => n.id === 'n_db_server');

      const isVlan50 = iotSw?.vlanId === 50;
      const hasBlockRule = Boolean(
        fw?.firewallRules?.some(
          (r) =>
            r.action === 'block' &&
            (r.destIp === '192.168.10.50' || r.destIp === '192.168.10.*' || r.destIp === '*' || r.protocol === 'MALWARE')
        )
      );
      const isDbOnline = db?.on !== false;

      const isSolved = isVlan50 && hasBlockRule && isDbOnline;

      return {
        isSolved,
        taskStatuses: {
          t1: isVlan50,
          t2: hasBlockRule,
          t3: isDbOnline,
        },
        message: isSolved
          ? 'IOT-KARANTÄN AKTIVERAD! IoT-kamerorna är nu isolerade på VLAN 50 och brandväggen stoppar all obehörig trafik mot SQL-databasen!'
          : 'IoT-enheterna är inte säkrade ännu. Ändra IoT-switchens VLAN till 50 och skapa en block-regel mot databasen i brandväggen.',
      };
    },
  },
  {
    id: 'sc_20_ransomware_containment',
    title: '20. Ransomware Lateral Movement & Honeypot',
    category: 'Säkerhet',
    difficulty: 'hard',
    estimatedTime: '8-10 min',
    iconName: 'Skull',
    summary: 'En infekterad dator försöker sprida ransomware via SMB (port 445). Isolera hotet och säkra backuperna.',
    problemDescription: 'En användare på säljavdelningen öppnade en skadlig bilaga och infekterades med Ransomware. Skadlig kod försöker nu sprida sig över port 445 till företagets Backup NAS (192.168.20.100). Du måste omedelbart stänga av eller koppla ur den infekterade datorn, konfigurera brandväggen att blockera skadlig kod, och säkerställa att Backup NAS förblir skyddad.',
    initialNodes: [
      {
        id: 'n_fw_core',
        type: 'firewall',
        name: 'Next-Gen Perimeter Firewall',
        ip: '192.168.20.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:99:AA:BB:CC:01',
        x: 220,
        y: 260,
        on: true,
        firewallRules: [],
      },
      {
        id: 'n_sw_office',
        type: 'switch',
        name: 'Kontor Access Switch',
        ip: '192.168.20.2',
        subnetMask: '255.255.255.0',
        gateway: '192.168.20.1',
        mac: '00:99:AA:BB:CC:02',
        x: 460,
        y: 260,
        on: true,
      },
      {
        id: 'n_pc_clean',
        type: 'client_pc',
        name: 'Ekonomi PC 1 (Ren)',
        ip: '192.168.20.11',
        subnetMask: '255.255.255.0',
        gateway: '192.168.20.1',
        mac: '00:99:AA:BB:CC:11',
        x: 700,
        y: 120,
        on: true,
      },
      {
        id: 'n_pc_infected',
        type: 'client_pc',
        name: 'Sälj PC 2 (INFEKTERAD)',
        ip: '192.168.20.12',
        subnetMask: '255.255.255.0',
        gateway: '192.168.20.1',
        mac: '00:99:AA:BB:CC:12',
        x: 700,
        y: 260,
        on: true,
        isInfected: true, // INFEKTERAD MED RANSOMWARE!
      },
      {
        id: 'n_nas_backup',
        type: 'server_nas',
        name: 'Företags Backup NAS',
        ip: '192.168.20.100',
        subnetMask: '255.255.255.0',
        gateway: '192.168.20.1',
        mac: '00:99:AA:BB:CC:99',
        x: 700,
        y: 400,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_fw_core', b: 'n_sw_office', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw_office', b: 'n_pc_clean', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_sw_office', b: 'n_pc_infected', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_sw_office', b: 'n_nas_backup', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Isolera "Sälj PC 2 (INFEKTERAD)" genom att stänga av strömmen eller ta bort länken.',
        hint: 'Klicka på Sälj PC 2 och stäng av strömbrytaren (Power Off) eller ta bort dess kabel till switchen.',
      },
      {
        id: 't2',
        description: 'Lägg till en brandväggsregel i Next-Gen Perimeter Firewall som blockerar ("block") protokollet "MALWARE" eller destination 192.168.20.100.',
        hint: 'Öppna brandväggen och skapa en regel med Action: Block och Protocol: MALWARE (eller Destination IP: 192.168.20.100).',
      },
      {
        id: 't3',
        description: 'Säkerställ att Företags Backup NAS och Ekonomi PC 1 förblir online och anslutna.',
        hint: 'Kontrollera att backup-servern och den rena PC:n har grön ström och är anslutna till switchen.',
      },
    ],
    validateSolution: (nodes, links) => {
      const infected = nodes.find((n) => n.id === 'n_pc_infected');
      const fw = nodes.find((n) => n.id === 'n_fw_core');
      const nas = nodes.find((n) => n.id === 'n_nas_backup');
      const clean = nodes.find((n) => n.id === 'n_pc_clean');

      const isInfectedIsolated =
        infected?.on === false ||
        !links.some((l) => l.a === 'n_pc_infected' || l.b === 'n_pc_infected');

      const hasFirewallBlock = Boolean(
        fw?.firewallRules?.some(
          (r) =>
            r.action === 'block' &&
            (r.protocol === 'MALWARE' || r.destIp === '192.168.20.100' || r.port === 445)
        )
      );

      const isNasSafeAndUp = nas?.on !== false && clean?.on !== false;

      const isSolved = isInfectedIsolated && hasFirewallBlock && isNasSafeAndUp;

      return {
        isSolved,
        taskStatuses: {
          t1: isInfectedIsolated,
          t2: hasFirewallBlock,
          t3: isNasSafeAndUp,
        },
        message: isSolved
          ? 'RANSOMWARE NEUTRALISERAT! Den infekterade klienten har isolerats och brandväggen skyddar backup-servern från kryptering och dataläckage!'
          : 'Hotet är inte avvärjt. Stäng av den infekterade datorn och konfigurera en block-regel för skadlig kod i brandväggen.',
      };
    },
  },
  {
    id: 'sc_21_sdwan_ospf_failover',
    title: '21. Multi-Site SD-WAN & OSPF Route Failover',
    category: 'Routing',
    difficulty: 'hard',
    estimatedTime: '8-12 min',
    iconName: 'Cloud',
    summary: 'Primär fiberlänk mellan Göteborg och Stockholm har grävts av. Konfigurera backup-routing via Malmö-noden.',
    problemDescription: 'Ett fiberavbrott har brutit den direkta linjen mellan Göteborgskontoret och Stockholm HQ. Göteborgsfilialen har förlorat kontakt med det centrala ERP-systemet (10.0.10.50). Upprätta en backup-länk mellan Göteborg och Malmö Backup Router och uppdatera Göteborgs Gateway till 10.0.2.1.',
    initialNodes: [
      {
        id: 'n_r_goteborg',
        type: 'router',
        name: 'Göteborg Edge Router',
        ip: '10.0.2.5',
        subnetMask: '255.255.255.0',
        gateway: '10.0.1.1', // FÖRÄLDRAD GATEWAY TILL BRUTEN LÄNK!
        mac: '00:55:66:77:88:01',
        x: 180,
        y: 180,
        on: true,
      },
      {
        id: 'n_r_malmo',
        type: 'router',
        name: 'Malmö Backup Router',
        ip: '10.0.2.1',
        subnetMask: '255.255.255.0',
        gateway: '10.0.3.1',
        mac: '00:55:66:77:88:02',
        x: 420,
        y: 380,
        on: true,
      },
      {
        id: 'n_r_stockholm',
        type: 'router',
        name: 'Stockholm HQ Router',
        ip: '10.0.3.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:55:66:77:88:03',
        x: 660,
        y: 180,
        on: true,
      },
      {
        id: 'n_srv_erp',
        type: 'server_db',
        name: 'Centrallager ERP Server',
        ip: '10.0.10.50',
        subnetMask: '255.255.255.0',
        gateway: '10.0.3.1',
        mac: '00:55:66:77:88:50',
        x: 880,
        y: 180,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l_malmo_sthlm', a: 'n_r_malmo', b: 'n_r_stockholm', type: 'fiber', bandwidthMbps: 1000, latencyMs: 4, packetLossPercent: 0, duplex: 'full' },
      { id: 'l_sthlm_erp', a: 'n_r_stockholm', b: 'n_srv_erp', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      // SAKNAR LÄNK mellan n_r_goteborg och n_r_malmo!
    ],
    tasks: [
      {
        id: 't1',
        description: 'Dra en Cat6- eller Fiber-länk mellan "Göteborg Edge Router" och "Malmö Backup Router".',
        hint: 'Välj kabelverktyget och anslut Göteborg Edge Router till Malmö Backup Router.',
      },
      {
        id: 't2',
        description: 'Uppdatera Gateway på "Göteborg Edge Router" till 10.0.2.1.',
        hint: 'Klicka på Göteborgsroutern och ändra Gateway-adressen till Malmö-routerns IP (10.0.2.1).',
      },
      {
        id: 't3',
        description: 'Säkerställ att alla tre routrar samt Centrallager ERP Server är online.',
        hint: 'Kontrollera att alla routrar och servern har strömmen påslagen.',
      },
    ],
    validateSolution: (nodes, links) => {
      const gbg = nodes.find((n) => n.id === 'n_r_goteborg');
      const malmo = nodes.find((n) => n.id === 'n_r_malmo');
      const sthlm = nodes.find((n) => n.id === 'n_r_stockholm');
      const erp = nodes.find((n) => n.id === 'n_srv_erp');

      const hasGbgMalmoLink = links.some(
        (l) =>
          (l.a === 'n_r_goteborg' && l.b === 'n_r_malmo') ||
          (l.a === 'n_r_malmo' && l.b === 'n_r_goteborg')
      );

      const isGatewayUpdated = gbg?.gateway === '10.0.2.1';
      const isAllOnline =
        gbg?.on !== false && malmo?.on !== false && sthlm?.on !== false && erp?.on !== false;

      const isSolved = hasGbgMalmoLink && isGatewayUpdated && isAllOnline;

      return {
        isSolved,
        taskStatuses: {
          t1: hasGbgMalmoLink,
          t2: isGatewayUpdated,
          t3: isAllOnline,
        },
        message: isSolved
          ? 'SD-WAN FAILOVER AKTIVERAD! Trafiken från Göteborg dirigeras nu sömlöst via Malmö till Stockholm HQ och ERP-systemet!'
          : 'Failover är inte komplett. Anslut kabeln mellan Göteborg och Malmö samt sätt Gateway på Göteborg till 10.0.2.1.',
      };
    },
  },
  {
    id: 'sc_22_zerotrust_api_ingress',
    title: '22. Zero-Trust Kubernetes API Gateway & WAF',
    category: 'Säkerhet',
    difficulty: 'expert',
    estimatedTime: '10-15 min',
    iconName: 'Lock',
    summary: 'Ett mikrotjänst-kluster exponeras direkt mot internet. Säkra arkitekturen med API Gateway, TLS och WAF.',
    problemDescription: 'I ett nytt Kubernetes-kluster är både Betalningsdatabasen (172.16.0.88) och Auth Pods direkt anslutna mot WAN utan Web Application Firewall (WAF) eller API-gateway. All publik trafik måste tvingas genom Ingress Gateway (172.16.0.10) på port 443/HTTPS, och direkt WAN-åtkomst till databasen måste blockeras med en strikt brandväggsregel.',
    initialNodes: [
      {
        id: 'n_wan_inet',
        type: 'internet',
        name: 'Publikt Internet (WAN)',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:AA:BB:CC:DD:01',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_fw_waf',
        type: 'firewall',
        name: 'WAF & Zero-Trust NGFW',
        ip: '198.51.100.2',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:AA:BB:CC:DD:02',
        x: 300,
        y: 260,
        on: true,
        firewallRules: [], // SAKNAR WAF-REGLER!
      },
      {
        id: 'n_k8s_ingress',
        type: 'server_web',
        name: 'K8s Ingress API Gateway',
        ip: '172.16.0.10',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.2',
        mac: '00:AA:BB:CC:DD:10',
        x: 540,
        y: 160,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_k8s_db',
        type: 'server_db',
        name: 'Betalningsdatabas SQL (K8s)',
        ip: '172.16.0.88',
        subnetMask: '255.255.255.0',
        gateway: '172.16.0.10',
        mac: '00:AA:BB:CC:DD:88',
        x: 780,
        y: 160,
        on: true,
      },
      {
        id: 'n_client_shopper',
        type: 'client_mobile',
        name: 'Slutanvändare Mobil App',
        ip: '198.51.100.55',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:AA:BB:CC:DD:55',
        x: 100,
        y: 420,
        on: true,
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_wan_inet', b: 'n_fw_waf', type: 'fiber', bandwidthMbps: 1000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_fw_waf', b: 'n_k8s_ingress', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_k8s_ingress', b: 'n_k8s_db', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l4', a: 'n_wan_inet', b: 'n_client_shopper', type: 'wifi', bandwidthMbps: 300, latencyMs: 5, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Konfigurera WAF/NGFW med en regel som tillåter ("allow") HTTP/HTTPS-trafik till Ingress Gateway (172.16.0.10).',
        hint: 'Öppna WAF/NGFW och lägg till: Action: Allow, Dest IP: 172.16.0.10, Protocol: HTTP (eller port 80/443).',
      },
      {
        id: 't2',
        description: 'Lägg till en regel i brandväggen som blockerar ("block") direkt trafik till Databasen (172.16.0.88).',
        hint: 'Skapa en regel: Action: Block, Dest IP: 172.16.0.88 i WAF/NGFW.',
      },
      {
        id: 't3',
        description: 'Säkerställ att K8s Ingress API Gateway och Betalningsdatabas SQL båda är online.',
        hint: 'Verifiera att noderna är påslagna med aktiva webbtjänster på API Gateway.',
      },
    ],
    validateSolution: (nodes) => {
      const fw = nodes.find((n) => n.id === 'n_fw_waf');
      const ingress = nodes.find((n) => n.id === 'n_k8s_ingress');
      const db = nodes.find((n) => n.id === 'n_k8s_db');

      const rules = fw?.firewallRules || [];
      const hasAllowIngress = rules.some(
        (r) =>
          r.action === 'allow' &&
          (r.destIp === '172.16.0.10' || r.destIp === '*' || r.protocol === 'HTTP')
      );
      const hasBlockDb = rules.some(
        (r) =>
          r.action === 'block' &&
          (r.destIp === '172.16.0.88' || r.port === 5432 || r.port === 3306)
      );

      const isServicesRunning = ingress?.on !== false && db?.on !== false;

      const isSolved = hasAllowIngress && hasBlockDb && isServicesRunning;

      return {
        isSolved,
        taskStatuses: {
          t1: hasAllowIngress,
          t2: hasBlockDb,
          t3: isServicesRunning,
        },
        message: isSolved
          ? 'ZERO-TRUST KUBERNETES ARKITEKTUR SÄKRAD! All inkommande trafik filtreras genom WAF & Ingress Gateway medan databasen är helt isolerad från direkt exponering!'
          : 'Regelverket är inte komplett. Tillåt trafik till 172.16.0.10 och blockera direkt åtkomst till 172.16.0.88 i brandväggen.',
      };
    },
  },
  {
    id: 'sc_23_bgp_anycast_scrubbing',
    title: '23. BGP Anycast & DDoS Scrubbing Center',
    category: 'Routing',
    difficulty: 'expert',
    estimatedTime: '12-15 min',
    iconName: 'ShieldAlert',
    summary: 'Företagets betalväxel utsätts för en massiv 400 Gbps DDoS-attack. Dirigera trafiken genom ett Scrubbing Center.',
    problemDescription: 'Kriminella aktörer har inlett en förödande DDoS-attack mot Företagets Betalväxel (185.20.10.100) vilket genererar 95% paketförlust på direktlänken. Koppla in BGP DDoS Scrubbing Center mellan WAN och Betalväxeln, aktivera ddos-filtrering mot MALWARE, och återställ paketförlusten på Betalväxelns länk till 0%.',
    initialNodes: [
      {
        id: 'n_wan_transit',
        type: 'internet',
        name: 'Global Tier-1 Transit WAN',
        ip: '198.51.100.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:CC:DD:EE:FF:01',
        x: 100,
        y: 260,
        on: true,
      },
      {
        id: 'n_scrubbing_center',
        type: 'firewall',
        name: 'BGP Scrubbing Center NGFW',
        ip: '185.20.10.1',
        subnetMask: '255.255.255.0',
        gateway: '198.51.100.1',
        mac: '00:CC:DD:EE:FF:02',
        x: 360,
        y: 380,
        on: true,
        firewallRules: [], // SAKNAR FILTRERINGSREGEL!
      },
      {
        id: 'n_sw_payment',
        type: 'switch',
        name: 'Betalväxel Switch',
        ip: '185.20.10.2',
        subnetMask: '255.255.255.0',
        gateway: '185.20.10.1',
        mac: '00:CC:DD:EE:FF:03',
        x: 620,
        y: 260,
        on: true,
      },
      {
        id: 'n_srv_payment',
        type: 'server_web',
        name: 'Kritisk Betalväxel Server',
        ip: '185.20.10.100',
        subnetMask: '255.255.255.0',
        gateway: '185.20.10.1',
        mac: '00:CC:DD:EE:FF:10',
        x: 880,
        y: 260,
        on: true,
        services: { http: true },
      },
    ],
    initialLinks: [
      { id: 'l_ddos_direct', a: 'n_wan_transit', b: 'n_sw_payment', type: 'fiber', bandwidthMbps: 10000, latencyMs: 2, packetLossPercent: 95, duplex: 'full' }, // ATTACKERAD DIREKTLÄNK!
      { id: 'l_sw_srv', a: 'n_sw_payment', b: 'n_srv_payment', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 90, duplex: 'full' },
      { id: 'l_wan_scrub', a: 'n_wan_transit', b: 'n_scrubbing_center', type: 'fiber', bandwidthMbps: 10000, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Anslut BGP Scrubbing Center NGFW till Betalväxel Switch med en Fiber- eller Cat6-kabel.',
        hint: 'Skapa en länk mellan Scrubbing Center och Betalväxel Switch.',
      },
      {
        id: 't2',
        description: 'Skapa en filtreringsregel i BGP Scrubbing Center NGFW som blockerar ("block") protokollet "MALWARE".',
        hint: 'Klicka på Scrubbing Center och lägg till Action: Block, Protocol: MALWARE.',
      },
      {
        id: 't3',
        description: 'Återställ paketförlusten på länkarna till 0% och säkerställ att Betalväxel Server är online.',
        hint: 'Inspektera länkarna och sätt Paketförlust till 0%.',
      },
    ],
    validateSolution: (nodes, links) => {
      const fw = nodes.find((n) => n.id === 'n_scrubbing_center');
      const srv = nodes.find((n) => n.id === 'n_srv_payment');

      const isScrubLinkedToSwitch = links.some(
        (l) =>
          (l.a === 'n_scrubbing_center' && l.b === 'n_sw_payment') ||
          (l.a === 'n_sw_payment' && l.b === 'n_scrubbing_center')
      );

      const hasBlockRule = Boolean(
        fw?.firewallRules?.some((r) => r.action === 'block' && (r.protocol === 'MALWARE' || r.protocol === 'UDP'))
      );

      const isPacketLossClean = links.every((l) => (l.packetLossPercent || 0) === 0);
      const isSrvOnline = srv?.on !== false;

      const isSolved = isScrubLinkedToSwitch && hasBlockRule && isPacketLossClean && isSrvOnline;

      return {
        isSolved,
        taskStatuses: {
          t1: isScrubLinkedToSwitch,
          t2: hasBlockRule,
          t3: isPacketLossClean && isSrvOnline,
        },
        message: isSolved
          ? 'BGP ANYCAST SCRUBBING AKTIVERAD! 400 Gbps attacken filtreras i realtid av Scrubbing Centret och betaltransaktioner flyter utan förlust!'
          : 'DDoS-skyddet är inte fullt operativt. Anslut Scrubbing Center till switchen, blockera MALWARE och sätt länkarnas paketförlust till 0%.',
      };
    },
  },
  {
    id: 'sc_24_scada_purdue_airgap',
    title: '24. SCADA OT Industrial Air-Gap & Modbus Säkring',
    category: 'Felsökning',
    difficulty: 'expert',
    estimatedTime: '10-15 min',
    iconName: 'Cpu',
    summary: 'Ett kritiskt vattenkraftverk uppvisar otillåten fjärrstyrning via en oisolerad Wi-Fi-brygga in i OT-zonen.',
    problemDescription: 'I ett vattenkraftverk upptäckte driftledningen att en okänd Wi-Fi AP kopplats in direkt i ställverkets PLC Switch (10.240.1.50). Detta strider mot Purdue Model (Level 1/2) och IEC 62443. Avlägsna eller stäng av den otillåtna Wi-Fi AP:n och konfigurera Industrial OT Firewall mot HMI Styrserver (10.240.1.10).',
    initialNodes: [
      {
        id: 'n_ot_firewall',
        type: 'firewall',
        name: 'Industrial OT Diode Firewall',
        ip: '10.240.1.1',
        subnetMask: '255.255.255.0',
        gateway: '',
        mac: '00:EE:FF:11:22:01',
        x: 200,
        y: 260,
        on: true,
      },
      {
        id: 'n_sw_plc',
        type: 'switch',
        name: 'Kraftverk PLC Switch (OT Zon)',
        ip: '10.240.1.2',
        subnetMask: '255.255.255.0',
        gateway: '10.240.1.1',
        mac: '00:EE:FF:11:22:02',
        x: 460,
        y: 260,
        on: true,
      },
      {
        id: 'n_plc_turbine',
        type: 'iot_plc',
        name: 'Vattenkraftverk PLC Turbin 1',
        ip: '10.240.1.50',
        subnetMask: '255.255.255.0',
        gateway: '10.240.1.1',
        mac: '00:EE:FF:11:22:50',
        x: 720,
        y: 160,
        on: true,
      },
      {
        id: 'n_scada_hmi',
        type: 'server_web',
        name: 'SCADA HMI Styrserver',
        ip: '10.240.1.10',
        subnetMask: '255.255.255.0',
        gateway: '10.240.1.1',
        mac: '00:EE:FF:11:22:10',
        x: 720,
        y: 360,
        on: true,
        services: { http: true },
      },
      {
        id: 'n_rogue_ot_wifi',
        type: 'wifi_ap',
        name: 'Otillåten Rouge Wi-Fi AP',
        ip: '10.240.1.99',
        subnetMask: '255.255.255.0',
        gateway: '10.240.1.1',
        mac: '00:66:66:66:66:99',
        x: 460,
        y: 440,
        on: true, // OTILLÅTEN ENHET I DRIFT!
      },
    ],
    initialLinks: [
      { id: 'l1', a: 'n_ot_firewall', b: 'n_sw_plc', type: 'fiber', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l2', a: 'n_sw_plc', b: 'n_plc_turbine', type: 'cat6', bandwidthMbps: 100, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l3', a: 'n_sw_plc', b: 'n_scada_hmi', type: 'cat6', bandwidthMbps: 1000, latencyMs: 1, packetLossPercent: 0, duplex: 'full' },
      { id: 'l_rogue', a: 'n_sw_plc', b: 'n_rogue_ot_wifi', type: 'cat6', bandwidthMbps: 100, latencyMs: 2, packetLossPercent: 0, duplex: 'full' },
    ],
    tasks: [
      {
        id: 't1',
        description: 'Stäng av eller koppla ur den "Otillåtna Rouge Wi-Fi AP"-enheten.',
        hint: 'Klicka på Otillåten Rouge Wi-Fi AP och slå av strömmen (Power Off) eller ta bort kabeln.',
      },
      {
        id: 't2',
        description: 'Säkerställ att Vattenkraftverk PLC Turbin 1 och SCADA HMI Styrserver är online och anslutna till PLC Switchen.',
        hint: 'Kontrollera att PLC Turbin 1 och HMI-servern har ström påslagen och fungerande länkar.',
      },
      {
        id: 't3',
        description: 'Säkerställ att Industrial OT Diode Firewall är aktiv med Gateway 10.240.1.1.',
        hint: 'Se till att brandväggen är online.',
      },
    ],
    validateSolution: (nodes, links) => {
      const rogue = nodes.find((n) => n.id === 'n_rogue_ot_wifi');
      const plc = nodes.find((n) => n.id === 'n_plc_turbine');
      const hmi = nodes.find((n) => n.id === 'n_scada_hmi');
      const fw = nodes.find((n) => n.id === 'n_ot_firewall');

      const isRogueDisabled =
        rogue?.on === false ||
        !links.some((l) => l.a === 'n_rogue_ot_wifi' || l.b === 'n_rogue_ot_wifi');

      const isPlcAndHmiUp = plc?.on !== false && hmi?.on !== false;
      const isFwUp = fw?.on !== false;

      const isSolved = isRogueDisabled && isPlcAndHmiUp && isFwUp;

      return {
        isSolved,
        taskStatuses: {
          t1: isRogueDisabled,
          t2: isPlcAndHmiUp,
          t3: isFwUp,
        },
        message: isSolved
          ? 'OT AIR-GAP ÅTERSTÄLLT! Den otillåtna accesspunkten har eliminerats och vattenkraftverkets PLC och SCADA HMI är helt säkrade enligt Purdue Model!'
          : 'OT-zonen är fortfarande sårbar. Stäng av eller koppla ur den otillåtna Wi-Fi AP:n och säkerställ att PLC och HMI är online.',
      };
    },
  },
];

