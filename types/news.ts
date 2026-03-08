export interface News {
  newsId: number;
  title: string;
  description: string;
  thumbnail?: string;
  author: string;
  totalComment: number;
  // Optional fields returned by detail endpoints
  createdAt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  totalLike?: number;
  totalShare?: number;
  authorAvatar?: string;
}
