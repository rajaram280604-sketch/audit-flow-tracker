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
  Download,
  FileCheck2,
  FileText,
  Filter,
  FolderKanban,
  Gauge,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
type DialogName = "search" | "notifications" | "account" | "engagements" | "query" | "queryDetail" | "materiality" | "hours" | "document" | "stage" | "freeze" | "activity" | "health" | null;
type QueryFilter = "All open" | "High risk" | "Awaiting mgmt" | "Partner review";
type QueryTone = "danger" | "warning" | "info" | "success";

type Query = {
  id: string;
  title: string;
  area: string;
  risk: "High" | "Medium" | "Low";
  owner: string;
  age: string;
  status: string;
  tone: QueryTone;
};

type Engagement = {
  code: string;
  client: string;
  year: string;
  status: string;
  progress: number;
};

type TimeEntry = {
  id: number;
  date: string;
  area: string;
  description: string;
  hours: number;
  billable: boolean;
};

const navigation: { label: string; icon: IconType; count?: string }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Engagements", icon: FolderKanban, count: "08" },
  { label: "Work queue", icon: Inbox, count: "12" },
  { label: "Review notes", icon: ClipboardCheck, count: "06" },
  { label: "Documents", icon: FileText },
];

const defaultStage = { name: "Engagement", detail: "Accepted", icon: CheckCircle2, state: "complete" };

