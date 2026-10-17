import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { verifyAndCheckIn, getStore, subscribeToStore, getTodayDateString } from '../services/store';

export function CounterScanner({ currentUser, onNavigate }) {
  const [store, setStore] = useState(getStore());
  const [selectedSession, setSelectedSession] = useState('lunch');
  const [manualInput, setManualInput] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return subscribeToStore((newStore) => setStore(newStore));
  }, []);

  // Preselect session according to local time
  useEffect(() => {
    const curHour = new Date().getHours();
    if (curHour >= 16) {
      setSelectedSession('dinner');
    } else {
      setSelectedSession('lunch');
    }
  }, []);

  // Web Audio Chimes
  const playChime = (type) => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio playback not supported:', e);
    }
  };

  // Perform pass check-in transaction
  const handleVerifyToken = (tokenToVerify) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const result = verifyAndCheckIn({
      rawToken: tokenToVerify,
      mealSession: selectedSession,
      verifiedBy: currentUser?.full_name || 'Counter Operator',
      verificationMethod: isCameraActive ? 'camera_qr' : 'manual_terminal'
    });

    setScanResult(result);
    playChime(result.status === 'success' ? 'success' : 'error');

    // Auto-rearm after 1.8 seconds per Section 9 specs
    setTimeout(() => {
      setIsProcessing(false);
    }, 1800);
  };

  // Camera handling
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied or unavailable. Use manual token or student search fallback.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const todayStr = getTodayDateString();
  const recentScans = store.attendance
    .filter(a => a.service_date === todayStr && a.meal_session === selectedSession)
    .slice(0, 10);

  // Student search fallback
  const matchingStudents = studentSearchQuery.trim()
    ? store.users.filter(u =>
        u.role === 'student' &&
        (u.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
         u.student_code?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
         u.mobile?.includes(studentSearchQuery))
      )
    : [];

  return (
    <div style={{ backgroundColor: '#15130F', minHeight: '92vh', color: 'var(--color-cream-50)', paddingBottom: '60px' }}>
      
      {/* Top Counter Bar */}
      <div style={{
        backgroundColor: 'var(--color-maroon-950)',
        borderBottom: '2px solid rgba(232, 214, 173, 0.15)',
        padding: '16px 0'
      }}>
        <div className="container counter-header-flex" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--color-red-600)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={24} color="#FFF7E6" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                letterSpacing: '0.04em',
                color: 'var(--color-cream-50)'
              }}>
                COUNTER <span style={{ color: 'var(--color-red-500)' }}>TERMINAL</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-sand-200)' }}>
                OPERATOR: {currentUser?.full_name || 'Murugan Swamy'} • HIGH-SPEED MEAL VERIFICATION
              </div>
            </div>
          </div>

          {/* Session Switcher & Mute Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Session Selector */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--color-maroon-900)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-line-gold)'
            }}>
              <button
                type="button"
                onClick={() => setSelectedSession('lunch')}
                style={{
                  padding: '8px 18px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedSession === 'lunch' ? 'var(--color-red-600)' : 'transparent',
                  color: 'var(--color-cream-50)',
                  cursor: 'pointer'
                }}
              >
                LUNCH SERVICE
              </button>
              <button
                type="button"
                onClick={() => setSelectedSession('dinner')}
                style={{
                  padding: '8px 18px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedSession === 'dinner' ? 'var(--color-red-600)' : 'transparent',
                  color: 'var(--color-cream-50)',
                  cursor: 'pointer'
                }}
              >
                DINNER SERVICE
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="btn btn-outline btn-sm"
              style={{ padding: '8px 12px' }}
              title={audioEnabled ? "Mute audio chimes" : "Enable audio chimes"}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="btn btn-outline btn-sm"
              >
                ADMIN WORKSPACE &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="container" style={{ marginTop: '28px' }}>
        
        <div className="counter-terminal-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Column 1: Scanner & Input Deck */}
          <div>
            
            {/* Camera Scanner Box */}
            <div style={{
              backgroundColor: 'var(--color-maroon-950)',
              border: '2px solid rgba(232, 214, 173, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge badge-live">
                  CAMERA SCANNER FEED
                </span>
                <div>
                  {!isCameraActive ? (
                    <button onClick={startCamera} className="btn btn-primary btn-sm">
                      <Camera size={15} /> START CAMERA
                    </button>
                  ) : (
                    <button onClick={stopCamera} className="btn btn-dark btn-sm">
                      STOP CAMERA
                    </button>
                  )}
                </div>
              </div>

              {/* Viewfinder Window */}
              <div style={{
                height: '240px',
                backgroundColor: '#000000',
                borderRadius: 'var(--radius-sm)',
                border: '2px dashed var(--color-red-600)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }}
                  playsInline
                  muted
                />

                {!isCameraActive && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Camera size={40} color="var(--color-sand-200)" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-sand-200)' }}>
                      Click "Start Camera" to scan student QR passes in real time
                    </div>
                    {cameraError && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-red-500)', marginTop: '8px' }}>
                        {cameraError}
                      </div>
                    )}
                  </div>
                )}

                {/* Laser scanline effect */}
                {isCameraActive && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--color-red-500)',
                    boxShadow: '0 0 10px #DF171B'
                  }} />
                )}
              </div>
            </div>

            {/* Quick Demo Scans & USB Barcode Input */}
            <div style={{
              backgroundColor: 'var(--color-maroon-950)',
              border: '2px solid rgba(232, 214, 173, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '24px'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '12px' }}>
                QUICK SCAN EMULATION (FOR TESTING COUNTER)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sand-200)', marginBottom: '14px' }}>
                Simulate instant pass scans for different enrolled students:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
                <button
                  onClick={() => handleVerifyToken('MESSPASS:a7f92e41b9c34d82a10e7b8')}
                  className="btn btn-outline btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  Scan Karthik (Non-Veg Both)
                </button>
                <button
                  onClick={() => handleVerifyToken('MESSPASS:c4892fb1380ea762d981240')}
                  className="btn btn-outline btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  Scan Priya (Veg Both)
                </button>
                <button
                  onClick={() => handleVerifyToken('MESSPASS:e91b0028a49c28e88f72365')}
                  className="btn btn-outline btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  Scan Ananya (Lunch Only)
                </button>
                <button
                  onClick={() => handleVerifyToken('MESSPASS:f04712ad9001b63ca043519')}
                  className="btn btn-outline btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', color: '#FF8A80' }}
                >
                  Scan Rahul (Expired Plan)
                </button>
              </div>

              {/* USB Scanner / Raw Token Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyToken(manualInput); setManualInput(''); }}>
                <label className="form-label" style={{ color: 'var(--color-sand-200)' }}>
                  OR USB SCANNER / TOKEN PASTE:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MESSPASS:..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    style={{ backgroundColor: '#221E19', color: '#FFF', borderColor: 'rgba(232, 214, 173, 0.3)' }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    VERIFY
                  </button>
                </div>
              </form>

              {/* Manual Student Search Fallback */}
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
                <label className="form-label" style={{ color: 'var(--color-sand-200)' }}>
                  MANUAL STUDENT SEARCH FALLBACK:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by student name, roll number, or phone..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  style={{ backgroundColor: '#221E19', color: '#FFF', borderColor: 'rgba(232, 214, 173, 0.3)' }}
                />

                {matchingStudents.length > 0 && (
                  <div style={{ marginTop: '8px', backgroundColor: '#221E19', borderRadius: '4px', padding: '6px' }}>
                    {matchingStudents.map(s => {
                      const p = store.dining_passes.find(pass => pass.student_id === s.id && pass.is_active);
                      return (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 10px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '0.88rem' }}>{s.full_name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-sand-200)', marginLeft: '6px' }}>
                              ({s.student_code})
                            </span>
                          </div>
                          <button
                            onClick={() => { p && handleVerifyToken(p.token); setStudentSearchQuery(''); }}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Mark Attendance
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Column 2: Live Verification Result & Feed */}
          <div>
            
            {/* Live Verification Screen Card */}
            <div style={{
              backgroundColor: scanResult
                ? (scanResult.status === 'success' ? '#1B5E20' : scanResult.status === 'warning' ? '#E65100' : '#B71C1C')
                : 'var(--color-maroon-900)',
              color: 'var(--color-cream-50)',
              borderRadius: 'var(--radius-md)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              padding: '36px 32px',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-float)',
              transition: 'background-color 0.3s ease',
              marginBottom: '24px'
            }}>
              {!scanResult ? (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <QrCode size={56} color="var(--color-sand-200)" style={{ marginBottom: '16px' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.04em' }}>
                    READY FOR NEXT PASS
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-sand-200)', marginTop: '6px' }}>
                    Scan QR pass or use quick simulation buttons on the left.
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {scanResult.status === 'success' ? (
                      <CheckCircle2 size={44} color="#FFF" />
                    ) : (
                      <XCircle size={44} color="#FFF" />
                    )}
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', lineHeight: 1 }}>
                        {scanResult.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                        {scanResult.code}
                      </div>
                    </div>
                  </div>

                  {/* Student Details on Pass */}
                  {scanResult.student && (
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px',
                      margin: '16px 0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                          {scanResult.student.full_name}
                        </span>
                        <span className={scanResult.subscription?.dietary_type_snapshot === 'non_veg' ? 'badge badge-nonveg' : 'badge badge-veg'}>
                          {scanResult.subscription?.dietary_type_snapshot === 'non_veg' ? 'NON-VEG' : 'VEGETARIAN'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--color-sand-200)', fontFamily: 'monospace' }}>
                        ROLL NO: <strong>{scanResult.student.student_code}</strong> | {scanResult.student.college_name}
                      </div>

                      {scanResult.subscription && (
                        <div style={{ marginTop: '10px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Entitlement: <strong>{scanResult.subscription.meal_entitlement_snapshot?.toUpperCase()}</strong></span>
                          <span>Valid Through: <strong>{scanResult.subscription.valid_until}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: '1rem', lineHeight: 1.4 }}>
                    {scanResult.message}
                  </p>
                </div>
              )}

              {scanResult && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingTop: '16px',
                  marginTop: '16px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Auto-rearmed for next student.
                  </span>
                  <button onClick={() => setScanResult(null)} className="btn btn-outline btn-sm" style={{ borderColor: '#FFF', color: '#FFF' }}>
                    CLEAR RESULT
                  </button>
                </div>
              )}
            </div>

            {/* Recent Scans Live Feed */}
            <div style={{
              backgroundColor: 'var(--color-maroon-950)',
              border: '2px solid rgba(232, 214, 173, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                  RECENT VERIFIED SCANS ({selectedSession.toUpperCase()})
                </div>
                <span className="badge badge-live">
                  {recentScans.length} CHECKED IN
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentScans.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-sand-200)', padding: '16px 0', textAlign: 'center' }}>
                    No students checked in for {selectedSession} today yet.
                  </div>
                ) : (
                  recentScans.map(att => {
                    const st = store.users.find(u => u.id === att.student_id);
                    const sub = store.subscriptions.find(s => s.id === att.subscription_id);
                    return (
                      <div
                        key={att.id}
                        style={{
                          backgroundColor: '#221E19',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle2 size={16} color="#4CAF50" />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                              {st?.full_name || 'Enrolled Student'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-sand-200)', fontFamily: 'monospace' }}>
                              {st?.student_code} • {sub?.dietary_type_snapshot?.toUpperCase() || 'VEG'}
                            </div>
                          </div>
                        </div>

                        <div className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--color-sand-200)' }}>
                          {new Date(att.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
