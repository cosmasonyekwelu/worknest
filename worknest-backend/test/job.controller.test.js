import test from "node:test";
import assert from "node:assert/strict";
import { deleteJob } from "../src/controllers/job.controller.js";
import Jobs from "../src/models/jobs.js";
import User from "../src/models/user.js";
import Application from "../src/models/application.js";
import Notification from "../src/models/notification.js";
import { ConflictError } from "../src/lib/errors.js";

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("deleteJob returns conflict when applications already exist", async () => {
  const originalFindById = Jobs.findById;
  const originalCountDocuments = Application.countDocuments;
  const jobId = "507f1f77bcf86cd799439031";
  let nextError = null;

  Jobs.findById = async () => ({ _id: jobId, avatarId: "" });
  Application.countDocuments = async () => 2;

  try {
    await deleteJob(
      { params: { id: jobId } },
      createResponse(),
      (error) => {
        nextError = error;
      },
    );

    assert.ok(nextError instanceof ConflictError);
    assert.equal(nextError.statusCode, 409);
  } finally {
    Jobs.findById = originalFindById;
    Application.countDocuments = originalCountDocuments;
  }
});

test("deleteJob removes saved references and notifications when no applications exist", async () => {
  const originalFindById = Jobs.findById;
  const originalCountDocuments = Application.countDocuments;
  const originalUpdateMany = User.updateMany;
  const originalDeleteMany = Notification.deleteMany;
  const jobId = "507f1f77bcf86cd799439032";
  let savedReferencesCleared = false;
  let notificationsCleared = false;
  let deleted = false;
  let nextError = null;

  Jobs.findById = async () => ({
    _id: jobId,
    avatarId: "",
    async deleteOne() {
      deleted = true;
    },
  });
  Application.countDocuments = async () => 0;
  User.updateMany = async (filter, update) => {
    savedReferencesCleared =
      filter.savedJobs === jobId && update?.$pull?.savedJobs === jobId;
  };
  Notification.deleteMany = async (filter) => {
    notificationsCleared = filter?.["data.jobId"] === jobId;
  };

  try {
    const response = createResponse();

    await deleteJob(
      { params: { id: jobId } },
      response,
      (error) => {
        nextError = error;
      },
    );

    assert.equal(nextError, null);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(savedReferencesCleared, true);
    assert.equal(notificationsCleared, true);
    assert.equal(deleted, true);
  } finally {
    Jobs.findById = originalFindById;
    Application.countDocuments = originalCountDocuments;
    User.updateMany = originalUpdateMany;
    Notification.deleteMany = originalDeleteMany;
  }
});
