import React, { useState, useMemo, useEffect } from 'react';
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
  Film
} from 'lucide-react';
import IntroAnimation from './components/IntroAnimation';

const initialApplications = [
  {
    id: 'REV-24-1092',
    service: 'Income Certificate',
    applicantName: 'Rameshwar Patil',
    department: 'Revenue & Land Records',
    district: 'North District',
    stage: 'Document Verification',
    daysHeld: 14,
    daysRemaining: 1,
    statutorySLA: 15,
    riskLevel: 'Critical',
    status: 'Pending Action',
    assignedOfficer: 'Ananya Rao',
    officerRole: 'Verification Officer',
    phone: '+91 98450 12891',
    aadhaarStatus: 'DigiLocker Verified',
    annualIncome: '₹ 1,80,000',
    purpose: 'Higher Education Scholarship Scheme (Post-Matric)',
    documents: [
      { name: 'Income_Declaration_Affidavit_2026.pdf', verified: true, size: '1.2 MB' },
      { name: 'Salary_Slip_Employer_Attested.pdf', verified: false, size: '840 KB' },
      { name: 'Ration_Card_Family_Sheet.pdf', verified: true, size: '2.4 MB' }
    ],
    timeline: [
      { date: '08 Aug 2026', title: 'Application submitted via citizen portal' },
      { date: '11 Aug 2026', title: 'Assigned to North District Tahsil Desk' },
      { date: '18 Aug 2026', title: 'Document verification initiated by Ananya Rao' },
      { date: '22 Aug 2026', title: 'SLA AI Alert: 24 Hours to statutory breach deadline' }
    ]
  },
  {
    id: 'REV-24-1105',
    service: 'Land Mutation',
    applicantName: 'Kavita Sundaram',
    department: 'Revenue & Land Records',
    district: 'North District',
    stage: 'Field Verification',
    daysHeld: 28,
    daysRemaining: 3,
    statutorySLA: 30,
    riskLevel: 'High',
    status: 'Pending Action',
    assignedOfficer: 'Vikram Singh',
    officerRole: 'Field Inspector (Patwari)',
    phone: '+91 97112 88402',
    aadhaarStatus: 'Biometric Authenticated',
    annualIncome: 'N/A (Land Deed)',
    purpose: 'Agricultural Land Title Transfer (Survey No. 44/2)',
    documents: [
      { name: 'Registered_Sale_Deed_7_12_Extract.pdf', verified: true, size: '3.6 MB' },
      { name: 'No_Encumbrance_Certificate.pdf', verified: true, size: '1.8 MB' },
      { name: 'Field_Boundary_Survey_Map.dwg.pdf', verified: false, size: '4.1 MB' }
    ],
    timeline: [
      { date: '25 Jul 2026', title: 'Application received for Mutation' },
      { date: '29 Jul 2026', title: 'Notice published for 15-day public objections' },
      { date: '14 Aug 2026', title: 'No objections received, sent for Field Inspection' },
      { date: '21 Aug 2026', title: 'Patwari spot verification report pending submission' }
    ]
  },
  {
    id: 'REV-24-1150',
    service: 'Caste Certificate',
    applicantName: 'Suresh Kumar Gupta',
    department: 'Social Justice & Welfare',
    district: 'Central District',
    stage: 'Approval',
    daysHeld: 8,
    daysRemaining: 2,
    statutorySLA: 10,
    riskLevel: 'High',
    status: 'Pending Action',
    assignedOfficer: 'Rahul Sharma',
    officerRole: 'Senior Revenue Officer (Tahsildar)',
    phone: '+91 99014 55193',
    aadhaarStatus: 'DigiLocker Verified',
    annualIncome: '₹ 3,20,000',
    purpose: 'State Civil Services Examination Reservation',
    documents: [
      { name: 'Father_Caste_Certificate_1984_Record.pdf', verified: true, size: '2.1 MB' },
      { name: 'School_Leaving_Certificate_Pedigree.pdf', verified: true, size: '1.5 MB' },
      { name: 'Panchayat_Verification_Resolution.pdf', verified: true, size: '1.1 MB' }
    ],
    timeline: [
      { date: '14 Aug 2026', title: 'Application filed online' },
      { date: '16 Aug 2026', title: 'Field inspection completed & recommended' },
      { date: '20 Aug 2026', title: 'Pending final Tahsildar digital signature' }
    ]
  },
  {
    id: 'REV-24-1201',
    service: 'Domicile Certificate',
    applicantName: 'Aman Deep Singh',
    department: 'Revenue & Land Records',
    district: 'West District',
    stage: 'Document Verification',
    daysHeld: 5,
    daysRemaining: 5,
    statutorySLA: 10,
    riskLevel: 'Medium',
    status: 'Pending Action',
    assignedOfficer: 'Meera Sen',
    officerRole: 'Verification Assistant',
    phone: '+91 98110 33419',
    aadhaarStatus: 'DigiLocker Verified',
    annualIncome: 'N/A',
    purpose: 'University State Quota Seat Admission',
    documents: [
      { name: '10_Years_Residence_Proof_Electricity_Bills.pdf', verified: true, size: '4.8 MB' },
      { name: 'Voter_ID_Both_Parents.pdf', verified: true, size: '1.9 MB' }
    ],
    timeline: [
      { date: '17 Aug 2026', title: 'Application submitted' },
      { date: '19 Aug 2026', title: 'Document verification desk assigned' }
    ]
  }
];

