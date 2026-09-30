import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

const PERMANENT_ADMIN_EMAIL = "admin@reclaimhub.ac.ug";
const STUDENT_DOMAIN = "@students.cavendish.ac.ug";

async function getCol() {
  const client = await clientPromise;
  const db = client.db("reclaimhub");
  return db.collection("users");
}

export async function GET() {
  try {
    const col = await getCol();
    const users = await col.find({}).sort({ joinedAt: 1 }).toArray();
    return NextResponse.json(users.map((u) => ({ ...u, _id: u._id.toString(), password: undefined })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, role, name, password } = await req.json();

    if (!email || !role || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail === PERMANENT_ADMIN_EMAIL) {
      return NextResponse.json({ error: "That email is reserved." }, { status: 409 });
    }

    if (role === "student" && !normalizedEmail.endsWith(STUDENT_DOMAIN)) {
      return NextResponse.json(
        { error: `Student accounts must use an ${STUDENT_DOMAIN} email.` },
        { status: 400 }
      );
    }

    if (String(password).length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
    }

    const col = await getCol();
    const existing = await col.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await hashPassword(password);

    const user = {
      email: normalizedEmail,
      name: name || normalizedEmail.split("@")[0],
      role,
      password: hashed,
      joinedAt: new Date().toISOString(),
    };
    const result = await col.insertOne(user);
    return NextResponse.json({ ...user, _id: result.insertedId.toString(), password: undefined });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
    if (email === PERMANENT_ADMIN_EMAIL) {
      return NextResponse.json({ error: "The permanent admin account cannot be deleted." }, { status: 403 });
    }
    const col = await getCol();
    await col.deleteOne({ email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
