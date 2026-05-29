import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  apiClient,
  type AppRole,
  type UserProfile,
  isAppRole,
  ApiError,
} from "@/lib/api-client";

// Extending the generic UserProfile here if needed or we can just rely on the any mapping.
import { DEMO_IDS, DEMO_STUDENT_ID } from "@/lib/demo-ids";

export type UserRole = AppRole;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  initials: string;
  sub: string;
  avatar?: string;
  schoolCode?: string;
  studentCode?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  isMockMode: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AUTH_STORAGE_KEY = "campus_os_auth";

// Switch this to `true` to use hardcoded mock accounts instead of the real backend.
// In the future we will fetch this setting from process.env / import.meta.env
const useBackend = true; 

const MOCK_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "admin@school.com": {
    password: "123",
    user: {
      id: DEMO_IDS.profile.admin,
      email: "admin@school.com",
      name: "Priya Menon",
      role: "admin",
      initials: "PM",
      sub: "Principal",
    },
  },
  "teacher@school.com": {
    password: "123",
    user: {
      id: DEMO_IDS.profile.teacher,
      email: "teacher@school.com",
      name: "Anita Iyer",
      role: "teacher",
      initials: "AI",
      sub: "Mathematics · HOD",
    },
  },
  "student@school.com": {
    password: "123",
    user: {
      id: DEMO_STUDENT_ID,
      email: "student@school.com",
      name: "Aarav Sharma",
      role: "student",
      initials: "AS",
      sub: "Grade 10 · A",
    },
  },
  "parent@school.com": {
    password: "123",
    user: {
      id: DEMO_IDS.profile.parent,
      email: "parent@school.com",
      name: "Ramesh Sharma",
      role: "parent",
      initials: "RS",
      sub: "Parent of Aarav & Ananya",
    },
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function roleSubtitle(role: AppRole): string {
  const labels: Record<AppRole, string> = {
    super_admin: "Super Administrator",
    admin: "Administrator",
    teacher: "Faculty",
    parent: "Parent",
    student: "Student",
  };
  return labels[role];
}

function loadPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function profileToAuthUser(profile: UserProfile): AuthUser {
  const name = profile.full_name?.trim() || profile.email.split("@")[0] || "User";
  return {
    id: profile.id,
    email: profile.email,
    name,
    role: profile.role,
    initials: initialsFromName(name),
    sub: profile.subtitle?.trim() || roleSubtitle(profile.role),
    avatar: profile.avatar_url ?? undefined,
    schoolCode: (profile as any).schoolCode,
    studentCode: (profile as any).studentCode,
  };
}

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    // Calling the backend /me endpoint
    const response = await apiClient<any>("/auth/me");
    if (!response || !response.email) return null;
    
    // Map backend response (IUser) to frontend UserProfile format
    const profile: UserProfile = {
      id: response._id || response.id,
      email: response.email,
      full_name: `${response.firstName || ""} ${response.lastName || ""}`.trim(),
      role: response.role.toLowerCase() as AppRole,
      avatar_url: response.profilePicture,
      subtitle: roleSubtitle(response.role.toLowerCase() as AppRole),
      created_at: response.createdAt,
      schoolCode: response.schoolCode,
      studentCode: response.studentCode,
    };
    
    return profile;
  } catch (error) {
    // Silently return null for unauthorized status codes (which is expected if the user isn't logged in yet)
    if (error instanceof ApiError && error.statusCode === 401) {
      return null;
    }
    console.error("Profile fetch failed:", error);
    return null;
  }
}

export function isAdminPortalRole(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function getRolePath(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "/teacher";
    case "student":
      return "/student";
    case "parent":
      return "/parent";
    case "admin":
    case "super_admin":
    default:
      return "/admin";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMockMode = !useBackend;

  const [user, setUser] = useState<AuthUser | null>(() =>
    isMockMode && typeof window !== "undefined" ? loadPersistedUser() : null,
  );
  const [authLoading, setAuthLoading] = useState(!isMockMode);

  useEffect(() => {
    if (isMockMode) {
      persistUser(user);
    }
  }, [user, isMockMode]);

  const hydrateFromSession = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setUser(profileToAuthUser(profile));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session restore failed:", err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setAuthLoading(false);
      return;
    }

    if (isMockMode) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    void (async () => {
      await hydrateFromSession();
      if (mounted) setAuthLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [hydrateFromSession, isMockMode]);

  const login = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (isMockMode) {
        const account = MOCK_ACCOUNTS[normalizedEmail];
        if (!account) {
          return { success: false, error: "No account found with this email" };
        }
        if (account.password !== password) {
          return { success: false, error: "Incorrect password" };
        }
        setUser(account.user);
        return { success: true, user: account.user };
      }

      try {
        const response = await apiClient<any>("/auth/login", {
          method: "POST",
          data: { email: normalizedEmail, password },
        });

        // Fetch full profile info with /me if needed, or use response directly
        // The backend login response returns the user object in `response` (it is wrapped in data by apiClient)
        const profile: UserProfile = {
          id: response._id || response.id,
          email: response.email,
          full_name: `${response.firstName || ""} ${response.lastName || ""}`.trim(),
          role: response.role.toLowerCase() as AppRole,
          avatar_url: response.profilePicture,
          subtitle: roleSubtitle(response.role.toLowerCase() as AppRole),
          created_at: response.createdAt,
          schoolCode: response.schoolCode,
          studentCode: response.studentCode,
        };

        const authUser = profileToAuthUser(profile);
        setUser(authUser);
        return { success: true, user: authUser };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error during sign in";
        return { success: false, error: message };
      }
    },
    [isMockMode],
  );

  const logout = useCallback(async () => {
    if (!isMockMode) {
      try {
        await apiClient("/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("parent_active_child");
    }
  }, [isMockMode]);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      if (updates.name) next.initials = initialsFromName(updates.name);
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      authLoading,
      isMockMode,
      login,
      logout,
      updateProfile,
    }),
    [user, authLoading, isMockMode, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
