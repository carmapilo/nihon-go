import { notFound } from "next/navigation";
import { lessons } from "@/data/lessons";
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

export default async function VocabPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) {
    return notFound();
  }

  const vocabData = await getVocabByLessonSlug(slug);

  return (
    <div className="flex flex-col gap-4 p-4 h-screen">
      <h1 className="text-4xl font-bold">{lesson.title} Vocabulary</h1>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <Carousel className="w-full">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 mr-4">
                <CarouselPrevious className="bg-white shadow-lg rounded-full p-3 z-10 hover:bg-gray-100 w-16 h-16" />
              </div>

              <div className="flex-grow max-w-2xl">
                <CarouselContent>
                  {vocabData.map((entry: VocabEntry) => (
                    <CarouselItem
                      key={entry.word}
                      className="h-full flex items-center justify-center w-full"
                    >
                      <Card
                        word={entry.word}
                        reading={entry.reading}
                        meaning={entry.meaning}
                        category={entry.category}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>

              <div className="flex-shrink-0 ml-4">
                <CarouselNext className="bg-white shadow-lg rounded-full p-3 z-10 hover:bg-gray-100 w-16 h-16" />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
