"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore, useUsers, useNotifications, idOf, type Item, type Claim, type ItemStatus } from "@/lib/store";
import AdminAnalytics from "@/components/AdminAnalytics";
import ThemeToggle from "@/components/ThemeToggle";
import ImageUpload from "@/components/ImageUpload";

type Role = "student" | "admin";
type Tab = "overview" | "analytics" | "items" | "browse" | "claims" | "post" | "settings" | "activity";

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params.get("role") as Role) || "student";
  const store = useStore();
  const { users, deleteUser } = useUsers();
  const { seen, markSeen } = useNotifications();
  const [tab, setTab] = useState<Tab>("overview");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ItemStatus>("all");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const r = localStorage.getItem("rh_role");
      const e = localStorage.getItem("rh_email");

      if (!r || !e || r !== role) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e, role: r }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          localStorage.removeItem("rh_role");
          localStorage.removeItem("rh_email");
          router.replace("/login");
          return;
        }
        setEmail(data.email);
        setName(data.name || e.split("@")[0]);
        setVerified(true);
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [role, router]);

  // Close sidebar when tab changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [tab]);

  const signOut = () => {
    localStorage.removeItem("rh_role");
    localStorage.removeItem("rh_email");
    router.push("/");
  };

  const myItems = store.items.filter((i) => i.postedByEmail === email);
  const myClaims = store.claims.filter((c) => c.studentEmail === email);
  const pendingClaims = store.claims.filter((c) => c.status === "pending");
  const approvedClaims = store.claims.filter((c) => c.status === "approved");

  const myNotifications = myClaims.filter((c) => c.status !== "pending" && !seen.includes(idOf(c)));
  const unreadCount = role === "student" ? myNotifications.length : pendingClaims.length;

  const browseItems = useMemo(() => {
    return store.items
      .filter((i) => (filter === "all" ? true : i.status === filter))
      .filter((i) => (search ? (i.title + i.description + i.location).toLowerCase().includes(search.toLowerCase()) : true));
  }, [store.items, filter, search]);

  const tabs: { key: Tab; label: string; badge?: number }[] =
    role === "admin"
      ? [
          { key: "overview", label: "Overview" },
          { key: "analytics", label: "Analytics" },
          { key: "items", label: "All items" },
          { key: "claims", label: "Claims", badge: pendingClaims.length },
          { key: "activity", label: "Activity" },
          { key: "post", label: "Post item" },
          { key: "settings", label: "Settings" },
        ]
      : [
          { key: "overview", label: "Overview" },
          { key: "browse", label: "Browse items" },
          { key: "claims", label: "My claims", badge: myClaims.filter((c) => c.status === "pending").length },
          { key: "items", label: "My posts" },
          { key: "post", label: "Post item" },
        ];

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", color: "var(--muted)", fontFamily: "system-ui, sans-serif" }}>
        Verifying access…
      </div>
    );
  }

  if (!verified) return null;

  return (
    <>
      <style>{`
        .rh-dash { display: flex; min-height: 100vh; background: var(--background); color: var(--foreground); font-family: system-ui, -apple-system, sans-serif; }
        .rh-sidebar {
          width: 240px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-subtle);
          background: var(--card);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 50;
          transition: transform 0.25s ease;
        }
        .rh-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 45;
        }
        .rh-hamburger { display: none; }
        .rh-main { flex: 1; min-width: 0; }
        .rh-header { padding: 20px 40px; }
        .rh-content { padding: 40px; }

        @media (max-width: 900px) {
          .rh-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            height: 100vh;
            transform: translateX(-100%);
            box-shadow: 0 0 40px rgba(0,0,0,0.4);
          }
          .rh-sidebar.open { transform: translateX(0); }
          .rh-overlay.open { display: block; }
          .rh-hamburger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid var(--border-subtle);
            color: var(--foreground);
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
            margin-right: 12px;
          }
          .rh-header { padding: 16px 20px; }
          .rh-content { padding: 20px; }
        }
      `}</style>

      <div className="rh-dash">
        {/* OVERLAY for mobile */}
        <div className={`rh-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <aside className={`rh-sidebar ${sidebarOpen ? "open" : ""}`}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit", padding: "24px 22px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ background: "var(--accent)", color: "var(--accent-fg)", padding: "8px", borderRadius: "999px", display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
              </svg>
            </div>
            <span style={{ fontSize: "17px", fontWeight: 600 }}>ReclaimHub</span>
          </Link>

          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: role === "admin" ? "var(--accent)" : "#60a5fa" }}>
              {role === "admin" ? "Admin" : "Student"}
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)", wordBreak: "break-all" }}>{email}</div>
          </div>

          <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 14px", borderRadius: "10px", border: "none", background: active ? "rgba(234,88,12,0.12)" : "transparent", color: active ? "var(--accent)" : "var(--muted)", fontSize: "14px", fontWeight: active ? 600 : 500, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s" }}>
                  <span>{t.label}</span>
                  {t.badge && t.badge > 0 ? (
                    <span style={{ background: "var(--accent)", color: "var(--accent-fg)", fontSize: "10px", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>{t.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <ThemeToggle />
            <button onClick={signOut} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--foreground)", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="rh-main">
          <header className="rh-header" style={{ borderBottom: "1px solid var(--border-subtle)", background: "color-mix(in srgb, var(--background) 70%, transparent)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              <button className="rh-hamburger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Dashboard</div>
                <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: "6px 0 0", letterSpacing: "-0.01em" }}>{tabs.find((t) => t.key === tab)?.label}</h1>
              </div>
            </div>
            {unreadCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(234,88,12,0.12)", color: "var(--accent)", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, flexShrink: 0 }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "var(--accent)" }} />
                {unreadCount} new
              </div>
            )}
          </header>

          <div className="rh-content">
            {tab === "overview" && (
              <div>
                <WelcomeBanner name={name} role={role} pendingCount={role === "admin" ? pendingClaims.length : myClaims.filter((c) => c.status === "pending").length} />
                <QuickActions role={role} onNavigate={(t) => setTab(t as Tab)} />

                {role === "student" && myNotifications.length > 0 && (
                  <div style={{ marginTop: "32px" }}>
                    <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginBottom: "16px" }}>Recent updates</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {myNotifications.map((c) => (
                        <div key={idOf(c)} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderRadius: "14px", border: `1px solid ${c.status === "approved" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`, background: c.status === "approved" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: 500 }}>{c.itemTitle} — {c.status}</div>
                            {c.feedback && <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--muted)" }}>{c.feedback}</div>}
                          </div>
                          <button onClick={() => markSeen(idOf(c))} style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--muted)", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Dismiss</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  {role === "admin" ? (
                    <>
                      <StatCard label="Total items" value={String(store.items.length)} accent />
                      <StatCard label="Pending claims" value={String(pendingClaims.length)} highlight={pendingClaims.length > 0} />
                      <StatCard label="Returned" value={String(store.items.filter((i) => i.status === "returned").length)} />
                      <StatCard label="Approved claims" value={String(approvedClaims.length)} />
                    </>
                  ) : (
                    <>
                      <StatCard label="My posts" value={String(myItems.length)} accent />
                      <StatCard label="My claims" value={String(myClaims.length)} />
                      <StatCard label="Approved" value={String(myClaims.filter((c) => c.status === "approved").length)} />
                      <StatCard label="Pending" value={String(myClaims.filter((c) => c.status === "pending").length)} highlight={myClaims.some((c) => c.status === "pending")} />
                    </>
                  )}
                </div>

                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "44px", marginBottom: "20px" }}>{role === "admin" ? "Recent items" : "My recent posts"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                  {(role === "admin" ? store.items : myItems).slice(0, 3).map((item) => <ItemCard key={idOf(item)} item={item} role={role} />)}
                </div>

                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", marginTop: "44px", marginBottom: "20px" }}>Activity timeline</h3>
                <Timeline items={role === "admin" ? store.items.slice(0, 5) : myItems} claims={role === "admin" ? store.claims.slice(0, 5) : myClaims} />
              </div>
            )}

            {tab === "analytics" && role === "admin" && <AdminAnalytics />}

            {tab === "browse" && role === "student" && (
              <div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." style={{ flex: 1, minWidth: "200px", padding: "14px 18px", borderRadius: "999px", border: "1px solid var(--border-subtle)", background: "var(--card)", color: "var(--foreground)", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
                  <div style={{ display: "flex", gap: "4px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "999px", padding: "4px", overflowX: "auto" }}>
                    {(["all", "lost", "found", "returned"] as const).map((f) => (
                      <button key={f} onClick={() => setFilter(f)} style={{ border: "none", cursor: "pointer", borderRadius: "999px", padding: "10px 16px", fontFamily: "inherit", fontSize: "13px", textTransform: "capitalize", background: filter === f ? "var(--accent)" : "transparent", color: filter === f ? "var(--accent-fg)" : "var(--muted)", whiteSpace: "nowrap" }}>{f}</button>
                    ))}
                  </div>
                </div>

                {store.loading && <div style={{ color: "var(--muted)", fontSize: "14px" }}>Loading items…</div>}

                {!store.loading && browseItems.length === 0 && (
                  <div style={{ border: "1px dashed var(--border-subtle)", borderRadius: "16px", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
                    {search ? "No items match your search." : "No items available right now."}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "18px" }}>
                  {browseItems.map((item) => {
                    const alreadyClaimed = myClaims.some((c) => c.itemId === idOf(item));
                    const canClaim = item.status === "found";
                    return (
                      <div key={idOf(item)} style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", overflow: "hidden" }}>
                        <Link href={`/item/${idOf(item)}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                          <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                            <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <StatusPill status={item.status} />
                          </div>
                        </Link>
                        <div style={{ padding: "18px" }}>
                          <Link href={`/item/${idOf(item)}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{item.title}</h3>
                          </Link>
                          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>{item.description}</p>
                          <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--muted)" }}>{item.location} · {item.date}</div>
                          <Link href={`/item/${idOf(item)}`} style={{ display: "block", marginTop: "16px", textAlign: "center", background: !canClaim || alreadyClaimed ? "transparent" : "var(--accent)", color: !canClaim || alreadyClaimed ? "var(--muted)" : "var(--accent-fg)", border: !canClaim || alreadyClaimed ? "1px solid var(--border-subtle)" : "none", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                            {alreadyClaimed ? "Already claimed" : canClaim ? "View and claim" : item.status === "lost" ? "Someone lost this" : "Already returned"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "items" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "18px" }}>
                {(role === "admin" ? store.items : myItems).map((item) => (
                  <div key={idOf(item)} style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", overflow: "hidden" }}>
                    <Link href={`/item/${idOf(item)}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                        <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <StatusPill status={item.status} />
                      </div>
                    </Link>
                    <div style={{ padding: "18px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{item.title}</h3>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</p>
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--muted)" }}>{item.location} · {item.date}</div>

                      {role === "admin" && (
                        <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                          {item.status !== "returned" && (
                            <button onClick={() => store.markReturned(idOf(item))} style={{ flex: 1, background: "var(--accent)", color: "var(--accent-fg)", border: "none", padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Mark returned</button>
                          )}
                          <button onClick={() => store.deleteItem(idOf(item))} style={{ flex: 1, background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", padding: "10px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                        </div>
                      )}

                      {role === "student" && (
                        <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--muted)" }}>
                          {item.approved === false ? "Pending admin approval" : "Live"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "claims" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(role === "admin" ? store.claims : myClaims).length === 0 && (
                  <div style={{ border: "1px dashed var(--border-subtle)", borderRadius: "16px", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
                    {role === "admin" ? "No claims yet." : "You haven't claimed anything yet."}
                  </div>
                )}
                {(role === "admin" ? store.claims : myClaims).map((claim) => (
                  <div key={idOf(claim)}>
                    <ClaimRow claim={claim} isAdmin={role === "admin"} onResolve={store.resolveClaim} />
                    {role === "student" && claim.status !== "pending" && (
                      <div style={{ marginTop: "12px" }}>
                        <ProgressTracker status={claim.status} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "activity" && role === "admin" && (
              <div>
                <p style={{ marginTop: 0, fontSize: "15px", color: "var(--muted)" }}>Full timeline of everything happening on ReclaimHub.</p>
                <div style={{ marginTop: "32px" }}>
                  <Timeline items={store.items} claims={store.claims} full />
                </div>
              </div>
            )}

            {tab === "post" && <PostForm role={role} email={email} onSubmit={store.addItem} />}

            {tab === "settings" && role === "admin" && (
              <div>
                <p style={{ marginTop: 0, fontSize: "15px", color: "var(--muted)" }}>Manage accounts registered on ReclaimHub.</p>

                <AdminCreator />

                <div style={{ marginTop: "32px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "16px", overflow: "hidden", overflowX: "auto" }}>
                  <div style={{ minWidth: "720px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", background: "var(--background)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 600 }}>
                      <div>Email</div>
                      <div>Name</div>
                      <div>Role</div>
                      <div>Joined</div>
                      <div>Activity</div>
                      <div>Actions</div>
                    </div>

                    {users.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>No accounts registered yet.</div>}

                    {users.map((u) => {
                      const userItems = store.items.filter((i) => i.postedByEmail === u.email).length;
                      const userClaims = store.claims.filter((c) => c.studentEmail === u.email).length;
                      const isPermanent = u.email === "admin@reclaimhub.ac.ug";
                      return (
                        <div key={u.email} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", alignItems: "center", fontSize: "14px" }}>
                          <div style={{ wordBreak: "break-all", fontWeight: 500 }}>
                            {u.email}
                            {isPermanent && <span style={{ marginLeft: "8px", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(234,88,12,0.15)", color: "var(--accent)", fontWeight: 700 }}>PERMANENT</span>}
                          </div>
                          <div style={{ color: "var(--muted)" }}>{u.name}</div>
                          <div><span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 10px", borderRadius: "999px", background: u.role === "admin" ? "rgba(234,88,12,0.15)" : "rgba(59,130,246,0.15)", color: u.role === "admin" ? "var(--accent)" : "#60a5fa" }}>{u.role}</span></div>
                          <div style={{ color: "var(--muted)", fontSize: "13px" }}>{new Date(u.joinedAt).toLocaleDateString()}</div>
                          <div style={{ color: "var(--muted)", fontSize: "13px" }}>{userItems} posts · {userClaims} claims</div>
                          <div>
                            {u.role !== "admin" && !isPermanent && (
                              <button onClick={() => deleteUser(u.email)} style={{ background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                            )}
                            {isPermanent && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Locked</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function WelcomeBanner({ name, role, pendingCount }: { name: string; role: Role; pendingCount: number }) {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(234,88,12,0.12), rgba(234,88,12,0.02))", border: "1px solid var(--border-subtle)", borderRadius: "20px", padding: "28px 32px" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px, 4vw, 32px)", margin: 0, letterSpacing: "-0.02em" }}>Welcome back, {name}.</h2>
      <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--muted)", maxWidth: "600px" }}>
        {role === "admin"
          ? pendingCount > 0
            ? `You have ${pendingCount} pending ${pendingCount === 1 ? "claim" : "claims"} waiting for your review.`
            : "Everything's up to date. Nice work."
          : pendingCount > 0
            ? `You have ${pendingCount} claim${pendingCount === 1 ? "" : "s"} under review. We'll notify you soon.`
            : "Here's what's happening with your items."}
      </p>
    </div>
  );
}

function QuickActions({ role, onNavigate }: { role: Role; onNavigate: (t: string) => void }) {
  const actions = role === "admin"
    ? [
        { label: "Post an item", desc: "Add a new found or lost item", tab: "post" },
        { label: "Review claims", desc: "Approve or reject pending claims", tab: "claims" },
        { label: "Manage items", desc: "Edit, delete, or mark returned", tab: "items" },
      ]
    : [
        { label: "Report a lost item", desc: "Tell us what you lost", tab: "post" },
        { label: "Browse items", desc: "See everything on campus", tab: "browse" },
        { label: "Track my claims", desc: "See status of your claims", tab: "claims" },
      ];

  return (
    <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
      {actions.map((a) => (
        <button key={a.label} onClick={() => onNavigate(a.tab)} style={{ textAlign: "left", padding: "22px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "16px", cursor: "pointer", fontFamily: "inherit", color: "inherit" }}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{a.label}</div>
          <div style={{ marginTop: "6px", fontSize: "13px", color: "var(--muted)" }}>{a.desc}</div>
        </button>
      ))}
    </div>
  );
}

function ProgressTracker({ status }: { status: "pending" | "approved" | "rejected" }) {
  const steps = ["Submitted", "Under review", "Decision", "Pickup"];
  const activeIndex = status === "pending" ? 1 : status === "approved" ? 3 : 2;
  const rejected = status === "rejected";

  return (
    <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "14px", padding: "16px 18px", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0", minWidth: "420px" }}>
        {steps.map((s, i) => {
          const done = i <= activeIndex;
          const color = rejected && i === 2 ? "#ef4444" : done ? "var(--accent)" : "var(--border-subtle)";
          return (
            <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "0 0 auto" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "999px", background: done ? color : "transparent", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px", fontWeight: 700 }}>
                  {done && !rejected && i <= activeIndex ? "✓" : ""}
                </div>
                <div style={{ fontSize: "10px", color: done ? "var(--foreground)" : "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {rejected && i === 2 ? "Rejected" : s}
                </div>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: "2px", background: i < activeIndex ? color : "var(--border-subtle)", margin: "0 6px", marginBottom: "18px" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Timeline({ items, claims, full }: { items: Item[]; claims: Claim[]; full?: boolean }) {
  const events = useMemo(() => {
    const list: { time: number; label: string; sub: string; type: "item" | "claim" }[] = [];
    items.forEach((i) => list.push({ time: new Date(i.date).getTime(), label: `Item posted: ${i.title}`, sub: `${i.location} · ${i.status}`, type: "item" }));
    claims.forEach((c) => list.push({ time: new Date(c.createdAt).getTime(), label: `Claim: ${c.itemTitle}`, sub: `by ${c.studentName} · ${c.status}`, type: "claim" }));
    return list.sort((a, b) => b.time - a.time).slice(0, full ? 20 : 6);
  }, [items, claims, full]);

  if (events.length === 0) return <div style={{ color: "var(--muted)", fontSize: "14px" }}>No activity yet.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative" }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: "14px", paddingBottom: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: e.type === "item" ? "var(--accent)" : "#10b981", marginTop: "4px" }} />
            {i < events.length - 1 && <div style={{ width: "2px", flex: 1, background: "var(--border-subtle)", marginTop: "4px" }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: "4px", minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 500 }}>{e.label}</div>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--muted)" }}>{e.sub} · {new Date(e.time).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div style={{ border: `1px solid ${highlight ? "var(--accent)" : "var(--border-subtle)"}`, background: "var(--card)", borderRadius: "16px", padding: "20px" }}>
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>{label}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: "32px", marginTop: "8px", color: accent ? "var(--accent)" : "var(--foreground)" }}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: ItemStatus }) {
  const bg = status === "lost" ? "#ef4444" : status === "found" ? "#10b981" : "#3b82f6";
  return <span style={{ position: "absolute", left: "10px", top: "10px", padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, color: "white", background: bg, textTransform: "uppercase", letterSpacing: "0.06em" }}>{status}</span>;
}

function ItemCard({ item, role }: { item: Item; role: Role }) {
  return (
    <Link href={`/item/${idOf(item)}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "16px", overflow: "hidden", display: "block" }}>
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <StatusPill status={item.status} />
      </div>
      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{item.title}</h3>
        <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--muted)" }}>{item.location}</div>
      </div>
    </Link>
  );
}

function ClaimRow({ claim, isAdmin, onResolve }: { claim: Claim; isAdmin: boolean; onResolve: (id: string, status: "approved" | "rejected", feedback: string) => void }) {
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const bg = claim.status === "approved" ? "rgba(16,185,129,0.12)" : claim.status === "rejected" ? "rgba(239,68,68,0.12)" : "rgba(234,88,12,0.12)";
  const fg = claim.status === "approved" ? "#10b981" : claim.status === "rejected" ? "#ef4444" : "var(--accent)";

  return (
    <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: "16px", padding: "18px", flexWrap: "wrap" }}>
        <img src={claim.itemImage} alt={claim.itemTitle} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "12px", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{claim.itemTitle}</h3>
            <span style={{ background: bg, color: fg, padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{claim.status}</span>
          </div>
          <div style={{ marginTop: "6px", fontSize: "13px", color: "var(--muted)", wordBreak: "break-word" }}>
            {isAdmin ? `${claim.studentName} · ${claim.studentEmail}` : `Submitted ${new Date(claim.createdAt).toLocaleDateString()}`}
          </div>
          {claim.message && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>{claim.message}</p>}
          {claim.feedback && (
            <div style={{ marginTop: "12px", padding: "12px", background: bg, borderRadius: "10px", fontSize: "13px", color: fg }}>
              <strong>Admin feedback:</strong> {claim.feedback}
            </div>
          )}

          {isAdmin && claim.status === "pending" && (
            <div style={{ marginTop: "14px" }}>
              {!open ? (
                <button onClick={() => setOpen(true)} style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Review and respond</button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write feedback for the student" rows={3} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--background)", color: "var(--foreground)", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={() => onResolve(idOf(claim), "approved", feedback || "Approved. Please check your email for pickup details.")} style={{ flex: 1, minWidth: "90px", background: "#10b981", color: "white", border: "none", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                    <button onClick={() => onResolve(idOf(claim), "rejected", feedback || "Rejected. Item doesn't match your description.")} style={{ flex: 1, minWidth: "90px", background: "#ef4444", color: "white", border: "none", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Reject</button>
                    <button onClick={() => setOpen(false)} style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border-subtle)", padding: "10px 16px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminCreator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const { refresh } = useUsers();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!name || !email || !password) { setErr("All fields required."); return; }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "admin", name, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Failed to create admin."); return; }
      setMsg(`Admin ${email} created.`);
      setName(""); setEmail(""); setPassword("");
      await refresh();
      setTimeout(() => setMsg(""), 4000);
    } catch {
      setErr("Network error.");
    }
  };

  return (
    <div style={{ marginTop: "24px", border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "16px", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Add admin account</div>
          <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--muted)" }}>Only existing admins can create new admin accounts.</div>
        </div>
        <button onClick={() => setOpen((o) => !o)} style={{ border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--foreground)", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {open ? "Cancel" : "Add admin"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--background)", color: "var(--foreground)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--background)", color: "var(--foreground)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--background)", color: "var(--foreground)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          {err && <div style={{ fontSize: "12px", color: "#ef4444" }}>{err}</div>}
          {msg && <div style={{ fontSize: "12px", color: "#10b981" }}>{msg}</div>}
          <button type="submit" style={{ padding: "12px", background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>Create admin</button>
        </form>
      )}
    </div>
  );
}

function PostForm({ role, email, onSubmit }: { role: Role; email: string; onSubmit: (item: Omit<Item, "_id" | "id">) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ItemStatus>("found");
  const [image, setImage] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !image) return;
    onSubmit({ title, description, location, date: new Date().toISOString().slice(0, 10), status, image, postedBy: role, postedByEmail: email, approved: role === "admin" });
    setTitle(""); setDescription(""); setLocation(""); setImage("");
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--card)", color: "var(--foreground)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: "640px" }}>
      <p style={{ marginTop: "0", fontSize: "15px", color: "var(--muted)" }}>{role === "admin" ? "Goes live immediately." : "Will appear once an admin approves it."}</p>

      {done && <div style={{ marginTop: "20px", padding: "14px 18px", background: "rgba(16,185,129,0.12)", color: "#10b981", borderRadius: "10px", fontSize: "14px", fontWeight: 500 }}>Item posted successfully</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {(["lost", "found"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)} style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${status === s ? "var(--accent)" : "var(--border-subtle)"}`, background: status === s ? "rgba(234,88,12,0.1)" : "transparent", color: status === s ? "var(--accent)" : "var(--foreground)", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                {s === "lost" ? "Lost" : "Found"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Black iPhone 13" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Any details that would help identify it..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Library, 2nd floor" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Image</label>
          <ImageUpload value={image} onChange={setImage} />
        </div>

        <button type="submit" style={{ padding: "16px", background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", marginTop: "8px" }}>Post item</button>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: "48px", textAlign: "center", color: "var(--muted)" }}>Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
