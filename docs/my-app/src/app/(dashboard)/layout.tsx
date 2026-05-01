import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0c10] text-slate-50 relative font-sans">
      {/* Flashy Background for Dashboard */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-screen"
        style={{ backgroundImage: 'url(/dashboard-bg.png)' }}
      ></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
      </div>

      {/* Sidebar (Communities & Navigation) */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-md flex flex-col z-10 relative">
        <div className="p-4 border-b border-gray-800 flex items-center justify-center">
          <h1 className="text-xl font-bold text-primary">ReadSphere</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <a href="/dashboard" className="px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors text-foreground">Library</a>
          <a href="/communities" className="px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors text-muted hover:text-foreground">Communities</a>
          <a href="/publish" className="px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors text-muted hover:text-foreground">Publish Book</a>
          <a href="/premium" className="px-3 py-2 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors text-warning hover:text-warning/80">Get Premium</a>
        </div>
        <div className="p-4 border-t border-gray-800">
          <a href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
              U
            </div>
            <div className="text-sm">
              <p className="font-medium">My Profile</p>
              <p className="text-xs text-muted">View stats & badges</p>
            </div>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-gray-800 bg-surface/50 backdrop-blur-sm flex items-center px-6 sticky top-0 z-10 flex-shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-sm text-muted">
            <button className="hover:text-foreground transition-colors">Search</button>
            <button className="hover:text-foreground transition-colors">Notifications</button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
