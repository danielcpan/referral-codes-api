const httpStatus = require("http-status");
const Referral = require("../models/referral.model");
const APIError = require("../utils/APIError.utils");

const get = async (req, res, next) => {
  try {
    const referral = await Referral.findOne(req.params.referralId);

    if (!referral) {
      return next(new APIError("Referral not found", httpStatus.NOT_FOUND));
    }

    addToCache(req, 300, referral);

    return res.json(referral);
  } catch (err) {
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const referrals = await Referral.find({});

    addToCache(req, 300, referrals);

    return res.json(referrals);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    let referral = await Referral.findOne({
      $or: [{ code: req.body.code }, { link: req.body.link }],
    });

    if (referral) {
      return next(new APIError("Referral already exists", httpStatus.CONFLICT));
    }

    referral = new Referral(req.body);

    await referral.save();

    return res.status(httpStatus.CREATED).json(referral);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const referral = await Referral.findOne({ _id: req.params.referralId });

    if (!referral) {
      return next(new APIError("Referral not found", httpStatus.NOT_FOUND));
    }

    referral.set(req.body);

    await referral.save();

    return res.status(httpStatus.OK).json(referral);
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
