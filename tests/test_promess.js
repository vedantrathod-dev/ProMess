// Automated Test Suite for ProMess Business Rules & Constraints
// Covers Section 19: Authentication, Attendance, Payments, and Leave extensions

import assert from 'assert';
import {
  getStore,
  loginStudent,
  loginStaff,
  registerStudent,
  verifyAndCheckIn,
  submitLeaveRequest,
  reviewLeaveRequest,
  recordPayment,
  reissuePass,
  renewSubscription,
  getStudentDueDetails,
  getAllStudentsDues,
  getTodayDateString,
  getRelativeDate
} from '../src/services/store.js';

console.log('🧪 Starting ProMess Comprehensive Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    testsFailed++;
  }
}

// ---------------- 1. AUTHENTICATION TESTS ----------------
console.log('--- 1. Authentication & Security ---');

runTest('Identifier-only login is rejected without valid verification code', () => {
  const res = loginStudent('karthik.r@campus.edu', 'WRONG_OTP');
  assert.strictEqual(res.success, false);
  assert.ok(res.message.includes('Invalid verification code'));
});

runTest('Student valid OTP logs in successfully', () => {
  const res = loginStudent('karthik.r@campus.edu', '123456');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.user.role, 'student');
  assert.strictEqual(res.user.email, 'karthik.r@campus.edu');
});

runTest('Staff valid password logs in successfully', () => {
  const res = loginStaff('admin@promess.campus', 'promess2026');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.user.role, 'admin');
});

runTest('Staff invalid password is rejected', () => {
  const res = loginStaff('admin@promess.campus', 'badpass');
  assert.strictEqual(res.success, false);
});

// ---------------- 2. ATTENDANCE & CONSTRAINTS TESTS ----------------
console.log('\n--- 2. Attendance & Constraint Enforcement ---');

runTest('Valid lunch scan for full-board student succeeds', () => {
  // Use Priya's pass: 'MESSPASS:c4892fb1380ea762d981240'
  const res = verifyAndCheckIn({
    rawToken: 'MESSPASS:c4892fb1380ea762d981240',
    mealSession: 'lunch',
    verifiedBy: 'Test Operator',
    verificationMethod: 'test'
  });
  assert.strictEqual(res.status, 'success');
  assert.strictEqual(res.code, 'CHECKIN_CONFIRMED');
});

runTest('Duplicate scan rejected on same date and session (Uniqueness constraint)', () => {
  // Priya again for lunch
  const res = verifyAndCheckIn({
    rawToken: 'MESSPASS:c4892fb1380ea762d981240',
    mealSession: 'lunch',
    verifiedBy: 'Test Operator',
    verificationMethod: 'test'
  });
  assert.strictEqual(res.status, 'warning');
  assert.strictEqual(res.code, 'ALREADY_CHECKED_IN');
});

runTest('Lunch-only student rejected at dinner session', () => {
  // Ananya is on lunch only plan: 'MESSPASS:e91b0028a49c28e88f72365'
  const res = verifyAndCheckIn({
    rawToken: 'MESSPASS:e91b0028a49c28e88f72365',
    mealSession: 'dinner',
    verifiedBy: 'Test Operator',
    verificationMethod: 'test'
  });
  assert.strictEqual(res.status, 'error');
  assert.strictEqual(res.code, 'MEAL_NOT_INCLUDED');
});

runTest('Expired subscription pass is rejected', () => {
  // Rahul Mukerjee has expired plan: 'MESSPASS:f04712ad9001b63ca043519'
  const res = verifyAndCheckIn({
    rawToken: 'MESSPASS:f04712ad9001b63ca043519',
    mealSession: 'lunch',
    verifiedBy: 'Test Operator',
    verificationMethod: 'test'
  });
  assert.strictEqual(res.status, 'error');
  assert.strictEqual(res.code, 'SUBSCRIPTION_EXPIRED');
});

runTest('Revoked pass is rejected after reissuing', () => {
  // Reissue pass for Priya
  const reissueRes = reissuePass('usr_stud_2', 'usr_admin_1');
  assert.strictEqual(reissueRes.success, true);

  // Old pass should now be revoked
  const oldPassRes = verifyAndCheckIn({
    rawToken: 'MESSPASS:c4892fb1380ea762d981240',
    mealSession: 'dinner',
    verifiedBy: 'Test Operator',
    verificationMethod: 'test'
  });
  assert.strictEqual(oldPassRes.status, 'error');
  assert.strictEqual(oldPassRes.code, 'PASS_REVOKED');

  // New reissued pass works for dinner
  const newPassRes = verifyAndCheckIn({
    rawToken: reissueRes.pass.token,
    mealSession: 'dinner',
    verifiedBy: 'Test Operator',
    verificationMethod: 'test'
  });
  assert.strictEqual(newPassRes.status, 'success');
});

