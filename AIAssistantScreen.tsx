import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Image as ImageIcon, Camera, RefreshCw, Download, 
  FileText, Sparkles, X, Check, Copy, Printer, FileDown, 
  ShieldCheck, ArrowLeft, MessageSquare, Zap, HelpCircle,
  Eye, Info, Share2, CornerDownLeft, Maximize2, CheckCircle2,
  Smile, ChevronRight, Layers, Tag
} from 'lucide-react';
import { AIMessage } from '../types';
import { STICKER_PACKS, StickerPack, ElephantSticker } from '../data/elephantStickers';
import { ElephantStickerGraphic } from './ElephantStickerGraphic';

interface AIAssistantScreenProps {
  onBack?: () => void;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const saved = localStorage.getItem('OGA_AI_CHAT_HISTORY');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse AI history', e);
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: `### 🤖 สวัสดีครับ! ผมคือ OGA Count Stock AI & ISO Senior Consultant
ยินดีต้อนรับสู่ระบบผู้ช่วยอัจฉริยะสำหรับการใช้งานโปรแกรม **OGA Count Stock Mobile PDA (เวอร์ชัน 2026)** และการจัดทำเอกสารมาตรฐานสากล **ISO 9001:2015 / ISO 27001**

---

#### 🌟 ฟังก์ชันอัจฉริยะที่พร้อมใช้งาน:
1. 💬 **พิมพ์ข้อความถาม-ตอบอย่างละเอียด:** สอบถามได้ทุกหัวข้อ เช่น การสแกน QR 4 รูปแบบ, ล็อก Location, และ Auto Increment (+1)
2. 🐘 **สติ๊กเกอร์น้องช้าง 3D (เหมือน LINE 10 ชุด 100 แบบ):** กดปุ่ม **"😄 สติ๊กเกอร์"** ด้านล่างเพื่อส่งสติ๊กเกอร์น้องช้างสี 3D โทนแดง ฟ้า น้ำเงิน ส้ม ชมพู ม่วง ขาว
3. 📸 **กล้องถ่ายภาพ AI (Camera):** ถ่ายภาพบาร์โค้ดหรือฉลากสินค้าเพื่อวิเคราะห์ทันที
4. 🖼️ **เลือกรูปภาพ (Upload Image):** อัปโหลดภาพจากแกลเลอรีเพื่อให้ AI ตรวจสอบ
5. 📋 **ส่งออกเอกสารมาตรฐาน ISO:** ดาวน์โหลดไฟล์ **Word (.doc)**, **Print/PDF**, **Markdown (.md)**, **Plain Text (.txt)** หรือ **JSON**

*💡 เลือกหัวข้อคำถามด่วนด้านล่าง หรือเลือกสติ๊กเกอร์/พิมพ์คำถามได้ทันทีครับ!*`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        docTitle: 'คู่มือและมาตรฐานการใช้งานระบบ Count Stock (ISO SOP)',
        docNo: 'SOP-WH-COUNT-001'
      }
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<AIMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'camera' | 'stickers'>('chat');
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [selectedStickerPackId, setSelectedStickerPackId] = useState<string>(STICKER_PACKS[0].id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      localStorage.setItem('OGA_AI_CHAT_HISTORY', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, [messages, isLoading, isStickerDrawerOpen]);

  // Handle Camera Startup / Teardown
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode]);

  const startCamera = async () => {
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตสิทธิ์การเข้าถึงกล้องถ่ายภาพบนเบราว์เซอร์");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setSelectedImageName(`Camera_Photo_${new Date().toLocaleTimeString('th-TH').replace(/:/g, '')}.jpg`);
      setIsCameraActive(false);
      setActiveTab('chat');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setActiveTab('chat');
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // SEND TEXT OR IMAGE
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text && !selectedImage) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text || (selectedImage ? "กรุณาวิเคราะห์รูปภาพนี้ พร้อมให้คำแนะนำและขั้นตอนการทำงานตามมาตรฐาน ISO อย่างละเอียด" : ""),
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setSelectedImageName(null);
    setIsStickerDrawerOpen(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          prompt: userMsg.text,
          image: imagePayload,
          history: messages.slice(-4),
          isIsoRequest: text.toLowerCase().includes('iso') || text.toLowerCase().includes('sop') || text.toLowerCase().includes('เอกสาร')
        })
      });

      const data = await res.json();
      const replyContent = data.reply || data.text;

      if (data.success && replyContent) {
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyContent,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          docTitle: 'เอกสารขั้นตอนการปฏิบัติงาน (ISO SOP / Work Instruction)',
          docNo: `SOP-WH-${Math.floor(100 + Math.random() * 900)}`
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || data.message || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
    } catch (err: any) {
      console.error('AI Send error:', err);
      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ เกิดข้อผิดพลาดในการติดต่อระบบ AI: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}\n\nระบบยังคงสามารถเปิดอ่านคู่มือและเอกสารการใช้งานมาตรฐาน ISO ในฐานข้อมูลได้ตามปกติครับ`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // SEND ELEPHANT STICKER
  const handleSendSticker = async (sticker: ElephantSticker) => {
    const userMsg: AIMessage = {
      id: `user-sticker-${Date.now()}`,
      sender: 'user',
      text: sticker.caption,
      sticker: sticker,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStickerDrawerOpen(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sticker.aiPrompt,
          prompt: sticker.aiPrompt,
          history: messages.slice(-3),
          isIsoRequest: sticker.caption.includes('ISO') || sticker.caption.includes('SOP')
        })
      });

      const data = await res.json();
      const replyContent = data.reply || data.text || sticker.defaultAiReply;

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyContent,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        docTitle: 'เอกสารขั้นตอนการปฏิบัติงาน (ISO SOP / Work Instruction)',
        docNo: `SOP-WH-${Math.floor(100 + Math.random() * 900)}`
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI fallback for sticker:', err);
      // Fast fallback to built-in rich response
      const fallbackAiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: sticker.defaultAiReply,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        docTitle: 'คู่มือและมาตรฐานการใช้งานระบบ Count Stock',
        docNo: 'SOP-WH-COUNT-001'
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("คุณต้องการล้างประวัติการสนทนาทั้งหมดใช่หรือไม่?")) {
      localStorage.removeItem('OGA_AI_CHAT_HISTORY');
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'ai',
          text: `### 🤖 ล้างประวัติการสนทนาเรียบร้อยแล้ว\nพร้อมให้คำแนะนำและตอบคำถามเกี่ยวกับการใช้งานโปรแกรม **OGA Count Stock Mobile PDA** และการจัดทำเอกสารมาตรฐาน ISO อย่างละเอียดครับ`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ISO Word Export
  const exportAsIsoWordDoc = (msg: AIMessage) => {
    const docTitle = msg.docTitle || "SOP_CountStock_ISO9001";
    const docNo = msg.docNo || "SOP-WH-COUNT-001";
    const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          body { font-family: 'TH Sarabun PSK', 'Angsana New', 'Cordia New', Arial, sans-serif; font-size: 14pt; line-height: 1.6; padding: 20px; color: #111; }
          .iso-header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .iso-header-table td { border: 1.5pt solid #2b3a4a; padding: 8px; vertical-align: middle; }
          .company-title { font-size: 16pt; font-weight: bold; color: #0b2545; }
          .doc-title { font-size: 18pt; font-weight: bold; text-align: center; color: #d9534f; }
          .meta-label { font-weight: bold; font-size: 11pt; color: #555; }
          .meta-val { font-size: 12pt; font-weight: bold; }
          h2 { font-size: 16pt; color: #0b2545; border-bottom: 1.5pt solid #0b2545; padding-bottom: 4px; margin-top: 25px; }
          h3 { font-size: 14pt; color: #134074; margin-top: 15px; }
          p, li { font-size: 13pt; text-align: justify; }
          .iso-footer { margin-top: 40px; border-top: 1pt solid #ccc; font-size: 10pt; text-align: center; color: #777; }
        </style>
      </head>
      <body>
        <table class="iso-header-table">
          <tr>
            <td rowspan="2" style="width: 25%; text-align: center;">
              <strong style="font-size: 18pt; color: #e65100;">OGA</strong><br/>
              <span style="font-size: 10pt;">International Co., Ltd.</span>
            </td>
            <td colspan="2" class="doc-title">
              STANDARD OPERATING PROCEDURE (SOP)<br/>
              <span style="font-size: 13pt; color: #333;">ขั้นตอนการปฏิบัติงานการตรวจนับสินค้าคงคลัง (Count Stock Mobile PDA)</span>
            </td>
          </tr>
          <tr>
            <td style="width: 40%;">
              <span class="meta-label">รหัสเอกสาร (Doc No.):</span> <span class="meta-val">${docNo}</span><br/>
              <span class="meta-label">แก้ไขครั้งที่ (Rev.):</span> <span class="meta-val">03</span><br/>
              <span class="meta-label">วันที่มีผลบังคับใช้:</span> <span class="meta-val">${dateStr}</span>
            </td>
            <td style="width: 35%;">
              <span class="meta-label">มาตรฐานอ้างอิง:</span> <span class="meta-val">ISO 9001:2015 / ISO 27001</span><br/>
              <span class="meta-label">ผู้จัดทำ:</span> <span class="meta-val">Warehouse Storekeeper</span><br/>
              <span class="meta-label">ผู้อนุมัติ:</span> <span class="meta-val">Quality Assurance Manager</span>
            </td>
          </tr>
        </table>
        <div>
          ${msg.text.replace(/###\s*(.*)/g, '<h2>$1</h2>').replace(/####\s*(.*)/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}
        </div>
        <div class="iso-footer">
          <p>เอกสารควบคุมของ บริษัท โอจีเอ อินเตอร์เนชั่นแนล จำกัด (OGA International Co., Ltd.)</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNo}_ISO_SOP_CountStock.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print/PDF ISO Document
  const printIsoDocument = (msg: AIMessage) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("กรุณาอนุญาต Pop-up Window เพื่อพิมพ์เอกสาร ISO");
      return;
    }
    const docNo = msg.docNo || "SOP-WH-COUNT-001";
    const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docNo} - ISO 9001 Standard Operating Procedure</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Sarabun', Tahoma, sans-serif; font-size: 13px; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 10px; }
          .header-box { border: 2px solid #1e293b; display: grid; grid-template-columns: 140px 1fr 200px; margin-bottom: 20px; }
          .logo-cell { padding: 12px; text-align: center; border-right: 1.5px solid #1e293b; background: #f8fafc; }
          .logo-text { font-size: 24px; font-weight: 900; color: #ea580c; }
          .title-cell { padding: 12px; text-align: center; border-right: 1.5px solid #1e293b; }
          .title-main { font-size: 16px; font-weight: 800; color: #0f172a; }
          .meta-cell { padding: 8px 12px; font-size: 11px; background: #f8fafc; }
          h2 { font-size: 15px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 18px; }
          h3 { font-size: 13px; color: #1e293b; }
          .footer { margin-top: 30px; padding-top: 10px; border-top: 1px dashed #94a3b8; font-size: 10px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="logo-cell"><span class="logo-text">OGA</span><br><small>International</small></div>
          <div class="title-cell">
            <div class="title-main">STANDARD OPERATING PROCEDURE (SOP)</div>
            <div>ขั้นตอนการปฏิบัติงานการตรวจนับสินค้าคงคลัง (OGA Count Stock Mobile PDA)</div>
          </div>
          <div class="meta-cell">
            <div><strong>Doc No:</strong> ${docNo}</div>
            <div><strong>Rev:</strong> 03</div>
            <div><strong>Date:</strong> ${dateStr}</div>
            <div><strong>ISO Ref:</strong> ISO 9001:2015</div>
          </div>
        </div>
        <div>
          ${msg.text.replace(/###\s*(.*)/g, '<h2>$1</h2>').replace(/####\s*(.*)/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}
        </div>
        <div class="footer">OGA International Co., Ltd. — ISO 9001:2015 Quality Management System</div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportAsMarkdown = (msg: AIMessage) => {
    const docNo = msg.docNo || "SOP-WH-COUNT-001";
    const dateStr = new Date().toISOString().split('T')[0];
    const mdContent = `---
title: "Standard Operating Procedure - OGA Count Stock"
document_no: "${docNo}"
revision: "03"
effective_date: "${dateStr}"
standard: "ISO 9001:2015 / ISO 27001"
organization: "OGA International Co., Ltd."
---

# 📋 STANDARD OPERATING PROCEDURE (SOP)
## การตรวจนับสินค้าคงคลังด้วยเครื่อง Mobile PDA (OGA Count Stock)

${msg.text}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNo}_ISO_SOP.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPlainText = (msg: AIMessage) => {
    const docNo = msg.docNo || "SOP-WH-COUNT-001";
    const txtContent = `================================================================================
OGA INTERNATIONAL CO., LTD. - STANDARD OPERATING PROCEDURE (SOP)
ISO 9001:2015 / ISO 27001 QUALITY MANAGEMENT SYSTEM
Document No: ${docNo} | Rev: 03
================================================================================

${msg.text.replace(/###/g, '').replace(/####/g, '  -').replace(/\*\*/g, '')}
`;
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNo}_ISO_SOP.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJson = (msg: AIMessage) => {
    const docNo = msg.docNo || "SOP-WH-COUNT-001";
    const payload = {
      isoStandard: "ISO 9001:2015 / ISO 27001",
      documentControl: {
        company: "OGA INTERNATIONAL CO., LTD.",
        documentNo: docNo,
        revision: "03",
        date: new Date().toISOString()
      },
      content: msg.text,
      timestamp: msg.timestamp
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNo}_ISO_Data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    { label: "🔲 โครงสร้าง QR Code 4 รูปแบบ", query: "อธิบายโครงสร้างและการสแกน QR Code ทั้ง 4 รูปแบบ (Single, Item;Desc;Serial, Item,lot,exp,qty, item,lot) พร้อมตัวอย่างจริงอย่างละเอียด" },
    { label: "➕ วิธีเปิด Auto Increment (+1)", query: "วิธีตั้งค่าและเปิดใช้งานฟังก์ชัน Auto Increment Quantity (+1 Count อัตโนมัติ) และระบบ Auto Select Text สำหรับยิงต่อเนื่อง" },
    { label: "📍 การล็อก Location ตรวจนับ", query: "ขั้นตอนการกำหนด Location และการทำงานของระบบ Persistent Location Lock ในการตรวจนับ" },
    { label: "📊 ซิงค์ข้อมูลขึ้น Google Sheets", query: "วิธีเชื่อมต่อและซิงค์ข้อมูลการตรวจนับขึ้น Google Sheets และการตั้งค่า Apps Script Webhook อย่างละเอียด" },
    { label: "⚠️ สินค้าชำรุดเสียหาย (Damage)", query: "แนวทางการบันทึกและกักกันสินค้าชำรุดเสียหาย (Damage Status) ตามมาตรฐาน ISO 9001:2015 ข้อ 8.7" },
    { label: "📋 จัดทำเอกสาร SOP ตรวจนับ (ISO)", query: "ขอเอกสารขั้นตอนการปฏิบัติงานมาตรฐาน SOP การตรวจนับสต็อกสินค้าด้วย Mobile PDA ตามแนวทาง ISO 9001 ฉบับสมบูรณ์" }
  ];

  const currentStickerPack = STICKER_PACKS.find(p => p.id === selectedStickerPackId) || STICKER_PACKS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] pb-14 bg-slate-50 relative overflow-hidden">
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="กลับสู่หน้าหลัก"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-xs border border-white/20">
            <Bot className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>OGA AI & ISO CONSULTANT</span>
              <span className="text-[9px] bg-purple-950/80 text-yellow-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                PRO 2026
              </span>
            </h2>
            <p className="text-[10px] text-purple-200">ผู้ช่วยตอบคำถามการใช้งาน & สติ๊กเกอร์น้องช้าง 3D 10 ชุด</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            title="ล้างประวัติการสนทนา"
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white flex items-center gap-1 text-[10px] font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ล้างแชท</span>
          </button>
        </div>
      </div>

      {/* FOUR MAIN QUICK ACTION TABS */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5 flex items-center justify-between gap-1 shadow-2xs shrink-0 z-10">
        <button
          onClick={() => {
            setActiveTab('chat');
            setIsCameraActive(false);
            setIsStickerDrawerOpen(false);
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            activeTab === 'chat' && !isCameraActive && !isStickerDrawerOpen
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>💬 ถาม-ตอบ</span>
        </button>

        <button
          onClick={() => {
            setIsStickerDrawerOpen(prev => !prev);
            setIsCameraActive(false);
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            isStickerDrawerOpen
              ? 'bg-pink-600 text-white shadow-sm ring-2 ring-pink-300 animate-pulse'
              : 'text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200'
          }`}
        >
          <Smile className="w-3.5 h-3.5 text-pink-600" />
          <span>🐘 สติ๊กเกอร์ (10 ชุด)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('camera');
            setIsCameraActive(true);
            setIsStickerDrawerOpen(false);
          }}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
            isCameraActive
              ? 'bg-orange-600 text-white shadow-sm animate-pulse'
              : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>📸 กล้อง AI</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-dashed border-slate-300"
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>🖼️ เลือกรูป</span>
        </button>
      </div>

      {/* QUICK QUESTION HORIZONTAL SCROLLER */}
      <div className="bg-slate-100/80 border-b border-slate-200 px-2 py-1.5 overflow-x-auto no-scrollbar shrink-0 z-10">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" /> หัวข้อแนะนำ:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.query)}
              disabled={isLoading}
              className="text-[10.5px] font-bold text-indigo-900 bg-white hover:bg-indigo-50 active:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors whitespace-nowrap shadow-2xs hover:border-indigo-400"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* CAMERA CAPTURE OVERLAY VIEWPORT */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
          <div className="p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-400 animate-bounce" />
              <div>
                <h3 className="text-sm font-black">กล้องถ่ายภาพ AI & วิเคราะห์บาร์โค้ด</h3>
                <p className="text-[10px] text-slate-300">จัดวางบาร์โค้ด, ฉลากสินค้า หรือหน้าจอในกรอบ</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsCameraActive(false);
                setActiveTab('chat');
              }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target guide frame for QR/Barcode */}
            <div className="absolute border-2 border-orange-400 rounded-3xl w-72 h-52 pointer-events-none flex flex-col items-center justify-between p-3 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              <div className="w-full flex justify-between">
                <span className="w-4 h-4 border-t-2 border-l-2 border-yellow-300"></span>
                <span className="w-4 h-4 border-t-2 border-r-2 border-yellow-300"></span>
              </div>
              <span className="text-[11px] text-white font-bold bg-black/70 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                วางบาร์โค้ด / สติกเกอร์ในกรอบ
              </span>
              <div className="w-full flex justify-between">
                <span className="w-4 h-4 border-b-2 border-l-2 border-yellow-300"></span>
                <span className="w-4 h-4 border-b-2 border-r-2 border-yellow-300"></span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-around z-10">
            <button
              onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
              className="p-3.5 bg-white/20 hover:bg-white/30 rounded-full text-white flex flex-col items-center gap-1 text-[10px]"
              title="สลับกล้องหน้า/หลัง"
            >
              <RefreshCw className="w-5 h-5" />
              <span>สลับกล้อง</span>
            </button>

            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full p-1.5 border-4 border-orange-500 shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
              title="กดถ่ายภาพ"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center text-white shadow-inner">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-white/20 hover:bg-white/30 rounded-full text-white flex flex-col items-center gap-1 text-[10px]"
              title="เลือกรูปจากคลังภาพ"
            >
              <ImageIcon className="w-5 h-5" />
              <span>คลังภาพ</span>
            </button>
          </div>
        </div>
      )}

      {/* CHAT MESSAGES SCROLL CONTAINER */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3.5 min-h-0"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-[10px] font-black uppercase text-slate-500">
                {msg.sender === 'user' ? '👤 คุณ (Storekeeper)' : '🤖 OGA AI Specialist'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {msg.timestamp}
              </span>
            </div>

            {/* ATTACHED 3D ELEPHANT STICKER DISPLAY */}
            {msg.sticker && (
              <div className="mb-2 transition-transform hover:scale-105">
                <ElephantStickerGraphic
                  sticker={msg.sticker}
                  size="md"
                  showCaption={true}
                />
              </div>
            )}

            {/* ATTACHED IMAGE PREVIEW */}
            {msg.image && (
              <div className="mb-2 max-w-[280px] rounded-2xl overflow-hidden border-2 border-purple-300 shadow-md">
                <img
                  src={msg.image}
                  alt="Attached Snapshot"
                  className="w-full h-auto object-cover max-h-56"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* MESSAGE CONTENT BUBBLE (HIDE IF IT'S ONLY A STICKER REPEAT) */}
            {(!msg.sticker || msg.sender === 'ai') && (
              <div
                className={`max-w-[94%] sm:max-w-[88%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs font-medium shadow-orange-200'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-slate-200/50'
                }`}
              >
                {/* Render ISO Document Control Header for AI responses with SOP structure */}
                {msg.sender === 'ai' && (msg.text.includes('SOP') || msg.text.includes('ISO') || msg.text.includes('วัตถุประสงค์')) && (
                  <div className="mb-3 bg-gradient-to-r from-slate-50 to-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-indigo-950 uppercase tracking-wider">
                          ISO 9001:2015 / ISO 27001 COMPLIANT SOP
                        </p>
                        <p className="text-[9px] text-indigo-700 font-mono font-bold">
                          Doc No: {msg.docNo || 'SOP-WH-COUNT-001'} | Rev: 03
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                      Official ISO
                    </span>
                  </div>
                )}

                {/* FORMATTED TEXT WITH RICH HEADINGS & BULLETS */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={lIdx} className="text-sm font-black text-slate-900 mt-2.5 mb-1 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                          <span>{line.replace('### ', '')}</span>
                        </h3>
                      );
                    }
                    if (line.startsWith('#### ')) {
                      return (
                        <h4 key={lIdx} className="text-xs font-extrabold text-indigo-900 mt-2 mb-0.5">
                          {line.replace('#### ', '')}
                        </h4>
                      );
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{line.replace(/^[-*]\s*/, '')}</span>
                        </div>
                      );
                    }
                    if (line.startsWith('---')) {
                      return <hr key={lIdx} className="my-2 border-slate-200" />;
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>

                {/* AI ACTION TOOLBAR: EXPORT TO MULTIPLE ISO FORMATS */}
                {msg.sender === 'ai' && !msg.isError && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                        title="คัดลอกข้อความ"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === msg.id ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>

                      <button
                        onClick={() => printIsoDocument(msg)}
                        className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black"
                        title="พิมพ์หรือบันทึกเป็น PDF มาตรฐาน ISO"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ / PDF</span>
                      </button>
                    </div>

                    {/* MULTI-FORMAT EXPORT BUTTON */}
                    <button
                      onClick={() => setShowExportModal(msg)}
                      className="px-2.5 py-1.5 text-purple-800 bg-purple-100/80 hover:bg-purple-200 active:bg-purple-300 rounded-xl transition-all flex items-center gap-1.5 text-[10.5px] font-black shadow-2xs border border-purple-300"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-700" />
                      <span>Export เอกสาร ISO</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2 animate-in fade-in">
            <div className="bg-purple-100 p-2 rounded-xl border border-purple-200">
              <Bot className="w-5 h-5 text-purple-600 animate-spin" />
            </div>
            <div className="bg-white border border-purple-200 rounded-2xl rounded-tl-xs p-3.5 shadow-md">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
                </span>
                <span className="text-xs font-black text-purple-900">
                  AI กำลังวิเคราะห์ข้อมูลและร่างคำตอบตามมาตรฐาน ISO...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SELECTED IMAGE PREVIEW BAR */}
      {selectedImage && (
        <div className="bg-amber-50 border-t-2 border-amber-300 px-3 py-2 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage}
              alt="Selected Preview"
              className="w-12 h-12 object-cover rounded-xl border-2 border-amber-400 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>แนบรูปภาพพร้อมส่งไปยัง AI</span>
              </p>
              <p className="text-[9px] text-amber-800 font-mono truncate max-w-[200px]">
                {selectedImageName || "Photo_Attached.jpg"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedImage(null);
              setSelectedImageName(null);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
            title="ยกเลิกรูปภาพนี้"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LINE-STYLE ELEPHANT STICKER DRAWER (10 PACKS x 10 STICKERS = 100 STICKERS) */}
      {isStickerDrawerOpen && (
        <div className="bg-white border-t-2 border-pink-400 shadow-2xl flex flex-col shrink-0 z-30 max-h-[380px] sm:max-h-[420px] transition-all">
          {/* STICKER PACK TABS HEADER (10 PACKS) */}
          <div className="bg-slate-100 border-b border-slate-200 px-2 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {STICKER_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedStickerPackId(pack.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  selectedStickerPackId === pack.id
                    ? 'bg-pink-600 text-white shadow-md scale-102 ring-2 ring-pink-300'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span className="text-sm">{pack.icon}</span>
                <span className="text-[11px]">{pack.name}</span>
              </button>
            ))}
            <button
              onClick={() => setIsStickerDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full ml-auto shrink-0 transition-colors"
              title="ปิดแผงสติ๊กเกอร์"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STICKER STYLE SUB-BAR (แบบหัว / ทั้งตัว / ตามข้อความ) */}
          <div className="bg-pink-50/70 border-b border-pink-100 px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-black text-pink-900 flex items-center gap-1">
              <span>🐘 {currentStickerPack.name}</span>
              <span className="text-pink-600 font-normal">({currentStickerPack.stickers.length} แบบ)</span>
            </span>
            <div className="flex items-center gap-1 text-[9px] font-black text-slate-600">
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-pink-200 text-pink-700">🐘 หัวโต</span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-purple-200 text-purple-700">🐘 ทั้งตัว</span>
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-blue-200 text-blue-700">⚡ ข้อความ</span>
            </div>
          </div>

          {/* STICKERS GRID (10 STICKERS IN ACTIVE PACK WITH VISIBLE TEXT & 3D ART) */}
          <div className="p-3 overflow-y-auto max-h-72 bg-slate-100/60">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {currentStickerPack.stickers.map((stk) => (
                <div key={stk.id} className="flex justify-center">
                  <ElephantStickerGraphic
                    sticker={stk}
                    size="picker"
                    showCaption={true}
                    onClick={() => handleSendSticker(stk)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED BOTTOM INPUT DOCK (TEXT + STICKER + CAMERA + IMAGE) */}
      <div className="bg-white border-t border-slate-200 p-2.5 shadow-lg shrink-0 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          {/* STICKER DRAWER TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setIsStickerDrawerOpen(prev => !prev)}
            title="เลือกสติ๊กเกอร์น้องช้าง 3D (Stickers)"
            className={`p-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center ${
              isStickerDrawerOpen
                ? 'bg-pink-600 text-white ring-2 ring-pink-300 scale-105'
                : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* CAMERA SNAP BUTTON */}
          <button
            type="button"
            onClick={() => {
              setIsCameraActive(true);
              setActiveTab('camera');
              setIsStickerDrawerOpen(false);
            }}
            title="เปิดกล้องถ่ายภาพ (Camera)"
            className="p-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* IMAGE FILE UPLOAD BUTTON */}
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.click();
              setIsStickerDrawerOpen(false);
            }}
            title="เลือกรูปภาพจากเครื่อง (Upload Image)"
            className="p-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* TEXT PROMPT INPUT */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onFocus={() => setIsStickerDrawerOpen(false)}
            placeholder={selectedImage ? "ระบุคำถามเกี่ยวกับรูปภาพนี้..." : "พิมพ์คำถาม: QR 4 แบบ, ล็อก Location, เอกสาร ISO..."}
            className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-200 bg-slate-50 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
          />

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={isLoading || (!inputPrompt.trim() && !selectedImage)}
            className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl shadow-md active:scale-95 transition-all shrink-0 flex items-center justify-center font-bold"
            title="ส่งคำถาม"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* MULTI-FORMAT ISO EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-yellow-300" />
                <div>
                  <h3 className="font-black text-sm">ส่งออกเอกสารมาตรฐาน ISO</h3>
                  <p className="text-[10px] text-purple-200">เลือกรูปแบบไฟล์ที่ต้องการส่งออก</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(null)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {/* 1. MS WORD (.DOC) */}
              <button
                onClick={() => {
                  exportAsIsoWordDoc(showExportModal);
                  setShowExportModal(null);
                }}
                className="w-full p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-950">Microsoft Word (.doc)</p>
                    <p className="text-[10px] text-blue-700">จัดฟอร์แมตหัวกระดาษ ISO และตารางพร้อมแก้ไขใน MS Word</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-blue-600" />
              </button>

              {/* 2. PRINT / PDF */}
              <button
                onClick={() => {
                  printIsoDocument(showExportModal);
                  setShowExportModal(null);
                }}
                className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-950">Print / PDF (ISO Format)</p>
                    <p className="text-[10px] text-emerald-700">พิมพ์เอกสาร A4 พร้อม Document Control Header</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-600" />
              </button>

              {/* 3. MARKDOWN (.MD) */}
              <button
                onClick={() => {
                  exportAsMarkdown(showExportModal);
                  setShowExportModal(null);
                }}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-700 text-white rounded-xl shadow-sm">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Markdown (.md)</p>
                    <p className="text-[10px] text-slate-600">สำหรับนำเข้า Notion, GitHub, หรือ Confluence</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-600" />
              </button>

              {/* 4. PLAIN TEXT (.TXT) */}
              <button
                onClick={() => {
                  exportAsPlainText(showExportModal);
                  setShowExportModal(null);
                }}
                className="w-full p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-sm">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-950">Plain Text (.txt)</p>
                    <p className="text-[10px] text-amber-700">ข้อความธรรมดาพร้อมกรอบหัวเอกสาร ISO สำหรับ PDA</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-amber-600" />
              </button>

              {/* 5. STRUCTURED JSON (.JSON) */}
              <button
                onClick={() => {
                  exportAsJson(showExportModal);
                  setShowExportModal(null);
                }}
                className="w-full p-3 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-sm">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-950">JSON Data (.json)</p>
                    <p className="text-[10px] text-purple-700">ข้อมูลโครงสร้างสำหรับเชื่อมต่อระบบ Quality Audit</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
