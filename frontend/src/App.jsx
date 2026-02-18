import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

export default function App() {
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API response state
  const [meta, setMeta] = useState(null);

  // rows = ONLY the current page returned by the API
  const [rows, setRows] = useState([]);

  // pagination + date filters
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [start, setStart] = useState(""); // "YYYY-MM-DD"
  const [end, setEnd] = useState("");     // "YYYY-MM-DD"

  // Fetch whenever paging or filters change
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("limit", String(limit));
        params.set("offset", String(offset));
        if (start) params.set("start", start);
        if (end) params.set("end", end);

        const url = `http://localhost:3000/api/series?${params.toString()}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

        const json = await res.json();
        setMeta(json.meta);
        setRows(json.data);
      } catch (e) {
        setError(e.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [limit, offset, start, end]);

  // Render states
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: "red" }}>Error: {error}</div>;
  if (!meta) return <div style={{ padding: 16 }}>No data</div>;

  // Chart data (charts only current page; if you want full-range chart, we’ll change approach)
  const x = rows.map((r) => r.date);
  const y = rows.map((r) => r.totalReturn * 100);

  const totalCount = meta.totalCount ?? meta.count ?? 0; // works with either backend version

  return (
    <div style={{ padding: 16 }}>
      <h1>Intern Candidate Project - Mouad Tazka</h1>

      {/* Meta summary */}
      <div style={{ marginBottom: 16 }}>
        <div><b>Total Count:</b> {totalCount}</div>
        <div><b>Start:</b> {meta.startDate}</div>
        <div><b>End:</b> {meta.endDate}</div>
      </div>

      {/* Chart */}
      <h2>Total Return Chart</h2>
      <Plot
        data={[
          {
            x,
            y,
            type: "scatter",
            mode: "lines",
            name: "Total Return (%)",
            hovertemplate: "%{x}<br>%{y:.2f}%<extra></extra>",
          },
        ]}
        layout={{
          title: "S&P 500 Total Return (%) (Current Page)",
          xaxis: { title: "Date" },
          yaxis: { title: "Total Return (%)", ticksuffix: "%" },
          margin: { l: 60, r: 20, t: 50, b: 50 },
        }}
        config={{
          responsive: true,
          scrollZoom: true,
          displayModeBar: true,
        }}
        style={{ width: "100%", height: "500px" }}
      />

      {/* Controls */}
      <h2>Table Controls</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <label>
          Rows per page:&nbsp;
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setOffset(0);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <label>
          Start:&nbsp;
          <input
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setOffset(0);
            }}
          />
        </label>

        <label>
          End:&nbsp;
          <input
            type="date"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              setOffset(0);
            }}
          />
        </label>

        <button
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
          disabled={offset === 0}
        >
          Prev
        </button>

        <button
          onClick={() => setOffset((o) => o + limit)}
          disabled={offset + limit >= totalCount}
        >
          Next
        </button>

        <span>
          Showing {totalCount === 0 ? 0 : offset + 1}–{Math.min(offset + limit, totalCount)} of {totalCount}
        </span>
      </div>

      {/* Table */}
      <h2>Rows</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>DailyReturn (%)</th>
            <th>TotalReturn (decimal)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date}>
              <td>{r.date}</td>
              <td>{r.dailyReturn}</td>
              <td>{Number(r.totalReturn).toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
