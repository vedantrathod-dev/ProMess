import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Smartphone, Utensils } from 'lucide-react';

export function Hero({ onOpenAuth, onNavigate }) {
  const [sampleQrDataUrl, setSampleQrDataUrl] = useState('');

  useEffect(() => {
    // Generate real scannable QR code for the hero demo pass preview
    QRCode.toDataURL('MESSPASS:a7f92e41b9c34d82a10e7b8', {
      margin: 1,
      width: 140,
      color: {
        dark: '#15130F',
        light: '#FFFFFF'
      }
    }).then(setSampleQrDataUrl);
  }, []);

  return (
    <section style={{
      backgroundColor: 'var(--color-maroon-950)',
      backgroundImage: 'radial-gradient(ellipse at 80% 20%, rgba(197, 9, 13, 0.18) 0%, transparent 60%)',
      paddingTop: '48px',
      paddingBottom: '60px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          
          {/* Left Hero Column */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'rgba(232, 214, 173, 0.1)',
              border: '1px solid rgba(232, 214, 173, 0.25)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '18px'
            }}>
              <Sparkles size={14} color="#E8D6AD" />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                color: 'var(--color-sand-200)'
              }}>
                FRESH MEALS. SIMPLE CAMPUS LIVING.
              </span>
            </div>

            {/* Oversized Headline matching Reference Typography */}
            <h1 className="display-hero" style={{ marginBottom: '16px' }}>
              <span style={{ color: 'var(--color-cream-50)', display: 'block' }}>GOOD FOOD.</span>
              <span style={{ color: 'var(--color-red-500)', display: 'block' }}>ZERO MESS.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--color-sand-200)',
              maxWidth: '520px',
              lineHeight: 1.5,
              marginBottom: '32px'
            }}>
              Choose your meal plan, carry one permanent QR dining pass, and keep every meal, payment, and leave update in one place.
            </p>

            {/* Action Buttons */}
            <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary btn-lg"
              >
                JOIN THE MESS
                <ArrowRight size={18} />
              </button>

              <a 
                href="#menu-section"
                className="btn btn-outline btn-lg"
              >
                VIEW TODAY'S MENU
              </a>
            </div>

            {/* 3 Compact Benefit Cards from the reference image */}
            <div className="hero-benefits-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '16px',
              borderTop: '1px solid rgba(232, 214, 173, 0.15)',
              paddingTop: '24px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-red-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Smartphone size={18} color="#FFF7E6" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-cream-50)' }}>
                    ONE PASS
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-sand-200)', lineHeight: 1.3 }}>
                    Instant QR dining access
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-red-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Utensils size={18} color="#FFF7E6" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-cream-50)' }}>
                    FLEXIBLE PLANS
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-sand-200)', lineHeight: 1.3 }}>
                    Veg & Non-Veg 15-90d
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-red-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={18} color="#FFF7E6" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-cream-50)' }}>
                    CLEAR DUES
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-sand-200)', lineHeight: 1.3 }}>
                    Receipts & leave credits
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Reference-Inspired Visual Device & Pass Preview */}
          <div style={{ position: 'relative' }}>
            
            {/* Tilted Perspective Device Display with Authentic Food Photo */}
            <div style={{
              backgroundColor: 'var(--color-maroon-900)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid rgba(232, 214, 173, 0.25)',
              padding: '16px',
              boxShadow: 'var(--shadow-float)',
              position: 'relative'
            }}>
              
              {/* Laptop Header Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(232, 214, 173, 0.12)',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.06em',
                  color: 'var(--color-sand-200)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: '#FFBD2E' }}>★</span>
                  AWARD-WINNING HYGIENIC DINING
                </div>
              </div>

              {/* Laptop Screen Content: Red Restaurant Panel with Food Image */}
              <div style={{
                backgroundColor: 'var(--color-red-700)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                color: 'var(--color-cream-50)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.4rem',
                  lineHeight: 0.95,
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                  textAlign: 'center'
                }}>
                  AUTHENTIC CAMPUS MEALS
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  textAlign: 'center',
                  letterSpacing: '0.08em',
                  color: 'var(--color-cream-100)',
                  marginBottom: '16px'
                }}>
                  THE HIGHEST QUALITY NUTRITION EVERY SINGLE DAY
                </div>

                {/* Biryani in Copper Pot photo matching reference */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '220px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 247, 230, 0.25)'
                }}>
                  <img 
                    src="/images/hero_biryani.jpg" 
                    alt="Authentic Style Biryani in Copper Handi"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(21, 6, 4, 0.85)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.06em',
                    color: 'var(--color-cream-50)'
                  }}>
                    AUTHENTIC DINDIGUL SEERAGA SAMBA
                  </div>
                </div>
              </div>

              {/* Floating Live Student Pass Preview Card */}
              <div className="hero-floating-pass" style={{
                position: 'absolute',
                bottom: '-24px',
                right: '-16px',
                backgroundColor: 'var(--color-cream-50)',
                color: 'var(--color-ink-950)',
                border: '2px solid var(--color-ink-950)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                width: '270px',
                maxWidth: 'calc(100% - 10px)',
                boxShadow: 'var(--shadow-float)',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-nonveg">NON-VEG FULL BOARD</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-red-600)' }}>
                    18 DAYS LEFT
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {sampleQrDataUrl && (
                    <img 
                      src={sampleQrDataUrl} 
                      alt="Student QR Pass"
                      style={{
                        width: '76px',
                        height: '76px',
                        border: '1px solid var(--color-ink-950)',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-ink-950)' }}>
                      Karthik Raja
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-700)', fontFamily: 'monospace' }}>
                      ID: 24BCS108
                    </div>
                    <div style={{
                      marginTop: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--color-success)'
                    }}>
                      <CheckCircle2 size={13} />
                      Lunch Checked In
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--color-ink-500)',
                  marginTop: '8px',
                  borderTop: '1px solid var(--color-line)',
                  paddingTop: '6px'
                }}>
                  *Illustrative sample student dining pass
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Marquee Strip below Hero directly from Reference Image */}
      <div className="marquee-wrapper" style={{ marginTop: '56px' }}>
        <div className="marquee-content">
          CRAVE, THE PROMESS WAY. GET READY TO EAT. ✦ CRAVE, THE PROMESS WAY. GET READY TO EAT. ✦ CRAVE, THE PROMESS WAY. GET READY TO EAT. ✦ CRAVE, THE PROMESS WAY. GET READY TO EAT. ✦ CRAVE, THE PROMESS WAY. GET READY TO EAT. ✦
        </div>
      </div>
    </section>
  );
}
