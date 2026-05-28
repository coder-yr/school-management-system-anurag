import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, X, Search, ArrowDownUp, BookMarked, Clock } from "lucide-react";
import { PageHeader, StatCard, Panel, EmptyState } from "@/components/module-shell";
import { apiClient } from "@/lib/api-client";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/library")({
  head: () => ({ meta: [{ title: "Library · Campus OS" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState<"dashboard" | "books" | "add">("dashboard");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Mathematics",
    copies: 1,
    shelf: "",
  });

  const [books, setBooks] = useState<any[]>([]);
  const [circulations, setCirculations] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        apiClient<any>("/library/books"),
        apiClient<any>("/library/circulations"),
      ]);
      setBooks(Array.isArray(bRes) ? bRes : bRes?.data || []);
      setCirculations(Array.isArray(cRes) ? cRes : cRes?.data || []);
    } catch (err) {
      toast.error("Failed to fetch library data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const issued = circulations.filter((c) => c.status === "issued").length;
  const overdue = circulations.filter((c) => c.status === "overdue").length;
  const returned = circulations.filter((c) => c.status === "returned").length;
  const totalBooks = books.reduce((a, b) => a + (b.total_copies || 0), 0);
  const filtered = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Library Management" subtitle="Book circulation, catalog, and inventory" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Today Issued" value={String(issued)} icon={BookMarked} tone="info" />
        <StatCard
          label="Today Returned"
          value={String(returned)}
          icon={ArrowDownUp}
          tone="success"
        />
        <StatCard
          label="Overdue"
          value={String(overdue)}
          delta="Needs follow-up"
          icon={Clock}
          tone="warning"
        />
        <StatCard label="Total Books" value={String(totalBooks)} icon={BookOpen} />
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-muted p-1">
        {(
          [
            ["dashboard", "Circulation"],
            ["books", "Catalog"],
            ["add", "Add Book"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <Panel title="Active Circulations">
          <div className="space-y-3">
            {circulations.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-medium text-sm">{c.book_title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.student_name} · Issued: {new Date(c.issued_date).toLocaleDateString()} · Due: {new Date(c.due_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.status === "overdue" ? "bg-destructive/10 text-destructive" : c.status === "returned" ? "bg-[oklch(0.65_0.15_155)]/15 text-[oklch(0.45_0.15_155)]" : "bg-accent/10 text-accent"}`}
                  >
                    {c.status}
                  </span>
                  {c.status !== "returned" && (
                    <button
                      onClick={async () => {
                        try {
                          await apiClient(`/library/circulations/${c.id}/return`, { method: "POST" });
                          toast.success("Book returned", { description: c.book_title });
                          fetchData();
                        } catch (err) {
                          toast.error("Failed to return book");
                        }
                      }}
                      className="rounded-lg bg-[oklch(0.65_0.15_155)]/15 px-3 py-1.5 text-xs font-medium text-[oklch(0.45_0.15_155)] hover:bg-[oklch(0.65_0.15_155)]/25 transition-all active:scale-95"
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {circulations.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No circulations"
              description="Issue a book to get started."
            />
          )}
        </Panel>
      )}

      {tab === "books" && (
        <Panel title="Book Catalog">
          <div className="mb-4 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or author…"
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Author</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Shelf</th>
                  <th className="pb-3 pr-4">Available</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{b.title}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{b.author}</td>
                    <td className="py-3 pr-4">{b.category}</td>
                    <td className="py-3 pr-4">{b.shelf}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          (b.available_copies || 0) > 0 ? "text-[oklch(0.45_0.15_155)]" : "text-destructive"
                        }
                      >
                        {b.available_copies || 0}/{b.total_copies || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-3">
                <div className="font-medium text-sm">{b.title}</div>
                <div className="text-xs text-muted-foreground">
                  {b.author} · {b.category} · Shelf {b.shelf}
                </div>
                <div className="text-xs mt-1">
                  Available: {b.available_copies || 0}/{b.total_copies || 0}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "add" && (
        <Panel title={`Add Book — Step ${step} of 3`}>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-muted"}`}
              />
            ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (step < 3) {
                setStep((s) => s + 1);
                return;
              }
              try {
                await apiClient("/library/books", {
                  method: "POST",
                  data: {
                    title: bookForm.title,
                    author: bookForm.author,
                    isbn: bookForm.isbn,
                    category: bookForm.category,
                    totalCopies: bookForm.copies,
                    available: bookForm.copies,
                    shelf: bookForm.shelf,
                  }
                });
                toast.success("Book added to catalog");
                setBookForm({
                  title: "",
                  author: "",
                  isbn: "",
                  category: "Mathematics",
                  copies: 1,
                  shelf: "",
                });
                setStep(1);
                setTab("books");
                fetchData();
              } catch (err) {
                toast.error("Failed to add book");
              }
            }}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Book Title</label>
                  <input
                    name="title"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Author</label>
                  <input
                    name="author"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">ISBN</label>
                  <input
                    name="isbn"
                    required
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <select
                    name="category"
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Literature</option>
                    <option>Science</option>
                    <option>History</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Number of Copies</label>
                  <input
                    name="copies"
                    type="number"
                    value={bookForm.copies}
                    onChange={(e) => setBookForm({ ...bookForm, copies: Number(e.target.value) })}
                    min={1}
                    required
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Shelf Location</label>
                  <input
                    name="shelf"
                    required
                    placeholder="e.g. M-01"
                    value={bookForm.shelf}
                    onChange={(e) => setBookForm({ ...bookForm, shelf: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  Review your entries and click "Add Book" to save.
                </div>
              </>
            )}
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                {step < 3 ? "Next" : "Add Book"}
              </button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
