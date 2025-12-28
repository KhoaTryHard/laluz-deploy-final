"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // 1. Xác nhận trước khi xóa
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

    setLoading(true);
    try {
      // 2. Gọi API xóa
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Xóa thất bại");

      // 3. Làm mới trang để cập nhật danh sách
      router.refresh(); 
      alert("Đã xóa sản phẩm!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="btn btn-four btn-sm" 
      disabled={loading}
    >
      {loading ? "..." : "Xóa"}
    </button>
  );
}