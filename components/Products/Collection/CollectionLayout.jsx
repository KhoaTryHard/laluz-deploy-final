import CollectionClient from "./CollectionClient";

export default function CollectionLayout({
  slug,
  products = [],
  initialGender = null,
  initialBrand = null,
  initialNote = null,
  initialConcentration = null,
}) {
  return (
    <CollectionClient
      slug={slug}
      products={products}
      initialGender={initialGender}
      initialBrand={initialBrand}
      initialNote={initialNote}
      initialConcentration={initialConcentration}
    />
  );
}
