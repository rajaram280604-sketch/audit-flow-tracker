import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  FolderKanban,
  Gauge,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Engagement control center | AuditFlow" },
      { name: "description", content: "A controlled engagement workspace for audit planning, fieldwork, findings, evidence, review and file freeze." },
      { property: "og:title", content: "Engagement control center | AuditFlow" },
      { property: "og:description", content: "Control the audit file from risk and materiality through partner review and freeze." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EngagementControlCenter,
});

type IconType = typeof LayoutDashboard;

const navigation: { label: string; icon: IconType; count?: string }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Engagements", icon: FolderKanban, count: "08" },
  { label: "Work queue", icon: Inbox, count: "12" },
  { label: "Review notes", icon: ClipboardCheck, count: "06" },
  { label: "Documents", icon: FileText },
];

const stages = [
  { name: "Engagement", detail: "Accepted", icon: CheckCircle2, state: "complete" },
  { name: "Risk & materiality", detail: "Approved", icon: ShieldCheck, state: "complete" },
  { name: "Audit program", detail: "In progress", icon: ClipboardCheck, state: "active" },
  { name: "Fieldwork", detail: "64% complete", icon: Gauge, state: "active" },
  { name: "Query / finding", detail: "18 open", icon: AlertTriangle, state: "attention" },
  { name: "Evidence request", detail: "5 awaiting", icon: Paperclip, state: "attention" },
  { name: "Management response", detail: "3 received", icon: Users, state: "pending" },
  { name: "Auditor evaluation", detail: "4 to evaluate", icon: FileCheck2, state: "pending" },
  { name: "Partner review", detail: "6 open notes", icon: ShieldCheck, state: "pending" },
  { name: "Conclusion", detail: "Not started", icon: CircleDot, state: "pending" },
  { name: "File freeze", detail: "Target 24 Sep", icon: LockKeyhole, state: "locked" },
];

const queries = [
  { id: "Q-024", title: "Revenue cut-off — dispatches after year end", area: "Revenue", risk: "High", owner: "AK", age: "12d", status: "Partner review", tone: "danger" },
  { id: "Q-021", title: "Unreconciled vendor balances at 31 March", area: "Payables", risk: "Medium", owner: "SN", age: "8d", status: "Awaiting management", tone: "warning" },
  { id: "Q-019", title: "Inventory provision methodology and ageing", area: "Inventory", risk: "High", owner: "RM", age: "6d", status: "Auditor evaluation", tone: "info" },
  { id: "Q-017", title: "Related party completeness confirmation", area: "Related parties", risk: "Medium", owner: "PV", age: "4d", status: "Senior review", tone: "success" },
];

const activity = [
  { initials: "SN", text: "uploaded bank reconciliation support", time: "18 min ago", color: "info" },
  { initials: "RM", text: "submitted Q-019 for auditor evaluation", time: "42 min ago", color: "success" },
  { initials: "CA", text: "returned review note RN-008 to preparer", time: "1 hr ago", color: "warning" },
];

