import { getLessonBySlug } from "@/lib/db";
import { BookOpen, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

export default async function LessonSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lesson not found
          </h1>
          <Link href="/lessons">
            <Button variant="outline">Back to Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get vocab count from database
  const vocabCount = await prisma.vocabEntry.count({
    where: { lessonId: lesson.id },
  });

  const kanjiCount = await prisma.kanjiEntry.count({
    where: { lessonId: lesson.id },
  });

  if (lesson.locked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <Link href="/lessons">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </Button>
          </Link>

          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-gray-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {lesson.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{lesson.description}</p>
            <p className="text-gray-500">
              Complete previous lessons to unlock this content
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <Link href="/lessons">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Lessons
          </Button>
        </Link>

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {lesson.number}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {lesson.title}
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {lesson.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Vocabulary Section */}
          <Link href={`/lessons/${slug}/vocab`}>
            <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 shadow-sm hover:shadow-lg transition-all duration-300 p-6 sm:p-8 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Vocabulary
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Learn {vocabCount} vocabulary words and expressions
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {vocabCount} words
                </span>
                <span className="text-red-600 font-medium group-hover:translate-x-1 transition-transform">
                  Start →
                </span>
              </div>
            </div>
          </Link>

          {/* Kanji Section */}
          {kanjiCount > 0 ? (
            <Link href={`/lessons/${slug}/kanji`}>
              <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all duration-300 p-6 sm:p-8 group hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white font-bold">漢</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Kanji
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Study {kanjiCount} kanji characters and their meanings
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {kanjiCount} characters
                  </span>
                  <span className="text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                    Start →
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 sm:p-8 opacity-60">
              <div className="w-14 h-14 rounded-xl bg-gray-300 flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-500 font-bold">漢</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Kanji
              </h3>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                No kanji characters for this lesson
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
