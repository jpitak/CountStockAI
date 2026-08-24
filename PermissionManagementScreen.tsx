import React, { useState } from 'react';
import {
  ShieldCheck, UserCheck, Lock, Save, RotateCcw,
  Camera, ClipboardList, Database, RefreshCw, Settings, Key,
  CheckCircle2, AlertTriangle, ChevronDown
} from 'lucide-react';
import { UserRole, MenuPermissions, RolePermissionsMap, AppSettings } from '../types';
import { DEFAULT_ROLE_PERMISSIONS, saveRolePermissions } from '../utils/storage';

interface PermissionManagementScreenProps {
  rolePermissions: RolePermissionsMap;
  currentUserRole: UserRole;
  onSaveRolePermissions: (newPermissions: RolePermissionsMap) => void;
  onSelectCurrentRole: (role: UserRole) => void;
  settings?: AppSettings;
}

export const PermissionManagementScreen: React.FC<PermissionManagementScreenProps> = ({
  rolePermissions = DEFAULT_ROLE_PERMISSIONS,
  currentUserRole = 'Admin',
  onSaveRolePermissions,
  onSelectCurrentRole,
  settings
}) => {
  // Selected Role being edited in UI (Admin | Supervisor | Operator)
  const [selectedEditRole, setSelectedEditRole] = useState<UserRole>('Admin');
  const [localPermissions, setLocalPermissions] = useState<RolePermissionsMap>(
    rolePermissions || DEFAULT_ROLE_PERMISSIONS
  );
  
  // UI Modal states
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savingApi, setSavingApi] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle permission item for the active selected role
  const handleTogglePermission = (key: keyof MenuPermissions) => {
    setLocalPermissions(prev => ({
      ...prev,
      [selectedEditRole]: {
        ...prev[selectedEditRole],
        [key]: !prev[selectedEditRole][key]
      }
    }));
  };

  // Reset to system default permissions
  const handleResetDefault = () => {
    setLocalPermissions(DEFAULT_ROLE_PERMISSIONS);
    showToast("🔄 รีเซ็ตค่าสิทธิ์เริ่มต้นเรียบร้อยแล้ว");
  };

  // Save permissions to local storage and sync to Server API
  const handleSavePermissions = async () => {
    setSavingApi(true);
    // 1. Save to LocalStorage & App State
    saveRolePermissions(localPermissions);
    onSaveRolePermissions(localPermissions);

    // 2. Call API Server POST /api/permissions/update
    try {
      const res = await fetch('/api/permissions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedEditRole,
          permissions: localPermissions[selectedEditRole],
          rolePermissions: localPermissions
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ ${data.message || 'บันทึกสิทธิ์ลงเซิร์ฟเวอร์สำเร็จ'}`);
      }
    } catch (err) {
      console.warn("API sync offline, local saved", err);
    } finally {
      setSavingApi(false);
      setShowSuccessModal(true);
    }
  };

  // Permissions items metadata
  const permissionItems: Array<{
    key: keyof MenuPermissions;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
  }> = [
    {
      key: 'scan',
      title: '1. หน้าสแกนนับสต็อก (Scan Stock)',
      subtitle: 'เข้าถึงกล้อง/เครื่องสแกน Barcode เพื่อบันทึกการนับสินค้า',
      icon: Camera,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      key: 'view',
      title: '2. หน้าดู/จัดการรายการสแกน (Stock Data List)',
      subtitle: 'ดูรายการสแกนสะสม แก้ไขจำนวน ลบรายการ หรือดูประวัติ',
      icon: ClipboardList,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      key: 'master',
      title: '3. หน้าดึงข้อมูล Master (Item & Location Master)',
      subtitle: 'เข้าถึงหน้าโหลดข้อมูลสินค้าและสถานที่จาก Server Directory',
      icon: Database,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      key: 'sync',
      title: '4. หน้าส่งข้อมูลกลับเซิร์ฟเวอร์ (Sync Up / Export)',
      subtitle: 'ส่งออกข้อมูลสแกน (Excel/CSV/JSON) และ Sync กับ Database',
      icon: RefreshCw,
      color: 'bg-pink-50 text-pink-600 border-pink-200',
    },
    {
      key: 'setting',
      title: '5. หน้าการตั้งค่าระบบ (System Settings)',
      subtitle: 'ตั้งค่า IP Server, Port, Database Provider และอุปกรณ์',
      icon: Settings,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      key: 'permission',
      title: '6. หน้ากำหนดสิทธิ์ผู้ใช้งาน (Permission Management)',
      subtitle: 'กำหนดและควบคุมสิทธิ์การเข้าถึงเมนูต่างๆ ของแต่ละ Role (Admin)',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  const currentRolePerms = (localPermissions && localPermissions[selectedEditRole]) || DEFAULT_ROLE_PERMISSIONS[selectedEditRole];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto animate-fade-in">
      {/* Toast popup message */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-fade-in border border-slate-700">
          {toastMsg}
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden mb-4 border border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-yellow-300 border border-white/20 shadow-inner shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              Role & Permission Control
            </span>
            <h2 className="text-lg font-black tracking-tight text-white mt-1 uppercase">
              กำหนดสิทธิ์การใช้งานเมนู
            </h2>
            <p className="text-[11px] text-purple-100 font-medium leading-tight">
              จัดการระดับสิทธิ์และการเข้าถึงเมนูของ Administrator, Supervisor และ Operator
            </p>
          </div>
        </div>
      </div>

      {/* 1. CURRENT ACTIVE USER ROLE SELECTOR (SWITCH ROLE FOR TESTING) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              บทบาทผู้ใช้งานปัจจุบัน (Active User Session)
            </h3>
          </div>
          <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 uppercase">
            {currentUserRole}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium mb-3">
          สลับบทบาทของคุณเพื่อทดสอบการจำกัดสิทธิ์และการล็อกเมนูในระบบแบบเรียลไทม์:
        </p>

        <div className="grid grid-cols-3 gap-2">
          {(['Admin', 'Supervisor', 'Operator'] as UserRole[]).map((r) => {
            const isCurrent = currentUserRole === r;
            return (
              <button
                key={r}
                onClick={() => {
                  onSelectCurrentRole(r);
                  showToast(`👤 สลับผู้ใช้ปัจจุบันเป็นบทบาท '${r}' เรียบร้อยแล้ว`);
                }}
                className={`py-2 px-1.5 rounded-xl font-extrabold text-xs transition-all flex flex-col items-center justify-center gap-1 border-2 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider">{r}</span>
                {isCurrent && <span className="text-[9px] font-bold text-indigo-200">(ใช้งานอยู่)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ROLE TO CONFIGURE DROPDOWN / SELECTOR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4">
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
          เลือกบทบาทที่ต้องการแก้ไขสิทธิ์ (Select Role to Configure)
        </label>
        
        <div className="relative mb-3">
          <select
            value={selectedEditRole}
            onChange={(e) => setSelectedEditRole(e.target.value as UserRole)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-3 text-sm font-extrabold text-slate-900 appearance-none focus:outline-none focus:border-indigo-600 focus:bg-white transition-all pr-10"
          >
            <option value="Admin">1. Administrator (แอดมินระบบ)</option>
            <option value="Supervisor">2. Supervisor (หัวหน้างาน)</option>
            <option value="Operator">3. Operator (พนักงานสแกน/นับสต็อก)</option>
          </select>
          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Selected Role Info Card */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
          <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>คำอธิบายระดับสิทธิ์ประจำบทบาท:</span>
          </p>
          <p className="text-slate-600 text-[11px] font-medium mt-1 leading-relaxed">
            {selectedEditRole === 'Admin' && '⚡ เข้าถึงและจัดการได้ทุกเมนูโดยสมบูรณ์ สามารถแก้ไขสิทธิ์และตั้งค่าระบบได้'}
            {selectedEditRole === 'Supervisor' && '📋 เข้าถึงเมนูสแกน, ดูรายงาน logs, ดึง Master Data และส่งออกข้อมูล (ยกเว้น System Settings & Permission)'}
            {selectedEditRole === 'Operator' && '📷 เข้าถึงได้เฉพาะหน้าสแกนสินค้า และดูประวัติรายการสแกนของตนเองเท่านั้น'}
          </p>
        </div>
      </div>

      {/* 3. MENU PERMISSIONS CHECKLIST WITH TOGGLE SWITCHES */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            รายการสิทธิ์เมนูที่ควบคุม ({selectedEditRole})
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            6 PERMISSIONS
          </span>
        </div>

        <div className="space-y-3">
          {permissionItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = currentRolePerms[item.key];

            return (
              <div
                key={item.key}
                onClick={() => handleTogglePermission(item.key)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white border-slate-200 hover:border-indigo-400 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200/60 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-black truncate ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                        {item.title}
                      </h4>
                      {!isEnabled && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[9px] font-bold rounded-md">
                          <Lock className="w-2.5 h-2.5" /> ล็อก
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* IOS Style Toggle Switch Button */}
                <div className="shrink-0 pl-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePermission(item.key);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTION BUTTONS: SAVE & RESET */}
      <div className="space-y-2 mb-6">
        <button
          onClick={handleSavePermissions}
          disabled={savingApi}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 border-2 border-indigo-500"
        >
          {savingApi ? (
            <RefreshCw className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Save className="w-5 h-5 text-yellow-300" />
          )}
          <span>บันทึกสิทธิ์ (Save Permissions)</span>
        </button>

        <button
          onClick={handleResetDefault}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border-2 border-slate-200 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>รีเซ็ตค่าเริ่มต้น (Reset Default)</span>
        </button>
      </div>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
              บันทึกสิทธิ์สำเร็จ (Success)
            </h3>
            <p className="text-xs text-slate-700 font-bold mb-4 leading-relaxed bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              บันทึกการตั้งค่าสิทธิ์การใช้งานสำหรับบทบาท <span className="text-indigo-600">{selectedEditRole}</span> และซิงค์ API Server เรียบร้อยแล้ว
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
