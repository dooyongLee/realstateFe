import apiClient from "./apiClient";

// ==================== 구독 플랜 관리 ====================

export const getAllPlans = async () => {
  const res = await apiClient.get("/api/subscription-management/plans");
  return res.data.data;
};

export const createPlan = async (planData) => {
  const res = await apiClient.post("/api/subscription-management/plans", planData);
  return res.data.data;
};

export const getPlanDetail = async (id) => {
  const res = await apiClient.get(`/api/subscription-management/plans/${id}`);
  return res.data.data;
};

export const updatePlan = async (id, planData) => {
  const res = await apiClient.put(`/api/subscription-management/plans/${id}`, planData);
  return res.data.data;
};

export const deletePlan = async (id) => {
  await apiClient.delete(`/api/subscription-management/plans/${id}`);
};

export const getPlanByType = async (planType) => {
  const res = await apiClient.get(`/api/subscription-management/plans/type/${planType}`);
  return res.data.data;
};

export const getFreePlan = async () => {
  const res = await apiClient.get("/api/subscription-management/plans/free");
  return res.data.data;
};

// ==================== 구독 관리 ====================

export const getAllSubscriptions = async () => {
  const res = await apiClient.get("/api/subscription-management/subscriptions");
  return res.data.data;
};

export const createSubscription = async (subscriptionData) => {
  const res = await apiClient.post("/api/subscription-management/subscriptions", subscriptionData);
  return res.data.data;
};

export const getSubscriptionDetail = async (id) => {
  const res = await apiClient.get(`/api/subscription-management/subscriptions/${id}`);
  return res.data.data;
};

export const updateSubscription = async (id, subscriptionData) => {
  const res = await apiClient.put(`/api/subscription-management/subscriptions/${id}`, subscriptionData);
  return res.data.data;
};

export const deleteSubscription = async (id) => {
  await apiClient.delete(`/api/subscription-management/subscriptions/${id}`);
};

export const getCurrentActiveByAgencyId = async (agencyId) => {
  const res = await apiClient.get(`/api/subscription-management/subscriptions/agency/${agencyId}/current`);
  return res.data.data;
};

export const getSubscriptionsByAgencyId = async (agencyId) => {
  const res = await apiClient.get(`/api/subscription-management/subscriptions/agency/${agencyId}`);
  return res.data.data;
};

export const activateSubscription = async (id) => {
  await apiClient.post(`/api/subscription-management/subscriptions/${id}/activate`);
};

export const deactivateSubscription = async (id) => {
  await apiClient.post(`/api/subscription-management/subscriptions/${id}/deactivate`);
};

export const extendSubscription = async (id, newEndDate) => {
  await apiClient.post(`/api/subscription-management/subscriptions/${id}/extend?newEndDate=${newEndDate}`);
};

// ==================== 에이전시 사용자 수 관리 ====================

export const getAgencyUserCount = async (agencyId) => {
  const res = await apiClient.get(`/api/users/agency/${agencyId}/count`);
  return res.data.data;
};

export const getAllAgencyUserCounts = async () => {
  const res = await apiClient.get("/api/users/agency/counts");
  return res.data.data;
}; 