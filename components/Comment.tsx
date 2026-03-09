"use client";

import { useState } from "react";
import { Comment as CommentType } from "@/types/comment";
import { postComment, deleteComment } from "@/lib/news";

interface CommentProps {
  comment: CommentType;
  newsId: number;
  onDelete: (commentId: number) => void;
  onReply: (commentId: number, content: string) => void;
  level?: number;
}

export default function Comment({
  comment,
  newsId,
  onDelete,
  onReply,
  level = 0,
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      await postComment({
        content: replyContent,
        parentCommentId: comment.commentId,
        newsId,
      });
      onReply(comment.commentId, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (err) {
      console.error("Reply failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    setDeleting(true);
    try {
      await deleteComment(comment.commentId);
      onDelete(comment.commentId);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  const isOwnComment =
    typeof window !== "undefined" &&
    localStorage.getItem("authToken") &&
    comment.user.userId ===
      Number(localStorage.getItem("userId") || "0");

  return (
    <div
      className={`${
        level > 0 ? "ml-8 border-l-2 border-slate-200 pl-4" : ""
      }`}
    >
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {comment.user.name}
                  {comment.user.isVerified && (
                    <span className="ml-2 text-xs text-emerald-600">
                      ✓ Verified
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(comment.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            <p className="mt-2 text-slate-700">{comment.content}</p>
          </div>
          {isOwnComment && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-rose-600 hover:text-rose-700 disabled:opacity-50"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </button>
          )}
        </div>

        {level < 2 && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {showReplyForm ? "Hủy" : "Trả lời"}
            </button>
          </div>
        )}

        {showReplyForm && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết bình luận..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={loading || !replyContent.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi"}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.commentId}
              comment={reply}
              newsId={newsId}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
