const jwt = require('jsonwebToken'); // eslint-disable-line import/no-extraneous-dependencies, import/no-unresolved
const httpStatus = require('http-status');
const app = require('../app');
const User = require('../models/user.model');
const { clearDatabase } = require('../utils/mongoose.utils');
const config = require('../config/config');

after(async () => {
  await clearDatabase();
});

describe('## Auth APIs', () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('# POST /api/auth/register', () => {
    describe('with valid user credentials', () => {
      it('should create new user valid authToken', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const response = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        const { user, authToken } = response.body;
        const decoded = jwt.verify(authToken, config.JWT_SECRET);

        expect(response.status).to.equal(httpStatus.CREATED);
        expect(user.email).to.equal(validUserCredentials.email);
        expect(user).to.not.have.property('password');
        expect(decoded.email).to.equal(validUserCredentials.email);
        expect(decoded).to.not.have.property('password');
      });
    });

    describe('with no email', () => {
      it('should return authentication error', async () => {
        const invalidUserCredentials = {
          email: '',
          password: 'foobar123',
        };
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidUserCredentials);

        expect(response.status).to.equal(httpStatus.BAD_REQUEST);
      });
    });

    describe('with invalid email', () => {
      it('should return authentication error', async () => {
        const invalidUserCredentials = {
          email: 'foo',
          password: 'foobar123',
        };
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidUserCredentials);

        expect(response.status).to.equal(httpStatus.BAD_REQUEST);
      });
    });

    describe('with no password', () => {
      it('should return authentication error', async () => {
        const invalidUserCredentials = {
          email: 'foobar@gmail.com',
          password: '',
        };
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidUserCredentials);

        expect(response.status).to.equal(httpStatus.BAD_REQUEST);
      });
    });

    describe('with too short password', () => {
      it('should return authentication error', async () => {
        const invalidUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foo',
        };
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidUserCredentials);

        expect(response.status).to.equal(httpStatus.BAD_REQUEST);
      });
    });

    describe('with existing email', () => {
      it('should return authentication error', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const firstRegisterResponse = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        expect(firstRegisterResponse.status).to.equal(httpStatus.CREATED);

        const invalidUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const secondRegisterResponse = await request(app)
          .post('/api/auth/register')
          .send(invalidUserCredentials);

        expect(secondRegisterResponse.status).to.equal(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('# POST /api/auth/login', () => {
    describe('with valid user credentials', () => {
      it('should create new user valid authToken', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        expect(registerResponse.status).to.equal(httpStatus.CREATED);

        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send(validUserCredentials);

        const { authToken } = loginResponse.body;
        const decoded = jwt.verify(authToken, config.JWT_SECRET);

        expect(loginResponse.status).to.equal(httpStatus.OK);
        expect(decoded.email).to.equal(validUserCredentials.email);
        expect(decoded).to.not.have.property('password');
      });
    });

    describe('with non-existing email', () => {
      it('should return authentication error', async () => {
        const invalidUserCredentials = {
          email: 'doesnt@exist.com',
          password: 'foobar123',
        };
        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidUserCredentials);

        expect(response.status).to.equal(httpStatus.NOT_FOUND);
      });
    });

    describe('with incorrect password', () => {
      it('should return authentication error', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        expect(registerResponse.status).to.equal(httpStatus.CREATED);

        const invalidUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'wrongpassword',
        };

        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send(invalidUserCredentials);

        expect(loginResponse.status).to.equal(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('# GET /api/auth/verify-email/:token', () => {
    describe('with valid user credentials', () => {
      it('should mark user as verified', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        const { emailToken } = registerResponse.body;

        expect(registerResponse.status).to.equal(httpStatus.CREATED);

        const verifyEmailResponse = await request(app)
          .get(`/api/auth/verify-email/${emailToken}`);

        expect(verifyEmailResponse.status).to.equal(httpStatus.OK);
        expect(verifyEmailResponse.text).to.equal('Email Verified!');
      });
    });
  });

  describe('# POST /api/auth/request-password-reset', () => {
    describe('with valid user credentials', () => {
      it('should create a password reset object and send an email', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        expect(registerResponse.status).to.equal(httpStatus.CREATED);

        const requestPasswordResetResponse = await request(app)
          .post('/api/auth/request-password-reset')
          .send({ email: validUserCredentials.email });

        const { passwordReset } = requestPasswordResetResponse.body;
        expect(requestPasswordResetResponse.status).to.equal(httpStatus.OK);
        expect(passwordReset.email).to.be.equal(validUserCredentials.email);
      });
    });
  });

  describe('# POST /api/auth/regain-password/:passwordResetId', () => {
    describe('with valid user credentials', () => {
      it('should mark old password reset object as deleted and give new password to user', async () => {
        const validUserCredentials = {
          email: 'foobar@gmail.com',
          password: 'foobar123',
        };
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(validUserCredentials);

        expect(registerResponse.status).to.equal(httpStatus.CREATED);

        const requestPasswordResetResponse = await request(app)
          .post('/api/auth/request-password-reset')
          .send({ email: validUserCredentials.email });

        const { passwordReset, secretKey } = requestPasswordResetResponse.body;

        const regainPasswordCredentials = {
          passwordResetId: passwordReset._id,
          secretKey,
          newPassword: 'newPassword',
        };

        const regainPasswordResponse = await request(app)
          .post(`/api/auth/regain-password/${passwordReset._id}`)
          .send(regainPasswordCredentials);

        expect(regainPasswordResponse.status).to.equal(httpStatus.OK);
        expect(regainPasswordResponse.body.passwordReset.isDeleted).to.be.equal(true);
      });
    });
  });
});
