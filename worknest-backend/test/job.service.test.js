import test from "node:test";
import assert from "node:assert/strict";
import Jobs from "../src/models/jobs.js";
import {
  __jobServiceTestables,
  searchJobService,
} from "../src/services/job.service.js";

test("buildSafeRegex escapes special regex characters from job search input", () => {
  const regex = __jobServiceTestables.buildSafeRegex("node+(remote)?");

  assert.ok(regex instanceof RegExp);
  assert.equal(regex.test("Senior node+(remote)? engineer"), true);
  assert.equal(regex.test("Senior node remote engineer"), false);
});

test("searchJobService supports multi-select category and job type filters", async () => {
  const originalFind = Jobs.find;
  const originalCountDocuments = Jobs.countDocuments;
  let capturedFilter = null;

  Jobs.find = (filter) => {
    capturedFilter = filter;
    return {
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
    };
  };
  Jobs.countDocuments = async () => 0;

  try {
    await searchJobService({
      category: ["Engineering", "Design"],
      jobType: ["Full-Time", "Contract"],
      isAdmin: false,
      page: 1,
      limit: 10,
    });

    assert.deepEqual(capturedFilter.category, {
      $in: ["Engineering", "Design"],
    });
    assert.deepEqual(capturedFilter.jobType, {
      $in: ["Full-Time", "Contract"],
    });
    assert.equal(capturedFilter.status, "active");
  } finally {
    Jobs.find = originalFind;
    Jobs.countDocuments = originalCountDocuments;
  }
});