function EngagementControlCenter() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedStage, setSelectedStage] = useState("Audit program");
  const [queryFilter, setQueryFilter] = useState("All open");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  return (
    <div className="audit-shell flex min-h-screen bg-background text-foreground">
      {sidebarOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[246px] flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0`}>
        <div className="flex h-[82px] items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground"><span className="text-lg font-black">A</span></div>
            <div><div className="text-[15px] font-bold tracking-tight">Audit<span className="text-sidebar-primary">Flow</span></div><div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/55">Quality workspace</div></div>
          </div>
        </div>
        <div className="px-4 pt-7">
          <div className="audit-label px-3 text-sidebar-foreground/45">Workspace</div>
          <nav className="mt-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.label;
              return <button key={item.label} onClick={() => { setActiveNav(item.label); showNotice(`${item.label} view selected`); }} className={`audit-focus-ring flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"}`}><Icon size={16} strokeWidth={isActive ? 2.4 : 1.8} /><span className="flex-1">{item.label}</span>{item.count && <span className={`${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-foreground/10 text-sidebar-foreground/50"} px-1.5 py-0.5 text-[10px] font-bold`}>{item.count}</span>}</button>;
            })}
          </nav>
        </div>
        <div className="mt-8 px-4">
          <div className="audit-label px-3 text-sidebar-foreground/45">Management</div>
          <nav className="mt-3 space-y-1">
            <button onClick={() => showNotice("Reports are being prepared")} className="audit-focus-ring flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"><SlidersHorizontal size={16} strokeWidth={1.8} /><span>Reports</span></button>
            <button onClick={() => showNotice("Firm settings opened")} className="audit-focus-ring flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"><Users size={16} strokeWidth={1.8} /><span>Firm & access</span></button>
          </nav>
        </div>
        <div className="mt-auto border-t border-sidebar-border p-4">
          <div className="mb-4 flex items-center gap-3 px-2"><div className="flex h-8 w-8 items-center justify-center bg-sidebar-primary/20 text-[11px] font-bold text-sidebar-primary">CA</div><div className="min-w-0"><div className="truncate text-xs font-bold">CA Ananya Mehta</div><div className="truncate text-[10px] text-sidebar-foreground/45">Engagement partner</div></div><ChevronDown className="ml-auto text-sidebar-foreground/40" size={14} /></div>
          <div className="flex items-center gap-2 px-2 text-[10px] text-sidebar-foreground/45"><span className="h-1.5 w-1.5 bg-sidebar-primary" /> Secure session <span className="ml-auto">v1.0</span></div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[82px] items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur md:px-9">
          <div className="flex min-w-0 items-center gap-4"><button aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="audit-focus-ring text-muted-foreground lg:hidden"><Menu size={21} /></button><div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span>Firm workspace</span><ArrowRight size={13} /><span className="font-semibold text-foreground">Engagements</span></div><div className="flex items-center gap-2 md:hidden"><span className="text-sm font-bold">Engagements</span></div></div>
          <div className="flex items-center gap-2 md:gap-5"><button aria-label="Search" title="Search" onClick={() => showNotice("Search is ready")} className="audit-focus-ring p-2 text-muted-foreground hover:text-foreground"><Search size={18} /></button><button aria-label="Notifications" title="Notifications" onClick={() => showNotice("You have 3 notifications")} className="audit-focus-ring relative p-2 text-muted-foreground hover:text-foreground"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-danger-foreground" /></button><div className="hidden h-6 w-px bg-border md:block" /><button className="audit-focus-ring flex items-center gap-2 text-left" onClick={() => showNotice("Account menu opened")}><div className="flex h-8 w-8 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">AM</div><span className="hidden text-xs font-semibold lg:block">Ananya Mehta</span><ChevronDown size={14} className="hidden text-muted-foreground lg:block" /></button></div>
        </header>

        <div className="mx-auto max-w-[1520px] px-5 py-7 md:px-9 md:py-9">
          <section className="flex flex-col justify-between gap-6 border-b border-border pb-7 xl:flex-row xl:items-end">
            <div><div className="mb-3 flex items-center gap-2"><span className="h-2 w-2 bg-success-foreground" /><span className="audit-label text-success-foreground">Active engagement</span><span className="bg-success px-2 py-1 text-[10px] font-bold text-success-foreground">FIELDWORK</span></div><h1 className="max-w-3xl text-3xl font-black tracking-tight text-foreground md:text-[42px] md:leading-[1.08]">Northstar Components <span className="font-normal text-muted-foreground">/ FY 2025–26</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Engagement control center · statutory audit · reporting under Ind AS</p></div>
            <div className="flex flex-wrap items-center gap-2"><button onClick={() => showNotice("Engagement switcher opened")} className="audit-focus-ring flex items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:bg-surface-strong"><FolderKanban size={15} className="text-primary" /> ENG-25-014 <ChevronDown size={14} className="text-muted-foreground" /></button><button onClick={() => showNotice("New query draft created")} className="audit-focus-ring flex items-center gap-2 bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"><Plus size={15} /> New query</button></div>
          </section>

          <section className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            <Metric label="Overall materiality" value="₹75.00L" sub="Approved · 14 Aug 2026" icon={Gauge} />
            <Metric label="Performance materiality" value="₹56.25L" sub="75% of overall" icon={SlidersHorizontal} />
            <Metric label="Open queries" value="18" sub="3 high risk · 5 awaiting" icon={AlertTriangle} accent="warning" />
            <Metric label="Completion" value="78%" sub="Target freeze · 24 Sep" icon={CheckCircle2} accent="success" progress />
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between"><div><div className="audit-label">Controlled lifecycle</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">Engagement progress</h2></div><div className="hidden items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:flex"><span className="flex items-center gap-1.5"><i className="h-2 w-2 bg-success-foreground" /> Complete</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 bg-warning-foreground" /> Attention</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 border border-border bg-surface" /> Pending</span></div></div>
            <div className="audit-panel overflow-x-auto"><div className="flex min-w-[1120px] items-start px-5 py-6">{stages.map((stage, index) => <div key={stage.name} className="flex min-w-[96px] flex-1 items-start"><div className="flex min-w-0 flex-1 flex-col items-center text-center"><button onClick={() => { setSelectedStage(stage.name); showNotice(`${stage.name} stage selected`); }} className={`audit-focus-ring relative flex h-10 w-10 items-center justify-center border-2 transition-all ${selectedStage === stage.name ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--color-secondary)]" : stage.state === "complete" ? "border-success-foreground bg-success text-success-foreground" : stage.state === "attention" ? "border-warning-foreground bg-warning text-warning-foreground" : "border-border bg-surface-strong text-muted-foreground"}`} title={`Open ${stage.name}`}><stage.icon size={17} strokeWidth={2} /></button><div className={`mt-3 text-[10px] font-extrabold leading-4 ${selectedStage === stage.name ? "text-primary" : "text-foreground"}`}>{stage.name}</div><div className="mt-1 whitespace-nowrap text-[9px] text-muted-foreground">{stage.detail}</div></div>{index < stages.length - 1 && <div className={`mt-5 h-px flex-1 ${stage.state === "complete" ? "bg-success-foreground/45" : "bg-border"}`} />}</div>)}</div></div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><CircleDot size={13} className="text-primary" /><span>Current stage:</span><strong className="text-foreground">{selectedStage}</strong><ArrowRight size={13} /><span>{stages.find((stage) => stage.name === selectedStage)?.detail}</span></div>
          </section>

          <section className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
            <div className="min-w-0"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><div className="audit-label">Attention required</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">Query & finding queue</h2></div><button onClick={() => showNotice("All queries view opened")} className="audit-focus-ring flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/75">View all <ArrowRight size={14} /></button></div>
              <div className="mb-3 flex items-center gap-1 overflow-x-auto border-b border-border"><Filter size={14} className="mr-2 shrink-0 text-muted-foreground" />{["All open", "High risk", "Awaiting mgmt", "Partner review"].map((filter) => <button key={filter} onClick={() => setQueryFilter(filter)} className={`audit-focus-ring whitespace-nowrap border-b-2 px-3 py-2 text-[11px] font-bold ${queryFilter === filter ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{filter}</button>)}</div>
              <div className="audit-panel overflow-hidden">{queries.map((query, index) => <button key={query.id} onClick={() => showNotice(`${query.id} opened`)} className="audit-focus-ring flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left last:border-0 hover:bg-surface-strong md:gap-4 md:px-5"><div className={`hidden h-9 w-1 shrink-0 md:block ${query.tone === "danger" ? "bg-danger-foreground" : query.tone === "warning" ? "bg-warning-foreground" : query.tone === "info" ? "bg-info-foreground" : "bg-success-foreground"}`} /><div className="flex h-9 w-9 shrink-0 items-center justify-center bg-secondary text-[10px] font-black text-secondary-foreground">{query.owner}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black tracking-wider text-muted-foreground">{query.id}</span><span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${query.risk === "High" ? "bg-danger text-danger-foreground" : "bg-warning text-warning-foreground"}`}>{query.risk}</span></div><div className="mt-1 truncate text-xs font-bold text-foreground md:text-sm">{query.title}</div><div className="mt-1 text-[10px] text-muted-foreground">{query.area} · {query.age} open</div></div><div className="hidden min-w-[140px] text-right sm:block"><div className="text-[10px] font-bold text-foreground">{query.status}</div><div className="mt-1 text-[10px] text-muted-foreground">Owner · {query.owner}</div></div><ArrowRight size={16} className="shrink-0 text-muted-foreground" /></button>)}</div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>Showing {queries.length} of 18 open queries</span><button onClick={() => showNotice("Filters reset")} className="audit-focus-ring flex items-center gap-1 font-bold text-primary"><X size={12} /> Clear filters</button></div>
            </div>
            <div><div className="mb-4"><div className="audit-label">Control signals</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">File health</h2></div><div className="audit-panel divide-y divide-border"><HealthRow icon={Clock3} label="Overdue work items" value="04" detail="2 queries · 2 review notes" tone="danger" /><HealthRow icon={Paperclip} label="Evidence gaps" value="07" detail="Across 4 audit areas" tone="warning" /><HealthRow icon={ClipboardCheck} label="Review notes" value="06" detail="1 overdue · 5 open" tone="info" /><HealthRow icon={ShieldCheck} label="Partner decisions" value="03" detail="Awaiting sign-off" tone="success" /></div><div className="mt-8 mb-4"><div className="audit-label">Recent activity</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">Team feed</h2></div><div className="audit-panel divide-y divide-border">{activity.map((item) => <div key={item.text} className="flex gap-3 px-4 py-4"><div className={`flex h-7 w-7 shrink-0 items-center justify-center bg-${item.color} text-[9px] font-black text-${item.color}-foreground`}>{item.initials}</div><div className="min-w-0"><p className="text-xs leading-5 text-foreground"><strong>{item.initials === "CA" ? "CA Ananya" : item.initials === "SN" ? "Sana Nair" : "Rohan Mehta"}</strong> {item.text}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.time}</p></div></div>)}<button onClick={() => showNotice("Activity log opened")} className="audit-focus-ring flex w-full items-center justify-center gap-1 px-4 py-3 text-[10px] font-bold text-primary">Open activity log <ArrowRight size={13} /></button></div></div>
          </section>

          <section className="mt-9 border border-primary/20 bg-primary px-5 py-5 text-primary-foreground md:flex md:items-center md:justify-between md:px-7"><div className="flex items-start gap-4"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-primary-foreground/15"><LockKeyhole size={16} /></div><div><div className="text-sm font-bold">File freeze readiness</div><p className="mt-1 text-xs leading-5 text-primary-foreground/70">18 open queries and 6 review notes still require resolution before the audit file can be frozen.</p></div></div><button onClick={() => showNotice("Freeze checklist opened")} className="audit-focus-ring mt-4 flex shrink-0 items-center gap-2 border border-primary-foreground/30 px-3 py-2 text-xs font-bold hover:bg-primary-foreground/10 md:mt-0">Open checklist <ArrowRight size={14} /></button></section>
        </div>
      </main>
      {notice && <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl"><Check size={15} className="text-success" /> {notice}</div>}
    </div>
  );
}

