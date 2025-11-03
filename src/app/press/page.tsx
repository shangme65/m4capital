"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExternalLink } from "lucide-react";

export default function PressPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        <div className="bg-[#1a2332] py-24 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Our Online Trading Platform In The News
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="border-b pb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">DS</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Aston Martin Racing, Introducing M4 Option
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">22.02.2016</p>
                  <p className="text-gray-700 mb-4">
                    Our decision was between motor racing and football, all of
                    our major competitors are in football but we found more
                    synergy with motorsport, our products are about excellence,
                    efficiency, speed and great design and this is a sport that
                    gave us some real parallels.
                  </p>
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
                  >
                    Read more <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-b pb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">EX</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    What does 'speed' mean to you? Sponsored by M4 option
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">30.06.2015</p>
                  <p className="text-gray-700 mb-4">
                    A rushing movement, aimed at achieving a particular result?
                    A chaotic inclination of moving particles? A gust of wind, a
                    conscious obedience to a vector? Inert or aspiring?
                  </p>
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
                  >
                    Read more <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-b pb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">DJ</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    New version of M4 Option: Advanced technologies for your
                    success
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">04.05.2015</p>
                  <p className="text-gray-700 mb-4">
                    An updated interface of the system became much more
                    interesting, more functional and more comfortable. New tools
                    were provided to improve the efficiency of the trader
                    appeared in this version. So, let's check out the details.
                  </p>
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
                  >
                    Read more <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
