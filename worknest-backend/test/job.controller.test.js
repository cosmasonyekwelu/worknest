import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
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
  const originalStartSession = mongoose.startSession;
  const originalFindById = Jobs.findById;
  const originalFindOne = Application.findOne;
  const jobId = "507f1f77bcf86cd799439031";
  let nextError = null;
  const session = {
    async withTransaction(work) {
      return work();
    },
    async endSession() {},
  };

  mongoose.startSession = async () => session;
  Jobs.findById = async (id, projection, options) => {
    assert.equal(id, jobId);
    assert.equal(options.session, session);
    return { _id: jobId, avatarId: "" };
  };
  Application.findOne = () => ({
    lean: async () => ({ _id: "application-1" }),
  });

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
    mongoose.startSession = originalStartSession;
    Jobs.findById = originalFindById;
    Application.findOne = originalFindOne;
  }
});

test("deleteJob removes saved references and notifications when no applications exist", async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindById = Jobs.findById;
  const originalFindOne = Application.findOne;
  const originalUpdateMany = User.updateMany;
  const originalDeleteMany = Notification.deleteMany;
  const originalDeleteOne = Jobs.deleteOne;
  const jobId = "507f1f77bcf86cd799439032";
  let savedReferencesCleared = false;
  let notificationsCleared = false;
  let deleted = false;
  let nextError = null;
  let receivedSession = null;
  const session = {
    async withTransaction(work) {
      return work();
    },
    async endSession() {},
  };

  mongoose.startSession = async () => session;
  Jobs.findById = async (id, projection, options) => {
    receivedSession = options.session;
    return {
      _id: id,
      avatarId: "",
    };
  };
  Application.findOne = () => ({
    lean: async () => null,
  });
  User.updateMany = async (filter, update, options) => {
    savedReferencesCleared =
      filter.savedJobs === jobId &&
      update?.$pull?.savedJobs === jobId &&
      options.session === session;
  };
  Notification.deleteMany = async (filter, options) => {
    notificationsCleared =
      filter?.["data.jobId"] === jobId && options.session === session;
  };
  Jobs.deleteOne = async (filter, options) => {
    deleted = filter?._id === jobId && options.session === session;
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
    assert.equal(receivedSession, session);
  } finally {
    mongoose.startSession = originalStartSession;
    Jobs.findById = originalFindById;
    Application.findOne = originalFindOne;
    User.updateMany = originalUpdateMany;
    Notification.deleteMany = originalDeleteMany;
    Jobs.deleteOne = originalDeleteOne;
  }
});
