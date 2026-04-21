import fs from "fs";
import path from "path";
import { query } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function resolvePublicFilePath(filePath: string) {
  const normalized = filePath.replace(/^\/+/, "");
  return path.join(process.cwd(), "public", normalized);
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { message: "삭제할 이미지 id가 없습니다." },
        { status: 400 }
      );
    }

    const selectResult = await query(
      `
      SELECT id, file_path AS "filePath"
      FROM hack_tool_images
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (selectResult.rowCount === 0) {
      return Response.json(
        { message: "삭제할 이미지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const image = selectResult.rows[0];

    await query(
      `
      DELETE FROM hack_tool_images
      WHERE id = $1
      `,
      [id]
    );

    if (image.filePath) {
      const absolutePath = resolvePublicFilePath(image.filePath);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    return Response.json({ message: "이미지 삭제 완료", id });
  } catch (error) {
    console.error("이미지 삭제 실패:", error);
    return Response.json(
      { message: "이미지 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}