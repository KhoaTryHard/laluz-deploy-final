import { adminProducts } from "@/data/admin-products";

/* helper */
const parsePrice = (price) => {
  if (typeof price === "number") return price;
  if (typeof price === "string") return Number(price.replace(/\D/g, "")) || 0;
  return 0;
};

const getCategory = (name) => {
  const n = name.toLowerCase();
  if (n.includes("dior") || n.includes("mancera") || n.includes("gaultier"))
    return "Nam";
  if (n.includes("gucci") || n.includes("chanel")) return "Nữ";
  return "Unisex";
};

export default function AdminDashboard() {
  const totalProducts = adminProducts.length;

  const activeProducts = adminProducts.filter((p) => p.status === "active");
  const outProducts = adminProducts.filter((p) => p.status === "out");

  const totalStock = adminProducts.reduce((sum, p) => sum + p.stock, 0);

  const totalRevenue = adminProducts.reduce(
    (sum, p) => sum + parsePrice(p.price) * (p.sold || 0),
    0
  );

  const revenueByCategory = { Nam: 0, Nữ: 0, Unisex: 0 };

  adminProducts.forEach((p) => {
    const cat = getCategory(p.name);
    revenueByCategory[cat] += parsePrice(p.price) * (p.sold || 0);
  });

  return (
    <div className="container-laluz">
      <h2 className="tt-sec">Dashboard</h2>

      <div className="dashboard-grid">
        <StatCard
          title="Tổng doanh thu"
          value={totalRevenue.toLocaleString("vi-VN") + " đ"}
          color="blue"
        />
        <StatCard title="Tổng sản phẩm" value={totalProducts} />
        <StatCard
          title="Đang bán"
          value={activeProducts.length}
          color="green"
        />
        <StatCard title="Hết hàng" value={outProducts.length} color="red" />
      </div>

      <div className="box-white category-chart">
        <h3>Doanh thu theo danh mục</h3>

        <div className="category-bars">
          {Object.entries(revenueByCategory).map(([cat, value]) => (
            <div key={cat} className="category-item">
              <div className="bar-wrapper">
                <div
                  className={`bar ${cat.toLowerCase()}`}
                  style={{ height: Math.min(value / 1_000_000, 160) }}
                />
              </div>
              <strong>{cat}</strong>
              <span>{value.toLocaleString("vi-VN")} đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`dash-card ${color || ""}`}>
      <p>{title}</p>
      <strong>{value}</strong>
    </div>
  );
}
