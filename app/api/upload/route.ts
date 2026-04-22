import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("[upload] start");

    const formData = await request.formData();
    const file = formData.get("file");

    console.log("[upload] file exists:", file instanceof File);

    if (!(file instanceof File)) {
      console.error("[upload] invalid file");
      return NextResponse.json(
        { message: "업로드할 파일이 없습니다.", step: "upload-no-file" },
        { status: 400 }
      );
    }

    console.log("[upload] file info:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(safeName, file, {
      access: "public",
    });

    console.log("[upload] blob success:", blob.url);

    return NextResponse.json({
      message: "업로드 완료",
      step: "upload-success",
      fileName: file.name,
      url: blob.url,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("[upload] blob upload failed:", error);

    return NextResponse.json(
      {
        message: "Blob 업로드 중 오류가 발생했습니다.",
        step: "upload-error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}