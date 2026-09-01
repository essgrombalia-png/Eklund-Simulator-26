import React from 'react';
import { AVATAR_PRESETS } from '../utils/themeManager';
import { UserStatusBadge } from '../types';
import { Shield, Sparkles, User } from 'lucide-react';

interface UserAvatarProps {
  avatarId?: string;
  customUrl?: string;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: UserStatusBadge;
  className?: string;
  showGlow?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarId = 'avatar_cyber_hacker',
  customUrl,
  username = 'Operatör',
  size = 'md',
  status,
  className = '',
  showGlow = true,
}) => {
  const preset = AVATAR_PRESETS.find((p) => p.id === avatarId) || AVATAR_PRESETS[0];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const statusDotSize = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  const statusColors: Record<UserStatusBadge, { bg: string; title: string }> = {
    active: { bg: 'bg-emerald-400', title: 'Aktiv (Online)' },
    in_lab: { bg: 'bg-cyan-400', title: 'I Cyber Security Lab' },
    architecting: { bg: 'bg-amber-400', title: 'Bygger Nätverk' },
    dnd: { bg: 'bg-rose-500', title: 'Stör Ej (Simulerar)' },
  };

  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Glow effect */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 transition-all duration-300"
          style={{ backgroundColor: preset.color }}
        />
      )}

      {/* Main Container */}
      <div
        className={`relative rounded-full flex items-center justify-center overflow-hidden border border-slate-700/80 bg-slate-950 font-orbitron font-bold shadow-inner ${sizeClasses[size]}`}
        style={{
          boxShadow: `0 0 10px ${preset.color}33`,
          borderColor: `${preset.color}88`,
        }}
      >
        {customUrl ? (
          <img
            src={customUrl}
            alt={username}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to preset if image fails
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${preset.iconBg}`}
          >
            <svg
              className="w-3/5 h-3/5"
              viewBox="0 0 24 24"
              fill={preset.color}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={preset.svgPath} />
            </svg>
          </div>
        )}
      </div>

      {/* Status Dot */}
      {status && (
        <span
          title={statusColors[status].title}
          className={`absolute bottom-0 right-0 rounded-full ring-slate-950 shadow-sm ${statusColors[status].bg} ${statusDotSize[size]}`}
        />
      )}
    </div>
  );
};
