import { ItemMaster, LocationMaster, ScannedRecord, AppSettings } from '../types';

// Matching Image 4: ItemMaster Template
export const INITIAL_ITEM_MASTER: ItemMaster[] = [
  {
    ItemCode: "ITM001",
    ItemName: "แท็บเล็ตตรวจนับสต็อก OGA Pro 10",
    Barcode: "8850123456789",
    Barcode2: "8850123456780",
    Category: "Hardware",
    Unit: "เครื่อง",
    QuantityPlan: 100,
    UseLot: "N",
    UseSerial: "Y",
    UseExpiry: "N",
    Remark: "สินค้าคลัง A"
  },
  {
    ItemCode: "ITM002",
    ItemName: "เครื่องอ่านบาร์โค้ดไร้สาย 2D Bluetooth",
    Barcode: "8850123456796",
    Barcode2: "8850123456790",
    Category: "Scanner",
    Unit: "ตัว",
    QuantityPlan: 50,
    UseLot: "N",
    UseSerial: "Y",
    UseExpiry: "N",
    Remark: "สินค้าคลัง A"
  },
  {
    ItemCode: "ITM003",
    ItemName: "สติ๊กเกอร์บาร์โค้ดความร้อน Direct Thermal 4x3",
    Barcode: "8850123456802",
    Barcode2: "8850123456800",
    Category: "Consumable",
    Unit: "ม้วน",
    QuantityPlan: 200,
    UseLot: "Y",
    UseSerial: "N",
    UseExpiry: "Y",
    Remark: "สินค้ามีอายุ 1 ปี"
  },
  {
    ItemCode: "ITM004",
    ItemName: "ริบบอนบาร์โค้ด Wax Resin 110mm x 300m",
    Barcode: "8850123456819",
    Barcode2: "8850123456810",
    Category: "Consumable",
    Unit: "ม้วน",
    QuantityPlan: 150,
    UseLot: "Y",
    UseSerial: "N",
    UseExpiry: "N",
    Remark: "สินค้าคลัง B"
  },
  {
    ItemCode: "ITM005",
    ItemName: "เครื่องพิมพ์บาร์โค้ด Industrial Printer",
    Barcode: "8850123456826",
    Barcode2: "8850123456820",
    Category: "Printer",
    Unit: "เครื่อง",
    QuantityPlan: 20,
    UseLot: "N",
    UseSerial: "Y",
    UseExpiry: "N",
    Remark: "สินค้าคลังหลัก"
  }
];

// Matching Image 5: LocationMaster Template
export const INITIAL_LOCATION_MASTER: LocationMaster[] = [
  {
    LocationCode: "LOC-A01-01",
    LocationName: "Shelf A-01 ชั้น 1",
    Zone: "Zone-A",
    Warehouse: "คลังสินค้าหลัก",
    LocationDescription: "โซนสินค้าคอมพิวเตอร์และ PDA",
    Active: "Y"
  },
  {
    LocationCode: "LOC-A01-02",
    LocationName: "Shelf A-01 ชั้น 2",
    Zone: "Zone-A",
    Warehouse: "คลังสินค้าหลัก",
    LocationDescription: "โซนอุปกรณ์ต่อพ่วง",
    Active: "Y"
  },
  {
    LocationCode: "LOC-B02-01",
    LocationName: "Shelf B-02 ชั้น 1",
    Zone: "Zone-B",
    Warehouse: "คลังวัตถุดิบ",
    LocationDescription: "โซนกระดาษและสติ๊กเกอร์",
    Active: "Y"
  },
  {
    LocationCode: "LOC-C03-01",
    LocationName: "Cold Room C-01",
    Zone: "Zone-C",
    Warehouse: "คลังควบคุมอุณหภูมิ",
    LocationDescription: "ห้องแช่เย็นควบคุมพิเศษ",
    Active: "Y"
  },
  {
    LocationCode: "LOC-DMG-01",
    LocationName: "Quarantine Damage Zone",
    Zone: "Zone-DMG",
    Warehouse: "คลังสินค้าชำรุด",
    LocationDescription: "โซนกักกันสินค้าชำรุดรอส่งคืน",
    Active: "Y"
  }
];

// Matching Image 6: ScannedStock Template & Results
export const INITIAL_SCANNED_RECORDS: ScannedRecord[] = [
  {
    id: "REC-DEMO-001",
    CompanyCode: "OGA001",
    BranchCode: "HQ",
    InventoryPeriod: "2026-Q3",
    Department: "Warehouse / Production",
    LocationCode: "LOC-A01-01",
    LocationName: "Shelf A-01 ชั้น 1",
    ItemCode: "ITM001",
    ItemName: "แท็บเล็ตตรวจนับสต็อก OGA Pro 10",
    Barcode: "8850123456789",
    LotNumber: "-",
    ExpiryDate: "-",
    SerialNumber: "SN-2026-0001",
    QuantityScan: 1,
    QuantityPlan: 100,
    Status: "NORMAL",
    InMaster: true,
    Remark: "ตรวจนับประจำจุด A-01",
    ScannedBy: "Admin",
    ScanDate: "2026-08-19",
    ScanTime: "09:30:00",
    Timestamp: Date.now() - 300000,
    Synced: true
  }
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  databaseProvider: "sheets",
  googleSheetLocation: "Google Drive / OGA_Stock_2026 / Warehouse_ZoneA",
  googleSheetSpreadsheetId: "",
  googleSheetTabName: "ScannedStock",
  serverUrl: "10.10.60.188",
  port: "98",
  apiPath: "/api/sync/upload",
  protocol: "http",
  connectionTimeout: 30,
  companyCode: "OGA001",
  companyName: "OGA International Co., Ltd.",
  branchCode: "HQ",
  branchName: "สำนักงานใหญ่",
  inventoryPeriod: "2026-Q3",
  department: "Warehouse / Production",
  defaultStatus: "NORMAL",
  autoClearItemCode: true,
  defaultQuantity: 1,
  requireRemarkForDamage: true,
  showItemNameInGrid: true,
  confirmBeforeDelete: true,
  soundOnScan: true,
  vibrateOnScan: true,
  screenTimeout: "none",
  enableLotControl: false,
  enableExpiryDate: false,
  autoIncrementQuantity: true,
  confirmOutMaster: true,
  enableSerialControl: false,
  gridHeaderFontSize: 13,
  gridRowFontSize: 12,
  enableBarcodeScanner: true,
  enableBluetoothPrinter: false,
  enableCashDrawer: false,
  username: "Admin",
  adminPassword: "Local@dminwms",
  themeColor: 'default',
  googleSheetsWebhookUrl: "https://script.google.com/macros/s/AKfycbx_oga_count_stock_demo/exec"
};
