export const initialScreens = [
  {
    id: 'screen-1',
    title: 'Nova Wallet — Home & Cards',
    type: 'mobile',
    platform: 'iOS (393 × 852)',
    category: 'Fintech & Wealth',
    variant: 'Variant A (Light)',
    variants: ['Variant A (Light)', 'Variant B (Dark Neo)', 'Variant C (Minimalist)'],
    width: 380,
    height: 740,
    status: 'Ready for Review',
    version: 'v2.4',
    selectedElementId: 'card-balance',
    tokens: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6366F1',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F8FAFC',
      fontFamily: 'Google Sans / Inter',
      borderRadius: '24px',
      padding: '20px',
    },
    codeSnippets: {
      react: `import React, { useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles } from 'lucide-react';

export function NovaWalletHome() {
  const [balance] = useState('$84,290.45');
  
  return (
    <div className="w-full max-w-sm mx-auto bg-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center font-bold text-sm">
            NV
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Welcome back</h4>
            <p className="text-sm font-semibold text-slate-100">Alex Chen</p>
          </div>
        </div>
        <button className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700">
          <Sparkles className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 mb-6 shadow-lg shadow-blue-500/20">
        <div className="text-xs font-medium text-blue-100 uppercase tracking-wider mb-1">Total Liquid Balance</div>
        <div className="text-3xl font-extrabold tracking-tight mb-4">{balance}</div>
        <div className="flex items-center justify-between text-xs text-blue-100/80">
          <span>•••• 8492</span>
          <span>Exp 09/28</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mb-6 text-center">
        {['Send', 'Receive', 'Invest', 'Vault'].map((action) => (
          <button key={action} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 transition">
            <span className="text-xs font-medium text-slate-300">{action}</span>
          </button>
        ))}
      </div>
    </div>
  );
}`,
      html: `<div class="wallet-container">
  <div class="header">
    <div class="user-pill">Alex Chen</div>
    <button class="ai-sparkle"></button>
  </div>
  <div class="balance-card">
    <span class="label">Total Liquid Balance</span>
    <h2 class="amount">$84,290.45</h2>
  </div>
</div>`,
      json: JSON.stringify({
        component: "NovaWalletHome",
        version: "2.4",
        viewport: { width: 393, height: 852 },
        theme: "dark-neo",
        elementsCount: 28,
        aiGenerated: true
      }, null, 2)
    }
  },
  {
    id: 'screen-2',
    title: 'Nexus Cloud — Telemetry & Ops',
    type: 'desktop',
    platform: 'Desktop Web (1440 × 900)',
    category: 'Cloud Infrastructure',
    variant: 'Production Dashboard',
    variants: ['Production Dashboard', 'Incident War-Room', 'Cost Analytics View'],
    width: 680,
    height: 740,
    status: 'Synced with Code',
    version: 'v3.1',
    selectedElementId: 'kpi-cluster-health',
    tokens: {
      primaryColor: '#0EA5E9',
      secondaryColor: '#10B981',
      backgroundColor: '#F8FAFC',
      surfaceColor: '#FFFFFF',
      fontFamily: 'Google Sans Flex',
      borderRadius: '16px',
      padding: '24px',
    },
    codeSnippets: {
      react: `import React from 'react';
import { Activity, Server, Cpu, Database, CheckCircle2, TrendingUp } from 'lucide-react';

export function NexusCloudDashboard() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Nexus Core Engine</h2>
          <p className="text-xs text-slate-500">Global Cluster: us-east-4 • Kubernetes v1.29</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All 48 Nodes Healthy
          </span>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Throughput RPS</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">1.48M</p>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% peak
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Average Latency</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">14.2 ms</p>
          <span className="text-xs text-slate-500 mt-1">p99: 28.4ms</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Cluster Efficiency</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">94.8%</p>
          <span className="text-xs text-blue-600 mt-1">Optimized by Stitch</span>
        </div>
      </div>
    </div>
  );
}`,
      html: `<div class="nexus-cloud-dashboard">
  <div class="top-telemetry">
    <h1>Nexus Core Engine</h1>
    <span class="badge status-healthy">Healthy</span>
  </div>
  <div class="metrics-grid">
    <div class="kpi">1.48M RPS</div>
    <div class="kpi">14.2ms Latency</div>
    <div class="kpi">94.8% Efficiency</div>
  </div>
</div>`,
      json: JSON.stringify({
        system: "NexusCloudDashboard",
        environment: "Production",
        clusters: 48,
        uptime: "99.998%"
      }, null, 2)
    }
  },
  {
    id: 'screen-3',
    title: 'Pulse AI — Copilot Workspace',
    type: 'mobile',
    platform: 'iOS (393 × 852)',
    category: 'Generative AI',
    variant: 'Interactive Chat',
    variants: ['Interactive Chat', 'Voice Mode Waveform', 'Canvas Mode'],
    width: 380,
    height: 740,
    status: 'Experimental Mode',
    version: 'v1.8',
    selectedElementId: 'ai-prompt-bubble',
    tokens: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      backgroundColor: '#0F172A',
      surfaceColor: '#1E293B',
      fontFamily: 'Google Sans / SF Pro',
      borderRadius: '20px',
      padding: '16px',
    },
    codeSnippets: {
      react: `import React from 'react';
import { Sparkles, Bot, Mic, Send, Lightbulb, Zap } from 'lucide-react';

export function PulseAICopilot() {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white rounded-3xl p-5 border border-slate-800">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">Pulse AI 2.0</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">Gemini Pro</span>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 space-y-4 py-4 overflow-y-auto">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 bg-slate-800/80 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-200 border border-slate-700/60 leading-relaxed">
            I’ve generated 3 responsive layout variations based on your Figma design tokens. Which one would you like to refine?
          </div>
        </div>
      </div>
    </div>
  );
}`,
      html: `<div class="pulse-chat-mobile">
  <header>Pulse AI 2.0</header>
  <div class="bubble bot-response">I have generated 3 responsive layout variations.</div>
</div>`,
      json: JSON.stringify({
        model: "Gemini 2.5 Pro",
        sessionType: "Copilot Canvas",
        latency: "180ms"
      }, null, 2)
    }
  }
];

