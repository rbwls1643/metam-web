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

    const {
      gameName,
      name,
      mainTool,
      region,
      uiColorTag,
      downloadUrl,
      creatorUrl,
      saleUrl,
      note,
      latestTestDate,
    } = body;

    if (!id) {
      return Response.json(
        { message: "수정할 id가 없습니다." },
        { status: 400 }
      );
    }

    if (!gameName || !name) {
      return Response.json(
        { message: "게임명과 핵툴명은 필수입니다." },
        { status: 400 }
      );
    }

    const gameResult = await query(
      `SELECT id FROM games WHERE name = $1 LIMIT 1`,
      [gameName]
    );

    if (gameResult.rows.length === 0) {
      return Response.json(
        { message: "선택한 게임을 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const gameId = gameResult.rows[0].id;

    const result = await query(
      `
      UPDATE hack_tools
      SET
        game_id = $1,
        name = $2,
        main_tool_name = $3,
        region = $4,
        ui_color_tag = $5,
        download_url = $6,
        creator_url = $7,
        sale_url = $8,
        note = $9,
        latest_test_date = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING
        id,
        name,
        region,
        main_tool_name AS "mainTool",
        ui_color_tag AS "uiColorTag",
        download_url AS "downloadUrl",
        creator_url AS "creatorUrl",
        sale_url AS "saleUrl",
        note,
        latest_test_date AS "latestTestDate"
      `,
      [
        gameId,
        name,
        mainTool || "",
        region || "",
        uiColorTag || "기본",
        downloadUrl || "",
        creatorUrl || "",
        saleUrl || "",
        note || "",
        latestTestDate || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { message: "수정할 핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("수정 실패:", error);
    return Response.json(
      { message: "수정 중 오류가 발생했습니다." },
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

    const result = await query(
      `
      UPDATE hack_tools
      SET is_active = false
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { message: "삭제할 핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return Response.json({ message: "삭제 완료", id: result.rows[0].id });
  } catch (error) {
    console.error("삭제 실패:", error);
    return Response.json(
      { message: "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}