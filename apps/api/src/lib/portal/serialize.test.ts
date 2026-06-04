import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterCommentsForViewer,
  filterActivityForViewer,
} from "./serialize.js";

const comments = [
  {
    id: "c1",
    work_item_id: "w1",
    author_id: "u1",
    body: "public note",
    visibility: "public",
    mentions: [],
    created_at: new Date(),
  },
  {
    id: "c2",
    work_item_id: "w1",
    author_id: "u2",
    body: "internal secret",
    visibility: "internal",
    mentions: [],
    created_at: new Date(),
  },
];

const activity = [
  {
    id: "a1",
    work_item_id: "w1",
    actor_id: "u1",
    kind: "created",
    from_value: null,
    to_value: null,
    created_at: new Date(),
  },
  {
    id: "a2",
    work_item_id: "w1",
    actor_id: "u2",
    kind: "comment_added",
    from_value: null,
    to_value: null,
    created_at: new Date(),
  },
];

describe("portal serialize filters", () => {
  it("hides internal comments from CLIENT", () => {
    const filtered = filterCommentsForViewer("CLIENT", comments);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.visibility, "public");
  });

  it("shows all comments to STAFF", () => {
    assert.equal(filterCommentsForViewer("STAFF", comments).length, 2);
  });

  it("hides comment_added activity from CLIENT", () => {
    const filtered = filterActivityForViewer("CLIENT", activity);
    assert.ok(filtered.every((a) => a.kind !== "comment_added"));
  });
});
