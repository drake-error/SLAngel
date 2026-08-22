import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  FolderGit2, 
  AlertOctagon, 
  Bell, 
  CheckSquare, 
  BarChart3, 
  Sliders, 
  Server, 
  HelpCircle, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Search, 
  Plus, 
  Check, 
  X, 
  FileText, 
  Download, 
  Zap, 
  Moon, 
  Sun,
  TrendingUp,
  UserCheck,
  Film,
  LogIn,
  LogOut
} from 'lucide-react';
import IntroAnimation from './components/IntroAnimation';

// ─── API Helper ─────────────────────────────────────────────────────────────

const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('slangel_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || err.error || 'API Error');
  }
  return res.json();
}

// ─── Login Screen ───────────────────────────────────────────────────────────

function LoginScreen({ onLogin, darkMode, setDarkMode }) {
  const [username, setUsername] = useState('rahul.sharma');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('slangel_token', data.access_token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0b0f19]' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${darkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#0F4A44] text-white flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>SLAngel</h1>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gov SLA Intelligence Platform</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="ml-auto p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-[#0F4A44] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-[#0F4A44] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#0F4A44] hover:bg-[#0B3834] text-white rounded-lg text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={`mt-6 p-3 rounded-lg text-xs ${darkMode ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Admin: <span className="font-mono">rahul.sharma / admin123</span></p>
          <p>Officer: <span className="font-mono">ananya.rao / officer123</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [officersList, setOfficersList] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);
  const [selectedAppForExpedite, setSelectedAppForExpedite] = useState(null);
  const [selectedAppForView, setSelectedAppForView] = useState(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isOfficerMenuOpen, setIsOfficerMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // New application form state
  const [newAppForm, setNewAppForm] = useState({
    applicant_name: '', service_type: 'Income Certificate', department: 'Revenue & Land Records',
    district: '', sla_days: 15, purpose: '', applicant_contact: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ─── Auth Check ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('slangel_token');
    if (token) {
      apiFetch('/auth/me')
        .then(userData => { setUser(userData); setIsLoggedIn(true); })
        .catch(() => { localStorage.removeItem('slangel_token'); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  // ─── Data Fetching ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const [appsData, officersData, dashData, alertsData] = await Promise.all([
        apiFetch('/applications?page_size=100'),
        apiFetch('/officers'),
        apiFetch('/dashboard/summary'),
        apiFetch('/alerts/unread'),
      ]);
      setApplications(appsData.applications || []);
      setOfficersList(officersData || []);
      setDashboardData(dashData);
      setAlerts(alertsData.alerts || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // ─── Current Officer ───────────────────────────────────────────────────
  const currentOfficer = useMemo(() => {
    if (!user || !officersList.length) return { name: user?.full_name || 'Officer', context: user?.role || '', activeCases: 0 };
    const match = officersList.find(o => o.name === user.full_name);
    return match || { name: user.full_name, context: user.role, activeCases: 0 };
  }, [user, officersList]);

  // ─── Metrics ──────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (!dashboardData) return {
      totalApplications: '0', atRiskAmber: 0, criticalRed: 0,
      pendingOfficerAction: 0, slaBreachRate: '0%', avgProcessingTime: '0'
    };
    return {
      totalApplications: dashboardData.total_applications?.toLocaleString() || '0',
      atRiskAmber: (dashboardData.high_risk || 0) + (dashboardData.critical_risk || 0),
      criticalRed: dashboardData.critical_risk || 0,
      pendingOfficerAction: dashboardData.pending_applications || 0,
      slaBreachRate: `${dashboardData.sla_breach_rate || 0}%`,
      avgProcessingTime: `${dashboardData.avg_processing_time || 0}`
    };
  }, [dashboardData]);

  // ─── Filtered Applications ────────────────────────────────────────────
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.stage?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'All' || app.riskLevel === riskFilter;
      const matchesDept = departmentFilter === 'All' || app.department === departmentFilter;
      return matchesSearch && matchesRisk && matchesDept;
    });
  }, [applications, searchQuery, riskFilter, departmentFilter]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleApproveApp = async (appId) => {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Approved', remarks: `Approved & Digital Certificate Issued by ${currentOfficer.name}` }),
      });
      setSelectedAppForReview(null);
      showToast(`✅ Application ${appId} Approved! Citizen notified via SMS.`);
      fetchData();
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    }
  };

  const handleExpediteApp = async (appId, reason) => {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Expedited', remarks: reason || 'Priority Fast-Track' }),
      });
      setSelectedAppForExpedite(null);
      showToast(`⚡ Application ${appId} Expedited with Top Priority!`);
      fetchData();
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    try {
      const result = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify(newAppForm),
      });
      setIsNewAppModalOpen(false);
      setNewAppForm({ applicant_name: '', service_type: 'Income Certificate', department: 'Revenue & Land Records', district: '', sla_days: 15, purpose: '', applicant_contact: '' });
      showToast(`✅ Application ${result.id} created successfully!`);
      fetchData();
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    }
  };

  const handleRebalanceWorkload = () => {
    setIsRebalanceModalOpen(false);
    showToast('🔄 Workload successfully rebalanced!');
  };

  const handleLogout = () => {
    localStorage.removeItem('slangel_token');
    setUser(null);
    setIsLoggedIn(false);
    setApplications([]);
  };

  // ─── Auth Guard ─────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><p className="text-slate-500">Loading...</p></div>;
    return <LoginScreen onLogin={(u) => { setUser(u); setIsLoggedIn(true); }} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0b0f19]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-[#0F4A44] text-white flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading SLAngel...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f9fa] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Intro Video Animation */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none shrink-0">
        <div>
          {/* Logo & Brand Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
            <div className="w-11 h-11 shrink-0 flex items-center justify-center">
              <img src="slangel_logo.svg" alt="SLAngel Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center">
                <span className="text-xl font-black tracking-tight text-[#103778] dark:text-blue-400 font-sans">
                  SL<span className="text-emerald-500">A</span><span className="text-emerald-600 dark:text-emerald-400">ngel</span>
                </span>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">
                Smart Support for Smart Officers
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="px-3 py-2 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'applications', label: 'Applications', icon: FolderGit2, badge: applications.length },
              { id: 'priority-queue', label: 'Priority Queue', icon: AlertOctagon, badge: applications.filter(a => a.riskLevel === 'Critical' || a.riskLevel === 'High').length || '0' },
              { id: 'sla-alerts', label: 'SLA Alerts', icon: Bell, alertCount: alerts.length || '0' },
              { id: 'verification', label: 'Verification', icon: CheckSquare },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'services', label: 'Services', icon: Sliders },
              { id: 'administration', label: 'Administration', icon: Server },
            ].map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E3E9F8] dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-slate-900 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.alertCount && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.alertCount}
                    </span>
                  )}
                  {item.badge && !item.alertCount && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Jurisdiction Sync</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              SLAngel Backend API • v1.0
            </p>
          </div>

          <button
            onClick={() => setIsNewAppModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#0F4A44] hover:bg-[#0B3834] text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Intake</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 px-8 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'priority-queue' ? 'Priority Queue (Urgent)' : activeTab.replace('-', ' ')}
            </h2>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Backend Connected</span>
            </div>
          </div>

          {/* Right Header icons */}
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search App ID, Citizen, Service..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-slate-600 focus:outline-none dark:text-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

<<<<<<< HEAD
            <button
              onClick={() => setShowIntro(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition"
              title="Replay Intro Animation"
            >
              <Film className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Intro</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
=======
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Toggle Theme">
>>>>>>> 845324d (Configure Vercel deployment and update frontend with API integration)
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition">
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications ({alerts.length})</h4>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500">No unread alerts</p>
                  ) : (
                    alerts.slice(0, 8).map(alert => (
                      <div key={alert.id} className="p-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                        <div className="flex items-start gap-2">
                          {alert.severity === 'CRITICAL' ? <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setIsHelpModalOpen(true)} className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="SLA Intelligence Help">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Officer Profile Badge */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#0F4A44] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-slate-300 dark:ring-slate-700">
                {currentOfficer.name?.charAt(0) || 'O'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentOfficer.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentOfficer.context || user?.role}
                </div>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition" title="Logout">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* 6 Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Applications</span>
                  <div className="text-2xl lg:text-[28px] font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                    {metrics.totalApplications}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9A3412] dark:text-amber-500">
                    <AlertTriangle className="w-4 h-4 text-[#9A3412] dark:text-amber-500" />
                    <span>At-Risk (Amber)</span>
                  </div>
                  <div className="text-2xl lg:text-[28px] font-extrabold text-[#9A3412] dark:text-amber-500 mt-2 tracking-tight">
                    {metrics.atRiskAmber}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] dark:text-red-500">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] dark:text-red-500" />
                    <span>Critical (Red)</span>
                  </div>
                  <div className="text-2xl lg:text-[28px] font-extrabold text-[#DC2626] dark:text-red-500 mt-2 tracking-tight">
                    {metrics.criticalRed}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Officer Action</span>
                  <div className="text-2xl lg:text-[28px] font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                    {metrics.pendingOfficerAction}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SLA Breach Rate</span>
                  <div className="text-2xl lg:text-[28px] font-extrabold text-[#DC2626] dark:text-red-500 mt-2 tracking-tight">
                    {metrics.slaBreachRate}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Processing Time</span>
                  <div className="text-2xl lg:text-[28px] font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight flex items-baseline gap-1">
                    <span>{metrics.avgProcessingTime}</span>
                    <span className="text-xs font-medium text-slate-500">days</span>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Priority Queue (Urgent) Table */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Priority Queue (Urgent)
                    </h3>
                    <button onClick={() => setActiveTab('applications')} className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-700 flex items-center gap-1 transition">
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-800/30">
                          <th className="py-3.5 px-6">App ID</th>
                          <th className="py-3.5 px-4">Service</th>
                          <th className="py-3.5 px-4">Stage</th>
                          <th className="py-3.5 px-4 text-center">Days Held</th>
                          <th className="py-3.5 px-4 text-center">Days Rem.</th>
                          <th className="py-3.5 px-4">Risk Level</th>
                          <th className="py-3.5 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                        {applications
                          .filter(a => a.status !== 'Approved' && a.status !== 'Completed' && a.status !== 'Rejected')
                          .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
                          .slice(0, 6).map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{app.id}</td>
                            <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">{app.service}</td>
                            <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{app.stage}</td>
                            <td className="py-4 px-4 text-center font-semibold text-slate-900 dark:text-white">{app.daysHeld}</td>
                            <td className={`py-4 px-4 text-center font-bold ${app.daysRemaining <= 1 ? 'text-[#DC2626]' : 'text-slate-900 dark:text-white'}`}>
                              {app.daysRemaining}
                            </td>
                            <td className="py-4 px-4">
                              {app.riskLevel === 'Critical' ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626] dark:bg-red-950/60 dark:text-red-400">
                                  Critical
                                </span>
                              ) : app.riskLevel === 'High' ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#9A3412] dark:bg-amber-950/60 dark:text-amber-400">
                                  High
                                </span>
                              ) : app.riskLevel === 'Medium' ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400">
                                  Medium
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950/60 dark:text-emerald-400">
                                  Low
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => setSelectedAppForReview(app)}
                                className="px-4 py-1.5 rounded-md bg-[#0F4A44] hover:bg-[#0B3834] text-white text-xs font-semibold transition shadow-sm"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: SLA Alerts & Bottlenecks */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* SLA Alerts */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                      <Bell className="w-5 h-5 text-rose-600" />
                      <span>SLA Alerts ({alerts.length})</span>
                    </div>

                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-500">No active alerts</p>
                    ) : (
                      alerts.slice(0, 4).map(alert => (
                        <div key={alert.id}
                          className={`p-4 rounded-xl cursor-pointer hover:shadow-md transition ${
                            alert.severity === 'CRITICAL' 
                              ? 'bg-[#FEF2F2] dark:bg-red-950/30 border border-[#FEE2E2] dark:border-red-900/50' 
                              : 'bg-[#FFFBEB] dark:bg-amber-950/30 border border-[#FDE68A] dark:border-amber-900/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {alert.severity === 'CRITICAL' 
                              ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              : <Clock className="w-4 h-4 text-[#9A3412] dark:text-amber-500 shrink-0 mt-0.5" />
                            }
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{alert.type.replace('_', ' ')}</h4>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bottleneck Stages */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Bottleneck Stages</h3>
                    <div className="space-y-4">
                      {(() => {
                        const activeApps = applications.filter(a => a.status !== 'Approved' && a.status !== 'Completed' && a.status !== 'Rejected');
                        const total = activeApps.length || 1;
                        const docVerif = activeApps.filter(a => a.stage?.includes('Document') || a.stage?.includes('Verification')).length;
                        const fieldVerif = activeApps.filter(a => a.stage?.includes('Field')).length;
                        const approval = activeApps.filter(a => a.stage?.includes('Approval') || a.stage?.includes('Escalated')).length;
                        return [
                          { label: 'Document Verification', pct: Math.round(docVerif / total * 100), color: 'bg-[#78350F] dark:bg-amber-600' },
                          { label: 'Field Verification', pct: Math.round(fieldVerif / total * 100), color: 'bg-[#0284C7] dark:bg-sky-500' },
                          { label: 'Approval', pct: Math.round(approval / total * 100), color: 'bg-[#0F4A44] dark:bg-teal-500' },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              <span>{item.label}</span>
                              <span className="font-bold">{item.pct}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Citizen Applications Registry</h3>
                <div className="flex items-center gap-3">
                  <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border-0 focus:outline-none dark:text-white">
                    <option value="All">All Risk</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <button onClick={() => setIsNewAppModalOpen(true)}
                    className="px-3.5 py-2 bg-[#0F4A44] text-white rounded-lg text-xs font-semibold">
                    + New Application
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                      <th className="py-3 px-4">App ID</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-3 text-center">Days Held</th>
                      <th className="py-3 px-3 text-center">Days Rem.</th>
                      <th className="py-3 px-3">Risk</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3.5 px-4 font-bold">{app.id}</td>
                        <td className="py-3.5 px-4">{app.applicantName}</td>
                        <td className="py-3.5 px-4">{app.service}</td>
                        <td className="py-3.5 px-4 text-slate-500">{app.stage}</td>
                        <td className="py-3.5 px-3 text-center font-bold">{app.daysHeld}</td>
                        <td className={`py-3.5 px-3 text-center font-bold ${app.daysRemaining <= 1 ? 'text-red-600' : ''}`}>{app.daysRemaining}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.riskLevel === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' :
                            app.riskLevel === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' :
                            app.riskLevel === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}>{app.riskLevel}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            app.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                            app.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{app.priority}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => setSelectedAppForReview(app)}
                            className="px-3 py-1 bg-[#0F4A44] text-white rounded text-xs font-semibold">
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Priority Queue Tab */}
          {activeTab === 'priority-queue' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Urgent Applications (High & Critical Risk)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                      <th className="py-3 px-4">App ID</th><th className="py-3 px-4">Applicant</th><th className="py-3 px-4">Service</th>
                      <th className="py-3 px-3 text-center">Days Rem.</th><th className="py-3 px-3">Risk</th><th className="py-3 px-4">Risk Reasons</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {applications
                      .filter(a => (a.riskLevel === 'Critical' || a.riskLevel === 'High') && a.status !== 'Approved' && a.status !== 'Completed')
                      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
                      .map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3.5 px-4 font-bold">{app.id}</td>
                        <td className="py-3.5 px-4">{app.applicantName}</td>
                        <td className="py-3.5 px-4">{app.service}</td>
                        <td className={`py-3.5 px-3 text-center font-bold ${app.daysRemaining <= 1 ? 'text-red-600' : ''}`}>{app.daysRemaining}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}>{app.riskLevel} ({app.risk_score?.toFixed(0)})</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            {(app.risk_factors || []).slice(0, 2).map((r, i) => (
                              <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 truncate">• {r}</p>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => setSelectedAppForReview(app)}
                            className="px-3 py-1 bg-[#0F4A44] text-white rounded text-xs font-semibold">Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLA Alerts Tab */}
          {activeTab === 'sla-alerts' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">All SLA Alerts</h3>
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' :
                  'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {alert.severity === 'CRITICAL' ? <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{alert.type.replace(/_/g, ' ')} — {alert.application_number}</h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{alert.message}</p>
                      </div>
                    </div>
                    <button onClick={async () => {
                      await apiFetch(`/alerts/${alert.id}/resolve`, { method: 'PATCH' });
                      fetchData();
                    }} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No active alerts. All applications are within SLA parameters.</p>}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verification Queue</h3>
              <div className="space-y-3">
                {applications.filter(a => a.verification_status === 'PENDING' || a.verification_status === 'IN_PROGRESS').map(app => (
                  <div key={app.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.id} — {app.service}</h4>
                      <p className="text-xs text-slate-500 mt-1">{app.applicantName} • {app.department} • {app.daysRemaining} days remaining</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.verification_status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{app.verification_status}</span>
                    </div>
                    <div className="flex gap-2">
                      {app.verification_status === 'PENDING' && (
                        <button onClick={async () => {
                          await apiFetch(`/applications/${app.id}/verification`, {
                            method: 'POST', body: JSON.stringify({ action: 'start', remarks: 'Starting verification' })
                          });
                          showToast(`✅ Verification started for ${app.id}`);
                          fetchData();
                        }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">Start</button>
                      )}
                      {app.verification_status === 'IN_PROGRESS' && (
                        <>
                          <button onClick={async () => {
                            await apiFetch(`/applications/${app.id}/verification`, {
                              method: 'POST', body: JSON.stringify({ action: 'complete', remarks: 'All documents verified' })
                            });
                            showToast(`✅ Verification completed for ${app.id}`);
                            fetchData();
                          }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold">Complete</button>
                          <button onClick={async () => {
                            await apiFetch(`/applications/${app.id}/verification`, {
                              method: 'POST', body: JSON.stringify({ action: 'reject', remarks: 'Documents insufficient' })
                            });
                            showToast(`❌ Verification rejected for ${app.id}`);
                            fetchData();
                          }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {applications.filter(a => a.verification_status === 'PENDING' || a.verification_status === 'IN_PROGRESS').length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">No pending verifications.</p>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && dashboardData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'SLA Compliance', value: `${dashboardData.sla_compliance_percentage}%`, color: 'text-emerald-600' },
                  { label: 'Breach Rate', value: `${dashboardData.sla_breach_rate}%`, color: 'text-red-600' },
                  { label: 'Avg Processing', value: `${dashboardData.avg_processing_time} days`, color: 'text-blue-600' },
                  { label: 'Total Completed', value: dashboardData.completed_applications, color: 'text-slate-900 dark:text-white' },
                ].map(item => (
                  <div key={item.label} className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                    <div className={`text-2xl font-extrabold mt-2 ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Officer Workload</h3>
                <div className="space-y-3">
                  {officersList.map(officer => (
                    <div key={officer.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{officer.name}</p>
                        <p className="text-xs text-slate-500">{officer.title} • {officer.district}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{officer.activeCases} active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
      {selectedAppForReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Review {selectedAppForReview.id} — {selectedAppForReview.service}
              </h3>
              <button onClick={() => setSelectedAppForReview(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs space-y-3">
              <p><span className="font-semibold">Applicant:</span> {selectedAppForReview.applicantName} ({selectedAppForReview.phone})</p>
              <p><span className="font-semibold">Department:</span> {selectedAppForReview.department}</p>
              <p><span className="font-semibold">Aadhaar Status:</span> {selectedAppForReview.aadhaarStatus}</p>
              <p><span className="font-semibold">Purpose:</span> {selectedAppForReview.purpose}</p>
              <p><span className="font-semibold">Statutory SLA Remaining:</span> <span className={`font-bold ${selectedAppForReview.daysRemaining <= 2 ? 'text-red-600' : 'text-emerald-600'}`}>{selectedAppForReview.daysRemaining} days</span></p>
              <p><span className="font-semibold">Risk Score:</span> <span className="font-bold">{selectedAppForReview.risk_score?.toFixed(1)} ({selectedAppForReview.riskLevel})</span></p>
              {selectedAppForReview.predicted_delay && (
                <p className="text-red-600 font-bold">⚠️ Predicted Delay: {selectedAppForReview.predicted_delay_days} days</p>
              )}
              {selectedAppForReview.risk_factors?.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Risk Factors:</p>
                  {selectedAppForReview.risk_factors.map((r, i) => (
                    <p key={i} className="text-[11px] text-amber-700 dark:text-amber-400">• {r}</p>
                  ))}
                </div>
              )}
              {selectedAppForReview.documents?.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Documents:</p>
                  {selectedAppForReview.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      {doc.verified ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                      <span className="text-slate-700 dark:text-slate-300">{doc.name}</span>
                      <span className="text-slate-400 text-[10px]">{doc.size}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedAppForReview.timeline?.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Timeline:</p>
                  {selectedAppForReview.timeline.map((event, i) => (
                    <div key={i} className="flex gap-2 py-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3 ml-1">
                      <span className="text-slate-400 text-[10px] w-20 shrink-0">{event.date}</span>
                      <span className="text-slate-700 dark:text-slate-300">{event.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setSelectedAppForReview(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                Close
              </button>
              {selectedAppForReview.status !== 'Approved' && selectedAppForReview.status !== 'Completed' && (
                <button onClick={() => handleApproveApp(selectedAppForReview.id)} className="px-4 py-2 bg-[#0F4A44] hover:bg-[#0B3834] text-white rounded-lg text-xs font-bold">
                  Approve & Issue Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {isNewAppModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">New Application Intake</h3>
              <button onClick={() => setIsNewAppModalOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateApp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Applicant Name *</label>
                <input type="text" required value={newAppForm.applicant_name} onChange={e => setNewAppForm({...newAppForm, applicant_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4A44]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Type *</label>
                  <select value={newAppForm.service_type} onChange={e => setNewAppForm({...newAppForm, service_type: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white">
                    {['Income Certificate','Land Mutation','Caste Certificate','Domicile Certificate','Birth Certificate','Marriage Certificate','Property Registration','Building Permit','Trade License'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SLA Days</label>
                  <input type="number" value={newAppForm.sla_days} onChange={e => setNewAppForm({...newAppForm, sla_days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department *</label>
                <input type="text" required value={newAppForm.department} onChange={e => setNewAppForm({...newAppForm, department: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input type="text" value={newAppForm.applicant_contact} onChange={e => setNewAppForm({...newAppForm, applicant_contact: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose</label>
                <textarea value={newAppForm.purpose} onChange={e => setNewAppForm({...newAppForm, purpose: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white h-16" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewAppModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0F4A44] hover:bg-[#0B3834] text-white rounded-lg font-bold">Create Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
