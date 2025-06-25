"use client";

import { Lesson } from "@/types/lessonTypes";
import { LockSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LessonBlock({ lesson }: { lesson: Lesson }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 outline outline-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{lesson.title}</h1>
        {lesson.locked && <LockSimple size={20} className="text-gray-500" />}
      </div>
      <p className="text-sm text-gray-500 mb-2">{lesson.description}</p>
      <Button
        className="w-full font-bold bg-red-600 hover:bg-red-700 text-white "
        asChild
      >
        <Link href={`/lessons/${lesson.slug}`}>Start Lesson</Link>
      </Button>
    </div>
  );
}
