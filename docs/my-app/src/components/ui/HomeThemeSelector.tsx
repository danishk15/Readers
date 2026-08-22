'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Layers, Cpu, ShieldAlert, Check, Sparkles } from 'lucide-react';
import InteractiveCard from './InteractiveCard';

type ThemeStyle = 'default' | 'glass' | 'neo' | 'brutalist';

export default function HomeThemeSelector() {
  const [activeTheme, setActiveTheme] = useState<ThemeStyle>('default');

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('quillhawk-theme-style') || localStorage.getItem('readsphere-theme-style')) as ThemeStyle;
      if (saved && ['default', 'glass', 'neo', 'brutalist'].includes(saved)) {
        setActiveTheme(saved);
      }
    } catch (e) {}
  }, []);

  const changeTheme = (newTheme: ThemeStyle) => {
    setActiveTheme(newTheme);
    try {
      localStorage.setItem('quillhawk-theme-style', newTheme);
      localStorage.setItem('readsphere-theme-style', newTheme);
      
      // Remove existing classes
      document.documentElement.classList.remove('theme-glass', 'theme-neo', 'theme-brutalist');
      
      // Add new class if not default
      if (newTheme !== 'default') {
        document.documentElement.classList.add(`theme-${newTheme}`);
      }
      
      // Trigger a window event in case other components need to listen for theme shifts
      window.dispatchEvent(new Event('theme-style-change'));
    } catch (e) {
      console.error(e);
    }
  };

  const themesList: { 
    id: ThemeStyle; 
    label: string; 
    desc: string; 
    icon: React.ReactNode; 
    color: string;
    glow: string;
    border: string;
    badge: string;
  }[] = [
    { 
      id: 'default', 
      label: 'Sleek Inkish Silver', 
      desc: 'Deep ink midnight background with luminescent cobalt blue and brushed silver chrome.',
      icon: <Moon className="w-5 h-5" />, 
      color: 'from-blue-600 to-slate-400',
      glow: 'rgba(37, 99, 235, 0.22)',
      border: 'rgba(203, 213, 225, 0.35)',
      badge: 'Quill Standard'
    },
    { 
      id: 'glass', 
      label: 'Frosted Silver Glass', 
      desc: 'Translucent ink glass, icy silver borders, and glowing oceanic sapphire ambient blobs.',
      icon: <Layers className="w-5 h-5" />, 
      color: 'from-sky-400 to-blue-600',
      glow: 'rgba(56, 189, 248, 0.25)',
      border: 'rgba(226, 232, 240, 0.45)',
      badge: 'Aero Titanium'
    },
    { 
      id: 'neo', 
      label: 'Brushed Titanium & Ink', 
      desc: 'Tactile slate clay surfaces with delicate convex extrusions and dual drop-shadows.',
      icon: <Cpu className="w-5 h-5" />, 
      color: 'from-slate-300 to-blue-500',
      glow: 'rgba(148, 163, 184, 0.2)',
      border: 'rgba(148, 163, 184, 0.35)',
      badge: 'Skeuomorphic'
    },
    { 
      id: 'brutalist', 
      label: 'Cyber Silver & Ink', 
      desc: 'Polished silver chrome borders, deep ink black geometry, and electric cyan highlights.',
      icon: <ShieldAlert className="w-5 h-5" />, 
      color: 'from-slate-200 to-cyan-400',
      glow: 'rgba(56, 189, 248, 0.3)',
      border: 'rgba(226, 232, 240, 0.65)',
      badge: 'Cyber Modern'
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12 z-10 relative">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-3 shadow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Visual Studio</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white mb-2">
          Experience Your Vibe
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          QuillHawk adapts to your aesthetic. Switch themes below to see the entire platform re-skin itself in ink and silver instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {themesList.map((t) => {
          const isActive = activeTheme === t.id;
          return (
            <InteractiveCard
              key={t.id}
              onClick={() => changeTheme(t.id)}
              glowColor={t.glow}
              borderColor={t.border}
              theme={t.id}
              className={`p-6 flex flex-col justify-between min-h-[220px] transition-all duration-300 relative group border ${
                isActive 
                  ? 'ring-2 ring-blue-500/60 scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    {t.icon}
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/35 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-wider">
                      {t.badge}
                    </span>
                  )}
                </div>
                
                <h3 className="text-base font-bold text-white font-display mb-1.5 transition-colors">
                  {t.label}
                </h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed line-clamp-3">
                  {t.desc}
                </p>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors mt-6 pt-3 border-t border-slate-700/40">
                {isActive ? 'Active Design Theme' : 'Click to Apply Theme →'}
              </div>
            </InteractiveCard>
          );
        })}
      </div>
    </section>
  );
}
