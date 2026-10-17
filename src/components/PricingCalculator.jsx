import React, { useState } from 'react';
import { Calculator, Check, ArrowRight, Shield, Calendar, Sparkles } from 'lucide-react';

export function PricingCalculator({ settings, onSelectPlan }) {
  const [dietaryType, setDietaryType] = useState('veg');
  const [mealEntitlement, setMealEntitlement] = useState('both');
  const [durationDays, setDurationDays] = useState(30);

  // Rates from configured settings or defaults
  const rates = settings?.rates_30_days || {
    lunch_veg: 1920,
    dinner_veg: 2520,
    both_veg: 3200,
    both_non_veg: 4200
  };

  // Base 30-day rate calculation
  const getBaseRate = () => {
    if (mealEntitlement === 'both') {
      return dietaryType === 'non_veg' ? rates.both_non_veg : rates.both_veg;
    }
    if (mealEntitlement === 'lunch') {
      return rates.lunch_veg;
    }
    return rates.dinner_veg;
  };

  const baseRate = getBaseRate();
  const totalAmount = Math.round((baseRate * durationDays) / 30);
  const dailyEquivalent = Math.round(totalAmount / durationDays);

  return (
    <section id="plans-section" style={{
      backgroundColor: 'var(--color-cream-100)',
      color: 'var(--color-ink-950)',
      padding: '72px 0',
      borderTop: '2px solid var(--color-ink-950)',
      borderBottom: '2px solid var(--color-ink-950)'
    }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.12em',
            color: 'var(--color-red-600)',
            marginBottom: '4px'
          }}>
            HONEST & TRANSPARENT PRICING
          </div>
          <h2 className="display-title" style={{ color: 'var(--color-ink-950)' }}>
            MEAL PLAN <span style={{ color: 'var(--color-red-600)' }}>CALCULATOR</span>
          </h2>
          <p style={{
            color: 'var(--color-ink-700)',
            maxWidth: '540px',
            margin: '8px auto 0',
            fontSize: '1rem'
          }}>
            Calculate exact campus dining costs tailored to your dietary choice and stay duration. Zero hidden maintenance or caution fees.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="calculator-box" style={{
          maxWidth: '920px',
          margin: '0 auto',
          backgroundColor: 'var(--color-cream-50)',
          border: '2px solid var(--color-ink-950)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
        }}>
          
          {/* Controls Column */}
          <div className="calculator-controls" style={{ padding: '36px 32px', borderRight: '1px solid var(--color-line)' }}>
            
            {/* Control 1: Dietary Type */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: 'var(--color-ink-950)' }}>
                1. SELECT DIETARY PREFERENCE
              </label>
              <div className="calc-diet-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDietaryType('veg')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: dietaryType === 'veg' ? '2px solid #2E7D32' : '1px solid var(--color-line)',
                    backgroundColor: dietaryType === 'veg' ? '#E8F5E9' : '#FFFFFF',
                    color: dietaryType === 'veg' ? '#2E7D32' : 'var(--color-ink-950)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2E7D32' }} />
                  PURE VEGETARIAN
                </button>

                <button
                  type="button"
                  onClick={() => setDietaryType('non_veg')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: dietaryType === 'non_veg' ? '2px solid var(--color-red-600)' : '1px solid var(--color-line)',
                    backgroundColor: dietaryType === 'non_veg' ? '#FFEBEE' : '#FFFFFF',
                    color: dietaryType === 'non_veg' ? 'var(--color-red-600)' : 'var(--color-ink-950)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-red-600)' }} />
                  NON-VEG INCLUDED
                </button>
              </div>
            </div>

            {/* Control 2: Meal Session Entitlement */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ color: 'var(--color-ink-950)' }}>
                2. SELECT MEAL SESSIONS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMealEntitlement('lunch')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: mealEntitlement === 'lunch' ? '2px solid var(--color-red-600)' : '1px solid var(--color-line)',
                    backgroundColor: mealEntitlement === 'lunch' ? 'var(--color-maroon-950)' : '#FFFFFF',
                    color: mealEntitlement === 'lunch' ? 'var(--color-cream-50)' : 'var(--color-ink-950)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  LUNCH ONLY
                </button>

                <button
                  type="button"
                  onClick={() => setMealEntitlement('dinner')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: mealEntitlement === 'dinner' ? '2px solid var(--color-red-600)' : '1px solid var(--color-line)',
                    backgroundColor: mealEntitlement === 'dinner' ? 'var(--color-maroon-950)' : '#FFFFFF',
                    color: mealEntitlement === 'dinner' ? 'var(--color-cream-50)' : 'var(--color-ink-950)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  DINNER ONLY
                </button>

                <button
                  type="button"
                  onClick={() => setMealEntitlement('both')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: mealEntitlement === 'both' ? '2px solid var(--color-red-600)' : '1px solid var(--color-line)',
                    backgroundColor: mealEntitlement === 'both' ? 'var(--color-red-600)' : '#FFFFFF',
                    color: mealEntitlement === 'both' ? 'var(--color-cream-50)' : 'var(--color-ink-950)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  BOTH MEALS (FULL)
                </button>
              </div>
            </div>

            {/* Control 3: Duration Selection */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ color: 'var(--color-ink-950)' }}>
                3. SUBSCRIPTION DURATION
              </label>
              <div className="calc-duration-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[15, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: durationDays === days ? '2px solid var(--color-red-600)' : '1px solid var(--color-line)',
                      backgroundColor: durationDays === days ? 'var(--color-maroon-950)' : '#FFFFFF',
                      color: durationDays === days ? 'var(--color-cream-50)' : 'var(--color-ink-950)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    {days} DAYS
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', marginTop: '8px' }}>
              *Standard base 30-day rate: Lunch ₹{rates.lunch_veg}, Dinner ₹{rates.dinner_veg}, Both Veg ₹{rates.both_veg}, Both Non-Veg ₹{rates.both_non_veg}.
            </div>

          </div>

          {/* Pricing Summary Card Column */}
          <div className="calculator-summary" style={{
            padding: '36px 32px',
            backgroundColor: 'var(--color-maroon-950)',
            color: 'var(--color-cream-50)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-live">
                  CONFIGURED PLAN SUMMARY
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-sand-200)' }}>
                  {durationDays} CALENDAR DAYS
                </span>
              </div>

              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--color-cream-50)',
                lineHeight: 1.1,
                marginBottom: '8px'
              }}>
                {dietaryType === 'non_veg' ? 'NON-VEG' : 'VEGETARIAN'} • {mealEntitlement.toUpperCase()} PLAN
              </div>

              <div style={{
                fontSize: '0.82rem',
                color: 'var(--color-sand-200)',
                lineHeight: 1.4,
                marginBottom: '24px'
              }}>
                Entitles 1 serving per scheduled session. Verified at the dining counter via your persistent encrypted QR pass.
              </div>

              {/* Price Calculation Callout */}
              <div style={{
                backgroundColor: 'rgba(232, 214, 173, 0.08)',
                border: '1px solid rgba(232, 214, 173, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-sand-200)' }}>Daily Average Cost:</span>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-cream-50)' }}>
                    ₹{dailyEquivalent} / day
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--color-sand-200)', fontSize: '0.95rem' }}>Total Plan Amount:</span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums font-display" style={{ fontSize: '2.5rem', color: 'var(--color-cream-50)' }}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscribe Action */}
            <div>
              <button
                type="button"
                onClick={() => onSelectPlan({ dietaryType, mealEntitlement, durationDays, totalAmount })}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                SELECT & PROCEED
                <ArrowRight size={18} />
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: 'var(--color-sand-200)'
              }}>
                <Shield size={12} />
                <span>Eligible for 4+ consecutive days leave extension credit.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
