/* eslint-disable no-console */
const mongoose = require('mongoose');
const config = require('../../config/config');

module.exports = {
  connectMongo: () => {
    try {
      mongoose.connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });
      console.log('Mongo Connection Successful');
    } catch (err) {
      console.log(`Mongo Connection Error: ${err}`);
    }
  },
  clearDatabase: async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  },
};
