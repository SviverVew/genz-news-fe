"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyNews, getSavedNews, getViewedNews, deleteNews } from "@/lib/news";
import NewsCard from "@/components/NewsCard";
import { News } from "@/types/news";

type TabType = "my-news" | "saved-news" | "viewed-news";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("my-news");
  const [myNews, setMyNews] = useState<News[]>([]);
  const [savedNews, setSavedNews] = useState<News[]>([]);
  const [viewedNews, setViewedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const extractNewsArray = (res: unknown): News[] => {
    if (typeof res !== "object" || res === null) return [];
  
    // level 1
    const l1 = res as { data?: unknown };
    if (!l1.data) return [];
  
    // level 2
    const l2 = l1.data as { data?: unknown };
  
    // 👉 nếu level 2 là array luôn (edge case)
    if (Array.isArray(l2)) return l2 as News[];
  
    // level 3 (my-news)
    if (
      typeof l2.data === "object" &&
      l2.data !== null &&
      "data" in (l2.data as object)
    ) {
      const l3 = l2.data as { data?: unknown };
      return Array.isArray(l3.data) ? (l3.data as News[]) : [];
    }
  
    // 👉 saved + viewed
    return Array.isArray(l2.data) ? (l2.data as News[]) : [];
  };
  // Check if user is logged in
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "my-news") {
          const res = await getMyNews(1, 20);
          setMyNews(extractNewsArray(res.data));
        } else if (activeTab === "saved-news") {
          const res = await getSavedNews(1, 20);
          setSavedNews(extractNewsArray(res));
        } else {
          const res = await getViewedNews(1, 20);
          setViewedNews(extractNewsArray(res));
        }
      } catch (err) {
        console.error("Load profile data failed", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  const tabs = [
    { id: "my-news" as TabType, label: "Tin của tôi", count: myNews.length },
    { id: "saved-news" as TabType, label: "Tin đã lưu", count: savedNews.length },
    {
      id: "viewed-news" as TabType,
      label: "Tin đã xem",
      count: viewedNews.length,
    },
  ];

  const currentData =
    activeTab === "my-news"
      ? myNews
      : activeTab === "saved-news"
        ? savedNews
        : viewedNews;
  const isEmpty = currentData.length === 0;
  const isMyNewsTab = activeTab === "my-news";
  const emptyTitle = isMyNewsTab
    ? "Chưa có tin nào"
    : activeTab === "saved-news"
      ? "Chưa lưu tin nào"
      : "Chưa có tin nào đã xem";
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📄</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {emptyTitle}
      </h3>
      <p className="text-slate-600 mb-6">
        {activeTab === "my-news"
          ? "Hãy tạo bài viết đầu tiên của bạn"
          : activeTab === "saved-news"
            ? "Lưu các tin tức thú vị để đọc sau"
            : "Bạn chưa xem bài viết nào. Hãy mở 1 bài để xem trước nhé."}
      </p>
      {isMyNewsTab && (
        <button
          onClick={() => router.push("/news/create")}
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          Tạo bài viết
        </button>
      )}
    </div>
  );

  const handleEdit = (newsId: number) => {
    router.push(`/news/${newsId}/edit`);
  };

  const handleDelete = async (newsId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tin này?")) {
      try {
        setDeletingId(newsId);
        await deleteNews(newsId);
        setMyNews(prev => prev.filter(news => news.newsId !== newsId));
      } catch (err) {
        console.error("Delete failed", err);
        setError("Không thể xóa tin. Vui lòng thử lại.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading && !myNews.length && !savedNews.length && !viewedNews.length) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`profile-skeleton-${index + 1}`} className="h-64 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Trang cá nhân</h1>
          <p className="text-slate-600">Quản lý tin tức của bạn</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-slate-100 text-slate-600">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`profile-loading-${index + 1}`}
                className="h-64 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div>
            {isEmpty ? (
              renderEmptyState()
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentData.map((news) => (
                  <NewsCard 
                    key={news.newsId} 
                    news={news} 
                    isOwner={isMyNewsTab}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deletingId === news.newsId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
