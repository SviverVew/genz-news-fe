"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/lib/auth";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await verifyOtp({ email, otp });
      setMessage("Xác minh thành công! Vui lòng đăng nhập.");
      // Chuyển sang trang đăng nhập với popup đã đăng ký thành công
      router.push("/login?registered=1");
    } catch (err) {
      console.error(err);
      setError("Mã OTP không đúng hoặc đã hết hạn.");
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
              Xác minh tài khoản
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Nhập mã OTP để kích hoạt
            </h1>
            <p className="mt-2 text-slate-600">
              Chúng tôi đã gửi mã OTP tới email bạn đăng ký. Nhập mã để hoàn tất
              kích hoạt tài khoản.
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
                  Mã OTP
                </label>
                <input
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                  placeholder="Nhập mã gồm 4–6 chữ số"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Đang xác minh..." : "Xác minh tài khoản"}
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
              An toàn & Tin cậy
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Bảo vệ cộng đồng khỏi tin giả
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-100">
              <p>• OTP giúp xác minh bạn là chủ sở hữu email thật.</p>
              <p>
                • Mỗi tài khoản gắn với một danh tính, tăng trách nhiệm khi đăng
                tin.
              </p>
              <p>• Không chia sẻ mã OTP cho bất kỳ ai.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

