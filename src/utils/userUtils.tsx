import React, { useState } from 'react';
import { UserProfile } from '../types';

export function getGreeting(name: string): string {
  const firstName = name ? name.split(' ')[0] : 'User';
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good Morning, ${firstName}`;
  } else if (hour < 17) {
    return `Good Afternoon, ${firstName}`;
  } else {
    return `Good Evening, ${firstName}`;
  }
}

export function getUserInitials(name: string): string {
  if (!name) return 'HF';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserAvatarProps {
  user: Partial<UserProfile> | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatusIndicator?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showStatusIndicator = false
}) => {
  const [imageError, setImageError] = useState(false);

  const name = user?.name || 'User';
  const initials = getUserInitials(name);
  const hasAvatarUrl = user?.avatar && typeof user.avatar === 'string' && user.avatar.trim().length > 0 && !imageError;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {hasAvatarUrl ? (
        <img
          src={user!.avatar}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-white/20 shadow-md`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center border border-white/20 shadow-md tracking-wider font-mono`}
        >
          {initials}
        </div>
      )}

      {showStatusIndicator && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#11131c] rounded-full shadow-sm" />
      )}
    </div>
  );
};
