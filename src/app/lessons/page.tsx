import { getLessons } from "@/lib/db";
import LessonCard from "../components/dashboard/LessonCard";
import { Clock } from "lucide-react";
import prisma from "@/lib/db";

export default async function Lessons() {
  const lessons = await getLessons();

  // Get vocab counts for each lesson from database
  const lessonsWithCounts = await Promise.all(
    lessons.map(async (lesson) => {
      const vocabCount = await prisma.vocabEntry.count({
        where: { lessonId: lesson.id },
      });

      return {
        ...lesson,
        vocabCount,
      };
    })
  );

  const totalVocab = lessonsWithCounts.reduce(
    (acc, lesson) => acc + lesson.vocabCount,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Your Lessons
            </h1>
            <p className="text-gray-600 text-lg">
              Choose a lesson to begin your study session
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-200">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              {totalVocab} vocabulary words
            </span>
          </div>
        </div>

        {lessonsWithCounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No lessons available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonsWithCounts.map((lesson) => {
              // Calculate progress based on actual database data
              const progress =
                lesson.vocabCount > 0
                  ? {
                      completed: Math.floor(
                        (lesson.progress * lesson.vocabCount) / 100
                      ),
                      total: lesson.vocabCount,
                      dueForReview: 0, // Will be calculated with SRS implementation
                    }
                  : undefined;

              return (
                <LessonCard
                  key={lesson.slug}
                  lesson={lesson}
                  progress={progress}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
