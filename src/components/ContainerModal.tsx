import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Cloud,
  Shield,
  Server,
  Building,
  Radio,
  Box,
  Check,
  Trash2,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { NetworkContainer, ContainerType, ContainerColor, Device } from '../types';
import { RealisticDeviceIcon } from './RealisticDeviceIcon';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (container: NetworkContainer) => void;
  onSaveContainer?: (container: NetworkContainer) => void;
  onDelete?: (containerId: string) => void;
  onDeleteContainer?: (containerId: string) => void;
  existingContainer?: NetworkContainer | null;
  containerToEdit?: NetworkContainer | null;
  selectedNodeIds?: string[];
  preselectedNodeIds?: string[];
  nodes?: Device[];
  allNodes?: Device[];
}

const CONTAINER_TYPES: Array<{
  id: ContainerType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultColor: ContainerColor;
}> = [
  {
    id: 'subnet_cloud',
    label: 'Subnet-moln',
    desc: 'Visar ett virtuellt IP-subnät eller molnområde',
    icon: Cloud,
    defaultColor: 'cyan',
  },
  {
    id: 'dmz',
    label: 'DMZ Säkerhetszon',
    desc: 'Isolerat område för publika servrar bakom brandvägg',
    icon: Shield,
    defaultColor: 'amber',
  },
  {
    id: 'lan_zone',
    label: 'Kontors-LAN',
    desc: 'Lokalt nätverk för arbetsstationer och skrivare',
    icon: Building,
    defaultColor: 'emerald',
  },
  {
    id: 'datacenter',
    label: 'Datacenter / Serverrack',
    desc: 'Serverhall för databaser, VPN och backend-kluster',
    icon: Server,
    defaultColor: 'indigo',
  },
  {
    id: 'wifi_zone',
    label: 'Trådlös Zon (WLAN)',
    desc: 'Täckningsområde för trådlösa Access Points & mobiler',
    icon: Radio,
    defaultColor: 'purple',
  },
  {
    id: 'custom_box',
    label: 'Anpassad Container',
    desc: 'Generell visuell gruppering och struktureringsram',
    icon: Box,
    defaultColor: 'teal',
  },
];

