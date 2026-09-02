import React, { useState, useMemo } from 'react';
import {
  Info,
  Cpu,
  Cable,
  Zap,
  Radio,
  Sparkles,
  GitCompare,
  Network,
  Activity,
  Terminal,
  CheckCircle2,
  Sliders,
  Search,
  Server,
  Shield,
  Layers,
  Monitor,
  Skull,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  StickyNote as StickyNoteIcon,
  Plus,
} from 'lucide-react';
import { DeviceType, CableType, StickyNoteColor } from '../types';
import { RealisticDeviceIcon } from './RealisticDeviceIcon';
import { CABLE_DEFINITIONS } from '../utils/cableEngine';

interface PaletteItem {
  type: DeviceType;
  label: string;
  category:
    | 'Gateway & Rutt'
    | 'Säkerhet & Brandvägg'
    | 'Switchar & Access'
    | 'Servrar & Lagring'
    | 'Klienter & Arbetsstationer'
    | 'The Internet of Things (IoT)'
    | 'Red Team & Angreppsverktyg';
  description: string;
  badge?: string;
  specs?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Gateway & Rutt
  {
    type: 'internet',
    label: 'Internet (WAN)',
    category: 'Gateway & Rutt',
    description: 'Publikt internet / ISP fiber-anslutning',
    badge: 'WAN',
    specs: 'BGP / Global Routing',
  },
  {
    type: 'router',
    label: 'Core Router',
    category: 'Gateway & Rutt',
    description: 'BGP/OSPF inter-subnät ruttering & NAT',
    badge: 'L3',
    specs: 'OSPF, BGP, NAT, ACL',
  },
  {
    type: 'wifi_router',
    label: 'WiFi-router',
    category: 'Gateway & Rutt',
    description: 'Trådlös router med DHCP & AP-läge',
    badge: 'AP+GW',
    specs: 'Wi-Fi 6 + DHCP Server',
  },
  {
    type: 'load_balancer',
    label: 'Load Balancer',
    category: 'Gateway & Rutt',
    description: 'Trafikfördelning & HA-kluster (HAProxy/F5)',
    badge: 'L4/L7',
    specs: 'Round-robin, Failover',
  },

  // Säkerhet & Brandvägg
  {
    type: 'firewall',
    label: 'NGFW Brandvägg',
    category: 'Säkerhet & Brandvägg',
    description: 'Stateful inspection & IDS/IPS-regler',
    badge: 'FW',
    specs: 'Deep Packet Inspection',
  },
  {
    type: 'ids_ips',
    label: 'IDS / IPS Sensor',
    category: 'Säkerhet & Brandvägg',
    description: 'Snort / Suricata hotdetektering i realtid',
    badge: 'IPS',
    specs: 'Signatur & Avvikelse-analys',
  },
  {
    type: 'waf',
    label: 'WAF (Web App Firewall)',
    category: 'Säkerhet & Brandvägg',
    description: 'Skydd mot SQLi, XSS, OWASP Top-10 & bot-trafik',
    badge: 'WAF-L7',
    specs: 'Layer 7 HTTP/HTTPS Shield',
  },
  {
    type: 'honeypot',
    label: 'Decoy Honeypot (Fälla)',
    category: 'Säkerhet & Brandvägg',
    description: 'Deception trap som lurar & fångar angripare',
    badge: 'DECOY',
    specs: 'High-Interaction Lure Trap',
  },
  {
    type: 'ddos_scrubber',
    label: 'Anti-DDoS Scrubbing Node',
    category: 'Säkerhet & Brandvägg',
    description: '400 Gbps BGP Volumetric Flood Mitigation',
    badge: 'SCRUB',
    specs: 'SYN/UDP Rate-Limiting Engine',
  },
  {
    type: 'siem_soc',
    label: 'SOC SIEM & Threat Hunter',
    category: 'Säkerhet & Brandvägg',
    description: 'Central logginsamling, AI-analys & larm',
    badge: 'SIEM',
    specs: 'MITRE ATT&CK Correlation Hub',
  },
  {
    type: 'hsm_vault',
    label: 'Hardware Security Module (HSM)',
    category: 'Säkerhet & Brandvägg',
    description: 'FIPS 140-3 hårdvarukryptering & TLS Key Vault',
    badge: 'HSM',
    specs: 'Tamper-Proof Cryptographic Enclave',
  },
  {
    type: 'server_vpn',
    label: 'VPN Gateway',
    category: 'Säkerhet & Brandvägg',
    description: 'WireGuard / IPsec krypterad nättunnel',
    badge: 'VPN',
    specs: 'AES-256-GCM / WireGuard',
  },

