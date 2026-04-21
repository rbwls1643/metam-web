import { query } from "@/lib/db";

async function syncLatestTestDate(hackToolId: number) {
  await query(
    `
    UPDATE hack_tools
    SET latest_test_date = latest.latest_date
    FROM (
      SELECT
        $1::int AS hack_tool_id,
        MAX(test_date) AS latest_date
      FROM test_histories
      WHERE hack_tool_id = $1
    ) latest
    WHERE hack_tools.id = latest.hack_tool_id
    `,
    [hackToolId]
  );
}

export async function GET(req: Request) {
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
      test_date AS "testDate",
      test_time AS "testTime",
      test_reason AS "testReason",
      test_account AS "testAccount",
      used_features AS "usedFeatures",
      test_result AS "testResult"
    FROM test_histories
    WHERE hack_tool_id = $1
    ORDER BY test_date DESC, id DESC
    `,
    [hackToolId]
  );

  return Response.json(result.rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      hackToolId,
      testDate,
      testTime,
      testReason,
      testAccount,
      usedFeatures,
      testResult,
    } = body;

    if (!hackToolId || !testDate || !testResult) {
      return Response.json(
        { message: "hackToolId, testDate, testResult는 필수입니다." },
        { status: 400 }
      );
    }

    const result = await query(
      `
      INSERT INTO test_histories (
        hack_tool_id,
        test_date,
        test_time,
        test_reason,
        test_account,
        used_features,
        test_result
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
        hackToolId,
        testDate,
        testTime || "",
        testReason || "",
        testAccount || "",
        usedFeatures || "",
        testResult,
      ]
    );

    await syncLatestTestDate(Number(hackToolId));

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("테스트 이력 추가 실패:", error);
    return Response.json(
      { message: "테스트 이력 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}