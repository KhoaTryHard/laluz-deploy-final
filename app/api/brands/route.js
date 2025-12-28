import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const brands = await query({
      query: "SELECT brand_id, name FROM brands ORDER BY name ASC",
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("DB ERROR 👉", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
