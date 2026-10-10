import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  return <header className="shell nav">
    <Link href="/" className="brand">VET<span>X</span>UILT</Link>
    <nav className="navlinks">
      <Link href="/projects">Explore projects</Link>
      <Link href="/how-it-works">How it works</Link>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <Link href="/login" className="btn btn-small">Log in</Link>
      <Link href="/signup" className="btn btn-primary btn-small">Join VETXUILT <ArrowUpRight size={14}/></Link>
    </div>
  </header>;
}
