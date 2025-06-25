import { lessons } from "@/data/lessons";
import SectionBlock from "@/app/components/lessons/SectionBlock";

export default function LessonSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const lesson = lessons.find((lesson) => lesson.slug === slug);
  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  if (lesson.locked) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-4xl font-bold">{lesson.title}</h1>
        <p className="text-lg text-gray-500">{lesson.description}</p>
        <p className="text-lg text-gray-500">Lesson is locked</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">{lesson.title}</h1>
        <p className="text-lg text-gray-500">{lesson.description}</p>
      </div>
      <div className="flex gap-4 w-full h-full justify-between items-center">
        <SectionBlock lesson={lesson} name="Vocabulary" url="vocab" />
        {lesson.hasKanji ? (
          <SectionBlock lesson={lesson} name="Kanji" url="kanji" />
        ) : slug === "lesson1" ? (
          <SectionBlock lesson={lesson} name="Hiragana" url="hiragana" />
        ) : (
          <SectionBlock lesson={lesson} name="Katakana" url="katakana" />
        )}
      </div>
    </div>
  );
}