const stages = [
  defaultStage,
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

const initialQueries: Query[] = [
  { id: "Q-024", title: "Revenue cut-off — dispatches after year end", area: "Revenue", risk: "High", owner: "AK", age: "12d", status: "Partner review", tone: "danger" },
  { id: "Q-021", title: "Unreconciled vendor balances at 31 March", area: "Payables", risk: "Medium", owner: "SN", age: "8d", status: "Awaiting management", tone: "warning" },
  { id: "Q-019", title: "Inventory provision methodology and ageing", area: "Inventory", risk: "High", owner: "RM", age: "6d", status: "Auditor evaluation", tone: "info" },
  { id: "Q-017", title: "Related party completeness confirmation", area: "Related parties", risk: "Medium", owner: "PV", age: "4d", status: "Senior review", tone: "success" },
];

const initialActivity = [
  { initials: "SN", text: "uploaded bank reconciliation support", time: "18 min ago", color: "info" as const },
  { initials: "RM", text: "submitted Q-019 for auditor evaluation", time: "42 min ago", color: "success" as const },
  { initials: "CA", text: "returned review note RN-008 to preparer", time: "1 hr ago", color: "warning" as const },
];

const defaultEngagement: Engagement = { code: "ENG-25-014", client: "Northstar Components", year: "FY 2025–26", status: "Fieldwork", progress: 78 };

const initialEngagements: Engagement[] = [
  defaultEngagement,
  { code: "ENG-25-011", client: "Cedar Healthcare", year: "FY 2025–26", status: "Partner review", progress: 91 },
  { code: "ENG-25-008", client: "Meridian Foods", year: "FY 2025–26", status: "Planning", progress: 24 },
];

const initialHours: TimeEntry[] = [
  { id: 1, date: "03 Sep 2026", area: "Revenue", description: "Tested dispatch cut-off samples", hours: 3.5, billable: true },
  { id: 2, date: "02 Sep 2026", area: "Inventory", description: "Reviewed ageing and provision model", hours: 4, billable: true },
  { id: 3, date: "01 Sep 2026", area: "Planning", description: "Updated risk and materiality assessment", hours: 2.5, billable: true },
];

const toneStyles: Record<QueryTone, { bar: string; badge: string; avatar: string; icon: string }> = {
  danger: { bar: "bg-danger-foreground", badge: "bg-danger text-danger-foreground", avatar: "bg-danger text-danger-foreground", icon: "text-danger-foreground" },
  warning: { bar: "bg-warning-foreground", badge: "bg-warning text-warning-foreground", avatar: "bg-warning text-warning-foreground", icon: "text-warning-foreground" },
  info: { bar: "bg-info-foreground", badge: "bg-info text-info-foreground", avatar: "bg-info text-info-foreground", icon: "text-info-foreground" },
  success: { bar: "bg-success-foreground", badge: "bg-success text-success-foreground", avatar: "bg-success text-success-foreground", icon: "text-success-foreground" },
};

function EngagementControlCenter() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedStage, setSelectedStage] = useState("Audit program");
  const [queryFilter, setQueryFilter] = useState<QueryFilter>("All open");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [selectedHealth, setSelectedHealth] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [queries, setQueries] = useState(initialQueries);
  const [activity, setActivity] = useState(initialActivity);
  const [engagements, setEngagements] = useState(initialEngagements);
  const [currentEngagement, setCurrentEngagement] = useState(defaultEngagement);
  const [hours, setHours] = useState(initialHours);
  const [documents, setDocuments] = useState<string[]>(["Bank reconciliation support.pdf", "Inventory ageing 31 Mar.xlsx", "Board minutes — Q4.pdf"]);
  const [materiality, setMateriality] = useState({ benchmark: "Revenue", amount: "420000000", percentage: "1.8", performance: "75", trivial: "5", inherent: "Medium", control: "Medium", detection: "Medium", rationale: "Revenue is the most relevant benchmark for users of the financial statements and reflects the scale of the operating business." });
  const [queryDraft, setQueryDraft] = useState({ title: "", area: "Revenue", risk: "Medium", owner: "AM", description: "" });
  const [hourDraft, setHourDraft] = useState({ date: "2026-09-03", area: "Revenue", description: "", hours: "", billable: true });
  const [engagementDraft, setEngagementDraft] = useState({ client: "", code: "", year: "FY 2026–27" });

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const openNav = (label: string) => {
    setActiveNav(label);
    setSidebarOpen(false);
    showNotice(`${label} view selected`);
  };

  const filteredQueries = useMemo(() => queries.filter((query) => {
    const matchesFilter = queryFilter === "All open" || (queryFilter === "High risk" && query.risk === "High") || (queryFilter === "Awaiting mgmt" && query.status === "Awaiting management") || (queryFilter === "Partner review" && query.status === "Partner review");
    const search = querySearch.trim().toLowerCase();
    return matchesFilter && (!search || `${query.id} ${query.title} ${query.area}`.toLowerCase().includes(search));
  }), [queries, queryFilter, querySearch]);

  const totalHours = hours.reduce((sum, entry) => sum + entry.hours, 0);
  const overallMateriality = (Number(materiality.amount) || 0) * ((Number(materiality.percentage) || 0) / 100);
  const performanceMateriality = overallMateriality * ((Number(materiality.performance) || 0) / 100);
  const trivialThreshold = overallMateriality * ((Number(materiality.trivial) || 0) / 100);

  const handleCreateQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!queryDraft.title.trim()) return;
    const id = `Q-${String(25 + queries.length).padStart(3, "0")}`;
    const tone: QueryTone = queryDraft.risk === "High" ? "danger" : queryDraft.risk === "Medium" ? "warning" : "info";
    const nextQuery: Query = { id, title: queryDraft.title.trim(), area: queryDraft.area, risk: queryDraft.risk as Query["risk"], owner: queryDraft.owner.toUpperCase(), age: "now", status: "Senior review", tone };
    setQueries((current) => [nextQuery, ...current]);
    setActivity((current) => [{ initials: "AM", text: `created ${id} for senior review`, time: "just now", color: "info" }, ...current]);
    setQueryDraft({ title: "", area: "Revenue", risk: "Medium", owner: "AM", description: "" });
    setDialog(null);
    showNotice(`${id} created and added to the work queue`);
  };

  const handleLogHours = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(hourDraft.hours);
    if (!hourDraft.description.trim() || !value || value > 24) return;
    const date = new Date(`${hourDraft.date}T12:00:00`);
    const formattedDate = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    setHours((current) => [{ id: Date.now(), date: formattedDate, area: hourDraft.area, description: hourDraft.description.trim(), hours: value, billable: hourDraft.billable }, ...current]);
    setHourDraft({ date: "2026-09-03", area: "Revenue", description: "", hours: "", billable: true });
    setDialog(null);
    showNotice(`${value.toFixed(2)} hours logged to ${currentEngagement.code}`);
  };

  const handleCreateEngagement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!engagementDraft.client.trim() || !engagementDraft.code.trim()) return;
    const next: Engagement = { code: engagementDraft.code.toUpperCase(), client: engagementDraft.client.trim(), year: engagementDraft.year, status: "Planning", progress: 8 };
    setEngagements((current) => [...current, next]);
    setCurrentEngagement(next);
    setEngagementDraft({ client: "", code: "", year: "FY 2026–27" });
    setDialog(null);
    showNotice(`${next.code} created and selected`);
  };

  const updateQueryStatus = (status: string) => {
    if (!selectedQuery) return;
    setQueries((current) => current.map((query) => query.id === selectedQuery.id ? { ...query, status, age: status === "Closed" ? "resolved" : query.age, tone: status === "Closed" ? "success" : query.tone } : query));
    setSelectedQuery((current) => current ? { ...current, status } : current);
    setActivity((current) => [{ initials: "AM", text: `${status.toLowerCase()} ${selectedQuery.id}`, time: "just now", color: status === "Closed" ? "success" : "warning" }, ...current]);
    showNotice(`${selectedQuery.id} marked ${status.toLowerCase()}`);
  };

  const openQuery = (query: Query) => {
    setSelectedQuery(query);
    setDialog("queryDetail");
  };

  const openStage = (name: string) => {
    setSelectedStage(name);
    setDialog("stage");
  };

  const selectEngagement = (engagement: Engagement) => {
    setCurrentEngagement(engagement);
    setDialog(null);
    showNotice(`${engagement.code} is now the active engagement`);
  };

  const closeDialog = () => setDialog(null);

  return (
    <div className="audit-shell flex min-h-screen bg-background text-foreground">
      {sidebarOpen && <Button aria-label="Close navigation" variant="ghost" className="fixed inset-0 z-30 h-full w-full rounded-none bg-foreground/30 hover:bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[246px] flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0`}>
        <div className="flex h-[82px] items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground"><span className="text-lg font-black">A</span></div><div><div className="text-[15px] font-bold tracking-tight">Audit<span className="text-sidebar-primary">Flow</span></div><div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/55">Quality workspace</div></div></div>
        </div>
        <div className="px-4 pt-7"><div className="audit-label px-3 text-sidebar-foreground/45">Workspace</div><nav className="mt-3 space-y-1">{navigation.map((item) => { const Icon = item.icon; const isActive = activeNav === item.label; return <Button key={item.label} variant="ghost" onClick={() => openNav(item.label)} className={`audit-focus-ring flex h-auto w-full items-center gap-3 rounded-none px-3 py-2.5 text-left text-[13px] font-semibold ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"}`}><Icon size={16} strokeWidth={isActive ? 2.4 : 1.8} /><span className="flex-1">{item.label}</span>{item.count && <span className={`${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-foreground/10 text-sidebar-foreground/50"} px-1.5 py-0.5 text-[10px] font-bold`}>{item.count}</span>}</Button>; })}</nav></div>
        <div className="mt-8 px-4"><div className="audit-label px-3 text-sidebar-foreground/45">Management</div><nav className="mt-3 space-y-1"><Button variant="ghost" onClick={() => openNav("Reports")} className="audit-focus-ring flex h-auto w-full items-center gap-3 rounded-none px-3 py-2.5 text-left text-[13px] font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"><SlidersHorizontal size={16} strokeWidth={1.8} /><span>Reports</span></Button><Button variant="ghost" onClick={() => openNav("Firm & access")} className="audit-focus-ring flex h-auto w-full items-center gap-3 rounded-none px-3 py-2.5 text-left text-[13px] font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"><Users size={16} strokeWidth={1.8} /><span>Firm & access</span></Button></nav></div>
        <div className="mt-auto border-t border-sidebar-border p-4"><Button variant="ghost" onClick={() => setDialog("account")} className="mb-4 flex h-auto w-full items-center gap-3 rounded-none px-2 text-left hover:bg-sidebar-accent/70"><div className="flex h-8 w-8 items-center justify-center bg-sidebar-primary/20 text-[11px] font-bold text-sidebar-primary">CA</div><div className="min-w-0"><div className="truncate text-xs font-bold">CA Ananya Mehta</div><div className="truncate text-[10px] text-sidebar-foreground/45">Engagement partner</div></div><ChevronDown className="ml-auto text-sidebar-foreground/40" size={14} /></Button><div className="flex items-center gap-2 px-2 text-[10px] text-sidebar-foreground/45"><span className="h-1.5 w-1.5 bg-sidebar-primary" /> Secure session <span className="ml-auto">v1.0</span></div></div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[82px] items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur md:px-9"><div className="flex min-w-0 items-center gap-4"><Button aria-label="Open navigation" variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={21} /></Button><div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span>Firm workspace</span><ArrowRight size={13} /><span className="font-semibold text-foreground">{activeNav}</span></div><div className="flex items-center gap-2 md:hidden"><span className="text-sm font-bold">{activeNav}</span></div></div><div className="flex items-center gap-2 md:gap-5"><Button aria-label="Search" title="Search" variant="ghost" size="icon" onClick={() => setDialog("search")}><Search size={18} /></Button><Button aria-label="Notifications" title="Notifications" variant="ghost" size="icon" className="relative" onClick={() => setDialog("notifications")}><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-danger-foreground" /></Button><div className="hidden h-6 w-px bg-border md:block" /><Button variant="ghost" onClick={() => setDialog("account")} className="flex h-auto items-center gap-2 rounded-none p-0 text-left"><div className="flex h-8 w-8 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">AM</div><span className="hidden text-xs font-semibold lg:block">Ananya Mehta</span><ChevronDown size={14} className="hidden text-muted-foreground lg:block" /></Button></div></header>

        {activeNav === "Overview" ? <OverviewView currentEngagement={currentEngagement} selectedStage={selectedStage} setSelectedStage={openStage} queries={queries} filteredQueries={filteredQueries} queryFilter={queryFilter} setQueryFilter={setQueryFilter} querySearch={querySearch} setQuerySearch={setQuerySearch} openQuery={openQuery} showNotice={showNotice} activity={activity} setDialog={setDialog} /> : <WorkspaceView activeNav={activeNav} currentEngagement={currentEngagement} engagements={engagements} hours={hours} totalHours={totalHours} documents={documents} openNav={openNav} setDialog={setDialog} showNotice={showNotice} setDocuments={setDocuments} />}
      </main>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {dialog === "search" && <SearchDialog querySearch={querySearch} setQuerySearch={setQuerySearch} queries={queries} openQuery={openQuery} closeDialog={closeDialog} />}
          {dialog === "notifications" && <NotificationsDialog activity={activity} closeDialog={closeDialog} />}
          {dialog === "account" && <AccountDialog openNav={openNav} closeDialog={closeDialog} />}
          {dialog === "engagements" && <EngagementDialog engagements={engagements} currentEngagement={currentEngagement} selectEngagement={selectEngagement} draft={engagementDraft} setDraft={setEngagementDraft} onCreate={handleCreateEngagement} />}
          {dialog === "query" && <QueryForm draft={queryDraft} setDraft={setQueryDraft} onSubmit={handleCreateQuery} />}
          {dialog === "queryDetail" && selectedQuery && <QueryDetail query={selectedQuery} updateStatus={updateQueryStatus} closeDialog={closeDialog} />}
          {dialog === "materiality" && <MaterialityForm materiality={materiality} setMateriality={setMateriality} overall={overallMateriality} performance={performanceMateriality} trivial={trivialThreshold} closeDialog={closeDialog} showNotice={showNotice} />}
          {dialog === "hours" && <HoursForm draft={hourDraft} setDraft={setHourDraft} onSubmit={handleLogHours} />}
          {dialog === "document" && <DocumentForm setDocuments={setDocuments} closeDialog={closeDialog} showNotice={showNotice} />}
          {dialog === "stage" && <StageDialog stage={stages.find((stage) => stage.name === selectedStage) ?? defaultStage} closeDialog={closeDialog} setDialog={setDialog} />}
          {dialog === "freeze" && <FreezeDialog closeDialog={closeDialog} showNotice={showNotice} />}
          {dialog === "activity" && <ActivityDialog activity={activity} closeDialog={closeDialog} />}
          {dialog === "health" && <HealthDialog title={selectedHealth} closeDialog={closeDialog} />}
        </DialogContent>
      </Dialog>
      {notice && <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl"><Check size={15} className="text-success" /> {notice}</div>}
    </div>
  );
}

function OverviewView({ currentEngagement, selectedStage, setSelectedStage, queries, filteredQueries, queryFilter, setQueryFilter, querySearch, setQuerySearch, openQuery, showNotice, activity, setDialog }: { currentEngagement: Engagement; selectedStage: string; setSelectedStage: (name: string) => void; queries: Query[]; filteredQueries: Query[]; queryFilter: QueryFilter; setQueryFilter: (filter: QueryFilter) => void; querySearch: string; setQuerySearch: (value: string) => void; openQuery: (query: Query) => void; showNotice: (message: string) => void; activity: typeof initialActivity; setDialog: (dialog: DialogName) => void }) {
  return <div className="mx-auto max-w-[1520px] px-5 py-7 md:px-9 md:py-9">
    <section className="flex flex-col justify-between gap-6 border-b border-border pb-7 xl:flex-row xl:items-end"><div><div className="mb-3 flex items-center gap-2"><span className="h-2 w-2 bg-success-foreground" /><span className="audit-label text-success-foreground">Active engagement</span><span className="bg-success px-2 py-1 text-[10px] font-bold text-success-foreground">{currentEngagement.status.toUpperCase()}</span></div><h1 className="max-w-3xl text-3xl font-black tracking-tight text-foreground md:text-[42px] md:leading-[1.08]">{currentEngagement.client} <span className="font-normal text-muted-foreground">/ {currentEngagement.year}</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Engagement control center · statutory audit · reporting under Ind AS</p></div><div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => setDialog("engagements")}><FolderKanban size={15} className="text-primary" /> {currentEngagement.code} <ChevronDown size={14} className="text-muted-foreground" /></Button><Button onClick={() => setDialog("query")}><Plus size={15} /> New query</Button></div></section>
    <section className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4"><Metric label="Overall materiality" value="₹75.00L" sub="Approved · 14 Aug 2026" icon={Gauge} /><Metric label="Performance materiality" value="₹56.25L" sub="75% of overall" icon={SlidersHorizontal} /><Metric label="Open queries" value={String(queries.filter((query) => query.status !== "Closed").length + 14)} sub="3 high risk · 5 awaiting" icon={AlertTriangle} accent="warning" /><Metric label="Completion" value={`${currentEngagement.progress}%`} sub="Target freeze · 24 Sep" icon={CheckCircle2} accent="success" progress={currentEngagement.progress} /></section>
    <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><div className="audit-label">Controlled lifecycle</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">Engagement progress</h2></div><div className="hidden items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:flex"><span className="flex items-center gap-1.5"><i className="h-2 w-2 bg-success-foreground" /> Complete</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 bg-warning-foreground" /> Attention</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 border border-border bg-surface" /> Pending</span></div></div><div className="audit-panel overflow-x-auto"><div className="flex min-w-[1120px] items-start px-5 py-6">{stages.map((stage, index) => { const Icon = stage.icon; return <div key={stage.name} className="flex min-w-[96px] flex-1 items-start"><div className="flex min-w-0 flex-1 flex-col items-center text-center"><Button variant="ghost" onClick={() => setSelectedStage(stage.name)} className={`audit-focus-ring relative h-10 w-10 rounded-none border-2 p-0 transition-all ${selectedStage === stage.name ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--color-secondary)] hover:bg-primary" : stage.state === "complete" ? "border-success-foreground bg-success text-success-foreground hover:bg-success" : stage.state === "attention" ? "border-warning-foreground bg-warning text-warning-foreground hover:bg-warning" : "border-border bg-surface-strong text-muted-foreground hover:bg-surface-strong"}`} title={`Open ${stage.name}`}><Icon size={17} strokeWidth={2} /></Button><div className={`mt-3 text-[10px] font-extrabold leading-4 ${selectedStage === stage.name ? "text-primary" : "text-foreground"}`}>{stage.name}</div><div className="mt-1 whitespace-nowrap text-[9px] text-muted-foreground">{stage.detail}</div></div>{index < stages.length - 1 && <div className={`mt-5 h-px flex-1 ${stage.state === "complete" ? "bg-success-foreground/45" : "bg-border"}`} />}</div>; })}</div></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><CircleDot size={13} className="text-primary" /><span>Current stage:</span><strong className="text-foreground">{selectedStage}</strong><ArrowRight size={13} /><span>{stages.find((stage) => stage.name === selectedStage)?.detail}</span><Button variant="link" size="sm" onClick={() => setSelectedStage(selectedStage)}>Open stage</Button></div></section>
    <section className="mt-5 grid gap-2 border border-border bg-surface p-2 sm:grid-cols-3"><Button variant="ghost" className="justify-start rounded-none" onClick={() => setDialog("materiality")}><Gauge className="text-primary" /> Materiality file <ArrowRight className="ml-auto" /></Button><Button variant="ghost" className="justify-start rounded-none" onClick={() => setDialog("hours")}><Clock3 className="text-info-foreground" /> Log audit hours <ArrowRight className="ml-auto" /></Button><Button variant="ghost" className="justify-start rounded-none" onClick={() => setDialog("document")}><Upload className="text-success-foreground" /> Add evidence <ArrowRight className="ml-auto" /></Button></section>
    <section className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]"><div className="min-w-0"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><div className="audit-label">Attention required</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">Query & finding queue</h2></div><Button variant="link" size="sm" onClick={() => showNotice("Use Work queue for the complete register")}>View all <ArrowRight size={14} /></Button></div><div className="mb-3 flex items-center gap-2 border-b border-border"><Filter size={14} className="mr-1 shrink-0 text-muted-foreground" />{(["All open", "High risk", "Awaiting mgmt", "Partner review"] as QueryFilter[]).map((filter) => <Button key={filter} variant="ghost" onClick={() => setQueryFilter(filter)} className={`h-auto rounded-none border-b-2 px-3 py-2 text-[11px] font-bold ${queryFilter === filter ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{filter}</Button>)}<div className="ml-auto hidden items-center gap-2 sm:flex"><Search size={13} className="text-muted-foreground" /><Input aria-label="Search queries" value={querySearch} onChange={(event) => setQuerySearch(event.target.value)} placeholder="Search" className="h-7 w-28 border-0 px-0 shadow-none" /></div></div><div className="audit-panel overflow-hidden">{filteredQueries.map((query) => <QueryRow key={query.id} query={query} onClick={() => openQuery(query)} />)}{filteredQueries.length === 0 && <EmptyState label="No queries match this filter" action="Clear filters" onClick={() => { setQueryFilter("All open"); setQuerySearch(""); }} />}</div><div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>Showing {filteredQueries.length} of {queries.length + 14} tracked queries</span><Button variant="link" size="sm" onClick={() => { setQueryFilter("All open"); setQuerySearch(""); }}><X size={12} /> Clear filters</Button></div></div><div><div className="mb-4"><div className="audit-label">Control signals</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">File health</h2></div><div className="audit-panel divide-y divide-border"><HealthRow icon={Clock3} label="Overdue work items" value="04" detail="2 queries · 2 review notes" tone="danger" onClick={() => setDialog("health")} /><HealthRow icon={Paperclip} label="Evidence gaps" value="07" detail="Across 4 audit areas" tone="warning" onClick={() => setDialog("health")} /><HealthRow icon={ClipboardCheck} label="Review notes" value="06" detail="1 overdue · 5 open" tone="info" onClick={() => setDialog("health")} /><HealthRow icon={ShieldCheck} label="Partner decisions" value="03" detail="Awaiting sign-off" tone="success" onClick={() => setDialog("health")} /></div><div className="mb-4 mt-8"><div className="audit-label">Recent activity</div><h2 className="mt-2 text-xl font-extrabold tracking-tight">Team feed</h2></div><div className="audit-panel divide-y divide-border">{activity.slice(0, 3).map((item) => <ActivityItem key={`${item.initials}-${item.text}`} item={item} />)}<Button variant="ghost" onClick={() => setDialog("activity")} className="audit-focus-ring flex h-auto w-full justify-center rounded-none px-4 py-3 text-[10px] font-bold text-primary">Open activity log <ArrowRight size={13} /></Button></div></div></section>
    <section className="mt-9 border border-primary/20 bg-primary px-5 py-5 text-primary-foreground md:flex md:items-center md:justify-between md:px-7"><div className="flex items-start gap-4"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-primary-foreground/15"><LockKeyhole size={16} /></div><div><div className="text-sm font-bold">File freeze readiness</div><p className="mt-1 text-xs leading-5 text-primary-foreground/70">18 open queries and 6 review notes still require resolution before the audit file can be frozen.</p></div></div><Button variant="outline" onClick={() => setDialog("freeze")} className="mt-4 shrink-0 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground md:mt-0">Open checklist <ArrowRight size={14} /></Button></section>
  </div>;
}

