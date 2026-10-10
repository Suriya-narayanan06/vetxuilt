"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";
export function AuthForm({ mode }: { mode: Mode }) {
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [role,setRole] = useState("both");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage(""); setBusy(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const fullName = String(form.get("fullName") || "");
        const phone = String(form.get("phone") || "");
        const result = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { full_name: fullName, phone, role } }
        });
        if (result.error) throw result.error;
        setMessage("Account created. Check your email to confirm your address, then log in and complete your student profile.");
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong. Check your Supabase configuration.");
    } finally { setBusy(false); }
  }
  return <form className="form-card" onSubmit={submit}>
    <div className="eyebrow">{mode === "signup" ? "Create your account" : "Welcome back"}</div>
    <h2>{mode === "signup" ? "Join the student network." : "Back to building."}</h2>
    <p className="muted tiny" style={{lineHeight:1.8}}>{mode === "signup" ? "Create an account first. Student verification is a separate review step." : "Log in to access your VETXUILT workspace."}</p>
    <div className="form-grid" style={{marginTop:20}}>
      {mode === "signup" && <div className="field full"><label>Full name</label><input name="fullName" required minLength={2} placeholder="Your real name"/></div>}
      <div className="field full"><label>Email address</label><input name="email" type="email" required placeholder="you@example.com"/></div>
      {mode === "signup" && <div className="field full"><label>Phone number</label><input name="phone" type="tel" required placeholder="+91 ..."/></div>}
      <div className="field full"><label>Password</label><input name="password" type="password" required minLength={8} placeholder="At least 8 characters"/></div>
      {mode === "signup" && <div className="field full"><label>How will you use VETXUILT?</label><select value={role} onChange={e=>setRole(e.target.value)}><option value="both">Both client and developer</option><option value="client">Mostly as a client</option><option value="developer">Mostly as a developer</option></select></div>}
      <div className="field full"><button className="btn btn-primary" disabled={busy} type="submit" style={{width:"100%"}}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}</button></div>
    </div>
    {message && <div className="note" role="status" style={{marginTop:15}}>{message}</div>}
    <p className="tiny muted" style={{marginTop:18}}>{mode === "signup" ? <>Already registered? <Link className="muted-link" href="/login">Log in</Link></> : <>New here? <Link className="muted-link" href="/signup">Create an account</Link></>}</p>
  </form>;
}
