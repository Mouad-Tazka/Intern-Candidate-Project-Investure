const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  getComputedSeriesFromFile,
  getExcelTotalReturnSeriesFromFile,
} = require("../src/series");

test("computed totalReturn matches Excel 'totalreturn' sheet (first 50 rows)", () => {
  const filePath = path.join(__dirname, "..", "data", "SoftwareInternAssignment.xlsx");

  // computed = our JS implementation
  // expected = Excel sheet implementation
  const computed = getComputedSeriesFromFile(filePath);
  const expected = getExcelTotalReturnSeriesFromFile(filePath);

  assert.equal(computed.length, expected.length);

  const N = 50; // compare first 50
  const EPS = 1e-10; // tolerance for floating-point

  for (let i = 0; i < N; i++) {
    // dates should match exactly
    assert.equal(computed[i].date, expected[i].date);
    
    // Total return values should match within tolerance
    const diff = Math.abs(computed[i].totalReturn - expected[i].totalReturn);
    assert.ok(
      diff < EPS,
      `row ${i} ${computed[i].date}: got ${computed[i].totalReturn}, expected ${expected[i].totalReturn}`
    );
  }
});
