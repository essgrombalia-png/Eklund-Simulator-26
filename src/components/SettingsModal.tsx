import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  User,
  Sliders,
  Network,
  ShieldAlert,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Upload,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  FileCode,
  Download,
  Terminal,
  Grid,
  Radio,
  Eye,
  Layers,
  Cpu,
  Monitor,
  Activity,
  AlertTriangle,
  Sun,
  Moon,
  Presentation,
} from 'lucide-react';
import {
  AdvancedSettings,
  UserProfile,
  SimulatorThemeId,
  CanvasGridStyle,
  UserStatusBadge,
  CableType,
} from '../types';
import {
  SIMULATOR_THEMES,
  AVATAR_PRESETS,
  DEFAULT_ADVANCED_SETTINGS,
} from '../utils/themeManager';
import { UserAvatar } from './UserAvatar';
import { playSound } from '../utils/audioSynth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdvancedSettings;
  onUpdateSettings: (newSettings: AdvancedSettings) => void;
  userProfile?: UserProfile | null;
  onUpdateProfile?: (newProfile: UserProfile) => void;
  onUpdateUserProfile?: (newProfile: UserProfile) => void;
  currentUserEmail?: string;
  onResetAllSettings?: () => void;
  lastAutoSavedTime?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  userProfile,
  onUpdateProfile,
  onUpdateUserProfile,
  currentUserEmail,
  onResetAllSettings,
  lastAutoSavedTime,
}) => {
  const [activeTab, setActiveTab] = useState<
    'theme' | 'profile' | 'simulation' | 'network' | 'security' | 'data'
  >('theme');

  const defaultProfile: UserProfile = {
    username: currentUserEmail ? currentUserEmail.split('@')[0] : 'Operatör',
    email: currentUserEmail || 'operator@eklund.se',
    avatarId: 'avatar_cyber_hacker',
    roleTitle: 'Nätverksarkitekt',
    statusBadge: 'active',
  };

  const [localSettings, setLocalSettings] = useState<AdvancedSettings>(settings);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile || defaultProfile);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setLocalProfile(userProfile || defaultProfile);
      setSaveSuccessMsg(null);
      setAvatarUploadError(null);
      setShowResetConfirm(false);
    }
  }, [isOpen, settings, userProfile]);

  if (!isOpen) return null;

  const triggerProfileUpdate = (newProfile: UserProfile) => {
    if (typeof onUpdateProfile === 'function') {
      onUpdateProfile(newProfile);
    }
    if (typeof onUpdateUserProfile === 'function') {
      onUpdateUserProfile(newProfile);
    }
  };

  const handleApplyTheme = (themeId: SimulatorThemeId) => {
    const updated = { ...localSettings, themeId };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    try {
      localStorage.setItem('eklund_system_theme', themeId);
      localStorage.setItem('eklund_advanced_settings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
    playSound('theme_switch', localSettings.soundEffectsEnabled, localSettings.soundVolume);
  };

  const handleSettingChange = <K extends keyof AdvancedSettings>(
    key: K,
    value: AdvancedSettings[K]
  ) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleProfileChange = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => {
    const updated = { ...localProfile, [key]: value };
    setLocalProfile(updated);
  };

  const handleSaveProfileAndClose = () => {
    triggerProfileUpdate(localProfile);
    onUpdateSettings(localSettings);
    playSound('save', localSettings.soundEffectsEnabled, localSettings.soundVolume);
    setSaveSuccessMsg('Inställningar och profil sparades framgångsrikt!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 500);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Endast bildfiler (PNG, JPG, WebP, GIF) stöds.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError('Bilden är för stor (Max 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleProfileChange('avatarCustomUrl', dataUrl);
      playSound('click', localSettings.soundEffectsEnabled, localSettings.soundVolume);
    };
    reader.readAsDataURL(file);
  };

  const handleExportConfig = () => {
    const payload = {
      profile: localProfile,
      settings: localSettings,
      exportedAt: new Date().toISOString(),
      app: 'Eklund Network Simulator v26',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eklund-settings-${(localProfile.username || 'user').toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('save', localSettings.soundEffectsEnabled, localSettings.soundVolume);
    setSaveSuccessMsg('Inställningsfil har laddats ned!');
    setTimeout(() => setSaveSuccessMsg(null), 2000);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) {
          setLocalSettings(parsed.settings);
          onUpdateSettings(parsed.settings);
        }
        if (parsed.profile) {
          setLocalProfile(parsed.profile);
          triggerProfileUpdate(parsed.profile);
        }
        playSound('repair', true, 0.5);
        setSaveSuccessMsg('Inställningar importerades framgångsrikt!');
        setTimeout(() => setSaveSuccessMsg(null), 2000);
      } catch (err) {
        setAvatarUploadError('Kunde inte läsa inställningsfilen. Kontrollera JSON-formatet.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    const freshDefaults = { ...DEFAULT_ADVANCED_SETTINGS };
    setLocalSettings(freshDefaults);
    onUpdateSettings(freshDefaults);
    if (typeof onResetAllSettings === 'function') {
      onResetAllSettings();
    }
    playSound('theme_switch', true, 0.5);
    setShowResetConfirm(false);
    setSaveSuccessMsg('Inställningar återställda till fabriksstandard!');
    setTimeout(() => setSaveSuccessMsg(null), 2000);
  };

  const currentTheme = SIMULATOR_THEMES[localSettings.themeId] || SIMULATOR_THEMES.cyber_matrix;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          borderColor: currentTheme.borderPrimary || '#1e293b',
          boxShadow: `0 0 35px ${currentTheme.accentPrimary}22`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border border-slate-800"
              style={{ backgroundColor: `${currentTheme.accentPrimary}15` }}
            >
              <Sliders className="w-5 h-5" style={{ color: currentTheme.accentPrimary }} />
            </div>
            <div>
              <h2 className="text-lg font-orbitron font-extrabold text-white flex items-center gap-2">
                Inställningar & Profil
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                  v26 Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-space">
                Anpassa simulatortema, din användarprofil och simulatorns motor
              </p>
            </div>
          </div>

          {/* Quick System Theme Switch & Close Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl shadow-inner">
              <button
                onClick={() => handleApplyTheme('cyber_matrix')}
                title="Cyber Matrix (Mörkt cyber-tema)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  localSettings.themeId !== 'blueprint_light'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Cyber Matrix</span>
              </button>
              <button
                onClick={() => handleApplyTheme('blueprint_light')}
                title="Blueprint Ljustema (Presentationsläge / Ritning)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  localSettings.themeId === 'blueprint_light'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px]">Blueprint</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto custom-scrollbar">
          {[
            { id: 'theme', label: 'Tema & Design', icon: <Palette className="w-4 h-4" /> },
            { id: 'profile', label: 'Min Profil & Bild', icon: <User className="w-4 h-4" /> },
            { id: 'simulation', label: 'Simulering & Motor', icon: <Cpu className="w-4 h-4" /> },
            { id: 'network', label: 'Nätverksstandarder', icon: <Network className="w-4 h-4" /> },
            { id: 'security', label: 'Säkerhet & Labb', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'data', label: 'Backup & Återställning', icon: <Save className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playSound('click', localSettings.soundEffectsEnabled, localSettings.soundVolume);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left bg-slate-900/60">
          {/* TAB 1: THEME & DESIGN */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* GLOBAL SYSTEM THEME TOGGLE (PRESENTATION MODE) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                        Globalt Systemtema
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Presentation className="w-3.5 h-3.5 text-cyan-400" />
                        Presentations- & Projektorläge
                      </span>
                    </div>
                    <h3 className="text-base font-orbitron font-extrabold text-white flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      Växla Huvudtema (Mörkt vs Blueprint Ljust)
                    </h3>
                    <p className="text-xs text-slate-300 font-space mt-1 max-w-xl leading-relaxed">
                      Växla direkt mellan det mörka <strong>Cyber Matrix</strong>-temat och högkontrastritningen <strong>Blueprint</strong> för optimal läsbarhet under presentationer och projektion. Sparas automatiskt i <code>localStorage</code>.
                    </p>
                  </div>

                  {/* Dual Interactive Switcher */}
                  <div className="grid grid-cols-2 gap-2.5 sm:w-80 shrink-0">
                    {/* Dark: Cyber Matrix */}
                    <button
                      onClick={() => handleApplyTheme('cyber_matrix')}
                      className={`p-3.5 rounded-xl border flex flex-col items-start gap-1.5 transition text-left cursor-pointer relative ${
                        localSettings.themeId !== 'blueprint_light'
                          ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/30 shadow-md shadow-cyan-950/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold font-orbitron">Cyber Matrix</span>
                        </div>
                        {localSettings.themeId !== 'blueprint_light' && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-space">
                        Mörkt cyber-läge med neon och mörk bakgrund
                      </span>
                    </button>

                    {/* Light: Blueprint */}
                    <button
                      onClick={() => handleApplyTheme('blueprint_light')}
                      className={`p-3.5 rounded-xl border flex flex-col items-start gap-1.5 transition text-left cursor-pointer relative ${
                        localSettings.themeId === 'blueprint_light'
                          ? 'bg-sky-950/90 border-sky-400 ring-2 ring-sky-400/40 shadow-md shadow-sky-950/60 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-300" />
                          <span className="text-xs font-bold font-orbitron">Blueprint</span>
                        </div>
                        {localSettings.themeId === 'blueprint_light' && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-space">
                        Högkontrast ljustema optimerat för presentationer
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-orbitron font-extrabold text-cyan-400 uppercase tracking-wider mb-1">
                  Alla Simulatordesigner & Färgpaletter
                </h3>
                <p className="text-xs text-slate-400 font-space mb-4">
                  Byter färgtoner på arbetsytan, menyer, laserglöd och nätverkstopologins effekter.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {Object.values(SIMULATOR_THEMES).map((thm) => {
                    const isSelected = localSettings.themeId === thm.id;
                    return (
                      <div
                        key={thm.id}
                        onClick={() => handleApplyTheme(thm.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                          isSelected
                            ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                        style={{
                          boxShadow: isSelected ? `0 0 15px ${thm.accentPrimary}33` : undefined,
                        }}
                      >
                        {/* Theme Accent Color Strip */}
                        <div
                          className="h-1.5 w-full rounded-full mb-3"
                          style={{
                            background: `linear-gradient(90deg, ${thm.accentPrimary}, ${thm.accentSecondary})`,
                          }}
                        />

                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white font-orbitron">{thm.name}</h4>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/30">
                                <Check className="w-3 h-3" /> Aktivt
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{thm.tagline}</p>
                        </div>

                        {/* Color Swatch Dots */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-900">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: thm.accentPrimary }}
                            title="Primär accent"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: thm.accentSecondary }}
                            title="Sekundär accent"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: thm.bgCanvas }}
                            title="Canvas bakgrund"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: thm.borderPrimary }}
                            title="Ramfärg"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Canvas Grid Style & Alignment */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  Bakgrundsrutnät & Canvas-stil
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'dots', label: 'Prickar (Dots)' },
                    { id: 'lines', label: 'Linjer (Grid)' },
                    { id: 'hex', label: 'Hexagonalt' },
                    { id: 'blueprint', label: 'Blueprint' },
                    { id: 'none', label: 'Slät (Ingen)' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSettingChange('canvasGridStyle', g.id as CanvasGridStyle)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        localSettings.canvasGridStyle === g.id
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-900 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.gridSnap}
                      onChange={(e) => handleSettingChange('gridSnap', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Magnetisk fästning vid förflyttning (Snap-to-Grid)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Steglängd:</span>
                    {[10, 20, 40].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => handleSettingChange('gridSnapSize', sz as any)}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          localSettings.gridSnapSize === sz
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matrix Rain Customizer */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Digital Matrix Code Rain Bakgrundseffekt
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.matrixRainEnabled}
                      onChange={(e) => handleSettingChange('matrixRainEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {localSettings.matrixRainEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Opacitet (Synlighet)</span>
                        <span className="font-mono">{Math.round(localSettings.matrixRainOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.75"
                        step="0.05"
                        value={localSettings.matrixRainOpacity}
                        onChange={(e) => handleSettingChange('matrixRainOpacity', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Regnhastighet</span>
                        <span className="font-mono">{localSettings.matrixRainSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.25"
                        value={localSettings.matrixRainSpeed}
                        onChange={(e) => handleSettingChange('matrixRainSpeed', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & AVATAR */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Card Header with Live Preview */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <UserAvatar
                  avatarId={localProfile.avatarId}
                  customUrl={localProfile.avatarCustomUrl}
                  username={localProfile.username}
                  size="xl"
                  status={localProfile.statusBadge || 'active'}
                />

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-orbitron font-extrabold text-white">
                      {localProfile.username || 'Operatör'}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                      {localProfile.roleTitle || 'Nätverksarkitekt'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">{localProfile.email}</p>
                  <p className="text-xs text-slate-300 font-space mt-2 italic">
                    "{localProfile.bio || 'Ingen biografi angiven än.'}"
                  </p>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Välj Förinställd Avatar (Tech & Cyber)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_PRESETS.map((p) => {
                    const isSelected =
                      !localProfile.avatarCustomUrl && localProfile.avatarId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          handleProfileChange('avatarId', p.id);
                          handleProfileChange('avatarCustomUrl', undefined);
                          playSound('click', localSettings.soundEffectsEnabled, localSettings.soundVolume);
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-400/20'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <UserAvatar avatarId={p.id} size="sm" showGlow={false} />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200">{p.name}</p>
                          <span className="text-[10px] text-slate-500 capitalize">{p.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image Upload */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  Egen Profilbild (Ladda upp fil eller ange bild-URL)
                </h4>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Upload className="w-4 h-4" />
                    Ladda upp bild från datorn (JPG / PNG)
                  </button>

                  <div className="flex-1 w-full flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Eller klistra in bildlänk: https://..."
                      value={localProfile.avatarCustomUrl || ''}
                      onChange={(e) => handleProfileChange('avatarCustomUrl', e.target.value || undefined)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    {localProfile.avatarCustomUrl && (
                      <button
                        type="button"
                        onClick={() => handleProfileChange('avatarCustomUrl', undefined)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 text-xs"
                        title="Ta bort egen bild"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {avatarUploadError && (
                  <p className="text-xs text-rose-400 font-medium">{avatarUploadError}</p>
                )}
              </div>

              {/* User Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Användarnamn / Namn
                  </label>
                  <input
                    type="text"
                    value={localProfile.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    E-postadress
                  </label>
                  <input
                    type="email"
                    value={localProfile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Roll / Titel i Nätverket
                  </label>
                  <input
                    type="text"
                    placeholder="t.ex. Senior Nätverksarkitekt"
                    value={localProfile.roleTitle || ''}
                    onChange={(e) => handleProfileChange('roleTitle', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status-indikator
                  </label>
                  <select
                    value={localProfile.statusBadge || 'active'}
                    onChange={(e) => handleProfileChange('statusBadge', e.target.value as UserStatusBadge)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="active">🟢 Online (Aktiv)</option>
                    <option value="in_lab">🔵 I Cyber Security Lab</option>
                    <option value="architecting">🟡 Bygger Nätverk</option>
                    <option value="dnd">🔴 Stör Ej (Simulerar)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Biografi / Anteckningar
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Kort beskrivning om dig själv eller ditt labb..."
                    value={localProfile.bio || ''}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 custom-scrollbar"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATION & ENGINE */}
          {activeTab === 'simulation' && (
            <div className="space-y-5">
              {/* Audio and Sound Effects */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {localSettings.soundEffectsEnabled ? (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Ljudeffekter & Synthesizer Feedback
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.soundEffectsEnabled}
                      onChange={(e) => handleSettingChange('soundEffectsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {localSettings.soundEffectsEnabled && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-slate-900">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Ljudvolym</span>
                        <span className="font-mono">{Math.round(localSettings.soundVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={localSettings.soundVolume}
                        onChange={(e) => handleSettingChange('soundVolume', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => playSound('ping_success', true, localSettings.soundVolume)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      Provspela Ljud 🎵
                    </button>
                  </div>
                )}
              </div>

              {/* Packet Animation Speed */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Paketanimationshastighet
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {localSettings.packetAnimationSpeed}x
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0.5, 1, 1.5, 2, 3].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSettingChange('packetAnimationSpeed', spd as any)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        localSettings.packetAnimationSpeed === spd
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Visual Overlays */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Visning på Canvas
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={localSettings.showIpBadgesOnCanvas}
                      onChange={(e) => handleSettingChange('showIpBadgesOnCanvas', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                    <span>Visa IP-adresser direkt under noder</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={localSettings.showMacBadgesOnCanvas}
                      onChange={(e) => handleSettingChange('showMacBadgesOnCanvas', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                    <span>Visa MAC-adresser på canvas</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={localSettings.showPortLabelsOnLinks}
                      onChange={(e) => handleSettingChange('showPortLabelsOnLinks', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                    <span>Visa kabeltyp & länkstatus vid muspekare</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={localSettings.cableAnimationGlow}
                      onChange={(e) => handleSettingChange('cableAnimationGlow', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                    <span>Pulserande laserglöd på aktiva kablar</span>
                  </label>
                </div>
              </div>

              {/* Auto-Save Configuration */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Automatisk Säkerhetskopiering (Auto-Save)
                  </span>
                  {lastAutoSavedTime && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Senast sparad: {lastAutoSavedTime}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 0, label: 'Av' },
                    { val: 15, label: '15s' },
                    { val: 30, label: '30s' },
                    { val: 60, label: '1 min' },
                    { val: 120, label: '2 min' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleSettingChange('autoSaveIntervalSeconds', item.val as any)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        localSettings.autoSaveIntervalSeconds === item.val
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NETWORK DEFAULTS */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Standard Subnätmask
                  </label>
                  <input
                    type="text"
                    value={localSettings.defaultSubnetMask}
                    onChange={(e) => handleSettingChange('defaultSubnetMask', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">T.ex. 255.255.255.0 (/24)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Standard Gateway
                  </label>
                  <input
                    type="text"
                    value={localSettings.defaultGateway}
                    onChange={(e) => handleSettingChange('defaultGateway', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">T.ex. 192.168.1.1</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Standard DNS-Server
                  </label>
                  <input
                    type="text"
                    value={localSettings.defaultDnsServer}
                    onChange={(e) => handleSettingChange('defaultDnsServer', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Standard Kabeltyp
                  </label>
                  <select
                    value={localSettings.defaultCableType}
                    onChange={(e) => handleSettingChange('defaultCableType', e.target.value as CableType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="auto">⚡ Auto-Resolve (Smart kabelväljare)</option>
                    <option value="cat6">Rak Kopparkabel (Cat6)</option>
                    <option value="crossover">Korsad Koppar (Crossover)</option>
                    <option value="fiber">Optisk Fiberkabel</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mt-4">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoAssignIpOnCreate}
                    onChange={(e) => handleSettingChange('autoAssignIpOnCreate', e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500"
                  />
                  <span>
                    Tilldela automatiskt unik IP-adress och subnät vid placering av nya enheter (Auto-DHCP)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & ATTACK LAB */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Hacker Aggressionsnivå & Attackhastighet
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'low', label: 'Låg (Passiv)', desc: 'Långsam spaning' },
                    { id: 'moderate', label: 'Måttlig', desc: 'Realistisk simulering' },
                    { id: 'aggressive', label: 'Aggressiv', desc: 'Snabb infiltration' },
                    { id: 'extreme', label: 'Extrem', desc: 'DDoS & Ransomware-flood' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleSettingChange('hackerAggression', lvl.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        localSettings.hackerAggression === lvl.id
                          ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold ring-1 ring-rose-500/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Automatisk Incidenthantering & Containment
                </span>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoContainmentOnBreach}
                    onChange={(e) => handleSettingChange('autoContainmentOnBreach', e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500"
                  />
                  <span>
                    Isolera automatiskt drabbade noder från nätverket vid bekräftat dataintrång (Kill-Chain Stage 6+)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & DATA */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Exportera Alla Inställningar & Profil
                    </h4>
                    <p className="text-xs text-slate-400 font-space mb-4">
                      Spara din profil, anpassade teman och motorkonfiguration som en säkerhetskopia på din dator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportConfig}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    Ladda ner inställningsfil (.json)
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                      Importera Inställningar
                    </h4>
                    <p className="text-xs text-slate-400 font-space mb-4">
                      Återställ en tidigare sparad profil och temakonfiguration från en JSON-fil.
                    </p>
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    Välj fil att importera
                    <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400">Vill du nollställa alla parametrar till standardvärden?</span>
                </div>
                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-400 font-medium">Är du säker?</span>
                    <button
                      type="button"
                      onClick={handleResetToDefaults}
                      className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      Ja, nollställ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition cursor-pointer"
                  >
                    Återställ till fabriksinställningar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div>
            {saveSuccessMsg && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccessMsg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              Stäng
            </button>
            <button
              type="button"
              onClick={handleSaveProfileAndClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition duration-150 cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Spara & Tillämpa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
