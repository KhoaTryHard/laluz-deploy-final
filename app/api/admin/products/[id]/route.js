import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/* =========================
   TẠO SLUG
========================= */
function createSlug(name) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug}-${Date.now()}`;
}

/* =========================
   XỬ LÝ NOTES – AN TOÀN
   ❌ KHÔNG DÙNG BẢNG notes
========================= */
async function processNotes(productId, noteString, noteType) {
  if (!noteString || !noteString.trim()) return;

  const notesArr = noteString
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  for (const noteName of notesArr) {
    await query({
      query: `
        INSERT INTO product_notes (product_id, note_name, note_type)
        VALUES (?, ?, ?)
      `,
      values: [productId, noteName, noteType],
    });
  }
}

/* =========================
   POST – THÊM SẢN PHẨM
========================= */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      stock_quantity,
      description,
      brand_id,
      volume_ml,
      image_urls,
      top_notes,
      middle_notes,
      base_notes,
    } = body;

    if (!name || !price || !brand_id) {
      return NextResponse.json(
        { message: "Thiếu tên, giá hoặc thương hiệu" },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    /* 1. INSERT PRODUCT */
    const productResult = await query({
      query: `
        INSERT INTO products 
        (name, slug, price, stock_quantity, description, brand_id, volume_ml)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        name,
        slug,
        price,
        stock_quantity ?? 0,
        description ?? "",
        brand_id,
        volume_ml ?? null,
      ],
    });

    const productId = productResult.insertId;

    /* 2. INSERT IMAGES */
    if (image_urls && image_urls.trim()) {
      const urls = image_urls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      for (let i = 0; i < urls.length; i++) {
        await query({
          query: `
            INSERT INTO product_images (product_id, image_url, is_thumbnail)
            VALUES (?, ?, ?)
          `,
          values: [productId, urls[i], i === 0 ? 1 : 0],
        });
      }
    } else {
      await query({
        query: `
          INSERT INTO product_images (product_id, image_url, is_thumbnail)
          VALUES (?, '/images/products/default.webp', 1)
        `,
        values: [productId],
      });
    }

    /* 3. INSERT NOTES */
    await Promise.all([
      processNotes(productId, top_notes, "Top"),
      processNotes(productId, middle_notes, "Middle"),
      processNotes(productId, base_notes, "Base"),
    ]);

    return NextResponse.json({
      message: "Thêm sản phẩm thành công",
      productId,
    });
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

/* =========================
   PUT – CẬP NHẬT SẢN PHẨM
========================= */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      name,
      price,
      stock_quantity,
      description,
      brand_id,
      volume_ml,
      image_urls,
      top_notes,
      middle_notes,
      base_notes,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Tên sản phẩm không hợp lệ" },
        { status: 400 }
      );
    }

    if (Number(price) <= 0) {
      return NextResponse.json(
        { message: "Giá phải lớn hơn 0" },
        { status: 400 }
      );
    }

    if (Number(stock_quantity) < 0) {
      return NextResponse.json(
        { message: "Số lượng tồn không hợp lệ" },
        { status: 400 }
      );
    }

    if (!brand_id) {
      return NextResponse.json(
        { message: "Thiếu thương hiệu" },
        { status: 400 }
      );
    }

    /* 1. UPDATE PRODUCT */
    await query({
      query: `
        UPDATE products
        SET name = ?, price = ?, stock_quantity = ?, description = ?, brand_id = ?, volume_ml = ?
        WHERE product_id = ?
      `,
      values: [
        name,
        price,
        stock_quantity,
        description ?? "",
        brand_id,
        volume_ml ?? null,
        id,
      ],
    });

    /* 2. UPDATE IMAGES */
    await query({
      query: "DELETE FROM product_images WHERE product_id = ?",
      values: [id],
    });

    if (image_urls && image_urls.trim()) {
      const urls = image_urls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      for (let i = 0; i < urls.length; i++) {
        await query({
          query: `
            INSERT INTO product_images (product_id, image_url, is_thumbnail)
            VALUES (?, ?, ?)
          `,
          values: [id, urls[i], i === 0 ? 1 : 0],
        });
      }
    }

    /* 3. UPDATE NOTES */
    await query({
      query: "DELETE FROM product_notes WHERE product_id = ?",
      values: [id],
    });

    await Promise.all([
      processNotes(id, top_notes, "Top"),
      processNotes(id, middle_notes, "Middle"),
      processNotes(id, base_notes, "Base"),
    ]);

    return NextResponse.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("PUT PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE – XOÁ MỀM
========================= */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query({
      query: `
        UPDATE products
        SET is_deleted = 1
        WHERE product_id = ?
      `,
      values: [id],
    });

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Đã xoá sản phẩm (ẩn)" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "Lỗi server: " + error.message },
      { status: 500 }
    );
  }
}
