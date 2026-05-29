import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PlusCircle, Save, LogOut, Lock, UserPlus, ShieldAlert,
  BookOpen, ClipboardList, Calendar, Award, Clock, Beaker, GraduationCap,
  Keyboard, Mic, PenTool, Megaphone, MapPin, MessageSquare, TrendingUp,
  Sparkles, CheckCircle2, Circle, FileText, Video, HelpCircle, Sliders, X, ExternalLink,
  FolderOpen, Trophy, Mail, User, Settings, Flame, Eye, CheckSquare, ChevronRight, Play
} from 'lucide-react';

// --- PRODUCTION-READY DYNAMIC API ROUTING ANCHOR ---
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// --- DATA STRUCTURAL ENTITY INTERFACES ---
interface DashboardMetrics {
  totalTeachers: number;
  activeTeachers: number;
  trainingsCompleted: number;
  certificationsEarned: number;
}

interface MissionProfile {
  id: number | null;
  studentEmail: string;
  aiStrengthsSummary: string;
  aiActionableFocus: string;
  learningHoursThisWeek: number;
  pendingAssignmentsCount: number;
  badgesEarnedCount: number;
  currentGradeSection: string;
  scienceProgress: number;
  mathProgress: number;
  englishProgress: number;
  computerProgress: number;
  typingSpeedWpm: number;
  publicSpeakingScore: number;
  creativeWritingScore: number;
  volcanoLabStatus: string;
  circuitLabStatus: string;
  cellLabStatus: string;
  teacherRemarks: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  authorName: string;
}

interface StudentAttendanceRecord {
  id?: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks: string;
}

