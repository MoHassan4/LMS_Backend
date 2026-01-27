import * as dashboardRepo from "../repositories/dashboard.repoistory.js";

export const getDashboard = async () => {
  const [
    stats,
    subscriptionsDistribution,
    monthlyPerformance,
  ] = await Promise.all([
    dashboardRepo.getStats(),
    dashboardRepo.getSubscriptionsDistribution(),
    dashboardRepo.getMonthlyPerformance(),
  ]);

  return {
    stats,
    subscriptionsDistribution,
    monthlyPerformance,
  };
};
