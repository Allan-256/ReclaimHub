import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

async function getCol() {
  const client = await clientPromise;
  const db = client.db("reclaimhub");
  return db.collection("items");
}

export async function GET() {
  try {
    const col = await getCol();
    const items = await col.find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json(
      items.map((i) => ({ ...i, _id: i._id.toString() }))
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const col = await getCol();
    const result = await col.insertOne(body);
    return NextResponse.json({ ...body, _id: result.insertedId.toString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { ObjectId } = await import("mongodb");
    const col = await getCol();
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { ObjectId } = await import("mongodb");
    const col = await getCol();
    await col.updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
