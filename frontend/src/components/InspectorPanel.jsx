import React, { useState } from 'react';
import { 
  Sliders, 
  Code2, 
  Palette, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Eye, 
  Layers, 
  Square, 
  CornerDownRight, 
  Hash, 
  Type, 
  Maximize, 
  Minimize, 
  Wand2, 
  FileJson, 
  Cpu
} from 'lucide-react';

export function InspectorPanel({ 
  screen, 
  collapsed, 
  setCollapsed, 
  selectedElementId,
  onTokenUpdate,
  onApplyRefinement
}) {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'code' | 'tokens' | 'ai'
  const [codeLang, setCodeLang] = useState('react'); // 'react' | 'html' | 'json'
  const [copied, setCopied] = useState(false);
  const [refiningKey, setRefiningKey] = useState(null);

  if (!screen) return null;

  const handleCopyCode = () => {
    const code = screen.codeSnippets?.[codeLang] || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefineAction = (actionKey, label) => {
    setRefiningKey(actionKey);
    setTimeout(() => {
      onApplyRefinement(screen.id, actionKey);
      setRefiningKey(null);
    }, 800);
  };

  const aiRefinements = [
    { key: 'glass', label: 'Apply Glassmorphic Backdrop', desc: 'Add blur(16px) and subtle translucent border' },
    { key: 'contrast', label: 'Optimize WCAG 2.2 Contrast', desc: 'Elevate text contrast to AAA 7:1 ratio' },
    { key: 'pill', label: 'Convert Buttons to Full Pill', desc: 'Change rounded-xl to rounded-full across all CTA items' },
    { key: 'bento', label: 'Enhance Bento Card Hierarchy', desc: 'Add subtle gradient glow and data sparkline' },
  ];

  return (
    <aside 
      className={`relative h-[calc(100vh-3.5rem)] border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-12' : 'w-80'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-5 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition z-30"
        title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
      >
        {collapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {collapsed ? (
        <div className="flex flex-col items-center py-4 gap-4 text-slate-500">
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('properties'); }}
            className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'properties' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="Inspect Properties"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('code'); }}
            className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'code' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="Code Output"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('tokens'); }}
            className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'tokens' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="Design Tokens"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('ai'); }}
            className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'ai' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="AI Refinement"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Tabs */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'properties'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Properties"
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden sm:inline">Props</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Code"
              >
                <Code2 className="w-3 h-3" />
                <span className="hidden sm:inline">Code</span>
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'tokens'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tokens"
              >
                <Palette className="w-3 h-3" />
                <span className="hidden sm:inline">Tokens</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'ai'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="AI Refine"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Refine</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* PROPERTIES TAB */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {/* Target Element Badge */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Selected Component
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {selectedElementId || screen.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-mono">
                      {screen.platform}
                    </span>
                  </div>
                </div>

                {/* Dimensions & Alignment */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                    Frame Geometry
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-mono">Width</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{screen.width} px</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-mono">Height</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{screen.height} px</p>
                    </div>
                  </div>
                </div>

                {/* Layout & Spacing */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                    Layout & Auto-Flow
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Direction</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Flex Column (Vertical)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Padding</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{screen.tokens?.padding || '20px'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Border Radius</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{screen.tokens?.borderRadius || '24px'}</span>
                    </div>
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                    Typography Stack
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Primary Font</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{screen.tokens?.fontFamily}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Heading Style</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Google Sans Display (Bold)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CODE SNIPPET TAB */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                {/* Language Switcher & Copy */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setCodeLang('react')}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition ${
                        codeLang === 'react' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      React
                    </button>
                    <button
                      onClick={() => setCodeLang('html')}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition ${
                        codeLang === 'html' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => setCodeLang('json')}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition ${
                        codeLang === 'json' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      JSON
                    </button>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code Box */}
                <div className="relative rounded-2xl bg-slate-950 text-slate-200 p-3 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-[460px]">
                  <pre>{screen.codeSnippets?.[codeLang] || '// Code preview not available'}</pre>
                </div>
              </div>
            )}

            {/* DESIGN TOKENS TAB */}
            {activeTab === 'tokens' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                    Screen Color Palette
                  </span>
                  <div className="space-y-2">
                    {[
                      { name: 'Primary Accent', token: '--color-primary', hex: screen.tokens?.primaryColor || '#3B82F6' },
                      { name: 'Secondary Accent', token: '--color-secondary', hex: screen.tokens?.secondaryColor || '#6366F1' },
                      { name: 'Background Surface', token: '--color-bg', hex: screen.tokens?.backgroundColor || '#FFFFFF' },
                      { name: 'Card Container', token: '--color-surface', hex: screen.tokens?.surfaceColor || '#F8FAFC' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-5 h-5 rounded-lg border border-black/10 shadow-sm"
                            style={{ backgroundColor: item.hex }}
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                            <span className="text-[10px] font-mono text-slate-400">{item.token}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{item.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography Scale */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                    Type Scale
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between p-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span>Display Heading</span>
                      <span className="font-mono text-slate-400">28px / 36px</span>
                    </div>
                    <div className="flex justify-between p-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span>Card Title</span>
                      <span className="font-mono text-slate-400">16px / 24px</span>
                    </div>
                    <div className="flex justify-between p-1.5">
                      <span>Body / Meta</span>
                      <span className="font-mono text-slate-400">12px / 16px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI REFINE TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1 px-1">
                    Intelligent Refinements
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
                    Apply targeted design heuristics and token adjustments directly to this screen.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {aiRefinements.map((ref) => {
                    const isRefining = refiningKey === ref.key;
                    return (
                      <div
                        key={ref.key}
                        className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/60 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Wand2 className="w-3.5 h-3.5 text-blue-500" />
                            {ref.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                          {ref.desc}
                        </p>
                        <button
                          onClick={() => handleRefineAction(ref.key, ref.label)}
                          disabled={isRefining}
                          className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          {isRefining ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 animate-spin" />
                              <span>Refining Screen...</span>
                            </>
                          ) : (
                            <span>Apply to Canvas</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
