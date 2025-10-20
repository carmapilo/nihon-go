export default function Card({
  word,
  reading,
  meaning,
  category,
}: {
  word: string;
  reading: string;
  meaning: string;
  category: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 bg-white shadow-lg rounded-xl sm:rounded-2xl p-6 sm:p-10 md:p-12 border-2 border-gray-200 w-full max-w-[90vw] sm:max-w-lg min-h-[350px] sm:min-h-[400px] justify-center items-center hover:border-red-200 transition-colors mx-auto">
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2 sm:mb-4 break-words">
          {word}
        </h1>
        <p className="text-xl sm:text-2xl text-red-600 font-medium break-words">
          {reading}
        </p>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

      <div className="text-center space-y-2 sm:space-y-3">
        <p className="text-lg sm:text-xl md:text-2xl text-gray-800 font-medium leading-relaxed break-words px-2">
          {meaning}
        </p>
        <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-50 to-white border border-red-200 text-red-600 rounded-full text-xs sm:text-sm font-medium">
          {category}
        </span>
      </div>
    </div>
  );
}
