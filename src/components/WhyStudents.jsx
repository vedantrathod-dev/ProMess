import React from 'react';
import { Leaf, ChefHat, Zap, Sparkles } from 'lucide-react';

export function WhyStudents() {
  const features = [
    {
      title: "FRESH INGREDIENTS",
      desc: "Handpicked daily from trusted local agricultural markets and farm dairies.",
      icon: <Leaf size={22} color="#FFF7E6" />
    },
    {
      title: "AUTHENTIC RECIPES",
      desc: "Traditional regional recipes made with hand-ground spices, zero adulteration.",
      icon: <ChefHat size={22} color="#FFF7E6" />
    },
    {
      title: "QUICK SERVICE",
      desc: "Instant camera and hardware QR counter check-in. Hot food, zero waiting queues.",
      icon: <Zap size={22} color="#FFF7E6" />
    },
    {
      title: "CLEAN KITCHEN",
      desc: "Hygienic steam-cooking and filtered water preparation with rigorous discipline.",
      icon: <Sparkles size={22} color="#FFF7E6" />
    }
  ];

  return (
    <section id="why-section" style={{
      backgroundColor: 'var(--color-ink-950)',
      color: 'var(--color-cream-50)',
      padding: '72px 0',
      borderBottom: '2px solid rgba(255, 247, 230, 0.12)'
    }}>
      <div className="container">
        
        {/* Header matching Reference */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 className="display-title" style={{ color: 'var(--color-cream-50)' }}>
            WHY STUDENTS LOVE <span style={{ color: 'var(--color-red-500)' }}>PROMESS</span>
          </h2>
          <p style={{
            color: 'var(--color-sand-200)',
            maxWidth: '520px',
            margin: '8px auto 0',
            fontSize: '0.95rem'
          }}>
            Not just food, it's trust, tradition, and campus community served together every day.
          </p>
        </div>

        {/* 4 Feature Mini-Cards matching Reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '20px'
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'rgba(255, 247, 230, 0.04)',
                border: '1px solid rgba(255, 247, 230, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'border-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-red-500)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 247, 230, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Circular Red Icon Badge */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-red-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(197, 9, 13, 0.4)'
              }}>
                {f.icon}
              </div>

              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                color: 'var(--color-cream-50)',
                marginBottom: '8px'
              }}>
                {f.title}
              </div>

              <div style={{
                fontSize: '0.82rem',
                color: 'var(--color-sand-200)',
                lineHeight: 1.45
              }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
