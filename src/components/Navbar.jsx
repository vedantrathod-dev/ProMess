import React, { useState, useEffect, useRef } from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  User, 
  QrCode, 
  Shield, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  ChevronDown, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle,
  Home
} from 'lucide-react';

export function Navbar({ currentUser, onOpenAuth, onNavigate, activeView, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileMenuRef = useRef(null);
  const [serviceStatus, setServiceStatus] = useState({ text: 'Serving Lunch', isLive: true, session: 'lunch' });

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Close modal or dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirm) setShowLogoutConfirm(false);
        if (profileOpen) setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm, profileOpen]);

  // Compute live meal service status based on local time
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const curTime = hours * 60 + minutes;

      // Lunch: 12:00 (720) to 15:00 (900)
      if (curTime >= 720 && curTime <= 900) {
        setServiceStatus({ text: 'Serving Lunch (12:00 – 3:00 PM)', isLive: true, session: 'lunch' });
      }
      // Dinner: 19:30 (1170) to 22:30 (1350)
      else if (curTime >= 1170 && curTime <= 1350) {
        setServiceStatus({ text: 'Serving Dinner (7:30 – 10:30 PM)', isLive: true, session: 'dinner' });
      }
      // Between sessions
      else if (curTime < 720) {
        setServiceStatus({ text: 'Next: Lunch at 12:00 PM', isLive: false, session: 'lunch' });
      } else if (curTime > 900 && curTime < 1170) {
        setServiceStatus({ text: 'Next: Dinner at 7:30 PM', isLive: false, session: 'dinner' });
      } else {
        setServiceStatus({ text: 'Kitchen Closed for the Night', isLive: false, session: 'closed' });
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Formatted user identity helpers
  const displayName = currentUser?.full_name || currentUser?.displayName || currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const displayEmail = currentUser?.email || '';
  const displayRoll = currentUser?.student_code || (currentUser?.role === 'student' ? 'Student' : currentUser?.role === 'admin' ? 'Chief Warden' : 'Counter Operator');

  const getInitials = (name) => {
    if (!name) return 'U';
    const clean = name.trim().split(/\s+/);
    if (clean.length >= 2) {
      return (clean[0][0] + clean[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--color-maroon-950)',
      borderBottom: '1px solid rgba(232, 214, 173, 0.15)',
      padding: '12px 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Wordmark matching reference "TAMIZHAN MESS" -> "PROMESS" */}
        <div 
          onClick={() => { onNavigate('home'); setMobileOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: 'var(--color-red-600)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cream-50)'
          }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <span className="brand-wordmark-title" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.9rem',
              letterSpacing: '0.04em',
              color: 'var(--color-cream-50)'
            }}>
              PRO<span style={{ color: 'var(--color-red-500)' }}>MESS</span>
            </span>
            <div className="brand-wordmark-sub" style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-sand-200)',
              marginTop: '-4px'
            }}>
              CAMPUS DINING PLATFORM
            </div>
          </div>
        </div>

        {/* Live Service Indicator Badge */}
        <div className="badge badge-live live-badge-desktop">
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: serviceStatus.isLive ? '#4CAF50' : '#FF9800',
            boxShadow: serviceStatus.isLive ? '0 0 8px #4CAF50' : 'none',
            display: 'inline-block'
          }} />
          <span style={{ color: 'var(--color-cream-50)', fontWeight: 600 }}>{serviceStatus.text}</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button 
              onClick={() => onNavigate('home')}
              style={{
                background: 'none',
                border: 'none',
                color: activeView === 'home' ? 'var(--color-cream-50)' : 'var(--color-sand-200)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                borderBottom: activeView === 'home' ? '2px solid var(--color-red-500)' : '2px solid transparent',
                paddingBottom: '4px'
              }}
            >
              HOME
            </button>

            <a 
              href="#menu-section"
              onClick={() => activeView !== 'home' && onNavigate('home')}
              style={{
                color: 'var(--color-sand-200)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              OUR MENU
            </a>

            <a 
              href="#plans-section"
              onClick={() => activeView !== 'home' && onNavigate('home')}
              style={{
                color: 'var(--color-sand-200)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              PLANS & PRICING
            </a>

            <a 
              href="#why-section"
              onClick={() => activeView !== 'home' && onNavigate('home')}
              style={{
                color: 'var(--color-sand-200)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              WHY PROMESS
            </a>
          </div>

          {/* User Auth Buttons or Top-Right Profile Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
            {!currentUser ? (
              <>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: 'var(--color-sand-200)', color: 'var(--color-cream-50)' }}
                >
                  <User size={15} />
                  SIGN IN
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-primary btn-sm"
                >
                  JOIN MESS
                </button>
              </>
            ) : (
              <>
                {/* Quick Portal Switcher Button for Instant 1-Click Access */}
                {currentUser.role === 'student' ? (
                  <button 
                    onClick={() => onNavigate('student')}
                    className="btn btn-outline btn-sm nav-quick-portal-btn"
                    style={{
                      borderColor: activeView === 'student' ? 'var(--color-red-500)' : 'var(--color-sand-200)',
                      backgroundColor: activeView === 'student' ? 'rgba(197, 9, 13, 0.2)' : 'transparent',
                      color: 'var(--color-cream-50)'
                    }}
                  >
                    <QrCode size={16} />
                    STUDENT PORTAL
                  </button>
                ) : currentUser.role === 'counter_operator' ? (
                  <button 
                    onClick={() => onNavigate('counter')}
                    className="btn btn-primary btn-sm nav-quick-portal-btn"
                    style={{
                      backgroundColor: activeView === 'counter' ? '#B71C1C' : 'var(--color-red-600)'
                    }}
                  >
                    <QrCode size={16} />
                    COUNTER SCANNER
                  </button>
                ) : (
                  <button 
                    onClick={() => onNavigate('admin')}
                    className="btn btn-primary btn-sm nav-quick-portal-btn"
                    style={{
                      backgroundColor: activeView === 'admin' ? 'var(--color-maroon-900)' : 'var(--color-red-600)',
                      borderColor: 'var(--color-sand-200)'
                    }}
                  >
                    <Shield size={16} />
                    ADMIN WORKSPACE
                  </button>
                )}

                {/* Top-Right Profile Dropdown Pill */}
                <div style={{ position: 'relative' }} ref={profileMenuRef}>
                  <button
                    id="profile-dropdown-trigger"
                    type="button"
                    onClick={() => setProfileOpen(prev => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px 4px 5px',
                      backgroundColor: profileOpen ? 'rgba(197, 9, 13, 0.28)' : 'rgba(232, 214, 173, 0.08)',
                      border: `1.5px solid ${profileOpen ? 'var(--color-red-500)' : 'rgba(232, 214, 173, 0.28)'}`,
                      borderRadius: '9999px',
                      color: 'var(--color-cream-50)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: profileOpen ? '0 0 16px rgba(197, 9, 13, 0.35)' : 'none'
                    }}
                    title="User Profile & Quick Actions"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                  >
                    {/* User Avatar */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-red-600)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      overflow: 'hidden',
                      border: '1.5px solid var(--color-sand-200)',
                      flexShrink: 0
                    }}>
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt={displayName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span>{getInitials(displayName)}</span>
                      )}
                    </div>

                    {/* Name & Role Pill */}
                    <div className="profile-pill-text" style={{ textAlign: 'left', lineHeight: 1.15 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.92rem',
                        letterSpacing: '0.04em',
                        color: 'var(--color-cream-50)',
                        maxWidth: '110px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {displayName}
                      </div>
                      <div style={{
                        fontSize: '0.66rem',
                        color: 'var(--color-sand-300)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}>
                        {currentUser.role === 'student' ? (currentUser.student_code || 'Student') : currentUser.role === 'admin' ? 'Admin' : 'Counter'}
                      </div>
                    </div>

                    <ChevronDown 
                      size={15} 
                      style={{
                        color: 'var(--color-sand-200)',
                        transition: 'transform 0.2s ease',
                        transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        marginLeft: '1px'
                      }}
                    />
                  </button>

                  {/* Profile Dropdown Menu Card */}
                  {profileOpen && (
                    <div 
                      id="profile-dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '290px',
                        backgroundColor: 'var(--color-maroon-950)',
                        border: '1.5px solid var(--color-line-gold)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 16px 45px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(197, 9, 13, 0.35)',
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}
                    >
                      {/* Dropdown User Info Header */}
                      <div style={{
                        background: 'linear-gradient(180deg, rgba(66, 11, 8, 0.95) 0%, rgba(33, 6, 4, 0.98) 100%)',
                        padding: '16px',
                        borderBottom: '1px solid rgba(232, 214, 173, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-red-600)',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            overflow: 'hidden',
                            border: '2px solid var(--color-sand-200)',
                            flexShrink: 0
                          }}>
                            {currentUser.photoURL ? (
                              <img 
                                src={currentUser.photoURL} 
                                alt={displayName} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              getInitials(displayName)
                            )}
                          </div>
                          <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.1rem',
                              letterSpacing: '0.04em',
                              color: 'var(--color-cream-50)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {displayName}
                            </div>
                            <div style={{
                              fontSize: '0.74rem',
                              color: 'var(--color-sand-300)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {displayEmail || 'Active ProMess User'}
                            </div>
                          </div>
                        </div>

                        {/* Roll Number / Role Badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(232, 214, 173, 0.1)',
                          border: '1px solid rgba(232, 214, 173, 0.2)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          color: 'var(--color-sand-200)',
                          fontFamily: 'monospace'
                        }}>
                          <GraduationCap size={13} color="var(--color-sand-200)" />
                          <span>{displayRoll ? `Roll: ${displayRoll}` : 'Authenticated Account'}</span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Actions */}
                      <div style={{ padding: '8px' }}>
                        
                        {/* Student Portal Option (Explicit User Requirement) */}
                        <button
                          id="nav-profile-student-portal-btn"
                          type="button"
                          onClick={() => {
                            onNavigate('student');
                            setProfileOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: activeView === 'student' ? '1px solid var(--color-red-600)' : '1px solid transparent',
                            backgroundColor: activeView === 'student' ? 'rgba(197, 9, 13, 0.22)' : 'transparent',
                            color: 'var(--color-cream-50)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (activeView !== 'student') e.currentTarget.style.backgroundColor = 'rgba(232, 214, 173, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            if (activeView !== 'student') e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(197, 9, 13, 0.25)',
                            color: 'var(--color-red-500)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <QrCode size={18} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', letterSpacing: '0.04em' }}>
                              STUDENT PORTAL
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-sand-300)' }}>
                              QR Pass, Attendance & Dues
                            </div>
                          </div>
                          {activeView === 'student' && (
                            <span style={{
                              fontSize: '0.62rem',
                              backgroundColor: 'var(--color-red-600)',
                              color: '#FFF',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700
                            }}>
                              ACTIVE
                            </span>
                          )}
                        </button>

                        {/* Admin Workspace (if admin) */}
                        {currentUser.role === 'admin' && (
                          <button
                            id="nav-profile-admin-workspace-btn"
                            type="button"
                            onClick={() => {
                              onNavigate('admin');
                              setProfileOpen(false);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: activeView === 'admin' ? '1px solid var(--color-sand-200)' : '1px solid transparent',
                              backgroundColor: activeView === 'admin' ? 'rgba(232, 214, 173, 0.12)' : 'transparent',
                              color: 'var(--color-cream-50)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              marginTop: '4px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (activeView !== 'admin') e.currentTarget.style.backgroundColor = 'rgba(232, 214, 173, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                              if (activeView !== 'admin') e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(232, 214, 173, 0.15)',
                              color: 'var(--color-sand-200)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Shield size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', letterSpacing: '0.04em' }}>
                                ADMIN WORKSPACE
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-sand-300)' }}>
                                Renewals, Dues & Leaves
                              </div>
                            </div>
                            {activeView === 'admin' && (
                              <span style={{
                                fontSize: '0.62rem',
                                backgroundColor: 'var(--color-sand-200)',
                                color: 'var(--color-ink-950)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}>
                                ACTIVE
                              </span>
                            )}
                          </button>
                        )}

                        {/* Counter Scanner (if counter operator) */}
                        {currentUser.role === 'counter_operator' && (
                          <button
                            id="nav-profile-counter-btn"
                            type="button"
                            onClick={() => {
                              onNavigate('counter');
                              setProfileOpen(false);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: activeView === 'counter' ? '1px solid var(--color-red-600)' : '1px solid transparent',
                              backgroundColor: activeView === 'counter' ? 'rgba(197, 9, 13, 0.22)' : 'transparent',
                              color: 'var(--color-cream-50)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              marginTop: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(197, 9, 13, 0.25)',
                              color: 'var(--color-red-500)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <QrCode size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', letterSpacing: '0.04em' }}>
                                COUNTER SCANNER
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-sand-300)' }}>
                                Live QR check-in station
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Back to Home / Public Restaurant Menu */}
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate('home');
                            setProfileOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '9px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid transparent',
                            backgroundColor: 'transparent',
                            color: 'var(--color-cream-50)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginTop: '2px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(232, 214, 173, 0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(232, 214, 173, 0.1)',
                            color: 'var(--color-sand-200)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Home size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.94rem', letterSpacing: '0.04em' }}>
                              CAMPUS MESS HOME
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-sand-300)' }}>
                              Explore daily menus & meal plans
                            </div>
                          </div>
                        </button>

                        {/* Subtle Divider */}
                        <div style={{ height: '1px', backgroundColor: 'rgba(232, 214, 173, 0.18)', margin: '8px 4px' }} />

                        {/* Sign Out Option (Triggers Confirmation Modal) */}
                        <button
                          id="nav-profile-signout-btn"
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(197, 9, 13, 0.3)',
                            backgroundColor: 'rgba(197, 9, 13, 0.12)',
                            color: '#FF8A80',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(197, 9, 13, 0.3)';
                            e.currentTarget.style.color = '#FFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(197, 9, 13, 0.12)';
                            e.currentTarget.style.color = '#FF8A80';
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(197, 9, 13, 0.35)',
                            color: 'var(--color-red-500)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <LogOut size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', letterSpacing: '0.04em' }}>
                              SIGN OUT
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-sand-300)' }}>
                              End session with confirmation
                            </div>
                          </div>
                        </button>

                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle-btn"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          backgroundColor: 'var(--color-maroon-900)',
          padding: '20px',
          borderTop: '1px solid var(--color-line-gold)',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button 
              onClick={() => { onNavigate('home'); setMobileOpen(false); }}
              className="btn btn-outline-dark" 
              style={{ color: 'var(--color-cream-50)', borderColor: 'var(--color-line-gold)', textAlign: 'left' }}
            >
              HOME
            </button>
            <a 
              href="#menu-section"
              onClick={() => setMobileOpen(false)}
              className="btn btn-outline-dark" 
              style={{ color: 'var(--color-cream-50)', borderColor: 'var(--color-line-gold)', textAlign: 'left' }}
            >
              OUR MENU
            </a>
            <a 
              href="#plans-section"
              onClick={() => setMobileOpen(false)}
              className="btn btn-outline-dark" 
              style={{ color: 'var(--color-cream-50)', borderColor: 'var(--color-line-gold)', textAlign: 'left' }}
            >
              PLANS & PRICING
            </a>

            {!currentUser ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => { onOpenAuth('login'); setMobileOpen(false); }}
                  className="btn btn-outline btn-sm" 
                  style={{ flex: 1 }}
                >
                  SIGN IN
                </button>
                <button 
                  onClick={() => { onOpenAuth('register'); setMobileOpen(false); }}
                  className="btn btn-primary btn-sm" 
                  style={{ flex: 1 }}
                >
                  JOIN MESS
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                
                {/* Mobile Profile Card */}
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(232, 214, 173, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-red-600)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    flexShrink: 0,
                    border: '1.5px solid var(--color-sand-200)'
                  }}>
                    {getInitials(displayName)}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--color-cream-50)' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-sand-300)', fontFamily: 'monospace' }}>
                      {displayRoll ? `Roll: ${displayRoll}` : displayEmail}
                    </div>
                  </div>
                </div>

                {/* Mobile Student Portal Option */}
                <button 
                  onClick={() => { onNavigate('student'); setMobileOpen(false); }}
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: 'center' }}
                >
                  <QrCode size={16} />
                  STUDENT PORTAL
                </button>

                {currentUser.role === 'counter_operator' && (
                  <button 
                    onClick={() => { onNavigate('counter'); setMobileOpen(false); }}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#B71C1C', justifyContent: 'center' }}
                  >
                    <QrCode size={16} />
                    COUNTER SCANNER
                  </button>
                )}

                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => { onNavigate('admin'); setMobileOpen(false); }}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--color-sand-200)', justifyContent: 'center' }}
                  >
                    <Shield size={16} />
                    ADMIN WORKSPACE
                  </button>
                )}

                {/* Mobile Sign Out with Confirmation Trigger */}
                <button 
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="btn btn-dark btn-sm"
                  style={{
                    backgroundColor: 'rgba(197, 9, 13, 0.25)',
                    borderColor: 'var(--color-red-600)',
                    color: '#FF8A80',
                    justifyContent: 'center'
                  }}
                >
                  <LogOut size={16} />
                  SIGN OUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal ("Really signed out hona hai") */}
      {showLogoutConfirm && (
        <div 
          id="signout-confirm-modal"
          className="modal-backdrop"
          onClick={() => setShowLogoutConfirm(false)}
          style={{ zIndex: 1200 }}
        >
          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              backgroundColor: 'var(--color-maroon-950)',
              border: '1.5px solid var(--color-line-gold)',
              color: 'var(--color-cream-50)',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(197, 9, 13, 0.35)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              backgroundColor: 'var(--color-maroon-900)',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(232, 214, 173, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <AlertTriangle size={20} color="var(--color-red-500)" />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  letterSpacing: '0.08em',
                  color: 'var(--color-cream-50)'
                }}>
                  SECURITY & SESSION CONFIRMATION
                </span>
              </div>
              <button 
                id="close-logout-modal-btn"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-sand-200)', cursor: 'pointer' }}
                title="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '26px 26px 30px 26px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 9, 13, 0.16)',
                border: '2px solid var(--color-red-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: 'var(--color-red-500)',
                boxShadow: '0 0 20px rgba(197, 9, 13, 0.25)'
              }}>
                <LogOut size={32} />
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                letterSpacing: '0.04em',
                color: 'var(--color-cream-50)',
                marginBottom: '6px'
              }}>
                REALLY SIGN OUT?
              </h3>

              <div style={{
                fontSize: '1.02rem',
                color: 'var(--color-cream-100)',
                fontWeight: 600,
                marginBottom: '4px'
              }}>
                Are you sure you want to sign out of ProMess?
              </div>

              <div style={{
                fontSize: '0.88rem',
                color: 'var(--color-sand-200)',
                marginBottom: '18px',
                fontStyle: 'italic'
              }}>
                (Kya aap sach me signed out hona chahte hain?)
              </div>

              {/* User Identity Chip */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(232, 214, 173, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-red-600)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1.5px solid var(--color-sand-200)'
                }}>
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    color: 'var(--color-cream-50)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-sand-300)', fontFamily: 'monospace' }}>
                    {displayRoll ? `Roll No / Role: ${displayRoll}` : displayEmail}
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '0.82rem',
                color: 'var(--color-sand-300)',
                lineHeight: 1.5,
                marginBottom: '24px'
              }}>
                Signing out will safely close your active mess session on this device. You will need to sign in again to access your live meal QR pass, attendance counter logs, and dining dues.
              </div>

              {/* Confirmation Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  id="cancel-signout-btn"
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn btn-outline"
                  style={{
                    borderColor: 'var(--color-sand-200)',
                    color: 'var(--color-cream-50)',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  No, Stay Signed In
                </button>

                <button 
                  id="confirm-signout-btn"
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    setProfileOpen(false);
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: 'var(--color-red-600)',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(197, 9, 13, 0.4)'
                  }}
                >
                  <LogOut size={16} />
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

