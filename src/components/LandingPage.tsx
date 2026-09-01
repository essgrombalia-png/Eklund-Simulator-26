import React, { useState, useEffect, useRef } from 'react';
import { EklundLogo } from './EklundLogo';
import { MatrixRain } from './MatrixRain';
import {
  ShieldCheck,
  Sparkles,
  Zap,
  Wrench,
  Terminal,
  Cpu,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Server,
  Network,
  Cable,
  CheckCircle,
  Check,
  Info,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ShieldAlert,
  Globe,
  Activity,
  Wifi,
  Skull,
  Database,
  Code,
  Radio,
  Lock as LockIcon,
  Palette,
  Sliders,
  Upload,
  Volume2,
  VolumeX,
  Grid,
} from 'lucide-react';
import {
  SimulatorThemeId,
  ThemeConfig,
  AdvancedSettings,
  UserProfile,
} from '../types';
import {
  SIMULATOR_THEMES,
  AVATAR_PRESETS,
  DEFAULT_ADVANCED_SETTINGS,
  loadSavedSettings,
  saveSettingsToStorage,
  loadSavedProfile,
  saveProfileToStorage,
} from '../utils/themeManager';
import { UserAvatar } from './UserAvatar';
import { playSound } from '../utils/audioSynth';

interface LandingPageProps {
  onLoginSuccess: (user: {
    email: string;
    username: string;
    avatarId?: string;
    avatarCustomUrl?: string;
    roleTitle?: string;
  }) => void;
  currentSettings?: AdvancedSettings;
  onUpdateSettings?: (settings: AdvancedSettings) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  currentSettings: propSettings,
  onUpdateSettings: propOnUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('Nätverksarkitekt');
  const [selectedAvatarId, setSelectedAvatarId] = useState('avatar_cyber_hacker');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | undefined>(undefined);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Settings & Theme states
  const [settings, setSettings] = useState<AdvancedSettings>(
    propSettings || loadSavedSettings()
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Error/Success messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const activeTheme = SIMULATOR_THEMES[settings.themeId] || SIMULATOR_THEMES.cyber_matrix;

  const handleSelectTheme = (themeId: SimulatorThemeId) => {
    const updated = { ...settings, themeId };
    setSettings(updated);
    saveSettingsToStorage(updated);
    if (propOnUpdateSettings) {
      propOnUpdateSettings(updated);
    }
    playSound('theme_switch', settings.soundEffectsEnabled, settings.soundVolume);
  };

  const handleSettingChange = <K extends keyof AdvancedSettings>(
    key: K,
    value: AdvancedSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettingsToStorage(updated);
    if (propOnUpdateSettings) {
      propOnUpdateSettings(updated);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vänligen välj en giltig bildfil (JPG, PNG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Bilden får max vara 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomAvatarUrl(event.target?.result as string);
      playSound('click', settings.soundEffectsEnabled, settings.soundVolume);
    };
    reader.readAsDataURL(file);
  };

  // Stats Counters (Simulated but realistic)
  const stats = [
    { value: '13+', label: 'Enhetstyper', desc: 'Servrar, switchar, WiFi APs, brandväggar och hackare' },
    { value: '100%', label: 'Realtidssimulering', desc: 'Omedelbar nätverkspaketspårning och animation' },
    { value: 'v26', label: 'Enterprise Motor', desc: 'Avancerad routing- och subnätberäkning' },
    { value: '1-Klick', label: 'Auto-reparation', desc: 'Smart diagnostik som lagar trasiga konfigurationer' },
  ];

  // Carousel or Features Info List
  const simulatorFeatures = [
    {
      icon: <Network className="w-6 h-6 text-cyan-400" />,
      title: 'Interaktiv Topologibyggare',
      desc: 'Placera ut enheter på en stor canvas, konfigurera IP-adresser manuellt eller låt intelligenta routrar sköta routing-protokollen. Skapa nätverksgrupper med containers för att visualisera subnät.',
    },
    {
      icon: <Cable className="w-6 h-6 text-teal-400" />,
      title: 'Fysiska & Logiska Kablar',
      desc: 'Använd olika kabeltyper (Rak koppar, Korsad koppar, Fiber eller Konsolkabel) baserat på enhet. Systemet analyserar anslutningar och ger varningar om felaktiga val gjorts.',
    },
    {
      icon: <Terminal className="w-6 h-6 text-indigo-400" />,
      title: 'Realistiskt Terminal-gränssnitt',
      desc: 'Öppna terminalen på valfri enhet och kör riktiga nätverkskommandon som ping, ipconfig, route, netstat, nslookup samt auto-repair för att testa nätverkskontakter.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: 'Trafik- & Paketgenerator',
      desc: 'Simulera belastningstrafik, sätt upp ICMP Echo Requests eller anpassade TCP-paket mellan nätverkets noder och spåra paketen live i realtid i packet-capture panelen.',
    },
    {
      icon: <Wrench className="w-6 h-6 text-amber-400" />,
      title: 'Intelligent Auto-Reparationsmotor',
      desc: 'Är nätverket nere? Kör en fullständig nätverksskanning för att upptäcka dubbla IP-adresser, ogiltiga subnät, saknade standard-gateways och reparera dem automatiskt med ett enda klick.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
      title: 'Säkerhet & Brandväggar',
      desc: 'Sätt upp brandväggar, konfigurera paketfiltrering och skydda nätverket från simulerade hacker-attacker för att se hur brandväggsregler skyddar dina interna servrar.',
    },
  ];

  // Initialize simulated users database in localStorage if empty
  useEffect(() => {
    if (!localStorage.getItem('eklund_users')) {
      const defaultUsers = [
        { email: 'demo@eklund.se', username: 'DemoAnvändare', password: 'demo123', avatarId: 'avatar_cyber_hacker' }
      ];
      localStorage.setItem('eklund_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Vänligen fyll i alla obligatoriska fält.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Lösenorden matchar inte.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Lösenordet måste vara minst 5 tecken långt.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('eklund_users') || '[]');
        const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (userExists) {
          setErrorMsg('En användare med denna e-postadress är redan registrerad.');
          setLoading(false);
          return;
        }

        const newUser = {
          username,
          email,
          password,
          avatarId: selectedAvatarId,
          avatarCustomUrl: customAvatarUrl,
          roleTitle,
        };
        users.push(newUser);
        localStorage.setItem('eklund_users', JSON.stringify(users));

        // Save profile
        saveProfileToStorage({
          username,
          email,
          avatarId: selectedAvatarId,
          avatarCustomUrl: customAvatarUrl,
          roleTitle,
          statusBadge: 'active',
        });

        setSuccessMsg('Konto skapat framgångsrikt! Loggar in...');
        
        setTimeout(() => {
          localStorage.setItem('eklund_current_user', JSON.stringify({ email, username }));
          onLoginSuccess({
            email,
            username,
            avatarId: selectedAvatarId,
            avatarCustomUrl: customAvatarUrl,
            roleTitle,
          });
        }, 1000);

      } catch (err) {
        setErrorMsg('Ett oväntat fel uppstod vid registrering.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vänligen fyll i e-postadress och lösenord.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('eklund_users') || '[]');
        const user = users.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
          setErrorMsg('Felaktig e-postadress eller lösenord.');
          setLoading(false);
          return;
        }

        const userAvatarId = customAvatarUrl ? undefined : (selectedAvatarId || user.avatarId || 'avatar_cyber_hacker');
        const finalCustomAvatar = customAvatarUrl || user.avatarCustomUrl;
        const finalRole = roleTitle || user.roleTitle || 'Nätverksarkitekt';

        saveProfileToStorage({
          username: user.username,
          email: user.email,
          avatarId: userAvatarId,
          avatarCustomUrl: finalCustomAvatar,
          roleTitle: finalRole,
          statusBadge: 'active',
        });

        setSuccessMsg('Inloggning lyckades! Startar simulatorn...');
        
        setTimeout(() => {
          localStorage.setItem('eklund_current_user', JSON.stringify({ email: user.email, username: user.username }));
          onLoginSuccess({
            email: user.email,
            username: user.username,
            avatarId: userAvatarId,
            avatarCustomUrl: finalCustomAvatar,
            roleTitle: finalRole,
          });
        }, 800);

      } catch (err) {
        setErrorMsg('Ett oväntat fel uppstod vid inloggning.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  // Demo direct login for effortless testing
  const handleQuickDemoAccess = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      const demoUser = {
        email: 'demo@eklund.se',
        username: 'DemoAnvändare',
        avatarId: selectedAvatarId || 'avatar_cyber_hacker',
        avatarCustomUrl: customAvatarUrl,
        roleTitle: roleTitle || 'Gästarkitekt',
      };
      localStorage.setItem('eklund_current_user', JSON.stringify(demoUser));
      saveProfileToStorage({
        username: demoUser.username,
        email: demoUser.email,
        avatarId: demoUser.avatarId,
        avatarCustomUrl: demoUser.avatarCustomUrl,
        roleTitle: demoUser.roleTitle,
        statusBadge: 'active',
      });
      setSuccessMsg('Gästinloggning lyckades! Välkommen.');
      setTimeout(() => {
        onLoginSuccess(demoUser);
      }, 700);
    }, 400);
  };

  return (
    <div
      id="landing-container"
      className="min-h-screen w-full text-slate-100 overflow-x-hidden relative flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-500"
      style={{ backgroundColor: activeTheme.bgCanvas }}
    >
      {/* Dynamic Matrix Code Rain Layer with Theme Colors */}
      {settings.matrixRainEnabled && (
        <MatrixRain
          opacity={settings.matrixRainOpacity}
          speed={settings.matrixRainSpeed}
          colorTheme={activeTheme.matrixTheme}
        />
      )}

      {/* Cyber Grid Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            settings.canvasGridStyle === 'lines'
              ? `linear-gradient(${activeTheme.gridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.gridLineColor} 1px, transparent 1px)`
              : `radial-gradient(${activeTheme.accentPrimary}33 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Atmospheric Glow Orbs */}
      <div
        className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-[128px] pointer-events-none opacity-40 animate-pulse"
        style={{ backgroundColor: activeTheme.accentPrimary }}
      />
      <div
        className="absolute bottom-1/3 -right-48 w-96 h-96 rounded-full blur-[128px] pointer-events-none opacity-30 animate-pulse"
        style={{ backgroundColor: activeTheme.accentSecondary, animationDelay: '2s' }}
      />

      {/* HEADER NAVBAR */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/60 backdrop-blur-md">
        <EklundLogo size="md" showSubtitle={true} />
        
        {/* Quick Theme Switcher in Header */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-full px-2.5 py-1 backdrop-blur-md">
            <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.accentPrimary }} />
            <span className="text-[11px] font-bold text-slate-300 font-orbitron mr-1">Design:</span>
            {Object.values(SIMULATOR_THEMES).map((thm) => (
              <button
                key={thm.id}
                onClick={() => handleSelectTheme(thm.id)}
                title={thm.name}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                  settings.themeId === thm.id
                    ? 'ring-2 ring-white scale-110 shadow-md'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: thm.accentPrimary, borderColor: thm.accentSecondary }}
              />
            ))}
          </div>

          <a
            href="#info-section"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition"
          >
            <BookOpen className="w-4 h-4" />
            Om Simulatorn
          </a>
          <a
            href="#auth-section"
            className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/20 transition-all hover:border-cyan-400"
          >
            Logga In
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center flex-1">
        
        {/* Left Side: Pitch & Information */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div
            className="inline-flex items-center gap-2 border text-cyan-300 font-orbitron font-extrabold text-xs tracking-wider px-3 py-1.5 rounded-full w-fit uppercase shadow-sm"
            style={{
              backgroundColor: `${activeTheme.accentPrimary}15`,
              borderColor: `${activeTheme.accentPrimary}44`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: activeTheme.accentPrimary }} />
            <span>Nätverkssimulering version 26 Enterprise</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight leading-[1.1] text-white">
            Konstruera, testa & visualisera{' '}
            <span
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${activeTheme.accentPrimary}, ${activeTheme.accentSecondary}, #818cf8)`,
              }}
            >
              komplexa nätverk
            </span>{' '}
            i realtid.
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed font-space font-medium">
            Eklund Simulator v26 är en toppmodern, interaktiv plattform utformad för att ge djupgående förståelse för nätverksarkitektur, cyberförsvar och terminalkommandon. Anpassa ditt utseende och din operatörsprofil innan du sätter igång!
          </p>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-2">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm shadow-md transition-all hover:border-cyan-500/30"
              >
                <div
                  className="text-xl md:text-2xl font-orbitron font-black"
                  style={{ color: activeTheme.accentPrimary }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wide mt-1">
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
            <a
              href="#auth-section"
              className="text-slate-950 font-extrabold font-space text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition duration-200 cursor-pointer"
              style={{
                background: `linear-gradient(90deg, ${activeTheme.accentPrimary}, ${activeTheme.accentSecondary})`,
                boxShadow: `0 0 25px ${activeTheme.accentPrimary}44`,
              }}
            >
              Kom igång & Anpassa
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="#info-section"
              className="bg-slate-900/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300 border border-slate-800 px-6 py-3 rounded-xl font-semibold text-center text-sm transition"
            >
              Utforska funktioner
            </a>
          </div>
        </div>

        {/* Right Side: AUTH FORM & CUSTOMIZER CARD */}
        <div id="auth-section" className="lg:col-span-5 relative z-20">
          <div
            className="absolute -inset-1 rounded-2xl blur-lg opacity-35 animate-pulse"
            style={{
              background: `linear-gradient(45deg, ${activeTheme.accentPrimary}, ${activeTheme.accentSecondary})`,
            }}
          />
          
          <div className="relative bg-slate-900/95 border border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-800 pb-3 mb-4 justify-between items-center">
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-orbitron tracking-wide transition cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Logga In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-orbitron tracking-wide transition cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Skapa Konto
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2 animate-shake text-left">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2 text-left">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* THEME & AVATAR QUICK CUSTOMIZATION EXPANDER */}
            <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    avatarId={selectedAvatarId}
                    customUrl={customAvatarUrl}
                    username={username || 'Operatör'}
                    size="sm"
                    status="active"
                  />
                  <div>
                    <p className="text-xs font-bold text-white font-orbitron">
                      {activeTheme.name}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Operatörsprofil & Färgdesign
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showCustomizer ? 'Dölj anpassning' : 'Anpassa tema & bild'}
                </button>
              </div>

              {/* Expandable Customization Area */}
              {showCustomizer && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
                  {/* Theme Selector Palette */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Välj Simulatordesign (Tema)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.values(SIMULATOR_THEMES).map((thm) => (
                        <button
                          key={thm.id}
                          type="button"
                          onClick={() => handleSelectTheme(thm.id)}
                          className={`p-1.5 rounded-lg border text-left text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            settings.themeId === thm.id
                              ? 'bg-slate-900 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: thm.accentPrimary }}
                          />
                          <span className="truncate">{thm.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Picker & Upload */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Välj Profilbild / Avatar
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        Ladda upp bild
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="grid grid-cols-4 gap-1.5">
                      {AVATAR_PRESETS.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedAvatarId(p.id);
                            setCustomAvatarUrl(undefined);
                            playSound('click', settings.soundEffectsEnabled, settings.soundVolume);
                          }}
                          className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition cursor-pointer ${
                            !customAvatarUrl && selectedAvatarId === p.id
                              ? 'bg-slate-900 border-cyan-400'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <UserAvatar avatarId={p.id} size="xs" showGlow={false} />
                          <span className="text-[9px] text-slate-300 truncate w-full text-center">
                            {p.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Toggles: Sound & Matrix Rain */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={settings.soundEffectsEnabled}
                        onChange={(e) => handleSettingChange('soundEffectsEnabled', e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500"
                      />
                      <span>Ljudeffekter (Web Audio)</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={settings.matrixRainEnabled}
                        onChange={(e) => handleSettingChange('matrixRainEnabled', e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500"
                      />
                      <span>Matrix Rain</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    E-postadress
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="namn@företag.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Lösenord
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="text-slate-950 font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-1 text-xs uppercase font-orbitron tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: activeTheme.accentPrimary,
                    boxShadow: `0 0 15px ${activeTheme.accentPrimary}44`,
                  }}
                >
                  {loading ? 'Loggar in...' : 'Logga In på Simulatorn'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="flex flex-col gap-3">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ditt Namn
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Johan Andersson"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    E-postadress
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="johan@foretag.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Yrkesroll / Titel
                  </label>
                  <input
                    type="text"
                    placeholder="t.ex. Nätverksarkitekt eller SOC Analyst"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Lösenord
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minst 5 tecken"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Bekräfta
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Upprepa"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-1 text-xs uppercase font-orbitron tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Skapar konto...' : 'Skapa Mitt Konto & Starta'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* OR SEPARATOR */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                Eller snabbtillgång
              </span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            {/* GUEST MODE LINK */}
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/60 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-400 text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-cyan-400/30 text-cyan-400" />
              Snabbtillgång: Logga in direkt som Gäst (Demo)
            </button>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE INFORMATION SECTION */}
      <section id="info-section" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 mt-12 text-left">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3
            className="text-sm font-orbitron font-extrabold tracking-widest uppercase mb-3"
            style={{ color: activeTheme.accentPrimary }}
          >
            ÖVERSIKT & DOKUMENTATION
          </h3>
          <h2 className="text-3xl md:text-4xl font-orbitron font-black text-white tracking-tight">
            Allt du behöver veta om Eklund Simulator v26
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-4 font-space">
            Eklund Simulator är utvecklad för att modellera och emulera reella nätverkstopologier i webbläsaren. Med avancerade logiska algoritmer hanterar systemet routing, paketfiltrering, DHCP, DNS och switch-lärande i realtid.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulatorFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm transition duration-300 hover:border-cyan-500/40 hover:bg-slate-900/90 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-slate-950 border border-slate-800 w-fit rounded-xl mb-4">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-orbitron font-bold text-white mb-2">{feat.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-space">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
