import BrandAZClient from "@/components/Brands/BrandAZClient";
import { query } from "@/lib/db";

export default async function Page() {
  const brands = await query({
    query: `
      SELECT brand_id, name, logo, origin_country
      FROM brands
      ORDER BY name ASC
    `,
  });

  return <BrandAZClient brands={brands} />;
}