function WorkspaceView({ activeNav, currentEngagement, engagements, hours, totalHours, documents, openNav, setDialog, showNotice, setDocuments }: { activeNav: string; currentEngagement: Engagement; engagements: Engagement[]; hours: TimeEntry[]; totalHours: number; documents: string[]; openNav: (label: string) => void; setDialog: (dialog: DialogName) => void; showNotice: (message: string) => void; setDocuments: (documents: string[]) => void }) {
  const defaultCopy = { eyebrow: "Portfolio control", title: "Engagements", description: "Create, switch and monitor the audit files your firm is responsible for." };
  const viewCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
    "Engagements": defaultCopy,
    "Work queue": { eyebrow: "Delivery control", title: "Work queue", description: "Track audit hours and move open work items through their next action." },
    "Review notes": { eyebrow: "Review control", title: "Review notes", description: "Keep reviewer requests, preparer responses and sign-offs in one place." },
    "Documents": { eyebrow: "Evidence control", title: "Documents", description: "Keep the evidence index aligned to the active engagement and its audit areas." },
    "Reports": { eyebrow: "Management", title: "Reports", description: "Generate a review-ready snapshot of progress, hours, findings and file health." },
    "Firm & access": { eyebrow: "Administration", title: "Firm & access", description: "Manage the people and roles that can work on this engagement." },
  };
  const copy = viewCopy[activeNav] ?? defaultCopy;
  return <div className="mx-auto max-w-[1240px] px-5 py-7 md:px-9 md:py-9"><section className="flex flex-col justify-between gap-6 border-b border-border pb-7 md:flex-row md:items-end"><div><div className="audit-label text-primary">{copy.eyebrow}</div><h1 className="mt-3 text-3xl font-black tracking-tight md:text-[42px]">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.description} <span className="font-semibold text-foreground">{currentEngagement.code}</span> · {currentEngagement.client}.</p></div><div className="flex flex-wrap gap-2">{activeNav === "Engagements" && <Button onClick={() => setDialog("engagements")}><Plus /> New engagement</Button>}{activeNav === "Work queue" && <Button onClick={() => setDialog("hours")}><Clock3 /> Log hours</Button>}{activeNav === "Documents" && <Button onClick={() => setDialog("document")}><Upload /> Add evidence</Button>}{activeNav === "Reports" && <Button onClick={() => showNotice("Report prepared for download")}><Download /> Export snapshot</Button>}</div></section>
    {activeNav === "Engagements" && <EngagementsPanel engagements={engagements} currentEngagement={currentEngagement} setDialog={setDialog} />}
    {activeNav === "Work queue" && <WorkQueuePanel hours={hours} totalHours={totalHours} setDialog={setDialog} openNav={openNav} />}
    {activeNav === "Review notes" && <ReviewNotesPanel showNotice={showNotice} />}
    {activeNav === "Documents" && <DocumentsPanel documents={documents} setDialog={setDialog} setDocuments={setDocuments} showNotice={showNotice} />}
    {activeNav === "Reports" && <ReportsPanel showNotice={showNotice} />}
    {activeNav === "Firm & access" && <AccessPanel showNotice={showNotice} />}
  </div>;
}

