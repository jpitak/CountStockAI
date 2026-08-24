import React from 'react';
import { ArrowLeft, Menu, Wifi, Battery, ShieldCheck, UserCheck, Sparkles, Bot } from 'lucide-react';
import { ActiveScreen, UserRole } from '../types';

interface HeaderProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  online: boolean;
  onOpenDrawer?: () => void;
  currentUserRole?: UserRole;
}

export const Header: React.FC<HeaderProps> = ({ activeScreen, onNavigate, online, onOpenDrawer, currentUserRole = 'Admin' }) => {
  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'home':
        return 'COUNT STOCK';
      case 'scan':
        return 'SCAN ITEM';
      case 'view':
        return 'VIEW ITEM SCAN';
      case 'sync':
        return 'DATA SYNC';
      case 'ai':
        return 'AI CONSULTANT & ISO';
      case 'setting':
        return 'SETTING';
      case 'permissions':
        return 'PERMISSIONS CONTROL';
      case 'theming':
        return 'THEMING';
      case 'item_master':
        return 'ITEM MASTER';
      case 'location_master':
        return 'LOCATION MASTER';
      case 'ai_spec':
        return 'AI SPEC GENERATOR';
      case 'deliverables':
        return 'MASTER DELIVERABLES';
      case 'qrcode_config':
        return 'QR CODE SETTINGS';
      default:
        return 'COUNT STOCK';
    }
  };

  const showBackButton = activeScreen !== 'home';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      {/* Mobile PDA Top Status Bar (Android Style) - Professional Polish Theme */}
      <div className="bg-slate-900 text-slate-100 text-[10px] px-3 py-1 flex justify-between items-center tracking-wider font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-extrabold text-white tracking-widest uppercase">OGA PDA</span>
          <span className="text-[9px] bg-indigo-900 text-yellow-300 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
            <UserCheck className="w-2.5 h-2.5" /> {currentUserRole}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
            <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
            <span className={`font-extrabold tracking-wider ${online ? 'text-emerald-400' : 'text-rose-400'}`}>
              {online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <span className="text-slate-400 font-bold">v2.4.0</span>
          <div className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-mono">98%</span>
          </div>
        </div>
      </div>

      {/* Main Screen Header */}
      <div className="px-4 py-3 flex items-center justify-between min-h-[54px] bg-white border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {showBackButton ? (
            <button
              onClick={() => onNavigate('home')}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-blue-600 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="bg-blue-600 text-white font-black px-2.5 py-1 rounded-lg text-xs tracking-wider uppercase shadow-xs">
              OGA
            </div>
          )}
          <h1 className="font-black text-slate-900 tracking-tight text-base sm:text-lg uppercase">
            {getScreenTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('ai')}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border ${
              activeScreen === 'ai'
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="AI Consultant & ISO Document Generator"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => onOpenDrawer ? onOpenDrawer() : onNavigate('setting')}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Menu Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
