// src/lib/news.ts
import api from "./api";

export const getNewsByCategory = (
  category: string,
  page = 1,
  limit = 10
) =>
  api.get(
    `/news/category?category=${category}&page=${page}&limit=${limit}`
  );

export const getNewsDetail = (id: number) =>
  api.get(`/news/${id}`);

export const createNews = (data: {
  title: string;
  content: string;
  thumbnail: string;
  category: string;
  datetime: string;
  author: string;
  tag: { keywords: string[] };
  status: string;
  description: string;
}) => api.post("/news", data);

export const saveNews = (newsId: number) =>
  api.post(`/news/saved/${newsId}`);

export const addViewedNews = (newsId: number) =>
  api.post(`/news/viewed/${newsId}`);

// Comments API
export const getComments = (
  newsId: number,
  sort: string = "interest",
  page: number = 1,
  limit: number = 5
) =>
  api.get(
    `/comments/news/${newsId}?sort=${sort}&page=${page}&limit=${limit}`
  );

export const postComment = (data: {
  content: string;
  parentCommentId?: number;
  newsId: number;
}) => api.post("/comments", data);

export const deleteComment = (commentId: number) =>
  api.delete(`/comments/${commentId}`);

// Search news
export const searchNews = (
  q: string,
  page: number = 1,
  limit: number = 3
) =>
  api.get(`/news/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
