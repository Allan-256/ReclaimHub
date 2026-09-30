"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { items, type ItemStatus } from "@/data/items";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"all" | ItemStatus>("all");
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCarouselIndex((i) => (i + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, []);

  const visible = activeTab === "all" ? items.slice(0, 6) : items.filter((i) => i.status === activeTab).slice(0, 6);
  const current = items[carouselIndex];

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <nav style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid var(--border-subtle)", background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "var(--accent)", color: "var(--accent-fg)", padding: "8px", borderRadius: "999px", display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
              </svg>
            </div>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>ReclaimHub</span>
          </Link>

          <div style={{ display: "flex", gap: "32px", fontSize: "14px" }}>
            {(["all", "lost", "found", "returned"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ background: "none", border: "none", cursor: "pointer", color: activeTab === t ? "var(--foreground)" : "var(--muted)", fontFamily: "inherit", fontSize: "14px" }}>
                {t === "all" ? "Home" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            <Link href="/login" style={{ background: "var(--accent)", color: "var(--accent-fg)", padding: "10px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--border-subtle)", background: "var(--card)", color: "var(--muted)", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", marginBottom: "24px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "var(--accent)" }} />
              Lost &amp; found, made simple
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0 }}>
              Reclaim what&apos;s yours.
              <br />
              <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Help others find theirs.</span>
            </h1>
            <p style={{ marginTop: "24px", fontSize: "16px", color: "var(--muted)", maxWidth: "520px", lineHeight: 1.6 }}>
              ReclaimHub connects students with items they&apos;ve lost or found on campus.
            </p>
            <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--accent)", color: "var(--accent-fg)", padding: "14px 26px", borderRadius: "999px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
                Report an item
              </Link>
              <a href="#items" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--border-subtle)", padding: "14px 26px", borderRadius: "999px", fontSize: "14px", fontWeight: 500, textDecoration: "none", color: "inherit" }}>
                Browse items
              </a>
            </div>
          </div>

          <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "24px", border: "1px solid var(--border-subtle)", background: "var(--card)" }}>
            <AnimatePresence mode="wait">
              <motion.img key={current.id} src={current.image} alt={current.title} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8 }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            </AnimatePresence>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px", color: "white", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{current.status}</span>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: 0 }}>{current.title}</h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{current.location} · {current.date}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", padding: "48px 24px" }}>
          {[
            { value: "1,204", label: "Items reported" },
            { value: "847", label: "Items reunited" },
            { value: "98%", label: "Resolution rate" },
            { value: "24h", label: "Avg. return time" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600, color: "var(--accent)" }}>{s.value}</div>
              <div style={{ marginTop: "6px", fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "12px" }}>Browse by category</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: 0, letterSpacing: "-0.02em" }}>What did you lose?</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
          {["Electronics", "Bags", "Keys", "Books", "Clothing", "IDs & Cards", "Watches", "Audio"].map((c) => (
            <button key={c} style={{ padding: "14px 24px", borderRadius: "999px", border: "1px solid var(--border-subtle)", background: "var(--card)", color: "var(--foreground)", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "96px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "12px" }}>How it works</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "42px", margin: 0, letterSpacing: "-0.02em" }}>Three steps to reunite</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { step: "01", title: "Report an item", desc: "Sign in and post details. Admin reviews before it goes live." },
              { step: "02", title: "Claim a match", desc: "See something that's yours? Submit a claim." },
              { step: "03", title: "Get it back", desc: "Once approved, arrange pickup. Item moves to Returned." },
            ].map((s) => (
              <div key={s.step} style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "20px", padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ background: "rgba(234,88,12,0.12)", color: "var(--accent)", padding: "12px 18px", borderRadius: "12px", fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 600 }}>{s.step}</div>
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>{s.title}</h3>
                <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "96px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "12px" }}>Student stories</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "42px", margin: 0, letterSpacing: "-0.02em" }}>Reunited, in their words</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { quote: "Lost my laptop charger during finals week. Got it back in 20 minutes.", name: "Aisha K.", role: "Engineering, Year 3" },
              { quote: "Found someone's ID card and posted it here. They claimed it same day.", name: "Marcus O.", role: "Business, Year 2" },
              { quote: "ReclaimHub is how our campus community should work.", name: "Priya S.", role: "Medicine, Year 4" },
            ].map((t, i) => (
              <div key={i} style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "20px", padding: "32px" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "40px", color: "var(--accent)", lineHeight: 1, marginBottom: "12px" }}>&ldquo;</div>
                <p style={{ fontSize: "15px", lineHeight: 1.6, margin: 0 }}>{t.quote}</p>
                <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "var(--accent)", color: "var(--accent-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="items" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "96px 24px" }}>
          <div style={{ marginBottom: "40px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
            <div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "12px" }}>Recently posted</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "40px", margin: 0, letterSpacing: "-0.02em" }}>{activeTab === "all" ? "All items" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} items`}</h2>
            </div>
            <div style={{ display: "flex", gap: "4px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "999px", padding: "4px", fontSize: "14px" }}>
              {(["all", "lost", "found", "returned"] as const).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ border: "none", cursor: "pointer", borderRadius: "999px", padding: "8px 18px", textTransform: "capitalize", fontFamily: "inherit", fontSize: "14px", background: activeTab === t ? "var(--accent)" : "transparent", color: activeTab === t ? "var(--accent-fg)" : "var(--muted)" }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {visible.map((item) => (
              <Link key={item.id} href="/login" style={{ display: "block", textDecoration: "none", color: "inherit", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", overflow: "hidden" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", left: "12px", top: "12px", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 500, color: "white", background: item.status === "lost" ? "#ef4444" : item.status === "found" ? "#10b981" : "#3b82f6" }}>{item.status}</span>
                </div>
                <div style={{ padding: "20px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>{item.title}</h3>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--muted)" }}>{item.description}</p>
                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                    <span>{item.location}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "96px 24px" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border-subtle)", borderRadius: "24px", padding: "64px 40px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", margin: 0, letterSpacing: "-0.02em" }}>Have something to report?</h2>
            <p style={{ marginTop: "16px", fontSize: "16px", color: "var(--muted)", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>Sign in and post in under 60 seconds.</p>
            <div style={{ marginTop: "32px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" style={{ background: "var(--accent)", color: "var(--accent-fg)", padding: "14px 26px", borderRadius: "999px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>Sign in to post</Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap", fontSize: "14px", color: "var(--muted)" }}>
          <span>© {new Date().getFullYear()} ReclaimHub</span>
          <span>Built for campus communities</span>
        </div>
      </footer>
    </div>
  );
}
