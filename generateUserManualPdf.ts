import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import {
  getOgaGroupLogoSvg,
  getItemMasterExcelSvg,
  getLocationMasterExcelSvg,
  getHomeScreenSvg,
  getItemMasterSvg,
  getLocationMasterSvg,
  getScanScreenSvg,
  getItemOutOfMasterDialogSvg,
  getItemOutOfMasterFullSvg,
  getScanScreenLotOnlySvg,
  getScanScreenLotExpirySvg,
  getQRCodeConfigScreenSvg,
  getQRSimulatorSvg,
  getQRProfilesList1Svg,
  getQRProfilesList2Svg,
  getQRProfilesList3Svg,
  getViewItemScanSvg,
  getThemingScreenSvg,
  svgToPngBuffer
} from './generateScreenImages';

// Fonts lookup - prioritized verified TrueType fonts
let sarabunRegularPath: string | null = null;
let sarabunBoldPath: string | null = null;

try {
  const regCandidates = [
    '/usr/share/fonts/truetype/tlwg/Garuda.ttf',
    '/usr/share/fonts/truetype/tlwg/Laksaman.ttf',
    '/usr/share/fonts/truetype/tlwg/Loma.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
  ];
  for (const c of regCandidates) {
    if (fs.existsSync(c)) {
      sarabunRegularPath = c;
      break;
    }
  }

  const boldCandidates = [
    '/usr/share/fonts/truetype/tlwg/Garuda-Bold.ttf',
    '/usr/share/fonts/truetype/tlwg/Laksaman-Bold.ttf',
    '/usr/share/fonts/truetype/tlwg/Loma-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
  ];
  for (const c of boldCandidates) {
    if (fs.existsSync(c)) {
      sarabunBoldPath = c;
      break;
    }
  }
} catch (e) {
  console.warn('PDF font lookup note:', e);
}

/**
 * Generates the full 36-page PDF manual SOP-WMS-STK-001 (Rev.05)
 */
