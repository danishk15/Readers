'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Check, Moon, ShieldAlert, Cpu } from 'lucide-react';

type ThemeStyle = 'default' | 'glass' | 'neo' | 'brutalist';

export default function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState<ThemeStyle>('default');
  const [isOpen, setIsOpen] = useState(false);

  // Initialize theme from localStorage
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

  const themesList: { id: ThemeStyle; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: 'default', 
      label: 'Sleek Inkish Silver', 
      desc: 'Deep midnight ink background with radiant sapphire and greyish silver accents.',
      icon: <Moon className="w-4 h-4" />, 
      color: 'from-blue-600 to-slate-400' 
    },
    { 
      id: 'glass', 
      label: 'Frosted Silver Glass', 
      desc: 'Translucent ink glass, icy silver borders, and glowing ambient highlights.',
      icon: <Layers className="w-4 h-4" />, 
      color: 'from-sky-400 to-blue-600' 
    },
    { 
      id: 'neo', 
      label: 'Brushed Titanium & Ink', 
      desc: 'Soft slate titanium clay surfaces with deep midnight dual shadows.',
      icon: <Cpu className="w-4 h-4" />, 
      color: 'from-slate-400 to-blue-500' 
    },
    { 
      id: 'brutalist', 
      label: 'Cyber Silver & Ink', 
      desc: 'Sharp silver chrome borders, deep ink black blocks, and cyan accents.',
      icon: <ShieldAlert className="w-4 h-4" />, 
      color: 'from-slate-200 to-cyan-400' 
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-300 flex items-center justify-center text-white shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:shadow-[0_0_35px_rgba(37,99,235,0.65)] hover:scale-108 active:scale-95 transition-all duration-300 relative group border border-slate-300/30"
        title="QuillHawk UI Style Switcher"
      >
        <Sparkles className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-180 scale-90' : 'group-hover:rotate-12'}`} />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-400 border border-slate-950"></span>
        </span>
      </button>

      {/* Style Selector Popover panel */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-80 bg-[#050814]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <span>🪶</span> QuillHawk Styles
            </h3>
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 uppercase tracking-widest border border-blue-500/20">
              Ink & Silver
            </span>
          </div>

          <div className="space-y-2">
            {themesList.map((t) => {
              const isActive = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    isActive 
                      ? 'bg-blue-950/40 border border-blue-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-slate-950 shadow font-bold`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{t.label}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal mt-0.5">{t.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <p className="text-[9px] text-slate-400 leading-normal">
              Inkish Blue blended with Greyish Silver. Global persistent styles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
