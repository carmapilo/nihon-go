import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50/20 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200 mb-8">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              Modern Japanese Learning Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Master Japanese with
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {" "}
              NihonGo
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Learn Japanese vocabulary, kanji, and grammar through interactive
            flashcards, AI-powered tutoring, and spaced repetition — all in one
            beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400 font-bold text-lg px-8 py-6"
              asChild
            >
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            Join thousands of learners mastering Japanese • Free to start
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to learn Japanese
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for effective learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-red-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Flashcards
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Learn with spaced repetition algorithm that optimizes your
                review schedule for maximum retention.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-md">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Interactive Quizzes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Test your knowledge of Hiragana, Katakana, and Kanji with
                instant feedback and progress tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-green-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-md">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI Tutor
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant answers to your Japanese questions from an AI tutor
                available 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start your Japanese journey today
          </h2>
          <p className="text-xl text-red-50 mb-8">
            Join our community and begin learning with our proven methods
          </p>
          <Button
            size="lg"
            className="bg-white text-red-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-lg"
            asChild
          >
            <Link href="/dashboard">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
