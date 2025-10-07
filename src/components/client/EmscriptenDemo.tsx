"use client";

import { useState, useEffect } from "react";

interface EmscriptenModule {
  ccall: (
    name: string,
    returnType: string,
    argTypes: string[],
    args: any[]
  ) => any;
  cwrap: (name: string, returnType: string, argTypes: string[]) => Function;
}

declare global {
  interface Window {
    EmscriptenModule: () => Promise<EmscriptenModule>;
  }
}

export default function EmscriptenDemo() {
  const [module, setModule] = useState<EmscriptenModule | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(10);

  useEffect(() => {
    const loadEmscripten = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load the Emscripten module
        const script = document.createElement("script");
        script.src = "/output.js";
        script.async = true;

        script.onload = async () => {
          try {
            if (window.EmscriptenModule) {
              const moduleInstance = await window.EmscriptenModule();
              setModule(moduleInstance);
              console.log("✅ Emscripten module loaded successfully!");
            } else {
              throw new Error("EmscriptenModule not found on window object");
            }
          } catch (err) {
            console.error("Error initializing Emscripten module:", err);
            setError("Failed to initialize WebAssembly module");
          } finally {
            setLoading(false);
          }
        };

        script.onerror = () => {
          setError("Failed to load Emscripten script");
          setLoading(false);
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (err) {
        console.error("Error loading Emscripten:", err);
        setError("Failed to load WebAssembly module");
        setLoading(false);
      }
    };

    loadEmscripten();
  }, []);

  const calculateSum = () => {
    if (!module) {
      setError("Module not loaded yet");
      return;
    }

    try {
      // Call the C++ add function using ccall
      const sum = module.ccall(
        "add",
        "number",
        ["number", "number"],
        [num1, num2]
      );
      setResult(sum);
      setError(null);
      console.log(`🧮 WebAssembly calculation: ${num1} + ${num2} = ${sum}`);
    } catch (err) {
      console.error("Error calling WebAssembly function:", err);
      setError("Failed to call WebAssembly function");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔧 Loading Emscripten WebAssembly Module...
        </h3>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🚀 Emscripten WebAssembly Demo
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ⚠️ {error}
        </div>
      )}

      {module && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Number:
              </label>
              <input
                type="number"
                value={num1}
                onChange={(e) => setNum1(parseInt(e.target.value) || 0)}
                className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              +
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Second Number:
              </label>
              <input
                type="number"
                value={num2}
                onChange={(e) => setNum2(parseInt(e.target.value) || 0)}
                className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              =
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Result:
              </label>
              <div className="mt-1 block w-20 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 rounded-md text-center font-bold text-green-600">
                {result !== null ? result : "?"}
              </div>
            </div>
          </div>

          <button
            onClick={calculateSum}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            🧮 Calculate with WebAssembly
          </button>

          {result !== null && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ✨ WebAssembly calculated: {num1} + {num2} = {result}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🔬 <strong>Technical Details:</strong> This component loads a
              WebAssembly module compiled from C++ using Emscripten. The
              calculation is performed by native C++ code running in the browser
              at near-native speed!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
