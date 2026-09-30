"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore, idOf } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";

function Inner() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const store = useStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [message, setMessage] = useState("");
  const [claimed, setClaimed] = useState(false);

  const item = store.items.find((i) => idOf(i) === id);
  const claims = store.claims.filter((c) => c.itemId === id);
  const myClaim = claims.find((c) => c.studentEmail === email);

  useEffect(() => {
    const r = localStorage.getItem("rh_role") as "student" | "admin" | null;
    const e = localStorage.getItem("rh_email");
    if (!r || !e) {
      router.replace("/login");
      return;
    }
    setRole(r);
    setEmail(e);
    setName(e.split("@")[0]);
  }, [router]);

  if (!item) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", color: "var(--foreground)", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px" }}>Item not found</h1>
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "underline", marginTop: "12px", display: "inline-block" }}>Back to home</Link>
        </div>
      </div>
    );
  }

  const submitClaim = async () => {
    if (!message.trim()) return;
    await store.addClaim({
      itemId: idOf(item),
      itemTitle: item.title,
      itemImage: item.image,
      studentEmail: email,
      studentName: name,
      message,
    });
    setClaimed(true);
    setMessage("");
  };

  const statusBg = item.status === "lost" ? "#ef4444" : item.status === "found" ? "#10b981" : "#3b82f6";

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <nav style={{ borderBottom: "1px solid var(--border-subtle)", background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(12px)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "var(--accent)", color: "var(--accent-fg)", padding: "8px", borderRadius: "999px", display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
              </svg>
            </div>
            <span style={{ fontSize: "17px", fontWeight: 600 }}>ReclaimHub</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            <Link href={`/dashboard?role=${role}`} style={{ border: "1px solid var(--border-subtle)", padding: "9px 18px", borderRadius: "999px", fontSize: "13px", textDecoration: "none", color: "inherit", fontWeight: 500 }}>
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <Link href={`/dashboard?role=${role}`} style={{ fontSize: "13px", color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
          ← Back to dashboard
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "48px", alignItems: "start" }}>
          <div>
            <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-subtle)", background: "var(--card)", aspectRatio: "4/3" }}>
              <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <span style={{ position: "absolute", left: "20px", top: "20px", padding: "6px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, color: "white", background: statusBg, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {item.status}
              </span>
            </div>

            <div style={{ marginTop: "32px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: 0 }}>Description</h2>
              <p style={{ marginTop: "12px", fontSize: "15px", color: "var(--muted)", lineHeight: 1.7 }}>{item.description}</p>
            </div>

            <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "14px", padding: "20px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 600 }}>Location</div>
                <div style={{ marginTop: "8px", fontSize: "15px" }}>{item.location}</div>
              </div>
              <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "14px", padding: "20px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 600 }}>Date</div>
                <div style={{ marginTop: "8px", fontSize: "15px" }}>{item.date}</div>
              </div>
            </div>
          </div>

          <div style={{ position: "sticky", top: "100px" }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{item.title}</h1>
            <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--muted)" }}>
              Posted by {item.postedBy === "admin" ? "Admin" : "Student"}
            </div>

            {role === "admin" && (
              <div style={{ marginTop: "28px", display: "flex", gap: "10px" }}>
                {item.status !== "returned" && (
                  <button
                    onClick={() => store.markReturned(idOf(item))}
                    style={{ flex: 1, background: "var(--accent)", color: "var(--accent-fg)", border: "none", padding: "14px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Mark returned
                  </button>
                )}
                <button
                  onClick={async () => { await store.deleteItem(idOf(item)); router.push(`/dashboard?role=${role}`); }}
                  style={{ flex: 1, background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", padding: "14px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Delete
                </button>
              </div>
            )}

            {role === "student" && item.status === "found" && (
              <div style={{ marginTop: "28px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", padding: "24px" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0 }}>Is this yours?</h3>
                <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>Describe something only the owner would know. Admin reviews all claims.</p>

                {myClaim ? (
                  <div style={{ marginTop: "18px", padding: "16px", background: myClaim.status === "approved" ? "rgba(16,185,129,0.12)" : myClaim.status === "rejected" ? "rgba(239,68,68,0.12)" : "rgba(234,88,12,0.12)", borderRadius: "12px" }}>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: myClaim.status === "approved" ? "#10b981" : myClaim.status === "rejected" ? "#ef4444" : "var(--accent)", fontWeight: 700 }}>
                      Claim {myClaim.status}
                    </div>
                    {myClaim.feedback && <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.5 }}>{myClaim.feedback}</p>}
                  </div>
                ) : claimed ? (
                  <div style={{ marginTop: "18px", padding: "16px", background: "rgba(16,185,129,0.12)", borderRadius: "12px", fontSize: "14px", color: "#10b981" }}>
                    Claim submitted. Admin will respond soon.
                  </div>
                ) : (
                  <>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe unique details only the owner would know..."
                      rows={4}
                      style={{ marginTop: "16px", width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--background)", color: "var(--foreground)", fontSize: "14px", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                    <button
                      onClick={submitClaim}
                      disabled={!message.trim()}
                      style={{
                        marginTop: "14px",
                        width: "100%",
                        background: message.trim() ? "var(--accent)" : "transparent",
                        color: message.trim() ? "var(--accent-fg)" : "var(--muted)",
                        border: message.trim() ? "none" : "1px solid var(--border-subtle)",
                        padding: "14px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: message.trim() ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                      }}
                    >
                      Submit claim
                    </button>
                  </>
                )}
              </div>
            )}

            {role === "admin" && claims.length > 0 && (
              <div style={{ marginTop: "28px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", padding: "24px" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0 }}>Claims for this item ({claims.length})</h3>
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {claims.map((c) => (
                    <div key={idOf(c)} style={{ padding: "12px", border: "1px solid var(--border-subtle)", borderRadius: "10px", fontSize: "13px" }}>
                      <div style={{ fontWeight: 600 }}>{c.studentName} · {c.studentEmail}</div>
                      <div style={{ marginTop: "4px", color: "var(--muted)" }}>{c.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItemPage() {
  return (
    <Suspense fallback={<div style={{ padding: "48px", textAlign: "center", color: "var(--muted)" }}>Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
