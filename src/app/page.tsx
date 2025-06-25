import Image from "next/image";
import Header from "./components/MainHeader";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div>
          <h1 className="text-4xl font-bold mb-8">
            Welcome to Nihon-Go with Zen Maru Gothic Font
          </h1>
          <p className="text-xl mb-4">
            This text should be using the Zen Maru Gothic font
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <div className="border rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">Regular Text</h2>
              <p>This is regular text with the new font.</p>
            </div>
            <div className="border rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">Mono Text</h2>
              <pre className="bg-gray-100 p-3 rounded">
                <code>// This should use the mono font</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
