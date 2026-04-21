import { query } from "@/lib/db";

type HackToolRow = {
  id: number;
  name: string;
  region: string | null;
  uiColorTag: string | null;
  downloadUrl: string | null;
  creatorUrl: string | null;
  saleUrl: string | null;
  latestTestDate: string | null;
  gameName: string | null;
  createdAt: string | null;
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

export async function GET() {
  try {
    const result = await query(
      `
      SELECT
        ht.id,
        ht.name,
        ht.region,
        ht.ui_color_tag AS "uiColorTag",
        ht.download_url AS "downloadUrl",
        ht.creator_url AS "creatorUrl",
        ht.sale_url AS "saleUrl",
        ht.latest_test_date AS "latestTestDate",
        g.name AS "gameName",
        ht.created_at AS "createdAt"
      FROM hack_tools ht
      LEFT JOIN games g
        ON ht.game_id = g.id
      ORDER BY ht.id ASC
      `
    );

    const rows: HackToolRow[] = result.rows.map((row: HackToolRow) => ({
      ...row,
      region: normalizeRegion(row.region),
      uiColorTag: normalizeColorTag(row.uiColorTag),
    }));

    return Response.json(rows);
  } catch (error) {
    console.error("핵툴 목록 조회 실패:", error);
    return Response.json(
      { message: "핵툴 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const gameName = body.gameName?.trim();
    const name = body.name?.trim();
    const region = normalizeRegion(body.region);
    const uiColorTag = normalizeColorTag(body.uiColorTag);
    const downloadUrl = body.downloadUrl?.trim() || null;
    const creatorUrl = body.creatorUrl?.trim() || null;
    const saleUrl = body.saleUrl?.trim() || null;

    if (!gameName) {
      return Response.json(
        { message: "gameName이 필요합니다." },
        { status: 400 }
      );
    }

    if (!name) {
      return Response.json(
        { message: "핵툴명이 필요합니다." },
        { status: 400 }
      );
    }

    const gameResult = await query(
      `
      SELECT id, name
      FROM games
      WHERE name = $1
      LIMIT 1
      `,
      [gameName]
    );

    if (gameResult.rowCount === 0) {
      return Response.json(
        { message: "일치하는 게임을 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const gameId = gameResult.rows[0].id;

    const insertResult = await query(
      `
      INSERT INTO hack_tools (
        game_id,
        name,
        region,
        ui_color_tag,
        download_url,
        creator_url,
        sale_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        name,
        region,
        ui_color_tag AS "uiColorTag",
        download_url AS "downloadUrl",
        creator_url AS "creatorUrl",
        sale_url AS "saleUrl",
        latest_test_date AS "latestTestDate",
        created_at AS "createdAt"
      `,
      [gameId, name, region, uiColorTag, downloadUrl, creatorUrl, saleUrl]
    );

    const created = insertResult.rows[0];

    return Response.json({
      message: "핵툴이 추가되었습니다.",
      item: {
        ...created,
        region: normalizeRegion(created.region),
        uiColorTag: normalizeColorTag(created.uiColorTag),
        gameName,
      },
    });
  } catch (error) {
    console.error("핵툴 추가 실패:", error);
    return Response.json(
      { message: "핵툴 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}