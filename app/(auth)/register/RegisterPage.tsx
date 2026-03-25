
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await register({ email, password, name });
      if (typeof window !== "undefined") {
        localStorage.setItem("pendingFullName", name);
      }
      // Đăng ký xong chuyển qua trang verify để nhập OTP
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
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
              Cộng đồng nhà báo GenZ
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Đăng ký & cam kết sự thật
            </h1>
            <p className="mt-2 text-slate-600">
              Trước khi đăng ký, bạn đồng ý: mọi nội dung đăng tải phải đúng sự
              thật, nếu sai sẽ chịu trách nhiệm trước pháp luật.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Họ tên đầy đủ
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                  placeholder="Nguyễn Văn A"
                />
              </div>
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
              <p className="text-xs text-slate-500">
                Bằng cách tiếp tục, bạn xác nhận sẽ đăng nội dung đúng sự thật,
                chịu trách nhiệm trước pháp luật nếu sai phạm.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Đang đăng ký..." : "Tạo tài khoản nhà báo"}
              </button>

              {message && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  {message}
                </div>
              )}
              {error && (
                <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
              Điều khoản bắt buộc
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Đăng tin = chịu trách nhiệm
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-100">
              <p>• Chỉ đăng thông tin đúng sự thật, có nguồn.</p>
              <p>• Tin sai sự thật có thể bị khóa tài khoản và truy cứu pháp lý.</p>
              <p>• Cộng đồng có thể báo cáo, kiểm duyệt minh bạch.</p>
              <p>• Tôn trọng quyền riêng tư, không kích động thù ghét.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
