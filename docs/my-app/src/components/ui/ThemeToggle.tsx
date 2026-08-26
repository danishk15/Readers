'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, AppTheme } from '@/components/ThemeProvider';
import { Sparkles, Moon, Laptop, Check, ChevronDown } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'segmented' | 'dropdown' | 'cycle';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const THEME_OPTIONS: {
  id: AppTheme;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}[] = [
  {
    id: 'silver',
    label: 'Silver Theme',
    shortLabel: 'Silver',
    desc: 'Warm silver-greyish nude with deep ink accents',
    icon: Sparkles,
    accentColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'dark',
    label: 'Dark Theme',
    shortLabel: 'Dark',
    desc: 'Midnight deep ink obsidian dark mode',
    icon: Moon,
    accentColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    id: 'system',
    label: 'System Default',
    shortLabel: 'System',
    desc: 'Automatically matches your device OS preference',
    icon: Laptop,
    accentColor: 'text-purple-600 dark:text-purple-400',
  },
];

export default function ThemeToggle({
  variant = 'dropdown',
  className = '',
  size = 'md',
  showLabel = true,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, isLoaded } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  // Size styles
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2',
    lg: 'text-sm px-4 py-2 gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  // 1. CYCLE VARIANT (Click to cycle through 3 themes)
  if (variant === 'cycle') {
    const handleCycle = () => {
      const order: AppTheme[] = ['silver', 'dark', 'system'];
      const nextIndex = (order.indexOf(theme) + 1) % order.length;
      setTheme(order[nextIndex]);
    };

    return (
      <button
        type="button"
        onClick={handleCycle}
        title={`Current: ${currentOption.label}. Click to cycle theme.`}
        className={`inline-flex items-center justify-center rounded-xl bg-surface/90 hover:bg-surface-hover border border-card-border text-foreground transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${sizeClasses[size]} ${className}`}
        aria-label="Toggle Theme"
      >
        <CurrentIcon className={`${iconSizes[size]} ${currentOption.accentColor}`} />
        {showLabel && <span className="font-bold tracking-tight">{currentOption.shortLabel}</span>}
      </button>
    );
  }

  // 2. SEGMENTED CONTROL VARIANT (All 3 buttons in a pill)
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-2xl bg-surface/90 backdrop-blur-md border border-card-border shadow-sm ${className}`}
      >
        {THEME_OPTIONS.map((opt) => {
          const isActive = theme === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-card text-foreground shadow-md border border-card-border scale-[1.02]'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover/60 border border-transparent'
              }`}
              title={`${opt.label}: ${opt.desc}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? opt.accentColor : 'text-muted'}`} />
              {showLabel && <span>{opt.shortLabel}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // 3. DROPDOWN VARIANT (Default: Compact button with popover menu)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center rounded-xl bg-surface/95 hover:bg-surface-hover border border-card-border text-foreground transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer ${sizeClasses[size]}`}
        aria-expanded={isOpen}
        aria-label="Select Theme Mode"
      >
        <CurrentIcon className={`${iconSizes[size]} ${currentOption.accentColor}`} />
        {showLabel && (
          <span className="font-bold tracking-tight">
            {currentOption.shortLabel}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-card-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-card-border/60 mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Select Visual Theme</p>
            <p className="text-[11px] text-foreground font-semibold">
              Currently active: <span className="capitalize text-primary font-bold">{theme}</span> {theme === 'system' && `(${resolvedTheme})`}
            </p>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-surface border border-card-border shadow-sm'
                      : 'hover:bg-surface-hover border border-transparent'
                  }`}
                  role="menuitem"
                >
                  <div className={`p-2 rounded-lg bg-surface border border-card-border shrink-0 mt-0.5 ${isSelected ? 'shadow-inner' : ''}`}>
                    <Icon className={`w-4 h-4 ${opt.accentColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted leading-tight mt-0.5 line-clamp-2">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
