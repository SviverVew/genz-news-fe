export interface Comment {
  commentId: number;
  newsId: number;
  userId: number;
  content: string;
  isHidden: boolean;
  created_at: string;
  updated_at: string;
  user: {
    userId: number;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
  replies?: Comment[];
  parentCommentId?: number;
}
