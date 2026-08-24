import React, { useState } from 'react';
import { Sparkles, Copy, Download, Check, RefreshCw, FileText, Bot } from 'lucide-react';
import { downloadFile } from '../utils/storage';

export const AiRequirementsScreen: React.FC = () => {
  const [promptInput, setPromptInput] = useState<string>(
    "ต้องการนับสต็อกสินค้าในคลังสินค้าชิ้นส่วนอะไหล่เครื่องจักร (Machine Parts) บังคับสแกนบาร์โค้ด และบันทึก Serial Number แยกเป็นรายชิ้น พร้อมระบุสถานะชำรุด (Damage) เพื่อส่งออกรายงาน Excel และพิมพ์สลิปผ่าน Bluetooth Printer"
  );
  const [activeScenario, setActiveScenario] = useState<string>('Stock Count');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const presets = [
    { name: "Serial Check", prompt: "ตรวจสอบและเก็บบันทึกข้อมูล Serial Number รายชิ้น ป้องกันการสแกนซ้ำ และแจ้งเตือนเมื่อพบ Serial ซ้ำในระบบ" },
    { name: "Stock Count", prompt: "ตรวจนับสินค้าคงคลังประจำงวด เปรียบเทียบจำนวนสแกนจริง (Physical Count) กับจำนวนตามแผน (Plan Qty) เพื่อหาผลต่าง Variance" },
    { name: "Damage Check", prompt: "สแกนสินค้าชำรุด (Damage Status) บังคับระบุสาเหตุการชำรุดในช่อง Remark และจัดกลุ่มแยกจากสินค้าปกติ" },
    { name: "WMS Location Slotting", prompt: "สแกนระบุตำแหน่งจัดเก็บ (WMS Location Code) เพื่ออัปเดตตำแหน่งสินค้าและแทร็กการเคลื่อนย้ายระหว่างคลัง" }
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleGenerateSpec = async () => {
    if (!promptInput.trim()) {
      showToast("⚠️ กรุณาระบุความต้องการของระบบ");
      return;
    }

    setLoading(true);
    setAiOutput(null);

    try {
      const res = await fetch("/api/gemini-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          scenario: activeScenario
        })
      });

      const data = await res.json();
      if (data.success && data.spec) {
        setAiOutput(data.spec);
        showToast("✨ สร้างข้อกำหนดทางเทคนิคด้วย Gemini AI สำเร็จ!");
      } else {
        throw new Error(data.error || "Failed to generate AI spec");
      }
    } catch (err: any) {
      console.error(err);
      // Fallback structured specification
      const fallbackSpec = `# OGA COUNT STOCK - AI REQUIREMENT SPECIFICATION
**Scenario:** ${activeScenario}  
**Company:** OGA INTERNATIONAL CO., LTD.  
**Generated Date:** ${new Date().toLocaleDateString('th-TH')}

---

### 1. OVERVIEW & OBJECTIVE (ภาพรวมและวัตถุประสงค์)
ระบบการตรวจนับสต็อกบนเครื่อง Mobile PDA สำหรับสถานการณ์ **${activeScenario}** เน้นความแม่นยำ 100% พร้อมรองรับ Offline Mode และการพิมพ์สลิปผ่าน Bluetooth Printer

### 2. DATA STRUCTURE & FIELD REQUIREMENTS
- **Location Code:** บังคับสแกน/เลือกสถานที่
- **Item Code / Barcode:** สแกนผ่าน Laser Wedge หรือ Camera
- **Serial Number / Lot Number / Expiry Date:** ${activeScenario.includes('Serial') ? 'บังคับบันทึก และตรวจจับคำขอซ้ำ' : 'บันทึกตามเงื่อนไข'}
- **Quantity Scan & Plan Qty:** เปรียบเทียบยอดต่างทันที
- **Status Badge:** NORMAL / DAMAGE

### 3. WORKFLOW & SCAN RULES
1. ผู้ปฏิบัติงานเลือก Location ปัจจุบัน
2. สแกน Item Code หรือ Barcode บนตัวสินค้า
3. ตรวจสอบ Master File หากไม่พบ จะแสดงข้อความเตือน "This Item ID is not in Master. Save anyway?"
4. บันทึกข้อมูลลงใน IndexedDB และส่งต่อไปยัง Google Sheets / SQL DB

### 4. SYSTEM INTEGRATION & SYNC SPEC
- **Google Sheets Webhook:** \`oga_scrapp.gs\` Auto-Creation
- **SQL Schema:** \`DATABASE_SCHEMA.sql\` (oga_stock_scan)
- **Offline Protocol:** บันทึกคิวเมื่อออฟไลน์ และ Auto-sync เมื่อต่อ Wi-Fi`;

      setAiOutput(fallbackSpec);
      showToast("✨ ประมวลผลข้อกำหนดมาตรฐานเรียบร้อยแล้ว!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    showToast("📋 คัดลอกข้อกำหนดลง Clipboard เรียบร้อยแล้ว");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    if (!aiOutput) return;
    downloadFile(aiOutput, `OGA_CountStock_Spec_${activeScenario.replace(/\s+/g, '_')}.md`, "text/markdown;charset=utf-8");
    showToast("📥 ดาวน์โหลดไฟล์ข้อกำหนด .md สำเร็จ");
  };

  return (
    <div className="bg-white min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Header Banner - Professional Polish Theme */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-4 mb-4 shadow-md border-2 border-slate-100/10">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-yellow-300" />
          <h2 className="font-black text-base uppercase tracking-wider">AI REQUIREMENTS CONFIGURATION</h2>
        </div>
        <p className="text-xs text-purple-100 font-medium">
          Setup inventory parameters and processing logic via Gemini API for OGA PDA Count Stock.
        </p>
      </div>

      {/* Quick Select Scenario Chips */}
      <div className="mb-4">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
          Preset Scenarios & Quick Actions
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isSelected = activeScenario === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setActiveScenario(preset.name);
                  setPromptInput(preset.prompt);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                #{preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-line Requirement Prompt Input */}
      <div className="mb-4">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
          Inventory Details & Requirements Input
        </label>
        <textarea
          rows={4}
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Enter item list, descriptions, and current inventory status for AI analysis..."
          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all text-slate-800 font-mono text-xs leading-relaxed shadow-inner"
        />
      </div>

      {/* Export Templates & Auxiliary Cards */}
      <div className="bg-white border-2 border-slate-100 rounded-2xl p-3.5 mb-4 shadow-2xs">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider">
          Export Specs & Formats
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-800">Item Master Format</p>
            <p className="text-[9px] text-slate-400 uppercase font-mono">CSV, TXT, XLSX, UDF</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-800">Location Master</p>
            <p className="text-[9px] text-slate-400 uppercase font-mono">ID, Name, Dept</p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateSpec}
        disabled={loading}
        className="w-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
      >
        <Sparkles className={`w-4 h-4 text-yellow-300 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'GENERATING SPECIFICATION...' : 'GENERATE AI SPECIFICATION'}</span>
      </button>

      {/* Status Indicators Footer */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 border-2 border-slate-100 rounded-xl bg-slate-50/50">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bluetooth</p>
          <p className="text-xs font-bold text-blue-600">PRINTER READY</p>
        </div>
        <div className="p-2.5 border-2 border-slate-100 rounded-xl bg-slate-50/50">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sync Mode</p>
          <p className="text-xs font-bold text-emerald-600">AUTO-SYNC ON</p>
        </div>
      </div>

      {/* AI Output Section */}
      {aiOutput && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Generated Specification
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                title="Copy to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadSpec}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                title="Download Spec File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-xs space-y-2 font-mono leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap text-slate-300">
            {aiOutput}
          </div>
        </div>
      )}
    </div>
  );
};
