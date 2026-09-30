import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    const files = await db
      .collection("uploads.files")
      .find({ _id: new ObjectId(id) })
      .toArray();

    if (files.length === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

    const file = files[0];

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": file.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("Serve failed", e);
    return new NextResponse("Server error", { status: 500 });
  }
}
