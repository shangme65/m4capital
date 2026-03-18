"use client";

import { useEffect } from "react";

/**
 * Preload commonly used logos to improve perceived performance
 * This component doesn't render anything but triggers browser cache loading
 */
export default function LogoPreloader() {
  useEffect(() => {
    // Most common cryptocurrencies to preload
    const commonCryptos = [
      "btc", "eth", "usdt", "usdc", "bnb", "xrp", "sol", "ada", "doge", "trx",
      "ton", "ltc", "bch", "etc", "link", "dot", "matic", "shib", "avax", "uni"
    ];
    
    // Most common fiat currencies to preload
    const commonCurrencies = [
      "usd", "eur", "gbp", "jpy", "cny", "brl", "inr", "cad", "aud", "mxn",
      "krw", "ngn", "sgd", "hkd", "chf", "nok", "sek", "dkk", "nzd", "zar"
    ];

    // Preload function with timeout to avoid blocking
    const preloadImages = () => {
      // Preload crypto logos from local
      commonCryptos.forEach((symbol, index) => {
        setTimeout(() => {
          // Local version - higher priority
          const localImg = new Image();
          localImg.loading = 'eager';
          localImg.src = `/crypto/${symbol}.svg`;
          
          // CDN version (fallback) - lower priority
          setTimeout(() => {
            const cdnImg = new Image();
            cdnImg.loading = 'lazy';
            cdnImg.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol}.svg`;
          }, 50);
        }, index * 20); // Stagger loads to avoid overwhelming the browser
      });

      // Preload currency flags
      commonCurrencies.forEach((currency, index) => {
        setTimeout(() => {
          // Local version - higher priority
          const flagImg = new Image();
          flagImg.loading = 'eager';
          flagImg.src = `/currencies/${currency}.svg`;
          
          // CDN version - lower priority
          setTimeout(() => {
            const cdnFlag = new Image();
            cdnFlag.loading = 'lazy';
            cdnFlag.src = `https://hatscripts.github.io/circle-flags/flags/${currency}.svg`;
          }, 50);
        }, index * 20);
      });
    };

    // Start preloading after a small delay to not block initial render
    const timeoutId = setTimeout(preloadImages, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return null; // This component doesn't render anything
}
