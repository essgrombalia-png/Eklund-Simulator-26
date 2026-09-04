import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Copy, Check, X, Clock, RotateCcw, ShieldCheck, Sparkles, FileJson, FolderOpen, FileUp, Save } from 'lucide-react';
import { Device, Link, NetworkContainer, StickyNote } from '../types';

interface ExportImportModalProps {
  nodes: Device[];
  links: Link[];
  containers?: NetworkContainer[];
  stickyNotes?: StickyNote[];
  lastAutoSavedTime?: string | null;
  onImportTopology: (data: { nodes: Device[]; links: Link[]; containers?: NetworkContainer[]; stickyNotes?: StickyNote[] }) => void;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  nodes,
  links,
  containers = [],
  stickyNotes = [],
  lastAutoSavedTime,
  onImportTopology,
  onClose,
}) => {
  const currentJson = JSON.stringify({ nodes, links, containers, stickyNotes }, null, 2);
  const [jsonText, setJsonText] = useState(currentJson);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [backupData, setBackupData] = useState<{
    nodes: Device[];
    links: Link[];
    containers: NetworkContainer[];
    stickyNotes?: StickyNote[];
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

  // Direct File Download (.json)
  const handleDownloadFile = () => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `eklund_natverk_backup_${dateStr}_${timeStr}.json`;

      const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setSuccessMsg(`Exporterade "${filename}" framgångsrikt!`);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg('Kunde inte skapa JSON-filen för nedladdning.');
    }
  };

  // Direct File Upload from File Browser
  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setErrorMsg('Vänligen välj en giltig .json-fil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) {
          throw new Error('Ogiltigt JSON-format: Förväntade "nodes" och "links" matriser.');
        }

        setJsonText(JSON.stringify(parsed, null, 2));
        setErrorMsg('');
        setSuccessMsg(`Läste in "${file.name}"! Klicka "Verkställ Import" för att applicera på canvas.`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Kunde inte tolka den valda JSON-filen.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Ett fel uppstod vid läsning av filen.');
    };
    reader.readAsText(file);
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
        stickyNotes: Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [],
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
        stickyNotes: backupData.stickyNotes || [],
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base font-sans leading-tight">
                Exportera & Importera Projekt (JSON)
              </h2>
              <p className="text-[11px] text-slate-400">
                Säkerhetskopiera, ladda ner eller dela din nätverkstopologi med andra.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topology Summary Bar */}
        <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs shrink-0">
          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Enheter</div>
            <div className="text-sm font-black font-mono text-cyan-400">{nodes.length} st</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Länkar</div>
            <div className="text-sm font-black font-mono text-amber-400">{links.length} st</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Zoner</div>
            <div className="text-sm font-black font-mono text-emerald-400">{containers.length} st</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Post-it</div>
            <div className="text-sm font-black font-mono text-purple-400">{stickyNotes.length} st</div>
          </div>
        </div>

        {/* Auto-Save Status Banner */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 shrink-0">
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
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm cursor-pointer"
              title="Läs in den senaste automatiskt sparade topologin från LocalStorage"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Återställ sparad</span>
            </button>
          )}
        </div>

        {/* Primary Export & File Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
          {/* Export JSON File Button */}
          <button
            type="button"
            onClick={handleDownloadFile}
            className="py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-cyan-950/40 cursor-pointer active:scale-98"
          >
            {downloadSuccess ? (
              <Check className="w-4 h-4 text-slate-950" />
            ) : (
              <Download className="w-4 h-4 fill-slate-950" />
            )}
            <span>Ladda ner projekt.json</span>
          </button>

          {/* Import JSON File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs border border-amber-500/40 hover:border-amber-400 cursor-pointer active:scale-98"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Välj .json-fil från dator...</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0">
            {successMsg}
          </div>
        )}

        {/* Textarea Drag & Drop Zone */}
        <div
          className={`flex-1 min-h-[160px] flex flex-col relative rounded-xl border transition-all ${
            isDraggingFile
              ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-500/40'
              : 'border-slate-800 bg-slate-950'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/50 rounded-t-xl">
            <span className="font-mono text-cyan-400 font-bold">JSON Konfiguration</span>
            <span>Dra & släpp en .json-fil här eller redigera manuellt</span>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="w-full flex-1 bg-transparent p-3 font-mono text-xs text-cyan-300 focus:outline-none custom-scrollbar resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 shrink-0 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-xs border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopierad till urklipp!' : 'Kopiera JSON-kod'}</span>
          </button>

          <button
            onClick={handleImport}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-950/30 cursor-pointer active:scale-98"
          >
            <Upload className="w-4 h-4" />
            <span>Verkställ Import till Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

