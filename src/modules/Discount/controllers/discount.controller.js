// modules/discount/discount.controller.js
import * as service from "../services/discount.service.js";
import AppError  from "../../../common/utils/AppError.js";

export const createDiscount = async (req, res, next) => {
  try {
    const discount = await service.createDiscount(req.body);
    res.status(201).json({ success: true, data: discount });
  } catch (e) {
    next(e);
  }
};

export const updateDiscount = async (req, res, next) => {
  try {
    const discount = await service.updateDiscount(req.params.id, req.body);
    res.json({ success: true, data: discount });
  } catch (e) {
    next(e);
  }
};

export const deleteDiscount = async (req, res, next) => {
  try {
    await service.deleteDiscount(req.params.id);
    res.json({ success: true, message: "Discount disabled" });
  } catch (e) {
    next(e);
  }
};

export const getAllDiscounts = async (req, res) => {
  res.json(await service.getAllDiscounts());
};

export const getDiscountById = async (req, res) => {
  const discount = await service.getDiscountById(req.params.id);
  if (!discount) throw new AppError("Discount not found", 404);
  res.json(discount);
};

