const httpStatus = require("http-status");
const Promotion = require("../models/promotion.model");
const APIError = require("../utils/APIError.utils");
const { addToCache } = require("../utils/redis.utils");

const get = async (req, res, next) => {
  try {
    const promotion = await Promotion.findOne(req.params.promotionId);

    if (!promotion) {
      return next(new APIError("Promotion not found", httpStatus.NOT_FOUND));
    }

    addToCache(req, 300, promotion);

    return res.json(promotion);
  } catch (err) {
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const promotions = await Promotion.find({});

    addToCache(req, 300, promotions);

    return res.json(promotions);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    let promotion = await Promotion.findOne({ title: req.body.title });

    if (promotion) {
      return next(
        new APIError("Promotion already exists", httpStatus.CONFLICT)
      );
    }

    promotion = new Promotion(req.body);

    await promotion.save();

    return res.status(httpStatus.CREATED).json(promotion);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const promotion = await Promotion.findOne({ _id: req.params.promotionId });

    if (!promotion) {
      return next(new APIError("Promotion not found", httpStatus.NOT_FOUND));
    }

    promotion.set(req.body);

    await promotion.save();

    return res.status(httpStatus.OK).json(promotion);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  get,
  list,
  create,
  update,
};
