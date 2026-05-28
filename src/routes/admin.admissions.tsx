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
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_APPLICATIONS: AdmissionApplication[] = [
  {
    id: "app_001",
    studentName: "Arjun Patel",
    fatherName: "Rajesh Patel",
    motherName: "Priya Patel",
    dateOfBirth: "2010-05-15",
    gender: "Male",
    email: "arjun.p@example.com",
    phone: "9876543210",
    currentSchool: "Central High School",
    currentGrade: "9",
    applyingForGrade: "10",
    address: "123 Oak Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    applicationStatus: "Under Review",
    appliedAt: "2026-05-20T10:30:00Z",
    reviewedAt: "2026-05-22T14:00:00Z",
    reviewedBy: "admin@school.com",
    documents: [
      {
        id: "doc_001",
        documentType: "Birth Certificate",
        fileName: "birth_cert.pdf",
        fileUrl: "/uploads/doc_001.pdf",
        uploadedAt: "2026-05-20T10:35:00Z",
        verificationStatus: "Verified",
        verifiedBy: "admin@school.com",
        verifiedAt: "2026-05-21T09:00:00Z",
      },
      {
        id: "doc_002",
        documentType: "Previous Marksheet",
        fileName: "class9_marksheet.pdf",
        fileUrl: "/uploads/doc_002.pdf",
        uploadedAt: "2026-05-20T10:35:00Z",
        verificationStatus: "Verified",
        verifiedBy: "admin@school.com",
        verifiedAt: "2026-05-21T09:15:00Z",
      },
      {
        id: "doc_003",
        documentType: "Photo",
        fileName: "passport_photo.jpg",
        fileUrl: "/uploads/doc_003.jpg",
        uploadedAt: "2026-05-20T10:35:00Z",
        verificationStatus: "Pending",
      },
    ],
    admissionFeeStatus: "Pending",
    admissionFeeAmount: 5000,
    notes: "Good academic record. Need to verify photo quality.",
    parentEmail: "rajesh.p@example.com",
    parentPhone: "9876543209",
    createdAt: "2026-05-20T10:30:00Z",
    updatedAt: "2026-05-22T14:00:00Z",
  },
  {
    id: "app_002",
    studentName: "Divya Sharma",
    fatherName: "Vikram Sharma",
    motherName: "Neha Sharma",
    dateOfBirth: "2009-08-22",
    gender: "Female",
    email: "divya.s@example.com",
    phone: "8765432109",
    currentSchool: "St. Paul's Academy",
    currentGrade: "10",
    applyingForGrade: "11",
    address: "456 Maple Lane",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    applicationStatus: "Approved",
    appliedAt: "2026-05-18T11:00:00Z",
    reviewedAt: "2026-05-20T15:30:00Z",
    reviewedBy: "admin@school.com",
    documents: [
      {
        id: "doc_004",
        documentType: "Birth Certificate",
        fileName: "birth_cert_divya.pdf",
        fileUrl: "/uploads/doc_004.pdf",
        uploadedAt: "2026-05-18T11:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "admin@school.com",
        verifiedAt: "2026-05-19T08:00:00Z",
      },
      {
        id: "doc_005",
        documentType: "Previous Marksheet",
        fileName: "class10_marksheet.pdf",
        fileUrl: "/uploads/doc_005.pdf",
        uploadedAt: "2026-05-18T11:05:00Z",
        verificationStatus: "Verified",
        verifiedBy: "admin@school.com",
        verifiedAt: "2026-05-19T08:15:00Z",
      },
    ],
    admissionFeeStatus: "Paid",
    admissionFeeAmount: 5000,
    notes: "Excellent student. Scholarship eligible.",
    parentEmail: "vikram.s@example.com",
    parentPhone: "8765432108",
    createdAt: "2026-05-18T11:00:00Z",
    updatedAt: "2026-05-20T15:30:00Z",
  },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

function AdminAdmissionsPage() {
  const [view, setView] = useState<"list" | "details" | "new">("list");
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredApps = MOCK_APPLICATIONS.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
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
                key={app.id}
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
