import { useEffect, useState } from "react"; // React hooks: useState = component memory, useEffect = run side-effects like fetching

export default function App() {
  // loading: whether we’re still waiting for the API response
  const [loading, setLoading] = useState(true);

  // error: store an error message if the fetch fails
  const [error, setError] = useState(null);

  // meta: the API summary object { count, startDate, endDate }
  const [meta, setMeta] = useState(null);

  // rows: the big data array [{ date, dailyReturn, totalReturn }, ...]
  const [rows, setRows] = useState([]);

  // useEffect runs AFTER the first render (and after any re-render if dependencies change)
  useEffect(() => {
    // define an async function to fetch the data
    async function load() {
      try {
        // we are starting a new request, so show loading state and clear old errors
        setLoading(true);
        setError(null);

        // call backend endpoint
        const res = await fetch("http://localhost:3000/api/series");

        // if the server responded with 4xx/5xx, treat it as an error
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

        // parse JSON body into a JS object: { meta: {...}, data: [...] }
        const json = await res.json();

        // save the response into state (triggers a re-render)
        setMeta(json.meta);
        setRows(json.data);
      } catch (e) {
        // if anything goes wrong (network down, CORS, bad response), show an error message
        setError(e.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    }

    // actually run the async loader
    load();
  }, []);

  // --- Render logic ---

  // while fetching, show a loading message
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  // if fetch failed, show the error
  if (error) return <div style={{ padding: 16, color: "red" }}>Error: {error}</div>;

  // if we somehow fetched but meta is missing, show a fallback
  if (!meta) return <div style={{ padding: 16 }}>No data</div>;

  // take only the first 10 rows so we don’t render too many rows in a preview table
  const preview = rows.slice(0, 10);

  // --- Main UI ---
  return (
    <div style={{ padding: 16 }}>
      <h1>Series Preview</h1>

      {/* Meta summary section */}
      <div style={{ marginBottom: 16 }}>
        <div><b>Count:</b> {meta.count}</div>
        <div><b>Start:</b> {meta.startDate}</div>
        <div><b>End:</b> {meta.endDate}</div>
      </div>

      {/* Data preview table */}
      <h2>First 10 rows</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>DailyReturn (%)</th>
            <th>TotalReturn (decimal)</th>
          </tr>
        </thead>

        <tbody>
          {/* map() turns each row into a <tr>. key helps React track updates efficiently */}
          {preview.map((r) => (
            <tr key={r.date}>
              <td>{r.date}</td>
              <td>{r.dailyReturn}</td>

              {/* totalReturn is a decimal (e.g., 0.01779 = 1.779%). toFixed makes it readable */}
              <td>{Number(r.totalReturn).toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
