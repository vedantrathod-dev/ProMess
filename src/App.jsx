import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { SplitFeature } from './components/SplitFeature';
import { PricingCalculator } from './components/PricingCalculator';
import { WhyStudents } from './components/WhyStudents';
import { FoodGallery } from './components/FoodGallery';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { StudentPortal } from './components/StudentPortal';
import { AdminPortal } from './components/AdminPortal';
import { CounterScanner } from './components/CounterScanner';
import { getCurrentUser, logout, getStore, subscribeToStore } from './services/store';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [store, setStore] = useState(getStore());
  const [activeView, setActiveView] = useState('home'); // 'home' | 'student' | 'admin' | 'counter'
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login', plan: null });

  useEffect(() => {
    return subscribeToStore((newStore) => {
      setStore(newStore);
      setCurrentUser(getCurrentUser());
    });
  }, []);

  // Sync hash routing if desired
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'student') setActiveView('student');
      else if (hash === 'admin') setActiveView('admin');
      else if (hash === 'counter') setActiveView('counter');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (view) => {
    setActiveView(view);
    window.location.hash = view === 'home' ? '' : view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode = 'login', plan = null) => {
    setAuthModal({ open: true, mode, plan });
  };

  const handleCloseAuth = () => {
    setAuthModal({ open: false, mode: 'login', plan: null });
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    if (user.role === 'student') {
      handleNavigate('student');
    } else if (user.role === 'counter_operator') {
      handleNavigate('counter');
    } else {
      handleNavigate('admin');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleSelectPlan = (selectedPlan) => {
    handleOpenAuth('register', selectedPlan);
  };

  return (
    <div className="promess-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onNavigate={handleNavigate}
        activeView={activeView}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeView === 'home' && (
          <>
            <Hero onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />
            <MenuSection menus={store.menus} />
            <SplitFeature onOpenPlans={() => {
              const el = document.getElementById('plans-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />
            <PricingCalculator settings={store.settings} onSelectPlan={handleSelectPlan} />
            <WhyStudents />
            <FoodGallery />
            <Testimonials onOpenAuth={handleOpenAuth} />
          </>
        )}

        {activeView === 'student' && (
          currentUser?.role === 'student' ? (
            <StudentPortal currentUser={currentUser} onNavigate={handleNavigate} />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-cream-50)' }}>
              <h2 className="display-sub">STUDENT AUTHENTICATION REQUIRED</h2>
              <p style={{ marginTop: '10px', color: 'var(--color-sand-200)' }}>
                Please sign in with your student credentials to view your dining pass.
              </p>
              <button onClick={() => handleOpenAuth('login')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                SIGN IN AS STUDENT
              </button>
            </div>
          )
        )}

        {/* Admin Workspace - Restricted Strictly to Admin */}
        {activeView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPortal currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-cream-50)' }}>
              <h2 className="display-sub">CHIEF WARDEN ACCESS ONLY</h2>
              <p style={{ marginTop: '10px', color: 'var(--color-sand-200)' }}>
                Chief Warden / Administrator credentials required. Counter operators must use the Counter Scanner.
              </p>
              <button onClick={() => handleOpenAuth('admin')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                SIGN IN AS CHIEF WARDEN
              </button>
            </div>
          )
        )}

        {/* Counter Scanner Terminal - Fast Pass Verification Only */}
        {activeView === 'counter' && (
          currentUser?.role === 'counter_operator' || currentUser?.role === 'admin' ? (
            <CounterScanner currentUser={currentUser} onNavigate={handleNavigate} />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-cream-50)' }}>
              <h2 className="display-sub">COUNTER TERMINAL RESTRICTED</h2>
              <p style={{ marginTop: '10px', color: 'var(--color-sand-200)' }}>
                Counter Operator authorization required to scan passes.
              </p>
              <button onClick={() => handleOpenAuth('counter')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                SIGN IN AS COUNTER OPERATOR
              </button>
            </div>
          )
        )}
      </main>

      {/* Global Footer */}
      <Footer onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />

      {/* Auth & Registration Modal */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          initialPlan={authModal.plan}
          onClose={handleCloseAuth}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}
