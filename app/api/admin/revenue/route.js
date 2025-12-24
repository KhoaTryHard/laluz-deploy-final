import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type") || "month"; // day | week | month
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear(),
      10
    );
    const month = parseInt(
      searchParams.get("month") || new Date().getMonth() + 1,
      10
    );

    let sql = "";
    let params = [];

    // ✅ THÁNG: doanh thu theo 12 tháng trong 1 năm (lọc theo year)
    if (type === "month") {
      sql = `
        SELECT 
          MONTH(created_at) AS label,
          SUM(total_amount) AS value
        FROM orders
        WHERE status='completed' AND YEAR(created_at)=?
        GROUP BY MONTH(created_at)
        ORDER BY label
      `;
      params = [year];
    }

    // ✅ TUẦN: doanh thu theo tuần trong 1 năm (lọc theo year)
    if (type === "week") {
      sql = `
        SELECT 
          WEEK(created_at, 1) AS label,
          SUM(total_amount) AS value
        FROM orders
        WHERE status='completed' AND YEAR(created_at)=?
        GROUP BY WEEK(created_at, 1)
        ORDER BY label
      `;
      params = [year];
    }

    // ✅ NGÀY: doanh thu theo ngày trong 1 tháng cụ thể (lọc theo year + month)
    if (type === "day") {
      sql = `
        SELECT 
          DAY(created_at) AS label,
          SUM(total_amount) AS value
        FROM orders
        WHERE status='completed' AND YEAR(created_at)=? AND MONTH(created_at)=?
        GROUP BY DAY(created_at)
        ORDER BY label
      `;
      params = [year, month];
    }

    const rows = await query({ query: sql, values: params });

    const labels = rows.map((r) => {
      if (type === "month") return `Tháng ${r.label}`;
      if (type === "week") return `Tuần ${r.label}`;
      return `Ngày ${r.label}`;
    });

    const values = rows.map((r) => Number(r.value || 0));

    return NextResponse.json({ labels, values, year, month, type });
  } catch (err) {
    return NextResponse.json({ error: "Lỗi thống kê" }, { status: 500 });
  }
}
