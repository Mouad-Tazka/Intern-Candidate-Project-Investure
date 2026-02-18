const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

// loading excel file
const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "data", "SoftwareInternAssignment.xlsx");

const workbook = XLSX.readFile(filePath, {cellDates: true}); // "Telling Excel: “If it’s a date, give it to me as a real Date object.”"

// excel rows to JSON
const sheetName = "rawdata";
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet);

// Testing that I am actually reading the rawdata sheet & that Dates + dailyreturns look sane
console.log("rows count:", rows.length);
console.log("first row:", rows[0]);
console.log("last row:", rows[rows.length - 1]);




// extracting only what I need (referenceDate and dailyReturn)
const cleanedData = rows.map(row => {
  return {
    date: formatDate(row.ReferenceDate),
    dailyReturn: row.DailyReturn
  };
});




// converting taken in date into clean universal format YYYY-MM-DD
function formatDate(excelDate) {
  if (!(excelDate instanceof Date)) return null;
  return formatParts(
    excelDate.getFullYear(),
    excelDate.getMonth() + 1,
    excelDate.getDate()
  );
}

function formatParts(year, month, day) { // checks if 2 digits, if not, add 0 in front, i.e. -> "6" turns into "06", "11" stays as "11"
  const mm = String(month).padStart(2, "0"); 
  const dd = String(day).padStart(2, "0"); 
  return `${year}-${mm}-${dd}`; 
}

function computeTotalReturnSeries(data) {
  let growth = 1; // start with $1

  return data.map(row => {
    const r = row.dailyReturn / 100;      // percent -> decimal
    growth = growth * (1 + r);            // compound
    const totalReturn = growth - 1;       // convert growth to total return

    return {
      ...row,
      totalReturn
    };
  });
}

const withTotalReturn = computeTotalReturnSeries(cleanedData);

function toInt(value, defaultValue) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

// Testing compounding logic matches the spreadsheet.
console.log(withTotalReturn.slice(0, 10));

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

