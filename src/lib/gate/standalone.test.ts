import { test } from "bun:test";
import assert from "node:assert/strict";
import { standaloneRedirectTarget } from "./standalone";

const CAPTURE = "https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17";
const base = { captureUrl: CAPTURE, pathname: "/", search: "" };

test("enforce: standalone join links, typed joins and the legacy form go to MainSite capture", () => {
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: false, search: "?join=ABCD" }), CAPTURE);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: false, joining: true }), CAPTURE);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: false, pathname: "/connect" }), CAPTURE);
});

test("presenter stage deck, framed visits, and off/dual modes never redirect", () => {
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: false }), null);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: true, search: "?join=ABCD" }), null);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "off", embedded: false, search: "?join=ABCD" }), null);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "dual", embedded: false, pathname: "/connect" }), null);
});