const officersList = [
  { id: 'off-1', name: 'Rahul Sharma', title: 'Senior Revenue Officer', context: 'Officer Context', district: 'All Districts (Supervisory)', activeCases: 18 },
  { id: 'off-2', name: 'Ananya Rao', title: 'Verification Officer', context: 'Desk Context', district: 'North District', activeCases: 42 },
  { id: 'off-3', name: 'Vikram Singh', title: 'Field Inspector (Patwari)', context: 'Field Inspection', district: 'North & East District', activeCases: 29 },
  { id: 'off-4', name: 'Priya Mehta', title: 'District Collector (DM)', context: 'Apex Executive', district: 'State Headquarters', activeCases: 7 },
  { id: 'off-5', name: 'Meera Sen', title: 'Verification Assistant', context: 'Intake Desk', district: 'West & Central District', activeCases: 14 }
];

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState(initialApplications);
  const [currentOfficer, setCurrentOfficer] = useState(officersList[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const metrics = useMemo(() => {
    const total = 12450 + (applications.length - initialApplications.length);
    const criticalCount = applications.filter(a => a.riskLevel === 'Critical' && a.status !== 'Approved').length;
    const atRiskCount = applications.filter(a => (a.riskLevel === 'Critical' || a.riskLevel === 'High') && a.status !== 'Approved').length;
    const pendingCount = applications.filter(a => a.status === 'Pending Action' || a.status === 'Under Review').length;
    
    return {
      totalApplications: total.toLocaleString(),
      atRiskAmber: 420 + (atRiskCount - 3),
      criticalRed: 156 + (criticalCount - 2),
      pendingOfficerAction: 89 + (pendingCount - 4),
      slaBreachRate: '7.2%',
      avgProcessingTime: '4.8'
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.stage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = riskFilter === 'All' || app.riskLevel === riskFilter;
      const matchesDept = departmentFilter === 'All' || app.department === departmentFilter;

      return matchesSearch && matchesRisk && matchesDept;
    });
  }, [applications, searchQuery, riskFilter, departmentFilter]);

  const handleApproveApp = (appId) => {
    setApplications(apps => apps.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status: 'Approved',
          riskLevel: 'Low',
          timeline: [
            ...a.timeline,
            { date: 'Just now', title: `Approved & Digital Certificate Issued by ${currentOfficer.name}` }
          ]
        };
      }
      return a;
    }));
    setSelectedAppForReview(null);
    showToast(`✅ Application ${appId} Approved! Citizen notified via SMS.`);
  };

  const handleExpediteApp = (appId, reason) => {
    setApplications(apps => apps.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status: 'Expedited',
          riskLevel: 'Critical',
          daysRemaining: 1,
          timeline: [
            ...a.timeline,
            { date: 'Just now', title: `Expedited by ${currentOfficer.name}: ${reason || 'Priority Fast-Track'}` }
          ]
        };
      }
      return a;
    }));
    setSelectedAppForExpedite(null);
    showToast(`⚡ Application ${appId} Expedited with Top Priority!`);
  };

  const handleRebalanceWorkload = () => {
    setApplications(apps => apps.map(a => {
      if (a.assignedOfficer === 'Ananya Rao' && a.id !== 'REV-24-1092') {
        return { ...a, assignedOfficer: 'Vikram Singh', officerRole: 'Field Inspector & Verification' };
      }
      return a;
    }));
    setIsRebalanceModalOpen(false);
    showToast('🔄 Workload successfully rebalanced! 16 cases transferred from Ananya Rao to Vikram Singh & Meera Sen.');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f9fa] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Intro Video Animation */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none shrink-0">
        <div>
          {/* Logo */}
          <div className="px-6 py-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0F4A44] dark:bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                DelayGuard
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Gov SLA Intelligence
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="px-3 py-2 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'applications', label: 'Applications', icon: FolderGit2, badge: applications.length },
              { id: 'priority-queue', label: 'Priority Queue', icon: AlertOctagon, badge: '4' },
              { id: 'sla-alerts', label: 'SLA Alerts', icon: Bell, alertCount: '2' },
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
              Central State Revenue Portal • v3.8
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
              <span>District: Central & North Division</span>
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
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
              </button>
            </div>

            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="SLA Intelligence Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Officer Profile Badge */}
            <div 
              onClick={() => setIsOfficerMenuOpen(!isOfficerMenuOpen)}
              className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 relative"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                  alt="Officer" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentOfficer.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentOfficer.context}
                </div>
              </div>
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
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-700 flex items-center gap-1 transition"
                    >
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
                        {applications.slice(0, 4).map((app) => (
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
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400">
                                  Medium
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {app.id === 'REV-24-1092' || app.id === 'REV-24-1150' ? (
                                <button
                                  onClick={() => setSelectedAppForReview(app)}
                                  className="px-4 py-1.5 rounded-md bg-[#0F4A44] hover:bg-[#0B3834] text-white text-xs font-semibold transition shadow-sm"
                                >
                                  Review
                                </button>
                              ) : app.id === 'REV-24-1105' ? (
                                <button
                                  onClick={() => setSelectedAppForExpedite(app)}
                                  className="px-3.5 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-slate-800 dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                  Expedite
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedAppForView(app)}
                                  className="px-4 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-slate-800 dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                  View
                                </button>
                              )}
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
                      <span>SLA Alerts</span>
                    </div>

                    <div 
                      onClick={() => { setActiveTab('applications'); setSearchQuery('Land Mutation'); }}
                      className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-red-950/30 border border-[#FEE2E2] dark:border-red-900/50 cursor-pointer hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-red-200">Land Mutation Backlog</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            91% probability of breaching SLA for 45 applications in North District.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setIsRebalanceModalOpen(true)}
                      className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-[#FDE68A] dark:border-amber-900/50 cursor-pointer hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[#9A3412] dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-amber-200">Officer Bottleneck</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            Ananya Rao has 22 pending approvals near deadline.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottleneck Stages */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Bottleneck Stages</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>Document Verification</span>
                          <span className="font-bold">45%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-[#78350F] dark:bg-amber-600 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>Field Verification</span>
                          <span className="font-bold">30%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-[#0284C7] dark:bg-sky-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          <span>Approval</span>
                          <span className="font-bold">25%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-[#0F4A44] dark:bg-teal-500 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
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
                <button
                  onClick={() => setIsNewAppModalOpen(true)}
                  className="px-3.5 py-2 bg-[#0F4A44] text-white rounded-lg text-xs font-semibold"
                >
                  + New Application
                </button>
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
                            app.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                            app.riskLevel === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                          }`}>{app.riskLevel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedAppForReview(app)}
                            className="px-3 py-1 bg-[#0F4A44] text-white rounded text-xs font-semibold"
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
          )}
        </main>
      </div>

      {/* Review Modal */}
      {selectedAppForReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
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
              <p><span className="font-semibold">Status:</span> {selectedAppForReview.aadhaarStatus}</p>
              <p><span className="font-semibold">Statutory SLA Remaining:</span> <span className="font-bold text-red-600">{selectedAppForReview.daysRemaining} days</span></p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setSelectedAppForReview(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                Close
              </button>
              <button onClick={() => handleApproveApp(selectedAppForReview.id)} className="px-4 py-2 bg-[#0F4A44] hover:bg-[#0B3834] text-white rounded-lg text-xs font-bold">
                Approve & Issue Certificate
              </button>
            </div>
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
