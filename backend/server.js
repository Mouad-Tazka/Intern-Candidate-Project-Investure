const express = require("express");
const app = express();


// loading excel file
const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "data", "SoftwareInternAssignment.xlsx");

const workbook = XLSX.readFile(filePath, {cellDates: true}); // "Telling Excel: “If it’s a date, give it to me as a real Date object.”"

// excel rows to JSON
const sheetName = "rawdata";
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet);



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

// Returns full time series with metadata summary
app.get("/api/series", (req, res) => {
  const count = withTotalReturn.length;
  const startDate = count > 0 ? withTotalReturn[0].date : null;
  const endDate = count > 0 ? withTotalReturn[count - 1].date : null;

  res.json({
    meta: { count, startDate, endDate },
    data: withTotalReturn
  });
});

app.get("/returns", (req, res) => {
  res.json(withTotalReturn);
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
