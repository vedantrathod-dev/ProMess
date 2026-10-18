import React from 'react';
import { Star, ArrowRight, UtensilsCrossed } from 'lucide-react';

export function Testimonials({ onOpenAuth }) {
  const reviews = [
    {
      stars: 5,
      quote: "I love how ProMess keeps meals simple yet so flavorful. The filter coffee and crispy ghee roast dosa alone make everyday dining worth it!",
      author: "Priya K.",
      meta: "Final Year B.Tech IT • 24BIT204"
    },
    {
      stars: 5,
      quote: "This is not just a mess, it's a seamless experience. Carrying one permanent QR pass on my phone makes lunch between lab sessions super fast.",
      author: "Rahul M.",
      meta: "Pre-Final Year ECE • 23BEC089"
    },
    {
      stars: 5,
      quote: "Transparent dues, immediate payment receipts, and the leave extension policy gave me fair credit when I visited home for 5 days.",
      author: "Ananya S.",
      meta: "First Year Mechanical • 24BME055"
    },
    {
      stars: 5,
      quote: "The Sunday chicken biryani and hot sambar hit the spot every time. Bold flavors, hygienic counters, and genuine hospitality.",
      author: "Karthik R.",
      meta: "Computer Science • 24BCS108"
    }
  ];

  return (
    <section style={{
      backgroundColor: 'var(--color-cream-50)',
      color: 'var(--color-ink-950)',
      padding: '72px 0',
      borderBottom: '2px solid var(--color-ink-950)'
    }}>
      <div className="container">
        
        {/* Main Grid: Left Testimonials + Right "Fuel Up" Panel */}
        <div className="testimonials-main-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '36px',
          alignItems: 'stretch'
        }}>
          
          {/* Left Column: Real Talk from Real Foodies */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 className="display-sub" style={{ color: 'var(--color-ink-950)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                REAL TALK FROM REAL FOODIES
                <span style={{ color: 'var(--color-red-600)' }}>★</span>
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-700)' }}>
                Demonstration feedback from enrolled campus hostelers and day-scholars.
              </p>
            </div>

            <div className="testimonials-reviews-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '16px'
            }}>
              {reviews.map((r, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? 'var(--color-maroon-950)' : 'var(--color-red-700)',
                    color: 'var(--color-cream-50)',
                    padding: '20px 18px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                      {[...Array(r.stars)].map((_, s) => (
                        <Star key={s} size={13} fill="#FFBD2E" color="#FFBD2E" />
                      ))}
                    </div>
                    <p style={{
                      fontSize: '0.78rem',
                      lineHeight: 1.45,
                      color: 'var(--color-cream-100)',
                      marginBottom: '14px'
                    }}>
                      "{r.quote}"
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--color-cream-50)' }}>
                      — {r.author}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-sand-200)' }}>
                      {r.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: "FUEL UP WITH PROMESS" directly from Reference */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--color-cream-100)',
            border: '2px solid var(--color-ink-950)',
            borderRadius: 'var(--radius-md)',
            padding: '36px 32px',
            position: 'relative'
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              letterSpacing: '0.06em',
              color: 'var(--color-ink-950)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              FUEL UP WITH PROMESS!
            </div>

            {/* Inner Red Card with Tamil Headline from Reference */}
            <div style={{
              backgroundColor: 'var(--color-red-600)',
              color: 'var(--color-cream-50)',
              borderRadius: 'var(--radius-md)',
              padding: '28px 24px',
              position: 'relative',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'var(--color-cream-50)',
                color: 'var(--color-ink-950)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                letterSpacing: '0.05em'
              }}>
                FRESH & AUTHENTIC
              </div>

              {/* Marathi & Hindi Callout */}
              <div style={{
                marginBottom: '10px'
              }}>
                <div style={{
                  fontFamily: "'Mukta', var(--font-display), sans-serif",
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '0.01em',
                  color: 'var(--color-cream-50)'
                }}>
                  भूक लागली? चला जेवूया!
                </div>
                <div style={{
                  fontFamily: "'Mukta', var(--font-body), sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: 'var(--color-sand-200)',
                  marginTop: '4px'
                }}>
                  भूख लगी है? आइए खाना खाते हैं!
                </div>
              </div>

              <p style={{
                fontSize: '0.88rem',
                color: 'var(--color-cream-100)',
                marginBottom: '24px',
                maxWidth: '300px'
              }}>
                Hungry between classes? Carry your student pass and enjoy hot, nutritious campus meals without delays.
              </p>

              <div>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-dark"
                  style={{
                    backgroundColor: 'var(--color-maroon-950)',
                    color: 'var(--color-cream-50)',
                    border: '1px solid var(--color-sand-200)',
                    width: '100%'
                  }}
                >
                  JOIN PROMESS TODAY
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
