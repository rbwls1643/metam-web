import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function mapHackTool(row: any) {
  return {
    id: row.id,
    gameId: row.game_id,
    gameName: row.game_name,
    name: row.name,
    mainToolName: row.main_tool_name,
    region: row.region,
    uiColorTag: row.ui_color_tag,
    latestTestDate: row.latest_test_date,
    detectionBypass: row.detection_bypass,
    testFeatures: row.test_features,
    hackType: row.hack_type,
    downloadUrl: row.download_url,
    creatorUrl: row.creator_url,
    saleUrl: row.sale_url,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameName = searchParams.get("gameName");

    const result = await query(
      `
      SELECT
        h.*,
        g.name AS game_name
      FROM hack_tools h
      LEFT JOIN games g ON g.id = h.game_id
      WHERE h.is_active = true
        AND ($1::text IS NULL OR g.name = $1)
      ORDER BY h.id ASC
      `,
      [gameName]
    );

    return NextResponse.json(result.rows.map(mapHackTool));
  } catch (error) {
    console.error("핵툴 목록 조회 실패:", error);
    return NextResponse.json(
      { message: "핵툴 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      gameName,
      name,
      mainToolName,
      region,
      uiColorTag,
      latestTestDate,
      detectionBypass,
      testFeatures,
      hackType,
      downloadUrl,
      creatorUrl,
      saleUrl,
      note,
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: "핵툴명은 필수입니다." },
        { status: 400 }
      );
    }

    const gameResult = await query(
      `
      SELECT id
      FROM games
      WHERE name = $1
      LIMIT 1
      `,
      [gameName || "PUBG PC"]
    );

    const gameId = gameResult.rows[0]?.id ?? null;

    const result = await query(
      `
      INSERT INTO hack_tools (
        game_id,
        name,
        main_tool_name,
        region,
        ui_color_tag,
        latest_test_date,
        detection_bypass,
        test_features,
        hack_type,
        download_url,
        creator_url,
        sale_url,
        note
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12, $13
      )
      RETURNING *
      `,
      [
        gameId,
        name,
        mainToolName || null,
        region || "글로벌",
        uiColorTag || "기본",
        latestTestDate || null,
        detectionBypass || "확인 전",
        testFeatures || null,
        hackType || "일반 핵",
        downloadUrl || null,
        creatorUrl || null,
        saleUrl || null,
        note || null,
      ]
    );

    return NextResponse.json(mapHackTool(result.rows[0]));
  } catch (error) {
    console.error("핵툴 생성 실패:", error);
    return NextResponse.json(
      { message: "핵툴 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}