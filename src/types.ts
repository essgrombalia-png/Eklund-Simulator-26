export type DeviceType =
  | 'internet'
  | 'router'
  | 'wifi_router'
  | 'firewall'
  | 'ids_ips'
  | 'load_balancer'
  | 'switch'
  | 'l3_switch'
  | 'wifi_ap'
  | 'server_web'
  | 'server_dns'
  | 'server_db'
  | 'server_vpn'
  | 'server_mail'
  | 'server_nas'
  | 'client_pc'
  | 'client_laptop'
  | 'client_mobile'
  | 'client_printer'
  | 'client_camera'
  | 'client_pos'
  | 'iot_sensor'
  | 'iot_camera'
  | 'iot_thermostat'
  | 'iot_smartlock'
  | 'iot_light'
  | 'iot_plc'
  | 'iot_gateway'
  | 'iot_smart_meter'
  | 'iot_speaker'
  | 'hacker'
  | 'hacker_botnet'
  | 'hacker_pineapple'
  | 'hacker_c2'
  | 'hacker_implant'
  | 'hacker_stager';

export type DeviceCategory = 'gateway' | 'network' | 'servers' | 'clients' | 'iot' | 'cyber';

export type CableType =
  | 'auto'
  | 'cat6'
  | 'crossover'
  | 'fiber'
  | 'wifi'
  | 'serial'
  | 'coaxial'
  | 'console';

export interface Link {
  id: string;
  a: string;
  b: string;
  type: CableType;
  bandwidthMbps: number;
  latencyMs: number;
  packetLossPercent: number;
  duplex: 'full' | 'half';
  vlanId?: number;
}

export interface FirewallRule {
  id: string;
  action: 'allow' | 'block';
  protocol: 'ALL' | 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'MALWARE';
  sourceIp: string;
  destIp: string;
  port?: number;
  description: string;
}

export interface RouteEntry {
  id: string;
  destination: string; // e.g. 192.168.1.0/24 or 0.0.0.0/0
  nextHop: string;
  interfaceName: string;
  metric: number;
}

export interface DnsRecord {
  id: string;
  hostname: string;
  ip: string;
  type: 'A' | 'CNAME';
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  ip: string;
  subnetMask: string;
  gateway: string;
  mac: string;
  showIpOnCanvas?: boolean;
  showMacOnCanvas?: boolean;
  x: number;
  y: number;
  on: boolean;
  connected?: boolean;
  vlanId?: number;
  wifiCoverageRadius?: number; // for Wi-Fi AP / Wifi Router
  dhcpEnabled?: boolean;
  dhcpRange?: { start: string; end: string };
  firewallRules?: FirewallRule[];
  routes?: RouteEntry[];
  dnsRecords?: DnsRecord[];
  services?: {
    http?: boolean;
    dns?: boolean;
    sql?: boolean;
    vpn?: boolean;
  };
  hackerAttackActive?: boolean;
  hackerAttackIntensity?: 'low-noise' | 'aggressive' | 'brute-force-flood' | 'apocalyptic';
  hackerTargetIp?: string;
  hackerAttackType?:
    | 'port_scan'
    | 'ddos'
    | 'mitm'
    | 'malware_injection'
    | 'ransomware'
    | 'zero_day'
    | 'dns_poison'
    | 'autonomous_ai';
  hackerAutoAttack?: boolean;
  hackerStealthMode?: boolean;
  hackerPayloadSize?: number;
  hackerAutoCycleTargets?: boolean;
  hackerKillChainStage?: 'RECON' | 'VULN_SCAN' | 'EXPLOIT' | 'LATERAL_MOVE' | 'IMPACT';
  hackerCompromisedTargets?: string[];
  isInfected?: boolean;
  // Antivirus & EDR Protection
  antivirusInstalled?: boolean;
  antivirusRealtimeProtection?: boolean;
  antivirusAutoQuarantine?: boolean;
  antivirusStatus?: 'PROTECTED' | 'INFECTED' | 'VULN' | 'SCANNING' | 'NOT_INSTALLED';
  antivirusLastScan?: string;
  antivirusThreatsBlocked?: number;
  antivirusEngineVersion?: string;
  antivirusLogs?: string[];
  iotState?: boolean;
  iotMode?: string;
  iotLogs?: string[];
  iotRules?: IotRule[];
}

export type IotRuleTrigger =
  | 'hacker_in_subnet'
  | 'hacker_attack_active'
  | 'device_infected'
  | 'traffic_high';

export type IotRuleAction =
  | 'turn_off'
  | 'turn_on'
  | 'lock_device'
  | 'log_alert';

export interface IotRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: IotRuleTrigger;
  action: IotRuleAction;
  lastTriggered?: string;
}

export interface CapturedPacket {
  id: string;
  timestamp: string;
  sourceId: string;
  sourceName: string;
  sourceIp: string;
  destId: string;
  destName: string;
  destIp: string;
  protocol: 'ICMP' | 'HTTP' | 'DNS' | 'TCP' | 'UDP' | 'ARP' | 'MALWARE';
  info: string;
  status: 'SUCCESS' | 'DROPPED_FIREWALL' | 'UNREACHABLE' | 'OFFLINE';
  payload?: string;
  ttl: number;
  hopsCount: number;
}

export type ContainerType =
  | 'subnet_cloud'
  | 'dmz'
  | 'lan_zone'
  | 'datacenter'
  | 'vlan_boundary'
  | 'wifi_zone'
  | 'custom_box';

export type ContainerColor =
  | 'cyan'
  | 'emerald'
  | 'indigo'
  | 'amber'
  | 'rose'
  | 'purple'
  | 'teal'
  | 'blue'
  | 'slate';

export interface NetworkContainer {
  id: string;
  name: string;
  type: ContainerType;
  subnet?: string; // e.g. "192.168.10.0/24" or "VLAN 10 - Ekonomi"
  color: ContainerColor;
  nodeIds: string[]; // device ids inside container
  isCollapsed?: boolean; // collapse into a compact Subnet Cloud or expanded frame
  collapsedX?: number; // position when collapsed
  collapsedY?: number;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  description: string;
  iconName: string;
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
}

export interface TestResult {
  success: boolean;
  pathNodes: string[];
  pathLinks: Link[];
  latencyMs: number;
  packetLoss: number;
  logs: string[];
}
