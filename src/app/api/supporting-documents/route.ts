import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileExt = originalName.split(".").pop();
  return `${timestamp}-${randomStr}.${fileExt}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "supporting-docs");
    const fileUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename using timestamp and random string
      const fileName = generateUniqueFileName(file.name);
      const filePath = join(uploadDir, fileName);

      // Save the file
      await writeFile(filePath, buffer);
      fileUrls.push(`/uploads/supporting-docs/${fileName}`);
    }

    return NextResponse.json({ fileUrls }, { status: 201 });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
