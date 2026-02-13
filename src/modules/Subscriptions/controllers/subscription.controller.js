import * as service from "../services/subscription.service.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await service.createSubscription(req.body);
    res.status(201).json({subscription});
  } catch (err) {
    next(err);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await service.getAllSubscriptions();
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await service.getSubscriptionById(req.params.id);
    res.json({ subscription });
  } catch (err) {
    next(err);
  }
};

export const getStudentSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await service.getStudentSubscriptions(req.params.studentId);
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
};

export const updateSubscription = async (req, res,next) => {
  try {
    const updated = await service.updateSubscription(
      req.params.id,
      req.body
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};


export const cancelSubscription = async (req, res, next) => {
  try {
    await service.cancelSubscription(req.params.id);
    res.json({ message: "Subscription canceled" });
  } catch (err) {
    next(err);
  }
};
