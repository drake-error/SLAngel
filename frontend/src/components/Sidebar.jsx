import React, { useState } from 'react';
import { 
  FolderKanban, 
  History, 
  Palette, 
  Component, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Clock, 
  Layers, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  ChevronDown,
  Box,
  FileCode,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { projectVersions, designSystems } from '../data/mockScreens';

export function Sidebar({ 
  collapsed, 
  setCollapsed, 
  screens, 
  selectedScreenId, 
  setSelectedScreenId,
  currentVersion,
  setCurrentVersion,
  currentDesignSystem,
  setCurrentDesignSystem,
  onOpenLibrary
}) {
  const [activeTab, setActiveTab] = useState('screens'); // 'screens' | 'versions' | 'tokens' | 'systems'
  const [expandedSection, setExpandedSection] = useState({
    screens: true,
    versions: true,
    tokens: true,
    systems: true
  });

  const toggleSection = (section) => {
    setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside 
      className={`relative h-[calc(100vh-3.5rem)] border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Pill */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 w-6 h-6 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition z-30"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Collapsed Mini Icon Rail */}
      {collapsed ? (
        <div className="flex flex-col items-center py-4 gap-4 text-slate-500">
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('screens'); }}
            className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'screens' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="Screens Navigator"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('versions'); }}
            className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'versions' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="Version History & Iterations"
          >
            <History className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setCollapsed(false); setActiveTab('tokens'); }}
            className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition ${activeTab === 'tokens' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : ''}`}
            title="Design Systems & Tokens"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button 
            onClick={onOpenLibrary}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition"
            title="Component Library"
          >
            <Component className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Full Sidebar Content */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Quick Tab Filter */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('screens')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'screens' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Canvas</span>
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'versions' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3 h-3" />
                <span>History</span>
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                  activeTab === 'tokens' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Theme</span>
              </button>
            </div>
          </div>

          {/* Scrollable Main Rail */}
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* Screens List */}
            {activeTab === 'screens' && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Active Screens ({screens.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {screens.map((screen, idx) => {
                    const isSelected = selectedScreenId === screen.id;
                    return (
                      <div
                        key={screen.id}
                        onClick={() => setSelectedScreenId(screen.id)}
                        className={`group cursor-pointer p-2.5 rounded-xl border transition flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                        }`}>
                          {screen.type === 'desktop' ? (
                            <Monitor className="w-3.5 h-3.5" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                              {screen.title}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 truncate">
                              {screen.platform}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              {screen.variant}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add Screen Prompt */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-gradient-to-br from-indigo-50/60 to-blue-50/60 dark:from-indigo-950/20 dark:to-blue-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Generative Canvas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      Use the bottom prompt bar to ask Stitch to spawn responsive variants or full flows.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Version History Tab */}
            {activeTab === 'versions' && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Iteration Timeline
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">
                    Save checkpoint
                  </span>
                </div>
                <div className="relative pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 ml-1">
                  {projectVersions.map((v) => {
                    const isActive = currentVersion === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setCurrentVersion(v.id)}
                        className="relative group cursor-pointer"
                      >
                        {/* Dot on line */}
                        <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 transition ${
                          isActive 
                            ? 'bg-blue-600 border-white dark:border-slate-900 ring-2 ring-blue-400' 
                            : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900 group-hover:bg-blue-400'
                        }`} />
                        <div className={`p-2.5 rounded-xl border transition ${
                          isActive
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                        }`}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-bold ${isActive ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                              {v.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{v.author}</span>
                            <span>{v.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Design Systems & Tokens Tab */}
            {activeTab === 'tokens' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                    Active Design System
                  </span>
                  <div className="space-y-2">
                    {designSystems.map((ds) => {
                      const isSelected = currentDesignSystem === ds.id;
                      return (
                        <div
                          key={ds.id}
                          onClick={() => setCurrentDesignSystem(ds.id)}
                          className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700'
                              : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-sm"
                              style={{ backgroundColor: ds.color }}
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{ds.name}</p>
                              <span className="text-[10px] text-slate-400">{ds.version}</span>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Token Quick Matrix */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Global Color Tokens
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'].map((hex) => (
                      <button
                        key={hex}
                        className="h-7 rounded-lg shadow-sm border border-black/10 hover:scale-110 transition-transform"
                        style={{ backgroundColor: hex }}
                        title={`Color: ${hex}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Settings & Status */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Stitch Engine v3.0
              </span>
              <button 
                onClick={onOpenLibrary}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                Blocks <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
