import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hackToolId = searchParams.get("hackToolId");

    if (!hackToolId) {
      return NextResponse.json([], { status: 200 });
    }

    const result = await pool.query(
      `SELECT 
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
      ORDER BY id DESC`,
      [hackToolId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("이미지 조회 실패:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      hackToolId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      caption,
    } = body;

    if (!hackToolId || !fileName || !filePath) {
      return NextResponse.json(
        { message: "필수값 누락" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO hack_tool_images
      (hack_tool_id, file_name, file_path, file_size, mime_type, caption)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [hackToolId, fileName, filePath, fileSize, mimeType, caption]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("이미지 저장 실패:", error);
    return NextResponse.json(
      { message: "이미지 저장 실패" },
      { status: 500 }
    );
  }
}