  // Switchar & Access
  {
    type: 'l3_switch',
    label: 'Layer 3 Switch',
    category: 'Switchar & Access',
    description: 'Multilayer 10GbE Inter-VLAN switch',
    badge: 'L3-SW',
    specs: '10 Gbps Wire-Speed Routing',
  },
  {
    type: 'switch',
    label: 'Managed L2 Switch',
    category: 'Switchar & Access',
    description: '24-port Managed Ethernet switch (VLAN)',
    badge: 'L2-SW',
    specs: '802.1Q VLANs, STP/RSTP',
  },
  {
    type: 'wifi_ap',
    label: 'Wi-Fi 6 Access Point',
    category: 'Switchar & Access',
    description: 'Trådlös AP med 802.11ax täckningsradie',
    badge: 'AP',
    specs: 'OFDMA, MU-MIMO, WPA3',
  },

  // Servrar & Lagring
  {
    type: 'server_web',
    label: 'Webbserver (HTTP/S)',
    category: 'Servrar & Lagring',
    description: 'NGINX / Apache portal & REST API',
    badge: 'HTTP',
    specs: 'Port 80, 443 (SSL/TLS)',
  },
  {
    type: 'server_dns',
    label: 'DNS Namnserver',
    category: 'Servrar & Lagring',
    description: 'BIND9 / Unbound namnuppslagning',
    badge: 'DNS',
    specs: 'Port 53 (UDP/TCP)',
  },
  {
    type: 'server_db',
    label: 'SQL Databasserver',
    category: 'Servrar & Lagring',
    description: 'PostgreSQL / MySQL databaskluster',
    badge: 'DB',
    specs: 'Port 5432 / 3306 (ACID)',
  },
  {
    type: 'server_mail',
    label: 'E-postserver (SMTP/IMAP)',
    category: 'Servrar & Lagring',
    description: 'Postfix / Dovecot mailserver med SPF/DKIM',
    badge: 'MAIL',
    specs: 'Port 25, 587, 993',
  },
  {
    type: 'server_nas',
    label: 'NAS Lagringsserver',
    category: 'Servrar & Lagring',
    description: 'Network Attached Storage (NFS/SMB)',
    badge: 'NAS',
    specs: 'RAID 10, iSCSI, ZFS',
  },

  // Klienter & Arbetsstationer
  {
    type: 'client_pc',
    label: 'Dator / Workstation',
    category: 'Klienter & Arbetsstationer',
    description: 'Stationär utvecklar- eller kontors-PC',
    badge: 'PC',
    specs: 'Gigabit NIC, IPv4/v6',
  },
  {
    type: 'client_laptop',
    label: 'Laptop (Wi-Fi)',
    category: 'Klienter & Arbetsstationer',
    description: 'Bärbar klientdator med trådlöst nät',
    badge: 'WIFI',
    specs: '802.11ax Roaming Client',
  },
  {
    type: 'client_mobile',
    label: 'Mobiltelefon (5G/Wi-Fi)',
    category: 'Klienter & Arbetsstationer',
    description: 'Smartphone ansluten via Wi-Fi 6',
    badge: 'MOB',
    specs: 'DHCP Auto-Assign Client',
  },
  {
    type: 'client_printer',
    label: 'Nätverksskrivare',
    category: 'Klienter & Arbetsstationer',
    description: 'Gemensam kontorsskrivare (IPP / LPR)',
    badge: 'IPP',
    specs: 'Port 631 / 9100 Raw',
  },
  {
    type: 'client_pos',
    label: 'POS Kassaterminal',
    category: 'Klienter & Arbetsstationer',
    description: 'Kassasystem med krypterad betalterminal',
    badge: 'POS',
    specs: 'PCI-DSS Isolerat VLAN',
  },

