import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Hàm tạo slug
function createSlug(name) {
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug}-${Date.now()}`;
}

// Hàm xử lý Notes (Hương)
// Logic: Nhận vào chuỗi "Cam, Quýt" -> Tìm ID của Cam, Quýt -> Lưu vào bảng liên kết
async function processNotes(productId, noteString, noteType) {
  if (!noteString || !noteString.trim()) return;

  const notesArr = noteString.split(",").map(n => n.trim()).filter(n => n);

  for (const noteName of notesArr) {
    // 1. Kiểm tra xem Note này đã tồn tại trong bảng NOTES chưa
    let noteId;
    const existingParams = await query({
      query: "SELECT note_id FROM NOTES WHERE name = ?",
      values: [noteName]
    });

    if (existingParams.length > 0) {
      noteId = existingParams[0].note_id;
    } else {
      // 2. Nếu chưa có, tạo mới Note
      const newNote = await query({
        query: "INSERT INTO NOTES (name, family) VALUES (?, 'Unknown')",
        values: [noteName]
      });
      noteId = newNote.insertId;
    }

    // 3. Liên kết Product với Note
    await query({
      query: "INSERT INTO PRODUCT_NOTES (product_id, note_id, note_type) VALUES (?, ?, ?)",
      values: [productId, noteId, noteType]
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, price, stock_quantity, description, brand_id, volume_ml, 
      image_urls, top_notes, middle_notes, base_notes 
    } = body;

    if (!name || !price || !brand_id) {
      return NextResponse.json({ message: "Thiếu tên, giá hoặc thương hiệu" }, { status: 400 });
    }

    const slug = createSlug(name);

    // 1. INSERT PRODUCT
    const productResult = await query({
      query: `
        INSERT INTO PRODUCTS (name, slug, price, stock_quantity, description, brand_id, volume_ml) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      values: [name, slug, price, stock_quantity, description, brand_id, volume_ml], 
    });

    const newProductId = productResult.insertId;

    // 2. INSERT IMAGES (Xử lý nhiều ảnh)
    if (image_urls && image_urls.trim()) {
      const urls = image_urls.split(",").map(u => u.trim()).filter(u => u);
      for (let i = 0; i < urls.length; i++) {
        await query({
          query: "INSERT INTO PRODUCT_IMAGES (product_id, image_url, is_thumbnail) VALUES (?, ?, ?)",
          values: [newProductId, urls[i], i === 0 ? 1 : 0] // Ảnh đầu tiên là thumbnail
        });
      }
    } else {
       // Nếu không có ảnh, thêm ảnh mặc định
       await query({
          query: "INSERT INTO PRODUCT_IMAGES (product_id, image_url, is_thumbnail) VALUES (?, '/images/products/default.webp', 1)",
          values: [newProductId]
       });
    }

    // 3. INSERT NOTES (Xử lý 3 tầng hương)
    // Chạy song song cho nhanh
    await Promise.all([
      processNotes(newProductId, top_notes, 'Top'),
      processNotes(newProductId, middle_notes, 'Middle'),
      processNotes(newProductId, base_notes, 'Base')
    ]);

    return NextResponse.json({ message: "Thêm thành công", productId: newProductId });

  } catch (error) {
    console.error("Lỗi thêm sản phẩm:", error);
    return NextResponse.json({ message: "Lỗi Server: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Xóa trong bảng PRODUCTS (Các bảng liên quan như images, notes 
    // nên được set CASCADE trong MySQL hoặc xóa thủ công nếu cần)
    await query({
      query: "DELETE FROM PRODUCTS WHERE product_id = ?",
      values: [id],
    });

    return NextResponse.json({ message: "Xóa thành công" });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    return NextResponse.json({ message: "Lỗi server: " + error.message }, { status: 500 });
  }
}