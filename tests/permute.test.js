import { permuteRule } from "../src/utils/permute";
import { rotate4 } from "../src/utils/symmetries";

describe("rotate4", () => {
  test("should handle empty or invalid input", () => {
    expect(rotate4([])).toEqual([[]]);
    expect(rotate4([1, 2, 3])).toEqual([[1, 2, 3]]);
  });

  test("should rotate von Neumann neighborhood (4 neighbors)", () => {
    // Test case with all different numbers to clearly see rotation
    //   1
    // 2 x 3
    //   4
    const input = [1, 2, 3, 4];
    const expected = [
      [1, 2, 3, 4], // Original
      [3, 1, 4, 2], // 90° clockwise
      [4, 3, 2, 1], // 180° clockwise
      [2, 4, 1, 3], // 270° clockwise
    ];
    expect(rotate4(input)).toEqual(expected);
  });

  test("should rotate Moore neighborhood (8 neighbors)", () => {
    // Test case with all different numbers to clearly see rotation
    // 1 2 3
    // 4 x 5
    // 6 7 8
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const expected = [
      [1, 2, 3, 4, 5, 6, 7, 8], // Original
      [3, 5, 8, 2, 7, 1, 4, 6], // 90° clockwise
      [8, 7, 6, 5, 4, 3, 2, 1], // 180° clockwise
      [6, 4, 1, 7, 2, 8, 5, 3], // 270° clockwise
    ];
    expect(rotate4(input)).toEqual(expected);
  });

  test("should handle identical values correctly", () => {
    // Test case where some values are the same
    // 1 1 1
    // 1 x 1
    // 1 1 1
    const input = [1, 1, 1, 1, 1, 1, 1, 1];
    const expected = [[1, 1, 1, 1, 1, 1, 1, 1]]; // Should only return one unique rotation
    expect(rotate4(input)).toEqual(expected);
  });
});
