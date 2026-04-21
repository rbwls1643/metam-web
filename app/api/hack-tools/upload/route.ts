import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { query } from "@/lib/db";

type UploadRow = {
  gameName: string;
  name: string;
  region: string;
  uiColorTag: string;
  downloadUrl: string;
  creatorUrl: string;
  saleUrl: string;
  note: string;
};

const ALLOWED_UI_COLORS = [
  "빨강",
  "주황",
  "노랑",
  "초록",
  "파랑",
  "남색",
  "보라",
  "흰색",
  "검정",
  "기본",
] as const;

const ALLOWED_REGIONS = ["중국", "국내", "글로벌"] as const;

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/\uFEFF/g, "")
    .trim();
}

function normalizeRegion(value: string): string {
  const v = value.trim();
  const lower = v.toLowerCase();

  if (!v) return "";

  if (v.includes("중국") || lower === "cn" || lower.includes("china")) {
    return "중국";
  }

  if (
    v.includes("국내") ||
    v.includes("한국") ||
    lower === "kr" ||
    lower.includes("korea")
  ) {
    return "국내";
  }

  if (
    v.includes("글로벌") ||
    lower === "gb" ||
    lower.includes("global")
  ) {
    return "글로벌";
  }

  return v;
}

function normalizeUiColor(value: string): string {
  const v = value.trim();
  const lower = v.toLowerCase();

  if (!v) return "기본";

  if (v === "빨강" || lower === "red") return "빨강";
  if (v === "주황" || lower === "orange") return "주황";
  if (v === "노랑" || lower === "yellow") return "노랑";
  if (v === "초록" || lower === "green") return "초록";
  if (v === "파랑" || lower === "blue") return "파랑";
  if (v === "남색" || lower === "indigo" || lower === "navy") return "남색";
  if (v === "보라" || lower === "purple") return "보라";
  if (v === "흰색" || v === "희색" || lower === "white") return "흰색";
  if (v === "검정" || v === "검정색" || lower === "black") return "검정";

  return "기본";
}

function buildRowsFromSheet(worksheet: XLSX.WorkSheet): UploadRow[] {
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  if (matrix.length === 0) return [];

  const headerRow = (matrix[0] ?? []).map((cell) => normalizeHeader(cell));

  const headerIndexMap = new Map<string, number>();
  headerRow.forEach((header, index) => {
    if (header) {
      headerIndexMap.set(header, index);
    }
  });

  const getCell = (row: (string | number | null)[], key: string): string => {
    const index = headerIndexMap.get(key);
    if (index === undefined) return "";
    return normalizeText(row[index]);
  };

  return matrix.slice(1).map((row) => ({
    gameName: getCell(row, "gameName"),
    name: getCell(row, "name"),
    region: getCell(row, "region"),
    uiColorTag: getCell(row, "uiColorTag"),
    downloadUrl: getCell(row, "downloadUrl"),
    creatorUrl: getCell(row, "creatorUrl"),
    saleUrl: getCell(row, "saleUrl"),
    note: getCell(row, "note"),
  }));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "파일이 없습니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    if (!workbook.SheetNames.length) {
      return NextResponse.json(
        { message: "엑셀 시트를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    let rows: UploadRow[] = [];
    let usedSheetName = "";

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
        header: 1,
        raw: false,
        defval: "",
      });

      const firstRow = (matrix[0] ?? []).map((v) => normalizeHeader(v));

      if (firstRow.includes("gameName") && firstRow.includes("name")) {
        rows = buildRowsFromSheet(worksheet);
        usedSheetName = sheetName;
        break;
      }
    }

    if (!usedSheetName) {
      return NextResponse.json(
        {
          message:
            "업로드 가능한 시트를 찾지 못했습니다. 첫 행 헤더를 gameName, name, region, uiColorTag, downloadUrl, creatorUrl, saleUrl, note 형식으로 맞춰주세요.",
        },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "업로드할 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const errors: Array<{ row: number; message: string }> = [];
    let createdCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const excelRowNumber = i + 2;

      try {
        const gameName = normalizeText(row.gameName);
        const name = normalizeText(row.name);
        const region = normalizeRegion(normalizeText(row.region));
        const uiColorTag = normalizeUiColor(normalizeText(row.uiColorTag));
        const downloadUrl = normalizeText(row.downloadUrl);
        const creatorUrl = normalizeText(row.creatorUrl);
        const saleUrl = normalizeText(row.saleUrl);
        const note = normalizeText(row.note);

        if (!gameName) {
          errors.push({
            row: excelRowNumber,
            message: "gameName이 비어 있습니다.",
          });
          continue;
        }

        if (!name) {
          errors.push({
            row: excelRowNumber,
            message: "name이 비어 있습니다.",
          });
          continue;
        }

        if (region && !ALLOWED_REGIONS.includes(region as (typeof ALLOWED_REGIONS)[number])) {
          errors.push({
            row: excelRowNumber,
            message: `region 값이 올바르지 않습니다. (${region})`,
          });
          continue;
        }

        if (
          uiColorTag &&
          !ALLOWED_UI_COLORS.includes(
            uiColorTag as (typeof ALLOWED_UI_COLORS)[number]
          )
        ) {
          errors.push({
            row: excelRowNumber,
            message: `uiColorTag 값이 올바르지 않습니다. (${uiColorTag})`,
          });
          continue;
        }

        const gameResult = await query(
          `SELECT id FROM games WHERE name = $1 LIMIT 1`,
          [gameName]
        );

        if (gameResult.rows.length === 0) {
          errors.push({
            row: excelRowNumber,
            message: `gameName(${gameName}) 이 games 테이블에 없습니다.`,
          });
          continue;
        }

        const gameId = gameResult.rows[0].id;

        const existing = await query(
          `
          SELECT id
          FROM hack_tools
          WHERE name = $1
            AND game_id = $2
            AND is_active = true
          LIMIT 1
          `,
          [name, gameId]
        );

        if (existing.rows.length > 0) {
          await query(
            `
            UPDATE hack_tools
            SET
              region = $1,
              ui_color_tag = $2,
              download_url = $3,
              creator_url = $4,
              sale_url = $5,
              note = $6,
              updated_at = NOW()
            WHERE id = $7
            `,
            [
              region || "",
              uiColorTag || "기본",
              downloadUrl || "",
              creatorUrl || "",
              saleUrl || "",
              note || "",
              existing.rows[0].id,
            ]
          );

          updatedCount += 1;
        } else {
          await query(
            `
            INSERT INTO hack_tools (
              game_id,
              name,
              main_tool_name,
              region,
              ui_color_tag,
              download_url,
              creator_url,
              sale_url,
              note,
              latest_test_date,
              is_active,
              created_by,
              created_at,
              updated_at
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9,
              CURRENT_DATE, true, 1, NOW(), NOW()
            )
            `,
            [
              gameId,
              name,
              name,
              region || "",
              uiColorTag || "기본",
              downloadUrl || "",
              creatorUrl || "",
              saleUrl || "",
              note || "",
            ]
          );

          createdCount += 1;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "행 처리 중 오류가 발생했습니다.";

        console.error(`업로드 ${excelRowNumber}행 실패:`, err);

        errors.push({
          row: excelRowNumber,
          message,
        });
      }
    }

    return NextResponse.json({
      message: "엑셀 업로드 처리 완료",
      usedSheetName,
      totalRows: rows.length,
      createdCount,
      updatedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("엑셀 업로드 실패:", error);
    return NextResponse.json(
      { message: "엑셀 업로드 중 오류 발생" },
      { status: 500 }
    );
  }
}