const httpStatus = require('http-status');
const User = require('../models/user.model');
const APIError = require('../utils/APIError.utils');
const { addToCache } = require('../utils/redis.utils');

module.exports = {
  me: async (req, res, next) => {
    try {
      addToCache(req, 300, req.user);
      return res.status(httpStatus.OK).json(req.user);
    } catch (err) {
      return next(err);
    }
  },
  get: async (req, res, next) => {
    const { userId } = req.params;

    if (!req.user.isAdmin && userId !== req.user._id) {
      return next(new APIError('No Admin Access', httpStatus.UNAUTHORIZED));
    }

    try {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        return next(new APIError('User not found', httpStatus.NOT_FOUND));
      }

      addToCache(req, 300, user.withoutPass());

      return res.status(httpStatus.OK).json(user.withoutPass());
    } catch (err) {
      return next(err);
    }
  },
  search: async (req, res, next) => {
    const { val } = req.query;

    try {
      const users = await User.find({
        $or: [
          { email: { $regex: val, $options: 'i' } },
          { firstName: { $regex: val, $options: 'i' } },
          { lastName: { $regex: val, $options: 'i' } },
          { username: { $regex: val, $options: 'i' } },
        ],
      })
        .select('-password')
        .limit(10);

      addToCache(req, 300, users);

      return res.status(httpStatus.OK).json(users);
    } catch (err) {
      return next(err);
    }
  },
  update: async (req, res, next) => {
    const { userId } = req.params;

    // Check if password update attempt present
    if (req.body.password) {
      const errMsg = 'Cannot update password without email verification';
      return next(new APIError(errMsg, httpStatus.UNAUTHORIZED));
    }

    try {
      const user = await User.findOne({ _id: userId });

      // Check if user exists
      if (!user) {
        return next(new APIError('User not found', httpStatus.NOT_FOUND));
      }

      // Check if same user because only same user can modify self
      if (req.user._id !== userId) {
        return next(new APIError('Can only update own account', httpStatus.UNAUTHORIZED));
      }

      // Check if username is unique
      if (req.body.username) {
        const userWithUsername = await User.findOne({ username: req.body.username });

        if (userWithUsername) {
          return next(new APIError('Username is taken', httpStatus.UNAUTHORIZED, true));
        }
      }

      // Check if email is unique
      if (req.body.email) {
        const userWithEmail = await User.findOne({ email: new RegExp(req.body.email, 'i') });

        if (userWithEmail) {
          const errMsg = 'User with this email already exists';
          return next(new APIError(errMsg, httpStatus.UNAUTHORIZED, true));
        }
      }

      // Limit updates to only updatable fields
      const {
        isVerified, isAdmin, password, ...updatableUserFields
      } = req.body;
      Object.assign(user, updatableUserFields);
      await user.save();

      return res.status(httpStatus.OK).json(user.withoutPass());
    } catch (err) {
      return next(err);
    }
  },
};
