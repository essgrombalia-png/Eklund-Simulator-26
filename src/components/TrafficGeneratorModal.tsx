import React, { useState } from 'react';
import { Zap, ShieldAlert, Activity, Play, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Device, Link, CapturedPacket } from '../types';
import { findPathAndSimulate, createCapturePacket } from '../utils/networkEngine';

interface TrafficGeneratorModalProps {
  nodes: Device[];
  links: Link[];
  onAddPackets: (packets: CapturedPacket[]) => void;
  onTriggerAnimation: (linkIds: string[]) => void;
  onClose: () => void;
}

export const TrafficGeneratorModal: React.FC<TrafficGeneratorModalProps> = ({
  nodes,
  links,
  onAddPackets,
  onTriggerAnimation,
  onClose,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    nodes[0] ? nodes[0].id : ''
  );
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    nodes[nodes.length - 1] ? nodes[nodes.length - 1].id : ''
  );
  const [trafficType, setTrafficType] = useState<
    'http' | 'syn_flood' | 'port_scan' | 'voip'
  >('http');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const handleStartTraffic = () => {
    const srcNode = nodes.find((n) => n.id === selectedSourceId);
    const dstNode = nodes.find((n) => n.id === selectedTargetId);

    if (!srcNode || !dstNode) return;

    setIsRunning(true);
    setSimulationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Startar simulerad ${trafficType.toUpperCase()} trafik från ${srcNode.name} till ${dstNode.name}...`,
    ]);

    const generatedPackets: CapturedPacket[] = [];

    if (trafficType === 'http') {
      const res = findPathAndSimulate(srcNode.id, dstNode.id, nodes, links, 'HTTP', 80);
      onTriggerAnimation(res.pathLinks.map((l) => l.id));

      for (let i = 0; i < 5; i++) {
        generatedPackets.push(
          createCapturePacket(
            srcNode,
            dstNode,
            'HTTP',
            res.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
            `GET /index.html HTTP/1.1 [Host: ${dstNode.ip}]`,
            res.pathNodes.length
          )
        );
      }

      setSimulationLogs((prev) => [
        ...prev,
        res.success
          ? `HTTP GET lyckades! Svarstid: ${res.latencyMs} ms, Status 200 OK.`
          : `HTTP Trafik stoppades! Kontrollera brandväggsregler.`,
      ]);
    } else if (trafficType === 'syn_flood') {
      const res = findPathAndSimulate(srcNode.id, dstNode.id, nodes, links, 'MALWARE', 80);
      onTriggerAnimation(res.pathLinks.map((l) => l.id));

      for (let i = 0; i < 12; i++) {
        generatedPackets.push(
          createCapturePacket(
            srcNode,
            dstNode,
            'MALWARE',
            res.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
            `ATTACK: SYN Flood / Malicious Packet #${i + 1}`,
            res.pathNodes.length
          )
        );
      }

      setSimulationLogs((prev) => [
        ...prev,
        res.success
          ? `VARNING: SYN Flood nådde målenheten ${dstNode.name}! (Ingen brandvägg blockerar).`
          : `SÄKERHETSLARM: Next-Gen Brandvägg upptäckte och stoppade överbelastningsattacken!`,
      ]);
    } else if (trafficType === 'port_scan') {
      const res = findPathAndSimulate(srcNode.id, dstNode.id, nodes, links, 'TCP');
      onTriggerAnimation(res.pathLinks.map((l) => l.id));

      const portsToScan = [80, 443, 22, 3306, 53];
      portsToScan.forEach((p) => {
        generatedPackets.push(
          createCapturePacket(
            srcNode,
            dstNode,
            'TCP',
            res.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
            `NMAP SCAN: Testing Port ${p}/tcp`,
            res.pathNodes.length
          )
        );
      });

      setSimulationLogs((prev) => [
        ...prev,
        `Portskanning slutförd! ${portsToScan.length} portar inspekterade på ${dstNode.name}.`,
      ]);
    } else if (trafficType === 'voip') {
      const res = findPathAndSimulate(srcNode.id, dstNode.id, nodes, links, 'UDP', 5060);
      onTriggerAnimation(res.pathLinks.map((l) => l.id));

      for (let i = 0; i < 6; i++) {
        generatedPackets.push(
          createCapturePacket(
            srcNode,
            dstNode,
            'UDP',
            res.success ? 'SUCCESS' : 'DROPPED_FIREWALL',
            `RTP Audio Stream Packet [VoIP Call ${i + 1}]`,
            res.pathNodes.length
          )
        );
      }

      setSimulationLogs((prev) => [
        ...prev,
        res.success
          ? `VoIP Samtalssession upprättad. Låg latency (${res.latencyMs}ms).`
          : `VoIP Samtal misslyckades. Länken är nere eller blockeras.`,
      ]);
    }

    onAddPackets(generatedPackets);
    setTimeout(() => setIsRunning(false), 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-base font-sans">
              Trafikgenerator & Cybersäkerhetssimulering
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source & Target Selector */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 text-xs mb-1 font-medium">
              Källenhet (Sändare)
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.ip})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 font-medium">
              Målenhet (Mottagare)
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.ip})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Traffic Scenario Type */}
        <div>
          <label className="block text-slate-400 text-xs mb-1.5 font-medium">
            Trafikmönster / Simulationstyp
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTrafficType('http')}
              className={`p-3 rounded-xl border text-left transition ${
                trafficType === 'http'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-slate-200">HTTP Webbtrafik</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Standard webbsideförfrågan (Port 80)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTrafficType('syn_flood')}
              className={`p-3 rounded-xl border text-left transition ${
                trafficType === 'syn_flood'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> SYN Flood Attack
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Simulera DDoS-angrepp mot brandvägg
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTrafficType('port_scan')}
              className={`p-3 rounded-xl border text-left transition ${
                trafficType === 'port_scan'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-slate-200">Nmap Portskanning</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Sök efter öppna portar och tjänster
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTrafficType('voip')}
              className={`p-3 rounded-xl border text-left transition ${
                trafficType === 'voip'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-slate-200">VoIP Samtalsström</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Realtids strömmande UDP-ljuddata
              </div>
            </button>
          </div>
        </div>

        {/* Console Logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-28 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 custom-scrollbar">
          {simulationLogs.length === 0 ? (
            <div className="text-slate-600 italic">
              Klicka på "Starta Trafiksimulering" för att köra testet...
            </div>
          ) : (
            simulationLogs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartTraffic}
          disabled={isRunning}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isRunning ? 'Simulerar paket...' : 'Starta Trafiksimulering'}</span>
        </button>
      </div>
    </div>
  );
};
