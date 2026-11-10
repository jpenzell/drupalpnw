import { test } from "node:test";
import assert from "node:assert/strict";
import { entryDecision, standaloneRedirectTarget } from "./standalone";

const CAPTURE = "https://www.joshpenzell.com/p/ai-for-all-minds-pnw-drupal-summit-2026-10-17";
const base = { captureUrl: CAPTURE, pathname: "/", search: "" };

test("enforce: every standalone interactive page needs presenter proof (root, canvas, rehearsal, connect)", () => {
  for (const pathname of ["/", "/canvas", "/rehearsal", "/connect", "/anything"]) {
    assert.equal(entryDecision({ mode: "enforce", embedded: false, pathname }), "check_presenter", pathname);
  }
  assert.equal(entryDecision({ mode: "enforce", embedded: false, pathname: "/presenter" }), "presenter_login");
});

test("enforce: framed visits wait for MainSite access; unsubscribe pages stay free", () => {
  assert.equal(entryDecision({ mode: "enforce", embedded: true, pathname: "/" }), "await_access");
  assert.equal(entryDecision({ mode: "enforce", embedded: true, pathname: "/rehearsal" }), "await_access");
  assert.equal(entryDecision({ mode: "enforce", embedded: false, pathname: "/unsubscribe" }), "render");
  assert.equal(entryDecision({ mode: "enforce", embedded: false, pathname: "/email-unsubscribe" }), "render");
});

test("off and dual: today's behavior, nothing gated at entry", () => {
  for (const mode of ["off", "dual"] as const) {
    assert.equal(entryDecision({ mode, embedded: false, pathname: "/" }), "render");
    assert.equal(entryDecision({ mode, embedded: true, pathname: "/canvas" }), "render");
  }
});

test("join and connect handlers redirect only in enforce, standalone", () => {
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: false, search: "?join=ABCD" }), CAPTURE);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: false, pathname: "/connect" }), CAPTURE);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "enforce", embedded: true, search: "?join=ABCD" }), null);
  assert.equal(standaloneRedirectTarget({ ...base, mode: "off", embedded: false, search: "?join=ABCD" }), null);
});
