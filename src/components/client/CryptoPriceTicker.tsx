"use client";
import React from "react";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import {
  SiBinance,
  SiTether,
  SiSolana,
  SiRipple,
  SiCardano,
  SiDogecoin,
} from "react-icons/si";

const cryptoData = [
  {
    name: "BTC",
    price: "68,450.78",
    change: "+1.25%",
    icon: <FaBitcoin className="text-yellow-400" />,
  },
  {
    name: "ETH",
    price: "3,560.12",
    change: "-0.58%",
    icon: <FaEthereum className="text-blue-400" />,
  },
  {
    name: "BNB",
    price: "590.45",
    change: "+2.10%",
    icon: <SiBinance className="text-yellow-500" />,
  },
  {
    name: "USDT",
    price: "1.00",
    change: "+0.01%",
    icon: <SiTether className="text-green-500" />,
  },
  {
    name: "SOL",
    price: "170.21",
    change: "-3.15%",
    icon: <SiSolana className="text-purple-500" />,
  },
  {
    name: "XRP",
    price: "0.52",
    change: "+0.88%",
    icon: <SiRipple className="text-blue-300" />,
  },
  {
    name: "ADA",
    price: "0.45",
    change: "-1.90%",
    icon: <SiCardano className="text-blue-600" />,
  },
  {
    name: "DOGE",
    price: "0.16",
    change: "+5.55%",
    icon: <SiDogecoin className="text-yellow-600" />,
  },
];

// Duplicate the data for a seamless loop
const extendedCryptoData = [...cryptoData, ...cryptoData];

const CryptoPriceTicker = () => {
  return (
    <div className="bg-gray-900 text-white py-4 overflow-hidden">
      <div className="animate-scroll-x">
        <div className="flex space-x-12">
          {extendedCryptoData.map((crypto, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center space-x-3"
            >
              <div className="text-2xl">{crypto.icon}</div>
              <div>
                <span className="font-bold text-lg">{crypto.name}</span>
                <span className="ml-2 text-gray-300">${crypto.price}</span>
              </div>
              <span
                className={
                  crypto.change.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {crypto.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoPriceTicker;
