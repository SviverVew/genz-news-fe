// src/components/NewsCard.tsx
"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { addViewedNews, saveNews } from "@/lib/news";
import { News } from "@/types/news";

export default function NewsCard({ news }: { news: News }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setSaving(true);
      await saveNews(news.newsId);
      setSaved(true);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleView = () => {
    addViewedNews(news.newsId).catch((err) =>
      console.error("Track view failed", err)
    );
  };

  return (
    <Link
      href={`/news/${news.newsId}`}
      onClick={handleView}
      className="group relative block h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-cyan-50">
          {news.thumbnail ? (
            <img
              src={news.thumbnail}
              alt={news.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Không có ảnh bìa
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {news.category || "Tin nóng"}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          <h2 className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
            {news.title}
          </h2>

          <p className="text-sm text-slate-600 line-clamp-3">
            {news.description}
          </p>

          <div className="mt-auto flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              {news.authorAvatar ? (
                <img
                  src={news.authorAvatar}
                  alt={news.author}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {news.author?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">
                  {news.author}
                </span>
                <span className="text-xs">
                  {news.createdAt
                    ? new Date(news.createdAt).toLocaleDateString()
                    : "Đã xác minh sự thật"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                💬 {news.totalComment} phản hồi
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-indigo-600 px-3 py-1 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saved ? "Đã lưu" : saving ? "Đang lưu..." : "Lưu tin"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
