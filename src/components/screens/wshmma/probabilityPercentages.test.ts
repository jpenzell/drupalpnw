import { test } from "node:test";
import assert from "node:assert/strict";
import { percentageSummary, PROBABILITY_PHRASES } from "./probabilityPercentages";

test("percentage poll collects Slam dunk and Rarely", () => {
  assert.deepEqual(PROBABILITY_PHRASES, ["Slam dunk", "Rarely"]);
});
test("percentages include both endpoints and reject out-of-range answers", () => {
  assert.deepEqual(percentageSummary([0, 100, -1, 101, null, "50", NaN]), {
    values: [0, 100], count: 2, average: 50, min: 0, max: 100,
  });
});
test("room results preserve the spread rather than only the average", () => {
  const result = percentageSummary([5, 15, 40]);
  assert.equal(result.average, 20);
  assert.equal(result.min, 5);
  assert.equal(result.max, 40);
});