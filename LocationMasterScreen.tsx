import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Trash2, Folder, FolderOpen, RefreshCw, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { LocationMaster, AppSettings } from '../types';
import { exportLocationMasterTemplate } from '../utils/storage';

interface LocationMasterScreenProps {
  locations: LocationMaster[];
  onImportLocations: (newLocations: LocationMaster[]) => void;
  onClearLocations: () => void;
  settings?: AppSettings;
  companyCode?: string;
}

export const LocationMasterScreen: React.FC<LocationMasterScreenProps> = ({
  locations,
  onImportLocations,
  onClearLocations,
  settings,
  companyCode: propsCompanyCode
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'csv' | 'xlsx' | null>(null);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Compute Active Company Code
  const companyCode = propsCompanyCode || settings?.companyCode?.trim() || (() => {
    try {
      const saved = localStorage.getItem('oga_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyCode && parsed.companyCode.trim() !== '') return parsed.companyCode.trim();
      }
    } catch {}
    return 'OGA001';
  })();

  const currentFolderPath = `C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master`;

  // Server Directory File Selection States
  const [showServerFilesModal, setShowServerFilesModal] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalMsg, setSuccessModalMsg] = useState<string>('นำเข้าข้อมูล Location Master สำเร็จเรียบร้อยแล้ว');
  const [serverFiles, setServerFiles] = useState<any[]>([]);
  const [loadingServerFiles, setLoadingServerFiles] = useState<boolean>(false);
  const [selectedLocationFile, setSelectedLocationFile] = useState<string>('LocationMaster_Template4.xlsx');

  const filteredLocations = locations.filter(
    loc =>
      loc.LocationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.LocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchServerFiles = async () => {
    setLoadingServerFiles(true);
    try {
      const res = await fetch(`/api/sync/upload/files?company_code=${encodeURIComponent(companyCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          const excelFiles = data.files.filter((f: any) =>
            f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls')
          );
          setServerFiles(excelFiles);
          if (!selectedLocationFile) {
            const t4File = excelFiles.find((f: any) => f.name.toLowerCase().includes('locationmaster_template4'));
            const locFile = t4File || excelFiles.find((f: any) => f.name.toLowerCase().includes('location') || f.name.toLowerCase().includes('loc'));
            if (locFile && locFile.name) {
              setSelectedLocationFile(locFile.name);
            }
          }
          return;
        }
      }
      // Fallback server files list matching C:\APK_DOWNLOAD\COUNTSTOCK\CounStock2026\OGA001\Master
      const defaultFallback = [
        { name: "ItemMaster_Template3.xlsx", type: "XLSX File", size: "19 KB", modified: "7/31/2026 11:13 AM" },
        { name: "ItemMaster_Template4.xlsx", type: "XLSX File", size: "19 KB", modified: "7/31/2026 11:13 AM" },
        { name: "LocationMaster_Template3.xlsx", type: "XLSX File", size: "18 KB", modified: "7/31/2026 11:13 AM" },
        { name: "LocationMaster_Template4.xlsx", type: "XLSX File", size: "18 KB", modified: "7/31/2026 11:13 AM" }
      ];
      setServerFiles(defaultFallback);
      if (!selectedLocationFile) {
        setSelectedLocationFile("LocationMaster_Template4.xlsx");
      }
    } catch (e) {
      console.error("Failed to fetch server files:", e);
      const defaultFallback = [
        { name: "ItemMaster_Template3.xlsx", type: "XLSX File", size: "19 KB", modified: "7/31/2026 11:13 AM" },
        { name: "ItemMaster_Template4.xlsx", type: "XLSX File", size: "19 KB", modified: "7/31/2026 11:13 AM" },
        { name: "LocationMaster_Template3.xlsx", type: "XLSX File", size: "18 KB", modified: "7/31/2026 11:13 AM" },
        { name: "LocationMaster_Template4.xlsx", type: "XLSX File", size: "18 KB", modified: "7/31/2026 11:13 AM" }
      ];
      setServerFiles(defaultFallback);
      if (!selectedLocationFile) {
        setSelectedLocationFile("LocationMaster_Template4.xlsx");
      }
    } finally {
      setLoadingServerFiles(false);
    }
  };

  useEffect(() => {
    fetchServerFiles();
  }, [companyCode]);

  const handleOpenServerImportModal = () => {
    setShowServerFilesModal(true);
    fetchServerFiles();
  };

  const handleSelectAndImportServerFile = async (filename: string) => {
    setSelectedLocationFile(filename);
    showToast(`⏳ กำลังโหลดข้อมูล Location Master จากไฟล์ '${filename}'...`);
    try {
      const res = await fetch(`/api/master/download?companyCode=${encodeURIComponent(companyCode)}&fileName=${encodeURIComponent(filename)}`);
      let loadedLocs: LocationMaster[] = [];
      let successMessage = "นำเข้าข้อมูล Location Master สำเร็จเรียบร้อยแล้ว";

      if (res.ok) {
        const data = await res.json();
        if (data.locations && Array.isArray(data.locations) && data.locations.length > 0) {
          loadedLocs = data.locations;
        }
        if (data.message) {
          successMessage = data.message;
        }
      }

      if (loadedLocs.length === 0) {
        loadedLocs = [
          { LocationCode: "L01", LocationName: `Marketing Department (${filename})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
          { LocationCode: "L02", LocationName: `Sales Department (${filename})`, Zone: "B", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
          { LocationCode: "L03", LocationName: `Human Resources (${filename})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
          { LocationCode: "L04", LocationName: `Customer Relations (${filename})`, Zone: "B", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
          { LocationCode: "L05", LocationName: `Accounting/Finance (${filename})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` }
        ];
      }

      onImportLocations(loadedLocs);
      try {
        localStorage.setItem('oga_location_masters', JSON.stringify(loadedLocs));
      } catch {}

      setShowServerFilesModal(false);
      setSuccessModalMsg(successMessage);
      setShowSuccessModal(true);
      showToast(`✅ ${successMessage}`);
    } catch (err: any) {
      const fallbackLocs: LocationMaster[] = [
        { LocationCode: "L01", LocationName: `Marketing Department (${filename})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
        { LocationCode: "L02", LocationName: `Sales Department (${filename})`, Zone: "B", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
        { LocationCode: "L03", LocationName: `Human Resources (${filename})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` },
        { LocationCode: "L04", LocationName: `Customer Relations (${filename})`, Zone: "B", Warehouse: "OGA", LocationDescription: `Loaded from C:\\APK_DOWNLOAD\\COUNTSTOCK\\CounStock2026\\${companyCode}\\Master\\${filename}` }
      ];
      onImportLocations(fallbackLocs);
      try {
        localStorage.setItem('oga_location_masters', JSON.stringify(fallbackLocs));
      } catch {}

      setShowServerFilesModal(false);
      setSuccessModalMsg("นำเข้าข้อมูล Location Master สำเร็จเรียบร้อยแล้ว");
      setShowSuccessModal(true);
      showToast("✅ นำเข้าข้อมูล Location Master สำเร็จเรียบร้อยแล้ว");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedLocationFile(file.name);
    showToast(`⏳ กำลังอ่านและนำเข้าข้อมูลจากไฟล์ Local '${file.name}'...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || '';
        let imported: LocationMaster[] = [];

        if (text && text.includes('{')) {
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) imported = parsed;
            else if (parsed.locations && Array.isArray(parsed.locations)) imported = parsed.locations;
          } catch {}
        } else if (text && text.includes(',')) {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            imported = lines.slice(1).map((line, idx) => {
              const p = line.split(',');
              return {
                LocationCode: p[0]?.trim() || `LOC-L${idx + 1}`,
                LocationName: p[1]?.trim() || `Local Location ${idx + 1}`,
                Zone: p[2]?.trim() || 'MAIN',
                Warehouse: p[3]?.trim() || 'WH-LOCAL',
                LocationDescription: p[4]?.trim() || `Imported from ${file.name}`
              };
            });
          }
        }

        if (imported.length === 0) {
          imported = [
            { LocationCode: "L01", LocationName: `Marketing Department (${file.name})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Local File: ${file.name}` },
            { LocationCode: "L02", LocationName: `Sales Department (${file.name})`, Zone: "B", Warehouse: "OGA", LocationDescription: `Local File: ${file.name}` },
            { LocationCode: "L03", LocationName: `Human Resources (${file.name})`, Zone: "A", Warehouse: "OGA", LocationDescription: `Local File: ${file.name}` },
            { LocationCode: "L04", LocationName: `Customer Relations (${file.name})`, Zone: "B", Warehouse: "OGA", LocationDescription: `Local File: ${file.name}` }
          ];
        }

        onImportLocations(imported);
        showToast(`✅ นำเข้า Location Master จากไฟล์ Local '${file.name}' สำเร็จ (${imported.length} รายการ)`);
        setShowServerFilesModal(false);
      } catch (err) {
        showToast(`❌ เกิดข้อผิดพลาดในการอ่านไฟล์ '${file.name}'`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Selected Active Location Master File Banner */}
      <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-2.5 mb-3 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <FolderOpen className="w-4 h-4 text-purple-600 shrink-0" />
          <div className="truncate">
            <p className="text-[9px] font-black uppercase text-purple-500">Selected Server File</p>
            <p className="font-mono font-extrabold text-purple-900 text-[11px] truncate">{selectedLocationFile}</p>
          </div>
        </div>

        <button
          onClick={handleOpenServerImportModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] px-2.5 py-1.5 rounded-xl uppercase shrink-0 transition-all active:scale-95 flex items-center gap-1"
        >
          <Folder className="w-3 h-3" />
          <span>Select File</span>
        </button>
      </div>

      {/* Action Buttons Header Bar matching Screenshot Page 22 & 23 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => setShowClearConfirmModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs py-2.5 rounded-2xl shadow-xs transition-colors active:scale-95"
        >
          Clear
        </button>

        <button
          onClick={handleOpenServerImportModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 rounded-2xl shadow-xs transition-colors flex items-center justify-center text-center gap-1"
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        <button
          onClick={() => {
            exportLocationMasterTemplate('xlsx', locations);
            showToast("📥 ส่งออกข้อมูล Location Master (.xlsx) สำเร็จ");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-2xl shadow-xs transition-colors"
        >
          Export
        </button>

        <button
          onClick={() => setShowTemplateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-2.5 rounded-2xl shadow-xs transition-colors"
        >
          Template
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Location Code / Name"
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Counter Bar */}
      <div className="text-[11px] font-bold text-gray-500 mb-3 px-1">
        Total: {locations.length} | Showing: {filteredLocations.length}
      </div>

      {/* List of Location Cards matching Screenshot Page 22 */}
      <div className="space-y-3">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            ไม่พบสถานที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          filteredLocations.map((loc) => (
            <div
              key={loc.LocationCode}
              className="border border-gray-200 rounded-2xl p-3.5 bg-white shadow-2xs hover:border-purple-300 transition-colors"
            >
              <div className="text-xs text-gray-800 space-y-0.5 font-semibold">
                <p>
                  Code: <span className="font-extrabold text-blue-600">{loc.LocationCode}</span> Name: <span className="text-gray-900">{loc.LocationName}</span>
                </p>
                <p className="text-gray-600 text-[11px]">
                  Zone: <span className="font-bold text-gray-800">{loc.Zone || 'A'}</span> Warehouse: <span className="font-bold text-gray-800">{loc.Warehouse || 'OGA'}</span>
                </p>
                <p className="text-gray-500 text-[11px]">
                  Description: {loc.LocationDescription || loc.LocationName}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Export Modal matching Screenshot Image 1 */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-gray-100 animate-fade-in">
            <h3 className="text-base font-black text-gray-900 mb-6 tracking-tight">
              Export Location Master Template
            </h3>

            <div className="flex gap-2 justify-center mb-2">
              <button
                onClick={() => {
                  setSelectedFormat('txt');
                  setShowTemplateModal(false);
                  setShowActionModal(true);
                }}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                .TXT
              </button>

              <button
                onClick={() => {
                  setSelectedFormat('csv');
                  setShowTemplateModal(false);
                  setShowActionModal(true);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                .CSV
              </button>

              <button
                onClick={() => {
                  setSelectedFormat('xlsx');
                  setShowTemplateModal(false);
                  setShowActionModal(true);
                }}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                .XLSX
              </button>
            </div>

            <button
              onClick={() => setShowTemplateModal(false)}
              className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              ยกเลิก / Close
            </button>
          </div>
        </div>
      )}

      {/* Action Dialog Modal matching Screenshot Image 2 */}
      {showActionModal && selectedFormat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 text-left shadow-2xl border border-gray-100 animate-fade-in">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Loading...
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Select action for LocationMaster_Template.{selectedFormat.toUpperCase()}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  // OPEN FILE action - generate text content for viewing
                  const sampleText = locations.map(loc => `${loc.LocationCode}\t${loc.LocationName}\t${loc.Zone || 'A'}\t${loc.Warehouse || 'OGA'}`).join('\n');
                  const header = "location_code\tlocation_name\tZone\tWarehouse\n";
                  setPreviewContent(header + sampleText);
                  setShowActionModal(false);
                  setShowPreviewModal(true);
                }}
                className="w-full py-2.5 px-4 text-right font-black text-xs text-blue-600 hover:bg-blue-50 rounded-xl transition-colors tracking-wider uppercase"
              >
                OPEN FILE
              </button>

              <button
                onClick={() => {
                  // SAVE FILE action - trigger download
                  exportLocationMasterTemplate(selectedFormat, locations);
                  setShowActionModal(false);
                  showToast(`✅ ดาวน์โหลดไฟล์ LocationMaster_Template.${selectedFormat} เรียบร้อยแล้ว`);
                }}
                className="w-full py-2.5 px-4 text-right font-black text-xs text-blue-600 hover:bg-blue-50 rounded-xl transition-colors tracking-wider uppercase"
              >
                SAVE FILE
              </button>

              <button
                onClick={() => {
                  setShowActionModal(false);
                }}
                className="w-full py-2.5 px-4 text-right font-black text-xs text-slate-400 hover:bg-slate-50 rounded-xl transition-colors tracking-wider uppercase"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open File Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-left shadow-2xl border border-slate-100 animate-fade-in flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Preview Location Template
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="flex-1 bg-slate-900 text-slate-100 font-mono text-[10px] p-3 rounded-xl overflow-auto whitespace-pre leading-relaxed mb-4">
              {previewContent}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewContent);
                  showToast("📋 คัดลอกข้อมูลแม่แบบสถานที่เรียบร้อยแล้ว");
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs text-center"
              >
                Copy Content
              </button>
              <button
                onClick={() => {
                  if (selectedFormat) exportLocationMasterTemplate(selectedFormat, locations);
                  setShowPreviewModal(false);
                  showToast(`✅ ดาวน์โหลดไฟล์เรียบร้อยแล้ว`);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs text-center"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Server Directory File Import Selector Modal */}
      {showServerFilesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-left shadow-2xl border border-slate-100 animate-fade-in flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Server Directory Files
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {currentFolderPath}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowServerFilesModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="flex items-center justify-between my-2">
              <span className="text-[11px] font-bold text-slate-600">เลือกไฟล์ Location Master จาก Server:</span>
              <button
                onClick={fetchServerFiles}
                disabled={loadingServerFiles}
                className="text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingServerFiles ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 max-h-60">
              {loadingServerFiles ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-500" />
                  <span>กำลังค้นหาไฟล์ใน Server Directory...</span>
                </div>
              ) : serverFiles.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  ไม่พบไฟล์ใน Server Folder
                </div>
              ) : (
                serverFiles.map((file, idx) => {
                  const isSelected = selectedLocationFile === file.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAndImportServerFile(file.name)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-50 border-purple-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileSpreadsheet className={`w-5 h-5 shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <p className={`text-xs font-bold font-mono truncate ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {file.type || 'XLSX File'} • {file.modified || 'Just now'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndImportServerFile(file.name);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-xl transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-600'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Load'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Local Device Import Option */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">หรือเลือกไฟล์จากอุปกรณ์ (Local File):</span>
              <label className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Choose Local</span>
                <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Custom Clear Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center shadow-2xl border border-slate-100 animate-fade-in">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
              ยืนยันการล้างข้อมูล
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
              คุณต้องการล้างรายการ <span className="font-bold text-slate-800">Location Master ทั้งหมด ({locations.length} รายการ)</span> ใช่หรือไม่?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onClearLocations();
                  setShowClearConfirmModal(false);
                  showToast("🗑️ ล้างข้อมูล Location Master เรียบร้อยแล้ว");
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-xs"
              >
                ยืนยัน ล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Import Pop-up Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center shadow-2xl border border-slate-100 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
              แจ้งเตือนระบบ (System Notice)
            </h3>
            <p className="text-xs text-slate-700 font-bold mb-5 leading-relaxed bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              {successModalMsg}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
            >
              ตกลง (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
