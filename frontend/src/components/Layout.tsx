import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ChildPicker } from './ChildPicker';
import { Home, CheckSquare, Gift, History, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Layout: React.FC = () => {
  const { selectedChild } = useApp();
  const location = useLocation();

  // Navigation Items
  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/aktivitas', label: 'Aktivitas', icon: CheckSquare },
    { path: '/reward', label: 'Reward', icon: Gift },
    { path: '/riwayat', label: 'Riwayat', icon: History },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      {/* Centered Mobile Shell for Premium Desktop View */}
      <div className="w-full max-w-md h-screen bg-slate-50 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="star">⭐️</span>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Poin Anak
            </h1>
          </div>
          
          {/* Only show picker if not on admin page or if admin page is active but we still want to switch */}
          {location.pathname !== '/admin' && <ChildPicker />}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                    isActive
                      ? 'text-primary-600 font-semibold scale-105'
                      : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-xl transition-colors ${
                        isActive ? 'bg-primary-50 text-primary-600' : 'bg-transparent'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
