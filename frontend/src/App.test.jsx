import { render, screen } from "@testing-library/react";
import { vi, test, expect } from "vitest";
import App from "./App";

// Mock Plotly so tests don't depend on browser-only features
vi.mock("react-plotly.js", () => {
  return {
    default: () => <div data-testid="plotly-chart" />,
  };
});

test("renders meta and table rows from API", async () => {
  //Mock fetch used in useEffect
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        meta: {
          totalCount: 3,
          startDate: "1990-01-02",
          endDate: "1990-01-04",
        },
        data: [
          { date: "1990-01-02", dailyReturn: 1.7791, totalReturn: 0.017791 },
          { date: "1990-01-03", dailyReturn: -0.2564, totalReturn: 0.015181 },
          { date: "1990-01-04", dailyReturn: -0.8178, totalReturn: 0.006879 },
        ],
      }),
    })
  );

  render(<App />);

  // Loading state appears first
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();

  // Wait for data to render (unique table value)
  expect(await screen.findByText("1.7791")).toBeInTheDocument();



  // Meta section shows totals/dates
  expect(screen.getByTestId("meta-totalCount")).toHaveTextContent("3");
  expect(screen.getByTestId("meta-startDate")).toHaveTextContent("1990-01-02");
  expect(screen.getByTestId("meta-endDate")).toHaveTextContent("1990-01-04");



  // Plotly mocked component rendered
  expect(screen.getByTestId("plotly-chart")).toBeInTheDocument();

  // Clean up mock
  vi.unstubAllGlobals();
});
