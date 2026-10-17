import React, { useState } from 'react';
import { X, User, Phone, Mail, Lock, Shield, ArrowRight, CheckCircle, Sparkles, AlertCircle, QrCode } from 'lucide-react';
import { loginStudent, loginStaff } from '../services/store';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebaseAuth';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px', verticalAlign: 'middle', flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export function AuthModal({ initialMode = 'login', initialPlan = null, onClose, onAuthSuccess }) {
  // mode: 'login' | 'counter' | 'admin' | 'register'
  const [mode, setMode] = useState(
    initialMode === 'staff' ? 'admin' : initialMode
  );
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Student Login Fields
  const [studentAuthType, setStudentAuthType] = useState('email'); // 'email' | 'otp'
  const [studentEmail, setStudentEmail] = useState('karthik.r@campus.edu');
  const [studentPassword, setStudentPassword] = useState('promess2026');
  const [loginIdentifier, setLoginIdentifier] = useState('karthik.r@campus.edu');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Counter & Admin Login Fields
  const [staffIdentifier, setStaffIdentifier] = useState('admin@promess.campus');
  const [staffPassword, setStaffPassword] = useState('promess2026');

  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('promess2026');
  const [regMobile, setRegMobile] = useState('');
  const [regCollege, setRegCollege] = useState('PSG College of Technology');
  const [regDiet, setRegDiet] = useState(initialPlan?.dietaryType || 'veg');
  const [regSession, setRegSession] = useState(initialPlan?.mealEntitlement || 'both');
  const [regDuration, setRegDuration] = useState(initialPlan?.durationDays || 30);

  // Calculate pricing preview for registration
  const calculateRegPrice = () => {
    let rate = 3200;
    if (regSession === 'both') {
      rate = regDiet === 'non_veg' ? 4200 : 3200;
    } else if (regSession === 'lunch') {
      rate = 1920;
    } else {
      rate = 2520;
    }
    return Math.round((rate * Number(regDuration)) / 30);
  };

  // Google Login Handler
  const handleGoogleLogin = async (targetRole = 'student') => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await signInWithGoogle(targetRole);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 300);
    } else {
      setError(res.message);
    }
  };

  // Student Firebase Email & Password Login
  const handleStudentEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await signInWithEmail(studentEmail, studentPassword, 'student');
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 300);
    } else {
      setError(res.message);
    }
  };

  // Student Send OTP handler (Demo fallback)
  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!loginIdentifier.trim()) {
      setError('Please enter your registered email or mobile number.');
      return;
    }
    setOtpSent(true);
    setOtpCode('123456');
    setSuccessMsg('Verification OTP generated! (Development Code: 123456)');
  };

  // Student Verify OTP Login
  const handleStudentOtpLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = loginStudent(loginIdentifier, otpCode);
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.message);
    }
  };

  // Staff (Counter or Admin) Login
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // 1. Try local staff credentials first
    const localRes = loginStaff(staffIdentifier, staffPassword);
    if (localRes.success) {
      setLoading(false);
      onAuthSuccess(localRes.user);
      onClose();
      return;
    }

    // 2. Try Firebase Email sign-in
    const fbRes = await signInWithEmail(staffIdentifier, staffPassword, mode === 'admin' ? 'admin' : 'counter_operator');
    setLoading(false);

    if (fbRes.success) {
      onAuthSuccess(fbRes.user);
      onClose();
    } else {
      setError(localRes.message || fbRes.message);
    }
  };

  // Registration with Firebase Email & Password
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (!regPassword || regPassword.length < 6) {
      setLoading(false);
      setError('Password must be at least 6 characters for Firebase Authentication.');
      return;
    }

    const res = await signUpWithEmail({
      email: regEmail,
      password: regPassword,
      full_name: regName,
      mobile: regMobile,
      college_name: regCollege,
      dietary_type: regDiet,
      meal_entitlement: regSession,
      duration_days: regDuration
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 400);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        
        {/* Modal Top Header */}
        <div style={{
          backgroundColor: 'var(--color-maroon-950)',
          color: 'var(--color-cream-50)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid var(--color-line)'
        }}>
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.12em',
              color: 'var(--color-sand-200)',
              marginBottom: '2px'
            }}>
              PROMESS ACCESS & IDENTITY
            </div>
            <h3 className="display-sub" style={{ color: 'var(--color-cream-50)' }}>
              {mode === 'login' && 'STUDENT PORTAL SIGN IN'}
              {mode === 'counter' && 'COUNTER OPERATOR TERMINAL'}
              {mode === 'admin' && 'CHIEF WARDEN WORKSPACE'}
              {mode === 'register' && 'NEW STUDENT REGISTRATION'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-sand-200)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Switcher - Strictly Separated! */}
        <div className="auth-modal-tabs" style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-line)',
          backgroundColor: 'var(--color-cream-100)',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 6px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid var(--color-red-600)' : '3px solid transparent',
              backgroundColor: mode === 'login' ? 'var(--color-cream-50)' : 'transparent',
              color: mode === 'login' ? 'var(--color-red-600)' : 'var(--color-ink-700)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            STUDENT
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('counter');
              setStaffIdentifier('counter@promess.campus');
              setStaffPassword('promess2026');
              setError('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '12px 6px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              border: 'none',
              borderBottom: mode === 'counter' ? '3px solid var(--color-red-600)' : '3px solid transparent',
              backgroundColor: mode === 'counter' ? 'var(--color-cream-50)' : 'transparent',
              color: mode === 'counter' ? 'var(--color-red-600)' : 'var(--color-ink-700)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            COUNTER OPERATOR
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setStaffIdentifier('admin@promess.campus');
              setStaffPassword('promess2026');
              setError('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '12px 6px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              border: 'none',
              borderBottom: mode === 'admin' ? '3px solid var(--color-red-600)' : '3px solid transparent',
              backgroundColor: mode === 'admin' ? 'var(--color-cream-50)' : 'transparent',
              color: mode === 'admin' ? 'var(--color-red-600)' : 'var(--color-ink-700)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            CHIEF WARDEN (ADMIN)
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 6px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              border: 'none',
              borderBottom: mode === 'register' ? '3px solid var(--color-red-600)' : '3px solid transparent',
              backgroundColor: mode === 'register' ? 'var(--color-cream-50)' : 'transparent',
              color: mode === 'register' ? 'var(--color-red-600)' : 'var(--color-ink-700)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            JOIN MESS
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          
          {error && (
            <div style={{
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              border: '1px solid #4CAF50',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= MODE: STUDENT LOGIN ================= */}
          {mode === 'login' && (
            <div>
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={() => handleGoogleLogin('student')}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-line-gold)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  color: 'var(--color-ink-950)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  marginBottom: '16px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <GoogleIcon />
                SIGN IN WITH GOOGLE
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
                color: 'var(--color-ink-500)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
                <span style={{ padding: '0 12px' }}>OR SIGN IN WITH FIREBASE EMAIL</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleStudentEmailLogin}>
                <div className="form-group">
                  <label className="form-label">STUDENT EMAIL</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-ink-500)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. karthik.r@campus.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">PASSWORD</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)' }}>Firebase Auth</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-ink-500)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password (min 6 chars)"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                  {loading ? 'SIGNING IN...' : 'SIGN IN WITH EMAIL & PASSWORD'}
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick Demo Switcher */}
              <div style={{
                backgroundColor: 'rgba(33, 6, 4, 0.04)',
                border: '1px dashed var(--color-line)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginTop: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-ink-950)' }}>
                    QUICK DEMO STUDENT SWITCHER:
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)' }}>1-Click Login</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setStudentEmail('karthik.r@campus.edu'); setStudentPassword('promess2026'); }}
                    className="btn btn-outline-dark btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                  >
                    Karthik (Non-Veg)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentEmail('sanjay.k@campus.edu'); setStudentPassword('promess2026'); }}
                    className="btn btn-outline-dark btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#D84315' }}
                  >
                    Sanjay (Expires 2d)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentEmail('deepika.m@campus.edu'); setStudentPassword('promess2026'); }}
                    className="btn btn-outline-dark btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#D84315' }}
                  >
                    Deepika (Expires 3d)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentEmail('priya.k@campus.edu'); setStudentPassword('promess2026'); }}
                    className="btn btn-outline-dark btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                  >
                    Priya (Veg Both)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE: COUNTER OPERATOR ================= */}
          {mode === 'counter' && (
            <div>
              <div style={{
                backgroundColor: 'rgba(197, 9, 13, 0.05)',
                border: '1px solid var(--color-red-600)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-red-700)', fontWeight: 800, fontSize: '0.85rem' }}>
                  <QrCode size={16} />
                  DEDICATED COUNTER TERMINAL
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-700)', marginTop: '4px' }}>
                  Restricted to dining hall counter operators for QR pass scanning, service verification, and real-time attendance marking.
                </div>
              </div>

              {/* Google Sign-In for Counter */}
              <button
                type="button"
                onClick={() => handleGoogleLogin('counter_operator')}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-line-gold)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.92rem',
                  letterSpacing: '0.04em',
                  color: 'var(--color-ink-950)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  marginBottom: '16px'
                }}
              >
                <GoogleIcon />
                SIGN IN WITH GOOGLE (OPERATOR)
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
                color: 'var(--color-ink-500)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
                <span style={{ padding: '0 12px' }}>OR COUNTER EMAIL CREDENTIALS</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
              </div>

              <form onSubmit={handleStaffLogin}>
                <div className="form-group">
                  <label className="form-label">OPERATOR EMAIL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={staffIdentifier}
                    onChange={(e) => setStaffIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">COUNTER PASSWORD</label>
                  <input
                    type="password"
                    className="form-input"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '4px' }}>
                    Demo password: <strong>promess2026</strong> (Murugan Swamy - Counter 1)
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--color-red-600)' }}>
                  <QrCode size={16} />
                  {loading ? 'OPENING...' : 'LAUNCH COUNTER SCANNER TERMINAL'}
                </button>
              </form>
            </div>
          )}

          {/* ================= MODE: CHIEF WARDEN ADMIN ================= */}
          {mode === 'admin' && (
            <div>
              <div style={{
                backgroundColor: 'rgba(33, 6, 4, 0.05)',
                border: '1px solid var(--color-ink-950)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-maroon-950)', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Shield size={16} />
                  CHIEF WARDEN ADMINISTRATION
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-700)', marginTop: '4px' }}>
                  Administrative workspace for subscription renewals (≤ 5 day expiry tracking), fee dues, leave approvals, menu publishing, and master reports.
                </div>
              </div>

              {/* Google Sign-In for Admin */}
              <button
                type="button"
                onClick={() => handleGoogleLogin('admin')}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-line-gold)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.92rem',
                  letterSpacing: '0.04em',
                  color: 'var(--color-ink-950)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  marginBottom: '16px'
                }}
              >
                <GoogleIcon />
                SIGN IN WITH GOOGLE (CHIEF WARDEN)
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
                color: 'var(--color-ink-500)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
                <span style={{ padding: '0 12px' }}>OR ADMIN EMAIL CREDENTIALS</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
              </div>

              <form onSubmit={handleStaffLogin}>
                <div className="form-group">
                  <label className="form-label">ADMINISTRATOR EMAIL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={staffIdentifier}
                    onChange={(e) => setStaffIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ADMIN PASSWORD</label>
                  <input
                    type="password"
                    className="form-input"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '4px' }}>
                    Demo password: <strong>promess2026</strong> (Chief Warden Dr. Ramanathan)
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-dark" style={{ width: '100%', backgroundColor: 'var(--color-maroon-950)' }}>
                  <Shield size={16} />
                  {loading ? 'AUTHENTICATING...' : 'ENTER CHIEF WARDEN WORKSPACE'}
                </button>
              </form>
            </div>
          )}

          {/* ================= MODE: REGISTER ================= */}
          {mode === 'register' && (
            <div>
              {/* Google 1-Click Registration */}
              <button
                type="button"
                onClick={() => handleGoogleLogin('student')}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-line-gold)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  color: 'var(--color-ink-950)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  marginBottom: '16px'
                }}
              >
                <GoogleIcon />
                QUICK SIGN UP WITH GOOGLE (1-CLICK PASS)
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
                color: 'var(--color-ink-500)',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
                <span style={{ padding: '0 12px' }}>OR REGISTER WITH EMAIL & PASSWORD</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-line)' }} />
              </div>

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">FULL NAME (AS PER COLLEGE ID)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vignesh Sundaram"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="vignesh@campus.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PASSWORD (MIN 6 CHARS)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Choose password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MOBILE NUMBER</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="9876543210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    required
                  />
                </div>

                <div style={{
                  backgroundColor: 'rgba(197, 9, 13, 0.04)',
                  border: '1px solid var(--color-line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label className="form-label">DIET PREFERENCE</label>
                      <select
                        className="form-select"
                        value={regDiet}
                        onChange={(e) => setRegDiet(e.target.value)}
                      >
                        <option value="veg">Vegetarian</option>
                        <option value="non_veg">Non-Veg Included</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">SESSIONS</label>
                      <select
                        className="form-select"
                        value={regSession}
                        onChange={(e) => setRegSession(e.target.value)}
                      >
                        <option value="both">Both (Lunch + Dinner)</option>
                        <option value="lunch">Lunch Only</option>
                        <option value="dinner">Dinner Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">SUBSCRIPTION DURATION</label>
                    <select
                      className="form-select"
                      value={regDuration}
                      onChange={(e) => setRegDuration(e.target.value)}
                    >
                      <option value="15">15 Days</option>
                      <option value="30">30 Days (Standard Month)</option>
                      <option value="60">60 Days (Two Months)</option>
                      <option value="90">90 Days (Full Semester)</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-line)'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink-950)' }}>
                      Calculated Subscription Dues:
                    </span>
                    <span className="tabular-nums font-display" style={{ fontSize: '1.4rem', color: 'var(--color-red-600)' }}>
                      ₹{calculateRegPrice().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                  {loading ? 'CREATING FIREBASE ACCOUNT...' : 'CONFIRM REGISTRATION & GET PASS'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
