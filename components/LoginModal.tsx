"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = { open: boolean; onClose: () => void; onChoose: (role: "student" | "admin") => void };

export default function LoginModal({ open, onClose, onChoose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl border p-8 shadow-2xl"
            style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 transition hover:opacity-70"
              style={{ color: "var(--muted)" }}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 className="font-serif text-2xl tracking-tight">Sign in to ReclaimHub</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              You need to be signed in to view item details and make claims.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => onChoose("student")}
                className="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition hover:opacity-90"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="rounded-full p-3" style={{ background: "rgba(234,88,12,0.12)", color: "var(--accent)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Continue as Student</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>Post items, claim found items</div>
                </div>
              </button>

              <button
                onClick={() => onChoose("admin")}
                className="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition hover:opacity-90"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="rounded-full p-3" style={{ background: "rgba(234,88,12,0.12)", color: "var(--accent)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Continue as Admin</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>Approve claims, moderate items</div>
                </div>
              </button>
            </div>

            <p className="mt-6 text-center text-xs" style={{ color: "var(--muted)" }}>
              Demo mode — real authentication coming soon.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
