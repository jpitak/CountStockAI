import { QRCodeProfile, QRCodeParseResult, QRFieldType } from '../types';

export const AUTO_DETECT_PROFILE_ID = 'auto';

export const DEFAULT_QR_PROFILES: QRCodeProfile[] = [
  {
    id: 'auto',
    name: '⚡ อัตโนมัติ (Auto-Detect รูปแบบ QR ทุกประเภท 1-10)',
    description: 'ตรวจจับและแยกฟิลด์อัตโนมัติ: Item, Lot, Expiry, Serial, Qty ตามตัวคั่น Comma (,), Semi-colon (;), Pipe (|)',
    delimiter: '',
    exampleString: '8850123456789,L1 หรือ 1002,L02 หรือ I00001;Desc;SN99',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: true,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true }
    ]
  },
  {
    id: 'qr-single-item',
    name: '1. Item / Barcode (รหัสสินค้าเดี่ยว)',
    description: 'สแกนเฉพาะ Item Code / Barcode (เช่น 8850123456789 หรือ I00001)',
    delimiter: '',
    exampleString: '8850123456789',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code / Barcode', required: true }
    ]
  },
  {
    id: 'qr-item-lot',
    name: '2. Item,lot (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,lot (เช่น 8850123456789,L1 หรือ 1002,L02)',
    delimiter: ',',
    exampleString: '8850123456789,L1',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'lot_number', label: 'Lot Number' }
    ]
  },
  {
    id: 'qr-item-lot-exp-qty',
    name: '3. Item,lot,expiry date,qty (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,lot,expiry date,qty (เช่น I00002,LOT-AUG-01,2026-12-31,25)',
    delimiter: ',',
    exampleString: 'I00002,LOT-AUG-01,2026-12-31,25',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'lot_number', label: 'Lot Number' },
      { position: 2, fieldName: 'expiry_date', label: 'Expiry Date', dateFormat: 'YYYY-MM-DD' },
      { position: 3, fieldName: 'quantity', label: 'Quantity (จำนวน)' }
    ]
  },
  {
    id: 'qr-item-exp',
    name: '4. Item,expiry date (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,expiry date (เช่น 8850123456789,2026-12-31)',
    delimiter: ',',
    exampleString: '8850123456789,2026-12-31',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'expiry_date', label: 'Expiry Date', dateFormat: 'YYYY-MM-DD' }
    ]
  },
  {
    id: 'qr-item-lot-exp',
    name: '5. Item,lot,expiry date (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,lot,expiry date (เช่น 8850123456789,L1,2026-12-31)',
    delimiter: ',',
    exampleString: '8850123456789,L1,2026-12-31',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'lot_number', label: 'Lot Number' },
      { position: 2, fieldName: 'expiry_date', label: 'Expiry Date', dateFormat: 'YYYY-MM-DD' }
    ]
  },
  {
    id: 'qr-item-lot-serial',
    name: '6. Item,lot,serial (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,lot,serial (เช่น 8850123456789,L1,SN99881)',
    delimiter: ',',
    exampleString: '8850123456789,L1,SN99881',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'lot_number', label: 'Lot Number' },
      { position: 2, fieldName: 'serial_number', label: 'Serial Number' }
    ]
  },
  {
    id: 'qr-item-exp-serial',
    name: '7. Item,expiry date,serial (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,expiry date,serial (เช่น 8850123456789,2026-12-31,SN99881)',
    delimiter: ',',
    exampleString: '8850123456789,2026-12-31,SN99881',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'expiry_date', label: 'Expiry Date', dateFormat: 'YYYY-MM-DD' },
      { position: 2, fieldName: 'serial_number', label: 'Serial Number' }
    ]
  },
  {
    id: 'qr-item-desc-serial',
    name: '8. Item;Description;Serial (คั่นด้วย Semi-colon ;)',
    description: 'รูปแบบ Item;Description;Serial (เช่น I00001;Sample Motor;SN-2026-9988)',
    delimiter: ';',
    exampleString: 'I00001;Sample Motor;SN-2026-9988',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'item_name', label: 'Description / Item Name' },
      { position: 2, fieldName: 'serial_number', label: 'Serial Number' }
    ]
  },
  {
    id: 'qr-item-serial-direct',
    name: '8.1 Item,serial (คั่นด้วย Comma ,)',
    description: 'รูปแบบ Item,serial (เช่น 8850123456789,SN-2026-9988)',
    delimiter: ',',
    exampleString: '8850123456789,SN-2026-9988',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'serial_number', label: 'Serial Number' }
    ]
  },
  {
    id: 'qr-pipe-full',
    name: '9. Pipe / All-in-One (Item|Lot|Expiry|Serial|Qty)',
    description: 'รูปแบบ Item|Lot|Expiry|Serial|Qty (เช่น 8850123456789|L1|2026-12-31|SN9988|1)',
    delimiter: '|',
    exampleString: '8850123456789|L1|2026-12-31|SN9988|1',
    stripQuotes: true,
    trimSpaces: true,
    isDefault: false,
    fields: [
      { position: 0, fieldName: 'item_code', label: 'Item Code', required: true },
      { position: 1, fieldName: 'lot_number', label: 'Lot Number' },
      { position: 2, fieldName: 'expiry_date', label: 'Expiry Date' },
      { position: 3, fieldName: 'serial_number', label: 'Serial Number' },
      { position: 4, fieldName: 'quantity', label: 'Quantity' }
    ]
  }
];

