"use client";

import { useEffect, useRef, memo, useState } from "react";

interface UniversalTradingChartProps {
  symbol: string;
  interval?: string;
  theme?: "dark" | "light";
}

// Comprehensive symbol mapping for TradingView (forex, stocks, indices, commodities, crypto)
function getTradingViewSymbol(sym: string): string {
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
    "NIKKEI225": "TVC:NI225",
    "N225": "TVC:NI225",
    "SPX": "SP:SPX",
    "SP500": "SP:SPX",
    "S&P500": "SP:SPX",
    "DJI": "TVC:DJI",
    "DOW": "TVC:DJI",
    "DOWJONES": "TVC:DJI",
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
    "FTSEMIB": "MIL:FTSEMIB",
    "AEX": "EURONEXT:AEX",
    "SMI": "SIX:SMI",
    "STOXX50": "EUREX:FESX1!",
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
    "ADBE": "NASDAQ:ADBE",
    "CRM": "NYSE:CRM",
    "ORCL": "NYSE:ORCL",
    "IBM": "NYSE:IBM",
    "CSCO": "NASDAQ:CSCO",
    "BA": "NYSE:BA",
    "BOEING": "NYSE:BA",
    "DIS": "NYSE:DIS",
    "DISNEY": "NYSE:DIS",
    "JPM": "NYSE:JPM",
    "GS": "NYSE:GS",
    "V": "NYSE:V",
    "VISA": "NYSE:V",
    "MA": "NYSE:MA",
    "MASTERCARD": "NYSE:MA",
    "WMT": "NYSE:WMT",
    "KO": "NYSE:KO",
    "PEP": "NASDAQ:PEP",
    "MCD": "NYSE:MCD",
    "NKE": "NYSE:NKE",
    "JNJ": "NYSE:JNJ",
    "PFE": "NYSE:PFE",
    "MRNA": "NASDAQ:MRNA",
    "UNH": "NYSE:UNH",
    "XOM": "NYSE:XOM",
    "CVX": "NYSE:CVX",
    "NIO": "NYSE:NIO",
    "BABA": "NYSE:BABA",
    "PDD": "NASDAQ:PDD",
    "JD": "NASDAQ:JD",
    "BIDU": "NASDAQ:BIDU",
    "COIN": "NASDAQ:COIN",
    "HOOD": "NASDAQ:HOOD",
    "PLTR": "NYSE:PLTR",
    "SNOW": "NYSE:SNOW",
    "UBER": "NYSE:UBER",
    "LYFT": "NASDAQ:LYFT",
    "ABNB": "NASDAQ:ABNB",
    "SQ": "NYSE:SQ",
    "BLOCK": "NYSE:SQ",
    "SHOP": "NYSE:SHOP",
    "SPOT": "NYSE:SPOT",
    "ZM": "NASDAQ:ZM",
    "SNAP": "NYSE:SNAP",
    "PINS": "NYSE:PINS",
    "RBLX": "NYSE:RBLX",
    "U": "NYSE:U",
    "UNITY": "NYSE:U",
    "GME": "NYSE:GME",
    "AMC": "NYSE:AMC",
    "BB": "NYSE:BB",
    "RIVN": "NASDAQ:RIVN",
    "LCID": "NASDAQ:LCID",
    "F": "NYSE:F",
    "FORD": "NYSE:F",
    "GM": "NYSE:GM",
    "T": "NYSE:T",
    "VZ": "NYSE:VZ",
    "SBUX": "NASDAQ:SBUX",
    "HD": "NYSE:HD",
    "LOW": "NYSE:LOW",
    "TGT": "NYSE:TGT",
    "COST": "NASDAQ:COST",
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
    RENDER: "BINANCE:RENDERUSDT",
    FET: "BINANCE:FETUSDT",
    TAO: "BINANCE:TAOUSDT",
    RNDR: "BINANCE:RNDRUSDT",
    IMX: "BINANCE:IMXUSDT",
    SAND: "BINANCE:SANDUSDT",
    MANA: "BINANCE:MANAUSDT",
    AXS: "BINANCE:AXSUSDT",
    GALA: "BINANCE:GALAUSDT",
    THETA: "BINANCE:THETAUSDT",
    FTM: "BINANCE:FTMUSDT",
    ALGO: "BINANCE:ALGOUSDT",
    HBAR: "BINANCE:HBARUSDT",
    VET: "BINANCE:VETUSDT",
    XLM: "BINANCE:XLMUSDT",
    ICP: "BINANCE:ICPUSDT",
    GRT: "BINANCE:GRTUSDT",
    LDO: "BINANCE:LDOUSDT",
    JUP: "BINANCE:JUPUSDT",
    PYTH: "BINANCE:PYTHUSDT",
    W: "BINANCE:WUSDT",
    STRK: "BINANCE:STRKUSDT",
    TIA: "BINANCE:TIAUSDT",
    WLD: "BINANCE:WLDUSDT",
  };
  if (cryptoMap[upper]) return cryptoMap[upper];
  
  // Default: assume it's a crypto on Binance
  return `BINANCE:${upper}USDT`;
}

