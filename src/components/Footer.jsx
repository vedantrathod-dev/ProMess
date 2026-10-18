import React from 'react';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, Shield, ArrowUpRight, Heart } from 'lucide-react';

export function Footer({ onOpenAuth, onNavigate }) {
  return (
    <footer style={{
      backgroundColor: 'var(--color-maroon-950)',
      color: 'var(--color-sand-200)',
      borderTop: '2px solid var(--color-ink-950)'
    }}>
      
      {/* Top Banner strip directly matching the bottom bar of the Reference Image */}
      <div style={{
        backgroundColor: 'var(--color-red-700)',
        color: 'var(--color-cream-50)',
        padding: '16px 0',
        borderBottom: '1px solid rgba(255, 247, 230, 0.15)'
      }}>
        <div className="container footer-banner-flex" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
              DESIGNED WITH PASSION, BUILT FOR CAMPUS LIVING.
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-cream-100)' }}>
              Fast counter scans • Transparent dues • Automated leave extension credits
            </div>
          </div>

          <button
            onClick={() => onOpenAuth('register')}
            className="btn btn-dark btn-sm"
            style={{
              backgroundColor: 'var(--color-maroon-950)',
              color: 'var(--color-cream-50)',
              border: '1px solid var(--color-sand-200)'
            }}
          >
            LET'S DINE TOGETHER!
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="container" style={{ padding: '56px 20px 36px' }}>
        <div className="footer-directory-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '36px',
          marginBottom: '44px'
        }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--color-red-600)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}>
                <UtensilsCrossed size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-cream-50)' }}>
                PRO<span style={{ color: 'var(--color-red-500)' }}>MESS</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--color-sand-200)', marginBottom: '14px' }}>
              Campus dining managed with clarity. Authentic regional food, high-speed QR check-ins, and flexible meal plans.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-sand-200)' }}>
              © 2026 ProMess Dining Platform.<br />All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-cream-50)', marginBottom: '14px' }}>
              EXPERIENCES
            </div>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', lineHeight: 2.1 }}>
              <li>
                <a href="#menu-section" style={{ color: 'var(--color-sand-200)', textDecoration: 'none' }}>
                  Today's Daily Menu
                </a>
              </li>
              <li>
                <a href="#plans-section" style={{ color: 'var(--color-sand-200)', textDecoration: 'none' }}>
                  Meal Plans & Pricing
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('login')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-sand-200)', cursor: 'pointer', fontSize: 'inherit' }}
                >
                  Student Dining Pass
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('staff')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-sand-200)', cursor: 'pointer', fontSize: 'inherit' }}
                >
                  Counter Scanner Operator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('staff')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-sand-200)', cursor: 'pointer', fontSize: 'inherit' }}
                >
                  Mess Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Service Hours */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-cream-50)', marginBottom: '14px' }}>
              SERVICE HOURS
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-cream-50)' }}>
                <Clock size={14} color="#C5090D" />
                <strong>Lunch Session:</strong>
              </div>
              <div style={{ paddingLeft: '22px', marginBottom: '8px' }}>
                12:00 PM – 03:00 PM (Mon–Sun)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-cream-50)' }}>
                <Clock size={14} color="#C5090D" />
                <strong>Dinner Session:</strong>
              </div>
              <div style={{ paddingLeft: '22px' }}>
                07:30 PM – 10:30 PM (Mon–Sun)
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-cream-50)', marginBottom: '14px' }}>
              CAMPUS DESK
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <MapPin size={16} color="#C5090D" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>
                  Ground Floor, Canteen Dining Hall<br />
                  MIT ACSC, Alandi, Pune, Maharashtra
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <Phone size={14} color="#C5090D" />
                <span>+91 94422 10890</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={14} color="#C5090D" />
                <a href="mailto:dining@promess.mitacsc.edu" style={{ color: 'inherit', textDecoration: 'none' }}>
                  dining@promess.mitacsc.edu
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom divider with developer and privacy links */}
        <div style={{
          borderTop: '1px solid rgba(232, 214, 173, 0.1)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--color-ink-500)'
        }}>
          <div>
            ProMess Campus Living OS • Built with ReactJS & Firebase Architecture
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }}>Dining Terms</span>
            <span>•</span>
            <span onClick={() => onOpenAuth('staff')} style={{ cursor: 'pointer', color: 'var(--color-sand-200)' }}>
              Staff Workspace
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
