// ProMess Seed Data matching Section 18 of prompt
// Realistic Indian campus dining data

export const SEED_USERS = [
  {
    id: "usr_admin_1",
    email: "admin@promess.campus",
    mobile: "9876543210",
    role: "admin",
    full_name: "Chief Warden Dr. Ramanathan",
    verified: true,
    active: true,
    created_at: "2026-09-01T08:00:00Z"
  },
  {
    id: "usr_counter_1",
    email: "counter@promess.campus",
    mobile: "9876543211",
    role: "counter_operator",
    full_name: "Murugan Swamy (Counter 1)",
    verified: true,
    active: true,
    created_at: "2026-09-01T08:30:00Z"
  },
  {
    id: "usr_stud_1",
    email: "karthik.r@campus.edu",
    mobile: "9123456780",
    role: "student",
    student_code: "24BCS108",
    full_name: "Karthik Raja",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-09-15T09:00:00Z"
  },
  {
    id: "usr_stud_2",
    email: "priya.k@campus.edu",
    mobile: "9123456781",
    role: "student",
    student_code: "24BIT204",
    full_name: "Priya Krishnan",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-09-18T10:00:00Z"
  },
  {
    id: "usr_stud_3",
    email: "ananya.s@campus.edu",
    mobile: "9123456782",
    role: "student",
    student_code: "24BME055",
    full_name: "Ananya Sharma",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-09-20T11:00:00Z"
  },
  {
    id: "usr_stud_4",
    email: "rahul.m@campus.edu",
    mobile: "9123456783",
    role: "student",
    student_code: "23BEC089",
    full_name: "Rahul Mukerjee",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-08-01T10:00:00Z"
  },
  {
    id: "usr_stud_5",
    email: "sanjay.k@campus.edu",
    mobile: "9845112233",
    role: "student",
    student_code: "24BIT112",
    full_name: "Sanjay Kumar",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-09-19T09:00:00Z"
  },
  {
    id: "usr_stud_6",
    email: "deepika.m@campus.edu",
    mobile: "9845112244",
    role: "student",
    student_code: "24BCS218",
    full_name: "Deepika Meena",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-09-20T10:00:00Z"
  },
  {
    id: "usr_stud_7",
    email: "arun.p@campus.edu",
    mobile: "9845112255",
    role: "student",
    student_code: "24BEE092",
    full_name: "Arun Prasath",
    college_name: "PSG College of Technology",
    verified: true,
    active: true,
    created_at: "2026-09-22T11:00:00Z"
  }
];

export const SEED_PLANS = [
  {
    id: "plan_veg_both_30",
    name: "Full Board Veg (Lunch + Dinner)",
    dietary_type: "veg",
    meal_entitlement: "both",
    base_duration_days: 30,
    configured_price: 3200,
    active: true
  },
  {
    id: "plan_nonveg_both_30",
    name: "Full Board Non-Veg (Lunch + Dinner)",
    dietary_type: "non_veg",
    meal_entitlement: "both",
    base_duration_days: 30,
    configured_price: 4200,
    active: true
  },
  {
    id: "plan_veg_lunch_30",
    name: "Midday Special (Lunch Only)",
    dietary_type: "veg",
    meal_entitlement: "lunch",
    base_duration_days: 30,
    configured_price: 1920,
    active: true
  },
  {
    id: "plan_veg_dinner_30",
    name: "Night Feast (Dinner Only)",
    dietary_type: "veg",
    meal_entitlement: "dinner",
    base_duration_days: 30,
    configured_price: 2520,
    active: true
  }
];

// Today's ISO date string helper in IST
export const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const SEED_SUBSCRIPTIONS = [
  {
    id: "sub_1",
    student_id: "usr_stud_1",
    plan_id: "plan_nonveg_both_30",
    dietary_type_snapshot: "non_veg",
    meal_entitlement_snapshot: "both",
    price_snapshot: 4200,
    valid_from: getRelativeDate(-12),
    valid_until: getRelativeDate(18),
    status: "active",
    purchased_duration: 30
  },
  {
    id: "sub_2",
    student_id: "usr_stud_2",
    plan_id: "plan_veg_both_30",
    dietary_type_snapshot: "veg",
    meal_entitlement_snapshot: "both",
    price_snapshot: 3200,
    valid_from: getRelativeDate(-5),
    valid_until: getRelativeDate(25),
    status: "active",
    purchased_duration: 30
  },
  {
    id: "sub_3",
    student_id: "usr_stud_3",
    plan_id: "plan_veg_lunch_30",
    dietary_type_snapshot: "veg",
    meal_entitlement_snapshot: "lunch",
    price_snapshot: 1920,
    valid_from: getRelativeDate(-2),
    valid_until: getRelativeDate(28),
    status: "active",
    purchased_duration: 30
  },
  {
    id: "sub_4",
    student_id: "usr_stud_4",
    plan_id: "plan_veg_both_30",
    dietary_type_snapshot: "veg",
    meal_entitlement_snapshot: "both",
    price_snapshot: 3200,
    valid_from: getRelativeDate(-45),
    valid_until: getRelativeDate(-15),
    status: "expired",
    purchased_duration: 30
  },
  {
    id: "sub_5",
    student_id: "usr_stud_5",
    plan_id: "plan_veg_both_30",
    dietary_type_snapshot: "veg",
    meal_entitlement_snapshot: "both",
    price_snapshot: 3200,
    valid_from: getRelativeDate(-28),
    valid_until: getRelativeDate(2), // 2 Days Left!
    status: "active",
    purchased_duration: 30
  },
  {
    id: "sub_6",
    student_id: "usr_stud_6",
    plan_id: "plan_nonveg_both_30",
    dietary_type_snapshot: "non_veg",
    meal_entitlement_snapshot: "both",
    price_snapshot: 4200,
    valid_from: getRelativeDate(-27),
    valid_until: getRelativeDate(3), // 3 Days Left!
    status: "active",
    purchased_duration: 30
  },
  {
    id: "sub_7",
    student_id: "usr_stud_7",
    plan_id: "plan_veg_lunch_30",
    dietary_type_snapshot: "veg",
    meal_entitlement_snapshot: "lunch",
    price_snapshot: 1920,
    valid_from: getRelativeDate(-25),
    valid_until: getRelativeDate(5), // 5 Days Left!
    status: "active",
    purchased_duration: 30
  }
];

