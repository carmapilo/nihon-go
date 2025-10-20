import { GraduationCap, Sparkles } from "lucide-react";

export default function KanjiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Kanji Study
            </h1>
            <span className="text-2xl">漢字</span>
          </div>
          <p className="text-gray-600 text-lg">
            Master Japanese kanji characters
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-md">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Kanji Learning Coming Soon
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Comprehensive kanji lessons with stroke order, readings, and example
            words will be available soon.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-8 text-left">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-bold text-gray-900 mb-1">Stroke Order</h4>
              <p className="text-sm text-gray-600">
                Learn proper stroke order with animations
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-bold text-gray-900 mb-1">Readings</h4>
              <p className="text-sm text-gray-600">
                Master on'yomi and kun'yomi readings
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-bold text-gray-900 mb-1">Vocabulary</h4>
              <p className="text-sm text-gray-600">
                See kanji used in real vocabulary
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
