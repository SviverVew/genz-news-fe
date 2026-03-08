// src/app/news/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getNewsDetail } from "@/lib/news";
import { useParams } from "next/navigation";
import { News } from "@/types/news";
import { addViewedNews, saveNews } from "@/lib/news";

export default function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const newsId = Number(id);
      getNewsDetail(newsId)
        .then((res) => setNews(res.data))
        .catch((err) => {
          console.error("Load detail error", err);
          setNews(null);
        });
      addViewedNews(newsId).catch((err) =>
        console.error("Track view failed", err)
      );
    }
  }, [id]);

  if (!news)
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 space-y-3">
          <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </main>
    );

  const handleSave = async () => {
    if (!news?.newsId) return;
    try {
      setSaving(true);
      await saveNews(news.newsId);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50">
      <section className="border-b border-slate-100 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">
            Bài viết từ cộng đồng • Trách nhiệm pháp lý rõ ràng
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">
            {news.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              {news.authorAvatar ? (
                <img
                  src={news.authorAvatar}
                  alt={news.author}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                  {news.author?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{news.author}</p>
                <p className="text-xs text-slate-500">
                  {news.createdAt
                    ? new Date(news.createdAt).toLocaleString()
                    : "Thời gian không xác định"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Đã cam kết sự thật
            </span>
            {news.category && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                #{news.category}
              </span>
            )}
            {news.tags?.length ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {news.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu bài viết"}
            </button>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
              Báo cáo sai sự thật
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12 pt-6">
        {news.thumbnail && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
            <img
              src={news.thumbnail}
              alt={news.title}
              className="h-[360px] w-full object-cover"
            />
          </div>
        )}

        <article className="prose prose-slate mt-6 max-w-none rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          {news.content ? (
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          ) : (
            <p className="text-slate-700">{news.description}</p>
          )}
        </article>

        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tuyên bố trách nhiệm: Người đăng đã xác nhận nội dung đúng sự thật và
          chịu trách nhiệm trước pháp luật. Hãy báo cáo ngay nếu phát hiện sai
          lệch.
        </div>
      </section>
    </main>
  );
}
