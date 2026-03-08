// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getNewsByCategory } from "@/lib/news";
import NewsCard from "@/components/NewsCard";
import { News } from "@/types/news";

const categories = [
  { key: "công nghệ", label: "Công nghệ" },
  { key: "Kinh tế", label: "Kinh tế" },
  { key: "Giải trí", label: "Thể thao" },
  { key: "Giáo dục", label: "Giáo dục" },
  { key: "Chính trị - Xã hội", label: "Chính trị - Xã hội" },
  { key: "Môi trường", label: "Môi trường" },
];

export default function HomePage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("công nghệ");
  const [page, setPage] = useState(1);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const name = typeof window !== "undefined" ? localStorage.getItem("userFullName") : null;
      setUserFullName(name || null);
    } catch {
      setUserFullName(null);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  const fetchNews = async () => {
    setLoading(true);

    try {
      const res = await getNewsByCategory(selectedCategory, page, 9);
      const list =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data?.items ||
        res?.data ||
        [];

      if (!cancelled) {
        setNews(Array.isArray(list) ? list : []);
        setError(null);
      }
    } catch {
      if (!cancelled) {
        setError("Không thể tải tin. Vui lòng thử lại.");
        setNews([]);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchNews();

  return () => {
    cancelled = true;
  };
}, [selectedCategory, page]);


  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c4d3ff_0,transparent_35%)]"></div>
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-6 lg:pt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                📢 Mạng xã hội tin tức cộng đồng • Tất cả tin phải đúng sự thật
              </p>
              <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                GenZ News Network — nơi mọi người đều là nhà báo, nhưng{" "}
                <span className="text-indigo-600">trách nhiệm & minh bạch</span>{" "}
                được đặt lên hàng đầu.
              </h1>
              <p className="text-lg text-slate-600">
                Đăng ký để kể câu chuyện của bạn. Mọi bài đăng đều đi kèm cam kết
                “đúng sự thật, chịu trách nhiệm trước pháp luật”. Chúng tôi giúp
                bạn lan tỏa thông tin nhanh, rõ và đáng tin.
              </p>
              <div className="flex flex-wrap gap-3">
                {userFullName ? (
                  <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                      {userFullName.charAt(0).toUpperCase()}
                    </span>
                    <span>Xin chào, {userFullName}</span>
                  </div>
                ) : (
                  <>
                    <a
                      href="/register"
                      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                    >
                      Đăng ký thành nhà báo GenZ
                    </a>
                    <a
                      href="/login"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold !text-slate-400 transition hover:border-indigo-300 hover:text-indigo-700"
                    >
                      Đăng nhập & đăng bài
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-indigo-100 bg-white/60 p-4 shadow-xl backdrop-blur">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 p-4 text-white shadow-lg">
                  <p className="text-sm uppercase tracking-wide text-white/80">
                    Cam kết sự thật
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    “Tôi xác nhận mọi thông tin tôi đăng đều chính xác và chịu
                    trách nhiệm trước pháp luật.”
                  </p>
                  <p className="mt-3 text-sm text-white/90">
                    Vi phạm sẽ bị xử lý theo quy định. Đăng tải thông tin minh
                    bạch, xây dựng cộng đồng văn minh.
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>✓ Trình bày đẹp trên mọi thiết bị</li>
                  <li>✓ Dòng thời gian xã hội hóa, theo chủ đề</li>
                  <li>✓ Lưu, theo dõi, báo cáo & bình luận tức thì</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {categories.map((cate) => (
              <button
                key={cate.key}
                onClick={() => {
                  setSelectedCategory(cate.key);
                  setPage(1);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === cate.key
                    ? "border-indigo-200 bg-indigo-600 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                {cate.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Dòng thời gian cộng đồng
            </h2>
            <p className="text-sm text-slate-500">
              Nguồn tin được xác minh bởi chính người dùng. Tất cả đều có trách
              nhiệm pháp lý.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
              Live
            </span>
            Cập nhật liên tục
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-64 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : news.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
                Chưa có bài nào trong chủ đề này. Hãy là người đầu tiên đăng tin
                trung thực!
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {news.map((item) => (
                  <NewsCard key={item.newsId} news={item} />
                ))}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 disabled:opacity-50"
              >
                Trang trước
              </button>
              <span className="flex items-center text-sm font-semibold text-slate-600">
                Trang {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                Trang sau
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Nhà báo uy tín
              </h3>
              <p className="text-sm text-slate-500">
                Top tác giả được cộng đồng tin tưởng.
              </p>
              <div className="mt-4 space-y-3">
                {["Lan Anh", "Minh Quân", "Khánh Hòa"].map((name, idx) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">
                          100% tin đã xác minh
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Quy tắc cộng đồng
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Chỉ đăng thông tin đã kiểm chứng</li>
                <li>• Ghi rõ nguồn nếu trích dẫn</li>
                <li>• Vi phạm sẽ bị xử lý theo luật</li>
                <li>• Báo cáo ngay tin sai sự thật</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
