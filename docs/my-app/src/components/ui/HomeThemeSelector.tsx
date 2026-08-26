'use client';

import React from 'react';
import { useTheme, AppTheme } from '@/components/ThemeProvider';
import { Sparkles, Moon, Laptop, Check, ArrowRight } from 'lucide-react';
import InteractiveCard from './InteractiveCard';

export default function HomeThemeSelector() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themesList: {
    id: AppTheme;
    label: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    glow: string;
    border: string;
  }[] = [
    {
      id: 'silver',
      label: 'Silver Nude Theme',
      badge: 'Signature Aesthetic',
      desc: 'Warm silver-greyish nude base with soft alabaster cards, stone silver borders, and deep ink typography.',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      color: 'from-amber-200 via-stone-300 to-slate-400',
      glow: 'rgba(219, 212, 202, 0.45)',
      border: 'var(--card-border-color)',
    },
    {
      id: 'dark',
      label: 'Midnight Dark Theme',
      badge: 'Deep Ink Obsidian',
      desc: 'Deep midnight navy base, obsidian slate surfaces, sapphire blue accents, and luminescent silver typography.',
      icon: <Moon className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-600 via-indigo-700 to-slate-900',
      glow: 'rgba(37, 99, 235, 0.35)',
      border: 'var(--card-border-color)',
    },
    {
      id: 'system',
      label: 'System Default',
      badge: 'Automatic Sync',
      desc: 'Follows your operating system color scheme dynamically in real-time, activating Dark or Silver automatically.',
      icon: <Laptop className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500 via-indigo-600 to-blue-500',
      glow: 'rgba(168, 85, 247, 0.35)',
      border: 'var(--card-border-color)',
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 z-10 relative">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visual Theme Customizer</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-foreground mb-3">
          Choose Your Visual Experience
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
          Switch seamlessly between the signature Silver aesthetic, deep Midnight Dark mode, or automatic System Default across your entire library.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themesList.map((t) => {
          const isActive = theme === t.id;
          return (
            <InteractiveCard
              key={t.id}
              onClick={() => setTheme(t.id)}
              glowColor={t.glow}
              borderColor={t.border}
              className={`p-7 flex flex-col justify-between min-h-[250px] transition-all duration-300 relative group border ${
                isActive
                  ? 'ring-2 ring-primary shadow-xl scale-[1.02] bg-card'
                  : 'hover:scale-[1.01] bg-card/80 hover:bg-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${t.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 border border-card-border`}
                  >
                    {t.icon}
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full shadow-sm">
                      <Check className="w-3 h-3" /> Active Mode
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted group-hover:text-foreground transition-colors uppercase tracking-wider">
                      {t.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-foreground font-display mb-2 group-hover:text-primary transition-colors">
                  {t.label}
                </h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {t.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-muted group-hover:text-foreground transition-colors mt-6 pt-4 border-t border-card-border/60">
                <span>{isActive ? `Applied (${t.id === 'system' ? resolvedTheme : t.id})` : 'Click to Apply'}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-primary' : 'group-hover:translate-x-1'}`} />
              </div>
            </InteractiveCard>
          );
        })}
      </div>
    </section>
  );
}
