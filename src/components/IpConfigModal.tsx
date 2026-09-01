import React, { useState, useEffect } from 'react';
import {
  Network,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Server,
  Shield,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
} from 'lucide-react';
import { Device } from '../types';
import { maskToCidr } from '../utils/networkEngine';
import { RealisticDeviceIcon } from './RealisticDeviceIcon';

interface IpConfigModalProps {
  node: Device | null;
  nodes: Device[];
  isOpen: boolean;
  onClose: () => void;
  onSaveNode: (updatedNode: Device) => void;
}

// Utility to validate IPv4 format
const isValidIpv4 = (ip: string): boolean => {
  if (!ip) return false;
  const regex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) return false;
  return ip.split('.').every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

export const IpConfigModal: React.FC<IpConfigModalProps> = ({
  node,
  nodes,
  isOpen,
  onClose,
  onSaveNode,
}) => {
  const [ip, setIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [vlanId, setVlanId] = useState(1);
  const [mac, setMac] = useState('');
  const [showIpOnCanvas, setShowIpOnCanvas] = useState(true);
  const [showMacOnCanvas, setShowMacOnCanvas] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (node) {
      setIp(node.ip || '');
      setSubnetMask(node.subnetMask || '255.255.255.0');
      setGateway(node.gateway || '192.168.1.1');
      setVlanId(node.vlanId || 1);
      setMac(node.mac || `00:50:56:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`);
      setShowIpOnCanvas(node.showIpOnCanvas !== false);
      setShowMacOnCanvas(!!node.showMacOnCanvas);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const isIpValid = isValidIpv4(ip);

  // Check if IP is already taken by another node
  const isDuplicateIp = nodes.some(
    (n) => n.id !== node.id && n.ip && n.ip.trim() === ip.trim()
  );

  // Auto-generate next available IP in 192.168.1.x subnet
  const handleAutoDhcp = () => {
    const usedLastOctets = new Set(
      nodes
        .filter((n) => n.id !== node.id && n.ip && n.ip.startsWith('192.168.1.'))
        .map((n) => {
          const parts = n.ip.split('.');
          return parseInt(parts[3], 10);
        })
        .filter((val) => !isNaN(val))
    );

    let nextOctet = 10;
    while (usedLastOctets.has(nextOctet) && nextOctet < 254) {
      nextOctet++;
    }

    setIp(`192.168.1.${nextOctet}`);
    setSubnetMask('255.255.255.0');
    setGateway('192.168.1.1');
  };

  // Generate random MAC address
  const handleRandomizeMac = () => {
    const r = () => Math.floor(16 + Math.random() * 239).toString(16).toUpperCase();
    setMac(`00:50:56:${r()}:${r()}:${r()}`);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!node) return;

    onSaveNode({
      ...node,
      ip: ip.trim(),
      subnetMask: subnetMask.trim(),
      gateway: gateway.trim(),
      vlanId,
      mac: mac.trim(),
      showIpOnCanvas,
      showMacOnCanvas,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in select-text"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl">
              <RealisticDeviceIcon type={node.type} size="md" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>Konfigurera IP-adress</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
                  {node.type}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">{node.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          
          {/* Quick Action: Auto DHCP Button */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <div>
                <div className="font-semibold text-slate-200 text-xs">Automatisk Tilldelning (DHCP)</div>
                <div className="text-[11px] text-slate-400">Hitta nästa lediga IP i 192.168.1.x subnätet</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoDhcp}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Auto-IP
            </button>
          </div>

          {/* IPv4 Address Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-cyan-400" /> IPv4-Adress
              </label>
              {isDuplicateIp ? (
                <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> IP används redan!
                </span>
              ) : isIpValid ? (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Giltigt IPv4-format
                </span>
              ) : ip.length > 0 ? (
                <span className="text-[10px] text-amber-400 font-medium">Ogiltigt format (t.ex. 192.168.1.50)</span>
              ) : null}
            </div>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.50"
              className={`w-full bg-slate-950 border ${
                isDuplicateIp
                  ? 'border-rose-500 focus:border-rose-400'
                  : isIpValid
                  ? 'border-emerald-500/50 focus:border-emerald-400'
                  : 'border-slate-800 focus:border-cyan-500'
              } rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none transition`}
            />
          </div>

          {/* Subnet Mask & Default Gateway in Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Subnätmask</label>
              <select
                value={subnetMask}
                onChange={(e) => setSubnetMask(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none mb-1.5 cursor-pointer"
              >
                <option value="255.255.255.0">255.255.255.0 (/24)</option>
                <option value="255.255.0.0">255.255.0.0 (/16)</option>
                <option value="255.0.0.0">255.0.0.0 (/8)</option>
                <option value="255.255.255.128">255.255.255.128 (/25)</option>
                <option value="255.255.255.240">255.255.255.240 (/28)</option>
              </select>
              <input
                type="text"
                value={subnetMask}
                onChange={(e) => setSubnetMask(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-slate-300 font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-medium">Default Gateway</label>
                {ip.includes('.') && (
                  <button
                    type="button"
                    onClick={() => {
                      const parts = ip.split('.');
                      if (parts.length === 4) {
                        setGateway(`${parts[0]}.${parts[1]}.${parts[2]}.1`);
                      }
                    }}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    .1 Gateway
                  </button>
                )}
              </div>
              <input
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* VLAN & MAC Address */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">VLAN ID (1-4094)</label>
              <input
                type="number"
                min="1"
                max="4094"
                value={vlanId}
                onChange={(e) => setVlanId(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-medium">MAC-Adress</label>
                <button
                  type="button"
                  onClick={handleRandomizeMac}
                  className="text-[10px] text-cyan-400 hover:underline"
                >
                  Slumpa
                </button>
              </div>
              <input
                type="text"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Canvas On-Screen Display Toggles */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Canvas-synlighet (Etiketter bredvid ikonen)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Show IP Toggle */}
              <button
                type="button"
                onClick={() => setShowIpOnCanvas(!showIpOnCanvas)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                  showIpOnCanvas
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {showIpOnCanvas ? (
                    <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="text-[11px] font-semibold truncate">Visa IP</span>
                </div>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                  showIpOnCanvas ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {showIpOnCanvas ? 'PÅ' : 'AV'}
                </span>
              </button>

              {/* Show MAC Toggle */}
              <button
                type="button"
                onClick={() => setShowMacOnCanvas(!showMacOnCanvas)}
                className={`p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                  showMacOnCanvas
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Fingerprint className={`w-3.5 h-3.5 shrink-0 ${showMacOnCanvas ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-semibold truncate">Visa MAC</span>
                </div>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                  showMacOnCanvas ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {showMacOnCanvas ? 'PÅ' : 'AV'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className={`px-5 py-2 rounded-xl font-bold text-slate-950 transition flex items-center gap-2 shadow-lg ${
                savedSuccess
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Sparat!
                </>
              ) : (
                <>Spara IP-inställningar</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