export const QR_FIELD_OPTIONS: Array<{ value: QRFieldType; label: string; icon: string }> = [
  { value: 'item_code', label: 'Item Code / Barcode (รหัสสินค้า)', icon: '📦' },
  { value: 'item_name', label: 'Item Name / Description (ชื่อ/รายละเอียด)', icon: '📝' },
  { value: 'serial_number', label: 'Serial Number (หมายเลขซีเรียล)', icon: '🔢' },
  { value: 'lot_number', label: 'Lot Number / Batch (เลขล็อต)', icon: '🏷️' },
  { value: 'expiry_date', label: 'Expiry Date (วันหมดอายุ)', icon: '📅' },
  { value: 'quantity', label: 'Quantity (จำนวนที่นับ)', icon: '📊' },
  { value: 'location_code', label: 'Location Code (รหัสสถานที่)', icon: '🏢' },
  { value: 'unit', label: 'Unit of Measure (หน่วยนับ)', icon: '📏' },
  { value: 'remark', label: 'Remark / Note (หมายเหตุ)', icon: '💬' },
  { value: 'ignore', label: 'Ignore / ข้ามฟิลด์นี้', icon: '⛔' }
];

export const isDatePattern = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim().replace(/['"]/g, '');
  if (/^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/.test(clean)) return true;
  if (/^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/.test(clean)) return true;
  if (/^\d{8}$/.test(clean)) {
    const year = parseInt(clean.slice(0, 4), 10);
    const month = parseInt(clean.slice(4, 6), 10);
    const day = parseInt(clean.slice(6, 8), 10);
    if (year >= 2000 && year <= 2099 && month >= 1 && month <= 12 && day >= 1 && day <= 31) return true;
  }
  if (/^\d{6}$/.test(clean)) {
    const month = parseInt(clean.slice(2, 4), 10);
    const day = parseInt(clean.slice(4, 6), 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return true;
  }
  return false;
};

export const isSerialPattern = (str: string): boolean => {
  if (!str) return false;
  const clean = str.trim();
  if (/^(SN|S\/N|SERIAL|SER)[\-_:\s]?/i.test(clean)) return true;
  return false;
};

export const normalizeExpiryDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.trim().replace(/['"]/g, '');

  // 1. Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // 2. Match YYYYMMDD (e.g. 20261231)
  if (/^\d{8}$/.test(clean)) {
    const year = clean.slice(0, 4);
    const month = clean.slice(4, 6);
    const day = clean.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  // 3. Match YYMMDD (GS1 AI 17 format e.g. 261231)
  if (/^\d{6}$/.test(clean)) {
    const yy = clean.slice(0, 2);
    const year = `20${yy}`;
    const month = clean.slice(2, 4);
    const day = clean.slice(4, 6);
    return `${year}-${month}-${day}`;
  }

  // 4. Match DD/MM/YYYY or DD-MM-YYYY
  const parts = clean.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${parts[0]}-${m}-${d}`;
    } else if (parts[2].length === 4) {
      // DD/MM/YYYY
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return `${parts[2]}-${m}-${d}`;
    }
  }

  return clean;
};

export const parseQRCodeWithProfile = (
  rawText: string,
  profile: QRCodeProfile
): QRCodeParseResult => {
  if (!rawText || !rawText.trim()) {
    return {
      raw: rawText || '',
      success: false,
      error: 'Empty QR code content',
      extractedFields: []
    };
  }

  let text = rawText.trim();
  if (profile.stripQuotes) {
    text = text.replace(/^["']|["']$/g, '');
  }

  // Single Item Code mode
  if (!profile.delimiter) {
    const itemCode = profile.trimSpaces ? text.trim() : text;
    return {
      raw: rawText,
      matchedProfileId: profile.id,
      matchedProfileName: profile.name,
      success: true,
      itemCode,
      extractedFields: [
        { field: 'item_code', label: 'Item Code', value: itemCode }
      ]
    };
  }

  // Split tokens by delimiter with robust trimming
  const tokens = text.split(profile.delimiter).map(t => {
    let tok = t.trim();
    if (profile.stripQuotes) tok = tok.replace(/^["']|["']$/g, '').trim();
    return tok;
  });

  const result: QRCodeParseResult = {
    raw: rawText,
    matchedProfileId: profile.id,
    matchedProfileName: profile.name,
    success: true,
    extractedFields: []
  };

  profile.fields.forEach(mapping => {
    const val = tokens[mapping.position] !== undefined ? tokens[mapping.position] : '';
    if (val !== '') {
      result.extractedFields.push({
        field: mapping.fieldName,
        label: mapping.label,
        value: val
      });

      switch (mapping.fieldName) {
        case 'item_code':
          result.itemCode = val;
          break;
        case 'item_name':
          result.itemName = val;
          break;
        case 'serial_number':
          result.serialNumber = val;
          break;
        case 'lot_number':
          result.lotNumber = val;
          break;
        case 'expiry_date':
          result.expiryDate = normalizeExpiryDate(val);
          break;
        case 'quantity': {
          const num = parseFloat(val);
          if (!isNaN(num) && num > 0) {
            result.quantity = num;
          }
          break;
        }
        case 'location_code':
          result.locationCode = val;
          break;
        case 'unit':
          result.unit = val;
          break;
        case 'remark':
          result.remark = val;
          break;
        case 'ignore':
        default:
          break;
      }
    }
  });

  // Validation: Check if required Item Code was extracted
  if (!result.itemCode && tokens.length > 0) {
    result.itemCode = tokens[0];
  }

  return result;
};

/**
 * Intelligent Auto-Detection and Parser for all 10 counting combinations:
 * 1. item qty
 * 2. item + lot qty
 * 3. item + lot + expiry Date qty
 * 4. item + expiry qty
 * 5. item lot + expiry Date qty
 * 6. item lot + serial qty
 * 7. item expiry Date + serial qty
 * 8. item + serial qty
 * 9. item lot + expiry Date + serial qty
 * 10. serial auto +qty 1 auto select item
 */
export const autoDetectAndParseQRCode = (
  rawText: string,
  profiles: QRCodeProfile[],
  activeProfileId?: string
): QRCodeParseResult => {
  if (!rawText || !rawText.trim()) {
    return {
      raw: rawText,
      success: false,
      error: 'Empty QR code',
      extractedFields: []
    };
  }

  const trimmed = rawText.trim();

  // If a specific non-auto profile was selected AND the string actually matches its delimiter:
  if (activeProfileId && activeProfileId !== 'auto') {
    const selectedProfile = profiles.find(p => p.id === activeProfileId);
    if (selectedProfile) {
      if (selectedProfile.delimiter && trimmed.includes(selectedProfile.delimiter)) {
        return parseQRCodeWithProfile(trimmed, selectedProfile);
      }
      if (!selectedProfile.delimiter && !trimmed.includes(',') && !trimmed.includes(';') && !trimmed.includes('|')) {
        return parseQRCodeWithProfile(trimmed, selectedProfile);
      }
    }
  }

  // --- AUTO-DETECTION ENGINE ---

  // 1. Comma Delimited (,)
  if (trimmed.includes(',')) {
    const tokens = trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    const itemCode = tokens[0] || '';
    const res: QRCodeParseResult = {
      raw: rawText,
      success: true,
      itemCode,
      extractedFields: [
        { field: 'item_code', label: 'Item Code', value: itemCode }
      ]
    };

    if (tokens.length === 2) {
      const tok1 = tokens[1];
      if (isDatePattern(tok1)) {
        // Combination 4: Item,Expiry
        const exp = normalizeExpiryDate(tok1);
        res.expiryDate = exp;
        res.matchedProfileId = 'qr-item-exp';
        res.matchedProfileName = '4. Item,expiry date';
        res.extractedFields.push({ field: 'expiry_date', label: 'Expiry Date', value: exp });
      } else if (isSerialPattern(tok1)) {
        // Combination 8: Item,Serial
        res.serialNumber = tok1;
        res.quantity = 1;
        res.matchedProfileId = 'qr-item-serial-direct';
        res.matchedProfileName = '8. Item,serial';
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: tok1 });
      } else {
        // Combination 2: Item,Lot (e.g. "8850123456789,L1" or "1002,L02")
        res.lotNumber = tok1;
        res.matchedProfileId = 'qr-item-lot';
        res.matchedProfileName = '2. Item,lot';
        res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: tok1 });
      }
      return res;
    }

    if (tokens.length === 3) {
      const tok1 = tokens[1];
      const tok2 = tokens[2];

      // Check if tok2 is Quantity number
      const maybeQty = parseFloat(tok2);
      const isTok2Qty = !isNaN(maybeQty) && maybeQty > 0 && !isDatePattern(tok2) && !isSerialPattern(tok2);

      if (isDatePattern(tok1) && isTok2Qty) {
        // Item, Expiry, Qty
        res.expiryDate = normalizeExpiryDate(tok1);
        res.quantity = maybeQty;
        res.matchedProfileId = 'qr-item-exp-qty';
        res.matchedProfileName = '4. Item,expiry date,qty';
        res.extractedFields.push({ field: 'expiry_date', label: 'Expiry Date', value: res.expiryDate });
        res.extractedFields.push({ field: 'quantity', label: 'Quantity', value: tok2 });
      } else if (isDatePattern(tok1) && isSerialPattern(tok2)) {
        // Combination 7: Item, Expiry, Serial
        res.expiryDate = normalizeExpiryDate(tok1);
        res.serialNumber = tok2;
        res.quantity = 1;
        res.matchedProfileId = 'qr-item-exp-serial';
        res.matchedProfileName = '7. Item,expiry date,serial';
        res.extractedFields.push({ field: 'expiry_date', label: 'Expiry Date', value: res.expiryDate });
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: tok2 });
      } else if (isDatePattern(tok2)) {
        // Combination 5: Item, Lot, Expiry Date (e.g. 8850123456789,L1,2026-12-31)
        res.lotNumber = tok1;
        res.expiryDate = normalizeExpiryDate(tok2);
        res.matchedProfileId = 'qr-item-lot-exp';
        res.matchedProfileName = '5. Item,lot,expiry date';
        res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: tok1 });
        res.extractedFields.push({ field: 'expiry_date', label: 'Expiry Date', value: res.expiryDate });
      } else if (isSerialPattern(tok2)) {
        // Combination 6: Item, Lot, Serial (e.g. 8850123456789,L1,SN99881)
        res.lotNumber = tok1;
        res.serialNumber = tok2;
        res.quantity = 1;
        res.matchedProfileId = 'qr-item-lot-serial';
        res.matchedProfileName = '6. Item,lot,serial';
        res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: tok1 });
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: tok2 });
      } else if (isTok2Qty) {
        // Item, Lot, Qty (e.g. 8850123456789,L1,10)
        res.lotNumber = tok1;
        res.quantity = maybeQty;
        res.matchedProfileId = 'qr-item-lot-qty';
        res.matchedProfileName = '2. Item,lot,qty';
        res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: tok1 });
        res.extractedFields.push({ field: 'quantity', label: 'Quantity', value: tok2 });
      } else {
        // Default 3 tokens: Item, Lot, Description / Serial
        res.lotNumber = tok1;
        res.serialNumber = tok2;
        res.matchedProfileId = 'qr-item-lot-serial';
        res.matchedProfileName = '6. Item,lot,serial';
        res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: tok1 });
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: tok2 });
      }
      return res;
    }

    if (tokens.length === 4) {
      // Combination 3: Item, Lot, Expiry Date, Qty (e.g. I00002,LOT-AUG-01,2026-12-31,25)
      // Or: Item, Lot, Expiry, Serial
      const tok1 = tokens[1];
      const tok2 = tokens[2];
      const tok3 = tokens[3];

      res.lotNumber = tok1;
      res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: tok1 });

      if (isDatePattern(tok2)) {
        res.expiryDate = normalizeExpiryDate(tok2);
        res.extractedFields.push({ field: 'expiry_date', label: 'Expiry Date', value: res.expiryDate });

        const qtyNum = parseFloat(tok3);
        if (!isNaN(qtyNum) && qtyNum > 0 && !isSerialPattern(tok3)) {
          res.quantity = qtyNum;
          res.matchedProfileId = 'qr-item-lot-exp-qty';
          res.matchedProfileName = '3. Item,lot,expiry date,qty';
          res.extractedFields.push({ field: 'quantity', label: 'Quantity', value: tok3 });
        } else {
          res.serialNumber = tok3;
          res.quantity = 1;
          res.matchedProfileId = 'qr-item-lot-exp-serial';
          res.matchedProfileName = '9. Item,lot,expiry date,serial';
          res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: tok3 });
        }
      } else if (isSerialPattern(tok2)) {
        res.serialNumber = tok2;
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: tok2 });
        res.quantity = 1;
      }
      return res;
    }

    if (tokens.length >= 5) {
      // Combination 9: Item, Lot, Expiry Date, Serial Number, Quantity
      res.lotNumber = tokens[1];
      res.expiryDate = normalizeExpiryDate(tokens[2]);
      res.serialNumber = tokens[3];
      const qtyNum = parseFloat(tokens[4]);
      res.quantity = (!isNaN(qtyNum) && qtyNum > 0) ? qtyNum : 1;
      res.matchedProfileId = 'qr-pipe-full';
      res.matchedProfileName = '9. Full Multi-field';
      res.extractedFields.push(
        { field: 'lot_number', label: 'Lot Number', value: res.lotNumber },
        { field: 'expiry_date', label: 'Expiry Date', value: res.expiryDate },
        { field: 'serial_number', label: 'Serial Number', value: res.serialNumber },
        { field: 'quantity', label: 'Quantity', value: String(res.quantity) }
      );
      return res;
    }
  }

  // 2. Semi-colon Delimited (;)
  if (trimmed.includes(';')) {
    const semiTokens = trimmed.split(';').map(s => s.trim().replace(/^["']|["']$/g, ''));
    const itemCode = semiTokens[0] || '';
    const res: QRCodeParseResult = {
      raw: rawText,
      success: true,
      itemCode,
      matchedProfileId: 'qr-item-desc-serial',
      matchedProfileName: '8. Item;Description;Serial',
      extractedFields: [
        { field: 'item_code', label: 'Item Code', value: itemCode }
      ]
    };

    if (semiTokens.length === 2) {
      if (isSerialPattern(semiTokens[1])) {
        res.serialNumber = semiTokens[1];
        res.quantity = 1;
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: semiTokens[1] });
      } else {
        res.itemName = semiTokens[1];
        res.extractedFields.push({ field: 'item_name', label: 'Description', value: semiTokens[1] });
      }
      return res;
    }

    if (semiTokens.length >= 3) {
      res.itemName = semiTokens[1];
      res.serialNumber = semiTokens[2];
      res.quantity = 1;
      res.extractedFields.push(
        { field: 'item_name', label: 'Description', value: semiTokens[1] },
        { field: 'serial_number', label: 'Serial Number', value: semiTokens[2] }
      );
      return res;
    }
  }

  // 3. Pipe Delimited (|)
  if (trimmed.includes('|')) {
    const pipeTokens = trimmed.split('|').map(s => s.trim().replace(/^["']|["']$/g, ''));
    const itemCode = pipeTokens[0] || '';
    const res: QRCodeParseResult = {
      raw: rawText,
      success: true,
      itemCode,
      matchedProfileId: 'qr-pipe-full',
      matchedProfileName: '9. Pipe Delimited',
      extractedFields: [
        { field: 'item_code', label: 'Item Code', value: itemCode }
      ]
    };

    if (pipeTokens.length >= 2 && pipeTokens[1]) {
      res.lotNumber = pipeTokens[1];
      res.extractedFields.push({ field: 'lot_number', label: 'Lot Number', value: pipeTokens[1] });
    }
    if (pipeTokens.length >= 3 && pipeTokens[2]) {
      if (isDatePattern(pipeTokens[2])) {
        res.expiryDate = normalizeExpiryDate(pipeTokens[2]);
        res.extractedFields.push({ field: 'expiry_date', label: 'Expiry Date', value: res.expiryDate });
      } else {
        res.serialNumber = pipeTokens[2];
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: pipeTokens[2] });
      }
    }
    if (pipeTokens.length >= 4 && pipeTokens[3]) {
      if (isSerialPattern(pipeTokens[3]) || !res.serialNumber) {
        res.serialNumber = pipeTokens[3];
        res.extractedFields.push({ field: 'serial_number', label: 'Serial Number', value: pipeTokens[3] });
      } else {
        const qtyNum = parseFloat(pipeTokens[3]);
        if (!isNaN(qtyNum) && qtyNum > 0) res.quantity = qtyNum;
      }
    }
    if (pipeTokens.length >= 5 && pipeTokens[4]) {
      const qtyNum = parseFloat(pipeTokens[4]);
      if (!isNaN(qtyNum) && qtyNum > 0) {
        res.quantity = qtyNum;
      } else {
        res.remark = pipeTokens[4];
      }
    }
    return res;
  }

  // 4. Default: Single Item Code (Combination 1)
  const singleProfile = profiles.find(p => p.id === 'qr-single-item') || DEFAULT_QR_PROFILES[1];
  return parseQRCodeWithProfile(trimmed, singleProfile);
};
