const httpStatus = require("http-status");
const app = require("../app");
const { clearDatabase } = require("../utils/mongoose.utils");
const config = require("../config/config");

after(async () => {
  await clearDatabase();
});

describe("## Promotion APIs", () => {
  let promotion;

  before(async () => {
    const data = {
      name: "Foo Promotion",
      offer: "$25",
      description: "Foo description",
    };

    const response = await request(app).post("/api/promotions/").send(data);

    promotion = response.body.promotion;
  });

  // afterEach(async () => {
  //   await User.deleteMany({});
  // });

  describe("# GET /api/promotions/:promotionId", () => {
    it("should get promotion details", async () => {
      const response = await request(app).get(
        `/api/promotions/${promotion._id}`
      );

      expect(response.status).to.equal(httpStatus.OK);
      expect(response.body).to.eql(promotion);
    });
  });

  describe("# GET /api/promotions", () => {
    it("should get all promotions", async () => {
      const response = await request(app).get("/api/promotions");

      expect(response.status).to.equal(httpStatus.OK);
      expect(response.body).to.have.lengthOf(1);
    });
  });

  describe("# POST /api/promotions", () => {
    it("should create new promotion", async () => {
      const data = {
        name: "Bar Promotion",
        offer: "$50",
        description: "Bar description",
      };
      const response = await request(app).post("/api/promotions").send(data);

      expect(response.status).to.equal(httpStatus.CREATED);
      expect(response.body).to.eql(data);
    });

    it("should return 409 Conflict", async () => {
      const data = {
        name: "Bar Promotion",
        offer: "$50",
        description: "Bar description",
      };
      const response = await request(app).post("/api/promotions").send(data);

      expect(response.status).to.equal(httpStatus.CONFLICT);
    });
  });

  describe("# PUT /api/promotions/:promotionId", () => {
    it("should update a promotion", async () => {
      const data = {
        description: "This is an updated description",
      };
      const response = await request(app)
        .put(`/api/promotions/${promotion._id}`)
        .send(data);

      expect(response.status).to.equal(httpStatus.OK);
      expect(response.body.description).to.equal(data.description);
    });
  });
});
