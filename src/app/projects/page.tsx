import Link from "next/link";
import { ProjectBrowser } from "@/components/project-browser";
export default function ProjectsPage() {
 return <main className="shell page"><div className="eyebrow">Marketplace / Explore</div><h1 className="page-title">Find your next build.</h1><p className="page-lead">Explore student project briefs, compare requirements and discover where your skills fit. Listings are sample data until connected to your Supabase project.</p><div style={{display:"flex",gap:10,marginTop:20,flexWrap:"wrap"}}><Link href="/post-project" className="btn btn-primary">+ Post a project</Link><Link href="/signup" className="btn">Join as a developer</Link></div><ProjectBrowser/></main>;
}
