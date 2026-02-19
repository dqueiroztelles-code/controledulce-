import { useState, useEffect, useCallback } from "react";

const COLORS = {
  bg: "#0f0f13", surface: "#17171f", surfaceHover: "#1e1e2a",
  border: "#2a2a3a", accent: "#7c6aff", accentLight: "#a594ff", accentDim: "#2a2240",
  green: "#22c55e", greenDim: "#14532d", yellow: "#eab308", yellowDim: "#422006",
  red: "#ef4444", redDim: "#450a0a", blue: "#3b82f6", blueDim: "#1e3a5f",
  text: "#f1f1f5", textMuted: "#888899", textDim: "#555566",
};

const PIPELINE_STAGES = ["Prospecção", "Proposta Enviada", "Negociação", "Fechado", "Perdido"];
const PIPELINE_COLORS = {
  "Prospecção": COLORS.blue, "Proposta Enviada": COLORS.yellow,
  "Negociação": COLORS.accent, "Fechado": COLORS.green, "Perdido": COLORS.red,
};
const PROJECT_STATUS = ["Em andamento", "Pausado", "Concluído"];
const PRIORITY = ["Alta", "Média", "Baixa"];
const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const STORAGE_KEY = "gestor_freelancer_v2";
async function loadData() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveData(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
const defaultData = () => ({ clients: [], projects: [], pipeline: [], tasks: [], expenses: [], goals: [] });

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";
const fmtMoney = (v) => (parseFloat(String(v).replace(",", ".")) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parseMoney = (v) => parseFloat(String(v).replace(",", ".")) || 0;
const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
const isToday = (d) => d && new Date(d + "T00:00:00").toDateString() === new Date().toDateString();

// ---- UI primitives ----
const Badge = ({ label, color, bg }) => (
  <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:700, letterSpacing:0.5, color:color||COLORS.text, background:bg||COLORS.accentDim }}>{label}</span>
);
const Pill = ({ status }) => {
  const map = { "Em andamento":[COLORS.blue,COLORS.blueDim], "Pausado":[COLORS.yellow,COLORS.yellowDim], "Concluído":[COLORS.green,COLORS.greenDim], "Alta":[COLORS.red,COLORS.redDim], "Média":[COLORS.yellow,COLORS.yellowDim], "Baixa":[COLORS.green,COLORS.greenDim] };
  const [c,bg] = map[status]||[COLORS.textMuted,COLORS.border];
  return <Badge label={status} color={c} bg={bg} />;
};
const Btn = ({ children, onClick, variant="primary", small, style:s }) => {
  const base = { border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, padding:small?"6px 14px":"10px 20px", fontSize:small?12:14, transition:"all 0.15s", fontFamily:"inherit" };
  const variants = { primary:{background:COLORS.accent,color:"#fff"}, ghost:{background:"transparent",color:COLORS.textMuted,border:`1px solid ${COLORS.border}`}, danger:{background:COLORS.redDim,color:COLORS.red,border:`1px solid ${COLORS.red}33`} };
  return <button onClick={onClick} style={{...base,...variants[variant],...s}}>{children}</button>;
};
const Input = ({ label, value, onChange, type="text", placeholder, options, required }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ display:"block", fontSize:12, color:COLORS.textMuted, marginBottom:5, fontWeight:600 }}>{label}{required&&" *"}</label>}
    {options ? (
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:14, outline:"none", fontFamily:"inherit" }}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", padding:"9px 12px", borderRadius:8, boxSizing:"border-box", background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:14, outline:"none", fontFamily:"inherit" }} />
    )}
  </div>
);
const Card = ({ children, onClick, style:s }) => (
  <div onClick={onClick} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:18, cursor:onClick?"pointer":"default", transition:"all 0.15s", ...s }}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.borderColor=COLORS.accent)}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.borderColor=COLORS.border)}
  >{children}</div>
);
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:28, width:"min(500px,94vw)", maxHeight:"88vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ margin:0, color:COLORS.text, fontSize:18 }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", color:COLORS.textMuted, fontSize:20, cursor:"pointer" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);
const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign:"center", padding:"36px 20px", color:COLORS.textDim }}>
    <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
    <div style={{ fontSize:13 }}>{text}</div>
  </div>
);
const MiniBar = ({ value, max, color }) => (
  <div style={{ height:6, background:COLORS.border, borderRadius:3, overflow:"hidden", flex:1 }}>
    <div style={{ height:"100%", width:`${max>0?Math.min(100,(value/max)*100):0}%`, background:color||COLORS.accent, borderRadius:3, transition:"width 0.4s" }} />
  </div>
);

