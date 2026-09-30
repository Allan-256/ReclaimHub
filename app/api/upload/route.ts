import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Max file size is 5 MB" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("reclaimhub");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });

    const id = uploadStream.id;

    await new Promise<void>((resolve, reject) => {
      uploadStream.on("finish", () => resolve());
      uploadStream.on("error", reject);
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: `/api/uploads/${id.toString()}` });
  } catch (e) {
    console.error("Upload failed", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