function EngagementsPanel({ engagements, currentEngagement, setDialog }: { engagements: Engagement[]; currentEngagement: Engagement; setDialog: (dialog: DialogName) => void }) { return <div className="mt-8 audit-panel overflow-hidden"><div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] border-b border-border bg-surface-strong px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><span>Client / code</span><span>Financial year</span><span>Status</span><span>Progress</span><span /></div>{engagements.map((engagement) => <Button key={engagement.code} variant="ghost" onClick={() => setDialog("engagements")} className="grid h-auto w-full grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] items-center rounded-none border-b border-border px-5 py-5 text-left last:border-0 hover:bg-surface-strong"><div><div className="text-sm font-bold">{engagement.client}</div><div className="mt-1 text-[10px] font-bold tracking-wider text-muted-foreground">{engagement.code}{engagement.code === currentEngagement.code && <span className="ml-2 text-primary">ACTIVE</span>}</div></div><span className="text-xs text-muted-foreground">{engagement.year}</span><span className="text-xs font-semibold">{engagement.status}</span><div><div className="text-xs font-bold">{engagement.progress}%</div><div className="mt-1 h-1.5 w-24 bg-secondary"><div className="h-full bg-success-foreground" style={{ width: `${engagement.progress}%` }} /></div></div><ArrowRight size={16} className="text-muted-foreground" /></Button>)}</div>; }