  // The Internet of Things (IoT)
  {
    type: 'iot_sensor',
    label: 'IoT Miljösensor',
    category: 'The Internet of Things (IoT)',
    description: 'Smart telemetri & MQTT telemetrisensor',
    badge: 'MQTT',
    specs: 'Port 1883, Telemetri',
  },
  {
    type: 'iot_camera',
    label: 'Smart IP-Kamera / CCTV',
    category: 'The Internet of Things (IoT)',
    description: 'RTSP HD-videoström och IR-nattseende',
    badge: 'RTSP',
    specs: 'PoE 802.3af, Port 554',
  },
  {
    type: 'iot_thermostat',
    label: 'Smart Termostat',
    category: 'The Internet of Things (IoT)',
    description: 'Nätverksansluten HVAC & temperaturkontroll',
    badge: 'HVAC',
    specs: 'Modbus / Zigbee 3.0',
  },
  {
    type: 'iot_smartlock',
    label: 'Smart Nätverkslås',
    category: 'The Internet of Things (IoT)',
    description: 'Elektroniskt dörrlås med RFID & Bluetooth',
    badge: 'LOCK',
    specs: 'BLE / Zigbee Access Control',
  },
  {
    type: 'iot_light',
    label: 'Smart Belysning (Hue Hub)',
    category: 'The Internet of Things (IoT)',
    description: 'Nätverksstyrd LED-belysning & smarta zoner',
    badge: 'LIGHT',
    specs: 'Zigbee / CoAP / 802.15.4',
  },
  {
    type: 'iot_plc',
    label: 'Industriell PLC / SCADA',
    category: 'The Internet of Things (IoT)',
    description: 'Siemens S7 & Modbus TCP industriell styrenhet',
    badge: 'SCADA',
    specs: 'Modbus TCP / Profinet OT',
  },
  {
    type: 'iot_gateway',
    label: 'IoT Edge Gateway Hub',
    category: 'The Internet of Things (IoT)',
    description: 'LoRaWAN, Zigbee & Z-Wave till IP-brygga',
    badge: 'HUB',
    specs: 'Multi-Radio IoT Gateway',
  },
  {
    type: 'iot_smart_meter',
    label: 'Smart Elmätare (AMR)',
    category: 'The Internet of Things (IoT)',
    description: 'Smart Grid elmätning och förbrukningsdata',
    badge: 'AMR',
    specs: 'DLMS/COSEM Protokoll',
  },
  {
    type: 'iot_speaker',
    label: 'Smart Högtalare / AI',
    category: 'The Internet of Things (IoT)',
    description: 'Röststyrd smart assistent & mediestreaming',
    badge: 'AUDIO',
    specs: 'mDNS / UPnP / AirPlay',
  },

  // Red Team & Angreppsverktyg
  {
    type: 'hacker',
    label: 'Red Team Hackarterminal',
    category: 'Red Team & Angreppsverktyg',
    description: 'Simulera SYN-flood, portskanning, DDoS & malware',
    badge: 'KALI',
    specs: 'Kali Linux / Metasploit Framework',
  },
  {
    type: 'hacker_botnet',
    label: 'DDoS Botnet Master',
    category: 'Red Team & Angreppsverktyg',
    description: 'Högvolym SYN, UDP & HTTP Botnet-överbelastning',
    badge: 'BOTNET',
    specs: 'Distributed Volumetric Flood',
  },
  {
    type: 'hacker_pineapple',
    label: 'WiFi Pineapple (MITM AP)',
    category: 'Red Team & Angreppsverktyg',
    description: 'Trådlös Rogue AP, Evil Twin & ARP Poisoning',
    badge: 'MITM',
    specs: '802.11 Deauth & Packet Sniff',
  },
  {
    type: 'hacker_c2',
    label: 'C2 Command & Control Server',
    category: 'Red Team & Angreppsverktyg',
    description: 'Centralt C2-kluster för beacons och malware staging',
    badge: 'C2-SRV',
    specs: 'Cobalt Strike / Empire Handler',
  },
  {
    type: 'hacker_implant',
    label: 'Rogue Nätverkstap / Implant',
    category: 'Red Team & Angreppsverktyg',
    description: 'Hårdvaruimplantat för passiv avlyssning och TAP',
    badge: 'HW-TAP',
    specs: 'In-line RJ45 Traffic Exfiltration',
  },
  {
    type: 'hacker_stager',
    label: 'Exploit & Payload Stager',
    category: 'Red Team & Angreppsverktyg',
    description: 'Zero-day sårbarhetsinjektor och automatiserad exploit delivery',
    badge: '0-DAY',
    specs: 'MSFvenom / RCE Delivery Engine',
  },
];

