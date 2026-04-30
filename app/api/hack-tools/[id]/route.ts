import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const result = await query(
      `
      SELECT
        h.*,
        g.name AS game_name
      FROM hack_tools h
      LEFT JOIN games g ON g.id = h.game_id
      WHERE h.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(mapHackTool(result.rows[0]));
  } catch (error) {
    console.error("핵툴 상세 조회 실패:", error);
    return NextResponse.json(
      { message: "핵툴 상세 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
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
      UPDATE hack_tools
      SET
        game_id = $1,
        name = $2,
        main_tool_name = $3,
        region = $4,
        ui_color_tag = $5,
        latest_test_date = $6,
        detection_bypass = $7,
        test_features = $8,
        hack_type = $9,
        download_url = $10,
        creator_url = $11,
        sale_url = $12,
        note = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
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
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "수정할 핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(mapHackTool(result.rows[0]));
  } catch (error) {
    console.error("핵툴 수정 실패:", error);
    return NextResponse.json(
      { message: "핵툴 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const result = await query(
      `
      UPDATE hack_tools
      SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "삭제할 핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "핵툴 삭제 완료",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("핵툴 삭제 실패:", error);
    return NextResponse.json(
      { message: "핵툴 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}