import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const brands = await query({
      query: "SELECT brand_id, name FROM BRANDS ORDER BY name ASC",
    });
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}