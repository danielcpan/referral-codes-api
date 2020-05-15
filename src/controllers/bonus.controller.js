const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const randomstring = require('randomstring');
const User = require('../models/user.model');
const PasswordReset = require('../models/password-reset.model');
const APIError = require('../utils/APIError.utils');
const { sendRegistrationEmail, sendResetPasswordEmail } = require('../utils/node-mailer.utils');
const config = require('../config/config');

module.exports = {
  register: async (req, res, next) => {
    try {
      const user = await User.findOne({ email: new RegExp(req.body.email, 'i') });

      if (user) {
        const errMsg = 'User already exists';
        return next(new APIError(errMsg, httpStatus.UNAUTHORIZED, true));
      }

      const newUser = new User({
        ...req.body,
        password: User.generateHash(req.body.password),
      });

      await newUser.save();
      const authToken = jwt.sign(newUser.withoutPass(), config.JWT_SECRET, { expiresIn: '365d' });
      const emailToken = jwt.sign(newUser.withoutPass(), config.EMAIL_SECRET, { expiresIn: '1h' });
      sendRegistrationEmail(req.body.email, emailToken);

      return res.status(httpStatus.CREATED).json({
        user: newUser.withoutPass(),
        authToken,
        emailToken,
      });
    } catch (err) {
      return next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const user = await User.findOne({ email: new RegExp(req.body.email, 'i') });

      if (!user) {
        return next(new APIError('User not found', httpStatus.NOT_FOUND));
      }

      if (!user.isValidPassword(req.body.password)) {
        return next(new APIError('Password is incorrect', httpStatus.UNAUTHORIZED));
      }

      const authToken = jwt.sign(user.withoutPass(), config.JWT_SECRET, { expiresIn: '365d' });

      return res.status(httpStatus.OK).json({ authToken });
    } catch (err) {
      return next(err);
    }
  },
  socialLogin: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const authToken = jwt.sign(user.withoutPass(), config.JWT_SECRET, { expiresIn: '365d' });

      return res.status(httpStatus.OK).json({ authToken });
    } catch (err) {
      return next(err);
    }
  },
  verifyEmail: async (req, res, next) => {
    try {
      const { _id } = jwt.verify(req.params.token, config.EMAIL_SECRET);
      const user = await User.findOne({ _id });

      if (!user) {
        return next(new APIError('User not found', httpStatus.NOT_FOUND));
      }

      user.isVerified = true;
      await user.save();

      return res.send('Email Verified!');
    } catch (err) {
      return next(err);
    }
  },
  // Functionality works but needs a front end form
  requestPasswordReset: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return next(new APIError('User not found', httpStatus.NOT_FOUND));
      }

      const secretKey = randomstring.generate({ charset: 'alphanumeric' });
      const hash = User.generateHash(secretKey);
      const newPasswordReset = new PasswordReset({
        userId: user._id,
        hash,
        email,
      });
      await newPasswordReset.save();
      sendResetPasswordEmail(email, secretKey, newPasswordReset._id);

      return res.status(httpStatus.OK).json({
        passwordReset: newPasswordReset,
        secretKey,
      });
    } catch (err) {
      return next(err);
    }
  },
  // Functionality works but needs a front end form
  regainPassword: async (req, res, next) => {
    try {
      const { secretKey, newPassword, passwordResetId } = req.body;
      const passwordReset = await PasswordReset.findOne({ _id: passwordResetId, isDeleted: false });

      if (!passwordReset) {
        return next(new APIError('Invalid password reset', httpStatus.NOT_FOUND));
      }

      const hash = User.generateHash(secretKey);
      if (!User.isValidHash({ hash, original: secretKey })) {
        return next(new APIError('Invalid password reset', httpStatus.NOT_FOUND));
      }

      if (passwordReset.isExpired()) {
        return next(new APIError('Password Reset Link has expired', httpStatus.UNAUTHORIZED));
      }

      const user = await User.findOne({ _id: passwordReset.userId });

      if (!user) {
        return next(new APIError('User not found', httpStatus.NOT_FOUND));
      }

      // Update password and mark old as deleted
      user.password = User.generateHash(newPassword);
      await user.save();
      passwordReset.isDeleted = true;
      await passwordReset.save();

      return res.status(httpStatus.OK).json({
        user: user.withoutPass(),
        passwordReset,
      });
    } catch (err) {
      return next(err);
    }
  },
};
