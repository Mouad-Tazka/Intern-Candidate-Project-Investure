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

// converting taken in date into clean universal format YYYY-MM-DD
function formatDate(excelDate) {
  // Case 1: Already a Date object
  if (excelDate instanceof Date) {
    return formatParts(
      excelDate.getFullYear(),
      excelDate.getMonth() + 1, // getMonth() in JavaScript is 0-11, +1 changes that to 1-12
      excelDate.getDate()
    );
  }

  // Case 2: Excel serial number
  if (typeof excelDate === "number") {
    const parsed = XLSX.SSF.parse_date_code(excelDate);
    return formatParts(parsed.y, parsed.m, parsed.d);
  }

  // Case 3: String like "6/10/2020"
  if (typeof excelDate === "string" && excelDate.includes("/")) {
    const [month, day, year] = excelDate.split("/");
    return formatParts(Number(year), Number(month), Number(day));
  }

  return null; 
}
// formatting or case 3
function formatParts(year, month, day) {
// checks if 2 digits, if not, add 0 in front, i.e. -> "6" turns into "06", "11" stays as "11"
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}



// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
