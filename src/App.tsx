import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Types
type HistoricalData = [number, number][];
type Histories = {
  [coin: string]: HistoricalData;
};

// Coin + Range options
const coinOptions = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "dogecoin", name: "Dogecoin" },
  { id: "litecoin", name: "Litecoin" },
  { id: "ripple", name: "XRP" },
];

const rangeOptions = [
  { days: 7, label: "7 Days" },
  { days: 30, label: "30 Days" },
  { days: 120, label: "120 Days" },
];

function App() {
  const [range, setRange] = useState(7);
  const [histories, setHistories] = useState<Histories>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    // cancel previous request if any
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError("");

      const results: Histories = {};

      // fetch each coin one after another to avoid rate limits
      for (const c of coinOptions) {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${c.id}/market_chart?vs_currency=usd&days=${range}&interval=daily`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        results[c.id] = data.prices ?? [];
      }

      setHistories(results);
    } catch (err: any) {
      console.error("FETCH ERROR:", err);
      if (err?.name === "AbortError") return;
      if (String(err?.message).includes("429")) {
        setError("Too many requests. Please wait a few seconds.");
      } else {
        setError("Error fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [range]);

  // Merge all coin histories into one dataset
  const mergedData =
    histories[coinOptions[0].id]?.map((_, index) => {
      const date = new Date(
        histories[coinOptions[0].id][index][0]
      ).toLocaleDateString();
      const entry: any = { date };

      coinOptions.forEach((c) => {
        if (histories[c.id]) {
          entry[c.name] = histories[c.id][index][1];
        }
      });

      return entry;
    }) ?? [];

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Crypto Dashboard with Multi-Coin Chart 🚀</h1>

      {/* Range dropdown */}
      <select
        value={range}
        onChange={(e) => setRange(Number(e.target.value))}
        style={{ padding: "8px", fontSize: "16px", marginRight: "10px" }}
      >
        {rangeOptions.map((r) => (
          <option key={r.days} value={r.days}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Manual refresh */}
      <button
        onClick={fetchData}
        disabled={loading}
        style={{ padding: "8px 16px", opacity: loading ? 0.5 : 1 }}
      >
        {loading ? "Loading..." : "Refresh"}
      </button>

      <div style={{ marginTop: "20px" }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {mergedData.length > 0 && !loading && !error && (
          <ResponsiveContainer width="90%" height={300}>
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {coinOptions.map((c, i) => (
                <Line
                  key={c.id}
                  type="monotone"
                  dataKey={c.name}
                  stroke={["#8884d8", "#82ca9d", "#ff7300", "#00c49f", "#ff0000"][i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default App;