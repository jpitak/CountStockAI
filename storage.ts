import { ItemMaster, LocationMaster, ScannedRecord, AppSettings, ItemStatus, UserRole, MenuPermissions, RolePermissionsMap, QRCodeProfile } from '../types';
import { INITIAL_ITEM_MASTER, INITIAL_LOCATION_MASTER, INITIAL_SCANNED_RECORDS, DEFAULT_APP_SETTINGS } from '../data/initialData';
import { DEFAULT_QR_PROFILES } from './qrParser';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { MASTER_DELIVERABLES } from '../data/masterDeliverables';

const STORAGE_KEYS = {
  ITEM_MASTER: 'oga_item_master_v1',
  LOCATION_MASTER: 'oga_location_master_v1',
  SCANNED_RECORDS: 'oga_scanned_records_v1',
  APP_SETTINGS: 'oga_app_settings_v1',
  ROLE_PERMISSIONS: 'oga_role_permissions_v1',
  CURRENT_USER_ROLE: 'oga_current_user_role_v1',
  QR_PROFILES: 'oga_qr_profiles_v1',
  ACTIVE_QR_PROFILE_ID: 'oga_active_qr_profile_id_v1',
  SELECTED_LOCATION_CODE: 'oga_selected_location_code_v1',
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  Admin: {
    scan: true,
    view: true,
    master: true,
    sync: true,
    setting: true,
    permission: true,
  },
  Supervisor: {
    scan: true,
    view: true,
    master: true,
    sync: true,
    setting: false,
    permission: false,
  },
  Operator: {
    scan: true,
    view: true,
    master: false,
    sync: false,
    setting: false,
    permission: false,
  }
};

export const loadRolePermissions = (): RolePermissionsMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS);
    if (!raw) return DEFAULT_ROLE_PERMISSIONS;
    const parsed = JSON.parse(raw);
    return {
      Admin: { ...DEFAULT_ROLE_PERMISSIONS.Admin, ...parsed.Admin },
      Supervisor: { ...DEFAULT_ROLE_PERMISSIONS.Supervisor, ...parsed.Supervisor },
      Operator: { ...DEFAULT_ROLE_PERMISSIONS.Operator, ...parsed.Operator },
    };
  } catch (e) {
    console.error("Failed to load Role Permissions", e);
    return DEFAULT_ROLE_PERMISSIONS;
  }
};

export const saveRolePermissions = (permissions: RolePermissionsMap) => {
  localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(permissions));
};

export const loadCurrentRole = (): UserRole => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    if (raw === 'Admin' || raw === 'Supervisor' || raw === 'Operator') {
      return raw as UserRole;
    }
    return 'Admin';
  } catch (e) {
    return 'Admin';
  }
};

export const saveCurrentRole = (role: UserRole) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, role);
};

// LocalStorage & IndexedDB helpers
export const loadItemMaster = (): ItemMaster[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEM_MASTER);
    if (!raw) return INITIAL_ITEM_MASTER;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(i => i.ItemCode === 'I00001' || i.ItemCode === 'ITEM-001' || !i.ItemCode?.startsWith('ITM'))) {
      localStorage.setItem(STORAGE_KEYS.ITEM_MASTER, JSON.stringify(INITIAL_ITEM_MASTER));
      return INITIAL_ITEM_MASTER;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load Item Master", e);
    return INITIAL_ITEM_MASTER;
  }
};

export const saveItemMaster = (items: ItemMaster[]) => {
  localStorage.setItem(STORAGE_KEYS.ITEM_MASTER, JSON.stringify(items));
};

export const loadLocationMaster = (): LocationMaster[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATION_MASTER);
    if (!raw) return INITIAL_LOCATION_MASTER;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(l => l.LocationCode === 'L01' || l.LocationCode === 'LOC-A01' || !l.LocationCode?.startsWith('LOC-'))) {
      localStorage.setItem(STORAGE_KEYS.LOCATION_MASTER, JSON.stringify(INITIAL_LOCATION_MASTER));
      return INITIAL_LOCATION_MASTER;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load Location Master", e);
    return INITIAL_LOCATION_MASTER;
  }
};

