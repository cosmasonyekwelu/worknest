import test from "node:test";
import assert from "node:assert/strict";
import { buildUserSearchQuery } from "../src/services/admin.service.js";

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
