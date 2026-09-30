import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Account not found" }, { status: 404 });
    }
    if (user.role !== role) {
      return NextResponse.json({ ok: false, error: "Role mismatch" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, email: user.email, name: user.name, role: user.role });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
