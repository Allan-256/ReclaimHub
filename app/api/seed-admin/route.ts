import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

const PERMANENT_ADMIN = {
  email: "admin@reclaimhub.ac.ug",
  name: "Super Admin",
  role: "admin" as const,
  password: "admin123",
  permanent: true,
  joinedAt: "2026-01-01T00:00:00.000Z",
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const users = db.collection("users");

    const hashed = await hashPassword(PERMANENT_ADMIN.password);
    const existing = await users.findOne({ email: PERMANENT_ADMIN.email });

    if (existing) {
      await users.updateOne(
        { email: PERMANENT_ADMIN.email },
        {
          $set: {
            permanent: true,
            role: "admin",
            password: hashed,
            name: PERMANENT_ADMIN.name,
          },
        }
      );
      return NextResponse.json({
        ok: true,
        message: "Permanent admin updated",
        email: PERMANENT_ADMIN.email,
      });
    }

    await users.insertOne({ ...PERMANENT_ADMIN, password: hashed });

    return NextResponse.json({
      ok: true,
      message: "Permanent admin created",
      email: PERMANENT_ADMIN.email,
      password: PERMANENT_ADMIN.password,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
