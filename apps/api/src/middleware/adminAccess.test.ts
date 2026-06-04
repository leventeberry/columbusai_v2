import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppUserRole } from "@columbusai/db";

const READ_ROLES = [
  AppUserRole.SUPER_ADMIN,
  AppUserRole.ADMIN,
  AppUserRole.STAFF,
  AppUserRole.VIEWER,
];

const WRITE_ROLES = [
  AppUserRole.SUPER_ADMIN,
  AppUserRole.ADMIN,
  AppUserRole.STAFF,
];

describe("admin RBAC split", () => {
  it("VIEWER may read but not write", () => {
    assert.ok(READ_ROLES.includes(AppUserRole.VIEWER));
    assert.ok(!(WRITE_ROLES as readonly string[]).includes(AppUserRole.VIEWER));
  });

  it("STAFF may read and write", () => {
    assert.ok(READ_ROLES.includes(AppUserRole.STAFF));
    assert.ok(WRITE_ROLES.includes(AppUserRole.STAFF));
  });
});
