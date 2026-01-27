import * as dashboardService from "../services/dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard();
    res.status(200).json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
