// ProMess Core Service & State Engine
// Handles persistent data, security validations, attendance uniqueness, pricing, and leave extensions.

import {
  SEED_USERS,
  SEED_PLANS,
  SEED_SUBSCRIPTIONS,
  SEED_DINING_PASSES,
  SEED_PAYMENTS,
  SEED_RECEIPTS,
  SEED_ATTENDANCE,
  SEED_LEAVE_REQUESTS,
  SEED_MENUS,
  SEED_SETTINGS,
  getTodayDateString,
  getRelativeDate
} from './seedData.js';

import {
  syncDocToFirestore,
  seedFirestoreIfEmpty,
  loadFromFirestore,
  authenticateWithFirebaseAuth
} from './firestoreSync.js';

export { getTodayDateString, getRelativeDate };

// Safe storage polyfill for Node test runners & SSR
const memStorage = new Map();
const safeStorage = {
  getItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : memStorage.get(key) || null),
  setItem: (key, val) => (typeof localStorage !== 'undefined' ? localStorage.setItem(key, val) : memStorage.set(key, String(val))),
  removeItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.removeItem(key) : memStorage.delete(key))
};

const STORAGE_KEY = 'promess_store_v1';
const AUTH_KEY = 'promess_auth_user_v1';

// Initialize state from storage or load seed data
function loadInitialState() {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.subscriptions) {
        // Ensure newly seeded expiring students are merged
        SEED_USERS.forEach(su => {
          if (!parsed.users.some(u => u.id === su.id)) parsed.users.push(su);
        });
        SEED_SUBSCRIPTIONS.forEach(ss => {
          if (!parsed.subscriptions.some(s => s.id === ss.id)) parsed.subscriptions.push(ss);
        });
        SEED_DINING_PASSES.forEach(sp => {
          if (!parsed.dining_passes?.some(p => p.id === sp.id)) parsed.dining_passes.push(sp);
        });
        return parsed;
      }
    }
  } catch (err) {}

  const initial = {
    users: SEED_USERS,
    plans: SEED_PLANS,
    subscriptions: SEED_SUBSCRIPTIONS,
    dining_passes: SEED_DINING_PASSES,
    payments: SEED_PAYMENTS,
    receipts: SEED_RECEIPTS,
    attendance: SEED_ATTENDANCE,
    leave_requests: SEED_LEAVE_REQUESTS,
    subscription_extensions: [
      {
        id: "ext_1",
        subscription_id: "sub_1",
        leave_request_id: "leave_1",
        credited_days: 5,
        previous_valid_until: getRelativeDate(13),
        updated_valid_until: getRelativeDate(18),
        created_at: getRelativeDate(-1) + "T14:00:00Z"
      }
    ],
    menus: SEED_MENUS,
    settings: SEED_SETTINGS,
    audit_logs: [
      {
        id: "log_1",
        actor_id: "usr_admin_1",
        action: "INITIALIZE_SYSTEM",
        entity_type: "SYSTEM",
        entity_id: "PROMESS",
        safe_metadata: { initialized_at: new Date().toISOString() },
        created_at: new Date().toISOString()
      }
    ]
  };

  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    console.warn('Could not write to storage:', e);
  }

  return initial;
}

let state = loadInitialState();
const listeners = new Set();

function notify() {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save to storage failed:', e);
  }
  listeners.forEach(fn => fn(state));
}

export function subscribeToStore(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getStore() {
  return state;
}

// Background Live Sync with Cloud Firestore
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      await seedFirestoreIfEmpty('users', state.users);
      await seedFirestoreIfEmpty('plans', state.plans);
      await seedFirestoreIfEmpty('subscriptions', state.subscriptions);
      await seedFirestoreIfEmpty('dining_passes', state.dining_passes);
      await seedFirestoreIfEmpty('attendance', state.attendance);
      await seedFirestoreIfEmpty('payments', state.payments);
      await seedFirestoreIfEmpty('receipts', state.receipts);
      await seedFirestoreIfEmpty('leave_requests', state.leave_requests);
      await seedFirestoreIfEmpty('menus', state.menus);

      const remoteUsers = await loadFromFirestore('users');
      if (remoteUsers && remoteUsers.length) state.users = remoteUsers;

      const remoteAttendance = await loadFromFirestore('attendance');
      if (remoteAttendance && remoteAttendance.length) state.attendance = remoteAttendance;

      const remotePayments = await loadFromFirestore('payments');
      if (remotePayments && remotePayments.length) state.payments = remotePayments;

      notify();
    } catch (e) {
      console.warn('[Firestore] Background sync note:', e);
    }
  }, 300);
}