export async function generateUserManualPdf(): Promise<Buffer> {
  // Pre-generate all PNG image buffers
  const [
    logoImg,
    excelItemImg,
    excelLocImg,
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    img11,
    img12,
    img13,
    img14,
    img15
  ] = await Promise.all([
    svgToPngBuffer(getOgaGroupLogoSvg(), 180, 180),
    svgToPngBuffer(getItemMasterExcelSvg(), 500, 190),
    svgToPngBuffer(getLocationMasterExcelSvg(), 500, 190),
    svgToPngBuffer(getHomeScreenSvg(), 340, 550),
    svgToPngBuffer(getItemMasterSvg(), 340, 550),
    svgToPngBuffer(getLocationMasterSvg(), 340, 550),
    svgToPngBuffer(getScanScreenSvg(), 340, 550),
    svgToPngBuffer(getItemOutOfMasterDialogSvg(), 360, 230),
    svgToPngBuffer(getItemOutOfMasterFullSvg(), 340, 550),
    svgToPngBuffer(getScanScreenLotOnlySvg(), 340, 550),
    svgToPngBuffer(getScanScreenLotExpirySvg(), 340, 550),
    svgToPngBuffer(getQRCodeConfigScreenSvg(), 340, 550),
    svgToPngBuffer(getQRSimulatorSvg(), 340, 550),
    svgToPngBuffer(getQRProfilesList1Svg(), 340, 550),
    svgToPngBuffer(getQRProfilesList2Svg(), 340, 550),
    svgToPngBuffer(getQRProfilesList3Svg(), 340, 550),
    svgToPngBuffer(getViewItemScanSvg(), 340, 550),
    svgToPngBuffer(getThemingScreenSvg(), 340, 550)
  ]);

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Register fonts if available
      const fontRegular = sarabunRegularPath ? 'Sarabun-Regular' : 'Helvetica';
      const fontBold = sarabunBoldPath ? 'Sarabun-Bold' : (sarabunRegularPath ? 'Sarabun-Regular' : 'Helvetica-Bold');

      if (sarabunRegularPath) doc.registerFont('Sarabun-Regular', sarabunRegularPath);
      if (sarabunBoldPath) doc.registerFont('Sarabun-Bold', sarabunBoldPath);

      const PRIMARY = '#002060';
      const BLUE_TITLE = '#2E75B6';
      const DARK = '#000000';
      const GRAY = '#595959';

      // Helper functions
      const addHeader = () => {
        doc.font(fontRegular).fontSize(8.5).fillColor(GRAY).text('OGA INTERNATIONAL CO., LTD. | COUNT STOCK AI', 40, 22, { align: 'right' });
        doc.moveTo(40, 34).lineTo(555, 34).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      };

      const h1 = (title: string) => {
        addHeader();
        doc.moveDown(0.8);
        doc.font(fontBold).fontSize(14).fillColor(DARK).text(title);
        doc.moveDown(0.3);
      };

      const h2 = (title: string) => {
        doc.moveDown(0.4);
        doc.font(fontBold).fontSize(12).fillColor(BLUE_TITLE).text(title);
        doc.moveDown(0.2);
      };

      const p = (text: string) => {
        doc.font(fontRegular).fontSize(10).fillColor(DARK).text(text, { lineGap: 3 });
        doc.moveDown(0.25);
      };

      const drawTable = (headers: string[], rows: string[][], colWidths: number[]) => {
        const startX = 40;
        let y = doc.y + 4;
        const totalWidth = 515;

        // Header Row
        doc.rect(startX, y, totalWidth, 20).fill('#2F5597');
        let curX = startX;
        headers.forEach((h, i) => {
          const w = (colWidths[i] / 100) * totalWidth;
          doc.font(fontBold).fontSize(9).fillColor('#FFFFFF').text(h, curX + 4, y + 5, { width: w - 8, align: 'left' });
          curX += w;
        });
        y += 20;

        // Body Rows
        rows.forEach((row, rIdx) => {
          const rowHeight = 20;
          if (rIdx % 2 === 1) {
            doc.rect(startX, y, totalWidth, rowHeight).fill('#F8FAFC');
          }
          doc.rect(startX, y, totalWidth, rowHeight).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

          curX = startX;
          row.forEach((cell, cIdx) => {
            const w = (colWidths[cIdx] / 100) * totalWidth;
            doc.font(fontRegular).fontSize(8.5).fillColor(DARK).text(cell, curX + 4, y + 4, { width: w - 8, align: 'left' });
            curX += w;
          });
          y += rowHeight;
        });

        doc.y = y + 8;
      };

      const drawCallout = (title: string, lines: string[]) => {
        const startX = 40;
        const y = doc.y + 4;
        const totalWidth = 515;
        const height = 24 + lines.length * 16;

        doc.rect(startX, y, totalWidth, height).fill('#FFF2F2');
        doc.rect(startX, y, totalWidth, height).strokeColor('#FFC000').lineWidth(1).stroke();

        doc.font(fontBold).fontSize(10).fillColor('#C00000').text(title, startX + 12, y + 6);
        let curY = y + 22;
        lines.forEach(l => {
          doc.font(fontRegular).fontSize(9).fillColor(DARK).text(l, startX + 12, curY);
          curY += 15;
        });
        doc.y = y + height + 10;
      };

      // ==========================================
      // PAGE 1: COVER PAGE
      // ==========================================
      addHeader();
      doc.moveDown(1.5);
      doc.font(fontBold).fontSize(20).fillColor(PRIMARY).text('OGA INTERNATIONAL CO., LTD.', { align: 'center' });
      doc.moveDown(0.8);

      const logoX = (doc.page.width - 120) / 2;
      doc.image(logoImg, logoX, doc.y, { width: 120, height: 120 });
      doc.y += 130;

      // Condition 4: "แก้ไขเฉพาะหน้าปก: ปรับแก้ข้อความบนหน้าปกให้เป็นหัวข้อ 'คู่มือปฏิบัติงานระบบตรวจนับสต็อก' เท่านั้น"
      doc.font(fontBold).fontSize(18).fillColor('#4B0082').text('คู่มือปฏิบัติงานระบบตรวจนับสต็อก', { align: 'center' });
      doc.moveDown(0.3);
      doc.font(fontBold).fontSize(24).fillColor(BLUE_TITLE).text('COUNT STOCK AI', { align: 'center' });
      doc.moveDown(0.2);
      doc.font(fontRegular).fontSize(11).fillColor(GRAY).text('Comprehensive User Manual & Standard Operating Procedure', { align: 'center' });
      doc.moveDown(0.8);
      doc.font(fontBold).fontSize(14).fillColor(DARK).text('สำหรับ Web Application / PWA Mobile / PDA', { align: 'center' });
      doc.moveDown(0.2);
      doc.font(fontRegular).fontSize(10).fillColor(GRAY).text('ครอบคลุม Item Master, Location Master, Scan Item, QR Code Settings, View Logs และ Theming', { align: 'center' });
      doc.moveDown(1.2);

      drawTable(
        ['รหัสเอกสาร', 'SOP-WMS-STK-001'],
        [
          ['ฉบับแก้ไข', 'Rev.05'],
          ['วันที่จัดทำ', '22 สิงหาคม 2026'],
          ['หน่วยงาน', 'Warehouse / Production / Business Solution'],
          ['สถานะเอกสาร', 'ฉบับใช้งานสำหรับภาพชุดที่ 1 จำนวน 15 ภาพ']
        ],
        [40, 60]
      );

      // ==========================================
      // PAGE 2: DOCUMENT CONTROL
      // ==========================================
      doc.addPage();
      h1('การควบคุมเอกสารและการอนุมัติ');
      drawTable(
        ['รายการ', 'ชื่อ/ตำแหน่ง', 'ลายมือชื่อ', 'วันที่'],
        [
          ['ผู้จัดทำ', 'ทีมพัฒนาระบบ Count Stock AI', '', ''],
          ['ผู้ทบทวน', 'หัวหน้างานคลังสินค้า / System Owner', '', ''],
          ['ผู้อนุมัติ', 'ผู้บริหารที่ได้รับมอบหมาย', '', '']
        ],
        [20, 40, 20, 20]
      );

      h1('ประวัติการแก้ไขเอกสาร');
      drawTable(
        ['Rev.', 'วันที่', 'รายละเอียด'],
        [
          ['04', '21/08/2026', 'คู่มือระบบ OGA WMS Stock Count Pro ฉบับเดิม'],
          ['05', '22/08/2026', 'ปรับเป็น Count Stock AI เพิ่มภาพหน้าจอจริง 15 ภาพ เพิ่มวิธีสร้าง Item/Location Master ตัวอย่าง Excel, QR Profiles, Item Out of Master, View Item Scan และ Theming']
        ],
        [15, 25, 60]
      );

      h2('ขอบเขตฉบับนี้');
      p('เอกสารฉบับนี้จัดทำจากภาพชุดแรก 15 ภาพและไฟล์ Template ที่ได้รับ สามารถนำไปอบรมและทดสอบระบบได้ทันที เมื่อมีภาพอีก 11 ภาพสามารถต่อเติมโดยคงเลขเอกสารและรูปแบบเดิมได้');

      // ==========================================
      // PAGE 3 & 4: CONTENTS
      // ==========================================
      doc.addPage();
      h1('สารบัญ');
      h2('Contents');
      p('ประวัติการแก้ไขเอกสาร ..................................................................................................................................................... 2');
      p('สารบัญ ............................................................................................................................................................................... 3');
      p('1. วัตถุประสงค์ ขอบเขต และบทบาทผู้ใช้งาน ............................................................................................................................... 5');
      p('   1.1 บทบาทและสิทธิ์ .......................................................................................................................................................... 5');
      p('2. ภาพรวมหน้าจอหลัก ........................................................................................................................................................... 6');
      p('3. การสร้างและนำเข้า Item Master .......................................................................................................................................... 8');
      p('   3.1 ความหมายของคอลัมน์ใน ItemMaster_Template.xlsx ...................................................................................................... 9');
      p('   3.2 ตัวอย่างข้อมูลที่ถูกต้อง .................................................................................................................................................. 9');
      p('   3.3 ขั้นตอนเตรียมไฟล์ก่อน Import ................................................................................................................................... 10');
      p('4. การสร้างและนำเข้า Location Master ................................................................................................................................. 12');
      p('   4.1 ความหมายของคอลัมน์ .............................................................................................................................................. 13');
      p('   4.2 ตัวอย่างข้อมูลที่ถูกต้อง ............................................................................................................................................... 13');
      p('   4.3 หลักการตั้งรหัส Location .......................................................................................................................................... 14');
      p('   4.4 ขั้นตอน Import และตรวจสอบ .................................................................................................................................... 14');
      p('5. การตรวจนับสินค้าและ QR Code Profile ............................................................................................................................. 15');
      p('   5.1 ส่วนประกอบสำคัญ ................................................................................................................................................... 17');
      p('   5.2 ขั้นตอนการนับมาตรฐาน ............................................................................................................................................ 17');
      p('   5.3 การจัดการ Item Out of Master ................................................................................................................................. 19');
      p('6. การตั้งค่าฟิลด์ Lot, Expiry และ Serial ................................................................................................................................ 21');
      p('   6.1 หลักการ Enabled / Disabled ................................................................................................................................... 23');
      p('7. QR Code Settings และการทดสอบ Profile ......................................................................................................................... 24');
      p('   7.1 วิธีทดสอบ ............................................................................................................................................................... 25');
      p('   7.2 รูปแบบ QR ที่รองรับตามภาพ ...................................................................................................................................... 29');
      p('8. การตรวจสอบ View Item Scan และการ Export ................................................................................................................... 30');
      p('   8.1 รายละเอียดข้อมูลที่ต้องตรวจ ...................................................................................................................................... 30');
      p('   8.2 ปุ่ม Clear และ Export to Data .................................................................................................................................. 31');
      p('   8.3 Checklist ก่อน Export ............................................................................................................................................. 31');
      p('9. การตั้งค่า Theme ........................................................................................................................................................... 32');
      p('10. Troubleshooting และคำถามที่พบบ่อย ............................................................................................................................. 34');
      p('11. Checklist การปฏิบัติงาน ................................................................................................................................................ 35');
      p('   11.1 ก่อนเริ่มตรวจนับ .................................................................................................................................................... 35');
      p('   11.2 ระหว่างตรวจนับ ..................................................................................................................................................... 35');
      p('   11.3 หลังตรวจนับ ......................................................................................................................................................... 35');
      p('12. ภาคผนวก: Data Dictionary แบบย่อ ................................................................................................................................ 36');
      doc.moveDown(0.5);
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('หมายเหตุ: เปิดไฟล์ด้วย Microsoft Word แล้วกด Ctrl+A และ F9 เพื่ออัปเดตสารบัญและเลขหน้า');

      // ==========================================
      // PAGE 5: SECTION 1
      // ==========================================
      doc.addPage();
      h1('1. วัตถุประสงค์ ขอบเขต และบทบาทผู้ใช้งาน');
      p('คู่มือนี้กำหนดวิธีเตรียมข้อมูลหลัก นำเข้า ตรวจนับ ตรวจสอบ และส่งออกข้อมูลของระบบ Count Stock AI เพื่อให้การตรวจนับมีความถูกต้อง ตรวจสอบย้อนกลับได้ และลดความเสี่ยงจากการบันทึกผิดรหัสสินค้า ผิดตำแหน่ง ผิด Lot หรือผิด Serial Number');
      p('• ใช้เป็นมาตรฐานก่อนเริ่ม Cycle Count และ Annual Stock Count');
      p('• ใช้ฝึกอบรม Admin, Supervisor, Operator และ Auditor');
      p('• ใช้เป็นหลักฐานอ้างอิงในการตรวจสอบข้อมูลและแก้ไขข้อผิดพลาด');
      p('• ใช้ควบคุมรูปแบบ QR Code ให้สอดคล้องกับ Lot, Expiry, Serial และ Quantity');
      h2('1.1 บทบาทและสิทธิ์');
      drawTable(
        ['บทบาท', 'หน้าที่หลัก', 'ข้อควรควบคุม'],
        [
          ['Admin', 'ตั้งค่า, นำเข้า Master, จัดการ QR Profiles, ล้าง/ส่งออกข้อมูล', 'สำรองข้อมูลก่อน Clear และจำกัดสิทธิ์แก้ไข'],
          ['Supervisor', 'ตรวจสอบความพร้อม, อนุมัติวิธีนับ, ตรวจสอบผล', 'ตรวจยอดผิดปกติและ Item Out of Master'],
          ['Operator', 'เลือก Location, สแกน, กรอก Lot/Expiry/Serial/Qty, บันทึก', 'ตรวจหน้าจอก่อนกดบันทึกทุกครั้ง'],
          ['Auditor', 'ตรวจ View Logs และไฟล์ Export', 'ห้ามแก้ข้อมูลต้นฉบับโดยไม่มีหลักฐาน']
        ],
        [20, 45, 35]
      );

      // ==========================================
      // PAGE 6 & 7: SECTION 2
      // ==========================================
      doc.addPage();
      h1('2. ภาพรวมหน้าจอหลัก');
      const img1X = (doc.page.width - 250) / 2;
      doc.image(img1, img1X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 1 หน้าจอ Home Dashboard ของ Count Stock AI', { align: 'center' });
      doc.moveDown(0.8);
      p('• ITEM MASTER ใช้จัดเตรียมทะเบียนสินค้าก่อนเริ่มตรวจนับ');
      p('• LOCATION ใช้จัดเตรียมตำแหน่งคลัง ชั้นวาง และโซน');
      p('• SCAN ITEM ใช้บันทึกผลการตรวจนับจริง');
      p('• VIEW LOGS ใช้ตรวจสอบ ลบ ค้นหา และ Export ผลการนับ');
      p('• QR CODE SETTINGS ใช้กำหนดโครงสร้างข้อมูลใน QR Code');
      p('• SYSTEM SETTINGS ใช้ตั้งค่าบริษัท สาขา รอบตรวจนับ และ Auto Increment');
      h2('ลำดับการเริ่มใช้งานที่แนะนำ');
      p('1) สร้าง Item Master → 2) สร้าง Location Master → 3) ตรวจ QR Profile → 4) เลือก Target Location → 5) สแกนและบันทึก → 6) ตรวจ View Logs → 7) Export และสำรองหลักฐาน');

      // ==========================================
      // PAGE 8-11: SECTION 3
      // ==========================================
      doc.addPage();
      h1('3. การสร้างและนำเข้า Item Master');
      const img2X = (doc.page.width - 250) / 2;
      doc.image(img2, img2X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 2 หน้าจอ Item Master หลังนำเข้าข้อมูลตัวอย่าง 5 รายการ', { align: 'center' });
      doc.moveDown(0.5);
      p('Item Master เป็นข้อมูลอ้างอิงหลักที่ระบบใช้ตรวจสอบ Item Code หรือ Barcode หากไม่มีรายการ ระบบจะแสดง Item Out of Master ดังนั้นควรจัดทำ ตรวจสอบ และอนุมัติไฟล์ก่อนเปิดรอบตรวจนับ');

      doc.addPage();
      h2('3.1 ความหมายของคอลัมน์ใน ItemMaster_Template.xlsx');
      drawTable(
        ['คอลัมน์', 'สถานะ', 'คำอธิบาย/กติกา', 'ตัวอย่าง'],
        [
          ['ItemCode', 'จำเป็น', 'รหัสสินค้า ห้ามซ้ำ ห้ามเว้นวรรคหัวท้าย', 'ITM001'],
          ['ItemName', 'จำเป็น', 'ชื่อสินค้าที่แสดงบนหน้าจอ', 'แท็บเล็ตตรวจนับสต็อก OGA Pro 10'],
          ['ItemDescription', 'แนะนำ', 'คำอธิบายเพิ่มเติม', 'แท็บเล็ตสำหรับงานตรวจนับ'],
          ['Barcode', 'แนะนำ', 'ตัวเลข/ข้อความตามบาร์โค้ด ต้องไม่ซ้ำ', '8850123456789'],
          ['Category', 'แนะนำ', 'หมวดสินค้าเพื่อการค้นหาและรายงาน', 'Hardware'],
          ['Unit', 'จำเป็น', 'หน่วยนับพื้นฐาน', 'เครื่อง'],
          ['SerialNumber', 'ตามเงื่อนไข', 'ค่าเริ่มต้นหรือเครื่องหมาย - หากไม่มี', '-'],
          ['Quantity', 'จำเป็น', 'ยอดอ้างอิงหรือ Qty Plan ต้องเป็นตัวเลข', '100'],
          ['Udf01-Udf05', 'ไม่บังคับ', 'ฟิลด์สำรอง ห้ามเปลี่ยนชื่อหัวคอลัมน์', '-']
        ],
        [22, 18, 42, 18]
      );

      h2('3.2 ตัวอย่างข้อมูลที่ถูกต้อง');
      drawTable(
        ['ItemCode', 'ItemName', 'Barcode', 'Category', 'Unit', 'Qty'],
        [
          ['ITM001', 'แท็บเล็ตตรวจนับสต็อก OGA Pro 10', '8850123456789', 'Hardware', 'เครื่อง', '100'],
          ['ITM002', 'เครื่องอ่านบาร์โค้ดไร้สาย 2D BT', '8850123456796', 'Scanner', 'ตัว', '50'],
          ['ITM003', 'สติ๊กเกอร์บาร์โค้ดความร้อน 4x3', '8850123456802', 'Consumable', 'ม้วน', '200'],
          ['ITM004', 'ริบบอนบาร์โค้ด Wax Resin 110x300m', '8850123456819', 'Consumable', 'ม้วน', '150'],
          ['ITM005', 'เครื่องพิมพ์บาร์โค้ด Industrial', '8850123456826', 'Printer', 'เครื่อง', '20']
        ],
        [15, 35, 20, 15, 8, 7]
      );

      const excel1X = (doc.page.width - 440) / 2;
      doc.image(excelItemImg, excel1X, doc.y, { width: 440, height: 160 });
      doc.y += 165;

      h2('3.3 ขั้นตอนเตรียมไฟล์ก่อน Import');
      p('ขั้นตอนที่ 1: ดาวน์โหลด Template กดปุ่ม Template ในหน้า Item Master และบันทึกไฟล์โดยไม่เปลี่ยนนามสกุล .xlsx');
      p('ขั้นตอนที่ 2: กรอกข้อมูล เริ่มกรอกตั้งแต่แถวถัดจากหัวคอลัมน์ ห้ามแทรกแถวว่างและห้าม Merge Cell');
      p('ขั้นตอนที่ 3: ตรวจรหัสซ้ำ ItemCode และ Barcode ต้องไม่ซ้ำกัน และควรเก็บ Barcode เป็น Text เพื่อรักษาเลขศูนย์นำหน้า');
      p('ขั้นตอนที่ 4: ตรวจ Quantity ต้องเป็นเลข 0 หรือจำนวนเต็มบวก ห้ามใช้เครื่องหมายคอมมาในตัวเลข');
      p('ขั้นตอนที่ 5: บันทึกและปิด Excel ปิดไฟล์ก่อนเลือกในระบบ เพื่อป้องกันไฟล์ถูกล็อก');
      p('ขั้นตอนที่ 6: Select File และ Import กด SELECT FILE เลือกไฟล์ที่ตรวจแล้ว จากนั้นกด Import รอข้อความสำเร็จ');
      p('ขั้นตอนที่ 7: ตรวจผล ตรวจ Total, ค้นหารหัสตัวอย่าง และเทียบ Item Name, Barcode, Unit, Qty Plan');
      drawCallout('ข้อห้ามสำคัญ', [
        'ห้ามลบหรือเปลี่ยนชื่อหัวคอลัมน์ ห้ามใส่สูตรแทนค่าข้อมูล ห้ามใช้ ItemCode ซ้ำ และห้ามนำเข้าไฟล์ที่ยังเปิดค้างใน Excel'
      ]);

      // ==========================================
      // PAGE 12-14: SECTION 4
      // ==========================================
      doc.addPage();
      h1('4. การสร้างและนำเข้า Location Master');
      const img3X = (doc.page.width - 250) / 2;
      doc.image(img3, img3X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 3 หน้าจอ Location Master หลังนำเข้าตำแหน่งตัวอย่าง 5 จุด', { align: 'center' });

      doc.addPage();
      h2('4.1 ความหมายของคอลัมน์');
      drawTable(
        ['คอลัมน์', 'สถานะ', 'คำอธิบาย/กติกา', 'ตัวอย่าง'],
        [
          ['location_code', 'จำเป็น', 'รหัสตำแหน่ง ห้ามซ้ำ ใช้เป็นคีย์ในการตรวจนับ', 'LOC-A01-01'],
          ['location_name', 'จำเป็น', 'ชื่อชั้นวาง/พื้นที่ที่ผู้ใช้อ่านเข้าใจ', 'Shelf A-01 ชั้น 1'],
          ['location_description', 'แนะนำ', 'คำอธิบายพื้นที่หรือประเภทสินค้า', 'โซนสินค้าคอมพิวเตอร์และ PDA'],
          ['Zone', 'แนะนำ', 'กลุ่มโซนสำหรับกรองรายงาน', 'Zone-A'],
          ['Warehouse', 'จำเป็น', 'ชื่อคลังที่ตำแหน่งสังกัด', 'คลังสินค้าหลัก']
        ],
        [22, 18, 42, 18]
      );

      h2('4.2 ตัวอย่างข้อมูลที่ถูกต้อง');
      drawTable(
        ['location_code', 'location_name', 'location_description', 'Zone', 'Warehouse'],
        [
          ['LOC-A01-01', 'Shelf A-01 ชั้น 1', 'โซนสินค้าคอมพิวเตอร์และ PDA', 'Zone-A', 'คลังสินค้าหลัก'],
          ['LOC-A01-02', 'Shelf A-01 ชั้น 2', 'โซนอุปกรณ์ต่อพ่วง', 'Zone-A', 'คลังสินค้าหลัก'],
          ['LOC-B02-01', 'Shelf B-02 ชั้น 1', 'โซนกระดาษและสติ๊กเกอร์', 'Zone-B', 'คลังวัตถุดิบ'],
          ['LOC-C03-01', 'Cold Room C-01', 'ห้องแช่เย็นควบคุมพิเศษ', 'Zone-C', 'คลังควบคุมอุณหภูมิ'],
          ['LOC-DMG-01', 'Quarantine Damage Zone', 'โซนกักกันสินค้าชำรุดรอส่งคืน', 'Zone-DMG', 'คลังสินค้าชำรุด']
        ],
        [18, 22, 30, 15, 15]
      );

      const excel2X = (doc.page.width - 440) / 2;
      doc.image(excelLocImg, excel2X, doc.y, { width: 440, height: 160 });
      doc.y += 165;

      h2('4.3 หลักการตั้งรหัส Location');
      p('แนะนำรูปแบบ LOC-[Zone][Rack]-[Level] เช่น LOC-A01-01 หมายถึง Zone A, Rack 01, ชั้น 01 ซึ่งช่วยให้ค้นหา เรียงลำดับ และติดฉลาก QR ได้ง่าย');
      p('• รหัสต้องตรงกับป้ายจริงที่ชั้นวาง');
      p('• หนึ่งตำแหน่งใช้หนึ่งรหัส ห้ามใช้รหัสซ้ำต่างคลัง');
      p('• พื้นที่ชำรุดควรแยกเป็น LOC-DMG-xx');
      p('• พื้นที่ควบคุมอุณหภูมิควรระบุ Zone และ Warehouse ชัดเจน');
      h2('4.4 ขั้นตอน Import และตรวจสอบ');
      p('ขั้นตอนที่ 1: ดาวน์โหลด Template กด Template และใช้ไฟล์ต้นฉบับ');
      p('ขั้นตอนที่ 2: กรอกผังคลัง อ้างอิงผังพื้นที่จริงและป้าย Location');
      p('ขั้นตอนที่ 3: ตรวจความซ้ำ ตรวจ location_code ไม่ซ้ำและไม่มีช่องว่าง');
      p('ขั้นตอนที่ 4: เลือกไฟล์ กด SELECT FILE');
      p('ขั้นตอนที่ 5: นำเข้า กด Import และรอระบบประมวลผล');
      p('ขั้นตอนที่ 6: ตรวจหน้า List ค้นหาอย่างน้อย 3 จุดและเทียบชื่อ Zone/Warehouse');

      // ==========================================
      // PAGE 15-20: SECTION 5
      // ==========================================
      doc.addPage();
      h1('5. การตรวจนับสินค้าและ QR Code Profile');
      const img4X = (doc.page.width - 250) / 2;
      doc.image(img4, img4X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 4 หน้าสแกนพร้อม QR Profile, Target Location, Lot, Expiry, Serial และ Quantity', { align: 'center' });

      doc.addPage();
      h2('5.1 ส่วนประกอบสำคัญ');
      drawTable(
        ['ส่วน', 'หน้าที่', 'จุดควบคุม'],
        [
          ['QR CODE PROFILE', 'กำหนดการแยกข้อมูลจาก QR', 'รูปแบบและตัวคั่นต้องตรงกับป้ายจริง'],
          ['Auto Count +1', 'บันทึก/เพิ่มจำนวนอัตโนมัติ', 'ควรปิดเมื่อ Quantity ใน QR มากกว่า 1'],
          ['NORMAL / DAMAGE', 'กำหนดสภาพสินค้า', 'ตรวจเลือกก่อนบันทึก'],
          ['TARGET LOCATION', 'ตำแหน่งที่กำลังนับ', 'ล็อกตำแหน่งและเปลี่ยนเมื่อย้ายจุด'],
          ['ITEM CODE / QR CODE', 'รับค่าจากการพิมพ์ กล้อง หรือสแกนเนอร์', 'ตรวจ Item Code ก่อนบันทึก'],
          ['LOT / EXPIRY / SERIAL', 'ข้อมูลควบคุมตาม Setting', 'ต้องกรอกครบเมื่อ Enabled'],
          ['QUANTITY', 'จำนวนที่นับ', 'ต้องเป็นค่าจริงและมากกว่า 0'],
          ['REMARK', 'หมายเหตุหลักฐาน', 'ระบุกรณีชำรุด/ผิดปกติ']
        ],
        [25, 35, 40]
      );

      h2('5.2 ขั้นตอนการนับมาตรฐาน');
      p('ขั้นตอนที่ 1: ตรวจสถานะ ONLINE หาก OFFLINE ให้ทราบว่าข้อมูลอาจรอซิงค์');
      p('ขั้นตอนที่ 2: เลือก Target Location เลือกหรือสแกน Location แล้วตรวจชื่อพื้นที่');
      p('ขั้นตอนที่ 3: เลือก NORMAL หรือ DAMAGE ค่าเริ่มต้นควรเป็น NORMAL');
      p('ขั้นตอนที่ 4: สแกน Item/QR ใช้เครื่องสแกน กล้อง หรือพิมพ์');
      p('ขั้นตอนที่ 5: ตรวจฟิลด์ที่ระบบแยก ตรวจ Item, Lot, Expiry, Serial, Qty');
      p('ขั้นตอนที่ 6: กรอกข้อมูลที่ยังว่าง กรอกตามป้ายสินค้าและรูปแบบวันที่ YYYY-MM-DD');
      p('ขั้นตอนที่ 7: ใส่ Remark กรณีมีข้อสังเกตหรือเป็นสินค้าชำรุด');
      p('ขั้นตอนที่ 8: กด ADD / ENTER RECORD ตรวจรายการที่เพิ่มใน Data Scanned ทันที');

      doc.addPage();
      const img5X = (doc.page.width - 280) / 2;
      doc.image(img5, img5X, doc.y, { width: 280, height: 180 });
      doc.y += 185;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 5 ข้อความ Item Out of Master เมื่อรหัส 12345 ไม่พบใน Item Master', { align: 'center' });
      doc.moveDown(0.5);

      const img6X = (doc.page.width - 250) / 2;
      doc.image(img6, img6X, doc.y, { width: 250, height: 380 });
      doc.y += 385;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 6 มุมมองเต็มของ Item Out of Master บนหน้าสแกน', { align: 'center' });

      doc.addPage();
      h2('5.3 การจัดการ Item Out of Master');
      p('เมื่อระบบไม่พบ Item Code หรือ QR ใน Item Master ระบบจะแจ้งเตือนและให้เลือก ยกเลิก (No) หรือ บันทึก (Yes)');
      drawTable(
        ['ตัวเลือก', 'ใช้เมื่อ', 'ผลลัพธ์/การควบคุม'],
        [
          ['ยกเลิก (No)', 'สงสัยว่าสแกนผิด ป้ายอ่านไม่ครบ หรือยังไม่ได้อัปเดต Master', 'ไม่บันทึก ให้ตรวจป้ายและนำเข้า Master ใหม่'],
          ['บันทึก (Yes)', 'องค์กรอนุญาตให้เก็บ Unregistered Item เพื่อสืบสวน', 'รายการต้องถูกติดธงตรวจสอบ พร้อม Remark และหลักฐาน']
        ],
        [20, 40, 40]
      );
      drawCallout('คำแนะนำด้านการควบคุม', [
        'ค่าเริ่มต้นสำหรับ Operator ควรเลือก “ยกเลิก” และแจ้ง Supervisor การบันทึก Item Out of Master ควรจำกัดสิทธิ์และต้องมีรายการติดตามแก้ Master'
      ]);

      // ==========================================
      // PAGE 21-23: SECTION 6
      // ==========================================
      doc.addPage();
      h1('6. การตั้งค่าฟิลด์ Lot, Expiry และ Serial');
      const img7X = (doc.page.width - 250) / 2;
      doc.image(img7, img7X, doc.y, { width: 250, height: 380 });
      doc.y += 385;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 7 ตัวอย่าง Scan Item เปิด Lot แต่ปิด Expiry และ Serial', { align: 'center' });

      doc.addPage();
      const img8X = (doc.page.width - 250) / 2;
      doc.image(img8, img8X, doc.y, { width: 250, height: 380 });
      doc.y += 385;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 8 ตัวอย่าง Scan Item เปิด Lot และ Expiry แต่ปิด Serial', { align: 'center' });
      doc.moveDown(0.5);

      h2('6.1 หลักการ Enabled / Disabled');
      drawTable(
        ['การตั้งค่า', 'เมื่อ ON', 'เมื่อ OFF', 'ตัวอย่างสินค้า'],
        [
          ['Lot', 'ต้องกรอกหรือดึง Lot จาก QR', 'ไม่แสดง/ไม่บังคับ Lot', 'วัตถุดิบ, อาหาร, เคมีภัณฑ์'],
          ['Expiry', 'ต้องกรอกวันที่ YYYY-MM-DD', 'ไม่บังคับวันหมดอายุ', 'ยา, อาหาร, สินค้ามีอายุ'],
          ['Serial', 'หนึ่ง Serial ต่อหนึ่งหน่วยตามนโยบาย', 'ไม่บังคับ Serial', 'เครื่องจักร, PDA, อุปกรณ์ IT']
        ],
        [18, 30, 26, 26]
      );
      drawCallout('กติกาวันที่', [
        'ใช้รูปแบบ YYYY-MM-DD เช่น 2027-08-19 เท่านั้น เพื่อป้องกันความสับสนระหว่างวันและเดือน'
      ]);

      // ==========================================
      // PAGE 24-29: SECTION 7
      // ==========================================
      doc.addPage();
      h1('7. QR Code Settings และการทดสอบ Profile');
      const img9X = (doc.page.width - 250) / 2;
      doc.image(img9, img9X, doc.y, { width: 250, height: 380 });
      doc.y += 385;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 9 หน้า QR Code Settings และการตรวจเช็คที่เชื่อมโยงกับ Settings', { align: 'center' });

      doc.addPage();
      const img10X = (doc.page.width - 250) / 2;
      doc.image(img10, img10X, doc.y, { width: 250, height: 380 });
      doc.y += 385;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 10 QR Simulator และ Parsed Output', { align: 'center' });
      doc.moveDown(0.5);
      p('QR Simulator ใช้ตรวจว่า Raw String ถูกแยกเป็นฟิลด์ตามลำดับที่ต้องการ ก่อนเลือกใช้ Profile ในหน้างาน');
      h2('7.1 วิธีทดสอบ');
      p('ขั้นตอนที่ 1: เลือก Profile เลือกโครงสร้างที่ตรงกับ QR บนสินค้า');
      p('ขั้นตอนที่ 2: กรอก Raw String พิมพ์ข้อความตามที่เครื่องอ่านได้จริง');
      p('ขั้นตอนที่ 3: ตรวจ Delimiter เช่น ; , หรือ |');
      p('ขั้นตอนที่ 4: ตรวจ Parsed Output เทียบ Item Code, Description, Serial, Lot, Expiry, Quantity');
      p('ขั้นตอนที่ 5: ตรวจ Default ฟิลด์ที่ไม่มีควรเป็น - และ Quantity อาจ Default = 1');
      p('ขั้นตอนที่ 6: ทดสอบหลายตัวอย่าง อย่างน้อย 3 รหัสก่อนประกาศใช้งาน');

      doc.addPage();
      const img11X = (doc.page.width - 250) / 2;
      doc.image(img11, img11X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 11 รายการ QR Profiles: Auto-Detect และ Item,Lot', { align: 'center' });

      doc.addPage();
      const img12X = (doc.page.width - 250) / 2;
      doc.image(img12, img12X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 12 Profile Item;Description;Serial และ Item,Lot,Expiry,Qty', { align: 'center' });

      doc.addPage();
      const img13X = (doc.page.width - 250) / 2;
      doc.image(img13, img13X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 13 Profile Single Item Code และ Pipe Delimited', { align: 'center' });
      doc.moveDown(0.5);

      h2('7.2 รูปแบบ QR ที่รองรับตามภาพ');
      drawTable(
        ['Profile', 'Delimiter', 'ลำดับฟิลด์', 'ตัวอย่าง'],
        [
          ['Single Item', 'None', 'Item Code / Barcode', 'I00001'],
          ['Item,Lot', ',', 'Item Code, Lot Number', 'I00003,BATCH-2026-X'],
          ['Item;Description;Serial', ';', 'Item Code, Description, Serial', 'I00001;Sample Motor;SN-2026-9988'],
          ['Item,Lot,Expiry,Qty', ',', 'Item Code, Lot, Expiry Date, Quantity', 'I00002,LOT-AUG-01,2026-12-31,25'],
          ['Pipe Delimited', '|', 'Item, Lot, Serial, Qty, Remark', 'I00001|LOT99|SN7788|10|สินค้าชำรุด']
        ],
        [24, 14, 32, 30]
      );
      drawCallout('ข้อควรระวัง', [
        'Delimiter ต้องไม่ปรากฏในค่าข้อมูล เช่น หากชื่อสินค้ามีเครื่องหมาย Comma ควรใช้ Semicolon หรือ Pipe แทน และลำดับฟิลด์ต้องตรงกับ Profile 100%'
      ]);

      // ==========================================
      // PAGE 30 & 31: SECTION 8
      // ==========================================
      doc.addPage();
      h1('8. การตรวจสอบ View Item Scan และการ Export');
      const img14X = (doc.page.width - 250) / 2;
      doc.image(img14, img14X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 14 หน้า View Item Scan แสดงรายการ ITM001 ที่ Location LOC-A01-01', { align: 'center' });
      doc.moveDown(0.5);

      h2('8.1 รายละเอียดข้อมูลที่ต้องตรวจ');
      p('• Item Code และ Item Name ต้องตรงกับป้ายสินค้า');
      p('• DESC และ SN/Lot/Exp ต้องตรงกับสินค้าจริง');
      p('• LOCATION ต้องตรงกับ Target Location ที่เลือก');
      p('• Plan และ Scan ใช้เปรียบเทียบยอดอ้างอิงกับยอดนับ');
      p('• Status ต้องเป็น NORMAL หรือสถานะที่กำหนด');
      p('• By และวันเวลาเป็นหลักฐานผู้บันทึก');
      p('• Remark ควรอธิบายข้อยกเว้นให้ตรวจสอบได้');

      doc.addPage();
      h2('8.2 ปุ่ม Clear และ Export to Data');
      drawTable(
        ['ปุ่ม', 'หน้าที่', 'การควบคุมก่อนใช้งาน'],
        [
          ['Clear', 'ล้างผลการนับในขอบเขตที่ระบบกำหนด', 'Export/สำรองข้อมูลก่อน และจำกัดสิทธิ์ Admin'],
          ['Export to Data', 'ส่งออกข้อมูลเพื่อรายงานหรือเชื่อมต่อระบบ', 'ตรวจ Record Count, Filter, รอบนับ และชื่อไฟล์'],
          ['Search', 'ค้นด้วย Item Code หรือ Location Code', 'ล้างคำค้นเพื่อกลับไปดูทั้งหมด'],
          ['Delete', 'ลบรายการรายบรรทัด', 'ตรวจรายการและเก็บเหตุผลการลบ']
        ],
        [20, 35, 45]
      );
      h2('8.3 Checklist ก่อน Export');
      p('• ตรวจ Record Count เทียบจำนวนรายการจริง');
      p('• ตรวจ Location ไม่มีค่าว่าง');
      p('• ตรวจ Item Out of Master และรายการผิดปกติ');
      p('• ตรวจ Serial ซ้ำและ Quantity ผิดปกติ');
      p('• ตรวจสถานะ DAMAGE และ Remark');
      p('• ตั้งชื่อไฟล์ เช่น OGA_CountStock_YYYYMMDD_Round01.xlsx');
      p('• เก็บไฟล์ต้นฉบับแบบ Read-only และส่งสำเนาเพื่อวิเคราะห์');

      // ==========================================
      // PAGE 32 & 33: SECTION 9
      // ==========================================
      doc.addPage();
      h1('9. การตั้งค่า Theme');
      const img15X = (doc.page.width - 250) / 2;
      doc.image(img15, img15X, doc.y, { width: 250, height: 400 });
      doc.y += 405;
      doc.font(fontRegular).fontSize(9).fillColor(GRAY).text('ภาพที่ 15 หน้า Theming สำหรับเลือก Default, Blue, Red, Pink, Purple, Indigo, Teal, Green, Yellow และ Orange', { align: 'center' });
      doc.moveDown(0.5);
      p('Theme เปลี่ยนชุดสีของหน้าจอเพื่อความเหมาะสมในการใช้งาน โดยไม่เปลี่ยนข้อมูลหรือ Logic การตรวจนับ แนะนำ Default หรือ Blue สำหรับการใช้งานมาตรฐาน และควรเลือกสีที่มี Contrast ชัดเจนในพื้นที่คลัง');

      // ==========================================
      // PAGE 34: SECTION 10
      // ==========================================
      doc.addPage();
      h1('10. Troubleshooting และคำถามที่พบบ่อย');
      drawTable(
        ['อาการ', 'สาเหตุที่เป็นไปได้', 'แนวทางแก้ไข'],
        [
          ['Import ไม่สำเร็จ', 'หัวคอลัมน์เปลี่ยน, ไฟล์เปิดค้าง, รูปแบบไม่ใช่ .xlsx', 'ดาวน์โหลด Template ใหม่ คัดลอกเฉพาะค่า ปิด Excel แล้ว Import อีกครั้ง'],
          ['Item Out of Master', 'ยังไม่มี ItemCode/Barcode หรือ Master ไม่ล่าสุด', 'ยกเลิก ตรวจไฟล์ Item Master นำเข้าใหม่แล้วทดสอบค้นหา'],
          ['Location ไม่พบ', 'รหัสไม่อยู่ใน Location Master หรือสะกดไม่ตรง', 'ตรวจ location_code และ Import Location Master'],
          ['QR แยกฟิลด์ผิด', 'เลือก Profile, Delimiter หรือลำดับฟิลด์ผิด', 'เปิด Simulator ทดสอบ Raw String และ Parsed Output'],
          ['Expiry ไม่แสดง', 'Expiry Control ปิด', 'เปิดใน QR/Settings และกลับหน้า Scan'],
          ['Serial ซ้ำ', 'สแกนรายการเดิมซ้ำหรือใช้ Serial เดียวหลายชิ้น', 'ค้นใน View Logs ลบรายการผิดและสแกนใหม่'],
          ['จำนวนเพิ่มเอง', 'เปิด Auto Count +1', 'ปิด Auto Count เมื่อ QR มี Qty หรือเมื่อต้องกรอกจำนวนเอง'],
          ['Export แล้วข้อมูลไม่ครบ', 'มี Filter/Search ค้างหรือรายการยังไม่บันทึก', 'ล้าง Filter ตรวจ Record Count และ Export ใหม่']
        ],
        [22, 38, 40]
      );

      // ==========================================
      // PAGE 35: SECTION 11
      // ==========================================
      doc.addPage();
      h1('11. Checklist การปฏิบัติงาน');
      h2('11.1 ก่อนเริ่มตรวจนับ');
      p('• ☐ อนุมัติ Item Master และ Location Master แล้ว');
      p('• ☐ Import และสุ่มตรวจข้อมูลสำเร็จ');
      p('• ☐ ทดสอบ QR Profile กับป้ายจริง');
      p('• ☐ กำหนด Lot/Expiry/Serial ตามนโยบาย');
      p('• ☐ กำหนดผู้ใช้งานและรอบตรวจนับ');
      p('• ☐ ตรวจแบตเตอรี่ สัญญาณ และเครื่องสแกน');
      h2('11.2 ระหว่างตรวจนับ');
      p('• ☐ ตรวจ Target Location ทุกครั้งที่ย้ายจุด');
      p('• ☐ ตรวจสถานะ NORMAL/DAMAGE');
      p('• ☐ ตรวจ Parsed Output ก่อนบันทึก');
      p('• ☐ ไม่ข้าม Item Out of Master โดยไม่มีผู้อนุมัติ');
      p('• ☐ ใส่ Remark เมื่อมีข้อยกเว้น');
      p('• ☐ ตรวจ Data Scanned หลังบันทึก');
      h2('11.3 หลังตรวจนับ');
      p('• ☐ ตรวจ View Logs และยอดรายการ');
      p('• ☐ ค้นหา Item Out of Master/Serial ซ้ำ');
      p('• ☐ ตรวจรายการ DAMAGE');
      p('• ☐ Export และตั้งชื่อไฟล์ตามมาตรฐาน');
      p('• ☐ สำรองไฟล์และจำกัดสิทธิ์แก้ไข');
      p('• ☐ จัดเก็บหลักฐานการอนุมัติและข้อแก้ไข');

      // ==========================================
      // PAGE 36: SECTION 12
      // ==========================================
      doc.addPage();
      h1('12. ภาคผนวก: Data Dictionary แบบย่อ');
      drawTable(
        ['ข้อมูล', 'ตัวอย่าง', 'กติกา'],
        [
          ['ItemCode', 'ITM001', 'ไม่ซ้ำและห้ามว่าง'],
          ['Barcode', '8850123456789', 'เก็บเป็น Text และไม่ซ้ำ'],
          ['Quantity', '100', 'ตัวเลข 0 หรือจำนวนเต็มบวก'],
          ['LocationCode', 'LOC-A01-01', 'ไม่ซ้ำและตรงป้ายจริง'],
          ['LotNumber', 'LOT-AUG-01', 'ตามป้ายผู้ผลิต'],
          ['ExpiryDate', '2027-08-19', 'YYYY-MM-DD'],
          ['SerialNumber', 'SN-2026-0001', 'ไม่ซ้ำตามนโยบาย'],
          ['Status', 'NORMAL', 'ใช้ค่าที่ระบบกำหนด'],
          ['Remark', 'ตรวจนับประจำจุด A-01', 'อธิบายข้อยกเว้นอย่างตรวจสอบได้']
        ],
        [25, 30, 45]
      );
      drawCallout('สิ้นสุดเอกสาร', [
        'เอกสารนี้เป็นคู่มือใช้งาน Count Stock AI สำหรับ OGA INTERNATIONAL CO., LTD. ฉบับ Rev.05 จากภาพชุดแรก 15 ภาพ พร้อมตัวอย่าง Item Master และ Location Master'
      ]);

      // Add page numbering on all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.font(fontRegular).fontSize(8.5).fillColor(GRAY).text(
          `SOP-WMS-STK-001 (Rev.05) | Internal Use | Page ${i + 1}`,
          40,
          doc.page.height - 35,
          { align: 'right' }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
