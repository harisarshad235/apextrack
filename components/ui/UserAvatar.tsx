'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
  user?: {
    name?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-[11px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-16 h-16 text-xl font-bold',
};

// Deterministic pleasing gradient based on user name
const GRADIENTS = [
  'from-blue-600 to-indigo-600 text-white',
  'from-emerald-600 to-teal-600 text-white',
  'from-purple-600 to-indigo-600 text-white',
  'from-amber-600 to-rose-600 text-white',
  'from-rose-600 to-pink-600 text-white',
  'from-cyan-600 to-blue-600 text-white',
  'from-violet-600 to-purple-600 text-white',
];

export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

function getGradientIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENTS.length;
}

export function UserAvatar({
  user,
  size = 'md',
  className = '',
  title,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const name = user?.name || 'User';
  const initials = getInitials(user?.name, user?.email);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const gradientClass = GRADIENTS[getGradientIndex(user?.email || name)];
  const tooltipText = title || name;

  // Filter out any automated cartoon avatars (dicebear)
  const isCartoonUrl = user?.avatarUrl?.includes('dicebear.com');
  const hasValidAvatar = !!user?.avatarUrl && !isCartoonUrl && !imageError;

  if (hasValidAvatar) {
    return (
      <img
        src={user!.avatarUrl!}
        alt={name}
        title={tooltipText}
        onError={() => setImageError(true)}
        className={`${sizeClass} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      title={tooltipText}
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradientClass} font-semibold flex items-center justify-center flex-shrink-0 select-none shadow-sm ring-1 ring-black/10 dark:ring-white/10 ${className}`}
    >
      {initials}
    </div>
  );
}