function WorkQueuePanel({ hours, totalHours, setDialog, openNav }: { hours: TimeEntry[]; totalHours: number; setDialog: (dialog: DialogName) => void; openNav: (label: string) => void }) { return <div className="mt-8 space-y-8"><div className="grid gap-px border border-border bg-border sm:grid-cols-3"><Metric label="Hours this period" value={`${totalHours.toFixed(1)}h`} sub="Across active engagement" icon={Clock3} /><Metric label="Billable hours" value={`${hours.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}h`} sub="100% of logged time" icon={CheckCircle2} accent="success" /><Metric label="Next action" value="12" sub="Open items assigned" icon={Inbox} accent="warning" /></div><div className="flex items-center justify-between"><div><div className="audit-label">Time records</div><h2 className="mt-2 text-xl font-extrabold">Audit hours</h2></div><Button variant="outline" onClick={() => setDialog("hours")}><Plus /> Add entry</Button></div><div className="audit-panel overflow-hidden"><div className="grid grid-cols-[0.8fr_0.8fr_1.8fr_0.5fr_0.6fr_auto] border-b border-border bg-surface-strong px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><span>Date</span><span>Area</span><span>Description</span><span>Hours</span><span>Type</span><span /></div>{hours.map((entry) => <div key={entry.id} className="grid grid-cols-[0.8fr_0.8fr_1.8fr_0.5fr_0.6fr_auto] items-center border-b border-border px-5 py-4 text-xs last:border-0"><span className="text-muted-foreground">{entry.date}</span><span className="font-semibold">{entry.area}</span><span>{entry.description}</span><span className="font-bold">{entry.hours.toFixed(2)}</span><span className={entry.billable ? "text-success-foreground" : "text-muted-foreground"}>{entry.billable ? "Billable" : "Non-billable"}</span><ArrowRight size={15} className="text-muted-foreground" /></div>)}</div><Button variant="link" onClick={() => openNav("Overview")}>Return to engagement overview <ArrowRight /></Button></div>; }

function ReviewNotesPanel({ showNotice }: { showNotice: (message: string) => void }) { const notes = [{ id: "RN-008", title: "Update going concern conclusion for revised forecast", owner: "AK", status: "Returned to preparer", age: "1d" }, { id: "RN-006", title: "Attach signed representation letter to completion section", owner: "SN", status: "Open", age: "3d" }, { id: "RN-004", title: "Explain variance in receivables ageing", owner: "RM", status: "Cleared", age: "5d" }]; return <div className="mt-8 audit-panel divide-y divide-border">{notes.map((note) => <div key={note.id} className="flex flex-wrap items-center gap-4 px-5 py-5"><div className="flex h-9 w-9 items-center justify-center bg-info text-[10px] font-black text-info-foreground">{note.owner}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black tracking-wider text-muted-foreground">{note.id}</span><span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${note.status === "Cleared" ? "bg-success text-success-foreground" : note.status === "Open" ? "bg-warning text-warning-foreground" : "bg-danger text-danger-foreground"}`}>{note.status}</span></div><div className="mt-1 text-sm font-bold">{note.title}</div><div className="mt-1 text-[10px] text-muted-foreground">Owner · {note.owner} · {note.age} open</div></div><Button variant="outline" size="sm" onClick={() => showNotice(`${note.id} opened for review`)}>Open note <ArrowRight /></Button></div>)}</div>; }

function DocumentsPanel({ documents, setDialog, setDocuments, showNotice }: { documents: string[]; setDialog: (dialog: DialogName) => void; setDocuments: (documents: string[]) => void; showNotice: (message: string) => void }) { return <div className="mt-8"><div className="mb-4 flex items-center justify-between"><div><div className="audit-label">Evidence index</div><h2 className="mt-2 text-xl font-extrabold">Engagement documents</h2></div><span className="text-xs text-muted-foreground">{documents.length} indexed files</span></div><div className="audit-panel divide-y divide-border">{documents.map((document) => <div key={document} className="flex items-center gap-3 px-5 py-4"><div className="flex h-9 w-9 items-center justify-center bg-secondary text-secondary-foreground"><FileText size={16} /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{document}</div><div className="mt-1 text-[10px] text-muted-foreground">Northstar Components · Evidence · Available</div></div><Button variant="ghost" size="icon" aria-label={`Download ${document}`} onClick={() => showNotice(`${document} download prepared`)}><Download /></Button><ArrowRight size={16} className="text-muted-foreground" /></div>)}<Button variant="ghost" onClick={() => setDialog("document")} className="h-auto w-full justify-center rounded-none px-5 py-4 text-xs font-bold text-primary"><Plus /> Add another document</Button></div><div className="mt-4 text-xs text-muted-foreground">Documents are indexed to the active engagement and can be attached to queries or review notes.</div></div>; }

function ReportsPanel({ showNotice }: { showNotice: (message: string) => void }) { const reports = [{ title: "Engagement status snapshot", detail: "Progress, open items and freeze readiness", icon: LayoutDashboard }, { title: "SA 450 misstatement summary", detail: "Known, likely and projected misstatements", icon: AlertTriangle }, { title: "Time and budget analysis", detail: "Billable hours by audit area and team member", icon: Clock3 }]; return <div className="mt-8 grid gap-4 md:grid-cols-3">{reports.map((report) => { const Icon = report.icon; return <div key={report.title} className="audit-panel p-5"><Icon size={20} className="text-primary" /><h2 className="mt-5 text-sm font-extrabold">{report.title}</h2><p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{report.detail}</p><Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => showNotice(`${report.title} prepared`)}><Download /> Prepare report</Button></div>; })}</div>; }

function AccessPanel({ showNotice }: { showNotice: (message: string) => void }) { const people = [{ initials: "AM", name: "Ananya Mehta", role: "Engagement partner", access: "Owner" }, { initials: "AK", name: "Aarav Kapoor", role: "Senior manager", access: "Reviewer" }, { initials: "SN", name: "Sana Nair", role: "Audit associate", access: "Preparer" }, { initials: "RM", name: "Rohan Mehta", role: "Audit associate", access: "Preparer" }]; return <div className="mt-8 audit-panel divide-y divide-border"><div className="flex items-center justify-between px-5 py-4"><div><div className="audit-label">Engagement team</div><h2 className="mt-2 text-lg font-extrabold">People and permissions</h2></div><Button onClick={() => showNotice("Invite flow opened")}><Plus /> Invite member</Button></div>{people.map((person) => <div key={person.name} className="flex items-center gap-3 px-5 py-4"><div className="flex h-9 w-9 items-center justify-center bg-secondary text-[10px] font-black text-secondary-foreground">{person.initials}</div><div className="min-w-0 flex-1"><div className="text-sm font-bold">{person.name}</div><div className="mt-1 text-[10px] text-muted-foreground">{person.role}</div></div><span className="bg-surface-strong px-2 py-1 text-[10px] font-bold text-muted-foreground">{person.access}</span><Button variant="ghost" size="sm" onClick={() => showNotice(`${person.name}'s access opened`)}>Manage</Button></div>)}</div>; }

function QueryRow({ query, onClick }: { query: Query; onClick: () => void }) { const tone = toneStyles[query.tone]; return <Button variant="ghost" onClick={onClick} className="audit-focus-ring flex h-auto w-full items-center gap-3 rounded-none border-b border-border px-4 py-4 text-left last:border-0 hover:bg-surface-strong md:gap-4 md:px-5"><div className={`hidden h-9 w-1 shrink-0 md:block ${tone.bar}`} /><div className={`flex h-9 w-9 shrink-0 items-center justify-center text-[10px] font-black ${tone.avatar}`}>{query.owner}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black tracking-wider text-muted-foreground">{query.id}</span><span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${tone.badge}`}>{query.risk}</span></div><div className="mt-1 truncate text-xs font-bold text-foreground md:text-sm">{query.title}</div><div className="mt-1 text-[10px] text-muted-foreground">{query.area} · {query.age} open</div></div><div className="hidden min-w-[140px] text-right sm:block"><div className="text-[10px] font-bold text-foreground">{query.status}</div><div className="mt-1 text-[10px] text-muted-foreground">Owner · {query.owner}</div></div><ArrowRight size={16} className="shrink-0 text-muted-foreground" /></Button>; }

function Metric({ label, value, sub, icon: Icon, accent = "primary", progress }: { label: string; value: string; sub: string; icon: IconType; accent?: string; progress?: number }) { const color = accent === "warning" ? "text-warning-foreground" : accent === "success" ? "text-success-foreground" : "text-primary"; return <div className="bg-surface px-4 py-5 md:px-6"><div className="flex items-center justify-between"><span className="audit-label">{label}</span><Icon size={16} className={color} /></div><div className="mt-3 flex items-end justify-between gap-2"><strong className="text-2xl font-black tracking-tight">{value}</strong>{progress !== undefined && <div className="mb-1 h-1.5 w-16 bg-secondary"><div className="h-full bg-success-foreground" style={{ width: `${progress}%` }} /></div>}</div><p className="mt-1 text-[10px] text-muted-foreground">{sub}</p></div>; }

function HealthRow({ icon: Icon, label, value, detail, tone, onClick }: { icon: IconType; label: string; value: string; detail: string; tone: QueryTone; onClick: () => void }) { const styles = toneStyles[tone]; return <Button variant="ghost" onClick={onClick} className="flex h-auto w-full items-center gap-3 rounded-none px-4 py-4 text-left hover:bg-surface-strong"><div className={`flex h-8 w-8 shrink-0 items-center justify-center ${styles.avatar}`}><Icon size={15} className={styles.icon} /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{label}</div><div className="mt-1 truncate text-[10px] text-muted-foreground">{detail}</div></div><strong className={`text-xl font-black ${styles.icon}`}>{value}</strong><ArrowRight size={14} className="text-muted-foreground" /></Button>; }

function ActivityItem({ item }: { item: (typeof initialActivity)[number] }) { const styles = toneStyles[item.color]; return <div className="flex gap-3 px-4 py-4"><div className={`flex h-7 w-7 shrink-0 items-center justify-center text-[9px] font-black ${styles.avatar}`}>{item.initials}</div><div className="min-w-0"><p className="text-xs leading-5 text-foreground"><strong>{item.initials === "CA" ? "CA Ananya" : item.initials === "SN" ? "Sana Nair" : item.initials === "RM" ? "Rohan Mehta" : "Ananya Mehta"}</strong> {item.text}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.time}</p></div></div>; }

function EmptyState({ label, action, onClick }: { label: string; action: string; onClick: () => void }) { return <div className="px-5 py-12 text-center"><p className="text-sm font-semibold">{label}</p><Button variant="link" size="sm" onClick={onClick}>{action}</Button></div>; }

function SearchDialog({ querySearch, setQuerySearch, queries, openQuery, closeDialog }: { querySearch: string; setQuerySearch: (value: string) => void; queries: Query[]; openQuery: (query: Query) => void; closeDialog: () => void }) { const results = queries.filter((query) => `${query.id} ${query.title} ${query.area}`.toLowerCase().includes(querySearch.toLowerCase())).slice(0, 5); return <><DialogHeader><DialogTitle>Search workspace</DialogTitle><DialogDescription>Find an engagement query by reference, title or audit area.</DialogDescription></DialogHeader><div className="flex items-center gap-2"><Search size={16} className="text-muted-foreground" /><Input autoFocus value={querySearch} onChange={(event) => setQuerySearch(event.target.value)} placeholder="Try Q-024 or inventory" /></div><div className="divide-y divide-border border border-border">{results.map((query) => <Button key={query.id} variant="ghost" onClick={() => { openQuery(query); }} className="h-auto w-full justify-start rounded-none px-3 py-3 text-left"><div><div className="text-[10px] font-black tracking-wider text-muted-foreground">{query.id} · {query.area}</div><div className="mt-1 text-xs font-bold">{query.title}</div></div><ArrowRight className="ml-auto" /></Button>)}{results.length === 0 && <div className="px-3 py-6 text-center text-xs text-muted-foreground">No matching work items.</div>}</div><DialogFooter><Button variant="outline" onClick={closeDialog}>Close</Button></DialogFooter></>; }

function NotificationsDialog({ activity, closeDialog }: { activity: typeof initialActivity; closeDialog: () => void }) { return <><DialogHeader><DialogTitle>Notifications</DialogTitle><DialogDescription>Three activity updates need your attention.</DialogDescription></DialogHeader><div className="divide-y divide-border border-y border-border">{activity.slice(0, 3).map((item) => <ActivityItem key={`${item.initials}-${item.text}`} item={item} />)}</div><DialogFooter><Button onClick={closeDialog}>Mark all as read</Button></DialogFooter></>; }

function AccountDialog({ openNav, closeDialog }: { openNav: (label: string) => void; closeDialog: () => void }) { return <><DialogHeader><DialogTitle>Account menu</DialogTitle><DialogDescription>CA Ananya Mehta · Engagement partner</DialogDescription></DialogHeader><div className="grid gap-2"><Button variant="outline" className="justify-start" onClick={() => { closeDialog(); openNav("Firm & access"); }}><Users /> Firm & access</Button><Button variant="outline" className="justify-start" onClick={() => closeDialog()}><ShieldCheck /> Security and session</Button><Button variant="outline" className="justify-start" onClick={() => closeDialog()}><LockKeyhole /> Sign out</Button></div></>; }

function EngagementDialog({ engagements, currentEngagement, selectEngagement, draft, setDraft, onCreate }: { engagements: Engagement[]; currentEngagement: Engagement; selectEngagement: (engagement: Engagement) => void; draft: { client: string; code: string; year: string }; setDraft: (draft: { client: string; code: string; year: string }) => void; onCreate: (event: FormEvent<HTMLFormElement>) => void }) { return <><DialogHeader><DialogTitle>Switch engagement</DialogTitle><DialogDescription>Select an audit file or create a new one for the firm workspace.</DialogDescription></DialogHeader><div className="divide-y divide-border border-y border-border">{engagements.map((engagement) => <Button key={engagement.code} variant="ghost" onClick={() => selectEngagement(engagement)} className="h-auto w-full justify-start rounded-none px-3 py-3 text-left"><FolderKanban className={engagement.code === currentEngagement.code ? "text-primary" : "text-muted-foreground"} /><div className="min-w-0 flex-1"><div className="text-xs font-bold">{engagement.client}</div><div className="mt-1 text-[10px] text-muted-foreground">{engagement.code} · {engagement.year}</div></div>{engagement.code === currentEngagement.code && <Check size={15} className="text-primary" />}</Button>)}</div><div className="border-t border-border pt-4"><div className="audit-label mb-3">Create engagement</div><form onSubmit={onCreate} className="grid gap-3"><Input required placeholder="Client name" value={draft.client} onChange={(event) => setDraft({ ...draft, client: event.target.value })} /><Input required placeholder="Engagement code, e.g. ENG-26-001" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} /><Input placeholder="Financial year" value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value })} /><Button type="submit"><Plus /> Create engagement</Button></form></div></>; }

