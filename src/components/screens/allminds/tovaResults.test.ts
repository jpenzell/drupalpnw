/// <reference types="node" />
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { TOVA_LIMIT, TOVA_BORDERLINE, tovaResults } from "./tovaResults";

test("report scores are transcribed exactly, including the censored commission score", () => {
  assert.deepEqual(tovaResults.map((result) => result.labels), [
    ["68", "65", "54", "55"],
    ["110", "109", "103", "108"],
    ["86", "44", "<40", "53"],
    ["100", "100", "100", "100"],
  ]);
  assert.equal(tovaResults[2]?.scores[2], null);
});

test("report normal-limit and borderline reference lines remain at 80 and 85", () => {
  assert.equal(TOVA_LIMIT, 80);
  assert.equal(TOVA_BORDERLINE, 85);
});