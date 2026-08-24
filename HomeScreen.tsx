import React, { useState } from 'react';
import { Package, Building2, Camera, ClipboardList, Settings, CheckCircle2, QrCode, Layers, Bot, Sparkles, ShieldCheck, FileText, Download, FileArchive, Loader2 } from 'lucide-react';
import { ActiveScreen, AppSettings, ScannedRecord, UserRole, MenuPermissions } from '../types';
import { CountStockLogo } from './CountStockLogo';
import { downloadManualFile } from '../utils/downloadHelper';

interface HomeScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  scannedRecords: ScannedRecord[];
  settings: AppSettings;
  online: boolean;
  lastSyncTime: string | null;
  currentUserRole: UserRole;
  permissions: MenuPermissions;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  scannedRecords,
  settings,
  online,
  currentUserRole,
  permissions
}) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const totalScanned = scannedRecords.reduce((acc, curr) => acc + curr.QuantityScan, 0);
  const totalRecords = scannedRecords.length;

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
    }, 800);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* 3D COUNT STOCK MAIN HEADER BANNER */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white rounded-[32px] p-5 text-center shadow-xl relative overflow-hidden mb-4 border-2 border-white/20">
        {/* Glow ambient background circles */}
        <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 transform -translate-x-6 translate-y-6 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* 3D COUNT STOCK Logo Card */}
        <div className="flex justify-center mb-2">
          <div className="bg-white p-3 rounded-2xl shadow-xl border border-white/80 inline-flex items-center justify-center transform hover:scale-105 transition-transform">
            <CountStockLogo size="md" showSubtitle={false} />
          </div>
        </div>

        <h2 className="text-xl font-black tracking-tight uppercase drop-shadow-md text-white">
          COUNT STOCK <span className="text-yellow-300 font-extrabold underline decoration-2 underline-offset-4">MASTER</span>
        </h2>
        <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider mt-0.5">
          OGA INTERNATIONAL CO., LTD.
        </p>

        {/* User Role Badge & Online Status */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full tracking-wider border border-white/20 shadow-xs">
            <span>ROLE: {currentUserRole}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/90 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{online ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* System Quick Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:border-blue-300 transition-all">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">SCANNED TOTAL</p>
            <p className="text-lg font-black text-slate-900 leading-tight">
              {totalScanned} <span className="text-xs font-bold text-slate-400">Items</span>
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:border-indigo-300 transition-all">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">RECORDS</p>
            <p className="text-lg font-black text-indigo-700 leading-tight">
              {totalRecords} <span className="text-xs font-bold text-slate-400">Lines</span>
            </p>
          </div>
        </div>
      </div>

      {/* 1. MASTER DATA SECTION */}
      <div className="mb-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">
          MASTER DATA
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('item_master')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center min-h-[105px] border-2 relative group overflow-hidden bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-400 hover:from-blue-600 hover:to-blue-800"
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
              <Package className="w-7 h-7 text-yellow-300 drop-shadow-xs" />
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider text-white">ITEM MASTER</span>
          </button>

          <button
            onClick={() => onNavigate('location_master')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center min-h-[105px] border-2 relative group overflow-hidden bg-gradient-to-b from-purple-600 to-indigo-800 text-white border-purple-400 hover:from-purple-700 hover:to-indigo-900"
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7 text-pink-300 drop-shadow-xs" />
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider text-white">LOCATION</span>
          </button>
        </div>
      </div>

      {/* 2. TRANSACTION DATA SECTION */}
      <div className="mb-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">
          TRANSACTION DATA
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('scan')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center min-h-[105px] border-2 relative group overflow-hidden bg-gradient-to-b from-red-500 to-rose-700 text-white border-red-400 hover:from-red-600 hover:to-rose-800"
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7 text-white drop-shadow-xs" />
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider text-white">SCAN ITEM</span>
          </button>

          <button
            onClick={() => onNavigate('view')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center min-h-[105px] border-2 relative group overflow-hidden bg-gradient-to-b from-emerald-500 to-teal-700 text-white border-emerald-400 hover:from-emerald-600 hover:to-teal-800"
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7 text-white drop-shadow-xs" />
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider text-white">VIEW LOGS</span>
          </button>
        </div>
      </div>

      {/* 3. AI SPECIALIST & ISO SOP SECTION */}
      <div className="mb-5">
        <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2.5 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI ASSISTANT & ISO CONSULTANT</span>
          </span>
          <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
            ข้อความ • กล้อง • รูปภาพ • ISO
          </span>
        </h3>

        <div className="bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 text-white rounded-3xl p-4 shadow-xl border-2 border-purple-400 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>

          <button
            onClick={() => onNavigate('ai')}
            className="w-full flex items-center justify-between gap-3 text-left transition-all active:scale-95 group mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 text-yellow-300 shadow-inner group-hover:scale-110 transition-transform">
                <Bot className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm uppercase tracking-wider block">AI COUNT & ISO CONSULTANT</span>
                  <span className="bg-yellow-400 text-purple-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-purple-200 mt-0.5 font-medium leading-tight">
                  ถาม-ตอบวิธีใช้งานทุกฟังก์ชัน, ถ่ายภาพบาร์โค้ด และสร้างเอกสาร ISO SOP
                </p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-mono font-bold shrink-0">
              เปิด AI
            </span>
          </button>

          {/* Quick Direct Launch Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-400/30">
            <button
              onClick={() => onNavigate('ai')}
              className="py-2 px-2.5 bg-white/15 hover:bg-white/25 rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border border-white/15"
            >
              <span className="text-base">💬</span>
              <span className="text-[10px] font-extrabold text-white">พิมพ์คำถาม</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="py-2 px-2.5 bg-orange-500/80 hover:bg-orange-500 rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border border-orange-400/40"
            >
              <span className="text-base">📸</span>
              <span className="text-[10px] font-extrabold text-white">ถ่ายภาพ AI</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="py-2 px-2.5 bg-emerald-600/80 hover:bg-emerald-600 rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border border-emerald-400/40"
            >
              <span className="text-base">📋</span>
              <span className="text-[10px] font-extrabold text-white">เอกสาร ISO</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3.1 STANDARD USER MANUAL DOWNLOAD SECTION (Word 16pt, PDF & ZIP) */}
      <div className="mb-5">
        <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2.5 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>คู่มือการใช้งานมาตรฐาน (USER MANUAL)</span>
          </span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
            SOP-WMS-STK-001 (Rev.05)
          </span>
        </h3>

        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-4 shadow-xl border-2 border-emerald-400/80 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 rounded-2xl text-emerald-300 shadow-inner">
              <FileArchive className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider block">คู่มือปฏิบัติงานระบบตรวจนับสต็อก</span>
                <span className="bg-emerald-400 text-emerald-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                  PDF & Word
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5 leading-snug">
                อธิบายละเอียด 12 หมวด 36 หน้า พร้อมภาพประกอบ 15 ภาพจริง และตัวอย่าง Excel ครบถ้วน
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/40">
            <button
              onClick={() => handleDownload('docx')}
              disabled={downloadingType !== null}
              className="py-2.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 border border-blue-400 disabled:opacity-75 cursor-pointer"
            >
              {downloadingType === 'docx' ? (
                <Loader2 className="w-4 h-4 text-blue-200 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-blue-200" />
              )}
              <span>{downloadingType === 'docx' ? 'กำลังโหลด...' : 'Word (.DOCX)'}</span>
            </button>

            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloadingType !== null}
              className="py-2.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 border border-rose-400 disabled:opacity-75 cursor-pointer"
            >
              {downloadingType === 'pdf' ? (
                <Loader2 className="w-4 h-4 text-rose-200 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-rose-200" />
              )}
              <span>{downloadingType === 'pdf' ? 'กำลังโหลด...' : 'PDF (.PDF)'}</span>
            </button>

            <button
              onClick={() => handleDownload('zip')}
              disabled={downloadingType !== null}
              className="py-2.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-[11px] rounded-2xl text-center flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 border border-emerald-300 disabled:opacity-75 cursor-pointer"
            >
              {downloadingType === 'zip' ? (
                <Loader2 className="w-4 h-4 text-emerald-950 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-emerald-950" />
              )}
              <span>{downloadingType === 'zip' ? 'กำลังโหลด...' : 'ชุดรวม (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. TOOLS & CONFIGURATION SECTION */}
      <div className="mb-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">
          SETTINGS & QR CONFIGURATION
        </h3>

        {/* QR CODE SETTINGS BUTTON */}
        <button
          onClick={() => onNavigate('qrcode_config')}
          className="w-full p-4 mb-3 rounded-3xl flex items-center justify-between gap-3 shadow-md transition-all active:scale-95 border-2 relative bg-gradient-to-r from-indigo-800 via-blue-800 to-indigo-900 text-white border-indigo-500 group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-yellow-300 shadow-inner group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider block">QR CODE SETTINGS</span>
                <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                  CUSTOM
                </span>
              </div>
              <span className="text-[11px] text-blue-200 font-medium">
                ตั้งค่าโครงสร้าง QR Code แยกฟิลด์ (Item, Lot, Exp, Serial, Qty)
              </span>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono font-bold">
            CONFIG
          </span>
        </button>

        {/* SYSTEM SETTINGS BUTTON */}
        <button
          onClick={() => onNavigate('setting')}
          className="w-full p-4 rounded-3xl flex items-center justify-between gap-3 shadow-md transition-all active:scale-95 border-2 relative bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-700 group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-amber-300 shadow-inner group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-black text-sm uppercase tracking-wider block">SYSTEM SETTINGS</span>
              <span className="text-[11px] text-slate-300 font-medium">
                ตั้งค่าบริษัท, สาขา, รอบตรวจนับ และระบบนับอัตโนมัติ (+1 Auto Increment)
              </span>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono font-bold">
            SET
          </span>
        </button>
      </div>

      {/* System Footer info */}
      <div className="bg-white rounded-2xl p-3.5 text-center border-2 border-slate-200 text-xs text-slate-600 shadow-2xs">
        <p className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Company: {settings.companyName}</p>
        <p className="text-[11px] mt-0.5">Department: <span className="font-bold text-blue-600">{settings.department}</span></p>
      </div>
    </div>
  );
};