// ================= AUTHENTICATION =================

export function getCurrentUser() {
  try {
    const raw = safeStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    safeStorage.removeItem(AUTH_KEY);
  }
  notify();
}

export function loginStudent(identifier, otp) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const user = state.users.find(
    u => (u.email.toLowerCase() === cleanId || u.mobile === cleanId) && u.role === 'student'
  );

  if (!user) {
    return { success: false, message: 'No student found with this email or mobile number.' };
  }

  if (!user.active) {
    return { success: false, message: 'Your student account is deactivated. Please contact the mess office.' };
  }

  // Development OTP validation: Accepts '123456' or demo bypass
  if (otp !== '123456' && otp !== 'DEMO') {
    return { success: false, message: 'Invalid verification code. (For demo testing use: 123456)' };
  }

  setCurrentUser(user);
  logAudit(user.id, 'LOGIN_STUDENT', 'USER', user.id, { method: 'otp' });
  return { success: true, user };
}

export function loginStaff(identifier, password) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const user = state.users.find(
    u => (u.email.toLowerCase() === cleanId || u.mobile === cleanId) && (u.role === 'admin' || u.role === 'counter_operator')
  );

  if (!user) {
    return { success: false, message: 'No staff account found with these credentials.' };
  }

  // Development password check: default password 'promess2026' or 'admin123'
  if (password !== 'promess2026' && password !== 'admin123' && password !== 'counter123') {
    return { success: false, message: 'Invalid credentials. (Demo pass: promess2026)' };
  }

  setCurrentUser(user);
  logAudit(user.id, 'LOGIN_STAFF', 'USER', user.id, { role: user.role });
  return { success: true, user };
}

export function logout() {
  const cur = getCurrentUser();
  if (cur) {
    logAudit(cur.id, 'LOGOUT', 'USER', cur.id, {});
  }
  setCurrentUser(null);
}

// ================= FIREBASE AUTH BRIDGE =================

