"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "@/lib/store";

const ALLOWED_DOMAIN = "@students.cavendish.ac.ug";

const SLIDES = [
  { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80", title: "Join ReclaimHub.", sub: "Start reuniting today." },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80", title: "Post lost items.", sub: "Find them faster." },
  { url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80", title: "Report found items.", sub: "Help someone today." },
  { url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=80", title: "One account.", sub: "Everything in one place." },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Please enter your name.");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return setError("Please enter your email.");
    if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
      return setError(`Only ${ALLOWED_DOMAIN} emails are allowed for student accounts.`);
    }
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setSubmitting(true);
    const result = await registerUser(normalizedEmail, "student", name, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Could not create account.");
      return;
    }

    localStorage.setItem("rh_role", "student");
    localStorage.setItem("rh_email", normalizedEmail);
    localStorage.setItem("rh_name", name);
    router.push(`/dashboard?role=student`);
  };

  const current = SLIDES[slide];

  return (
    <>
      <style>{`
        .rh-split { min-height: 100vh; display: grid; grid-template-columns: 1fr; background: #0a0a0a; color: #fafaf9; font-family: system-ui, -apple-system, sans-serif; }
        @media (min-width: 900px) { .rh-split { grid-template-columns: 1fr 1fr; } .rh-left { display: block !important; } }
        .rh-left { display: none; position: relative; overflow: hidden; background: #000; }
        .rh-right { display: flex; align-items: center; justify-content: center; padding: 48px 32px; position: relative; }
      `}</style>

      <div className="rh-split">
        <div className="rh-left">
          {mounted ? (
            <AnimatePresence mode="wait">
              <motion.img key={current.url} src={current.url} alt={current.title} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 1 }} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            </AnimatePresence>
          ) : (
            <img src={SLIDES[0].url} alt="Campus" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.2))" }} />

          <div style={{ position: "absolute", left: "40px", top: "40px", display: "flex", alignItems: "center", gap: "10px", color: "white", zIndex: 2 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "999px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
              </svg>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 600 }}>ReclaimHub</span>
          </div>

          <div style={{ position: "absolute", right: "40px", top: "40px", display: "flex", gap: "8px", zIndex: 2 }}>
            {SLIDES.map((_, i) => (
              <button key={i} type="button" onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} style={{ width: i === slide ? "24px" : "8px", height: "8px", borderRadius: "999px", border: "none", background: i === slide ? "white" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
            ))}
          </div>

          <div style={{ position: "absolute", left: "60px", right: "60px", bottom: "60px", color: "white", zIndex: 2 }}>
            <h2 style={{ fontSize: "clamp(36px, 4.5vw, 60px)", lineHeight: 1.05, margin: 0, fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
              {current.title}
              <br />
              <span style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>{current.sub}</span>
            </h2>
            <p style={{ marginTop: "20px", fontSize: "15px", color: "rgba(255,255,255,0.75)", maxWidth: "460px", lineHeight: 1.6 }}>
              Create a free student account with your campus email.
            </p>
          </div>
        </div>

        <div className="rh-right">
          <div style={{ width: "100%", maxWidth: "440px" }}>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "44px", lineHeight: 1.05, margin: 0, fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
                Create <span style={{ color: "#78716c", fontStyle: "italic" }}>account</span>
              </h1>
              <p style={{ marginTop: "10px", fontSize: "15px", color: "#a3a3a3" }}>Student accounts are free.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a3a3a3" }}>Full name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Allan Opio" style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #262626", background: "#141414", color: "#fafaf9", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a3a3a3" }}>Campus email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@students.cavendish.ac.ug" style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #262626", background: "#141414", color: "#fafaf9", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                <p style={{ marginTop: "6px", fontSize: "11px", color: "#78716c" }}>
                  Must end with <span style={{ color: "#a3a3a3", fontWeight: 600 }}>@students.cavendish.ac.ug</span>
                </p>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a3a3a3" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" style={{ width: "100%", padding: "14px 48px 14px 16px", borderRadius: "10px", border: "1px solid #262626", background: "#141414", color: "#fafaf9", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#a3a3a3", cursor: "pointer", padding: "4px", fontSize: "12px", fontFamily: "inherit" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a3a3a3" }}>Confirm password</label>
                <input type={showPassword ? "text" : "password"} required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #262626", background: "#141414", color: "#fafaf9", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>

              {error && <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{error}</p>}

              <button type="submit" disabled={submitting} style={{ width: "100%", padding: "18px", borderRadius: "999px", border: "none", background: submitting ? "#7c2d12" : "#ea580c", color: "#ffffff", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: "6px" }}>
                {submitting ? "Creating account…" : "Create student account"}
              </button>
            </form>

            <div style={{ marginTop: "20px", padding: "14px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid #262626", borderRadius: "10px", fontSize: "12px", color: "#a3a3a3", lineHeight: 1.6 }}>
              Admin accounts can only be created by an existing admin from the dashboard settings.
            </div>

            <p style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "#78716c", lineHeight: 1.6 }}>
              By continuing, you agree to our <a href="#" style={{ color: "inherit" }}>Terms of use</a> and <a href="#" style={{ color: "inherit" }}>Privacy policy</a>.
            </p>

            <p style={{ marginTop: "14px", textAlign: "center", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#fafaf9", fontWeight: 600, textDecoration: "underline" }}>Sign in</Link>
            </p>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "#78716c" }}>
              <Link href="/" style={{ color: "inherit", textDecoration: "underline" }}>Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