function Metric({ label, value, sub, icon: Icon, accent = "primary", progress = false }: { label: string; value: string; sub: string; icon: IconType; accent?: string; progress?: boolean }) {
  const color = accent === "warning" ? "text-warning-foreground" : accent === "success" ? "text-success-foreground" : "text-primary";
  return <div className="bg-surface px-4 py-5 md:px-6"><div className="flex items-center justify-between"><span className="audit-label">{label}</span><Icon size={16} className={color} /></div><div className="mt-3 flex items-end justify-between gap-2"><strong className="text-2xl font-black tracking-tight">{value}</strong>{progress && <div className="mb-1 h-1.5 w-16 bg-secondary"><div className="h-full w-[78%] bg-success-foreground" /></div>}</div><p className="mt-1 text-[10px] text-muted-foreground">{sub}</p></div>;
}

function HealthRow({ icon: Icon, label, value, detail, tone }: { icon: IconType; label: string; value: string; detail: string; tone: string }) {
  const color = tone === "danger" ? "text-danger-foreground" : tone === "warning" ? "text-warning-foreground" : tone === "info" ? "text-info-foreground" : "text-success-foreground";
  return <div className="flex items-center gap-3 px-4 py-4"><div className={`flex h-8 w-8 shrink-0 items-center justify-center bg-${tone}`}><Icon size={15} className={color} /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{label}</div><div className="mt-1 truncate text-[10px] text-muted-foreground">{detail}</div></div><strong className={`text-xl font-black ${color}`}>{value}</strong></div>;
}