import { query } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function syncLatestTestDate(hackToolId: number) {
  await query(
    `
    UPDATE hack_tools
    SET latest_test_date = sub.latest_date
    FROM (
      SELECT MAX(test_date) AS latest_date
      FROM test_histories
      WHERE hack_tool_id = $1
    ) sub
    WHERE hack_tools.id = $1
    `,
    [hackToolId]
  );

  await query(
    `
    UPDATE hack_tools
    SET latest_test_date = NULL
    WHERE id = $1
      AND NOT EXISTS (
        SELECT 1
        FROM test_histories
        WHERE hack_tool_id = $1
      )
    `,
    [hackToolId]
  );
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      testDate,
      testTime,
      testReason,
      testAccount,
      usedFeatures,
      testResult,
    } = body;

    if (!id) {
      return Response.json(
        { message: "수정할 id가 없습니다." },
        { status: 400 }
      );
    }

    if (!testDate || !testResult) {
      return Response.json(
        { message: "testDate와 testResult는 필수입니다." },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT hack_tool_id FROM test_histories WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return Response.json(
        { message: "수정할 테스트 이력을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const hackToolId = existing.rows[0].hack_tool_id;

    const result = await query(
      `
      UPDATE test_histories
      SET
        test_date = $1,
        test_time = $2,
        test_reason = $3,
        test_account = $4,
        used_features = $5,
        test_result = $6
      WHERE id = $7
      RETURNING
        id,
        hack_tool_id AS "hackToolId",
        test_date AS "testDate",
        test_time AS "testTime",
        test_reason AS "testReason",
        test_account AS "testAccount",
        used_features AS "usedFeatures",
        test_result AS "testResult"
      `,
      [
        testDate,
        testTime || "",
        testReason || "",
        testAccount || "",
        usedFeatures || "",
        testResult,
        id,
      ]
    );

    await syncLatestTestDate(Number(hackToolId));

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("테스트 이력 수정 실패:", error);
    return Response.json(
      { message: "테스트 이력 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { message: "삭제할 id가 없습니다." },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT hack_tool_id FROM test_histories WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return Response.json(
        { message: "삭제할 테스트 이력을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const hackToolId = existing.rows[0].hack_tool_id;

    await query(`DELETE FROM test_histories WHERE id = $1`, [id]);

    await syncLatestTestDate(Number(hackToolId));

    return Response.json({ message: "삭제 완료", id });
  } catch (error) {
    console.error("테스트 이력 삭제 실패:", error);
    return Response.json(
      { message: "테스트 이력 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}