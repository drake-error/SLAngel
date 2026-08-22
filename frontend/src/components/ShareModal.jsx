import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Users, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Link2
} from 'lucide-react';

export function ShareModal({ isOpen, onClose, projectName }) {
  const [copied, setCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState('can_edit');
  const [emailInput, setEmailInput] = useState('');
  const [collaborators, setCollaborators] = useState([
    { name: 'Alex Chen (You)', email: 'alex.chen@stitch.lab', role: 'Owner', avatar: 'AC', color: 'from-blue-600 to-indigo-600' },
    { name: 'Sarah Miller', email: 's.miller@google.internal', role: 'Can edit', avatar: 'SM', color: 'from-purple-600 to-pink-600' },
    { name: 'Stitch AI Agent', email: 'agent-stitch@labs.internal', role: 'Autonomous Co-designer', avatar: '✨', color: 'from-amber-500 to-rose-500' },
  ]);

  if (!isOpen) return null;

  const projectUrl = `https://stitch.withgoogle.com/projects/3426225983746859312`;

  const handleCopy = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setCollaborators([
        ...collaborators,
        {
          name: emailInput.split('@')[0],
          email: emailInput.trim(),
          role: accessLevel === 'can_edit' ? 'Can edit' : 'Can view',
          avatar: emailInput.substring(0, 2).toUpperCase(),
          color: 'from-emerald-500 to-teal-600'
        }
      ]);
      setEmailInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share "{projectName}"
              </h3>
              <p className="text-xs text-slate-500">Collaborate with your team & AI agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Add people or groups by email..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium outline-none"
            >
              <option value="can_edit">Can edit</option>
              <option value="can_view">Can view</option>
            </select>
            <button
              type="submit"
              disabled={!emailInput.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
            >
              Invite
            </button>
          </form>

          {/* Collaborator List */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              People with access
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collaborators.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {c.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                    {c.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Public Link Copy Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">General access</span>
              </div>
              <span className="text-xs text-slate-500">Anyone with the link can view</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <Link2 className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={projectUrl}
                className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 font-mono outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 text-xs font-semibold shadow-sm hover:bg-blue-50 dark:hover:bg-slate-600 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
