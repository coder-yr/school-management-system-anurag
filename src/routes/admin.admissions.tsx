import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AdmissionEnquiryForm,
  AdmissionApplicationStatus,
} from "@/components/admissions/admission-form";
import { AdmissionApplicationTracker } from "@/components/admissions/admission-tracker";
import { PageHeader, Panel } from "@/components/module-shell";
import { AdmissionApplication } from "@/lib/schemas";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/admissions")({
  component: AdminAdmissionsPage,
});

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

function AdminAdmissionsPage() {
  const [view, setView] = useState<"list" | "details" | "new">("list");
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = async () => {
    try {
      const res = await apiClient<any>("/admissions");
      setApplications(res?.data || []);
    } catch (err) {
      toast.error("Failed to load applications");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || app.applicationStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {view === "list" && (
        <>
          <PageHeader
            title="Admission Management"
            subtitle="Review and manage student admission applications"
            actions={
              <button
                onClick={() => setView("new")}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Application
              </button>
            }
          />

          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredApps.map((app) => (
              <Panel
                key={app._id || app.id}
                className="cursor-pointer transition hover:border-primary/50"
                onClick={() => {
                  setSelectedApp(app);
                  setView("details");
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{app.studentName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Applying for Grade {app.applyingForGrade} • {app.email}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Applied: {new Date(app.appliedAt || "").toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <AdmissionApplicationStatus status={app.applicationStatus} />
                    <div className="mt-2 text-xs text-muted-foreground">
                      {app.documents.filter((d) => d.verificationStatus === "Verified").length}/
                      {app.documents.length} docs
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No applications found</p>
            </div>
          )}
        </>
      )}

      {view === "details" && selectedApp && (
        <>
          <button
            onClick={() => setView("list")}
            className="mb-4 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Applications
          </button>
          <AdmissionApplicationTracker
            application={selectedApp}
            isAdmin={true}
            onReview={(status, notes) => {
              console.log("Reviewing application:", { id: selectedApp.id, status, notes });
              // TODO: Call server function to update application
              setView("list");
            }}
          />
        </>
      )}

      {view === "new" && (
        <>
          <button
            onClick={() => setView("list")}
            className="mb-4 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Applications
          </button>
          <Panel>
            <h2 className="mb-4 text-lg font-semibold">Add Manual Application</h2>
            <p className="text-sm text-muted-foreground mb-4">
              For offline admissions or data migration
            </p>
            <AdmissionEnquiryForm onSuccess={() => setView("list")} />
          </Panel>
        </>
      )}
    </div>
  );
}
