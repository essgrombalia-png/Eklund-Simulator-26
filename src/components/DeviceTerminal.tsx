import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, X, CornerDownLeft, RefreshCw, Cpu } from 'lucide-react';
import { Device, Link } from '../types';
import { findPathAndSimulate } from '../utils/networkEngine';

interface DeviceTerminalProps {
  nodes: Device[];
  links: Link[];
  initialNodeId?: string | null;
  onClose?: () => void;
  onUpdateNode?: (node: Device) => void;
}

interface CommandHistory {
  deviceIp: string;
  command: string;
  output: string[];
  type: 'info' | 'success' | 'error';
}

export const DeviceTerminal: React.FC<DeviceTerminalProps> = ({
  nodes,
  links,
  initialNodeId,
  onClose,
  onUpdateNode,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initialNodeId || (nodes[0] ? nodes[0].id : '')
  );
  const [inputCommand, setInputCommand] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      deviceIp: 'SYSTEM',
      command: 'sys_init',
      output: [
        '╔════════════════════════════════════════════════════════════════╗',
        '║  Eklund Simulator 26 Enterprise CLI Engine v26.0               ║',
        '║  High-Performance Virtual Network Terminal Interface           ║',
        '╚════════════════════════════════════════════════════════════════╝',
        'Skriv "help" för att visa tillgängliga nätverkskommandon.',
        'Kommandon: ping <ip|namn>, traceroute <ip>, ipconfig, nslookup <domän>, nmap <ip>, curl <ip>',
      ],
      type: 'info',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const activeDevice = nodes.find((n) => n.id === selectedNodeId);

  const handleRunCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = inputCommand.trim();
    if (!cmd || !activeDevice) return;

    setInputCommand('');
    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();
    const targetArg = parts.slice(1).join(' ').trim();

    const newLogs: string[] = [];
    let logType: 'info' | 'success' | 'error' = 'info';

    if (action === 'clear') {
      setHistory([]);
      return;
    }

    if (action === 'help') {
      newLogs.push('Tillgängliga CLI-kommandon:');
      newLogs.push('  ping <ip | namn>       - Testa ICMP-anslutning till enhet');
      newLogs.push('  traceroute <ip>        - Spåra nätverksväg och routrar');
      newLogs.push('  ipconfig / ifconfig    - Visa nätverkskorts-information');
      newLogs.push('  ip set <ip>            - Konfigurera ny IP-adress för enheten (t.ex. ip set 192.168.1.50)');
      newLogs.push('  nslookup <domän>       - Slå upp IP för ett domännamn (t.ex. mycompany.se)');
      newLogs.push('  nmap <ip>              - Portskanna en målenhet för öppna tjänster');
      newLogs.push('  curl <ip | domän>      - Hämta HTTP webbsida');
      newLogs.push('  clear                  - Rensa terminalens historik');
    } else if (
      action === 'ip' ||
      action === 'set' ||
      (parts[0] === 'ip' && parts[1] === 'set')
    ) {
      let newIp = '';
      if (parts[0] === 'ip' && parts[1] === 'set') {
        newIp = parts[2] || '';
      } else if (action === 'set' && parts[1] === 'ip') {
        newIp = parts[2] || '';
      } else if (action === 'ip' && parts[1] === 'set') {
        newIp = parts[2] || '';
      } else {
        newIp = targetArg;
      }

      if (!newIp) {
        newLogs.push('Syntaxfel: ip set <ny_ip_adress> (exempel: ip set 192.168.1.50)');
        logType = 'error';
      } else if (activeDevice.type === 'internet') {
        newLogs.push('Fel: Det går inte att ändra statisk IP på Internet WAN gateway.');
        logType = 'error';
      } else {
        if (onUpdateNode) {
          onUpdateNode({ ...activeDevice, ip: newIp });
          newLogs.push(`Framgång: Ny IPv4-adress satt för ${activeDevice.name} -> ${newIp}`);
          logType = 'success';
        } else {
          newLogs.push(`Kunde inte uppdatera IP-adress.`);
          logType = 'error';
        }
      }
    } else if (action === 'ipconfig' || action === 'ifconfig') {
      newLogs.push(`Nätverkskonfiguration för ${activeDevice.name}:`);
      newLogs.push(`  Anslutningsstatus: ${activeDevice.on ? 'PÅ (UP)' : 'AV (DOWN)'}`);
      newLogs.push(`  IPv4-adress......: ${activeDevice.ip || '0.0.0.0 (DHCP Söker...)'}`);
      newLogs.push(`  Subnätmask.......: ${activeDevice.subnetMask}`);
      newLogs.push(`  Default Gateway..: ${activeDevice.gateway || 'Ingen'}`);
      newLogs.push(`  MAC-adress.......: ${activeDevice.mac}`);
      newLogs.push(`  VLAN Tag ID......: ${activeDevice.vlanId || 1}`);
      logType = 'success';
    } else if (action === 'ping') {
      if (!targetArg) {
        newLogs.push('Syntaxfel: ping <ip eller namn>');
        logType = 'error';
      } else {
        const targetNode = nodes.find(
          (n) =>
            n.ip === targetArg ||
            n.name.toLowerCase().includes(targetArg.toLowerCase())
        );

        if (!targetNode) {
          newLogs.push(`Ping-begäran kunde inte hitta värden '${targetArg}'.`);
          logType = 'error';
        } else {
          const res = findPathAndSimulate(activeDevice.id, targetNode.id, nodes, links, 'ICMP');
          newLogs.push(...res.logs);
          logType = res.success ? 'success' : 'error';
        }
      }
    } else if (action === 'traceroute' || action === 'tracert') {
      if (!targetArg) {
        newLogs.push('Syntaxfel: traceroute <ip eller namn>');
        logType = 'error';
      } else {
        const targetNode = nodes.find(
          (n) =>
            n.ip === targetArg ||
            n.name.toLowerCase().includes(targetArg.toLowerCase())
        );

        if (!targetNode) {
          newLogs.push(`Traceroute: Värden '${targetArg}' hittades inte.`);
          logType = 'error';
        } else {
          const res = findPathAndSimulate(activeDevice.id, targetNode.id, nodes, links, 'ICMP');
          if (!res.success) {
            newLogs.push(...res.logs);
            logType = 'error';
          } else {
            newLogs.push(`Spårar vägen till ${targetNode.name} [${targetNode.ip}] över maximalt 30 hopp:`);
            res.pathNodes.forEach((nodeId, idx) => {
              const n = nodes.find((node) => node.id === nodeId);
              newLogs.push(`  ${idx + 1}    ${Math.floor(2 + idx * 3)} ms    ${n?.name} [${n?.ip}]`);
            });
            newLogs.push('Spårning slutförd.');
            logType = 'success';
          }
        }
      }
    } else if (action === 'nslookup') {
      if (!targetArg) {
        newLogs.push('Syntaxfel: nslookup <domännamn>');
        logType = 'error';
      } else {
        // Find DNS server in network
        const dnsServer = nodes.find((n) => n.services?.dns && n.on);
        if (!dnsServer) {
          newLogs.push('Server:  UnKnown');
          newLogs.push('Address:  0.0.0.0');
          newLogs.push('*** DNS-begäran timed out. Ingen aktiv DNS-server hittades i nätverket.');
          logType = 'error';
        } else {
          const record = (dnsServer.dnsRecords || []).find(
            (r) => r.hostname.toLowerCase() === targetArg.toLowerCase()
          );
          newLogs.push(`Server:   ${dnsServer.name}`);
          newLogs.push(`Address:  ${dnsServer.ip}`);
          newLogs.push('');
          if (record) {
            newLogs.push(`Namn:    ${record.hostname}`);
            newLogs.push(`Address: ${record.ip}`);
            logType = 'success';
          } else {
            newLogs.push(`*** ${dnsServer.name} hittar inte domänen ${targetArg}: Non-existent domain.`);
            logType = 'error';
          }
        }
      }
    } else if (action === 'nmap') {
      if (!targetArg) {
        newLogs.push('Syntaxfel: nmap <ip eller namn>');
        logType = 'error';
      } else {
        const targetNode = nodes.find(
          (n) =>
            n.ip === targetArg ||
            n.name.toLowerCase().includes(targetArg.toLowerCase())
        );

        if (!targetNode) {
          newLogs.push(`Nmap scan report for ${targetArg}: Host unreachable.`);
          logType = 'error';
        } else {
          newLogs.push(`Starting Nmap 7.94 ( https://nmap.org )`);
          newLogs.push(`Nmap scan report for ${targetNode.name} (${targetNode.ip})`);
          newLogs.push('PORT     STATE  SERVICE');

          if (targetNode.services?.http) newLogs.push('80/tcp   OPEN   http (Nginx/Apache)');
          if (targetNode.services?.dns) newLogs.push('53/udp   OPEN   domain (Bind9)');
          if (targetNode.services?.sql) newLogs.push('3306/tcp OPEN   mysql (Database)');
          if (targetNode.services?.vpn) newLogs.push('1194/udp OPEN   openvpn');
          if (!Object.values(targetNode.services || {}).some(Boolean)) {
            newLogs.push('Alla 1000 skannade portar är stängda (filtered/closed).');
          }
          logType = 'success';
        }
      }
    } else if (action === 'curl') {
      if (!targetArg) {
        newLogs.push('Syntaxfel: curl <ip eller domän>');
        logType = 'error';
      } else {
        const webServer = nodes.find(
          (n) =>
            (n.ip === targetArg || n.name.toLowerCase().includes(targetArg.toLowerCase())) &&
            n.services?.http
        );

        if (!webServer) {
          newLogs.push(`curl: (7) Failed to connect to ${targetArg} port 80: Connection refused.`);
          logType = 'error';
        } else {
          newLogs.push('HTTP/1.1 200 OK');
          newLogs.push('Content-Type: text/html; charset=UTF-8');
          newLogs.push('Server: Nginx/1.24.0 (Enterprise Linux)');
          newLogs.push('');
          newLogs.push(`<html><body><h1>Välkommen till ${webServer.name}!</h1><p>Nätverksportalen fungerar utmärkt.</p></body></html>`);
          logType = 'success';
        }
      }
    } else {
      newLogs.push(`Okänt kommando: '${action}'. Skriv 'help' för lista över kommandon.`);
      logType = 'error';
    }

    setHistory((prev) => [
      ...prev,
      {
        deviceIp: activeDevice.ip || activeDevice.name,
        command: cmd,
        output: newLogs,
        type: logType,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs select-text">
      {/* Top Device Switcher Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 text-sm font-sans">
            Enhets-CLI Terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-sans text-xs">Aktiv Enhet:</label>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans text-xs"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.ip || 'Ingen IP'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Terminal History Log Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950 text-slate-300">
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-cyan-400 font-bold">
                root@{item.deviceIp}:~$
              </span>
              <span className="text-slate-100 font-semibold">{item.command}</span>
            </div>
            <div
              className={`pl-4 border-l-2 text-xs leading-relaxed ${
                item.type === 'success'
                  ? 'border-emerald-500/50 text-emerald-300'
                  : item.type === 'error'
                  ? 'border-rose-500/50 text-rose-300'
                  : 'border-slate-700 text-slate-300'
              }`}
            >
              {item.output.map((line, lIdx) => (
                <div key={lIdx} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input Prompt */}
      <form
        onSubmit={handleRunCommand}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <span className="text-cyan-400 font-bold">
          root@{activeDevice?.ip || 'prompt'}:~$
        </span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="Skriv ett kommando (t.ex. ping 192.168.10.50, help, ipconfig)..."
          className="flex-1 bg-transparent text-slate-100 focus:outline-none placeholder-slate-600 font-mono text-xs"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
