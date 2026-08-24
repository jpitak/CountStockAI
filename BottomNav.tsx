import React from 'react';
import { Home, Camera, ClipboardList, Bot, Settings, Lock } from 'lucide-react';
import { ActiveScreen, MenuPermissions } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  pendingSyncCount?: number;
  permissions?: MenuPermissions;
}

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, permissions }) => {
  const isAllowed = (screenId: string): boolean => {
    if (!permissions) return true;
    if (screenId === 'home') return true;
    if (screenId === 'scan') return permissions.scan;
    if (screenId === 'view') return permissions.view;
    if (screenId === 'ai') return true;
    if (screenId === 'setting') return permissions.setting;
    return true;
  };

  const tabs: NavTab[] = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-orange-500' },
    { id: 'scan', label: 'Scan', icon: Camera, color: 'text-blue-500' },
    { id: 'view', label: 'View', icon: ClipboardList, color: 'text-emerald-500' },
    { id: 'ai', label: 'AI', icon: Bot, color: 'text-purple-600' },
    { id: 'setting', label: 'Set', icon: Settings, color: 'text-slate-600' },
  ];

  return (
    <div className="bg-white border-t border-slate-100 fixed bottom-0 left-0 right-0 z-30 shadow-lg max-w-md mx-auto">
      <div className="flex justify-around items-center h-14 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          const allowed = isAllowed(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as ActiveScreen)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'scale-105 font-bold' : allowed ? 'opacity-70 hover:opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-slate-400'}`} />
                
                {/* Pending count badge */}
                {tab.badge !== undefined && tab.badge > 0 && allowed && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse border border-white">
                    {tab.badge}
                  </span>
                )}

                {/* Locked indicator badge */}
                {!allowed && (
                  <span className="absolute -top-1 -right-2 bg-slate-800 text-amber-400 rounded-full p-0.5 border border-white shadow-xs">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-wider uppercase font-bold ${isActive ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
