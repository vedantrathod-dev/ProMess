import React from 'react';

export function FoodGallery() {
  const images = [
    {
      src: '/images/crispy_dosa.jpg',
      title: 'Golden Ghee Roast Dosa',
      subtitle: 'Crispy edges & soft center'
    },
    {
      src: '/images/filter_coffee.jpg',
      title: 'Kumbakonam Degree Filter Coffee',
      subtitle: 'Frothy, aromatic, slow-brewed'
    },
    {
      isTextCard: true,
      headline: 'TURN UP THE FLAVOR, TURN UP THE FUN.',
      sub: 'PROMESS CAMPUS DINING'
    },
    {
      src: '/images/chinese_noodles.jpg',
      title: 'Wok-Tossed Hakka Noodles',
      subtitle: 'Fresh crunchy vegetables'
    }
  ];

  return (
    <section style={{
      backgroundColor: 'var(--color-maroon-950)',
      padding: '72px 0',
      borderBottom: '2px solid rgba(232, 214, 173, 0.15)'
    }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 className="display-title" style={{ color: 'var(--color-cream-50)' }}>
            FOOD <span style={{ color: 'var(--color-red-500)' }}>GALLERY</span>
          </h2>
          <p style={{ color: 'var(--color-sand-200)', fontSize: '0.95rem', marginTop: '6px' }}>
            A glimpse into the daily dishes prepared across our campus dining facilities.
          </p>
        </div>

        {/* Gallery Strip matching Reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px'
        }}>
          {images.map((item, idx) => {
            if (item.isTextCard) {
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-ink-950)',
                    border: '1.5px solid var(--color-red-600)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    color: 'var(--color-cream-50)',
                    lineHeight: 1.1,
                    marginBottom: '10px'
                  }}>
                    {item.headline}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.1em',
                    color: 'var(--color-red-500)'
                  }}>
                    {item.sub}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                style={{
                  height: '240px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(232, 214, 173, 0.2)',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 14px',
                  background: 'linear-gradient(to top, rgba(21, 6, 4, 0.92) 0%, transparent 100%)'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    color: 'var(--color-cream-50)'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-sand-200)' }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
