import Link from "next/link";

async function getOrders() {
  const res = await fetch("/api/admin/orders", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const formatMoney = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  if (!Array.isArray(orders)) {
    return <p>Không thể tải danh sách đơn hàng</p>;
  }

  return (
    <div className="box-white">
      <div className="admin-header-row">
        <h2 className="tt-sec">Quản lý đơn hàng</h2>
      </
