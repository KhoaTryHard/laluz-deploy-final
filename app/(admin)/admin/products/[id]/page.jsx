import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

async function getProduct(id) {
  // 1. Product
  const products = await query({
    query: "SELECT * FROM products WHERE product_id = ?",
    values: [id],
  });

  if (products.length === 0) return null;
  const product = products[0];

  // 2. Images
  const images = await query({
    query: `
      SELECT image_url
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_thumbnail DESC, image_id ASC
    `,
    values: [id],
  });

  const image_urls = images.map((i) => i.image_url).join(", ");

  // 3. Notes (AN TOÀN – KHÔNG JOIN)
  let notes = [];
  try {
    notes = await query({
      query: `
        SELECT *
        FROM product_notes
        WHERE product_id = ?
      `,
      values: [id],
    });
  } catch (err) {
    console.warn("Skip product notes:", err.message);
  }

  const top_notes = notes
    .filter((n) => n.note_type === "Top")
    .map((n) => n.note_name)
    .join(", ");

  const middle_notes = notes
    .filter((n) => n.note_type === "Middle")
    .map((n) => n.note_name)
    .join(", ");

  const base_notes = notes
    .filter((n) => n.note_type === "Base")
    .map((n) => n.note_name)
    .join(", ");

  return {
    ...product,
    price: Number(product.price),
    image_urls,
    top_notes,
    middle_notes,
    base_notes,
  };
}

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="container-laluz">
      <h2 className="tt-sec">Sửa Sản Phẩm {product.name}</h2>
      <EditProductForm product={product} />
    </div>
  );
}
