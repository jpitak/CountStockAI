import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, CheckCircle2, ChevronDown, Trash2,
  Sparkles, QrCode, Sliders, X, Barcode, Zap, Check, AlertCircle,
  MapPin, Lock
} from 'lucide-react';
import {
  ItemMaster, LocationMaster, ScannedRecord, AppSettings,
  ItemStatus, QRCodeProfile, QRCodeParseResult
} from '../types';
import { DEFAULT_QR_PROFILES, autoDetectAndParseQRCode } from '../utils/qrParser';

interface ScanItemScreenProps {
  itemMaster: ItemMaster[];
  locationMaster: LocationMaster[];
  scannedRecords: ScannedRecord[];
  selectedLocationCode?: string;
  onSelectLocationCode?: (code: string) => void;
  onAddRecord: (record: ScannedRecord) => void;
  onDeleteRecord: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  qrProfiles?: QRCodeProfile[];
  activeQRProfileId?: string;
  onSelectActiveQRProfile?: (profileId: string) => void;
  onNavigateQRConfig?: () => void;
}

export const ScanItemScreen: React.FC<ScanItemScreenProps> = ({
  itemMaster,
  locationMaster,
  scannedRecords,
  selectedLocationCode,
  onSelectLocationCode,
  onAddRecord,
  onDeleteRecord,
  settings,
  onUpdateSettings,
  qrProfiles = DEFAULT_QR_PROFILES,
  activeQRProfileId = 'auto',
  onSelectActiveQRProfile,
  onNavigateQRConfig
}) => {
  // Persistent Target Location State (Defaults to prop or L01, remains locked across sessions until changed)
  const [selectedLocCode, setSelectedLocCode] = useState<string>(
    selectedLocationCode || locationMaster[0]?.LocationCode || 'L01'
  );
  const [status, setStatus] = useState<ItemStatus>('NORMAL');
  const [itemCodeInput, setItemCodeInput] = useState<string>('');
  const [lotNumberInput, setLotNumberInput] = useState<string>('');
  const [expiryDateInput, setExpiryDateInput] = useState<string>('');
  const [serialNumberInput, setSerialNumberInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>(settings.defaultQuantity?.toString() || '1');
  const [remarkInput, setRemarkInput] = useState<string>('');

  // Auto Count on Scan Toggle (Strictly reflects settings.autoIncrementQuantity)
  const [autoCountOnScan, setAutoCountOnScan] = useState<boolean>(settings.autoIncrementQuantity ?? true);

  // Sync autoCountOnScan with settings.autoIncrementQuantity
  useEffect(() => {
    setAutoCountOnScan(settings.autoIncrementQuantity ?? true);
  }, [settings.autoIncrementQuantity]);

  const handleToggleAutoCount = () => {
    const newVal = !autoCountOnScan;
    setAutoCountOnScan(newVal);
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        autoIncrementQuantity: newVal
      });
    }
    showToast(`⚡ โหมด Auto Count +1: ${newVal ? 'เปิด (บันทึกอัตโนมัติทันที)' : 'ปิด (ตรวจสอบก่อนบันทึก)'}`);
  };

  // Modal / Selector States
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [currentProfileId, setCurrentProfileId] = useState<string>(activeQRProfileId || 'auto');
  const [lastParsedResult, setLastParsedResult] = useState<QRCodeParseResult | null>(null);

  // Warning Modal State for Out-of-Master items
  const [warningItemCode, setWarningItemCode] = useState<string | null>(null);
  const [pendingParsedResult, setPendingParsedResult] = useState<QRCodeParseResult | null>(null);

  // Camera & Feedback
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const itemInputRef = useRef<HTMLInputElement>(null);
  const lotInputRef = useRef<HTMLInputElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync selected location if external prop changes
  useEffect(() => {
    if (selectedLocationCode) {
      setSelectedLocCode(selectedLocationCode);
    }
  }, [selectedLocationCode]);

  // Auto-focus and auto-select Item Code input on mount and screen display
  useEffect(() => {
    const timer = setTimeout(() => {
      if (itemInputRef.current) {
        itemInputRef.current.focus();
        itemInputRef.current.select();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const selectedLocation = locationMaster.find(l => l.LocationCode === selectedLocCode) || {
    LocationCode: selectedLocCode || 'L01',
    LocationName: locationMaster.find(l => l.LocationCode === selectedLocCode)?.LocationName || 'Marketing Department'
  };

  const activeProfile = qrProfiles.find(p => p.id === currentProfileId) || qrProfiles[0] || DEFAULT_QR_PROFILES[0];

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Sync profile ID if prop changes
  useEffect(() => {
    if (activeQRProfileId) {
      setCurrentProfileId(activeQRProfileId);
    }
  }, [activeQRProfileId]);

  // Handle Profile Switch & Synchronize Settings with QR Inspection Fields
  const handleProfileChange = (profileId: string) => {
    setCurrentProfileId(profileId);
    if (onSelectActiveQRProfile) {
      onSelectActiveQRProfile(profileId);
    }
    const found = qrProfiles.find(p => p.id === profileId);
    if (found) {
      const hasLot = found.fields.some(f => f.fieldName === 'lot_number');
      const hasExpiry = found.fields.some(f => f.fieldName === 'expiry_date');
      const hasSerial = found.fields.some(f => f.fieldName === 'serial_number');

      const newSettings: AppSettings = {
        ...settings,
        enableLotControl: hasLot,
        enableExpiryDate: hasExpiry,
        enableSerialControl: hasSerial
      };

      if (onUpdateSettings) {
        onUpdateSettings(newSettings);
      }

      // Clear input fields when turning off inspection
      if (!hasLot) setLotNumberInput('');
      if (!hasExpiry) setExpiryDateInput('');
      if (!hasSerial) setSerialNumberInput('');

      showToast(`🔲 สลับรูปแบบ: ${found.name} (ตั้งค่า: Lot=${hasLot ? 'ON' : 'OFF'}, Exp=${hasExpiry ? 'ON' : 'OFF'}, Serial=${hasSerial ? 'ON' : 'OFF'})`);
    }
  };

  // Toggle single inspection rule directly from Scan Screen
  const toggleInspectionSetting = (key: 'enableLotControl' | 'enableExpiryDate' | 'enableSerialControl') => {
    const newVal = !settings[key];
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        [key]: newVal
      });
    }
    showToast(`⚙️ ปรับสถานะ ${key === 'enableLotControl' ? 'Lot Control' : key === 'enableExpiryDate' ? 'Expiry Date' : 'Serial Control'}: ${newVal ? 'เปิด (ON)' : 'ปิด (OFF)'}`);
  };

  // Location Selector Handler (Locks until user changes again)
  const handleLocationSelect = (locCode: string) => {
    setSelectedLocCode(locCode);
    if (onSelectLocationCode) {
      onSelectLocationCode(locCode);
    }
    setShowLocationModal(false);
    showToast(`📍 ล็อกสถานที่ตรวจนับ: ${locCode}`);
  };

  /**
   * Save record directly with precise parameters
   * Fully supports all 10 inspection combinations (Item, Lot, Expiry Date, Serial, Qty)
   */
  const processSaveRecord = (
    code: string,
    inMaster: boolean,
    masterObj?: ItemMaster,
    parseRes?: QRCodeParseResult | null
  ) => {
    // 1. Extract Lot Number (manual input takes priority if present, otherwise from QR parse result)
    let finalLot = '-';
    if (lotNumberInput && lotNumberInput.trim() !== '' && lotNumberInput.trim() !== '-') {
      finalLot = lotNumberInput.trim();
    } else if (parseRes?.lotNumber && parseRes.lotNumber.trim() !== '') {
      finalLot = parseRes.lotNumber.trim();
    }

    // 2. Extract Expiry Date (manual input takes priority if present, otherwise from QR parse result)
    let finalExp = '-';
    if (expiryDateInput && expiryDateInput.trim() !== '' && expiryDateInput.trim() !== '-') {
      finalExp = expiryDateInput.trim();
    } else if (parseRes?.expiryDate && parseRes.expiryDate.trim() !== '') {
      finalExp = parseRes.expiryDate.trim();
    }

    // 3. Extract Serial Number (manual input takes priority if present, otherwise from QR parse result)
    let finalSerial = '-';
    if (serialNumberInput && serialNumberInput.trim() !== '' && serialNumberInput.trim() !== '-') {
      finalSerial = serialNumberInput.trim();
    } else if (parseRes?.serialNumber && parseRes.serialNumber.trim() !== '') {
      finalSerial = parseRes.serialNumber.trim();
    }

    // 4. Quantity Calculation:
    // Rule 10: If Serial Control is enabled or a Serial Number was detected/scanned, Quantity is ALWAYS strictly 1
    const isSerialMode = settings.enableSerialControl || (finalSerial !== '-' && finalSerial !== '');
    let finalQty = 1;
    if (isSerialMode) {
      finalQty = 1;
    } else if (parseRes?.quantity !== undefined && parseRes.quantity > 0) {
      finalQty = parseRes.quantity;
    } else {
      finalQty = parseInt(quantityInput, 10) || 1;
    }

    const finalRemark = (parseRes?.remark !== undefined ? parseRes.remark : remarkInput).trim();

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    const newRecord: ScannedRecord = {
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      CompanyCode: settings.companyCode,
      BranchCode: settings.branchCode,
      InventoryPeriod: settings.inventoryPeriod,
      Department: settings.department,
      LocationCode: selectedLocation.LocationCode,
      LocationName: selectedLocation.LocationName,
      ItemCode: code,
      ItemName: masterObj ? masterObj.ItemName : (parseRes?.itemName || (inMaster ? code : '-')),
      Barcode: masterObj ? masterObj.Barcode : code,
      LotNumber: finalLot,
      ExpiryDate: finalExp,
      SerialNumber: finalSerial,
      QuantityScan: finalQty,
      QuantityPlan: masterObj ? (masterObj.QuantityPlan || 0) : 0,
      Status: status,
      InMaster: inMaster,
      Remark: finalRemark,
      ScannedBy: settings.username || 'Admin',
      ScanDate: dateStr,
      ScanTime: timeStr,
      Timestamp: now.getTime(),
      Synced: false
    };

    onAddRecord(newRecord);

    // Reset inputs
    if (settings.autoClearItemCode) {
      setItemCodeInput('');
    } else {
      setItemCodeInput(code);
    }
    setLotNumberInput('');
    setExpiryDateInput('');
    setSerialNumberInput('');
    setQuantityInput(isSerialMode ? '1' : (settings.defaultQuantity?.toString() || '1'));
    setRemarkInput('');
    setLastParsedResult(null);
    setWarningItemCode(null);
    setPendingParsedResult(null);

    // Rule 10: Auto Refocus and SELECT item input so next scan immediately replaces/inputs
    setTimeout(() => {
      if (itemInputRef.current) {
        itemInputRef.current.focus();
        itemInputRef.current.select();
      }
    }, 30);
  };

  /**
   * Parse Raw QR Code / Barcode String and auto-save/count immediately if all required fields are satisfied
   * Extracts fields strictly according to enabled settings
   */
  const processRawScanData = (rawText: string, shouldAutoSave?: boolean) => {
    if (!rawText || !rawText.trim()) return;

    const trimmed = rawText.trim();
    // Parse using intelligent auto-detect and active profile
    const parseRes = autoDetectAndParseQRCode(trimmed, qrProfiles, currentProfileId);
    setLastParsedResult(parseRes);

    const extractedItemCode = (parseRes.itemCode || trimmed).trim();
    setItemCodeInput(extractedItemCode);

    // Populate input state from QR scan result
    const extractedLot = (parseRes.lotNumber !== undefined && parseRes.lotNumber !== '') ? parseRes.lotNumber.trim() : '';
    const extractedExp = (parseRes.expiryDate !== undefined && parseRes.expiryDate !== '') ? parseRes.expiryDate.trim() : '';
    const extractedSerial = (parseRes.serialNumber !== undefined && parseRes.serialNumber !== '') ? parseRes.serialNumber.trim() : '';

    setLotNumberInput(extractedLot);
    setExpiryDateInput(extractedExp);
    setSerialNumberInput(extractedSerial);

    // Rule 10: If serial control is active or serial number detected, lock quantity to 1
    if (settings.enableSerialControl || extractedSerial !== '') {
      setQuantityInput('1');
    } else if (parseRes.quantity !== undefined && parseRes.quantity > 0) {
      setQuantityInput(parseRes.quantity.toString());
    }

    if (parseRes.remark !== undefined) {
      setRemarkInput(parseRes.remark);
    }

    // CHECK MISSING REQUIRED FIELDS ACCORDING TO SETTINGS:
    // 1. If Lot Control is active but QR had no lot -> STOP auto-save and Focus Lot Input
    if (settings.enableLotControl && !extractedLot) {
      showToast(`📌 สแกนรหัสสินค้าแล้ว: กรุณากรอกหรือสแกน Lot Number`);
      setTimeout(() => {
        if (lotInputRef.current) {
          lotInputRef.current.focus();
          lotInputRef.current.select();
        }
      }, 50);
      return;
    }

    // 2. If Expiry Date is active but QR had no expiry date -> STOP auto-save and Focus Expiry Input
    if (settings.enableExpiryDate && !extractedExp) {
      showToast(`📌 สแกนรหัสสินค้าแล้ว: กรุณากรอกหรือสแกน Expiry Date`);
      setTimeout(() => {
        if (expiryInputRef.current) {
          expiryInputRef.current.focus();
          expiryInputRef.current.select();
        }
      }, 50);
      return;
    }

    // 3. If Serial Control is active but QR had no serial number -> STOP auto-save and Focus Serial Input
    if (settings.enableSerialControl && !extractedSerial) {
      showToast(`📌 สแกนรหัส${extractedLot ? ` & Lot [${extractedLot}]` : ''}แล้ว: กรุณากรอกหรือสแกน Serial Number`);
      setTimeout(() => {
        if (serialInputRef.current) {
          serialInputRef.current.focus();
          serialInputRef.current.select();
        }
      }, 50);
      return;
    }

    // If ALL required fields are satisfied:
    const willAutoSave = shouldAutoSave !== undefined 
      ? shouldAutoSave 
      : (settings.autoIncrementQuantity || autoCountOnScan || settings.enableSerialControl);

    if (willAutoSave && extractedItemCode) {
      // Find matching item in master data
      const foundMaster = itemMaster.find(
        i => i.ItemCode.toLowerCase() === extractedItemCode.toLowerCase() || 
             i.Barcode.toLowerCase() === extractedItemCode.toLowerCase() ||
             (i.Barcode2 && i.Barcode2.toLowerCase() === extractedItemCode.toLowerCase())
      );

      if (!foundMaster && settings.confirmOutMaster) {
        setWarningItemCode(extractedItemCode);
        setPendingParsedResult(parseRes);
      } else {
        processSaveRecord(extractedItemCode, !!foundMaster, foundMaster, parseRes);
      }
    } else {
      showToast(`✨ แยกฟิลด์ QR เรียบร้อย (${parseRes.extractedFields.length} ฟิลด์)`);
      // Select item input so user can scan next barcode directly
      setTimeout(() => {
        if (itemInputRef.current) {
          itemInputRef.current.focus();
          itemInputRef.current.select();
        }
      }, 30);
    }
  };

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const code = itemCodeInput.trim();
    if (!code) {
      showToast("⚠️ กรุณาสแกนหรือกรอก Item Code");
      setTimeout(() => {
        itemInputRef.current?.focus();
        itemInputRef.current?.select();
      }, 30);
      return;
    }

    // Check if code has delimiters and was not parsed yet
    if (code.includes(',') || code.includes(';') || code.includes('|')) {
      processRawScanData(code, true);
      return;
    }

    // Check required fields according to active Settings:
    if (settings.enableLotControl && (!lotNumberInput || lotNumberInput.trim() === '' || lotNumberInput.trim() === '-')) {
      showToast("⚠️ กรุณาระบุ Lot Number (จำเป็นต้องกรอกตามการตั้งค่า)");
      setTimeout(() => {
        lotInputRef.current?.focus();
        lotInputRef.current?.select();
      }, 50);
      return;
    }

    if (settings.enableExpiryDate && (!expiryDateInput || expiryDateInput.trim() === '' || expiryDateInput.trim() === '-')) {
      showToast("⚠️ กรุณาระบุ Expiry Date (จำเป็นต้องกรอกตามการตั้งค่า)");
      setTimeout(() => {
        expiryInputRef.current?.focus();
        expiryInputRef.current?.select();
      }, 50);
      return;
    }

    if (settings.enableSerialControl && (!serialNumberInput || serialNumberInput.trim() === '' || serialNumberInput.trim() === '-')) {
      showToast("⚠️ กรุณาระบุ Serial Number (จำเป็นต้องกรอกตามการตั้งค่า)");
      setTimeout(() => {
        serialInputRef.current?.focus();
        serialInputRef.current?.select();
      }, 50);
      return;
    }

    const foundMaster = itemMaster.find(
      i => i.ItemCode.toLowerCase() === code.toLowerCase() || 
           i.Barcode.toLowerCase() === code.toLowerCase() ||
           (i.Barcode2 && i.Barcode2.toLowerCase() === code.toLowerCase())
    );

    if (!foundMaster && settings.confirmOutMaster) {
      setWarningItemCode(code);
      setPendingParsedResult(lastParsedResult);
      return;
    }

    processSaveRecord(code, !!foundMaster, foundMaster, lastParsedResult);
  };

  // Camera Barcode Scanning Handler
  const handleToggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access failed", err);
        showToast("⚠️ ไม่สามารถเปิดกล้องได้ กรุณาอนุญาต Camera Permission");
        setIsCameraActive(false);
      }
    }
  };

  return (
    <div className="p-3 pb-24 max-w-md mx-auto relative animate-fade-in text-slate-800">
      {/* Realtime Toast Banner */}
      {feedbackMessage && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-bounce border border-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* QR CODE CONFIGURATION & AUTO-COUNT QUICK BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 shadow-lg mb-3 border border-indigo-700/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-blue-300 font-black uppercase tracking-wider block">
                QR CODE PROFILE
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[170px] block">
                {activeProfile.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onNavigateQRConfig && (
              <button
                type="button"
                onClick={onNavigateQRConfig}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-yellow-300 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all border border-white/10"
                title="ตั้งค่ารูปแบบ QR Code ทั้งหมด"
              >
                <Sliders className="w-3 h-3" />
                <span>ตั้งค่า QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10 mb-2">
          <span className="text-[10px] text-slate-300 font-mono font-bold whitespace-nowrap pl-1">รูปแบบ:</span>
          <select
            value={currentProfileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="flex-1 bg-slate-800 text-white text-[11px] font-bold rounded-lg px-2 py-1 border border-slate-700 focus:outline-hidden focus:border-blue-400"
          >
            {qrProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-Count on Scan Toggle & Increment Banner */}
        <div className="flex items-center justify-between bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${autoCountOnScan ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <div>
              <span className="text-[11px] font-extrabold text-white block leading-tight">
                สแกนแล้วนับทันที (Auto Count +1)
              </span>
              <span className="text-[9px] text-slate-400 block leading-tight">
                {autoCountOnScan ? 'นับและเพิ่มจำนวน (+1) อัตโนมัติเมื่อสแกน' : 'แยกฟิลด์ลงฟอร์มเพื่อตรวจสอบก่อนบันทึก'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoCount}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              autoCountOnScan ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                autoCountOnScan ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Quick 1-Click Format Test Buttons (Covering the 10 scan combinations requested by user) */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              ทดสอบ 10 รูปแบบการตรวจนับ (คลิกเพื่อนับทันที +1):
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => processRawScanData('8850123456789', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-blue-200 transition-all font-mono truncate flex items-center justify-between"
              title="1. item qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">1.</strong> 8850123456789</span>
              <span className="text-[8px] bg-blue-500/30 px-1 rounded text-blue-300 font-sans shrink-0">+1</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,L1', true)}
              className="text-left text-[10px] p-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-200 transition-all font-mono truncate flex items-center justify-between shadow-xs"
              title="2. item+lot qty (เช่น 8850123456789,L1)"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">2.</strong> 8850123456789,L1</span>
              <span className="text-[8px] bg-amber-500/40 px-1 rounded text-amber-300 font-sans shrink-0">+1 (Lot)</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,L1,2026-12-31,25', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-emerald-400/30 rounded-lg text-emerald-200 transition-all font-mono truncate flex items-center justify-between"
              title="3. item+lot+expiry Date qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">3.</strong> Item,Lot,Exp,Qty</span>
              <span className="text-[8px] bg-emerald-500/30 px-1 rounded text-emerald-300 font-sans shrink-0">+25</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,2026-12-31', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-emerald-200 transition-all font-mono truncate flex items-center justify-between"
              title="4. item+expiry qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">4.</strong> Item,Exp</span>
              <span className="text-[8px] bg-emerald-500/30 px-1 rounded text-emerald-300 font-sans shrink-0">+1</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,L1,2026-12-31', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-teal-200 transition-all font-mono truncate flex items-center justify-between"
              title="5. item lot +expiry Date qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">5.</strong> Item,Lot,Exp</span>
              <span className="text-[8px] bg-teal-500/30 px-1 rounded text-teal-300 font-sans shrink-0">+1</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,L1,SN99881', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-indigo-400/30 rounded-lg text-indigo-200 transition-all font-mono truncate flex items-center justify-between"
              title="6. item lot+serial qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">6.</strong> Item,Lot,Serial</span>
              <span className="text-[8px] bg-indigo-500/30 px-1 rounded text-indigo-300 font-sans shrink-0">+1 (SN)</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,2026-12-31,SN99881', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-purple-400/30 rounded-lg text-purple-200 transition-all font-mono truncate flex items-center justify-between"
              title="7. item expiry Date + serial qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">7.</strong> Item,Exp,Serial</span>
              <span className="text-[8px] bg-purple-500/30 px-1 rounded text-purple-300 font-sans shrink-0">+1 (SN)</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789,SN99881', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-indigo-400/30 rounded-lg text-indigo-200 transition-all font-mono truncate flex items-center justify-between"
              title="8. item+serial qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">8.</strong> Item,Serial</span>
              <span className="text-[8px] bg-indigo-500/30 px-1 rounded text-indigo-300 font-sans shrink-0">+1</span>
            </button>

            <button
              type="button"
              onClick={() => processRawScanData('8850123456789|L1|2026-12-31|SN99881|1', true)}
              className="text-left text-[10px] p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-rose-200 transition-all font-mono truncate flex items-center justify-between"
              title="9. item lot+expiry Date +serial qty"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">9.</strong> Full 5-Field Barcode</span>
              <span className="text-[8px] bg-rose-500/30 px-1 rounded text-rose-300 font-sans shrink-0">+1 (SN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!settings.enableSerialControl) {
                  toggleInspectionSetting('enableSerialControl');
                }
                processRawScanData('8850123456789', true);
              }}
              className="text-left text-[10px] p-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 rounded-lg text-indigo-100 transition-all font-mono truncate flex items-center justify-between"
              title="10. ตรวจหากติ๊ก serial auto +qty 1 auto select item"
            >
              <span className="truncate mr-1"><strong className="text-yellow-300">10.</strong> Serial Auto +1</span>
              <span className="text-[8px] bg-indigo-400 text-indigo-950 font-bold px-1 rounded shrink-0">Auto Next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Live Preview (When Camera active) */}
      {isCameraActive && (
        <div className="mb-3 rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-950 relative shadow-lg">
          <div className="relative aspect-4/3 w-full bg-slate-900 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-8 border-2 border-red-500 rounded-xl pointer-events-none flex flex-col justify-between p-2 animate-pulse">
              <div className="flex justify-between">
                <div className="w-3 h-3 border-t-2 border-l-2 border-red-400"></div>
                <div className="w-3 h-3 border-t-2 border-r-2 border-red-400"></div>
              </div>
              <div className="h-0.5 bg-red-500 w-full shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
              <div className="flex justify-between">
                <div className="w-3 h-3 border-b-2 border-l-2 border-red-400"></div>
                <div className="w-3 h-3 border-b-2 border-r-2 border-red-400"></div>
              </div>
            </div>
          </div>
          <div className="p-2 bg-slate-900 flex items-center justify-between text-xs text-white">
            <span className="font-bold text-[11px] text-yellow-300 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> กล้องสแกน Barcode/QR พร้อมใช้งาน
            </span>
            <button
              onClick={handleToggleCamera}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
            >
              ปิดกล้อง
            </button>
          </div>
        </div>
      )}

      {/* Top Status Radio Toggle (NORMAL / DAMAGE) */}
      <div className="flex items-center gap-6 mb-3 px-1 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-800">
          <input
            type="radio"
            name="statusToggle"
            checked={status === 'NORMAL'}
            onChange={() => setStatus('NORMAL')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className={status === 'NORMAL' ? 'text-blue-600 font-extrabold' : 'text-gray-700'}>
            NORMAL (ปกติ)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-800">
          <input
            type="radio"
            name="statusToggle"
            checked={status === 'DAMAGE'}
            onChange={() => setStatus('DAMAGE')}
            className="w-4 h-4 text-rose-600 focus:ring-rose-500"
          />
          <span className={status === 'DAMAGE' ? 'text-rose-600 font-extrabold' : 'text-gray-700'}>
            DAMAGE (ชำรุด)
          </span>
        </label>
      </div>

      {/* INSPECTION RULES CONTROL BAR (Strictly Sync with Settings) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-3 shadow-2xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            สถานะการตรวจเช็คตาม Settings:
          </span>
          {onNavigateQRConfig && (
            <button
              type="button"
              onClick={onNavigateQRConfig}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
            >
              <span>ตั้งค่าฟิลด์ QR</span>
              <ChevronDown className="w-3 h-3 -rotate-90" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => toggleInspectionSetting('enableLotControl')}
            className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-all ${
              settings.enableLotControl
                ? 'bg-amber-50 border-amber-400 text-amber-900 font-black shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
            title="คลิกเพื่อเปิด/ปิดการตรวจเช็ค Lot Control"
          >
            <span>🏷️ Lot</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${settings.enableLotControl ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {settings.enableLotControl ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggleInspectionSetting('enableExpiryDate')}
            className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-all ${
              settings.enableExpiryDate
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-black shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
            title="คลิกเพื่อเปิด/ปิดการตรวจเช็ค Expiry Date"
          >
            <span>📅 Expiry</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${settings.enableExpiryDate ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {settings.enableExpiryDate ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggleInspectionSetting('enableSerialControl')}
            className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-all ${
              settings.enableSerialControl
                ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-black shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
            title="คลิกเพื่อเปิด/ปิดการตรวจเช็ค Serial Control"
          >
            <span>🔢 Serial</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${settings.enableSerialControl ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {settings.enableSerialControl ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleAddSubmit} className="space-y-3">
        {/* Persistent Target Location (Locks until explicitly changed) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              TARGET LOCATION (สถานที่ตรวจนับ)
            </label>
            <span className="text-[10px] text-indigo-700 font-black flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              <Lock className="w-3 h-3 text-indigo-500" />
              ล็อกตำแหน่งคงที่ (Persistent)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="w-full bg-slate-50 border-2 border-indigo-200 hover:border-blue-500 rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 shadow-2xs transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate font-extrabold text-slate-900">
                {selectedLocation.LocationCode} - {selectedLocation.LocationName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold shrink-0">
              <span>เปลี่ยนที่นี่</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* QR Code / Barcode Input Field (With Auto-Select ready for next Barcode scan) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              ITEM CODE / QR CODE <span className="text-blue-600 font-bold">(AUTO SELECT รอสแกนถัดไป)</span>
            </label>
            {lastParsedResult && lastParsedResult.extractedFields.length > 1 && (
              <span className="text-[10px] text-emerald-700 font-black flex items-center gap-0.5 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Parsed {lastParsedResult.extractedFields.length} fields
              </span>
            )}
          </div>

          <div className="relative">
            <input
              ref={itemInputRef}
              type="text"
              value={itemCodeInput}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              onChange={(e) => {
                const val = e.target.value;
                setItemCodeInput(val);
                // If contains delimiter, parse fields in real-time
                if (val.includes(',') || val.includes(';') || val.includes('|')) {
                  processRawScanData(val, false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  e.stopPropagation();
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) {
                    processRawScanData(val.trim(), settings.autoIncrementQuantity || autoCountOnScan);
                  } else {
                    handleAddSubmit();
                  }
                }
              }}
              onPaste={(e) => {
                const pasteData = e.clipboardData.getData('text');
                if (pasteData && pasteData.trim()) {
                  e.preventDefault();
                  processRawScanData(pasteData.trim(), settings.autoIncrementQuantity || autoCountOnScan);
                }
              }}
              enterKeyHint="done"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="สแกน Barcode/QR Code เช่น 1002,L02 หรือ I00001"
              className="w-full border-2 border-amber-500 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono shadow-xs select-all"
              autoFocus
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {itemCodeInput && (
                <button
                  type="button"
                  onClick={() => {
                    setItemCodeInput('');
                    setLastParsedResult(null);
                    itemInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  title="ล้างข้อความ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleCamera}
                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all shadow-xs"
                title="เปิดกล้องสแกน QR"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const sampleQRs = [
                    '1002,L02',
                    'I00001;Sample Motor Drill;SN-2026-9988',
                    'I00002,LOT-AUG-01,2026-12-31,25',
                    'I00003,BATCH-2026-X',
                    'I00001'
                  ];
                  const nextQR = sampleQRs[Math.floor(Math.random() * sampleQRs.length)];
                  processRawScanData(nextQR, true);
                }}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all shadow-xs"
                title="จำลองสแกน QR"
              >
                <Barcode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Parsed Fields Summary Pill */}
        {lastParsedResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold font-mono">
              <span className="text-blue-700 font-black flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                ข้อมูลที่สกัดได้จาก QR Code:
              </span>
              <button
                type="button"
                onClick={() => setLastParsedResult(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lastParsedResult.extractedFields.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-300 text-slate-800 rounded-md font-mono shadow-2xs"
                >
                  <span className="text-indigo-600">{f.label}:</span>
                  <span className="text-slate-900 font-extrabold">{f.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lot Number Field (Rendered strictly if enabled in settings) */}
        {settings.enableLotControl && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-amber-700 tracking-wider">
                LOT NUMBER (ล็อตสินค้า) <span className="text-amber-500 font-bold">*ตรวจเช็ค</span>
              </label>
              <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold">Enabled</span>
            </div>
            <input
              ref={lotInputRef}
              type="text"
              value={lotNumberInput}
              tabIndex={autoCountOnScan ? -1 : 0}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  handleAddSubmit();
                }
              }}
              onChange={(e) => setLotNumberInput(e.target.value)}
              placeholder="กรอก หรือ ดึงอัตโนมัติจาก QR (เช่น L02)"
              className="w-full border-2 border-amber-300 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-50/40 focus:bg-white focus:outline-hidden focus:border-amber-500 font-mono shadow-2xs"
            />
          </div>
        )}

        {/* Expiry Date Field (Rendered strictly if enabled in settings) */}
        {settings.enableExpiryDate && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                EXPIRY DATE (วันหมดอายุ YYYY-MM-DD) <span className="text-emerald-500 font-bold">*ตรวจเช็ค</span>
              </label>
              <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Enabled</span>
            </div>
            <input
              ref={expiryInputRef}
              type="text"
              value={expiryDateInput}
              tabIndex={autoCountOnScan ? -1 : 0}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  handleAddSubmit();
                }
              }}
              onChange={(e) => setExpiryDateInput(e.target.value)}
              placeholder="YYYY-MM-DD (หรือดึงอัตโนมัติจาก QR)"
              className="w-full border-2 border-emerald-300 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 bg-emerald-50/40 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-mono shadow-2xs"
            />
          </div>
        )}

        {/* Serial Number Field (Rendered strictly if enabled in settings) */}
        {settings.enableSerialControl && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                SERIAL NUMBER (หมายเลขซีเรียล) <span className="text-indigo-500 font-bold">*ตรวจเช็ค</span>
              </label>
              <span className="text-[9px] text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded font-bold">Enabled</span>
            </div>
            <input
              ref={serialInputRef}
              type="text"
              value={serialNumberInput}
              tabIndex={autoCountOnScan ? -1 : 0}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  handleAddSubmit();
                }
              }}
              onChange={(e) => setSerialNumberInput(e.target.value)}
              placeholder="Serial Number (ดึงจาก QR อัตโนมัติ)"
              className="w-full border-2 border-indigo-300 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 bg-indigo-50/40 focus:bg-white focus:outline-hidden focus:border-indigo-500 font-mono shadow-2xs"
            />
          </div>
        )}

        {!settings.enableLotControl && !settings.enableExpiryDate && !settings.enableSerialControl && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-[11px] text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>โหมดมาตรฐาน: นับเฉพาะรหัสสินค้าและจำนวน (ไม่บังคับ Lot / Expiry / Serial)</span>
          </div>
        )}

        {/* Enter Quantity Input (Locked to 1 in Serial Mode) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              QUANTITY (จำนวนที่นับ)
            </label>
            {settings.enableSerialControl && (
              <span className="text-[9px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                🔒 โหมด Serial: ล็อกจำนวน 1 ชิ้นอัตโนมัติ
              </span>
            )}
          </div>
          <input
            ref={quantityInputRef}
            type="number"
            value={settings.enableSerialControl ? '1' : quantityInput}
            readOnly={settings.enableSerialControl}
            disabled={settings.enableSerialControl}
            tabIndex={autoCountOnScan || settings.enableSerialControl ? -1 : 0}
            onClick={(e) => !settings.enableSerialControl && (e.target as HTMLInputElement).select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubmit();
              }
            }}
            onChange={(e) => !settings.enableSerialControl && setQuantityInput(e.target.value)}
            placeholder="Enter Quantity"
            min="1"
            className={`w-full border-2 rounded-2xl px-3.5 py-2 text-xs font-black font-mono transition-all ${
              settings.enableSerialControl
                ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900 cursor-not-allowed'
                : 'border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500'
            }`}
          />
        </div>

        {/* Remark Field */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
            REMARK (หมายเหตุ)
          </label>
          <input
            type="text"
            value={remarkInput}
            tabIndex={autoCountOnScan ? -1 : 0}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubmit();
              }
            }}
            onChange={(e) => setRemarkInput(e.target.value)}
            placeholder="Remark (optional)"
            className="w-full border-2 border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Manual Add / Enter Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-widest border-2 border-blue-500 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>บันทึกการตรวจนับ (ADD / ENTER RECORD)</span>
        </button>
      </form>

      {/* Scanned Data List Header */}
      <div className="mt-6 mb-2 flex items-center justify-between">
        <h3 className="font-extrabold text-gray-800 text-sm tracking-tight flex items-center gap-1.5">
          <span>Data Scanned (รายการที่นับแล้ว)</span>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
            {scannedRecords.length}
          </span>
        </h3>
        <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
          <MapPin className="w-3 h-3 text-indigo-500" />
          Loc: <strong className="text-slate-700">{selectedLocation.LocationCode}</strong>
        </span>
      </div>

      {/* Data Scanned DataGrid Table */}
      <div className="border-2 border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="py-2.5 px-3">Loc</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3">Serial / Lot</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {scannedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400 text-xs">
                    ยังไม่มีข้อมูลที่สแกนในเซสชันนี้
                  </td>
                </tr>
              ) : (
                scannedRecords.map((rec) => {
                  let rowBg = 'bg-white';
                  if (!rec.InMaster) {
                    rowBg = 'bg-amber-100/70';
                  } else if (rec.Status === 'DAMAGE') {
                    rowBg = 'bg-rose-100/70';
                  }

                  return (
                    <tr key={rec.id} className={`${rowBg} hover:bg-slate-50 transition-colors`}>
                      <td className="py-2 px-2.5 font-semibold text-gray-700">{rec.LocationCode}</td>
                      <td className="py-2 px-2.5 font-bold text-blue-700">{rec.ItemCode}</td>
                      <td className="py-2 px-2.5 font-mono text-gray-600 text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          {rec.LotNumber && rec.LotNumber !== '-' && (
                            <span className="text-amber-700 font-semibold">L : {rec.LotNumber}</span>
                          )}
                          {rec.ExpiryDate && rec.ExpiryDate !== '-' && (
                            <span className="text-emerald-700 font-semibold text-[10px]">Exp: {rec.ExpiryDate}</span>
                          )}
                          {rec.SerialNumber && rec.SerialNumber !== '-' && (
                            <span className="text-indigo-700 font-semibold">SN: {rec.SerialNumber}</span>
                          )}
                          {(!rec.LotNumber || rec.LotNumber === '-') &&
                           (!rec.ExpiryDate || rec.ExpiryDate === '-') &&
                           (!rec.SerialNumber || rec.SerialNumber === '-') && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-center font-bold text-slate-900 bg-blue-50/50">
                        {rec.QuantityScan}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          rec.Status === 'DAMAGE'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {rec.Status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRecord(rec.id);
                          }}
                          className="p-2 -m-1 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 active:scale-90 transition-all inline-flex items-center justify-center cursor-pointer"
                          title="ลบรายการนี้"
                          aria-label={`Delete record ${rec.ItemCode}`}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Dialog Modal for Out-of-Master Item */}
      {warningItemCode && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Item Out of Master</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              รหัสสินค้า/QR <span className="font-extrabold text-gray-900 font-mono">[{warningItemCode}]</span> ไม่มีในฐานข้อมูล Item Master
              <br /><br />
              คุณต้องการบันทึกการนับสินค้านี้ต่อไปใช่หรือไม่?
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setWarningItemCode(null);
                  setPendingParsedResult(null);
                }}
                className="flex-1 py-2.5 px-4 border-2 border-slate-300 text-slate-700 font-extrabold text-xs rounded-2xl hover:bg-slate-50 transition-colors"
              >
                ยกเลิก (No)
              </button>
              <button
                type="button"
                onClick={() => {
                  processSaveRecord(warningItemCode, false, undefined, pendingParsedResult);
                }}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-colors"
              >
                บันทึก (Yes)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Select Location</h3>
                <p className="text-[10px] text-slate-500">เลือกสถานที่ที่จะตรวจนับ (จะล็อกตำแหน่งนี้ไว้)</p>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-gray-100">
              {locationMaster.map((loc) => {
                const isSelected = loc.LocationCode === selectedLocCode;
                return (
                  <button
                    key={loc.LocationCode}
                    onClick={() => handleLocationSelect(loc.LocationCode)}
                    className="w-full p-3.5 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">
                        {loc.LocationCode} - {loc.LocationName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Code: {loc.LocationCode}
                      </span>
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
