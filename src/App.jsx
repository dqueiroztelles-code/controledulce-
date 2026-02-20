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
const CLIENT_TYPES = ["Fixo", "Por Projeto", "Por Ciclo"];
const CLIENT_TYPE_INFO = {
  "Fixo": { label: "Recorrente mensal", color: COLORS.green, bg: COLORS.greenDim },
  "Por Projeto": { label: "Por entrega", color: COLORS.blue, bg: COLORS.blueDim },
  "Por Ciclo": { label: "Por período", color: COLORS.yellow, bg: COLORS.yellowDim },
};

const STORAGE_KEY = "gestor_freelancer_v3";
async function loadData() {
  // Try v3 first, fallback to v2
  try {
    const r = await window.storage.get(STORAGE_KEY);
    if (r) return JSON.parse(r.value);
    const old = await window.storage.get("gestor_freelancer_v2");
    if (old) return { ...defaultData(), ...JSON.parse(old.value) };
    return null;
  } catch { return null; }
}
async function saveData(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
const defaultData = () => {
  const clients = [
    { id:"c1", name:"Colorato", segment:"Plataforma / Empreendedorismo", email:"", whatsapp:"", notes:"Contrato R$ 7.000 em 3x. 2 parcelas recebidas (ciclo 1). 1 parcela pendente.", type:"Por Ciclo", value:"7000", payment:"PIX", pagoMes:false, cicloFim:"2026-03-15" },
    { id:"c2", name:"Baby Home", segment:"Educação / Escola", email:"", whatsapp:"", notes:"Mensalidade R$ 5.000/mês + variável conforme entregas.", type:"Fixo", value:"5000", payment:"PIX", pagoMes:false, payDay:1 },
    { id:"c3", name:"Ruian – ExpoPrint 2026", segment:"Industrial / Feira", email:"", whatsapp:"", notes:"Contrato R$ 50.000 em 3x. 1ª parcela recebida. 2 parcelas pendentes.", type:"Por Ciclo", value:"50000", payment:"PIX", pagoMes:false, cicloFim:"2026-04-01" },
    { id:"c4", name:"Franccico", segment:"Branding / Narrativa de Marca", email:"", whatsapp:"", notes:"Narrativa de Marca. Contrato fechado.", type:"Por Projeto", value:"12000", payment:"PIX", pagoMes:false },
    { id:"c5", name:"Vinícola Góes", segment:"Vinho / Premium", email:"", whatsapp:"", notes:"Negociação avançada. Cláudio Góes.", type:"Por Projeto", value:"", payment:"PIX", pagoMes:false },
  ];
  const projects = [
    { id:"p1", name:"Brandbook Estratégico – Colorato", client:"Colorato", status:"Em andamento", priority:"Alta", deadline:"2026-03-15", value:"7000", notes:"Contrato R$ 7.000 em 3x. 2 parcelas recebidas (R$ 4.667). Parcela 3 pendente (R$ 2.333). Plano de Marca + Brandbook (~70 slides).", createdAt: new Date().toISOString() },
    { id:"p2", name:"Branding + Fluxos Operacionais – Baby Home", client:"Baby Home", status:"Em andamento", priority:"Alta", deadline:"", value:"5000", notes:"R$ 5.000/mês recorrente + variável. Fluxos operacionais por área (comunicação, comercial, pedagógico, casos sensíveis, admin). Cultura interna + treinamento.", createdAt: new Date().toISOString() },
    { id:"p3", name:"Gestão Stand ExpoPrint 2026 – Ruian", client:"Ruian – ExpoPrint 2026", status:"Em andamento", priority:"Alta", deadline:"2026-04-01", value:"50000", notes:"Contrato R$ 50.000 em 3x. 1ª parcela recebida (R$ 16.667). 2 parcelas pendentes (R$ 33.333). Direção criativa, budget, fornecedores.", createdAt: new Date().toISOString() },
    { id:"p4", name:"Narrativa de Marca – Franccico", client:"Franccico", status:"Em andamento", priority:"Alta", deadline:"", value:"12000", notes:"Narrativa de marca. Projeto fechado em R$ 12.000.", createdAt: new Date().toISOString() },
  ];
  const pipeline = [
    { id:"pp1", name:"Estudo Estratégico Premium – Vinícola Góes", client:"Cláudio Góes", stage:"Negociação", value:"", notes:"Material de fechamento: script WhatsApp + paper executivo 1 página.", nextAction:"Finalizar mensagem + paper, enviar + follow-up" },
    { id:"pp2", name:"Proposta Branding – Tais", client:"Tais", stage:"Proposta Enviada", value:"", notes:"Em orçamento.", nextAction:"Acompanhar retorno do orçamento" },
  ];
  const tasks = [
    { id:"t1", title:"Integrar pesquisa de fornecedores na persona e messaging", projectId:"p1", done:false, due:"2026-02-23" },
    { id:"t2", title:"Fechar cenários de budget – Colorato", projectId:"p1", done:false, due:"2026-02-24" },
    { id:"t3", title:"Finalizar plano de ação 30 dias – Colorato", projectId:"p1", done:false, due:"2026-02-25" },
    { id:"t4", title:"Consolidar SOPs por área operacional – Baby Home", projectId:"p2", done:false, due:"2026-02-24" },
    { id:"t5", title:"Definir cadência de comunicação com pais – Baby Home", projectId:"p2", done:false, due:"2026-02-25" },
    { id:"t6", title:"Preparar executive summary para liderança – Baby Home", projectId:"p2", done:false, due:"2026-02-26" },
    { id:"t7", title:"Confirmar fornecedores + contratos – Ruian", projectId:"p3", done:false, due:"2026-02-23" },
    { id:"t8", title:"Fechar lista de requisitos (internet, energia, AC, impressora, limpeza, totem)", projectId:"p3", done:false, due:"2026-02-24" },
    { id:"t9", title:"Checkpoint semanal de execução – Ruian", projectId:"p3", done:false, due:"2026-02-27" },
    { id:"t10", title:"Iniciar estrutura da narrativa de marca – Franccico", projectId:"p4", done:false, due:"2026-02-25" },
    { id:"t11", title:"Definir pilares de posicionamento – Franccico", projectId:"p4", done:false, due:"2026-02-26" },
    { id:"t12", title:"Finalizar mensagem WhatsApp de fechamento – Vinícola Góes", projectId:null, done:false, due:"2026-02-21" },
    { id:"t13", title:"Finalizar paper executivo 1 página – Vinícola Góes", projectId:null, done:false, due:"2026-02-21" },
    { id:"t14", title:"Enviar proposta + iniciar follow-up – Vinícola Góes", projectId:null, done:false, due:"2026-02-23" },
    { id:"t15", title:"Acompanhar retorno do orçamento – Tais", projectId:null, done:false, due:"2026-02-24" },
  ];
  const expenses = [];
  // Receitas já recebidas registradas como referência
  const goals = [
    { id:"g1", title:"Faturamento Total Contratos Ativos", description:"Ruian 50k + Colorato 7k + Franccico 12k + Baby Home recorrente", type:"receita", target:"74000", current:"" },
    { id:"g2", title:"Fechar Vinícola Góes", description:"Negociação em andamento", type:"pipeline", target:"3", current:"" },
  ];
  return { clients, projects, pipeline, tasks, expenses, goals };
};

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";
const fmtMoney = (v) => (parseFloat(String(v).replace(",", ".")) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parseMoney = (v) => parseFloat(String(v).replace(",", ".")) || 0;
const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
const isToday = (d) => d && new Date(d + "T00:00:00").toDateString() === new Date().toDateString();

// Calcula receita do mês atual baseado no tipo de cliente
function calcReceitaMes(data, m, y) {
  const now = new Date();
  const isCurrentMonth = m === now.getMonth() && y === now.getFullYear();
  let total = 0;

  data.clients.forEach(c => {
    if (!c.value) return;
    const val = parseMoney(c.value);

    if (c.type === "Fixo") {
      // Recorrente: conta todo mês
      total += val;
    } else if (c.type === "Por Projeto") {
      // Conta projetos concluídos do cliente no mês
      const projsMes = data.projects.filter(p => {
        if (p.client !== c.name || p.status !== "Concluído") return false;
        const d = p.deadline || p.createdAt?.slice(0, 10);
        if (!d) return false;
        const dt = new Date(d + (d.length === 10 ? "T00:00:00" : ""));
        return dt.getMonth() === m && dt.getFullYear() === y;
      });
      total += projsMes.length * val;
    } else if (c.type === "Por Ciclo") {
      // Conta se tem projeto concluído no mês
      const hasMes = data.projects.some(p => {
        if (p.client !== c.name || p.status !== "Concluído") return false;
        const d = p.deadline || p.createdAt?.slice(0, 10);
        if (!d) return false;
        const dt = new Date(d + (d.length === 10 ? "T00:00:00" : ""));
        return dt.getMonth() === m && dt.getFullYear() === y;
      });
      if (hasMes) total += val;
    }
  });

  // Soma também projetos com valor próprio (independente de cliente)
  data.projects.forEach(p => {
    if (p.status !== "Concluído" || !p.value) return;
    // Só conta se o cliente não tem valor próprio definido
    const clientTemValor = data.clients.find(c => c.name === p.client && c.value);
    if (clientTemValor) return;
    const d = p.deadline || p.createdAt?.slice(0, 10);
    if (!d) return;
    const dt = new Date(d + (d.length === 10 ? "T00:00:00" : ""));
    if (dt.getMonth() === m && dt.getFullYear() === y) total += parseMoney(p.value);
  });

  return total;
}

// Próximos pagamentos a receber
function getProximosPagamentos(data) {
  const pagamentos = [];
  const now = new Date();

  data.clients.forEach(c => {
    if (!c.value) return;
    const val = parseMoney(c.value);

    if (c.type === "Fixo") {
      // Dia de pagamento do mês atual/próximo
      const dia = c.payDay || 1;
      let dataVenc = new Date(now.getFullYear(), now.getMonth(), dia);
      if (dataVenc < now) dataVenc = new Date(now.getFullYear(), now.getMonth() + 1, dia);
      pagamentos.push({
        id: c.id, cliente: c.name, tipo: "Fixo", valor: val,
        data: dataVenc.toISOString().slice(0, 10),
        status: c.pagoMes ? "Pago" : "Pendente",
        pagamento: c.payment || "PIX",
      });
    } else if (c.type === "Por Projeto") {
      // Projetos em andamento desse cliente
      data.projects.filter(p => p.client === c.name && p.status === "Em andamento").forEach(p => {
        pagamentos.push({
          id: p.id, cliente: c.name, tipo: "Por Projeto", valor: val,
          data: p.deadline || null, projeto: p.name,
          status: "Pendente", pagamento: c.payment || "PIX",
        });
      });
    } else if (c.type === "Por Ciclo") {
      if (c.cicloFim) {
        pagamentos.push({
          id: c.id + "_ciclo", cliente: c.name, tipo: "Por Ciclo", valor: val,
          data: c.cicloFim, status: "Pendente", pagamento: c.payment || "PIX",
        });
      }
    }
  });

  return pagamentos.sort((a, b) => {
    if (!a.data) return 1; if (!b.data) return -1;
    return new Date(a.data) - new Date(b.data);
  }).slice(0, 8);
}

// ---- UI primitives ----
const Badge = ({ label, color, bg }) => (
  <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:700, letterSpacing:0.5, color:color||COLORS.text, background:bg||COLORS.accentDim }}>{label}</span>
);
const Pill = ({ status }) => {
  const map = {
    "Em andamento":[COLORS.blue,COLORS.blueDim], "Pausado":[COLORS.yellow,COLORS.yellowDim],
    "Concluído":[COLORS.green,COLORS.greenDim], "Alta":[COLORS.red,COLORS.redDim],
    "Média":[COLORS.yellow,COLORS.yellowDim], "Baixa":[COLORS.green,COLORS.greenDim],
    "Pago":[COLORS.green,COLORS.greenDim], "Pendente":[COLORS.yellow,COLORS.yellowDim],
  };
  const [c,bg] = map[status]||[COLORS.textMuted,COLORS.border];
  return <Badge label={status} color={c} bg={bg} />;
};
const ClientTypeBadge = ({ type }) => {
  const info = CLIENT_TYPE_INFO[type] || { label: type, color: COLORS.textMuted, bg: COLORS.border };
  return <Badge label={type} color={info.color} bg={info.bg} />;
};
const Btn = ({ children, onClick, variant="primary", small, style:s }) => {
  const base = { border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, padding:small?"6px 14px":"10px 20px", fontSize:small?12:14, transition:"all 0.15s", fontFamily:"inherit" };
  const variants = {
    primary:{background:COLORS.accent,color:"#fff"},
    ghost:{background:"transparent",color:COLORS.textMuted,border:`1px solid ${COLORS.border}`},
    danger:{background:COLORS.redDim,color:COLORS.red,border:`1px solid ${COLORS.red}33`},
    success:{background:COLORS.greenDim,color:COLORS.green,border:`1px solid ${COLORS.green}33`},
  };
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
    <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16, padding:28, width:"min(520px,94vw)", maxHeight:"90vh", overflowY:"auto" }}>
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
    { id:"tarefas", label:"Tarefas" }, { id:"calendario", label:"Calendário" },
    { id:"financeiro", label:"Financeiro" }, { id:"insights", label:"Insights & Metas" },
    { id:"pessoal", label:"✦ Pessoal" },
  ];

  const receitaMesAtual = calcReceitaMes(data, new Date().getMonth(), new Date().getFullYear());
  const proximosPag = getProximosPagamentos(data);

  return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.text, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;} input::placeholder{color:#555566;} select option{background:#17171f;}
        ::-webkit-scrollbar{width:6px;height:6px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px;}
        .hrow:hover{background:#1e1e2a!important;}
      `}</style>

      {/* Sidebar */}
      <div style={{ position:"fixed", left:0, top:0, bottom:0, width:220, background:COLORS.surface, borderRight:`1px solid ${COLORS.border}`, display:"flex", flexDirection:"column", padding:"24px 0", zIndex:100 }}>
        <div style={{ padding:"0 20px 24px" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:COLORS.accent, marginBottom:2 }}>FREELANCER</div>
          <div style={{ fontSize:19, fontWeight:800 }}>Gestão Pro</div>
          <div style={{ fontSize:11, color:COLORS.green, marginTop:6, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(receitaMesAtual)}/mês</div>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", padding:"10px 20px", background:tab===t.id?COLORS.accentDim:"transparent", border:"none", borderLeft:`3px solid ${tab===t.id?COLORS.accent:"transparent"}`, color:tab===t.id?COLORS.accentLight:COLORS.textMuted, cursor:"pointer", fontSize:13, fontWeight:tab===t.id?700:500, textAlign:"left", width:"100%", transition:"all 0.15s", fontFamily:"inherit" }}>
            {t.label}
          </button>
        ))}
        <div style={{ marginTop:"auto", padding:"0 20px", fontSize:11, color:COLORS.textDim }}>
          {data.projects.filter(p=>p.status==="Em andamento").length} projetos ativos · {data.clients.length} clientes
        </div>
      </div>

      <div style={{ marginLeft:220, padding:"32px 36px", minHeight:"100vh" }}>
        {tab==="dashboard"  && <Dashboard data={data} setModal={setModal} setSelected={setSelected} update={update} receitaMes={receitaMesAtual} proximosPag={proximosPag} />}
        {tab==="projetos"   && <Projetos  data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="clientes"   && <Clientes  data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="pipeline"   && <Pipeline  data={data} setModal={setModal} setSelected={setSelected} update={update} />}
        {tab==="tarefas"    && <Tarefas   data={data} update={update} />}
        {tab==="financeiro" && <Financeiro data={data} update={update} calcReceitaMes={calcReceitaMes} />}
        {tab==="insights"   && <Insights  data={data} update={update} />}
        {tab==="calendario" && <Calendario data={data} update={update} />}
        {tab==="pessoal"    && <Pessoal    data={data} update={update} />}
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

// ---- DASHBOARD ----
function Dashboard({ data, setModal, setSelected, update, receitaMes, proximosPag }) {
  const today   = data.tasks.filter(t=>!t.done&&isToday(t.due));
  const overdue = data.tasks.filter(t=>!t.done&&isOverdue(t.due));
  const active  = data.projects.filter(p=>p.status==="Em andamento");
  const fixos   = data.clients.filter(c=>c.type==="Fixo");
  const recorrente = fixos.reduce((a,c)=>a+parseMoney(c.value||0),0);
  const pendentes = proximosPag.filter(p=>p.status==="Pendente");
  const totalPendente = pendentes.reduce((a,p)=>a+p.valor,0);

  // Contratos em execução: total contratado vs recebido
  const contratos = [
    { nome:"Ruian – ExpoPrint", total:50000, recebido:16667, parcelas:3, pagas:1, cor:COLORS.blue },
    { nome:"Colorato", total:7000, recebido:4667, parcelas:3, pagas:2, cor:COLORS.accent },
    { nome:"Franccico", total:12000, recebido:0, parcelas:1, pagas:0, cor:COLORS.yellow },
    { nome:"Baby Home", total:5000, recebido:recorrente, parcelas:null, pagas:null, cor:COLORS.green, recorrente:true },
  ];
  const totalContratado = 50000+7000+12000;
  const totalRecebido = 16667+4667;
  const totalPendenteProjetos = totalContratado - totalRecebido;

  const stat = (label, val, color, sub) => (
    <Card style={{ flex:1, minWidth:130 }}>
      <div style={{ fontSize:22, fontWeight:800, color:color||COLORS.accent, fontFamily:"'DM Mono',monospace" }}>{val}</div>
      <div style={{ fontSize:12, color:COLORS.textMuted, marginTop:3 }}>{label}</div>
      {sub&&<div style={{ fontSize:10, color:COLORS.textDim, marginTop:3 }}>{sub}</div>}
    </Card>
  );

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:26, fontWeight:800 }}>Bom dia, Dulce 👋</h1>
        <div style={{ color:COLORS.textMuted, marginTop:4, fontSize:14 }}>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>

      {/* KPIs topo */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        {stat("Recorrente Mensal", `R$ ${fmtMoney(recorrente+receitaMes)}`, COLORS.green, "Baby Home + entregas do mês")}
        {stat("Contratos Ativos", `R$ ${fmtMoney(totalContratado)}`, COLORS.accent, "Ruian + Colorato + Franccico")}
        {stat("Já Recebido", `R$ ${fmtMoney(totalRecebido)}`, COLORS.blue, "dos contratos fechados")}
        {stat("Ainda a Receber", `R$ ${fmtMoney(totalPendenteProjetos)}`, COLORS.yellow, "saldo dos contratos")}
        {stat("Tarefas Atrasadas", overdue.length, overdue.length>0?COLORS.red:COLORS.green, overdue.length>0?"atenção urgente":"tudo em dia")}
      </div>

      {/* Contratos em execução */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, marginBottom:16, fontSize:15 }}>💼 Contratos em Execução</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
          {contratos.map(c=>(
            <div key={c.nome} style={{ background:COLORS.bg, borderRadius:10, padding:"14px 16px", borderLeft:`4px solid ${c.cor}` }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>{c.nome}</div>
              {c.recorrente ? (
                <>
                  <div style={{ fontSize:20, fontWeight:800, color:COLORS.green, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(c.total)}<span style={{ fontSize:11, color:COLORS.textDim }}>/mês</span></div>
                  <div style={{ fontSize:11, color:COLORS.textDim, marginTop:4 }}>Recorrente · PIX</div>
                  <Badge label="✓ Ativo" color={COLORS.green} bg={COLORS.greenDim} />
                </>
              ) : (
                <>
                  <div style={{ fontSize:20, fontWeight:800, color:c.cor, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(c.total)}</div>
                  <div style={{ marginTop:8, marginBottom:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:COLORS.textMuted, marginBottom:4 }}>
                      <span>Recebido: <b style={{ color:COLORS.green }}>R$ {fmtMoney(c.recebido)}</b></span>
                      <span>Saldo: <b style={{ color:COLORS.yellow }}>R$ {fmtMoney(c.total-c.recebido)}</b></span>
                    </div>
                    <div style={{ height:6, background:COLORS.border, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.round((c.recebido/c.total)*100)}%`, background:c.cor, borderRadius:3 }} />
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:COLORS.textDim }}>{c.pagas}/{c.parcelas} parcelas · PIX</div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Tarefas */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>🔥 Tarefas do Dia</div>
            <Btn small variant="ghost" onClick={()=>setModal("new-task")}>+ Nova</Btn>
          </div>
          {today.length===0&&overdue.length===0?<EmptyState icon="✓" text="Nenhuma tarefa para hoje!" />
            :[...overdue.slice(0,3).map(t=>({...t,_ov:true})),...today].slice(0,6).map(t=><TaskRow key={t.id} task={t} data={data} update={update} highlight={t._ov?"red":null} />)}
        </Card>

        {/* Projetos ativos */}
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
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      {p.value&&<span style={{ fontSize:11, color:COLORS.green, fontFamily:"'DM Mono',monospace" }}>R$ {fmtMoney(p.value)}</span>}
                      <Pill status={p.priority} />
                    </div>
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

      {/* Próximos pagamentos */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:700 }}>💰 Próximos Pagamentos a Receber</div>
        </div>
        {proximosPag.length===0?<EmptyState icon="💸" text="Nenhum pagamento previsto. Cadastre clientes com valores!" />
          :<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
            {proximosPag.map(p=>(
              <div key={p.id} style={{ padding:"12px 14px", background:COLORS.bg, borderRadius:10, border:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>{p.cliente}</div>
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>
                    <ClientTypeBadge type={p.tipo} />
                    {p.projeto&&<span style={{ marginLeft:6 }}>{p.projeto}</span>}
                  </div>
                  <div style={{ fontSize:11, color:COLORS.textDim, marginTop:4 }}>
                    {p.data?fmt(p.data):"Sem data"} · {p.pagamento}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", color:COLORS.green, fontSize:15, fontWeight:700 }}>R$ {fmtMoney(p.valor)}</div>
                  <Pill status={p.status} />
                </div>
              </div>
            ))}
          </div>}
      </Card>
    </div>
  );
}

