// src/app/news/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getNewsDetail, getComments, postComment, saveNews, addViewedNews, deleteNews } from "@/lib/news";
import { useParams, useRouter } from "next/navigation";
import { News } from "@/types/news";
import Comment from "@/components/Comment";
import { Comment as CommentType } from "@/types/comment";

export default function NewsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [saving, setSaving] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sortBy, setSortBy] = useState("interest");

  const currentUserName =
    typeof window !== "undefined" ? localStorage.getItem("userName") : null;
  const isPostOwner = news?.author && currentUserName
    ? news.author === currentUserName
    : false;

  useEffect(() => {
    if (id) {
      const newsId = Number(id);
      getNewsDetail(newsId)
        .then((res) => {
          const newsData = res.data?.data || res.data;
          setNews(newsData);
        })
        .catch((err) => {
          console.error("Load detail error", err);
          setNews(null);
        });

      addViewedNews(newsId)
        .then(() => {
          setNews((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              viewCount:
                (Number(prev.viewCount ?? prev.view_count ?? 0) || 0) + 1,
            } as News;
          });
        })
        .catch((err) =>
          // Không cần log (thường 401 khi user chưa đăng nhập/ chưa xác minh)
          console.debug("Track view failed", err)
        );

      loadComments(newsId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const buildCommentTree = (comments: CommentType[]): CommentType[] => {
    const commentMap = new Map<number, CommentType>();
    const rootComments: CommentType[] = [];

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.commentId, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.commentId)!;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const loadComments = async (newsId: number) => {
    setLoadingComments(true);
    try {
      const res = await getComments(newsId, sortBy, 1, 10);
      const commentsData = res.data?.data || res.data || [];
      // Build nested structure if comments are flat
      const nestedComments = Array.isArray(commentsData)
        ? buildCommentTree(commentsData)
        : commentsData;
      setComments(nestedComments);
    } catch (err) {
      console.error("Load comments error", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentContent.trim() || !id) return;
    setPostingComment(true);
    try {
      await postComment(Number(id), {
        content: commentContent,
      });
      setCommentContent("");
      if (id) loadComments(Number(id));
    } catch (err) {
      console.error("Post comment failed", err);
    } finally {
      setPostingComment(false);
    }
  };

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
                  {(news.created_at ?? news.createdAt)
                    ? new Date(news.created_at ?? news.createdAt!).toLocaleString('vi-VN')
                    : "Thời gian không xác định"}
                </p>
                {(news.updated_at ?? news.updatedAt) && (
                  <p className="text-xs text-slate-400">
                    Cập nhật: {new Date(news.updated_at ?? news.updatedAt!).toLocaleString('vi-VN')}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  👁️ {news.viewCount ?? news.view_count ?? 0} lượt xem
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
            {isPostOwner && (
              <>
                <button
                  onClick={() => router.push(`/news/${id}/edit`)}
                  className="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={async () => {
                    if (!id || !confirm("Bạn có muốn xóa bài viết này?")) return;
                    try {
                      await deleteNews(Number(id));
                      router.push("/");
                    } catch (err) {
                      console.error("Delete news failed", err);
                      alert("Xóa bài viết thất bại. Vui lòng thử lại.");
                    }
                  }}
                  className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300"
                >
                  Xóa bài viết
                </button>
              </>
            )}
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

        <article className="prose prose-slate mt-6 max-w-none rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm text-black">
          {news.content ? (
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          ) : (
            <p className="text-slate-700">{news.content}</p>
          )}
        </article>

        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tuyên bố trách nhiệm: Người đăng đã xác nhận nội dung đúng sự thật và
          chịu trách nhiệm trước pháp luật. Hãy báo cáo ngay nếu phát hiện sai
          lệch.
        </div>

        {/* Comments Section */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Bình luận ({news?.totalComment || 0})
            </h2>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                if (id) loadComments(Number(id));
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-black"
            >
              <option value="interest">Quan tâm nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          {/* Post Comment Form */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-black" >
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-400"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handlePostComment}
                disabled={postingComment || !commentContent.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {postingComment ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-slate-500">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Comment
                  key={comment.commentId}
                  comment={comment}
                  newsId={Number(id)}
                  onDelete={(commentId) => {
                    setComments((prev) =>
                      prev.filter((c) => c.commentId !== commentId)
                    );
                  }}
                  onReply={() => {
                    // Reload comments after reply
                    if (id) loadComments(Number(id));
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
