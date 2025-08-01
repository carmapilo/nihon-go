-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabEntry" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "VocabEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiEntry" (
    "id" TEXT NOT NULL,
    "kanji" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "onyomi" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kunyomi" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "KanjiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- AddForeignKey
ALTER TABLE "VocabEntry" ADD CONSTRAINT "VocabEntry_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiEntry" ADD CONSTRAINT "KanjiEntry_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
