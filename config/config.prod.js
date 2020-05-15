module.exports = {
  ENV: 'development',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/bank_churning_prod',
  PORT: process.env.PORT || 5000,
  PUBLIC_URL: 'http://localhost:5000',
  JWT_SECRET: process.env.JWT_SECRET,
};
