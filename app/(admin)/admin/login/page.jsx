"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from "@/components/UI/Breadcrumb";
import LoginImage from "@/components/Auth/LoginImage";

export default function LoginPage() {
  // --- PHẦN LOGIC (State & Handlers) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại');
      } else {
        alert('Đăng nhập thành công!');
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        router.push('/admin'); 
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // --- PHẦN GIAO DIỆN (Render) ---
  return (
    <main className="main spc-hd spc-hd-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Đăng Nhập", active: true },
        ]}
      />
      <section className="login">
        <div className="container">
          <div className="inner flex flex-wrap items-start justify-between gap-8"> 
            {/* --- FORM ĐĂNG NHẬP --- */}
            <div className="w-full max-w-md"> 
              <h2 className="text-2xl font-bold mb-6 text-gray-800">ĐĂNG NHẬP</h2>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} id="mona-login-form" className={`space-y-4 ${loading ? 'is-loading-group' : ''}`}>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
            <LoginImage />
          </div>
        </div>
      </section>
    </main>
  );
}