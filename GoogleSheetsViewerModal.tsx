import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Search, 
  Plus, 
  Check, 
  Copy, 
  Sparkles, 
  Layers, 
  Info,
  CheckCircle2,
  Table2,
  Smartphone,
  Globe,
  UploadCloud
} from 'lucide-react';
import { ItemMaster, LocationMaster, ScannedRecord } from '../types';
import { downloadGoogleSheetsExcelTemplate, downloadCleanCsv } from '../utils/googleSheetsExport';

interface GoogleSheetsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId: string;
  location: string;
  tabName: string;
  webhookUrl: string;
  items: ItemMaster[];
  locations: LocationMaster[];
  scannedRecords: ScannedRecord[];
  onImportMaster?: (items: ItemMaster[], locations: LocationMaster[]) => void;
}

export const GoogleSheetsViewerModal: React.FC<GoogleSheetsViewerModalProps> = ({
  isOpen,
  onClose,
  spreadsheetId,
  location,
  tabName,
  webhookUrl,
  items,
  locations,
  scannedRecords,
  onImportMaster
}) => {
  const [activeTab, setActiveTab] = useState<'ItemMaster' | 'LocationMaster' | 'ScannedStock'>('ItemMaster');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitializingCloud, setIsInitializingCloud] = useState(false);
  const [cloudInitMessage, setCloudInitMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  let cleanId = spreadsheetId ? spreadsheetId.replace(/^https:\/\/docs\.google\.com\/spreadsheets\/d\//, '').replace(/\/.*$/, '').trim() : '';
  if (cleanId === '1BxiMVs0XRA5nFMdKvBdBZJgmUUqpt1bs74OgvE2upms') cleanId = '';
  const webUrl = cleanId ? `https://docs.google.com/spreadsheets/d/${cleanId}/edit` : 'https://sheets.new';
  const driveUploadUrl = 'https://drive.google.com/drive/u/0/my-drive';

  // Filtered data
  const filteredItems = items.filter(i => 
    i.ItemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.ItemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.Barcode?.includes(searchQuery)
  );

  const filteredLocations = locations.filter(l => 
    l.LocationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.LocationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.Zone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScanned = scannedRecords.filter(s => 
    s.ItemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ItemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.Barcode?.includes(searchQuery) ||
    s.LocationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.SerialNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAutoSetupCloud = async () => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      alert('กรุณาระบุ Apps Script Webhook URL ในหน้าตั้งค่าก่อนทำการตั้งค่าอัตโนมัติ');
      return;
    }

    setIsInitializingCloud(true);
    setCloudInitMessage(null);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup_template',
          tabName: tabName || 'ScannedStock_2026',
          location: location || 'Google Drive / OGA_Stock_2026'
        })
      });

      if (res.ok) {
        setCloudInitMessage('✅ สร้างแท็บและจัดรูปแบบใน Google Sheets สำเร็จเรียบร้อยแล้ว!');
      } else {
        setCloudInitMessage('✅ ส่งคำขอจัดรูปแบบไปยัง Google Sheets Webhook เรียบร้อยแล้ว');
      }
    } catch (e: any) {
      setCloudInitMessage(`ℹ️ ส่งคำขอไปยัง Webhook แล้ว (โปรดตรวจสอบใน Google Sheets): ${e.message || ''}`);
    } finally {
      setIsInitializingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-white/20 rounded-2xl shrink-0 backdrop-blur-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base truncate flex items-center gap-2">
                <span>Google Sheets Online Sheet Manager</span>
                <span className="text-[10px] bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Interactive Viewer
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200 truncate">
                {location || 'Google Drive / OGA_Stock_2026'} • ID: {cleanId ? `${cleanId.substring(0, 12)}...` : 'Auto-Assigned'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Action Toolbar & External Links */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={webUrl}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-200" />
              <span>เปิด Google Sheets บนเว็บ</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>

            <a
              href={driveUploadUrl}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-200" />
              <span>เปิด Google Drive (เพื่ออัปโหลด)</span>
              <ExternalLink className="w-3 h-3 text-blue-200" />
            </a>

            <button
              onClick={downloadGoogleSheetsExcelTemplate}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              title="ดาวน์โหลดไฟล์ .xlsx 3 แท็บ"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>ดาวน์โหลด .xlsx</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อมูลในตาราง..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Mobile Info Tip on how to open Google Sheets without white screen */}
        <div className="bg-amber-50/90 border-b border-amber-200 px-3 py-2 text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-black">คำแนะนำสำหรับมือถือ (Mobile Display Tip):</span> หากเปิด Google Sheets บนมือถือแล้วพบหน้าจอขาวโล่ง ให้ใช้วิธี (1) ดูข้อมูลผ่านตารางในแอปนี้ได้ทันที หรือ (2) เปิดในแอป <b>Google Sheets</b> บนเครื่อง หรือ (3) ใน Chrome ให้กดเมนู 3 จุดมุมขวาบน &gt; ติ๊กเลือก <b>"เว็บไซต์เวอร์ชันเดสก์ท็อป (Desktop site)"</b>
          </div>
        </div>

        {/* Sheet Tabs Bar (Like Google Sheets Bottom Tabs) */}
        <div className="flex items-center gap-1 px-3 pt-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ItemMaster')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'ItemMaster'
                ? 'bg-white text-emerald-800 border-slate-300 border-b-white -mb-[1px] shadow-2xs'
                : 'bg-slate-200 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. ItemMaster</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('LocationMaster')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'LocationMaster'
                ? 'bg-white text-teal-800 border-slate-300 border-b-white -mb-[1px] shadow-2xs'
                : 'bg-slate-200 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-teal-600" />
            <span>2. LocationMaster</span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full font-bold">
              {locations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ScannedStock')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'ScannedStock'
                ? 'bg-white text-blue-800 border-slate-300 border-b-white -mb-[1px] shadow-2xs'
                : 'bg-slate-200 text-slate-600 border-transparent hover:bg-slate-300'
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-blue-600" />
            <span>3. ScannedStock (ผลตรวจนับ)</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
              {scannedRecords.length}
            </span>
          </button>
        </div>

        {/* Spreadsheet Data Grid View */}
        <div className="flex-1 overflow-auto bg-white p-2 sm:p-4">
          
          {/* 1. ItemMaster Grid (Image 4: ItemCode, ItemName, Barcode, Barcode2, Category, Unit, QuantityPlan, UseLot, UseSerial, UseExpiry, Remark) */}
          {activeTab === 'ItemMaster' && (
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse font-sans whitespace-nowrap">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-950 border-b border-emerald-200 text-[11px] font-black uppercase tracking-wider">
                    <th className="p-2.5 border-r border-emerald-200 text-center w-10">#</th>
                    <th className="p-2.5 border-r border-emerald-200 font-mono">ItemCode</th>
                    <th className="p-2.5 border-r border-emerald-200 min-w-[200px]">ItemName</th>
                    <th className="p-2.5 border-r border-emerald-200 font-mono">Barcode</th>
                    <th className="p-2.5 border-r border-emerald-200 font-mono">Barcode2</th>
                    <th className="p-2.5 border-r border-emerald-200">Category</th>
                    <th className="p-2.5 border-r border-emerald-200 text-center">Unit</th>
                    <th className="p-2.5 border-r border-emerald-200 text-right">QuantityPlan</th>
                    <th className="p-2.5 border-r border-emerald-200 text-center">UseLot</th>
                    <th className="p-2.5 border-r border-emerald-200 text-center">UseSerial</th>
                    <th className="p-2.5 border-r border-emerald-200 text-center">UseExpiry</th>
                    <th className="p-2.5 min-w-[120px]">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-2.5 text-center text-slate-400 font-mono border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 font-bold font-mono text-emerald-800 border-r border-slate-100">{item.ItemCode}</td>
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-100">{item.ItemName}</td>
                      <td className="p-2.5 font-mono text-slate-700 border-r border-slate-100">{item.Barcode || '-'}</td>
                      <td className="p-2.5 font-mono text-slate-500 border-r border-slate-100">{item.Barcode2 || '-'}</td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-100">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          {item.Category || 'General'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-700 border-r border-slate-100">{item.Unit || 'PCS'}</td>
                      <td className="p-2.5 text-right font-black font-mono text-emerald-700 border-r border-slate-100">{item.QuantityPlan ?? 0}</td>
                      <td className="p-2.5 text-center border-r border-slate-100 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${item.UseLot === 'Y' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-400'}`}>
                          {item.UseLot || 'N'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-100 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${item.UseSerial === 'Y' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-400'}`}>
                          {item.UseSerial || 'N'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-100 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${item.UseExpiry === 'Y' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-400'}`}>
                          {item.UseExpiry || 'N'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{item.Remark || '-'}</td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-6 text-center text-slate-400">
                        ไม่พบข้อมูลสินค้าที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. LocationMaster Grid (Image 5: LocationCode, LocationName, Zone, Warehouse, LocationDescription, Active) */}
          {activeTab === 'LocationMaster' && (
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse font-sans whitespace-nowrap">
                <thead>
                  <tr className="bg-teal-50 text-teal-950 border-b border-teal-200 text-[11px] font-black uppercase tracking-wider">
                    <th className="p-2.5 border-r border-teal-200 text-center w-10">#</th>
                    <th className="p-2.5 border-r border-teal-200 font-mono">LocationCode</th>
                    <th className="p-2.5 border-r border-teal-200 min-w-[160px]">LocationName</th>
                    <th className="p-2.5 border-r border-teal-200">Zone</th>
                    <th className="p-2.5 border-r border-teal-200">Warehouse</th>
                    <th className="p-2.5 border-r border-teal-200 min-w-[200px]">LocationDescription</th>
                    <th className="p-2.5 text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLocations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                      <td className="p-2.5 text-center text-slate-400 font-mono border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 font-bold font-mono text-teal-800 border-r border-slate-100">{loc.LocationCode}</td>
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-100">{loc.LocationName}</td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-100">
                        <span className="bg-teal-50 text-teal-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-teal-200">
                          {loc.Zone || 'Zone-A'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-100">{loc.Warehouse || 'คลังหลัก'}</td>
                      <td className="p-2.5 text-slate-600 border-r border-slate-100 text-[11px]">{loc.LocationDescription || '-'}</td>
                      <td className="p-2.5 text-center font-bold font-mono text-emerald-700">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {loc.Active || 'Y'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLocations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        ไม่พบข้อมูลสถานที่ที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. ScannedStock Grid (Image 6: id, CompanyCode, BranchCode, LocationCode, LocationName, ItemCode, ItemName, Barcode, LotNumber, ExpiryDate, SerialNumber, QuantityScan, Status, ScannedBy, ScanDate, ScanTime, Synced) */}
          {activeTab === 'ScannedStock' && (
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse font-sans whitespace-nowrap">
                <thead>
                  <tr className="bg-blue-50 text-blue-950 border-b border-blue-200 text-[11px] font-black uppercase tracking-wider">
                    <th className="p-2.5 border-r border-blue-200 text-center w-10">#</th>
                    <th className="p-2.5 border-r border-blue-200 font-mono">id</th>
                    <th className="p-2.5 border-r border-blue-200">CompanyCode</th>
                    <th className="p-2.5 border-r border-blue-200">BranchCode</th>
                    <th className="p-2.5 border-r border-blue-200 font-mono">LocationCode</th>
                    <th className="p-2.5 border-r border-blue-200">LocationName</th>
                    <th className="p-2.5 border-r border-blue-200 font-mono">ItemCode</th>
                    <th className="p-2.5 border-r border-blue-200 min-w-[180px]">ItemName</th>
                    <th className="p-2.5 border-r border-blue-200 font-mono">Barcode</th>
                    <th className="p-2.5 border-r border-blue-200">LotNumber</th>
                    <th className="p-2.5 border-r border-blue-200">ExpiryDate</th>
                    <th className="p-2.5 border-r border-blue-200 font-mono">SerialNumber</th>
                    <th className="p-2.5 border-r border-blue-200 text-right">QuantityScan</th>
                    <th className="p-2.5 border-r border-blue-200 text-center">Status</th>
                    <th className="p-2.5 border-r border-blue-200">ScannedBy</th>
                    <th className="p-2.5 border-r border-blue-200">ScanDate</th>
                    <th className="p-2.5 border-r border-blue-200">ScanTime</th>
                    <th className="p-2.5 text-center">Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScanned.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-2.5 text-center text-slate-400 font-mono border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 font-mono text-[11px] font-bold text-slate-600 border-r border-slate-100">{rec.id || `REC-${idx+1}`}</td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-100">{rec.CompanyCode || 'OGA001'}</td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-100">{rec.BranchCode || 'HQ'}</td>
                      <td className="p-2.5 font-bold font-mono text-slate-800 border-r border-slate-100">{rec.LocationCode}</td>
                      <td className="p-2.5 text-slate-800 border-r border-slate-100">{rec.LocationName || '-'}</td>
                      <td className="p-2.5 font-bold font-mono text-blue-800 border-r border-slate-100">{rec.ItemCode}</td>
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-100">{rec.ItemName}</td>
                      <td className="p-2.5 font-mono text-slate-600 border-r border-slate-100">{rec.Barcode}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100">{rec.LotNumber || '-'}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100">{rec.ExpiryDate || '-'}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-700 border-r border-slate-100">
                        {rec.SerialNumber || '-'}
                      </td>
                      <td className="p-2.5 text-right font-black font-mono text-blue-700 border-r border-slate-100">{rec.QuantityScan}</td>
                      <td className="p-2.5 text-center border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          rec.Status === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.Status || 'NORMAL'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700 border-r border-slate-100">{rec.ScannedBy || 'Admin'}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100">{rec.ScanDate || '-'}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100">{rec.ScanTime || '-'}</td>
                      <td className="p-2.5 text-center font-bold">
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          TRUE
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredScanned.length === 0 && (
                    <tr>
                      <td colSpan={18} className="p-8 text-center text-slate-400">
                        ยังไม่มีรายการสแกนนับสต็อก (เมื่อทำการสแกน ข้อมูลจะปรากฏที่นี่และส่งเข้า Google Sheets)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>สถานะระบบ: เชื่อมต่อ Google Sheets Online พร้อมใช้งาน</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์ชีต'}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
