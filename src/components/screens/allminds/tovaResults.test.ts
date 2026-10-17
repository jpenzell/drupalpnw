import { expect, test } from "bun:test";
import { TOVA_LIMIT, TOVA_BORDERLINE, tovaResults } from "./tovaResults";

test("report scores are transcribed exactly, including the censored commission score", () => {
  expect(tovaResults.map((result) => result.labels)).toEqual([
    ["68", "65", "54", "55"],
    ["110", "109", "103", "108"],
    ["86", "44", "<40", "53"],
    ["100", "100", "100", "100"],
  ]);
  expect(tovaResults[2]?.scores[2]).toBeNull();
});

test("report normal-limit and borderline reference lines remain at 80 and 85", () => {
  expect(TOVA_LIMIT).toBe(80);
  expect(TOVA_BORDERLINE).toBe(85);
});