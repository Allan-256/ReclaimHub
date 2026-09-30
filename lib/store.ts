"use client";

import { useEffect, useState, useCallback } from "react";

export type ItemStatus = "lost" | "found" | "returned";
export type ClaimStatus = "pending" | "approved" | "rejected";

export type Item = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: ItemStatus;
  image: string;
  postedBy: "admin" | "student";
  postedByEmail?: string;
  approved?: boolean;
};

export type Claim = {
  _id?: string;
  id?: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  studentEmail: string;
  studentName: string;
  message: string;
  status: ClaimStatus;
  feedback?: string;
  createdAt: string;
};

export type User = {
  _id?: string;
  email: string;
  name: string;
  role: "student" | "admin";
  joinedAt: string;
};

export function idOf(x: { _id?: string; id?: string }): string {
  return (x._id || x.id || "") as string;
}

export function useStore() {
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        fetch("/api/items", { cache: "no-store" }),
        fetch("/api/claims", { cache: "no-store" }),
      ]);
      setItems(await itemsRes.json());
      setClaims(await claimsRes.json());
    } catch (e) {
      console.error("Store fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (item: Omit<Item, "_id" | "id">) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const created = await res.json();
    setItems((prev) => [created, ...prev]);
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/items?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => idOf(i) !== id));
  };

  const markReturned = async (id: string) => {
    await fetch("/api/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "returned" }),
    });
    setItems((prev) => prev.map((i) => (idOf(i) === id ? { ...i, status: "returned" } : i)));
  };

  const approveItem = async (id: string) => {
    await fetch("/api/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: true }),
    });
    setItems((prev) => prev.map((i) => (idOf(i) === id ? { ...i, approved: true } : i)));
  };

  const addClaim = async (claim: Omit<Claim, "_id" | "id" | "createdAt" | "status">) => {
    const body = { ...claim, status: "pending", createdAt: new Date().toISOString() };
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const created = await res.json();
    setClaims((prev) => [created, ...prev]);
  };

  const resolveClaim = async (id: string, status: ClaimStatus, feedback: string) => {
    await fetch("/api/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, feedback }),
    });
    setClaims((prev) => prev.map((c) => (idOf(c) === id ? { ...c, status, feedback } : c)));
  };

  return { items, claims, loading, addItem, deleteItem, markReturned, approveItem, addClaim, resolveClaim, refresh };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteUser = async (email: string) => {
    await fetch(`/api/users?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.email !== email));
  };

  return { users, loading, deleteUser, refresh };
}

export async function registerUser(email: string, role: "student" | "admin", name?: string, password?: string) {
  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, name, password }),
    });
    const data = await res.json();
    return { ok: res.ok, error: data.error };
  } catch (e) {
    console.error("registerUser failed", e);
    return { ok: false, error: "Network error" };
  }
}

export function useNotifications() {
  const [seen, setSeen] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("rh_seen");
    setSeen(raw ? JSON.parse(raw) : []);
  }, []);
  const markSeen = (id: string) => {
    const next = [...seen, id];
    setSeen(next);
    localStorage.setItem("rh_seen", JSON.stringify(next));
  };
  return { seen, markSeen };
}
