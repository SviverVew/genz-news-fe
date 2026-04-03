"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getJournalistRating,
  postJournalistRating,
} from "@/lib/news";
import {
  JournalistRatingOverview,
  RateJournalistPayload,
} from "@/types/journalist";

export default function JournalistPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [data, setData] = useState<JournalistRatingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchJournalist = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getJournalistRating(id);
        const payload = res?.data?.data ?? res?.data;
        setData(payload ?? null);
      } catch (err) {
        console.error("Load journalist detail failed", err);
        setError("Không thể tải thông tin nhà báo.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalist();
  }, [id]);

  const handleSubmitRating = async () => {
    if (!id || !comment.trim()) return;

    const payload: RateJournalistPayload = {
      rating,
      comment: comment.trim(),
    };

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await postJournalistRating(id, payload);
      setComment("");
      setRating(5);
      setSubmitMessage("Gửi đánh giá thành công!");
      const res = await getJournalistRating(id);
      const payloadData = res?.data?.data ?? res?.data;
      setData(payloadData ?? null);
    } catch (err) {
      console.error("Submit rating failed", err);
      setSubmitMessage("Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Hồ sơ nhà báo
        </h1>

        {loading ? (
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        ) : error ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        ) : !data ? (
          <p className="text-slate-500">Không tìm thấy dữ liệu.</p>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                  {data.journalist.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {data.journalist.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {data.newsCount} bài viết • {data.rating.totalRatings} đánh
                    giá
                  </p>
                  <p className="mt-2 text-lg font-semibold text-emerald-700">
                    {Number(data.rating.avgRating).toFixed(2)} / 5.0
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Gửi đánh giá cho nhà báo này
              </h3>
              <div className="grid gap-3">
                <label className="text-sm text-slate-700">
                  Điểm đánh giá
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-700">
                  Bình luận
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bài viết rất hay..."
                    className="mt-1 h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <button
                  onClick={handleSubmitRating}
                  disabled={isSubmitting || !comment.trim()}
                  className="w-max rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>

                {submitMessage && (
                  <p className="text-sm text-slate-600">{submitMessage}</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                10 đánh giá gần đây
              </h3>
              <div className="space-y-3">
                {data.recentReviews.length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có đánh giá nào.</p>
                ) : (
                  data.recentReviews.map((r) => (
                    <div
                      key={r.ratingId}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900">
                          {r.ratedBy || "Người dùng"}
                        </span>
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                          {r.rating}/5
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(r.date).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
