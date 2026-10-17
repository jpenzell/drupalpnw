// Transcribed from the presenter's uploaded T.O.V.A. Visual Results report.
// null means the report gives only a censored value, not an exact score.
export const TOVA_LIMIT = 80;
export const TOVA_BORDERLINE = 85;
export const tovaResults = [
  { title: "RT variability", scores: [68, 65, 54, 55], labels: ["68", "65", "54", "55"] },
  { title: "Response time", scores: [110, 109, 103, 108], labels: ["110", "109", "103", "108"] },
  { title: "Commission errors", scores: [86, 44, null, 53], labels: ["86", "44", "<40", "53"] },
  { title: "Omission errors", scores: [100, 100, 100, 100], labels: ["100", "100", "100", "100"] },
];