const CABLE_KEYS: CableType[] = [
  'auto',
  'cat6',
  'crossover',
  'fiber',
  'wifi',
  'serial',
  'coaxial',
  'console',
];

export const CATEGORY_THEMES: Record<
  string,
  {
    name: string;
    shortName: string;
    dotColor: string;
    textColor: string;
    textHover: string;
    chipActive: string;
    chipInactive: string;
    iconBg: string;
    iconBorder: string;
    cardBorder: string;
    cardHoverBorder: string;
    cardHoverGlow: string;
    badgeStyle: string;
    specColor: string;
  }
> = {
  'Gateway & Rutt': {
    name: 'Gateway & Rutt',
    shortName: 'Gateway',
    dotColor: 'bg-sky-400',
    textColor: 'text-sky-400',
    textHover: 'group-hover:text-sky-300',
    chipActive: 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30',
    chipInactive: 'bg-sky-950/40 text-sky-300 hover:text-white border-sky-800/60 hover:border-sky-500/50',
    iconBg: 'bg-sky-950/60',
    iconBorder: 'border-sky-800/60 group-hover:border-sky-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-sky-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(14,165,233,0.15)]',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    specColor: 'text-sky-400/90',
  },
  'Säkerhet & Brandvägg': {
    name: 'Säkerhet & Brandvägg',
    shortName: 'Säkerhet',
    dotColor: 'bg-indigo-400',
    textColor: 'text-indigo-400',
    textHover: 'group-hover:text-indigo-300',
    chipActive: 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30',
    chipInactive: 'bg-indigo-950/40 text-indigo-300 hover:text-white border-indigo-800/60 hover:border-indigo-500/50',
    iconBg: 'bg-indigo-950/60',
    iconBorder: 'border-indigo-800/60 group-hover:border-indigo-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-indigo-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(99,102,241,0.15)]',
    badgeStyle: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    specColor: 'text-indigo-400/90',
  },
  'Switchar & Access': {
    name: 'Switchar & Access',
    shortName: 'Switchar',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-400',
    textHover: 'group-hover:text-emerald-300',
    chipActive: 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30',
    chipInactive: 'bg-emerald-950/40 text-emerald-300 hover:text-white border-emerald-800/60 hover:border-emerald-500/50',
    iconBg: 'bg-emerald-950/60',
    iconBorder: 'border-emerald-800/60 group-hover:border-emerald-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-emerald-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    specColor: 'text-emerald-400/90',
  },
  'Servrar & Lagring': {
    name: 'Servrar & Lagring',
    shortName: 'Servrar',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400',
    textHover: 'group-hover:text-amber-300',
    chipActive: 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30',
    chipInactive: 'bg-amber-950/40 text-amber-300 hover:text-white border-amber-800/60 hover:border-amber-500/50',
    iconBg: 'bg-amber-950/60',
    iconBorder: 'border-amber-800/60 group-hover:border-amber-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-amber-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    specColor: 'text-amber-400/90',
  },
  'Klienter & Arbetsstationer': {
    name: 'Klienter & Arbetsstationer',
    shortName: 'Klienter',
    dotColor: 'bg-purple-400',
    textColor: 'text-purple-400',
    textHover: 'group-hover:text-purple-300',
    chipActive: 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/30',
    chipInactive: 'bg-purple-950/40 text-purple-300 hover:text-white border-purple-800/60 hover:border-purple-500/50',
    iconBg: 'bg-purple-950/60',
    iconBorder: 'border-purple-800/60 group-hover:border-purple-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-purple-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    specColor: 'text-purple-400/90',
  },
  'The Internet of Things (IoT)': {
    name: 'The Internet of Things (IoT)',
    shortName: 'IoT',
    dotColor: 'bg-lime-400',
    textColor: 'text-lime-400',
    textHover: 'group-hover:text-lime-300',
    chipActive: 'bg-lime-500 text-slate-950 font-bold shadow-md shadow-lime-500/30',
    chipInactive: 'bg-lime-950/40 text-lime-300 hover:text-white border-lime-800/60 hover:border-lime-500/50',
    iconBg: 'bg-lime-950/60',
    iconBorder: 'border-lime-800/60 group-hover:border-lime-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-lime-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(132,204,22,0.15)]',
    badgeStyle: 'bg-lime-500/15 text-lime-300 border-lime-500/40',
    specColor: 'text-lime-400/90',
  },
  'Red Team & Angreppsverktyg': {
    name: 'Red Team & Angreppsverktyg',
    shortName: 'Red Team',
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-400',
    textHover: 'group-hover:text-rose-300',
    chipActive: 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30',
    chipInactive: 'bg-rose-950/40 text-rose-300 hover:text-white border-rose-800/60 hover:border-rose-500/50',
    iconBg: 'bg-rose-950/60',
    iconBorder: 'border-rose-800/60 group-hover:border-rose-400',
    cardBorder: 'border-slate-800/90',
    cardHoverBorder: 'hover:border-rose-500/70',
    cardHoverGlow: 'hover:shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    specColor: 'text-rose-400/90',
  },
};

