import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  Shield,
  FileText,
  Send,
  Sparkles,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import {
  getStore,
  subscribeToStore,
  submitLeaveRequest,
  getTodayDateString
} from '../services/store';

export function StudentPortal({ currentUser, onNavigate }) {
  const [store, setStore] = useState(getStore());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pass' | 'attendance' | 'payments' | 'leave'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Leave Request Form State
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  // Payment Reference Form State
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  useEffect(() => {
    return subscribeToStore((newStore) => setStore(newStore));
  }, []);

  const todayStr = getTodayDateString();

  // Student's specific records
  const student = currentUser;
  const subscription = store.subscriptions.find(
    s => s.student_id === student.id && s.status === 'active'
  ) || store.subscriptions.find(s => s.student_id === student.id);

  const diningPass = store.dining_passes.find(
    p => p.student_id === student.id && p.is_active
  );

  const studentAttendance = store.attendance.filter(
    a => a.student_id === student.id
  ).sort((a, b) => new Date(b.checked_in_at) - new Date(a.checked_in_at));

  const studentPayments = store.payments.filter(
    p => p.student_id === student.id
  ).sort((a, b) => new Date(b.received_at) - new Date(a.received_at));

  const studentLeaves = store.leave_requests.filter(
    l => l.student_id === student.id
  ).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  // Compute days remaining
  let daysRemaining = 0;
  if (subscription && subscription.valid_until) {
    const validUntilDate = new Date(subscription.valid_until);
    const nowDate = new Date(todayStr);
    daysRemaining = Math.max(0, Math.ceil((validUntilDate - nowDate) / (1000 * 60 * 60 * 24)));
  }

  // Generate QR code for student pass
  useEffect(() => {
    if (diningPass?.token) {
      QRCode.toDataURL(diningPass.token, {
        margin: 2,
        width: 260,
        color: {
          dark: '#15130F',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl);
    }
  }, [diningPass]);

  // Compute today's session statuses
  const todayLunch = studentAttendance.find(
    a => a.service_date === todayStr && a.meal_session === 'lunch'
  );
  const todayDinner = studentAttendance.find(
    a => a.service_date === todayStr && a.meal_session === 'dinner'
  );

  const entitlement = subscription?.meal_entitlement_snapshot || 'both';

  // Compute financial balances
  const totalCost = subscription?.price_snapshot || 0;
  const confirmedPaid = studentPayments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingDues = Math.max(0, totalCost - confirmedPaid);

  // Submit leave request
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setLeaveError('');
    setLeaveSuccess('');

    const res = submitLeaveRequest({
      student_id: student.id,
      start_date: leaveStart,
      end_date: leaveEnd,
      reason: leaveReason
    });

    if (res.success) {
      setLeaveSuccess('Leave request submitted successfully for administrative review!');
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
    } else {
      setLeaveError(res.message);
    }
  };

  // Submit payment reference for admin audit
  const handlePaymentProof = (e) => {
    e.preventDefault();
    if (!payAmount || !payRef) return;
    setPaySuccess(`Payment evidence (Ref: ${payRef} for ₹${payAmount}) submitted! The mess accounts office will verify and confirm receipt.`);
    setPayAmount('');
    setPayRef('');
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '90vh', color: 'var(--color-ink-950)', paddingBottom: '60px' }}>
      
      {/* Student Portal Header Bar */}
      <div style={{
        backgroundColor: 'var(--color-maroon-950)',
        color: 'var(--color-cream-50)',
        borderBottom: '2px solid var(--color-ink-950)',
        padding: '24px 0'
      }}>
        <div className="container student-header-flex" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-live">STUDENT SELF-SERVICE DESK</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-sand-200)' }}>• {student.college_name}</span>
            </div>
            <h1 className="display-sub" style={{ color: 'var(--color-cream-50)' }}>
              WELCOME, {student.full_name.toUpperCase()}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-sand-200)', fontFamily: 'monospace' }}>
              ROLL NO / STUDENT ID: <strong>{student.student_code}</strong> | {student.email}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('pass')}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--color-red-600)' }}
            >
              <QrCode size={16} />
              SHOW DINING PASS
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'var(--color-sand-200)', color: 'var(--color-cream-50)' }}
            >
              BACK TO HOME
            </button>
          </div>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <div style={{
        backgroundColor: 'var(--color-cream-100)',
        borderBottom: '1px solid var(--color-line)'
      }}>
        <div className="container portal-tabs-container" style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '8px 20px' }}>
          {[
            { id: 'dashboard', label: 'OVERVIEW', icon: <Sparkles size={16} /> },
            { id: 'pass', label: 'PERMANENT QR PASS', icon: <QrCode size={16} /> },
            { id: 'attendance', label: 'ATTENDANCE HISTORY', icon: <Calendar size={16} /> },
            { id: 'payments', label: 'FEES & RECEIPTS', icon: <CreditCard size={16} /> },
            { id: 'leave', label: 'LEAVE & EXTENSIONS', icon: <Clock size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
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

      {/* Portal Main Body Container */}
      <div className="container" style={{ marginTop: '32px' }}>
        
        {/* Prominent Student Mess Expiry Alert Banner (if <= 5 days remaining) */}
        {daysRemaining <= 5 && subscription && (
          <div style={{
            backgroundColor: daysRemaining <= 0 ? '#FFEBEE' : '#FFF3E0',
            border: daysRemaining <= 0 ? '2px solid #C5090D' : '2px solid #E65100',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: daysRemaining <= 0 ? '#C5090D' : '#E65100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                flexShrink: 0
              }}>
                <AlertCircle size={26} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  color: daysRemaining <= 0 ? '#C5090D' : '#B73E00',
                  lineHeight: 1.1
                }}>
                  {daysRemaining <= 0
                    ? 'YOUR MESS SUBSCRIPTION HAS EXPIRED!'
                    : daysRemaining === 1
                    ? 'URGENT: YOUR MESS EXPIRES TOMORROW (1 DAY LEFT)!'
                    : `ATTENTION: YOUR MESS SUBSCRIPTION EXPIRES IN ${daysRemaining} DAYS!`}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-850)', marginTop: '4px' }}>
                  {daysRemaining <= 0
                    ? `Your plan ended on ${subscription.valid_until}. Please renew at the mess accounts desk to reactivate counter dining access.`
                    : `Your current meal plan is valid through ${subscription.valid_until}. Please renew in advance to ensure uninterrupted dining.`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('payments')}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: daysRemaining <= 0 ? '#C5090D' : '#E65100', borderColor: 'transparent' }}
              >
                VIEW DUES & RENEWAL DESK &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Outstanding Mess Due & Partial Payment Alert */}
        {outstandingDues > 0 && subscription && (
          <div style={{
            backgroundColor: confirmedPaid > 0 ? '#FFF8E1' : '#FFEBEE',
            border: confirmedPaid > 0 ? '2px solid #FF8F00' : '2px solid #C5090D',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: confirmedPaid > 0 ? '#FF8F00' : '#C5090D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                flexShrink: 0
              }}>
                <DollarSign size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  color: confirmedPaid > 0 ? '#BF360C' : '#C5090D',
                  lineHeight: 1.1
                }}>
                  {confirmedPaid > 0
                    ? `PARTIAL PAYMENT: ₹${outstandingDues.toLocaleString('en-IN')} OUTSTANDING DUE`
                    : `MEAL PLAN FEE UNPAID: ₹${outstandingDues.toLocaleString('en-IN')} PENDING`}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-850)', marginTop: '4px' }}>
                  {confirmedPaid > 0
                    ? `You have paid ₹${confirmedPaid.toLocaleString('en-IN')} of ₹${totalCost.toLocaleString('en-IN')} (${Math.round((confirmedPaid / totalCost) * 100)}% paid). The remaining balance of ₹${outstandingDues.toLocaleString('en-IN')} is due.`
                    : `Total plan fee of ₹${totalCost.toLocaleString('en-IN')} is currently due. Please submit payment or evidence at the mess accounts desk.`}
                </div>
                {/* Progress bar */}
                {totalCost > 0 && (
                  <div style={{
                    marginTop: '8px',
                    width: '100%',
                    maxWidth: '360px',
                    height: '8px',
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, Math.round((confirmedPaid / totalCost) * 100))}%`,
                      height: '100%',
                      backgroundColor: confirmedPaid > 0 ? '#FF8F00' : '#C5090D',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('payments')}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: confirmedPaid > 0 ? '#FF8F00' : '#C5090D', borderColor: 'transparent' }}
              >
                PAY REMAINING DUE &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div>
            
            {/* Top Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              
              {/* Card 1: Subscription Status */}
              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                  ACTIVE SUBSCRIPTION
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-maroon-950)', margin: '6px 0' }}>
                  {subscription ? (
                    subscription.dietary_type_snapshot === 'non_veg' ? 'NON-VEG FULL BOARD' : 'VEGETARIAN PLAN'
                  ) : 'NO PLAN'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={subscription?.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                    {subscription?.dietary_type_snapshot === 'non_veg' ? 'Non-Veg' : 'Veg'}
                  </span>
                  <span className="badge badge-live">
                    {subscription?.status === 'active' ? 'Active' : 'Expired'}
                  </span>
                </div>
              </div>

              {/* Card 2: Days Remaining */}
              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                  VALIDITY REMAINING
                </div>
                <div className="tabular-nums font-display" style={{ fontSize: '2.2rem', color: 'var(--color-red-600)', margin: '4px 0' }}>
                  {daysRemaining} DAYS
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-700)' }}>
                  Valid through: <strong>{subscription?.valid_until || 'N/A'}</strong>
                </div>
              </div>

              {/* Card 3: Today's Lunch Status */}
              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                  TODAY'S LUNCH (12–3 PM)
                </div>
                <div style={{ marginTop: '8px' }}>
                  {entitlement === 'dinner' ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-500)' }}>Not Included in Plan</span>
                  ) : todayLunch ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <CheckCircle2 size={18} />
                      <span>Checked In ({new Date(todayLunch.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <Clock size={18} />
                      <span>Awaiting Check-in</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '6px' }}>
                  Scan pass at counter during lunch hours.
                </div>
              </div>

              {/* Card 4: Today's Dinner Status */}
              <div className="card-cream" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                  TODAY'S DINNER (7:30–10:30 PM)
                </div>
                <div style={{ marginTop: '8px' }}>
                  {entitlement === 'lunch' ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-500)' }}>Not Included in Plan</span>
                  ) : todayDinner ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <CheckCircle2 size={18} />
                      <span>Checked In ({new Date(todayDinner.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <Clock size={18} />
                      <span>Awaiting Check-in</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '6px' }}>
                  Dinner serves till 10:30 PM tonight.
                </div>
              </div>

            </div>

            {/* Split Row: QR Quick Pass Widget & Recent Attendance */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              
              {/* Left: Quick QR Dining Pass Preview */}
              <div className="card-cream" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                    MY DIGITAL PASS
                  </h3>
                  <button
                    onClick={() => setActiveTab('pass')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-red-600)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    FULL PASS VIEW &rarr;
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-line)'
                }}>
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Student Dining Pass QR"
                      style={{ width: '130px', height: '130px', borderRadius: '4px', border: '1px solid var(--color-ink-950)' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-ink-950)' }}>
                      {student.full_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-700)', fontFamily: 'monospace', marginBottom: '8px' }}>
                      ID: {student.student_code}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-500)', lineHeight: 1.4 }}>
                      Present this single permanent QR code at the dining hall entrance scanner for both lunch & dinner.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Financial & Dues Summary */}
              <div className="card-cream" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '12px' }}>
                    FEE & DUES STATUS
                  </h3>
                  
                  <div style={{ borderBottom: '1px solid var(--color-line)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--color-ink-700)' }}>Subscription Plan Total:</span>
                      <strong className="tabular-nums">₹{totalCost.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginTop: '6px' }}>
                      <span style={{ color: 'var(--color-ink-700)' }}>Confirmed Payments Received:</span>
                      <strong className="tabular-nums" style={{ color: 'var(--color-success)' }}>
                        ₹{confirmedPaid.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    {totalCost > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-ink-500)', marginBottom: '4px' }}>
                          <span>Payment Progress</span>
                          <span>{Math.round((confirmedPaid / totalCost) * 100)}% Paid</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, Math.round((confirmedPaid / totalCost) * 100))}%`,
                            height: '100%',
                            backgroundColor: outstandingDues === 0 ? 'var(--color-success)' : confirmedPaid > 0 ? '#FF8F00' : 'var(--color-red-600)'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-ink-950)', display: 'block' }}>
                        Outstanding Due:
                      </span>
                      <span className={outstandingDues === 0 ? 'badge badge-live' : confirmedPaid > 0 ? 'badge badge-veg' : 'badge badge-nonveg'} style={{ marginTop: '4px' }}>
                        {outstandingDues === 0 ? 'FULLY PAID' : confirmedPaid > 0 ? 'PARTIAL PAYMENT' : 'UNPAID PLAN'}
                      </span>
                    </div>
                    <span className="tabular-nums font-display" style={{
                      fontSize: '1.8rem',
                      color: outstandingDues > 0 ? 'var(--color-red-600)' : 'var(--color-success)'
                    }}>
                      ₹{outstandingDues.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="btn btn-dark btn-sm"
                    style={{ width: '100%' }}
                  >
                    VIEW PAYMENTS & SUBMIT EVIDENCE &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 2: PERMANENT QR PASS ================= */}
        {activeTab === 'pass' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            
            <div className="card-cream" style={{
              padding: '36px 32px',
              border: '3px solid var(--color-ink-950)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              position: 'relative'
            }}>
              
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid var(--color-ink-950)',
                paddingBottom: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-maroon-950)' }}>
                    PRO<span style={{ color: 'var(--color-red-600)' }}>MESS</span> DINING PASS
                  </div>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--color-ink-700)', textTransform: 'uppercase' }}>
                    OFFICIAL CAMPUS DINING IDENTIFIER
                  </div>
                </div>
                <span className={subscription?.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                  {subscription?.dietary_type_snapshot === 'non_veg' ? 'NON-VEG' : 'VEGETARIAN'}
                </span>
              </div>

              {/* Student Details */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>
                  {student.full_name}
                </h2>
                <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--color-ink-700)' }}>
                  ROLL NO: <strong>{student.student_code}</strong> | {student.college_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-500)', marginTop: '4px' }}>
                  Meal Entitlement: <strong>{entitlement.toUpperCase()} SESSIONS</strong>
                </div>
              </div>

              {/* Main Scannable QR Code */}
              <div style={{
                margin: '0 auto 20px',
                display: 'inline-block',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-ink-950)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Official Dining QR Code"
                    style={{ width: '220px', height: '220px', display: 'block' }}
                  />
                ) : (
                  <div>Generating Pass...</div>
                )}
              </div>

              {/* Pass Validity and Token info */}
              <div style={{
                backgroundColor: 'rgba(33, 6, 4, 0.04)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                maxWidth: '420px',
                margin: '0 auto 24px',
                fontSize: '0.82rem',
                color: 'var(--color-ink-700)'
              }}>
                <div>Plan Valid From: <strong>{subscription?.valid_from}</strong> to <strong>{subscription?.valid_until}</strong></div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '4px' }}>
                  *One persistent token works for all daily sessions. No daily regeneration needed.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <a
                  href={qrDataUrl}
                  download={`promess-pass-${student.student_code}.png`}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={15} />
                  DOWNLOAD PASS IMAGE
                </a>
                <button
                  onClick={handlePrintPass}
                  className="btn btn-outline-dark btn-sm"
                >
                  <Printer size={15} />
                  PRINT PHYSICAL PASS
                </button>
              </div>

              <div style={{
                fontSize: '0.68rem',
                color: 'var(--color-ink-500)',
                marginTop: '18px',
                borderTop: '1px solid var(--color-line)',
                paddingTop: '12px'
              }}>
                Notice: QR Pass identifies entitlement only. Counter staff may verify physical college ID card as per campus policy.
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 3: ATTENDANCE HISTORY ================= */}
        {activeTab === 'attendance' && (
          <div className="card-cream" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)' }}>
                  MY DINING ATTENDANCE LOG
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>
                  Verified meal check-ins recorded at the campus dining counters.
                </div>
              </div>
              <span className="badge badge-live">
                {studentAttendance.length} MEALS CHECKED IN
              </span>
            </div>

            <div className="table-responsive">
              <table className="promess-table">
                <thead>
                  <tr>
                    <th>Service Date</th>
                    <th>Meal Session</th>
                    <th>Check-in Time</th>
                    <th>Verified By</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-ink-500)' }}>
                        No attendance records recorded yet. Your first scan will appear here!
                      </td>
                    </tr>
                  ) : (
                    studentAttendance.map(att => (
                      <tr key={att.id}>
                        <td style={{ fontWeight: 700 }}>{att.service_date}</td>
                        <td>
                          <span className={att.meal_session === 'lunch' ? 'badge badge-warning' : 'badge badge-live'}>
                            {att.meal_session.toUpperCase()}
                          </span>
                        </td>
                        <td className="tabular-nums">
                          {new Date(att.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td>{att.verified_by}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-ink-500)' }}>{att.verification_method}</td>
                        <td>
                          <span style={{ color: 'var(--color-success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Confirmed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PAYMENTS & RECEIPTS ================= */}
        {activeTab === 'payments' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left: Financial Ledger */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '16px' }}>
                PAYMENTS & RECEIPTS
              </h3>

              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-700)' }}>Subscription Plan:</span>
                  <strong>{subscription?.dietary_type_snapshot === 'non_veg' ? 'Full Board Non-Veg' : 'Full Board Vegetarian'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Total Plan Fee:</span>
                  <strong className="tabular-nums">₹{totalCost.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Confirmed Paid to Date:</span>
                  <strong className="tabular-nums" style={{ color: 'var(--color-success)' }}>₹{confirmedPaid.toLocaleString('en-IN')}</strong>
                </div>

                {totalCost > 0 && (
                  <div style={{ margin: '12px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-ink-500)', marginBottom: '4px' }}>
                      <span>Payment Progress</span>
                      <span>{Math.round((confirmedPaid / totalCost) * 100)}% Paid</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, Math.round((confirmedPaid / totalCost) * 100))}%`,
                        height: '100%',
                        backgroundColor: outstandingDues === 0 ? 'var(--color-success)' : confirmedPaid > 0 ? '#FF8F00' : 'var(--color-red-600)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--color-line)' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Remaining Due:</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)' }}>
                      {outstandingDues > 0 ? (confirmedPaid > 0 ? 'Partial payment pending' : 'Full fee unpaid') : 'All fees cleared'}
                    </div>
                  </div>
                  <strong className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: outstandingDues > 0 ? 'var(--color-red-600)' : 'var(--color-success)' }}>
                    ₹{outstandingDues.toLocaleString('en-IN')}
                  </strong>
                </div>

                {outstandingDues > 0 ? (
                  <div style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: confirmedPaid > 0 ? '#FFF8E1' : '#FFEBEE',
                    border: confirmedPaid > 0 ? '1px solid #FFE082' : '1px solid #FFCDD2',
                    fontSize: '0.8rem',
                    color: confirmedPaid > 0 ? '#B73E00' : '#C5090D',
                    lineHeight: 1.4
                  }}>
                    {confirmedPaid > 0
                      ? `⚠️ Split/Partial Payment: You have paid ₹${confirmedPaid.toLocaleString('en-IN')}. Please pay the remaining balance of ₹${outstandingDues.toLocaleString('en-IN')} at the mess counter or submit UPI transaction ID below.`
                      : `🚨 Fee Pending: Your full plan fee of ₹${totalCost.toLocaleString('en-IN')} is unpaid. Please submit proof to maintain uninterrupted meal verification.`}
                  </div>
                ) : (
                  <div style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#E8F5E9',
                    border: '1px solid #A5D6A7',
                    fontSize: '0.8rem',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={16} /> All subscription fees are fully settled with zero outstanding dues!
                  </div>
                )}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
                CONFIRMED TRANSACTIONS:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {studentPayments.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-500)' }}>
                    No payments confirmed yet.
                  </div>
                ) : (
                  studentPayments.map(p => {
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
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-ink-950)' }}>
                            ₹{p.amount.toLocaleString('en-IN')} — {p.method}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-500)', fontFamily: 'monospace' }}>
                            Ref: {p.reference} • {p.received_at?.split('T')[0]}
                          </div>
                        </div>

                        {r && (
                          <button
                            onClick={() => setSelectedReceipt({ payment: p, receipt: r })}
                            className="btn btn-outline-dark btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            <FileText size={13} />
                            RECEIPT
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Submit Payment Evidence Form */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '8px' }}>
                SUBMIT PAYMENT PROOF
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-700)', marginBottom: '16px' }}>
                Paid via UPI or Net Banking to the campus account? Enter the transaction reference below for accounts verification.
              </p>

              {paySuccess && (
                <div style={{
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  border: '1px solid #4CAF50',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '14px'
                }}>
                  {paySuccess}
                </div>
              )}

              <form onSubmit={handlePaymentProof}>
                <div className="form-group">
                  <label className="form-label">AMOUNT PAID (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 3200"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">TRANSACTION UTR / REFERENCE NO.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UPI/26101784920/AXIS"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    required
                  />
                </div>

                <div style={{
                  backgroundColor: 'rgba(33, 6, 4, 0.04)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--color-ink-700)',
                  marginBottom: '16px'
                }}>
                  *Per campus audit rules, students cannot self-confirm payments. The admin will verify bank records and issue an official serialized receipt.
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} />
                  SUBMIT PAYMENT EVIDENCE
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ================= TAB 5: LEAVE & EXTENSIONS ================= */}
        {activeTab === 'leave' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left: Apply for Leave Form */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '8px' }}>
                APPLY FOR MESS LEAVE
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-700)', marginBottom: '16px' }}>
                Travelling home or on official college duty? Submit planned leave dates in advance.
              </p>

              {/* Campus Policy Callout */}
              <div style={{
                backgroundColor: 'rgba(197, 9, 13, 0.06)',
                border: '1.5px solid var(--color-red-600)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                marginBottom: '18px'
              }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-red-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} />
                  4-DAY EXTENSION POLICY:
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-850)', marginTop: '4px', lineHeight: 1.4 }}>
                  Per Section 12 mess rules, <strong>minimum qualifying consecutive leave is 4 days</strong>. Approved qualifying leaves automatically extend your active subscription's validity by the approved days.
                </div>
              </div>

              {leaveError && (
                <div style={{
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '14px'
                }}>
                  {leaveError}
                </div>
              )}

              {leaveSuccess && (
                <div style={{
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '14px'
                }}>
                  {leaveSuccess}
                </div>
              )}

              <form onSubmit={handleLeaveSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">LEAVE START DATE</label>
                    <input
                      type="date"
                      className="form-input"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LEAVE END DATE</label>
                    <input
                      type="date"
                      className="form-input"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">PURPOSE / REASON</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="e.g. Attending sister's wedding in Trichy or Semester break"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  SUBMIT LEAVE APPLICATION
                </button>
              </form>
            </div>

            {/* Right: Leave Requests & Extensions Ledger */}
            <div className="card-cream" style={{ padding: '28px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-maroon-950)', marginBottom: '16px' }}>
                MY LEAVE APPLICATIONS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {studentLeaves.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-500)', padding: '20px 0' }}>
                    No leave requests on record.
                  </div>
                ) : (
                  studentLeaves.map(l => (
                    <div
                      key={l.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-line)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px 16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {l.start_date} &rarr; {l.end_date}
                        </span>
                        <span className={
                          l.status === 'approved' ? 'badge badge-live' :
                          l.status === 'rejected' ? 'badge badge-nonveg' : 'badge badge-warning'
                        }>
                          {l.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-700)', marginBottom: '8px' }}>
                        Reason: {l.reason}
                      </div>

                      {l.status === 'approved' && (
                        <div style={{
                          backgroundColor: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}>
                          ★ Subscription extended by {l.credited_days} days!
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Official Receipt Viewer Modal */}
      {selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', backgroundColor: '#FFFFFF', padding: '32px' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--color-maroon-950)' }}>
                PROMESS DINING RECEIPT
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-700)' }}>
                Official Campus Mess Payment Acknowledgment
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span>Receipt Number:</span>
              <strong className="tabular-nums">{selectedReceipt.receipt.receipt_number}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span>Issued To:</span>
              <strong>{student.full_name} ({student.student_code})</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span>Date:</span>
              <span>{selectedReceipt.payment.received_at?.split('T')[0]}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span>Payment Mode:</span>
              <span>{selectedReceipt.payment.method}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem' }}>
              <span>Reference:</span>
              <span style={{ fontFamily: 'monospace' }}>{selectedReceipt.payment.reference}</span>
            </div>

            <div style={{
              backgroundColor: 'rgba(33, 6, 4, 0.05)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ fontWeight: 800 }}>AMOUNT PAID:</span>
              <span className="font-display tabular-nums" style={{ fontSize: '1.6rem', color: 'var(--color-red-600)' }}>
                ₹{selectedReceipt.payment.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                <Printer size={15} /> PRINT RECEIPT
              </button>
              <button onClick={() => setSelectedReceipt(null)} className="btn btn-outline-dark btn-sm" style={{ flex: 1 }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
