export default function ProductPrice({ product }) {
  return (
    <div
      className="price-prod monawoo-price"
      id="monaPriceProduct"
      bis_skin_checked="1"
    >
      <div className="prddt-prd-price-box detail " bis_skin_checked="1">
        <span className="price-new">
          <span className="woocommerce-Price-amount amount">
            <bdi>
              {product.price.toLocaleString()}&nbsp;
              <span className="woocommerce-Price-currencySymbol">₫</span>
            </bdi>
          </span>
        </span>
      </div>
    </div>
  );
}
