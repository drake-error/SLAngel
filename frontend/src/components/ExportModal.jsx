import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Code2, 
  Figma, 
  FileCode, 
  FileJson, 
  Check, 
  Layers, 
  Sparkles,
  ExternalLink,
  Archive,
  Image as ImageIcon
} from 'lucide-react';

export function ExportModal({ isOpen, onClose, screens, activeScreen }) {
  const [exportFormat, setExportFormat] = useState('react'); // 'react' | 'figma' | 'tokens' | 'png'
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export Design & Production Code
              </h3>
              <p className="text-xs text-slate-500">Generate clean React, Figma tokens, or assets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Format Selector Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'react', title: 'React + Tailwind CSS', desc: 'Modular JSX components & CSS classes', icon: Code2, color: 'text-blue-500' },
              { id: 'figma', title: 'Figma Tokens & Nodes', desc: 'Sync variables to Figma Plugin', icon: Figma, color: 'text-purple-500' },
              { id: 'tokens', title: 'Design Tokens (JSON)', desc: 'W3C Standard Design Token spec', icon: FileJson, color: 'text-amber-500' },
              { id: 'png', title: 'Hi-Res Mockup Assets', desc: '2x & 3x PNG/SVG vector sheets', icon: ImageIcon, color: 'text-emerald-500' },
            ].map((fmt) => {
              const isSelected = exportFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <fmt.icon className={`w-5 h-5 ${fmt.color}`} />
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{fmt.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scope Selector */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Export Scope
            </span>
            <div className="flex gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="scope" defaultChecked className="text-blue-600" />
                <span>All Screens on Canvas ({screens.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="scope" className="text-blue-600" />
                <span>Selected Screen ({activeScreen?.title || 'None'})</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Includes responsive breakpoints</span>
          </div>
          <button
            onClick={handleExport}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            {downloading ? (
              <span>Packing Bundle...</span>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Export Complete!</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Download Package (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
