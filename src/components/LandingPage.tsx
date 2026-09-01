import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: (user: { email: string; username: string }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error/Success messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
        { email: 'demo@eklund.se', username: 'DemoAnvändare', password: 'demo123' }
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

        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('eklund_users', JSON.stringify(users));

        setSuccessMsg('Konto skapat framgångsrikt! Loggar in...');
        
        setTimeout(() => {
          localStorage.setItem('eklund_current_user', JSON.stringify({ email, username }));
          onLoginSuccess({ email, username });
        }, 1200);

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

        setSuccessMsg('Inloggning lyckades! Startar simulatorn...');
        
        setTimeout(() => {
          localStorage.setItem('eklund_current_user', JSON.stringify({ email: user.email, username: user.username }));
          onLoginSuccess({ email: user.email, username: user.username });
        }, 1000);

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
      const demoUser = { email: 'demo@eklund.se', username: 'DemoAnvändare' };
      localStorage.setItem('eklund_current_user', JSON.stringify(demoUser));
      setSuccessMsg('Gästinloggning lyckades! Välkommen.');
      setTimeout(() => {
        onLoginSuccess(demoUser);
      }, 800);
    }, 400);
  };

  return (
    <div id="landing-container" className="min-h-screen w-full bg-[#030712] text-slate-100 overflow-x-hidden relative flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Dynamic Matrix Code Rain Layer */}
      <MatrixRain opacity={0.28} speed={1} colorTheme="classic_green" />

      {/* 1. Deep Cyber Light Spot Auras */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-cyan-500/12 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/4 right-5 w-[600px] h-[600px] bg-indigo-500/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* 2. Precision Cyber Matrix Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_80%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* 3. Interactive Network Topology & Cyber Hacking SVG Background Graph */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <svg className="w-full h-full min-h-[1200px]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyberLineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="hackerLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.1" />
            </linearGradient>
            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1e293b" />
            </pattern>
          </defs>

          {/* Subnet Region Outline Boxes */}
          <rect x="5%" y="12%" width="38%" height="320" rx="20" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />
          <text x="7%" y="15%" fill="#06b6d4" fontSize="11" fontFamily="Orbitron" fontWeight="bold" opacity="0.6">
            SUBNET VLAN 10 [ENTERPRISE CORE - 192.168.1.0/24]
          </text>

          <rect x="52%" y="8%" width="42%" height="360" rx="20" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />
          <text x="54%" y="11%" fill="#f43f5e" fontSize="11" fontFamily="Orbitron" fontWeight="bold" opacity="0.6">
            PENETRATION TESTING & CSIRT SANDBOX [VLAN 99]
          </text>

          {/* Fiber Optic Laser Connections with animated packet flow */}
          <path d="M 150 220 Q 320 180 480 260 T 780 200" fill="none" stroke="url(#cyberLineGrad1)" strokeWidth="2" strokeDasharray="8 8" className="animate-laser-flow" />
          <path d="M 220 340 L 520 380 L 820 320" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="6 6" className="animate-laser-flow" />
          <path d="M 780 200 Q 920 140 1150 220" fill="none" stroke="url(#hackerLineGrad)" strokeWidth="2" strokeDasharray="8 8" className="animate-laser-flow" />
          <path d="M 480 260 Q 600 500 850 600" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="10 10" className="animate-laser-flow" />

          {/* Network Nodes in background */}
          <g transform="translate(150, 220)" className="animate-data-pulse">
            <circle r="18" fill="#030712" stroke="#06b6d4" strokeWidth="2" />
            <circle r="6" fill="#06b6d4" />
            <text x="-35" y="32" fill="#38bdf8" fontSize="10" fontFamily="monospace">Core Router</text>
          </g>

          <g transform="translate(480, 260)">
            <circle r="22" fill="#030712" stroke="#14b8a6" strokeWidth="2.5" />
            <circle r="8" fill="#14b8a6" />
            <text x="-30" y="38" fill="#2dd4bf" fontSize="10" fontFamily="monospace">L3 Switch</text>
          </g>

          <g transform="translate(780, 200)">
            <circle r="20" fill="#030712" stroke="#f43f5e" strokeWidth="2" />
            <circle r="7" fill="#f43f5e" />
            <text x="-40" y="34" fill="#fb7185" fontSize="10" fontFamily="monospace">Hacker Node</text>
          </g>

          <g transform="translate(1150, 220)">
            <circle r="18" fill="#030712" stroke="#6366f1" strokeWidth="2" />
            <circle r="6" fill="#6366f1" />
            <text x="-35" y="32" fill="#818cf8" fontSize="10" fontFamily="monospace">Cloud Server</text>
          </g>

          {/* Background Matrix Terminal Code Snippets */}
          <g opacity="0.4" fontFamily="monospace" fontSize="10" fill="#0284c7">
            <text x="6%" y="420">[+] ROUTE: 192.168.1.1 via eth0 metric 10</text>
            <text x="6%" y="438">[+] DNS RESOLVER: ns1.eklund.lan -&gt; 192.168.1.5</text>
            <text x="6%" y="456">[+] BPF FILTER: 'tcp port 80 or icmp' ACTIVE</text>
          </g>

          <g opacity="0.4" fontFamily="monospace" fontSize="10" fill="#e11d48">
            <text x="54%" y="410">[!] WARNING: SIMULATED PORT SCAN DETECTED (SYN SCAN)</text>
            <text x="54%" y="428">[!] FIREWALL RULE #4 APPLIED: DROP 172.16.0.44 -&gt; 192.168.1.100</text>
            <text x="54%" y="446">[!] CSIRT LOG: PENETRATION TEST IN PROGRESS</text>
          </g>
        </svg>
      </div>

      {/* 4. Educational & Cyber Floating Floating Badges Backdrop */}
      <div className="absolute top-24 left-8 hidden xl:flex items-center gap-2 bg-slate-900/60 border border-cyan-500/30 rounded-full px-3.5 py-1.5 backdrop-blur-md text-[11px] font-orbitron font-bold text-cyan-300 shadow-lg pointer-events-none z-10 animate-node-float">
        <Network className="w-3.5 h-3.5 text-cyan-400" />
        <span>NÄTVERKSARKITEKTUR & DYNAMISK ROUTING</span>
      </div>

      <div className="absolute top-28 right-8 hidden xl:flex items-center gap-2 bg-slate-900/60 border border-rose-500/30 rounded-full px-3.5 py-1.5 backdrop-blur-md text-[11px] font-orbitron font-bold text-rose-300 shadow-lg pointer-events-none z-10 animate-node-float" style={{ animationDelay: '1.5s' }}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>ETISK HACKNING & IT-SÄKERHETSSANDLÅDA</span>
      </div>

      <div className="absolute bottom-20 left-12 hidden xl:flex items-center gap-2 bg-slate-900/60 border border-teal-500/30 rounded-full px-3.5 py-1.5 backdrop-blur-md text-[11px] font-orbitron font-bold text-teal-300 shadow-lg pointer-events-none z-10 animate-node-float" style={{ animationDelay: '3s' }}>
        <Terminal className="w-3.5 h-3.5 text-teal-400" />
        <span>REALTIDS PAKETSPÅRNING & TERMINALEMULERING</span>
      </div>

      {/* HEADER NAVBAR */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/60 backdrop-blur-md">
        <EklundLogo size="md" showSubtitle={true} />
        <div className="flex items-center gap-4">
          <a
            href="#info-section"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-cyan-400 transition"
          >
            <BookOpen className="w-4 h-4" />
            Om Simulatorn
          </a>
          <a
            href="#auth-section"
            className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-cyan-950/20 transition-all hover:border-cyan-400"
          >
            Logga In / Registrera
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        
        {/* Left Side: Pitch/Information */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-400/30 text-cyan-300 font-orbitron font-extrabold text-xs tracking-wider px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.15)] w-fit uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Nätverkssimulering version 26
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-black tracking-tight leading-[1.1] text-white">
            Konstruera, testa & visualisera{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(34,211,238,0.3)]">
              komplexa nätverk
            </span>{' '}
            i realtid.
          </h2>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed font-space font-medium">
            Eklund Simulator v26 är en toppmodern, interaktiv plattform utformad för att ge djupgående förståelse för nätverksarkitektur. Utforska allt från enkla lokala nätverk (LAN) till storskaliga företagsmiljöer med AI-assisterad nätverksdiagnostik.
          </p>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm shadow-md transition-all hover:border-cyan-500/20"
              >
                <div className="text-xl md:text-2xl font-orbitron font-black text-cyan-400">
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6">
            <a
              href="#auth-section"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold font-space text-base px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] transition duration-250 cursor-pointer"
            >
              Kom igång nu
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </a>
            <a
              href="#info-section"
              className="bg-slate-900/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300 border border-slate-800 px-6 py-3.5 rounded-xl font-semibold text-center transition"
            >
              Utforska funktioner
            </a>
          </div>
        </div>

        {/* Right Side: AUTH FORM CARD */}
        <div id="auth-section" className="lg:col-span-5 relative z-20">
          <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
          
          <div className="relative bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-800 pb-4 mb-5 justify-between items-center">
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold font-orbitron tracking-wide transition ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-400/30'
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
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold font-orbitron tracking-wide transition ${
                    activeTab === 'signup'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Skapa Konto
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2 animate-shake">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
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
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loggar in...' : 'Logga In på Simulatorn'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Fullständigt Namn
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Välj Lösenord
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minst 5 tecken"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Bekräfta Lösenord
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Upprepa lösenord"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Skapar konto...' : 'Skapa Mitt Konto'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* OR SEPARATOR */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                Eller testa direkt
              </span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            {/* GUEST MODE LINK */}
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/60 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-400 text-sm font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-cyan-400/30 text-cyan-400" />
              Snabbtillgång: Logga in som Gäst (Demo)
            </button>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE INFORMATION SECTION */}
      <section id="info-section" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 mt-12 text-left">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="text-sm font-orbitron font-extrabold text-cyan-400 tracking-widest uppercase mb-3">
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
              className="bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl transition duration-200 flex flex-col gap-4 backdrop-blur-md hover:translate-y-[-2px] group"
            >
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 w-fit group-hover:scale-110 transition-transform duration-200 shadow-md">
                {feat.icon}
              </div>
              <h4 className="text-lg font-orbitron font-extrabold text-white">
                {feat.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed font-space font-medium">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Informative Detailed Table Section: Device Breakdown */}
        <div className="mt-20 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800/80">
            <div>
              <h3 className="text-lg font-orbitron font-extrabold text-white">
                Stödda Enhetstyper i Simulatorn
              </h3>
              <p className="text-xs text-slate-400 font-space mt-1">
                Eklund Simulator simulerar mer än ett dussin avancerade enhetsroller, var och en med anpassade ikoner och logiska beteenden.
              </p>
            </div>
            <span className="text-[10px] font-orbitron font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 px-3 py-1 rounded-full uppercase tracking-widest">
              Lokal Logik
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <Server className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">Servrar & Databaser</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kör virtuella webb-, applikation-, DNS- eller databasservrar. Kan skyddas av brandväggar och nås via IP.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Network className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">L2 / L3 Switchar & WiFi AP</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Switchar hanterar lokal paketdistribution med VLAN-grupper. WiFi AP sänder trådlösa nätverk till mobila klienter.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">Brandväggar & Gateways</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Kontrollerar trafik till och från Internet. Blockerar paket baserat på konfigurerade IP-ranges och hotbilder.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Swedish FAQ/Pedagogical section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-6">
            <h4 className="font-orbitron font-extrabold text-cyan-400 text-sm uppercase tracking-wider mb-3">
              FÖR VEM ÄR DETTA?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-space">
              Denna simulator är byggd för både utbildningssyfte och nätverksarkitekter. Du kan använda den för att lära dig nätverkande (subnät, kablar, felsökning via ping/terminal) eller för att designa ett företagsnätverk innan implementering. Allt körs direkt i webbläsaren, ingen installation krävs.
            </p>
          </div>
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-6">
            <h4 className="font-orbitron font-extrabold text-teal-400 text-sm uppercase tracking-wider mb-3">
              VARFÖR VERSION 26?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-space">
              Version 26 introducerar helt uppdaterade och ultra-realistiska SVG-enhetsikoner, en automatiserad felsökningsmotor som snabbt identifierar nätverksfel, subnätsberäkning samt prestandajusteringar för smidig paketspårning utan fördröjning.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-orbitron font-bold text-slate-400 tracking-wider">EKLUND SIMULATOR v26</span>
          <span className="text-slate-600">|</span>
          <span>© 2026 Eklund Corp. Alla rättigheter förbehållna.</span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <span className="text-teal-400/80">Utvecklad med React 19 + Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
};
