import Link from "next/link";
export function SiteFooter() {
  return <footer className="shell footer">
    <div><strong style={{color:"var(--text)",letterSpacing:".12em"}}>VETXUILT</strong><div style={{marginTop:6}}>Verified students. Real projects.</div></div>
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}><Link href="/trust">Trust & safety</Link><Link href="/projects">Marketplace</Link><Link href="/dashboard">Dashboard</Link></div>
    <div>© {new Date().getFullYear()} VETXUILT. Built for student collaboration.</div>
  </footer>;
}
