import React from 'react';
import { Award, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export function SplitFeature({ onOpenPlans }) {
  return (
    <section style={{
      backgroundColor: 'var(--color-maroon-950)',
      padding: '72px 0',
      position: 'relative'
    }}>
      <div className="container">
        
        {/* Asymmetrical Split Panel matching Reference */}
        <div className="split-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          
          {/* Left Cream Panel: Authentic Meal Breakdown */}
          <div className="card-cream split-card-left" style={{
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.1em',
                color: 'var(--color-red-600)',
                marginBottom: '6px'
              }}>
                CHEF'S SIGNATURE CAMPUS THALI
              </div>
              <h3 className="display-sub" style={{ color: 'var(--color-ink-950)', marginBottom: '8px' }}>
                AUTHENTIC SOUTH & NORTH INDIAN MEALS
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-ink-700)', maxWidth: '440px', lineHeight: 1.4 }}>
                A perfectly balanced traditional thali crafted with rich regional flavors, fresh hand-ground spices, and unlimited satisfaction.
              </p>
            </div>

            {/* Circular Thali Image with authentic food labels */}
            <div className="split-thali-img" style={{
              margin: '28px auto',
              position: 'relative',
              width: '260px',
              maxWidth: '100%',
              height: '260px',
              borderRadius: '50%',
              border: '4px solid var(--color-ink-950)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)'
            }}>
              <img 
                src="/images/south_indian_thali.jpg" 
                alt="South Indian Traditional Thali"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Overlay Pills matching the reference diagram */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '35%',
                backgroundColor: 'rgba(21, 6, 4, 0.85)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                SAMBAR
              </div>
              <div style={{
                position: 'absolute',
                top: '40%',
                right: '10px',
                backgroundColor: 'rgba(21, 6, 4, 0.85)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                RASAM
              </div>
              <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '25%',
                backgroundColor: 'rgba(21, 6, 4, 0.85)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                PORIYAL
              </div>
              <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '30%',
                backgroundColor: 'rgba(21, 6, 4, 0.85)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                PAPAD
              </div>
              <div style={{
                position: 'absolute',
                top: '45%',
                left: '10px',
                backgroundColor: 'rgba(21, 6, 4, 0.85)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                PICKLE
              </div>
            </div>

            {/* Bottom Row: Authenticity Seal + Serving Schedule */}
            <div className="split-bottom-row" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--color-line)',
              paddingTop: '20px'
            }}>
              {/* Circular Authenticity Stamp from the reference image */}
              <div className="stamp-seal">
                <div className="stamp-inner">
                  <Award size={18} color="var(--color-red-600)" style={{ marginBottom: '2px' }} />
                  <div className="stamp-text">AUTHENTIC</div>
                  <div className="stamp-text" style={{ fontSize: '0.8rem', fontWeight: 900 }}>CAMPUS</div>
                  <div className="stamp-text">DINING</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--color-ink-700)', marginTop: '2px' }}>
                    ★ FRESH EVERY DAY ★
                  </div>
                </div>
              </div>

              <div style={{ maxWidth: '200px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--color-ink-950)', textTransform: 'uppercase' }}>
                  CAMPUS SCHEDULE
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-700)', lineHeight: 1.4 }}>
                  Lunch: 12:00 PM – 3:00 PM<br />
                  Dinner: 7:30 PM – 10:30 PM<br />
                  Location: Block 4 Dining Hall
                </div>
              </div>
            </div>

          </div>

          {/* Right Red Panel: Bold Statement matching Reference */}
          <div className="card-red split-card-right" style={{
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--color-red-600)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle background graphic texture */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              pointerEvents: 'none'
            }} />

            <div style={{
              fontSize: '0.82rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.12em',
              color: 'var(--color-cream-100)',
              marginBottom: '12px'
            }}>
              TASTE. COMMUNITY. CONSISTENCY.
            </div>

            <h3 className="display-title" style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
              color: 'var(--color-cream-50)',
              lineHeight: 0.95,
              marginBottom: '16px'
            }}>
              BUILT FOR STUDENTS.<br />
              LOVED BY EVERYONE.
            </h3>

            {/* Marathi & Hindi Authentic Flair Text */}
            <div style={{
              fontFamily: "'Mukta', var(--font-body), sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-sand-200)',
              marginBottom: '16px',
              letterSpacing: '0.01em',
              lineHeight: 1.35
            }}>
              उत्कृष्ट चव • सोपे कॅम्पस जीवन<br />
              <span style={{ fontSize: '1rem', color: 'var(--color-cream-100)', fontWeight: 600 }}>
                लाजवाब स्वाद • आसान कैंपस जीवन
              </span>
            </div>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--color-cream-50)',
              lineHeight: 1.5,
              marginBottom: '32px',
              maxWidth: '460px'
            }}>
              Dive into bold tastes, nutritious traditional staples, and flexible dining plans crafted specifically for students and faculty.
            </p>

            <div>
              <button 
                onClick={onOpenPlans}
                className="btn btn-dark btn-lg"
                style={{
                  backgroundColor: 'var(--color-maroon-950)',
                  color: 'var(--color-cream-50)',
                  border: '1px solid rgba(232, 214, 173, 0.4)'
                }}
              >
                DISCOVER PLANS
                <ArrowRight size={18} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