function QueryForm({ draft, setDraft, onSubmit }: { draft: { title: string; area: string; risk: string; owner: string; description: string }; setDraft: (draft: { title: string; area: string; risk: string; owner: string; description: string }) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <><DialogHeader><DialogTitle>New audit query</DialogTitle><DialogDescription>Create a work item and route it to the senior review queue.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="grid gap-4"><div><label className="audit-label">Query title</label><Input required className="mt-2" placeholder="What needs to be resolved?" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div><div className="grid gap-3 sm:grid-cols-3"><div><label className="audit-label">Audit area</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })}><option>Revenue</option><option>Payables</option><option>Inventory</option><option>Related parties</option><option>Tax</option></select></div><div><label className="audit-label">Risk</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={draft.risk} onChange={(event) => setDraft({ ...draft, risk: event.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></div><div><label className="audit-label">Owner initials</label><Input className="mt-2" maxLength={3} value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} /></div></div><div><label className="audit-label">Context</label><Textarea className="mt-2" placeholder="Add the context the preparer or reviewer needs." value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div><DialogFooter><Button type="submit"><Plus /> Create query</Button></DialogFooter></form></>; }

function QueryDetail({ query, updateStatus, closeDialog }: { query: Query; updateStatus: (status: string) => void; closeDialog: () => void }) { return <><DialogHeader><div className="flex items-center gap-2"><span className="audit-label">{query.id}</span><span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${toneStyles[query.tone].badge}`}>{query.risk} risk</span></div><DialogTitle className="mt-2">{query.title}</DialogTitle><DialogDescription>{query.area} · Owner {query.owner} · {query.age} open</DialogDescription></DialogHeader><div className="border-y border-border py-4"><div className="audit-label">Current status</div><div className="mt-2 text-sm font-bold">{query.status}</div><p className="mt-3 text-xs leading-5 text-muted-foreground">Capture management’s response, attach evidence and move the query forward when the audit evidence supports a conclusion.</p></div><DialogFooter className="gap-2 sm:justify-between"><Button variant="outline" onClick={() => updateStatus("Awaiting management")}>Request response</Button><div className="flex gap-2"><Button variant="outline" onClick={() => updateStatus("Closed")}>Close query</Button><Button onClick={() => updateStatus("Partner review")}>Send to review <ArrowRight /></Button></div></DialogFooter></>; }

function MaterialityForm({ materiality, setMateriality, overall, performance, trivial, closeDialog, showNotice }: { materiality: { benchmark: string; amount: string; percentage: string; performance: string; trivial: string; inherent: string; control: string; detection: string; rationale: string }; setMateriality: (value: { benchmark: string; amount: string; percentage: string; performance: string; trivial: string; inherent: string; control: string; detection: string; rationale: string }) => void; overall: number; performance: number; trivial: number; closeDialog: () => void; showNotice: (message: string) => void }) { const update = (key: keyof typeof materiality, value: string) => setMateriality({ ...materiality, [key]: value }); return <><DialogHeader><DialogTitle>ICAI materiality determination</DialogTitle><DialogDescription>Planning materiality is calculated from the selected benchmark. Save a new working version before partner approval.</DialogDescription></DialogHeader><div className="grid gap-4"><div className="grid gap-3 sm:grid-cols-2"><div><label className="audit-label">Benchmark</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={materiality.benchmark} onChange={(event) => update("benchmark", event.target.value)}><option>Revenue</option><option>Total assets</option><option>Profit before tax</option><option>Net assets</option></select></div><div><label className="audit-label">Benchmark amount (₹)</label><Input className="mt-2" type="number" value={materiality.amount} onChange={(event) => update("amount", event.target.value)} /></div></div><div className="grid gap-3 sm:grid-cols-3"><div><label className="audit-label">Percentage</label><Input className="mt-2" type="number" step="0.1" value={materiality.percentage} onChange={(event) => update("percentage", event.target.value)} /></div><div><label className="audit-label">Performance %</label><Input className="mt-2" type="number" value={materiality.performance} onChange={(event) => update("performance", event.target.value)} /></div><div><label className="audit-label">Trivial %</label><Input className="mt-2" type="number" value={materiality.trivial} onChange={(event) => update("trivial", event.target.value)} /></div></div><div className="grid grid-cols-3 gap-px border border-border bg-border"><Calculation label="Overall materiality" value={overall} /><Calculation label="Performance materiality" value={performance} /><Calculation label="Clearly trivial" value={trivial} /></div><div className="grid gap-3 sm:grid-cols-3">{(["inherent", "control", "detection"] as const).map((risk) => <div key={risk}><label className="audit-label">{risk} risk</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={materiality[risk]} onChange={(event) => update(risk, event.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></div>)}</div><div><label className="audit-label">Professional judgement rationale</label><Textarea className="mt-2" value={materiality.rationale} onChange={(event) => update("rationale", event.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button onClick={() => { closeDialog(); showNotice("Materiality working version saved"); }}><Check /> Save working version</Button></DialogFooter></>; }

function Calculation({ label, value }: { label: string; value: number }) { return <div className="bg-surface px-3 py-3"><div className="audit-label">{label}</div><div className="mt-2 text-sm font-black">₹{value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div></div>; }

function HoursForm({ draft, setDraft, onSubmit }: { draft: { date: string; area: string; description: string; hours: string; billable: boolean }; setDraft: (draft: { date: string; area: string; description: string; hours: string; billable: boolean }) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <><DialogHeader><DialogTitle>Log audit hours</DialogTitle><DialogDescription>Record time against an audit area. Hours can be edited while they remain in draft.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="grid gap-4"><div className="grid gap-3 sm:grid-cols-2"><div><label className="audit-label">Work date</label><Input required className="mt-2" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></div><div><label className="audit-label">Hours</label><Input required className="mt-2" type="number" min="0.25" max="24" step="0.25" placeholder="0.00" value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })} /></div></div><div><label className="audit-label">Audit area</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })}><option>Planning</option><option>Revenue</option><option>Payables</option><option>Inventory</option><option>Audit completion</option></select></div><div><label className="audit-label">Work performed</label><Textarea required className="mt-2" placeholder="Describe the work performed" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={draft.billable} onChange={(event) => setDraft({ ...draft, billable: event.target.checked })} /> Billable time</label><DialogFooter><Button type="submit"><Check /> Save time entry</Button></DialogFooter></form></>; }

function DocumentForm({ setDocuments, closeDialog, showNotice }: { setDocuments: (documents: string[]) => void; closeDialog: () => void; showNotice: (message: string) => void }) { return <><DialogHeader><DialogTitle>Add evidence</DialogTitle><DialogDescription>Index a support file to the active engagement. The file name is added to the evidence register.</DialogDescription></DialogHeader><div className="border border-dashed border-border p-8 text-center"><Upload className="mx-auto text-primary" /><label className="mt-3 block cursor-pointer text-sm font-bold text-primary">Choose a file<input className="sr-only" type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setDocuments([file.name, "Bank reconciliation support.pdf", "Inventory ageing 31 Mar.xlsx", "Board minutes — Q4.pdf"]); closeDialog(); showNotice(`${file.name} added to the evidence index`); } }} /></label><p className="mt-2 text-xs text-muted-foreground">PDF, XLSX, DOCX · max 25 MB</p></div><DialogFooter><Button variant="outline" onClick={closeDialog}>Cancel</Button></DialogFooter></>; }

function StageDialog({ stage, closeDialog, setDialog }: { stage: (typeof stages)[number]; closeDialog: () => void; setDialog: (dialog: DialogName) => void }) { const Icon = stage.icon; return <><DialogHeader><div className="flex h-10 w-10 items-center justify-center bg-secondary text-secondary-foreground"><Icon size={18} /></div><DialogTitle className="mt-3">{stage.name}</DialogTitle><DialogDescription>{stage.detail} · controlled lifecycle step</DialogDescription></DialogHeader><div className="border-y border-border py-4"><div className="audit-label">Next action</div><p className="mt-2 text-sm leading-6">Review the linked work items, confirm the evidence is complete and record the stage decision in the audit trail.</p></div><DialogFooter><Button variant="outline" onClick={closeDialog}>Close</Button>{stage.name === "Risk & materiality" ? <Button onClick={() => setDialog("materiality")}>Open materiality file <ArrowRight /></Button> : stage.name === "File freeze" ? <Button onClick={() => setDialog("freeze")}>Open freeze checklist <ArrowRight /></Button> : <Button onClick={closeDialog}>Mark next action <Check /></Button>}</DialogFooter></>; }

function FreezeDialog({ closeDialog, showNotice }: { closeDialog: () => void; showNotice: (message: string) => void }) { const [checks, setChecks] = useState([false, false, false]); const items = ["Open queries and findings resolved or concluded", "Review notes cleared and partner decisions recorded", "Evidence index complete with final conclusion support"]; const ready = checks.every(Boolean); return <><DialogHeader><DialogTitle>File freeze checklist</DialogTitle><DialogDescription>All controls must be confirmed before the engagement can be locked.</DialogDescription></DialogHeader><div className="divide-y divide-border border-y border-border">{items.map((item, index) => <label key={item} className="flex cursor-pointer items-start gap-3 px-1 py-4 text-sm"><input type="checkbox" checked={checks[index]} onChange={(event) => setChecks((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} className="mt-0.5" /><span>{item}</span></label>)}</div><DialogFooter><Button variant="outline" onClick={closeDialog}>Keep working</Button><Button disabled={!ready} onClick={() => { closeDialog(); showNotice("Freeze request submitted for partner sign-off"); }}><LockKeyhole /> Request file freeze</Button></DialogFooter></>; }

function ActivityDialog({ activity, closeDialog }: { activity: typeof initialActivity; closeDialog: () => void }) { return <><DialogHeader><DialogTitle>Activity log</DialogTitle><DialogDescription>Recent immutable actions in this engagement.</DialogDescription></DialogHeader><div className="max-h-80 divide-y divide-border overflow-y-auto border-y border-border">{[...activity, { initials: "CA", text: "approved the current materiality version", time: "Yesterday", color: "success" as const }, { initials: "SN", text: "logged 3.5 hours to Revenue", time: "Yesterday", color: "info" as const }].map((item, index) => <ActivityItem key={`${item.text}-${index}`} item={item} />)}</div><DialogFooter><Button onClick={closeDialog}>Done</Button></DialogFooter></>; }

function HealthDialog({ title, closeDialog }: { title: string; closeDialog: () => void }) { return <><DialogHeader><DialogTitle>File health detail</DialogTitle><DialogDescription>{title || "Control signal"} · Northstar Components</DialogDescription></DialogHeader><div className="border-y border-border py-5"><div className="text-3xl font-black">Action list</div><p className="mt-2 text-sm leading-6 text-muted-foreground">This signal groups the open work items that need attention. Open the work queue or review notes view to assign the next action and record completion.</p></div><DialogFooter><Button onClick={closeDialog}>Done</Button></DialogFooter></>; }