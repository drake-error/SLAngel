import React, { useState } from 'react';
import { 
  Copy, 
  Trash2, 
  Maximize2, 
  Code, 
  Layers, 
  ChevronDown, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Server, 
  CheckCircle2, 
  Bot, 
  Send, 
  Mic, 
  Sliders, 
  ExternalLink,
  Zap,
  Flame,
  Search,
  Bell,
  MoreVertical
} from 'lucide-react';

export function MockupFrame({ 
  screen, 
  isSelected, 
  onSelect, 
  onDuplicate, 
  onDelete, 
  onVariantChange,
  onElementSelect,
  selectedElementId
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isHovered, setIsHovered] = useState(false);
  const [aiActionRunning, setAiActionRunning] = useState(false);

  const handleSimulatedAction = (actionName) => {
    setAiActionRunning(true);
    setTimeout(() => {
      setAiActionRunning(false);
    }, 1200);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(screen.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 select-none ${
        isSelected 
          ? 'border-blue-500 dark:border-blue-500 ring-4 ring-blue-500/15 dark:ring-blue-400/20 shadow-2xl shadow-blue-500/10' 
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xl'
      }`}
      style={{
        width: screen.type === 'desktop' ? '680px' : '380px',
        minHeight: '740px'
      }}
    >
      {/* Top Floating Selection Tag */}
      {isSelected && (
        <div className="absolute -top-3.5 left-6 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5 z-20">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Active Target</span>
        </div>
      )}

      {/* Chrome Top Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60 rounded-t-3xl backdrop-blur-sm">
        {/* Left: Device & Title */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {screen.type === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {screen.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {screen.version}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              {screen.platform}
            </span>
          </div>
        </div>

        {/* Right: Actions (Variant Dropdown, Duplicate, Delete) */}
        <div className="flex items-center gap-1.5">
          {/* Variant Selector */}
          <div className="relative">
            <select
              value={screen.variant}
              onChange={(e) => onVariantChange(screen.id, e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium pl-2.5 pr-6 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer hover:border-blue-400 transition"
            >
              {screen.variants?.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(screen.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            title="Duplicate Screen"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(screen.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Delete Screen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Frame Body / Viewport */}
      <div className="flex-1 p-3 overflow-hidden bg-slate-100/50 dark:bg-slate-950/40 rounded-b-3xl flex flex-col justify-start">
        {screen.id === 'screen-1' ? (
          /* High Fidelity Mobile Fintech UI (Nova Wallet) */
          <div className="w-full flex-1 bg-slate-950 text-white rounded-2xl p-4 shadow-inner border border-slate-800 flex flex-col justify-between overflow-hidden">
            {/* iOS Dynamic Island Bar */}
            <div>
              <div className="flex justify-between items-center px-2 pt-1 pb-3 text-[11px] font-semibold text-slate-400">
                <span>9:41</span>
                <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Profile Header */}
              <div 
                onClick={(e) => { e.stopPropagation(); onElementSelect('header-profile'); }}
                className={`flex items-center justify-between mb-4 p-2 rounded-xl transition cursor-pointer ${
                  selectedElementId === 'header-profile' ? 'ring-2 ring-blue-500 bg-slate-900' : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center font-bold text-xs shadow-md">
                    AC
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-medium">Wealth Account</h4>
                    <p className="text-xs font-bold text-slate-100">Alex Chen • Pro</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bento Balance Card with Glass Gradient */}
              <div 
                onClick={(e) => { e.stopPropagation(); onElementSelect('card-balance'); }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-4 mb-4 shadow-lg shadow-blue-500/20 cursor-pointer transition ${
                  selectedElementId === 'card-balance' ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                    Liquid Portfolio
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold">
                    +18.4% YTD
                  </span>
                </div>
                <div className="text-2xl font-extrabold tracking-tight mb-3">
                  $84,290.45
                </div>
                <div className="flex items-center justify-between text-[10px] text-blue-100/90 font-mono">
                  <span>Nova Signature • 8492</span>
                  <span>Exp 09/29</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div 
                onClick={(e) => { e.stopPropagation(); onElementSelect('quick-actions'); }}
                className={`grid grid-cols-4 gap-2 mb-4 cursor-pointer p-1 rounded-xl transition ${
                  selectedElementId === 'quick-actions' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {[
                  { icon: ArrowUpRight, label: 'Send', color: 'text-blue-400' },
                  { icon: ArrowDownLeft, label: 'Receive', color: 'text-emerald-400' },
                  { icon: TrendingUp, label: 'Invest', color: 'text-purple-400' },
                  { icon: ShieldCheck, label: 'Vault', color: 'text-amber-400' },
                ].map((act, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSimulatedAction(act.label)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition"
                  >
                    <act.icon className={`w-4 h-4 ${act.color}`} />
                    <span className="text-[10px] font-medium text-slate-300">{act.label}</span>
                  </button>
                ))}
              </div>

              {/* Spending Breakdown Pill Matrix */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                  <span>Recent Activity</span>
                  <span className="text-blue-400 hover:underline cursor-pointer">View All</span>
                </div>
                {[
                  { name: 'Google Cloud Platform', sub: 'Subscription • Today', amount: '-$149.00', color: 'bg-blue-500' },
                  { name: 'Stripe Settlement', sub: 'Deposit • Yesterday', amount: '+$3,420.00', color: 'bg-emerald-500' },
                  { name: 'Figma Organization', sub: 'Design Seats • Aug 20', amount: '-$45.00', color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-100">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${item.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom iOS Navigation Pill */}
            <div className="pt-2 border-t border-slate-800 flex justify-around text-slate-400">
              <button className="text-blue-400 flex flex-col items-center text-[10px] font-semibold">
                <CreditCard className="w-4 h-4" />
                <span>Wallet</span>
              </button>
              <button className="hover:text-slate-200 flex flex-col items-center text-[10px]">
                <Activity className="w-4 h-4" />
                <span>Stats</span>
              </button>
              <button className="hover:text-slate-200 flex flex-col items-center text-[10px]">
                <Sparkles className="w-4 h-4" />
                <span>AI Assist</span>
              </button>
            </div>
          </div>
        ) : screen.id === 'screen-2' ? (
          /* High Fidelity Desktop Cloud Telemetry UI (Nexus Cloud) */
          <div className="w-full flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden shadow-inner">
            <div>
              {/* Desktop Browser / App Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-sky-500/20">
                    NX
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Nexus Core Telemetry</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Global Cluster: us-east-4 • Stitch Live Sync</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    48 Clusters Operational
                  </span>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div 
                onClick={(e) => { e.stopPropagation(); onElementSelect('kpi-cluster-health'); }}
                className={`grid grid-cols-3 gap-3 mb-4 cursor-pointer p-1 rounded-xl transition ${
                  selectedElementId === 'kpi-cluster-health' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="bg-white dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Throughput</span>
                  <div className="text-xl font-bold mt-0.5">1.48M <span className="text-xs font-normal text-slate-400">req/s</span></div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +14.2% peak
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">p99 Latency</span>
                  <div className="text-xl font-bold mt-0.5">14.2 <span className="text-xs font-normal text-slate-400">ms</span></div>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1 block">
                    -3.4ms optimized
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Error Rate</span>
                  <div className="text-xl font-bold mt-0.5">0.0012%</div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    All SLIs nominal
                  </span>
                </div>
              </div>

              {/* Interactive Telemetry Chart Graphic */}
              <div 
                onClick={(e) => { e.stopPropagation(); onElementSelect('chart-telemetry'); }}
                className={`bg-white dark:bg-slate-800/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm mb-4 cursor-pointer transition ${
                  selectedElementId === 'chart-telemetry' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold">Global Traffic Ingress (Last 24h)</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Live</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">7D</span>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="h-32 w-full">
                  <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 T500,40 L500,120 L0,120 Z"
                      fill="url(#cloudGrad)"
                    />
                    <path
                      d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 T500,40"
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Node Health Table */}
              <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Server Nodes</span>
                  <span className="text-sky-600 hover:underline cursor-pointer">Manage Auto-scale</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="font-mono">node-us-east-alpha</span>
                    <span className="text-emerald-600 font-bold">12.4% CPU • 3.2 GB RAM</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="font-mono">node-eu-west-bravo</span>
                    <span className="text-emerald-600 font-bold">28.1% CPU • 6.8 GB RAM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* High Fidelity Mobile Copilot / Dynamic AI UI */
          <div className="w-full flex-1 bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-inner">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">Pulse AI Copilot</h3>
                    <p className="text-[10px] text-purple-300">Model: Gemini 2.5 Pro Vision</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Ready
                </span>
              </div>

              {/* Chat Thread */}
              <div 
                onClick={(e) => { e.stopPropagation(); onElementSelect('ai-prompt-bubble'); }}
                className={`space-y-3 cursor-pointer p-1 rounded-xl transition ${
                  selectedElementId === 'ai-prompt-bubble' ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 bg-slate-800/90 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-200 border border-slate-700/80 leading-relaxed">
                    ✨ I've analyzed your design tokens and generated 3 responsive layout variations.
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-3 rounded-2xl border border-purple-500/30">
                  <span className="text-[10px] font-bold uppercase text-purple-300 tracking-wider">Suggested Layout</span>
                  <p className="text-xs font-semibold text-white mt-1">Bento Grid with Liquid Data Streams</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-sm">
                      Apply Variant
                    </button>
                    <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300">
                      Fork Branch
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Prompt Input */}
            <div className="pt-2">
              <div className="flex items-center gap-2 bg-slate-800/90 rounded-xl p-2 border border-slate-700">
                <input
                  type="text"
                  placeholder="Ask Pulse to adjust colors or fonts..."
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none flex-1 px-1"
                />
                <button className="p-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
