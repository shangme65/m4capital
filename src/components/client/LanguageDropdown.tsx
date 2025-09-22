"use client";

const LanguageDropdown = () => {
  return (
    <div className="absolute top-full right-0 w-48 bg-gray-800 text-white p-4 rounded-b-lg shadow-lg">
      <ul className="space-y-2">
        <li>
          <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
            English
          </a>
        </li>
        <li>
          <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Español
          </a>
        </li>
        <li>
          <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Français
          </a>
        </li>
        <li>
          <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Deutsch
          </a>
        </li>
        <li>
          <a href="#" className="block px-4 py-2 hover:bg-gray-700 rounded">
            Português
          </a>
        </li>
      </ul>
    </div>
  );
};

export default LanguageDropdown;