interface PaletteProps {
  onAddDevice: (type: DeviceType) => void;
  onAddStickyNote?: (x?: number, y?: number, text?: string, color?: StickyNoteColor) => void;
  activeCableType?: CableType;
  onSelectCableType?: (type: CableType) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Palette: React.FC<PaletteProps> = ({
  onAddDevice,
  onAddStickyNote,
  activeCableType = 'auto',
  onSelectCableType,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'cables'>('devices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    return Array.from(new Set(PALETTE_ITEMS.map((i) => i.category)));
  }, []);

  // Filter items based on search query and category
  const filteredItems = useMemo(() => {
    return PALETTE_ITEMS.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <aside className="w-full bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none shadow-xl z-10">
      {/* Header & Tab Switcher */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 font-sans flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Nätverksverktyg</span>
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-orbitron font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              E26
            </span>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Göm enhetspalett"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            className={`py-1.5 px-2 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'devices'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Enheter ({PALETTE_ITEMS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cables')}
            className={`py-1.5 px-2 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'cables'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cable className="w-3.5 h-3.5" />
            <span>Kablar ({CABLE_KEYS.length})</span>
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: CABLE_DEFINITIONS[activeCableType]?.color || '#38bdf8',
                boxShadow: `0 0 6px ${CABLE_DEFINITIONS[activeCableType]?.color || '#38bdf8'}`,
              }}
            />
          </button>
        </div>

        {/* Post-it Quick Creator Widget */}
        {onAddStickyNote && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
              <div className="flex items-center gap-1.5 text-amber-300">
                <StickyNoteIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Nätverksdokumentation</span>
              </div>
              <span className="text-[9.5px] text-amber-400/90 font-mono font-semibold">Post-its</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {(['yellow', 'cyan', 'emerald', 'rose', 'amber', 'purple', 'blue'] as StickyNoteColor[]).map((c) => {
                const bgMap: Record<StickyNoteColor, string> = {
                  yellow: 'bg-amber-300 text-amber-950 border-amber-400 hover:scale-110 shadow-amber-500/30',
                  cyan: 'bg-cyan-500 text-slate-950 border-cyan-400 hover:scale-110 shadow-cyan-500/30',
                  emerald: 'bg-emerald-500 text-slate-950 border-emerald-400 hover:scale-110 shadow-emerald-500/30',
                  rose: 'bg-rose-500 text-white border-rose-400 hover:scale-110 shadow-rose-500/30',
                  amber: 'bg-amber-500 text-slate-950 border-amber-400 hover:scale-110 shadow-amber-500/30',
                  purple: 'bg-purple-500 text-white border-purple-400 hover:scale-110 shadow-purple-500/30',
                  blue: 'bg-blue-500 text-white border-blue-400 hover:scale-110 shadow-blue-500/30',
                };
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onAddStickyNote(undefined, undefined, undefined, c)}
                    title={`Placera ut en ${c} digital Post-it anteckningslapp på diagrammet`}
                    className={`h-6 rounded-md border flex items-center justify-center font-black transition cursor-pointer shadow-sm ${bgMap[c]}`}
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & Category filter inside Devices tab */}
        {activeTab === 'devices' && (
          <div className="space-y-1.5 pt-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök enhet, protokoll, port..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Category Chips */}
            <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Alla ({PALETTE_ITEMS.length})
              </button>
              {categories.map((cat) => {
                const theme = CATEGORY_THEMES[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition cursor-pointer border ${
                      isSelected
                        ? theme?.chipActive || 'bg-cyan-500 text-slate-950 font-bold'
                        : theme?.chipInactive || 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    {theme?.shortName || cat.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'devices' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              Inga enheter matchar din sökning &quot;{searchQuery}&quot;.
            </div>
          ) : (
            categories
              .filter(
                (cat) =>
                  selectedCategory === 'all' || selectedCategory === cat
              )
              .map((cat) => {
                const catItems = filteredItems.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;
                const catTheme = CATEGORY_THEMES[cat];

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between border-b border-slate-800/60 pb-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${catTheme?.dotColor || 'bg-cyan-400'}`} />
                        <span className={catTheme?.textColor || 'text-slate-300'}>{cat}</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[9px] bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                        {catItems.length}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {catItems.map((item) => (
                        <div
                          key={item.type}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', item.type);
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          onClick={() => onAddDevice(item.type)}
                          className={`group relative flex items-center gap-2.5 p-2 rounded-xl border bg-slate-950/90 hover:bg-slate-900 cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm ${
                            catTheme?.cardBorder || 'border-slate-800/90'
                          } ${catTheme?.cardHoverBorder || 'hover:border-cyan-500/60'} ${
                            catTheme?.cardHoverGlow || 'hover:shadow-cyan-500/10'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg border group-hover:scale-105 transition-all shrink-0 ${
                              catTheme?.iconBg || 'bg-slate-900/90'
                            } ${catTheme?.iconBorder || 'border-slate-800'}`}
                          >
                            <RealisticDeviceIcon type={item.type} size="sm" />
                          </div>
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-bold text-slate-200 transition-colors ${
                                  catTheme?.textHover || 'group-hover:text-cyan-300'
                                } truncate font-sans`}
                              >
                                {item.label}
                              </span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                    catTheme?.badgeStyle || 'bg-slate-800 text-slate-400 border-slate-700/60'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {item.description}
                            </div>
                            {item.specs && (
                              <div
                                className={`text-[9px] font-mono truncate mt-0.5 flex items-center gap-1 ${
                                  catTheme?.specColor || 'text-cyan-400/80'
                                }`}
                              >
                                <span>&bull;</span>
                                <span>{item.specs}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      ) : (
        /* Cables Tab */
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          <div className="text-[10.5px] text-slate-400 px-1 leading-relaxed">
            Klicka på en specialkabel för att aktivera den. Dra sedan mellan enheter på canvasen.
          </div>

          <div className="space-y-2">
            {CABLE_KEYS.map((key) => {
              const def = CABLE_DEFINITIONS[key];
              const isActive = activeCableType === key;

              return (
                <div
                  key={key}
                  onClick={() => onSelectCableType?.(key)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/95 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{
                          backgroundColor: def.color,
                          boxShadow: isActive ? `0 0 10px ${def.color}` : `0 0 4px ${def.color}`,
                        }}
                      />
                      <span
                        className={`text-xs font-bold truncate font-sans ${
                          isActive ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {def.name}
                      </span>
                    </div>

                    <span
                      className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 border"
                      style={{
                        backgroundColor: `${def.color}15`,
                        color: def.color,
                        borderColor: `${def.color}35`,
                      }}
                    >
                      {def.badge}
                    </span>
                  </div>

                  <div className="mt-1.5 text-[10px] text-slate-300 font-medium leading-snug">
                    {def.subtitle}
                  </div>

                  <div className="mt-1 text-[9.5px] text-slate-400/90 leading-tight">
                    <span className="text-cyan-400 font-semibold">Används för: </span>
                    {def.specializedFor}
                  </div>

                  {isActive && (
                    <div className="mt-2 pt-1.5 border-t border-cyan-500/30 flex items-center justify-between text-[10px] text-cyan-300 font-semibold">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Aktiv kabel</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400">
                        {def.bandwidthMbps} Mbps &bull; {def.latencyMs}ms
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Active Cable Banner in Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Cable className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vald kabel</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('cables')}
            className="text-[10px] text-cyan-400 hover:underline font-semibold"
          >
            Byt typ
          </button>
        </div>

        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: CABLE_DEFINITIONS[activeCableType]?.color || '#38bdf8',
                boxShadow: `0 0 6px ${CABLE_DEFINITIONS[activeCableType]?.color || '#38bdf8'}`,
              }}
            />
            <span className="text-[11px] font-bold text-slate-200 truncate">
              {CABLE_DEFINITIONS[activeCableType]?.shortName || 'Auto-kabel'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
            {CABLE_DEFINITIONS[activeCableType]?.badge || 'AUTO'}
          </span>
        </div>
      </div>
    </aside>
  );
};


