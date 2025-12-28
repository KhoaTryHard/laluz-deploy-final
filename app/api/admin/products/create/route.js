// app/api/admin/products/create/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Hàm tạo slug
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

// Hàm xử lý Brand có log chi tiết
async function getOrCreateBrandId(isNewBrand, existingId, newName) {
  console.log(">>> Đang xử lý Brand:", { isNewBrand, existingId, newName });

  // 1. Dùng Brand cũ
  if (!isNewBrand) {
    console.log("--> Dùng ID cũ:", existingId);
    return existingId;
  }

  // 2. Tạo Brand mới
  if (!newName || !newName.trim()) {
    console.log("--> LỖI: Tên brand mới bị rỗng!");
    return null;
  }

  const cleanName = newName.trim();

  // Kiểm tra tồn tại
  const existing = await query({
    query: "SELECT brand_id FROM brands WHERE name LIKE ?",
    values: [cleanName],
  });

  if (existing.length > 0) {
    console.log("--> Brand đã tồn tại, dùng ID:", existing[0].brand_id);
    return existing[0].brand_id;
  }

  // Tạo mới
  const result = await query({
    query: "INSERT INTO brands (name, origin_country) VALUES (?, 'Unknown')",
    values: [cleanName],
  });

  console.log("--> Tạo Brand mới thành công, ID:", result.insertId);
  return result.insertId;
}

// Hàm xử lý hương (Notes)
async function processNotes(productId, noteString, noteType) {
  if (!noteString || !noteString.trim()) return;
  const notesArr = noteString
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n);

  for (const noteName of notesArr) {
    let noteId;
    const existingParams = await query({
      query: "SELECT note_id FROM NOTES WHERE name = ?",
      values: [noteName],
    });

    if (existingParams.length > 0) {
      noteId = existingParams[0].note_id;
    } else {
      const newNote = await query({
        query: "INSERT INTO NOTES (name, family) VALUES (?, 'Unknown')",
        values: [noteName],
      });
      noteId = newNote.insertId;
    }

    await query({
      query:
        "INSERT INTO PRODUCT_NOTES (product_id, note_id, note_type) VALUES (?, ?, ?)",
      values: [productId, noteId, noteType],
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // [LOG QUAN TRỌNG] Xem Frontend gửi lên cái gì
    console.log("----------------------------------------------");
    console.log("1. DATA NHẬN ĐƯỢC:", JSON.stringify(body, null, 2));

    const {
      name,
      price,
      stock_quantity,
      description,
      brand_id,
      is_new_brand,
      new_brand_name,
      volume_ml,
      image_urls,
      top_notes,
      middle_notes,
      base_notes,
    } = body;

    // Xử lý Brand
    const finalBrandId = await getOrCreateBrandId(
      is_new_brand,
      brand_id,
      new_brand_name
    );
    console.log("2. BRAND ID CUỐI CÙNG:", finalBrandId);

    if (!name || !price || !finalBrandId) {
      console.log("--> LỖI: Thiếu thông tin (Name, Price hoặc BrandId)");
      return NextResponse.json(
        { message: "Thiếu tên, giá hoặc thương hiệu" },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    // Insert Sản Phẩm
    const productResult = await query({
      query: `
        INSERT INTO products (name, slug, price, stock_quantity, description, brand_id, volume_ml) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        name,
        slug,
        price,
        stock_quantity,
        description,
        finalBrandId,
        volume_ml,
      ],
    });

    const newProductId = productResult.insertId;
    console.log("3. TẠO SẢN PHẨM THÀNH CÔNG ID:", newProductId);

    // Insert Ảnh
    if (image_urls && image_urls.trim()) {
      const urls = image_urls
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u);
      for (let i = 0; i < urls.length; i++) {
        await query({
          query:
            "INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES (?, ?, ?)",
          values: [newProductId, urls[i], i === 0 ? 1 : 0],
        });
      }
    } else {
      await query({
        query:
          "INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES (?, '/images/products/default.webp', 1)",
        values: [newProductId],
      });
    }

    // Insert Hương
    await Promise.all([
      processNotes(newProductId, top_notes, "Top"),
      processNotes(newProductId, middle_notes, "Middle"),
      processNotes(newProductId, base_notes, "Base"),
    ]);

    console.log("--> HOÀN TẤT TOÀN BỘ!");
    console.log("----------------------------------------------");
    return NextResponse.json({
      message: "Thêm thành công",
      productId: newProductId,
    });
  } catch (error) {
    console.error("!!! LỖI SERVER FATAL:", error);
    return NextResponse.json(
      { message: "Lỗi Server: " + error.message },
      { status: 500 }
    );
  }
}
