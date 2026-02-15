const express = require("express");
const app = express();

// loading excel file
const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "data", "SoftwareInternAssignment.xlsx");

const workbook = XLSX.readFile(filePath);

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


// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
