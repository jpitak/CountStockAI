import React, { useState } from 'react';
import { Download, FileCode, FileSpreadsheet, FileText, Database, Package, Check, Copy } from 'lucide-react';
import { MASTER_DELIVERABLES, DeliverableFile } from '../data/masterDeliverables';
import { exportMasterPackageZip, downloadFile } from '../utils/storage';

export const MasterPackageModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<DeliverableFile>(MASTER_DELIVERABLES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    showToast(`📋 คัดลอกซอร์สโค้ด ${selectedFile.filename} เรียบร้อยแล้ว`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    downloadFile(selectedFile.content, selectedFile.filename, "text/plain;charset=utf-8");
    showToast(`📥 ดาวน์โหลดไฟล์ ${selectedFile.filename} เรียบร้อยแล้ว`);
  };

  const handleDownloadFullZip = async () => {
    showToast("📦 กำลังบีบอัดไฟล์ OGA_COUNT_TEST_PACKAGE.zip...");
    await exportMasterPackageZip();
    showToast("✅ ดาวน์โหลด OGA_COUNT_TEST_PACKAGE.zip เรียบร้อยแล้ว!");
  };

  return (
    <div className="bg-white min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Main Download Full Zip Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-4 mb-4 shadow-lg text-center">
        <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-2">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-extrabold text-base tracking-wider uppercase mb-1">
          OGA MASTER DELIVERABLES PACKAGE
        </h2>
        <p className="text-xs text-blue-100 mb-3">
          ชุดไฟล์สมบูรณ์ 100% สำหรับส่งมอบ บริษัท OGA INTERNATIONAL CO., LTD.
        </p>

        <button
          onClick={handleDownloadFullZip}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD OGA_COUNT_TEST_PACKAGE.ZIP</span>
        </button>
      </div>

      {/* File Selector Tabs */}
      <div className="mb-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Select Deliverable File
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {MASTER_DELIVERABLES.map((file) => {
            const isSelected = selectedFile.filename === file.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <FileCode className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                <span className="truncate">{file.filename}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div>
            <span className="text-xs font-extrabold text-blue-400 font-mono block">
              {selectedFile.filename}
            </span>
            <span className="text-[10px] text-slate-400">
              {selectedFile.description}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCode}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownloadSingle}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <pre className="text-[11px] font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap text-slate-300">
          {selectedFile.content}
        </pre>
      </div>
    </div>
  );
};
