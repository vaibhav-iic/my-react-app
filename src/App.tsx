import { useState } from "react";
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

function App() {
  const [coin, setCoin] = useState("bitcoin");
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoricalData>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch current price
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
      );
      const priceData = await priceRes.json();

      if (priceData[coin]) {
        setPrice(priceData[coin].usd);
      } else {
        setPrice(null);
        setHistory([]);
        setError("Coin not found. Try another name.");
        setLoading(false);
        return;
      }

      // Fetch last 7 days historical data
      const historyRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=120&interval=daily`
      );
      const historyData = await historyRes.json();

      setHistory(historyData.prices);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching data.");
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Crypto Price + 7-Day Chart 🚀</h1>

      <input
        type="text"
        value={coin}
        onChange={(e) => setCoin(e.target.value.toLowerCase())}
        placeholder="Enter coin name (e.g. bitcoin)"
        style={{ padding: "8px", fontSize: "16px", marginRight: "10px" }}
      />
      <button onClick={fetchData} style={{ padding: "8px 16px" }}>
        Get Data
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

            {/* Chart */}
            {history.length > 0 && (
              <ResponsiveContainer width="90%" height={300}>
                <LineChart
                  data={history.map((item) => ({
                    date: new Date(item[0]).toLocaleDateString(),
                    price: item[1],
                  }))}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
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