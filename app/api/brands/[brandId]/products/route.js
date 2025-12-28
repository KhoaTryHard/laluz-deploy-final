import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req, { params }) {
  const { brandId } = params;

  const [products] = await query(
    "SELECT * FROM products WHERE brand_id = ?",
    [brandId]
  );

  return NextResponse.json(products);
}
