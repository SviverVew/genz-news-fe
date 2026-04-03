"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getNewsDetail, updateNews, uploadNewsThumbnail } from "@/lib/news";
import { News } from "@/types/news";

const categories = [
  "Công nghệ",
  "Kinh tế",
  "Giải trí",
  "Giáo dục",
  "Chính trị - Xã hội",
  "Môi trường",
];

export default function EditNewsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "",
    category: "Công nghệ",
    datetime: new Date().toISOString(),
    author: "",
    keywords: [] as string[],
    status: "Xuất bản",
    description: "",
  });
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (!id) return;

    getNewsDetail(Number(id))
      .then((res) => {
        const news = res.data?.data || res.data;
        if (news) {
          setFormData({
            title: news.title || "",
            content: news.content || "",
            thumbnail: news.thumbnail || "",
            category: news.category || "Công nghệ",
            datetime: news.datetime || new Date().toISOString(),
            author: news.author || "",
            keywords: news.tags || [],
            status: news.status || "Xuất bản",
            description: news.description || "",
          });
        }
      })
      .catch((err) => {
        console.error("Load news failed", err);
        setError("Không thể tải thông tin bài viết.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      keywords: [...new Set([...prev.keywords, keywordInput.trim()])],
    }));
    setKeywordInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      await updateNews(Number(id), {
        title: formData.title,
        content: formData.content,
        thumbnail: formData.thumbnail,
        category: formData.category,
        author: formData.author,
        tag: { keywords: formData.keywords },
        status: formData.status,
        description: formData.description,
      });
      router.push(`/news/${id}`);
    } catch (err) {
      console.error("Update news failed", err);
      setError("Cập nhật bài viết thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="animate-pulse rounded-3xl border border-indigo-100 bg-white p-8" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-indigo-100 bg-white/80 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa bài viết</h1>
          <p className="mt-2 text-slate-600">
            Chỉnh nội dung và nhấn Lưu. Chỉ người tạo bài mới có thể thực hiện.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tiêu đề *</label>
              <input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Mô tả ngắn *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nội dung *</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">URL hình ảnh thumbnail</label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
              />
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                  
                    setUploadingThumbnail(true);
                  
                    try {
                      const res = await uploadNewsThumbnail(file);
                  
                      const url = res.data?.data?.imageUrl; // ✅ FIX CHÍNH
                  
                      if (url) {
                        setFormData((prev) => ({
                          ...prev,
                          thumbnail: url,
                        }));
                      }
                    } catch (uploadErr) {
                      console.error("Upload thumbnail failed", uploadErr);
                      setError("Tải ảnh thất bại. Vui lòng thử lại.");
                    } finally {
                      setUploadingThumbnail(false);
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm !text-black !file:text-black"
                />
                {uploadingThumbnail && (
                  <p className="text-sm !text-slate-700">Đang upload ảnh...</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Danh mục *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tác giả *</label>
                <input
                  required
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Từ khóa</label>
              <div className="flex gap-2">
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                  placeholder="Nhập từ khóa và nhấn Enter"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Thêm
                </button>
              </div>
              {formData.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            keywords: prev.keywords.filter((k) => k !== keyword),
                          }))
                        }
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Đang cập nhật..." : "Cập nhật bài viết"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
