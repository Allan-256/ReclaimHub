"use client";

import { useStore } from "@/lib/store";

export default function AdminAnalytics() {
  const { items, claims } = useStore();

  const lost = items.filter((i) => i.status === "lost").length;
  const found = items.filter((i) => i.status === "found").length;
  const returned = items.filter((i) => i.status === "returned").length;
  const statusBars = [
    { label: "Lost", value: lost, color: "#ef4444" },
    { label: "Found", value: found, color: "#10b981" },
    { label: "Returned", value: returned, color: "#3b82f6" },
  ];
  const maxStatus = Math.max(lost, found, returned, 1);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const perDay = days.map((day) => items.filter((i) => i.date === day).length);
  const maxDay = Math.max(...perDay, 1);

  const pending = claims.filter((c) => c.status === "pending").length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const totalClaims = pending + approved + rejected;

  const donutSegments = [
    { label: "Pending", value: pending, color: "#f97316" },
    { label: "Approved", value: approved, color: "#10b981" },
    { label: "Rejected", value: rejected, color: "#ef4444" },
  ];

  const donutR = 60;
  const donutC = 2 * Math.PI * donutR;
  let donutOffset = 0;

  const locationCounts: Record<string, number> = {};
  items.forEach((i) => {
    const key = i.location.split(",")[0].trim();
    locationCounts[key] = (locationCounts[key] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxLocation = Math.max(...topLocations.map(([, v]) => v), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <p style={{ margin: 0, fontSize: "15px", color: "var(--muted)" }}>Overview of items and claims activity.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" }}>
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", padding: "28px" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0, letterSpacing: "-0.01em" }}>Items by status</h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>How items are distributed right now</p>

          <div style={{ marginTop: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "200px", gap: "24px" }}>
            {statusBars.map((bar) => {
              const heightPct = (bar.value / maxStatus) * 100;
              return (
                <div key={bar.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "24px", fontFamily: "Georgia, serif", fontWeight: 600, color: bar.color }}>{bar.value}</div>
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPct}%`,
                      minHeight: bar.value > 0 ? "8px" : "2px",
                      background: bar.value > 0 ? bar.color : "var(--border-subtle)",
                      borderRadius: "8px 8px 4px 4px",
                      transition: "height 0.6s ease",
                    }}
                  />
                  <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{bar.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", padding: "28px" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0, letterSpacing: "-0.01em" }}>Claims</h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>{totalClaims} total claims</p>

          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={donutR} fill="none" stroke="var(--border-subtle)" strokeWidth="18" />
              {totalClaims > 0 && donutSegments.map((seg) => {
                const segLen = (seg.value / totalClaims) * donutC;
                const segEl = (
                  <circle
                    key={seg.label}
                    cx="80"
                    cy="80"
                    r={donutR}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${segLen} ${donutC - segLen}`}
                    strokeDashoffset={-donutOffset}
                    transform="rotate(-90 80 80)"
                  />
                );
                donutOffset += segLen;
                return segEl;
              })}
              <text x="80" y="76" textAnchor="middle" fontSize="12" fill="var(--muted)">Total</text>
              <text x="80" y="96" textAnchor="middle" fontSize="26" fontWeight="600" fill="var(--foreground)" fontFamily="Georgia, serif">{totalClaims}</text>
            </svg>
          </div>

          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {donutSegments.map((seg) => (
              <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: seg.color }} />
                <span style={{ flex: 1 }}>{seg.label}</span>
                <span style={{ color: "var(--muted)" }}>{seg.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", padding: "28px" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0, letterSpacing: "-0.01em" }}>Items reported, last 7 days</h3>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>Daily activity trend</p>

        <div style={{ marginTop: "28px", position: "relative", height: "180px" }}>
          <svg width="100%" height="180" viewBox="0 0 700 180" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="0" y1={i * 60} x2="700" y2={i * 60} stroke="var(--border-subtle)" strokeDasharray="4 6" strokeWidth="1" />
            ))}
            <path
              d={`M 0 ${180 - (perDay[0] / maxDay) * 150} ${perDay.map((v, i) => `L ${(i / (perDay.length - 1)) * 700} ${180 - (v / maxDay) * 150}`).join(" ")} L 700 180 L 0 180 Z`}
              fill="rgba(234,88,12,0.15)"
            />
            <path
              d={`M 0 ${180 - (perDay[0] / maxDay) * 150} ${perDay.map((v, i) => `L ${(i / (perDay.length - 1)) * 700} ${180 - (v / maxDay) * 150}`).join(" ")}`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {perDay.map((v, i) => (
              <circle key={i} cx={(i / (perDay.length - 1)) * 700} cy={180 - (v / maxDay) * 150} r="5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2" />
            ))}
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", color: "var(--muted)" }}>
          {days.map((d) => (
            <span key={d}>{new Date(d).toLocaleDateString(undefined, { weekday: "short" })}</span>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid var(--border-subtle)", background: "var(--card)", borderRadius: "18px", padding: "28px" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0, letterSpacing: "-0.01em" }}>Top locations</h3>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>Where items are most commonly lost or found</p>

        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {topLocations.length === 0 && <div style={{ color: "var(--muted)", fontSize: "13px" }}>No location data yet.</div>}
          {topLocations.map(([loc, count]) => (
            <div key={loc}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                <span>{loc}</span>
                <span style={{ color: "var(--muted)" }}>{count} {count === 1 ? "item" : "items"}</span>
              </div>
              <div style={{ height: "10px", background: "var(--background)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ width: `${(count / maxLocation) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: "999px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