export const saveLocationMaster = (locations: LocationMaster[]) => {
  localStorage.setItem(STORAGE_KEYS.LOCATION_MASTER, JSON.stringify(locations));
};

export const loadScannedRecords = (): ScannedRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCANNED_RECORDS);
    if (!raw) return INITIAL_SCANNED_RECORDS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(r => r.ItemCode === 'I00001')) {
      localStorage.setItem(STORAGE_KEYS.SCANNED_RECORDS, JSON.stringify(INITIAL_SCANNED_RECORDS));
      return INITIAL_SCANNED_RECORDS;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load Scanned Records", e);
    return INITIAL_SCANNED_RECORDS;
  }
};

export const saveScannedRecords = (records: ScannedRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.SCANNED_RECORDS, JSON.stringify(records));
};

export const loadAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!raw) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(raw);
    // If legacy demo student spreadsheet ID is present, clear it to avoid opening the Google Student template
    if (parsed.googleSheetSpreadsheetId === '1BxiMVs0XRA5nFMdKvBdBZJgmUUqpt1bs74OgvE2upms') {
      parsed.googleSheetSpreadsheetId = '';
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(parsed));
    }
    return { ...DEFAULT_APP_SETTINGS, ...parsed };
  } catch (e) {
    console.error("Failed to load App Settings", e);
    return DEFAULT_APP_SETTINGS;
  }
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
};

export const loadQRCodeProfiles = (): QRCodeProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QR_PROFILES);
    if (!raw) return DEFAULT_QR_PROFILES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QR_PROFILES;
  } catch (e) {
    console.error("Failed to load QR Profiles", e);
    return DEFAULT_QR_PROFILES;
  }
};

export const saveQRCodeProfiles = (profiles: QRCodeProfile[]) => {
  localStorage.setItem(STORAGE_KEYS.QR_PROFILES, JSON.stringify(profiles));
};

export const loadActiveQRProfileId = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_QR_PROFILE_ID);
    return raw || 'qr-item-desc-serial';
  } catch (e) {
    return 'qr-item-desc-serial';
  }
};

export const saveActiveQRProfileId = (profileId: string) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_QR_PROFILE_ID, profileId);
};

export const loadSelectedLocationCode = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION_CODE);
    return raw || 'L01';
  } catch (e) {
    return 'L01';
  }
};

export const saveSelectedLocationCode = (code: string) => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION_CODE, code);
};

// Helper file downloads
export const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Item Master Exporters (TXT, CSV, XLSX)
export const exportItemMasterTemplate = (format: 'txt' | 'csv' | 'xlsx', data: ItemMaster[]) => {
  const exportRows = data.map(item => ({
    ItemCode: item.ItemCode,
    ItemName: item.ItemName,
    ItemDescription: item.Description || item.ItemName,
    Barcode: item.Barcode,
    Category: item.Category || '',
    Unit: item.Unit || 'PCS',
    SerialNumber: item.SerialNumber || '-',
    Quantity: item.QuantityPlan || 0,
    Udf01: item.Udf01 || '',
    Udf02: item.Udf02 || '',
    Udf03: item.Udf03 || '',
    Udf04: item.Udf04 || '',
    Udf05: item.Udf05 || ''
  }));

  if (format === 'txt') {
    const headers = "ItemCode\tItemName\tItemDescription\tBarcode\tCategory\tUnit\tSerialNumber\tQuantity\tUdf01\tUdf02\tUdf03\tUdf04\tUdf05\n";
    const body = exportRows.map(r => Object.values(r).join("\t")).join("\n");
    downloadFile(headers + body, "ItemMaster_Template.txt", "text/plain;charset=utf-8");
  } else if (format === 'csv') {
    const headers = "ItemCode,ItemName,ItemDescription,Barcode,Category,Unit,SerialNumber,Quantity,Udf01,Udf02,Udf03,Udf04,Udf05\n";
    const body = exportRows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
    downloadFile(headers + body, "ItemMaster_Template.csv", "text/csv;charset=utf-8");
  } else if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadFile(blob, "ItemMaster_Template.xlsx", "application/octet-stream");
  }
};