interface StudentTransportDetails {
  busNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

interface StudentNutritionLog {
  id?: number;
  date: string;
  mealType: string;
  menuItems: string;
  calories: number;
  consumed: boolean;
}

type SystemRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
type ModalViewType = 'NONE' | 'CLASSES' | 'ASSIGNMENTS' | 'BADGES' | 'HOURS';
type PortalSubView = 'DASHBOARD' | 'CLASSES' | 'RESOURCES' | 'ASSIGNMENTS' | 'VIDEOS' | 'LABS' | 'QUIZZES' | 'SKILLS' | 'ACHIEVEMENTS' | 'CALENDAR' | 'PROFILE' | 'ATTENDANCE' | 'TRANSPORT' | 'NUTRITION';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mgmt_portal_token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('mgmt_portal_email'));
  const [currentRole, setCurrentRole] = useState<SystemRole | null>(localStorage.getItem('mgmt_portal_role') as any);

  const [selectedLoginRole, setSelectedLoginRole] = useState<SystemRole>('ADMIN');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');
  const [formMessage, setFormMessage] = useState({ text: '', isError: false });

  // Navigation Panel Sub-View Router
  const [currentView, setCurrentView] = useState<PortalSubView>('DASHBOARD');

  // Core Sync States
  const [profile, setProfile] = useState<MissionProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // New Extension Subsystem Hook States
  const [attendanceHistory, setAttendanceHistory] = useState<StudentAttendanceRecord[]>([]);
  const [transportInfo, setTransportInfo] = useState<StudentTransportDetails | null>(null);
  const [nutritionHistory, setNutritionHistory] = useState<StudentNutritionLog[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalViewType>('NONE');

  // Dynamic Workspace Controllers for Teachers
  const [selectedRosterStudent, setSelectedRosterStudent] = useState<string>('kiara@meru.edu');
  const [teacherSaveMsg, setTeacherSaveMsg] = useState('');
  const [tHours, setTHours] = useState(12);
  const [tAssignments, setTAssignments] = useState(5);
  const [tBadges, setTBadges] = useState(8);
  const [tGradeSec, setTGradeSec] = useState('Grade 7 - Section A');
  const [tSci, setTSci] = useState(75);
  const [tMath, setTMath] = useState(60);
  const [tEng, setTEng] = useState(80);
  const [tComp, setTComp] = useState(70);
  const [tTyping, setTTyping] = useState(85);
  const [tSpeaking, setTSpeaking] = useState(60);
  const [tWriting, setTWriting] = useState(70);
  const [tVolcano, setTVolcano] = useState('Completed');
  const [tCircuit, setTCruit] = useState('In Progress');
  const [tCell, setTCell] = useState('Not Started');
  const [tRemarks, setTRemarks] = useState('');
  const [tStrengths, setTStrengths] = useState('');
  const [tFocus, setTFocus] = useState('');

  // Notice Streams
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeBroadcastMsg, setNoticeBroadcastMsg] = useState('');

  // Admin Configuration
  const [fullName, setFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('TEACHER');

  // SAFE DECLARED GLOBAL LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserEmail(null);
    setCurrentRole(null);
    window.location.reload(); 
  };

  const fetchFromSecureApi = (url: string, options: RequestInit = {}) => {
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    return fetch(url, { ...options, headers });
  };

  const loadData = () => {
    if (!token) return;
    
    fetchFromSecureApi(`${BACKEND_URL}/api/v1/announcements`)
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error(err));

    fetchFromSecureApi(`${BACKEND_URL}/api/v1/dashboard/metrics?role=${currentRole || 'STUDENT'}`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error(err));

    const targetEmail = currentRole === 'TEACHER' ? selectedRosterStudent : (userEmail || '');

    // --- CONSOLIDATED ADDITIONAL METRICS STREAM DISPATCHER ---
    setMetricsLoading(true);
    fetchFromSecureApi(`${BACKEND_URL}/api/v1/student/dashboard?email=${encodeURIComponent(targetEmail)}`)
      .then(res => res.json())
      .then(data => {
        setAttendanceHistory(data.attendanceRecords || []);
        setTransportInfo(data.transportDetails || null);
        setNutritionHistory(data.nutritionLogs || []);
      })
      .catch(err => console.error("Error connecting to sub-module pipelines:", err))
      .finally(() => setMetricsLoading(false));

    fetchFromSecureApi(`${BACKEND_URL}/api/v1/mission2040/profile?email=${targetEmail}`)
      .then(res => res.json())
      .then((data: MissionProfile) => {
        setProfile(data);
        setTStrengths(data.aiStrengthsSummary || '');
        setTFocus(data.aiActionableFocus || '');
        setTHours(data.learningHoursThisWeek ?? 12);
        setTAssignments(data.pendingAssignmentsCount ?? 5);
        setTBadges(data.badgesEarnedCount ?? 8);
        setTGradeSec(data.currentGradeSection || 'Grade 7 - Section A');
        setTSci(data.scienceProgress ?? 75);
        setTMath(data.mathProgress ?? 60);
        setTEng(data.englishProgress ?? 80);
        setTComp(data.computerProgress ?? 70);
        setTTyping(data.typingSpeedWpm ?? 85);
        setTSpeaking(data.publicSpeakingScore ?? 60);
        setTWriting(data.creativeWritingScore ?? 70);
        setTVolcano(data.volcanoLabStatus || 'Completed');
        setTCruit(data.circuitLabStatus || 'In Progress');
        setTCell(data.cellLabStatus || 'Not Started');
        setTRemarks(data.teacherRemarks || '');
      }).catch(err => console.error(err));
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, currentRole, selectedRosterStudent]);

  const triggerPostgresDatabaseCommit = () => {
    setTeacherSaveMsg('');
    fetchFromSecureApi(`${BACKEND_URL}/api/v1/mission2040/save`, {
      method: 'POST',
      body: JSON.stringify({
        studentEmail: selectedRosterStudent,
        aiStrengthsSummary: tStrengths,
        aiActionableFocus: tFocus,
        learningHoursThisWeek: tHours,
        pendingAssignmentsCount: tAssignments,
        badgesEarnedCount: tBadges,
        currentGradeSection: tGradeSec,
        scienceProgress: tSci,
        mathProgress: tMath,
        englishProgress: tEng,
        computerProgress: tComp,
        typingSpeedWpm: tTyping,
        publicSpeakingScore: tSpeaking,
        creativeWritingScore: tWriting,
        volcanoLabStatus: tVolcano,
        circuitLabStatus: tCircuit,
        cellLabStatus: tCell,
        teacherRemarks: tRemarks
      })
    }).then(res => {
      if (res.ok) {
        setTeacherSaveMsg('Database Sync Completed Successfully!');
        setTimeout(() => setTeacherSaveMsg(''), 4000);
        loadData();
      }
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (data.role !== selectedLoginRole) {
          setAuthError(`Access Denied: Workspace assignment mismatch.`);
        } else {
          localStorage.setItem('mgmt_portal_token', data.token);
          localStorage.setItem('mgmt_portal_email', data.email);
          localStorage.setItem('mgmt_portal_role', data.role);
          setToken(data.token); setUserEmail(data.email); setCurrentRole(data.role);
          setActiveTab('dashboard');
          setCurrentView('DASHBOARD');
        }
      } else setAuthError('Invalid credentials verification mismatch.');
      setAuthLoading(false);
    }).catch(() => { setAuthError('Connection failed.'); setAuthLoading(false); });
  };

  const handlePostNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeBroadcastMsg('');
    fetchFromSecureApi(`${BACKEND_URL}/api/v1/announcements`, {
      method: 'POST',
      body: JSON.stringify({ title: noticeTitle, content: noticeContent })
    }).then(res => {
      if (res.ok) {
        setNoticeBroadcastMsg('Notice posted live!');
        setNoticeTitle(''); setNoticeContent('');
        loadData();
        setTimeout(() => setNoticeBroadcastMsg(''), 3000);
      }
    });
  };

  const handleAdminFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage({ text: '', isError: false });
    fetchFromSecureApi(`${BACKEND_URL}/api/v1/admin/users`, {
      method: 'POST',
      body: JSON.stringify({ fullName, email: adminEmail, password: userPassword, role: userRole, active: true })
    }).then(res => {
      if (res.ok) {
        setFormMessage({ text: 'User provisioned successfully.', isError: false });
        setFullName(''); setAdminEmail(''); setUserPassword('');
      } else setFormMessage({ text: 'Provisioning error.', isError: true });
    });
  };

  if (!token || !currentRole) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6 antialiased font-sans">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md"><Lock size={22} /></div>
            <h2 className="text-xl font-black text-slate-900 mt-2">Meru Gateway Workspace</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['ADMIN', 'TEACHER', 'STUDENT'] as SystemRole[]).map((r) => (
              <button key={r} type="button" onClick={() => { setSelectedLoginRole(r); setAuthError(''); }} className={`p-3 rounded-xl border font-bold text-xs cursor-pointer transition ${selectedLoginRole === r ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/10' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {r === 'STUDENT' ? 'Student/Parent' : r}
              </button>
            ))}
          </div>
          {authError && <div className="p-3 bg-red-50 text-red-800 border rounded-lg text-xs font-semibold text-center">⚠️ {authError}</div>}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2 border-t">
            <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Portal Account Email" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-indigo-500 shadow-inner" />
            <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Verification Password" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-indigo-500 shadow-inner" />
            <button type="submit" className="w-full bg-indigo-600 text-white text-xs py-3 rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition">Secure Sign-In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4F7FE] text-slate-800 antialiased font-sans">
      
      {/* SIDEBAR NAVIGATION CONTROL */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 overflow-y-auto max-h-screen">
        <div className="p-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">M</div>
            <div>
              <h1 className="text-xs font-black text-indigo-950 tracking-wider">MERU MIS</h1>
              <p className="text-[10px] font-bold text-slate-400">INTERNATIONAL SCHOOL</p>
            </div>
          </div>
          
          <nav className="space-y-0.5">
            <button 
              onClick={() => { setActiveTab('dashboard'); setCurrentView('DASHBOARD'); }} 
              className={`w-full text-left text-[11px] font-bold px-3 py-2.5 rounded-xl flex items-center gap-3 border-none cursor-pointer transition ${activeTab === 'dashboard' && currentView === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}
            ><LayoutDashboard size={15}/> Dashboard</button>
            
            {(currentRole === 'STUDENT' || currentRole === 'TEACHER') && (
              <>
                {[
                  { view: 'CLASSES', label: 'My Classes', icon: BookOpen },
                  { view: 'RESOURCES', label: 'Class Resources', icon: FolderOpen },
                  { view: 'ASSIGNMENTS', label: 'Assignments', icon: ClipboardList },
                  // --- NAV SUB-VIEWS INJECTED HERE ---
                  { view: 'ATTENDANCE', label: 'My Attendance Logs', icon: CheckCircle2 },
                  { view: 'TRANSPORT', label: 'Live Bus & GPS Route', icon: MapPin },
                  { view: 'NUTRITION', label: 'Canteen Nutrition Tracker', icon: Sparkles },
                  // ----------------------------------------
                  { view: 'VIDEOS', label: 'Recorded Classes', icon: Video },
                  { view: 'LABS', label: 'Virtual Experiments', icon: Beaker },
                  { view: 'QUIZZES', label: 'Quizzes & Tests', icon: HelpCircle },
                  { view: 'SKILLS', label: 'Skill Builder', icon: TrendingUp },
                  { view: 'ACHIEVEMENTS', label: 'Achievements', icon: Trophy },
                  { view: 'CALENDAR', label: 'Calendar', icon: Calendar },
                  { view: 'PROFILE', label: 'Profile', icon: User }
                ].map((item) => {
                  const IconComponent = item.icon;
                  // Restrict advanced sub-modules exclusively to student contextual profiles
                  if (['ATTENDANCE', 'TRANSPORT', 'NUTRITION'].includes(item.view) && currentRole !== 'STUDENT') return null;
                  return (
                    <button 
                      key={item.view}
                      onClick={() => { setActiveTab('dashboard'); setCurrentView(item.view as PortalSubView); }}
                      className={`w-full text-left text-[11px] font-bold px-3 py-2.5 rounded-xl flex items-center gap-3 border-none cursor-pointer transition ${activeTab === 'dashboard' && currentView === item.view ? 'bg-indigo-50 text-indigo-600 border-none font-black' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}
                    ><IconComponent size={15}/> {item.label}</button>
                  );
                })}
              </>
            )}

            <button onClick={handleLogout} className="w-full text-left text-[11px] font-bold px-3 py-2.5 rounded-xl flex items-center gap-3 text-red-500 bg-transparent hover:bg-red-50 border-none cursor-pointer mt-4"><LogOut size={15}/> Secure Exit</button>
          </nav>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black border border-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Workspace: {currentRole} CHANNEL // {currentView}</span>
            {currentRole === 'TEACHER' && (
              <div className="flex items-center gap-2 text-xs bg-slate-50 p-1 rounded-lg border">
                <span className="text-[10px] uppercase text-slate-400 font-bold px-1">Target Student:</span>
                <select value={selectedRosterStudent} onChange={(e) => setSelectedRosterStudent(e.target.value)} className="bg-white border text-xs font-bold rounded p-1 cursor-pointer text-slate-800 focus:outline-none">
                  <option value="kiara@meru.edu">Kiara Sharma</option>
                  <option value="sai@meru.edu">Sai Reddy</option>
                  <option value="pranav@meru.edu">Pranav M.</option>
                </select>
                <button onClick={triggerPostgresDatabaseCommit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2.5 py-1 rounded border-none font-bold cursor-pointer flex items-center gap-1 transition"><Save size={12}/> Save Metrics</button>
              </div>
            )}
          </div>
          <div className="text-xs font-black text-slate-600">{userEmail}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#F4F7FE]">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              
              {/* ==================== THE UNIFIED MAIN DASHBOARD GRAPHICAL SCREEN ==================== */}
              {currentView === 'DASHBOARD' && profile && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
                  <div className="lg:col-span-3 space-y-6">
                    
                    {/* HERO HEADER */}
                    <div className="bg-gradient-to-r from-[#312E81] via-[#1E3A8A] to-[#1D4ED8] p-6 rounded-3xl text-white shadow-xl flex justify-between items-center overflow-hidden relative shadow-blue-900/10">
                      <div className="space-y-1 z-10">
                        <h2 className="text-lg font-black tracking-wide flex items-center gap-1">
                          {currentRole === 'TEACHER' ? "Educator Core Interface Console" : "Welcome back, Learner! 👋"}
                        </h2>
                        <p className="text-xs text-blue-200 font-medium">
                          {currentRole === 'TEACHER' ? "Directly modify cards below. Click 'Save Metrics' at top header to sync." : "Let's learn, explore and grow together in our active portal workspace."}
                        </p>
                        {currentRole === 'TEACHER' ? (
                          <div className="mt-3 flex items-center gap-1 bg-white/10 px-3 py-1 rounded-md text-xs font-bold w-fit border border-white/20">
                            <span>Form Track Tag:</span>
                            <input type="text" value={tGradeSec} onChange={(e) => setTGradeSec(e.target.value)} className="bg-slate-900 text-white font-black p-0.5 text-xs rounded border-none w-36 text-center focus:outline-none" />
                          </div>
                        ) : (
                          <span className="inline-block mt-3 text-[10px] font-black bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">{profile.currentGradeSection}</span>
                        )}
                      </div>
                      <div className="hidden md:block opacity-10 absolute right-4 -bottom-10"><GraduationCap size={160}/></div>
                    </div>

                    {/* FOUR TELEMETRY STRIP CARDS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { title: "My Classes", val: 6, sub: "Click for breakdown", icon: BookOpen, cls: "text-blue-600 bg-blue-50", type: 'CLASSES', setter: null },
                        { title: "Assignments", val: tAssignments, sub: "Click for backlog", icon: ClipboardList, cls: "text-orange-600 bg-orange-50", type: 'ASSIGNMENTS', setter: setTAssignments },
                        { title: "Badges Earned", val: tBadges, sub: "Click for trophy room", icon: Award, cls: "text-amber-600 bg-amber-50", type: 'BADGES', setter: setTBadges },
                        { title: "Learning Hours", val: tHours, sub: "Click for graph split", icon: Clock, cls: "text-purple-600 bg-purple-50", type: 'HOURS', setter: setTHours }
                      ].map((strip, i) => {
                        const Icon = strip.icon;
                        return (
                          <div 
                            key={i} 
                            onClick={() => currentRole === 'STUDENT' && setActiveModal(strip.type as ModalViewType)}
                            className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 ${currentRole === 'STUDENT' ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 transition group transform hover:-translate-y-0.5' : ''}`}
                          >
                            <div className="p-3 rounded-xl bg-slate-50"><Icon size={18} className={strip.cls.split(' ')[0]}/></div>
                            <div>
                              {currentRole === 'TEACHER' && strip.setter ? (
                                <input type="number" value={strip.val} onChange={(e) => strip.setter?.(parseInt(e.target.value) || 0)} className="w-16 p-0.5 text-lg font-black text-slate-800 border rounded text-center focus:outline-none" />
                              ) : (
                                <div className="text-lg font-black text-slate-800 leading-none mb-0.5">{strip.val}</div>
                              )}
                              <div className="text-[11px] font-black text-slate-900 leading-tight mt-1">{strip.title}</div>
                              <p className="text-[9px] text-slate-400 mt-0.5 tracking-wide">{strip.sub}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* ==================== INTERACTIVE SUB-SYSTEM GRAPHICAL METRIC TILES ==================== */}
                    {currentRole === 'STUDENT' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 animate-fade-in">
                        
                        {/* 📅 ATTENDANCE QUICK TILE */}
                        <div 
                          onClick={() => setCurrentView('ATTENDANCE')}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-200 transition group transform hover:-translate-y-0.5 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={20} /></div>
                            <span className="text-[9px] font-black bg-emerald-100/70 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Live Status</span>
                          </div>
                          <div className="mt-4">
                            <h3 className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wide">Attendance Ledger</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {attendanceHistory.length > 0 
                                ? `Tracked ${attendanceHistory.length} core institutional registration logs this week.` 
                                : "View current academic session attendance logs."}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700">
                            <span>Open Attendance Tracker</span>
                            <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* 🚌 TRANSPORT QUICK TILE */}
                        <div 
                          onClick={() => setCurrentView('TRANSPORT')}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-200 transition group transform hover:-translate-y-0.5 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><MapPin size={20} /></div>
                            <span className="text-[9px] font-black bg-blue-100/70 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider">GPS Sync</span>
                          </div>
                          <div className="mt-4">
                            <h3 className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wide">Smart Transit Tracking</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {transportInfo 
                                ? `Fleet ID ${transportInfo.busNumber} assigned to active commute route.` 
                                : "View assigned transit details and coordinates."}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700">
                            <span>Track Live Bus Route</span>
                            <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* 🍎 NUTRITION QUICK TILE */}
                        <div 
                          onClick={() => setCurrentView('NUTRITION')}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-200 transition group transform hover:-translate-y-0.5 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><Sparkles size={20} /></div>
                            <span className="text-[9px] font-black bg-amber-100/70 text-amber-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Diet Log</span>
                          </div>
                          <div className="mt-4">
                            <h3 className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wide">Nutrition Metrics</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {nutritionHistory.length > 0 
                                ? `Registered ${nutritionHistory.length} campus canteen meals recorded today.` 
                                : "Monitor daily metric logs and dietary analysis parameters."}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700">
                            <span>Open Nutrition Portal</span>
                            <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>

                      </div>
                    )}

                    {/* ROW 1: MY CLASSES & ASSIGNED ASSIGNMENTS BLOCK CORES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* SUB BAR PROGRESS INDICATORS */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b pb-2 mb-3"><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">My Classes Progress</h3><span className="text-[10px] text-indigo-500 font-bold cursor-pointer" onClick={() => setCurrentView('CLASSES')}>Modify All</span></div>
                          <div className="space-y-3.5">
                            {[
                              { name: "Science - Grade 7 (Mrs. Priya Sharma)", v: tSci, s: setTSci, color: "bg-emerald-500" },
                              { name: "Mathematics - Grade 7 (Mr. Rohit Verma)", v: tMath, s: setTMath, color: "bg-blue-500" },
                              { name: "English - Grade 7 (Ms. Neha Kapoor)", v: tEng, s: setTEng, color: "bg-pink-500" },
                              { name: "Computer Systems Logic", v: tComp, s: setTComp, color: "bg-purple-500" }
                            ].map((sub, idx) => (
                              <div key={idx} className="space-y-1 bg-slate-50/50 p-2 border rounded-xl">
                                <div className="flex justify-between text-[11px] font-bold text-slate-700"><span>{sub.name}</span><span className="text-indigo-600 font-black">{sub.v}%</span></div>
                                {currentRole === 'TEACHER' ? (
                                  <input type="range" min="0" max="100" value={sub.v} onChange={(e) => sub.s(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
                                ) : (
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner"><div className={`${sub.color} h-2 rounded-full`} style={{ width: `${sub.v}%` }}></div></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('CLASSES')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer tracking-wide transition shadow-md shadow-indigo-600/10">Go to My Classes</button>
                      </div>

                      {/* TASK BACKLOGS LISTS */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="border-b pb-2 flex justify-between items-center mb-2"><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><FileText size={14} className="text-orange-500"/> Assigned Assignments</h3><span className="text-[10px] text-indigo-500 font-bold cursor-pointer" onClick={() => setCurrentView('ASSIGNMENTS')}>Manage All</span></div>
                          <div className="space-y-2.5">
                            {[
                              { title: "Science Cell Worksheet", date: "Due: 28 May", status: "Pending", cls: "text-orange-600 bg-orange-50 border-orange-200" },
                              { title: "Math Equation Problem Set", date: "Due: 29 May", status: "Pending", cls: "text-orange-600 bg-orange-50 border-orange-200" },
                              { title: "English Prose Essay", date: "Due: 30 May", status: "In Progress", cls: "text-blue-600 bg-blue-50 border-blue-200" }
                            ].map((asg, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-bold text-slate-800">
                                <div><h4 className="text-[11px] font-black text-slate-800">{asg.title}</h4><p className="text-[9px] text-slate-400 font-medium">{asg.date}</p></div>
                                <span className={`text-[9px] px-2 rounded font-bold border uppercase ${asg.cls}`}>{asg.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('ASSIGNMENTS')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer tracking-wide transition shadow-md shadow-indigo-600/10">View All Assignments</button>
                      </div>
                    </div>

                    {/* ROW 2: RECORDED VIDEOS & SANDBOX LAB CONTROLLERS DROPDOWNS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* VIDEOS ARCHIVE BLOCK */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="border-b pb-2 flex justify-between items-center mb-2"><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><Video size={14} className="text-indigo-600"/> Recorded Classes</h3><span className="text-[10px] text-indigo-500 font-bold">Archives</span></div>
                          <div className="space-y-2.5">
                            {[
                              { title: "Science - Photosynthesis Cycle", date: "24 May 2026", duration: "45 min" },
                              { title: "Math - Linear Algebra Basics", date: "22 May 2026", duration: "50 min" },
                              { title: "English - Narrative Story Writing", date: "20 May 2026", duration: "35 min" }
                            ].map((video, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-center">
                                <div><h4 className="text-[11px] font-black text-slate-800">{video.title}</h4><p className="text-[9px] text-slate-400 font-medium">{video.date} • {video.duration}</p></div>
                                <button type="button" className="text-[10px] bg-white border px-2 py-0.5 rounded-md font-bold text-indigo-600 shadow-sm cursor-pointer">Watch</button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('VIDEOS')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer tracking-wide transition shadow-md shadow-indigo-600/10">Watch Recordings</button>
                      </div>

                      {/* VIRTUAL EXPERIMENTS ASSESSMENTS DROPDOWNS */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="border-b pb-2 flex justify-between items-center mb-2"><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><Beaker size={14} className="text-indigo-600"/> Sandbox Virtual Experiments</h3><span className="text-[10px] text-indigo-500 font-bold cursor-pointer" onClick={() => setCurrentView('LABS')}>Modify All</span></div>
                          <div className="space-y-3 text-xs">
                            {[
                              { label: "Volcano Eruption Analytics Lab", val: tVolcano, setter: setTVolcano },
                              { label: "Electric Circuit Resistor Telemetry", val: tCircuit, setter: setTCruit },
                              { label: "Plant Cell Molecular Genetic Engine", val: tCell, setter: setTCell }
                            ].map((lab, i) => (
                              <div key={i} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-center shadow-inner font-bold text-slate-800">
                                <span className="truncate max-w-[160px]">{lab.label}</span>
                                {currentRole === 'TEACHER' ? (
                                  <select value={lab.val} onChange={(e) => lab.setter(e.target.value)} className="bg-white border rounded text-[11px] font-black p-0.5 text-indigo-700 cursor-pointer focus:outline-none shadow-sm">
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                ) : (
                                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">{lab.val}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('LABS')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer tracking-wide transition shadow-md shadow-indigo-600/10">Explore Experiments</button>
                      </div>
                    </div>

                    {/* ROW 3: SKILL BUILDER PROGRESS SLIDERS & TESTS DATA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* SKILL BUILDER FRAMEWORK OVERRIDES */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b pb-2 mb-2"><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={14} className="text-indigo-600"/> Skill Builder</h3><span className="text-[10px] text-indigo-500 font-bold cursor-pointer" onClick={() => setCurrentView('SKILLS')}>Sliders</span></div>
                          <div className="space-y-3.5 text-xs">
                            {[
                              { label: "Typing Mastery Speed (WPM)", val: tTyping, setter: setTTyping, min: 20, max: 140 },
                              { label: "Public Speaking Confidence %", val: tSpeaking, setter: setTSpeaking, min: 0, max: 100 },
                              { label: "Creative Logic Writing %", val: tWriting, setter: setTWriting, min: 0, max: 100 }
                            ].map((skill, idx) => (
                              <div key={idx} className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl shadow-inner">
                                <div className="flex justify-between font-bold text-slate-700 mb-1"><span>{skill.label}</span><span className="text-indigo-600 font-black">{skill.val}</span></div>
                                {currentRole === 'TEACHER' ? (
                                  <input type="range" min={skill.min} max={skill.max} value={skill.val} onChange={(e) => skill.setter(parseInt(e.target.value) || 0)} className="w-full cursor-pointer accent-indigo-600" />
                                ) : (
                                  <div className="text-xs font-black text-slate-800">{skill.val}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('SKILLS')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer tracking-wide transition shadow-md shadow-indigo-600/10">Go to Skill Builder</button>
                      </div>

                      {/* QUIZZES LOG RECORDS SUMMARY */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="border-b pb-2 flex justify-between items-center mb-2"><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><HelpCircle size={14} className="text-purple-600"/> Quizzes & Tests</h3><span className="text-[10px] text-indigo-500 font-bold">Metrics</span></div>
                          <div className="space-y-2.5">
                            {[
                              { title: "Science Core Quiz", date: "24 May 2026", score: "Score: 85%", cls: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                              { title: "Math Algebra Test - Unit 2", date: "22 May 2026", score: "Score: 78%", cls: "text-blue-600 bg-blue-50 border-blue-100" },
                              { title: "English Vocabulary Sprint", date: "19 May 2026", score: "Score: 90%", cls: "text-emerald-600 bg-emerald-50 border-emerald-100" }
                            ].map((quiz, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-center">
                                <div><h4 className="text-[11px] font-black text-slate-800">{quiz.title}</h4><p className="text-[9px] text-slate-400 font-medium">{quiz.date}</p></div>
                                <span className={`text-[9px] px-2 rounded font-bold border uppercase ${quiz.cls}`}>{quiz.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('QUIZZES')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer tracking-wide transition shadow-md shadow-indigo-600/10">Take a Quiz</button>
                      </div>
                    </div>

                    {/* AI COGNITIVE LOG BLOCKS OVERRIDES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                      <div className="col-span-2 text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><Sparkles size={14} className="text-indigo-600"/> AI Engine Analytical Text Modules Override</div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase">AI Cognitive Strengths Summary</label>
                        {currentRole === 'TEACHER' ? (
                          <textarea value={tStrengths} onChange={(e) => setTStrengths(e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50/30 text-slate-800 focus:outline-none" />
                        ) : (
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">{profile.aiStrengthsSummary}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase">AI Actionable Practice Focus</label>
                        {currentRole === 'TEACHER' ? (
                          <textarea value={tFocus} onChange={(e) => setTFocus(e.target.value)} rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50/30 text-slate-800 focus:outline-none" />
                        ) : (
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">{profile.aiActionableFocus}</p>
                        )}
                      </div>
                    </div>

                    {/* HUMAN REMARKS NOTES LOG BLOCK */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-r from-white to-slate-50/40">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageSquare size={14} className="text-blue-600"/> Educator Advisory Guidance Notes</h3>
                      {currentRole === 'TEACHER' ? (
                        <textarea value={tRemarks} onChange={(e) => setTRemarks(e.target.value)} rows={2} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium bg-white text-slate-800 focus:outline-none shadow-inner" placeholder="Type advisory guidance metrics update parameter stream..." />
                      ) : (
                        <p className="text-xs italic text-slate-600 leading-relaxed font-medium bg-white p-4 border rounded-xl border-dashed">"{profile.teacherRemarks}"</p>
                      )}
                      <div className="flex items-center gap-2 mt-3"><div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">B</div><div><h5 className="text-[11px] font-black text-slate-800 leading-none">Mrs. Bharathi</h5><p className="text-[9px] text-slate-400 font-semibold mt-0.5">Primary Classroom Coordinator</p></div></div>
                    </div>

                    {/* TRACK YOUR USAGE STATS BLOCK FOOTER */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Sliders size={14} className="text-indigo-600"/> Track Your Usage</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { title: "Login Streak", val: "7 Days", sub: "Continuous Streak", icon: Flame, color: "text-red-500 bg-red-50" },
                          { title: "Time Spent", val: `${tHours} Hrs`, sub: "Active Sessions Log", icon: Clock, color: "text-indigo-500 bg-indigo-50" },
                          { title: "Resources Viewed", val: "48 Assets", sub: "Library Content Load", icon: Eye, color: "text-blue-500 bg-blue-50" },
                          { title: "Assignments Completed", val: "18 Modules", sub: "Syllabus Synced", icon: CheckSquare, color: "text-emerald-500 bg-emerald-50" }
                        ].map((usage, idx) => {
                          const UseIcon = usage.icon;
                          return (
                            <div key={idx} className="p-4 border border-slate-50 bg-slate-50/40 rounded-xl flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${usage.color}`}><UseIcon size={15}/></div>
                              <div>
                                <div className="text-xs font-black text-slate-800 leading-none">{usage.val}</div>
                                <div className="text-[10px] font-bold text-slate-500 mt-1">{usage.title}</div>
                                <p className="text-[8px] text-slate-400 mt-0.5 leading-none">{usage.sub}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {currentRole === 'TEACHER' && (
                      <div className="pt-2"><button type="button" onClick={() => triggerPostgresDatabaseCommit()} className="w-full bg-emerald-600 hover:bg-emerald-700 border-none font-black text-xs text-white py-3.5 rounded-2xl cursor-pointer shadow-lg shadow-emerald-600/10 transition flex items-center justify-center gap-2"><Save size={16}/> Push Full Evaluation Matrix Live to Student Portal</button></div>
                    )}

                  </div>

                  {/* RIGHT PANEL COLUMN STREAMS NOTICE BOARDS */}
                  <div className="space-y-6">
                    {currentRole === 'TEACHER' && (
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-xl space-y-3 border border-indigo-950 shadow-md">
                        <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5"><Megaphone size={14}/> Daily Notice Broadcaster</h4>
                        {noticeBroadcastMsg && <div className="p-2 bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 text-[10px] rounded font-bold">{noticeBroadcastMsg}</div>}
                        <form onSubmit={handlePostNoticeSubmit} className="space-y-2">
                           <input type="text" required value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="Notice Title..." className="w-full p-2 bg-white/10 text-white border border-white/10 text-xs rounded-xl focus:outline-none focus:border-indigo-400 shadow-inner font-medium" />
                           <textarea required value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="Type notice parameters..." rows={3} className="w-full p-2 bg-white/10 text-white border border-white/10 text-xs rounded-xl focus:outline-none focus:border-indigo-400 shadow-inner font-medium resize-none" />
                           <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 border-none font-black text-[11px] text-white py-2.5 rounded-xl cursor-pointer transition shadow shadow-amber-500/10">Publish Notice Block</button>
                        </form>
                      </div>
                    )}

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Megaphone size={14} className="text-orange-500 animate-pulse"/> Daily Notice Board</h3>
                      <div className="space-y-2.5">
                        {announcements.slice(0, 2).map((notice) => (
                          <div key={notice.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1">
                            <div className="flex justify-between items-center"><h4 className="text-[11px] font-black text-slate-900 truncate max-w-[140px]">{notice.title}</h4><span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">By {notice.authorName}</span></div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{notice.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> Upcoming Schedule</h3>
                      <div className="space-y-3">
                        {[
                          { day: "27", mon: "MAY", subject: "Science Laboratory", time: "09:00 AM - 10:00 AM", cls: "border-emerald-500" },
                          { day: "28", mon: "MAY", subject: "Mathematics Analysis", time: "10:15 AM - 11:15 AM", cls: "border-blue-500" },
                          { day: "29", mon: "MAY", subject: "English Comprehension", time: "09:00 AM - 10:00 AM", cls: "border-pink-500" }
                        ].map((sched, idx) => (
                          <div key={idx} className={`p-2.5 border-l-4 bg-slate-50/40 rounded-r-xl flex items-center gap-3 ${sched.cls}`}>
                            <div className="text-center bg-white border px-2 py-1 rounded-lg shrink-0 shadow-sm">
                              <div className="text-xs font-black text-slate-800 leading-none">{sched.day}</div><div className="text-[8px] text-slate-400 font-bold mt-0.5">{sched.mon}</div>
                            </div>
                            <div className="truncate"><h4 className="text-[11px] font-black text-slate-800 leading-tight truncate">{sched.subject}</h4><p className="text-[9px] text-slate-400 font-semibold mt-0.5">{sched.time}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== SCREEN INTERFACE DEDICATED PAGES SUB-VIEWS ROUTERS ==================== */}
              {currentView === 'CLASSES' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <div className="border-b pb-3 flex justify-between items-center"><h3 className="text-sm font-black text-indigo-950 flex items-center gap-2"><BookOpen className="text-indigo-600"/> My Classes Progress Management</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Science Core Subsystem Mastery", progress: tSci, setter: setTSci, room: "Lab Block A" },
                      { title: "Advanced Architecture Calculus Matrix", progress: tMath, setter: setTMath, room: "Grid Hall B" },
                      { title: "Synthesized English Compositions Analytics", progress: tEng, setter: setTEng, room: "Seminar Suite 3" },
                      { title: "Computational Intelligence Neural Logic", progress: tComp, setter: setTComp, room: "Virtual Cloud Portal" }
                    ].map((c, i) => (
                      <div key={i} className="p-4 bg-slate-50 border rounded-2xl space-y-3 shadow-inner">
                        <div className="flex justify-between items-start"><div><h4 className="text-xs font-black text-slate-900">{c.title}</h4><p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{c.room}</p></div><span className="text-xs font-black text-indigo-600">{c.progress}%</span></div>
                        <input type="range" min="0" max="100" value={c.progress} onChange={(e) => c.setter(parseInt(e.target.value) || 0)} className="w-full accent-indigo-600 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === 'ASSIGNMENTS' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <div className="border-b pb-3 flex justify-between items-center"><h3 className="text-sm font-black text-indigo-950 flex items-center gap-2"><ClipboardList className="text-indigo-600"/> Active Assignments Pipeline Allocation</h3><div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span>Target Pending Tasks:</span><input type="number" value={tAssignments} onChange={(e) => setTAssignments(parseInt(e.target.value) || 0)} className="w-12 p-0.5 border text-center rounded focus:outline-none font-bold text-slate-800" /></div></div>
                  <div className="space-y-2.5">
                    {["Science Cell Structure Mapping Matrix", "Algorithmic Limit Analysis Validation Set", "Reflective Synthesis Essay: Core Sustainability"].map((item, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center shadow-inner">
                        <span className="text-xs font-bold text-slate-800">{item}</span>
                        <span className="text-[9px] bg-white border px-3 py-1 rounded-xl text-orange-600 font-bold uppercase tracking-wider">Distributed Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. 📅 ATTENDANCE JOURNAL VIEWPORT SUB-VIEW */}
              {currentView === 'ATTENDANCE' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <div className="border-b pb-3"><h3 className="text-sm font-black text-indigo-950 flex items-center gap-2"><CheckCircle2 className="text-indigo-600"/> Personal Attendance Log Ledger</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attendanceHistory.length > 0 ? (
                      attendanceHistory.map((item, idx) => (
                        <div key={item.id || idx} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center shadow-inner">
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{item.date}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">{item.remarks || "Standard academic registration index log"}</p>
                          </div>
                          <span className={`text-[10px] px-3 py-1 rounded-xl font-bold border ${
                            item.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'LATE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>{item.status}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 p-4 col-span-2 text-center font-medium">No active entry history tracks synchronized from database engine.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 2. 🚌 TRANSPORT SUPERVISOR VIEWPORT SUB-VIEW */}
              {currentView === 'TRANSPORT' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <div className="border-b pb-3"><h3 className="text-sm font-black text-indigo-950 flex items-center gap-2"><MapPin className="text-indigo-600"/> Real-time Smart Logistics Fleet Telemetry</h3></div>
                  {transportInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-5 border rounded-2xl space-y-3 shadow-inner">
                        <span className="text-[9px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Bus Route Profiler</span>
                        <h4 className="text-lg font-black text-slate-800 mt-2">{transportInfo.busNumber}</h4>
                        <p className="text-xs font-semibold text-slate-500">{transportInfo.routeName}</p>
                      </div>
                      <div className="bg-slate-50 p-5 border rounded-2xl space-y-2 shadow-inner text-xs font-bold text-slate-700">
                        <span className="text-[9px] bg-slate-200 text-slate-600 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Personnel Contacts</span>
                        <p className="mt-3"><strong>Assigned Driver:</strong> {transportInfo.driverName}</p>
                        <p><strong>Emergency Comm Base:</strong> {transportInfo.driverPhone}</p>
                      </div>
                      <div className="bg-slate-50 p-5 border border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                        <span className="text-[10px] font-black text-indigo-600 tracking-wider uppercase flex items-center gap-1">📍 LIVE TELEMETRY ANCHOR</span>
                        <div className="font-mono text-xs text-slate-800 bg-white border font-black px-3 py-1.5 rounded-xl shadow-sm my-2">{transportInfo.latitude}, {transportInfo.longitude}</div>
                        <p className="text-[9px] text-slate-400 font-bold">Synchronized Ping: {new Date(transportInfo.lastUpdated).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-6 text-center font-medium">Your profile context is currently configured as a self-commuting entity.</p>
                  )}
                </div>
              )}

              {/* 3. 🍎 NUTRITION LOG ANALYSIS VIEWPORT SUB-VIEW */}
              {currentView === 'NUTRITION' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <div className="border-b pb-3"><h3 className="text-sm font-black text-indigo-950 flex items-center gap-2"><Sparkles className="text-indigo-600"/> Campus Canteen Caloric Management System</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nutritionHistory.length > 0 ? (
                      nutritionHistory.map((meal, index) => (
                        <div key={index} className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl space-y-2 hover:shadow-inner transition">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase bg-orange-200 text-orange-800 px-2 py-0.5 rounded">{meal.mealType}</span>
                            <span className="text-[10px] font-bold text-slate-400">{meal.date}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800">{meal.menuItems}</h4>
                          <div className="text-[11px] font-bold text-slate-500 border-t pt-2 flex justify-between items-center">
                            <span>Metabolic Intake:</span>
                            <strong className="text-orange-700">{meal.calories} kcal</strong>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 p-4 col-span-2 text-center font-medium">No dietary intake allocations loaded for this session context.</p>
                    )}
                  </div>
                </div>
              )}

              {currentView === 'LABS' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2 border-b pb-3"><Beaker className="text-indigo-600"/> Sandbox Laboratories Status Overrides</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Volcano Eruption Analytics Lab Assessment", val: tVolcano, setter: setTVolcano },
                      { label: "Electric Circuit Resistor Telemetry Assessment", val: tCircuit, setter: setTCruit },
                      { label: "Plant Cell Molecular Genetic Engine Mapping", val: tCell, setter: setTCell }
                    ].map((lab, i) => (
                      <div key={i} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center shadow-inner">
                        <span className="text-xs font-bold text-slate-800">{lab.label}</span>
                        <select value={lab.val} onChange={(e) => lab.setter(e.target.value)} className="bg-white border rounded text-xs font-black p-1 text-indigo-600 cursor-pointer focus:outline-none shadow-sm"><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === 'SKILLS' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-4">
                  <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2 border-b pb-3"><TrendingUp className="text-indigo-600"/> Skill Builder Core Sliders</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Typing Mastery Speed (WPM)", val: tTyping, setter: setTTyping, min: 20, max: 140 },
                      { label: "Public Speaking Syndicate Score %", val: tSpeaking, setter: setTSpeaking, min: 0, max: 100 },
                      { label: "Creative Logic Writing Score %", val: tWriting, setter: setTWriting, min: 0, max: 100 }
                    ].map((sk, i) => (
                      <div key={i} className="p-4 bg-slate-50 border rounded-2xl space-y-1.5 shadow-inner">
                        <div className="flex justify-between text-xs font-black text-slate-700"><span>{sk.label}</span><span className="text-indigo-600">{sk.val}</span></div>
                        <input type="range" min={sk.min} max={sk.max} value={sk.val} onChange={(e) => sk.setter(parseInt(e.target.value) || 0)} className="w-full cursor-pointer accent-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentView === 'CALENDAR' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in space-y-5">
                  <div className="border-b pb-3"><h3 className="text-sm font-black text-indigo-950 flex items-center gap-2"><Calendar className="text-indigo-600"/> Academic Events & Holiday Track Calendar</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "Summer Break Vacation", date: "June 01 - June 30", type: "Holiday Block", color: "border-red-500 bg-red-50/20 text-red-900" },
                      { title: "Monsoon Term Re-opening", date: "July 01", type: "Academic Opening", color: "border-emerald-500 bg-emerald-50/20 text-emerald-900" },
                      { title: "Dussehra Cultural Holidays", date: "October 18 - October 26", type: "Festival Holidays", color: "border-amber-500 bg-amber-50/20 text-amber-900" },
                      { title: "Mission 2040 Tech Conclave", date: "November 14", type: "Campus Exhibition", color: "border-blue-500 bg-blue-50/20 text-blue-900" }
                    ].map((cal, idx) => (
                      <div key={idx} className={`p-4 border-l-4 rounded-r-2xl shadow-sm ${cal.color}`}>
                        <span className="text-[9px] uppercase font-black block mb-1 opacity-70">{cal.type}</span>
                        <h4 className="text-xs font-black leading-snug">{cal.title}</h4>
                        <div className="text-[11px] font-bold mt-4 opacity-80 flex items-center gap-1"><Clock size={12}/> {cal.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {['RESOURCES', 'VIDEOS', 'QUIZZES', 'ACHIEVEMENTS', 'PROFILE'].includes(currentView) && (
                <div className="bg-white p-8 rounded-3xl border text-center text-xs font-semibold text-slate-400 shadow-sm animate-fade-in">
                  🍿 {currentView} Reference workspace stream online. Sub-views configurations can be easily tracked within student selection view templates.
                </div>
              )}

            </div>
          ) : (
            /* ==================== ENVIRONMENT ACCOUNT PROVISIONING PANEL FORM SUITE ==================== */
            <div className="animate-fade-in max-w-xl bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="mb-6"><h2 className="text-base font-black text-slate-900 flex items-center gap-2"><PlusCircle className="text-indigo-600" /> Account Provisioning Panel</h2></div>
              {formMessage.text && <div className={`p-4 rounded-xl text-xs font-semibold mb-6 border ${formMessage.isError ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>{formMessage.text}</div>}
              <form onSubmit={handleAdminFormSubmit} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Full Name</label><input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs focus:outline-none" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Account Email Address</label><input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs focus:outline-none" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Initial Access Password</label><input type="password" required value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Define password..." className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs focus:outline-none" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Operational System Role</label><select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs cursor-pointer"><option value="ADMIN">Admin</option><option value="TEACHER">Teacher</option><option value="STUDENT">Student</option></select></div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl border-none cursor-pointer hover:bg-indigo-700 transition shadow-md shadow-indigo-600/10"><Save size={14}/> Commit Account to Database</button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ==================== GLOBAL INTERACTIVE STUDENT GRAPHICAL MODALS ENGINE OVERLAYS ==================== */}
      {activeModal !== 'NONE' && currentRole === 'STUDENT' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col transform transition-all duration-300 scale-100">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  {activeModal === 'CLASSES' && <BookOpen size={18}/>}
                  {activeModal === 'ASSIGNMENTS' && <ClipboardList size={18}/>}
                  {activeModal === 'BADGES' && <Award size={18}/>}
                  {activeModal === 'HOURS' && <Clock size={18}/>}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    {activeModal === 'CLASSES' && 'Subject Credits & Syllabus Matrix'}
                    {activeModal === 'ASSIGNMENTS' && 'Active Task Backlog & Requirements'}
                    {activeModal === 'BADGES' && 'Verified Future Skills Medal Trophy Room'}
                    {activeModal === 'HOURS' && 'Weekly Interactive Time Allocation Analysis'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Continuous Telemetry Streams</p>
                </div>
              </div>
              <button onClick={() => setActiveModal('NONE')} className="p-1.5 rounded-xl hover:bg-slate-200 transition text-slate-400 hover:text-slate-700 border-none bg-transparent cursor-pointer"><X size={18}/></button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {activeModal === 'CLASSES' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Multi-disciplinary curriculum modules completed by Kiara Sharma mapping targeted 2040 research objectives.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { subject: "Advanced Core Science", credits: "4.0 Credits Earned", lab: "Volcano Analytics Lab", status: "Verified" },
                      { subject: "Abstract Systems Calculus", credits: "3.5 Credits Earned", lab: "Edge Case Limit Solver", status: "Verified" },
                      { subject: "Global Linguistics & Prose", credits: "3.0 Credits Earned", lab: "Narrative Synthesis Studio", status: "Verified" },
                      { subject: "Computational Neural Logic", credits: "4.5 Credits Earned", lab: "Sandbox Array Verifier", status: "Active Track" }
                    ].map((c, i) => (
                      <div key={i} className="p-4 bg-slate-50 border rounded-2xl flex flex-col justify-between hover:border-indigo-300 transition">
                        <div>
                          <div className="flex justify-between items-center mb-1"><h4 className="text-xs font-black text-slate-900">{c.subject}</h4><span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded uppercase">{c.status}</span></div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{c.credits}</p>
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 border-t pt-2 mt-3 flex justify-between items-center"><span>Sandbox: {c.lab}</span><ExternalLink size={10} className="text-slate-400"/></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'ASSIGNMENTS' && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs font-semibold text-orange-800 flex items-center gap-2">⚠️ Warning: {profile?.pendingAssignmentsCount || 5} instructional modules require verification templates before Friday's lock.</div>
                  <div className="space-y-2.5">
                    {[
                      { task: "Constructive Tectonic Activity Research Report", sub: "Science - Due tomorrow", diff: "Complex Architecture" },
                      { task: "Algorithmic Limit Analysis Validation Set", sub: "Math - Due 29 May", diff: "Intermediate Logic" },
                      { task: "Reflective Synthesis Essay: Core Sustainability", sub: "English - Due 30 May", diff: "Foundational Model" }
                    ].map((t, i) => (
                      <div key={i} className="p-3.5 bg-white border border-slate-100 shadow-sm rounded-xl flex justify-between items-center hover:border-orange-200 transition">
                        <div><h4 className="text-xs font-black text-slate-800">{t.task}</h4><p className="text-[10px] text-slate-400 font-semibold mt-0.5">{t.sub}</p></div>
                        <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t.diff}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'BADGES' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">Digital cryptographic credential tokens issued by Meru International following milestone sandbox verification timelines.</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "GenAI Prompt Master", desc: "Optimized complex structural queries.", color: "from-purple-500 to-indigo-500", badge: "🔮" },
                      { name: "Syndicate Captain", desc: "Led cohort group to optimum efficiency.", color: "from-blue-500 to-cyan-500", badge: "🎖️" },
                      { name: "Algorithmic Pioneer", desc: "Completed all sandbox edge-cases.", color: "from-emerald-500 to-teal-500", badge: "⚡" },
                      { name: "Public Speaking Ace", desc: "Delivered flawless syndicate pitches.", color: "from-pink-500 to-rose-500", badge: "🗣️" },
                      { name: "Virtual Chemist", desc: "Constructed optimum volcano compound layers.", color: "from-amber-500 to-orange-500", badge: "🧪" }
                    ].slice(0, profile?.badgesEarnedCount || 5).map((b, i) => (
                      <div key={i} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border rounded-2xl flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition duration-200">{b.badge}</div>
                        <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-1">{b.name}</h4>
                        <p className="text-[9px] text-slate-400 font-medium leading-tight">{b.desc}</p>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${b.color}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'HOURS' && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-500 font-medium">Real-time breakdown of Kiara's accumulated **{profile?.learningHoursThisWeek || 12.5} total tracked hours** calculated across campus workspaces this week.</p>
                  <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border shadow-inner">
                    {[
                      { channel: "Virtual Simulation Sandbox Labs", hrs: "4.5 Hrs Allocated", pct: "w-[45%]", barColor: "bg-purple-600" },
                      { channel: "Self-Paced Autonomous Coding Sprint", hrs: "3.5 Hrs Allocated", pct: "w-[35%]", barColor: "bg-blue-600" },
                      { channel: "Syndicate Round-Table Collaborative Briefings", hrs: "2.5 Hrs Allocated", pct: "w-[25%]", barColor: "bg-emerald-600" },
                      { channel: "Adaptive Literacy Testing Pipelines", hrs: "2.0 Hrs Allocated", pct: "w-[20%]", barColor: "bg-pink-600" }
                    ].map((h, i) => (
                      <div key={i} className="space-y-1 bg-white p-3 border rounded-xl shadow-sm">
                        <div className="flex justify-between text-xs font-black text-slate-700"><span>{h.channel}</span><span className="text-slate-500 font-bold">{h.hrs}</span></div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`${h.barColor} h-2 rounded-full ${h.pct} transition-all duration-700`}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t flex justify-end">
              <button type="button" onClick={() => setActiveModal('NONE')} className="bg-indigo-600 text-white font-bold text-xs px-5 py-2 rounded-xl border-none cursor-pointer hover:bg-indigo-700 transition shadow">Close Analytics Stream</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}