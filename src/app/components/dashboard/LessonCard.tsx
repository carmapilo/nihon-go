"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Lock, Check, Clock } from "lucide-react";
import Link from "next/link";

interface LessonCardProps {
  lesson: {
    title: string;
    slug: string;
    description: string;
    number: number;
    locked?: boolean;
  };
  progress?: {
    completed: number;
    total: number;
    dueForReview: number;
  };
}

export default function LessonCard({ lesson, progress }: LessonCardProps) {
  const isLocked = lesson.locked ?? false;
  const progressPercentage = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div
      className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        isLocked
          ? "border-gray-200 opacity-60"
          : "border-gray-200 hover:border-red-300 hover:-translate-y-1"
      }`}
    >
      {/* Header with lesson number */}
      <div
        className={`px-6 py-4 border-b ${
          isLocked ? "bg-gray-50" : "bg-gradient-to-r from-red-50 to-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                isLocked
                  ? "bg-gray-200 text-gray-500"
                  : "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md"
              }`}
            >
              {lesson.number}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-500">Lesson {lesson.number}</p>
            </div>
          </div>
          {isLocked ? (
            <Lock className="w-5 h-5 text-gray-400" />
          ) : progress && progressPercentage === 100 ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {lesson.description}
        </p>

        {/* Progress Bar */}
        {!isLocked && progress && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">
                Progress
              </span>
              <span className="text-xs font-bold text-red-600">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        {!isLocked && progress && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Vocabulary</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {progress.completed}/{progress.total}
              </p>
            </div>
            {progress.dueForReview > 0 && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-600">Due Today</span>
                </div>
                <p className="text-lg font-bold text-red-600 mt-1">
                  {progress.dueForReview}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          className={`w-full font-bold ${
            isLocked
              ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
              : progress && progress.dueForReview > 0
              ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
              : "bg-gray-900 hover:bg-gray-800 text-white"
          }`}
          disabled={isLocked}
          asChild={!isLocked}
        >
          {isLocked ? (
            <span>Locked</span>
          ) : progress && progress.dueForReview > 0 ? (
            <Link href={`/lessons/${lesson.slug}/review`}>Review Now</Link>
          ) : (
            <Link href={`/lessons/${lesson.slug}`}>
              {progress && progressPercentage > 0 ? "Continue" : "Start Lesson"}
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
