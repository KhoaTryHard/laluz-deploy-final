import CollectionPage from "@/components/Products/Collection/CollectionPage";
import products from "@/data/products";

export default function Page({ params }) {
  const slug = params?.slug ?? "all";

  const filtered =
    slug === "all"
      ? products
      : products.filter((p) => p.category === slug);

  return <CollectionPage slug={slug} products={filtered} />;
}