// ---------------- 3. PAYMENTS & FINANCIAL AUDIT TESTS ----------------
console.log('\n--- 3. Payments & Financial Integrity ---');

runTest('Recording payment updates ledger and issues serialized receipt', () => {
  const storeBefore = getStore();
  const initPaymentCount = storeBefore.payments.length;

  const res = recordPayment({
    student_id: 'usr_stud_3',
    amount: 920,
    method: 'UPI (PhonePe)',
    reference: 'TEST_UPI_001',
    recorded_by: 'Staff Admin'
  });

  assert.strictEqual(res.success, true);
  assert.ok(res.receipt.receipt_number.startsWith('REC-2026-'));
  assert.strictEqual(getStore().payments.length, initPaymentCount + 1);
});

// ---------------- 4. LEAVE & 4-DAY EXTENSION POLICY TESTS ----------------
console.log('\n--- 4. Leave Policy & Extension Logic ---');

runTest('Three-day leave does NOT grant extension under 4-day policy', () => {
  // Submit 3-day leave for student 3
  const subRes = submitLeaveRequest({
    student_id: 'usr_stud_3',
    start_date: getRelativeDate(15),
    end_date: getRelativeDate(17), // 3 days
    reason: 'Short family visit'
  });
  assert.strictEqual(subRes.success, true);

  const subBefore = getStore().subscriptions.find(s => s.student_id === 'usr_stud_3' && s.status === 'active');
  const validUntilBefore = subBefore.valid_until;

  // Approve the 3-day leave
  const revRes = reviewLeaveRequest(subRes.request.id, 'approve', 'usr_admin_1');
  assert.strictEqual(revRes.success, true);

  const subAfter = getStore().subscriptions.find(s => s.student_id === 'usr_stud_3' && s.status === 'active');
  // Date must NOT have extended
  assert.strictEqual(subAfter.valid_until, validUntilBefore);
});

runTest('Four-day qualifying leave grants exactly 4 days extension', () => {
  // Submit 4-day leave for student 3
  const subRes = submitLeaveRequest({
    student_id: 'usr_stud_3',
    start_date: getRelativeDate(20),
    end_date: getRelativeDate(23), // 4 days!
    reason: 'Inter-campus cultural festival'
  });
  assert.strictEqual(subRes.success, true);

  const subBefore = getStore().subscriptions.find(s => s.student_id === 'usr_stud_3' && s.status === 'active');
  const dBefore = new Date(subBefore.valid_until);

  // Approve the 4-day leave
  const revRes = reviewLeaveRequest(subRes.request.id, 'approve', 'usr_admin_1');
  assert.strictEqual(revRes.success, true);

  const subAfter = getStore().subscriptions.find(s => s.student_id === 'usr_stud_3' && s.status === 'active');
  const dAfter = new Date(subAfter.valid_until);

  const daysExtended = Math.round((dAfter - dBefore) / (1000 * 60 * 60 * 24));
  assert.strictEqual(daysExtended, 4);
});

// ---------------- 5. SUBSCRIPTION EXPIRY & RENEWAL TESTS ----------------
console.log('\n--- 5. Subscription Expiry Alert & Renewal ---');

runTest('Expiring subscriptions (<= 5 days) are correctly detected', () => {
  const store = getStore();
  const now = new Date();
  
  const expiring = store.users
    .filter(u => u.role === 'student')
    .map(student => {
      const sub = store.subscriptions.find(s => s.student_id === student.id && s.status === 'active');
      if (!sub) return null;
      const validUntil = new Date(sub.valid_until);
      const daysLeft = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
      return { student, sub, daysLeft };
    })
    .filter(item => item && item.daysLeft <= 5);

  assert.ok(expiring.length >= 3, `Expected at least 3 expiring students, found ${expiring.length}`);
  
  // Verify Sanjay Kumar (24BIT112) is in the expiring list
  const sanjay = expiring.find(e => e.student.student_code === '24BIT112');
  assert.ok(sanjay, 'Sanjay Kumar (24BIT112) must be in the expiring list');
  assert.ok(sanjay.daysLeft <= 2, `Sanjay days left should be <= 2, got ${sanjay.daysLeft}`);
});

