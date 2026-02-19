const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const path = require("path");
const { getComputedSeriesFromFile } = require("./src/series");

const filePath = path.join(__dirname, "data", "SoftwareInternAssignment.xlsx");
const withTotalReturn = getComputedSeriesFromFile(filePath);

function toInt(value, defaultValue) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

// Returns full time series with metadata summary
app.get("/api/series", (req, res) => {
  // Query params (all optional)
  const limit = toInt(req.query.limit, 25);     // rows per page
  const offset = toInt(req.query.offset, 0);    // starting index
  const start = req.query.start || null;        // "YYYY-MM-DD"
  const end = req.query.end || null;            // "YYYY-MM-DD"

  // 1) Filter by date range
  let filtered = withTotalReturn;
  if (start) filtered = filtered.filter(r => r.date >= start);
  if (end) filtered = filtered.filter(r => r.date <= end);

  // 2) Paginate
  const pageData = filtered.slice(offset, offset + limit);

  // 3) Meta
  const totalCount = filtered.length;
  const startDate = totalCount > 0 ? filtered[0].date : null;
  const endDate = totalCount > 0 ? filtered[totalCount - 1].date : null;

  res.json({
    meta: {
      totalCount,
      limit,
      offset,
      start,
      end,
      startDate,
      endDate
    },
    data: pageData
  });
});

// returns the entire series
app.get("/returns", (req, res) => {
  res.json(withTotalReturn);
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// if the computer/deployment gives me a port, use it, otherwise default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

