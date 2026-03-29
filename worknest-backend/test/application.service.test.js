import test from "node:test";
import assert from "node:assert/strict";
import Application from "../src/models/application.js";
import {
  getApplicationById,
  getApplicationCountsByJobIds,
  getAllApplications,
  updateApplicationStatus,
} from "../src/services/application.service.js";
import { ValidationError } from "../src/lib/errors.js";
import { APPLICATION_STATUSES } from "../src/constants/applicationStatus.js";

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

test("getAllApplications returns at least one total page for empty result sets", async () => {
  const originalFind = Application.find;
  const originalCountDocuments = Application.countDocuments;

  Application.find = () => ({
    select() {
      return this;
    },
    populate() {
      return this;
    },
    sort() {
      return this;
    },
    skip() {
      return this;
    },
    limit() {
      return this;
    },
    lean: async () => [],
  });
  Application.countDocuments = async () => 0;

  try {
    const result = await getAllApplications({}, 1, 10);

    assert.equal(result.total, 0);
    assert.equal(result.page, 1);
    assert.equal(result.totalPages, 1);
    assert.deepEqual(result.data, []);
  } finally {
    Application.find = originalFind;
    Application.countDocuments = originalCountDocuments;
  }
});

test("updateApplicationStatus rejects invalid status transitions", async () => {
  const originalFindById = Application.findById;

  Application.findById = async () => ({
    status: APPLICATION_STATUSES.REJECTED,
    statusHistory: [],
    save: async () => {},
  });

  try {
    await assert.rejects(
      () =>
        updateApplicationStatus(
          "507f1f77bcf86cd799439033",
          APPLICATION_STATUSES.SUBMITTED,
          "507f1f77bcf86cd799439034",
        ),
      (error) => {
        assert.ok(error instanceof ValidationError);
        assert.match(
          error.message,
          /Cannot change application status from "rejected" to "submitted"/,
        );
        return true;
      },
    );
  } finally {
    Application.findById = originalFindById;
  }
});

test("updateApplicationStatus allows valid forward transitions", async () => {
  const originalFindById = Application.findById;
  let saved = false;

  const applicationDoc = {
    status: APPLICATION_STATUSES.SUBMITTED,
    statusHistory: [],
    async save() {
      saved = true;
      return this;
    },
  };

  Application.findById = async () => applicationDoc;

  try {
    const result = await updateApplicationStatus(
      "507f1f77bcf86cd799439035",
      APPLICATION_STATUSES.IN_REVIEW,
      "507f1f77bcf86cd799439036",
      "Moved into review",
    );

    assert.equal(saved, true);
    assert.equal(result.status, APPLICATION_STATUSES.IN_REVIEW);
    assert.equal(result.statusHistory.length, 1);
    assert.equal(result.statusHistory[0].status, APPLICATION_STATUSES.IN_REVIEW);
    assert.equal(result.statusHistory[0].note, "Moved into review");
  } finally {
    Application.findById = originalFindById;
  }
});
