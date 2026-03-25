// src/lib/news.ts
import api from "./api";

export const getNewsByCategory = (
  category: string,
  page = 1,
  limit = 10
) =>
  api.get(
    `/news/category?category=${encodeURIComponent(
      category
    )}&page=${page}&limit=${limit}`
  );

export const getNewsByCategoryWithCursor = (
  category: string,
  cursor?: number,
  limit = 9
) => {
  const url =
    cursor !== undefined && cursor !== null
      ? `/news?category=${encodeURIComponent(
          category
        )}&cursor=${cursor}&limit=${limit}`
      : `/news?category=${encodeURIComponent(category)}&limit=${limit}`;
  return api.get(url);
};

export const searchNews = (query: string, page = 1, limit = 10) =>
  api.get(
    `/news/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );

export const getNewsDetail = (id: number) => api.get(`/news/${id}`);

export const createNews = (data: {
  title: string;
  content: string;
  thumbnail?: string;
  category: string;
  datetime: string;
  author: string;
  tag: { keywords: string[] };
  status: string;
  description: string;
}) => api.post(`/news`, data);

export const updateNews = (newsId: number, data: Partial<{
  title: string;
  content: string;
  thumbnail: string;
  category: string;
  datetime: string;
  author: string;
  tag: { keywords: string[] };
  status: string;
  description: string;
}>) => api.patch(`/news/${newsId}`, data);

export const deleteNews = (newsId: number) => api.delete(`/news/${newsId}`);

export const uploadNewsThumbnail = (file: File) => {
  const formData = new FormData();

  // ✅ đúng field backend yêu cầu
  formData.append("image", file);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  return api.post(`/news/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // 🔥 FIX 401
    },
  });
};

export const getComments = (
  newsId: number,
  sortBy = "interest",
  page = 1,
  limit = 10
) => api.get(`/comments/news/${newsId}?sort=${sortBy}&page=${page}&limit=${limit}`);

export const postComment = async (
  newsId: number,
  payload: {
    content: string;
    parentCommentId?: number;
  }
) => {
  // Backend có thể dùng các route POST khác với route GET.
  // Vì vậy ta thử theo thứ tự các khả năng phổ biến rồi trả về cái chạy được.
  const body = { ...payload, newsId };

  const attempts: Array<{
    url: string;
    data: typeof payload | typeof body;
  }> = [
    // Expected by some backends
    { url: `/comments/news/${newsId}`, data: payload },
    // Alternative: POST /comments/:newsId
    { url: `/comments/${newsId}`, data: payload },
    // Alternative: POST /comments/news with body including newsId
    { url: `/comments/news/${newsId}`, data: body },
    { url: `/comments/news`, data: body },
    { url: `/comments`, data: body },
  ];

  let lastErr: unknown = null;
  for (const a of attempts) {
    try {
      return await api.post(a.url, a.data);
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
};

export const deleteComment = (commentId: number, payload?: {
  content: string;
  parentCommentId?: number;
}) => {
  if (payload) {
    return api.request({
      method: "DELETE",
      url: `/comments/${commentId}`,
      data: payload,
    });
  }
  return api.request({
    method: "DELETE",
    url: `/comments/${commentId}`,
  });
};

export const saveNews = (newsId: number) => api.post(`/news/saved/${newsId}`);

export const unsaveNews = (newsId: number) => api.delete(`/news/saved/${newsId}`);

export const getSavedNews = (page = 1, limit = 10) => 
  api.get(`/news/saved?page=${page}&limit=${limit}`);

export const getMyNews = (page = 1, limit = 10) => 
  api.get(`/news/my-news?page=${page}&limit=${limit}`);

export const addViewedNews = async (newsId: number) => {
  // If user is not logged in, backend will 401; we don't need to break UX.
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
  }

  try {
    // Backend sometimes exposes either `/viewed/:id` or `/news/viewed/:id`
    return await api.post(`/viewed/${newsId}`);
  } catch {
    // Retry alternative route; if still fails (e.g. 401), swallow it.
    try {
      return await api.post(`/news/viewed/${newsId}`);
    } catch {
      return null;
    }
  }
};

export const getViewedNews = (page: number = 1, limit: number = 20) =>
  api.get(`/news/viewed?page=${page}&limit=${limit}`);

// Latest news (timeline) with cursor pagination
// - First load: GET /news (no cursor)
// - Next: GET /news?cursor=<nextCursor>&limit=<limit>
export const getLatestNews = (
  cursor?: string | number | null,
  limit: number = 7
) => {
  if (cursor === undefined || cursor === null || cursor === "") {
    return api.get("/news");
  }

  return api.get(
    `/news?cursor=${encodeURIComponent(cursor)}&limit=${encodeURIComponent(
      String(limit)
    )}`
  );
};