export function loginOrRegisterFirebaseUser({ email, displayName, photoURL, uid, role = 'student' }) {
  if (!email) {
    return { success: false, message: 'No email provided from Firebase Authentication.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Check if user already exists in store
  let user = state.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (user) {
    if (photoURL && !user.photo_url) user.photo_url = photoURL;
    if (uid && !user.firebase_uid) user.firebase_uid = uid;
    setCurrentUser(user);
    logAudit(user.id, 'LOGIN_FIREBASE', 'USER', user.id, { method: 'firebase_auth', email: cleanEmail });
    notify();
    return { success: true, user, isNew: false };
  }

  // 2. If not registered, create new student account with dining pass
  const newUserId = 'usr_stud_' + Date.now();
  const studentCode = '26' + String(Math.floor(1000 + Math.random() * 9000));
  const fullName = displayName || cleanEmail.split('@')[0];

  user = {
    id: newUserId,
    email: cleanEmail,
    mobile: '+91 98450 ' + String(Math.floor(10000 + Math.random() * 90000)),
    role: role || 'student',
    student_code: studentCode,
    full_name: fullName,
    college_name: 'Campus Student',
    photo_url: photoURL || null,
    firebase_uid: uid || null,
    verified: true,
    active: true,
    created_at: new Date().toISOString()
  };

  const subId = 'sub_' + Date.now();
  const todayStr = getTodayDateString();
  const validUntilStr = getRelativeDate(30);

  const newSubscription = {
    id: subId,
    student_id: newUserId,
    plan_id: 'plan_veg_both_30',
    dietary_type_snapshot: 'veg',
    meal_entitlement_snapshot: 'both',
    price_snapshot: 3200,
    valid_from: todayStr,
    valid_until: validUntilStr,
    status: 'active',
    purchased_duration: 30
  };

  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const passToken = `MESSPASS:${randomHex}`;

  const newPass = {
    id: 'pass_' + Date.now(),
    student_id: newUserId,
    token: passToken,
    issued_at: new Date().toISOString(),
    is_active: true
  };

  state.users.push(user);
  state.subscriptions.push(newSubscription);
  state.dining_passes.push(newPass);

  // Sync to Cloud Firestore
  syncDocToFirestore('users', user.id, user);
  syncDocToFirestore('subscriptions', newSubscription.id, newSubscription);
  syncDocToFirestore('dining_passes', newPass.id, newPass);

  setCurrentUser(user);
  logAudit(user.id, 'REGISTER_FIREBASE', 'USER', user.id, { method: 'firebase_auth', email: cleanEmail });
  notify();

  return { success: true, user, isNew: true };
}

// Student Registration
export function registerStudent({ full_name, email, mobile, college_name, dietary_type, meal_entitlement, duration_days }) {
  if (!full_name || !email || !mobile) {
    return { success: false, message: 'Please provide full name, email, and mobile number.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanMobile = mobile.trim();

  // Basic regex validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid campus email address.' };
  }

  if (cleanMobile.length < 10) {
    return { success: false, message: 'Mobile number must be at least 10 digits.' };
  }

  // Check duplicate
  const existing = state.users.find(
    u => u.email.toLowerCase() === cleanEmail || u.mobile === cleanMobile
  );
  if (existing) {
    return { success: false, message: 'An account with this email or mobile is already registered.' };
  }

  const newUserId = 'usr_stud_' + Date.now();
  const studentCode = '26' + String(Math.floor(1000 + Math.random() * 9000));

  const newUser = {
    id: newUserId,
    email: cleanEmail,
    mobile: cleanMobile,
    role: 'student',
    student_code: studentCode,
    full_name: full_name.trim(),
    college_name: college_name || 'PSG Tech Campus',
    verified: true,
    active: true,
    created_at: new Date().toISOString()
  };

  // Pricing calculation
  const duration = parseInt(duration_days, 10) || 30;
  const rateKey = meal_entitlement === 'both'
    ? (dietary_type === 'non_veg' ? 'both_non_veg' : 'both_veg')
    : (meal_entitlement === 'lunch' ? 'lunch_veg' : 'dinner_veg');
  const baseRate = state.settings.rates_30_days[rateKey] || 3200;
  const calculatedPrice = Math.round((baseRate * duration) / 30);

  const subId = 'sub_' + Date.now();
  const todayStr = getTodayDateString();
  const validUntilStr = getRelativeDate(duration);

  const newSubscription = {
    id: subId,
    student_id: newUserId,
    plan_id: `plan_${dietary_type}_${meal_entitlement}_${duration}`,
    dietary_type_snapshot: dietary_type,
    meal_entitlement_snapshot: meal_entitlement,
    price_snapshot: calculatedPrice,
    valid_from: todayStr,
    valid_until: validUntilStr,
    status: 'active',
    purchased_duration: duration
  };

  // Cryptographically random opaque pass token
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const passToken = `MESSPASS:${randomHex}`;

  const newPass = {
    id: 'pass_' + Date.now(),
    student_id: newUserId,
    token: passToken,
    issued_at: new Date().toISOString(),
    is_active: true
  };

  state.users.push(newUser);
  state.subscriptions.push(newSubscription);
  state.dining_passes.push(newPass);

  // Sync to Cloud Firestore
  syncDocToFirestore('users', newUser.id, newUser);
  syncDocToFirestore('subscriptions', newSubscription.id, newSubscription);
  syncDocToFirestore('dining_passes', newPass.id, newPass);

  logAudit(newUserId, 'REGISTER_STUDENT', 'USER', newUserId, { plan: newSubscription.plan_id, price: calculatedPrice });
  notify();
  setCurrentUser(newUser);

  return { success: true, user: newUser, subscription: newSubscription, pass: newPass };
}

// ================= AUDIT LOGGING =================

export function logAudit(actor_id, action, entity_type, entity_id, safe_metadata) {
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    actor_id: actor_id || 'SYSTEM',
    action,
    entity_type,
    entity_id: String(entity_id),
    safe_metadata: safe_metadata || {},
    created_at: new Date().toISOString()
  };
  state.audit_logs.unshift(newLog);
  if (state.audit_logs.length > 500) {
    state.audit_logs = state.audit_logs.slice(0, 500);
  }
}

// ================= ATTENDANCE VERIFICATION =================
// Crucial Section 9 & 10 business logic

export function verifyAndCheckIn({ rawToken, mealSession, verifiedBy, verificationMethod = 'camera_qr', overrideReason = null }) {
  const token = (rawToken || '').trim();
  const todayStr = getTodayDateString();

  if (!token) {
    return {
      status: 'error',
      code: 'INVALID_TOKEN',
      title: 'Invalid QR Pass',
      message: 'Empty or unreadable QR code scanned.'
    };
  }

  // 1. Resolve Dining Pass
  const pass = state.dining_passes.find(p => p.token === token);
  if (!pass) {
    return {
      status: 'error',
      code: 'PASS_NOT_FOUND',
      title: 'Unrecognized Pass',
      message: 'This QR code is not associated with any ProMess pass.'
    };
  }

  if (!pass.is_active) {
    return {
      status: 'error',
      code: 'PASS_REVOKED',
      title: 'Dining Pass Revoked',
      message: 'This dining pass was revoked by management. A reissued pass is required.'
    };
  }

  // 2. Resolve Student
  const student = state.users.find(u => u.id === pass.student_id);
  if (!student) {
    return {
      status: 'error',
      code: 'STUDENT_NOT_FOUND',
      title: 'Student Record Missing',
      message: 'Could not resolve the student identity for this pass.'
    };
  }

  if (!student.active) {
    return {
      status: 'error',
      code: 'STUDENT_INACTIVE',
      title: 'Student Deactivated',
      message: `${student.full_name}'s account is currently deactivated.`
    };
  }

  // 3. Resolve Active Subscription
  const activeSub = state.subscriptions.find(
    s => s.student_id === student.id && s.status === 'active'
  );

  if (!activeSub) {
    const expiredSub = state.subscriptions.find(
      s => s.student_id === student.id && (s.status === 'expired' || todayStr >= s.valid_until)
    );
    if (expiredSub) {
      return {
        status: 'error',
        code: 'SUBSCRIPTION_EXPIRED',
        title: 'Subscription Expired',
        message: `Plan expired on ${expiredSub.valid_until}. Please renew at the mess desk.`,
        student,
        subscription: expiredSub
      };
    }
    return {
      status: 'error',
      code: 'NO_ACTIVE_SUBSCRIPTION',
      title: 'No Active Subscription',
      message: `${student.full_name} does not have an active meal subscription.`,
      student
    };
  }

  // 4. Validate Validity Dates
  if (todayStr < activeSub.valid_from) {
    return {
      status: 'error',
      code: 'SUBSCRIPTION_NOT_STARTED',
      title: 'Subscription Not Yet Active',
      message: `Plan starts on ${activeSub.valid_from}. Today is ${todayStr}.`,
      student,
      subscription: activeSub
    };
  }

  if (todayStr >= activeSub.valid_until) {
    return {
      status: 'error',
      code: 'SUBSCRIPTION_EXPIRED',
      title: 'Subscription Expired',
      message: `Plan expired on ${activeSub.valid_until}. Please renew at the mess desk.`,
      student,
      subscription: activeSub
    };
  }

  // 5. Validate Meal Entitlement
  const entitlement = activeSub.meal_entitlement_snapshot;
  if (entitlement !== 'both' && entitlement !== mealSession) {
    const requiredName = entitlement === 'lunch' ? 'Lunch Only' : 'Dinner Only';
    return {
      status: 'error',
      code: 'MEAL_NOT_INCLUDED',
      title: 'Meal Not Included In Plan',
      message: `${student.full_name} is enrolled in a ${requiredName} plan, which does not cover ${mealSession}.`,
      student,
      subscription: activeSub
    };
  }

  // 6. Check Active Leave
  const onLeave = state.leave_requests.find(
    l => l.student_id === student.id && l.status === 'approved' && todayStr >= l.start_date && todayStr <= l.end_date
  );

  // 7. Check Duplicate Attendance (Uniqueness constraint)
  const existingAtt = state.attendance.find(
    a => a.student_id === student.id && a.service_date === todayStr && a.meal_session === mealSession
  );

  if (existingAtt) {
    const checkInTime = new Date(existingAtt.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      status: 'warning',
      code: 'ALREADY_CHECKED_IN',
      title: 'Already Checked In',
      message: `${student.full_name} already checked in for ${mealSession.toUpperCase()} today at ${checkInTime}.`,
      student,
      subscription: activeSub,
      checked_in_at: existingAtt.checked_in_at
    };
  }

  // 8. Successful Transaction: Record Attendance
  const newAttendance = {
    id: 'att_' + Date.now(),
    student_id: student.id,
    subscription_id: activeSub.id,
    service_date: todayStr,
    meal_session: mealSession,
    checked_in_at: new Date().toISOString(),
    verified_by: verifiedBy || 'staff',
    verification_method: verificationMethod,
    override_reason: overrideReason
  };

  state.attendance.unshift(newAttendance);

  // Sync check-in transaction to Cloud Firestore
  syncDocToFirestore('attendance', newAttendance.id, newAttendance);

  // Calculate days remaining
  const validUntilDate = new Date(activeSub.valid_until);
  const nowDate = new Date(todayStr);
  const diffTime = validUntilDate - nowDate;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  logAudit(verifiedBy, 'ATTENDANCE_CHECKIN', 'ATTENDANCE', newAttendance.id, {
    student_id: student.id,
    meal_session: mealSession,
    service_date: todayStr
  });

  notify();

  return {
    status: 'success',
    code: 'CHECKIN_CONFIRMED',
    title: 'Check-in Verified',
    message: `${student.full_name} verified for ${mealSession.toUpperCase()}!`,
    student,
    subscription: activeSub,
    attendance: newAttendance,
    daysRemaining,
    onLeave: Boolean(onLeave)
  };
}

// ================= LEAVE APPROVAL & 4-DAY RULE =================

export function submitLeaveRequest({ student_id, start_date, end_date, reason }) {
  if (!start_date || !end_date || !reason) {
    return { success: false, message: 'Start date, end date, and reason are required.' };
  }

  if (start_date > end_date) {
    return { success: false, message: 'Start date cannot be after end date.' };
  }

  const activeSub = state.subscriptions.find(s => s.student_id === student_id && s.status === 'active');
  if (!activeSub) {
    return { success: false, message: 'You need an active subscription to apply for leave.' };
  }

  // Check overlap with pending or approved requests
  const overlap = state.leave_requests.find(
    l => l.student_id === student_id && l.status !== 'rejected' &&
      ((start_date >= l.start_date && start_date <= l.end_date) ||
       (end_date >= l.start_date && end_date <= l.end_date))
  );

  if (overlap) {
    return { success: false, message: 'You already have an existing leave request for these dates.' };
  }

  const s = new Date(start_date);
  const e = new Date(end_date);
  const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;

  const newReq = {
    id: 'leave_' + Date.now(),
    student_id,
    subscription_id: activeSub.id,
    start_date,
    end_date,
    reason: reason.trim(),
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    credited_days: 0,
    requested_days: diffDays
  };

  state.leave_requests.unshift(newReq);
  syncDocToFirestore('leave_requests', newReq.id, newReq);
  logAudit(student_id, 'LEAVE_REQUEST_SUBMITTED', 'LEAVE_REQUEST', newReq.id, { days: diffDays });
  notify();

  return { success: true, request: newReq };
}

export function reviewLeaveRequest(leave_id, action, reviewer_id) {
  const req = state.leave_requests.find(l => l.id === leave_id);
  if (!req) return { success: false, message: 'Leave request not found.' };

  if (req.status !== 'pending') {
    return { success: false, message: `Request already marked as ${req.status}.` };
  }

  const sub = state.subscriptions.find(s => s.id === req.subscription_id);

  if (action === 'approve') {
    const s = new Date(req.start_date);
    const e = new Date(req.end_date);
    const consecutiveDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;

    // Rule: Minimum qualifying consecutive leave is 4 days! ("More than 3 days")
    const minDays = state.settings.min_leave_days_for_extension || 4;
    let creditedDays = 0;

    if (consecutiveDays >= minDays && sub) {
      creditedDays = consecutiveDays;

      // Extend subscription valid_until
      const prevUntil = sub.valid_until;
      const curDate = new Date(prevUntil);
      curDate.setDate(curDate.getDate() + creditedDays);
      const newUntil = curDate.toISOString().split('T')[0];

      sub.valid_until = newUntil;

      // Ledger record
      state.subscription_extensions.push({
        id: 'ext_' + Date.now(),
        subscription_id: sub.id,
        leave_request_id: req.id,
        credited_days: creditedDays,
        previous_valid_until: prevUntil,
        updated_valid_until: newUntil,
        created_at: new Date().toISOString()
      });
    }

    req.status = 'approved';
    req.reviewed_by = reviewer_id;
    req.reviewed_at = new Date().toISOString();
    req.credited_days = creditedDays;

    logAudit(reviewer_id, 'LEAVE_APPROVED', 'LEAVE_REQUEST', req.id, { credited_days: creditedDays });
    syncDocToFirestore('leave_requests', req.id, req);
    if (sub) syncDocToFirestore('subscriptions', sub.id, sub);
    notify();
    return {
      success: true,
      message: creditedDays > 0
        ? `Leave approved and subscription extended by ${creditedDays} days!`
        : `Leave approved. (Note: Under 4 consecutive days, no plan extension policy applies).`
    };
  } else {
    req.status = 'rejected';
    req.reviewed_by = reviewer_id;
    req.reviewed_at = new Date().toISOString();
    req.credited_days = 0;

    logAudit(reviewer_id, 'LEAVE_REJECTED', 'LEAVE_REQUEST', req.id, {});
    notify();
    return { success: true, message: 'Leave request rejected.' };
  }
}

// ================= PAYMENTS & RECEIPTS =================

export function recordPayment({ student_id, amount, method, reference, recorded_by }) {
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return { success: false, message: 'Please enter a valid positive payment amount.' };
  }

  const sub = state.subscriptions.find(s => s.student_id === student_id && s.status === 'active');
  const payId = 'pay_' + Date.now();
  const recNumber = 'REC-2026-' + Math.floor(1000 + Math.random() * 9000);

  const newPayment = {
    id: payId,
    student_id,
    subscription_id: sub ? sub.id : null,
    amount: amt,
    method: method || 'UPI (Direct)',
    status: 'confirmed',
    reference: reference || ('TXN-' + Date.now()),
    received_at: new Date().toISOString(),
    recorded_by: recorded_by || 'admin'
  };

  const newReceipt = {
    id: 'rec_' + Date.now(),
    payment_id: payId,
    receipt_number: recNumber,
    issued_at: new Date().toISOString()
  };

  state.payments.unshift(newPayment);
  state.receipts.unshift(newReceipt);

  // Sync payment and receipt to Cloud Firestore
  syncDocToFirestore('payments', newPayment.id, newPayment);
  syncDocToFirestore('receipts', newReceipt.id, newReceipt);

  logAudit(recorded_by, 'PAYMENT_RECORDED', 'PAYMENT', payId, { amount: amt, receipt_number: recNumber });
  notify();

  return { success: true, payment: newPayment, receipt: newReceipt };
}

// ================= DUES & PARTIAL PAYMENT ENGINE =================

export function getStudentDueDetails(student_id) {
  const student = state.users.find(u => u.id === student_id);
  if (!student) return null;

  const sub = state.subscriptions.find(s => s.student_id === student_id && s.status === 'active') ||
              state.subscriptions.find(s => s.student_id === student_id);

  const plan = sub ? state.plans.find(p => p.id === sub.plan_id) : null;
  const planPrice = sub ? (sub.price_snapshot || (plan ? plan.configured_price : 0)) : 0;

  const studentPayments = state.payments.filter(p => p.student_id === student_id && p.status === 'confirmed');
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const dueAmount = Math.max(0, planPrice - totalPaid);

  let paymentStatus = 'no_plan';
  if (sub) {
    if (planPrice === 0 || dueAmount === 0) {
      paymentStatus = 'paid_full';
    } else if (totalPaid > 0 && dueAmount > 0) {
      paymentStatus = 'partial_due';
    } else {
      paymentStatus = 'unpaid';
    }
  }

  const percentPaid = planPrice > 0 ? Math.min(100, Math.round((totalPaid / planPrice) * 100)) : 0;

  return {
    student,
    subscription: sub,
    plan,
    planName: plan?.name || (sub?.meal_entitlement_snapshot === 'both' ? 'Full Board Meal Plan' : 'Single Session Plan'),
    planPrice,
    totalPaid,
    dueAmount,
    percentPaid,
    paymentStatus,
    payments: studentPayments
  };
}

export function getAllStudentsDues() {
  const students = state.users.filter(u => u.role === 'student');
  return students.map(s => getStudentDueDetails(s.id)).filter(Boolean);
}

// ================= PASS REISSUE & REVOKE =================

export function reissuePass(student_id, admin_id) {
  // Revoke existing passes
  state.dining_passes.forEach(p => {
    if (p.student_id === student_id) {
      p.is_active = false;
      p.revoked_at = new Date().toISOString();
    }
  });

  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const newPass = {
    id: 'pass_' + Date.now(),
    student_id,
    token: `MESSPASS:${randomHex}`,
    issued_at: new Date().toISOString(),
    is_active: true
  };

  state.dining_passes.push(newPass);
  syncDocToFirestore('dining_passes', newPass.id, newPass);
  logAudit(admin_id, 'PASS_REISSUED', 'DINING_PASS', newPass.id, { student_id });
  notify();
  return { success: true, pass: newPass };
}

// ================= MENU MANAGEMENT =================

export function updateMenu(session, title, items, non_veg_addon, serving_hours) {
  let menu = state.menus.find(m => m.meal_session === session);
  if (!menu) {
    menu = {
      id: 'menu_' + session,
      service_date: getTodayDateString(),
      meal_session: session,
      title,
      items,
      non_veg_addon,
      serving_hours,
      published: true
    };
    state.menus.push(menu);
  } else {
    menu.title = title;
    menu.items = items;
    menu.non_veg_addon = non_veg_addon;
    menu.serving_hours = serving_hours;
    menu.published = true;
  }
  notify();
  syncDocToFirestore('menus', menu.id, menu);
  return { success: true, menu };
}

// ================= SETTINGS =================

export function updateSettings(newSettings, admin_id) {
  state.settings = { ...state.settings, ...newSettings };
  logAudit(admin_id, 'SETTINGS_UPDATED', 'SETTINGS', 'PROMESS', newSettings);
  notify();
  syncDocToFirestore('settings', 'config', state.settings);
  return { success: true, settings: state.settings };
}

// ================= SUBSCRIPTION RENEWAL =================

export function renewSubscription(student_id, duration_days = 30, recorded_by = 'admin') {
  const sub = state.subscriptions.find(s => s.student_id === student_id);
  if (!sub) return { success: false, message: 'Subscription not found.' };

  const todayStr = getTodayDateString();
  const currentExpiry = new Date(sub.valid_until > todayStr ? sub.valid_until : todayStr);
  currentExpiry.setDate(currentExpiry.getDate() + Number(duration_days));
  const newUntil = currentExpiry.toISOString().split('T')[0];

  sub.valid_until = newUntil;
  sub.status = 'active';

  logAudit(recorded_by, 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION', sub.id, {
    new_valid_until: newUntil,
    added_days: duration_days
  });
  notify();
  syncDocToFirestore('subscriptions', sub.id, sub);
  return { success: true, message: `Subscription renewed for 30 days! Valid until ${newUntil}.`, newUntil };
}

