"use client";
import { uploadNewsThumbnail } from "@/lib/news";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNews } from "@/lib/news";

const categories = [
  "Công nghệ",
  "Kinh tế",
  "Giải trí",
  "Giáo dục",
  "Chính trị - Xã hội",
  "Môi trường",
];

export default function CreateNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  useEffect(() => {
    const userName =
      typeof window !== "undefined"
        ? localStorage.getItem("userName") ||
          localStorage.getItem("userFullName")
        : null;
    if (userName) {
      setFormData((prev) => ({ ...prev, author: userName }));
    }
  }, []);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createNews({
        title: formData.title,
        content: formData.content,
        thumbnail: formData.thumbnail,
        category: formData.category,
        datetime: formData.datetime,
        author: formData.author,
        tag: { keywords: formData.keywords },
        status: formData.status,
        description: formData.description,
      });
      router.push("/");
    } catch (err: unknown) {
      console.error("Create news failed", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(
        errorMessage || "Tạo bài viết thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-indigo-100 bg-white/80 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900">
            Tạo bài viết mới
          </h1>
          <p className="mt-2 text-slate-600">
            Đăng bài viết của bạn. Nhớ cam kết nội dung đúng sự thật và chịu
            trách nhiệm trước pháp luật.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Tiêu đề *
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Mô tả ngắn *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                placeholder="Mô tả ngắn về bài viết"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Nội dung *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                placeholder="Viết nội dung bài viết của bạn..."
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                URL hình ảnh thumbnail
              </label>

              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnail: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                placeholder="https://example.com/images/thumbnail.jpg"
              />

              {/* Upload file */}
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

                      // ✅ API của m trả về: data.imageUrl
                      const url = res.data?.data?.imageUrl;

                      if (url) {
                        setFormData((prev) => ({
                          ...prev,
                          thumbnail: url,
                        }));
                      }
                    } catch (err) {
                      console.error("Upload failed", err);
                      setError("Upload ảnh thất bại");
                    } finally {
                      setUploadingThumbnail(false);
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm !text-black !file:text-black" 
                />

                {uploadingThumbnail && (
                  <p className="text-sm text-slate-500">Đang upload...</p>
                )}
              </div>

              {/* Preview */}
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="thumbnail"
                  className="mt-3 w-40 rounded-lg border"
                />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Danh mục *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
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
                <label className="text-sm font-semibold text-slate-700">
                  Tác giả *
                </label>
                <input
                  required
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-indigo-100 focus:border-indigo-400 focus:ring"
                  placeholder="Tên tác giả"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Từ khóa
              </label>
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
                        onClick={() => handleRemoveKeyword(keyword)}
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Đang tạo..." : "Đăng bài viết"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
