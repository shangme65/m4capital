"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: "dark" | "light";
  height?: number;
}

function TradingViewChart({
  symbol,
  interval = "D",
  theme = "dark",
  height = 400,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Map common crypto symbols to display names
  const getCryptoName = (sym: string): string => {
    const nameMap: Record<string, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      XRP: "Ripple",
      TRX: "Tron",
      TON: "Toncoin",
      LTC: "Litecoin",
      BCH: "Bitcoin Cash",
      ETC: "Ethereum Classic",
      USDC: "USD Coin",
      USDT: "Tether",
      SOL: "Solana",
      ADA: "Cardano",
      DOGE: "Dogecoin",
      DOT: "Polkadot",
      MATIC: "Polygon",
      AVAX: "Avalanche",
      LINK: "Chainlink",
      UNI: "Uniswap",
      SHIB: "Shiba Inu",
      ATOM: "Cosmos",
      NEAR: "NEAR Protocol",
      FIL: "Filecoin",
      APT: "Aptos",
      ARB: "Arbitrum",
      OP: "Optimism",
      AAVE: "Aave",
      MKR: "Maker",
      INJ: "Injective",
      SUI: "Sui",
      SEI: "Sei",
    };
    return nameMap[sym.toUpperCase()] || sym.toUpperCase();
  };

  // Comprehensive symbol mapping for TradingView (forex, stocks, indices, commodities, crypto)
  const getTradingViewSymbol = (sym: string): string => {
    const upper = sym.toUpperCase().replace(/\s*\(OTC\)/i, "").trim();
    
    // Forex pairs (contains /)
    if (upper.includes("/")) {
      const pair = upper.replace("/", "");
      const forexMap: Record<string, string> = {
        "USDCAD": "FX:USDCAD",
        "EURUSD": "FX:EURUSD",
        "GBPUSD": "FX:GBPUSD",
        "USDJPY": "FX:USDJPY",
        "AUDUSD": "FX:AUDUSD",
        "USDCHF": "FX:USDCHF",
        "NZDUSD": "FX:NZDUSD",
        "EURGBP": "FX:EURGBP",
        "EURJPY": "FX:EURJPY",
        "GBPJPY": "FX:GBPJPY",
        "CADJPY": "FX:CADJPY",
        "AUDJPY": "FX:AUDJPY",
        "EURAUD": "FX:EURAUD",
        "EURCAD": "FX:EURCAD",
        "EURCHF": "FX:EURCHF",
        "GBPAUD": "FX:GBPAUD",
        "GBPCAD": "FX:GBPCAD",
        "GBPCHF": "FX:GBPCHF",
        "AUDCAD": "FX:AUDCAD",
        "AUDCHF": "FX:AUDCHF",
        "AUDNZD": "FX:AUDNZD",
        "NZDJPY": "FX:NZDJPY",
        "CHFJPY": "FX:CHFJPY",
        "CADCHF": "FX:CADCHF",
        "EURNZD": "FX:EURNZD",
        "GBPNZD": "FX:GBPNZD",
      };
      return forexMap[pair] || `FX:${pair}`;
    }
    
    // Indices
    const indicesMap: Record<string, string> = {
      "NI225": "TVC:NI225",
      "NIKKEI": "TVC:NI225",
      "NIKKEI 225": "TVC:NI225",
      "N225": "TVC:NI225",
      "SPX": "SP:SPX",
      "SP500": "SP:SPX",
      "S&P500": "SP:SPX",
      "S&P 500": "SP:SPX",
      "DJI": "TVC:DJI",
      "DOW": "TVC:DJI",
      "DOW JONES": "TVC:DJI",
      "NASDAQ": "NASDAQ:NDX",
      "NDX": "NASDAQ:NDX",
      "NASDAQ100": "NASDAQ:NDX",
      "FTSE": "TVC:UKX",
      "FTSE100": "TVC:UKX",
      "UKX": "TVC:UKX",
      "DAX": "XETR:DAX",
      "DAX40": "XETR:DAX",
      "CAC40": "EURONEXT:PX1",
      "CAC": "EURONEXT:PX1",
      "NIFTY": "NSE:NIFTY",
      "NIFTY50": "NSE:NIFTY",
      "SENSEX": "BSE:SENSEX",
      "HSI": "TVC:HSI",
      "HANGSENG": "TVC:HSI",
      "SSE": "SSE:000001",
      "SHANGHAI": "SSE:000001",
      "ASX200": "ASX:XJO",
      "ASX": "ASX:XJO",
      "KOSPI": "KRX:KOSPI",
      "IBEX": "BME:IBC",
      "IBEX35": "BME:IBC",
      "TSX": "TSX:TSX",
      "RUT": "TVC:RUT",
      "RUSSELL": "TVC:RUT",
      "RUSSELL2000": "TVC:RUT",
      "VIX": "TVC:VIX",
    };
    if (indicesMap[upper]) return indicesMap[upper];
    
    // Stocks
    const stocksMap: Record<string, string> = {
      "NVDA": "NASDAQ:NVDA",
      "NVIDIA": "NASDAQ:NVDA",
      "AAPL": "NASDAQ:AAPL",
      "APPLE": "NASDAQ:AAPL",
      "MSFT": "NASDAQ:MSFT",
      "MICROSOFT": "NASDAQ:MSFT",
      "GOOGL": "NASDAQ:GOOGL",
      "GOOGLE": "NASDAQ:GOOGL",
      "GOOG": "NASDAQ:GOOG",
      "AMZN": "NASDAQ:AMZN",
      "AMAZON": "NASDAQ:AMZN",
      "META": "NASDAQ:META",
      "FACEBOOK": "NASDAQ:META",
      "TSLA": "NASDAQ:TSLA",
      "TESLA": "NASDAQ:TSLA",
      "NFLX": "NASDAQ:NFLX",
      "NETFLIX": "NASDAQ:NFLX",
      "AMD": "NASDAQ:AMD",
      "INTC": "NASDAQ:INTC",
      "INTEL": "NASDAQ:INTC",
      "PYPL": "NASDAQ:PYPL",
      "PAYPAL": "NASDAQ:PYPL",
      "ADBE": "NASDAQ:ADBE",
      "ADOBE": "NASDAQ:ADBE",
      "CRM": "NYSE:CRM",
      "SALESFORCE": "NYSE:CRM",
      "ORCL": "NYSE:ORCL",
      "ORACLE": "NYSE:ORCL",
      "IBM": "NYSE:IBM",
      "CSCO": "NASDAQ:CSCO",
      "CISCO": "NASDAQ:CSCO",
      "BA": "NYSE:BA",
      "BOEING": "NYSE:BA",
      "DIS": "NYSE:DIS",
      "DISNEY": "NYSE:DIS",
      "JPM": "NYSE:JPM",
      "JPMORGAN": "NYSE:JPM",
      "GS": "NYSE:GS",
      "GOLDMAN": "NYSE:GS",
      "V": "NYSE:V",
      "VISA": "NYSE:V",
      "MA": "NYSE:MA",
      "MASTERCARD": "NYSE:MA",
      "WMT": "NYSE:WMT",
      "WALMART": "NYSE:WMT",
      "KO": "NYSE:KO",
      "COCA-COLA": "NYSE:KO",
      "PEP": "NASDAQ:PEP",
      "PEPSI": "NASDAQ:PEP",
      "MCD": "NYSE:MCD",
      "MCDONALDS": "NYSE:MCD",
      "NKE": "NYSE:NKE",
      "NIKE": "NYSE:NKE",
      "JNJ": "NYSE:JNJ",
      "PFE": "NYSE:PFE",
      "PFIZER": "NYSE:PFE",
      "MRNA": "NASDAQ:MRNA",
      "MODERNA": "NASDAQ:MRNA",
      "UNH": "NYSE:UNH",
      "XOM": "NYSE:XOM",
      "EXXON": "NYSE:XOM",
      "CVX": "NYSE:CVX",
      "CHEVRON": "NYSE:CVX",
      "NIO": "NYSE:NIO",
      "BABA": "NYSE:BABA",
      "ALIBABA": "NYSE:BABA",
      "PDD": "NASDAQ:PDD",
      "PINDUODUO": "NASDAQ:PDD",
      "JD": "NASDAQ:JD",
      "BIDU": "NASDAQ:BIDU",
      "BAIDU": "NASDAQ:BIDU",
      "COIN": "NASDAQ:COIN",
      "COINBASE": "NASDAQ:COIN",
      "HOOD": "NASDAQ:HOOD",
      "ROBINHOOD": "NASDAQ:HOOD",
      "PLTR": "NYSE:PLTR",
      "PALANTIR": "NYSE:PLTR",
      "SNOW": "NYSE:SNOW",
      "SNOWFLAKE": "NYSE:SNOW",
      "UBER": "NYSE:UBER",
      "LYFT": "NASDAQ:LYFT",
      "ABNB": "NASDAQ:ABNB",
      "AIRBNB": "NASDAQ:ABNB",
      "SQ": "NYSE:SQ",
      "BLOCK": "NYSE:SQ",
      "SHOP": "NYSE:SHOP",
      "SHOPIFY": "NYSE:SHOP",
      "SPOT": "NYSE:SPOT",
      "SPOTIFY": "NYSE:SPOT",
      "ZM": "NASDAQ:ZM",
      "ZOOM": "NASDAQ:ZM",
      "SNAP": "NYSE:SNAP",
      "SNAPCHAT": "NYSE:SNAP",
      "TWTR": "NYSE:TWTR",
      "TWITTER": "NYSE:TWTR",
      "PINS": "NYSE:PINS",
      "PINTEREST": "NYSE:PINS",
      "RBLX": "NYSE:RBLX",
      "ROBLOX": "NYSE:RBLX",
      "U": "NYSE:U",
      "UNITY": "NYSE:U",
      "GME": "NYSE:GME",
      "GAMESTOP": "NYSE:GME",
      "AMC": "NYSE:AMC",
      "BB": "NYSE:BB",
      "BLACKBERRY": "NYSE:BB",
    };
    if (stocksMap[upper]) return stocksMap[upper];
    
    // Commodities
    const commoditiesMap: Record<string, string> = {
      "GOLD": "TVC:GOLD",
      "XAUUSD": "TVC:GOLD",
      "XAU": "TVC:GOLD",
      "SILVER": "TVC:SILVER",
      "XAGUSD": "TVC:SILVER",
      "XAG": "TVC:SILVER",
      "OIL": "TVC:USOIL",
      "USOIL": "TVC:USOIL",
      "WTI": "TVC:USOIL",
      "CRUDE": "TVC:USOIL",
      "CRUDEOIL": "TVC:USOIL",
      "BRENT": "TVC:UKOIL",
      "UKOIL": "TVC:UKOIL",
      "NATGAS": "TVC:NATGAS",
      "NATURALGAS": "TVC:NATGAS",
      "NG": "TVC:NATGAS",
      "COPPER": "TVC:COPPER",
      "PLATINUM": "TVC:PLATINUM",
      "PALLADIUM": "TVC:PALLADIUM",
      "WHEAT": "CBOT:ZW1!",
      "CORN": "CBOT:ZC1!",
      "SOYBEAN": "CBOT:ZS1!",
      "COFFEE": "ICEUS:KC1!",
      "SUGAR": "ICEUS:SB1!",
      "COTTON": "ICEUS:CT1!",
    };
    if (commoditiesMap[upper]) return commoditiesMap[upper];
    
    // Crypto symbols
    const cryptoMap: Record<string, string> = {
      BTC: "BINANCE:BTCUSDT",
      ETH: "BINANCE:ETHUSDT",
      XRP: "BINANCE:XRPUSDT",
      TRX: "BINANCE:TRXUSDT",
      TON: "OKX:TONUSDT",
      LTC: "BINANCE:LTCUSDT",
      BCH: "BINANCE:BCHUSDT",
      ETC: "BINANCE:ETCUSDT",
      BNB: "BINANCE:BNBUSDT",
      USDC: "BINANCE:USDCUSDT",
      USDT: "BITSTAMP:USDTUSD",
      SOL: "BINANCE:SOLUSDT",
      ADA: "BINANCE:ADAUSDT",
      DOGE: "BINANCE:DOGEUSDT",
      DOT: "BINANCE:DOTUSDT",
      MATIC: "BINANCE:POLUSDT",
      POL: "BINANCE:POLUSDT",
      AVAX: "BINANCE:AVAXUSDT",
      LINK: "BINANCE:LINKUSDT",
      UNI: "BINANCE:UNIUSDT",
      SHIB: "BINANCE:SHIBUSDT",
      ATOM: "BINANCE:ATOMUSDT",
      NEAR: "BINANCE:NEARUSDT",
      FIL: "BINANCE:FILUSDT",
      APT: "BINANCE:APTUSDT",
      ARB: "BINANCE:ARBUSDT",
      OP: "BINANCE:OPUSDT",
      AAVE: "BINANCE:AAVEUSDT",
      MKR: "BINANCE:MKRUSDT",
      INJ: "BINANCE:INJUSDT",
      SUI: "BINANCE:SUIUSDT",
      SEI: "BINANCE:SEIUSDT",
      PEPE: "BINANCE:PEPEUSDT",
      FLOKI: "BINANCE:FLOKIUSDT",
      WIF: "BINANCE:WIFUSDT",
      BONK: "BINANCE:BONKUSDT",
      MEME: "BINANCE:MEMEUSDT",
      RENDER: "BINANCE:RENDERUSDT",
      FET: "BINANCE:FETUSDT",
      TAO: "BINANCE:TAOUSDT",
      RNDR: "BINANCE:RNDRUSDT",
      IMX: "BINANCE:IMXUSDT",
      SAND: "BINANCE:SANDUSDT",
      MANA: "BINANCE:MANAUSDT",
      AXS: "BINANCE:AXSUSDT",
      GALA: "BINANCE:GALAUSDT",
      ENJ: "BINANCE:ENJUSDT",
      ILV: "BINANCE:ILVUSDT",
      THETA: "BINANCE:THETAUSDT",
      FTM: "BINANCE:FTMUSDT",
      ALGO: "BINANCE:ALGOUSDT",
      EGLD: "BINANCE:EGLDUSDT",
      HBAR: "BINANCE:HBARUSDT",
      VET: "BINANCE:VETUSDT",
      XLM: "BINANCE:XLMUSDT",
      ICP: "BINANCE:ICPUSDT",
      GRT: "BINANCE:GRTUSDT",
      SNX: "BINANCE:SNXUSDT",
      CRV: "BINANCE:CRVUSDT",
      COMP: "BINANCE:COMPUSDT",
      YFI: "BINANCE:YFIUSDT",
      "1INCH": "BINANCE:1INCHUSDT",
      SUSHI: "BINANCE:SUSHIUSDT",
      CAKE: "BINANCE:CAKEUSDT",
      LDO: "BINANCE:LDOUSDT",
      RPL: "BINANCE:RPLUSDT",
      SSV: "BINANCE:SSVUSDT",
      EIGEN: "BINANCE:EIGENUSDT",
      PENDLE: "BINANCE:PENDLEUSDT",
      JUP: "BINANCE:JUPUSDT",
      PYTH: "BINANCE:PYTHUSDT",
      W: "BINANCE:WUSDT",
      STRK: "BINANCE:STRKUSDT",
      ZK: "BINANCE:ZKUSDT",
      MANTA: "BINANCE:MANTAUSDT",
      DYM: "BINANCE:DYMUSDT",
      TIA: "BINANCE:TIAUSDT",
      BLUR: "BINANCE:BLURUSDT",
      CYBER: "BINANCE:CYBERUSDT",
      WLD: "BINANCE:WLDUSDT",
      ARKM: "BINANCE:ARKMUSDT",
      EDU: "BINANCE:EDUUSDT",
      ID: "BINANCE:IDUSDT",
    };
    if (cryptoMap[upper]) return cryptoMap[upper];
    
    // Default: assume it's a crypto on Binance
    return `BINANCE:${upper}USDT`;
  };

  // Map UI interval to TradingView interval
  const getTradingViewInterval = (int: string): string => {
    const intervalMap: Record<string, string> = {
      "1m": "1",
      "5m": "5",
      "15m": "15",
      "1h": "60",
      "4h": "240",
      "1d": "D",
      "1w": "W",
      // UI period mappings - these should show appropriate timeframes
      "1H": "1", // 1 hour view = 1 minute candles
      "1D": "5", // 1 day view = 5 minute candles
      "1W": "30", // 1 week view = 30 minute candles
      "1M": "60", // 1 month view = 1 hour candles
      "1Y": "D", // 1 year view = daily candles
      All: "W", // All time = weekly candles
    };
    return intervalMap[int] || "D";
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    widgetContainer.appendChild(widgetDiv);
    containerRef.current.appendChild(widgetContainer);

    // Create and load TradingView script
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const tvSymbol = getTradingViewSymbol(symbol);
    const tvInterval = getTradingViewInterval(interval);
    const displayName = getCryptoName(symbol);

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor:
        theme === "dark" ? "rgba(17, 24, 39, 1)" : "rgba(255, 255, 255, 1)",
      gridColor:
        theme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 1)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: true,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      withdateranges: false,
      details: false,
      hotlist: false,
      calendar: false,
      studies: [],
      support_host: "https://www.tradingview.com",
      container_id: widgetDiv.id,
    });

    widgetContainer.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, interval, theme]);

  return (
    <>
      <style jsx global>{`
        .tradingview-widget-container iframe + div,
        .tradingview-widget-copyright,
        div[class*="copyright"],
        a[href*="tradingview.com"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      <div
        style={{ height: `${height}px`, width: "100%" }}
        className="rounded-xl overflow-hidden relative"
      >
        {/* Widget container */}
        <div
          ref={containerRef}
          style={{ height: "100%", width: "100%" }}
        />
        
        {/* Overlay to block "/ TetherUS" text - positioned after "Bitcoin" */}
        <div
          className="absolute z-[9999]"
          style={{
            top: "46px",
            left: "90px",
            width: "120px",
            height: "22px",
            background: theme === "dark" ? "#131722" : "#ffffff",
            pointerEvents: "none",
          }}
        />
        
        {/* Overlay to cover bottom-left TradingView logo */}
        <div
          className="absolute z-[9999]"
          style={{
            bottom: "0",
            left: "0",
            width: "96px",
            height: "40px",
            background: theme === "dark" ? "#131722" : "#ffffff",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}

export default memo(TradingViewChart);
