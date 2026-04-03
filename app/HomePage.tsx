// src/app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getLatestNews, getNewsByCategory, getTrendingJournalists } from "@/lib/news";
import NewsCard from "@/components/NewsCard";
import { News } from "@/types/news";
import { JournalistSummary } from "@/types/journalist";
import { toAssetUrl } from "@/lib/media";
import { useSearchParams, useRouter } from "next/navigation";

export default function HomePage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const selectedCategory =
    categoryParam && categoryParam !== "all" ? categoryParam : null;

  const router = useRouter();

  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [topJournalists, setTopJournalists] = useState<JournalistSummary[]>([]);
  const [topJournalistsLoading, setTopJournalistsLoading] = useState(true);
  const [topJournalistsError, setTopJournalistsError] = useState<string | null>(null);

  // Infinite scroll state (latest feed)
  const [latestHasMore, setLatestHasMore] = useState(true);
  const [latestNextCursor, setLatestNextCursor] = useState<string | null>(null);

  // Category paging state
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryHasMore, setCategoryHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const LATEST_PAGE_SIZE = 7;
  const CATEGORY_PAGE_SIZE = 1; // follow your requested endpoint shape

  const fetchLatest = useCallback(async (cursor: string | null, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLatestNews(cursor ?? undefined, LATEST_PAGE_SIZE);
      const raw = res?.data;
      const container = raw?.data ?? raw;
      const list =
        container?.data ?? container?.items ?? container?.news ?? container ?? [];
      const cursorFromResponse =
        container?.nextCursor ?? raw?.nextCursor ?? null;

      const items = Array.isArray(list) ? list : [];
      const lastItemId = items.length
        ? (items[items.length - 1] as News).newsId
        : null;
      setNews((prev) => (append ? [...prev, ...items] : items));
      // Prefer backend-provided cursor; fallback to last item's id for
      // backends that use "cursor = lastId".
      if (cursorFromResponse !== null && cursorFromResponse !== undefined) {
        setLatestNextCursor(String(cursorFromResponse));
        setLatestHasMore(true);
      } else if (lastItemId !== null && items.length === LATEST_PAGE_SIZE) {
        setLatestNextCursor(String(lastItemId));
        setLatestHasMore(true);
      } else {
        setLatestNextCursor(null);
        setLatestHasMore(false);
      }
    } catch {
      setError("Không thể tải tin. Vui lòng thử lại.");
      if (!append) setNews([]);
      setLatestHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCategory = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getNewsByCategory(
          selectedCategory || "",
          page,
          CATEGORY_PAGE_SIZE
        );
        const raw = res?.data;
        const container = raw?.data ?? raw;
        const list =
          container?.data ?? container?.items ?? container?.news ?? container ?? [];
        const items = Array.isArray(list) ? list : [];
        setNews(items);
        setCategoryHasMore(items.length === CATEGORY_PAGE_SIZE);
      } catch {
        setError("Không thể tải tin theo chủ đề. Vui lòng thử lại.");
        setNews([]);
        setCategoryHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory]
  );

  // Load initial feed (latest vs category)
  useEffect(() => {
    if (selectedCategory) {
      setCategoryPage(1);
      fetchByCategory(1);
      setLatestHasMore(false);
      setLatestNextCursor(null);
    } else {
      setCategoryPage(1);
      setCategoryHasMore(true);
      fetchLatest(null, false);
    }
  }, [selectedCategory, fetchByCategory, fetchLatest]);

  // Load top journalists
  useEffect(() => {
    const loadTopJournalists = async () => {
      setTopJournalistsLoading(true);
      setTopJournalistsError(null);
      try {
        const res = await getTrendingJournalists(10);
        const raw = res?.data;
        const container = raw?.data ?? raw;
        const list =
          container?.data ?? container?.items ?? container?.journalists ?? container ?? [];
        setTopJournalists(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Load top journalists failed", err);
        setTopJournalistsError("Không thể tải top nhà báo.");
        setTopJournalists([]);
      } finally {
        setTopJournalistsLoading(false);
      }
    };

    loadTopJournalists();
  }, []);

  // Infinite scroll trigger
  useEffect(() => {
    // Category mode uses normal pagination, not infinite scroll.
    if (selectedCategory) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          !loading &&
          latestHasMore &&
          latestNextCursor
        ) {
          fetchLatest(latestNextCursor, true);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    selectedCategory,
    latestHasMore,
    latestNextCursor,
    loading,
    news.length,
    fetchLatest,
  ]);


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

          {/* Categories đã được chuyển lên Header */}
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
            {loading && news.length === 0 ? (
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
                Chưa có bài nào. Hãy là người đầu tiên đăng tin trung thực!
              </div>
            ) : (
              <>
                {/* Featured big post */}
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  {news[0].thumbnail && (
                    <div className="relative h-72 w-full overflow-hidden bg-slate-100">
                      <img
                        src={toAssetUrl(news[0].thumbnail)}
                        alt={news[0].title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <p className="inline-flex rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white">
                          Tin nổi bật hôm nay
                        </p>
                        <h3 className="text-2xl font-bold text-white line-clamp-2">
                          {news[0].title}
                        </h3>
                        <p className="max-w-2xl text-sm text-slate-100 line-clamp-2">
                          {news[0].description}
                        </p>
                      </div>
                    </div>
                  )}
                  {!news[0].thumbnail && (
                    <div className="h-40 bg-slate-100" />
                  )}
                  <div className="p-5">
                    <NewsCard news={news[0]} />
                  </div>
                </article>

                {/* Remaining posts */}
                {news.length > 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {news.slice(1).map((item) => (
                      <NewsCard key={item.newsId} news={item} />
                    ))}
                  </div>
                )}

                {/* Infinite scroll (latest) OR normal pagination (category) */}
                {!selectedCategory ? (
                  <div ref={loadMoreRef} className="mt-6 h-8 w-full">
                    {loading && news.length > 0 && (
                      <div className="flex justify-center">
                        <span className="text-sm text-slate-500">
                          Đang tải thêm...
                        </span>
                      </div>
                    )}
                    {!latestHasMore && (
                      <div className="mt-2 flex justify-center">
                        <span className="text-xs text-slate-400">
                          Hết bài để hiển thị
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const next = categoryPage - 1;
                        if (next < 1) return;
                        setCategoryPage(next);
                        fetchByCategory(next);
                      }}
                      disabled={categoryPage <= 1 || loading}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    >
                      Trang trước
                    </button>
                    <span className="text-sm text-slate-600">
                      Trang {categoryPage}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = categoryPage + 1;
                        setCategoryPage(next);
                        fetchByCategory(next);
                      }}
                      disabled={!categoryHasMore || loading}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            )}
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
                {topJournalistsLoading ? (
                  <p className="text-sm text-slate-500">Đang tải...</p>
                ) : topJournalistsError ? (
                  <p className="text-sm text-rose-500">{topJournalistsError}</p>
                ) : topJournalists.length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>
                ) : (
                  topJournalists.map((journalist, idx) => (
                    <div
                      key={journalist.userId}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                    >
                      <button
                        onClick={() => router.push(`/journalist/${journalist.userId}`)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{journalist.name}</p>
                          <p className="text-xs text-slate-500">{journalist.newsCount} tin</p>
                        </div>
                      </button>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {journalist.newsCount}
                      </span>
                    </div>
                  ))
                )}
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
