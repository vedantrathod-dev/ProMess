# ProMess System Architecture & Technical Specifications

> **Platform:** ProMess — Campus Dining & Mess Operations Platform  
> **Location:** Ground Floor, Canteen Dining Hall, MIT ACSC, Alandi, Pune, Maharashtra  
> **Architecture Pattern:** Client-Side Single Page Application (SPA) with Reactive Local Storage, Cloud Firestore Sync & Firebase Authentication Bridge  
> **Tech Stack:** React 18, Vite 6, Custom Vanilla CSS Design System, Firebase v11, `html5-qrcode`, Web Audio API  

---

## 1. Executive Architecture Summary

ProMess is an institutional dining management platform built to operate reliably in high-throughput campus canteen environments (handling hundreds of student check-ins per meal session). 

The platform implements an **Offline-First Reactive State Architecture** backed by **Firebase Cloud Services** (Authentication & Firestore) and **Client-Side Hardware Integrations** (Live Camera QR Decoders, USB Barcode Scanners, Web Audio Chimes).

```
                      +------------------------------------------+
                      |         Student & Visitor Browser        |
                      |   (Mobile Phone / Laptop / Tablet)       |
                      +--------------------+---------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                 |
|                                                                                       |
|  +------------------------+  +------------------------+  +-------------------------+  |
|  |     Public Landing     |  |     Student Portal     |  |    Admin Workspace &    |  |
|  |  (Marketing, Pricing,  |  |   (QR Pass, History,   |  |     Counter Terminal    |  |
|  |  Menu, Marathi Flair)  |  |    Dues, Leave Apps)   |  |   (Scans, Audits, Dues) |  |
|  +-----------+------------+  +-----------+------------+  +------------+------------+  |
|              |                           |                            |               |
|              +---------------------------+----------------------------+               |
|                                          |                                            |
|                                          v                                            |
|  +---------------------------------------------------------------------------------+  |
|  |                              STATE & BUSINESS ENGINE                            |  |
|  |  * Subscription & Pass Engine    * Constraint Verification Pipeline             |  |
|  |  * Dues & Payment Ledger         * 4-Day Leave Extension Engine                 |  |
|  |  * 5-Day Expiration Detector     * Security Audit Trail                         |  |
|  +---------------------------------------+-----------------------------------------+  |
|                                          |                                            |
|             +----------------------------+----------------------------+               |
|             |                                                         |               |
|             v                                                         v               |
|  +---------------------+                                   +-----------------------+  |
|  |   Hardware Drivers  |                                   |  Cloud Firestore &    |  |
|  | * Html5Qrcode Cam   |                                   |  Firebase Auth Bridge |  |
|  | * Web Audio Chimes  |                                   |  (Sync & Persistence) |  |
|  +---------------------+                                   +-----------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Directory & Component Hierarchy

```
feildProject/
├── docs/
│   └── architecture.md            # Comprehensive architectural documentation (this file)
├── public/
│   └── images/
│       ├── maharashtra_thali.jpg  # Authentic Chapati Dal Bhat meal visual
│       ├── hero_biryani.jpg       # Hyderabadi Dum Biryani pot visual
│       ├── crispy_dosa.jpg        # South Indian Masala Dosa visual
│       └── chinese_noodles.jpg    # Wok-tossed Hakka Noodles visual
├── src/
│   ├── components/
│   │   ├── AdminPortal.jsx        # Admin management dashboard (KPIs, dues, audits, leaves)
│   │   ├── AuthModal.jsx          # Firebase email/Google auth & instant demo switcher
│   │   ├── CounterScanner.jsx     # High-speed live QR counter scanner terminal
│   │   ├── FoodGallery.jsx        # Regional food photography showcase
│   │   ├── Footer.jsx             # MIT ACSC Alandi campus desk & service timings
│   │   ├── Hero.jsx               # Hero banner with interactive pass preview
│   │   ├── MenuSection.jsx        # 4-dish rotation & lunch/dinner published schedules
│   │   ├── Navbar.jsx             # Responsive nav, session status, user profile dropdown
│   │   ├── PricingCalculator.jsx  # Interactive meal plan pricing calculation engine
│   │   ├── SplitFeature.jsx       # Authenticity seal, serving schedule & Marathi/Hindi flair
│   │   ├── StudentPortal.jsx      # Student dashboard, scannable QR pass, fees & dues
│   │   ├── Testimonials.jsx       # Student reviews & Marathi/Hindi callout card
│   │   └── WhyUs.jsx              # Platform benefits & operational pillars
│   ├── firebase/
│   │   ├── config.js              # Firebase app initialization & service exports
│   │   └── storeBridge.js         # Bidirectional sync between Firestore and local state
│   ├── services/
│   │   ├── seedData.js            # Default institutional data, users, and menus
│   │   └── store.js               # Reactive core store, transactions, business logic
│   ├── App.jsx                    # Root view controller & route state management
│   ├── index.css                  # Custom Vanilla CSS design tokens & animations
│   └── main.jsx                   # React 18 DOM mount point
├── tests/
│   └── test_promess.js            # Automated regression test suite (19 test cases)
├── index.html                     # HTML root, meta SEO, Anton & Mukta Google fonts
├── package.json                   # Project scripts and dependency declarations
├── vercel.json                    # Single-Page Application (SPA) routing rewrites
└── README.md                      # Operational guide, demo accounts & setup instructions
```

---

## 3. Data Models & Entity Relationships

The data models enforce strict relational integrity across institutional dining entities:

```mermaid
erDiagram
    USER ||--o{ SUBSCRIPTION : holds
    USER ||--o{ DINING_PASS : assigned
    USER ||--o{ ATTENDANCE : logs
    USER ||--o{ PAYMENT : tenders
    USER ||--o{ LEAVE_REQUEST : files
    USER ||--o{ AUDIT_LOG : generates

    SUBSCRIPTION ||--o{ ATTENDANCE : authorizes
    SUBSCRIPTION ||--o{ PAYMENT : billed_under
    SUBSCRIPTION ||--o{ LEAVE_REQUEST : extends

    USER {
        string id PK
        string email
        string mobile
        string role "student | admin | counter_operator"
        string student_code "Roll number"
        string full_name
        string college_name
        boolean verified
        boolean active
    }

    SUBSCRIPTION {
        string id PK
        string student_id FK
        string plan_id
        string dietary_type_snapshot "veg | non_veg"
        string meal_entitlement_snapshot "lunch | dinner | both"
        number price_snapshot "Immutable billing price"
        string valid_from "YYYY-MM-DD"
        string valid_until "YYYY-MM-DD"
        string status "active | expired | suspended"
        number purchased_duration "15 | 30 | 60 | 90 days"
    }

    DINING_PASS {
        string id PK
        string student_id FK
        string token "MESSPASS:<hex_token>"
        string issued_at ISO8601
        boolean is_active
    }

    ATTENDANCE {
        string id PK
        string student_id FK
        string subscription_id FK
        string service_date "YYYY-MM-DD"
        string meal_session "lunch | dinner"
        string checked_in_at ISO8601
        string verified_by "Operator name"
        string verification_method "camera_qr | manual_terminal"
    }

    PAYMENT {
        string id PK
        string receipt_no "REC-YYYY-XXXX"
        string student_id FK
        string subscription_id FK
        number amount
        string payment_method "upi | card | net_banking | cash"
        string status "confirmed | pending | failed"
        string paid_at ISO8601
    }

    LEAVE_REQUEST {
        string id PK
        string student_id FK
        string subscription_id FK
        string start_date "YYYY-MM-DD"
        string end_date "YYYY-MM-DD"
        string reason
        string status "pending | approved | rejected"
        number credited_days
    }

    AUDIT_LOG {
        string id PK
        string actor_id FK
        string action
        string entity_type
        string entity_id
        json safe_metadata
        string created_at ISO8601
    }
```

---

## 4. Core Business Logic & Constraint Pipelines

### 4.1 Attendance Verification Pipeline (`verifyAndCheckIn`)

The attendance pipeline executes when a token is received from the camera stream, barcode scanner, or manual input:

```
[Raw Token Input]
       │
       ▼
[Token Extraction] ──▶ Extracts MESSPASS:[a-f0-9]+ or resolves student_code / mobile
       │
       ▼
[Dining Pass Resolution] ──▶ Checks pass exists & is_active === true
       │
       ▼
[Student Record Check] ──▶ Verifies student exists & student.active === true
       │
       ▼
[Active Subscription Check] ──▶ Checks status === 'active' & today >= valid_from
       │
       ▼
[Plan Expiry Check] ──▶ Rejects if today > valid_until
       │
       ▼
[Meal Entitlement Check] ──▶ Rejects lunch-only at dinner, dinner-only at lunch
       │
       ▼
[Uniqueness Check] ──▶ Enforces (student_id, todayStr, mealSession) unique check-in
       │
       ▼
[Check-in Success] ──▶ Records ATTENDANCE, writes AUDIT_LOG, plays D5-A5 chime,
                      returns student & subscription snapshot, auto-rearms after 1.8s
```

### 4.2 Financial Ledger & Dues Computation

Unlike naive systems that calculate outstanding balances on mutable price fields, ProMess implements **Price Snapshot Immutability**:
- When a student enrolls or renews, the base rate is snapshot into `subscription.price_snapshot`.
- Dues are calculated dynamically:
  $$\text{Outstanding Dues} = \max(0, \text{price\_snapshot} - \sum \text{confirmed payments})$$
- Payment statuses:
  - `paid_full`: $\text{Outstanding Dues} == 0$
  - `partial`: $0 < \text{Outstanding Dues} < \text{price\_snapshot}$
  - `unpaid`: $\text{Outstanding Dues} == \text{price\_snapshot}$
- When an operator records a partial or remaining balance payment, a serialized receipt (`REC-2026-XXXX`) is issued, and the student's status updates in real time.

### 4.3 4-Day Minimum Leave Extension Policy

Institutional mess facilities cannot sustain operational waste from short 1-day absences. ProMess enforces the **4-Day Qualifying Extension Rule**:
1. When a student applies for leave from $D_1$ to $D_2$, the duration in consecutive calendar days is:
   $$\text{Days} = \frac{D_2 - D_1}{86400000} + 1$$
2. **If $\text{Days} < 4$**: The leave can be approved for tracking, but **zero extension days** are credited.
3. **If $\text{Days} \ge 4$**: On administrative approval, the subscription's `valid_until` date is automatically extended by exactly $\text{Days}$.

### 4.4 5-Day Expiration Detector

Both the Admin Portal and Student Portal continuously monitor the active subscription expiration:
- If $(\text{valid\_until} - \text{today}) \le 5\text{ days}$, the system raises an expiration banner.
- **Admin Portal**: Displays an expiring student table with 1-click renewal buttons and contact details.
- **Student Portal**: Alerts the student with a renewal callout and prompt to visit the campus desk.

---

## 5. Hardware & Sensor Subsystems

### 5.1 Real-Time Camera QR Code Decoder (`html5-qrcode`)
- **Engine**: Continuous hardware-accelerated video stream frame analysis at **15 FPS**.
- **Camera Selection**: Environment-facing camera (`facingMode: 'environment'`) by default, with automatic fallback to user-facing webcams or first enumerated device.
- **Multi-Camera Switcher**: Detects all connected video devices and enables instant cycling via the `SWITCH CAM` control.
- **Image Upload Fallback**: Supports decoding QR screenshots or photos using `Html5Qrcode.scanFile()` for offline testing.
- **Debounce Mechanism**: Protects against duplicate consecutive triggers using an in-memory timestamp delta check:
  ```javascript
  if (token === lastTokenRef.current && (Date.now() - lastTimeRef.current) < 3000) return;
  ```

### 5.2 Synthesized Audio Chimes (Web Audio API)
- Eliminates external `.mp3` dependencies by synthesizing waveforms directly on the client's audio context:
  - **Success Chime**: Dual sine wave oscillator stepping from **587.33 Hz (D5)** to **880.00 Hz (A5)** over 0.35s with exponential gain decay.
  - **Rejection Chime**: Sawtooth oscillator dropping from **220.00 Hz (A3)** to **164.81 Hz (E3)** over 0.40s.
- Operators can toggle mute at any time using the terminal audio control.

---

## 6. Security, Compliance & Data Protection

| Security Vector | Implementation Detail |
|---|---|
| **Pass Token Entropy** | 24-character hexadecimal cryptographically secure pseudo-random string generated using Web Crypto API (`crypto.getRandomValues`). |
| **Token Rotation** | Reissuing a lost or compromised pass immediately marks the old token `is_active: false` and issues a fresh token, instantly revoking unauthorized copies. |
| **Formula Injection Defense** | All CSV exports (Attendance, Financials, Students) automatically escape cell values beginning with `=`, `+`, `-`, or `@` with a leading apostrophe (`'`) to neutralize remote spreadsheet execution. |
| **Role-Based Isolation** | Strict view and action boundaries between `student`, `admin`, and `counter_operator`. Staff credentials require authentication. |
| **Audit Immutability** | System operations (logins, scans, renewals, cancellations) produce timestamped, immutable audit log records. |

---

## 7. Cloud Integration & Deployment

- **Firebase Cloud Firestore**: Real-time document synchronization via `syncDocToFirestore(collection, id, data)` ensures multi-device consistency between counter operators and administrative desktops.
- **Firebase Authentication**: Enables Google OAuth and institutional email/password sign-in alongside demo developer accounts.
- **Vercel Edge Platform**: Deployed with custom SPA rewrite rules (`vercel.json`) ensuring seamless deep-linking to `/`, `/admin`, and `/counter`.
