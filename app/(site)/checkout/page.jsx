"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/UI/Breadcrumb";

// --- 1. LOGIC AN TOÀN TỪ CODE 1: Format tiền tệ ---
const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export default function CheckoutPage() {
  const router = useRouter();

  // --- STATE ---
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [coupon, setCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    payment_method: "COD"
  });

  // --- 2. LOGIC TÍNH TOÁN AN TOÀN TỪ CODE 1 ---
  const subTotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  const discountAmount = coupon
    ? (coupon.discount_type === 'percent'
        ? (subTotal * Number(coupon.discount_value || 0)) / 100
        : Number(coupon.discount_value || 0))
    : 0;

  const finalTotal = Math.max(subTotal - discountAmount, 0);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
  if (!couponCode.trim()) {
    alert("Vui lòng nhập mã giảm giá!");
    return;
  }

  setCouponLoading(true);

  try {
    const res = await fetch("/api/coupons/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponCode,
        orderTotal: subTotal,
      }),
    });

    const data = await res.json();

    // ❗ KHÔNG throw Error
    if (!res.ok) {
      alert(data.message || "Mã giảm giá không tồn tại hoặc hết hạn");
      setCoupon(null);
      return;
    }

    // ✅ Thành công
    setCoupon(data.coupon);
    alert("Áp dụng mã giảm giá thành công!");

  } catch (err) {
    // ❗ Chỉ dùng cho lỗi mạng / server chết
    console.error("Lỗi kết nối:", err);
    alert("Không thể kết nối tới server. Vui lòng thử lại!");
    setCoupon(null);

  } finally {
    setCouponLoading(false);
  }
};

  // Tính năng từ Code 2: Xóa Coupon
  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống!");
      setLoading(false);
      return;
    }

    try {
      // Logic Payload kết hợp: Gửi dữ liệu sạch nhưng đầy đủ trường
      const payload = {
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        })),
        customerInfo: formData,
        coupon_code: coupon ? coupon.code : null,
        total_amount: finalTotal,
        discount_amount: discountAmount // Lấy từ ưu điểm Code 2
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Lỗi đặt hàng");

      localStorage.removeItem("laluz_cart");
      window.dispatchEvent(new Event("storage"));
      alert(`Đặt hàng thành công! Mã đơn: #${data.orderId}`);
      router.push(`/account/orders/${data.orderId}`);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. useEffect MẠNH MẼ TỪ CODE 1 (Clean Data) ---
  useEffect(() => {
    const initData = async () => {
      try {
        // Lấy User
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
            const userData = await userRes.json();
            setFormData(prev => ({
                ...prev,
                fullName: userData.full_name || userData.name || "",
                phone: userData.phone_number || userData.phone || "",
                address: userData.address || ""
            }));
        }

        // Lấy Giỏ hàng & FIX LỖI NaN
        let finalItems = [];
        const cartRes = await fetch("/api/cart/my-cart");
        
        if (cartRes.ok) {
          const data = await cartRes.json();
          if (data.items && data.items.length > 0) {
             finalItems = data.items;
             if (data.coupon) setCoupon(data.coupon);
          }
        }

        // Fallback LocalStorage
        if (finalItems.length === 0) {
            finalItems = JSON.parse(localStorage.getItem("laluz_cart") || "[]");
        }

        // BƯỚC QUAN TRỌNG: CLEAN DATA (Ép kiểu số)
        const cleanItems = finalItems.map(item => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
        }));

        setCartItems(cleanItems);

      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };

    initData();
  }, []);

  // --- 4. GIAO DIỆN INLINE STYLE TỪ CODE 2 ---
  if (cartItems.length === 0) {
     return (
        <div className="container" style={{padding: '50px', textAlign:'center'}}>
            <h2>Giỏ hàng đang trống</h2>
            <Link href="/" className="btn" style={{marginTop:'20px', display: 'inline-block', padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none'}}>
                Mua sắm ngay
            </Link>
        </div>
     )
  }

  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Thanh toán", active: true }]} />

      <section className="checkout-section" style={{ padding: "40px 0" }}>
        <div className="container">
          <form className="row" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
            
            {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
            <div className="col-md-7 col-12" style={{ padding: '0 15px', flex: '0 0 58%', maxWidth: '58%' }}>
              <h3 style={{ marginBottom: "20px", fontWeight: "bold", textTransform: "uppercase" }}>Thông tin giao hàng</h3>
              
              <div className="group-form" style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", display:'block', marginBottom:'5px' }}>Họ và tên <span className="text-danger" style={{color:'red'}}>*</span></label>
                <input 
                    type="text" name="fullName" required 
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: '4px' }}
                    value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="group-form" style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", display:'block', marginBottom:'5px' }}>Số điện thoại <span className="text-danger" style={{color:'red'}}>*</span></label>
                <input 
                    type="tel" name="phone" required
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: '4px' }}
                    value={formData.phone} onChange={handleChange} placeholder="09xxx..."
                />
              </div>

              <div className="group-form" style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", display:'block', marginBottom:'5px' }}>Địa chỉ nhận hàng <span className="text-danger" style={{color:'red'}}>*</span></label>
                <input 
                    type="text" name="address" required 
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: '4px' }}
                    value={formData.address} onChange={handleChange} placeholder="Số nhà, Phường, Quận, Thành phố..."
                />
              </div>

              <div className="group-form" style={{ marginBottom: "15px" }}>
                <label style={{ fontWeight: "600", display:'block', marginBottom:'5px' }}>Ghi chú đơn hàng</label>
                <textarea 
                    name="note" 
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: '4px', minHeight: "100px" }}
                    value={formData.note} onChange={handleChange} placeholder="Ghi chú về giao hàng..."
                />
              </div>
            </div>

            {/* CỘT PHẢI: ĐƠN HÀNG */}
            <div className="col-md-5 col-12" style={{ padding: '0 15px', flex: '0 0 42%', maxWidth: '42%' }}>
              <div style={{ background: "#f9f9f9", padding: "30px", border: "2px solid #eee", borderRadius: '8px' }}>
                <h3 style={{ marginBottom: "20px", fontWeight: "bold", textTransform: "uppercase" }}>Đơn hàng</h3>
                
                <table style={{ width: "100%", marginBottom: "20px", borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #ddd" }}>
                            <th style={{ padding: "10px 0", textAlign: "left" }}>Sản phẩm</th>
                            <th style={{ padding: "10px 0", textAlign: "right" }}>Tạm tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "15px 0", fontSize: "0.9rem" }}>
                                    {item.name} <strong style={{ marginLeft: "5px" }}>x {item.quantity}</strong>
                                </td>
                                <td style={{ padding: "15px 0", textAlign: "right" }}>
                                    {formatCurrency(item.price * item.quantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {/* Dòng Tạm tính */}
                        <tr style={{ borderTop: "2px solid #ddd" }}>
                            <td style={{ padding: "15px 0" }}>Tạm tính</td>
                            <td style={{ padding: "15px 0", textAlign: "right", fontWeight: "600" }}>
                                {formatCurrency(subTotal)}
                            </td>
                        </tr>

                        {/* Phần Nhập Coupon */}
                        <tr>
                            <td colSpan="2" style={{ padding: "15px 0" }}>
                                <div style={{display: 'flex', gap: '5px'}}>
                                    <input 
                                        type="text" 
                                        placeholder="Mã giảm giá" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleApplyCoupon}
                                        style={{
                                            background: '#333', color: '#fff', border: 'none', 
                                            padding: '0 15px', borderRadius: '4px', cursor: 'pointer',
                                            opacity: couponLoading ? 0.7 : 1
                                        }}
                                        disabled={couponLoading || loading}
                                    >
                                        {couponLoading ? "..." : "Áp dụng"}
                                    </button>
                                </div>
                                {coupon && (
                                    <div style={{marginTop: '10px', fontSize: '0.9rem', color: 'green', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span>Đã dùng mã: <strong>{coupon.code}</strong></span>
                                        <button 
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            style={{color: 'red', background:'none', border:'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem'}}
                                        >
                                            Xóa mã
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>

                        {/* Dòng Giảm giá (Chỉ hiện khi có coupon) */}
                        {coupon && (
                            <tr>
                                <td style={{ padding: "5px 0", color: 'green' }}>Giảm giá</td>
                                <td style={{ padding: "5px 0", textAlign: "right", color: 'green' }}>
                                    - {formatCurrency(discountAmount)}
                                </td>
                            </tr>
                        )}

                        {/* Dòng Tổng cộng */}
                        <tr style={{ borderTop: "1px solid #ddd" }}>
                            <th style={{ padding: "20px 0", fontSize: "1.1rem" }}>Tổng cộng</th>
                            <th style={{ padding: "20px 0", textAlign: "right", fontSize: "1.3rem", color: "#d33", fontWeight: "bold" }}>
                                {formatCurrency(finalTotal)}
                            </th>
                        </tr>
                    </tfoot>
                </table>

                {/* Phương thức thanh toán */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ marginBottom: "10px", display: 'flex', alignItems: 'center' }}>
                        <input 
                            type="radio" id="payment_cod" 
                            name="payment_method" 
                            value="COD"
                            checked={formData.payment_method === 'COD'}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="payment_cod" style={{ marginLeft: "10px", fontWeight: "600", cursor:'pointer' }}>
                            Thanh toán khi nhận hàng (COD)
                        </label>
                    </div>
                </div>

                <button 
                    type="submit" 
                    style={{ 
                        width: "100%", padding: "15px", textTransform: "uppercase", 
                        fontWeight: "bold", background: '#000', color: '#fff', 
                        border: 'none', borderRadius: '4px', cursor: 'pointer',
                        opacity: loading ? 0.7 : 1 
                    }}
                    disabled={loading}
                >
                    {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
                </button>

              </div>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}