// ================= REPORTING & CSV EXPORT =================

export function generateAttendanceReportCSV() {
  const headers = ['Service Date', 'Session', 'Student ID', 'Student Name', 'Dietary Type', 'Checked In At', 'Verified By', 'Method'];
  const rows = state.attendance.map(a => {
    const student = state.users.find(u => u.id === a.student_id) || {};
    const sub = state.subscriptions.find(s => s.id === a.subscription_id) || {};
    return [
      a.service_date,
      a.meal_session.toUpperCase(),
      student.student_code || a.student_id,
      student.full_name || 'Unknown',
      sub.dietary_type_snapshot ? sub.dietary_type_snapshot.toUpperCase() : 'VEG',
      new Date(a.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      a.verified_by,
      a.verification_method
    ];
  });

  return convertToSafeCSV([headers, ...rows]);
}

export function generateCollectionsReportCSV() {
  const headers = ['Receipt No', 'Date', 'Student ID', 'Student Name', 'Amount (INR)', 'Payment Method', 'Transaction Ref', 'Recorded By'];
  const rows = state.payments.map(p => {
    const student = state.users.find(u => u.id === p.student_id) || {};
    const receipt = state.receipts.find(r => r.payment_id === p.id) || {};
    return [
      receipt.receipt_number || 'N/A',
      p.received_at ? p.received_at.split('T')[0] : 'N/A',
      student.student_code || p.student_id,
      student.full_name || 'Unknown',
      p.amount,
      p.method,
      p.reference,
      p.recorded_by
    ];
  });

  return convertToSafeCSV([headers, ...rows]);
}

// Formula injection protection for CSV
function convertToSafeCSV(data) {
  return data
    .map(row =>
      row
        .map(field => {
          let str = String(field ?? '');
          // If starts with =, +, -, @, prefix with a single quote to prevent spreadsheet code execution
          if (/^[=+\-@]/.test(str)) {
            str = "'" + str;
          }
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            str = `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');
}
