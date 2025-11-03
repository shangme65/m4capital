"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        <div className="bg-gray-50 py-12 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact M4 Capital
            </h1>
            <p className="text-lg text-gray-600">
              Get in touch with us for any inquiries or support
            </p>
          </div>
        </div>

        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  SKY LADDER LLC
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>Registration No. ILLC 004</p>
                  <p className="mt-4">
                    <span className="font-semibold">Address:</span> The Colony
                    House, 41 Nevis Street, Saint John's, Antigua and Barbuda
                  </p>
                  <p className="mt-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <a
                      href="mailto:support@m4capital.com"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      support@m4capital.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-gray-600 mb-2">
                  Payment transactions are managed by:
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  FIDELES LIMITED
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>Registration No. HE 406368</p>
                  <p className="mt-4">
                    <span className="font-semibold">Address:</span> Kyriakou
                    Matsi & Anexartisias 3, ROUSSOS LIMASSOL TOWER, 4th Floor,
                    3040 Limassol, Cyprus
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-gray-600 mb-2">
                  The domain and all rights belong to:
                </p>
                <h3 className="text-xl font-bold text-gray-900">
                  SKY LADDER LLC
                </h3>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Find us on social media
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Need Assistance Section */}
        <div className="bg-white border-t py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Need assistance?
                </h3>
                <p className="text-gray-600">
                  We are always happy to help! Send us an email{" "}
                  <a
                    href="mailto:support@iqoption.com"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    support@iqoption.com
                  </a>
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="pt-8 border-t">
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                <img
                  src="/api/placeholder/100/40"
                  alt="Skrill"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/100/40"
                  alt="Volet"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/100/40"
                  alt="Neteller"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/80/40"
                  alt="Mastercard"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/100/40"
                  alt="Wire Transfer"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/80/40"
                  alt="Visa"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/100/40"
                  alt="USD Coin"
                  className="h-8 object-contain grayscale"
                />
                <img
                  src="/api/placeholder/100/40"
                  alt="Visa Mastercard"
                  className="h-8 object-contain grayscale"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
