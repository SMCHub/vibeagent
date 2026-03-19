'use client';

import { clsx } from 'clsx';
import {
  Facebook,
  Twitter,
  Camera,
  Play,
  Music,
  MessageCircle,
  Newspaper,
  Linkedin,
} from 'lucide-react';
import type { Platform } from '@/lib/types';

const platformConfig: Record<
  Platform,
  { label: string; color: string; icon: React.ElementType }
> = {
  facebook: { label: 'Facebook', color: '#1877F2', icon: Facebook },
  twitter: { label: 'Twitter', color: '#1DA1F2', icon: Twitter },
  instagram: { label: 'Instagram', color: '#E4405F', icon: Camera },
  youtube: { label: 'YouTube', color: '#FF0000', icon: Play },
  tiktok: { label: 'TikTok', color: '#00F2EA', icon: Music },
  reddit: { label: 'Reddit', color: '#FF4500', icon: MessageCircle },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', icon: Linkedin },
  news: { label: 'News', color: '#5f6368', icon: Newspaper },
};

interface SourceBadgeProps {
  platform: Platform;
  className?: string;
}

export default function SourceBadge({ platform, className }: SourceBadgeProps) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md bg-[#f1f3f4] px-2.5 py-1 text-xs font-medium text-[#5f6368]',
        className,
      )}
    >
      <Icon className="h-3 w-3" style={{ color: config.color }} />
      <span>{config.label}</span>
    </span>
  );
}
