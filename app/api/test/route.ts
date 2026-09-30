import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const collections = await db.listCollections().toArray();
    return NextResponse.json({
      ok: true,
      database: "reclaimhub",
      collections: collections.map((c) => c.name),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
