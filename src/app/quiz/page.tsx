import { Brain, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const quizTypes = [
    {
      title: "Hiragana Quiz",
      description: "Test your knowledge of hiragana characters",
      icon: Brain,
      color: "red",
      href: "/quiz/hiragana",
    },
    {
      title: "Katakana Quiz",
      description: "Test your knowledge of katakana characters",
      icon: Brain,
      color: "blue",
      href: "/quiz/katakana",
    },
    {
      title: "Kanji Quiz",
      description: "Test your knowledge of kanji characters",
      icon: GraduationCap,
      color: "purple",
      href: "/quiz/kanji",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Practice Quizzes
            </h1>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-gray-600 text-lg">
            Test your knowledge and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quizTypes.map((quiz) => {
            const Icon = quiz.icon;
            const colorClasses = {
              red: "from-red-500 to-red-600 border-red-200",
              blue: "from-blue-500 to-blue-600 border-blue-200",
              purple: "from-purple-500 to-purple-600 border-purple-200",
            };

            return (
              <Link key={quiz.href} href={quiz.href}>
                <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 p-6 hover:-translate-y-1">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                      colorClasses[quiz.color as keyof typeof colorClasses]
                    } flex items-center justify-center mb-4 shadow-md`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{quiz.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Feature Coming Soon
          </h2>
          <p className="text-gray-600">
            Interactive quizzes will be available in the next update. Stay
            tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
