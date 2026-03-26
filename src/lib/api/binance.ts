// Binance Kline API Types and Utilities

export interface KlineData {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

// Map UI interval to Binance interval
export function normalizeInterval(interval: string): string {
	switch (interval) {
		case "1m":
		case "3m":
		case "5m":
		case "15m":
		case "30m":
		case "1h":
		case "2h":
		case "4h":
		case "6h":
		case "8h":
		case "12h":
		case "1d":
		case "3d":
		case "1w":
		case "1M":
			return interval;
		case "60":
		case "1H":
			return "1h";
		case "240":
		case "4H":
			return "4h";
		case "D":
		case "1D":
			return "1d";
		case "W":
		case "1W":
			return "1w";
		default:
			return "1m";
	}
}

// Fetch historical kline data from Binance REST API
export async function fetchKlineData(
	symbol: string,
	interval: string,
	limit: number = 300
): Promise<KlineData[]> {
	const binanceSymbol = symbol.toUpperCase().includes("USDT")
		? symbol.toUpperCase()
		: `${symbol.toUpperCase()}USDT`;
	const binanceInterval = normalizeInterval(interval);
	const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Binance API error: ${response.statusText}`);
	}
	const rawData = await response.json();
	return rawData.map((kline: any[]) => ({
		timestamp: kline[0],
		open: parseFloat(kline[1]),
		high: parseFloat(kline[2]),
		low: parseFloat(kline[3]),
		close: parseFloat(kline[4]),
		volume: parseFloat(kline[5]),
	}));
}

// Subscribe to Binance WebSocket for real-time kline updates
export function subscribeToKlineUpdates(
	symbol: string,
	interval: string,
	onKline: (kline: KlineData) => void,
	onPrice?: (price: number, direction: "up" | "down" | "neutral") => void
): () => void {
	const binanceSymbol = symbol.toLowerCase();
	const binanceInterval = normalizeInterval(interval);
	const ws = new WebSocket(
		`wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_${binanceInterval}`
	);
	let lastClose = 0;
	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.k) {
			const k = data.k;
			const kline: KlineData = {
				timestamp: k.t,
				open: parseFloat(k.o),
				high: parseFloat(k.h),
				low: parseFloat(k.l),
				close: parseFloat(k.c),
				volume: parseFloat(k.v),
			};
			onKline(kline);
			if (onPrice) {
				let direction: "up" | "down" | "neutral" = "neutral";
				if (lastClose !== 0) {
					if (kline.close > lastClose) direction = "up";
					else if (kline.close < lastClose) direction = "down";
				}
				lastClose = kline.close;
				onPrice(kline.close, direction);
			}
		}
	};
	return () => {
		ws.close();
	};
}

