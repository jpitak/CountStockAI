import React, { useState, useEffect } from 'react';
import { 
  Save, Database, Sliders, Printer, Shield, RefreshCw, 
  QrCode, FileSpreadsheet, Download, ExternalLink, 
  FolderPlus, CheckCircle2, Cloud, FileText, Check, HelpCircle,
  Copy, CheckCheck, Sparkles, AlertCircle, Terminal, Layers,
  Table2, Globe, Smartphone, Info
} from 'lucide-react';
import { AppSettings, UserRole, ItemMaster, LocationMaster, ScannedRecord } from '../types';
import { 
  downloadGoogleSheetsExcelTemplate, 
  downloadCleanCsv, 
  GOOGLE_APPS_SCRIPT_CODE 
} from '../utils/googleSheetsExport';
import { GoogleSheetsViewerModal } from './GoogleSheetsViewerModal';

interface SettingScreenProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onOpenAbout?: () => void;
  onNavigateTheming?: () => void;
  onNavigatePermissions?: () => void;
  onNavigateQRConfig?: () => void;
  currentUserRole?: UserRole;
  items?: ItemMaster[];
  locations?: LocationMaster[];
  scannedRecords?: ScannedRecord[];
}

export const SettingScreen: React.FC<SettingScreenProps> = ({
  settings,
  onSaveSettings,
  onOpenAbout,
  onNavigateTheming,
  onNavigatePermissions,
  onNavigateQRConfig,
  currentUserRole = 'Admin',
  items = [],
  locations = [],
  scannedRecords = []
}) => {
  const [formData, setFormData] = useState<AppSettings>(() => ({
    ...settings,
    databaseProvider: settings.databaseProvider === 'sql' ? 'sheets' : settings.databaseProvider,
    googleSheetLocation: settings.googleSheetLocation || 'Google Drive / OGA_Stock_2026 / Warehouse_ZoneA',
    googleSheetSpreadsheetId: settings.googleSheetSpreadsheetId || '',
    googleSheetTabName: settings.googleSheetTabName || 'ScannedStock_2026',
    googleSheetsWebhookUrl: settings.googleSheetsWebhookUrl || ''
  }));

  // Keep formData in sync when parent settings change (e.g. from QR Profile selection)
  useEffect(() => {
    setFormData({
      ...settings,
      databaseProvider: settings.databaseProvider === 'sql' ? 'sheets' : settings.databaseProvider,
      googleSheetLocation: settings.googleSheetLocation || 'Google Drive / OGA_Stock_2026 / Warehouse_ZoneA',
      googleSheetSpreadsheetId: settings.googleSheetSpreadsheetId || '',
      googleSheetTabName: settings.googleSheetTabName || 'ScannedStock_2026',
      googleSheetsWebhookUrl: settings.googleSheetsWebhookUrl || ''
    });
  }, [settings]);

  const handleToggleSetting = (field: keyof AppSettings, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onSaveSettings) {
      onSaveSettings(updated);
    }
  };

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExportingTemplate, setIsExportingTemplate] = useState<boolean>(false);
  const [testingGoogleSheets, setTestingGoogleSheets] = useState<boolean>(false);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState<boolean>(false);
  const [showGoogleSheetsViewer, setShowGoogleSheetsViewer] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    showToast("💾 บันทึกการตั้งค่าระบบและ Google Sheets เรียบร้อยแล้ว!");
  };

  // Helper to extract clean Spreadsheet ID from ID string or full URL
  const getCleanSpreadsheetId = (input: string) => {
    if (!input) return '';
    const trimmed = input.trim();
    if (trimmed === '1BxiMVs0XRA5nFMdKvBdBZJgmUUqpt1bs74OgvE2upms') return '';
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      if (match[1] === '1BxiMVs0XRA5nFMdKvBdBZJgmUUqpt1bs74OgvE2upms') return '';
      return match[1];
    }
    return trimmed;
  };

  // Open Google Sheet handler (In-App Viewer + Web options)
  const handleOpenGoogleSheetInApp = () => {
    setShowGoogleSheetsViewer(true);
  };

  const handleOpenGoogleSheetExternal = () => {
    const cleanId = getCleanSpreadsheetId(formData.googleSheetSpreadsheetId);
    if (cleanId) {
      window.open(`https://docs.google.com/spreadsheets/d/${cleanId}/edit`, '_blank');
    } else {
      window.open('https://sheets.new', '_blank');
    }
  };

  // Export Google Sheet Template as Multi-Tab .xlsx workbook (ZERO #ERROR!)
  const handleExportGoogleSheetExcel = () => {
    setIsExportingTemplate(true);
    try {
      downloadGoogleSheetsExcelTemplate();
      showToast("📥 ดาวน์โหลดไฟล์ Excel Multi-Tab (ItemMaster, LocationMaster, ScannedStock) สำเร็จ!");
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต Excel");
    } finally {
      setIsExportingTemplate(false);
    }
  };

  // Export Individual Clean CSV files
  const handleExportCsv = (type: 'item' | 'location' | 'scanned') => {
    if (type === 'item') {
      downloadCleanCsv(
        'ItemMaster_Template.csv',
        ['ItemCode', 'ItemName', 'Barcode', 'Barcode2', 'Category', 'Unit', 'QuantityPlan', 'UseLot', 'UseSerial', 'UseExpiry', 'Remark'],
        [
          ['ITM001', 'แท็บเล็ตตรวจนับสต็อก OGA Pro 10', '8850123456789', '8850123456780', 'Hardware', 'เครื่อง', 100, 'N', 'Y', 'N', 'สินค้าคลัง A'],
          ['ITM002', 'เครื่องอ่านบาร์โค้ดไร้สาย 2D Bluetooth', '8850123456796', '8850123456790', 'Scanner', 'ตัว', 50, 'N', 'Y', 'N', 'สินค้าคลัง A'],
          ['ITM003', 'สติ๊กเกอร์บาร์โค้ดความร้อน Direct Thermal 4x3', '8850123456802', '8850123456800', 'Consumable', 'ม้วน', 200, 'Y', 'N', 'Y', 'สินค้ามีอายุ 1 ปี'],
          ['ITM004', 'ริบบอนบาร์โค้ด Wax Resin 110mm x 300m', '8850123456819', '8850123456810', 'Consumable', 'ม้วน', 150, 'Y', 'N', 'N', 'สินค้าคลัง B'],
          ['ITM005', 'เครื่องพิมพ์บาร์โค้ด Industrial Printer', '8850123456826', '8850123456820', 'Printer', 'เครื่อง', 20, 'N', 'Y', 'N', 'สินค้าคลังหลัก']
        ]
      );
      showToast("📥 ดาวน์โหลด ItemMaster.csv เรียบร้อย (ไม่มี Error สูตร)");
    } else if (type === 'location') {
      downloadCleanCsv(
        'LocationMaster_Template.csv',
        ['LocationCode', 'LocationName', 'Zone', 'Warehouse', 'LocationDescription', 'Active'],
        [
          ['LOC-A01-01', 'Shelf A-01 ชั้น 1', 'Zone-A', 'คลังสินค้าหลัก', 'โซนสินค้าคอมพิวเตอร์และ PDA', 'Y'],
          ['LOC-A01-02', 'Shelf A-01 ชั้น 2', 'Zone-A', 'คลังสินค้าหลัก', 'โซนอุปกรณ์ต่อพ่วง', 'Y'],
          ['LOC-B02-01', 'Shelf B-02 ชั้น 1', 'Zone-B', 'คลังวัตถุดิบ', 'โซนกระดาษและสติ๊กเกอร์', 'Y'],
          ['LOC-C03-01', 'Cold Room C-01', 'Zone-C', 'คลังควบคุมอุณหภูมิ', 'ห้องแช่เย็นควบคุมพิเศษ', 'Y'],
          ['LOC-DMG-01', 'Quarantine Damage Zone', 'Zone-DMG', 'คลังสินค้าชำรุด', 'โซนกักกันสินค้าชำรุดรอส่งคืน', 'Y']
        ]
      );
      showToast("📥 ดาวน์โหลด LocationMaster.csv เรียบร้อย (ไม่มี Error สูตร)");
    } else {
      downloadCleanCsv(
        'ScannedStock_Template.csv',
        ['id', 'CompanyCode', 'BranchCode', 'LocationCode', 'LocationName', 'ItemCode', 'ItemName', 'Barcode', 'LotNumber', 'ExpiryDate', 'SerialNumber', 'QuantityScan', 'Status', 'ScannedBy', 'ScanDate', 'ScanTime', 'Synced'],
        [
          ['REC-DEMO-001', 'OGA001', 'HQ', 'LOC-A01-01', 'Shelf A-01 ชั้น 1', 'ITM001', 'แท็บเล็ตตรวจนับสต็อก OGA Pro 10', '8850123456789', '-', '-', 'SN-2026-0001', 1, 'NORMAL', 'Admin', new Date().toISOString().split('T')[0], '09:30:00', 'TRUE']
        ]
      );
      showToast("📥 ดาวน์โหลด ScannedStock_Template.csv เรียบร้อย");
    }
  };

  // Real Google Sheets Test Connection
  const handleTestGoogleSheetsConnection = async () => {
    setTestingGoogleSheets(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/googlesheets/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: formData.googleSheetsWebhookUrl,
          spreadsheetId: formData.googleSheetSpreadsheetId,
          location: formData.googleSheetLocation,
          tabName: formData.googleSheetTabName
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const result = await res.json();
      setTestResult(result);
      showToast("✅ ตรวจสอบการเชื่อมต่อ Google Sheets สำเร็จ!");
    } catch (e: any) {
      console.error("Test connection error:", e);
      setTestResult({
        success: false,
        connected: false,
        message: `❌ ไม่สามารถติดต่อ Google Sheets Webhook ได้ (${e.message})`
      });
      showToast("❌ การทดสอบล้มเหลว กรุณาตรวจสอบ Webhook URL");
    } finally {
      setTestingGoogleSheets(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    showToast("📋 คัดลอก Apps Script Code ไปยังคลิปบอร์ดแล้ว!");
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-28 px-4 pt-3 max-w-md mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95">
          {toastMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ABOUT & APP INFO SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
          <div className="bg-slate-50 px-4 py-2 text-xs font-black text-blue-700 uppercase tracking-wider flex items-center justify-between">
            <span>Information & System Profile</span>
            <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">
              OGA 2026
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenAbout && onOpenAbout()}
            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">Information about application</p>
              <p className="text-[10px] text-slate-400">Developer info (OGA International Co., Ltd.)</p>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold uppercase">Details</span>
          </button>

          <div className="px-4 py-2.5">
            <p className="text-xs font-bold text-slate-800">Build version</p>
            <p className="text-[10px] text-slate-400 font-mono">App version: 2026.1.0, Platform: Mobile PDA Web / Google Sheets Ready</p>
          </div>

          {onNavigateTheming && (
            <button
              type="button"
              onClick={onNavigateTheming}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">Theming & Color Scheme</p>
                <p className="text-[10px] text-slate-400 font-capitalize">Current: {formData.themeColor || 'default'}</p>
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold uppercase">Change</span>
            </button>
          )}

          {onNavigateQRConfig && (
            <button
              type="button"
              onClick={onNavigateQRConfig}
              className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center justify-between bg-indigo-50/40"
            >
              <div>
                <p className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  ตั้งค่ารูปแบบการอ่าน QR Code (QR Code Profiles)
                </p>
                <p className="text-[10px] text-indigo-700 font-medium">รองรับ Item;Desc;Serial, Item,lot,exp,qty และกำหนดคัสตอมได้</p>
              </div>
              <span className="text-[10px] bg-indigo-600 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                Setup
              </span>
            </button>
          )}
        </div>

        {/* 1. DATABASE PROVIDER MODE (REMOVED SQL, KEPT EXCEL & GOOGLE SHEETS) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-orange-500" />
              DATABASE PROVIDER MODE
            </label>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Cloud & Local Storage
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, databaseProvider: 'excel' }))}
              className={`py-3 px-3 text-xs font-black rounded-xl border-2 transition-all text-center uppercase flex flex-col items-center gap-1 ${
                formData.databaseProvider === 'excel'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>EXCEL FILE (LOCAL)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, databaseProvider: 'sheets' }))}
              className={`py-3 px-3 text-xs font-black rounded-xl border-2 transition-all text-center uppercase flex flex-col items-center gap-1 ${
                formData.databaseProvider === 'sheets'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Cloud className="w-5 h-5" />
              <span>GOOGLE SHEETS (CLOUD)</span>
            </button>
          </div>
        </div>

        {/* 1.2 GOOGLE SHEETS CONFIGURATION & LOCATION FIELDS */}
        {formData.databaseProvider === 'sheets' && (
          <div className="bg-white border-2 border-emerald-500/80 rounded-2xl p-4 space-y-3.5 shadow-md animate-in fade-in">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-emerald-950">
                    GOOGLE SHEETS REAL-TIME SYNC & STORAGE
                  </h3>
                  <p className="text-[10px] text-emerald-700">กำหนดสถานที่จัดเก็บ, แท็บชีต และเชื่อมต่อ Apps Script</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full">
                Active Provider
              </span>
            </div>

            {/* LOCATION FIELD IN GOOGLE SHEETS */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
                <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>สถานที่จัดเก็บใน GOOGLE SHEETS / DRIVE FOLDER</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={formData.googleSheetLocation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleSheetLocation: e.target.value }))}
                className="w-full border border-emerald-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium bg-emerald-50/40 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="ระบุสถานที่ เช่น Google Drive / OGA_Stock_2026 / Warehouse_ZoneA"
              />
              <p className="text-[9px] text-slate-500 mt-0.5">ระบุชื่อโฟลเดอร์หรือสถานที่จัดเก็บไฟล์ใน Google Drive เพื่อการตรวจสอบย้อนกลับ (Traceability)</p>
            </div>

            {/* SPREADSHEET ID / URL */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center justify-between">
                <span>Spreadsheet ID หรือ Google Sheets URL:</span>
              </label>
              <input
                type="text"
                value={formData.googleSheetSpreadsheetId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, googleSheetSpreadsheetId: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="วาง Spreadsheet ID หรือ URL ของ Google Sheets ที่นี่ (หรือกดเปิดเพื่อสร้างชีตใหม่)"
              />
            </div>

            {/* TAB NAME */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  ชื่อแท็บชีตบันทึกผล (Tab Name):
                </label>
                <input
                  type="text"
                  value={formData.googleSheetTabName || 'ScannedStock_2026'}
                  onChange={(e) => setFormData(prev => ({ ...prev, googleSheetTabName: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                  placeholder="ScannedStock_2026"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Master Tab Data:
                </label>
                <input
                  type="text"
                  value="ItemMaster, LocationMaster"
                  readOnly
                  className="w-full border border-slate-200 bg-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
                />
              </div>
            </div>

            {/* APPS SCRIPT WEBHOOK URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-black text-slate-700">
                  Apps Script Web App Endpoint URL (Webhook):
                </label>
                <button
                  type="button"
                  onClick={() => setShowAppsScriptModal(true)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline"
                >
                  <Terminal className="w-3 h-3" />
                  <span>ดูโค้ด Apps Script</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.googleSheetsWebhookUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, googleSheetsWebhookUrl: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </div>

            {/* TEMPLATE EXPORT SECTION (NO #ERROR!) */}
            <div className="pt-2 border-t border-emerald-100 space-y-2">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>ดาวน์โหลดไฟล์ต้นแบบสำหรับ Google Sheets (ไม่มี Error สูตร)</span>
                </p>
                
                {/* 1. Multi-Tab Excel (.xlsx) Download */}
                <button
                  type="button"
                  onClick={handleExportGoogleSheetExcel}
                  disabled={isExportingTemplate}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>📥 ดาวน์โหลด Excel Template (.xlsx 3 แท็บพร้อมใช้)</span>
                </button>
                <p className="text-[9px] text-emerald-700">
                  * รวม 3 แท็บ (ItemMaster, LocationMaster, ScannedStock) เปิดหรือ Import เข้า Google Sheets ได้ทันทีโดยไม่ติด #ERROR!
                </p>

                {/* 2. Individual CSVs */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExportCsv('item')}
                    className="py-1.5 px-2 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded-lg text-center transition-colors"
                  >
                    CSV ItemMaster
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCsv('location')}
                    className="py-1.5 px-2 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded-lg text-center transition-colors"
                  >
                    CSV Location
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCsv('scanned')}
                    className="py-1.5 px-2 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded-lg text-center transition-colors"
                  >
                    CSV Scanned
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS: IN-APP VIEWER, TEST & OPEN */}
              <div className="space-y-2 pt-1">
                {/* 1. Primary In-App Interactive Spreadsheet Viewer */}
                <button
                  type="button"
                  onClick={handleOpenGoogleSheetInApp}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Table2 className="w-4 h-4 text-emerald-200" />
                  <span>📱 เปิดดูตาราง Google Sheets ในแอป (ดู 3 แท็บ & ค้นหาได้ทันที)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleTestGoogleSheetsConnection}
                    disabled={testingGoogleSheets}
                    className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${testingGoogleSheets ? 'animate-spin' : ''}`} />
                    <span>{testingGoogleSheets ? 'กำลังทดสอบ...' : '⚡ ทดสอบเชื่อมต่อ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenGoogleSheetExternal}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                    <span>🌐 เปิด Google Sheets (Web)</span>
                  </button>
                </div>
              </div>

              {/* QUICK LINK TO CREATE NEW SPREADSHEET */}
              <div className="flex items-center justify-between pt-1 px-1">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>สร้าง Google Sheet เปล่าแผ่นใหม่ (sheets.new)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowAppsScriptModal(true)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  <span>คู่มือการติดตั้ง Webhook</span>
                </button>
              </div>

              {/* REAL TEST CONNECTION RESULT CARD (COMPRESSED & RESPONSIVE FIT) */}
              {testResult && (
                <div className={`mt-3 p-3 rounded-2xl border text-xs animate-in fade-in zoom-in-95 w-full max-w-full overflow-hidden shadow-xs ${
                  testResult.success 
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' 
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0 overflow-hidden">
                      {/* Compressed & Properly Wrapped Message Header */}
                      <p className="font-bold text-xs leading-snug break-words text-emerald-900">
                        {String(testResult.message || '').replace(/^[✅❌⚠️\s]+/, '')}
                      </p>

                      {testResult.success && (
                        <div className="text-[11px] space-y-1.5 text-slate-700 bg-white/95 p-2.5 rounded-xl border border-emerald-200 mt-1 shadow-2xs w-full max-w-full overflow-hidden">
                          {/* Spreadsheet ID */}
                          <div className="space-y-0.5 pb-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-500 block text-[10px]">Spreadsheet ID:</span>
                            <span className="font-mono text-emerald-800 text-[10px] break-all leading-tight block select-all bg-emerald-50/60 p-1 rounded border border-emerald-100/80">
                              {testResult.spreadsheetId}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5">
                            <span className="font-semibold text-slate-500 text-[10px] shrink-0">เป้าหมายโฟลเดอร์:</span>
                            <span className="font-medium text-slate-800 text-[10px] break-words">
                              {testResult.location}
                            </span>
                          </div>

                          {/* Tab Name */}
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-semibold text-slate-500 text-[10px] shrink-0">แท็บบันทึกผล:</span>
                            <span className="font-mono font-bold text-emerald-700 text-[10px] break-all">
                              {testResult.targetTab}
                            </span>
                          </div>

                          {/* Webhook Status */}
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-semibold text-slate-500 text-[10px] shrink-0">สถานะ Webhook:</span>
                            <span className="font-bold text-emerald-700 text-[10px] shrink-0">
                              {testResult.isLiveConnected ? '🟢 Live Online' : '🟡 Ready (Verified)'}
                            </span>
                          </div>

                          {/* Supported Sheets Tags */}
                          {testResult.sheetsVerified && (
                            <div className="pt-1.5 border-t border-slate-100 space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 block">แท็บที่รองรับ:</span>
                              <div className="flex flex-wrap gap-1">
                                {testResult.sheetsVerified.map((s: any, idx: number) => (
                                  <span 
                                    key={idx} 
                                    className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200"
                                  >
                                    {s.sheetName} ({s.status})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: COMPANY & BRANCH PROFILE */}
        <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-purple-600" />
            Company & Branch Profile
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Code</label>
              <input
                type="text"
                value={formData.companyCode}
                onChange={(e) => setFormData(prev => ({ ...prev, companyCode: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Branch Code</label>
              <input
                type="text"
                value={formData.branchCode}
                onChange={(e) => setFormData(prev => ({ ...prev, branchCode: e.target.value }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* SECTION 3: SCAN RULES & FIELD CONTROLS */}
        <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5 bg-white shadow-2xs">
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Scan Rules & Field Controls (การตั้งค่าการตรวจนับสต็อก)
          </h3>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Lot Control (ตรวจสอบล็อตสินค้า)</span>
              <span className="text-[10px] text-slate-400">บันทึกล็อตเมื่อสแกน หรือกรอกแยกฟิลด์</span>
            </div>
            <input
              type="checkbox"
              checked={formData.enableLotControl}
              onChange={(e) => handleToggleSetting('enableLotControl', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Expiry Date (ตรวจสอบวันหมดอายุ)</span>
              <span className="text-[10px] text-slate-400">บันทึกวันหมดอายุเมื่อสแกน QR หรือบาร์โค้ด</span>
            </div>
            <input
              type="checkbox"
              checked={formData.enableExpiryDate}
              onChange={(e) => handleToggleSetting('enableExpiryDate', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Serial Control (ตรวจสอบหมายเลขซีเรียล)</span>
              <span className="text-[10px] text-slate-400">ตรวจนับ 1 ชิ้นอัตโนมัติ (Auto +Qty 1) และรอสแกนชิ้นถัดไป</span>
            </div>
            <input
              type="checkbox"
              checked={formData.enableSerialControl}
              onChange={(e) => handleToggleSetting('enableSerialControl', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Auto Increment Quantity (+1)</span>
              <span className="text-[10px] text-slate-400">สแกนแล้วนับทันทีโดยไม่ต้องกดบันทึก</span>
            </div>
            <input
              type="checkbox"
              checked={formData.autoIncrementQuantity}
              onChange={(e) => handleToggleSetting('autoIncrementQuantity', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Confirm Out-of-Master Prompt</span>
              <span className="text-[10px] text-slate-400">แจ้งเตือนยืนยันหากพบสินค้าที่ไม่มีในฐานข้อมูล</span>
            </div>
            <input
              type="checkbox"
              checked={formData.confirmOutMaster}
              onChange={(e) => handleToggleSetting('confirmOutMaster', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          {/* 10 STOCK CHECK COMBINATIONS REFERENCE */}
          <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-3.5 rounded-b-2xl">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              รองรับ 10 รูปแบบการตรวจนับสต็อก (10 Count Combinations):
            </span>
            <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-700 font-medium">
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>1. <strong>Item Qty:</strong> นับรหัสสินค้าและจำนวน</span>
                <span className="font-mono text-[9px] text-blue-600 font-bold">8850123456789</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>2. <strong>Item + Lot Qty:</strong> นับรหัสสินค้าและล็อต</span>
                <span className="font-mono text-[9px] text-amber-600 font-bold">8850123456789,L1</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>3. <strong>Item + Lot + Exp Date Qty:</strong> นับรหัสสินค้า ล็อต วันหมดอายุ และจำนวน</span>
                <span className="font-mono text-[9px] text-emerald-600 font-bold">Item,Lot,Exp,25</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>4. <strong>Item + Expiry Qty:</strong> นับรหัสสินค้าและวันหมดอายุ</span>
                <span className="font-mono text-[9px] text-emerald-600 font-bold">Item,2026-12-31</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>5. <strong>Item + Lot + Expiry Date:</strong> นับรหัสสินค้า ล็อต และวันหมดอายุ</span>
                <span className="font-mono text-[9px] text-teal-600 font-bold">Item,Lot,Exp</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>6. <strong>Item + Lot + Serial:</strong> นับรหัสสินค้า ล็อต และซีเรียล</span>
                <span className="font-mono text-[9px] text-indigo-600 font-bold">Item,Lot,SN</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>7. <strong>Item + Expiry Date + Serial:</strong> นับรหัสสินค้า วันหมดอายุ และซีเรียล</span>
                <span className="font-mono text-[9px] text-purple-600 font-bold">Item,Exp,SN</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>8. <strong>Item + Serial:</strong> นับรหัสสินค้าและซีเรียล</span>
                <span className="font-mono text-[9px] text-indigo-600 font-bold">Item,SN</span>
              </div>
              <div className="bg-white px-2 py-1 rounded border border-slate-200 flex justify-between items-center">
                <span>9. <strong>Item + Lot + Expiry + Serial:</strong> นับครบทุกฟิลด์</span>
                <span className="font-mono text-[9px] text-rose-600 font-bold">Item|Lot|Exp|SN|1</span>
              </div>
              <div className="bg-indigo-50 px-2 py-1.5 rounded border border-indigo-200 flex justify-between items-center text-indigo-950 font-bold">
                <span>10. <strong>Serial Auto +Qty 1:</strong> ล็อกจำนวน 1 อัตโนมัติ & Auto Select Item รอสแกนถัดไป</span>
                <span className="bg-indigo-200 text-indigo-900 text-[9px] px-1.5 py-0.5 rounded font-mono">Auto Next</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: HARDWARE INTEGRATION */}
        <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-pink-600" />
            Hardware & Printers
          </h3>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-xs font-bold text-slate-700">Barcode Scanner (Laser/Camera)</span>
            <input
              type="checkbox"
              checked={formData.enableBarcodeScanner}
              onChange={(e) => handleToggleSetting('enableBarcodeScanner', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-xs font-bold text-slate-700">Bluetooth Slip Printer (ESC-POS)</span>
            <input
              type="checkbox"
              checked={formData.enableBluetoothPrinter}
              onChange={(e) => handleToggleSetting('enableBluetoothPrinter', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-xs font-bold text-slate-700">Cash Drawer Auto Kick</span>
            <input
              type="checkbox"
              checked={formData.enableCashDrawer}
              onChange={(e) => handleToggleSetting('enableCashDrawer', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm"
            />
          </label>

          {formData.enableBluetoothPrinter && (
            <button
              type="button"
              onClick={() => showToast("Bluetooth: Searching for nearby ESC/POS Slip Printers...")}
              className="w-full py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-extrabold text-xs rounded-xl border border-pink-200 transition-colors"
            >
              Pair Bluetooth Printer
            </button>
          )}
        </div>

        {/* SAVE SETTINGS BUTTON */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
      </form>

      {/* GOOGLE APPS SCRIPT CODE & SETUP GUIDE MODAL */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Terminal className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Google Apps Script Webhook Code</h3>
                  <p className="text-[10px] text-emerald-200">โค้ดสำหรับเชื่อมต่อ Google Sheets กับเครื่องนับสต็อก OGA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Instructions & Code */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-700 flex-1">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-1.5">
                <p className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>วิธีติดตั้งบน Google Sheets (ง่ายใน 4 ขั้นตอน):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-900 leading-relaxed font-medium">
                  <li>เปิด Google Sheets แผ่นที่ต้องการใช้งาน (หรือ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-700">เปิด sheets.new</a>)</li>
                  <li>คลิกเมนูด้านบน <b>Extensions (ส่วนขยาย)</b> &gt; <b>Apps Script</b></li>
                  <li>ลบโค้ดเดิมทั้งหมด แล้วกดปุ่ม <b>"คัดลอกโค้ด"</b> ด้านล่างนี้ไปวาง</li>
                  <li>กดปุ่ม <b>Deploy (ทำให้ใช้งานได้)</b> &gt; <b>New deployment</b> &gt; เลือก <b>Web app</b> &gt; กำหนด Who has access: <b>Anyone</b> &gt; คัดลอก URL มาวางในแอป OGA</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-1 text-[10px] font-bold text-slate-500">
                  <span>GAS SOURCE CODE:</span>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-100/70 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
                  >
                    {copiedScript ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed select-all">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={handleCopyScript}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {copiedScript ? <CheckCheck className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-emerald-200" />}
                <span>{copiedScript ? 'คัดลอกโค้ดเรียบร้อยแล้ว!' : '📋 คัดลอกโค้ด Apps Script ทั้งหมด'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP GOOGLE SHEETS INTERACTIVE VIEWER MODAL */}
      <GoogleSheetsViewerModal
        isOpen={showGoogleSheetsViewer}
        onClose={() => setShowGoogleSheetsViewer(false)}
        spreadsheetId={formData.googleSheetSpreadsheetId}
        location={formData.googleSheetLocation}
        tabName={formData.googleSheetTabName}
        webhookUrl={formData.googleSheetsWebhookUrl}
        items={items}
        locations={locations}
        scannedRecords={scannedRecords}
      />
    </div>
  );
};
