import React from 'react';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900/90 text-white rounded-3xl max-w-xs w-full p-6 text-center border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Title */}
        <h2 className="text-xl font-black tracking-tight text-white mt-1">
          Count Stock AI
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-5">
          Version 1.0
        </p>

        {/* Logo Frame matching Screenshot Image 6 */}
        <div className="bg-white rounded-2xl p-4 mb-5 border-4 border-red-600 shadow-lg inline-block w-40 h-40 relative flex flex-col items-center justify-center mx-auto">
          <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-2 border-2 border-red-500">
            {/* Custom Barcode Scanner & Clipboard Icon */}
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
              <line x1="9" y1="11" x2="15" y2="11" strokeWidth="2.5" />
              <line x1="9" y1="14" x2="15" y2="14" strokeWidth="2.5" />
              <line x1="9" y1="17" x2="13" y2="17" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-black text-xs text-red-600 tracking-tighter uppercase leading-none block">
            COUNT STOCK
          </span>
          <span className="text-[8px] font-bold text-slate-700 tracking-widest uppercase mt-0.5 block">
            COUNT • CHECK • CONTROL
          </span>
        </div>

        {/* AppsGeyser / Power Info Text matching Image 6 */}
        <div className="text-[11px] text-slate-300 mb-6 leading-relaxed bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
          <p className="font-medium">
            This App is powered by <a href="https://appsgeyser.com" target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">AppsGeyser.com</a>
          </p>
          <p className="mt-1">
            <span className="text-rose-400 font-bold underline cursor-pointer hover:text-rose-300">Flag this App</span>: Tell us if this app has objectionable content.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <a
            href="#terms"
            onClick={(e) => { e.preventDefault(); alert("OGA Count Stock AI - Terms of Service v1.0"); }}
            className="py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase flex items-center justify-center gap-1 transition-all"
          >
            <FileText className="w-3 h-3" />
            <span>TERMS OF SERVICE</span>
          </a>
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert("OGA Count Stock AI - Privacy Policy & Data Protection"); }}
            className="py-2 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase flex items-center justify-center gap-1 transition-all"
          >
            <Lock className="w-3 h-3" />
            <span>PRIVACY POLICY</span>
          </a>
        </div>

        {/* Footer Build info */}
        <p className="text-[10px] font-mono text-slate-500 tracking-widest">
          Build 2.48.s
        </p>
      </div>
    </div>
  );
};
