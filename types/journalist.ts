export interface JournalistSummary {
  userId: number;
  name: string;
  newsCount: number;
}

export interface JournalistRatingOverview {
  journalist: {
    userId: number;
    name: string;
  };
  newsCount: number;
  rating: {
    avgRating: string;
    totalRatings: string;
  };
  recentReviews: Array<{
    ratingId: number;
    rating: number;
    comment: string;
    ratedBy: string;
    date: string;
  }>;
}

export interface RateJournalistPayload {
  rating: number;
  comment: string;
}
