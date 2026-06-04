import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AppUserRole } from "@columbusai/db";

const AGENCY_ROLES = new Set([
  AppUserRole.STAFF,
  AppUserRole.ADMIN,
  AppUserRole.SUPER_ADMIN,
  AppUserRole.VIEWER,
]);

function wouldRejectAgencyEmail(role: AppUserRole): boolean {
  return role !== AppUserRole.CLIENT && AGENCY_ROLES.has(role);
}

describe("provisionClient agency email guard", () => {
  it("rejects STAFF email without demoting", () => {
    assert.equal(wouldRejectAgencyEmail(AppUserRole.STAFF), true);
  });

  it("rejects ADMIN email", () => {
    assert.equal(wouldRejectAgencyEmail(AppUserRole.ADMIN), true);
  });

  it("rejects VIEWER email", () => {
    assert.equal(wouldRejectAgencyEmail(AppUserRole.VIEWER), true);
  });

  it("allows existing CLIENT email", () => {
    assert.equal(wouldRejectAgencyEmail(AppUserRole.CLIENT), false);
  });
});
