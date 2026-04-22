import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "파일 없음", step: "upload-no-file" },
        { status: 400 }
      );
    }

    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(safeName, file, {
      access: "public",
    });

    return NextResponse.json({
      message: "업로드 완료",
      step: "upload-success",
      fileName: file.name,
      url: blob.url,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Blob 업로드 중 오류",
        step: "upload-error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}