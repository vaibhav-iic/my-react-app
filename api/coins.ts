export default async function handler(req: any, res: any) {
  const { coin, days, interval } = req.query;

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // fix CORS
    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch CoinGecko data" });
  }
}