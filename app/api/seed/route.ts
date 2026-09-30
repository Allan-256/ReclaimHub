import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const SEED_ITEMS = [
  { title: "Black iPhone 13", description: "Cracked screen protector, blue case.", location: "Library, 2nd floor", date: "2026-09-28", status: "found", image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80", postedBy: "admin", approved: true },
  { title: "Student ID Card", description: "Name: A. Nakato. Faculty of Engineering.", location: "Main Gate", date: "2026-09-27", status: "found", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", postedBy: "admin", approved: true },
  { title: "Silver Wrist Watch", description: "Leather strap, engraved initials on back.", location: "Cafeteria", date: "2026-09-26", status: "lost", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80", postedBy: "student", approved: true },
  { title: "Blue Backpack", description: "Contains textbooks and a calculator.", location: "Lecture Hall B", date: "2026-09-25", status: "lost", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", postedBy: "admin", approved: true },
  { title: "HP Laptop Charger", description: "Returned to owner on 2026-09-24.", location: "Computer Lab", date: "2026-09-24", status: "returned", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", postedBy: "admin", approved: true },
  { title: "Reading Glasses", description: "Brown frame, returned to owner.", location: "Library", date: "2026-09-22", status: "returned", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80", postedBy: "admin", approved: true },
  { title: "Wireless Earbuds", description: "White case, small scratch on lid.", location: "Bus Park", date: "2026-09-29", status: "found", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80", postedBy: "admin", approved: true },
  { title: "Red Notebook", description: "Contains handwritten chemistry notes.", location: "Science Block", date: "2026-09-23", status: "lost", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80", postedBy: "student", approved: true },
];

const SEED_USERS = [
  { email: "admin@reclaimhub.edu", name: "Admin", role: "admin", joinedAt: "2026-09-01T08:00:00.000Z" },
  { email: "aisha@students.cavendish.ac.ug", name: "Aisha", role: "student", joinedAt: "2026-09-12T10:24:00.000Z" },
  { email: "marcus@students.cavendish.ac.ug", name: "Marcus", role: "student", joinedAt: "2026-09-14T14:11:00.000Z" },
  { email: "priya@students.cavendish.ac.ug", name: "Priya", role: "student", joinedAt: "2026-09-18T09:47:00.000Z" },
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const itemsCol = db.collection("items");
    const usersCol = db.collection("users");

    const itemCount = await itemsCol.countDocuments();
    if (itemCount === 0) await itemsCol.insertMany(SEED_ITEMS);

    const userCount = await usersCol.countDocuments();
    if (userCount === 0) await usersCol.insertMany(SEED_USERS);

    return NextResponse.json({ ok: true, seededItems: itemCount === 0, seededUsers: userCount === 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
