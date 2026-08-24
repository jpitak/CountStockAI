import React, { useState } from 'react';
import { ActiveScreen, UserRole, MenuPermissions } from '../types';
import { RefreshCw, Settings, Palette, Share2, Info, LogOut, ShieldCheck, Lock, UserCheck, QrCode, Bot, FileText, Download, FileArchive, Loader2 } from 'lucide-react';
import { CountStockLogo } from './CountStockLogo';
import { downloadManualFile } from '../utils/downloadHelper';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenAbout: () => void;
  onRefreshData: () => void;
  onShareApp: () => void;
  currentUserRole?: UserRole;
  permissions?: MenuPermissions;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAbout,
  onRefreshData,
  onShareApp,
  currentUserRole = 'Admin',
  permissions
}) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  if (!isOpen) return null;

  const canSettings = permissions ? permissions.setting : true;
  const canPermission = permissions ? permissions.permission : true;

  const handleDownload = async (type: 'docx' | 'pdf' | 'zip') => {
    setDownloadingType(type);
    let url = '';
    let filename = '';

    if (type === 'docx') {
      url = '/api/download-manual-docx';
      filename = 'OGA_COUNT_STOCK_AI_USER_MANUAL_SOP-WMS-STK-001_REV05.docx';
    } else if (type === 'pdf') {
      url = '/api/download-manual-pdf';
      filename = 'OGA_COUNT_STOCK_AI_USER_MANUAL_SOP-WMS-STK-001_REV05.pdf';
    } else {
      url = '/api/download-manual-zip';
      filename = 'OGA_Stock_Count_User_Manual_SOP-WMS-STK-001.zip';
    }

    await downloadManualFile(url, filename);
    setTimeout(() => {
      setDownloadingType(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark Overlay Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Side Drawer Content Panel matching Image 3 */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Header with Count Stock AI Logo matching Image 3 */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="bg-white p-1.5 rounded-xl shadow-md border border-white/80 shrink-0">
            <CountStockLogo size="sm" showSubtitle={false} />
          </div>

          <div>
            <h2 className="text-base font-black text-white tracking-tight leading-tight uppercase">
              COUNT STOCK
            </h2>
            <p className="text-[10px] text-blue-200 font-mono">OGA INTERNATIONAL</p>
            <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-amber-300 font-mono w-fit">
              <UserCheck className="w-2.5 h-2.5 text-yellow-300" />
              <span>ROLE: {currentUserRole}</span>
            </div>
          </div>
        </div>

        {/* Drawer Menu Options matching Image 3 */}
        <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {/* 1. รีเฟรช (Refresh) */}
          <button
            onClick={() => {
              onRefreshData();
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center gap-3.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-all"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
            <span>รีเฟรช</span>
          </button>

          {/* 2. ผู้ช่วยอัจฉริยะ AI & เอกสาร ISO (AI Specialist) */}
          <button
            onClick={() => {
              onNavigate('ai');
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center justify-between text-purple-700 bg-purple-50/70 hover:bg-purple-100 font-bold text-sm transition-all border border-purple-200/60"
          >
            <div className="flex items-center gap-3.5">
              <Bot className="w-5 h-5 text-purple-600" />
              <span>ผู้ช่วยอัจฉริยะ AI (ISO)</span>
            </div>
            <span className="text-[9px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
              AI EXPERT
            </span>
          </button>

          {/* 3. ตั้งค่ารูปแบบ QR Code (QR Code Settings) */}
          <button
            onClick={() => {
              onNavigate('qrcode_config');
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center justify-between text-indigo-700 hover:bg-indigo-50 font-bold text-sm transition-all"
          >
            <div className="flex items-center gap-3.5">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <span>ตั้งค่า QR Code</span>
            </div>
            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full">
              PROFILES
            </span>
          </button>

          {/* 3.1 คู่มือการใช้งานระบบ SOP (.DOCX, .PDF, .ZIP) */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-black text-emerald-950">คู่มือปฏิบัติงาน SOP</span>
              </div>
              <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                Rev.05
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDownload('docx')}
                disabled={downloadingType !== null}
                className="py-1.5 px-1 bg-white hover:bg-blue-50 text-blue-800 text-[10px] font-bold rounded-lg text-center shadow-2xs border border-blue-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
              >
                {downloadingType === 'docx' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Word</span>
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloadingType !== null}
                className="py-1.5 px-1 bg-white hover:bg-rose-50 text-rose-800 text-[10px] font-bold rounded-lg text-center shadow-2xs border border-rose-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
              >
                {downloadingType === 'pdf' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleDownload('zip')}
                disabled={downloadingType !== null}
                className="py-1.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75"
              >
                {downloadingType === 'zip' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>.ZIP</span>
              </button>
            </div>
          </div>

          {/* 3. Settings */}
          <button
            onClick={() => {
              onNavigate('setting');
              onClose();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between font-bold text-sm transition-all ${
              canSettings
                ? 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                : 'text-slate-400 hover:bg-slate-50 opacity-80'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Settings className={`w-5 h-5 ${canSettings ? 'text-slate-600' : 'text-slate-400'}`} />
              <span>Settings</span>
            </div>
            {!canSettings && <Lock className="w-4 h-4 text-amber-500" />}
          </button>

          {/* 5. Theming */}
          <button
            onClick={() => {
              onNavigate('theming');
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center gap-3.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-all"
          >
            <Palette className="w-5 h-5 text-slate-600" />
            <span>Theming</span>
          </button>

          {/* 6. หุ้น / Share */}
          <button
            onClick={() => {
              onShareApp();
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center gap-3.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-all"
          >
            <Share2 className="w-5 h-5 text-slate-600" />
            <span>หุ้น / Share</span>
          </button>

          {/* 7. เกี่ยวกับ (About) */}
          <button
            onClick={() => {
              onOpenAbout();
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center gap-3.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition-all"
          >
            <Info className="w-5 h-5 text-slate-600" />
            <span>เกี่ยวกับ</span>
          </button>

          {/* 8. ทางออก (Exit) */}
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center gap-3.5 text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all"
          >
            <LogOut className="w-5 h-5 text-rose-600" />
            <span>ทางออก</span>
          </button>
        </div>

        {/* Footer info in Drawer */}
        <div className="p-4 border-t border-slate-100 text-center bg-slate-50 text-[10px] text-slate-400 font-mono">
          <p className="font-bold text-slate-600">OGA INTERNATIONAL CO., LTD.</p>
          <p className="mt-0.5">Build 2.48.s | Role: {currentUserRole}</p>
        </div>
      </div>
    </div>
  );
};
