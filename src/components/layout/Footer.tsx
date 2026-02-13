"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations/translations";

export function Footer() {
  const { language } = useLanguage();
  const t = (key: string) => (translations as any)[language]?.[key] || key;
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Markets & Assets */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              {t("footer.markets.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/assets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.markets.assets")}
                </a>
              </li>
              <li>
                <a
                  href="/stock-collections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.markets.collections")}
                </a>
              </li>
              <li>
                <a
                  href="/industries"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.markets.industries")}
                </a>
              </li>
            </ul>
          </div>

          {/* Analytics & Tools */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              {t("footer.analytics.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/historical-quotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.analytics.quotes")}
                </a>
              </li>
              <li>
                <a
                  href="/trading-specifications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.analytics.specs")}
                </a>
              </li>
            </ul>
          </div>

          {/* Education & Learning */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              {t("footer.education.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/video-tutorials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.education.videos")}
                </a>
              </li>
              <li>
                <a
                  href="/margin-trading-basics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.education.margin")}
                </a>
              </li>
            </ul>
          </div>

          {/* Events & Community */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              {t("footer.events.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.events.blog")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* About Us */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              {t("footer.about.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/in-numbers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.about.numbers")}
                </a>
              </li>
              <li>
                <a
                  href="/press"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.about.press")}
                </a>
              </li>
              <li>
                <a
                  href="/awards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.about.awards")}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.about.contact")}
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.about.sitemap")}
                </a>
              </li>
              <li>
                <a
                  href="/licenses-and-safeguards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.about.licenses")}
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Services */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              {t("footer.support.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.support.download")}
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.support.help")}
                </a>
              </li>
              <li>
                <a
                  href="/deposits-withdrawals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.support.deposits")}
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  {t("footer.support.terms")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
          <a
            href="https://t.me/vg_victorgratidao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span>Telegram</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://wa.me/556291587831"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://facebook.com/victorgrata"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://tiktok.com/@victorgratidao.vg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
            <span>TikTok</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/victorgratidao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
            </svg>
            <span>Instagram</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://youtube.com/@vg.victorgratidao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span>Youtube</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
        </div>

        {/* Download App Section */}
        <div className="mt-6 border-t border-gray-800 pt-6">
          <div className="border border-gray-700 rounded-lg p-6">
            <h4 className="text-gray-400 font-bold text-sm mb-4 flex items-center gap-2">
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs">
                DOWNLOAD APP
              </span>
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/m4capitallogo2.png"
                alt="M4Capital"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <div className="text-white font-semibold">M4Capital</div>
                <div className="text-gray-500 text-sm">Full version, 59 MB</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* AI Bot Help */}
        <a 
          href="https://t.me/m4capital_bot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 mb-4 mt-6 hover:opacity-80 transition-opacity"
        >
          <span className="text-gray-400 text-sm">Got questions?</span>
          <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5">
            <span className="text-white text-sm font-medium">
              AI Bot will help
            </span>
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
        </a>

        {/* Risk Warning */}
        <div className="border border-gray-700 rounded-lg p-6">
          <h4 className="text-orange-500 font-bold text-sm mb-3 flex items-center gap-2">
            <span className="border border-orange-500 px-2 py-0.5 rounded text-xs">
              {t("footer.risk.title")}
            </span>
          </h4>
          <div className="space-y-3 mb-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("footer.risk.text1")}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("footer.risk.text2")}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("footer.risk.text3")}
            </p>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-700 pt-4">
            You are granted limited non-exclusive non-transferable rights to use
            the IP provided on this website for personal and non-commercial
            purposes in relation to the services offered on the Website only.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} M4Capital. {t("footer.copyright").replace(/©.*M4Capital\.\s*/, "")}
          </p>
        </div>
      </div>
    </footer>
  );
}
