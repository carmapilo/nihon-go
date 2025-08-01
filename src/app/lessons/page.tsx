import LessonBlock from "../components/lessons/LessonBlock";
import { getLessons } from "@/lib/db";

export default async function Lessons() {
  const lessons = await getLessons();
  return (
    <div className="container mx-auto px-8 py-4">
      <h1 className="text-2xl font-bold mb-4">Lessons</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => {
          return <LessonBlock key={lesson.slug} lesson={lesson} />;
        })}
      </div>
    </div>
  );
}