// ---- MAIN APP ----
export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData().then(d => { setData(d || defaultData()); setLoading(false); }); }, []);
  const update = useCallback((fn) => { setData(prev => { const next = fn(prev); saveData(next); return next; }); }, []);

  if (loading) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:COLORS.bg }}>
      <div style={{ color:COLORS.textMuted }}>Carregando...</div>
    </div>
  );

  const tabs = [
    { id:"dashboard", label:"Dashboard" }, { id:"projetos", label:"Projetos" },
    { id:"clientes", label:"Clientes" }, { id:"pipeline", label:"Pipeline" },
    { id:"tarefas", label:"Tarefas" }, { id:"financeiro", label:"Financeiro" },
    { id:"insights", label:"Insights & Metas" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.text, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;} input::placeholder,textarea::placeholder{color:#555566;} select option{background:#17171f;}
        ::-webkit-scrollbar{width:6px;height:6px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px;}
        .hrow:hover{background:#1e1e2a!important;}
      `}</style>

      {/* Sidebar */}
      <div style={{ position:"fixed", left:0, top:0, bottom:0, width:220, background:COLORS.surface, borderRight:`1px solid ${COLORS.border}`, display:"flex", flexDirection:"column", padding:"24px 0", zIndex:100 }}>
        <div style={{ padding:"0 20px 24px" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:COLORS.accent, marginBottom:2 }}>FREELANCER</div>
          <div style={{ fontSize:19, fontWeight:800 }}>Gestão Pro</div>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", padding:"10px 20px", background:tab===t.id?COLORS.accentDim:"transparent", border:"none", borderLeft:`3px solid ${tab===t.id?COLORS.accent:"transparent"}`, color:tab===t.id?COLORS.accentLight:COLORS.textMuted, cursor:"pointer", fontSize:13, fontWeight:tab===t.id?700:500, textAlign:"left", width:"100%", transition:"all 0.15s", fontFamily:"inherit" }}>
            {t.label}
          </button>
        ))}
        <div style={{ marginTop:"auto", padding:"0 20px", fontSize:11, color:COLORS.textDim }}>
          {data.projects.filter(p=>p.status==="Em andamento").length} projetos ativos
        </div>
      </div>

      <div style={{ marginLeft:220, padding:"32px 36px", minHeight:"100vh" }}>
        {tab==="dashboard"  && <Dashboard data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="projetos"   && <Projetos  data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="clientes"   && <Clientes  data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="pipeline"   && <Pipeline  data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="tarefas"    && <Tarefas   data={data} update={update} />}
        {tab==="financeiro" && <Financeiro data={data} update={update} />}
        {tab==="insights"   && <Insights  data={data} update={update} />}
      </div>

      {modal==="new-project"   && <ProjectModal data={data} onClose={()=>setModal(null)} onSave={p=>{update(d=>({...d,projects:[...d.projects,{...p,id:uid(),createdAt:new Date().toISOString()}]}));setModal(null);}} />}
      {modal==="edit-project"  && selected && <ProjectModal data={data} initial={selected} onClose={()=>{setModal(null);setSelected(null);}} onSave={p=>{update(d=>({...d,projects:d.projects.map(x=>x.id===selected.id?{...x,...p}:x)}));setModal(null);setSelected(null);}} />}
      {modal==="new-client"    && <ClientModal onClose={()=>setModal(null)} onSave={c=>{update(d=>({...d,clients:[...d.clients,{...c,id:uid()}]}));setModal(null);}} />}
      {modal==="edit-client"   && selected && <ClientModal initial={selected} onClose={()=>{setModal(null);setSelected(null);}} onSave={c=>{update(d=>({...d,clients:d.clients.map(x=>x.id===selected.id?{...x,...c}:x)}));setModal(null);setSelected(null);}} />}
      {modal==="new-pipeline"  && <PipelineModal onClose={()=>setModal(null)} onSave={p=>{update(d=>({...d,pipeline:[...d.pipeline,{...p,id:uid()}]}));setModal(null);}} />}
      {modal==="edit-pipeline" && selected && <PipelineModal initial={selected} onClose={()=>{setModal(null);setSelected(null);}} onSave={p=>{update(d=>({...d,pipeline:d.pipeline.map(x=>x.id===selected.id?{...x,...p}:x)}));setModal(null);setSelected(null);}} />}
      {modal==="new-task"      && <TaskModal data={data} onClose={()=>setModal(null)} onSave={t=>{update(d=>({...d,tasks:[...d.tasks,{...t,id:uid(),done:false}]}));setModal(null);}} />}
      {modal==="view-project"  && selected && <ProjectDetail project={selected} data={data} update={update} onEdit={()=>setModal("edit-project")} onClose={()=>{setModal(null);setSelected(null);}} />}
    </div>
  );
}

function TaskRow({ task, data, update, highlight }) {
  const proj = data.projects.find(p=>p.id===task.projectId);
  return (
    <div className="hrow" style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 6px", borderRadius:8, marginBottom:4, borderLeft:`3px solid ${highlight==="red"?COLORS.red:"transparent"}` }}>
      <input type="checkbox" checked={task.done} onChange={()=>update(d=>({...d,tasks:d.tasks.map(t=>t.id===task.id?{...t,done:!t.done}:t)}))} style={{ accentColor:COLORS.accent, width:16, height:16, cursor:"pointer", flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, textDecoration:task.done?"line-through":"none", color:task.done?COLORS.textDim:COLORS.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{task.title}</div>
        {proj && <div style={{ fontSize:11, color:COLORS.textDim }}>{proj.name}</div>}
      </div>
      <div style={{ fontSize:11, color:isOverdue(task.due)?COLORS.red:COLORS.textDim, flexShrink:0 }}>{task.due?fmt(task.due):""}</div>
    </div>
  );
}

// ---- Dashboard ----
function Dashboard({ data, setModal, setSelected, update }) {
  const today=data.tasks.filter(t=>!t.done&&isToday(t.due));
  const overdue=data.tasks.filter(t=>!t.done&&isOverdue(t.due));
  const active=data.projects.filter(p=>p.status==="Em andamento");
  const pipeOpen=data.pipeline.filter(p=>p.stage!=="Fechado"&&p.stage!=="Perdido");
  const receita=data.projects.filter(p=>p.value&&p.status==="Concluído").reduce((a,p)=>a+parseMoney(p.value),0);
  const stat=(label,val,color,sub)=>(
    <Card style={{ flex:1, minWidth:130 }}>
      <div style={{ fontSize:24, fontWeight:800, color:color||COLORS.accent }}>{val}</div>
      <div style={{ fontSize:12, color:COLORS.textMuted, marginTop:3 }}>{label}</div>
      {sub&&<div style={{ fontSize:10, color:COLORS.textDim, marginTop:3 }}>{sub}</div>}
    </Card>
  );
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:26, fontWeight:800 }}>Bom dia 👋</h1>
        <div style={{ color:COLORS.textMuted, marginTop:4, fontSize:14 }}>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
        {stat("Projetos Ativos", active.length, COLORS.accent)}
        {stat("Tarefas Hoje", today.length, COLORS.blue)}
        {stat("Atrasadas", overdue.length, overdue.length>0?COLORS.red:COLORS.green)}
        {stat("Pipeline Aberto", pipeOpen.length, COLORS.yellow)}
        {stat("Receita Realizada", `R$ ${fmtMoney(receita)}`, COLORS.green, "projetos concluídos")}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>🔥 Tarefas do Dia</div>
            <Btn small variant="ghost" onClick={()=>setModal("new-task")}>+ Nova</Btn>
          </div>
          {today.length===0&&overdue.length===0?<EmptyState icon="✓" text="Nenhuma tarefa para hoje!" />
            :[...overdue.slice(0,3).map(t=>({...t,_ov:true})),...today].slice(0,6).map(t=><TaskRow key={t.id} task={t} data={data} update={update} highlight={t._ov?"red":null} />)}
        </Card>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>🚀 Projetos Ativos</div>
            <Btn small variant="ghost" onClick={()=>setModal("new-project")}>+ Novo</Btn>
          </div>
          {active.length===0?<EmptyState icon="◈" text="Nenhum projeto ativo ainda." />
            :active.slice(0,5).map(p=>{
              const tasks=data.tasks.filter(t=>t.projectId===p.id);
              const pct=tasks.length>0?Math.round((tasks.filter(t=>t.done).length/tasks.length)*100):0;
              return (
                <div key={p.id} onClick={()=>{setSelected(p);setModal("view-project");}} className="hrow" style={{ padding:"10px 6px", borderRadius:8, cursor:"pointer", marginBottom:2 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{p.name}</div>
                    <Pill status={p.priority} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <MiniBar value={pct} max={100} />
                    <div style={{ fontSize:11, color:COLORS.textDim, flexShrink:0 }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
        </Card>
      </div>
    </div>
  );
}

// ---- Projetos ----
function Projetos({ data, setModal, setSelected, update }) {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter==="Todos"?data.projects:data.projects.filter(p=>p.status===filter);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Projetos</h1>
        <Btn onClick={()=>setModal("new-project")}>+ Novo Projeto</Btn>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["Todos",...PROJECT_STATUS].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:filter===s?COLORS.accent:COLORS.surface, color:filter===s?"#fff":COLORS.textMuted, fontFamily:"inherit" }}>{s}</button>
        ))}
      </div>
      {filtered.length===0?<EmptyState icon="◈" text="Nenhum projeto aqui ainda." />
        :<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
          {filtered.map(p=>{
            const tasks=data.tasks.filter(t=>t.projectId===p.id);
            const done=tasks.filter(t=>t.done).length;
            const pct=tasks.length>0?Math.round((done/tasks.length)*100):0;
            return (
              <Card key={p.id} onClick={()=>{setSelected(p);setModal("view-project");}}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <Pill status={p.status} />
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn small variant="ghost" onClick={e=>{e.stopPropagation();setSelected(p);setModal("edit-project");}} style={{ padding:"4px 8px" }}>✏️</Btn>
                    <Btn small variant="danger" onClick={e=>{e.stopPropagation();update(d=>({...d,projects:d.projects.filter(x=>x.id!==p.id)}));}} style={{ padding:"4px 8px" }}>✕</Btn>
                  </div>
                </div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:13, color:COLORS.textMuted, marginBottom:12 }}>{p.client||"Sem cliente"}</div>
                {tasks.length>0&&<div style={{ marginBottom:10 }}><div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}><MiniBar value={pct} max={100} /><div style={{ fontSize:11, color:COLORS.textDim }}>{done}/{tasks.length}</div></div></div>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <Pill status={p.priority} />
                  <div style={{ fontSize:12, color:isOverdue(p.deadline)?COLORS.red:COLORS.textMuted }}>{p.deadline?fmt(p.deadline):"Sem prazo"}</div>
                </div>
                {p.value&&<div style={{ marginTop:8, fontSize:13, color:COLORS.green, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(p.value)}</div>}
              </Card>
            );
          })}
        </div>}
    </div>
  );
}

function ProjectDetail({ project, data, update, onEdit, onClose }) {
  const [newTask,setNewTask]=useState(""); const [taskDue,setTaskDue]=useState("");
  const tasks=data.tasks.filter(t=>t.projectId===project.id);
  const add=()=>{ if(!newTask.trim())return; update(d=>({...d,tasks:[...d.tasks,{id:uid(),title:newTask,due:taskDue||null,projectId:project.id,done:false}]})); setNewTask("");setTaskDue(""); };
  return (
    <Modal title={project.name} onClose={onClose}>
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}><Pill status={project.status} /><Pill status={project.priority} />{project.deadline&&<Badge label={`Prazo: ${fmt(project.deadline)}`} color={isOverdue(project.deadline)?COLORS.red:COLORS.textMuted} bg={isOverdue(project.deadline)?COLORS.redDim:COLORS.border} />}</div>
        {project.client&&<div style={{ fontSize:13, color:COLORS.textMuted }}>Cliente: {project.client}</div>}
        {project.value&&<div style={{ fontSize:14, color:COLORS.green, fontFamily:"'DM Mono',monospace", marginTop:4 }}>R$ {fmtMoney(project.value)}</div>}
        {project.notes&&<div style={{ fontSize:13, color:COLORS.textMuted, marginTop:10, lineHeight:1.6 }}>{project.notes}</div>}
      </div>
      <div style={{ borderTop:`1px solid ${COLORS.border}`, paddingTop:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, marginBottom:12 }}>Tarefas ({tasks.length})</div>
        {tasks.map(t=><TaskRow key={t.id} task={t} data={data} update={update} />)}
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Nova tarefa..." style={{ flex:1, padding:"8px 12px", borderRadius:8, background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:13, outline:"none", fontFamily:"inherit" }} />
          <input type="date" value={taskDue} onChange={e=>setTaskDue(e.target.value)} style={{ padding:"8px", borderRadius:8, background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:12, outline:"none" }} />
          <Btn small onClick={add}>+</Btn>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Btn onClick={onEdit}>Editar</Btn>
        <Btn variant="danger" onClick={()=>{update(d=>({...d,projects:d.projects.filter(x=>x.id!==project.id)}));onClose();}}>Excluir</Btn>
      </div>
    </Modal>
  );
}

// ---- Clientes ----
function Clientes({ data, setModal, setSelected, update }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Clientes</h1>
        <Btn onClick={()=>setModal("new-client")}>+ Novo Cliente</Btn>
      </div>
      {data.clients.length===0?<EmptyState icon="◉" text="Nenhum cliente cadastrado ainda." />
        :<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {data.clients.map(c=>{
            const projs=data.projects.filter(p=>p.client===c.name);
            const receita=projs.filter(p=>p.value&&p.status==="Concluído").reduce((a,p)=>a+parseMoney(p.value),0);
            return (
              <Card key={c.id}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:COLORS.accentDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:COLORS.accent }}>{c.name?.[0]?.toUpperCase()||"?"}</div>
                  <div style={{ display:"flex",gap:6 }}>
                    <Btn small variant="ghost" onClick={()=>{setSelected(c);setModal("edit-client");}} style={{ padding:"4px 8px" }}>✏️</Btn>
                    <Btn small variant="danger" onClick={()=>update(d=>({...d,clients:d.clients.filter(x=>x.id!==c.id)}))} style={{ padding:"4px 8px" }}>✕</Btn>
                  </div>
                </div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{c.name}</div>
                {c.segment&&<div style={{ fontSize:12,color:COLORS.textMuted,marginBottom:8 }}>{c.segment}</div>}
                {c.email&&<div style={{ fontSize:12,color:COLORS.textMuted }}>✉ {c.email}</div>}
                {c.whatsapp&&<div style={{ fontSize:12,color:COLORS.textMuted }}>📱 {c.whatsapp}</div>}
                {receita>0&&<div style={{ fontSize:13,color:COLORS.green,fontFamily:"'DM Mono',monospace",marginTop:8 }}>R$ {fmtMoney(receita)} faturado</div>}
                {projs.length>0&&<div style={{ marginTop:10,paddingTop:10,borderTop:`1px solid ${COLORS.border}` }}>
                  {projs.slice(0,3).map(p=><div key={p.id} style={{ fontSize:12,color:COLORS.textMuted,display:"flex",alignItems:"center",gap:6,marginBottom:4 }}><Pill status={p.status} /><span>{p.name}</span></div>)}
                </div>}
              </Card>
            );
          })}
        </div>}
    </div>
  );
}

// ---- Pipeline ----
function Pipeline({ data, setModal, setSelected, update }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Pipeline</h1>
        <Btn onClick={()=>setModal("new-pipeline")}>+ Novo Lead</Btn>
      </div>
      <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:16 }}>
        {PIPELINE_STAGES.map(stage=>{
          const items=data.pipeline.filter(p=>p.stage===stage);
          const color=PIPELINE_COLORS[stage];
          const total=items.reduce((a,p)=>a+parseMoney(p.value),0);
          return (
            <div key={stage} style={{ minWidth:210, flex:"0 0 210px" }}>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:1 }}>{stage}</div>
                  <Badge label={items.length} color={color} bg={color+"22"} />
                </div>
                {total>0&&<div style={{ fontSize:10, color:COLORS.textDim, marginTop:2, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(total)}</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {items.map(p=>(
                  <Card key={p.id} style={{ borderTop:`3px solid ${color}` }}>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{p.name}</div>
                    {p.client&&<div style={{ fontSize:12, color:COLORS.textMuted, marginBottom:6 }}>{p.client}</div>}
                    {p.value&&<div style={{ fontSize:13, color:COLORS.green, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>R$ {fmtMoney(p.value)}</div>}
                    {p.nextAction&&<div style={{ fontSize:11, color:COLORS.textMuted, marginBottom:8, padding:"5px 8px", background:COLORS.bg, borderRadius:6 }}>→ {p.nextAction}</div>}
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn small variant="ghost" onClick={()=>{setSelected(p);setModal("edit-pipeline");}} style={{ padding:"4px 8px", fontSize:11 }}>Editar</Btn>
                      <Btn small variant="danger" onClick={()=>update(d=>({...d,pipeline:d.pipeline.filter(x=>x.id!==p.id)}))} style={{ padding:"4px 8px" }}>✕</Btn>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Tarefas ----
function Tarefas({ data, update }) {
  const [filter, setFilter] = useState("todas");
  const [show, setShow] = useState(false);
  const all=data.tasks;
  const filtered=filter==="todas"?all:filter==="hoje"?all.filter(t=>!t.done&&isToday(t.due)):filter==="atrasadas"?all.filter(t=>!t.done&&isOverdue(t.due)):all.filter(t=>t.done);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Tarefas</h1>
        <Btn onClick={()=>setShow(true)}>+ Nova Tarefa</Btn>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["todas","Todas"],["hoje","Hoje"],["atrasadas","Atrasadas"],["feitas","Concluídas"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{ padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:filter===id?COLORS.accent:COLORS.surface, color:filter===id?"#fff":COLORS.textMuted, fontFamily:"inherit" }}>{label}</button>
        ))}
      </div>
      <Card>{filtered.length===0?<EmptyState icon="◻" text="Nenhuma tarefa aqui." />:filtered.map(t=><TaskRow key={t.id} task={t} data={data} update={update} highlight={isOverdue(t.due)?"red":null} />)}</Card>
      {show&&<TaskModal data={data} onClose={()=>setShow(false)} onSave={t=>{update(d=>({...d,tasks:[...d.tasks,{...t,id:uid(),done:false}]}));setShow(false);}} />}
    </div>
  );
}

// ---- FINANCEIRO ----
function Financeiro({ data, update }) {
  const [showExp, setShowExp] = useState(false);
  const [editExp, setEditExp] = useState(null);
  const now = new Date();
  const [vm, setVm] = useState(now.getMonth());
  const [vy, setVy] = useState(now.getFullYear());
  const expenses = data.expenses||[];

  const getMonthOf = (p) => {
    const d=p.deadline||p.createdAt?.slice(0,10);
    if(!d) return null;
    const dt=new Date(d+(d.length===10?"T00:00:00":""));
    return {m:dt.getMonth(),y:dt.getFullYear()};
  };
  const projDone = data.projects.filter(p=>p.value&&p.status==="Concluído");
  const recMes = projDone.filter(p=>{const dt=getMonthOf(p);return dt&&dt.m===vm&&dt.y===vy;}).reduce((a,p)=>a+parseMoney(p.value),0);
  const expMes = expenses.filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===vm&&dt.getFullYear()===vy;}).reduce((a,e)=>a+parseMoney(e.value),0);
  const recTotal = projDone.reduce((a,p)=>a+parseMoney(p.value),0);
  const expTotal = expenses.reduce((a,e)=>a+parseMoney(e.value),0);
  const aberto = data.projects.filter(p=>p.status==="Em andamento"&&p.value).reduce((a,p)=>a+parseMoney(p.value),0);

  const nav = (d) => { let m=vm+d,y=vy; if(m<0){m=11;y--;} if(m>11){m=0;y++;} setVm(m);setVy(y); };

  const chartMonths = Array.from({length:6},(_,i)=>{ const dt=new Date(vy,vm-5+i,1); return {m:dt.getMonth(),y:dt.getFullYear(),label:MONTHS_PT[dt.getMonth()]}; });
  const chartData = chartMonths.map(({m,y,label})=>({
    label,
    rec: projDone.filter(p=>{const dt=getMonthOf(p);return dt&&dt.m===m&&dt.y===y;}).reduce((a,p)=>a+parseMoney(p.value),0),
    exp: expenses.filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===m&&dt.getFullYear()===y;}).reduce((a,e)=>a+parseMoney(e.value),0),
  }));
  const cMax = Math.max(...chartData.map(d=>Math.max(d.rec,d.exp)),1);

  const expsMes = expenses.filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===vm&&dt.getFullYear()===vy;});

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Financeiro</h1>
        <Btn onClick={()=>setShowExp(true)}>+ Despesa</Btn>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
        {[
          {l:"Receita Total Realizada", v:`R$ ${fmtMoney(recTotal)}`, c:COLORS.green},
          {l:"Despesas Totais", v:`R$ ${fmtMoney(expTotal)}`, c:COLORS.red},
          {l:"Lucro Líquido", v:`R$ ${fmtMoney(recTotal-expTotal)}`, c:recTotal-expTotal>=0?COLORS.accent:COLORS.red},
          {l:"Em Aberto (proj. ativos)", v:`R$ ${fmtMoney(aberto)}`, c:COLORS.yellow},
        ].map(s=>(
          <Card key={s.l} style={{ flex:1, minWidth:150 }}>
            <div style={{ fontSize:18, fontWeight:800, color:s.c, fontFamily:"'DM Mono',monospace" }}>{s.v}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
        <button onClick={()=>nav(-1)} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, color:COLORS.text, cursor:"pointer", padding:"6px 12px", fontFamily:"inherit" }}>←</button>
        <div style={{ fontWeight:700, fontSize:15, minWidth:130, textAlign:"center" }}>{MONTHS_PT[vm]} {vy}</div>
        <button onClick={()=>nav(1)} style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:8, color:COLORS.text, cursor:"pointer", padding:"6px 12px", fontFamily:"inherit" }}>→</button>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        {[
          {l:"Receita no Mês", v:`R$ ${fmtMoney(recMes)}`, c:COLORS.green},
          {l:"Despesas no Mês", v:`R$ ${fmtMoney(expMes)}`, c:COLORS.red},
          {l:"Lucro no Mês", v:`R$ ${fmtMoney(recMes-expMes)}`, c:recMes-expMes>=0?COLORS.accent:COLORS.red},
        ].map(s=>(
          <Card key={s.l} style={{ flex:1, minWidth:140 }}>
            <div style={{ fontSize:20, fontWeight:800, color:s.c, fontFamily:"'DM Mono',monospace" }}>{s.v}</div>
            <div style={{ fontSize:12, color:COLORS.textMuted, marginTop:4 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom:24 }}>
        <div style={{ fontWeight:700, marginBottom:16 }}>Histórico — Últimos 6 Meses</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:110 }}>
          {chartData.map(d=>(
            <div key={d.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:86, width:"100%" }}>
                <div title={`Receita: R$ ${fmtMoney(d.rec)}`} style={{ flex:1, background:COLORS.green+"99", borderRadius:"4px 4px 0 0", height:`${(d.rec/cMax)*100}%`, minHeight:d.rec>0?4:0, transition:"height 0.4s" }} />
                <div title={`Despesa: R$ ${fmtMoney(d.exp)}`} style={{ flex:1, background:COLORS.red+"99", borderRadius:"4px 4px 0 0", height:`${(d.exp/cMax)*100}%`, minHeight:d.exp>0?4:0, transition:"height 0.4s" }} />
              </div>
              <div style={{ fontSize:10, color:COLORS.textDim }}>{d.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}><div style={{ width:10,height:10,background:COLORS.green+"99",borderRadius:2 }} />Receita</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}><div style={{ width:10,height:10,background:COLORS.red+"99",borderRadius:2 }} />Despesas</div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <div style={{ fontWeight:700, marginBottom:14 }}>Despesas — {MONTHS_PT[vm]}</div>
          {expsMes.length===0?<EmptyState icon="💸" text="Nenhuma despesa este mês." />
            :expsMes.map(e=>(
              <div key={e.id} className="hrow" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 6px", borderRadius:8, borderBottom:`1px solid ${COLORS.border}` }}>
                <div><div style={{ fontWeight:600, fontSize:14 }}>{e.description}</div><div style={{ fontSize:11, color:COLORS.textDim }}>{e.category} · {fmt(e.date)}</div></div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", color:COLORS.red, fontSize:13 }}>R$ {fmtMoney(e.value)}</div>
                  <Btn small variant="ghost" onClick={()=>setEditExp(e)} style={{ padding:"3px 8px" }}>✏️</Btn>
                  <Btn small variant="danger" onClick={()=>update(d=>({...d,expenses:d.expenses.filter(x=>x.id!==e.id)}))} style={{ padding:"3px 8px" }}>✕</Btn>
                </div>
              </div>
            ))}
        </Card>
        <Card>
          <div style={{ fontWeight:700, marginBottom:14 }}>Receitas por Projeto — {MONTHS_PT[vm]}</div>
          {projDone.filter(p=>{const dt=getMonthOf(p);return dt&&dt.m===vm&&dt.y===vy;}).length===0
            ?<EmptyState icon="💰" text="Nenhum projeto concluído neste mês." />
            :projDone.filter(p=>{const dt=getMonthOf(p);return dt&&dt.m===vm&&dt.y===vy;}).map(p=>(
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 6px", borderBottom:`1px solid ${COLORS.border}` }}>
                <div><div style={{ fontWeight:600, fontSize:14 }}>{p.name}</div><div style={{ fontSize:11, color:COLORS.textDim }}>{p.client||"—"}</div></div>
                <div style={{ fontFamily:"'DM Mono',monospace", color:COLORS.green, fontSize:13 }}>R$ {fmtMoney(p.value)}</div>
              </div>
            ))}
        </Card>
      </div>

      {showExp&&<ExpenseModal onClose={()=>setShowExp(false)} onSave={e=>{update(d=>({...d,expenses:[...(d.expenses||[]),{...e,id:uid()}]}));setShowExp(false);}} />}
      {editExp&&<ExpenseModal initial={editExp} onClose={()=>setEditExp(null)} onSave={e=>{update(d=>({...d,expenses:d.expenses.map(x=>x.id===editExp.id?{...x,...e}:x)}));setEditExp(null);}} />}
    </div>
  );
}

// ---- INSIGHTS & METAS ----
function Insights({ data, update }) {
  const [showGoal, setShowGoal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const goals = data.goals||[];

  const concluded = data.projects.filter(p=>p.status==="Concluído").length;
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t=>t.done).length;
  const totalRev = data.projects.filter(p=>p.value&&p.status==="Concluído").reduce((a,p)=>a+parseMoney(p.value),0);
  const totalExp = (data.expenses||[]).reduce((a,e)=>a+parseMoney(e.value),0);
  const avgTicket = concluded>0?totalRev/concluded:0;
  const pipeTotal = data.pipeline.length;
  const pipeClosed = data.pipeline.filter(p=>p.stage==="Fechado").length;
  const conv = pipeTotal>0?Math.round((pipeClosed/pipeTotal)*100):0;
  const overdue = data.tasks.filter(t=>!t.done&&isOverdue(t.due)).length;

  const clientRev = data.clients.map(c=>({
    name:c.name,
    rev:data.projects.filter(p=>p.client===c.name&&p.value&&p.status==="Concluído").reduce((a,p)=>a+parseMoney(p.value),0),
    count:data.projects.filter(p=>p.client===c.name).length,
  })).sort((a,b)=>b.rev-a.rev).slice(0,5);
  const maxCR = Math.max(...clientRev.map(c=>c.rev),1);

  const projStats = data.projects.map(p=>{
    const t=data.tasks.filter(x=>x.projectId===p.id);
    return {...p,tt:t.length,td:t.filter(x=>x.done).length};
  }).filter(p=>p.tt>0);

  const resolveGoal = (g) => {
    let cur = parseMoney(g.current||0);
    if(g.type==="receita") cur=totalRev;
    if(g.type==="projetos") cur=concluded;
    if(g.type==="clientes") cur=data.clients.length;
    if(g.type==="pipeline") cur=pipeClosed;
    const tgt=parseMoney(g.target);
    const pct=tgt>0?Math.min(100,Math.round((cur/tgt)*100)):0;
    return {cur,tgt,pct};
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Insights & Metas</h1>
        <Btn onClick={()=>setShowGoal(true)}>+ Nova Meta</Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:14, marginBottom:28 }}>
        {[
          {l:"Taxa Conclusão Projetos", v:`${data.projects.length>0?Math.round((concluded/data.projects.length)*100):0}%`, sub:`${concluded}/${data.projects.length}`, c:COLORS.green},
          {l:"Taxa Conclusão Tarefas", v:`${totalTasks>0?Math.round((doneTasks/totalTasks)*100):0}%`, sub:`${doneTasks}/${totalTasks}`, c:COLORS.accent},
          {l:"Ticket Médio", v:`R$ ${fmtMoney(avgTicket)}`, sub:"por projeto concluído", c:COLORS.yellow},
          {l:"Conversão Pipeline", v:`${conv}%`, sub:`${pipeClosed}/${pipeTotal} leads`, c:COLORS.blue},
          {l:"Tarefas em Atraso", v:overdue, sub:"precisam de atenção", c:overdue>0?COLORS.red:COLORS.green},
          {l:"Margem Líquida", v:`${totalRev>0?Math.round(((totalRev-totalExp)/totalRev)*100):0}%`, sub:`R$ ${fmtMoney(totalRev-totalExp)}`, c:COLORS.accent},
        ].map(k=>(
          <Card key={k.l}>
            <div style={{ fontSize:22, fontWeight:800, color:k.c, fontFamily:"'DM Mono',monospace" }}>{k.v}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, lineHeight:1.4 }}>{k.l}</div>
            <div style={{ fontSize:10, color:COLORS.textDim, marginTop:3 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        <Card>
          <div style={{ fontWeight:700, marginBottom:16 }}>🏆 Top Clientes por Receita</div>
          {clientRev.length===0?<EmptyState icon="◉" text="Nenhum dado ainda." />
            :clientRev.map((c,i)=>(
              <div key={c.name} style={{ marginBottom:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{i+1}. {c.name}</div>
                  <div style={{ fontSize:13, color:COLORS.green, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(c.rev)}</div>
                </div>
                <MiniBar value={c.rev} max={maxCR} color={COLORS.green} />
              </div>
            ))}
        </Card>
        <Card>
          <div style={{ fontWeight:700, marginBottom:16 }}>📊 Progresso por Projeto</div>
          {projStats.length===0?<EmptyState icon="◈" text="Adicione tarefas aos projetos." />
            :projStats.slice(0,6).map(p=>(
              <div key={p.id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{p.name}</div>
                  <div style={{ fontSize:11, color:COLORS.textDim }}>{p.td}/{p.tt}</div>
                </div>
                <MiniBar value={p.td} max={p.tt} color={p.td===p.tt?COLORS.green:COLORS.accent} />
              </div>
            ))}
        </Card>
      </div>

      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:700 }}>🎯 Metas</div>
          <Btn small variant="ghost" onClick={()=>setShowGoal(true)}>+ Meta</Btn>
        </div>
        {goals.length===0?<EmptyState icon="🎯" text="Defina metas para acompanhar seu progresso." />
          :goals.map(g=>{
            const {cur,tgt,pct} = resolveGoal(g);
            const done = pct>=100;
            const isMoneyType = g.type==="receita"||g.type==="custom";
            return (
              <div key={g.id} style={{ marginBottom:18, paddingBottom:18, borderBottom:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{g.title}</div>
                    {g.description&&<div style={{ fontSize:12, color:COLORS.textMuted }}>{g.description}</div>}
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                    {done&&<Badge label="✓ Atingida!" color={COLORS.green} bg={COLORS.greenDim} />}
                    <Btn small variant="ghost" onClick={()=>setEditGoal(g)} style={{ padding:"3px 8px" }}>✏️</Btn>
                    <Btn small variant="danger" onClick={()=>update(d=>({...d,goals:d.goals.filter(x=>x.id!==g.id)}))} style={{ padding:"3px 8px" }}>✕</Btn>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <MiniBar value={cur} max={tgt} color={done?COLORS.green:COLORS.accent} />
                  <div style={{ fontSize:12, color:done?COLORS.green:COLORS.textMuted, fontFamily:"'DM Mono',monospace", flexShrink:0, fontSize:11 }}>
                    {isMoneyType?`R$ ${fmtMoney(cur)} / R$ ${fmtMoney(tgt)}`:`${cur} / ${tgt}`} · {pct}%
                  </div>
                </div>
              </div>
            );
          })}
      </Card>

      {showGoal&&<GoalModal onClose={()=>setShowGoal(false)} onSave={g=>{update(d=>({...d,goals:[...(d.goals||[]),{...g,id:uid()}]}));setShowGoal(false);}} />}
      {editGoal&&<GoalModal initial={editGoal} onClose={()=>setEditGoal(null)} onSave={g=>{update(d=>({...d,goals:d.goals.map(x=>x.id===editGoal.id?{...x,...g}:x)}));setEditGoal(null);}} />}
    </div>
  );
}

// ---- Form Modals ----
function ProjectModal({ data, initial, onClose, onSave }) {
  const [f,setF]=useState({name:"",client:"",status:"Em andamento",priority:"Média",deadline:"",value:"",notes:"",...initial});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Projeto":"Novo Projeto"} onClose={onClose}>
      <Input label="Nome do Projeto" value={f.name} onChange={set("name")} required />
      <Input label="Cliente" value={f.client} onChange={set("client")} options={["",...data.clients.map(c=>c.name)]} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Status" value={f.status} onChange={set("status")} options={PROJECT_STATUS} />
        <Input label="Prioridade" value={f.priority} onChange={set("priority")} options={PRIORITY} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Prazo" value={f.deadline} onChange={set("deadline")} type="date" />
        <Input label="Valor (R$)" value={f.value} onChange={set("value")} placeholder="0,00" />
      </div>
      <Input label="Notas / Escopo" value={f.notes} onChange={set("notes")} placeholder="Descreva o que foi combinado..." />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.name&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}
function ClientModal({ initial, onClose, onSave }) {
  const [f,setF]=useState({name:"",segment:"",email:"",whatsapp:"",notes:"",...initial});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Cliente":"Novo Cliente"} onClose={onClose}>
      <Input label="Nome" value={f.name} onChange={set("name")} required />
      <Input label="Segmento" value={f.segment} onChange={set("segment")} placeholder="Ex: E-commerce, SaaS..." />
      <Input label="Email" value={f.email} onChange={set("email")} type="email" />
      <Input label="WhatsApp" value={f.whatsapp} onChange={set("whatsapp")} placeholder="(11) 99999-9999" />
      <Input label="Notas" value={f.notes} onChange={set("notes")} />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.name&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}
function PipelineModal({ initial, onClose, onSave }) {
  const [f,setF]=useState({name:"",client:"",stage:"Prospecção",value:"",notes:"",nextAction:"",...initial});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Lead":"Novo Lead"} onClose={onClose}>
      <Input label="Nome do Negócio" value={f.name} onChange={set("name")} required />
      <Input label="Contato / Empresa" value={f.client} onChange={set("client")} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Estágio" value={f.stage} onChange={set("stage")} options={PIPELINE_STAGES} />
        <Input label="Valor Estimado (R$)" value={f.value} onChange={set("value")} placeholder="0,00" />
      </div>
      <Input label="Próxima Ação" value={f.nextAction} onChange={set("nextAction")} placeholder="Ex: Enviar proposta quinta" />
      <Input label="Notas" value={f.notes} onChange={set("notes")} />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.name&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}
function TaskModal({ data, onClose, onSave }) {
  const [f,setF]=useState({title:"",projectId:"",due:""});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <Modal title="Nova Tarefa" onClose={onClose}>
      <Input label="Tarefa" value={f.title} onChange={set("title")} required placeholder="O que precisa ser feito?" />
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:12, color:COLORS.textMuted, marginBottom:5, fontWeight:600 }}>Projeto</label>
        <select value={f.projectId} onChange={e=>set("projectId")(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:14, outline:"none", fontFamily:"inherit" }}>
          <option value="">Nenhum</option>
          {data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <Input label="Prazo" value={f.due} onChange={set("due")} type="date" />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.title&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}
function ExpenseModal({ initial, onClose, onSave }) {
  const [f,setF]=useState({description:"",value:"",category:"Ferramentas",date:new Date().toISOString().slice(0,10),...initial});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Despesa":"Nova Despesa"} onClose={onClose}>
      <Input label="Descrição" value={f.description} onChange={set("description")} required placeholder="Ex: Adobe CC, Hosting..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Valor (R$)" value={f.value} onChange={set("value")} placeholder="0,00" />
        <Input label="Categoria" value={f.category} onChange={set("category")} options={["Ferramentas","Software","Marketing","Educação","Infraestrutura","Impostos","Outros"]} />
      </div>
      <Input label="Data" value={f.date} onChange={set("date")} type="date" />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.description&&f.value&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}
function GoalModal({ initial, onClose, onSave }) {
  const [f,setF]=useState({title:"",description:"",type:"receita",target:"",current:"",...initial});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  const types=["receita","projetos","clientes","pipeline","custom"];
  const typeLabels={"receita":"💰 Receita total — atualiza automático","projetos":"✅ Projetos concluídos — automático","clientes":"👥 Total de clientes — automático","pipeline":"🤝 Leads fechados — automático","custom":"🎯 Meta personalizada (manual)"};
  return (
    <Modal title={initial?"Editar Meta":"Nova Meta"} onClose={onClose}>
      <Input label="Título" value={f.title} onChange={set("title")} required placeholder="Ex: Faturar R$ 10.000 este mês" />
      <Input label="Descrição (opcional)" value={f.description} onChange={set("description")} placeholder="Ex: Meta trimestral" />
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:12, color:COLORS.textMuted, marginBottom:5, fontWeight:600 }}>Tipo</label>
        <select value={f.type} onChange={e=>set("type")(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:13, outline:"none", fontFamily:"inherit" }}>
          {types.map(t=><option key={t} value={t}>{typeLabels[t]}</option>)}
        </select>
      </div>
      <Input label={f.type==="receita"||f.type==="custom"?"Alvo (R$)":"Alvo (número)"} value={f.target} onChange={set("target")} required placeholder="Ex: 10000" />
      {f.type==="custom"&&<Input label="Valor Atual" value={f.current} onChange={set("current")} placeholder="0" />}
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.title&&f.target&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}
