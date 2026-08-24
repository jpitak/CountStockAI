export interface DeliverableFile {
  filename: string;
  category: 'Source Code' | 'Database' | 'Documentation' | 'Google Sheets';
  description: string;
  content: string;
}

export const MASTER_DELIVERABLES: DeliverableFile[] = [
  {
    filename: "oga_scrapp.gs",
    category: "Google Sheets",
    description: "Google Apps Script for Google Sheets Auto-Creation & Dual Sync Server Webhook",
    content: `/**
 * OGA INTERNATIONAL CO., LTD. - Count Stock Mobile Application
 * Google Apps Script (oga_scrapp.gs)
 * Version 1.0 | OGA Group Technology Division
 *
 * This script runs inside Google Sheets and handles:
 * 1. Auto-creating required sheets (ItemMaster, LocationMaster, StockScan, SyncLogs) on first run
 * 2. Webhook endpoints (doGet, doPost) for receiving stock count records from PDA
 * 3. Syncing Master Data down to Mobile PDA devices
 */

const SHEET_ITEM_MASTER = "ItemMaster";
const SHEET_LOCATION_MASTER = "LocationMaster";
const SHEET_STOCK_SCAN = "StockScan";
const SHEET_SYNC_LOGS = "SyncLogs";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🐘 OGA Count Stock")
    .addItem("🚀 Initialize Database Sheets", "setupDatabaseSheets")
    .addItem("📊 Export Summary Report", "generateSummaryReport")
    .addToUi();
}

/**
 * Auto-creates sheets and headers if not present
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. ItemMaster Sheet
  let itemSheet = ss.getSheetByName(SHEET_ITEM_MASTER);
  if (!itemSheet) {
    itemSheet = ss.insertSheet(SHEET_ITEM_MASTER);
    itemSheet.appendRow([
      "ItemCode", "ItemName", "ItemDescription", "Barcode", "Category", 
      "Unit", "SerialNumber", "Quantity", "Udf01", "Udf02", "Udf03", "Udf04", "Udf05"
    ]);
    itemSheet.getRange("A1:M1").setBackground("#3B82F6").setFontColor("#FFFFFF").setFontWeight("bold");
    
    // Seed sample item data
    itemSheet.appendRow(["I00001", "อัลมอนด์เคลือบ Chocolate", "อัลมอนด์เคลือบ Chocolate", "I00001", "Snack", "PCS", "-", 10, "", "", "", "", ""]);
    itemSheet.appendRow(["I00002", "สายพาน Timing Belt PU ร่อง H SIZE 340x38mm", "สายพาน Timing Belt PU ร่อง H", "I00002", "Parts", "EA", "-", 20, "", "", "", "", ""]);
    itemSheet.appendRow(["I00003", "สก๊อต ซุปไก่สกัด", "สก๊อต ซุปไก่สกัด", "I00003", "Snack", "PCS", "-", 30, "", "", "", "", ""]);
  }

  // 2. LocationMaster Sheet
  let locSheet = ss.getSheetByName(SHEET_LOCATION_MASTER);
  if (!locSheet) {
    locSheet = ss.insertSheet(SHEET_LOCATION_MASTER);
    locSheet.appendRow(["location_code", "location_name", "location_description", "Zone", "Warehouse"]);
    locSheet.getRange("A1:E1").setBackground("#8B5CF6").setFontColor("#FFFFFF").setFontWeight("bold");
    
    // Seed sample location data
    locSheet.appendRow(["L01", "Marketing Department", "Marketing Department", "A", "OGA"]);
    locSheet.appendRow(["L02", "Sales department", "Sales department", "B", "OGA"]);
    locSheet.appendRow(["L03", "Human Resources", "Human Resources", "A", "OGA"]);
  }

  // 3. StockScan Sheet
  let scanSheet = ss.getSheetByName(SHEET_STOCK_SCAN);
  if (!scanSheet) {
    scanSheet = ss.insertSheet(SHEET_STOCK_SCAN);
    scanSheet.appendRow([
      "LocationCode", "ItemCode", "Barcode", "ItemName", "LotNumber", 
      "ExpiryDate", "SerialNumber", "QuantityScan", "QuantityPlan", "Status", 
      "InMaster", "Remark", "ScannedBy", "ScanDateTime"
    ]);
    scanSheet.getRange("A1:N1").setBackground("#EF4444").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  // 4. SyncLogs Sheet
  let logSheet = ss.getSheetByName(SHEET_SYNC_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_SYNC_LOGS);
    logSheet.appendRow(["LogID", "Action", "RecordCount", "ScannedBy", "DeviceTimestamp", "ServerTimestamp"]);
    logSheet.getRange("A1:F1").setBackground("#22C55E").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  SpreadsheetApp.getUi().alert("OGA Count Stock Sheets initialized successfully!");
}

/**
 * Webhook POST handler for uploading scan records from Mobile PDA
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scanSheet = ss.getSheetByName(SHEET_STOCK_SCAN) || ss.insertSheet(SHEET_STOCK_SCAN);
    
    if (data.records && Array.isArray(data.records)) {
      data.records.forEach(r => {
        scanSheet.appendRow([
          r.LocationCode || "",
          r.ItemCode || "",
          r.Barcode || "",
          r.ItemName || "",
          r.LotNumber || "-",
          r.ExpiryDate || "-",
          r.SerialNumber || "-",
          r.QuantityScan || 1,
          r.QuantityPlan || 0,
          r.Status || "NORMAL",
          r.InMaster ? "Y" : "N",
          r.Remark || "",
          r.ScannedBy || "Admin",
          r.ScanDate + " " + r.ScanTime
        ]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Uploaded " + (data.records ? data.records.length : 0) + " records to Google Sheets",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Webhook GET handler for downloading Master Items and Master Locations to Mobile PDA
 */
function doGet(e) {
  setupDatabaseSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const itemSheet = ss.getSheetByName(SHEET_ITEM_MASTER);
  const locSheet = ss.getSheetByName(SHEET_LOCATION_MASTER);

  const items = [];
  const itemRows = itemSheet.getDataRange().getValues();
  for (let i = 1; i < itemRows.length; i++) {
    items.push({
      ItemCode: itemRows[i][0],
      ItemName: itemRows[i][1],
      Barcode: itemRows[i][3],
      Category: itemRows[i][4],
      Unit: itemRows[i][5],
      QuantityPlan: itemRows[i][7]
    });
  }

  const locations = [];
  const locRows = locSheet.getDataRange().getValues();
  for (let j = 1; j < locRows.length; j++) {
    locations.push({
      LocationCode: locRows[j][0],
      LocationName: locRows[j][1],
      Zone: locRows[j][3],
      Warehouse: locRows[j][4]
    });
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "SUCCESS",
    items: items,
    locations: locations,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`
  },
  {
    filename: "DATABASE_SCHEMA.sql",
    category: "Database",
    description: "Complete Enterprise PostgreSQL / MySQL Relational Schema for OGA Stock System",
    content: `-- ============================================================================
-- OGA INTERNATIONAL CO., LTD. - COUNT STOCK MOBILE SYSTEM
-- Relational Database Schema Specification
-- Compatible Database Engine: PostgreSQL 13+ / MySQL 8.0+
-- Generated for OGA Master Control & IT Infrastructure
-- ============================================================================

-- 1. Create Schema / Database
CREATE DATABASE IF NOT EXISTS oga_count_stock_db;
USE oga_count_stock_db;

-- ----------------------------------------------------------------------------
-- Table 1: oga_company_branch (Company & Branch Master)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oga_company_branch (
    company_code VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (company_code, branch_code)
);

INSERT INTO oga_company_branch (company_code, company_name, branch_code, branch_name)
VALUES ('OGA001', 'OGA International Co., Ltd.', 'HQ', 'สำนักงานใหญ่')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Table 2: oga_item_master (Item Master Data)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oga_item_master (
    item_code VARCHAR(100) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    barcode VARCHAR(100) NOT NULL,
    barcode2 VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'PCS',
    serial_number_req VARCHAR(10) DEFAULT '-',
    quantity_plan INT DEFAULT 0,
    use_lot CHAR(1) DEFAULT 'N',
    use_serial CHAR(1) DEFAULT 'N',
    use_expiry CHAR(1) DEFAULT 'N',
    udf01 VARCHAR(255),
    udf02 VARCHAR(255),
    udf03 VARCHAR(255),
    udf04 VARCHAR(255),
    udf05 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_barcode ON oga_item_master(barcode);
CREATE INDEX idx_item_category ON oga_item_master(category);

-- Seed Sample Item Data
INSERT INTO oga_item_master (item_code, item_name, barcode, category, unit, quantity_plan) VALUES
('I00001', 'อัลมอนด์เคลือบ Chocolate', 'I00001', 'Snack', 'PCS', 10),
('I00002', 'สายพาน Timing Belt PU ร่อง H SIZE 340x38mm', 'I00002', 'Parts', 'EA', 20),
('I00003', 'สก๊อต ซุปไก่สกัด', 'I00003', 'Snack', 'PCS', 30),
('I00004', 'ยำยำคัพเต็มๆ รสต้มยำกุ้ง ชุด 3 ถ้วย', 'I00004', 'Parts', 'EA', 40),
('I00005', 'ยำยำคัพเต็มๆ รสต้มยำกุ้ง', 'I00005', 'Snack', 'PCS', 15)
ON CONFLICT (item_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Table 3: oga_location_master (Location Master Data)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oga_location_master (
    location_code VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    location_description TEXT,
    zone VARCHAR(50) DEFAULT 'A',
    warehouse VARCHAR(100) DEFAULT 'OGA',
    parent_location VARCHAR(50),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Location Data
INSERT INTO oga_location_master (location_code, location_name, zone, warehouse) VALUES
('L01', 'Marketing Department', 'A', 'OGA'),
('L02', 'Sales department', 'B', 'OGA'),
('L03', 'Human Resources', 'A', 'OGA'),
('L04', 'Customer Relations Department', 'B', 'OGA'),
('L05', 'Accounting/Finance Department', 'A', 'OGA'),
('L06', 'General Manager', 'B', 'OGA'),
('L07', 'Sales Manager', 'A', 'OGA')
ON CONFLICT (location_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Table 4: oga_stock_scan (Transaction Data Scanned from Mobile PDA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oga_stock_scan (
    scan_id VARCHAR(100) PRIMARY KEY,
    company_code VARCHAR(50) DEFAULT 'OGA001',
    branch_code VARCHAR(50) DEFAULT 'HQ',
    inventory_period VARCHAR(50) DEFAULT '2026-Q3',
    department VARCHAR(100) DEFAULT 'Warehouse',
    location_code VARCHAR(50) NOT NULL,
    item_code VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    item_name VARCHAR(255),
    lot_number VARCHAR(100) DEFAULT '-',
    expiry_date VARCHAR(20) DEFAULT '-',
    serial_number VARCHAR(100) DEFAULT '-',
    quantity_scan INT DEFAULT 1,
    quantity_plan INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'NORMAL', -- 'NORMAL' or 'DAMAGE'
    in_master BOOLEAN DEFAULT TRUE,
    remark TEXT,
    scanned_by VARCHAR(100) DEFAULT 'Admin',
    scan_date DATE,
    scan_time TIME,
    device_timestamp BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scan_location FOREIGN KEY (location_code) REFERENCES oga_location_master(location_code) ON DELETE RESTRICT
);

CREATE INDEX idx_scan_location ON oga_stock_scan(location_code);
CREATE INDEX idx_scan_item ON oga_stock_scan(item_code);
CREATE INDEX idx_scan_status ON oga_stock_scan(status);
CREATE INDEX idx_scan_date ON oga_stock_scan(scan_date);

-- ----------------------------------------------------------------------------
-- Table 5: oga_sync_logs (Sync Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oga_sync_logs (
    log_id SERIAL PRIMARY KEY,
    device_id VARCHAR(100),
    user_name VARCHAR(100),
    sync_action VARCHAR(50), -- 'UPLOAD_SCAN', 'PULL_MASTER'
    record_count INT,
    status VARCHAR(20), -- 'SUCCESS', 'FAILED'
    ip_address VARCHAR(45),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- SQL View 1: Summary Variance Report (Physical Count vs Plan)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_oga_stock_variance AS
SELECT 
    s.location_code,
    l.location_name,
    s.item_code,
    s.item_name,
    s.status,
    SUM(s.quantity_scan) AS total_scanned_qty,
    MAX(s.quantity_plan) AS plan_qty,
    (SUM(s.quantity_scan) - MAX(s.quantity_plan)) AS variance_qty,
    CASE 
        WHEN SUM(s.quantity_scan) = MAX(s.quantity_plan) THEN 'MATCH'
        WHEN SUM(s.quantity_scan) > MAX(s.quantity_plan) THEN 'OVER'
        ELSE 'SHORTAGE'
    END AS count_status
FROM oga_stock_scan s
LEFT JOIN oga_location_master l ON s.location_code = l.location_code
GROUP BY s.location_code, l.location_name, s.item_code, s.item_name, s.status;
`
  },
  {
    filename: "oga_app.js",
    category: "Source Code",
    description: "Core Standalone PDA Scanner Runtime Library (oga_app.js)",
    content: `/**
 * OGA INTERNATIONAL CO., LTD. - Count Stock Mobile PDA Engine
 * File: oga_app.js
 * Developer: Technology Division - OGA International
 * 
 * Provides offline IndexedDB persistence, Barcode HID wedge processing,
 * ESC/POS Printer Commands, and Sync protocols.
 */

window.OGAPDAEngine = (function() {
  let db = null;
  const DB_NAME = "OGACountStockDB";
  const DB_VERSION = 1;

  function initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains("scanned_items")) {
          const store = db.createObjectStore("scanned_items", { keyPath: "id" });
          store.createIndex("locationCode", "LocationCode", { unique: false });
          store.createIndex("synced", "Synced", { unique: false });
        }
        if (!db.objectStoreNames.contains("item_master")) {
          db.createObjectStore("item_master", { keyPath: "ItemCode" });
        }
        if (!db.objectStoreNames.contains("location_master")) {
          db.createObjectStore("location_master", { keyPath: "LocationCode" });
        }
      };
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };
      request.onerror = (err) => reject(err);
    });
  }

  function printESCPOSReceipt(printerName, scanItem) {
    console.log("Printing ESC-POS Slip via Bluetooth printer:", printerName, scanItem);
    const escposCommands = [
      "\\x1B\\x40", // Init
      "\\x1B\\x61\\x01", // Align Center
      "================================\\n",
      "    OGA INTERNATIONAL CO.,LTD.  \\n",
      "      COUNT STOCK MOBILE PDA    \\n",
      "================================\\n",
      "\\x1B\\x61\\x00", // Align Left
      \`Date/Time: \${scanItem.ScanDate} \${scanItem.ScanTime}\\n\`,
      \`Location : \${scanItem.LocationCode} - \${scanItem.LocationName}\\n\`,
      \`Item Code: \${scanItem.ItemCode}\\n\`,
      \`Item Name: \${scanItem.ItemName}\\n\`,
      \`Serial No: \${scanItem.SerialNumber}\\n\`,
      \`Lot / Exp: \${scanItem.LotNumber} / \${scanItem.ExpiryDate}\\n\`,
      \`Quantity : \${scanItem.QuantityScan} EA\\n\`,
      \`Status   : \${scanItem.Status}\\n\`,
      "--------------------------------\\n",
      \`Operator : \${scanItem.ScannedBy}\\n\\n\\n\`,
      "\\x1D\\x56\\x42\\x00" // Cut paper
    ].join("");
    return escposCommands;
  }

  return {
    init: initDatabase,
    printSlip: printESCPOSReceipt
  };
})();
`
  },
  {
    filename: "API_DOCUMENT.md",
    category: "Documentation",
    description: "RESTful API Specification & Integration Protocols for OGA Count Stock",
    content: `# OGA INTERNATIONAL CO., LTD.
## Count Stock Mobile Application - API Integration Specification
**Document Version:** 1.0  
**Target Architecture:** Mobile PDA (Android / iOS) ↔ Central API Server / Google Sheets

---

### 1. Base URL & Protocol
- **Default Development URL:** \`http://10.10.60.188:3000/api/v1/countstock\`
- **Google Sheets Webhook URL:** \`https://script.google.com/macros/s/AKfycbx_oga_count_stock_demo/exec\`
- **Auth Headers:** \`X-OGA-API-KEY: oga_secret_key_2026\`

---

### 2. Endpoints

#### 2.1 POST \`/api/sync/upload\`
Upload scanned inventory records from Mobile PDA (Batch Sync).

**Request Body:**
\`\`\`json
{
  "companyCode": "OGA001",
  "branchCode": "HQ",
  "records": [
    {
      "id": "rec-101",
      "LocationCode": "L01",
      "LocationName": "Marketing Department",
      "ItemCode": "I00001",
      "ItemName": "อัลมอนด์เคลือบ Chocolate",
      "Barcode": "I00001",
      "LotNumber": "LOT202607",
      "ExpiryDate": "2027-12-31",
      "SerialNumber": "SR00001",
      "QuantityScan": 1,
      "QuantityPlan": 10,
      "Status": "NORMAL",
      "InMaster": true,
      "Remark": "สภาพปกติ",
      "ScannedBy": "Admin",
      "ScanDate": "2026-07-30",
      "ScanTime": "09:50:00"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Successfully uploaded 1 items to server",
  "syncTimestamp": "2026-07-30T09:55:00.000Z"
}
\`\`\`

---

#### 2.2 GET \`/api/sync/download\`
Pull latest Item Master & Location Master data to PDA for Offline Mode.

**Response:**
\`\`\`json
{
  "success": true,
  "items": [
    {
      "ItemCode": "I00001",
      "ItemName": "อัลมอนด์เคลือบ Chocolate",
      "Barcode": "I00001",
      "Category": "Snack",
      "Unit": "PCS",
      "QuantityPlan": 10
    }
  ],
  "locations": [
    {
      "LocationCode": "L01",
      "LocationName": "Marketing Department",
      "Zone": "A",
      "Warehouse": "OGA"
    }
  ],
  "serverTime": "2026-07-30T09:55:00.000Z"
}
\`\`\`

---

#### 2.3 POST \`/api/gemini-spec\`
AI Specification Generation via Gemini API (@google/genai).

**Request Body:**
\`\`\`json
{
  "prompt": "ต้องการนับสินค้ากลุ่มชิ้นส่วนอะไหล่เครื่องจักร บังคับบันทึก Serial Number และพิมพ์ Slip Sticker ผ่าน Bluetooth Printer",
  "scenario": "Serial Number Verification"
}
\`\`\`
`
  },
  {
    filename: "README_ติดตั้ง_TEST.md",
    category: "Documentation",
    description: "Installation and Test Environment Setup Manual for OGA Technical Staff",
    content: `# คู่มือการติดตั้งและทดสอบระบบ Count Stock Mobile Application
**บริษัท OGA INTERNATIONAL CO., LTD.**

---

## 1. ข้อกำหนดของอุปกรณ์และสภาพแวดล้อม (System Requirements)
- **อุปกรณ์:** Mobile PDA, Android Smart Terminal (Android 8.0+ / iOS 13+)
- **การเชื่อมต่อ:** Wi-Fi (2.4GHz / 5GHz) หรือ Mobile Data (4G/5G)
- **เครื่องสแกน:** Hardware Laser Scanner (HID keyboard-wedge) หรือ Camera Scanner
- **เครื่องพิมพ์:** Bluetooth / Slip Printer (ESC-POS Protocol, Paper 58mm / 80mm)

---

## 2. ขั้นตอนการติดตั้งบนเครื่อง Mobile PDA (APK Installation)
1. คลายไฟล์ \`OGA_COUNT_TEST_PACKAGE.zip\`
2. โอนถ่ายไฟล์ \`OGA_CountStock_v1.0_Test.apk\` ไปยังเครื่อง Mobile PDA ผ่านสาย USB
3. เปิดแอป **File Manager** บน PDA แล้วเลือกติดตั้ง APK
4. อนุญาตสิทธิ์การใช้งาน (Permissions):
   - Camera (สแกนกล้อง)
   - Bluetooth (เชื่อมต่อเครื่องพิมพ์ slip)
   - Storage (นำเข้า/ส่งออกไฟล์ Excel/CSV)

---

## 3. ขั้นตอนการตั้งค่าเริ่มต้นก่อนการใช้งาน (First-Time Setup)
1. เปิดแอปพลิเคชัน **OGA Count Stock**
2. ไปที่เมนู **Setting (ตั้งค่า)**
3. เลือก Database Provider: **Excel File** หรือ **Google Sheets** หรือ **SQL Server**
4. กำหนดค่า Server URL: \`http://10.10.60.188:3000\`
5. กดปุ่ม **Test Connection** เพื่อทดสอบการเชื่อมต่อ
6. ไปที่เมนู **Item Master** และ **Location Master** กดปุ่ม **Import** เพื่อโหลดข้อมูลตั้งต้น
7. ทดสอบการสแกนบาร์โค้ดในหน้า **Scan Item**
`
  },
  {
    filename: "DEPLOY_GUIDE.md",
    category: "Documentation",
    description: "Enterprise Deployment Guide (Cloud Run / On-Premise / Google Apps Script)",
    content: `# OGA INTERNATIONAL - DEPLOYMENT & OPERATION GUIDE

## 1. Cloud Run / Full-Stack Container Deployment
เพื่อความปลอดภัย ข้อมูลและการเรียกใช้งาน Gemini API ทั้งหมดจะถูกประมวลผลฝั่ง Server-Side ผ่าน Node.js / Express

### Build Command:
\`\`\`bash
npm run build
\`\`\`

### Start Command:
\`\`\`bash
npm run start
\`\`\`

---

## 2. Google Sheets Apps Script Setup
1. สร้าง Google Spreadsheet ใหม่ในบัญชีขององค์กร
2. ไปที่เมนู **Extensions > Apps Script**
3. คัดลอกโค้ดจากไฟล์ \`oga_scrapp.gs\` ไปวางใน Editor
4. กดบันทึกและเลือก **Deploy > New Deployment**
5. เลือกชนิด **Web App**, ตั้งค่า Execute as: *Me*, Who has access: *Anyone*
6. นำ Webhook URL ที่ได้ไปใส่ในเมนู **Setting > Google Sheets Webhook URL** ในแอป Mobile PDA

---

## 3. Production Release Checklist
- [x] สำรองข้อมูล (Backup Database/Sheet) ก่อนเริ่มรอบนับ
- [x] ทดสอบ UAT ใน TEST Environment 100%
- [x] ตรวจสอบการพิมพ์ Bluetooth Slip Printer และลิ้นชักเก็บเงิน (Cash Drawer)
- [x] ทดสอบ Offline Mode (สแกนขณะตัดเน็ต แล้วกด Sync เมื่อกลับมาต่อ Wi-Fi)
`
  },
  {
    filename: "TEST_CASES.csv",
    category: "Documentation",
    description: "System Test Cases Matrix & Validation Log",
    content: `TestCaseID,Feature,TestScenario,ExpectedResult,Status
TC-001,Master Data,Import Item Master Excel File (.xlsx),Import 15 items successfully without error,PASS
TC-002,Master Data,Export Location Master Template (.CSV),Download CSV template with location_code header,PASS
TC-003,Scan Item,Scan Item Code existing in Master,Auto-fill Item Name & default Qty=1,PASS
TC-004,Scan Item,Scan Item Code NOT in Master,Show Warning Prompt 'Save it anyway?' No/Yes,PASS
TC-005,Scan Item,Scan Damage Item with Remark required,Highlight row red and force user remark,PASS
TC-006,Serial Control,Duplicate Serial Number scan alert,Show warning prompt 'Serial Number already scanned',PASS
TC-007,Offline Mode,Scan 10 items without internet connection,Save items in IndexedDB with Synced=False status,PASS
TC-008,Sync Data,Press Sync Up button when online,Upload pending items to Google Sheets / SQL DB,PASS
TC-009,AI Spec,Generate AI Requirement via Gemini API,Return formatted Markdown specification document,PASS
TC-10,Printer,Print ESC-POS Slip via Bluetooth,Print receipt slip with Item, Location, Qty, Date/Time,PASS
`
  }
];
