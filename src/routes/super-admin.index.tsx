import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSuperAdmin } from "@/components/super-admin/super-admin-context";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Globe,
  Lock,
  ShieldAlert,
  Monitor,
  MapPin,
  RefreshCw,
  Key,
  FileCheck,
  Ban,
  Trash,
  KeyRound,
  AlertTriangle,
  Play,
  HelpCircle,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";
import { Panel, PageHeader, EmptyState } from "@/components/module-shell";
import { StatusBadge, DataTable, TableHead, TableRow, ActionButton } from "@/components/page-ui";
import { toast } from "sonner";

// ── TYPES ──
interface AuditUser {
  id: string;
  name: string;
  email: string;
  schoolId: string;
  schoolName: string;
  role: "Admin" | "Teacher" | "Student" | "Parent";
  status: "Active" | "Inactive" | "Suspended";
  lastActive: string;
  deviceInfo: string;
  lastLocation: string;
}

interface AuditLog {
  id: string;
  operator: string;
  role: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  status: "Success" | "Failed" | "Suspicious";
}

interface ActiveSession {
  id: string;
  userName: string;
  email: string;
  schoolName: string;
  role: string;
  device: string;
  location: string;
  ip: string;
}

// ── ROUTE DEFINITION ──
export const Route = createFileRoute("/super-admin/")({
  component: SuperAdminDashboard,
});

// ── MOCK DATA ──
const INITIAL_AUDIT_USERS: AuditUser[] = [
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10001",
    name: "Dr. Evelyn Vance",
    email: "e.vance@oakwood.edu",
    schoolId: "f3b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    schoolName: "Oakwood International School",
    role: "Admin",
    status: "Active",
    lastActive: "5 mins ago",
    deviceInfo: "Chrome 125, Windows 11",
    lastLocation: "Seattle, WA, USA",
  },
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10002",
    name: "Marcus Aurelius",
    email: "m.aurelius@horizon.academy",
    schoolId: "a1b2c3d4e5f678901234567890abcdef",
    schoolName: "Horizon Science Academy",
    role: "Teacher",
    status: "Active",
    lastActive: "2 hours ago",
    deviceInfo: "Firefox 120, macOS Sonoma",
    lastLocation: "Chicago, IL, USA",
  },
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10003",
    name: "Emily Watson",
    email: "e.watson@pinecrest.k12.org",
    schoolId: "1234567890abcdef1234567890abcdef",
    schoolName: "Pinecrest Elementary School",
    role: "Student",
    status: "Inactive",
    lastActive: "3 days ago",
    deviceInfo: "Safari Mobile, iOS 17.4",
    lastLocation: "Denver, CO, USA",
  },
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10004",
    name: "David Beckham",
    email: "d.beckham@beaconprep.com",
    schoolId: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
    schoolName: "Beacon Preparatory School",
    role: "Parent",
    status: "Suspended",
    lastActive: "4 weeks ago",
    deviceInfo: "Edge 123, Android 14",
    lastLocation: "Boston, MA, USA",
  },
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10005",
    name: "Sophia Loren",
    email: "s.loren@stmaryshs.org",
    schoolId: "5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a",
    schoolName: "St. Mary's Catholic High School",
    role: "Teacher",
    status: "Active",
    lastActive: "10 mins ago",
    deviceInfo: "Chrome 125, Windows 11",
    lastLocation: "Philadelphia, PA, USA",
  },
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10006",
    name: "George Clooney",
    email: "g.clooney@oakwood.edu",
    schoolId: "f3b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    schoolName: "Oakwood International School",
    role: "Student",
    status: "Active",
    lastActive: "1 hour ago",
    deviceInfo: "Chrome 125, iPadOS 17",
    lastLocation: "Seattle, WA, USA",
  },
  {
    id: "usr-4d92a8e1b0c9f8a7d6e5f4c3b2a10007",
    name: "Keanu Reeves",
    email: "k.reeves@horizon.academy",
    schoolId: "a1b2c3d4e5f678901234567890abcdef",
    schoolName: "Horizon Science Academy",
    role: "Parent",
    status: "Active",
    lastActive: "45 mins ago",
    deviceInfo: "Safari, macOS Sonoma",
    lastLocation: "Chicago, IL, USA",
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    operator: "global.admin@campus.os",
    role: "Super Admin",
    action: "Approved St. Jude Catholic University deployment",
    timestamp: "5 mins ago",
    ipAddress: "198.162.24.91",
    status: "Success",
  },
  {
    id: "log-2",
    operator: "global.admin@campus.os",
    role: "Super Admin",
    action: "Blacklisted Beacon Preparatory School system license",
    timestamp: "1 hour ago",
    ipAddress: "198.162.24.91",
    status: "Success",
  },
  {
    id: "log-3",
    operator: "e.vance@oakwood.edu",
    role: "School Admin",
    action: "Failed login attempt: Credentials mismatch (3 times)",
    timestamp: "2 hours ago",
    ipAddress: "135.210.98.42",
    status: "Failed",
  },
  {
    id: "log-4",
    operator: "m.aurelius@horizon.academy",
    role: "Teacher",
    action: "Extensive bulk export of student grades (Grade 10)",
    timestamp: "4 hours ago",
    ipAddress: "85.92.105.18",
    status: "Suspicious",
  },
  {
    id: "log-5",
    operator: "global.admin@campus.os",
    role: "Super Admin",
    action: "Enforced platform-wide Two-Factor Authentication policy",
    timestamp: "1 day ago",
    ipAddress: "198.162.24.91",
    status: "Success",
  },
  {
    id: "log-6",
    operator: "global.admin@campus.os",
    role: "Super Admin",
    action: "Rotated stripe credit gateway integration keys for Horizon Academy",
    timestamp: "2 days ago",
    ipAddress: "198.162.24.91",
    status: "Success",
  },
];

