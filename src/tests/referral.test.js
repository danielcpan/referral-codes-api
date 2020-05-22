const httpStatus = require("http-status");
const app = require("../app");
const Referral = require("../models/referral.model");
const { clearDatabase } = require("../utils/mongoose.utils");

after(async () => {
  await clearDatabase();
});

describe("## Referral APIs", () => {
  // let referral;

  // before(async () => {
  //   const data = {
  //     code: "ABCDEFG",
  //     link: "foobar.com",
  //   };

  //   const response = await request(app).post("/api/referrals/").send(data);

  //   referral = response.body.referral;
  // });

  // // afterEach(async () => {
  // //   await User.deleteMany({});
  // // });

  before(async () => {
    await Referral.remove({});
  });

  afterEach(async () => {
    await Referral.remove({});
  });

  describe("# GET /api/referrals/:referralId", () => {
    it("should get referral details", async () => {
      const response = await request(app).get(`/api/referrals/${referral._id}`);

      expect(response.status).to.equal(httpStatus.OK);
      expect(response.body).to.eql(referral);
    });
  });

  describe("# GET /api/referrals", () => {
    it("should get all referrals", async () => {
      const response = await request(app).get("/api/referrals");

      expect(response.status).to.equal(httpStatus.OK);
      expect(response.body).to.have.lengthOf(1);
    });
  });

  describe("# POST /api/referrals", () => {
    it("should create new referral", async () => {
      const data = {
        name: "Bar Referral",
        offer: "$50",
        description: "Bar description",
      };
      const response = await request(app).post("/api/referrals").send(data);

      expect(response.status).to.equal(httpStatus.CREATED);
      expect(response.body).to.eql(data);
    });

    it("should return 409 Conflict", async () => {
      const data = {
        name: "Bar Referral",
        offer: "$50",
        description: "Bar description",
      };
      const response = await request(app).post("/api/referrals").send(data);

      expect(response.status).to.equal(httpStatus.CONFLICT);
    });
  });

  describe("# PUT /api/referrals/:referralId", () => {
    it("should update a referral", async () => {
      const data = {
        description: "This is an updated description",
      };
      const response = await request(app)
        .put(`/api/referrals/${referral._id}`)
        .send(data);

      expect(response.status).to.equal(httpStatus.OK);
      expect(response.body.description).to.equal(data.description);
    });
  });
});