const COLOR_OPTIONS: Array<{
  id: ContainerColor;
  label: string;
  bgClass: string;
  borderClass: string;
  ringClass: string;
}> = [
  { id: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-500', borderClass: 'border-cyan-400', ringClass: 'ring-cyan-400' },
  { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-400', ringClass: 'ring-emerald-400' },
  { id: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500', borderClass: 'border-indigo-400', ringClass: 'ring-indigo-400' },
  { id: 'amber', label: 'Bärnsten', bgClass: 'bg-amber-500', borderClass: 'border-amber-400', ringClass: 'ring-amber-400' },
  { id: 'rose', label: 'Rosa / Röd', bgClass: 'bg-rose-500', borderClass: 'border-rose-400', ringClass: 'ring-rose-400' },
  { id: 'purple', label: 'Lila', bgClass: 'bg-purple-500', borderClass: 'border-purple-400', ringClass: 'ring-purple-400' },
  { id: 'teal', label: 'Teal', bgClass: 'bg-teal-500', borderClass: 'border-teal-400', ringClass: 'ring-teal-400' },
  { id: 'blue', label: 'Blå', bgClass: 'bg-blue-500', borderClass: 'border-blue-400', ringClass: 'ring-blue-400' },
  { id: 'slate', label: 'Mörk Grå', bgClass: 'bg-slate-500', borderClass: 'border-slate-400', ringClass: 'ring-slate-400' },
];

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveContainer,
  onDelete,
  onDeleteContainer,
  existingContainer,
  containerToEdit,
  selectedNodeIds,
  preselectedNodeIds,
  nodes,
  allNodes,
}) => {
  const actualNodes = allNodes || nodes || [];
  const actualSelectedNodeIds = preselectedNodeIds || selectedNodeIds || [];
  const actualContainer = containerToEdit || existingContainer || null;
  const saveFn = onSaveContainer || onSave;
  const deleteFn = onDeleteContainer || onDelete;

  const [name, setName] = useState('');
  const [type, setType] = useState<ContainerType>('subnet_cloud');
  const [subnet, setSubnet] = useState('');
  const [color, setColor] = useState<ContainerColor>('cyan');
  const [memberNodeIds, setMemberNodeIds] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (actualContainer) {
      setName(actualContainer.name);
      setType(actualContainer.type);
      setSubnet(actualContainer.subnet || '');
      setColor(actualContainer.color);
      setMemberNodeIds(actualContainer.nodeIds || []);
      setIsCollapsed(!!actualContainer.isCollapsed);
    } else {
      // New container initialization
      const initialNodes = actualSelectedNodeIds.length > 0 ? actualSelectedNodeIds : actualNodes.slice(0, 2).map((n) => n.id);
      setMemberNodeIds(initialNodes);
      setType('subnet_cloud');
      setColor('cyan');
      setIsCollapsed(false);

      // Auto-detect sensible default name & subnet from member nodes
      const sampleNode = actualNodes.find((n) => initialNodes.includes(n.id));
      if (sampleNode && sampleNode.ip) {
        const parts = sampleNode.ip.split('.');
        if (parts.length === 4) {
          setSubnet(`${parts[0]}.${parts[1]}.${parts[2]}.0/24`);
          setName(`Subnät ${parts[0]}.${parts[1]}.${parts[2]}.0`);
        } else {
          setName('Nytt Subnet-moln');
          setSubnet('192.168.1.0/24');
        }
      } else {
        setName('Nytt Subnet-moln');
        setSubnet('192.168.1.0/24');
      }
    }
  }, [actualContainer, isOpen, actualSelectedNodeIds, actualNodes]);

  if (!isOpen) return null;

  const handleToggleMember = (id: string) => {
    setMemberNodeIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setMemberNodeIds(actualNodes.map((n) => n.id));
  };

  const handleClearAllMembers = () => {
    setMemberNodeIds([]);
  };

  const handleTypeChange = (newType: ContainerType) => {
    setType(newType);
    const def = CONTAINER_TYPES.find((t) => t.id === newType);
    if (def && (!actualContainer || color === actualContainer.color)) {
      setColor(def.defaultColor);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const containerData: NetworkContainer = {
      id: actualContainer?.id || 'c_' + Date.now().toString(36),
      name: name.trim(),
      type,
      subnet: subnet.trim() || undefined,
      color,
      nodeIds: memberNodeIds,
      isCollapsed,
      collapsedX: actualContainer?.collapsedX,
      collapsedY: actualContainer?.collapsedY,
    };

    if (saveFn) saveFn(containerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {existingContainer ? 'Redigera Container / Subnet-moln' : 'Skapa Nätverks-Container'}
              </h2>
              <p className="text-xs text-slate-400">
                Gruppera och strukturera enheter i visuella zoner och moln
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Container Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Typ av Zon / Container
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {CONTAINER_TYPES.map((t) => {
                const IconComponent = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeChange(t.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-white">{t.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 leading-relaxed">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Subnet row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Containernamn / Område
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="T.ex. DMZ Webbservrar eller Ekonomi VLAN 10"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subnät / VLAN Tag (Valfritt)
              </label>
              <input
                type="text"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                placeholder="T.ex. 192.168.10.0/24 eller VLAN 20"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Färgtema
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? `bg-slate-800 ${c.borderClass} text-white ring-2 ${c.ringClass}`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bgClass}`} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapse state toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                {isCollapsed ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">
                  Komprimera till Subnet-moln (Kompakt vy)
                </div>
                <div className="text-[11px] text-slate-400">
                  Döljer enheterna inuti ett smidigt moln på canvasen för att spara plats
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                isCollapsed
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isCollapsed ? 'Kompakt Moln' : 'Expanderad Ram'}
            </button>
          </div>

          {/* Member Devices Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>Inkluderade Enheter ({memberNodeIds.length} st)</span>
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-cyan-400 hover:text-cyan-300 transition"
                >
                  Välj alla
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleClearAllMembers}
                  className="text-slate-400 hover:text-slate-300 transition"
                >
                  Rensa val
                </button>
              </div>
            </div>

            {actualNodes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                Inga enheter finns på canvasen ännu.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {actualNodes.map((node) => {
                  const isChecked = memberNodeIds.includes(node.id);
                  return (
                    <div
                      key={node.id}
                      onClick={() => handleToggleMember(node.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/60 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <RealisticDeviceIcon type={node.type} className="w-5 h-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{node.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {node.ip || 'Inget IP'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {actualContainer && deleteFn ? (
              <button
                type="button"
                onClick={() => {
                  deleteFn(actualContainer.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Upplös container</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{actualContainer ? 'Spara Ändringar' : 'Skapa Container'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
