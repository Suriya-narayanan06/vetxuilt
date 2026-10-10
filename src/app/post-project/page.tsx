"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function PostProjectPage(){
 const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");const f=new FormData(e.currentTarget);
 try{const db=createClient();const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user){window.location.href="/login";return}
 const skills=String(f.get("skills")||"").split(",").map(s=>s.trim()).filter(Boolean);
 const {error}=await db.from("projects").insert({client_id:user.id,title:String(f.get("title")),description:String(f.get("description")),category:String(f.get("category")),skills,budget_min:f.get("budgetMin")?Number(f.get("budgetMin")):null,budget_max:f.get("budgetMax")?Number(f.get("budgetMax")):null,deadline:f.get("deadline")||null,deliverables:String(f.get("deliverables")||""),status:"open"});
 if(error)throw error;setMessage("Project posted. You can view it in the marketplace.");(e.target as HTMLFormElement).reset();
 }catch(err){setMessage(err instanceof Error?err.message:"Could not post project. Check your login and database setup.");}finally{setBusy(false)}}
 return <main className="shell page"><div className="eyebrow">Marketplace / New brief</div><h1 className="page-title">Give your idea a brief.</h1><p className="page-lead">Clear requirements help developers bid accurately. Be honest about scope, deadlines and academic rules.</p>
 <form className="form-card" onSubmit={submit}><div className="form-grid">
 <div className="field full"><label>Project title</label><input name="title" required minLength={5} maxLength={120} placeholder="e.g. Campus event management app"/></div>
 <div className="field"><label>Category</label><select name="category"><option>Web Development</option><option>Mobile Apps</option><option>AI & Data</option><option>IoT & Hardware</option><option>Design</option><option>Other</option></select></div>
 <div className="field"><label>Deadline</label><input name="deadline" type="date" min={new Date().toISOString().slice(0,10)}/></div>
 <div className="field"><label>Minimum budget (₹)</label><input name="budgetMin" type="number" min="0" step="1" placeholder="3000"/></div>
 <div className="field"><label>Maximum budget (₹)</label><input name="budgetMax" type="number" min="0" step="1" placeholder="7000"/></div>
 <div className="field full"><label>Skills (comma separated)</label><input name="skills" placeholder="Python, Flutter, UI/UX"/></div>
 <div className="field full"><label>Project description and requirements</label><textarea name="description" required minLength={30} maxLength={10000} placeholder="What should be built? Who will use it? What does success look like?"/></div>
 <div className="field full"><label>Expected deliverables</label><textarea name="deliverables" placeholder="Source code, documentation, demo, tests…"/></div>
 <div className="field full"><div className="note">Do not include passwords, personal ID numbers, or confidential information in the public brief. Only post work that complies with your institution's academic integrity rules.</div></div>
 <div className="field full"><button className="btn btn-primary" disabled={busy}>{busy?"Publishing…":"Publish project"}</button></div></div>{message&&<div className="note" role="status" style={{marginTop:14}}>{message}</div>}</form></main>;
}
