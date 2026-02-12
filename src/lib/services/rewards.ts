import { apiClient } from "@/lib/api/client";

export type RewardPaidStatus = "unpaid" | "paid" | "in_progress";

export interface RewardSummary {
  id: string;
  tenantId: string;
  month: string; // e.g. \"2026-02\"
  totalReward: number;
  paidStatus: RewardPaidStatus;
}

export interface TenantRewardLineItem {
  taskId: string;
  title: string;
  rewardAmount: number;
  approvedAt: string;
}

/**
 * Placeholder reward service.
 *
 * Example backend endpoints your teammates might implement:
 * - GET /tenants/:id/rewards?month=YYYY-MM
 * - GET /rewards/summary?month=YYYY-MM (Admin / Landlord view)
 */
export const rewardService = {
  /**
   * Fetch a monthly reward summary for a specific tenant.
   */
  async getTenantMonthlySummary(tenantId: string, month: string): Promise<RewardSummary> {
    const params = new URLSearchParams({ month });
    return apiClient.get<RewardSummary>(`/tenants/${tenantId}/rewards?${params.toString()}`);
  },

  /**
   * Fetch detailed line items for a tenant's rewards in a given month.
   */
  async getTenantMonthlyLineItems(tenantId: string, month: string): Promise<TenantRewardLineItem[]> {
    const params = new URLSearchParams({ month });
    return apiClient.get<TenantRewardLineItem[]>(`/tenants/${tenantId}/rewards/items?${params.toString()}`);
  },

  /**
   * Fetch an aggregate monthly reward summary for Admin reporting.
   */
  async getMonthlyAdminSummary(month: string): Promise<RewardSummary[]> {
    const params = new URLSearchParams({ month });
    return apiClient.get<RewardSummary[]>(`/rewards/summary?${params.toString()}`);
  },
};

