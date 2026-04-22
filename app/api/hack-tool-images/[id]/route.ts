import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const result = await query(
      `
      DELETE FROM hack_tool_images
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "삭제할 이미지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "이미지 삭제 완료",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("이미지 삭제 실패:", error);

    return NextResponse.json(
      { message: "이미지 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}