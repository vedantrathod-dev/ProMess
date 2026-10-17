import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Settings,
  Shield,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Utensils,
  LogOut
} from 'lucide-react';
import {
  getStore,
  subscribeToStore,
  reviewLeaveRequest,
  recordPayment,
  reissuePass,
  renewSubscription,
  getAllStudentsDues,
  getStudentDueDetails,
  updateMenu,
  updateSettings,
  generateAttendanceReportCSV,
  generateCollectionsReportCSV,
  getTodayDateString
} from '../services/store';

export function AdminPortal({ currentUser, onNavigate, onLogout }) {
  const [store, setStore] = useState(getStore());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'attendance' | 'payments' | 'leave' | 'menu' | 'reports' | 'settings'

  // Student Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDietFilter, setStudentDietFilter] = useState('all');

  // Attendance Filter States
  const [attDate, setAttDate] = useState(getTodayDateString());
  const [attSession, setAttSession] = useState('lunch');

  // Payment Recording & Dues State
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmt, setPayAmt] = useState('');
  const [payMode, setPayMode] = useState('UPI (Google Pay)');
  const [payRef, setPayRef] = useState('');
  const [payFeedback, setPayFeedback] = useState('');
  const [duesFilter, setDuesFilter] = useState('all'); // 'all' | 'partial' | 'unpaid' | 'cleared'
  const [duesSearch, setDuesSearch] = useState('');

  // Menu Editor States
  const [menuSession, setMenuSession] = useState('lunch');
  const [menuTitle, setMenuTitle] = useState('');
  const [menuItemsText, setMenuItemsText] = useState('');
  const [menuNonVeg, setMenuNonVeg] = useState('');
  const [menuHours, setMenuHours] = useState('');
  const [menuSuccess, setMenuSuccess] = useState('');

  // Settings State
  const [settingsState, setSettingsState] = useState(store.settings);

  useEffect(() => {
    return subscribeToStore((newStore) => {
      setStore(newStore);
      setSettingsState(newStore.settings);
    });
  }, []);

  // Sync menu state when session toggled
  useEffect(() => {
    const m = store.menus.find(item => item.meal_session === menuSession);
    if (m) {
      setMenuTitle(m.title);
      setMenuItemsText(m.items.join('\n'));
      setMenuNonVeg(m.non_veg_addon || '');
      setMenuHours(m.serving_hours || '');
    }
  }, [menuSession, store.menus]);

  const todayStr = getTodayDateString();

  // Dashboard KPI Computations
  const totalStudents = store.users.filter(u => u.role === 'student').length;
  const activeSubs = store.subscriptions.filter(s => s.status === 'active');
  const vegSubs = activeSubs.filter(s => s.dietary_type_snapshot === 'veg').length;
  const nonVegSubs = activeSubs.filter(s => s.dietary_type_snapshot === 'non_veg').length;

  const todayLunchScans = store.attendance.filter(
    a => a.service_date === todayStr && a.meal_session === 'lunch'
  ).length;

  const todayDinnerScans = store.attendance.filter(
    a => a.service_date === todayStr && a.meal_session === 'dinner'
  ).length;

  const totalCollections = store.payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPlanValue = store.subscriptions.reduce((sum, s) => sum + (s.price_snapshot || 0), 0);
  const totalOutstanding = Math.max(0, totalPlanValue - totalCollections);

  // Expiring Soon (<= 5 days remaining or expired)
  const expiringStudents = store.users
    .filter(u => u.role === 'student')
    .map(student => {
      const sub = store.subscriptions.find(s => s.student_id === student.id && s.status === 'active') ||
                  store.subscriptions.find(s => s.student_id === student.id);
      if (!sub || !sub.valid_until) return null;
      const validUntilDate = new Date(sub.valid_until);
      const nowDate = new Date(todayStr);
      const daysLeft = Math.ceil((validUntilDate - nowDate) / (1000 * 60 * 60 * 24));
      return {
        student,
        subscription: sub,
        daysLeft
      };
    })
    .filter(item => item !== null && item.daysLeft <= 5)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Student Dues & Partial Payments Engine
  const allStudentDues = getAllStudentsDues();
  const studentsWithDues = allStudentDues.filter(d => d.dueAmount > 0);
  const partialPaidStudents = studentsWithDues.filter(d => d.totalPaid > 0);
  const unpaidStudents = studentsWithDues.filter(d => d.totalPaid === 0);

  const handleCollectDue = (studentId, dueAmt) => {
    setPayStudentId(studentId);
    setPayAmt(dueAmt ? String(dueAmt) : '');
    setPayRef('UTR-' + Date.now().toString().slice(-6));
    setPayFeedback('');
    setActiveTab('payments');
    setTimeout(() => {
      const el = document.getElementById('record-payment-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRenewStudent = (studentId) => {
    const res = renewSubscription(studentId, 30, currentUser?.full_name || 'Chief Warden');
    if (res.success) {
      alert(res.message);
    }
  };

  // Student Filtering
  const filteredStudents = store.users.filter(u => {
    if (u.role !== 'student') return false;
    const matchQuery =
      u.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.student_code?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.mobile?.includes(studentSearch);

    if (!matchQuery) return false;

    if (studentDietFilter !== 'all') {
      const sub = store.subscriptions.find(s => s.student_id === u.id && s.status === 'active');
      if (sub?.dietary_type_snapshot !== studentDietFilter) return false;
    }
    return true;
  });

  // Attendance Filtering
  const filteredAttendance = store.attendance.filter(
    a => a.service_date === attDate && a.meal_session === attSession
  );

  // Handle CSV Download helper
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Record Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    setPayFeedback('');
    if (!payStudentId || !payAmt) return;

    const res = recordPayment({
      student_id: payStudentId,
      amount: payAmt,
      method: payMode,
      reference: payRef,
      recorded_by: currentUser?.full_name || 'Chief Warden'
    });

    if (res.success) {
      setPayFeedback(`Payment recorded! Issued Receipt: ${res.receipt.receipt_number}`);
      setPayAmt('');
      setPayRef('');
    } else {
      setPayFeedback(`Error: ${res.message}`);
    }
  };

  // Leave Review Action
  const handleReviewLeave = (leaveId, action) => {
    const res = reviewLeaveRequest(leaveId, action, currentUser?.id || 'usr_admin_1');
    alert(res.message);
  };

  // Reissue Pass Action
  const handleReissuePass = (studentId) => {
    if (confirm('Reissue dining pass for this student? Previous pass token will be revoked immediately.')) {
      reissuePass(studentId, currentUser?.id || 'usr_admin_1');
      alert('New cryptographically secure dining pass issued!');
    }
  };

  // Save Menu
  const handleSaveMenu = (e) => {
    e.preventDefault();
    const items = menuItemsText.split('\n').map(s => s.trim()).filter(Boolean);
    updateMenu(menuSession, menuTitle, items, menuNonVeg, menuHours);
    setMenuSuccess('Menu updated and published to public landing page & student portal!');
    setTimeout(() => setMenuSuccess(''), 4000);
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(settingsState, currentUser?.id || 'usr_admin_1');
    alert('Campus dining operational settings saved successfully!');
  };

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '92vh', color: 'var(--color-ink-950)', paddingBottom: '60px' }}>
      
      {/* Admin Top Header */}
      <div style={{
        backgroundColor: 'var(--color-maroon-950)',
        color: 'var(--color-cream-50)',
        borderBottom: '2px solid var(--color-ink-950)',
        padding: '20px 0'
      }}>
        <div className="container admin-header-flex" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-red">MESS MASTER ADMINISTRATION</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-sand-200)' }}>• {store.settings.campus_name}</span>
            </div>
            <h1 className="display-sub" style={{ color: 'var(--color-cream-50)' }}>
              ADMIN & OPERATIONS WORKSPACE
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-sand-200)' }}>
              LOGGED IN AS: <strong>{currentUser?.full_name}</strong> ({currentUser?.role?.toUpperCase()})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigate('counter')}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--color-red-600)' }}
            >
              LAUNCH COUNTER SCANNER
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'var(--color-sand-200)', color: 'var(--color-cream-50)' }}
            >
              WEBSITE
            </button>
            <button
              onClick={onLogout}
              className="btn btn-dark btn-sm"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Bar */}
      <div style={{
        backgroundColor: 'var(--color-cream-100)',
        borderBottom: '1px solid var(--color-line)'
      }}>
        <div className="container portal-tabs-container" style={{ display: 'flex', overflowX: 'auto', gap: '6px', padding: '8px 20px' }}>
          {[
            { id: 'overview', label: 'DASHBOARD', icon: <FileText size={16} /> },
            { id: 'expiring', label: `EXPIRING SOON (${expiringStudents.length})`, icon: <AlertCircle size={16} color="#C5090D" /> },
            { id: 'students', label: 'STUDENTS & PASSES', icon: <Users size={16} /> },
            { id: 'attendance', label: 'ATTENDANCE LOG', icon: <Calendar size={16} /> },
            { id: 'payments', label: `PAYMENTS & DUES (${studentsWithDues.length})`, icon: <CreditCard size={16} /> },
            { id: 'leave', label: 'LEAVE APPROVALS', icon: <Clock size={16} /> },
            { id: 'menu', label: 'DAILY MENU', icon: <Utensils size={16} /> },
            { id: 'reports', label: 'REPORTS & AUDIT', icon: <Download size={16} /> },
            { id: 'settings', label: 'SETTINGS', icon: <Settings size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.88rem',
                letterSpacing: '0.04em',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--color-maroon-950)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-cream-50)' : 'var(--color-ink-700)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Admin Workspace Container */}
      <div className="container" style={{ marginTop: '28px' }}>
        
        {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div>
            
            {/* KPI Metrics Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              
              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-700)' }}>
                  TOTAL ENROLLED STUDENTS
                </div>
                <div className="tabular-nums font-display" style={{ fontSize: '2.4rem', color: 'var(--color-maroon-950)', margin: '4px 0' }}>
                  {totalStudents}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>
                  {activeSubs.length} active subscriptions
                </div>
              </div>

              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-700)' }}>
                  VEG / NON-VEG STUDENTS
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
                  <span className="tabular-nums font-display" style={{ fontSize: '2rem', color: '#2E7D32' }}>
                    {vegSubs} Veg
                  </span>
                  <span style={{ color: 'var(--color-ink-500)' }}>/</span>
                  <span className="tabular-nums font-display" style={{ fontSize: '2rem', color: 'var(--color-red-600)' }}>
                    {nonVegSubs} Non-Veg
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>
                  Active dietary distribution
                </div>
              </div>

              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-700)' }}>
                  TODAY'S LUNCH CHECK-INS
                </div>
                <div className="tabular-nums font-display" style={{ fontSize: '2.4rem', color: 'var(--color-warning)', margin: '4px 0' }}>
                  {todayLunchScans}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>
                  Verified at dining counter
                </div>
              </div>

              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-700)' }}>
                  TODAY'S DINNER CHECK-INS
                </div>
                <div className="tabular-nums font-display" style={{ fontSize: '2.4rem', color: 'var(--color-red-600)', margin: '4px 0' }}>
                  {todayDinnerScans}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>
                  Evening service scans
                </div>
              </div>

              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-700)' }}>
                  CONFIRMED REVENUE RECEIVED
                </div>
                <div className="tabular-nums font-display" style={{ fontSize: '2.2rem', color: 'var(--color-success)', margin: '4px 0' }}>
                  ₹{totalCollections.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>
                  Outstanding dues: ₹{totalOutstanding.toLocaleString('en-IN')}
                </div>
              </div>

            </div>

            {/* Expiring Soon (≤ 5 Days) Section Requested by User */}
            <div className="card-cream" style={{
              padding: '28px',
              marginBottom: '28px',
              border: '2px solid var(--color-red-600)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-nonveg" style={{ fontSize: '0.78rem' }}>
                      ⚠️ RENEWAL ALERT SYSTEM
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-700)' }}>
                      • Threshold: 5 Days or less remaining
                    </span>
                  </div>
                  <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                    STUDENTS WITH MESS EXPIRING IN ≤ 5 DAYS
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: 'var(--color-red-600)',
                    backgroundColor: 'rgba(197, 9, 13, 0.08)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(197, 9, 13, 0.2)'
                  }}>
                    {expiringStudents.length} Students Requiring Renewal
                  </span>
                </div>
              </div>

              {expiringStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-ink-500)', fontSize: '0.9rem' }}>
                  No students currently have subscriptions expiring within 5 days.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {expiringStudents.map(({ student, subscription, daysLeft }) => (
                    <div
                      key={student.id}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-sm)',
                        border: daysLeft <= 0 ? '1.5px solid #C5090D' : '1.5px solid rgba(230, 81, 0, 0.4)',
                        backgroundColor: daysLeft <= 0 ? '#FFEBEE' : '#FFFDF7'
                      }}
                    >
                      {/* Left Side: Roll No, Full Name, Contact */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '1rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--color-maroon-950)',
                          color: 'var(--color-cream-50)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          letterSpacing: '0.04em'
                        }}>
                          {student.student_code}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--color-ink-950)' }}>
                              {student.full_name}
                            </strong>
                            <span className={subscription.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                              {subscription.dietary_type_snapshot === 'non_veg' ? 'Non-Veg' : 'Veg'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-700)', marginTop: '3px' }}>
                            Email: <strong>{student.email}</strong> • Mobile: <strong>{student.mobile}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Days Remaining & Quick Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '1.15rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '0.04em',
                            color: daysLeft <= 0 ? '#C5090D' : daysLeft === 1 ? '#D84315' : '#E65100'
                          }}>
                            {daysLeft <= 0
                              ? '🚨 MESS EXPIRED'
                              : daysLeft === 1
                              ? '⚠️ EXPIRES TOMORROW (1 DAY LEFT)'
                              : `⚠️ ${daysLeft} DAYS LEFT`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)', marginTop: '2px' }}>
                            Valid until: <strong>{subscription.valid_until}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRenewStudent(student.id)}
                          className="btn btn-primary btn-sm"
                          style={{
                            backgroundColor: 'var(--color-red-600)',
                            padding: '8px 16px',
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          RENEW +30 DAYS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outstanding Dues & Partial Payments Section */}
            <div className="card-cream" style={{
              padding: '28px',
              marginBottom: '28px',
              border: '2px solid #E65100',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-veg" style={{ fontSize: '0.78rem', backgroundColor: '#FFF3E0', color: '#E65100', borderColor: '#FFE0B2' }}>
                      💰 FINANCIAL DUES TRACKER
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-700)' }}>
                      • Total Dues: <strong>₹{totalOutstanding.toLocaleString('en-IN')}</strong> ({studentsWithDues.length} Students with Balance)
                    </span>
                  </div>
                  <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                    STUDENT DUES & PARTIAL PAYMENTS TRACKER
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>
                    Instant visibility into students who paid half/partial amount, showing exact pending balances and remaining dues.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="btn btn-outline-dark btn-sm"
                  >
                    OPEN FULL LEDGER &rarr;
                  </button>
                </div>
              </div>

              {studentsWithDues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-ink-500)', fontSize: '0.9rem' }}>
                  ✅ Amazing! All registered students have cleared their mess dues in full. Zero pending balances.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {studentsWithDues.map(d => (
                    <div
                      key={d.student.id}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-sm)',
                        border: d.totalPaid > 0 ? '1.5px solid #FFB74D' : '1.5px solid #EF9A9A',
                        backgroundColor: d.totalPaid > 0 ? '#FFFDE7' : '#FFEBEE'
                      }}
                    >
                      {/* Left: Roll No, Name, Contact, Plan */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '1rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--color-maroon-950)',
                          color: 'var(--color-cream-50)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          letterSpacing: '0.04em'
                        }}>
                          {d.student.student_code}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--color-ink-950)' }}>
                              {d.student.full_name}
                            </strong>
                            <span className={d.subscription?.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                              {d.subscription?.dietary_type_snapshot === 'non_veg' ? 'Non-Veg' : 'Veg'}
                            </span>
                            <span className="badge" style={{
                              backgroundColor: d.totalPaid > 0 ? '#FFF3E0' : '#FFCDD2',
                              color: d.totalPaid > 0 ? '#B73E00' : '#C5090D',
                              border: 'none',
                              fontSize: '0.72rem'
                            }}>
                              {d.totalPaid > 0 ? 'PARTIAL PAYMENT' : 'UNPAID'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-700)', marginTop: '3px' }}>
                            Email: <strong>{d.student.email}</strong> • Mobile: <strong>{d.student.mobile}</strong>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)', marginTop: '2px' }}>
                            Plan: <strong>{d.planName}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Progress Bar & Fee Breakdown */}
                      <div style={{ minWidth: '180px', flex: 0.8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-ink-700)' }}>
                            Paid: <strong style={{ color: 'var(--color-success)' }}>₹{d.totalPaid.toLocaleString('en-IN')}</strong>
                          </span>
                          <span style={{ color: 'var(--color-ink-500)' }}>
                            Total: ₹{d.planPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${d.percentPaid}%`,
                            height: '100%',
                            backgroundColor: d.totalPaid > 0 ? '#FF8F00' : '#C5090D',
                            borderRadius: '4px'
                          }} />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '3px', textAlign: 'right' }}>
                          {d.percentPaid}% Settled
                        </div>
                      </div>

                      {/* Right: Remaining Due & 1-Click Collect Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '0.04em',
                            color: d.totalPaid > 0 ? '#BF360C' : '#C5090D'
                          }}>
                            ₹{d.dueAmount.toLocaleString('en-IN')} DUE
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '2px' }}>
                            {d.totalPaid > 0 ? 'Remaining 2nd half / balance' : 'Initial plan payment pending'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCollectDue(d.student.id, d.dueAmount)}
                          className="btn btn-primary btn-sm"
                          style={{
                            backgroundColor: d.totalPaid > 0 ? '#E65100' : 'var(--color-red-600)',
                            padding: '8px 16px',
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          COLLECT DUE &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              
              {/* Counter Terminal Launch Box */}
              <div className="card-cream" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span className="badge badge-live">LIVE OPERATION</span>
                  <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                    COUNTER SCANNER TERMINAL
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-700)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Equipped with camera QR recognition, USB hardware scanner reception, student search fallback, and audible verification tones.
                </p>
                <button
                  onClick={() => onNavigate('counter')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  OPEN SCANNER TERMINAL &rarr;
                </button>
              </div>

              {/* Pending Approvals Callout */}
              <div className="card-cream" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '12px' }}>
                  PENDING LEAVE APPLICATIONS
                </h3>
                {store.leave_requests.filter(l => l.status === 'pending').length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-500)', padding: '20px 0' }}>
                    All student leave applications are reviewed and up to date!
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                      <strong>{store.leave_requests.filter(l => l.status === 'pending').length}</strong> student(s) awaiting approval for scheduled leave.
                    </div>
                    <button
                      onClick={() => setActiveTab('leave')}
                      className="btn btn-dark"
                      style={{ width: '100%' }}
                    >
                      REVIEW LEAVE APPLICATIONS &rarr;
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB: EXPIRING SOON (<= 5 DAYS) ================= */}
        {activeTab === 'expiring' && (
          <div className="card-cream" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-nonveg">CRITICAL EXPIRY TRACKER</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-700)' }}>• Threshold: ≤ 5 Days</span>
                </div>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                  STUDENTS WITH SUBSCRIPTIONS EXPIRING SOON
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>
                  Monitor students whose mess validity ends in 5 days or less. Issue renewals directly to prevent dining disruptions.
                </div>
              </div>

              <span className="badge badge-red" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                {expiringStudents.length} CRITICAL EXPIRIES
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expiringStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-ink-500)', fontSize: '0.95rem' }}>
                  🎉 Great news! No students currently have subscriptions expiring within 5 days.
                </div>
              ) : (
                expiringStudents.map(({ student, subscription, daysLeft }) => (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '18px 24px',
                      borderRadius: 'var(--radius-sm)',
                      border: daysLeft <= 0 ? '2px solid #C5090D' : '2px solid rgba(230, 81, 0, 0.4)',
                      backgroundColor: daysLeft <= 0 ? '#FFEBEE' : '#FFFDF7',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    {/* Left Side: Roll no, Name, Contact */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px' }}>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        backgroundColor: 'var(--color-maroon-950)',
                        color: 'var(--color-cream-50)',
                        padding: '10px 14px',
                        borderRadius: '6px'
                      }}>
                        {student.student_code}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--color-ink-950)' }}>
                            {student.full_name}
                          </strong>
                          <span className={subscription.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                            {subscription.dietary_type_snapshot === 'non_veg' ? 'Non-Veg' : 'Veg'}
                          </span>
                          <span className="badge badge-live">
                            {subscription.meal_entitlement_snapshot?.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span>Email: <strong>{student.email}</strong></span>
                          <span>Mobile: <strong>{student.mobile}</strong></span>
                          <span>College: {student.college_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Days Left & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '0.04em',
                          color: daysLeft <= 0 ? '#C5090D' : daysLeft === 1 ? '#D84315' : '#E65100'
                        }}>
                          {daysLeft <= 0
                            ? '🚨 MESS EXPIRED'
                            : daysLeft === 1
                            ? '⚠️ EXPIRES TOMORROW (1 DAY LEFT)'
                            : `⚠️ ${daysLeft} DAYS LEFT`}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-500)', marginTop: '2px' }}>
                          Valid until: <strong>{subscription.valid_until}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRenewStudent(student.id)}
                        className="btn btn-primary"
                        style={{
                          backgroundColor: 'var(--color-red-600)',
                          padding: '10px 18px',
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        RENEW +30 DAYS
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: STUDENTS & PASSES ================= */}
        {activeTab === 'students' && (
          <div className="card-cream" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                  REGISTERED STUDENTS & PASSES
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>
                  Manage student meal subscriptions and dining passes.
                </div>
              </div>

              {/* Filter controls */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{ width: '220px', padding: '8px 12px' }}
                />
                <select
                  className="form-select"
                  value={studentDietFilter}
                  onChange={(e) => setStudentDietFilter(e.target.value)}
                  style={{ padding: '8px 12px' }}
                >
                  <option value="all">All Diets</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non_veg">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="promess-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Full Name</th>
                    <th>Contact</th>
                    <th>Diet & Plan</th>
                    <th>Valid Through</th>
                    <th>Pass Token</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(st => {
                    const sub = store.subscriptions.find(s => s.student_id === st.id && s.status === 'active') ||
                                store.subscriptions.find(s => s.student_id === st.id);
                    const pass = store.dining_passes.find(p => p.student_id === st.id && p.is_active);

                    return (
                      <tr key={st.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {st.student_code}
                        </td>
                        <td>
                          <strong>{st.full_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>{st.college_name}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          <div>{st.email}</div>
                          <div style={{ color: 'var(--color-ink-500)' }}>{st.mobile}</div>
                        </td>
                        <td>
                          {sub ? (
                            <>
                              <span className={sub.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                                {sub.dietary_type_snapshot === 'non_veg' ? 'Non-Veg' : 'Veg'}
                              </span>
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', textTransform: 'uppercase' }}>
                                {sub.meal_entitlement_snapshot}
                              </div>
                            </>
                          ) : 'No plan'}
                        </td>
                        <td>
                          {sub ? (
                            <span className={sub.status === 'active' ? 'badge badge-live' : 'badge badge-warning'}>
                              {sub.valid_until}
                            </span>
                          ) : 'N/A'}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {pass ? pass.token.slice(0, 16) + '...' : 'Revoked'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleReissuePass(st.id)}
                            className="btn btn-outline-dark btn-sm"
                            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            title="Generate a new secure token and revoke the previous QR pass"
                          >
                            <RefreshCw size={12} /> REISSUE PASS
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 3: ATTENDANCE LOG ================= */}
        {activeTab === 'attendance' && (
          <div className="card-cream" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                  COUNTER ATTENDANCE VERIFICATION LOG
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>
                  Audited check-in transactions enforced with (student_id, service_date, session) uniqueness.
                </div>
              </div>

              {/* Date & Session Filters + CSV Export */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  className="form-input"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  style={{ width: '150px', padding: '8px 12px' }}
                />
                <select
                  className="form-select"
                  value={attSession}
                  onChange={(e) => setAttSession(e.target.value)}
                  style={{ padding: '8px 12px' }}
                >
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>

                <button
                  onClick={() => downloadCSV(generateAttendanceReportCSV(), `attendance-${attDate}.csv`)}
                  className="btn btn-dark btn-sm"
                >
                  <Download size={14} /> EXPORT CSV
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="promess-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Diet</th>
                    <th>Verified By</th>
                    <th>Method</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-ink-500)' }}>
                        No attendance recorded for {attSession.toUpperCase()} on {attDate}.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map(a => {
                      const st = store.users.find(u => u.id === a.student_id);
                      const sub = store.subscriptions.find(s => s.id === a.subscription_id);
                      return (
                        <tr key={a.id}>
                          <td className="tabular-nums">
                            {new Date(a.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td><strong>{st?.full_name || 'Student'}</strong></td>
                          <td style={{ fontFamily: 'monospace' }}>{st?.student_code}</td>
                          <td>
                            <span className={sub?.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                              {sub?.dietary_type_snapshot?.toUpperCase() || 'VEG'}
                            </span>
                          </td>
                          <td>{a.verified_by}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-ink-500)' }}>{a.verification_method}</td>
                          <td>
                            <span style={{ color: 'var(--color-success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Accepted
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 4: PAYMENTS & COLLECTIONS ================= */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top: Comprehensive Dues & Partial Payments Master Ledger */}
            <div className="card-cream" style={{ padding: '28px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-card)' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-veg" style={{ backgroundColor: '#FFF3E0', color: '#E65100', borderColor: '#FFE0B2' }}>
                      💰 FINANCIAL AUDIT
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-700)' }}>
                      • Total Outstanding Balance: <strong style={{ color: 'var(--color-red-600)' }}>₹{totalOutstanding.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                  <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                    STUDENT DUES & PARTIAL PAYMENT MASTER LEDGER
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)', marginTop: '2px' }}>
                    Real-time tracking of students who paid half or partial fee installments, showing remaining dues and fast 1-click collection.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => downloadCSV(generateCollectionsReportCSV(), `collections-${todayStr}.csv`)}
                    className="btn btn-dark btn-sm"
                  >
                    <Download size={14} /> EXPORT AUDIT CSV
                  </button>
                </div>
              </div>

              {/* KPI Summary Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'var(--color-cream-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-line)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                    TOTAL PLAN VALUE
                  </div>
                  <div className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: 'var(--color-maroon-950)' }}>
                    ₹{totalPlanValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                    REALIZED COLLECTIONS
                  </div>
                  <div className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: 'var(--color-success)' }}>
                    ₹{totalCollections.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                    OUTSTANDING DUES
                  </div>
                  <div className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: 'var(--color-red-600)' }}>
                    ₹{totalOutstanding.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                    PARTIAL / SPLIT PAYMENTS
                  </div>
                  <div className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: '#E65100' }}>
                    {partialPaidStudents.length} Students
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                    COMPLETELY UNPAID
                  </div>
                  <div className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: 'var(--color-red-600)' }}>
                    {unpaidStudents.length} Students
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'all', label: `ALL STUDENTS (${allStudentDues.length})` },
                    { id: 'pending', label: `ALL PENDING DUES (${studentsWithDues.length})` },
                    { id: 'partial', label: `PARTIAL DUES ONLY (${partialPaidStudents.length})` },
                    { id: 'unpaid', label: `UNPAID ONLY (${unpaidStudents.length})` },
                    { id: 'cleared', label: `FULLY PAID (${allStudentDues.filter(d => d.dueAmount === 0).length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDuesFilter(tab.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        border: duesFilter === tab.id ? '1px solid var(--color-maroon-950)' : '1px solid var(--color-line)',
                        backgroundColor: duesFilter === tab.id ? 'var(--color-maroon-950)' : '#FFFFFF',
                        color: duesFilter === tab.id ? '#FFF' : 'var(--color-ink-800)',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-ink-500)' }} />
                  <input
                    type="text"
                    placeholder="Search name, roll no, mobile..."
                    className="form-input"
                    value={duesSearch}
                    onChange={(e) => setDuesSearch(e.target.value)}
                    style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="promess-table">
                  <thead>
                    <tr>
                      <th>Roll No & Student</th>
                      <th>Contact Details</th>
                      <th>Meal Plan</th>
                      <th>Plan Fee</th>
                      <th>Paid So Far</th>
                      <th>Settlement</th>
                      <th>Due Amount</th>
                      <th>Status</th>
                      <th>Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudentDues
                      .filter(d => {
                        const q = duesSearch.toLowerCase().trim();
                        const match = !q ||
                          d.student.full_name?.toLowerCase().includes(q) ||
                          d.student.student_code?.toLowerCase().includes(q) ||
                          d.student.email?.toLowerCase().includes(q) ||
                          d.student.mobile?.includes(q);
                        if (!match) return false;

                        if (duesFilter === 'partial') return d.totalPaid > 0 && d.dueAmount > 0;
                        if (duesFilter === 'unpaid') return d.totalPaid === 0 && d.dueAmount > 0;
                        if (duesFilter === 'pending') return d.dueAmount > 0;
                        if (duesFilter === 'cleared') return d.dueAmount === 0;
                        return true;
                      })
                      .map(d => (
                        <tr key={d.student.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                backgroundColor: 'var(--color-maroon-950)',
                                color: 'var(--color-cream-50)',
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}>
                                {d.student.student_code}
                              </span>
                              <div>
                                <strong>{d.student.full_name}</strong>
                                <div>
                                  <span className={d.subscription?.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'} style={{ fontSize: '0.65rem' }}>
                                    {d.subscription?.dietary_type_snapshot === 'non_veg' ? 'Non-Veg' : 'Veg'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ fontSize: '0.8rem' }}>
                            <div>{d.student.mobile}</div>
                            <div style={{ color: 'var(--color-ink-500)', fontSize: '0.75rem' }}>{d.student.email}</div>
                          </td>

                          <td style={{ fontSize: '0.82rem' }}>
                            <strong>{d.planName}</strong>
                          </td>

                          <td className="tabular-nums" style={{ fontWeight: 700 }}>
                            ₹{d.planPrice.toLocaleString('en-IN')}
                          </td>

                          <td className="tabular-nums" style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                            ₹{d.totalPaid.toLocaleString('en-IN')}
                          </td>

                          <td style={{ minWidth: '120px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-ink-500)', marginBottom: '2px' }}>
                              <span>{d.percentPaid}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${d.percentPaid}%`,
                                height: '100%',
                                backgroundColor: d.dueAmount === 0 ? 'var(--color-success)' : d.totalPaid > 0 ? '#FF8F00' : 'var(--color-red-600)',
                                borderRadius: '3px'
                              }} />
                            </div>
                          </td>

                          <td className="tabular-nums">
                            {d.dueAmount > 0 ? (
                              <strong style={{
                                color: d.totalPaid > 0 ? '#E65100' : '#C5090D',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-display)',
                                letterSpacing: '0.02em'
                              }}>
                                ₹{d.dueAmount.toLocaleString('en-IN')}
                              </strong>
                            ) : (
                              <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem' }}>
                                ₹0
                              </span>
                            )}
                          </td>

                          <td>
                            {d.dueAmount === 0 ? (
                              <span className="badge badge-live" style={{ fontSize: '0.72rem' }}>
                                PAID IN FULL
                              </span>
                            ) : d.totalPaid > 0 ? (
                              <span className="badge" style={{ backgroundColor: '#FFF3E0', color: '#B73E00', border: '1px solid #FFE0B2', fontSize: '0.72rem' }}>
                                PARTIAL DUE
                              </span>
                            ) : (
                              <span className="badge badge-nonveg" style={{ fontSize: '0.72rem' }}>
                                UNPAID
                              </span>
                            )}
                          </td>

                          <td>
                            {d.dueAmount > 0 ? (
                              <button
                                onClick={() => handleCollectDue(d.student.id, d.dueAmount)}
                                className="btn btn-primary btn-sm"
                                style={{
                                  backgroundColor: d.totalPaid > 0 ? '#E65100' : 'var(--color-red-600)',
                                  padding: '5px 10px',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                COLLECT ₹{d.dueAmount.toLocaleString('en-IN')} &rarr;
                              </button>
                            ) : (
                              <span style={{ color: 'var(--color-success)', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={13} /> Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Bottom Row: Record Manual Payment Form & Confirmed Transactions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Left: Record Manual Payment Form */}
              <div id="record-payment-form" className="card-cream" style={{ padding: '28px' }}>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '8px' }}>
                  RECORD CONFIRMED PAYMENT
                </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-700)', marginBottom: '16px' }}>
                Record payments received via UPI, Cash at desk, or Net Banking, and issue a serialized receipt.
              </p>

              {payFeedback && (
                <div style={{
                  backgroundColor: payFeedback.includes('Error') ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
                  color: payFeedback.includes('Error') ? 'var(--color-error)' : 'var(--color-success)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '16px'
                }}>
                  {payFeedback}
                </div>
              )}

              <form onSubmit={handleRecordPayment}>
                <div className="form-group">
                  <label className="form-label">SELECT STUDENT</label>
                  <select
                    className="form-select"
                    value={payStudentId}
                    onChange={(e) => setPayStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {store.users.filter(u => u.role === 'student').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.student_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">PAYMENT AMOUNT (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 3200"
                    value={payAmt}
                    onChange={(e) => setPayAmt(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PAYMENT METHOD</label>
                  <select
                    className="form-select"
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                  >
                    <option value="UPI (Google Pay)">UPI (Google Pay)</option>
                    <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                    <option value="Net Banking (SBI)">Net Banking (SBI)</option>
                    <option value="Cash at Desk">Cash at Desk</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">BANK / UTR REFERENCE NO.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UTR-2026-904128"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  CONFIRM PAYMENT & ISSUE RECEIPT
                </button>
              </form>
            </div>

            {/* Right: Confirmed Transactions Table */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                  RECENT TRANSACTIONS
                </h3>
                <button
                  onClick={() => downloadCSV(generateCollectionsReportCSV(), `collections-${todayStr}.csv`)}
                  className="btn btn-dark btn-sm"
                >
                  <Download size={14} /> EXPORT CSV
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {store.payments.map(p => {
                  const st = store.users.find(u => u.id === p.student_id);
                  const r = store.receipts.find(rec => rec.payment_id === p.id);
                  return (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-line)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          ₹{p.amount.toLocaleString('en-IN')} — {st?.full_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)', fontFamily: 'monospace' }}>
                          Receipt: <strong>{r?.receipt_number || 'Pending'}</strong> • {p.method} • {p.reference}
                        </div>
                      </div>
                      <span className="badge badge-live">CONFIRMED</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
        )}

        {/* ================= TAB 5: LEAVE APPROVALS ================= */}
        {activeTab === 'leave' && (
          <div className="card-cream" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                STUDENT LEAVE REQUESTS & EXTENSIONS
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>
                Rule enforcement: <strong>Only approved leave of 4 or more consecutive days qualifies for subscription extension.</strong>
              </p>
            </div>

            <div className="table-responsive">
              <table className="promess-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Leave Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Eligibility</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {store.leave_requests.map(l => {
                    const st = store.users.find(u => u.id === l.student_id);
                    const s = new Date(l.start_date);
                    const e = new Date(l.end_date);
                    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
                    const qualifies = days >= (store.settings.min_leave_days_for_extension || 4);

                    return (
                      <tr key={l.id}>
                        <td>
                          <strong>{st?.full_name}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)' }}>{st?.student_code}</div>
                        </td>
                        <td>{l.start_date} to {l.end_date}</td>
                        <td style={{ fontWeight: 700 }}>{days} Days</td>
                        <td style={{ fontSize: '0.82rem', maxWidth: '240px' }}>{l.reason}</td>
                        <td>
                          {qualifies ? (
                            <span className="badge badge-live">Qualifies (4+ d)</span>
                          ) : (
                            <span className="badge badge-warning">No Extension (&lt;4 d)</span>
                          )}
                        </td>
                        <td>
                          <span className={
                            l.status === 'approved' ? 'badge badge-live' :
                            l.status === 'rejected' ? 'badge badge-nonveg' : 'badge badge-warning'
                          }>
                            {l.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {l.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleReviewLeave(l.id, 'approve')}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.72rem', backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleReviewLeave(l.id, 'reject')}
                                className="btn btn-outline-dark btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              >
                                REJECT
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)' }}>
                              Reviewed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 6: MENU MANAGEMENT ================= */}
        {activeTab === 'menu' && (
          <div className="card-cream" style={{ padding: '28px' }}>
            <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '8px' }}>
              DAILY MENU PUBLISHER
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-700)', marginBottom: '20px' }}>
              Updates made here immediately propagate to the live website landing page and student portal.
            </p>

            {menuSuccess && (
              <div style={{
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '18px',
                fontSize: '0.85rem'
              }}>
                {menuSuccess}
              </div>
            )}

            {/* Session Switcher for Menu */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setMenuSession('lunch')}
                className={menuSession === 'lunch' ? 'btn btn-primary btn-sm' : 'btn btn-outline-dark btn-sm'}
              >
                EDIT LUNCH MENU
              </button>
              <button
                type="button"
                onClick={() => setMenuSession('dinner')}
                className={menuSession === 'dinner' ? 'btn btn-primary btn-sm' : 'btn btn-outline-dark btn-sm'}
              >
                EDIT DINNER MENU
              </button>
            </div>

            <form onSubmit={handleSaveMenu} style={{ maxWidth: '640px' }}>
              <div className="form-group">
                <label className="form-label">MENU TITLE / THEME</label>
                <input
                  type="text"
                  className="form-input"
                  value={menuTitle}
                  onChange={(e) => setMenuTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SERVING HOURS</label>
                <input
                  type="text"
                  className="form-input"
                  value={menuHours}
                  onChange={(e) => setMenuHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">DISH ITEMS (ONE PER LINE)</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={menuItemsText}
                  onChange={(e) => setMenuItemsText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NON-VEG ADD-ON (OPTIONAL)</label>
                <input
                  type="text"
                  className="form-input"
                  value={menuNonVeg}
                  onChange={(e) => setMenuNonVeg(e.target.value)}
                  placeholder="e.g. Chettinad Chicken Sukka"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                PUBLISH UPDATED MENU
              </button>
            </form>

          </div>
        )}

        {/* ================= TAB 7: REPORTS & AUDIT ================= */}
        {activeTab === 'reports' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* CSV Downloads */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '16px' }}>
                AUDITED CSV EXPORTS
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)', marginBottom: '20px' }}>
                All exports include formula-injection security escaping (stripping leading =, +, -, @ symbols) to protect Excel spreadsheets.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => downloadCSV(generateAttendanceReportCSV(), `attendance-master-${todayStr}.csv`)}
                  className="btn btn-dark"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Download size={16} /> DOWNLOAD MASTER ATTENDANCE CSV
                </button>

                <button
                  onClick={() => downloadCSV(generateCollectionsReportCSV(), `collections-master-${todayStr}.csv`)}
                  className="btn btn-dark"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Download size={16} /> DOWNLOAD MASTER COLLECTIONS CSV
                </button>
              </div>
            </div>

            {/* Audit Log Stream */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '16px' }}>
                SECURITY & AUDIT TRAIL
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                {store.audit_logs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-line)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{log.action}</span>
                      <span style={{ color: 'var(--color-ink-500)' }}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--color-ink-700)', fontFamily: 'monospace', fontSize: '0.72rem', marginTop: '2px' }}>
                      Actor: {log.actor_id} • Target: {log.entity_type} ({log.entity_id})
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 8: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="card-cream" style={{ padding: '28px', maxWidth: '680px' }}>
            <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '16px' }}>
              CAMPUS DINING CONFIGURATION
            </h3>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">MESS NAME</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsState.mess_name}
                  onChange={(e) => setSettingsState({ ...settingsState, mess_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CAMPUS INSTITUTION</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsState.campus_name}
                  onChange={(e) => setSettingsState({ ...settingsState, campus_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">LUNCH SERVING HOURS</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settingsState.lunch_hours}
                    onChange={(e) => setSettingsState({ ...settingsState, lunch_hours: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">DINNER SERVING HOURS</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settingsState.dinner_hours}
                    onChange={(e) => setSettingsState({ ...settingsState, dinner_hours: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">MINIMUM CONSECUTIVE LEAVE DAYS FOR EXTENSION</label>
                <input
                  type="number"
                  className="form-input"
                  value={settingsState.min_leave_days_for_extension}
                  onChange={(e) => setSettingsState({ ...settingsState, min_leave_days_for_extension: parseInt(e.target.value, 10) || 4 })}
                  required
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '4px' }}>
                  Per policy specifications, default is 4 consecutive days ("more than 3 days").
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                SAVE CONFIGURATION
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
