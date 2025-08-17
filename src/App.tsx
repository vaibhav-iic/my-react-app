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

type HistoricalData = [number, number][]; // [timestamp, price]

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
  const [coin, setCoin] = useState("bitcoin");
  const [range, setRange] = useState(7);
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoricalData>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // abort controller to cancel in-flight requests when user changes fast
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    // cancel previous request if any
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError("");

      // Current price
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
        { signal: controller.signal }
      );
      if (!priceRes.ok) throw new Error(String(priceRes.status));
      const priceData = await priceRes.json();
      if (!priceData[coin]) throw new Error("NOT_FOUND");
      setPrice(priceData[coin].usd);

      // Historical data with dynamic range
      const historyRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${range}&interval=daily`,
        { signal: controller.signal }
      );
      if (!historyRes.ok) throw new Error(String(historyRes.status));
      const historyData = await historyRes.json();
      setHistory(historyData.prices ?? []);
    } catch (err: any) {
      if (err?.name === "AbortError") return; // user changed selection; ignore
      if (err?.message === "NOT_FOUND") {
        setError("Coin not found. Try another.");
      } else if (String(err?.message).includes("429")) {
        setError("Too many requests. Please wait a few seconds.");
      } else {
        setError("Error fetching data.");
      }
      setHistory([]);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when coin or range changes, with a small debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // wait 0.5s after last change
    return () => clearTimeout(timer);
  }, [coin, range]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Crypto Dashboard with Chart 🚀</h1>

      {/* Coin dropdown */}
      <select
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
        style={{ padding: "8px", fontSize: "16px", marginRight: "10px" }}
      >
        {coinOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

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

      {/* Optional manual refresh button */}
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
        {price !== null && !loading && !error && (
          <>
            <p>
              Current {coin.toUpperCase()} Price:{" "}
              <strong>${price.toLocaleString("en-US")}</strong>
            </p>

            {history.length > 0 && (
              <ResponsiveContainer width="90%" height={300}>
                <LineChart
                  data={history.map((item) => ({
                    date: new Date(item[0]).toLocaleDateString(),
                    price: item[1],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;