function UniversalTradingChartComponent({
  symbol,
  interval = "1",
  theme = "dark",
}: UniversalTradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(`tv_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetIdRef.current;
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    widgetContainer.appendChild(widgetDiv);
    containerRef.current.appendChild(widgetContainer);

    // Create and load TradingView script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const tvSymbol = getTradingViewSymbol(symbol);

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1", // Candlestick
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(17, 24, 39, 1)",
      gridColor: "rgba(55, 65, 81, 0.3)",
      hide_top_toolbar: true,
      hide_legend: true,
      save_image: false,
      hide_volume: true,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      withdateranges: false,
      details: false,
      hotlist: false,
      calendar: false,
      studies: [],
      hide_drawing_toolbar: true,
      range_buttons: false,
      disabled_features: [
        "use_localstorage_for_settings",
        "header_widget",
        "header_indicators",
        "header_compare",
        "compare_symbol",
        "header_screenshot",
        "header_undo_redo",
        "header_symbol_search",
        "header_resolutions",
        "header_chart_type",
        "header_settings",
        "header_fullscreen_button",
        "left_toolbar",
        "timeframes_toolbar",
        "control_bar",
        "edit_buttons_in_legend",
        "border_around_the_chart",
        "main_series_scale_menu",
        "display_market_status",
        "remove_library_container_border",
        "chart_property_page_scales",
        "property_pages",
        "show_chart_property_page",
        "chart_property_page_style",
        "chart_property_page_background",
        "chart_property_page_timezone_sessions",
        "chart_property_page_trading",
        "countdown",
        "caption_buttons_text_if_possible",
        "go_to_date",
        "adaptive_logo",
        "show_dom_first_time",
        "hide_last_na_study_output",
        "symbol_info",
        "timezone_menu",
        "snapshot_trading_drawings"
      ],
      support_host: "https://www.tradingview.com",
      container_id: widgetIdRef.current,
    });

    // Handle load complete
    script.onload = () => {
      setTimeout(() => setIsLoading(false), 1000);
    };

    widgetContainer.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ minHeight: "300px" }}>
      {/* Top overlay to hide TradingView header */}
      <div 
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        style={{ 
          height: "38px", 
          background: "linear-gradient(to bottom, rgba(17, 24, 39, 1) 80%, transparent 100%)"
        }}
      />
      
      {/* Bottom overlay to hide TradingView footer */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{ 
          height: "32px", 
          background: "linear-gradient(to top, rgba(17, 24, 39, 1) 80%, transparent 100%)"
        }}
      />
      
      {/* TradingView widget container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "300px" }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-400">Loading {symbol} chart...</div>
          </div>
        </div>
      )}

      {/* Hide TradingView branding */}
      <style jsx global>{`
        .tradingview-widget-container iframe + div,
        .tradingview-widget-copyright,
        div[class*="copyright"],
        a[href*="tradingview.com"]:not(iframe *) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
}

const UniversalTradingChart = memo(UniversalTradingChartComponent);
export default UniversalTradingChart;
