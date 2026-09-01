import React, { useState } from 'react';
import { Calculator, X, Network, Copy, Check } from 'lucide-react';
import { ipToInt, intToIp, cidrToMask, maskToCidr } from '../utils/networkEngine';

interface SubnetCalculatorModalProps {
  onClose: () => void;
}

export const SubnetCalculatorModal: React.FC<SubnetCalculatorModalProps> = ({
  onClose,
}) => {
  const [ipInput, setIpInput] = useState('192.168.1.100');
  const [cidrInput, setCidrInput] = useState(24);
  const [copied, setCopied] = useState(false);

  // Subnet calculations
  const maskStr = cidrToMask(cidrInput);
  const ipInt = ipToInt(ipInput) || 0;
  const maskInt = ipToInt(maskStr) || 0;
  const wildcardInt = (~maskInt) >>> 0;

  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const networkStr = intToIp(networkInt);
  const broadcastStr = intToIp(broadcastInt);
  const wildcardStr = intToIp(wildcardInt);

  const totalHosts = cidrInput >= 31 ? 0 : Math.pow(2, 32 - cidrInput) - 2;
  const firstHost = cidrInput >= 31 ? 'N/A' : intToIp(networkInt + 1);
  const lastHost = cidrInput >= 31 ? 'N/A' : intToIp(broadcastInt - 1);

  const handleCopySummary = () => {
    const text = `IP: ${ipInput}/${cidrInput}\nSubnet Mask: ${maskStr}\nNetwork: ${networkStr}\nBroadcast: ${broadcastStr}\nRange: ${firstHost} - ${lastHost}\nTotal Usable Hosts: ${totalHosts}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-base font-sans">
              IP Subnät-kalkylator (CIDR)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">IP-adress</label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">CIDR Prefix</label>
            <select
              value={cidrInput}
              onChange={(e) => setCidrInput(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 font-mono focus:border-cyan-500 focus:outline-none"
            >
              {Array.from({ length: 25 }, (_, i) => i + 8).map((bits) => (
                <option key={bits} value={bits}>
                  /{bits} ({cidrToMask(bits)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculated Results Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Subnätmask:</span>
            <span className="text-cyan-400 font-semibold">{maskStr}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Wildcard Mask:</span>
            <span className="text-slate-300">{wildcardStr}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Nätverksadress (ID):</span>
            <span className="text-emerald-400 font-semibold">{networkStr}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Broadcast Adress:</span>
            <span className="text-amber-400 font-semibold">{broadcastStr}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Användbart IP-omfång:</span>
            <span className="text-slate-200 font-semibold">
              {firstHost} – {lastHost}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Totalt antal värdar (Hosts):</span>
            <span className="text-cyan-300 font-bold">{totalHosts.toLocaleString()} st</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleCopySummary}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-xs border border-slate-700"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Kopierat till Urklipp!' : 'Kopiera Subnäts-sammanfattning'}</span>
        </button>
      </div>
    </div>
  );
};
