import { query } from "@/lib/db"; // Import hàm kết nối DB
import Link from "next/link";
import RevenueCharts from "@/components/Admin/RevenueCharts";
import { Athiti } from "next/font/google";
import AdminGuard from "@/components/Admin/AdminGuard";

// 1. Hàm lấy dữ liệu thống kê từ SQL
async function getAnalyticsData() {
  try {
    // Chúng ta chạy song song 4 câu lệnh để tiết kiệm thời gian
    const [ordersRes, revenueRes, usersRes, productsRes] = await Promise.all([
      // A. Tổng đơn hàng (Đếm số giỏ hàng đã chuyển đổi thành đơn)
      query({
        query:
          "SELECT COUNT(*) as count FROM orders WHERE status = 'completed'",
      }),

      // B. Doanh thu (Tính tổng tiền: giá * số lượng của các đơn đã xong)
      query({
        query: `
          SELECT SUM(total_amount) AS totalRevenue
          FROM orders
          WHERE status = 'completed';
        `,
      }),

      // C. Khách hàng mới (Đếm tổng user)
      query({
        query: "SELECT COUNT(*) AS count FROM users WHERE role = ?",
        values: ["customer"],
      }),
      // D. Sản phẩm tồn kho (Tổng số lượng tồn kho của tất cả sản phẩm)
      query({
        query: "SELECT SUM(stock_quantity) as count FROM products",
      }),
    ]);

    // Trả về object dữ liệu
    return {
      totalOrders: ordersRes[0].count || 0,
      totalRevenue: revenueRes[0].totalRevenue || 0,
      totalUsers: usersRes[0].count || 0,
      totalStock: productsRes[0].count || 0,
    };
  } catch (error) {
    console.error("Lỗi lấy thống kê:", error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      totalStock: 0,
    };
  }
}

// 2. Component chính (Server Component)
export default async function AdminDashboard() {
  // Gọi hàm lấy dữ liệu
  const stats = await getAnalyticsData();

  // Hàm định dạng tiền tệ (VND)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm định dạng số (1,000)
  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Cấu hình dữ liệu hiển thị
  const statCards = [
    {
      title: "Tổng Đơn Hàng",
      value: formatNumber(stats.totalOrders),
      desc: "Đơn hàng đã hoàn thành",
    },
    {
      title: "Doanh Thu",
      value: formatCurrency(stats.totalRevenue),
      desc: "Tổng doanh thu bán hàng",
    },
    {
      title: "Khách Hàng",
      value: formatNumber(stats.totalUsers),
      desc: "Tài khoản đăng ký hệ thống",
    },
    {
      title: "Sản Phẩm Tồn Kho",
      value: formatNumber(stats.totalStock),
      desc: "Tổng số lượng trong kho",
    },
  ];

  return (
    <AdminGuard>
      <div className="container-laluz">
        <div className="row" style={{ paddingTop: "var(--spc-sect)" }}>
          <div className="col-xg-12 col-lg-12 col-md-12">
            <h2 className="tt-sec" style={{ marginBottom: "3rem" }}>
              Thống Kê Tổng Quan
            </h2>

            {/* RENDER DỮ LIỆU TỪ DB */}
            <div className="row">
              {statCards.map((item, i) => (
                <div key={i} className="col-xg-3 col-lg-6 col-md-6 col-sm-12">
                  <div className="box-info" style={{ textAlign: "center" }}>
                    <div className="tt">{item.title}</div>
                    <p className="price-new" style={{ fontSize: "3rem" }}>
                      {item.value}
                    </p>
                    <p className="txt-nm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PHẦN THAO TÁC NHANH (GIỮ NGUYÊN UI CŨ) */}
          <div
            className="col-xg-12 col-lg-12 col-md-12"
            style={{ marginTop: "3rem" }}
          >
            <h3
              className="tt-sec"
              style={{ fontSize: "2.2rem", marginBottom: "2rem" }}
            >
              Chức năng
            </h3>
            <RevenueCharts />

            <div className="row" style={{ "--row-gap": "2rem" }}>
              <div className="col-xg-4 col-lg-4 col-md-6 col-sm-12">
                <Link href="/admin/products">
                  <button
                    className="btn btn-second"
                    style={{ width: "100%", minHeight: "5rem" }}
                  >
                    <span className="txt">
                      <i className="fas fa-plus-circle"></i> Quản Lí Sản Phẩm
                    </span>
                  </button>
                </Link>
              </div>

              <div className="col-xg-4 col-lg-4 col-md-6 col-sm-12">
                <a href="/admin/orders">
                  <button
                    className="btn btn-four"
                    style={{ width: "100%", minHeight: "5rem" }}
                  >
                    <span className="txt">
                      <i className="fas fa-clipboard-list"></i> Xem Đơn Hàng
                    </span>
                  </button>
                </a>
              </div>

              <div className="col-xg-4 col-lg-4 col-md-6 col-sm-12">
                <button
                  className="btn btn-pri"
                  style={{ width: "100%", minHeight: "5rem" }}
                >
                  <span className="txt">
                    <i className="fas fa-file-alt"></i> Quản lý Users
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
