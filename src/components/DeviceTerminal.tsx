import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, X, CornerDownLeft, RefreshCw, Cpu, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { Device, Link } from '../types';
import { findPathAndSimulate } from '../utils/networkEngine';

interface DeviceTerminalProps {
  nodes: Device[];
  links: Link[];
  initialNodeId?: string | null;
  onClose?: () => void;
  onUpdateNode?: (node: Device) => void;
  isMini?: boolean;
  onMaximize?: () => void;
}

interface CommandHistory {
  deviceIp: string;
  command: string;
  prompt: string;
  output: string[];
  type: 'info' | 'success' | 'error';
}

export const DeviceTerminal: React.FC<DeviceTerminalProps> = ({
  nodes,
  links,
  initialNodeId,
  onClose,
  onUpdateNode,
  isMini = false,
  onMaximize,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initialNodeId || (nodes[0] ? nodes[0].id : '')
  );
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>(['help', 'ipconfig', 'ping 192.168.1.1']);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const activeDevice = nodes.find((n) => n.id === selectedNodeId);

  // Helper to determine prompt string based on device type
  const getPromptString = (device?: Device) => {
    if (!device) return 'sys@eklund:~#';
    const name = device.name.toLowerCase().replace(/\s+/g, '-');
    const type = device.type;
    if (type === 'router' || type === 'wifi_router') {
      return `${device.name}>`;
    }
    if (type === 'switch' || type === 'l3_switch' || type === 'wifi_ap') {
      return `${device.name}#`;
    }
    if (type === 'firewall') {
      return `${device.name}(config)#`;
    }
    if (type.startsWith('server_')) {
      return `[root@${name} ~]#`;
    }
    return `[user@${name} ~]$`;
  };

  const [history, setHistory] = useState<CommandHistory[]>([
    {
      deviceIp: 'SYSTEM',
      command: 'sys_init',
      prompt: 'sys@eklund:~#',
      output: [
        '┌────────────────────────────────────────────────────────────────┐',
        '│  Eklund OS Enterprise CLI Engine v26.4.1-LTS                   │',
        '│  Secured Network Terminal Sandbox & Virtual IOS Simulation     │',
        '└────────────────────────────────────────────────────────────────┘',
        '[OK] Loading microkernel subsystems...',
        '[OK] Initializing memory management layout (64-bit address space)',
        '[OK] Mounting devfs, procfs and sysfs directories',
        '[OK] Launching loopback interface (lo0) on 127.0.0.1/8',
        '[OK] Cryptography engine: RSA-4096 / AES-256-GCM hardware-accelerated',
        '[OK] Virtual switchports mapped & Ethernet cabling verified',
        '[INFO] Welcome back, Administrator. Security auditing level: SEC_LEVEL_HIGH',
        '',
        'Skriv "help" för att visa alla tillgängliga nätverkskommandon.',
        'Snabba kommandon: ping <ip|namn>, traceroute <ip>, ipconfig, nmap <ip>, curl <ip>',
      ],
      type: 'info',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialNodeId && nodes.some((n) => n.id === initialNodeId)) {
      setSelectedNodeId(initialNodeId);
    }
  }, [initialNodeId, nodes]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const availableCmds = ['help', 'ping', 'traceroute', 'ipconfig', 'nslookup', 'nmap', 'curl', 'clear'];
      const currentVal = inputCommand.trim().toLowerCase();
      if (!currentVal) return;
      const match = availableCmds.find(c => c.startsWith(currentVal));
      if (match) {
        setInputCommand(match + ' ');
      }
    }
  };

  // Synchronize internal select state when initialNodeId prop updates
  useEffect(() => {
    if (initialNodeId) {
      setSelectedNodeId(initialNodeId);
    }
  }, [initialNodeId]);

  const handleRunCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = inputCommand.trim();
    if (!cmd || !activeDevice) return;

    setCommandHistory((prev) => {
      if (prev[prev.length - 1] === cmd) return prev;
      return [...prev, cmd];
    });
    setHistoryIndex(-1);

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
        prompt: getPromptString(activeDevice),
        output: newLogs,
        type: logType,
      },
    ]);
  };

  const currentPrompt = getPromptString(activeDevice);

  // CPU utilization metrics simulation for UI realism
  const getSimulatedCpu = () => {
    if (!activeDevice) return '0%';
    if (!activeDevice.on) return 'OFFLINE';
    // Base loads based on device type
    const base = activeDevice.type.startsWith('server') ? 12 : activeDevice.type === 'firewall' ? 8 : 2;
    const randomShift = Math.floor(Math.random() * 5);
    return `${base + randomShift}%`;
  };

  return (
    <div className={`flex flex-col bg-slate-950 font-mono text-xs select-text border rounded-2xl overflow-hidden shadow-2xl transition-all ${
      isMini
        ? 'h-80 md:h-96 w-full max-w-xl border-cyan-500/40 shadow-cyan-950/60 backdrop-blur-xl'
        : 'h-full border-slate-800'
    }`}>
      {/* Top Professional Window Header */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md shrink-0">
        {/* Virtual Terminal Tab Icon / OS dots */}
        <div className="flex items-center gap-2.5">
          {/* OS-Style Action Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              onClick={onClose}
              className={`w-3 h-3 rounded-full bg-red-500/80 border border-red-600/30 block shadow-inner ${
                onClose ? 'cursor-pointer hover:bg-red-400' : ''
              }`}
              title="Stäng fönster"
            />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/30 block shadow-inner" />
            <span
              onClick={onMaximize}
              className={`w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/30 block shadow-inner ${
                onMaximize ? 'cursor-pointer hover:bg-emerald-400' : ''
              }`}
              title="Fullskärm / Flik"
            />
          </div>
          <span className="text-slate-600 text-xs px-0.5">|</span>
          <div className="flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200 text-xs font-sans tracking-wide">
              {isMini ? 'Mini-CLI Console' : 'CLI Console Session'}
            </span>
            {isMini && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </div>
        </div>

        {/* Info badges and controls */}
        <div className="flex items-center gap-2">
          {activeDevice && activeDevice.on && !isMini && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800 text-[10px] text-slate-400 font-sans">
              <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>LOAD: <strong className="text-cyan-300 font-mono">{getSimulatedCpu()}</strong></span>
            </div>
          )}

          {/* Wipe button */}
          <button
            onClick={() => setHistory([])}
            title="Rensa skärmen"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800/60 text-slate-400 hover:text-slate-100 transition text-[10px] font-sans cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Rensa</span>
          </button>

          {/* Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 pl-2 pr-1 py-0.5 rounded-lg border border-slate-800/80">
            <label className="text-slate-400 font-sans text-[10px] font-medium hidden sm:inline">Enhet:</label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="bg-slate-900 border-0 text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-sans text-[11px] py-1 px-1.5 cursor-pointer font-semibold max-w-[130px] truncate"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.ip || 'DHCP'})
                </option>
              ))}
            </select>
          </div>

          {/* Mini mode Maximize & Close buttons */}
          {isMini && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              {onMaximize && (
                <button
                  type="button"
                  onClick={onMaximize}
                  title="Öppna i full flik"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  title="Stäng Mini-Terminal"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terminal History Log Window */}
      <div className={`flex-1 overflow-y-auto ${isMini ? 'p-3 space-y-2.5 text-[11px]' : 'p-5 space-y-4 text-xs'} bg-slate-950/95 text-slate-300 scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed`}>
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-cyan-400 font-bold font-mono">
                {item.prompt}
              </span>
              <span className="text-slate-100 font-semibold">{item.command}</span>
            </div>
            <div
              className={`pl-3 border-l-2 leading-relaxed ${
                item.type === 'success'
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/[0.02] py-0.5 pr-1.5 rounded-r'
                  : item.type === 'error'
                  ? 'border-rose-500/50 text-rose-400 bg-rose-500/[0.02] py-0.5 pr-1.5 rounded-r'
                  : 'border-slate-800 text-slate-300 bg-slate-900/[0.01]'
              }`}
            >
              {item.output.map((line, lIdx) => (
                <div key={lIdx} className="whitespace-pre-wrap font-mono">
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
        className={`${isMini ? 'p-2.5' : 'p-4'} bg-slate-900/80 border-t border-slate-800/90 flex items-center gap-2 shrink-0`}
      >
        <span className="text-cyan-400 font-bold font-mono select-none">
          {currentPrompt}
        </span>
        <div className="flex-1 flex items-center relative">
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ett kommando (t.ex. ping, help, ipconfig, traceroute)..."
            className="w-full bg-transparent text-slate-100 focus:outline-none placeholder-slate-600 font-mono text-xs pr-4 border-0 focus:ring-0"
            autoFocus
          />
          <span className="absolute right-0 w-1.5 h-3.5 bg-cyan-400 animate-pulse pointer-events-none" />
        </div>
        <button
          type="submit"
          className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center justify-center cursor-pointer shadow-md shadow-cyan-500/10 active:scale-95"
          title="Kör kommando"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