const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "ses-1",
    userName: "Dr. Evelyn Vance",
    email: "e.vance@oakwood.edu",
    schoolName: "Oakwood International",
    role: "School Admin",
    device: "Chrome 125, Windows 11",
    location: "Seattle, WA, USA",
    ip: "135.210.98.42",
  },
  {
    id: "ses-2",
    userName: "Marcus Aurelius",
    email: "m.aurelius@horizon.academy",
    schoolName: "Horizon Science Academy",
    role: "Teacher",
    device: "Firefox 120, macOS Sonoma",
    location: "Chicago, IL, USA",
    ip: "85.92.105.18",
  },
  {
    id: "ses-3",
    userName: "System Controller",
    email: "global.admin@campus.os",
    schoolName: "Campus OS SaaS Core",
    role: "Super Admin",
    device: "Chrome 125, Linux 6.4",
    location: "San Francisco, CA, USA",
    ip: "198.162.24.91",
  },
];

const CHART_COLORS = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

// ── MAIN COMPONENT ──
function SuperAdminDashboard() {
  const { schools } = useSuperAdmin();

  // Sub-tabs State: 'analytics' | 'users' | 'security'
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "users" | "security">("analytics");

  // Users State
  const [users, setUsers] = useState<AuditUser[]>(INITIAL_AUDIT_USERS);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userSchoolFilter, setUserSchoolFilter] = useState("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");

  // Duplicate User Merging state
  const [mergeSourceEmail, setMergeSourceEmail] = useState("");
  const [mergeTargetEmail, setMergeTargetEmail] = useState("");

  // Global Password policy state
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    expiryDays: 90,
    enforceSpecial: true,
    enforceNumbers: true,
  });

  // Security and IP control state
  const [securityLogs, setSecurityLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(INITIAL_ACTIVE_SESSIONS);
  const [ipFilters, setIpFilters] = useState<string[]>(["124.90.15.22", "85.92.105.0/24"]);
  const [newIpFilter, setNewIpFilter] = useState("");

  // Metrics calculations
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.status === "Active").length;
  const suspendedSchools = schools.filter((s) => s.status === "Suspended").length;
  const blacklistedSchools = schools.filter((s) => s.status === "Blacklisted").length;

  const totalStudents = schools.reduce((acc, curr) => acc + curr.studentCount, 0);
  const totalTeachers = schools.reduce((acc, curr) => acc + curr.teacherCount, 0);
  const totalParents = Math.round(totalStudents * 0.9);
  const totalAdmins = schools.length * 2;
  const totalPlatformUsers = totalStudents + totalTeachers + totalParents + totalAdmins;

  const mrr = schools.reduce((acc, curr) => {
    if (curr.status !== "Active") return acc;
    const rates = { Basic: 150, Pro: 450, Enterprise: 950 };
    return acc + rates[curr.plan];
  }, 0);

  const studentToTeacherRatio = useMemo(() => {
    if (totalTeachers === 0) return "0:0";
    const ratio = totalStudents / totalTeachers;
    return `${Math.round(ratio)}:1`;
  }, [totalStudents, totalTeachers]);

  // Analytics Chart Data
  const growthData = [
    { month: "Jan", Basic: 1, Pro: 2, Enterprise: 1 },
    { month: "Feb", Basic: 2, Pro: 2, Enterprise: 1 },
    { month: "Mar", Basic: 2, Pro: 3, Enterprise: 2 },
    { month: "Apr", Basic: 3, Pro: 3, Enterprise: 2 },
    { month: "May", Basic: 4, Pro: 5, Enterprise: 3 },
    { month: "Jun", Basic: 5, Pro: 6, Enterprise: 4 },
  ];

  const usageData = [
    { hour: "08:00", requests: 1200 },
    { hour: "10:00", requests: 4200 },
    { hour: "12:00", requests: 2800 },
    { hour: "14:00", requests: 3800 },
    { hour: "16:00", requests: 4500 },
    { hour: "18:00", requests: 1800 },
    { hour: "20:00", requests: 900 },
  ];

  const moduleAdoptionData = [
    { name: "Academics", value: 5 },
    { name: "Finance", value: 4 },
    { name: "HR & Payroll", value: 3 },
    { name: "Canteen Mess", value: 2 },
    { name: "Transport Hub", value: 4 },
    { name: "AI Planner Hub", value: 3 },
  ];

  // DAU / MAU analytics
  const dauMauData = [
    { date: "May 20", DAU: 2400, MAU: 12000 },
    { date: "May 21", DAU: 2800, MAU: 12500 },
    { date: "May 22", DAU: 2700, MAU: 12800 },
    { date: "May 23", DAU: 3200, MAU: 13000 },
    { date: "May 24", DAU: 3500, MAU: 13400 },
    { date: "May 25", DAU: 4100, MAU: 14200 },
  ];

  // User filters logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id.toLowerCase().includes(userSearch.toLowerCase());

      const matchesSchool = userSchoolFilter === "ALL" || u.schoolId === userSchoolFilter;
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;

      return matchesSearch && matchesSchool && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userSchoolFilter, userRoleFilter, userStatusFilter]);

  // Bulk actions handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedUserIds((prev) =>
      checked ? [...prev, id] : prev.filter((userId) => userId !== id),
    );
  };

  const handleBulkDeactivate = () => {
    if (selectedUserIds.length === 0) return;
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: "Inactive" } : u)),
    );
    setSelectedUserIds([]);
    toast.success("Bulk Deactivation Complete", {
      description: "Successfully deactivated selected user accounts across tenants.",
    });
  };

  const handleBulkExport = () => {
    toast.info("Preparing Export File...", {
      description: `CSV download containing audit profiles compiled successfully.`,
    });
  };

  const handleForceResetPassword = (userId: string) => {
    toast.success("Password Force Reset Dispatched!", {
      description: `Password reset token link transmitted to user inbox. Force reset required upon next portal login.`,
    });
  };

  const handleBlockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u,
      ),
    );
    const target = users.find((u) => u.id === userId);
    toast.warning(target?.status === "Suspended" ? "User Unblocked" : "User Restricted!", {
      description: `Account credentials state updated for ${target?.name}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.error("User Purged!", {
      description: "Profile record completely removed from SaaS directory.",
    });
  };

  // Merge duplicate profiles
  const handleMergeProfiles = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceEmail || !mergeTargetEmail) {
      toast.error("Form incomplete", {
        description: "Specify both duplicate and master target emails.",
      });
      return;
    }
    toast.success("Accounts Merged Successfully!", {
      description: `All analytics records of ${mergeSourceEmail} combined into master node ${mergeTargetEmail}. Duplicate profile closed.`,
    });
    setMergeSourceEmail("");
    setMergeTargetEmail("");
  };

  // Save Password Policy
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Global Security Policy Synchronized", {
      description: `Minimum length: ${passwordPolicy.minLength} chars, cycle duration: ${passwordPolicy.expiryDays} days.`,
    });
  };

  // Session kill logic
  const handleKillSession = (sesId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sesId));
    toast.warning("Active User Session Terminated", {
      description: `Forced cookie expiration command transmitted to client browser.`,
    });
  };

  // Add IP Filter
  const handleAddIpFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpFilter) return;
    setIpFilters((prev) => [...prev, newIpFilter]);
    toast.success("IP Restriction Policy Enforced", {
      description: `Address block ${newIpFilter} registered under system firewall blocks.`,
    });
    setNewIpFilter("");
  };

  const handleRemoveIpFilter = (ip: string) => {
    setIpFilters((prev) => prev.filter((item) => item !== ip));
    toast.info("IP Restriction Revoked", {
      description: `Policy node ${ip} removed from global access restrictions list.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Audit & Analytics"
        subtitle="Global metrics dashboard and master user audit trails across schools."
      />

      {/* ── CORE PANEL SUB-TABS NAVIGATION ── */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveSubTab("analytics")}
          className={cn(
            "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
            activeSubTab === "analytics"
              ? "border-indigo-600 text-indigo-500"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <TrendingUp className="h-4.5 w-4.5" /> Platform Analytics
        </button>
        <button
          onClick={() => setActiveSubTab("users")}
          className={cn(
            "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
            activeSubTab === "users"
              ? "border-indigo-600 text-indigo-500"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Users className="h-4.5 w-4.5" /> Global Users Management
        </button>
        <button
          onClick={() => setActiveSubTab("security")}
          className={cn(
            "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
            activeSubTab === "security"
              ? "border-indigo-600 text-indigo-500"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Lock className="h-4.5 w-4.5" /> Audit Trails & Security
        </button>
      </div>

      {/* ── VIEW RENDERERS ── */}

      {/* VIEW 1: PLATFORM ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          {/* METRICS GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-xl border border-border bg-card p-5 shadow-sm hover:border-indigo-500/25">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Tenants
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">{totalSchools}</span>
                <span className="flex items-center text-xs font-semibold text-emerald-500">
                  <ArrowUpRight className="mr-0.5 h-3 w-3" /> +1
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong className="text-emerald-500">{activeSchools} Active</strong> ·{" "}
                {suspendedSchools} Sus · {blacklistedSchools} Blacklisted
              </div>
            </div>

            <div className="group rounded-xl border border-border bg-card p-5 shadow-sm hover:border-indigo-500/25">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Active Accounts
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">
                  {totalPlatformUsers.toLocaleString()}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-500">
                  <ArrowUpRight className="mr-0.5 h-3 w-3" /> +4.2%
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {totalStudents} Students · {totalTeachers} Faculty · {totalParents} Parents
              </div>
            </div>

            <div className="group rounded-xl border border-border bg-card p-5 shadow-sm hover:border-indigo-500/25">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  SaaS Revenue MRR
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">
                  ${mrr.toLocaleString()}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-500">
                  <ArrowUpRight className="mr-0.5 h-3 w-3" /> +12%
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Platform Churn Rate: <strong className="text-rose-500">1.8%</strong> Monthly Avg
              </div>
            </div>

            <div className="group rounded-xl border border-border bg-card p-5 shadow-sm hover:border-indigo-500/25">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Student-Teacher Ratio
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">
                  {studentToTeacherRatio}
                </span>
                <span className="flex items-center text-xs font-semibold text-rose-500">
                  <ArrowDownRight className="mr-0.5 h-3 w-3" /> -0.3
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Platform Target: <span className="text-indigo-400 font-bold">15:1 Ratio</span>
              </div>
            </div>
          </div>

          {/* HIGH FIDELITY CHARTS */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart 1: Tenant Growth Trends */}
            <Panel title="Multi-Tenant School Growth Trends" className="lg:col-span-2">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="Basic"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Pro"
                      stroke="#6366f1"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Enterprise"
                      stroke="#10b981"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Chart 2: Module Adoption */}
            <Panel title="Module Adoption Breakdown">
              <div className="h-[280px] w-full flex flex-col justify-between">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moduleAdoptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {moduleAdoptionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-1 px-2 text-[9px] text-muted-foreground">
                  {moduleAdoptionData.map((d, index) => (
                    <div key={d.name} className="flex items-center gap-1 truncate">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="truncate">
                        {d.name} ({d.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Chart 3: DAU / MAU analytics */}
            <Panel title="Platform Active Engagement (DAU / MAU ratio)" className="lg:col-span-2">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dauMauData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="DAU"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#dauGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="MAU"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#mauGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Geographic Distribution map info card */}
            <Panel title="Geographic Distrib & Peak Usage Hours">
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl flex items-center gap-3">
                  <Globe className="h-8 w-8 text-indigo-400 animate-spin shrink-0 duration-[15s]" />
                  <div>
                    <h4 className="font-bold text-white leading-none">Global Server Scope</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Schools distributed across West Coast, East Coast, and Indian Subcontinent
                      nodes.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Peak Hour Server Load:
                    </span>
                    <strong className="text-foreground">4,500 reqs/sec (16:00)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">School Growth Rate:</span>
                    <strong className="text-emerald-500 font-bold">+18% Q/Q</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Student Dropout Rate:</span>
                    <strong className="text-rose-500">1.2% platform-wide</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <h5 className="font-bold text-[10px] uppercase text-muted-foreground mb-1.5">
                    App feature usage metrics
                  </h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-muted-foreground">
                      <span>Attendance Tracker</span>
                      <span>85% active</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* VIEW 2: GLOBAL USERS MANAGEMENT */}
      {activeSubTab === "users" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-6 md:grid-cols-3">
            {/* USERS TABLE */}
            <div className="md:col-span-2 space-y-4">
              <Panel title="Global User Master Trail Matrix">
                <div className="space-y-4">
                  {/* SEARCH FILTERS BAR */}
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search across user database (Name, Email, UUID)..."
                        className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <select
                        value={userSchoolFilter}
                        onChange={(e) => setUserSchoolFilter(e.target.value)}
                        className="h-10 rounded-lg border border-border bg-card px-2.5 text-[10px] font-bold outline-none cursor-pointer"
                      >
                        <option value="ALL">All Schools</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="h-10 rounded-lg border border-border bg-card px-2.5 text-[10px] font-bold outline-none cursor-pointer"
                      >
                        <option value="ALL">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Student">Student</option>
                        <option value="Parent">Parent</option>
                      </select>

                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="h-10 rounded-lg border border-border bg-card px-2.5 text-[10px] font-bold outline-none cursor-pointer"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>

                      {selectedUserIds.length > 0 && (
                        <div className="flex items-center gap-1 border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 rounded-lg">
                          <span className="text-[10px] font-bold text-rose-500 mr-1">
                            {selectedUserIds.length} Sel
                          </span>
                          <button
                            onClick={handleBulkDeactivate}
                            className="text-[9px] font-bold text-rose-500 hover:underline"
                          >
                            Deactivate
                          </button>
                          <span className="text-rose-500/30">|</span>
                          <button
                            onClick={handleBulkExport}
                            className="text-[9px] font-bold text-indigo-500 hover:underline"
                          >
                            Export
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* USER TABLE DATA */}
                  <div className="overflow-x-auto rounded-lg border border-border/80">
                    <DataTable>
                      <TableHead>
                        <th className="w-10 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={
                              filteredUsers.length > 0 &&
                              selectedUserIds.length === filteredUsers.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">UID Coordinates</th>
                        <th className="px-4 py-3 text-left">User Name</th>
                        <th className="px-4 py-3 text-left">School Scope</th>
                        <th className="px-4 py-3 text-left">System Role</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </TableHead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const isChecked = selectedUserIds.includes(u.id);
                          const statusTones = {
                            Active: "success",
                            Inactive: "neutral",
                            Suspended: "danger",
                          } as const;
                          return (
                            <TableRow key={u.id} className={cn(isChecked && "bg-indigo-500/5")}>
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={isChecked}
                                  onChange={(e) => handleSelectRow(u.id, e.target.checked)}
                                />
                              </td>
                              <td className="px-4 py-3.5">
                                <span
                                  className="font-mono text-[9px] text-muted-foreground block truncate max-w-[60px]"
                                  title={u.id}
                                >
                                  {u.id.substring(4, 12)}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <div>
                                  <div className="font-semibold text-foreground text-xs leading-none">
                                    {u.name}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {u.email}
                                  </div>
                                  <div className="text-[8px] text-muted-foreground mt-0.5 flex gap-1 items-center">
                                    <Monitor className="h-2.5 w-2.5 text-indigo-400" />{" "}
                                    {u.deviceInfo} ·{" "}
                                    <MapPin className="h-2.5 w-2.5 text-indigo-400" />{" "}
                                    {u.lastLocation}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-[10px] text-muted-foreground font-semibold">
                                {u.schoolName}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-500 uppercase tracking-wide">
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <StatusBadge tone={statusTones[u.status]}>{u.status}</StatusBadge>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => handleForceResetPassword(u.id)}
                                    title="Force Password Reset"
                                    className="p-1 text-indigo-500 hover:bg-indigo-500/10 rounded cursor-pointer"
                                  >
                                    <KeyRound className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleBlockUser(u.id)}
                                    title={
                                      u.status === "Suspended" ? "Activate User" : "Suspend User"
                                    }
                                    className={cn(
                                      "p-1 rounded cursor-pointer",
                                      u.status === "Suspended"
                                        ? "text-emerald-500 hover:bg-emerald-500/10"
                                        : "text-amber-500 hover:bg-amber-500/10",
                                    )}
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    title="Purge Profile"
                                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </TableRow>
                          );
                        })}
                      </tbody>
                    </DataTable>
                  </div>
                </div>
              </Panel>
            </div>

            {/* SECURITY POLICIES & MERGE ACTIONS */}
            <div className="space-y-6">
              {/* MERGE DUPLICATES */}
              <Panel title="Merge Duplicate User Profiles">
                <form onSubmit={handleMergeProfiles} className="space-y-4">
                  <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/25 flex items-start gap-2.5 text-xs text-indigo-200">
                    <AlertCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px]">
                      Merges all academic logs, payments, and chats of a duplicate account into a
                      single target ID.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Duplicate Profile Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={mergeSourceEmail}
                      onChange={(e) => setMergeSourceEmail(e.target.value)}
                      placeholder="duplicate.user@school.com"
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Master Destination Profile Email
                    </label>
                    <input
                      required
                      type="email"
                      value={mergeTargetEmail}
                      onChange={(e) => setMergeTargetEmail(e.target.value)}
                      placeholder="master.target@school.com"
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>
                  <ActionButton
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  >
                    Execute Merge Sequence
                  </ActionButton>
                </form>
              </Panel>

              {/* GLOBAL PASSWORD POLICY */}
              <Panel title="Global Core Password Policies">
                <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Minimum Password Length (Characters)
                    </label>
                    <input
                      type="number"
                      min={6}
                      max={20}
                      value={passwordPolicy.minLength}
                      onChange={(e) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          minLength: parseInt(e.target.value) || 8,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Enforced Credentials Expiry Cycle
                    </label>
                    <select
                      value={passwordPolicy.expiryDays}
                      onChange={(e) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          expiryDays: parseInt(e.target.value) || 90,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none cursor-pointer"
                    >
                      <option value={30}>Every 30 days</option>
                      <option value={90}>Every 90 days (Quarterly)</option>
                      <option value={180}>Every 180 days</option>
                      <option value={0}>Never expire credentials</option>
                    </select>
                  </div>

                  <div className="space-y-2 border-t border-border pt-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={passwordPolicy.enforceSpecial}
                        onChange={(e) =>
                          setPasswordPolicy({ ...passwordPolicy, enforceSpecial: e.target.checked })
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Enforce special character codes (`@`,`#`,`$`)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={passwordPolicy.enforceNumbers}
                        onChange={(e) =>
                          setPasswordPolicy({ ...passwordPolicy, enforceNumbers: e.target.checked })
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Enforce alphanumeric number matrices</span>
                    </label>
                  </div>

                  <ActionButton
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  >
                    Apply Global Policy rules
                  </ActionButton>
                </form>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AUDIT TRAILS & SECURITY */}
      {activeSubTab === "security" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SUSPICIOUS ACTIVITY BOARDS Banner */}
          <div className="flex gap-3 items-start p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-200">
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-white">
                Active Firewall Alert Board
              </h4>
              <p className="text-[10px] text-rose-200/80 mt-1 leading-normal">
                Large volume data export triggered by teacher m.aurelius@horizon.academy from IP
                address: 85.92.105.18. Audit logs recorded.
              </p>
            </div>
            <button
              onClick={() =>
                toast.info("Security dispatcher dispatched to review transaction logs.")
              }
              className="bg-rose-700 hover:bg-rose-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow cursor-pointer uppercase shrink-0"
            >
              Verify Audit
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* SECURITY LOGS AUDIT TRAIL */}
            <div className="md:col-span-2 space-y-6">
              <Panel title="Platform Core Security Audit Trail (Successful & Failed operations)">
                <div className="overflow-x-auto rounded-lg border border-border/80">
                  <DataTable>
                    <TableHead>
                      <th className="px-4 py-3 text-left">Operator Profile</th>
                      <th className="px-4 py-3 text-left">Role Class</th>
                      <th className="px-4 py-3 text-left">Action Trigger</th>
                      <th className="px-4 py-3 text-left">Transmission Time</th>
                      <th className="px-4 py-3 text-left">IP Address</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </TableHead>
                    <tbody>
                      {securityLogs.map((log) => {
                        const toneMap = {
                          Success: "success",
                          Failed: "danger",
                          Suspicious: "warning",
                        } as const;
                        return (
                          <TableRow key={log.id}>
                            <td className="px-4 py-3 text-xs font-semibold text-foreground">
                              {log.operator}
                            </td>
                            <td className="px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase">
                              {log.role}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground/90">{log.action}</td>
                            <td className="px-4 py-3 text-[10px] text-muted-foreground">
                              {log.timestamp}
                            </td>
                            <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                              {log.ipAddress}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <StatusBadge tone={toneMap[log.status]}>{log.status}</StatusBadge>
                            </td>
                          </TableRow>
                        );
                      })}
                    </tbody>
                  </DataTable>
                </div>
              </Panel>

              {/* IP WHITELIST / BLACKLIST POLICY ENFORCEMENT */}
              <Panel title="Gateway IP Access Controls (Whitelist & Blacklist blocks)">
                <div className="grid gap-6 sm:grid-cols-2">
                  <form onSubmit={handleAddIpFilter} className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Restrict Firewall IP / CIDR Block
                    </label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="text"
                        value={newIpFilter}
                        onChange={(e) => setNewIpFilter(e.target.value)}
                        placeholder="e.g. 192.168.1.1 or 192.168.1.0/24"
                        className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                      >
                        Add Filter
                      </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Blocks access attempts immediately from restricted ranges. Supports subnet
                      mask routing specs.
                    </p>
                  </form>

                  <div className="space-y-2 border border-border bg-card/60 p-4 rounded-xl max-h-[160px] overflow-y-auto">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                      Enforced IP Access Filters
                    </h5>
                    <div className="space-y-1.5">
                      {ipFilters.map((ip) => (
                        <div
                          key={ip}
                          className="flex justify-between items-center bg-card border border-border px-2.5 py-1 rounded text-xs"
                        >
                          <span className="font-mono text-[10px] font-bold">{ip}</span>
                          <button
                            onClick={() => handleRemoveIpFilter(ip)}
                            className="text-rose-500 font-bold hover:underline text-[10px] cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            {/* ACTIVE SESSIONS FORCE LOGOUT */}
            <div className="space-y-6">
              <Panel title="Active Admin Session Controller">
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3.5 border border-border bg-card rounded-xl space-y-3 text-xs shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-foreground text-xs leading-none font-bold block">
                            {session.userName}
                          </strong>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {session.email}
                          </span>
                        </div>
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 uppercase tracking-wide">
                          {session.role}
                        </span>
                      </div>

                      <div className="text-[9px] text-muted-foreground space-y-1 bg-muted/30 p-2 rounded-lg font-mono">
                        <div>Tenant: {session.schoolName}</div>
                        <div>Device: {session.device}</div>
                        <div>Location: {session.location}</div>
                        <div>IP Address: {session.ip}</div>
                      </div>

                      <button
                        onClick={() => handleKillSession(session.id)}
                        className="w-full bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-bold text-[10px] uppercase py-2 rounded-xl border border-rose-500/20 transition-all cursor-pointer"
                      >
                        Force Revoke Credentials & Sign Out
                      </button>
                    </div>
                  ))}
                  {activeSessions.length === 0 && (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No active sessions running. All users signed out.
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
