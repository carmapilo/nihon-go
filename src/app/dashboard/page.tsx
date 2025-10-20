import {
  BookOpen,
  Brain,
  Clock,
  Flame,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import LessonCard from "../components/dashboard/LessonCard";
import QuickAccessCard from "../components/dashboard/QuickAccessCard";

// Mock data - will be replaced with real data later
const mockLessons = [
  {
    title: "New Friends",
    slug: "lesson-1",
    description:
      "Greetings and self-introduction. Learn how to introduce yourself and make new friends in Japanese.",
    number: 1,
    locked: false,
  },
  {
    title: "Shopping",
    slug: "lesson-2",
    description:
      "Shopping expressions and numbers. Master the art of shopping and counting in Japanese.",
    number: 2,
    locked: false,
  },
  {
    title: "Making a Date",
    slug: "lesson-3",
    description:
      "Describing activities and time. Learn how to talk about activities and schedule dates.",
    number: 3,
    locked: false,
  },
  {
    title: "The First Date",
    slug: "lesson-4",
    description:
      "Talking about daily activities. Discuss your daily routines and hobbies.",
    number: 4,
    locked: true,
  },
  {
    title: "A Trip to Okinawa",
    slug: "lesson-5",
    description:
      "Travel and adjectives. Learn travel vocabulary and how to describe places.",
    number: 5,
    locked: true,
  },
  {
    title: "A Day in Robert's Life",
    slug: "lesson-6",
    description:
      "Daily routines and te-form verbs. Express sequences of actions.",
    number: 6,
    locked: true,
  },
];

const mockProgress = {
  "lesson-1": {
    completed: 45,
    total: 50,
    dueForReview: 12,
  },
  "lesson-2": {
    completed: 28,
    total: 50,
    dueForReview: 5,
  },
  "lesson-3": {
    completed: 10,
    total: 50,
    dueForReview: 0,
  },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Welcome back, Alex!
            </h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-gray-600 text-lg">
            Ready to continue your Japanese learning journey?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatsCard
            title="Daily Streak"
            value="7"
            icon={Flame}
            description="days in a row"
            trend={{ value: 12, isPositive: true }}
            color="red"
          />
          <StatsCard
            title="Words Learned"
            value="83"
            icon={BookOpen}
            description="vocabulary mastered"
            color="blue"
          />
          <StatsCard
            title="Study Time"
            value="2.5h"
            icon={Clock}
            description="this week"
            color="purple"
          />
        </div>

        {/* Quick Access Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            <span className="text-xl">⚡</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAccessCard
              title="Practice Hiragana"
              description="Test your hiragana knowledge with interactive quizzes"
              icon={Brain}
              href="/quiz/hiragana"
              color="red"
            />
            <QuickAccessCard
              title="Practice Katakana"
              description="Master katakana characters through practice"
              icon={Brain}
              href="/quiz/katakana"
              color="blue"
            />
            <QuickAccessCard
              title="AI Tutor"
              description="Chat with your personal AI Japanese tutor"
              icon={MessageSquare}
              href="/chat"
              color="green"
            />
            <QuickAccessCard
              title="Kanji Study"
              description="Learn and practice kanji characters"
              icon={GraduationCap}
              href="/kanji"
              color="purple"
            />
          </div>
        </div>

        {/* Lessons Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">Your Lessons</h2>
              <span className="text-xl">📚</span>
            </div>
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                17 cards due today
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLessons.map((lesson) => (
              <LessonCard
                key={lesson.slug}
                lesson={lesson}
                progress={
                  mockProgress[lesson.slug as keyof typeof mockProgress]
                }
              />
            ))}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-2xl px-8 py-6 shadow-sm">
            <p className="text-gray-700 text-lg font-medium mb-2">
              "The journey of a thousand miles begins with a single step"
            </p>
            <p className="text-gray-500 text-sm">
              千里の道も一歩から (Senri no michi mo ippo kara)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
