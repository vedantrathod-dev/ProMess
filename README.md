# ProMess — Campus Dining & Mess Operations Platform

> **Bold Flavors. Rooted in Tradition. Campus Dining Managed with Absolute Clarity.**  
> **Institutional Deployment:** Ground Floor, Canteen Dining Hall, MIT ACSC, Alandi, Pune, Maharashtra  
> **Contact:** [dining@promess.mitacsc.edu](mailto:dining@promess.mitacsc.edu) • +91 94422 10890  

**ProMess** is a production-grade campus dining management and mess operations platform inspired faithfully by the authentic Indian restaurant visual identity (deep oxblood/maroon backgrounds, saturated restaurant-red panels, warm ivory/cream surfaces, bold condensed display typography, Mukta Marathi/Hindi localization, and real regional culinary imagery).

---

## 🚀 Tech Stack

- **Frontend Core**: React 18, Vite 6, Custom Vanilla CSS Design System (Exact reference palette tokens).
- **Typography**: Google Fonts — **Anton** (Display headlines), **Mukta** (Marathi & Hindi Devanagari script), and **Plus Jakarta Sans** (UI & tables).
- **Backend & Cloud Database**: Node.js v20+, Firebase Client SDK (Firestore & Firebase Auth) + Offline-First Persistent Storage Engine.
- **Hardware & QR Subsystem**: `html5-qrcode` (Live 15 FPS continuous camera video decoder, multi-camera switcher, file upload scanner), `qrcode` (SVG/Canvas pass generation).
- **Audio & Delight**: Web Audio API (Synthesized D5–A5 success chimes & A3–E3 rejection chimes), `canvas-confetti`.
- **Testing & Tooling**: Node.js automated regression test suite (19 unit & integration tests), Playwright-ready browser suite.

---

## 🎨 Design System & Reference Tokens

| Token | Hex / Value | Usage |
|---|---|---|
| `--color-maroon-950` | `#210604` | Deep oxblood background, hero canvas, navbar |
| `--color-maroon-900` | `#350907` | Device display frames, dark contrast containers |
| `--color-red-600` | `#C5090D` | Primary action buttons, badge highlights, brand marks |
| `--color-cream-50` | `#FFF7E6` | Warm ivory cards, menu section background, modal boxes |
| `--color-sand-200` | `#E8D6AD` | Subheadings, border accents, tabular borders |
| `--color-ink-950` | `#15130F` | High-contrast black cards, tables, text |
| Display Typography | **Anton** (80px–128px) | Oversized condensed uppercase headlines |
| Regional Typography | **Mukta** (600–800) | Marathi & Hindi Devanagari regional callouts |
| Body Typography | **Plus Jakarta Sans** | Clean, accessible forms, tables, operational labels |

---

## 🍽️ Distinct Platform Experiences

### 1. Public Marketing & Plan Selection
- **Hero Canvas**: Oversized headline *"GOOD FOOD. ZERO MESS."*, compact benefit pills, interactive tilted dining pass preview with live check-in badge, running marquee strip.
- **Our Menu**: Warm cream container with 4 regional food cards:
  1. **MAHARASHTRIAN**: Chapati, Dal Bhat, Toop, Bhaji & Koshimbir
  2. **HYDERABADI BIRYANI**: Authentic Dum Biryani, Mirchi Ka Salan & Raita
  3. **CHINESE**: Wok-Tossed Hakka Noodles, Fried Rice & Manchurian
  4. **SOUTH INDIAN**: Crispy Ghee Roast Masala Dosa, Soft Idlis & Sambar
  *(Includes Published Full Menu Modal for Lunch & Dinner).*
- **Asymmetric Split**: Left cream panel with traditional Thali diagram & circular Authenticity Stamp (*"AUTHENTIC CAMPUS DINING • QUALITY SEAL • FRESH DAILY"*) + Right bold red statement panel (*"BUILT FOR STUDENTS. LOVED BY EVERYONE."*) with Marathi/Hindi authentic flair.
- **Interactive Pricing Calculator**: Veg / Non-Veg toggle, Lunch / Dinner / Both selector, 15 / 30 / 60 / 90 days duration slider, daily cost breakdown, direct registration CTA.
- **Regional Callout Card**: Localized red card featuring:
  - **Marathi:** *भूक लागली? चला जेवूया!*
  - **Hindi:** *भूख लगी है? आइए खाना खाते हैं!*

