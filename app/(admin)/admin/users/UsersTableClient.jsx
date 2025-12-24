"use client";

import Link from "next/link";

export default function UsersTableClient({ users }) {
  const adminUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("admin_user") || "null")
      : null;

  return (
    <div className="box-white">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, i) => (
            <tr key={u.user_id}>
              <td>{i + 1}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  disabled={adminUser?.user_id === u.user_id} // 🔒 không cho tự đổi
                  onChange={async (e) => {
                    const newRole = e.target.value;

                    const res = await fetch(
                      `/api/admin/users/${u.user_id}/role`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          newRole,
                          currentUserId: adminUser.user_id,
                        }),
                      }
                    );

                    const data = await res.json();

                    if (!res.ok) {
                      alert(data.message || "Không thể đổi quyền");
                      return;
                    }

                    alert("Cập nhật quyền thành công");
                    location.reload(); // đơn giản, đúng đồ án
                  }}
                >
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                </select>
              </td>

              <td>{new Date(u.created_at).toLocaleString("vi-VN")}</td>

              <td className="admin-actions">
                <Link href={`/admin/users/${u.user_id}`} className="btn btn-sm">
                  Sửa
                </Link>

                {/* 🔒 CHỈ HIỆN ĐỔI MK CHO CHÍNH MÌNH */}
                {adminUser?.user_id === u.user_id && (
                  <Link
                    href={`/admin/users/${u.user_id}/password`}
                    className="btn btn-sm btn-four"
                  >
                    Đổi MK
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
