export default async function handler(req, res) {
  try {
    const { coin, days, interval } = req.query;

    if (!coin || !days || !interval) {
      return res.status(400).json({ error: "Missing required query params" });
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    const data = await response.json();

    // Allow browser calls
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch CoinGecko data", details: err.message });
  }
}