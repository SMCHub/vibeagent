'use client';

import { Settings, RefreshCw, Loader2, Brain, BarChart3, MessageSquare, LayoutDashboard, Globe, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';

type Tab = 'summary' | 'mentions' | 'analysis' | 'sources';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onScrape: () => void;
  isScraping: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  userName?: string;
  onLogout?: () => void;
}

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'summary', label: 'Übersicht', icon: LayoutDashboard },
  { key: 'mentions', label: 'Erwähnungen', icon: MessageSquare },
  { key: 'analysis', label: 'Analyse', icon: BarChart3 },
  { key: 'sources', label: 'Quellen', icon: Globe },
];

export default function Header({
  activeTab,
  onTabChange,
  onScrape,
  isScraping,
  onAnalyze,
  isAnalyzing,
  userName,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Top row: Logo + Actions */}
        <div className="flex items-center justify-between py-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Image src="/logo.png" alt="Vibe Agent" width={130} height={32} className="h-7 w-auto" />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onScrape}
              disabled={isScraping}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                'text-muted-foreground hover:bg-accent hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="Quellen aktualisieren"
            >
              {isScraping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Aktualisieren</span>
            </button>
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                'text-muted-foreground hover:bg-accent hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="Sentiment analysieren"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Analysieren</span>
            </button>
            <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <Link
              href="/settings"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Einstellungen"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>
            {userName && (
              <>
                <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <span className="text-xs text-muted-foreground hidden sm:inline">{userName}</span>
              </>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Abmelden"
                title="Abmelden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="-mb-px flex gap-1" aria-label="Dashboard Navigation">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={clsx(
                  'group relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={clsx('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                {label}
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Bottom border */}
      <div className="h-px bg-border" />
    </header>
  );
}
