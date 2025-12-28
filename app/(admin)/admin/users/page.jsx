import { query } from "@/lib/db";
import UsersTableClient from "./UsersTableClient";

async function getUsers() {
  return query({
    query: `
      SELECT user_id, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `,
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="container-laluz">
      <div className="admin-header-row">
        <h2 className="tt-sec">Quản lý người dùng</h2>

        <a href="/admin/users/new">
          <button className="btn btn-pri">
            <i className="fas fa-user-plus"></i> Thêm Admin
          </button>
        </a>
      </div>

      {/* 👇 render client component */}
      <UsersTableClient users={users} />
    </div>
  );
}
