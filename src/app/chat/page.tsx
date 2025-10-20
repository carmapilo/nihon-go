import {
  MessageSquare,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

export default function ChatPage() {
  const quickPrompts = [
    {
      icon: BookOpen,
      text: "Explain the difference between は and が",
      color: "red",
    },
    {
      icon: HelpCircle,
      text: "How do I say 'I want to...' in Japanese?",
      color: "blue",
    },
    {
      icon: Lightbulb,
      text: "What's the difference between です and だ?",
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              AI Japanese Tutor
            </h1>
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-gray-600 text-lg">
            Get instant answers to your Japanese learning questions
          </p>
        </div>

        {/* Chat Interface Preview */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Tutor</h3>
                <p className="text-red-100 text-sm">Always here to help</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 min-h-[400px] flex flex-col justify-center">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI Tutor Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                Chat with your personal AI Japanese tutor for instant help with
                grammar, vocabulary, and cultural questions.
              </p>

              {/* Quick Prompts Preview */}
              <div className="space-y-3 max-w-md mx-auto">
                <p className="text-sm font-medium text-gray-500 mb-4">
                  Quick prompt examples:
                </p>
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-left flex items-start gap-3"
                    >
                      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 text-sm">{prompt.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Type your question here..."
                disabled
                className="flex-1 outline-none text-gray-400 cursor-not-allowed"
              />
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-bold text-gray-900 mb-1">Grammar Help</h4>
            <p className="text-sm text-gray-600">
              Get explanations for complex grammar patterns
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-bold text-gray-900 mb-1">Vocabulary Usage</h4>
            <p className="text-sm text-gray-600">
              Learn how to use words in context
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-bold text-gray-900 mb-1">Cultural Context</h4>
            <p className="text-sm text-gray-600">
              Understand Japanese culture and customs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
