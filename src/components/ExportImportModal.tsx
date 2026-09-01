import React, { useState, useEffect } from 'react';
import { Download, Upload, Copy, Check, X, Clock, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Device, Link, NetworkContainer } from '../types';

interface ExportImportModalProps {
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
  lastAutoSavedTime?: string | null;
  onImportTopology: (data: { nodes: Device[]; links: Link[]; containers?: NetworkContainer[] }) => void;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  nodes,
  links,
  containers = [],
  lastAutoSavedTime,
  onImportTopology,
  onClose,
}) => {
  const currentJson = JSON.stringify({ nodes, links, containers }, null, 2);
  const [jsonText, setJsonText] = useState(currentJson);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [backupData, setBackupData] = useState<{
    nodes: Device[];
    links: Link[];
    containers: NetworkContainer[];
    timestamp: string;
    formattedTime: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eklund_topology_autosave');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.nodes)) {
          setBackupData(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not parse localStorage autosave', e);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) {
        throw new Error('Ogiltigt format: Förväntade "nodes" och "links" matriser.');
      }
      onImportTopology({
        nodes: parsed.nodes,
        links: parsed.links,
        containers: Array.isArray(parsed.containers) ? parsed.containers : [],
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Kunde inte tolka JSON-data.');
    }
  };

  const handleLoadAutoSave = () => {
    if (backupData) {
      onImportTopology({
        nodes: backupData.nodes,
        links: backupData.links,
        containers: backupData.containers || [],
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-base font-sans">
              Exportera & Importera Nätverk (JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-Save Status Banner */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Automatisk säkerhetskopiering</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Sparar automatiskt till LocalStorage var 30:e sekund.{' '}
                {lastAutoSavedTime ? (
                  <span className="text-cyan-400 font-mono font-semibold">
                    Senast: {lastAutoSavedTime}
                  </span>
                ) : backupData?.formattedTime ? (
                  <span className="text-cyan-400 font-mono font-semibold">
                    Senast: {backupData.formattedTime}
                  </span>
                ) : (
                  <span>Aktiv</span>
                )}
              </div>
            </div>
          </div>

          {backupData && (
            <button
              type="button"
              onClick={handleLoadAutoSave}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm"
              title="Läs in den senaste automatiskt sparade topologin från LocalStorage"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Återställ sparad</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Spara din nuvarande nätverkstopologi genom att kopiera koden nedan, eller klistra in en sparad konfiguration för att läsa in den.
        </p>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setErrorMsg('');
          }}
          className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 custom-scrollbar"
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-xs border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopierad!' : 'Kopiera JSON'}</span>
          </button>

          <button
            onClick={handleImport}
            className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-cyan-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Importera Nätverk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
