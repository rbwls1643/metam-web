import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "업로드할 파일이 없습니다." },
        { status: 400 }
      );
    }

    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(safeName, file, {
      access: "public",
    });

    return NextResponse.json({
      message: "업로드 완료",
      fileName: file.name,
      url: blob.url,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Blob 업로드 실패:", error);

    return NextResponse.json(
      { message: "Blob 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}