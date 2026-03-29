import test from "node:test";
import assert from "node:assert/strict";
import User from "../src/models/user.js";
import adminService, { buildUserSearchQuery } from "../src/services/admin.service.js";

test("buildUserSearchQuery uses exact role matching plus text search", () => {
  const query = buildUserSearchQuery("alice smith", "Admin");

  assert.deepEqual(query, {
    role: "admin",
    $text: { $search: "alice smith" },
  });
});

test("buildUserSearchQuery ignores empty keyword and all-role filters", () => {
  const query = buildUserSearchQuery("   ", "all");

  assert.deepEqual(query, {});
});

test("getAllUsers returns a minimum totalPages of 1 when there are no users", async () => {
  const originalFind = User.find;
  const originalCountDocuments = User.countDocuments;

  User.find = () => {
    const query = [];
    query.sort = () => query;
    query.skip = () => query;
    query.limit = () => query;
    return query;
  };
  User.countDocuments = async () => 0;

  try {
    const result = await adminService.getAllUsers(1, 10, "", "");
    assert.equal(result.meta.totalPages, 1);
    assert.equal(result.meta.total, 0);
  } finally {
    User.find = originalFind;
    User.countDocuments = originalCountDocuments;
  }
});
