import { apiClient } from "@/lib/api/client";

export type UserRole = "admin" | "landlord" | "tenant";

export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface CreateLandlordInput {
  name: string;
  email: string;
}

/**
 * Placeholder user service.
 *
 * Your backend team can implement the corresponding endpoints, e.g.:
 * - GET /users/me
 * - GET /landlords
 * - POST /landlords
 * - PATCH /users/:id (suspend / activate)
 */
export const userService = {
  /**
   * Fetch the currently logged-in user.
   * For now this is just a placeholder ? the route and shape can be adjusted later.
   */
  async getCurrentUser(): Promise<User> {
    // Example placeholder path ? adjust when backend is ready.
    return apiClient.get<User>("/users/me");
  },

  /**
   * List all landlords (Admin view).
   */
  async listLandlords(): Promise<User[]> {
    return apiClient.get<User[]>("/landlords");
  },

  /**
   * Create a new landlord account (Admin action).
   */
  async createLandlord(input: CreateLandlordInput): Promise<User> {
    return apiClient.post<User>("/landlords", input);
  },

  /**
   * Update a user's status (e.g. suspend / activate).
   */
  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    return apiClient.patch<User>(`/users/${userId}`, { status });
  },
};

