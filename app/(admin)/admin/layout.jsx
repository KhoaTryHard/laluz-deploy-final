import "./admin.css";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="admin-content">{children}</main>
    </div>
  );
}
