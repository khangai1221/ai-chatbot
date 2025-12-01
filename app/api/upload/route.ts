import { put } from "@vercel/blob";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const filename = `character-${Date.now()}-${file.name}`;

    try {
      // Try Vercel Blob first
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: file.type, // important for images
      });

      return NextResponse.json({ url: blob.url });
    } catch (blobError) {
      console.log(
        "Vercel Blob failed, falling back to local storage:",
        blobError
      );

      // Fallback to local storage
      const filepath = path.join(process.cwd(), "public", "uploads", filename);

      // Ensure uploads directory exists
      const fs = await import("fs");
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Write file to public/uploads
      await writeFile(filepath, buffer);

      // Return public URL
      const url = `/uploads/${filename}`;

      return NextResponse.json({ url });
    }
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
