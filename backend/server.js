const express = require("express");
const app = express();

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
