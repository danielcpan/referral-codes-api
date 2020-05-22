require("dotenv").config();
const { expect } = require("chai");
const request = require("supertest");
const { connectMongo } = require("./mongoose.utils");

before(async () => {
  connectMongo();
  global.expect = expect;
  global.request = request;
});
