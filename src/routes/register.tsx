import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  GraduationCap,
  Shield,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  Upload,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Lock,
  User,
  Layers,
  FileCode,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── ROUTE DEFINITION ──
export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Universal Portal Enrollment · Campus OS" },
      {
        name: "description",
        content: "Register a new School Admin, Teacher, Student, or Parent profile.",
      },
    ],
  }),
  component: RegisterPage,
});

// ── MOCK DATA ──
const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    monthlyPrice: 0,
    yearlyPrice: 0,
    students: "Up to 50",
    teachers: "Up to 5",
    parents: "Up to 50",
    storage: "1 GB",
    support: "Email support",
    modules: ["Academics Basics", "Attendance Logs"],
  },
  {
    id: "basic",
    name: "Basic SaaS",
    monthlyPrice: 999,
    yearlyPrice: 9590, // ~20% off
    students: "Up to 200",
    teachers: "Up to 20",
    parents: "Up to 200",
    storage: "10 GB",
    support: "Standard Email support",
    modules: ["Academics", "Library", "Basic Finance"],
  },
  {
    id: "pro",
    name: "Pro Suite",
    monthlyPrice: 2499,
    yearlyPrice: 23990, // ~20% off
    students: "Up to 500",
    teachers: "Up to 50",
    parents: "Up to 500",
    storage: "50 GB",
    support: "Priority Email & Chat",
    modules: [
      "Academics",
      "Finance Hub",
      "HR & Payroll",
      "Library Hub",
      "AI Hub Beta",
      "Transport",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Core",
    monthlyPrice: 4999,
    yearlyPrice: 47990,
    students: "Up to 2000",
    teachers: "Unlimited",
    parents: "Unlimited",
    storage: "150 GB",
    support: "24/7 Phone & Priority SLA",
    modules: [
      "All Standard Modules",
      "AI Hub Advanced",
      "Canteen Mess Beta",
      "Analytics & Reports",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Custom",
    monthlyPrice: 9999,
    yearlyPrice: 95990,
    students: "Unlimited",
    teachers: "Unlimited",
    parents: "Unlimited",
    storage: "1 TB",
    support: "Dedicated Account Manager",
    modules: [
      "All Core Modules",
      "Custom LMS Integrations",
      "SSO & Webhooks Support",
      "Dedicated DB Health Nodes",
    ],
  },
];

const SUBJECTS_LIST = [
  "Mathematics",
  "English Literature",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
  "Art",
  "Physical Education",
];
const CLASSES_LIST = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<
    "school" | "teacher" | "student" | "parent"
  >("school");

  // ── SCHOOL ADMIN SUBSCRIPTION-FIRST FLOW STATE ──
  const [schoolStep, setSchoolStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState("pro");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "net" | "wallet">("upi");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">(
    "idle",
  );
  const [otpMockVerified, setOtpMockVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Form State: Step 1 Pre-Reg
  const [schoolPreReg, setSchoolPreReg] = useState({
    schoolName: "",
    adminName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "India",
    schoolType: "Secondary",
    board: "CBSE",
    password: "",
    confirmPassword: "",
  });

  // Form State: Step 4 Post-Reg Details
  const [schoolPostReg, setSchoolPostReg] = useState({
    logo: "",
    address1: "",
    address2: "",
    pinCode: "",
    regNumber: "",
    affiliationNumber: "",
    establishmentYear: "2020",
    website: "",
    motto: "",
    designation: "Principal",
    adminPhoto: "",
    approxStudents: "500",
    approxTeachers: "40",
    referral: "",
    acceptTerms: true,
  });

  const [generatedSchoolId, setGeneratedSchoolId] = useState("");

  // ── TEACHER REGISTRATION FORM STATE ──
  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "O+",
    nationality: "Indian",
    email: "",
    phone: "",
    altPhone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    employeeId: "TEA-" + Math.floor(1000 + Math.random() * 9000),
    designation: "Teacher",
    department: "Academics",
    subjects: [] as string[],
    classes: [] as string[],
    joiningDate: new Date().toISOString().split("T")[0],
    employmentType: "Full-time",
    experience: "3",
    qualification: "B.Ed",
    specialization: "General Education",
    schoolCode: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
  });

  // ── STUDENT REGISTRATION FORM STATE ──
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "A+",
    nationality: "Indian",
    religion: "General",
    category: "General",
    motherTongue: "English",
    aadhaarNumber: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    admissionNumber: "ADM-2026-" + Math.floor(1000 + Math.random() * 9000),
    class: "Grade 9",
    section: "A",
    rollNumber: "15",
    academicYear: "2026-2027",
    admissionDate: new Date().toISOString().split("T")[0],
    previousSchool: "",
    previousResult: "",
    busRoute: "Route 4 - North Line",
    houseName: "Blue House",
    schoolCode: "",
    fatherName: "",
    motherName: "",
    primaryGuardian: "Father",
    guardianPhone: "",
    linkParentCode: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
  });

  // ── PARENT REGISTRATION FORM STATE ──
  const [parentForm, setParentForm] = useState({
    fatherName: "",
    motherName: "",
    primaryContact: "Father",
    guardianName: "",
    relation: "",
    email: "",
    phone: "",
    altPhone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    nationality: "Indian",
    occupationFather: "Service",
    occupationMother: "Business",
    annualIncome: "8,00,000",
    childrenCodes: ["ADM-2026-4820"] as string[], // child linked
    schoolCode: "",
    password: "",
    confirmPassword: "",
    language: "en",
    acceptTerms: true,
  });

  // ── HANDLERS ──

  // Coupon apply logic
  const handleApplyCoupon = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === "SAVE20") {
      setAppliedDiscount({ code: "SAVE20", percent: 20 });
      toast.success("Promo Code Saved!", { description: "20% discount applied to your order." });
    } else if (code === "WINTER50") {
      setAppliedDiscount({ code: "WINTER50", percent: 50 });
      toast.success("Promo Code Active!", { description: "50% introductory discount applied." });
    } else {
      toast.error("Invalid Promo Code", {
        description: "Try entering SAVE20 or WINTER50 for a demo discount.",
      });
    }
  };

  // School OTP flow
  const handleRequestOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!schoolPreReg.email || !schoolPreReg.phone) {
      toast.error("Contact details incomplete", {
        description: "Please enter a valid email and phone number.",
      });
      return;
    }
    setShowOtpField(true);
    toast.info("Security code transmitted!", {
      description: "Enter code 123456 to verify credentials.",
    });
  };

  const handleVerifyOtp = () => {
    if (otpCode === "123456") {
      setOtpMockVerified(true);
      toast.success("Verification success!", {
        description: "Phone and Email successfully authenticated.",
      });
    } else {
      toast.error("Verification failed", { description: "Incorrect passcode. Enter 123456." });
    }
  };

  // Step 1 Submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (schoolPreReg.password !== schoolPreReg.confirmPassword) {
      toast.error("Passwords mismatch", { description: "Please match your passwords." });
      return;
    }
    if (!otpMockVerified) {
      toast.error("Unverified account", {
        description: "Please complete OTP verification (Enter 123456).",
      });
      return;
    }

    if (true) { // useBackend
      setLoading(true);
      const code = "SCH-2026-" + Math.floor(1000 + Math.random() * 9000);
      setGeneratedSchoolId(code);
      try {
        await apiClient("/auth/register", {
          method: "POST",
          data: {
            email: schoolPreReg.email,
            password: schoolPreReg.password,
            firstName: schoolPreReg.adminName.split(" ")[0] || schoolPreReg.adminName,
            lastName: schoolPreReg.adminName.split(" ").slice(1).join(" ") || "Admin",
            role: "SUPER_ADMIN",
            schoolName: schoolPreReg.schoolName,
            schoolCode: code,
          },
        });

        toast.success("Account created!", {
          description: "Check your email for the confirmation link.",
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Registration failed", { description: err.message || "An unexpected error occurred during signup." });
        return;
      } finally {
        setLoading(false);
      }
    }

    setSchoolStep(2);
  };

  // Step 2 plan selected -> go to payment
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setSchoolStep(3);
  };

  // Step 3 Payment Processing Simulation
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus("pending");
    toast.loading("Contacting payment gateway...", {
      description: "Connecting Razorpay secure channel.",
    });

    setTimeout(() => {
      setPaymentStatus("success");
      toast.dismiss();
      toast.success("Payment Captured!", {
        description: "Transaction completed successfully. Ledger saved.",
      });
      setSchoolStep(4);
    }, 1800);
  };

  // Step 4 Complete Details
  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolStep(5);
    toast.success("School Profile Configured!", {
      description: "Your platform credentials are ready.",
    });
  };

  // Teacher Forms handlers
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherForm.password !== teacherForm.confirmPassword) {
      toast.error("Passwords mismatch");
      return;
    }

    if (true) { // useBackend
      setLoading(true);
      try {
        await apiClient("/auth/register", {
          method: "POST",
          data: {
            email: teacherForm.email,
            password: teacherForm.password,
            firstName: teacherForm.firstName,
            lastName: teacherForm.lastName,
            role: "TEACHER",
            schoolCode: teacherForm.schoolCode,
          },
        });

        toast.success("Account created!", {
          description: "Please check your email to verify your account.",
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Registration failed", { description: err.message || "An unexpected error occurred during signup." });
        return;
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Teacher registration pending verification!", {
        description:
          "School administrators will audit your degree uploads before account activation.",
      });
    }

    navigate({ to: "/login" });
  };

  // Student Forms Handlers
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentForm.password !== studentForm.confirmPassword) {
      toast.error("Passwords mismatch");
      return;
    }

    if (true) { // useBackend
      setLoading(true);
      try {
        await apiClient("/auth/register", {
          method: "POST",
          data: {
            email: studentForm.email,
            password: studentForm.password,
            firstName: studentForm.firstName,
            lastName: studentForm.lastName,
            role: "STUDENT",
            schoolCode: studentForm.schoolCode,
          },
        });

        toast.success("Account created!", {
          description: "Please check your email to verify your account.",
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Registration failed", { description: err.message || "An unexpected error occurred during signup." });
        return;
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Student file compiled!", {
        description:
          "Linked school admin must verify birth/transfer certificate before rolls generation.",
      });
    }

    navigate({ to: "/login" });
  };

  // Parent Forms Handlers
  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parentForm.password !== parentForm.confirmPassword) {
      toast.error("Passwords mismatch");
      return;
    }

    if (true) { // useBackend
      setLoading(true);
      try {
        await apiClient("/auth/register", {
          method: "POST",
          data: {
            email: parentForm.email,
            password: parentForm.password,
            firstName: parentForm.guardianName || parentForm.fatherName || "Parent",
            lastName: parentForm.motherName || "Name",
            role: "PARENT",
            schoolCode: parentForm.schoolCode,
            childrenCodes: parentForm.childrenCodes,
          },
        });

        toast.success("Account created!", {
          description: "Please check your email to verify your account.",
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Registration failed", { description: err.message || "An unexpected error occurred during signup." });
        return;
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Parent account successfully activated!", {
        description: `Primary updates configured for WhatsApp integration with child ${parentForm.childrenCodes[0]}.`,
      });
    }

    navigate({ to: "/login" });
  };

  // Active Plan Details
  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[2]!;
  const rawPrice = billingPeriod === "monthly" ? activePlan.monthlyPrice : activePlan.yearlyPrice;
  const discountAmount = appliedDiscount ? rawPrice * (appliedDiscount.percent / 100) : 0;
  const taxAmount = (rawPrice - discountAmount) * 0.18; // 18% GST standard
  const totalPrice = rawPrice - discountAmount + taxAmount;

  return (
    <div className="page-mesh min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Campus OS</h1>
              <p className="text-xs text-muted-foreground">Universal Cloud Portal Enrollment</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/login" })}
            className="text-xs font-semibold rounded-xl border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer"
          >
            ← Back to Sign In
          </Button>
        </div>

        {/* PROFILE TAB SWITCHERS (DISABLED ONCE INSIDE POST-REG STEPS OF SCHOOL FLOW) */}
        {!(activeProfileTab === "school" && schoolStep > 1) && (
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1 shadow-sm md:grid-cols-4">
            <button
              onClick={() => setActiveProfileTab("school")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeProfileTab === "school"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Building className="h-4.5 w-4.5" /> School (SaaS)
            </button>
            <button
              onClick={() => setActiveProfileTab("teacher")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeProfileTab === "teacher"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <BookOpen className="h-4.5 w-4.5" /> Teacher
            </button>
            <button
              onClick={() => setActiveProfileTab("student")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeProfileTab === "student"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <GraduationCap className="h-4.5 w-4.5" /> Student
            </button>
            <button
              onClick={() => setActiveProfileTab("parent")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeProfileTab === "parent"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Users className="h-4.5 w-4.5" /> Parent
            </button>
          </div>
        )}

        {/* ── PROFILE ROUTE RENDERERS ── */}

        {/* A. SCHOOL ADMIN FLOW (SUBSCRIPTION FIRST FLOW) */}
        {activeProfileTab === "school" && (
          <div className="space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center justify-between px-1.5 pt-1">
              {[
                { s: 1, label: "Basic Pre-Reg" },
                { s: 2, label: "Select Plan" },
                { s: 3, label: "Secure Payment" },
                { s: 4, label: "Complete Details" },
                { s: 5, label: "Activation" },
              ].map((step) => (
                <div key={step.s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full text-xs font-bold shadow-sm transition-all duration-300",
                      schoolStep === step.s
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                        : schoolStep > step.s
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    {step.s}
                  </div>
                  <span
                    className={cn(
                      "hidden text-xs font-bold tracking-tight md:inline",
                      schoolStep === step.s
                        ? "text-indigo-600 font-extrabold"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.s < 5 && (
                    <span className="hidden text-muted-foreground/35 md:inline">➔</span>
                  )}
                </div>
              ))}
            </div>

            {/* STEP 1: PRE-REGISTRATION */}
            {schoolStep === 1 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Step 1 — SaaS School Onboarding
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Register basic coordinates to secure a temporary trial instance.
                  </p>
                </div>
                <form onSubmit={handleStep1Submit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      School Legal Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Oakwood International School"
                      value={schoolPreReg.schoolName}
                      onChange={(e) =>
                        setSchoolPreReg({ ...schoolPreReg, schoolName: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Owner / Director Full Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Dr. Evelyn Vance"
                      value={schoolPreReg.adminName}
                      onChange={(e) =>
                        setSchoolPreReg({ ...schoolPreReg, adminName: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Official Admin Email Address
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="principal@school.com"
                      value={schoolPreReg.email}
                      onChange={(e) => setSchoolPreReg({ ...schoolPreReg, email: e.target.value })}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Contact Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 9876543210"
                      value={schoolPreReg.phone}
                      onChange={(e) => setSchoolPreReg({ ...schoolPreReg, phone: e.target.value })}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      City
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Seattle"
                      value={schoolPreReg.city}
                      onChange={(e) => setSchoolPreReg({ ...schoolPreReg, city: e.target.value })}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      State / District
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Washington"
                      value={schoolPreReg.state}
                      onChange={(e) => setSchoolPreReg({ ...schoolPreReg, state: e.target.value })}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      School Scope / Type
                    </label>
                    <select
                      value={schoolPreReg.schoolType}
                      onChange={(e) =>
                        setSchoolPreReg({ ...schoolPreReg, schoolType: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none cursor-pointer"
                    >
                      <option value="Primary">Primary (Elementary)</option>
                      <option value="Secondary">Secondary (K-12)</option>
                      <option value="College">College / Academy</option>
                      <option value="University">University Campus</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Affiliated Board
                    </label>
                    <select
                      value={schoolPreReg.board}
                      onChange={(e) => setSchoolPreReg({ ...schoolPreReg, board: e.target.value })}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none cursor-pointer"
                    >
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="ICSE">ICSE / ISC</option>
                      <option value="State">State Education Board</option>
                      <option value="IB">IB (International Baccalaureate)</option>
                      <option value="Autonomous">IGCSE / Autonomous</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      SaaS Portal Password
                    </label>
                    <input
                      required
                      type="password"
                      minLength={6}
                      placeholder="••••••••"
                      value={schoolPreReg.password}
                      onChange={(e) =>
                        setSchoolPreReg({ ...schoolPreReg, password: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Confirm Password
                    </label>
                    <input
                      required
                      type="password"
                      minLength={6}
                      placeholder="••••••••"
                      value={schoolPreReg.confirmPassword}
                      onChange={(e) =>
                        setSchoolPreReg({ ...schoolPreReg, confirmPassword: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Dynamic OTP Verification Box */}
                  <div className="md:col-span-2 border border-dashed border-indigo-500/20 bg-indigo-500/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4.5 w-4.5 text-indigo-400" />
                        <span className="text-xs font-bold text-foreground">
                          Double-Channel Security OTP Mockup
                        </span>
                      </div>
                      {!showOtpField ? (
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-transform duration-200 active:scale-[0.98]"
                        >
                          Request Verification Code
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-500 animate-pulse">
                          Verification active (Use Code: 123456)
                        </span>
                      )}
                    </div>
                    {showOtpField && !otpMockVerified && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="h-9 w-32 border border-border bg-card text-center text-sm font-bold tracking-widest rounded-lg focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 h-9 rounded-lg cursor-pointer"
                        >
                          Verify OTP
                        </button>
                      </div>
                    )}
                    {otpMockVerified && (
                      <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Credentials authenticated successfully!
                        You may now proceed.
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 pt-4 flex justify-end">
                    <Button
                      type="submit"
                      disabled={!otpMockVerified}
                      className="rounded-xl px-6 gap-2"
                    >
                      Continue to Plan Selection <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: CHOOSE SUBSCRIPTION PLAN */}
            {schoolStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col justify-between items-start gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Step 2 — Select Pricing Subscription
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select a cloud tier aligned with student enrollment caps.
                    </p>
                  </div>
                  {/* Period Switcher */}
                  <div className="flex h-10 items-center rounded-xl bg-card border border-border p-1 shadow-sm shrink-0">
                    <button
                      onClick={() => setBillingPeriod("monthly")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                        billingPeriod === "monthly"
                          ? "bg-indigo-500/10 text-indigo-500 shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Monthly Cycle
                    </button>
                    <button
                      onClick={() => setBillingPeriod("yearly")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                        billingPeriod === "yearly"
                          ? "bg-indigo-500/10 text-indigo-500 shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Yearly Cycle
                      <span className="bg-emerald-500 text-white font-bold text-[8px] uppercase px-1 py-0.5 rounded animate-pulse scale-90">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* PLANS LIST CARDS */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {PLANS.map((plan) => {
                    const active = plan.id === selectedPlanId;
                    const price =
                      billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={cn(
                          "relative group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-[420px]",
                          active
                            ? "border-indigo-600 bg-indigo-500/5 ring-2 ring-indigo-500/20 shadow-lg"
                            : "border-border hover:border-indigo-500/20 hover:shadow-md",
                        )}
                      >
                        {plan.popular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm">
                            Most Popular Choice
                          </span>
                        )}

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
                              {plan.name}
                            </h4>
                            <div className="mt-3 flex items-baseline text-foreground">
                              <span className="text-3xl font-extrabold tracking-tight">
                                ₹{price.toLocaleString()}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                /{billingPeriod === "monthly" ? "mo" : "yr"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-border/80 pt-4 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Students:</span>
                              <strong className="text-foreground font-bold">{plan.students}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max Teachers:</span>
                              <strong className="text-foreground font-bold">{plan.teachers}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cloud Storage:</span>
                              <strong className="text-foreground font-bold">{plan.storage}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Support Level:</span>
                              <strong className="text-foreground font-semibold truncate max-w-[120px]">
                                {plan.support}
                              </strong>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-3">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                              Included Modules:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {plan.modules.map((m) => (
                                <span
                                  key={m}
                                  className="bg-muted px-2 py-0.5 rounded text-[9px] font-medium text-muted-foreground truncate"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlan(plan.id);
                          }}
                          className={cn(
                            "w-full py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-4",
                            active
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                              : "border border-border hover:bg-muted text-foreground",
                          )}
                        >
                          Activate Plan Instance
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Compare Plans Button */}
                <div className="flex items-center justify-between pt-4 border-t border-border/80">
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="text-xs text-indigo-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Layers className="h-4 w-4" /> Compare Subscription Plans Matrix
                  </button>
                  <Button onClick={() => setSchoolStep(3)} className="rounded-xl px-6">
                    Continue to Payment <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT GATEWAY */}
            {schoolStep === 3 && (
              <div className="grid gap-6 md:grid-cols-3">
                {/* PAYMENT GATEWAY SIMULATION */}
                <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-md space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Step 3 — Secure Gateway Integration
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Simulated Razorpay & Stripe transaction authorization panel.
                    </p>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-5">
                    {/* Method Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Choose Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {[
                          { id: "upi", name: "UPI Pay", desc: "Paytm, GPay, PhonePe" },
                          { id: "card", name: "Cards", desc: "Credit/Debit card" },
                          { id: "net", name: "NetBanking", desc: "Direct bank transfer" },
                          { id: "wallet", name: "Wallets", desc: "Amazon, Razorpay" },
                        ].map((method) => {
                          const active = paymentMethod === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentMethod(method.id as any)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all cursor-pointer",
                                active
                                  ? "border-indigo-600 bg-indigo-500/5 shadow-md shadow-indigo-600/10"
                                  : "border-border hover:bg-muted/45 text-muted-foreground",
                              )}
                            >
                              <CreditCard
                                className={cn(
                                  "h-5 w-5 mb-1",
                                  active ? "text-indigo-500" : "text-muted-foreground",
                                )}
                              />
                              <div className="text-xs font-bold text-foreground leading-none">
                                {method.name}
                              </div>
                              <div className="text-[9px] text-muted-foreground leading-normal mt-0.5">
                                {method.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Method detail boxes */}
                    {paymentMethod === "upi" && (
                      <div className="bg-muted/20 border border-border p-4 rounded-xl space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Enter UPI ID / VPA
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. principal@upi"
                          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="bg-muted/20 border border-border p-4 rounded-xl space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Cardholder Name
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Evelyn Vance"
                            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Card Number
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={16}
                              placeholder="4111 2222 3333 4444"
                              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Expiry
                              </label>
                              <input
                                required
                                type="text"
                                maxLength={5}
                                placeholder="12/28"
                                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none text-center"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                CVV
                              </label>
                              <input
                                required
                                type="password"
                                maxLength={3}
                                placeholder="•••"
                                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none text-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setSchoolStep(2)}
                        className="text-xs text-muted-foreground font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" /> Go Back
                      </button>
                      <Button
                        type="submit"
                        disabled={paymentStatus === "pending"}
                        className="rounded-xl px-8 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md"
                      >
                        <CheckCircle className="h-4 w-4" /> Authorize & Pay ₹{totalPrice.toFixed(0)}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* ORDER SUMMARY */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-md h-fit space-y-4">
                  <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider border-b border-border/80 pb-2">
                    Order Cart Ledger
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Plan:</span>
                      <strong className="text-foreground">{activePlan.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing Cycle:</span>
                      <strong className="text-foreground uppercase">{billingPeriod}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price:</span>
                      <strong className="text-foreground">₹{rawPrice.toLocaleString()}</strong>
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                        <span>Coupon ({appliedDiscount.code}):</span>
                        <span>- ₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-border/40 pt-2 text-[11px] font-semibold">
                      <span className="text-muted-foreground">Tax / 18% GST:</span>
                      <strong className="text-foreground">₹{taxAmount.toFixed(0)}</strong>
                    </div>

                    <div className="flex justify-between border-t border-border pt-3 text-sm font-extrabold">
                      <span className="text-indigo-600">Total Payable:</span>
                      <strong className="text-foreground text-base">
                        ₹{totalPrice.toFixed(0)}
                      </strong>
                    </div>
                  </div>

                  {/* PROMO CODES INPUT */}
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Apply Promo Coupon Code
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Try: SAVE20, WINTER50"
                        className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-xs uppercase outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: COMPLETE DETAILS (POST-PAYMENT) */}
            {schoolStep === 4 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-500 mb-2">
                    Payment Verified ✓ Transaction Ref: TXN-
                    {Math.floor(100000 + Math.random() * 900000)}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Step 4 — Finalize School Coordinates
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Complete full school documentation profile under pricing license.
                  </p>
                </div>

                <form onSubmit={handleStep4Submit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      School Brand Logo
                    </label>
                    <div className="flex gap-4 items-center p-4 border border-dashed border-border rounded-xl bg-muted/10">
                      <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/25 grid place-items-center text-indigo-400">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <button
                          type="button"
                          className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
                        >
                          Upload image payload
                        </button>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          Maximum upload size allowed under core quotas: 25MB.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Address Line 1
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 742 Evergreen Terrace"
                      value={schoolPostReg.address1}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, address1: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suite 400"
                      value={schoolPostReg.address2}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, address2: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Postal Pin / ZIP Code
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 98101"
                      value={schoolPostReg.pinCode}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, pinCode: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Govt. School Registration No.
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. REG-389-91A"
                      value={schoolPostReg.regNumber}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, regNumber: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      School Board Affiliation No.
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. AFFIL-2024-0012"
                      value={schoolPostReg.affiliationNumber}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, affiliationNumber: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Year of Establishment
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="2010"
                      value={schoolPostReg.establishmentYear}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, establishmentYear: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      School Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://oakwood.edu"
                      value={schoolPostReg.website}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, website: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Admin Designation
                    </label>
                    <select
                      value={schoolPostReg.designation}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, designation: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                    >
                      <option value="Principal">Principal</option>
                      <option value="Director">Director / Chairman</option>
                      <option value="Owner">School Owner</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Approx Students Count
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="400"
                      value={schoolPostReg.approxStudents}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, approxStudents: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Approx Teachers Count
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="35"
                      value={schoolPostReg.approxTeachers}
                      onChange={(e) =>
                        setSchoolPostReg({ ...schoolPostReg, approxTeachers: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        required
                        type="checkbox"
                        checked={schoolPostReg.acceptTerms}
                        onChange={(e) =>
                          setSchoolPostReg({ ...schoolPostReg, acceptTerms: e.target.checked })
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                      />
                      <span>
                        I hereby accept Campus OS terms of service and GDPR data protection
                        policies.
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2 pt-4 flex justify-end">
                    <Button
                      type="submit"
                      className="rounded-xl px-6 gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Configure Activation Keys <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 5: ACCOUNT ACTIVATION */}
            {schoolStep === 5 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 shadow shadow-emerald-500/10 animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">
                    School Account Successfully Activated!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Your Campus OS Cloud instance has been initialized and synchronized. Here is
                    your platform receipt.
                  </p>
                </div>

                {/* Activation Details Dashboard */}
                <div className="max-w-md mx-auto bg-muted/20 border border-border p-4 rounded-xl space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-border pb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Auto-Generated School ID
                    </span>
                    <strong className="font-mono text-xs text-indigo-500 select-all font-bold">
                      {generatedSchoolId}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Admin Username / Code:</span>
                    <strong className="text-foreground font-mono">{schoolPreReg.email}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Subscription Tier:</span>
                    <strong className="text-indigo-500">
                      {activePlan.name} ({billingPeriod})
                    </strong>
                  </div>

                  {/* Mock PDF Invoice Preview generation */}
                  <div className="pt-2.5 border-t border-border/80">
                    <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Receipt PDF Invoice Preview
                    </h4>
                    <div className="bg-card border border-border p-3 rounded-lg shadow-sm font-mono text-[9px] text-muted-foreground leading-normal space-y-1">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>CAMPUS OS BILLING</span>
                        <span>INVOICE PREVIEW</span>
                      </div>
                      <div className="text-[8px]">Date: {new Date().toLocaleDateString()}</div>
                      <div className="text-[8px]">School: {schoolPreReg.schoolName}</div>
                      <hr className="border-border/40" />
                      <div className="flex justify-between">
                        <span>Base price:</span>
                        <span>₹{rawPrice.toLocaleString()}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-emerald-500">
                          <span>Discount ({appliedDiscount.code}):</span>
                          <span>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>GST / Tax (18%):</span>
                        <span>₹{taxAmount.toFixed(0)}</span>
                      </div>
                      <hr className="border-border/60" />
                      <div className="flex justify-between font-bold text-foreground text-[10px]">
                        <span>Paid Total:</span>
                        <span>₹{totalPrice.toFixed(0)}</span>
                      </div>
                      <div className="text-[7px] text-emerald-500 font-bold uppercase tracking-wide text-center pt-1 animate-pulse">
                        ✓ Payment Captured via Razorpay
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info("Invoice receipt file download initiated successfully.");
                    }}
                    className="text-xs font-semibold rounded-xl"
                  >
                    Download Invoice PDF
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success(
                        `Welcome to ${schoolPreReg.schoolName}! Logging you in as School Admin.`,
                      );
                      navigate({ to: "/admin" });
                    }}
                    className="rounded-xl px-6 gap-2"
                  >
                    Go to Admin Directory <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* B. TEACHER REGISTRATION FORM */}
        {activeProfileTab === "teacher" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Teacher Professional Enrollment</h3>
              <p className="text-xs text-muted-foreground">
                Complete teacher credentials details to request system roles access.
              </p>
            </div>

            <form onSubmit={handleTeacherSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  First Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John"
                  value={teacherForm.firstName}
                  onChange={(e) => setTeacherForm({ ...teacherForm, firstName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Doe"
                  value={teacherForm.lastName}
                  onChange={(e) => setTeacherForm({ ...teacherForm, lastName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date of Birth
                </label>
                <input
                  required
                  type="date"
                  value={teacherForm.dob}
                  onChange={(e) => setTeacherForm({ ...teacherForm, dob: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Gender
                  </label>
                  <select
                    value={teacherForm.gender}
                    onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Blood Group
                  </label>
                  <select
                    value={teacherForm.bloodGroup}
                    onChange={(e) => setTeacherForm({ ...teacherForm, bloodGroup: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                  >
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Personal Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="john.doe@email.com"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Linked School Code
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SCH-2026-1039"
                  value={teacherForm.schoolCode}
                  onChange={(e) => setTeacherForm({ ...teacherForm, schoolCode: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current Designation
                </label>
                <select
                  value={teacherForm.designation}
                  onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                >
                  <option value="Teacher">Subject Teacher</option>
                  <option value="Senior Teacher">Senior Faculty</option>
                  <option value="HOD">Head of Department (HOD)</option>
                  <option value="Vice Principal">Vice Principal</option>
                </select>
              </div>

              {/* Multi-Select Subject lists */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Subjects Taught (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-1.5 border border-border p-3 rounded-lg bg-card/60 max-h-[100px] overflow-y-auto">
                  {SUBJECTS_LIST.map((subj) => {
                    const checked = teacherForm.subjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setTeacherForm({
                            ...teacherForm,
                            subjects: checked
                              ? teacherForm.subjects.filter((s) => s !== subj)
                              : [...teacherForm.subjects, subj],
                          });
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-semibold border rounded-lg transition-all cursor-pointer",
                          checked
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-card text-muted-foreground border-border",
                        )}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Select Assigned Classes */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Classes Assigned (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-1.5 border border-border p-3 rounded-lg bg-card/60 max-h-[100px] overflow-y-auto">
                  {CLASSES_LIST.map((cls) => {
                    const checked = teacherForm.classes.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          setTeacherForm({
                            ...teacherForm,
                            classes: checked
                              ? teacherForm.classes.filter((c) => c !== cls)
                              : [...teacherForm.classes, cls],
                          });
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-semibold border rounded-lg transition-all cursor-pointer",
                          checked
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-card text-muted-foreground border-border",
                        )}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document uploads */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Upload Teaching Degree / ID proof
                </label>
                <div className="flex gap-4 items-center p-4 border border-dashed border-border rounded-xl bg-muted/10">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/25 grid place-items-center text-indigo-400 shrink-0">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
                    >
                      Upload credentials file
                    </button>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      Please upload certificates (B.Ed degree, Voter ID or Aadhaar Card) as PDF.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Portal Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={teacherForm.confirmPassword}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, confirmPassword: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end">
                <Button type="submit" className="rounded-xl px-8">
                  Submit Teacher Application
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* C. STUDENT REGISTRATION FORM */}
        {activeProfileTab === "student" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Student Academic Enrollment</h3>
              <p className="text-xs text-muted-foreground">
                Complete student personal, academic and parent linkage fields.
              </p>
            </div>

            <form onSubmit={handleStudentSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  First Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Alice"
                  value={studentForm.firstName}
                  onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Vance"
                  value={studentForm.lastName}
                  onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Student Email (Login ID)
                </label>
                <input
                  required
                  type="email"
                  placeholder="student@example.com"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date of Birth
                </label>
                <input
                  required
                  type="date"
                  value={studentForm.dob}
                  onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Gender
                  </label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Caste Category
                  </label>
                  <select
                    value={studentForm.category}
                    onChange={(e) => setStudentForm({ ...studentForm, category: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Linked School Code
                </label>
                <input
                  required
                  type="text"
                  placeholder="SCH-2026-XXXX"
                  value={studentForm.schoolCode}
                  onChange={(e) => setStudentForm({ ...studentForm, schoolCode: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Class / Grade
                  </label>
                  <select
                    value={studentForm.class}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                  >
                    {CLASSES_LIST.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Section
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="A"
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs text-center uppercase outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Guardian Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Father's or Mother's Name"
                  value={studentForm.fatherName}
                  onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Guardian Phone Number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 01920"
                  value={studentForm.guardianPhone}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, guardianPhone: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              {/* Document upload box */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Upload Birth Certificate & School LC
                </label>
                <div className="flex gap-4 items-center p-4 border border-dashed border-border rounded-xl bg-muted/10">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/25 grid place-items-center text-indigo-400 shrink-0">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
                    >
                      Upload credentials file
                    </button>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      Please attach pdf files of Birth Certificate and Transfer Certificate (LC).
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Portal Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={studentForm.confirmPassword}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, confirmPassword: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end">
                <Button type="submit" className="rounded-xl px-8">
                  Submit Student Files
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* D. PARENT REGISTRATION FORM */}
        {activeProfileTab === "parent" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Parent / Guardian Enrollment</h3>
              <p className="text-xs text-muted-foreground">
                Link father, mother and multiple childrens records across schools.
              </p>
            </div>

            <form onSubmit={handleParentSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Father's Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. David Vance"
                  value={parentForm.fatherName}
                  onChange={(e) => setParentForm({ ...parentForm, fatherName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Mother's Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah Vance"
                  value={parentForm.motherName}
                  onChange={(e) => setParentForm({ ...parentForm, motherName: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Contact Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="parents@gmail.com"
                  value={parentForm.email}
                  onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Mobile Number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 09281"
                  value={parentForm.phone}
                  onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  WhatsApp Broadcast Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 09281"
                  value={parentForm.whatsapp}
                  onChange={(e) => setParentForm({ ...parentForm, whatsapp: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Preferred Language for SMS Alerts
                </label>
                <select
                  value={parentForm.language}
                  onChange={(e) => setParentForm({ ...parentForm, language: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs cursor-pointer"
                >
                  <option value="en">English Updates</option>
                  <option value="es">Español Alerts</option>
                  <option value="hi">Hindi alerts</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              {/* Multiple child linkage fields */}
              <div className="space-y-1 md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Link Multiple Children's Student ID (Admission Code)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setParentForm({
                        ...parentForm,
                        childrenCodes: [...parentForm.childrenCodes, ""],
                      });
                    }}
                    className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
                  >
                    + Add Another Child
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {parentForm.childrenCodes.map((code, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        required
                        type="text"
                        placeholder="e.g. ADM-2026-XXXX"
                        value={code}
                        onChange={(e) => {
                          const updated = [...parentForm.childrenCodes];
                          updated[idx] = e.target.value;
                          setParentForm({ ...parentForm, childrenCodes: updated });
                        }}
                        className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-indigo-500"
                      />
                      {parentForm.childrenCodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setParentForm({
                              ...parentForm,
                              childrenCodes: parentForm.childrenCodes.filter((_, i) => i !== idx),
                            });
                          }}
                          className="text-xs text-rose-500 font-bold px-2 cursor-pointer hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Linked School Code
                </label>
                <input
                  required
                  type="text"
                  placeholder="SCH-2026-XXXX"
                  value={parentForm.schoolCode}
                  onChange={(e) => setParentForm({ ...parentForm, schoolCode: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Portal Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={parentForm.password}
                  onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={parentForm.confirmPassword}
                  onChange={(e) =>
                    setParentForm({ ...parentForm, confirmPassword: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                />
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end">
                <Button type="submit" className="rounded-xl px-8">
                  Register Parent Credentials
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* COMPARISON MODAL FOR PLANS */}
        {showCompareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCompareModal(false)}
            />
            <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col justify-between z-10 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" /> Complete SaaS
                    Plan Feature Comparison Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Examine precise module allocation gates before authorizing billing cycles.
                  </p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold bg-muted px-2.5 py-1 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-x-auto my-4 border border-border rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="p-3 font-extrabold">Feature / Module scope</th>
                      {PLANS.map((p) => (
                        <th
                          key={p.id}
                          className="p-3 font-extrabold text-center border-l border-border/60"
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="p-3 font-semibold text-muted-foreground">Monthly Fee</td>
                      {PLANS.map((p) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-bold text-foreground"
                        >
                          ₹{p.monthlyPrice.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <td className="p-3 font-semibold text-muted-foreground">Max Students Cap</td>
                      {PLANS.map((p) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-semibold"
                        >
                          {p.students}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-3 font-semibold text-muted-foreground">Max Teachers Cap</td>
                      {PLANS.map((p) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-semibold"
                        >
                          {p.teachers}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <td className="p-3 font-semibold text-muted-foreground">
                        Academics Hub (Grades/Timetable)
                      </td>
                      {PLANS.map((p, idx) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 text-emerald-500 font-bold"
                        >
                          ✓ Full
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-3 font-semibold text-muted-foreground">
                        Finance Hub (Fee Ledger & Tax)
                      </td>
                      {PLANS.map((p, idx) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-bold"
                        >
                          {idx === 0 ? (
                            <span className="text-muted-foreground/40">✕</span>
                          ) : (
                            <span className="text-emerald-500">✓ Full</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <td className="p-3 font-semibold text-muted-foreground">
                        AI Lessons Planner Node
                      </td>
                      {PLANS.map((p, idx) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-bold"
                        >
                          {idx < 2 ? (
                            <span className="text-muted-foreground/40">✕</span>
                          ) : (
                            <span className="text-emerald-500">✓ Gemini live</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-3 font-semibold text-muted-foreground">
                        Canteen Mess module
                      </td>
                      {PLANS.map((p, idx) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-bold"
                        >
                          {idx < 3 ? (
                            <span className="text-muted-foreground/40">✕</span>
                          ) : (
                            <span className="text-emerald-500">✓ Beta Active</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <td className="p-3 font-semibold text-muted-foreground">
                        LMS & SSO webhooks integration
                      </td>
                      {PLANS.map((p, idx) => (
                        <td
                          key={p.id}
                          className="p-3 text-center border-l border-border/40 font-bold"
                        >
                          {idx < 4 ? (
                            <span className="text-rose-500">✕ Custom</span>
                          ) : (
                            <span className="text-emerald-500">✓ Full</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button onClick={() => setShowCompareModal(false)} className="rounded-xl">
                  Confirm & Select Card
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
