import { Lesson } from "@/types/lessonTypes";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SectionBlock({
  lesson,
  name,
  url,
}: {
  lesson: Lesson;
  name: string;
  url: string;
}) {
  return (
    <div className="flex flex-col gap-4 bg-white shadow-md rounded-lg p-4 outline outline-gray-200 w-full h-full justify-center items-center">
      <h1 className="text-2xl font-bold">{name}</h1>
      <Button
        asChild
        className="w-full font-bold bg-red-600 hover:bg-red-700 text-white"
      >
        <Link href={`/lessons/${lesson.slug}/${url}`}>Start Practice</Link>
      </Button>
    </div>
  );
}
