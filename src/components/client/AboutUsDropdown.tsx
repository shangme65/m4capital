"use client";
import Link from "next/link";

const AboutUsDropdown = () => {
  return (
    <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-max min-w-[200px] max-w-[90vw]">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl">
        <ul className="space-y-4">
          <li>
            <Link
              href="/in-numbers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 font-semibold"
            >
              In Numbers
            </Link>
          </li>
          <li>
            <Link
              href="/press"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 font-semibold"
            >
              In the Press
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 font-semibold"
            >
              Contact Us
            </Link>
          </li>
          <li>
            <Link
              href="/awards"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 font-semibold"
            >
              Awards
            </Link>
          </li>
          <li>
            <Link
              href="/licenses-and-safeguards"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 font-semibold"
            >
              Licenses and Safeguards
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutUsDropdown;
