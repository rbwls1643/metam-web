import { query } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { latestTestDate } = body;

    if (!id) {
      return Response.json(
        { message: "id가 없습니다." },
        { status: 400 }
      );
    }

    const normalizedDate =
      typeof latestTestDate === "string" && latestTestDate.trim()
        ? latestTestDate.trim()
        : null;

    const result = await query(
      `
      UPDATE hack_tools
      SET
        latest_test_date = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        latest_test_date AS "latestTestDate"
      `,
      [normalizedDate, id]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { message: "대상을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("최근 테스트일 수정 실패:", error);
    return Response.json(
      { message: "최근 테스트일 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}