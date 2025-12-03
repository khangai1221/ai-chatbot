import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const file = fileEntry as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name
      ? String(file.name).replace(/[^a-zA-Z0-9._-]/g, "-")
      : "upload";
    const filename = `character-${Date.now()}-${safeName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Upload failed", details: message },
      { status: 500 }
    );
  }
}
