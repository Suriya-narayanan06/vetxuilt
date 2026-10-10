import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, GraduationCap, ShieldCheck, Sparkles, WalletCards, Workflow } from "lucide-react";

export default function HomePage() {
 return <main>
  <section className="shell hero">
   <div><div className="eyebrow">The student-first project marketplace</div>
    <h1>Good ideas deserve a <span className="gradient">team.</span></h1>
    <p className="lead">Meet verified college students who can turn your project brief into something real. Find collaborators, compare proposals, track milestones, and build your reputation while you study.</p>
    <div className="hero-actions"><Link href="/projects" className="btn btn-primary">Explore projects <ArrowUpRight size={16}/></Link><Link href="/signup" className="btn">Join VETXUILT</Link></div>
    <div className="trustline"><span>✓ Student verification workflow</span><span>✓ Clear project milestones</span><span>✓ Reviews tied to completed work</span></div>
   </div>
   <div className="hero-visual"><div className="panel">
    <div className="panel-top"><div><div className="eyebrow">Live marketplace preview</div><div style={{fontSize:16,fontWeight:800,marginTop:6}}>Projects worth building</div></div><span className="pill"><span style={{width:6,height:6,borderRadius:9,background:"var(--green)"}}/> OPEN</span></div>
    <div className="project-mini"><div className="project-foot"><span className="muted tiny">AI & DATA</span><span className="pill"><BadgeCheck size={12}/> Verified client</span></div><h3 style={{marginTop:12}}>AI Attendance Dashboard</h3><div className="tags"><span className="tag">Python</span><span className="tag">Analytics</span><span className="tag">React</span></div><div className="project-foot"><strong>₹4k–₹8k</strong><span className="muted">Flexible timeline</span></div></div>
    <div className="project-mini"><div className="project-foot"><span className="muted tiny">MOBILE APPS</span><span className="tiny" style={{color:"var(--amber)"}}>New brief</span></div><h3 style={{marginTop:12}}>Campus Event App</h3><div className="tags"><span className="tag">Flutter</span><span className="tag">Firebase</span></div><div className="project-foot"><strong>₹5k–₹10k</strong><span className="muted">Milestone-ready</span></div></div>
    <div className="note" style={{marginTop:14}}>Designed for student collaboration. Sample listings are illustrative, not real job offers.</div>
   </div></div>
  </section>
  <section className="shell"><div className="stats"><div className="stat"><strong>01</strong><span>Verify student status</span></div><div className="stat"><strong>02</strong><span>Compare proposals</span></div><div className="stat"><strong>03</strong><span>Track milestones</span></div><div className="stat"><strong>04</strong><span>Build reputation</span></div></div></section>
  <section className="shell section"><div className="section-head"><div><div className="eyebrow">Made for campus builders</div><h2>Freelance energy. Student-first trust.</h2></div><Link href="/how-it-works" className="btn">How it works <ArrowUpRight size={14}/></Link></div>
   <div className="grid3">
    <div className="feature"><div className="feature-icon"><GraduationCap/></div><h3>Verified student profiles</h3><p>Build a profile with your college, course, skills, portfolio and verification status. Sensitive ID documents stay private.</p></div>
    <div className="feature"><div className="feature-icon"><BriefcaseBusiness/></div><h3>Projects + competitive bids</h3><p>Clients publish clear briefs. Developers submit a price, timeline, proposal and suggested milestones.</p></div>
    <div className="feature"><div className="feature-icon"><Workflow/></div><h3>One shared workspace</h3><p>Keep messages, progress updates, files, delivery and revisions connected to the project.</p></div>
    <div className="feature"><div className="feature-icon"><WalletCards/></div><h3>Payment-ready structure</h3><p>Track payment status and milestone amounts. Real money movement only activates after a payment provider is configured.</p></div>
    <div className="feature"><div className="feature-icon"><ShieldCheck/></div><h3>Trust & safety</h3><p>Verification review, reporting and dispute workflows help make collaboration more accountable.</p></div>
    <div className="feature"><div className="feature-icon"><Sparkles/></div><h3>Reputation that compounds</h3><p>Verified project history and reviews help students show practical skills beyond a resume.</p></div>
   </div>
  </section>
  <section className="shell section"><div className="panel" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:25,flexWrap:"wrap",padding:30}}><div><div className="eyebrow">Your next project starts here</div><h2 style={{marginBottom:8}}>Build something that counts.</h2><p className="muted" style={{fontSize:13,margin:0}}>Create a profile. Find your people. Make the idea happen.</p></div><Link href="/signup" className="btn btn-primary">Create your account <ArrowUpRight size={15}/></Link></div></section>
 </main>;
}
