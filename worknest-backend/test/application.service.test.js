import test from "node:test";
import assert from "node:assert/strict";
import Application from "../src/models/application.js";
import {
  getApplicationById,
  getApplicationCountsByJobIds,
} from "../src/services/application.service.js";

test("getApplicationById populates the singular requirement field and maps companyLogo", async () => {
  const originalFindById = Application.findById;
  let jobPopulateSelect = "";

  Application.findById = () => ({
    populate(path, select) {
      if (path === "job") {
        jobPopulateSelect = select;
      }
      return this;
    },
    select() {
      return this;
    },
    lean: async () => ({
      _id: "507f1f77bcf86cd799439010",
      applicant: {
        _id: "507f1f77bcf86cd799439011",
        fullname: "Ada Lovelace",
        email: "ada@example.com",
      },
      job: {
        _id: "507f1f77bcf86cd799439012",
        title: "Frontend Engineer",
        companyName: "WorkNest",
        requirement: ["React"],
        avatar: "https://cdn.example.com/logo.webp",
      },
    }),
  });

  try {
    const result = await getApplicationById(
      "507f1f77bcf86cd799439010",
      "507f1f77bcf86cd799439011",
      "admin",
    );

    assert.match(jobPopulateSelect, /\brequirement\b/);
    assert.equal(jobPopulateSelect.includes("requirements"), false);
    assert.deepEqual(result.job.requirement, ["React"]);
    assert.equal(result.job.companyLogo, "https://cdn.example.com/logo.webp");
  } finally {
    Application.findById = originalFindById;
  }
});

test("getApplicationCountsByJobIds preserves order and backfills zeros", async () => {
  const originalAggregate = Application.aggregate;
  const jobIdA = "507f1f77bcf86cd799439021";
  const jobIdB = "507f1f77bcf86cd799439022";

  Application.aggregate = async () => [
    { jobId: jobIdA, count: 3 },
  ];

  try {
    const result = await getApplicationCountsByJobIds([
      jobIdA,
      jobIdB,
      jobIdA,
    ]);

    assert.deepEqual(result, [
      { jobId: jobIdA, count: 3 },
      { jobId: jobIdB, count: 0 },
    ]);
  } finally {
    Application.aggregate = originalAggregate;
  }
});
