import * as XLSX from 'xlsx';
import { ItemMaster, LocationMaster, ScannedRecord } from '../types';

/**
 * Generates and downloads a multi-tab Excel (.xlsx) template specifically formatted for Google Sheets import.
 * Tab 1: ItemMaster
 * Tab 2: LocationMaster
 * Tab 3: ScannedStock (Ready for Count Stock results)
 */
export const downloadGoogleSheetsExcelTemplate = () => {
  const wb = XLSX.utils.book_new();

  // 1. ItemMaster Sheet
  const itemMasterData = [
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
  const wsItemMaster = XLSX.utils.json_to_sheet(itemMasterData);
  XLSX.utils.book_append_sheet(wb, wsItemMaster, "ItemMaster");

  // 2. LocationMaster Sheet
  const locationMasterData = [
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
  const wsLocationMaster = XLSX.utils.json_to_sheet(locationMasterData);
  XLSX.utils.book_append_sheet(wb, wsLocationMaster, "LocationMaster");

  // 3. ScannedStock Sheet (Header & Structure for stock count results)
  const scannedStockData = [
    {
      id: "REC-DEMO-001",
      CompanyCode: "OGA001",
      BranchCode: "HQ",
      LocationCode: "LOC-A01-01",
      LocationName: "Shelf A-01 ชั้น 1",
      ItemCode: "ITM001",
      ItemName: "แท็บเล็ตตรวจนับสต็อก OGA Pro 10",
      Barcode: "8850123456789",
      LotNumber: "-",
      ExpiryDate: "-",
      SerialNumber: "SN-2026-0001",
      QuantityScan: 1,
      Status: "NORMAL",
      ScannedBy: "Admin",
      ScanDate: new Date().toISOString().split('T')[0],
      ScanTime: "09:30:00",
      Synced: "TRUE"
    }
  ];
  const wsScannedStock = XLSX.utils.json_to_sheet(scannedStockData);
  XLSX.utils.book_append_sheet(wb, wsScannedStock, "ScannedStock");

  // Write and trigger download (.xlsx)
  const fileName = `OGA_CountStock_GoogleSheets_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Downloads a clean single-table CSV file with UTF-8 BOM so Thai text displays correctly in Excel and Google Sheets with ZERO #ERROR!
 */
export const downloadCleanCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  // \ufeff BOM ensures UTF-8 Thai language support in Excel / Google Sheets
  const csvRows = [
    headers.join(','),
    ...rows.map(r => r.map(cell => {
      const str = String(cell ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ];

  const blob = new Blob(['\ufeff' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Google Apps Script (GAS) ready-to-deploy code template
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * OGA Count Stock Mobile PDA - Google Sheets Sync Webhook (2026)
 * รองรับการรับข้อมูลสแกนนับสต็อก และการดึงข้อมูล Master Data จาก Google Sheets
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheets
 * 2. ไปที่เมนู Extensions (ส่วนขยาย) > Apps Script
 * 3. วางโค้ดนี้ทั้งหมดแทนที่โค้ดเดิม
 * 4. กดปุ่ม Deploy (ทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้ใหม่)
 * 5. เลือกประเภท: Web app (เว็บแอป)
 * 6. ตั้งค่า Execute as: Me (ฉัน)
 * 7. ตั้งค่า Who has access: Anyone (ทุกคน)
 * 8. กด Deploy และคัดลอก Web App URL นำไปใส่ในช่อง Webhook ของระบบ OGA
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check if ping or test connection
    var contents = e && e.postData ? e.postData.contents : null;
    if (!contents || e.parameter && e.parameter.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        connected: true,
        message: "OGA Count Stock Google Sheets Webhook is active and connected!",
        spreadsheetTitle: ss.getName(),
        sheets: ss.getSheets().map(function(s) { return s.getName(); }),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(contents);
    var action = payload.action || 'append_records';

    // 1. ACTION: LOAD MASTER DATA
    if (action === 'get_master') {
      var itemSheet = ss.getSheetByName('ItemMaster');
      var locationSheet = ss.getSheetByName('LocationMaster');
      
      var items = [];
      if (itemSheet) {
        var itemData = itemSheet.getDataRange().getValues();
        var itemHeaders = itemData[0];
        for (var i = 1; i < itemData.length; i++) {
          var row = itemData[i];
          if (row[0]) {
            items.push({
              ItemCode: String(row[0]),
              ItemName: String(row[1] || ''),
              Barcode: String(row[2] || row[0]),
              Barcode2: String(row[3] || ''),
              Category: String(row[4] || 'General'),
              Unit: String(row[5] || 'PCS'),
              QuantityPlan: Number(row[6] || 0),
              UseLot: String(row[7] || 'N'),
              UseSerial: String(row[8] || 'N'),
              UseExpiry: String(row[9] || 'N'),
              Remark: String(row[10] || '')
            });
          }
        }
      }

      var locations = [];
      if (locationSheet) {
        var locData = locationSheet.getDataRange().getValues();
        for (var j = 1; j < locData.length; j++) {
          var lRow = locData[j];
          if (lRow[0]) {
            locations.push({
              LocationCode: String(lRow[0]),
              LocationName: String(lRow[1] || ''),
              Zone: String(lRow[2] || 'A'),
              Warehouse: String(lRow[3] || 'Main'),
              LocationDescription: String(lRow[4] || ''),
              Active: String(lRow[5] || 'Y')
            });
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        itemsCount: items.length,
        locationsCount: locations.length,
        items: items,
        locations: locations
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ACTION: APPEND SCANNED STOCK RECORDS
    var sheetName = payload.tabName || 'ScannedStock';
    var sheet = ss.getSheetByName(sheetName);
    
    // Auto-create ScannedStock tab if not existing
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        "ID", "CompanyCode", "BranchCode", "LocationCode", "LocationName",
        "ItemCode", "ItemName", "Barcode", "LotNumber", "ExpiryDate",
        "SerialNumber", "QuantityScan", "Status", "ScannedBy", "ScanDate", "ScanTime", "SyncedAt"
      ]);
      sheet.getRange(1, 1, 1, 17).setFontWeight("bold").setBackground("#e0f2fe");
    }

    var records = payload.records || [];
    var rowsToAppend = [];
    var nowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    for (var k = 0; k < records.length; k++) {
      var r = records[k];
      rowsToAppend.push([
        r.id || ("REC-" + new Date().getTime() + "-" + k),
        r.CompanyCode || payload.companyCode || "OGA001",
        r.BranchCode || payload.branchCode || "HQ",
        r.LocationCode || "",
        r.LocationName || "",
        r.ItemCode || "",
        r.ItemName || "",
        r.Barcode || "",
        r.LotNumber || "-",
        r.ExpiryDate || "-",
        r.SerialNumber || "-",
        Number(r.QuantityScan || 1),
        r.Status || "NORMAL",
        r.ScannedBy || "Admin",
        r.ScanDate || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"),
        r.ScanTime || Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss"),
        nowStr
      ]);
    }

    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 17).setValues(rowsToAppend);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: 200,
      message: "Successfully appended " + rowsToAppend.length + " records to Google Sheet '" + sheetName + "'",
      appendedRows: rowsToAppend.length,
      tabName: sheetName,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      status: 500,
      error: err.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
