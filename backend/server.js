const express = require("express");
const app = express();

// loading excel file
const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "data", "SoftwareInternAssignment.xlsx");

const workbook = XLSX.readFile(filePath);


// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
