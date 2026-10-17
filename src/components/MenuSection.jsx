import React, { useState } from 'react';
import { Utensils, Clock, Flame, ChevronRight, X, Sparkles, AlertCircle } from 'lucide-react';

export function MenuSection({ menus }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSessionTab, setActiveSessionTab] = useState('lunch');

  const lunchMenu = menus.find(m => m.meal_session === 'lunch') || {
    title: "Chettinad & Traditional Tamil Feast",
    items: [
      "Steamed Ponni Boiled Rice & Fragrant Jeera Rice",
      "Traditional Drumstick & Shallot Sambar",
      "Pepper Rasam & Thick Curd",
      "Vazhaipoo Poriyal & Potato Roast",
      "Crispy Urad Appalam & Mango Thokku Pickle",
      "Payasam Dessert (Moong Dal & Jaggery)"
    ],
    non_veg_addon: "Chettinad Spicy Chicken Sukka & Egg Masala",
    serving_hours: "12:00 PM – 03:00 PM"
  };

  const dinnerMenu = menus.find(m => m.meal_session === 'dinner') || {
    title: "Hot Tiffin & Biryani Night",
    items: [
      "Crispy Ghee Roast Dosa & Fluffy Idlis",
      "Madurai Style Veg Kothu Parotta",
      "Spicy Coconut Chutney & Tomato Kara Chutney",
      "Mixed Vegetable Kurma & Sambar",
      "Hot Masala Milk with Badam & Cardamom"
    ],
    non_veg_addon: "Dindigul Style Seeraga Samba Chicken Biryani",
    serving_hours: "07:30 PM – 10:30 PM"
  };

  const foodCards = [
    {
      category: "INDIAN",
      tagline: "Turn Up The Flavor, Turn Up The Fun",
      subtitle: "Traditional Thali, Sambar, Poriyal & Rice",
      image: "/images/south_indian_thali.jpg"
    },
    {
      category: "CHINESE",
      tagline: "Smack Like You Mean It",
      subtitle: "Hakka Noodles, Fried Rice & Manchurian",
      image: "/images/chinese_noodles.jpg"
    },
    {
      category: "TEA / COFFEE",
      tagline: "Legendary Filter Coffee & Masala Chai",
      subtitle: "Fresh Kumbakonam Degree Coffee",
      image: "/images/filter_coffee.jpg"
    },
    {
      category: "SNACKS",
      tagline: "Crispy, Crunchy, Can't Stop",
      subtitle: "Golden Samosas, Medu Vada & Bajji",
      image: "/images/samosas_snacks.jpg"
    }
  ];

  return (
    <section id="menu-section" style={{
      backgroundColor: 'var(--color-cream-50)',
      color: 'var(--color-ink-950)',
      padding: '72px 0',
      borderTop: '2px solid var(--color-ink-950)',
      borderBottom: '2px solid var(--color-ink-950)'
    }}>
      <div className="container">
        
        {/* Section Header matching Reference */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.12em',
            color: 'var(--color-red-600)',
            marginBottom: '4px'
          }}>
            CRAVE IT. TASTE IT. ENJOY IT ON CAMPUS.
          </div>
          <h2 className="display-title" style={{ color: 'var(--color-ink-950)' }}>
            OUR <span style={{ color: 'var(--color-red-600)' }}>MENU</span>
          </h2>
          <p style={{
            color: 'var(--color-ink-700)',
            maxWidth: '560px',
            margin: '8px auto 0',
            fontSize: '1rem'
          }}>
            Cooked fresh three times a day by experienced regional chefs with premium locally sourced grains and spices.
          </p>
        </div>

        {/* 4 Horizontal Food Category Cards matching Reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {foodCards.map((card, i) => (
            <div 
              key={i}
              style={{
                backgroundColor: 'var(--color-ink-950)',
                color: 'var(--color-cream-50)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1.5px solid var(--color-ink-950)',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setModalOpen(true)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Food Image */}
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={card.image} 
                  alt={card.category}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'var(--color-red-600)',
                  color: 'var(--color-cream-50)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em'
                }}>
                  {card.category}
                </div>
              </div>

              {/* Card Footer Text */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  color: 'var(--color-cream-50)',
                  lineHeight: 1.15,
                  marginBottom: '4px'
                }}>
                  {card.tagline}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-sand-200)',
                  lineHeight: 1.3
                }}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Menu Button matching Reference */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setModalOpen(true)}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '220px' }}
          >
            VIEW FULL MENU +
          </button>
        </div>

      </div>

      {/* Full Menu Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '2px solid var(--color-line)',
              backgroundColor: 'var(--color-maroon-950)',
              color: 'var(--color-cream-50)'
            }}>
              <div>
                <span className="badge badge-live" style={{ marginBottom: '6px' }}>
                  TODAY'S PUBLISHED MENU
                </span>
                <h3 className="display-sub" style={{ color: 'var(--color-cream-50)' }}>
                  DAILY CAMPUS DINING SCHEDULE
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-sand-200)',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Session Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-line)',
              backgroundColor: 'var(--color-cream-100)'
            }}>
              <button 
                onClick={() => setActiveSessionTab('lunch')}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  border: 'none',
                  borderBottom: activeSessionTab === 'lunch' ? '3px solid var(--color-red-600)' : '3px solid transparent',
                  backgroundColor: activeSessionTab === 'lunch' ? 'var(--color-cream-50)' : 'transparent',
                  color: activeSessionTab === 'lunch' ? 'var(--color-red-600)' : 'var(--color-ink-700)',
                  cursor: 'pointer'
                }}
              >
                LUNCH SERVICE (12:00 – 3:00 PM)
              </button>
              <button 
                onClick={() => setActiveSessionTab('dinner')}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  border: 'none',
                  borderBottom: activeSessionTab === 'dinner' ? '3px solid var(--color-red-600)' : '3px solid transparent',
                  backgroundColor: activeSessionTab === 'dinner' ? 'var(--color-cream-50)' : 'transparent',
                  color: activeSessionTab === 'dinner' ? 'var(--color-red-600)' : 'var(--color-ink-700)',
                  cursor: 'pointer'
                }}
              >
                DINNER SERVICE (7:30 – 10:30 PM)
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ padding: '24px' }}>
              {activeSessionTab === 'lunch' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-maroon-950)' }}>
                      {lunchMenu.title}
                    </h4>
                    <span className="badge badge-veg">VEG INCLUDED</span>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-line)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-ink-950)', marginBottom: '10px' }}>
                      INCLUDED IN VEG & NON-VEG PLANS:
                    </div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--color-ink-700)', fontSize: '0.92rem', lineHeight: 1.8 }}>
                      {lunchMenu.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {lunchMenu.non_veg_addon && (
                    <div style={{
                      backgroundColor: 'rgba(197, 9, 13, 0.06)',
                      border: '1px solid rgba(197, 9, 13, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <span className="badge badge-nonveg">NON-VEG ADDON</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-red-700)' }}>
                        {lunchMenu.non_veg_addon}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-maroon-950)' }}>
                      {dinnerMenu.title}
                    </h4>
                    <span className="badge badge-veg">VEG INCLUDED</span>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-line)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-ink-950)', marginBottom: '10px' }}>
                      INCLUDED IN VEG & NON-VEG PLANS:
                    </div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--color-ink-700)', fontSize: '0.92rem', lineHeight: 1.8 }}>
                      {dinnerMenu.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {dinnerMenu.non_veg_addon && (
                    <div style={{
                      backgroundColor: 'rgba(197, 9, 13, 0.06)',
                      border: '1px solid rgba(197, 9, 13, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <span className="badge badge-nonveg">NON-VEG ADDON</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-red-700)' }}>
                        {dinnerMenu.non_veg_addon}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-ink-500)' }}>
                  <Clock size={14} />
                  <span>Timings strictly maintained for hygiene standards.</span>
                </div>
                <button onClick={() => setModalOpen(false)} className="btn btn-dark btn-sm">
                  CLOSE
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