// Location Master Exporters (TXT, CSV, XLSX)
export const exportLocationMasterTemplate = (format: 'txt' | 'csv' | 'xlsx', data: LocationMaster[]) => {
  const exportRows = data.map(loc => ({
    location_code: loc.LocationCode,
    location_name: loc.LocationName,
    location_description: loc.LocationDescription || loc.LocationName,
    Zone: loc.Zone || 'A',
    Warehouse: loc.Warehouse || 'OGA'
  }));

  if (format === 'txt') {
    const headers = "location_code\tlocation_name\tlocation_description\tZone\tWarehouse\n";
    const body = exportRows.map(r => Object.values(r).join("\t")).join("\n");
    downloadFile(headers + body, "LocationMaster_Template.txt", "text/plain;charset=utf-8");
  } else if (format === 'csv') {
    const headers = "location_code,location_name,location_description,Zone,Warehouse\n";
    const body = exportRows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
    downloadFile(headers + body, "LocationMaster_Template.csv", "text/csv;charset=utf-8");
  } else if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadFile(blob, "LocationMaster_Template.xlsx", "application/octet-stream");
  }
};

// Count Stock Scanned Records Exporters
export const exportScannedRecords = (format: 'txt' | 'csv' | 'xlsx', records: ScannedRecord[], settings: AppSettings) => {
  const exportRows = records.map(r => ({
    CompanyCode: settings.companyCode || r.CompanyCode || 'OGA001',
    BranchCode: settings.branchCode || r.BranchCode || 'HQ',
    InventoryPeriod: settings.inventoryPeriod || r.InventoryPeriod || '2026-Q3',
    LocationCode: r.LocationCode,
    LocationName: r.LocationName,
    ItemCode: r.ItemCode,
    ItemName: r.ItemName,
    Barcode: r.Barcode,
    SerialNumber: r.SerialNumber || '-',
    LotNumber: r.LotNumber || '-',
    ExpiryDate: r.ExpiryDate || '-',
    Quantity: r.QuantityScan,
    Status: r.Status,
    InMaster: r.InMaster ? 'Y' : 'N',
    Remark: r.Remark || '',
    ScannedBy: r.ScannedBy || settings.username || 'Admin',
    ScanDate: r.ScanDate,
    ScanTime: r.ScanTime
  }));

  if (format === 'txt') {
    const headers = "CompanyCode\tBranchCode\tInventoryPeriod\tLocationCode\tLocationName\tItemCode\tItemName\tBarcode\tSerialNumber\tLotNumber\tExpiryDate\tQuantity\tStatus\tInMaster\tRemark\tScannedBy\tScanDate\tScanTime\n";
    const body = exportRows.map(r => Object.values(r).join("\t")).join("\n");
    downloadFile(headers + body, `CountStock_Export_${new Date().toISOString().slice(0,10)}.txt`, "text/plain;charset=utf-8");
  } else if (format === 'csv') {
    const headers = "CompanyCode,BranchCode,InventoryPeriod,LocationCode,LocationName,ItemCode,ItemName,Barcode,SerialNumber,LotNumber,ExpiryDate,Quantity,Status,InMaster,Remark,ScannedBy,ScanDate,ScanTime\n";
    const body = exportRows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
    downloadFile(headers + body, `CountStock_Export_${new Date().toISOString().slice(0,10)}.csv`, "text/csv;charset=utf-8");
  } else if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadFile(blob, `CountStock_Export_${new Date().toISOString().slice(0,10)}.xlsx`, "application/octet-stream");
  }
};

// Generate Full Master Package ZIP File (OGA_COUNT_TEST_PACKAGE.zip)
export const exportMasterPackageZip = async () => {
  const zip = new JSZip();
  const folder = zip.folder("OGA_COUNT_TEST_PACKAGE") || zip;

  MASTER_DELIVERABLES.forEach(item => {
    folder.file(item.filename, item.content);
  });

  const content = await zip.generateAsync({ type: "blob" });
  downloadFile(content, "OGA_COUNT_TEST_PACKAGE.zip", "application/zip");
};
