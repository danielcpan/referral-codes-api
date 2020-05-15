const express = require('express');
const passport = require('passport');
const validate = require('express-validation');
const authController = require('../controllers/auth.controller');
const paramValidation = require('../utils/param-validation.utils');

const router = express.Router();

router.route('/register')
  .post(validate(paramValidation.register), authController.register);

router.route('/login')
  .post(validate(paramValidation.login), authController.login);

router.route('/verify-email/:token')
  .get(authController.verifyEmail);

router.route('/request-password-reset')
  .post(validate(paramValidation.requestPasswordReset), authController.requestPasswordReset);

router.route('/regain-password/:passwordResetId')
  .post(validate(paramValidation.regainPassword), authController.regainPassword);

// SOCIAL AUTH LOGINS
router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback', passport.authenticate('facebook'), authController.socialLogin);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google'), authController.socialLogin);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github'), authController.socialLogin);

module.exports = router;
