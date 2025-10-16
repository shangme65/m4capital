import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Not Found</h2>
        <p className="mb-4">Could not find requested resource</p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
