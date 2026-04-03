export interface UserShort {
  userId: number;
  name: string;
}

export interface News {
  newsId: number;
  title: string;
  description: string;
  thumbnail?: string;
  author: string;
  totalComment: number;
  // Optional fields returned by detail endpoints
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  viewCount?: number;
  view_count?: number;
  content?: string;
  category?: string;
  tags?: string[];
  totalLike?: number;
  totalShare?: number;
  authorAvatar?: string;
  user?: UserShort;
}
