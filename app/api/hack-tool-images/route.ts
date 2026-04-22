import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hackToolId = searchParams.get("hackToolId");

    console.log("[hack-tool-images][GET] hackToolId:", hackToolId);

    if (!hackToolId) {
      return NextResponse.json([], { status: 200 });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        hack_tool_id AS "hackToolId",
        file_name AS "fileName",
        file_path AS "filePath",
        file_size AS "fileSize",
        mime_type AS "mimeType",
        caption,
        uploaded_at AS "uploadedAt"
      FROM hack_tool_images
      WHERE hack_tool_id = $1
      ORDER BY id DESC
      `,
      [hackToolId]
    );

    console.log("[hack-tool-images][GET] rows:", result.rowCount);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[hack-tool-images][GET] failed:", error);
    return NextResponse.json(
      {
        message: "이미지 목록 조회 실패",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("[hack-tool-images][POST] body:", body);

    const {
      hackToolId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      caption,
    } = body;

    if (!hackToolId || !fileName || !filePath) {
      console.error("[hack-tool-images][POST] missing fields");
      return NextResponse.json(
        {
          message: "필수값 누락",
          step: "db-missing-fields",
          received: {
            hackToolId,
            fileName,
            filePath,
            fileSize,
            mimeType,
            caption,
          },
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO hack_tool_images
      (hack_tool_id, file_name, file_path, file_size, mime_type, caption)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        hack_tool_id AS "hackToolId",
        file_name AS "fileName",
        file_path AS "filePath",
        file_size AS "fileSize",
        mime_type AS "mimeType",
        caption,
        uploaded_at AS "uploadedAt"
      `,
      [hackToolId, fileName, filePath, fileSize, mimeType, caption ?? ""]
    );

    console.log("[hack-tool-images][POST] insert success:", result.rows[0]);

    return NextResponse.json({
      message: "이미지 저장 완료",
      step: "db-save-success",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("[hack-tool-images][POST] insert failed:", error);

    return NextResponse.json(
      {
        message: "이미지 저장 실패",
        step: "db-save-error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}