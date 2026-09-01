import { ThemeConfig, SimulatorThemeId, AdvancedSettings, UserProfile } from '../types';

export const SIMULATOR_THEMES: Record<SimulatorThemeId, ThemeConfig> = {
  cyber_matrix: {
    id: 'cyber_matrix',
    name: 'Cyber Matrix',
    tagline: 'Klassisk cyberpunk-estetik med cyan & smaragdgröna laserstrålar',
    bgCanvas: '#030712',
    bgTopbar: '#0b1329',
    bgSidebar: '#080d1f',
    accentPrimary: '#06b6d4',
    accentSecondary: '#10b981',
    borderPrimary: '#1e293b',
    gridLineColor: 'rgba(6, 182, 212, 0.08)',
    gridDotColor: '#1e293b',
    nodeGlowColor: 'rgba(6, 182, 212, 0.4)',
    matrixTheme: 'classic_green',
  },
  midnight_obsidian: {
    id: 'midnight_obsidian',
    name: 'Midnight Obsidian',
    tagline: 'Djup kolsvart rymd med elektrisk violett och ultraviolett neon',
    bgCanvas: '#02040a',
    bgTopbar: '#090914',
    bgSidebar: '#06060e',
    accentPrimary: '#a855f7',
    accentSecondary: '#6366f1',
    borderPrimary: '#1e1b4b',
    gridLineColor: 'rgba(168, 85, 247, 0.08)',
    gridDotColor: '#2e1065',
    nodeGlowColor: 'rgba(168, 85, 247, 0.45)',
    matrixTheme: 'purple_haze',
  },
  clean_enterprise: {
    id: 'clean_enterprise',
    name: 'Clean Enterprise',
    tagline: 'Modern, högkontrast arkitektur med kungsblått & slate-stål',
    bgCanvas: '#0b1120',
    bgTopbar: '#0f172a',
    bgSidebar: '#0d1527',
    accentPrimary: '#38bdf8',
    accentSecondary: '#3b82f6',
    borderPrimary: '#1e293b',
    gridLineColor: 'rgba(56, 189, 248, 0.07)',
    gridDotColor: '#334155',
    nodeGlowColor: 'rgba(56, 189, 248, 0.35)',
    matrixTheme: 'ice_blue',
  },
  tactical_terminal: {
    id: 'tactical_terminal',
    name: 'Tactical Terminal',
    tagline: 'Militärgrön fosfor CRT och retro mainframe-känsla',
    bgCanvas: '#020d06',
    bgTopbar: '#04170a',
    bgSidebar: '#031207',
    accentPrimary: '#22c55e',
    accentSecondary: '#4ade80',
    borderPrimary: '#14532d',
    gridLineColor: 'rgba(34, 197, 94, 0.09)',
    gridDotColor: '#166534',
    nodeGlowColor: 'rgba(34, 197, 94, 0.5)',
    matrixTheme: 'classic_green',
  },
  solar_dusk: {
    id: 'solar_dusk',
    name: 'Solar Dusk',
    tagline: 'Varm glödande bärnsten och solnedgångsauror i guld & koppar',
    bgCanvas: '#0c0704',
    bgTopbar: '#170e08',
    bgSidebar: '#120b06',
    accentPrimary: '#f59e0b',
    accentSecondary: '#f97316',
    borderPrimary: '#451a03',
    gridLineColor: 'rgba(245, 158, 11, 0.08)',
    gridDotColor: '#78350f',
    nodeGlowColor: 'rgba(245, 158, 11, 0.45)',
    matrixTheme: 'amber_gold',
  },
  nordic_glacier: {
    id: 'nordic_glacier',
    name: 'Nordic Glacier',
    tagline: 'Frostad arktisk isblå med högkontrast och kristallklar kyla',
    bgCanvas: '#040d14',
    bgTopbar: '#081724',
    bgSidebar: '#06121c',
    accentPrimary: '#14b8a6',
    accentSecondary: '#06b6d4',
    borderPrimary: '#134e4a',
    gridLineColor: 'rgba(20, 184, 166, 0.08)',
    gridDotColor: '#115e59',
    nodeGlowColor: 'rgba(20, 184, 166, 0.45)',
    matrixTheme: 'ice_blue',
  },
  blueprint_light: {
    id: 'blueprint_light',
    name: 'Blueprint (Presentation Light)',
    tagline: 'Högkontrast ritningsläge (Blueprint) i ljusblått & vitt för projektorer, skärmdelning & presentationer',
    isLight: true,
    bgCanvas: '#f0f6fc',
    bgTopbar: '#0f172a',
    bgSidebar: '#1e293b',
    accentPrimary: '#0284c7',
    accentSecondary: '#0369a1',
    borderPrimary: '#cbd5e1',
    gridLineColor: 'rgba(2, 132, 199, 0.22)',
    gridDotColor: '#94a3b8',
    nodeGlowColor: 'rgba(2, 132, 199, 0.35)',
    matrixTheme: 'ice_blue',
  },
};