export const SEED_DINING_PASSES = [
  {
    id: "pass_1",
    student_id: "usr_stud_1",
    token: "MESSPASS:a7f92e41b9c34d82a10e7b8",
    issued_at: "2026-09-15T09:05:00Z",
    is_active: true
  },
  {
    id: "pass_2",
    student_id: "usr_stud_2",
    token: "MESSPASS:c4892fb1380ea762d981240",
    issued_at: "2026-09-18T10:05:00Z",
    is_active: true
  },
  {
    id: "pass_3",
    student_id: "usr_stud_3",
    token: "MESSPASS:e91b0028a49c28e88f72365",
    issued_at: "2026-09-20T11:05:00Z",
    is_active: true
  },
  {
    id: "pass_4",
    student_id: "usr_stud_4",
    token: "MESSPASS:f04712ad9001b63ca043519",
    issued_at: "2026-08-01T10:05:00Z",
    is_active: true
  },
  {
    id: "pass_5",
    student_id: "usr_stud_5",
    token: "MESSPASS:b5531a7891cd4a9e223011a",
    issued_at: "2026-09-19T09:05:00Z",
    is_active: true
  },
  {
    id: "pass_6",
    student_id: "usr_stud_6",
    token: "MESSPASS:d6642b8902de5baf334122b",
    issued_at: "2026-09-20T10:05:00Z",
    is_active: true
  },
  {
    id: "pass_7",
    student_id: "usr_stud_7",
    token: "MESSPASS:e7753c9013ef6cb0445233c",
    issued_at: "2026-09-22T11:05:00Z",
    is_active: true
  }
];

export const SEED_PAYMENTS = [
  {
    id: "pay_1",
    student_id: "usr_stud_1",
    subscription_id: "sub_1",
    amount: 4200,
    method: "UPI (Google Pay)",
    status: "confirmed",
    reference: "UPI/26101784920/AXIS",
    received_at: getRelativeDate(-12) + "T09:15:00Z",
    recorded_by: "usr_admin_1"
  },
  {
    id: "pay_2",
    student_id: "usr_stud_2",
    subscription_id: "sub_2",
    amount: 3200,
    method: "Net Banking (SBI)",
    status: "confirmed",
    reference: "SBIN890432170",
    received_at: getRelativeDate(-5) + "T10:30:00Z",
    recorded_by: "usr_admin_1"
  },
  {
    id: "pay_3",
    student_id: "usr_stud_3",
    subscription_id: "sub_3",
    amount: 1000,
    method: "Cash at Office",
    status: "confirmed",
    reference: "CSH-MESS-0941",
    received_at: getRelativeDate(-2) + "T11:30:00Z",
    recorded_by: "usr_admin_1"
  },
  {
    id: "pay_4",
    student_id: "usr_stud_5",
    subscription_id: "sub_5",
    amount: 1600,
    method: "UPI (PhonePe)",
    status: "confirmed",
    reference: "UPI/9845112233/HDFC",
    received_at: getRelativeDate(-10) + "T14:20:00Z",
    recorded_by: "usr_admin_1"
  },
  {
    id: "pay_5",
    student_id: "usr_stud_6",
    subscription_id: "sub_6",
    amount: 2100,
    method: "Cash at Desk",
    status: "confirmed",
    reference: "CSH-MESS-1082",
    received_at: getRelativeDate(-8) + "T16:45:00Z",
    recorded_by: "usr_admin_1"
  }
];

