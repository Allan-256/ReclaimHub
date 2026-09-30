import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "No account with that email" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password || "");
    if (!ok) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
