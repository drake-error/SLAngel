import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Layers, 
  CreditCard, 
  Activity, 
  Sparkles, 
  Compass, 
  Users, 
  Plus, 
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';
import { componentLibrary } from '../data/mockScreens';

export function ComponentLibraryModal({ isOpen, onClose, onInsertComponent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Cards', 'Finance', 'Data Viz', 'Navigation', 'Input', 'Social'];

  const filteredComponents = componentLibrary.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stitch Component & Block Library
              </h3>
              <p className="text-xs text-slate-500">Insert production-ready UI elements into canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-6 pb-2 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components (e.g. Bento Card, Navigation Dock, Telemetry)..."
              className="bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none flex-1"
            />
          </div>

          {/* Categories Pill Rail */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Component Grid List */}
        <div className="p-6 pt-2 flex-1 overflow-y-auto grid grid-cols-2 gap-3.5">
          {filteredComponents.map((comp) => (
            <div
              key={comp.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {comp.category}
                  </span>
                  <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  {comp.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {comp.preview}
                </p>
              </div>

              <button
                onClick={() => {
                  onInsertComponent(comp);
                  onClose();
                }}
                className="mt-4 w-full py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert to Active Screen</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
