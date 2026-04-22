import { query } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeRegion(region?: string | null) {
  if (!region) return "글로벌";
  if (region === "한국") return "국내";
  return region;
}

function normalizeColorTag(color?: string | null) {
  if (!color) return "기본";
  return color;
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const result = await query(
      `
      SELECT
        ht.id,
        ht.name,
        ht.main_tool_name AS "mainToolName",
        ht.region,
        ht.ui_color_tag AS "uiColorTag",
        ht.download_url AS "downloadUrl",
        ht.creator_url AS "creatorUrl",
        ht.sale_url AS "saleUrl",
        ht.note,
        ht.latest_test_date AS "latestTestDate",
        ht.is_active AS "isActive",
        ht.created_by AS "createdBy",
        ht.created_at AS "createdAt",
        ht.updated_at AS "updatedAt",
        g.name AS "gameName"
      FROM hack_tools ht
      LEFT JOIN games g
        ON ht.game_id = g.id
      WHERE ht.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { message: "해당 핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const item = result.rows[0];

    return Response.json({
      ...item,
      region: normalizeRegion(item.region),
      uiColorTag: normalizeColorTag(item.uiColorTag),
    });
  } catch (error) {
    console.error("핵툴 단건 조회 실패:", error);
    return Response.json(
      { message: "핵툴 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const name = body.name?.trim();
    const mainToolName = body.mainToolName?.trim() || name;
    const region = normalizeRegion(body.region);
    const uiColorTag = normalizeColorTag(body.uiColorTag);
    const downloadUrl = body.downloadUrl?.trim() || null;
    const creatorUrl = body.creatorUrl?.trim() || null;
    const saleUrl = body.saleUrl?.trim() || null;

    if (!name) {
      return Response.json(
        { message: "핵툴명이 필요합니다." },
        { status: 400 }
      );
    }

    const result = await query(
      `
      UPDATE hack_tools
      SET
        name = $1,
        main_tool_name = $2,
        region = $3,
        ui_color_tag = $4,
        download_url = $5,
        creator_url = $6,
        sale_url = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING
        id,
        name,
        main_tool_name AS "mainToolName",
        region,
        ui_color_tag AS "uiColorTag",
        download_url AS "downloadUrl",
        creator_url AS "creatorUrl",
        sale_url AS "saleUrl",
        note,
        latest_test_date AS "latestTestDate",
        is_active AS "isActive",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        name,
        mainToolName,
        region,
        uiColorTag,
        downloadUrl,
        creatorUrl,
        saleUrl,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { message: "수정할 핵툴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const item = result.rows[0];

    return Response.json({
      message: "핵툴 수정 완료",
      item: {
        ...item,
        region: normalizeRegion(item.region),
        uiColorTag: normalizeColorTag(item.uiColorTag),
      },
    });
  } catch (error) {
    console.error("핵툴 수정 실패:", error);
    return Response.json(
      { message: "핵툴 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const result = await query(
      `
      DELETE FROM hack_tools
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

    return Response.json({
      message: "삭제 완료",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("핵툴 삭제 실패:", error);
    return Response.json(
      { message: "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}