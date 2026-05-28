import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
// ── TYPES ──

export interface SchoolInvoice {
  id: string; // 32-character hexadecimal UUID
  date: string;
  amount: number;
  status: "Paid" | "Refunded" | "Overdue";
  discountApplied?: string; // coupon name
}

export interface SchoolIntegrations {
  stripeEnabled: boolean;
  razorpayEnabled: boolean;
  zoomEnabled: boolean;
  googleClassroomEnabled: boolean;
  smtpConfigured: boolean;
}

export interface School {
  id: string; // 32-character hexadecimal UUID
  name: string;
  slug: string;
  logoUrl?: string;
  address: string;
  contact: string;
  website: string;
  adminEmail: string;
  plan: "Basic" | "Pro" | "Enterprise";
  renewalDate: string;
  status: "Active" | "Suspended" | "Blacklisted";
  isVerified: boolean; // Registration approval pipeline
  type: "Primary" | "Secondary" | "College" | "University";
  board: "CBSE" | "ICSE" | "State" | "IB" | "Autonomous";
  latitude: number;
  longitude: number;
  studentCount: number;
  teacherCount: number;
  modules: string[];
  taxEnabled: boolean;
  trialExtended: boolean;
  invoices: SchoolInvoice[];
  integrations: SchoolIntegrations;
  apiKey?: string;
}

export interface SupportTicket {
  id: string; // 32-character hexadecimal UUID
  schoolId: string;
  schoolName: string;
  title: string;
  description: string;
  category: "Billing" | "Technical" | "Access Control" | "General";
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In-Progress" | "Resolved" | "Closed";
  assignee: string;
  createdAt: string;
  slaLimitHours: number;
  replies: {
    id: string;
    author: string;
    role: "Super Admin" | "School Admin" | "System Bot";
    message: string;
    timestamp: string;
  }[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  channels: ("Push" | "Email" | "SMS" | "In-App")[];
  targetType: "All" | "Targeted";
  targetSchools: string[]; // schoolIds
  createdAt: string;
  readCount: number;
  totalRecipients: number;
}

export interface GlobalConfig {
  maintenanceMode: "None" | "Partial" | "Full";
  featureFlags: {
    aiPlanner: boolean;
    smsAlerts: boolean;
    canteenBeta: boolean;
    advancedReports: boolean;
  };
  twoFactorEnforced: boolean;
  defaultTimezone: string;
  defaultLanguage: string;
  quotas: {
    storageLimitGB: number;
    maxUploadMB: number;
    sessionTimeoutMin: number;
    rateThrottleLimit: number;
  };
}

export interface ImpersonationSession {
  schoolId: string;
  schoolName: string;
  role: "admin";
}

interface SuperAdminContextValue {
  schools: School[];
  supportTickets: SupportTicket[];
  announcements: Announcement[];
  config: GlobalConfig;
  activeImpersonation: ImpersonationSession | null;
  isMounted: boolean; // SSR safety check

  // Handlers
  createSchool: (
    school: Omit<School, "id" | "invoices" | "integrations" | "isVerified"> & {
      isVerified?: boolean;
    },
  ) => void;
  updateSchool: (id: string, updates: Partial<School>) => void;
  verifySchool: (id: string) => void;
  blacklistSchool: (id: string) => void;
  deleteSchool: (id: string) => void;
  impersonateSchool: (id: string) => void;
  exitImpersonation: () => void;
  postAnnouncement: (
    announcement: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients">,
  ) => void;
  addTicketReply: (ticketId: string, message: string) => void;
  updateTicketAssignee: (ticketId: string, assignee: string) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket["status"]) => void;
  updateConfig: (updates: Partial<GlobalConfig>) => void;
  updateQuotas: (updates: Partial<GlobalConfig["quotas"]>) => void;

  // Advanced features
  extendTrialPeriod: (schoolId: string) => void;
  processRefund: (schoolId: string, invoiceId: string) => void;
  sendExpiryAlert: (schoolId: string) => void;
  rotateApiKey: (schoolId: string) => void;
}

