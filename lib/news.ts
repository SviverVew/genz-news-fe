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

export const saveNews = (newsId: number) =>
  api.post(`/news/saved/${newsId}`);

export const addViewedNews = (newsId: number) =>
  api.post(`/news/viewed/${newsId}`);
