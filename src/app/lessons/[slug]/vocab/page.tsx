import { notFound } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Card from "@/app/components/lessons/Card";
import { getLessonBySlug, getVocabByLessonSlug } from "@/lib/db";
import { VocabEntry } from "@/types/lessonTypes";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VocabPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) {
    return notFound();
  }

  const vocabData = await getVocabByLessonSlug(slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <Link href={`/lessons/${slug}`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Lesson
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 text-center sm:text-left">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {lesson.title} - Vocabulary
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {vocabData.length} words to learn
            </p>
          </div>
        </div>

        {vocabData.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <p className="text-gray-500 text-base sm:text-lg">
              No vocabulary words available for this lesson yet.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 sm:py-8">
            <div className="w-full max-w-4xl">
              <Carousel className="w-full">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {/* Previous Button - Hidden on small mobile, visible on larger screens */}
                  <div className="hidden sm:block flex-shrink-0">
                    <CarouselPrevious className="bg-white shadow-lg rounded-full p-4 z-10 hover:bg-red-50 hover:border-red-300 border-2 w-16 h-16 sm:w-20 sm:h-20 transition-colors" />
                  </div>

                  <div className="flex-1 max-w-2xl px-2 sm:px-0">
                    <CarouselContent>
                      {vocabData.map((entry: VocabEntry, index: number) => (
                        <CarouselItem
                          key={entry.word}
                          className="flex items-center justify-center"
                        >
                          <div className="w-full flex flex-col items-center">
                            <div className="text-center mb-3 sm:mb-4">
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                {index + 1} / {vocabData.length}
                              </span>
                            </div>
                            <Card
                              word={entry.word}
                              reading={entry.reading}
                              meaning={entry.meaning}
                              category={entry.category}
                            />

                            {/* Mobile Navigation Buttons */}
                            <div className="flex sm:hidden gap-4 mt-6 w-full justify-center">
                              <CarouselPrevious className="relative left-0 translate-x-0 translate-y-0 bg-white shadow-lg rounded-full p-4 hover:bg-red-50 hover:border-red-300 border-2 w-16 h-16 transition-colors" />
                              <CarouselNext className="relative right-0 translate-x-0 translate-y-0 bg-white shadow-lg rounded-full p-4 hover:bg-red-50 hover:border-red-300 border-2 w-16 h-16 transition-colors" />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </div>

                  {/* Next Button - Hidden on small mobile, visible on larger screens */}
                  <div className="hidden sm:block flex-shrink-0">
                    <CarouselNext className="bg-white shadow-lg rounded-full p-4 z-10 hover:bg-red-50 hover:border-red-300 border-2 w-16 h-16 sm:w-20 sm:h-20 transition-colors" />
                  </div>
                </div>
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