// ── INITIAL MOCK DATA ──

const INITIAL_SCHOOLS: School[] = [
  {
    id: "f3b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    name: "Oakwood International School",
    slug: "oakwood-intl",
    logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80&fit=crop&q=60",
    address: "742 Evergreen Terrace, Seattle, WA 98101",
    contact: "+1 206-555-0192",
    website: "https://oakwoodinternational.edu",
    adminEmail: "principal@oakwood.edu",
    plan: "Pro",
    renewalDate: "2027-06-15",
    status: "Active",
    isVerified: true,
    type: "Secondary",
    board: "IB",
    latitude: 47.6062,
    longitude: -122.3321,
    studentCount: 1250,
    teacherCount: 82,
    modules: ["Academics", "Finance", "HR", "Transport", "Canteen", "AI Hub"],
    taxEnabled: true,
    trialExtended: false,
    invoices: [
      {
        id: "inv-9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
        date: "2026-05-15",
        amount: 4500,
        status: "Paid",
      },
      {
        id: "inv-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
        date: "2025-05-15",
        amount: 4500,
        status: "Paid",
      },
    ],
    integrations: {
      stripeEnabled: true,
      razorpayEnabled: false,
      zoomEnabled: true,
      googleClassroomEnabled: true,
      smtpConfigured: true,
    },
  },
  {
    id: "a1b2c3d4e5f678901234567890abcdef",
    name: "Horizon Science Academy",
    slug: "horizon-science",
    logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=80&fit=crop&q=60",
    address: "100 Science Center Drive, Chicago, IL 60611",
    contact: "+1 312-555-3810",
    website: "https://horizon.academy",
    adminEmail: "director@horizon.academy",
    plan: "Enterprise",
    renewalDate: "2028-01-20",
    status: "Active",
    isVerified: true,
    type: "College",
    board: "State",
    latitude: 41.8781,
    longitude: -87.6298,
    studentCount: 2100,
    teacherCount: 145,
    modules: [
      "Academics",
      "Finance",
      "HR",
      "Transport",
      "Library",
      "Inventory",
      "Clinic",
      "AI Hub",
    ],
    taxEnabled: true,
    trialExtended: true,
    invoices: [
      {
        id: "inv-f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9",
        date: "2026-01-20",
        amount: 9500,
        status: "Paid",
        discountApplied: "WELCOME50",
      },
    ],
    integrations: {
      stripeEnabled: true,
      razorpayEnabled: true,
      zoomEnabled: true,
      googleClassroomEnabled: false,
      smtpConfigured: true,
    },
  },
  {
    id: "1234567890abcdef1234567890abcdef",
    name: "Pinecrest Elementary School",
    slug: "pinecrest-elem",
    logoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=80&fit=crop&q=60",
    address: "482 Pine Needle Way, Denver, CO 80202",
    contact: "+1 303-555-9012",
    website: "https://pinecrest.k12.org",
    adminEmail: "office@pinecrest.k12.org",
    plan: "Basic",
    renewalDate: "2026-08-30",
    status: "Suspended",
    isVerified: true,
    type: "Primary",
    board: "CBSE",
    latitude: 39.7392,
    longitude: -104.9903,
    studentCount: 450,
    teacherCount: 28,
    modules: ["Academics", "Library"],
    taxEnabled: false,
    trialExtended: false,
    invoices: [
      {
        id: "inv-c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8",
        date: "2025-08-30",
        amount: 1500,
        status: "Overdue",
      },
    ],
    integrations: {
      stripeEnabled: false,
      razorpayEnabled: false,
      zoomEnabled: false,
      googleClassroomEnabled: false,
      smtpConfigured: false,
    },
  },
  {
    id: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
    name: "Beacon Preparatory School",
    slug: "beacon-prep",
    logoUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=80&fit=crop&q=60",
    address: "15 Beacon Hill Blvd, Boston, MA 02108",
    contact: "+1 617-555-4819",
    website: "https://beaconprep.com",
    adminEmail: "info@beaconprep.com",
    plan: "Pro",
    renewalDate: "2026-04-10",
    status: "Blacklisted",
    isVerified: true,
    type: "Secondary",
    board: "ICSE",
    latitude: 42.3601,
    longitude: -71.0589,
    studentCount: 880,
    teacherCount: 56,
    modules: ["Academics", "Finance", "HR", "Transport"],
    taxEnabled: true,
    trialExtended: false,
    invoices: [
      {
        id: "inv-8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a",
        date: "2025-04-10",
        amount: 4500,
        status: "Paid",
      },
    ],
    integrations: {
      stripeEnabled: false,
      razorpayEnabled: false,
      zoomEnabled: false,
      googleClassroomEnabled: false,
      smtpConfigured: false,
    },
  },
  // PENDING VERIFICATION SCHOOLS FOR PIPELINE DEMO
  {
    id: "e4f3d2c1b0a9f8e7d6c5b4a3f2e1d0c9",
    name: "St. Jude Catholic University",
    slug: "st-jude-uni",
    logoUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=80&fit=crop&q=60",
    address: "500 University Ave, Philadelphia, PA 19104",
    contact: "+1 215-555-8910",
    website: "https://stjudeuniversity.edu",
    adminEmail: "verify@stjude.edu",
    plan: "Enterprise",
    renewalDate: "2027-05-23",
    status: "Suspended",
    isVerified: false,
    type: "University",
    board: "Autonomous",
    latitude: 39.9526,
    longitude: -75.1652,
    studentCount: 3800,
    teacherCount: 220,
    modules: ["Academics", "Finance", "HR", "Library", "Clinic", "AI Hub"],
    taxEnabled: true,
    trialExtended: false,
    invoices: [],
    integrations: {
      stripeEnabled: false,
      razorpayEnabled: false,
      zoomEnabled: false,
      googleClassroomEnabled: false,
      smtpConfigured: false,
    },
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e",
    schoolId: "f3b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    schoolName: "Oakwood International School",
    title: "Billing Inquiry: Invoice mismatch for Pro subscription renewal",
    description:
      "Our invoice shows a renewal fee of $4,500 but our agreed rate is $4,200 annually. We have the tax toggle enabled but it seems to have added standard state tax double-charged. Please review.",
    category: "Billing",
    priority: "High",
    status: "Open",
    assignee: "Sarah Jenkins",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    slaLimitHours: 12,
    replies: [
      {
        id: "rep-1",
        author: "School Admin (Oakwood)",
        role: "School Admin",
        message:
          "We received our monthly invoice today, and the calculations look off. It is applying both local county and general state tax at different tiers. Here is the transaction id: TXN-382910.",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "rep-2",
        author: "System Bot",
        role: "System Bot",
        message:
          "Support ticket generated automatically. Assigned SLA: 12 Hours based on High priority classification.",
        timestamp: new Date(Date.now() - 3600000 * 1.95).toISOString(),
      },
    ],
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "System-wide Database Maintenance Window",
    body: "Please note that we will be carrying out structural database migrations on Sunday, May 31st between 02:00 AM and 04:00 AM UTC. Portals might experience brief intermittent latency of up to 10 seconds during index re-indexing.",
    channels: ["In-App", "Email"],
    targetType: "All",
    targetSchools: [],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    readCount: 14200,
    totalRecipients: 15400,
  },
];

