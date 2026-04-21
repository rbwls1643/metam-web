import { query } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hackToolId = searchParams.get("hackToolId");

    if (!hackToolId) {
      return Response.json(
        { message: "hackToolId가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await query(
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

    return Response.json(result.rows);
  } catch (error) {
    console.error("이미지 목록 조회 실패:", error);
    return Response.json(
      { message: "이미지 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const hackToolId = formData.get("hackToolId")?.toString();
    const caption = formData.get("caption")?.toString() ?? "";
    const file = formData.get("file");

    if (!hackToolId) {
      return Response.json(
        { message: "hackToolId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return Response.json(
        { message: "업로드할 파일이 필요합니다." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { message: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    const adminResult = await query(
      `SELECT id FROM users WHERE login_id = 'admin' LIMIT 1`
    );

    if (adminResult.rows.length === 0) {
      return Response.json(
        { message: "admin 사용자를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const uploadedBy = adminResult.rows[0].id;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "hack-tools");
    await mkdir(uploadDir, { recursive: true });

    const safeFileName = file.name.replace(/[^\w.\-가-힣]/g, "_");
    const storedFileName = `${randomUUID()}-${safeFileName}`;
    const absoluteFilePath = path.join(uploadDir, storedFileName);
    const publicFilePath = `/uploads/hack-tools/${storedFileName}`;

    await writeFile(absoluteFilePath, buffer);

    const result = await query(
      `
      INSERT INTO hack_tool_images (
        hack_tool_id,
        file_name,
        file_path,
        file_size,
        mime_type,
        caption,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      [
        hackToolId,
        file.name,
        publicFilePath,
        file.size,
        file.type,
        caption,
        uploadedBy,
      ]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    return Response.json(
      { message: "이미지 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}