export const projectVersions = [
  { id: 'v2.4', label: 'v2.4 - Google Stitch 3.0 Refactor', time: '12 mins ago', author: 'Alex Chen', active: true },
  { id: 'v2.3', label: 'v2.3 - Bento Grid Dashboard Polish', time: '2 hours ago', author: 'Stitch Agent', active: false },
  { id: 'v2.2', label: 'v2.2 - Design Token Sync & Dark Mode', time: 'Yesterday', author: 'Alex Chen', active: false },
  { id: 'v2.1', label: 'v2.1 - Multi-device Responsive Cascade', time: '2 days ago', author: 'Stitch Agent', active: false },
  { id: 'v1.0', label: 'v1.0 - Initial AI Generation Prompt', time: '3 days ago', author: 'Alex Chen', active: false },
];

export const designSystems = [
  { id: 'm3-expressive', name: 'Material 3 Expressive', version: 'v3.2', color: '#4285F4', active: true },
  { id: 'stitch-neo', name: 'Stitch Neo-Glass Lab', version: 'v1.4', color: '#8B5CF6', active: false },
  { id: 'minimal-slate', name: 'Minimal Slate Dark', version: 'v2.0', color: '#0F172A', active: false },
  { id: 'aurora-fintech', name: 'Aurora Fintech Design', version: 'v4.1', color: '#10B981', active: false },
];

export const componentLibrary = [
  { id: 'comp-1', name: 'Metric Bento Card', category: 'Cards', icon: 'LayoutGrid', preview: 'KPI sparkline + Delta trend' },
  { id: 'comp-2', name: 'Fintech Balance Sheet', category: 'Finance', icon: 'CreditCard', preview: 'Holo gradient card + Action pills' },
  { id: 'comp-3', name: 'AI Prompt Input Bar', category: 'Input', icon: 'Sparkles', preview: 'Multi-modal prompt + Voice button' },
  { id: 'comp-4', name: 'Responsive App Navigation', category: 'Navigation', icon: 'Compass', preview: 'Glass floating bottom dock' },
  { id: 'comp-5', name: 'Cluster Telemetry Chart', category: 'Data Viz', icon: 'Activity', preview: 'Real-time smooth SVG area chart' },
  { id: 'comp-6', name: 'Team Avatar Group', category: 'Social', icon: 'Users', preview: 'Overlapping avatars + Status ring' },
];

export const promptSuggestions = [
  { text: '✨ Add Dark Mode Bento variant', type: 'theme' },
  { text: '📊 Insert live ARR revenue chart', type: 'component' },
  { text: '📱 Generate Tablet iPad layout', type: 'screen' },
  { text: '🎨 Switch design system to Material 3', type: 'tokens' },
  { text: '⚡ Add Apple Pay checkout sheet', type: 'action' },
];