runTest('Renew subscription extends active student validity by 30 days', () => {
  const store = getStore();
  const subBefore = store.subscriptions.find(s => s.student_id === 'usr_stud_5');
  const oldDateStr = subBefore.valid_until;
  const oldDate = new Date(oldDateStr);

  const result = renewSubscription('usr_stud_5', 30, 'Chief Warden Admin');
  assert.ok(result && result.success, 'Subscription renewal should succeed');

  const subAfter = getStore().subscriptions.find(s => s.student_id === 'usr_stud_5');
  const newDate = new Date(subAfter.valid_until);
  const diffDays = Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24));
  assert.strictEqual(diffDays, 30, `Expected 30 days extension on existing validity, got ${diffDays}`);
});

runTest('Renewing expired subscription reactivates plan for 30 days from today', () => {
  const todayStr = getTodayDateString();
  const result = renewSubscription('usr_stud_4', 30, 'Chief Warden Admin');
  assert.ok(result && result.success);

  const subAfter = getStore().subscriptions.find(s => s.student_id === 'usr_stud_4');
  assert.strictEqual(subAfter.status, 'active');
  const dToday = new Date(todayStr);
  const dNew = new Date(subAfter.valid_until);
  const daysFromToday = Math.round((dNew - dToday) / (1000 * 60 * 60 * 24));
  assert.strictEqual(daysFromToday, 30);
});

// ---------------- 6. DUES, PARTIAL PAYMENTS & BALANCE TESTS ----------------
console.log('\n--- 6. Dues, Partial Payments & Balance Tracking ---');

runTest('Student with partial payment shows exact remaining balance and status', () => {
  // Sanjay Kumar (usr_stud_5): Plan ₹3,200, paid ₹1,600 (half paid)
  const sanjayDue = getStudentDueDetails('usr_stud_5');
  assert.ok(sanjayDue, 'Sanjay due details must exist');
  assert.strictEqual(sanjayDue.planPrice, 3200);
  assert.strictEqual(sanjayDue.totalPaid, 1600);
  assert.strictEqual(sanjayDue.dueAmount, 1600);
  assert.strictEqual(sanjayDue.percentPaid, 50);
  assert.strictEqual(sanjayDue.paymentStatus, 'partial_due');
});

runTest('Student fully paid shows 0 due and paid_full status', () => {
  // Karthik Raja (usr_stud_1): Plan ₹4,200, paid ₹4,200
  const karthikDue = getStudentDueDetails('usr_stud_1');
  assert.ok(karthikDue);
  assert.strictEqual(karthikDue.dueAmount, 0);
  assert.strictEqual(karthikDue.paymentStatus, 'paid_full');
  assert.strictEqual(karthikDue.percentPaid, 100);
});

runTest('Student unpaid shows full plan price due and unpaid status', () => {
  // Arun Prasath (usr_stud_7): Plan ₹1,920, paid ₹0
  const arunDue = getStudentDueDetails('usr_stud_7');
  assert.ok(arunDue);
  assert.strictEqual(arunDue.totalPaid, 0);
  assert.strictEqual(arunDue.dueAmount, 1920);
  assert.strictEqual(arunDue.paymentStatus, 'unpaid');
});

runTest('Recording remaining balance clears student due to 0', () => {
  // Record remaining ₹1,600 for Sanjay Kumar
  const payRes = recordPayment({
    student_id: 'usr_stud_5',
    amount: 1600,
    method: 'UPI (GPay)',
    reference: 'TEST_REMAINDER_PAY',
    recorded_by: 'Test Admin'
  });
  assert.strictEqual(payRes.success, true);

  const sanjayAfter = getStudentDueDetails('usr_stud_5');
  assert.strictEqual(sanjayAfter.totalPaid, 3200);
  assert.strictEqual(sanjayAfter.dueAmount, 0);
  assert.strictEqual(sanjayAfter.paymentStatus, 'paid_full');
  assert.strictEqual(sanjayAfter.percentPaid, 100);
});

console.log(`\n================================`);
console.log(`Total Passed: ${testsPassed}`);
console.log(`Total Failed: ${testsFailed}`);
console.log(`================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
