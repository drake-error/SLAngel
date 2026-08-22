import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  SlidersHorizontal, 
  ChevronUp, 
  Zap, 
  Plus, 
  Layout, 
  Check, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { promptSuggestions } from '../data/mockScreens';

export function PromptBar({ onGenerateScreen, isGenerating, activeScreenTitle }) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Pro Vision');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateScreen(prompt.trim(), selectedModel);
    setPrompt('');
    setAttachedFile(null);
  };

  const handleSuggestionClick = (suggestionText) => {
    setPrompt(suggestionText);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  const models = [
    { name: 'Gemini 2.5 Pro Vision', tag: 'Recommended • High Fidelity' },
    { name: 'Stitch Design 3.0', tag: 'Fast Prototype UI' },
    { name: 'Wireframe Spec Mode', tag: 'Low-fi Architecture' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-auto">
      {/* Suggestions Pills Bar */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar justify-start md:justify-center">
        {promptSuggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(s.text)}
            className="flex-shrink-0 text-[11px] font-medium bg-white/90 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm transition transform hover:-translate-y-0.5"
          >
            {s.text}
          </button>
        ))}
      </div>

      {/* Main Google Labs Generative Prompt Bar */}
      <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500">
        {/* Attached File Pill */}
        {attachedFile && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 w-fit">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{attachedFile}</span>
            <button 
              onClick={() => setAttachedFile(null)}
              className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Sparkle Icon Badge */}
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-sm flex-shrink-0">
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
          </div>

          {/* Prompt Text Input */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={
              activeScreenTitle 
                ? `Ask Stitch to refine "${activeScreenTitle}" or generate new screens...` 
                : "Ask Stitch to generate a responsive screen or flow..."
            }
            className="flex-1 bg-transparent text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none font-medium"
          />

          {/* Attachment Input (Hidden) */}
          <label className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0" title="Attach wireframe image or reference">
            <Paperclip className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Model Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition"
            >
              <span>{selectedModel.split(' ')[0]}</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
            </button>

            {showModelPicker && (
              <div 
                className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-slide-up"
                onMouseLeave={() => setShowModelPicker(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AI Model Engine
                </div>
                {models.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      setSelectedModel(m.name);
                      setShowModelPicker(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                      <span className="text-[10px] text-slate-400">{m.tag}</span>
                    </div>
                    {selectedModel === m.name && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`p-2.5 rounded-xl text-white font-semibold transition flex items-center gap-1.5 shadow-md ${
              prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 scale-100'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Generative Loading Shimmer Banner */}
        {isGenerating && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 animate-pulse px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Synthesizing layout variants and design token bindings...
            </span>
            <span className="font-mono text-[11px]">Gemini 2.5 Pro</span>
          </div>
        )}
      </div>
    </div>
  );
}