const INITIAL_CONFIG: GlobalConfig = {
  maintenanceMode: "None",
  featureFlags: {
    aiPlanner: true,
    smsAlerts: true,
    canteenBeta: false,
    advancedReports: true,
  },
  twoFactorEnforced: false,
  defaultTimezone: "UTC",
  defaultLanguage: "en",
  quotas: {
    storageLimitGB: 50,
    maxUploadMB: 25,
    sessionTimeoutMin: 30,
    rateThrottleLimit: 120,
  },
};

const SuperAdminContext = createContext<SuperAdminContextValue | null>(null);

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  // Mounting status to completely prevent SSR hydration mismatch errors
  const [isMounted, setIsMounted] = useState(false);
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [config, setConfig] = useState<GlobalConfig>(INITIAL_CONFIG);
  const [activeImpersonation, setActiveImpersonation] = useState<ImpersonationSession | null>(null);

  // Load from local storage strictly after mounting on client side
  useEffect(() => {
    setIsMounted(true);
    
    // Fetch schools from backend if possible
    const fetchSchools = async () => {
      try {
        const response = await apiClient.get<{ data: { results: any[] } }>('/schools?limit=100');
        if (response.data && Array.isArray(response.data.results)) {
          const backendSchools = response.data.results.map(s => ({
            id: s._id || s.id,
            name: s.name,
            slug: s.slug || s.name.toLowerCase().replace(/\s+/g, '-'),
            logoUrl: s.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80&fit=crop&q=60",
            address: s.address || "123 School St",
            contact: s.phone || s.contact || "+1 555-0192",
            website: s.website || "https://example.com",
            adminEmail: s.email || "admin@example.com",
            plan: s.plan || "Pro",
            renewalDate: s.renewalDate || "2027-06-15",
            status: s.isActive === false ? "Suspended" : "Active",
            isVerified: true,
            type: s.type || "Secondary",
            board: s.board || "CBSE",
            latitude: 47.6062,
            longitude: -122.3321,
            studentCount: s.studentCount || 0,
            teacherCount: s.teacherCount || 0,
            modules: s.modules || ["Academics", "Finance"],
            taxEnabled: true,
            trialExtended: false,
            invoices: [],
            integrations: {
              stripeEnabled: false,
              razorpayEnabled: false,
              zoomEnabled: false,
              googleClassroomEnabled: false,
              smtpConfigured: false,
            },
          }));
          setSchools(backendSchools);
          return; // Skip local storage if API succeeds
        }
      } catch (err) {
        console.error("Failed to fetch schools from API", err);
      }
      
      // Fallback to local storage
      try {
        const savedSchools = localStorage.getItem("super_admin_schools_expanded");
        if (savedSchools) setSchools(JSON.parse(savedSchools));
      } catch (e) {
        console.error("Local storage hydration failed", e);
      }
    };

    fetchSchools();

    try {
      const savedTickets = localStorage.getItem("super_admin_tickets");
      if (savedTickets) setSupportTickets(JSON.parse(savedTickets));

      const savedAnnouncements = localStorage.getItem("super_admin_announcements");
      if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));

      const savedConfig = localStorage.getItem("super_admin_config");
      if (savedConfig) setConfig(JSON.parse(savedConfig));

      const savedImpersonation = localStorage.getItem("super_admin_impersonation");
      if (savedImpersonation) setActiveImpersonation(JSON.parse(savedImpersonation));
    } catch (e) {
      console.error("Local storage hydration failed", e);
    }
  }, []);

  // Write handlers with safety checks to ensure we don't save server pre-mount states
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("super_admin_schools_expanded", JSON.stringify(schools));
    }
  }, [schools, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("super_admin_tickets", JSON.stringify(supportTickets));
    }
  }, [supportTickets, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("super_admin_announcements", JSON.stringify(announcements));
    }
  }, [announcements, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("super_admin_config", JSON.stringify(config));
    }
  }, [config, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (activeImpersonation) {
        localStorage.setItem("super_admin_impersonation", JSON.stringify(activeImpersonation));
      } else {
        localStorage.removeItem("super_admin_impersonation");
      }
    }
  }, [activeImpersonation, isMounted]);

  // Handlers
  const createSchool = async (
    newSch: Omit<School, "id" | "invoices" | "integrations" | "isVerified"> & {
      isVerified?: boolean;
    },
  ) => {
    try {
      const payload = {
        name: newSch.name,
        code: newSch.slug || newSch.name.substring(0, 3).toUpperCase(),
        address: newSch.address,
        contactEmail: newSch.adminEmail,
        contactPhone: newSch.contact,
      };
      const response = await apiClient.post('/schools', payload);
      
      const id = response.data?.school?._id || Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const apiKey = `sk_live_${id.substring(0, 24)}`;
      const schoolWithId: School = {
        ...newSch,
        id,
        logoUrl:
          newSch.logoUrl ||
          "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80&fit=crop&q=60",
        isVerified: newSch.isVerified !== undefined ? newSch.isVerified : true,
        apiKey,
        invoices: [],
        integrations: {
          stripeEnabled: false,
          razorpayEnabled: false,
          zoomEnabled: false,
          googleClassroomEnabled: false,
          smtpConfigured: false,
        },
      };
      setSchools((prev) => [schoolWithId, ...prev]);
      toast.success("School Created Successfully!", {
        description: `${schoolWithId.name} deployment has been initialized.`,
      });
    } catch (err) {
      console.error("Failed to create school", err);
      toast.error("Failed to create school.");
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
      const payload: any = {};
      if (updates.name) payload.name = updates.name;
      if (updates.slug) payload.code = updates.slug;
      if (updates.address) payload.address = updates.address;
      if (updates.adminEmail) payload.contactEmail = updates.adminEmail;
      if (updates.contact) payload.contactPhone = updates.contact;
      if (updates.status) payload.isActive = updates.status !== "Suspended" && updates.status !== "Blacklisted";

      if (Object.keys(payload).length > 0) {
        await apiClient.patch(`/schools/${id}`, payload);
      }
      
      setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      toast.success("School System Synchronized", {
        description: "Instance modifications committed successfully.",
      });
    } catch (err) {
      console.error("Failed to update school", err);
      toast.error("Failed to update school.");
    }
  };

  const verifySchool = (id: string) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVerified: true, status: "Active" } : s)),
    );
    const target = schools.find((s) => s.id === id);
    toast.success("Registration Verified & Approved!", {
      description: `${target?.name} is now approved and active.`,
    });
  };

  const blacklistSchool = (id: string) => {
    setSchools((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "Blacklisted" ? "Active" : "Blacklisted",
            }
          : s,
      ),
    );
    const targetSch = schools.find((s) => s.id === id);
    const wasBlacklisted = targetSch?.status === "Blacklisted";
    toast.warning(wasBlacklisted ? "School Re-activated" : "School Blacklisted!", {
      description: wasBlacklisted
        ? `${targetSch?.name} status restored to Active.`
        : `${targetSch?.name} has been restricted and blocked from platform services.`,
    });
  };

  const deleteSchool = async (id: string) => {
    try {
      await apiClient.delete(`/schools/${id}`);
      const target = schools.find((s) => s.id === id);
      setSchools((prev) => prev.filter((s) => s.id !== id));
      toast.error("School Instance Purged", {
        description: `${target?.name} data has been archived and retention policies scheduled.`,
      });
    } catch (err) {
      console.error("Failed to delete school", err);
      toast.error("Failed to delete school.");
    }
  };

  const impersonateSchool = (id: string) => {
    const school = schools.find((s) => s.id === id);
    if (!school) {
      toast.error("School not found in directory.");
      return;
    }
    if (school.status !== "Active") {
      toast.error(`Cannot impersonate. School status is: ${school.status}`);
      return;
    }
    setActiveImpersonation({
      schoolId: school.id,
      schoolName: school.name,
      role: "admin",
    });
    toast.success("Impersonation Session Active", {
      description: `You are now logged in as School Admin for ${school.name}.`,
    });
  };

  const exitImpersonation = () => {
    setActiveImpersonation(null);
    toast.success("Exited Session", {
      description: "Impersonated session closed. Restored global super admin context.",
    });
  };

  const postAnnouncement = (
    ann: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients">,
  ) => {
    const id = `ann-${Math.random().toString(36).substr(2, 9)}`;
    const targetSchools =
      ann.targetType === "All" ? schools : schools.filter((s) => ann.targetSchools.includes(s.id));
    const totalRecipients =
      targetSchools.reduce((acc, curr) => acc + curr.studentCount + curr.teacherCount, 0) || 1200;
    const newAnn: Announcement = {
      ...ann,
      id,
      createdAt: new Date().toISOString(),
      readCount: 0,
      totalRecipients,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    toast.success("Broadcast Dispatched", {
      description: `Notification scheduled on channels: ${ann.channels.join(", ")}.`,
    });
  };

  const addTicketReply = (ticketId: string, message: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: "In-Progress",
          replies: [
            ...t.replies,
            {
              id: `rep-${Math.random().toString(36).substr(2, 9)}`,
              author: "Super Admin (SaaS Office)",
              role: "Super Admin" as const,
              message,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }),
    );
    toast.success("Response Transmitted", {
      description: "Support response posted to school administrator inbox.",
    });
  };

  const updateTicketAssignee = (ticketId: string, assignee: string) => {
    setSupportTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, assignee } : t)));
    toast.info("Ticket Assignee Updated", {
      description: `Assigned task to ${assignee}.`,
    });
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
    setSupportTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
    toast.info("Ticket Status Changed", {
      description: `Support ticket status updated to: ${status}.`,
    });
  };

  const updateConfig = (updates: Partial<GlobalConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    toast.success("Global Settings Synchronized", {
      description: "Application configuration matrix committed to memory.",
    });
  };

  const updateQuotas = (updates: Partial<GlobalConfig["quotas"]>) => {
    setConfig((prev) => ({
      ...prev,
      quotas: { ...prev.quotas, ...updates },
    }));
    toast.success("System Quotas Locked", {
      description: "Hard boundary resource allocations applied platform-wide.",
    });
  };

  // ── ADVANCED ACTIONS ──
  const extendTrialPeriod = (schoolId: string) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id !== schoolId) return s;
        // Extend renewal date by 30 days
        const current = new Date(s.renewalDate);
        current.setDate(current.getDate() + 30);
        return {
          ...s,
          trialExtended: true,
          renewalDate: current.toISOString().split("T")[0],
        };
      }),
    );
    const target = schools.find((s) => s.id === schoolId);
    toast.success("Trial Extended", {
      description: `Added 30 days of complimentary tier access to ${target?.name}.`,
    });
  };

  const processRefund = (schoolId: string, invoiceId: string) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id !== schoolId) return s;
        return {
          ...s,
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: "Refunded" as const } : inv,
          ),
        };
      }),
    );
    toast.warning("Payment Refunded", {
      description: `Invoice ${invoiceId.substring(0, 8)} status marked as Refunded in ledger.`,
    });
  };

  const sendExpiryAlert = (schoolId: string) => {
    const target = schools.find((s) => s.id === schoolId);
    toast.success("SaaS Expiry Alert Dispatched", {
      description: `Automated email + portal notification transmitted to principal at ${target?.adminEmail}.`,
    });
  };

  const rotateApiKey = (schoolId: string) => {
    const freshKey = `sk_live_${Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")}`;
    setSchools((prev) => prev.map((s) => (s.id === schoolId ? { ...s, apiKey: freshKey } : s)));
    toast.success("API Integration Credentials Rotated", {
      description: "Generated a new school credential keys block.",
    });
  };

  return (
    <SuperAdminContext.Provider
      value={{
        schools,
        supportTickets,
        announcements,
        config,
        activeImpersonation,
        isMounted,
        createSchool,
        updateSchool,
        verifySchool,
        blacklistSchool,
        deleteSchool,
        impersonateSchool,
        exitImpersonation,
        postAnnouncement,
        addTicketReply,
        updateTicketAssignee,
        updateTicketStatus,
        updateConfig,
        updateQuotas,
        extendTrialPeriod,
        processRefund,
        sendExpiryAlert,
        rotateApiKey,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  return ctx;
}