export interface AvatarPreset {
  id: string;
  name: string;
  category: 'cyber' | 'architect' | 'security' | 'robot';
  color: string;
  iconBg: string;
  svgPath: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar_cyber_hacker',
    name: 'Cyber Operative',
    category: 'cyber',
    color: '#06b6d4',
    iconBg: 'from-cyan-500/20 to-teal-500/20',
    svgPath: 'M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm3-6V7a3 3 0 0 0-6 0v2h6z',
  },
  {
    id: 'avatar_net_arch',
    name: 'Network Architect',
    category: 'architect',
    color: '#3b82f6',
    iconBg: 'from-blue-500/20 to-indigo-500/20',
    svgPath: 'M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z',
  },
  {
    id: 'avatar_sec_analyst',
    name: 'SOC Analyst',
    category: 'security',
    color: '#f43f5e',
    iconBg: 'from-rose-500/20 to-amber-500/20',
    svgPath: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 8c2.67 0 8 1.34 8 4v1H4v-1c0-2.66 5.33-4 8-4z',
  },
  {
    id: 'avatar_ai_core',
    name: 'AI Simulator Core',
    category: 'robot',
    color: '#a855f7',
    iconBg: 'from-purple-500/20 to-pink-500/20',
    svgPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6zm0 3a3 3 0 1 0 3 3 3 3 0 0 0-3-3z',
  },
  {
    id: 'avatar_cloud_eng',
    name: 'Cloud Engineer',
    category: 'architect',
    color: '#14b8a6',
    iconBg: 'from-teal-500/20 to-emerald-500/20',
    svgPath: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
  },
  {
    id: 'avatar_sysadmin',
    name: 'CCIE SysAdmin',
    category: 'architect',
    color: '#f59e0b',
    iconBg: 'from-amber-500/20 to-orange-500/20',
    svgPath: 'M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
  },
  {
    id: 'avatar_glitch_shadow',
    name: 'Shadow Phantom',
    category: 'cyber',
    color: '#ec4899',
    iconBg: 'from-pink-500/20 to-rose-500/20',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  },
  {
    id: 'avatar_sentinel_defense',
    name: 'Defense Sentinel',
    category: 'security',
    color: '#22c55e',
    iconBg: 'from-emerald-500/20 to-teal-500/20',
    svgPath: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z',
  },
];

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  themeId: 'cyber_matrix',
  canvasGridStyle: 'dots',
  gridSnap: true,
  gridSnapSize: 20,
  matrixRainEnabled: true,
  matrixRainOpacity: 0.25,
  matrixRainSpeed: 1,
  matrixRainTheme: 'classic_green',
  ambientGlowEnabled: true,
  uiFontTheme: 'cyber',

  packetAnimationSpeed: 1,
  autoSaveIntervalSeconds: 30,
  soundEffectsEnabled: true,
  soundVolume: 0.5,
  showLabelsOnCanvas: true,
  showIpBadgesOnCanvas: true,
  showMacBadgesOnCanvas: false,
  showPortLabelsOnLinks: true,
  showMinimap: 'always',
  showVisualDebugger: false,
  cableAnimationGlow: true,

  defaultGateway: '192.168.1.1',
  defaultSubnetMask: '255.255.255.0',
  defaultDnsServer: '8.8.8.8',
  defaultCableType: 'auto',
  autoAssignIpOnCreate: true,

  hackerAggression: 'moderate',
  autoContainmentOnBreach: false,
  mitreDetailLevel: 'verbose_hex',
};

const SETTINGS_STORAGE_KEY = 'eklund_advanced_settings';
const PROFILE_STORAGE_KEY = 'eklund_user_profile';
export const SYSTEM_THEME_STORAGE_KEY = 'eklund_system_theme';

export function loadSavedSettings(): AdvancedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const systemThemeOverride = localStorage.getItem(SYSTEM_THEME_STORAGE_KEY);
    let merged = { ...DEFAULT_ADVANCED_SETTINGS };
    if (raw) {
      merged = { ...merged, ...JSON.parse(raw) };
    }
    if (systemThemeOverride && (systemThemeOverride in SIMULATOR_THEMES)) {
      merged.themeId = systemThemeOverride as SimulatorThemeId;
    }
    return merged;
  } catch {
    return DEFAULT_ADVANCED_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: AdvancedSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (settings.themeId) {
      localStorage.setItem(SYSTEM_THEME_STORAGE_KEY, settings.themeId);
    }
  } catch (err) {
    console.error('Failed to save advanced settings', err);
  }
}

export function loadSavedProfile(currentUserEmail?: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!currentUserEmail || parsed.email.toLowerCase() === currentUserEmail.toLowerCase()) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function saveProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    // Also update eklund_current_user username if changed
    const currentUser = localStorage.getItem('eklund_current_user');
    if (currentUser) {
      const parsed = JSON.parse(currentUser);
      parsed.username = profile.username;
      localStorage.setItem('eklund_current_user', JSON.stringify(parsed));
    }
  } catch (err) {
    console.error('Failed to save user profile', err);
  }
}
