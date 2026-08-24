import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Screen Mockup Generator for OGA Count Stock AI (Rev.05)
 * Generates 15 crisp PNG buffers replicating the 15 mobile PDA app screenshots.
 */

// Load Thai Font TTF as Base64 for embedding directly inside SVG <style>
let fontRegularBase64 = '';
let fontBoldBase64 = '';

try {
  const regularPaths = [
    path.join(process.cwd(), 'src/assets/fonts/Sarabun-Regular.ttf'),
    '/root/.fonts/Sarabun-Regular.ttf',
    '/root/.local/share/fonts/Sarabun-Regular.ttf'
  ];
  for (const p of regularPaths) {
    if (fs.existsSync(p)) {
      fontRegularBase64 = fs.readFileSync(p).toString('base64');
      break;
    }
  }

  const boldPaths = [
    path.join(process.cwd(), 'src/assets/fonts/Sarabun-Bold.ttf'),
    '/root/.fonts/Sarabun-Bold.ttf',
    '/root/.local/share/fonts/Sarabun-Bold.ttf'
  ];
  for (const p of boldPaths) {
    if (fs.existsSync(p)) {
      fontBoldBase64 = fs.readFileSync(p).toString('base64');
      break;
    }
  }
} catch (err) {
  console.warn('Font loading note:', err);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapMobilePDA(title: string, contentSvg: string, width = 420, height = 700): string {
  const fontStyle = fontRegularBase64 ? `
    @font-face {
      font-family: 'ThaiFont';
      src: url(data:font/truetype;charset=utf-8;base64,${fontRegularBase64}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'ThaiFont';
      src: url(data:font/truetype;charset=utf-8;base64,${fontBoldBase64 || fontRegularBase64}) format('truetype');
      font-weight: bold;
      font-style: normal;
    }
  ` : '';

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <style>
        ${fontStyle}
        text, tspan {
          font-family: 'ThaiFont', 'Sarabun', 'Noto Sans Thai', 'TH Sarabun New', sans-serif;
        }
      </style>
      <filter id="shadow" x="-5%" y="-3%" width="110%" height="106%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
      </filter>
    </defs>

    <!-- Outer Phone/PDA Frame -->
    <rect width="${width}" height="${height}" rx="24" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2"/>

    <!-- Status Bar (OGA PDA | Admin | ONLINE | v2.4.0 | 98%) -->
    <rect x="0" y="0" width="${width}" height="32" rx="24" fill="#0F172A"/>
    <rect x="0" y="20" width="${width}" height="12" fill="#0F172A"/>
    
    <text x="14" y="21" fill="#94A3B8" font-size="10" font-weight="bold">📱 OGA PDA</text>
    <rect x="72" y="10" width="56" height="15" rx="7" fill="#3B82F6" fill-opacity="0.3"/>
    <text x="78" y="21" fill="#93C5FD" font-size="9" font-weight="bold">👤 Admin</text>
    
    <circle cx="210" cy="17" r="3" fill="#10B981"/>
    <text x="218" y="21" fill="#10B981" font-size="9" font-weight="bold">ONLINE</text>
    
    <text x="280" y="21" fill="#64748B" font-size="9">v2.4.0</text>
    <text x="360" y="21" fill="#94A3B8" font-size="9">🔋 98%</text>

    <!-- App Top Navigation Bar -->
    <rect x="0" y="32" width="${width}" height="42" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <text x="14" y="58" fill="#1E293B" font-size="16" font-weight="bold">←</text>
    <text x="40" y="58" fill="#1E293B" font-size="14" font-weight="bold">${escapeXml(title)}</text>
    <rect x="${width - 120}" y="40" width="76" height="24" rx="12" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
    <text x="${width - 110}" y="56" fill="#2563EB" font-size="10" font-weight="bold">✨ AI Assistant</text>
    <text x="${width - 30}" y="58" fill="#64748B" font-size="16">☰</text>

    <!-- Content Area -->
    <g transform="translate(12, 82)">
      ${contentSvg}
    </g>

    <!-- Bottom Navigation Bar -->
    <g transform="translate(0, ${height - 50})">
      <rect x="0" y="0" width="${width}" height="50" rx="0" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
      <!-- Home -->
      <text x="40" y="24" fill="#64748B" font-size="14" text-anchor="middle">🏠</text>
      <text x="40" y="38" fill="#64748B" font-size="9" text-anchor="middle">HOME</text>
      <!-- Scan -->
      <text x="125" y="24" fill="#64748B" font-size="14" text-anchor="middle">📷</text>
      <text x="125" y="38" fill="#64748B" font-size="9" text-anchor="middle">SCAN</text>
      <!-- View -->
      <text x="210" y="24" fill="#64748B" font-size="14" text-anchor="middle">📋</text>
      <text x="210" y="38" fill="#64748B" font-size="9" text-anchor="middle">VIEW</text>
      <!-- AI -->
      <text x="295" y="24" fill="#64748B" font-size="14" text-anchor="middle">🤖</text>
      <text x="295" y="38" fill="#64748B" font-size="9" text-anchor="middle">AI</text>
      <!-- Set -->
      <text x="380" y="24" fill="#64748B" font-size="14" text-anchor="middle">⚙️</text>
      <text x="380" y="38" fill="#64748B" font-size="9" text-anchor="middle">SET</text>
    </g>
  </svg>
  `;
}

// 1. Image 1: Home Dashboard SVG
export function getHomeScreenSvg(): string {
  const content = `
    <!-- Top Hero Banner -->
    <rect x="0" y="0" width="396" height="110" rx="16" fill="#4F46E5" filter="url(#shadow)"/>
    <circle cx="48" cy="55" r="28" fill="#4338CA"/>
    <text x="34" y="64" fill="#FFFFFF" font-size="26">📋</text>
    <text x="90" y="44" fill="#FFFFFF" font-size="16" font-weight="bold">COUNT STOCK MASTER</text>
    <text x="90" y="64" fill="#C7D2FE" font-size="11">OGA INTERNATIONAL CO., LTD.</text>
    <rect x="90" y="74" width="70" height="18" rx="9" fill="#312E81"/>
    <text x="100" y="87" fill="#FDE047" font-size="9" font-weight="bold">ROLE: ADMIN</text>
    <circle cx="175" cy="83" r="3" fill="#10B981"/>
    <text x="183" y="87" fill="#A7F3D0" font-size="9">ONLINE</text>

    <!-- KPI Summary Pills -->
    <g transform="translate(0, 118)">
      <rect x="0" y="0" width="192" height="42" rx="12" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
      <circle cx="20" cy="21" r="10" fill="#3B82F6"/>
      <text x="15" y="26" fill="#FFFFFF" font-size="12">📷</text>
      <text x="38" y="18" fill="#64748B" font-size="9" font-weight="bold">SCANNED TOTAL</text>
      <text x="38" y="34" fill="#1E3A8A" font-size="14" font-weight="bold">1 <tspan font-size="10" font-weight="normal">Items</tspan></text>

      <rect x="204" y="0" width="192" height="42" rx="12" fill="#F5F3FF" stroke="#DDD6FE" stroke-width="1"/>
      <circle cx="224" cy="21" r="10" fill="#8B5CF6"/>
      <text x="219" y="26" fill="#FFFFFF" font-size="12">📄</text>
      <text x="242" y="18" fill="#64748B" font-size="9" font-weight="bold">RECORDS</text>
      <text x="242" y="34" fill="#5B21B6" font-size="14" font-weight="bold">1 <tspan font-size="10" font-weight="normal">Logs</tspan></text>
    </g>

    <!-- Master Data Section -->
    <text x="2" y="176" fill="#64748B" font-size="9" font-weight="bold">MASTER DATA</text>
    <g transform="translate(0, 182)">
      <rect x="0" y="0" width="192" height="52" rx="14" fill="#4F46E5" filter="url(#shadow)"/>
      <text x="96" y="24" fill="#FFFFFF" font-size="14" text-anchor="middle">📦</text>
      <text x="96" y="42" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">ITEM MASTER</text>

      <rect x="204" y="0" width="192" height="52" rx="14" fill="#6366F1" filter="url(#shadow)"/>
      <text x="300" y="24" fill="#FFFFFF" font-size="14" text-anchor="middle">🏢</text>
      <text x="300" y="42" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">LOCATION</text>
    </g>

    <!-- Transaction Data Section -->
    <text x="2" y="248" fill="#64748B" font-size="9" font-weight="bold">TRANSACTION DATA</text>
    <g transform="translate(0, 254)">
      <rect x="0" y="0" width="192" height="52" rx="14" fill="#EF4444" filter="url(#shadow)"/>
      <text x="96" y="24" fill="#FFFFFF" font-size="14" text-anchor="middle">📷</text>
      <text x="96" y="42" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">SCAN ITEM</text>

      <rect x="204" y="0" width="192" height="52" rx="14" fill="#10B981" filter="url(#shadow)"/>
      <text x="300" y="24" fill="#FFFFFF" font-size="14" text-anchor="middle">📋</text>
      <text x="300" y="42" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">VIEW LOGS</text>
    </g>

    <!-- User Manual SOP Card -->
    <g transform="translate(0, 314)">
      <rect x="0" y="0" width="396" height="86" rx="16" fill="#047857" stroke="#10B981" stroke-width="1.5" filter="url(#shadow)"/>
      <circle cx="28" cy="30" r="14" fill="#065F46"/>
      <text x="20" y="36" fill="#FFFFFF" font-size="14">📑</text>
      <text x="50" y="24" fill="#FFFFFF" font-size="12" font-weight="bold">คู่มือปฏิบัติงานระบบตรวจนับสต็อก</text>
      <rect x="265" y="12" width="60" height="16" rx="8" fill="#34D399"/>
      <text x="272" y="24" fill="#064E3B" font-size="8" font-weight="bold">Word 16PT</text>
      <text x="50" y="38" fill="#A7F3D0" font-size="9">อธิบายละเอียดทุกหน้าจอ การใช้ปุ่ม นำเข้า/ส่งออก พร้อมตัวอย่าง</text>
      
      <!-- Download Buttons -->
      <rect x="12" y="52" width="115" height="26" rx="10" fill="#10B981"/>
      <text x="24" y="69" fill="#064E3B" font-size="10" font-weight="bold">📦 ดาวน์โหลด .ZIP</text>
      
      <rect x="135" y="52" width="120" height="26" rx="10" fill="#FFFFFF"/>
      <text x="145" y="69" fill="#1E293B" font-size="10" font-weight="bold">📄 ดาวน์โหลด .DOCX</text>

      <rect x="262" y="52" width="120" height="26" rx="10" fill="#FEE2E2"/>
      <text x="274" y="69" fill="#991B1B" font-size="10" font-weight="bold">📑 ดาวน์โหลด .PDF</text>
    </g>

    <!-- QR Code & System Settings Section -->
    <g transform="translate(0, 408)">
      <rect x="0" y="0" width="396" height="42" rx="12" fill="#1E1B4B" filter="url(#shadow)"/>
      <text x="14" y="26" fill="#FDE047" font-size="14">⚙️</text>
      <text x="36" y="20" fill="#FFFFFF" font-size="11" font-weight="bold">QR CODE SETTINGS</text>
      <text x="36" y="34" fill="#94A3B8" font-size="8">ตั้งค่าโครงสร้าง QR Code และตัวตัดคำ</text>
      <rect x="330" y="10" width="52" height="22" rx="6" fill="#4338CA"/>
      <text x="340" y="25" fill="#FFFFFF" font-size="9" font-weight="bold">CONFIG</text>
    </g>

    <g transform="translate(0, 456)">
      <rect x="0" y="0" width="396" height="42" rx="12" fill="#0F172A" filter="url(#shadow)"/>
      <text x="14" y="26" fill="#38BDF8" font-size="14">🛠️</text>
      <text x="36" y="20" fill="#FFFFFF" font-size="11" font-weight="bold">SYSTEM SETTINGS</text>
      <text x="36" y="34" fill="#94A3B8" font-size="8">ตั้งค่าบริษัท สาขา รอบการตรวจนับ</text>
      <rect x="344" y="10" width="38" height="22" rx="6" fill="#334155"/>
      <text x="354" y="25" fill="#FFFFFF" font-size="9" font-weight="bold">SET</text>
    </g>
  `;
  return wrapMobilePDA("COUNT STOCK", content, 420, 680);
}

// 2. Image 2: Item Master Screen SVG (5 Sample Items)
export function getItemMasterSvg(): string {
  const content = `
    <!-- Selected Server File Bar -->
    <rect x="0" y="0" width="396" height="34" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
    <text x="10" y="14" fill="#64748B" font-size="8" font-weight="bold">SELECTED SERVER FILE</text>
    <text x="10" y="26" fill="#2563EB" font-size="10" font-weight="bold">📄 ItemMaster_Template4.xlsx</text>
    <rect x="300" y="6" width="86" height="22" rx="6" fill="#2563EB"/>
    <text x="312" y="21" fill="#FFFFFF" font-size="9" font-weight="bold">📁 SELECT FILE</text>

    <!-- Action Buttons Row -->
    <g transform="translate(0, 40)">
      <rect x="0" y="0" width="90" height="28" rx="8" fill="#EF4444"/>
      <text x="45" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Clear</text>

      <rect x="98" y="0" width="94" height="28" rx="8" fill="#10B981"/>
      <text x="145" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">📥 Import</text>

      <rect x="200" y="0" width="94" height="28" rx="8" fill="#3B82F6"/>
      <text x="247" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Export</text>

      <rect x="302" y="0" width="94" height="28" rx="8" fill="#8B5CF6"/>
      <text x="349" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Template</text>
    </g>

    <!-- Search Box -->
    <rect x="0" y="74" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="12" y="93" fill="#94A3B8" font-size="10">🔍 Search Item Code / Name</text>

    <text x="2" y="118" fill="#64748B" font-size="9">Total: 5 | Showing: 5</text>

    <!-- 5 Item Cards -->
    <g transform="translate(0, 126)">
      <!-- Item 1 -->
      <rect x="0" y="0" width="396" height="66" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="18" fill="#1E40AF" font-size="11" font-weight="bold">แท็บเล็ตตรวจนับสต็อก OGA Pro 10</text>
      <text x="12" y="32" fill="#334155" font-size="9">Code: <tspan font-weight="bold">ITM001</tspan> Barcode: <tspan font-weight="bold">8850123456789</tspan></text>
      <text x="12" y="46" fill="#64748B" font-size="9">Category: Hardware Unit: เครื่อง</text>
      <text x="12" y="58" fill="#0D5C3A" font-size="8">Description: แท็บเล็ตตรวจนับสต็อก OGA Pro 10 SN: - Qty(Plan): 100</text>

      <!-- Item 2 -->
      <rect x="0" y="72" width="396" height="66" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="90" fill="#1E40AF" font-size="11" font-weight="bold">เครื่องอ่านบาร์โค้ดไร้สาย 2D Bluetooth</text>
      <text x="12" y="104" fill="#334155" font-size="9">Code: <tspan font-weight="bold">ITM002</tspan> Barcode: <tspan font-weight="bold">8850123456796</tspan></text>
      <text x="12" y="118" fill="#64748B" font-size="9">Category: Scanner Unit: ตัว</text>
      <text x="12" y="130" fill="#0D5C3A" font-size="8">Description: เครื่องอ่านบาร์โค้ดไร้สาย 2D BT SN: - Qty(Plan): 50</text>

      <!-- Item 3 -->
      <rect x="0" y="144" width="396" height="66" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="162" fill="#1E40AF" font-size="11" font-weight="bold">สติ๊กเกอร์บาร์โค้ดความร้อน Direct Thermal 4x3</text>
      <text x="12" y="176" fill="#334155" font-size="9">Code: <tspan font-weight="bold">ITM003</tspan> Barcode: <tspan font-weight="bold">8850123456802</tspan></text>
      <text x="12" y="190" fill="#64748B" font-size="9">Category: Consumable Unit: ม้วน</text>
      <text x="12" y="202" fill="#0D5C3A" font-size="8">Description: สติ๊กเกอร์บาร์โค้ด 4x3 SN: - Qty(Plan): 200</text>

      <!-- Item 4 -->
      <rect x="0" y="216" width="396" height="66" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="234" fill="#1E40AF" font-size="11" font-weight="bold">ริบบอนบาร์โค้ด Wax Resin 110mm x 300m</text>
      <text x="12" y="248" fill="#334155" font-size="9">Code: <tspan font-weight="bold">ITM004</tspan> Barcode: <tspan font-weight="bold">8850123456819</tspan></text>
      <text x="12" y="262" fill="#64748B" font-size="9">Category: Consumable Unit: ม้วน</text>
      <text x="12" y="274" fill="#0D5C3A" font-size="8">Description: ริบบอน 110mm x 300m SN: - Qty(Plan): 150</text>

      <!-- Item 5 -->
      <rect x="0" y="288" width="396" height="66" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="306" fill="#1E40AF" font-size="11" font-weight="bold">เครื่องพิมพ์บาร์โค้ด Industrial Printer</text>
      <text x="12" y="320" fill="#334155" font-size="9">Code: <tspan font-weight="bold">ITM005</tspan> Barcode: <tspan font-weight="bold">8850123456826</tspan></text>
      <text x="12" y="334" fill="#64748B" font-size="9">Category: Printer Unit: เครื่อง</text>
      <text x="12" y="346" fill="#0D5C3A" font-size="8">Description: เครื่องพิมพ์บาร์โค้ด Industrial SN: - Qty(Plan): 20</text>
    </g>
  `;
  return wrapMobilePDA("ITEM MASTER", content, 420, 680);
}

// 3. Image 3: Location Master Screen SVG (5 Sample Locations)
export function getLocationMasterSvg(): string {
  const content = `
    <!-- Selected Server File Bar -->
    <rect x="0" y="0" width="396" height="34" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
    <text x="10" y="14" fill="#64748B" font-size="8" font-weight="bold">SELECTED SERVER FILE</text>
    <text x="10" y="26" fill="#2563EB" font-size="10" font-weight="bold">📄 LocationMaster_Template4.xlsx</text>
    <rect x="300" y="6" width="86" height="22" rx="6" fill="#2563EB"/>
    <text x="312" y="21" fill="#FFFFFF" font-size="9" font-weight="bold">📁 SELECT FILE</text>

    <!-- Action Buttons Row -->
    <g transform="translate(0, 40)">
      <rect x="0" y="0" width="90" height="28" rx="8" fill="#EF4444"/>
      <text x="45" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Clear</text>

      <rect x="98" y="0" width="94" height="28" rx="8" fill="#10B981"/>
      <text x="145" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">📥 Import</text>

      <rect x="200" y="0" width="94" height="28" rx="8" fill="#3B82F6"/>
      <text x="247" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Export</text>

      <rect x="302" y="0" width="94" height="28" rx="8" fill="#8B5CF6"/>
      <text x="349" y="18" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Template</text>
    </g>

    <!-- Search Box -->
    <rect x="0" y="74" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="12" y="93" fill="#94A3B8" font-size="10">🔍 Search Location Code / Name</text>

    <text x="2" y="118" fill="#64748B" font-size="9">Total: 5 | Showing: 5</text>

    <!-- 5 Location Cards -->
    <g transform="translate(0, 126)">
      <!-- Location 1 -->
      <rect x="0" y="0" width="396" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="18" fill="#1E293B" font-size="11"><tspan fill="#64748B">Code: </tspan><tspan font-weight="bold" fill="#0D5C3A">LOC-A01-01</tspan> Name: <tspan font-weight="bold">Shelf A-01 ชั้น 1</tspan></text>
      <text x="12" y="34" fill="#64748B" font-size="9">Zone: <tspan font-weight="bold" fill="#334155">Zone-A</tspan> Warehouse: <tspan font-weight="bold" fill="#334155">คลังสินค้าหลัก</tspan></text>
      <text x="12" y="48" fill="#94A3B8" font-size="8">Description: โซนสินค้าคอมพิวเตอร์และ PDA</text>

      <!-- Location 2 -->
      <rect x="0" y="66" width="396" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="84" fill="#1E293B" font-size="11"><tspan fill="#64748B">Code: </tspan><tspan font-weight="bold" fill="#0D5C3A">LOC-A01-02</tspan> Name: <tspan font-weight="bold">Shelf A-01 ชั้น 2</tspan></text>
      <text x="12" y="100" fill="#64748B" font-size="9">Zone: <tspan font-weight="bold" fill="#334155">Zone-A</tspan> Warehouse: <tspan font-weight="bold" fill="#334155">คลังสินค้าหลัก</tspan></text>
      <text x="12" y="114" fill="#94A3B8" font-size="8">Description: โซนอุปกรณ์ต่อพ่วง</text>

      <!-- Location 3 -->
      <rect x="0" y="132" width="396" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="150" fill="#1E293B" font-size="11"><tspan fill="#64748B">Code: </tspan><tspan font-weight="bold" fill="#0D5C3A">LOC-B02-01</tspan> Name: <tspan font-weight="bold">Shelf B-02 ชั้น 1</tspan></text>
      <text x="12" y="166" fill="#64748B" font-size="9">Zone: <tspan font-weight="bold" fill="#334155">Zone-B</tspan> Warehouse: <tspan font-weight="bold" fill="#334155">คลังวัตถุดิบ</tspan></text>
      <text x="12" y="180" fill="#94A3B8" font-size="8">Description: โซนกระดาษและสติ๊กเกอร์</text>

      <!-- Location 4 -->
      <rect x="0" y="198" width="396" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="216" fill="#1E293B" font-size="11"><tspan fill="#64748B">Code: </tspan><tspan font-weight="bold" fill="#0D5C3A">LOC-C03-01</tspan> Name: <tspan font-weight="bold">Cold Room C-01</tspan></text>
      <text x="12" y="232" fill="#64748B" font-size="9">Zone: <tspan font-weight="bold" fill="#334155">Zone-C</tspan> Warehouse: <tspan font-weight="bold" fill="#334155">คลังควบคุมอุณหภูมิ</tspan></text>
      <text x="12" y="246" fill="#94A3B8" font-size="8">Description: ห้องแช่เย็นควบคุมพิเศษ</text>

      <!-- Location 5 -->
      <rect x="0" y="264" width="396" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="12" y="282" fill="#1E293B" font-size="11"><tspan fill="#64748B">Code: </tspan><tspan font-weight="bold" fill="#DC2626">LOC-DMG-01</tspan> Name: <tspan font-weight="bold">Quarantine Damage Zone</tspan></text>
      <text x="12" y="298" fill="#64748B" font-size="9">Zone: <tspan font-weight="bold" fill="#334155">Zone-DMG</tspan> Warehouse: <tspan font-weight="bold" fill="#334155">คลังสินค้าชำรุด</tspan></text>
      <text x="12" y="312" fill="#94A3B8" font-size="8">Description: โซนกักกันสินค้าชำรุดรอส่งคืน</text>
    </g>
  `;
  return wrapMobilePDA("LOCATION MASTER", content, 420, 680);
}

// 4. Image 4: Scan Item Screen SVG
export function getScanScreenSvg(): string {
  const content = `
    <!-- Top QR Profile Selector Box -->
    <rect x="0" y="0" width="396" height="106" rx="12" fill="#1E1B4B" filter="url(#shadow)"/>
    <text x="10" y="20" fill="#C7D2FE" font-size="9" font-weight="bold">QR CODE PROFILE</text>
    <text x="10" y="34" fill="#FFFFFF" font-size="11" font-weight="bold">2. Item;Description;Serial (คั่น...</text>
    <rect x="330" y="12" width="56" height="22" rx="6" fill="#4338CA"/>
    <text x="340" y="27" fill="#FDE047" font-size="9" font-weight="bold">⚙️ ตั้งค่า QR</text>

    <text x="10" y="52" fill="#94A3B8" font-size="8">รูปแบบ: 2. Item;Description;Serial (คั่นด้วย Semi-colon ;)</text>
    
    <!-- Auto Count Toggle -->
    <rect x="10" y="60" width="376" height="38" rx="8" fill="#312E81"/>
    <text x="20" y="76" fill="#A7F3D0" font-size="10" font-weight="bold">⚡ สแกนแล้วนับทันที (Auto Count +1)</text>
    <text x="20" y="90" fill="#94A3B8" font-size="8">นับและเพิ่มจำนวน (+1) อัตโนมัติเมื่อสแกน</text>
    <rect x="335" y="68" width="40" height="20" rx="10" fill="#10B981"/>
    <circle cx="363" cy="78" r="8" fill="#FFFFFF"/>

    <!-- Status Selector: NORMAL / DAMAGE -->
    <g transform="translate(0, 114)">
      <circle cx="12" cy="12" r="6" fill="#3B82F6"/>
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF"/>
      <text x="24" y="16" fill="#1E293B" font-size="11" font-weight="bold">NORMAL (ปกติ)</text>

      <circle cx="140" cy="12" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
      <text x="152" y="16" fill="#64748B" font-size="11">DAMAGE (ชำรุด)</text>
    </g>

    <!-- Target Location -->
    <g transform="translate(0, 140)">
      <text x="0" y="10" fill="#64748B" font-size="8" font-weight="bold">TARGET LOCATION (สถานที่ตรวจนับ)</text>
      <text x="280" y="10" fill="#2563EB" font-size="8">🔒 ล็อกตำแหน่งคงที่ (Persistent)</text>
      <rect x="0" y="16" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="37" fill="#1E293B" font-size="11" font-weight="bold">📍 L01 - Marketing Department</text>
      <text x="340" y="36" fill="#64748B" font-size="9">เปลี่ยนที่นี่ ∨</text>
    </g>

    <!-- Input Form Fields -->
    <g transform="translate(0, 196)">
      <!-- Item Code -->
      <text x="0" y="10" fill="#64748B" font-size="8" font-weight="bold">ITEM CODE / QR CODE (AUTO SELECT รอสแกนถัดไป)</text>
      <rect x="0" y="16" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#3B82F6" stroke-width="1.5"/>
      <text x="12" y="37" fill="#1E293B" font-size="13" font-weight="bold">I00002</text>
      <text x="330" y="36" fill="#94A3B8" font-size="12">✕ 📷 ❚❙❚</text>

      <!-- Lot Number -->
      <text x="0" y="60" fill="#64748B" font-size="8" font-weight="bold">LOT NUMBER (ล็อคสินค้า)</text>
      <rect x="0" y="66" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="86" fill="#1E293B" font-size="11">Lo2</text>

      <!-- Expiry Date -->
      <text x="0" y="108" fill="#64748B" font-size="8" font-weight="bold">EXPIRY DATE (วันหมดอายุ YYYY-MM-DD)</text>
      <rect x="0" y="114" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="134" fill="#1E293B" font-size="11">2027-08-19</text>

      <!-- Quantity -->
      <text x="0" y="156" fill="#64748B" font-size="8" font-weight="bold">QUANTITY (จำนวนที่นับ)</text>
      <rect x="0" y="162" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="182" fill="#1E293B" font-size="12" font-weight="bold">1</text>

      <!-- Remark -->
      <text x="0" y="204" fill="#64748B" font-size="8" font-weight="bold">REMARK (หมายเหตุ)</text>
      <rect x="0" y="210" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="230" fill="#94A3B8" font-size="10">Remark (optional)</text>

      <!-- Save Button -->
      <rect x="0" y="250" width="396" height="38" rx="10" fill="#2563EB" filter="url(#shadow)"/>
      <text x="198" y="274" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">💾 บันทึกการตรวจนับ (ADD / ENTER RECORD)</text>
    </g>

    <!-- Data Scanned Table -->
    <g transform="translate(0, 492)">
      <text x="0" y="12" fill="#1E293B" font-size="10" font-weight="bold">Data Scanned (รายการที่นับแล้ว) <tspan fill="#3B82F6">2</tspan></text>
      <text x="330" y="12" fill="#64748B" font-size="9">📍 Loc: L01</text>

      <!-- Table Header -->
      <rect x="0" y="18" width="396" height="20" fill="#F8FAFC"/>
      <text x="10" y="32" fill="#64748B" font-size="8" font-weight="bold">LOC</text>
      <text x="70" y="32" fill="#64748B" font-size="8" font-weight="bold">ITEM</text>
      <text x="150" y="32" fill="#64748B" font-size="8" font-weight="bold">SERIAL / LOT</text>
      <text x="270" y="32" fill="#64748B" font-size="8" font-weight="bold">QTY</text>
      <text x="310" y="32" fill="#64748B" font-size="8" font-weight="bold">STATUS</text>

      <!-- Row 1 -->
      <rect x="0" y="38" width="396" height="22" fill="#FFFFFF"/>
      <text x="10" y="53" fill="#334155" font-size="8">L01</text>
      <text x="70" y="53" fill="#2563EB" font-size="8" font-weight="bold">I00001</text>
      <text x="150" y="53" fill="#64748B" font-size="8">-</text>
      <text x="275" y="53" fill="#0D5C3A" font-size="8" font-weight="bold">1</text>
      <text x="310" y="53" fill="#059669" font-size="8">NORMAL</text>
      <text x="375" y="53" fill="#94A3B8" font-size="10">🗑️</text>

      <!-- Row 2 -->
      <rect x="0" y="60" width="396" height="22" fill="#F8FAFC"/>
      <text x="10" y="75" fill="#334155" font-size="8">LOC-A01-01</text>
      <text x="70" y="75" fill="#2563EB" font-size="8" font-weight="bold">ITM001</text>
      <text x="150" y="75" fill="#64748B" font-size="8">SN-2026-0001</text>
      <text x="275" y="75" fill="#0D5C3A" font-size="8" font-weight="bold">1</text>
      <text x="310" y="75" fill="#059669" font-size="8">NORMAL</text>
      <text x="375" y="75" fill="#94A3B8" font-size="10">🗑️</text>
    </g>
  `;
  return wrapMobilePDA("SCAN ITEM", content, 420, 680);
}

// 5. Image 5: Item Out of Master Dialog Popup SVG
export function getItemOutOfMasterDialogSvg(): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="380" height="240" viewBox="0 0 380 240">
    <defs>
      <filter id="shadowDialog" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
    </defs>
    
    <!-- Modal Card -->
    <rect x="10" y="10" width="360" height="220" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadowDialog)"/>
    
    <!-- Warning Icon -->
    <circle cx="190" cy="45" r="18" fill="#FEF3C7"/>
    <text x="183" y="53" fill="#D97706" font-size="20" font-weight="bold">!</text>

    <!-- Title -->
    <text x="190" y="84" fill="#0F172A" font-size="16" font-weight="bold" text-anchor="middle">Item Out of Master</text>
    
    <!-- Description -->
    <text x="190" y="108" fill="#475569" font-size="11" text-anchor="middle">รหัสสินค้า/QR <tspan font-weight="bold" fill="#DC2626">[12345]</tspan> ไม่มีในฐานข้อมูล Item</text>
    <text x="190" y="124" fill="#475569" font-size="11" text-anchor="middle">Master</text>
    <text x="190" y="148" fill="#64748B" font-size="10" text-anchor="middle">คุณต้องการบันทึกการนับสินค้าต่อไปหรือไม่?</text>

    <!-- Action Buttons -->
    <rect x="35" y="168" width="145" height="38" rx="10" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
    <text x="107" y="192" fill="#334155" font-size="12" font-weight="bold" text-anchor="middle">ยกเลิก (No)</text>

    <rect x="200" y="168" width="145" height="38" rx="10" fill="#F59E0B"/>
    <text x="272" y="192" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">บันทึก (Yes)</text>
  </svg>
  `;
}

// 6. Image 6: Full View of Item Out of Master on Scan Screen SVG
export function getItemOutOfMasterFullSvg(): string {
  const scanContent = getScanScreenSvg();
  // We wrap scan screen and put overlay modal on top
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="420" height="680" viewBox="0 0 420 680">
    <g opacity="0.4">
      ${scanContent}
    </g>
    <!-- Dark Backdrop -->
    <rect width="420" height="680" rx="24" fill="#000000" fill-opacity="0.5"/>

    <!-- Modal in center -->
    <g transform="translate(20, 220)">
      <rect x="0" y="0" width="380" height="220" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadow)"/>
      <circle cx="190" cy="40" r="18" fill="#FEF3C7"/>
      <text x="183" y="48" fill="#D97706" font-size="20" font-weight="bold">!</text>

      <text x="190" y="80" fill="#0F172A" font-size="16" font-weight="bold" text-anchor="middle">Item Out of Master</text>
      <text x="190" y="104" fill="#475569" font-size="11" text-anchor="middle">รหัสสินค้า/QR <tspan font-weight="bold" fill="#DC2626">[12345]</tspan> ไม่มีในฐานข้อมูล Item</text>
      <text x="190" y="120" fill="#475569" font-size="11" text-anchor="middle">Master</text>
      <text x="190" y="142" fill="#64748B" font-size="10" text-anchor="middle">คุณต้องการบันทึกการนับสินค้าต่อไปหรือไม่?</text>

      <rect x="30" y="162" width="150" height="38" rx="10" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
      <text x="105" y="186" fill="#334155" font-size="12" font-weight="bold" text-anchor="middle">ยกเลิก (No)</text>

      <rect x="200" y="162" width="150" height="38" rx="10" fill="#F59E0B"/>
      <text x="275" y="186" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">บันทึก (Yes)</text>
    </g>
  </svg>
  `;
}

// 7. Image 7: Scan Item (Lot ON, Expiry OFF, Serial OFF) SVG
export function getScanScreenLotOnlySvg(): string {
  const content = `
    <!-- Settings Status Badge Bar -->
    <rect x="0" y="0" width="396" height="42" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
    <text x="10" y="18" fill="#64748B" font-size="8" font-weight="bold">สถานะการตรวจเช็คตาม SETTINGS:</text>
    <text x="320" y="18" fill="#2563EB" font-size="8">ตั้งค่าฟิลด์ QR &gt;</text>
    
    <g transform="translate(10, 24)">
      <rect x="0" y="0" width="48" height="14" rx="4" fill="#FEF3C7"/>
      <text x="6" y="10" fill="#92400E" font-size="8" font-weight="bold">🏷️ Lot</text>
      <rect x="28" y="2" width="18" height="10" rx="3" fill="#D97706"/>
      <text x="31" y="9" fill="#FFFFFF" font-size="7" font-weight="bold">ON</text>

      <rect x="56" y="0" width="58" height="14" rx="4" fill="#F1F5F9"/>
      <text x="62" y="10" fill="#64748B" font-size="8">📅 Expiry</text>
      <rect x="94" y="2" width="18" height="10" rx="3" fill="#94A3B8"/>
      <text x="96" y="9" fill="#FFFFFF" font-size="7">OFF</text>

      <rect x="120" y="0" width="56" height="14" rx="4" fill="#F1F5F9"/>
      <text x="126" y="10" fill="#64748B" font-size="8">🔢 Serial</text>
      <rect x="156" y="2" width="18" height="10" rx="3" fill="#94A3B8"/>
      <text x="158" y="9" fill="#FFFFFF" font-size="7">OFF</text>
    </g>

    <!-- Target Location -->
    <g transform="translate(0, 50)">
      <text x="0" y="10" fill="#64748B" font-size="8" font-weight="bold">TARGET LOCATION (สถานที่ตรวจนับ)</text>
      <text x="280" y="10" fill="#2563EB" font-size="8">🔒 ล็อกตำแหน่งคงที่ (Persistent)</text>
      <rect x="0" y="16" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="37" fill="#1E293B" font-size="11" font-weight="bold">📍 L01 - Marketing Department</text>
      <text x="340" y="36" fill="#64748B" font-size="9">เปลี่ยนที่นี่ ∨</text>
    </g>

    <!-- Input Form Fields -->
    <g transform="translate(0, 106)">
      <!-- Item Code -->
      <text x="0" y="10" fill="#64748B" font-size="8" font-weight="bold">ITEM CODE / QR CODE (AUTO SELECT รอสแกนถัดไป)</text>
      <rect x="0" y="16" width="396" height="34" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="38" fill="#94A3B8" font-size="11">สแกน Barcode/QR Code เช่น 1002, L02 หรือ 📷 ❚❙❚</text>

      <!-- Lot Number (Active & Required) -->
      <text x="0" y="66" fill="#B45309" font-size="8" font-weight="bold">LOT NUMBER (ล็อคสินค้า) *ตรวจเช็ค</text>
      <rect x="340" y="58" width="56" height="14" rx="4" fill="#FEF3C7"/>
      <text x="348" y="68" fill="#B45309" font-size="8" font-weight="bold">Enabled</text>
      <rect x="0" y="74" width="396" height="34" rx="8" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="12" y="96" fill="#92400E" font-size="11">กรอก หรือ ดึงอัตโนมัติจาก QR (เช่น L02)</text>

      <!-- Quantity -->
      <text x="0" y="126" fill="#64748B" font-size="8" font-weight="bold">QUANTITY (จำนวนที่นับ)</text>
      <rect x="0" y="132" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="153" fill="#1E293B" font-size="12" font-weight="bold">1</text>

      <!-- Remark -->
      <text x="0" y="180" fill="#64748B" font-size="8" font-weight="bold">REMARK (หมายเหตุ)</text>
      <rect x="0" y="186" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="206" fill="#94A3B8" font-size="10">Remark (optional)</text>

      <!-- Save Button -->
      <rect x="0" y="228" width="396" height="38" rx="10" fill="#2563EB" filter="url(#shadow)"/>
      <text x="198" y="252" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">💾 บันทึกการตรวจนับ (ADD / ENTER RECORD)</text>
    </g>

    <!-- Data Scanned Table -->
    <g transform="translate(0, 386)">
      <text x="0" y="12" fill="#1E293B" font-size="10" font-weight="bold">Data Scanned (รายการที่นับแล้ว) <tspan fill="#3B82F6">1</tspan></text>
      <text x="330" y="12" fill="#64748B" font-size="9">📍 Loc: L01</text>
    </g>
  `;
  return wrapMobilePDA("SCAN ITEM", content, 420, 680);
}

// 8. Image 8: Scan Item (Lot ON, Expiry ON, Serial OFF) SVG
export function getScanScreenLotExpirySvg(): string {
  const content = `
    <!-- Settings Status Badge Bar -->
    <rect x="0" y="0" width="396" height="42" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
    <text x="10" y="18" fill="#64748B" font-size="8" font-weight="bold">สถานะการตรวจเช็คตาม SETTINGS:</text>
    <text x="320" y="18" fill="#2563EB" font-size="8">ตั้งค่าฟิลด์ QR &gt;</text>
    
    <g transform="translate(10, 24)">
      <rect x="0" y="0" width="48" height="14" rx="4" fill="#FEF3C7"/>
      <text x="6" y="10" fill="#92400E" font-size="8" font-weight="bold">🏷️ Lot</text>
      <rect x="28" y="2" width="18" height="10" rx="3" fill="#D97706"/>
      <text x="31" y="9" fill="#FFFFFF" font-size="7" font-weight="bold">ON</text>

      <rect x="56" y="0" width="58" height="14" rx="4" fill="#D1FAE5"/>
      <text x="62" y="10" fill="#065F46" font-size="8" font-weight="bold">📅 Expiry</text>
      <rect x="94" y="2" width="18" height="10" rx="3" fill="#10B981"/>
      <text x="96" y="9" fill="#FFFFFF" font-size="7" font-weight="bold">ON</text>

      <rect x="120" y="0" width="56" height="14" rx="4" fill="#F1F5F9"/>
      <text x="126" y="10" fill="#64748B" font-size="8">🔢 Serial</text>
      <rect x="156" y="2" width="18" height="10" rx="3" fill="#94A3B8"/>
      <text x="158" y="9" fill="#FFFFFF" font-size="7">OFF</text>
    </g>

    <!-- Target Location -->
    <g transform="translate(0, 50)">
      <text x="0" y="10" fill="#64748B" font-size="8" font-weight="bold">TARGET LOCATION (สถานที่ตรวจนับ)</text>
      <text x="280" y="10" fill="#2563EB" font-size="8">🔒 ล็อกตำแหน่งคงที่ (Persistent)</text>
      <rect x="0" y="16" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="37" fill="#1E293B" font-size="11" font-weight="bold">📍 L01 - Marketing Department</text>
      <text x="340" y="36" fill="#64748B" font-size="9">เปลี่ยนที่นี่ ∨</text>
    </g>

    <!-- Input Form Fields -->
    <g transform="translate(0, 106)">
      <!-- Item Code -->
      <text x="0" y="10" fill="#64748B" font-size="8" font-weight="bold">ITEM CODE / QR CODE (AUTO SELECT รอสแกนถัดไป)</text>
      <rect x="0" y="16" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="37" fill="#94A3B8" font-size="11">สแกน Barcode/QR Code เช่น 1002, L02 หรือ 📷 ❚❙❚</text>

      <!-- Lot Number (Active & Required) -->
      <text x="0" y="62" fill="#B45309" font-size="8" font-weight="bold">LOT NUMBER (ล็อคสินค้า) *ตรวจเช็ค</text>
      <rect x="340" y="54" width="56" height="14" rx="4" fill="#FEF3C7"/>
      <text x="348" y="64" fill="#B45309" font-size="8" font-weight="bold">Enabled</text>
      <rect x="0" y="70" width="396" height="32" rx="8" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="12" y="91" fill="#92400E" font-size="11">กรอก หรือ ดึงอัตโนมัติจาก QR (เช่น L02)</text>

      <!-- Expiry Date (Active & Required) -->
      <text x="0" y="118" fill="#047857" font-size="8" font-weight="bold">EXPIRY DATE (วันหมดอายุ YYYY-MM-DD) *ตรวจเช็ค</text>
      <rect x="340" y="110" width="56" height="14" rx="4" fill="#D1FAE5"/>
      <text x="348" y="120" fill="#065F46" font-size="8" font-weight="bold">Enabled</text>
      <rect x="0" y="126" width="396" height="32" rx="8" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
      <text x="12" y="147" fill="#065F46" font-size="11">YYYY-MM-DD (หรือดึงอัตโนมัติจาก QR)</text>

      <!-- Quantity -->
      <text x="0" y="174" fill="#64748B" font-size="8" font-weight="bold">QUANTITY (จำนวนที่นับ)</text>
      <rect x="0" y="180" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="200" fill="#1E293B" font-size="12" font-weight="bold">1</text>

      <!-- Remark -->
      <text x="0" y="224" fill="#64748B" font-size="8" font-weight="bold">REMARK (หมายเหตุ)</text>
      <rect x="0" y="230" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="250" fill="#94A3B8" font-size="10">Remark (optional)</text>

      <!-- Save Button -->
      <rect x="0" y="270" width="396" height="38" rx="10" fill="#2563EB" filter="url(#shadow)"/>
      <text x="198" y="294" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">💾 บันทึกการตรวจนับ (ADD / ENTER RECORD)</text>
    </g>
  `;
  return wrapMobilePDA("SCAN ITEM", content, 420, 680);
}

// 9. Image 9: QR Code Settings & Auto-Sync Screen SVG
export function getQRCodeConfigScreenSvg(): string {
  const content = `
    <!-- Header Card -->
    <rect x="0" y="0" width="396" height="88" rx="16" fill="#4F46E5" filter="url(#shadow)"/>
    <text x="16" y="24" fill="#FFFFFF" font-size="16" font-weight="bold">QR CODE SETTINGS</text>
    <text x="16" y="42" fill="#C7D2FE" font-size="10">ตั้งค่าโครงสร้างและตัวตัดคำ QR Code แต่ละสาขา</text>
    <rect x="316" y="12" width="68" height="28" rx="8" fill="#FDE047"/>
    <text x="328" y="30" fill="#1E1B4B" font-size="11" font-weight="bold">+ เพิ่ม</text>

    <rect x="16" y="54" width="280" height="24" rx="12" fill="#312E81"/>
    <circle cx="28" cy="66" r="4" fill="#3B82F6"/>
    <text x="38" y="70" fill="#FFFFFF" font-size="10">ใช้งานอยู่: 2. Item;Description;Serial (...</text>
    <rect x="235" y="58" width="55" height="16" rx="8" fill="#10B981"/>
    <text x="245" y="70" fill="#FFFFFF" font-size="9" font-weight="bold">ACTIVE</text>

    <!-- Auto-Sync Checkbox Card -->
    <g transform="translate(0, 98)">
      <rect x="0" y="0" width="396" height="160" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="16" y="22" fill="#1E293B" font-size="11" font-weight="bold">การตรวจเช็คที่เชื่อมโยงกับ SETTINGS (ติ๊กถูกอัตโนมัติ)</text>
      <rect x="320" y="10" width="64" height="18" rx="6" fill="#EFF6FF"/>
      <text x="328" y="22" fill="#2563EB" font-size="8" font-weight="bold">AUTO-SYNC</text>
      
      <text x="16" y="42" fill="#64748B" font-size="9">เมื่อเลือกหรือบันทึกโครงสร้าง QR Code ระบบจะปรับติ๊กถูกในหน้า Setting ให้อัตโนมัติตามฟิลด์ที่เลือกตรวจเช็ค:</text>

      <!-- Checkbox 1: Lot -->
      <g transform="translate(16, 56)">
        <rect x="0" y="0" width="364" height="28" rx="6" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
        <text x="10" y="18" fill="#92400E" font-size="10" font-weight="bold">🏷️ ตรวจเช็ค Lot Number (Lot Control)</text>
        <rect x="336" y="6" width="16" height="16" rx="4" fill="#2563EB"/>
        <text x="340" y="18" fill="#FFFFFF" font-size="11" font-weight="bold">✓</text>
      </g>

      <!-- Checkbox 2: Expiry -->
      <g transform="translate(16, 90)">
        <rect x="0" y="0" width="364" height="28" rx="6" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1"/>
        <text x="10" y="18" fill="#065F46" font-size="10" font-weight="bold">📅 ตรวจเช็ค Expiry Date (วันหมดอายุ)</text>
        <rect x="336" y="6" width="16" height="16" rx="4" fill="#2563EB"/>
        <text x="340" y="18" fill="#FFFFFF" font-size="11" font-weight="bold">✓</text>
      </g>

      <!-- Checkbox 3: Serial -->
      <g transform="translate(16, 124)">
        <rect x="0" y="0" width="364" height="28" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
        <text x="10" y="18" fill="#475569" font-size="10">🔢 ตรวจเช็ค Serial Control (หมายเลขซีเรียล)</text>
        <rect x="336" y="6" width="16" height="16" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      </g>
    </g>

    <!-- Simulator Teaser -->
    <g transform="translate(0, 268)">
      <rect x="0" y="0" width="396" height="60" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <text x="12" y="20" fill="#1E293B" font-size="10" font-weight="bold">▷ ทดสอบจำลองการสแกน (QR SIMULATOR)</text>
      <rect x="330" y="8" width="56" height="16" rx="6" fill="#EFF6FF"/>
      <text x="338" y="20" fill="#2563EB" font-size="8" font-weight="bold">REALTIME</text>
      <text x="12" y="36" fill="#64748B" font-size="8">กดปุ่มตัวอย่าง 4 รูปแบบตามโจทย์เพื่อทดสอบทันที:</text>
      
      <!-- 2 Buttons -->
      <rect x="12" y="42" width="170" height="14" rx="4" fill="#FFFFFF" stroke="#CBD5E1"/>
      <text x="20" y="52" fill="#334155" font-size="7">1. Item: I00001</text>

      <rect x="195" y="42" width="170" height="14" rx="4" fill="#FFFFFF" stroke="#CBD5E1"/>
      <text x="205" y="52" fill="#334155" font-size="7">2. Item;Desc;SN</text>
    </g>
  `;
  return wrapMobilePDA("QR CODE SETTINGS", content, 420, 680);
}

// 10. Image 10: QR Simulator & Parsed Output SVG
export function getQRSimulatorSvg(): string {
  const content = `
    <!-- Top Simulator Banner -->
    <rect x="0" y="0" width="396" height="52" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="12" y="20" fill="#1E293B" font-size="11" font-weight="bold">▷ ทดสอบจำลองการสแกน (QR SIMULATOR)</text>
    <rect x="325" y="8" width="60" height="18" rx="6" fill="#EFF6FF"/>
    <text x="333" y="20" fill="#2563EB" font-size="8" font-weight="bold">REALTIME</text>
    <text x="12" y="38" fill="#64748B" font-size="9">กดปุ่มตัวอย่าง 4 รูปแบบตามโจทย์เพื่อทดสอบทันที:</text>

    <!-- 4 Preset Buttons -->
    <g transform="translate(0, 58)">
      <rect x="0" y="0" width="190" height="24" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="10" y="16" fill="#334155" font-size="9">1. Item: I00001</text>

      <rect x="206" y="0" width="190" height="24" rx="6" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5"/>
      <text x="216" y="16" fill="#1E40AF" font-size="9" font-weight="bold">2. Item;Desc;SN</text>

      <rect x="0" y="30" width="190" height="24" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="10" y="46" fill="#334155" font-size="9">3. Item,Lot,Exp,Qty</text>

      <rect x="206" y="30" width="190" height="24" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="216" y="46" fill="#334155" font-size="9">4. Item,Lot</text>
    </g>

    <!-- Raw String Input Box -->
    <g transform="translate(0, 120)">
      <text x="0" y="10" fill="#64748B" font-size="9" font-weight="bold">ข้อความจาก QR Code (Raw String):</text>
      <rect x="0" y="16" width="396" height="34" rx="8" fill="#FFFFFF" stroke="#3B82F6" stroke-width="1.5"/>
      <text x="12" y="38" fill="#1E293B" font-size="11" font-weight="bold">I00001;Sample Motor;SN-2026-9988</text>
      <text x="355" y="38" fill="#94A3B8" font-size="10">ล้าง</text>
    </g>

    <!-- Profile Selector in Simulator -->
    <g transform="translate(0, 178)">
      <text x="0" y="10" fill="#64748B" font-size="8">ใช้ Profile ทดสอบ:</text>
      <rect x="0" y="16" width="396" height="30" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <text x="12" y="36" fill="#1E293B" font-size="10" font-weight="bold">2. Item;Description;Serial (คั่นด้วย Semi-colon ;)</text>
      <text x="375" y="36" fill="#64748B" font-size="10">∨</text>
    </g>

    <!-- PARSED OUTPUT Dark Card -->
    <g transform="translate(0, 234)">
      <rect x="0" y="0" width="396" height="155" rx="14" fill="#0F172A" filter="url(#shadow)"/>
      <text x="14" y="22" fill="#38BDF8" font-size="11" font-weight="bold">PARSED OUTPUT (3 ฟิลด์)</text>
      <text x="300" y="22" fill="#94A3B8" font-size="10">Delimiter: ';'</text>

      <!-- 6 Extracted Grid Blocks -->
      <rect x="14" y="32" width="176" height="34" rx="8" fill="#1E293B"/>
      <text x="22" y="44" fill="#94A3B8" font-size="8">ITEM CODE</text>
      <text x="22" y="58" fill="#F8FAFC" font-size="11" font-weight="bold">I00001</text>

      <rect x="206" y="32" width="176" height="34" rx="8" fill="#1E293B"/>
      <text x="214" y="44" fill="#94A3B8" font-size="8">ITEM DESCRIPTION</text>
      <text x="214" y="58" fill="#F8FAFC" font-size="11" font-weight="bold">Sample Motor</text>

      <rect x="14" y="72" width="176" height="34" rx="8" fill="#1E293B"/>
      <text x="22" y="84" fill="#94A3B8" font-size="8">SERIAL NUMBER</text>
      <text x="22" y="98" fill="#38BDF8" font-size="10" font-weight="bold">SN-2026-9988</text>

      <rect x="206" y="72" width="176" height="34" rx="8" fill="#1E293B"/>
      <text x="214" y="84" fill="#94A3B8" font-size="8">LOT NUMBER</text>
      <text x="214" y="98" fill="#64748B" font-size="11">-</text>

      <rect x="14" y="112" width="176" height="34" rx="8" fill="#1E293B"/>
      <text x="22" y="124" fill="#94A3B8" font-size="8">EXPIRY DATE</text>
      <text x="22" y="138" fill="#64748B" font-size="11">-</text>

      <rect x="206" y="112" width="176" height="34" rx="8" fill="#1E293B"/>
      <text x="214" y="124" fill="#94A3B8" font-size="8">QUANTITY</text>
      <text x="214" y="138" fill="#FDE047" font-size="11" font-weight="bold">1 (Default)</text>
    </g>
  `;
  return wrapMobilePDA("QR CODE SETTINGS", content, 420, 680);
}

// 11. Image 11: Profiles List 1 (Auto-Detect & Item,Lot) SVG
export function getQRProfilesList1Svg(): string {
  const content = `
    <!-- Top Bar -->
    <text x="2" y="14" fill="#1E293B" font-size="11" font-weight="bold">รายการ QR PROFILES ทั้งหมด (6)</text>
    <text x="310" y="14" fill="#2563EB" font-size="9">↻ รีเซ็ตมาตรฐาน</text>

    <!-- Card 1: Auto-Detect -->
    <g transform="translate(0, 24)">
      <rect x="0" y="0" width="396" height="150" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold">⚡ อัตโนมัติ (Auto-Detect รูปแบบ QR ทุกประเภท)</text>
      <text x="16" y="38" fill="#64748B" font-size="8">ตรวจจับและแยกฟิลด์อัตโนมัติตามตัวคั่น เช่น Comma (,), Semi-colon (;), Pipe (|)</text>
      
      <rect x="16" y="46" width="364" height="26" rx="6" fill="#F8FAFC"/>
      <text x="24" y="62" fill="#475569" font-size="9"><tspan font-weight="bold">ตัวคั่น (Delimiter):</tspan> None (รหัสเดี่ยว)</text>
      <text x="330" y="62" fill="#64748B" font-size="9">1 ฟิลด์</text>

      <rect x="24" y="78" width="80" height="20" rx="4" fill="#EFF6FF"/>
      <text x="32" y="92" fill="#1E40AF" font-size="8" font-weight="bold">1. Item Code</text>

      <text x="24" y="112" fill="#94A3B8" font-size="8">ตัวอย่าง: 1002, L02 หรือ I00001;Desc;SN99</text>

      <rect x="16" y="120" width="230" height="24" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
      <text x="30" y="136" fill="#334155" font-size="9" font-weight="bold">✓ เลือกใช้งาน Profile นี้</text>

      <rect x="256" y="120" width="124" height="24" rx="8" fill="#EFF6FF"/>
      <text x="280" y="136" fill="#2563EB" font-size="9" font-weight="bold">▷ ทดสอบ</text>
    </g>

    <!-- Card 2: 4. Item,Lot -->
    <g transform="translate(0, 186)">
      <rect x="0" y="0" width="396" height="150" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold">4. Item,Lot (คั่นด้วย Comma ,)</text>
      <text x="16" y="38" fill="#64748B" font-size="8">รูปแบบ Item,Lot (เช่น 1002,L02 หรือ I00003,BATCH-2026-X)</text>
      
      <rect x="16" y="46" width="364" height="26" rx="6" fill="#F8FAFC"/>
      <text x="24" y="62" fill="#475569" font-size="9"><tspan font-weight="bold">ตัวคั่น (Delimiter):</tspan> [ , ]</text>
      <text x="330" y="62" fill="#64748B" font-size="9">2 ฟิลด์</text>

      <rect x="24" y="78" width="80" height="20" rx="4" fill="#EFF6FF"/>
      <text x="32" y="92" fill="#1E40AF" font-size="8" font-weight="bold">1. Item Code</text>

      <rect x="110" y="78" width="80" height="20" rx="4" fill="#FEF3C7"/>
      <text x="118" y="92" fill="#92400E" font-size="8" font-weight="bold">2. Lot Number</text>

      <text x="24" y="112" fill="#94A3B8" font-size="8">ตัวอย่าง: 1002, L02</text>

      <rect x="16" y="120" width="230" height="24" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
      <text x="30" y="136" fill="#334155" font-size="9" font-weight="bold">✓ เลือกใช้งาน Profile นี้</text>

      <rect x="256" y="120" width="124" height="24" rx="8" fill="#EFF6FF"/>
      <text x="280" y="136" fill="#2563EB" font-size="9" font-weight="bold">▷ ทดสอบ</text>
    </g>
  `;
  return wrapMobilePDA("QR CODE SETTINGS", content, 420, 680);
}

// 12. Image 12: Profiles List 2 (Item;Desc;Serial & Item,Lot,Exp,Qty) SVG
export function getQRProfilesList2Svg(): string {
  const content = `
    <!-- Card 1: 2. Item;Description;Serial (Active) -->
    <g transform="translate(0, 10)">
      <rect x="0" y="0" width="396" height="180" rx="14" fill="#FFFFFF" stroke="#3B82F6" stroke-width="2" filter="url(#shadow)"/>
      <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold">2. Item;Description;Serial (คั่นด้วย Semi-colon ;)</text>
      <rect x="280" y="12" width="55" height="16" rx="8" fill="#2563EB"/>
      <text x="290" y="24" fill="#FFFFFF" font-size="8" font-weight="bold">ACTIVE</text>
      
      <text x="16" y="44" fill="#64748B" font-size="8">รูปแบบ Item;Description;Serial (เช่น I00001;Sample Motor;SN-2026-9988)</text>
      
      <rect x="16" y="52" width="364" height="24" rx="6" fill="#F8FAFC"/>
      <text x="24" y="68" fill="#475569" font-size="9"><tspan font-weight="bold">ตัวคั่น (Delimiter):</tspan> [ ; ]</text>
      <text x="330" y="68" fill="#64748B" font-size="9">3 ฟิลด์</text>

      <!-- 3 Badges -->
      <rect x="24" y="82" width="75" height="20" rx="4" fill="#EFF6FF"/>
      <text x="30" y="96" fill="#1E40AF" font-size="8" font-weight="bold">1. Item Code</text>

      <rect x="105" y="82" width="130" height="20" rx="4" fill="#F1F5F9"/>
      <text x="112" y="96" fill="#334155" font-size="8">2. Description / Name</text>

      <rect x="242" y="82" width="95" height="20" rx="4" fill="#EDE9FE"/>
      <text x="250" y="96" fill="#5B21B6" font-size="8" font-weight="bold">3. Serial Number</text>

      <text x="24" y="122" fill="#94A3B8" font-size="8">ตัวอย่าง: I00001;Sample Motor;SN-2026-9988</text>

      <!-- Active indicator -->
      <rect x="16" y="136" width="230" height="30" rx="8" fill="#ECFDF5" stroke="#10B981" stroke-width="1"/>
      <text x="40" y="155" fill="#065F46" font-size="10" font-weight="bold">✓ กำลังใช้งานในหน้าสแกน</text>

      <rect x="256" y="136" width="124" height="30" rx="8" fill="#EFF6FF"/>
      <text x="280" y="155" fill="#2563EB" font-size="10" font-weight="bold">▷ ทดสอบ</text>
    </g>

    <!-- Card 2: 3. Item,lot,expiry date,qty -->
    <g transform="translate(0, 206)">
      <rect x="0" y="0" width="396" height="175" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold">3. Item,lot,expiry date,qty (คั่นด้วย Comma ,)</text>
      <text x="16" y="40" fill="#64748B" font-size="8">รูปแบบ Item,lot,expiry date,qty (เช่น I00002,LOT-AUG-01,2026-12-31,25)</text>
      
      <rect x="16" y="48" width="364" height="24" rx="6" fill="#F8FAFC"/>
      <text x="24" y="64" fill="#475569" font-size="9"><tspan font-weight="bold">ตัวคั่น (Delimiter):</tspan> [ , ]</text>
      <text x="330" y="64" fill="#64748B" font-size="9">4 ฟิลด์</text>

      <!-- 4 Badges -->
      <rect x="24" y="78" width="75" height="18" rx="4" fill="#EFF6FF"/>
      <text x="30" y="91" fill="#1E40AF" font-size="7" font-weight="bold">1. Item Code</text>

      <rect x="105" y="78" width="80" height="18" rx="4" fill="#FEF3C7"/>
      <text x="112" y="91" fill="#92400E" font-size="7" font-weight="bold">2. Lot Number</text>

      <rect x="190" y="78" width="80" height="18" rx="4" fill="#D1FAE5"/>
      <text x="198" y="91" fill="#065F46" font-size="7" font-weight="bold">3. Expiry Date</text>

      <rect x="275" y="78" width="75" height="18" rx="4" fill="#EFF6FF"/>
      <text x="282" y="91" fill="#1E40AF" font-size="7" font-weight="bold">4. Quantity</text>

      <text x="24" y="116" fill="#94A3B8" font-size="8">ตัวอย่าง: I00002,LOT-AUG-01,2026-12-31,25</text>

      <rect x="16" y="130" width="230" height="28" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
      <text x="35" y="148" fill="#334155" font-size="9" font-weight="bold">✓ เลือกใช้งาน Profile นี้</text>

      <rect x="256" y="130" width="124" height="28" rx="8" fill="#EFF6FF"/>
      <text x="280" y="148" fill="#2563EB" font-size="9" font-weight="bold">▷ ทดสอบ</text>
    </g>
  `;
  return wrapMobilePDA("QR CODE SETTINGS", content, 420, 680);
}

// 13. Image 13: Profiles List 3 (Single Item & Pipe Delimited) SVG
export function getQRProfilesList3Svg(): string {
  const content = `
    <!-- Card 1: 1. Single Item Code -->
    <g transform="translate(0, 10)">
      <rect x="0" y="0" width="396" height="145" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold">1. Single Item Code (รหัสสินค้าเดี่ยว)</text>
      <text x="16" y="38" fill="#64748B" font-size="8">สแกนเฉพาะ Item Code / Barcode (เช่น I00001 หรือ 8850123456789)</text>
      
      <rect x="16" y="46" width="364" height="24" rx="6" fill="#F8FAFC"/>
      <text x="24" y="62" fill="#475569" font-size="9"><tspan font-weight="bold">ตัวคั่น (Delimiter):</tspan> None (รหัสเดี่ยว)</text>
      <text x="330" y="62" fill="#64748B" font-size="9">1 ฟิลด์</text>

      <rect x="24" y="76" width="115" height="20" rx="4" fill="#EFF6FF"/>
      <text x="32" y="90" fill="#1E40AF" font-size="8" font-weight="bold">1. Item Code / Barcode</text>

      <text x="24" y="112" fill="#94A3B8" font-size="8">ตัวอย่าง: I00001</text>

      <rect x="16" y="118" width="230" height="22" rx="6" fill="#F1F5F9" stroke="#CBD5E1"/>
      <text x="35" y="133" fill="#334155" font-size="8" font-weight="bold">✓ เลือกใช้งาน Profile นี้</text>

      <rect x="256" y="118" width="124" height="22" rx="6" fill="#EFF6FF"/>
      <text x="280" y="133" fill="#2563EB" font-size="8" font-weight="bold">▷ ทดสอบ</text>
    </g>

    <!-- Card 2: 5. Pipe Delimited -->
    <g transform="translate(0, 172)">
      <rect x="0" y="0" width="396" height="175" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" filter="url(#shadow)"/>
      <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold">5. Pipe Delimited (Item|Lot|Serial|Qty|Remark)</text>
      <text x="16" y="40" fill="#64748B" font-size="8">รูปแบบ Item|Lot|Serial|Qty|Remark (เช่น I00001|LOT99|SN7788|10|สินค้าชำรุด)</text>
      
      <rect x="16" y="48" width="364" height="24" rx="6" fill="#F8FAFC"/>
      <text x="24" y="64" fill="#475569" font-size="9"><tspan font-weight="bold">ตัวคั่น (Delimiter):</tspan> [ | ]</text>
      <text x="330" y="64" fill="#64748B" font-size="9">5 ฟิลด์</text>

      <!-- 5 Badges -->
      <rect x="24" y="78" width="60" height="18" rx="4" fill="#EFF6FF"/>
      <text x="28" y="90" fill="#1E40AF" font-size="7">1. Item</text>

      <rect x="90" y="78" width="65" height="18" rx="4" fill="#FEF3C7"/>
      <text x="95" y="90" fill="#92400E" font-size="7">2. Lot</text>

      <rect x="160" y="78" width="70" height="18" rx="4" fill="#EDE9FE"/>
      <text x="165" y="90" fill="#5B21B6" font-size="7">3. Serial</text>

      <rect x="235" y="78" width="60" height="18" rx="4" fill="#EFF6FF"/>
      <text x="240" y="90" fill="#1E40AF" font-size="7">4. Qty</text>

      <rect x="300" y="78" width="80" height="18" rx="4" fill="#F1F5F9"/>
      <text x="305" y="90" fill="#334155" font-size="7">5. Remark</text>

      <text x="24" y="116" fill="#94A3B8" font-size="8">ตัวอย่าง: I00001|LOT99|SN7788|10|สินค้าชำรุด</text>

      <rect x="16" y="128" width="230" height="28" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
      <text x="35" y="146" fill="#334155" font-size="9" font-weight="bold">✓ เลือกใช้งาน Profile นี้</text>

      <rect x="256" y="128" width="124" height="28" rx="8" fill="#EFF6FF"/>
      <text x="280" y="146" fill="#2563EB" font-size="9" font-weight="bold">▷ ทดสอบ</text>
    </g>
  `;
  return wrapMobilePDA("QR CODE SETTINGS", content, 420, 680);
}

// 14. Image 14: View Item Scan Screen SVG
export function getViewItemScanSvg(): string {
  const content = `
    <!-- Top Action Buttons -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="188" height="36" rx="10" fill="#EF4444" filter="url(#shadow)"/>
      <text x="94" y="23" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">Clear</text>

      <rect x="208" y="0" width="188" height="36" rx="10" fill="#10B981" filter="url(#shadow)"/>
      <text x="302" y="23" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">Export to Data</text>
    </g>

    <!-- Search Box -->
    <rect x="0" y="48" width="396" height="32" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="12" y="69" fill="#94A3B8" font-size="10">🔍 Search item code or location code</text>

    <!-- Filter & Count Row -->
    <g transform="translate(0, 90)">
      <rect x="0" y="0" width="80" height="24" rx="6" fill="#FFFFFF" stroke="#CBD5E1"/>
      <text x="12" y="16" fill="#334155" font-size="10">All ∨</text>
      <text x="280" y="16" fill="#64748B" font-size="10">Record Count: <tspan font-weight="bold" fill="#0D5C3A">1</tspan></text>
    </g>

    <!-- 1 Scanned Record Card -->
    <g transform="translate(0, 126)">
      <rect x="0" y="0" width="396" height="120" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadow)"/>
      
      <!-- Top Title & Badge -->
      <text x="14" y="22" fill="#1E40AF" font-size="11" font-weight="bold">[ITM001] แท็บเล็ตตรวจนับสต็อก</text>
      <text x="14" y="36" fill="#1E40AF" font-size="11" font-weight="bold">OGA Pro 10</text>
      <rect x="290" y="10" width="60" height="18" rx="6" fill="#10B981"/>
      <text x="300" y="23" fill="#FFFFFF" font-size="8" font-weight="bold">NORMAL</text>
      <text x="365" y="24" fill="#94A3B8" font-size="12">🗑️</text>

      <!-- Details -->
      <text x="14" y="54" fill="#475569" font-size="9">DESC: แท็บเล็ตตรวจนับสต็อก OGA Pro 10</text>
      <text x="14" y="68" fill="#334155" font-size="9"><tspan font-weight="bold">SN: SN-2026-0001</tspan> Lot: - Exp: -</text>
      <text x="14" y="82" fill="#0D5C3A" font-size="9" font-weight="bold">LOCATION: LOC-A01-01</text>
      <text x="14" y="96" fill="#64748B" font-size="8">QUANTITY: Plan[100] Scan[1] EA By: <tspan font-weight="bold">Admin</tspan> 2026-08-19T09:30:00</text>
      <text x="14" y="110" fill="#DC2626" font-size="8">Remark: ตรวจนับประจำจุด A-01</text>
    </g>
  `;
  return wrapMobilePDA("VIEW ITEM SCAN", content, 420, 680);
}

// 15. Image 15: Theming Screen SVG
export function getThemingScreenSvg(): string {
  const content = `
    <!-- 10 Theme Palette Options -->
    <g transform="translate(0, 0)">
      <!-- 1. Default -->
      <circle cx="16" cy="18" r="6" fill="#2563EB"/>
      <circle cx="16" cy="18" r="2.5" fill="#FFFFFF"/>
      <text x="32" y="22" fill="#1E293B" font-size="12" font-weight="bold">Default</text>
      <rect x="220" y="8" width="160" height="20" rx="6" fill="#3B82F6"/>

      <!-- 2. Blue -->
      <circle cx="16" cy="48" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="52" fill="#1E293B" font-size="12">Blue</text>
      <rect x="220" y="38" width="160" height="20" rx="6" fill="#0284C7"/>

      <!-- 3. Red -->
      <circle cx="16" cy="78" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="82" fill="#1E293B" font-size="12">Red</text>
      <rect x="220" y="68" width="160" height="20" rx="6" fill="#DC2626"/>

      <!-- 4. Pink -->
      <circle cx="16" cy="108" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="112" fill="#1E293B" font-size="12">Pink</text>
      <rect x="220" y="98" width="160" height="20" rx="6" fill="#EC4899"/>

      <!-- 5. Purple -->
      <circle cx="16" cy="138" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="142" fill="#1E293B" font-size="12">Purple</text>
      <rect x="220" y="128" width="160" height="20" rx="6" fill="#9333EA"/>

      <!-- 6. Indigo -->
      <circle cx="16" cy="168" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="172" fill="#1E293B" font-size="12">Indigo</text>
      <rect x="220" y="158" width="160" height="20" rx="6" fill="#4F46E5"/>

      <!-- 7. Teal -->
      <circle cx="16" cy="198" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="202" fill="#1E293B" font-size="12">Teal</text>
      <rect x="220" y="188" width="160" height="20" rx="6" fill="#0D9488"/>

      <!-- 8. Green -->
      <circle cx="16" cy="228" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="232" fill="#1E293B" font-size="12">Green</text>
      <rect x="220" y="218" width="160" height="20" rx="6" fill="#16A34A"/>

      <!-- 9. Yellow -->
      <circle cx="16" cy="258" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="262" fill="#1E293B" font-size="12">Yellow</text>
      <rect x="220" y="248" width="160" height="20" rx="6" fill="#CA8A04"/>

      <!-- 10. Orange -->
      <circle cx="16" cy="288" r="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="32" y="292" fill="#1E293B" font-size="12">Orange</text>
      <rect x="220" y="278" width="160" height="20" rx="6" fill="#EA580C"/>
    </g>
  `;
  return wrapMobilePDA("THEMING", content, 420, 680);
}

// OGA Group Cover Logo SVG
export function getOgaGroupLogoSvg(): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <defs>
      <style>
        text { font-family: 'Arial', 'Helvetica', sans-serif; }
      </style>
    </defs>
    <!-- Red Elephant Emblem -->
    <rect x="25" y="10" width="190" height="170" rx="35" fill="#EF4444" stroke="#DC2626" stroke-width="4"/>
    
    <!-- White Elephant Stylized Line Art -->
    <path d="M 60 50 Q 60 145 100 145 Q 115 145 115 125 L 115 85 Q 115 70 100 70 Q 85 70 85 85 L 85 145" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 115 85 Q 115 50 145 50 Q 180 50 180 85 L 180 145 L 160 145 L 160 115 L 140 115 L 140 145" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="85" cy="85" r="4" fill="#FFFFFF"/>
    
    <!-- OGA GROUP Text -->
    <text x="120" y="215" fill="#1E3A8A" font-size="24" font-weight="900" text-anchor="middle" letter-spacing="2">OGA GROUP</text>
  </svg>
  `;
}

// Item Master Excel Spreadsheet Preview SVG
export function getItemMasterExcelSvg(): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="580" height="220" viewBox="0 0 580 220">
    <defs>
      <style>
        text { font-family: 'Segoe UI', 'Sarabun', Tahoma, sans-serif; }
      </style>
    </defs>
    <!-- Window Header -->
    <rect width="580" height="220" rx="6" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1"/>
    <rect width="580" height="24" rx="6" fill="#107C41"/>
    <text x="12" y="16" fill="#FFFFFF" font-size="11" font-weight="bold">AutoSave ON | ItemMaster_Template.xlsx - Excel</text>
    
    <!-- Column Headers A-G -->
    <rect x="0" y="24" width="30" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <rect x="30" y="24" width="70" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="65" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">A</text>
    <rect x="100" y="24" width="130" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="165" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">B</text>
    <rect x="230" y="24" width="80" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="270" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">C</text>
    <rect x="310" y="24" width="65" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="342" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">D</text>
    <rect x="375" y="24" width="45" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="397" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">E</text>
    <rect x="420" y="24" width="110" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="475" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">F</text>
    <rect x="530" y="24" width="50" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="555" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">G</text>

    <!-- Row 1: Header Titles -->
    <rect x="0" y="46" width="30" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="61" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">1</text>
    <rect x="30" y="46" width="70" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="34" y="61" fill="#0F172A" font-size="9" font-weight="bold">ItemCode</text>
    <rect x="100" y="46" width="130" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="104" y="61" fill="#0F172A" font-size="9" font-weight="bold">ItemName</text>
    <rect x="230" y="46" width="80" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="234" y="61" fill="#0F172A" font-size="9" font-weight="bold">Barcode</text>
    <rect x="310" y="46" width="65" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="314" y="61" fill="#0F172A" font-size="9" font-weight="bold">Category</text>
    <rect x="375" y="46" width="45" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="379" y="61" fill="#0F172A" font-size="9" font-weight="bold">Unit</text>
    <rect x="420" y="46" width="110" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="424" y="61" fill="#0F172A" font-size="9" font-weight="bold">Description</text>
    <rect x="530" y="46" width="50" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="534" y="61" fill="#0F172A" font-size="9" font-weight="bold">QtyPlan</text>

    <!-- Row 2: ITM001 -->
    <rect x="0" y="68" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="82" fill="#6B7280" font-size="9" text-anchor="middle">2</text>
    <text x="34" y="82" fill="#1F2937" font-size="8">ITM001</text>
    <text x="104" y="82" fill="#1F2937" font-size="8">แท็บเล็ตตรวจนับสต็อก OGA Pro 10</text>
    <text x="234" y="82" fill="#1F2937" font-size="8">8850123456789</text>
    <text x="314" y="82" fill="#1F2937" font-size="8">Hardware</text>
    <text x="379" y="82" fill="#1F2937" font-size="8">เครื่อง</text>
    <text x="424" y="82" fill="#1F2937" font-size="8">OGA Pro 10 Android PDA</text>
    <text x="534" y="82" fill="#1F2937" font-size="8">100</text>

    <!-- Row 3: ITM002 -->
    <rect x="0" y="88" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="102" fill="#6B7280" font-size="9" text-anchor="middle">3</text>
    <text x="34" y="102" fill="#1F2937" font-size="8">ITM002</text>
    <text x="104" y="102" fill="#1F2937" font-size="8">เครื่องอ่านบาร์โค้ดไร้สาย 2D Bluetooth</text>
    <text x="234" y="102" fill="#1F2937" font-size="8">8850123456796</text>
    <text x="314" y="102" fill="#1F2937" font-size="8">Scanner</text>
    <text x="379" y="102" fill="#1F2937" font-size="8">ตัว</text>
    <text x="424" y="102" fill="#1F2937" font-size="8">2D BT Barcode Scanner</text>
    <text x="534" y="102" fill="#1F2937" font-size="8">50</text>

    <!-- Row 4: ITM003 -->
    <rect x="0" y="108" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="122" fill="#6B7280" font-size="9" text-anchor="middle">4</text>
    <text x="34" y="122" fill="#1F2937" font-size="8">ITM003</text>
    <text x="104" y="122" fill="#1F2937" font-size="8">สติ๊กเกอร์บาร์โค้ดความร้อน 4x3</text>
    <text x="234" y="122" fill="#1F2937" font-size="8">8850123456802</text>
    <text x="314" y="122" fill="#1F2937" font-size="8">Consumable</text>
    <text x="379" y="122" fill="#1F2937" font-size="8">ม้วน</text>
    <text x="424" y="122" fill="#1F2937" font-size="8">สติ๊กเกอร์บาร์โค้ด 4x3</text>
    <text x="534" y="122" fill="#1F2937" font-size="8">200</text>

    <!-- Row 5: ITM004 -->
    <rect x="0" y="128" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="142" fill="#6B7280" font-size="9" text-anchor="middle">5</text>
    <text x="34" y="142" fill="#1F2937" font-size="8">ITM004</text>
    <text x="104" y="142" fill="#1F2937" font-size="8">ริบบอนบาร์โค้ด Wax Resin 110x300m</text>
    <text x="234" y="142" fill="#1F2937" font-size="8">8850123456819</text>
    <text x="314" y="142" fill="#1F2937" font-size="8">Consumable</text>
    <text x="379" y="142" fill="#1F2937" font-size="8">ม้วน</text>
    <text x="424" y="142" fill="#1F2937" font-size="8">ริบบอน 110mm x 300m</text>
    <text x="534" y="142" fill="#1F2937" font-size="8">150</text>

    <!-- Row 6: ITM005 -->
    <rect x="0" y="148" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="162" fill="#6B7280" font-size="9" text-anchor="middle">6</text>
    <text x="34" y="162" fill="#1F2937" font-size="8">ITM005</text>
    <text x="104" y="162" fill="#1F2937" font-size="8">เครื่องพิมพ์บาร์โค้ด Industrial</text>
    <text x="234" y="162" fill="#1F2937" font-size="8">8850123456826</text>
    <text x="314" y="162" fill="#1F2937" font-size="8">Printer</text>
    <text x="379" y="162" fill="#1F2937" font-size="8">เครื่อง</text>
    <text x="424" y="162" fill="#1F2937" font-size="8">เครื่องพิมพ์ Industrial</text>
    <text x="534" y="162" fill="#1F2937" font-size="8">20</text>

    <!-- Grid lines -->
    <line x1="30" y1="46" x2="30" y2="168" stroke="#E5E7EB"/>
    <line x1="100" y1="46" x2="100" y2="168" stroke="#E5E7EB"/>
    <line x1="230" y1="46" x2="230" y2="168" stroke="#E5E7EB"/>
    <line x1="310" y1="46" x2="310" y2="168" stroke="#E5E7EB"/>
    <line x1="375" y1="46" x2="375" y2="168" stroke="#E5E7EB"/>
    <line x1="420" y1="46" x2="420" y2="168" stroke="#E5E7EB"/>
    <line x1="530" y1="46" x2="530" y2="168" stroke="#E5E7EB"/>

    <!-- Bottom Tabs -->
    <rect x="0" y="192" width="580" height="28" fill="#F8FAFC" stroke="#E5E7EB"/>
    <rect x="10" y="196" width="90" height="20" rx="3" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="20" y="210" fill="#107C41" font-size="9" font-weight="bold">ItemMaster</text>
    <text x="110" y="210" fill="#6B7280" font-size="12">+</text>
  </svg>
  `;
}

// Location Master Excel Spreadsheet Preview SVG
export function getLocationMasterExcelSvg(): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="580" height="220" viewBox="0 0 580 220">
    <defs>
      <style>
        text { font-family: 'Segoe UI', 'Sarabun', Tahoma, sans-serif; }
      </style>
    </defs>
    <!-- Window Header -->
    <rect width="580" height="220" rx="6" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1"/>
    <rect width="580" height="24" rx="6" fill="#107C41"/>
    <text x="12" y="16" fill="#FFFFFF" font-size="11" font-weight="bold">AutoSave ON | LocationMaster_Template.xlsx - Excel</text>
    
    <!-- Column Headers A-E -->
    <rect x="0" y="24" width="30" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <rect x="30" y="24" width="100" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="80" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">A</text>
    <rect x="130" y="24" width="130" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="195" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">B</text>
    <rect x="260" y="24" width="80" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="300" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">C</text>
    <rect x="340" y="24" width="90" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="385" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">D</text>
    <rect x="430" y="24" width="150" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="505" y="39" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">E</text>

    <!-- Row 1: Header Titles -->
    <rect x="0" y="46" width="30" height="22" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="61" fill="#374151" font-size="10" font-weight="bold" text-anchor="middle">1</text>
    <rect x="30" y="46" width="100" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="34" y="61" fill="#0F172A" font-size="9" font-weight="bold">LocationCode</text>
    <rect x="130" y="46" width="130" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="134" y="61" fill="#0F172A" font-size="9" font-weight="bold">LocationName</text>
    <rect x="260" y="46" width="80" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="264" y="61" fill="#0F172A" font-size="9" font-weight="bold">Zone</text>
    <rect x="340" y="46" width="90" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="344" y="61" fill="#0F172A" font-size="9" font-weight="bold">Warehouse</text>
    <rect x="430" y="46" width="150" height="22" fill="#E2E8F0" stroke="#CBD5E1"/>
    <text x="434" y="61" fill="#0F172A" font-size="9" font-weight="bold">Description</text>

    <!-- Row 2: LOC-A01-01 -->
    <rect x="0" y="68" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="82" fill="#6B7280" font-size="9" text-anchor="middle">2</text>
    <text x="34" y="82" fill="#1F2937" font-size="8">LOC-A01-01</text>
    <text x="134" y="82" fill="#1F2937" font-size="8">Shelf A-01 ชั้น 1</text>
    <text x="264" y="82" fill="#1F2937" font-size="8">Zone-A</text>
    <text x="344" y="82" fill="#1F2937" font-size="8">คลังสินค้าหลัก</text>
    <text x="434" y="82" fill="#1F2937" font-size="8">โซนสินค้าคอมพิวเตอร์และ PDA</text>

    <!-- Row 3: LOC-A01-02 -->
    <rect x="0" y="88" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="102" fill="#6B7280" font-size="9" text-anchor="middle">3</text>
    <text x="34" y="102" fill="#1F2937" font-size="8">LOC-A01-02</text>
    <text x="134" y="102" fill="#1F2937" font-size="8">Shelf A-01 ชั้น 2</text>
    <text x="264" y="102" fill="#1F2937" font-size="8">Zone-A</text>
    <text x="344" y="82" fill="#1F2937" font-size="8">คลังสินค้าหลัก</text>
    <text x="434" y="102" fill="#1F2937" font-size="8">โซนอุปกรณ์ต่อพ่วง</text>

    <!-- Row 4: LOC-B02-01 -->
    <rect x="0" y="108" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="122" fill="#6B7280" font-size="9" text-anchor="middle">4</text>
    <text x="34" y="122" fill="#1F2937" font-size="8">LOC-B02-01</text>
    <text x="134" y="122" fill="#1F2937" font-size="8">Shelf B-02 ชั้น 1</text>
    <text x="264" y="122" fill="#1F2937" font-size="8">Zone-B</text>
    <text x="344" y="122" fill="#1F2937" font-size="8">คลังวัตถุดิบ</text>
    <text x="434" y="122" fill="#1F2937" font-size="8">โซนกระดาษและสติ๊กเกอร์</text>

    <!-- Row 5: LOC-C03-01 -->
    <rect x="0" y="128" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="142" fill="#6B7280" font-size="9" text-anchor="middle">5</text>
    <text x="34" y="142" fill="#1F2937" font-size="8">LOC-C03-01</text>
    <text x="134" y="142" fill="#1F2937" font-size="8">Cold Room C-01</text>
    <text x="264" y="142" fill="#1F2937" font-size="8">Zone-C</text>
    <text x="344" y="142" fill="#1F2937" font-size="8">คลังควบคุมอุณหภูมิ</text>
    <text x="434" y="142" fill="#1F2937" font-size="8">ห้องแช่เย็นควบคุมพิเศษ</text>

    <!-- Row 6: LOC-DMG-01 -->
    <rect x="0" y="148" width="30" height="20" fill="#F3F4F6" stroke="#E5E7EB"/>
    <text x="15" y="162" fill="#6B7280" font-size="9" text-anchor="middle">6</text>
    <text x="34" y="162" fill="#1F2937" font-size="8">LOC-DMG-01</text>
    <text x="134" y="162" fill="#1F2937" font-size="8">Quarantine Damage Zone</text>
    <text x="264" y="162" fill="#1F2937" font-size="8">Zone-DMG</text>
    <text x="344" y="162" fill="#1F2937" font-size="8">คลังสินค้าชำรุด</text>
    <text x="434" y="162" fill="#1F2937" font-size="8">โซนกักกันสินค้าชำรุดรอส่งคืน</text>

    <!-- Bottom Tabs -->
    <rect x="0" y="192" width="580" height="28" fill="#F8FAFC" stroke="#E5E7EB"/>
    <rect x="10" y="196" width="100" height="20" rx="3" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="18" y="210" fill="#107C41" font-size="9" font-weight="bold">LocationMaster</text>
    <text x="120" y="210" fill="#6B7280" font-size="12">+</text>
  </svg>
  `;
}

// Convert an SVG string to a high resolution PNG buffer
export async function svgToPngBuffer(svgString: string, width = 420, height = 680): Promise<Buffer> {
  return sharp(Buffer.from(svgString))
    .resize(width, height)
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();
}
