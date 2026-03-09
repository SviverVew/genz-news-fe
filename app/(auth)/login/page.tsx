
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, getMe } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered) {
      setMessage("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await login({ email, password });
      // Lưu token từ response (hỗ trợ nhiều cấu trúc response)
      const token = res.data?.token || res.data?.data?.token;
      if (token) {
        localStorage.setItem("authToken", token);
      }

      // Lấy thông tin user từ /users/me (cần token đã lưu)
      try {
        const meRes = await getMe();
        const userData = meRes.data?.data || meRes.data;
        if (userData?.name) {
          localStorage.setItem("userName", userData.name);
        }
      } catch {
        // Fallback: dùng tên từ response login hoặc pendingName
        const fallbackName =
          res.data?.user?.name ||
          res.data?.data?.user?.name ||
          localStorage.getItem("pendingName");
        if (fallbackName) {
          localStorage.setItem("userName", fallbackName);
        }
      }

      // Xóa dữ liệu tạm
      localStorage.removeItem("pendingName");

      setMessage("Đăng nhập thành công! Chuyển sang trang tin tức...");
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Sai thông tin hoặc tài khoản chưa xác minh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-indigo-100 bg-white/80 p-8 shadow-lg">
            <p className="text-sm font-semibold text-indigo-700">
              Trách nhiệm pháp lý đi cùng tự do ngôn luận
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Đăng nhập GenZ News
            </h1>
            <p className="mt-2 text-slate-600">
              Mọi bài đăng đều phải đúng sự thật. Vi phạm chịu trách nhiệm trước
              pháp luật và cộng đồng.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                  placeholder="ban@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập & tiếp tục"}
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <p className="mt-6 text-sm text-slate-600">
              Chưa có tài khoản?{" "}
              <a
                href="/register"
                className="font-semibold text-indigo-700 hover:underline"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
              Quy ước cộng đồng
            </p>
            <h2 className="mt-3 text-2xl font-bold">Cam kết sự thật</h2>
            <p className="mt-2 text-slate-200">
              Đăng nhập đồng nghĩa bạn tuân thủ việc chỉ đăng thông tin chính xác,
              kèm nguồn rõ ràng và chịu trách nhiệm pháp lý.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-100">
              <p>• Tin sai sự thật có thể bị khóa tài khoản và báo cáo.</p>
              <p>• Cộng đồng ưu tiên bài viết được trích nguồn minh bạch.</p>
              <p>• Hãy dùng GenZ News để lan tỏa điều đúng.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
