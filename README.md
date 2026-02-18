# Intern-Candidate-Project-Investure

## Overview
This is a small full-stack app that ingests S&P 500 daily return data from the Excel `rawdata` tab, computes cumulative **total return** over time, exposes it through an Express REST API, and visualizes it in a React + Vite UI with an interactive Plotly chart, pagination, and date-range filtering.

---

## Total Return Formula (matches the Excel `totalreturn` tab)
The sheet provides `DailyReturn` in **percent space** (example: `1.7791` means +1.7791%).

For each row:
1. Convert percent → multiplier  
   `multiplier = 1 + (dailyReturn / 100)`
2. Compound over time (cumulative product)  
   `growth = growth * multiplier` starting from `growth = 1`
3. Convert growth to total return  
   `totalReturn = growth - 1`

---

## API Contract

### GET `/api/series`
Returns a filtered + paginated time series and metadata.

**Query params (optional):**
- `limit` (default `25`) — rows per page
- `offset` (default `0`) — starting index
- `start` — start date inclusive (`YYYY-MM-DD`)
- `end` — end date inclusive (`YYYY-MM-DD`)

**Response shape:**
```json
{
  "meta": {
    "totalCount": 8257,
    "limit": 25,
    "offset": 0,
    "start": "1990-01-02",
    "end": "1990-12-31",
    "startDate": "1990-01-02",
    "endDate": "1990-12-29"
  },
  "data": [
    { "date": "1990-01-02", "dailyReturn": 1.7791, "totalReturn": 0.017791 }
  ]
}
