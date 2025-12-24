// components/Cart/CartUtils.js
const LOCAL_CART_KEY = "laluz_cart";

export async function addToCart(product, qty, isLoggedIn) {
  /* ======================
     GUEST USER
  ====================== */
  if (!isLoggedIn) {
    let cart = [];

    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }

    const existing = cart.find(
      (it) => it.product_id === product.product_id
    );

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + qty,
        product.stock_quantity ?? existing.quantity + qty
      );
    } else {
      cart.push({
        ...product,
        quantity: qty,
      });
    }

    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));

    window.dispatchEvent(new Event("cartUpdated"));

    alert("Đã thêm sản phẩm vào giỏ hàng");
    return;
  }

  /* ======================
     LOGGED-IN USER
  ====================== */
  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product_id: product.product_id,
        name: product.name,
        price: Number(product.price),
        image: product.image || "",
        quantity: qty,
      }),
    });

    if (res.ok) {
      window.dispatchEvent(new Event("cartUpdated"));
      alert("Đã thêm vào giỏ hàng của bạn!");
    } else {
      const data = await res.json();
      alert(data.message || "Lỗi khi thêm vào giỏ hàng");
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Không thể thêm sản phẩm vào giỏ hàng");
  }
}
