# ProMess — Campus Dining & Mess Operations Platform

> **Bold Flavors. Rooted in Tradition. Campus Dining Managed with Clarity.**

**ProMess** is a production-grade campus dining management and mess operations platform inspired faithfully by the authentic South Indian restaurant visual identity (oxblood/maroon backgrounds, saturated restaurant-red panels, warm ivory/cream surfaces, condensed uppercase display typography, and real regional culinary imagery).

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite 6, Custom Vanilla CSS Design System (Exact reference palette tokens).
- **Backend / Database**: Node.js v20+, Firebase Client SDK (Firestore & Firebase Auth) + Offline-First Persistent Storage Engine.
- **Hardware & QR**: `qrcode`, `html5-qrcode` (Counter camera & USB scanner integration).
- **Icons & Delight**: `lucide-react`, `canvas-confetti`.

---

## 🎨 Design System & Reference Faithfulness

| Token | Hex / Value | Usage |
|---|---|---|
| `--color-maroon-950` | `#210604` | Deep oxblood background, hero canvas, navbar |
| `--color-maroon-900` | `#350907` | Device display frames, dark contrast containers |
| `--color-red-600` | `#C5090D` | Primary action buttons, badge highlights, brand marks |
| `--color-cream-50` | `#FFF7E6` | Warm ivory cards, menu section background, modal boxes |
| `--color-sand-200` | `#E8D6AD` | Subheadings, border accents, tabular borders |
| `--color-ink-950` | `#15130F` | High-contrast black cards, tables, text |
| Display Typography | **Anton** (80px–128px) | Oversized condensed uppercase headlines |
| Body Typography | **Plus Jakarta Sans** | Clean, accessible forms, tables, operational labels |

---

## 🍽️ Three Separated Experiences

### 1. Public Marketing & Plan Selection
- **Hero**: Oversized display headline *"GOOD FOOD. ZERO MESS."*, 3 compact benefit pills, interactive tilted dining pass preview with live check-in badge, running marquee strip.
- **Our Menu**: Warm cream container with 4 horizontal food cards (*Indian*, *Chinese*, *Tea/Coffee*, *Snacks*) + Full Today's Menu modal (Lunch & Dinner schedules).
- **Asymmetric Split**: Left cream panel with traditional Thali diagram & circular Authenticity Stamp (*"AUTHENTIC CAMPUS DINING • QUALITY SEAL • FRESH DAILY"*) + Right bold red statement panel (*"BUILT FOR STUDENTS. LOVED BY EVERYONE."*).
- **Interactive Pricing Calculator**: Veg / Non-Veg toggle, Lunch / Dinner / Both selector, 15 / 30 / 60 / 90 days slider, daily cost breakdown, direct registration CTA.
- **Why Students Love ProMess**: 4 circular red icon mini-cards.
- **Food Gallery & Reviews**: Crisp dosa, filter coffee, noodles, authentic reviews, and Tamil *"பசிக்க வாங்க சாப்பிடலாம்"* fuel-up card.

### 2. Student Self-Service Dining Portal
- **Dashboard**: Active plan status, days remaining counter, today's lunch & dinner check-in state, fee status.
- **Permanent QR Dining Pass**: Opaque token (`MESSPASS:<opaque_token>`), high-contrast scannable QR display, PNG download, and print pass layout.
- **Attendance History**: Verified meal transactions with timestamps and operator records.
- **Fees & Receipts**: Subscription cost breakdown, payment history, serialized receipt viewer (`REC-2026-XXXX`).
- **Leave Applications & 4-Day Extension Policy**: Apply for scheduled leave with start/end dates and reason.

### 3. Admin & Counter Workspace
- **Counter Scanner Terminal (`/admin/counter`)**:
  - Live camera QR scanning with `html5-qrcode`.
  - USB hardware scanner / keyboard barcode input.
  - Manual student search fallback.
  - Session preselection (Lunch / Dinner based on local time).
  - Web Audio synthesized success & rejection chimes (with mute control).
  - Instant audit verification & auto-rearm in 1.8 seconds.
- **Admin Workspace (`/admin`)**:
  - Operational KPIs: Enrolled students, active subscriptions, dietary breakdown, live scans, confirmed collections, outstanding dues.
  - Student Directory: Search, filter by diet/plan, pass reissue/revocation with token rotation.
  - Attendance Manager: Date & session filtering, present breakdown, manual override, CSV export.
  - Payment Recorder: Record payments (UPI, Net Banking, Cash) and issue official serialized receipts.
  - Leave Approvals: 1-click approval with automatic subscription validity extension (4+ consecutive days rule).
  - Daily Menu Publisher: Real-time updates to lunch/dinner items, non-veg addons, and timings.
  - Security Audit Trail: Live stream of all system actions, actors, and entities.

---

## 🔐 Demo Accounts (Instant 1-Click Access)

Use the built-in demo switcher in the **SIGN IN** modal:

### Students
- **Karthik Raja** (24BCS108): `karthik.r@campus.edu` • Plan: Non-Veg Full Board (Both meals)
- **Priya Krishnan** (24BIT204): `priya.k@campus.edu` • Plan: Veg Full Board (Both meals)
- **Ananya Sharma** (24BME055): `ananya.s@campus.edu` • Plan: Midday Special (Lunch Only)
- **Rahul Mukerjee** (23BEC089): `rahul.m@campus.edu` • Expired Plan (For counter rejection testing)
- *Demo OTP*: `123456`

### Staff & Management
- **Chief Warden Dr. Ramanathan** (Admin): `admin@promess.campus` • Password: `promess2026`
- **Murugan Swamy** (Counter Operator 1): `counter@promess.campus` • Password: `promess2026`

---

## 🛠️ Local Setup & Commands

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### 3. Run Automated Tests
```bash
node tests/test_promess.js
```
Runs 19 comprehensive unit & integration tests validating:
- OTP authentication and role-based login
- Meal session entitlement constraint enforcement
- (student_id, service_date, session) duplicate check-in prevention
- Expired subscription and revoked pass rejection
- 4-day qualifying leave policy extension calculations
- Subscription expiry countdown (≤ 5 days) & 30-day renewals
- Dues & partial payments tracking ledger
- Payment recording and serialized receipt generation

### 4. Build for Production
```bash
npm run build
```

---

## ⚡ Deploying to Vercel

ProMess is 100% configured for zero-configuration, instant deployment on **Vercel** with `vercel.json`.

### Option A: Via GitHub (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository: `vedantrathod-dev/ProMess`.
3. Vercel automatically detects **Vite** framework preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. (Optional) Add Environment Variables from `.env` in the Vercel project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   *(Note: Sensible default fallbacks for `messmaster-c8b62` are also built directly into the client code).*
5. Click **Deploy**. Your app will be live within seconds with full SPA routing enabled!

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🛡️ Business Rules & Policy Details

1. **Uniqueness Constraint**:
   `(student_id, service_date, meal_session)` is enforced in the transaction verification engine. Duplicate scans for the same session receive an immediate warning and rejection.
2. **4-Day Leave Extension Policy**:
   Only approved leave of **at least 4 consecutive calendar days** qualifies for plan extension. Shorter leaves (e.g. 1–3 days) can be approved for tracking but do not extend plan validity.
3. **Price Snapshot Integrity**:
   Subscriptions store an immutable `price_snapshot`. Changing current base rates in Settings never rewrites historical dues or confirmed payment records.
4. **Formula Injection Protection**:
   All CSV exports sanitize spreadsheet cells starting with `=`, `+`, `-`, or `@` to prevent remote formula execution in Microsoft Excel and Google Sheets.

