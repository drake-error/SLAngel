import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Download, 
  Layers, 
  Code2, 
  Figma, 
  ChevronDown, 
  Check, 
  Edit3, 
  Sun, 
  Moon, 
  Eye, 
  Undo2, 
  Redo2, 
  Plus, 
  Play,
  Monitor,
  Smartphone,
  Tablet,
  Grid
} from 'lucide-react';

export function Navbar({ 
  projectName, 
  setProjectName, 
  statusBadge, 
  setStatusBadge,
  screensCount,
  onShareClick,
  onExportClick,
  onOpenLibrary,
  zoomLevel,
  setZoomLevel,
  darkMode,
  setDarkMode,
  onAddNewScreen,
  canvasViewMode,
  setCanvasViewMode
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectName);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      setProjectName(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const statuses = [
    { label: 'Experimental Mode', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    { label: 'Saved to Cloud', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    { label: 'Ready for Review', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    { label: 'Syncing with Figma', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none transition-colors">
      {/* Left: Brand Logo & Editable Title Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Stitch Brand Logo */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-base bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent">
                Stitch
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Labs
              </span>
            </div>
          </div>
        </div>

        {/* Project Breadcrumb & Inline Edit */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Workspace /</span>
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                autoFocus
                className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-500 outline-none w-56"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setTempTitle(projectName);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
              title="Click to rename project"
            >
              <span>{projectName}</span>
              <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Status Badge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition ${
                statuses.find((s) => s.label === statusBadge)?.color || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>{statusBadge}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showStatusMenu && (
              <div 
                className="absolute left-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fade-in"
                onMouseLeave={() => setShowStatusMenu(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Project Status
                </div>
                {statuses.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setStatusBadge(item.label);
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <span>{item.label}</span>
                    {statusBadge === item.label && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Canvas Quick Layout Controls */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
        <button 
          onClick={() => setCanvasViewMode('freeform')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            canvasViewMode === 'freeform' 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
          title="Freeform Infinite Canvas"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>
        <button 
          onClick={() => setCanvasViewMode('grid')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            canvasViewMode === 'grid' 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
          title="Grid Alignment"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid Flow</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {/* Zoom Quick Pill */}
        <button 
          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Zoom Out"
        >
          -
        </button>
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 px-1 min-w-[38px] text-center">
          {zoomLevel}%
        </span>
        <button 
          onClick={() => setZoomLevel(Math.min(160, zoomLevel + 10))}
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* Right: Actions (Add Screen, Library, Export, Share, Profile) */}
      <div className="flex items-center gap-2">
        {/* Insert Screen Button */}
        <button
          onClick={onAddNewScreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200/80 dark:border-blue-800 transition"
          title="Add New Screen Canvas"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Screen</span>
        </button>

        {/* Component Library */}
        <button
          onClick={onOpenLibrary}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
          title="Open Component & Block Library"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Export Button */}
        <button
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShareClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* User Profile Avatar */}
        <div className="relative pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 p-0.5 cursor-pointer hover:ring-2 hover:ring-blue-400 transition">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
              AC
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
        </div>
      </div>
    </header>
  );
}
