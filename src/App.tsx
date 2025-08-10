import { useState, useEffect } from "react";
import "./App.css";

type CryptoData = {
  [key: string]: {
    usd: number;
  };
};

function App() {
  const [prices, setPrices] = useState<CryptoData>({});
  const [loading, setLoading] = useState(true);

  const coins = ["bitcoin", "ethereum", "dogecoin"];

  // Fetch prices for multiple coins
  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(
          ","
        )}&vs_currencies=usd`
      );
      const data: CryptoData = await res.json();
      setPrices(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching prices:", err);
      setLoading(false);
    }
  };

  // Run on mount + refresh every 10 seconds
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Crypto Price Dashboard 🚀</h1>
      {loading ? (
        <p>Loading prices...</p>
      ) : (
        <table
          style={{
            margin: "auto",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid black", padding: "10px" }}>
                Coin
              </th>
              <th style={{ borderBottom: "1px solid black", padding: "10px" }}>
                Price (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr key={coin}>
                <td style={{ padding: "10px" }}>{coin.toUpperCase()}</td>
                <td style={{ padding: "10px" }}>
                  ${prices[coin]?.usd.toLocaleString("en-US")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: "12px", color: "gray", marginTop: "10px" }}>
        Updates every 10 seconds
      </p>
    </div>
  );
}

export default App;