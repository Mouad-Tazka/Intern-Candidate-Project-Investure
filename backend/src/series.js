const XLSX = require("xlsx");

// ---------- Date Helpers ----------
// We convert JS Date -> "YYYY-MM-DD" string so:
// - sorting is easy
// - filtering by string comparison works reliably
function formatParts(year, month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function formatDate(excelDate) {
  if (!(excelDate instanceof Date)) return null;

  return formatParts(
    excelDate.getFullYear(),
    excelDate.getMonth() + 1,
    excelDate.getDate()
  );
}

// ---------- Core Compounding Logic ----------
// dailyReturn is a % (e.g., 1.5 means +1.5%)
// We compute total return via:
// growth(t) = growth(t-1) * (1 + r)
// totalReturn(t) = growth(t) - 1
function computeTotalReturnSeries(data) {
  let growth = 1;

  return data.map((row) => {
    const r = Number(row.dailyReturn) / 100; // percent → decimal
    growth = growth * (1 + r);               // compound
    return {
      ...row,
      totalReturn: growth - 1
    };
  });
}

// ---------- Excel Readers ----------

function readSheetRows(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

function getComputedSeriesFromFile(filePath) {
  const rows = readSheetRows(filePath, "rawdata");

  const cleaned = rows
    .map((row) => ({
      date: formatDate(row.ReferenceDate),
      dailyReturn: Number(row.DailyReturn)
    }))
    .filter((r) => r.date && Number.isFinite(r.dailyReturn))
    .sort((a, b) => a.date.localeCompare(b.date));

  return computeTotalReturnSeries(cleaned);
}

function getExcelTotalReturnSeriesFromFile(filePath) {
  const rows = readSheetRows(filePath, "totalreturn");

  return rows
    .map((row) => ({
      date: formatDate(row.ReferenceDate),
      totalReturn: Number(row["Total Return"])
    }))
    .filter((r) => r.date && Number.isFinite(r.totalReturn))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- Exports ----------

module.exports = {
  getComputedSeriesFromFile,
  getExcelTotalReturnSeriesFromFile
};
