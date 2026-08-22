'use client';

import React, { useState, useEffect, useRef } from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  glowColor?: string;
  borderColor?: string;
  className?: string;
  theme?: 'default' | 'glass' | 'neo' | 'brutalist';
}

export default function InteractiveCard({
  children,
  onClick,
  glowColor = 'rgba(37,99,235,0.22)',
  borderColor = 'rgba(203,213,225,0.35)',
  className = '',
  theme: customTheme
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [internalTheme, setInternalTheme] = useState<'default' | 'glass' | 'neo' | 'brutalist'>('default');

  useEffect(() => {
    // If a theme is explicitly provided, stick with it
    if (customTheme) {
      setInternalTheme(customTheme);
      return;
    }

    // Otherwise, listen for global theme switcher updates
    const updateTheme = () => {
      try {
        const saved = (localStorage.getItem('quillhawk-theme-style') || localStorage.getItem('readsphere-theme-style')) as any;
        if (saved && ['default', 'glass', 'neo', 'brutalist'].includes(saved)) {
          setInternalTheme(saved);
        } else {
          setInternalTheme('default');
        }
      } catch (e) {}
    };

    updateTheme();
    window.addEventListener('theme-style-change', updateTheme);
    return () => window.removeEventListener('theme-style-change', updateTheme);
  }, [customTheme]);

  const activeTheme = customTheme || internalTheme;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Mouse coordinates relative to card boundaries
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    // 3D tilt calculations
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Disable tilt for Brutalism to keep it flat and blocky
    const maxTilt = activeTheme === 'brutalist' ? 0 : 8;
    const tiltX = -((y - centerY) / centerY) * maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Card theme-based custom classes (Inkish Blue + Greyish Silver palette)
  let themeCardClass = 'bg-[#0D1733]/90 border border-slate-700/60 rounded-2xl shadow-lg';
  if (activeTheme === 'glass') {
    themeCardClass = 'bg-slate-900/40 backdrop-blur-2xl border border-slate-300/15 shadow-2xl rounded-[20px]';
  } else if (activeTheme === 'neo') {
    themeCardClass = 'bg-[#0F172A] shadow-[8px_8px_20px_#080C17,_-8px_-8px_20px_#16223D] border border-slate-700/30 rounded-[24px]';
  } else if (activeTheme === 'brutalist') {
    themeCardClass = 'bg-[#0C101C] border-3 border-slate-200 shadow-[6px_6px_0px_#38BDF8] rounded-none';
  }

  // Dynamic shadow glows for modern styles
  const shadowGlow = isHovered && activeTheme !== 'brutalist' && activeTheme !== 'neo'
    ? { boxShadow: `0 0 35px -5px ${borderColor}` }
    : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'none' : 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        ...shadowGlow
      }}
      className={`relative overflow-hidden cursor-pointer select-none transition-all duration-350 ${themeCardClass} ${className}`}
    >
      {/* Dynamic Hover Spotlight following mouse cursor inside card */}
      {isHovered && activeTheme !== 'brutalist' && (
        <div
          className="absolute pointer-events-none rounded-full blur-[65px]"
          style={{
            width: '180px',
            height: '180px',
            background: glowColor,
            left: `${coords.x - 90}px`,
            top: `${coords.y - 90}px`,
            mixBlendMode: 'screen',
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
