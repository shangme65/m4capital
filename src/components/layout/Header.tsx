import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-transparent text-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="m4capital Logo" width={40} height={40} />
          <span className="ml-3 text-2xl font-bold">m4capital</span>
        </Link>
        <div className="space-x-6 hidden md:flex">
          <Link
            href="#features"
            className="hover:text-indigo-300 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="hover:text-indigo-300 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-indigo-300 transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/login"
            className="hover:text-indigo-300 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
