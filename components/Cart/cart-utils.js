// components/Cart/CartUtils.js

export const addToCart = async (product, quantity = 1, isLoggedIn) => {
  // Logic 1: Chưa đăng nhập -> Lưu LocalStorage
  if (!isLoggedIn) {
    try {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = localCart.findIndex((item) => item.product_id === product.product_id);

      if (existingItemIndex > -1) {
        localCart[existingItemIndex].quantity += quantity;
      } else {
        localCart.push({
          product_id: product.product_id,
          name: product.name,
          price: Number(product.price),
          image: product.image_url || "",
          quantity: quantity,
        });
      }

      localStorage.setItem("cart", JSON.stringify(localCart));
      window.dispatchEvent(new Event("storage")); // Trigger để header cập nhật icon giỏ hàng
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error(error);
    }
  } 
  
  // Logic 2: Đã đăng nhập -> Lưu Database
  else {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: quantity
        }),
      });

      if (res.ok) {
        alert("Đã thêm vào giỏ hàng của bạn!");
        // Có thể gọi thêm API lấy lại giỏ hàng để cập nhật Header nếu cần
      } else {
        const data = await res.json();
        alert(data.message || "Lỗi khi thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error(error);
    }
  }
};