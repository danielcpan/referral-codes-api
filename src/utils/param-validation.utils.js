const Joi = require('joi');

module.exports = {
  // AUTH ROUTE SCHEMA
  // POST /api/auth/register
  register: {
    body: {
      email: Joi.string().email().required().max(255),
      password: Joi.string().required().min(6).max(255),
    },
  },
  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().email().required().max(255),
      password: Joi.string().required().min(6).max(255),
    },
  },

  // USER ROUTE SCHEMA
  // POST /api/user/regain-password
  regainPassword: {
    body: {
      passwordResetId: Joi.string().required(),
      newPassword: Joi.string().required(),
      secretKey: Joi.string().required(),
    },
  },
  // POST /api/user/password-reset
  requestPasswordReset: {
    body: {
      email: Joi.string().email().required(),
    },
  },
  // PUT /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().optional().allow('').min(6)
        .max(255),
      firstName: Joi.string().optional().allow('').max(255),
      lastName: Joi.string().optional().allow('').max(255),
      email: Joi.string().email().optional().max(255),
    },
  },
};
