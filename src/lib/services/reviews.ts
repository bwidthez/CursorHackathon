import { apiClient } from "@/lib/api/client";

export interface Review {
  id: string;
  reviewerId: string;
  subjectUserId: string; // landlord or tenant being reviewed
  rating: number; // 1?5
  comment: string;
  createdAt: string;
}

export interface CreateReviewInput {
  subjectUserId: string;
  rating: number;
  comment: string;
}

/**
 * Placeholder review service.
 *
 * Example backend endpoints your teammates might implement:
 * - GET /users/:id/reviews
 * - POST /users/:id/reviews
 */
export const reviewService = {
  /**
   * List reviews for a given user (e.g. landlord reputation view).
   */
  async listForUser(userId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(`/users/${userId}/reviews`);
  },

  /**
   * Create a review about a user (e.g. tenant reviewing landlord or vice versa).
   */
  async createForUser(userId: string, input: CreateReviewInput): Promise<Review> {
    return apiClient.post<Review>(`/users/${userId}/reviews`, input);
  },
};