### 2. Student Self-Service Dining Portal
- **Dashboard**: Active plan status, days remaining counter, today's lunch & dinner check-in state, fee status.
- **Permanent QR Dining Pass**: Opaque cryptographic token (`MESSPASS:<hex>`), high-contrast scannable QR display, PNG download, and print pass layout.
- **Attendance History**: Verified meal transactions with timestamps and operator records.
- **Fees, Dues & Receipts**: Plan cost breakdown, confirmed collections, outstanding balance tracker, serialized receipt viewer (`REC-2026-XXXX`).
- **Leave Applications & 4-Day Extension Policy**: Apply for scheduled leave with start/end dates and reason. Leaves of 4+ consecutive days automatically extend subscription validity.

### 3. Admin & Counter Workspace
- **Counter Scanner Terminal (`/admin/counter`)**:
  - Live continuous camera QR scanning powered by `html5-qrcode`.
  - Multi-camera front/back & external webcam switcher (`SWITCH CAM`).
  - Image file scanner button (`SCAN IMAGE`) for offline/screenshot decoding.
  - USB hardware scanner & student roll number input fallback.
  - Session preselection (Lunch / Dinner based on local time).
  - Web Audio synthesized success & rejection chimes (with mute control).
  - Instant audit verification & auto-rearm in 1.8 seconds.
- **Admin Workspace (`/admin`)**:
  - **Expiring Subscriptions Alert Panel**: Real-time detection of students with ≤ 5 days remaining, showing roll numbers, phone numbers, and 1-click 30-day renewal.
  - **Student Directory**: Search, filter by diet/plan, pass reissue/revocation with token rotation.
  - **Attendance Manager**: Date & session filtering, present breakdown, manual override, CSV export.
  - **Payment & Dues Ledger**: Track full payments, partial payments, and remaining balances; record payments and issue serialized receipts.
  - **Leave Approvals**: 1-click approval with automatic subscription validity extension (4+ consecutive days rule).
  - **Daily Menu Publisher**: Real-time updates to lunch/dinner items, non-veg addons, and timings.
  - **Security Audit Trail**: Live stream of all system actions, actors, and entities.

---

## 🔐 Demo Accounts (Instant 1-Click Access)

Use the built-in demo switcher in the **SIGN IN** modal, or log in with Firebase Google / Email Auth:

### Students
- **Karthik Raja** (24BCS108): `karthik.r@campus.edu` • Plan: Non-Veg Full Board (Both meals)
- **Priya Krishnan** (24BIT204): `priya.k@campus.edu` • Plan: Veg Full Board (Both meals)
- **Ananya Sharma** (24BME055): `ananya.s@campus.edu` • Plan: Midday Special (Lunch Only)
- **Rahul Mukerjee** (23BEC089): `rahul.m@campus.edu` • Expired Plan (For counter rejection testing)
- *Demo OTP*: `123456`

### Staff & Management
- **Chief Warden Dr. Ramanathan** (Admin): `admin@promess.campus` • Password: `promess2026`
- **Murugan Swamy** (Counter Operator): `counter@promess.campus` • Password: `promess2026`

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
- `(student_id, service_date, session)` duplicate check-in prevention
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
2. Import your GitHub repository: `https://github.com/vedantrathod-dev/ProMess`.
3. Vercel automatically detects the **Vite** framework preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. (Optional) Add Environment Variables from `.env` in Vercel project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   *(Default fallbacks for `messmaster-c8b62` are also built directly into the client code).*
5. Click **Deploy**. Your app will be live within seconds with full SPA routing enabled!

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 📖 System Architecture & Design Document

For in-depth architectural diagrams, database entity schemas, verification pipelines, hardware integration details, and security policies, refer to:

👉 **[docs/architecture.md](docs/architecture.md)**
