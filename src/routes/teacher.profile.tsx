import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/module-shell";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, Shield, Save, BookOpen, Clock } from "lucide-react";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({ meta: [{ title: "My Profile · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { user, updateProfile } = useAuth();

  // Edit states
  const [name, setName] = useState(user?.name || "Anita Iyer");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState(
    "Mathematics Teacher and Head of Department with 10+ years of teaching experience. Passionate about algebra and making geometry fun and accessible for middle and high school students.",
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    updateProfile({ name });
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your teacher profile and credentials." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              {user?.initials || "AI"}
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{user?.name || "Anita Iyer"}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {user?.sub || "Mathematics · HOD"}
            </p>

            <div className="mt-6 pt-6 border-t border-border space-y-3 text-left text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground font-semibold text-xs rounded bg-muted px-2 py-0.5">
                  Staff ID: STF-289
                </span>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h4 className="font-semibold text-sm border-b border-border pb-2">
              Academic Qualifications
            </h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground font-medium">Degrees</div>
                <div className="text-sm font-semibold text-foreground">
                  M.Sc. Mathematics, B.Ed.
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Departments</div>
                <div className="text-sm font-semibold text-foreground">Science & Mathematics</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Joining Date</div>
                <div className="text-sm font-semibold text-foreground">July 14, 2016</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile form */}
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Edit Profile Details">
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Teacher Biography
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </form>
          </Panel>

          {/* Schedule Summary panel */}
          <Panel title="Class Assignments & Hours">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl border border-border p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-medium">Classes Taught</span>
                </div>
                <div className="text-base font-bold">10-A, 10-B, 10-C, 9-A</div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Weekly Lectures</span>
                </div>
                <div className="text-base font-bold">22 Periods</div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Work Mode</span>
                </div>
                <div className="text-base font-bold">Full Time (Regular)</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
