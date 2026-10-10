"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Project = { id:string; title:string; description:string; category:string; skills:string[]; budget_min:number|null; budget_max:number|null; deadline:string|null; status:string; created_at:string };
const demo: Project[] = [
 {id:"demo-1",title:"AI Attendance Dashboard",description:"Build a clean dashboard for attendance analytics with CSV export and role-based views.",category:"AI & Data",skills:["Python","React","Analytics"],budget_min:4000,budget_max:8000,deadline:null,status:"open",created_at:""},
 {id:"demo-2",title:"Campus Event Mobile App",description:"Student event discovery, registrations, notifications and an organizer interface.",category:"Mobile Apps",skills:["Flutter","Firebase","UI/UX"],budget_min:5000,budget_max:10000,deadline:null,status:"open",created_at:""},
 {id:"demo-3",title:"Portfolio Website",description:"Responsive personal portfolio with project cards, contact form and simple CMS.",category:"Web Development",skills:["Next.js","CSS","TypeScript"],budget_min:2000,budget_max:4500,deadline:null,status:"open",created_at:""},
 {id:"demo-4",title:"IoT Energy Monitor Prototype",description:"Prototype an energy monitoring dashboard and document device-to-dashboard data flow.",category:"IoT & Hardware",skills:["IoT","Python","Charts"],budget_min:3500,budget_max:7000,deadline:null,status:"open",created_at:""},
 {id:"demo-5",title:"Student Club Management",description:"Create a simple member directory, events list and committee management workflow.",category:"Web Development",skills:["React","PostgreSQL","UX"],budget_min:3000,budget_max:6500,deadline:null,status:"open",created_at:""},
 {id:"demo-6",title:"ML Model Evaluation UI",description:"A compact interface to compare metrics, confusion matrices and model versions.",category:"AI & Data",skills:["Python","ML","Data Viz"],budget_min:4500,budget_max:9000,deadline:null,status:"open",created_at:""}
];
export function ProjectBrowser() {
 const [projects,setProjects] = useState<Project[]>(demo);
 const [query,setQuery] = useState(""); const [category,setCategory] = useState("All categories"); const [loading,setLoading] = useState(true);
 useEffect(()=>{ let alive=true; (async()=>{ try { const db=createClient(); const {data,error}=await db.from("projects").select("id,title,description,category,skills,budget_min,budget_max,deadline,status,created_at").eq("status","open").order("created_at",{ascending:false}).limit(60); if(!error && data && alive && data.length) setProjects(data as Project[]); } catch {} finally { if(alive) setLoading(false); }})(); return ()=>{alive=false}; },[]);
 const categories=["All categories","Web Development","Mobile Apps","AI & Data","IoT & Hardware","Design","Other"];
 const filtered=useMemo(()=>projects.filter(p=>(category==="All categories"||p.category===category)&&`${p.title} ${p.description} ${p.skills?.join(" ")}`.toLowerCase().includes(query.toLowerCase())),[projects,query,category]);
 return <><div className="panel" style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:12,margin:"24px 0"}}>
   <div className="field"><label><Search size={13} style={{display:"inline",marginRight:5}}/>Search projects or skills</label><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try Flutter, Python, UI design…"/></div>
   <div className="field"><label><SlidersHorizontal size={13} style={{display:"inline",marginRight:5}}/>Category</label><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
 </div>
 <div className="tiny muted" style={{marginBottom:13}}>{loading?"Loading marketplace…":`${filtered.length} project${filtered.length===1?"":"s"} found`}{projects===demo && " · Sample listings shown until live projects are available"}</div>
 <div className="listing-grid">{filtered.map(p=><article className="listing-card" key={p.id}>
   <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><span className="pill">{p.category}</span><span className="tiny muted">{p.status}</span></div>
   <h3>{p.title}</h3><p>{p.description}</p><div className="tags">{(p.skills||[]).slice(0,4).map(s=><span className="tag" key={s}>{s}</span>)}</div>
   <div className="listing-meta"><strong>{p.budget_min!=null&&p.budget_max!=null?`₹${p.budget_min.toLocaleString("en-IN")}–₹${p.budget_max.toLocaleString("en-IN")}`:"Budget negotiable"}</strong><Link className="btn btn-small" href={p.id.startsWith("demo-")?"/signup":`/projects/${p.id}`}>View project ↗</Link></div>
 </article>)}</div>{filtered.length===0&&<div className="empty">No projects match that search. Try a different skill or category.</div>}</>;
}
