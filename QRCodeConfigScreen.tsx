import React, { useState } from 'react';
import { QrCode, Plus, Edit2, Trash2, CheckCircle2, Copy, Play, RefreshCw, AlertCircle, ArrowLeft, Layers, Check, Sparkles, SlidersHorizontal, Info, Sliders } from 'lucide-react';
import { QRCodeProfile, QRFieldMapping, QRFieldType, QRCodeParseResult, UserRole, AppSettings } from '../types';
import { DEFAULT_QR_PROFILES, QR_FIELD_OPTIONS, parseQRCodeWithProfile, normalizeExpiryDate } from '../utils/qrParser';

interface QRCodeConfigScreenProps {
  profiles: QRCodeProfile[];
  activeProfileId: string;
  onSaveProfiles: (profiles: QRCodeProfile[], activeId: string) => void;
  onBack: () => void;
  settings?: AppSettings;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  currentUserRole?: UserRole;
}

export const QRCodeConfigScreen: React.FC<QRCodeConfigScreenProps> = ({
  profiles,
  activeProfileId,
  onSaveProfiles,
  onBack,
  settings,
  onUpdateSettings,
  currentUserRole = 'Admin'
}) => {
  const [localProfiles, setLocalProfiles] = useState<QRCodeProfile[]>(profiles);
  const [editingProfile, setEditingProfile] = useState<QRCodeProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Live Test Sandbox State
  const [testRawString, setTestRawString] = useState<string>('I00001;Sample Motor;SN-2026-9988');
  const [testSelectedProfileId, setTestSelectedProfileId] = useState<string>(activeProfileId);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Find currently active profile
  const currentActiveProfile = localProfiles.find(p => p.id === activeProfileId) || localProfiles[0] || DEFAULT_QR_PROFILES[0];
  const testProfile = localProfiles.find(p => p.id === testSelectedProfileId) || currentActiveProfile;

  // Run live test parse
  const testParseResult: QRCodeParseResult = parseQRCodeWithProfile(testRawString, testProfile);

  const handleSetActive = (id: string) => {
    const updated = localProfiles.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    setLocalProfiles(updated);
    onSaveProfiles(updated, id);
    setTestSelectedProfileId(id);

    const targetProf = localProfiles.find(p => p.id === id);
    if (targetProf && settings && onUpdateSettings) {
      const hasLot = targetProf.fields.some(f => f.fieldName === 'lot_number');
      const hasExp = targetProf.fields.some(f => f.fieldName === 'expiry_date');
      const hasSerial = targetProf.fields.some(f => f.fieldName === 'serial_number');
      onUpdateSettings({
        ...settings,
        enableLotControl: hasLot,
        enableExpiryDate: hasExp,
        enableSerialControl: hasSerial
      });
    }

    showToast(`✅ เลือก Profile '${targetProf?.name}' และปรับค่า Settings อัตโนมัติแล้ว`);
  };

  const toggleSettingFromQR = (key: 'enableLotControl' | 'enableExpiryDate' | 'enableSerialControl') => {
    if (!settings || !onUpdateSettings) return;
    const newVal = !settings[key];
    onUpdateSettings({
      ...settings,
      [key]: newVal
    });
    showToast(`⚙️ ปรับ Settings ${key}: ${newVal ? 'ON (เปิด)' : 'OFF (ปิด)'}`);
  };

  const handleOpenAddModal = () => {
    const newProf: QRCodeProfile = {
      id: `qr-custom-${Date.now()}`,
      name: `Custom Format ${localProfiles.length + 1}`,
      description: 'รูปแบบ QR Code กำหนดเอง',
      delimiter: ',',
      exampleString: 'I00004,LOT99,2026-12-31,10',
      stripQuotes: true,
      trimSpaces: true,
      isDefault: false,
      fields: [
        { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
        { position: 1, fieldName: 'lot_number', label: 'Lot Number' },
        { position: 2, fieldName: 'expiry_date', label: 'Expiry Date' },
        { position: 3, fieldName: 'quantity', label: 'Quantity' }
      ]
    };
    setEditingProfile(newProf);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: QRCodeProfile) => {
    setEditingProfile(JSON.parse(JSON.stringify(profile)));
    setIsModalOpen(true);
  };

  const handleDeleteProfile = (id: string) => {
    if (localProfiles.length <= 1) {
      showToast("⚠️ ต้องมีอย่างน้อย 1 QR Profile ในระบบ");
      return;
    }
    const updated = localProfiles.filter(p => p.id !== id);
    const newActiveId = activeProfileId === id ? updated[0].id : activeProfileId;
    setLocalProfiles(updated);
    onSaveProfiles(updated, newActiveId);
    setTestSelectedProfileId(newActiveId);
    showToast("🗑️ ลบ QR Profile สำเร็จ");
  };

  const handleDuplicateProfile = (profile: QRCodeProfile) => {
    const duplicated: QRCodeProfile = {
      ...JSON.parse(JSON.stringify(profile)),
      id: `qr-copy-${Date.now()}`,
      name: `${profile.name} (คัดลอก)`,
      isDefault: false
    };
    const updated = [...localProfiles, duplicated];
    setLocalProfiles(updated);
    onSaveProfiles(updated, activeProfileId);
    showToast(`📋 คัดลอก Profile '${profile.name}' สำเร็จ`);
  };

  const handleResetToDefaults = () => {
    const defaultActiveId = DEFAULT_QR_PROFILES[1].id;
    setLocalProfiles(DEFAULT_QR_PROFILES);
    onSaveProfiles(DEFAULT_QR_PROFILES, defaultActiveId);
    setTestSelectedProfileId(defaultActiveId);
    showToast("🔄 รีเซ็ตเป็นค่าเริ่มต้นทั้ง 5 รูปแบบเรียบร้อยแล้ว");
  };

  const handleSaveModalProfile = () => {
    if (!editingProfile) return;
    if (!editingProfile.name.trim()) {
      showToast("⚠️ กรุณาระบุชื่อ Profile");
      return;
    }

    const existingIndex = localProfiles.findIndex(p => p.id === editingProfile.id);
    let updated: QRCodeProfile[];
    if (existingIndex >= 0) {
      updated = [...localProfiles];
      updated[existingIndex] = editingProfile;
    } else {
      updated = [...localProfiles, editingProfile];
    }

    setLocalProfiles(updated);
    onSaveProfiles(updated, activeProfileId);
    setIsModalOpen(false);
    showToast(`💾 บันทึก QR Profile '${editingProfile.name}' เรียบร้อยแล้ว`);
  };

  // Field manipulation in Modal
  const handleAddField = () => {
    if (!editingProfile) return;
    const newPos = editingProfile.fields.length;
    const newFields: QRFieldMapping[] = [
      ...editingProfile.fields,
      { position: newPos, fieldName: 'remark', label: `Field ${newPos + 1}` }
    ];
    setEditingProfile({ ...editingProfile, fields: newFields });
  };

  const handleRemoveField = (index: number) => {
    if (!editingProfile) return;
    const newFields = editingProfile.fields
      .filter((_, i) => i !== index)
      .map((f, i) => ({ ...f, position: i }));
    setEditingProfile({ ...editingProfile, fields: newFields });
  };

  const handleUpdateFieldType = (index: number, type: QRFieldType) => {
    if (!editingProfile) return;
    const opt = QR_FIELD_OPTIONS.find(o => o.value === type);
    const newFields = [...editingProfile.fields];
    newFields[index] = {
      ...newFields[index],
      fieldName: type,
      label: opt ? opt.label.split(' ')[0] : type
    };
    setEditingProfile({ ...editingProfile, fields: newFields });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto relative font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-fade-in border border-slate-700">
          {toastMsg}
        </div>
      )}

      {/* Screen Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden mb-4 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <QrCode className="w-5 h-5 text-yellow-300" />
                <h2 className="text-base font-black uppercase tracking-tight">QR CODE SETTINGS</h2>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">ตั้งค่าโครงสร้างและตัวตัดคำ QR Code แต่ละสาขา</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-3 py-2 rounded-2xl text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่ม</span>
          </button>
        </div>

        {/* Current Active Banner */}
        <div className="mt-3.5 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-blue-100 uppercase">ใช้งานอยู่:</span>
            <span className="font-black text-white truncate max-w-[160px]">{currentActiveProfile.name}</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[10px] rounded-full uppercase">
            ACTIVE
          </span>
        </div>
      </div>

      {/* INSPECTION RULES SYNC CARD */}
      {settings && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 mb-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>การตรวจเช็คที่เชื่อมโยงกับ Settings (ติ๊กถูกอัตโนมัติ)</span>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              AUTO-SYNC
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
            เมื่อเลือกหรือบันทึกโครงสร้าง QR Code ระบบจะปรับติ๊กถูกในหน้า Setting ให้อัตโนมัติตามฟิลด์ที่เลือกตรวจเช็ค:
          </p>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">🏷️ ตรวจเช็ค Lot Number (Lot Control)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableLotControl}
                onChange={() => toggleSettingFromQR('enableLotControl')}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">📅 ตรวจเช็ค Expiry Date (วันหมดอายุ)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableExpiryDate}
                onChange={() => toggleSettingFromQR('enableExpiryDate')}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/80 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">🔢 ตรวจเช็ค Serial Control (หมายเลขซีเรียล)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSerialControl}
                onChange={() => toggleSettingFromQR('enableSerialControl')}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* 1. INTERACTIVE LIVE QR SIMULATOR & TEST SANDBOX */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border-2 border-indigo-100 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wider">
            <Play className="w-4 h-4" />
            <span>ทดสอบจำลองการสแกน (QR Simulator)</span>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
            REALTIME
          </span>
        </div>

        {/* Quick Test Samples (4 formats from user request) */}
        <p className="text-[11px] text-slate-500 mb-2 font-medium">กดปุ่มตัวอย่าง 4 รูปแบบตามโจทย์เพื่อทดสอบทันที:</p>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button
            onClick={() => {
              setTestRawString('I00001');
              setTestSelectedProfileId('qr-single-item');
              showToast("ตัวอย่าง: 1. Item (รหัสเดี่ยว)");
            }}
            className="text-left text-[11px] p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all font-mono truncate"
          >
            <span className="font-bold text-blue-600">1. Item:</span> <span className="text-slate-700">I00001</span>
          </button>

          <button
            onClick={() => {
              setTestRawString('I00001;Sample Motor;SN-2026-9988');
              setTestSelectedProfileId('qr-item-desc-serial');
              showToast("ตัวอย่าง: 2. Item;Description;Serial");
            }}
            className="text-left text-[11px] p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all font-mono truncate"
          >
            <span className="font-bold text-indigo-600">2. Item;Desc;SN</span>
          </button>

          <button
            onClick={() => {
              setTestRawString('I00002,LOT-AUG-01,2026-12-31,25');
              setTestSelectedProfileId('qr-item-lot-exp-qty');
              showToast("ตัวอย่าง: 3. Item,lot,expiry date,qty");
            }}
            className="text-left text-[11px] p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all font-mono truncate"
          >
            <span className="font-bold text-emerald-600">3. Item,Lot,Exp,Qty</span>
          </button>

          <button
            onClick={() => {
              setTestRawString('I00003,BATCH-2026-X');
              setTestSelectedProfileId('qr-item-lot');
              showToast("ตัวอย่าง: 4. Item,lot");
            }}
            className="text-left text-[11px] p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all font-mono truncate"
          >
            <span className="font-bold text-purple-600">4. Item,Lot</span>
          </button>
        </div>

        {/* Test Raw String Input */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            ข้อความจาก QR Code (Raw String):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testRawString}
              onChange={(e) => setTestRawString(e.target.value)}
              placeholder="ลองพิมพ์หรือสแกนข้อความ QR Code..."
              className="flex-1 px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            />
            <button
              onClick={() => setTestRawString('')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              ล้าง
            </button>
          </div>
        </div>

        {/* Profile used for testing */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 text-xs">
          <span className="text-slate-600 font-bold text-[11px]">ใช้ Profile ทดสอบ:</span>
          <select
            value={testSelectedProfileId}
            onChange={(e) => setTestSelectedProfileId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden"
          >
            {localProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Live Parse Results Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PARSED OUTPUT ({testParseResult.extractedFields.length} ฟิลด์)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Delimiter: '{testProfile.delimiter || 'None'}'
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Item Code</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {testParseResult.itemCode || '-'}
              </span>
            </div>

            <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Item Description</span>
              <span className="font-mono font-bold text-blue-300 text-xs truncate block">
                {testParseResult.itemName || '-'}
              </span>
            </div>

            <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Serial Number</span>
              <span className="font-mono font-bold text-purple-300 text-xs">
                {testParseResult.serialNumber || '-'}
              </span>
            </div>

            <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Lot Number</span>
              <span className="font-mono font-bold text-emerald-300 text-xs">
                {testParseResult.lotNumber || '-'}
              </span>
            </div>

            <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Expiry Date</span>
              <span className="font-mono font-bold text-rose-300 text-xs">
                {testParseResult.expiryDate || '-'}
              </span>
            </div>

            <div className="bg-slate-800/90 p-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Quantity</span>
              <span className="font-mono font-black text-yellow-300 text-sm">
                {testParseResult.quantity !== undefined ? testParseResult.quantity : '1 (Default)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIST OF CONFIGURED QR PROFILES */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>รายการ QR Profiles ทั้งหมด ({localProfiles.length})</span>
          </h3>

          <button
            onClick={handleResetToDefaults}
            className="text-[11px] text-slate-500 hover:text-blue-600 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>รีเซ็ตมาตรฐาน</span>
          </button>
        </div>

        {localProfiles.map((profile, idx) => {
          const isActive = profile.id === activeProfileId;

          return (
            <div
              key={profile.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{profile.name}</span>
                    {isActive && (
                      <span className="bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{profile.description}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(profile)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicateProfile(profile)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="คัดลอก"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Format Badge and Field Order Pills */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5 font-bold font-mono">
                  <span>ตัวคั่น (Delimiter): <span className="text-blue-600 font-black">{profile.delimiter === '' ? 'None (รหัสเดี่ยว)' : `[ ${profile.delimiter} ]`}</span></span>
                  <span className="text-[10px] text-slate-400">{profile.fields.length} ฟิลด์</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {profile.fields.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs font-mono"
                    >
                      <span className="text-blue-600 font-extrabold">{f.position + 1}.</span>
                      <span>{f.label}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-2 text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded-md border border-slate-200 truncate">
                  <span className="font-bold text-slate-400">ตัวอย่าง: </span>
                  <span className="text-slate-800">{profile.exampleString}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isActive ? (
                  <button
                    onClick={() => handleSetActive(profile.id)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>เลือกใช้งาน Profile นี้</span>
                  </button>
                ) : (
                  <div className="flex-1 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>กำลังใช้งานในหน้าสแกน</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setTestRawString(profile.exampleString);
                    setTestSelectedProfileId(profile.id);
                    showToast(`โหลดตัวอย่างของ '${profile.name}' ลงใน Simulator แล้ว`);
                  }}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>ทดสอบ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL FOR ADD / EDIT QR PROFILE */}
      {isModalOpen && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl p-5 shadow-2xl max-w-md w-full z-10 max-h-[90vh] overflow-y-auto border border-slate-100">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              <span>{editingProfile.id.startsWith('qr-custom-') ? 'เพิ่ม QR Profile ใหม่' : 'แก้ไข QR Profile'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Profile Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ Profile:</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  placeholder="เช่น สาขา A (Item,Lot,Exp,Qty)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบาย:</label>
                <input
                  type="text"
                  value={editingProfile.description}
                  onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                  placeholder="เช่น สแกน QR หน้ากล่องคั่นด้วยคอมม่า"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Delimiter Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ตัวคั่นข้อมูล (Delimiter):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '; (Semi-colon)', value: ';' },
                    { label: ', (Comma)', value: ',' },
                    { label: '| (Pipe)', value: '|' },
                    { label: 'None (รหัสเดี่ยว)', value: '' }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setEditingProfile({ ...editingProfile, delimiter: item.value })}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        editingProfile.delimiter === item.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Example string */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ตัวอย่างข้อความ QR (Example String):</label>
                <input
                  type="text"
                  value={editingProfile.exampleString}
                  onChange={(e) => setEditingProfile({ ...editingProfile, exampleString: e.target.value })}
                  placeholder="I00001;Item Name;SN1234"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Field Sequence Mapping Builder */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                    ลำดับฟิลด์ของข้อมูล ({editingProfile.fields.length} ฟิลด์):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มฟิลด์</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editingProfile.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <select
                        value={field.fieldName}
                        onChange={(e) => handleUpdateFieldType(idx, e.target.value as QRFieldType)}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden"
                      >
                        {QR_FIELD_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        disabled={editingProfile.fields.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveModalProfile}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95"
              >
                บันทึก Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
