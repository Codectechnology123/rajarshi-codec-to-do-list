import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp, ArrowLeft, ArrowRight, CalendarDays, Check, CheckCheck,
  Circle, ClipboardList, Clock3, Filter, LogOut, Plus, Search, ShieldCheck,
  Sparkles, Trash2, X
} from "lucide-react";
import { request } from "./api";

const STATUSES = ["Pending", "In-Progress", "Completed"];
const emptyForm = { title: "", description: "", status: "Pending", dueDate: "" };

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const result = await request(`/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", body: JSON.stringify(fields) });
      localStorage.setItem("daymark_token", result.token);
      onAuth(result.user);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="brand brand-light"><span className="brand-mark"><CheckCheck size={19}/></span><span>daymark<span className="brand-dot">.</span></span></div>
        <div className="story-copy">
          <span className="eyebrow"><Sparkles size={14}/> MAKE ROOM FOR WHAT MATTERS</span>
          <h1>A little more<br/><em>done</em> each day.</h1>
          <p>A calm space for your tasks, your plans, and the next small win.</p>
          <div className="story-note"><span className="note-icon"><Check size={17}/></span><span><strong>Small steps add up.</strong><br/>Keep moving, one task at a time.</span></div>
        </div>
        <div className="story-footer">A simple tool for a clearer day.</div>
        <div className="decor-circle decor-one"/><div className="decor-circle decor-two"/>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand brand"><span className="brand-mark"><CheckCheck size={19}/></span><span>daymark<span className="brand-dot">.</span></span></div>
        <div className="auth-card">
          <span className="eyebrow muted">{mode === "login" ? "WELCOME BACK" : "YOUR NEXT CHAPTER"}</span>
          <h2>{mode === "login" ? "Sign in to your space" : "Create your account"}</h2>
          <p className="auth-subtitle">{mode === "login" ? "Pick up right where you left off." : "A fresh start is just a few details away."}</p>
          <form onSubmit={submit} className="form-stack">
            {mode === "register" && <label>Your name<input autoComplete="name" required minLength="2" maxLength="60" value={fields.name} onChange={e=>setFields({...fields,name:e.target.value})} placeholder="Rajarshi" /></label>}
            <label>Email address<input type="email" autoComplete="email" required value={fields.email} onChange={e=>setFields({...fields,email:e.target.value})} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength="8" maxLength="72" value={fields.password} onChange={e=>setFields({...fields,password:e.target.value})} placeholder="At least 8 characters" /></label>
            {error && <div className="alert" role="alert">{error}</div>}
            <button className="button button-primary full-width" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={17}/></button>
          </form>
          <div className="auth-switch">{mode === "login" ? "New around here?" : "Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>{mode==="login"?"Create an account":"Sign in"}</button></div>
          <div className="privacy-note"><ShieldCheck size={15}/> Your tasks stay private to your account.</div>
        </div>
      </section>
    </main>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? { title: task.title, description: task.description || "", status: task.status, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0,10) : "" } : emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setBusy(true);
    try { await onSave({ ...form, dueDate: form.dueDate || null }); onClose(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-header"><div><span className="eyebrow muted">{task ? "REFINE YOUR PLAN" : "MAKE A LITTLE PROGRESS"}</span><h2 id="task-modal-title">{task ? "Edit task" : "Add a new task"}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={19}/></button></div>
        <form className="form-stack" onSubmit={submit}>
          <label>Task title<input autoFocus required minLength="2" maxLength="120" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="What needs to get done?" /></label>
          <label>Description <span className="optional">Optional</span><textarea rows="3" maxLength="1000" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Add a few helpful details…" /></label>
          <div className="form-row">
            <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label>
            <label>Due date <span className="optional">Optional</span><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label>
          </div>
          {error && <div className="alert" role="alert">{error}</div>}
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : task ? "Save changes" : "Create task"} <ArrowRight size={16}/></button></div>
        </form>
      </section>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatus }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <article className={`task-card ${task.status === "Completed" ? "task-complete" : ""}`}>
      <button className={`task-check ${task.status === "Completed" ? "checked" : ""}`} aria-label={task.status === "Completed" ? "Mark pending" : "Mark completed"} onClick={()=>onStatus(task,task.status === "Completed" ? "Pending" : "Completed")}>{task.status === "Completed" ? <Check size={16}/> : <Circle size={19}/>}</button>
      <button className="task-main" onClick={()=>onEdit(task)} aria-label={`Edit ${task.title}`}>
        <span className="task-title">{task.title}</span>
        {task.description && <span className="task-description">{task.description}</span>}
        <span className="task-meta"><span className={`status-pill status-${task.status.toLowerCase().replace("-","")}`}><span/> {task.status}</span><span className="task-date"><CalendarDays size={13}/>{formatDate(task.dueDate)}</span></span>
      </button>
      <div className="task-actions"><button className="icon-button" title="Edit task" onClick={()=>onEdit(task)}><ClipboardList size={17}/></button>{confirming ? <span className="confirm-delete"><button onClick={()=>onDelete(task._id)} className="text-danger">Delete</button><button onClick={()=>setConfirming(false)} className="icon-button"><X size={15}/></button></span> : <button className="icon-button" title="Delete task" onClick={()=>setConfirming(true)}><Trash2 size={16}/></button>}</div>
    </article>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pages: 1, page: 1 });
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalTask, setModalTask] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("daymark_token");
    if (!token) { setChecking(false); return; }
    request("/auth/me").then(result=>{if(active)setUser(result.user);}).catch(()=>localStorage.removeItem("daymark_token")).finally(()=>{if(active)setChecking(false);});
    return ()=>{active=false;};
  }, []);

  useEffect(() => { const timer = setTimeout(()=>setDebouncedSearch(search.trim()), 250); return ()=>clearTimeout(timer); }, [search]);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setBusy(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "8", sort });
      if (status !== "All") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const result = await request(`/tasks?${params.toString()}`);
      setTasks(result.tasks); setStats(result.pagination);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }, [user, page, sort, status, debouncedSearch]);

  useEffect(()=>{loadTasks();},[loadTasks]);

  const visibleCounts = useMemo(()=>({
    total: stats.total,
    completed: tasks.filter(t=>t.status==="Completed").length,
    pending: tasks.filter(t=>t.status==="Pending").length
  }),[tasks,stats.total]);

  async function saveTask(data) {
    const editing = modalTask && modalTask !== "new";
    await request(editing ? `/tasks/${modalTask._id}` : "/tasks", { method: editing ? "PATCH" : "POST", body: JSON.stringify(data) });
    setNotice(editing ? "Task updated successfully." : "New task added. Nice work!");
    if (!editing) setPage(1);
    await loadTasks();
  }

  async function deleteTask(id) {
    try { await request(`/tasks/${id}`,{method:"DELETE"}); setNotice("Task deleted."); await loadTasks(); }
    catch(err) { setError(err.message); }
  }

  async function changeStatus(task, nextStatus) {
    try { await request(`/tasks/${task._id}`,{method:"PATCH",body:JSON.stringify({status:nextStatus})}); setNotice(`Moved to ${nextStatus.toLowerCase()}.`); await loadTasks(); }
    catch(err) { setError(err.message); }
  }

  function logout() { localStorage.removeItem("daymark_token"); setUser(null); setTasks([]); setNotice(""); }
  const openNew = () => setModalTask("new");
  const activeLabel = status === "All" ? "All tasks" : status;

  if (checking) return <div className="loading-screen"><div className="brand"><span className="brand-mark"><CheckCheck size={19}/></span><span>daymark<span className="brand-dot">.</span></span></div><div className="loading-line"/></div>;
  if (!user) return <AuthScreen onAuth={setUser}/>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><CheckCheck size={19}/></span><span>daymark<span className="brand-dot">.</span></span></div>
        <div className="sidebar-label">WORKSPACE</div>
        <button className={`nav-item ${status==="All"?"nav-active":""}`} onClick={()=>{setStatus("All");setPage(1);}}><ClipboardList size={18}/> All tasks <span className="nav-count">{stats.total}</span></button>
        <div className="sidebar-label sidebar-label-spaced">YOUR FLOW</div>
        {STATUSES.map((item,i)=><button key={item} className={`nav-item ${status===item?"nav-active":""}`} onClick={()=>{setStatus(item);setPage(1);}}><span className={`nav-status nav-status-${i}`}/>{item}</button>)}
        <div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={16}/><strong>One thing at a time.</strong><p>Progress is progress, no matter how small.</p></div><div className="profile-row"><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div><div className="profile-text"><strong>{user.name}</strong><span>{user.email}</span></div><button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{activeLabel}</strong></div><div className="topbar-right"><span className="today-label"><CalendarDays size={15}/>{new Intl.DateTimeFormat("en",{weekday:"short",month:"short",day:"numeric"}).format(new Date())}</span><button className="avatar avatar-small" title={user.name}>{user.name.slice(0,1).toUpperCase()}</button></div></header>
        <div className="page-content">
          <section className="welcome-row"><div><div className="eyebrow muted"><Sparkles size={14}/> YOUR PERSONAL SPACE</div><h1>Make today <em>count.</em></h1><p>A clear mind starts with a clear list.</p></div><button className="button button-primary" onClick={openNew}><Plus size={18}/> Add a task</button></section>
          <section className="summary-grid">
            <div className="summary-card summary-total"><div className="summary-icon"><ClipboardList size={18}/></div><span className="summary-label">Tasks in view</span><strong>{visibleCounts.total}</strong><span className="summary-foot">Matching your current filters</span></div>
            <div className="summary-card"><div className="summary-icon icon-pending"><Clock3 size={18}/></div><span className="summary-label">Pending on this page</span><strong>{visibleCounts.pending}</strong><span className="summary-foot">Ready for your next step</span></div>
            <div className="summary-card"><div className="summary-icon icon-done"><CheckCheck size={18}/></div><span className="summary-label">Completed on this page</span><strong>{visibleCounts.completed}</strong><span className="summary-foot">Every win counts</span></div>
          </section>
          <section className="tasks-section">
            <div className="section-heading"><div><h2>Your task list <span className="count-badge">{stats.total}</span></h2><p>Keep it simple. Keep it moving.</p></div><button className="button button-outline" onClick={openNew}><Plus size={16}/> New task</button></div>
            <div className="toolbar"><div className="search-box"><Search size={17}/><input aria-label="Search tasks" placeholder="Search your tasks…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/><kbd>⌘ K</kbd></div><label className="select-control"><Filter size={15}/><select aria-label="Filter by status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="All">All statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label><label className="select-control"><ArrowDownUp size={15}/><select aria-label="Sort tasks" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="dueDate">Due date</option><option value="title">Title A–Z</option><option value="status">Status</option></select></label></div>
            {notice && <div className="notice"><Check size={15}/>{notice}<button aria-label="Dismiss message" onClick={()=>setNotice("")}><X size={14}/></button></div>}
            {error && <div className="alert page-alert" role="alert">{error}<button onClick={()=>setError("")} aria-label="Dismiss error"><X size={15}/></button></div>}
            <div className="task-list">
              {busy && tasks.length===0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><strong>Loading your tasks…</strong><p>Just a moment.</p></div> :
                tasks.length ? tasks.map(task=><TaskCard key={task._id} task={task} onEdit={setModalTask} onDelete={deleteTask} onStatus={changeStatus}/>) :
                <div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><strong>{debouncedSearch || status!=="All" ? "No tasks match just yet" : "A fresh page awaits"}</strong><p>{debouncedSearch || status!=="All" ? "Try changing your search or filters." : "Add your first task and start building momentum."}</p>{!debouncedSearch && status==="All" && <button className="button button-primary" onClick={openNew}><Plus size={16}/> Add your first task</button>}</div>}
            </div>
            <div className="pagination"><span>Showing <strong>{stats.total===0?0:Math.min((page-1)*8+1,stats.total)}–{Math.min(page*8,stats.total)}</strong> of <strong>{stats.total}</strong> tasks</span><div className="page-buttons"><button className="icon-button" aria-label="Previous page" disabled={page<=1||busy} onClick={()=>setPage(p=>p-1)}><ArrowLeft size={16}/></button><span>Page <strong>{page}</strong> of <strong>{stats.pages}</strong></span><button className="icon-button" aria-label="Next page" disabled={page>=stats.pages||busy} onClick={()=>setPage(p=>p+1)}><ArrowRight size={16}/></button></div></div>
          </section>
          <footer className="page-footer"><span>Made for a little more focus <span className="footer-heart">♥</span></span><span>DAYMARK · YOUR DAY, YOUR PACE</span></footer>
        </div>
      </main>
      {modalTask !== undefined && <TaskModal task={modalTask==="new"?null:modalTask} onClose={()=>setModalTask(undefined)} onSave={saveTask}/>}
    </div>
  );
}
