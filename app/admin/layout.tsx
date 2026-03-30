'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin/products', label: 'Products', icon: '🚗' },
    { href: '/admin/marketplace', label: 'P2P Market', icon: '🏷️' },
    { href: '/admin/orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-white font-sans overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#161b22] border-r border-[#30363d] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[#30363d] flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <span className="text-[#FF42B0]">DIECAST</span> SYSTEM
            </h1>
            <p className="text-xs text-gray-400 mt-1">Manual Save CMS</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all font-medium text-sm ${
                  isActive 
                  ? 'bg-white/10 text-[#FF42B0] shadow-sm border border-white/5' 
                  : 'text-gray-400 hover:bg-[#1f242b] hover:text-white'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#30363d]">
          <Link 
            href="/"
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-400 bg-[#161b22] border border-[#30363d] rounded-md hover:bg-[#30363d] hover:text-white transition-all"
          >
            Exit to Store
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-[#0d1117] overflow-y-auto relative w-full">
        <header className="h-16 border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur-[1px] sticky top-0 z-30 flex items-center px-4 lg:px-8 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h2 className="text-base font-semibold text-gray-200">System Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-[#3fb950] bg-[#2ea043]/10 px-2 py-1 rounded border border-[#2ea043]/20">Live Sync</span>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
