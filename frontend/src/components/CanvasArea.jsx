import React, { useRef, useState } from 'react';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize, 
  Grid, 
  Sparkles, 
  MousePointer, 
  Hand,
  Move
} from 'lucide-react';
import { MockupFrame } from './MockupFrame';
import { PromptBar } from './PromptBar';

export function CanvasArea({ 
  screens, 
  selectedScreenId, 
  setSelectedScreenId,
  zoomLevel,
  setZoomLevel,
  onDuplicateScreen,
  onDeleteScreen,
  onVariantChange,
  onElementSelect,
  selectedElementId,
  onGenerateScreen,
  isGenerating,
  canvasViewMode,
  setCanvasViewMode,
  onAddNewScreen
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'hand'

  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    // Only pan if clicking on empty canvas or in hand mode
    if (activeTool === 'hand' || e.target === containerRef.current || e.target.classList.contains('canvas-background')) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    setPan({ x: 0, y: 0 });
  };

  const activeScreen = screens.find(s => s.id === selectedScreenId);

  return (
    <main 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-canvas-dots bg-slate-50/60 dark:bg-slate-950 transition-colors select-none ${
        activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Floating Canvas Control Toolbar */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg">
        {/* Tool Select / Hand Mode */}
        <button
          onClick={() => setActiveTool('select')}
          className={`p-1.5 rounded-xl transition ${
            activeTool === 'select' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300' 
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Select Mode (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('hand')}
          className={`p-1.5 rounded-xl transition ${
            activeTool === 'hand' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300' 
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Hand / Pan Canvas Mode (H)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

        {/* Zoom Controls */}
        <button
          onClick={() => setZoomLevel(Math.max(40, zoomLevel - 10))}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          title="Reset Zoom to 100%"
        >
          {zoomLevel}%
        </button>
        <button
          onClick={() => setZoomLevel(Math.min(160, zoomLevel + 10))}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

        {/* Quick Add Screen */}
        <button
          onClick={onAddNewScreen}
          className="p-1.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
          title="Add Mockup Screen to Canvas"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Scalable / Pannable Workspace Plane */}
      <div 
        className="canvas-background w-full h-full p-10 overflow-auto"
        onClick={() => setSelectedScreenId(null)}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className={`min-w-max p-12 transition-all ${
            canvasViewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 items-start' 
              : 'flex items-start gap-12'
          }`}
        >
          {screens.map((screen) => (
            <MockupFrame
              key={screen.id}
              screen={screen}
              isSelected={selectedScreenId === screen.id}
              onSelect={setSelectedScreenId}
              onDuplicate={onDuplicateScreen}
              onDelete={onDeleteScreen}
              onVariantChange={onVariantChange}
              onElementSelect={onElementSelect}
              selectedElementId={selectedElementId}
            />
          ))}

          {/* Quick Add Blank Screen Tile */}
          <div
            onClick={onAddNewScreen}
            className="w-72 h-[740px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition group shadow-sm hover:shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 flex items-center justify-center transition">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold">Add Screen Canvas</span>
            <span className="text-xs text-slate-400 text-center px-6">
              Generate with prompt or insert from Component Blocks
            </span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Google Labs Generative Prompt Bar */}
      <PromptBar 
        onGenerateScreen={onGenerateScreen} 
        isGenerating={isGenerating}
        activeScreenTitle={activeScreen?.title}
      />
    </main>
  );
}