// ---- PROJETOS ----
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

// ---- CLIENTES ----
function Clientes({ data, setModal, setSelected, update }) {
  const [filterType, setFilterType] = useState("Todos");
  const [expandedClient, setExpandedClient] = useState(null);
  const filtered = filterType==="Todos"?data.clients:data.clients.filter(c=>c.type===filterType);

  const PROJECT_PHASES = ["Imersão", "Estratégia", "Criação", "Refinamento", "Entrega"];

  const PhaseTrack = ({ project, update }) => {
    const phase = project.phase || "Imersão";
    const idx = PROJECT_PHASES.indexOf(phase);
    return (
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11, color:COLORS.textMuted, marginBottom:8, fontWeight:600 }}>FASE DO PROJETO</div>
        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
          {PROJECT_PHASES.map((p, i) => {
            const active = i === idx;
            const done = i < idx;
            return (
              <div key={p} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div
                  onClick={()=>update(d=>({...d,projects:d.projects.map(x=>x.id===project.id?{...x,phase:p}:x)}))}
                  title={p}
                  style={{
                    width:"100%", padding:"5px 0", textAlign:"center", fontSize:10, fontWeight:700, cursor:"pointer",
                    background: active?COLORS.accent : done?COLORS.accentDim : COLORS.bg,
                    color: active?"#fff" : done?COLORS.accentLight : COLORS.textDim,
                    borderRadius: i===0?"6px 0 0 6px" : i===PROJECT_PHASES.length-1?"0 6px 6px 0" : 0,
                    borderTop:`1px solid ${active?COLORS.accent:done?COLORS.accent+"44":COLORS.border}`,
                    borderBottom:`1px solid ${active?COLORS.accent:done?COLORS.accent+"44":COLORS.border}`,
                    borderLeft:`1px solid ${active?COLORS.accent:done?COLORS.accent+"44":COLORS.border}`,
                    borderRight: i===PROJECT_PHASES.length-1?`1px solid ${active?COLORS.accent:done?COLORS.accent+"44":COLORS.border}`:"none",
                    transition:"all 0.15s",
                  }}
                >{p}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Clientes</h1>
        <Btn onClick={()=>setModal("new-client")}>+ Novo Cliente</Btn>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["Todos",...CLIENT_TYPES].map(t=>(
          <button key={t} onClick={()=>setFilterType(t)} style={{ padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:filterType===t?COLORS.accent:COLORS.surface, color:filterType===t?"#fff":COLORS.textMuted, fontFamily:"inherit" }}>{t}</button>
        ))}
      </div>
      {filtered.length===0?<EmptyState icon="◉" text="Nenhum cliente aqui ainda." />
        :<div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {filtered.map(c=>{
            const projs = data.projects.filter(p=>p.client===c.name);
            const isExpanded = expandedClient === c.id;
            return (
              <Card key={c.id} style={{ padding:0, overflow:"hidden" }}>
                {/* Header do cliente */}
                <div style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}
                  onClick={()=>setExpandedClient(isExpanded?null:c.id)}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:COLORS.accentDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:COLORS.accent,flexShrink:0 }}>{c.name?.[0]?.toUpperCase()||"?"}</div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16 }}>{c.name}</div>
                      <div style={{ fontSize:12, color:COLORS.textMuted, marginTop:2 }}>{c.segment}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <ClientTypeBadge type={c.type||"Por Projeto"} />
                    {c.value&&<span style={{ fontFamily:"'DM Mono',monospace", color:COLORS.green, fontSize:14, fontWeight:700 }}>R$ {fmtMoney(c.value)}{c.type==="Fixo"?"/mês":""}</span>}
                    <Btn small variant="ghost" onClick={e=>{e.stopPropagation();setSelected(c);setModal("edit-client");}} style={{ padding:"4px 8px" }}>✏️</Btn>
                    <Btn small variant="danger" onClick={e=>{e.stopPropagation();update(d=>({...d,clients:d.clients.filter(x=>x.id!==c.id)}));}} style={{ padding:"4px 8px" }}>✕</Btn>
                    <span style={{ color:COLORS.textDim, fontSize:16 }}>{isExpanded?"▲":"▼"}</span>
                  </div>
                </div>

                {/* Projetos expandidos */}
                {isExpanded && (
                  <div style={{ borderTop:`1px solid ${COLORS.border}` }}>
                    {projs.length===0 ? (
                      <div style={{ padding:"20px", color:COLORS.textDim, fontSize:13, textAlign:"center" }}>Nenhum projeto vinculado ainda.</div>
                    ) : projs.map((p, pi) => {
                      const tasks = data.tasks.filter(t=>t.projectId===p.id);
                      const doneTasks = tasks.filter(t=>t.done).length;
                      const pct = tasks.length>0?Math.round((doneTasks/tasks.length)*100):0;
                      const nextTasks = tasks.filter(t=>!t.done).slice(0,3);
                      return (
                        <div key={p.id} style={{ padding:"20px", borderBottom:pi<projs.length-1?`1px solid ${COLORS.border}`:"none", background:COLORS.surfaceHover }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                              <div style={{ display:"flex", gap:6, marginTop:6 }}>
                                <Pill status={p.status} />
                                <Pill status={p.priority} />
                                {p.value&&<Badge label={`R$ ${fmtMoney(p.value)}`} color={COLORS.green} bg={COLORS.greenDim} />}
                              </div>
                            </div>
                            {p.deadline&&<div style={{ fontSize:12, color:isOverdue(p.deadline)?COLORS.red:COLORS.textMuted, textAlign:"right" }}>Prazo<br/><b>{fmt(p.deadline)}</b></div>}
                          </div>

                          {/* Fase do projeto */}
                          <PhaseTrack project={p} update={update} />

                          {/* Progress bar tarefas */}
                          {tasks.length>0&&(
                            <div style={{ marginBottom:14 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:COLORS.textMuted, marginBottom:5 }}>
                                <span>Progresso das tarefas</span>
                                <span>{doneTasks}/{tasks.length} · {pct}%</span>
                              </div>
                              <MiniBar value={pct} max={100} color={pct===100?COLORS.green:COLORS.accent} />
                            </div>
                          )}

                          {/* Próximas ações */}
                          {nextTasks.length>0&&(
                            <div>
                              <div style={{ fontSize:11, color:COLORS.textMuted, fontWeight:600, marginBottom:8 }}>PRÓXIMAS AÇÕES</div>
                              {nextTasks.map(t=>(
                                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                  <input type="checkbox" checked={t.done} onChange={()=>update(d=>({...d,tasks:d.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)}))} style={{ accentColor:COLORS.accent, width:14, height:14, flexShrink:0, cursor:"pointer" }} />
                                  <span style={{ fontSize:13, color:isOverdue(t.due)?COLORS.red:COLORS.text }}>{t.title}</span>
                                  {t.due&&<span style={{ marginLeft:"auto", fontSize:11, color:isOverdue(t.due)?COLORS.red:COLORS.textDim, flexShrink:0 }}>{fmt(t.due)}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Notas */}
                          {p.notes&&<div style={{ marginTop:12, fontSize:12, color:COLORS.textDim, lineHeight:1.6, padding:"8px 12px", background:COLORS.bg, borderRadius:8 }}>{p.notes}</div>}
                        </div>
                      );
                    })}

                    {/* Pagamento fixo */}
                    {c.type==="Fixo"&&(
                      <div style={{ padding:"14px 20px", borderTop:`1px solid ${COLORS.border}` }}>
                        <Btn small variant={c.pagoMes?"ghost":"success"} onClick={()=>update(d=>({...d,clients:d.clients.map(x=>x.id===c.id?{...x,pagoMes:!x.pagoMes}:x)}))} style={{ width:"100%" }}>
                          {c.pagoMes?"↩ Desmarcar pagamento deste mês":"✓ Marcar mensalidade como paga"}
                        </Btn>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>}
    </div>
  );
}



// ---- PIPELINE ----
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

// ---- TAREFAS ----
function Tarefas({ data, update }) {
  const [show, setShow] = useState(false);
  const [dragging, setDragging] = useState(null);

  const todoTasks   = data.tasks.filter(t => !t.done && !t.inProgress);
  const inProgTasks = data.tasks.filter(t => !t.done && t.inProgress);
  const doneTasks   = data.tasks.filter(t => t.done);

  const moveTask = (taskId, col) => {
    update(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id !== taskId ? t : {
        ...t,
        done: col === "done",
        inProgress: col === "progress",
      })
    }));
  };

  const KanbanCol = ({ title, tasks, colId, color, icon }) => (
    <div
      style={{ flex:1, minWidth:220, background:COLORS.surface, borderRadius:14, padding:16, border:`1px solid ${COLORS.border}`, minHeight:400 }}
      onDragOver={e=>e.preventDefault()}
      onDrop={e=>{ e.preventDefault(); if(dragging) moveTask(dragging, colId); setDragging(null); }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ fontWeight:700, fontSize:14, color }}>{title}</span>
        <span style={{ marginLeft:"auto", background:color+"22", color, borderRadius:99, fontSize:11, fontWeight:700, padding:"2px 8px" }}>{tasks.length}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {tasks.length===0 && <div style={{ textAlign:"center", padding:24, color:COLORS.textDim, fontSize:12, border:`1px dashed ${COLORS.border}`, borderRadius:10 }}>Arraste tarefas aqui</div>}
        {tasks.map(t => {
          const proj = data.projects.find(p => p.id === t.projectId);
          const late = isOverdue(t.due);
          return (
            <div
              key={t.id}
              draggable
              onDragStart={() => setDragging(t.id)}
              style={{ background:COLORS.bg, border:`1px solid ${late?COLORS.red:COLORS.border}`, borderRadius:10, padding:"12px 14px", cursor:"grab", transition:"all 0.15s" }}
            >
              <div style={{ fontWeight:600, fontSize:13, marginBottom:6, color:t.done?COLORS.textDim:COLORS.text, textDecoration:t.done?"line-through":"none" }}>{t.title}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6, flexWrap:"wrap" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {proj && <Badge label={proj.name} color={COLORS.accent} bg={COLORS.accentDim} />}
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {t.due && <span style={{ fontSize:11, color:late?COLORS.red:COLORS.textDim }}>{late?"⚠ ":""}{fmt(t.due)}</span>}
                  <Btn small variant="danger" onClick={()=>update(d=>({...d,tasks:d.tasks.filter(x=>x.id!==t.id)}))} style={{ padding:"2px 6px", fontSize:10 }}>✕</Btn>
                </div>
              </div>
              {/* Quick move buttons */}
              <div style={{ display:"flex", gap:4, marginTop:8 }}>
                {colId!=="todo"     && <button onClick={()=>moveTask(t.id,"todo")}     style={{ flex:1, fontSize:10, padding:"4px", borderRadius:6, background:COLORS.border, border:"none", color:COLORS.textMuted, cursor:"pointer", fontFamily:"inherit" }}>← A Fazer</button>}
                {colId!=="progress" && <button onClick={()=>moveTask(t.id,"progress")} style={{ flex:1, fontSize:10, padding:"4px", borderRadius:6, background:COLORS.yellowDim, border:"none", color:COLORS.yellow, cursor:"pointer", fontFamily:"inherit" }}>→ Em Progresso</button>}
                {colId!=="done"     && <button onClick={()=>moveTask(t.id,"done")}     style={{ flex:1, fontSize:10, padding:"4px", borderRadius:6, background:COLORS.greenDim, border:"none", color:COLORS.green, cursor:"pointer", fontFamily:"inherit" }}>✓ Feito</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Tarefas</h1>
        <Btn onClick={()=>setShow(true)}>+ Nova Tarefa</Btn>
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <KanbanCol title="A Fazer"       tasks={todoTasks}   colId="todo"     color={COLORS.textMuted} icon="◻" />
        <KanbanCol title="Em Progresso"  tasks={inProgTasks} colId="progress" color={COLORS.yellow}    icon="⚡" />
        <KanbanCol title="Feito"         tasks={doneTasks}   colId="done"     color={COLORS.green}     icon="✓" />
      </div>
      {show&&<TaskModal data={data} onClose={()=>setShow(false)} onSave={t=>{update(d=>({...d,tasks:[...d.tasks,{...t,id:uid(),done:false,inProgress:false}]}));setShow(false);}} />}
    </div>
  );
}


// ---- FINANCEIRO ----
function Financeiro({ data, update, calcReceitaMes }) {
  const [showExp, setShowExp] = useState(false);
  const [editExp, setEditExp] = useState(null);
  const now = new Date();
  const [vm, setVm] = useState(now.getMonth());
  const [vy, setVy] = useState(now.getFullYear());
  const expenses = data.expenses||[];

  const nav = (d) => { let m=vm+d,y=vy; if(m<0){m=11;y--;} if(m>11){m=0;y++;} setVm(m);setVy(y); };

  const recMes = calcReceitaMes(data, vm, vy);
  const expMes = expenses.filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===vm&&dt.getFullYear()===vy;}).reduce((a,e)=>a+parseMoney(e.value),0);
  const recTotal = Array.from({length:12},(_,i)=>calcReceitaMes(data,i,vy)).reduce((a,v)=>a+v,0);
  const expTotal = expenses.reduce((a,e)=>a+parseMoney(e.value),0);
  const fixosMensal = data.clients.filter(c=>c.type==="Fixo").reduce((a,c)=>a+parseMoney(c.value||0),0);

  const chartMonths = Array.from({length:6},(_,i)=>{ const dt=new Date(vy,vm-5+i,1); return {m:dt.getMonth(),y:dt.getFullYear(),label:MONTHS_PT[dt.getMonth()]}; });
  const chartData = chartMonths.map(({m,y,label})=>({
    label,
    rec: calcReceitaMes(data, m, y),
    exp: expenses.filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===m&&dt.getFullYear()===y;}).reduce((a,e)=>a+parseMoney(e.value),0),
  }));
  const cMax = Math.max(...chartData.map(d=>Math.max(d.rec,d.exp)),1);
  const expsMes = expenses.filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===vm&&dt.getFullYear()===vy;});

  // Receitas do mês discriminadas
  const receitasDetalhadas = [];
  data.clients.forEach(c => {
    if (!c.value) return;
    const val = parseMoney(c.value);
    if (c.type === "Fixo") {
      receitasDetalhadas.push({ nome: c.name, tipo: "Fixo", valor: val, status: c.pagoMes?"Pago":"Pendente" });
    } else if (c.type === "Por Projeto") {
      const projsMes = data.projects.filter(p => {
        if (p.client !== c.name || p.status !== "Concluído") return false;
        const d = p.deadline || p.createdAt?.slice(0,10);
        if (!d) return false;
        const dt = new Date(d+"T00:00:00");
        return dt.getMonth()===vm&&dt.getFullYear()===vy;
      });
      projsMes.forEach(p => receitasDetalhadas.push({ nome: c.name, tipo: "Por Projeto", projeto: p.name, valor: val, status: "Recebido" }));
    } else if (c.type === "Por Ciclo") {
      const hasMes = data.projects.some(p => {
        if (p.client !== c.name || p.status !== "Concluído") return false;
        const d = p.deadline || p.createdAt?.slice(0,10);
        if (!d) return false;
        const dt = new Date(d+"T00:00:00");
        return dt.getMonth()===vm&&dt.getFullYear()===vy;
      });
      if (hasMes) receitasDetalhadas.push({ nome: c.name, tipo: "Por Ciclo", valor: val, status: "Recebido" });
    }
  });
  // Projetos com valor próprio
  data.projects.filter(p=>{
    if(p.status!=="Concluído"||!p.value) return false;
    const clientTemValor = data.clients.find(c=>c.name===p.client&&c.value);
    if(clientTemValor) return false;
    const d=p.deadline||p.createdAt?.slice(0,10);
    if(!d) return false;
    const dt=new Date(d+"T00:00:00");
    return dt.getMonth()===vm&&dt.getFullYear()===vy;
  }).forEach(p=>receitasDetalhadas.push({ nome: p.client||p.name, tipo:"Por Projeto", projeto:p.name, valor:parseMoney(p.value), status:"Recebido" }));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Financeiro</h1>
        <Btn onClick={()=>setShowExp(true)}>+ Despesa</Btn>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
        {[
          {l:"Recorrente Mensal (fixos)", v:`R$ ${fmtMoney(fixosMensal)}`, c:COLORS.accent},
          {l:`Receita Total ${vy}`, v:`R$ ${fmtMoney(recTotal)}`, c:COLORS.green},
          {l:`Despesas Total ${vy}`, v:`R$ ${fmtMoney(expTotal)}`, c:COLORS.red},
          {l:`Lucro ${vy}`, v:`R$ ${fmtMoney(recTotal-expTotal)}`, c:recTotal-expTotal>=0?COLORS.green:COLORS.red},
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
                <div title={`Receita: R$ ${fmtMoney(d.rec)}`} style={{ flex:1, background:COLORS.green+"99", borderRadius:"4px 4px 0 0", height:`${(d.rec/cMax)*100}%`, minHeight:d.rec>0?4:0 }} />
                <div title={`Despesa: R$ ${fmtMoney(d.exp)}`} style={{ flex:1, background:COLORS.red+"99", borderRadius:"4px 4px 0 0", height:`${(d.exp/cMax)*100}%`, minHeight:d.exp>0?4:0 }} />
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
          <div style={{ fontWeight:700, marginBottom:14 }}>Receitas — {MONTHS_PT[vm]}</div>
          {receitasDetalhadas.length===0?<EmptyState icon="💰" text="Nenhuma receita este mês." />
            :receitasDetalhadas.map((r,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 6px", borderBottom:`1px solid ${COLORS.border}` }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{r.nome}</div>
                  <div style={{ fontSize:11, color:COLORS.textDim, display:"flex", gap:6, alignItems:"center", marginTop:2 }}>
                    <ClientTypeBadge type={r.tipo} />
                    {r.projeto&&<span>{r.projeto}</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", color:COLORS.green, fontSize:13 }}>R$ {fmtMoney(r.valor)}</div>
                  <Pill status={r.status} />
                </div>
              </div>
            ))}
        </Card>
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
      </div>

      {showExp&&<ExpenseModal onClose={()=>setShowExp(false)} onSave={e=>{update(d=>({...d,expenses:[...(d.expenses||[]),{...e,id:uid()}]}));setShowExp(false);}} />}
      {editExp&&<ExpenseModal initial={editExp} onClose={()=>setEditExp(null)} onSave={e=>{update(d=>({...d,expenses:d.expenses.map(x=>x.id===editExp.id?{...x,...e}:x)}));setEditExp(null);}} />}
    </div>
  );
}

// ---- INSIGHTS ----
function Insights({ data, update }) {
  const [showGoal, setShowGoal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const goals = data.goals||[];
  const now = new Date();

  const concluded = data.projects.filter(p=>p.status==="Concluído").length;
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t=>t.done).length;
  const totalRev = calcReceitaMes(data, now.getMonth(), now.getFullYear());
  const totalExp = (data.expenses||[]).filter(e=>{const dt=new Date(e.date+"T00:00:00");return dt.getMonth()===now.getMonth()&&dt.getFullYear()===now.getFullYear();}).reduce((a,e)=>a+parseMoney(e.value),0);
  const avgTicket = concluded>0?data.projects.filter(p=>p.value&&p.status==="Concluído").reduce((a,p)=>a+parseMoney(p.value),0)/concluded:0;
  const pipeTotal = data.pipeline.length;
  const pipeClosed = data.pipeline.filter(p=>p.stage==="Fechado").length;
  const conv = pipeTotal>0?Math.round((pipeClosed/pipeTotal)*100):0;
  const overdue = data.tasks.filter(t=>!t.done&&isOverdue(t.due)).length;
  const fixosMensal = data.clients.filter(c=>c.type==="Fixo").reduce((a,c)=>a+parseMoney(c.value||0),0);

  const clientRev = data.clients.map(c=>({
    name:c.name, type:c.type||"Por Projeto",
    rev:data.projects.filter(p=>p.client===c.name&&p.value&&p.status==="Concluído").reduce((a,p)=>a+parseMoney(p.value),0)+(c.type==="Fixo"?parseMoney(c.value||0):0),
    count:data.projects.filter(p=>p.client===c.name).length,
  })).sort((a,b)=>b.rev-a.rev).slice(0,5);
  const maxCR = Math.max(...clientRev.map(c=>c.rev),1);
  const projStats = data.projects.map(p=>{const t=data.tasks.filter(x=>x.projectId===p.id);return {...p,tt:t.length,td:t.filter(x=>x.done).length};}).filter(p=>p.tt>0);

  const resolveGoal = (g) => {
    let cur = parseMoney(g.current||0);
    if(g.type==="receita") cur=totalRev;
    if(g.type==="projetos") cur=concluded;
    if(g.type==="clientes") cur=data.clients.length;
    if(g.type==="pipeline") cur=pipeClosed;
    const tgt=parseMoney(g.target);
    return {cur,tgt,pct:tgt>0?Math.min(100,Math.round((cur/tgt)*100)):0};
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Insights & Metas</h1>
        <Btn onClick={()=>setShowGoal(true)}>+ Nova Meta</Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:14, marginBottom:28 }}>
        {[
          {l:"Recorrente Mensal", v:`R$ ${fmtMoney(fixosMensal)}`, sub:`${data.clients.filter(c=>c.type==="Fixo").length} clientes fixos`, c:COLORS.accent},
          {l:"Receita do Mês", v:`R$ ${fmtMoney(totalRev)}`, sub:"todos os tipos", c:COLORS.green},
          {l:"Ticket Médio", v:`R$ ${fmtMoney(avgTicket)}`, sub:"por projeto concluído", c:COLORS.yellow},
          {l:"Conversão Pipeline", v:`${conv}%`, sub:`${pipeClosed}/${pipeTotal} leads`, c:COLORS.blue},
          {l:"Tarefas em Atraso", v:overdue, sub:"precisam de atenção", c:overdue>0?COLORS.red:COLORS.green},
          {l:"Margem do Mês", v:`${totalRev>0?Math.round(((totalRev-totalExp)/totalRev)*100):0}%`, sub:`R$ ${fmtMoney(totalRev-totalExp)}`, c:COLORS.accent},
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
          <div style={{ fontWeight:700, marginBottom:16 }}>🏆 Top Clientes</div>
          {clientRev.length===0?<EmptyState icon="◉" text="Nenhum dado ainda." />
            :clientRev.map((c,i)=>(
              <div key={c.name} style={{ marginBottom:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>{i+1}. {c.name} <ClientTypeBadge type={c.type} /></div>
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
            const {cur,tgt,pct}=resolveGoal(g); const done=pct>=100;
            return (
              <div key={g.id} style={{ marginBottom:18, paddingBottom:18, borderBottom:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div><div style={{ fontWeight:700, fontSize:15 }}>{g.title}</div>{g.description&&<div style={{ fontSize:12, color:COLORS.textMuted }}>{g.description}</div>}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                    {done&&<Badge label="✓ Atingida!" color={COLORS.green} bg={COLORS.greenDim} />}
                    <Btn small variant="ghost" onClick={()=>setEditGoal(g)} style={{ padding:"3px 8px" }}>✏️</Btn>
                    <Btn small variant="danger" onClick={()=>update(d=>({...d,goals:d.goals.filter(x=>x.id!==g.id)}))} style={{ padding:"3px 8px" }}>✕</Btn>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <MiniBar value={cur} max={tgt} color={done?COLORS.green:COLORS.accent} />
                  <div style={{ fontSize:11, color:done?COLORS.green:COLORS.textMuted, fontFamily:"'DM Mono',monospace", flexShrink:0 }}>
                    {g.type==="receita"||g.type==="custom"?`R$ ${fmtMoney(cur)} / R$ ${fmtMoney(tgt)}`:`${cur} / ${tgt}`} · {pct}%
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


// ---- CALENDÁRIO ----
function Calendario({ data, update }) {
  const now = new Date();
  const [vm, setVm] = useState(now.getMonth());
  const [vy, setVy] = useState(now.getFullYear());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  const nav = (d) => { let m=vm+d, y=vy; if(m<0){m=11;y--;} if(m>11){m=0;y++;} setVm(m); setVy(y); };

  const events = data.calEvents || [];

  // ICS Export
  const exportICS = () => {
    const autoEvents = [];
    data.projects.forEach(p => {
      if (p.deadline) autoEvents.push({ id:"proj_"+p.id, date:p.deadline, title:(p.client?p.client+" – ":"")+p.name, type:"entrega" });
    });
    data.tasks.filter(t=>t.due&&!t.done).forEach(t => {
      const proj = data.projects.find(x=>x.id===t.projectId);
      autoEvents.push({ id:"task_"+t.id, date:t.due, title:t.title+(proj?" ("+proj.name+")":""), type:"entrega" });
    });
    data.clients.filter(c=>c.type==="Fixo"&&c.value&&c.payDay).forEach(c => {
      const now2 = new Date();
      const dateStr = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,"0")}-${String(c.payDay).padStart(2,"0")}`;
      autoEvents.push({ id:"pay_"+c.id, date:dateStr, title:"Receber "+c.name+" – R$ "+fmtMoney(c.value), type:"pagamento" });
    });
    const allForExport = [...autoEvents, ...events];

    const toICSDate = (dateStr) => dateStr.replace(/-/g,"");
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gestão Pro Dulce//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];
    allForExport.forEach(ev => {
      const d = toICSDate(ev.date);
      const nextDay = toICSDate(new Date(new Date(ev.date+"T00:00:00").getTime()+86400000).toISOString().slice(0,10));
      const typeLabel = { entrega:"📦 Entrega", reuniao:"🤝 Reunião", marco:"🎯 Marco", pagamento:"💰 Pagamento", pessoal:"👤 Pessoal" }[ev.type]||ev.type;
      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}@gestao-pro`,
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${nextDay}`,
        `SUMMARY:${typeLabel}: ${ev.title}`,
        ev.notes?`DESCRIPTION:${ev.notes.replace(/\r?\n/g,"\\n")}`:"DESCRIPTION:",
        `CATEGORIES:${typeLabel}`,
        "END:VEVENT"
      );
    });
    icsLines.push("END:VCALENDAR");

    const blob = new Blob([icsLines.join("
")],{type:"text/calendar"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gestao-pro-dulce.ics"; a.click();
    URL.revokeObjectURL(url);
  };

  const EVENT_TYPES = {
    entrega:   { label:"Entrega",    color:COLORS.accent,  bg:COLORS.accentDim,  icon:"📦" },
    reuniao:   { label:"Reunião",    color:COLORS.blue,    bg:COLORS.blueDim,    icon:"🤝" },
    marco:     { label:"Marco",      color:COLORS.yellow,  bg:COLORS.yellowDim,  icon:"🎯" },
    pagamento: { label:"Pagamento",  color:COLORS.green,   bg:COLORS.greenDim,   icon:"💰" },
    pessoal:   { label:"Pessoal",    color:COLORS.textMuted, bg:COLORS.border,   icon:"👤" },
  };

  // Auto-generate events from projects/tasks/payments
  const autoEvents = [];
  data.projects.forEach(p => {
    if (p.deadline) autoEvents.push({ id:"proj_"+p.id, date:p.deadline, title:p.name, type:"entrega", auto:true, client:p.client });
  });
  data.tasks.filter(t=>t.due&&!t.done).forEach(t => {
    const proj = data.projects.find(x=>x.id===t.projectId);
    autoEvents.push({ id:"task_"+t.id, date:t.due, title:t.title, type:"entrega", auto:true, client:proj?.client });
  });
  // Payments
  const fixos = data.clients.filter(c=>c.type==="Fixo"&&c.value&&c.payDay);
  fixos.forEach(c => {
    const dateStr = `${vy}-${String(vm+1).padStart(2,"0")}-${String(c.payDay).padStart(2,"0")}`;
    autoEvents.push({ id:"pay_"+c.id, date:dateStr, title:`Receber ${c.name}`, type:"pagamento", auto:true });
  });

  const allEvents = [...autoEvents, ...events];

  const getEventsForDay = (day) => {
    const dateStr = `${vy}-${String(vm+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  // Calendar grid
  const firstDay = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm+1, 0).getDate();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

  // Upcoming events list (next 30 days)
  const upcoming = allEvents
    .filter(e => e.date >= todayStr)
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 12);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Calendário</h1>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost" onClick={exportICS}>
            <span style={{ marginRight:6 }}>📅</span> Exportar para Google Calendar
          </Btn>
          <Btn onClick={()=>{ setSelectedDay(null); setShowEventModal(true); }}>+ Novo Evento</Btn>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
        {/* Calendar */}
        <Card style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <button onClick={()=>nav(-1)} style={{ background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:8, color:COLORS.text, cursor:"pointer", padding:"6px 14px", fontFamily:"inherit", fontSize:14 }}>←</button>
            <div style={{ fontWeight:800, fontSize:18 }}>{MONTHS_PT[vm]} {vy}</div>
            <button onClick={()=>nav(1)} style={{ background:COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:8, color:COLORS.text, cursor:"pointer", padding:"6px 14px", fontFamily:"inherit", fontSize:14 }}>→</button>
          </div>

          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
            {days.map(d=><div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:COLORS.textDim, padding:"4px 0" }}>{d}</div>)}
          </div>

          {/* Day cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
            {Array.from({length: firstDay}).map((_,i)=><div key={"empty"+i} />)}
            {Array.from({length: daysInMonth}).map((_,i)=>{
              const day = i+1;
              const dateStr = `${vy}-${String(vm+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const dayEvents = getEventsForDay(day);
              const isToday = dateStr === todayStr;
              return (
                <div key={day}
                  onClick={()=>{ setSelectedDay(dateStr); setShowEventModal(true); }}
                  style={{ minHeight:70, padding:"6px 6px 4px", borderRadius:8, background:isToday?COLORS.accentDim:COLORS.bg, border:`1px solid ${isToday?COLORS.accent:COLORS.border}`, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=COLORS.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=isToday?COLORS.accent:COLORS.border}
                >
                  <div style={{ fontSize:12, fontWeight:isToday?800:600, color:isToday?COLORS.accent:COLORS.text, marginBottom:4 }}>{day}</div>
                  {dayEvents.slice(0,3).map((ev,ei)=>{
                    const t = EVENT_TYPES[ev.type]||EVENT_TYPES.pessoal;
                    return <div key={ei} style={{ fontSize:9, fontWeight:600, color:t.color, background:t.bg, borderRadius:4, padding:"2px 4px", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.icon} {ev.title}</div>;
                  })}
                  {dayEvents.length>3&&<div style={{ fontSize:9, color:COLORS.textDim }}>+{dayEvents.length-3}</div>}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display:"flex", gap:14, marginTop:16, flexWrap:"wrap" }}>
            {Object.entries(EVENT_TYPES).map(([k,v])=>(
              <div key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
                <div style={{ width:8, height:8, borderRadius:2, background:v.color }} />{v.label}
              </div>
            ))}
            <div style={{ fontSize:11, color:COLORS.textDim, marginLeft:"auto" }}>Auto = prazos e tarefas dos projetos</div>
          </div>
        </Card>

        {/* Upcoming events sidebar */}
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontWeight:700, marginBottom:14, fontSize:14 }}>📅 Próximos Eventos</div>
            {upcoming.length===0?<EmptyState icon="📅" text="Nenhum evento próximo." />
              :upcoming.map(ev=>{
                const t = EVENT_TYPES[ev.type]||EVENT_TYPES.pessoal;
                const dt = new Date(ev.date+"T00:00:00");
                const diff = Math.ceil((dt-now)/(1000*60*60*24));
                return (
                  <div key={ev.id} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{t.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.title}</div>
                      <div style={{ fontSize:11, color:t.color, marginTop:2 }}>{t.label}{ev.client?" · "+ev.client:""}</div>
                      <div style={{ fontSize:10, color:diff<=3?COLORS.red:COLORS.textDim, marginTop:1 }}>
                        {diff===0?"Hoje":diff===1?"Amanhã":`em ${diff} dias`} · {fmt(ev.date)}
                      </div>
                    </div>
                    {!ev.auto&&(
                      <Btn small variant="danger" onClick={()=>update(d=>({...d,calEvents:(d.calEvents||[]).filter(x=>x.id!==ev.id)}))} style={{ padding:"2px 6px", flexShrink:0 }}>✕</Btn>
                    )}
                  </div>
                );
              })}
          </Card>
        </div>
      </div>

      {showEventModal&&(
        <EventModal
          initial={editEvent}
          defaultDate={selectedDay}
          onClose={()=>{ setShowEventModal(false); setSelectedDay(null); setEditEvent(null); }}
          onSave={ev=>{
            if(editEvent) update(d=>({...d,calEvents:(d.calEvents||[]).map(x=>x.id===editEvent.id?{...x,...ev}:x)}));
            else update(d=>({...d,calEvents:[...(d.calEvents||[]),{...ev,id:uid()}]}));
            setShowEventModal(false); setSelectedDay(null); setEditEvent(null);
          }}
        />
      )}
    </div>
  );
}

function EventModal({ initial, defaultDate, onClose, onSave }) {
  const [f,setF] = useState({ title:"", date:defaultDate||new Date().toISOString().slice(0,10), type:"reuniao", notes:"", client:"", ...initial });
  const set = k => v => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Evento":"Novo Evento"} onClose={onClose}>
      <Input label="Título" value={f.title} onChange={set("title")} required placeholder="Ex: Reunião Baby Home, Entrega Colorato..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Data" value={f.date} onChange={set("date")} type="date" required />
        <Input label="Tipo" value={f.type} onChange={set("type")} options={["entrega","reuniao","marco","pagamento","pessoal"]} />
      </div>
      <Input label="Cliente / Contexto" value={f.client} onChange={set("client")} placeholder="Ex: Baby Home" />
      <Input label="Notas" value={f.notes} onChange={set("notes")} placeholder="Detalhes do evento..." />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.title&&f.date&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}

// ---- PESSOAL ----
function Pessoal({ data, update }) {
  const [activeSection, setActiveSection] = useState("agenda");
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [editAgenda, setEditAgenda] = useState(null);

  const personal = data.personal || { agenda:[], notes:[], habits:[] };
  const DAYS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const todayIdx = new Date().getDay();
  const todayStr = new Date().toISOString().slice(0,10);

  const updatePersonal = (fn) => update(d => ({ ...d, personal: fn(d.personal || { agenda:[], notes:[], habits:[] }) }));

  const sections = [
    { id:"agenda", label:"Agenda", icon:"📅" },
    { id:"notas",  label:"Notas & Ideias", icon:"📝" },
    { id:"habitos",label:"Hábitos", icon:"🔄" },
  ];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>✦ Pessoal</h1>
        <div style={{ color:COLORS.textMuted, fontSize:13, marginTop:4 }}>Seu espaço privado — agenda, ideias e hábitos.</div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{ padding:"8px 18px", borderRadius:99, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:activeSection===s.id?COLORS.accent:COLORS.surface, color:activeSection===s.id?"#fff":COLORS.textMuted, fontFamily:"inherit" }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* AGENDA PESSOAL */}
      {activeSection==="agenda"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>Compromissos Pessoais</div>
            <Btn small onClick={()=>setShowAgendaModal(true)}>+ Compromisso</Btn>
          </div>
          {personal.agenda.length===0?<EmptyState icon="📅" text="Nenhum compromisso ainda." />
            :<div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...personal.agenda].sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>{
                const dt = new Date(ev.date+"T00:00:00");
                const diff = Math.ceil((dt - new Date())/(1000*60*60*24));
                const past = diff < 0;
                return (
                  <Card key={ev.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", opacity:past?0.5:1 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:past?COLORS.border:COLORS.accentDim, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ fontSize:16, fontWeight:800, color:past?COLORS.textDim:COLORS.accent, lineHeight:1 }}>{dt.getDate()}</div>
                        <div style={{ fontSize:9, color:COLORS.textDim }}>{MONTHS_PT[dt.getMonth()]}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{ev.title}</div>
                        {ev.notes&&<div style={{ fontSize:12, color:COLORS.textMuted, marginTop:2 }}>{ev.notes}</div>}
                        <div style={{ fontSize:11, color:diff<=1&&!past?COLORS.yellow:COLORS.textDim, marginTop:3 }}>
                          {past?"Passou":diff===0?"Hoje":diff===1?"Amanhã":`em ${diff} dias`}
                          {ev.time&&` · ${ev.time}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn small variant="ghost" onClick={()=>setEditAgenda(ev)} style={{ padding:"4px 8px" }}>✏️</Btn>
                      <Btn small variant="danger" onClick={()=>updatePersonal(p=>({...p,agenda:p.agenda.filter(x=>x.id!==ev.id)}))} style={{ padding:"4px 8px" }}>✕</Btn>
                    </div>
                  </Card>
                );
              })}
            </div>}
          {(showAgendaModal||editAgenda)&&(
            <AgendaModal
              initial={editAgenda}
              todayStr={todayStr}
              onClose={()=>{setShowAgendaModal(false);setEditAgenda(null);}}
              onSave={(f)=>{
                if(editAgenda) updatePersonal(p=>({...p,agenda:p.agenda.map(x=>x.id===editAgenda.id?{...x,...f}:x)}));
                else updatePersonal(p=>({...p,agenda:[...p.agenda,{...f,id:uid()}]}));
                setShowAgendaModal(false);setEditAgenda(null);
              }}
            />
          )}
        </div>
      )}

      {/* NOTAS & IDEIAS */}
      {activeSection==="notas"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>Notas & Diário de Ideias</div>
            <Btn small onClick={()=>setShowNoteModal(true)}>+ Nova Nota</Btn>
          </div>
          {personal.notes.length===0?<EmptyState icon="📝" text="Capture suas ideias aqui." />
            :<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {[...personal.notes].sort((a,b)=>b.createdAt?.localeCompare(a.createdAt||"")||0).map(n=>(
                <Card key={n.id} style={{ borderTop:`3px solid ${n.color||COLORS.accent}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{n.title}</div>
                    <div style={{ display:"flex", gap:4 }}>
                      <Btn small variant="ghost" onClick={()=>setEditNote(n)} style={{ padding:"3px 6px" }}>✏️</Btn>
                      <Btn small variant="danger" onClick={()=>updatePersonal(p=>({...p,notes:p.notes.filter(x=>x.id!==n.id)}))} style={{ padding:"3px 6px" }}>✕</Btn>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:COLORS.textMuted, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{n.content}</div>
                  <div style={{ fontSize:10, color:COLORS.textDim, marginTop:10 }}>{fmt(n.createdAt?.slice(0,10))}</div>
                </Card>
              ))}
            </div>}
          {(showNoteModal||editNote)&&(
            <NoteModal
              initial={editNote}
              onClose={()=>{setShowNoteModal(false);setEditNote(null);}}
              onSave={(f)=>{
                if(editNote) updatePersonal(p=>({...p,notes:p.notes.map(x=>x.id===editNote.id?{...x,...f}:x)}));
                else updatePersonal(p=>({...p,notes:[...p.notes,{...f,id:uid(),createdAt:new Date().toISOString()}]}));
                setShowNoteModal(false);setEditNote(null);
              }}
            />
          )}
        </div>
      )}

      {/* HÁBITOS */}
      {activeSection==="habitos"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:700 }}>Rotina Semanal</div>
            <Btn small onClick={()=>updatePersonal(p=>{
              const name = window.prompt("Nome do hábito:");
              if(!name) return p;
              return {...p, habits:[...p.habits,{id:uid(),name,days:[],streak:0}]};
            })}>+ Hábito</Btn>
          </div>
          {personal.habits.length===0?<EmptyState icon="🔄" text="Defina seus hábitos semanais." />
            :<div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {personal.habits.map(h=>{
                const completedThisWeek = h.days?.length||0;
                return (
                  <Card key={h.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{h.name}</div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <Badge label={`${completedThisWeek}/7 dias`} color={completedThisWeek>=5?COLORS.green:completedThisWeek>=3?COLORS.yellow:COLORS.textMuted} bg={completedThisWeek>=5?COLORS.greenDim:completedThisWeek>=3?COLORS.yellowDim:COLORS.border} />
                        <Btn small variant="danger" onClick={()=>updatePersonal(p=>({...p,habits:p.habits.filter(x=>x.id!==h.id)}))} style={{ padding:"3px 6px" }}>✕</Btn>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {DAYS_PT.map((d,i)=>{
                        const checked = h.days?.includes(i);
                        return (
                          <div key={d}
                            onClick={()=>updatePersonal(p=>({...p,habits:p.habits.map(x=>x.id===h.id?{...x,days:checked?x.days.filter(dd=>dd!==i):[...(x.days||[]),i]}:x)}))}
                            style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, background:checked?COLORS.accent:COLORS.bg, border:`1px solid ${checked?COLORS.accent:COLORS.border}`, cursor:"pointer", transition:"all 0.15s" }}
                          >
                            <div style={{ fontSize:10, fontWeight:700, color:checked?"#fff":i===todayIdx?COLORS.accent:COLORS.textDim }}>{d}</div>
                            <div style={{ fontSize:14, marginTop:2 }}>{checked?"✓":"·"}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop:10 }}>
                      <MiniBar value={completedThisWeek} max={7} color={completedThisWeek>=5?COLORS.green:COLORS.accent} />
                    </div>
                  </Card>
                );
              })}
            </div>}
        </div>
      )}
    </div>
  );
}

function AgendaModal({ initial, todayStr, onClose, onSave }) {
  const [f,setF] = useState({ title:"", date:todayStr||new Date().toISOString().slice(0,10), time:"", notes:"", ...initial });
  const set = k => v => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Compromisso":"Novo Compromisso"} onClose={onClose}>
      <Input label="Título" value={f.title} onChange={set("title")} required placeholder="Ex: Consulta médica, Reunião banco..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Data" value={f.date} onChange={set("date")} type="date" />
        <Input label="Horário (opcional)" value={f.time} onChange={set("time")} placeholder="14:00" />
      </div>
      <Input label="Notas" value={f.notes} onChange={set("notes")} />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.title&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}

function NoteModal({ initial, onClose, onSave }) {
  const NOTE_COLORS = [COLORS.accent, COLORS.green, COLORS.yellow, COLORS.blue, COLORS.red];
  const [f,setF] = useState({ title:"", content:"", color:COLORS.accent, ...initial });
  const set = k => v => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Nota":"Nova Nota"} onClose={onClose}>
      <Input label="Título" value={f.title} onChange={set("title")} required placeholder="Ex: Ideia para Colorato, Insight de sessão..." />
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:12, color:COLORS.textMuted, marginBottom:8, fontWeight:600 }}>Conteúdo</label>
        <textarea value={f.content} onChange={e=>set("content")(e.target.value)} placeholder="Escreva livremente..." rows={6}
          style={{ width:"100%", padding:"10px 12px", borderRadius:8, background:COLORS.bg, border:`1px solid ${COLORS.border}`, color:COLORS.text, fontSize:13, outline:"none", fontFamily:"inherit", resize:"vertical", lineHeight:1.6 }} />
      </div>
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:12, color:COLORS.textMuted, marginBottom:8, fontWeight:600 }}>Cor</label>
        <div style={{ display:"flex", gap:8 }}>
          {NOTE_COLORS.map(c=>(
            <div key={c} onClick={()=>set("color")(c)} style={{ width:24, height:24, borderRadius:99, background:c, cursor:"pointer", border:`3px solid ${f.color===c?"#fff":"transparent"}`, transition:"all 0.15s" }} />
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={()=>f.title&&onSave(f)}>Salvar</Btn>
      </div>
    </Modal>
  );
}

// ---- MODALS ----
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
  const [f,setF]=useState({name:"",segment:"",email:"",whatsapp:"",notes:"",type:"Por Projeto",value:"",payment:"PIX",payDay:"",cicloFim:"",pagoMes:false,...initial});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?"Editar Cliente":"Novo Cliente"} onClose={onClose}>
      <Input label="Nome" value={f.name} onChange={set("name")} required />
      <Input label="Segmento" value={f.segment} onChange={set("segment")} placeholder="Ex: E-commerce, SaaS..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label="Tipo de Cliente" value={f.type} onChange={set("type")} options={CLIENT_TYPES} />
        <Input label="Forma de Pagamento" value={f.payment} onChange={set("payment")} options={["PIX","Boleto","Cartão","Transferência","Outro"]} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Input label={f.type==="Fixo"?"Mensalidade (R$)":f.type==="Por Ciclo"?"Valor do Ciclo (R$)":"Valor por Projeto (R$)"} value={f.value} onChange={set("value")} placeholder="0,00" />
        {f.type==="Fixo"&&<Input label="Dia de Vencimento" value={f.payDay} onChange={set("payDay")} placeholder="Ex: 5" />}
        {f.type==="Por Ciclo"&&<Input label="Fim do Ciclo" value={f.cicloFim} onChange={set("cicloFim")} type="date" />}
      </div>
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
  const typeLabels={"receita":"💰 Receita do mês — automático","projetos":"✅ Projetos concluídos — automático","clientes":"👥 Total de clientes — automático","pipeline":"🤝 Leads fechados — automático","custom":"🎯 Meta personalizada (manual)"};
  return (
    <Modal title={initial?"Editar Meta":"Nova Meta"} onClose={onClose}>
      <Input label="Título" value={f.title} onChange={set("title")} required placeholder="Ex: Faturar R$ 10.000 este mês" />
      <Input label="Descrição (opcional)" value={f.description} onChange={set("description")} />
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
