import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Newspaper,
  User,
  BookOpen,
  ClipboardList,
  FileText,
  CalendarDays,
  Wallet,
  Bus,
  Bell,
  Brain,
} from "lucide-react";
import { ModuleShell, type NavGroup } from "@/components/module-shell";
import { useAuth, getRolePath } from "@/lib/auth-context";

const groups: NavGroup[] = [
  {
    label: "Home",
    items: [
      { to: "/student", label: "Dashboard", icon: LayoutDashboard },
      { to: "/student/feed", label: "Feed", icon: Newspaper },
      { to: "/student/profile", label: "Profile", icon: User },
    ],
  },
  {
    label: "Learning",
    items: [
      { to: "/student/academics", label: "Academics", icon: BookOpen },
      { to: "/student/syllabus", label: "Syllabus", icon: FileText },
      { to: "/student/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/student/materials", label: "Study materials", icon: FileText },
    ],
  },
  {
    label: "Daily",
    items: [
      { to: "/student/timetable", label: "Timetable", icon: CalendarDays },
      { to: "/student/calendar", label: "Calendar & events", icon: CalendarDays },
      { to: "/student/transport", label: "Bus tracking", icon: Bus },
      { to: "/student/hostel", label: "Hostel", icon: LayoutDashboard },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/student/fees", label: "Fees & payments", icon: Wallet },
      { to: "/student/notifications", label: "Notifications", icon: Bell },
    ],
  },
  { label: "AI Hub", items: [{ to: "/student/ai-hub", label: "AI Assistant", icon: Brain }] },
];

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student Workspace · Campus OS" }] }),
  component: StudentLayout,
});

function StudentLayout() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) navigate({ to: "/login" });
    else if (user?.role !== "student") navigate({ to: getRolePath(user!.role) });
  }, [authLoading, isAuthenticated, user, navigate]);

  if (authLoading) {
    return (
      <div className="page-mesh flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "student") return null;

  return (
    <ModuleShell brand="Campus OS" roleLabel="Student" groups={groups}>
      <Outlet />
    </ModuleShell>
  );
}