export const SEED_RECEIPTS = [
  {
    id: "rec_1",
    payment_id: "pay_1",
    receipt_number: "REC-2026-1049",
    issued_at: getRelativeDate(-12) + "T09:16:00Z"
  },
  {
    id: "rec_2",
    payment_id: "pay_2",
    receipt_number: "REC-2026-1050",
    issued_at: getRelativeDate(-5) + "T10:31:00Z"
  },
  {
    id: "rec_3",
    payment_id: "pay_3",
    receipt_number: "REC-2026-1051",
    issued_at: getRelativeDate(-2) + "T11:31:00Z"
  },
  {
    id: "rec_4",
    payment_id: "pay_4",
    receipt_number: "REC-2026-1052",
    issued_at: getRelativeDate(-10) + "T14:21:00Z"
  },
  {
    id: "rec_5",
    payment_id: "pay_5",
    receipt_number: "REC-2026-1053",
    issued_at: getRelativeDate(-8) + "T16:46:00Z"
  }
];

export const SEED_ATTENDANCE = [
  {
    id: "att_1",
    student_id: "usr_stud_1",
    subscription_id: "sub_1",
    service_date: getTodayDateString(),
    meal_session: "lunch",
    checked_in_at: new Date().toISOString(),
    verified_by: "usr_counter_1",
    verification_method: "camera_qr",
    override_reason: null
  },
  {
    id: "att_2",
    student_id: "usr_stud_2",
    subscription_id: "sub_2",
    service_date: getRelativeDate(-1),
    meal_session: "lunch",
    checked_in_at: getRelativeDate(-1) + "T12:45:00Z",
    verified_by: "usr_counter_1",
    verification_method: "camera_qr",
    override_reason: null
  },
  {
    id: "att_3",
    student_id: "usr_stud_2",
    subscription_id: "sub_2",
    service_date: getRelativeDate(-1),
    meal_session: "dinner",
    checked_in_at: getRelativeDate(-1) + "T20:15:00Z",
    verified_by: "usr_counter_1",
    verification_method: "camera_qr",
    override_reason: null
  }
];

export const SEED_LEAVE_REQUESTS = [
  {
    id: "leave_1",
    student_id: "usr_stud_1",
    subscription_id: "sub_1",
    start_date: getRelativeDate(5),
    end_date: getRelativeDate(9), // 5 days -> Qualifying!
    reason: "Campus Inter-College Robotics Hackathon at IIT Madras",
    status: "approved",
    reviewed_by: "usr_admin_1",
    reviewed_at: getRelativeDate(-1) + "T14:00:00Z",
    credited_days: 5
  },
  {
    id: "leave_2",
    student_id: "usr_stud_3",
    subscription_id: "sub_3",
    start_date: getRelativeDate(8),
    end_date: getRelativeDate(12), // 5 days -> Pending review
    reason: "Family wedding in hometown (Madurai)",
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    credited_days: 0
  }
];

export const SEED_MENUS = [
  {
    id: "menu_today_lunch",
    service_date: getTodayDateString(),
    meal_session: "lunch",
    title: "Chettinad & Traditional Tamil Feast",
    items: [
      "Steamed Ponni Boiled Rice & Fragrant Jeera Rice",
      "Traditional Drumstick & Shallot Sambar",
      "Pepper Rasam & Curd with tempered Mustard",
      "Vazhaipoo Poriyal & Potato Roast",
      "Crispy Urad Appalam & Mango Thokku Pickle",
      "Payasam Dessert (Moong Dal & Jaggery)"
    ],
    non_veg_addon: "Chettinad Spicy Chicken Sukka & Egg Masala",
    serving_hours: "12:00 PM – 03:00 PM",
    published: true
  },
  {
    id: "menu_today_dinner",
    service_date: getTodayDateString(),
    meal_session: "dinner",
    title: "Hot Tiffin & Biryani Night",
    items: [
      "Crispy Ghee Roast Dosa & Fluffy Idlis",
      "Madurai Style Veg Kothu Parotta",
      "Spicy Coconut Chutney & Tomato Kara Chutney",
      "Mixed Vegetable Kurma & Sambar",
      "Hot Masala Milk with Badam & Cardamom"
    ],
    non_veg_addon: "Dindigul Style Seeraga Samba Chicken Biryani",
    serving_hours: "07:30 PM – 10:30 PM",
    published: true
  }
];

export const SEED_SETTINGS = {
  mess_name: "ProMess",
  campus_name: "MIT ACSC Campus Dining",
  campus_address: "Ground Floor, Canteen Dining Hall, MIT ACSC, Alandi, Pune, Maharashtra",
  contact_phone: "+91 94422 10890",
  contact_email: "dining@promess.mitacsc.edu",
  campus_timezone: "Asia/Kolkata",
  lunch_hours: "12:00 PM – 03:00 PM",
  dinner_hours: "07:30 PM – 10:30 PM",
  min_leave_days_for_extension: 4,
  rates_30_days: {
    lunch_veg: 1920,
    dinner_veg: 2520,
    both_veg: 3200,
    both_non_veg: 4200
  }
};
