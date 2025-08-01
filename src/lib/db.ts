import { PrismaClient } from "@prisma/client";
import { VocabEntry as VocabEntryType } from "@/types/lessonTypes";

const prisma = new PrismaClient();

export async function createLesson(
  title: string,
  slug: string,
  description: string,
  locked: boolean = true
) {
  return prisma.lesson.create({
    data: {
      title,
      slug,
      description,
      locked,
    },
  });
}

export async function addVocabToLesson(
  lessonId: string,
  vocabEntries: VocabEntryType[]
) {
  // Add order automatically if not provided
  const entriesWithOrder = vocabEntries.map((entry, index) => ({
    ...entry,
    order: entry.order !== undefined ? entry.order : index + 1,
  }));
  const createPromises = entriesWithOrder.map((entry) => {
    return prisma.vocabEntry.create({
      data: {
        word: entry.word,
        reading: entry.reading,
        definition: entry.meaning,
        type: entry.type,
        lessonId,
        order: entry.order,
      },
    });
  });

  return Promise.all(createPromises);
}

export async function addKanjiToLesson(lessonId: string, kanjiEntries: any[]) {
  const createPromises = kanjiEntries.map((entry) => {
    return prisma.kanjiEntry.create({
      data: {
        kanji: entry.kanji,
        definition: entry.definition,
        onyomi: entry.onyomi,
        kunyomi: entry.kunyomi,
        lessonId,
      },
    });
  });

  return Promise.all(createPromises);
}

// Delete a specific vocab entry by ID
export async function deleteVocabEntry(id: string) {
  return prisma.vocabEntry.delete({
    where: { id },
  });
}

// Delete all vocab for a specific lesson
export async function deleteAllVocabForLesson(lessonId: string) {
  return prisma.vocabEntry.deleteMany({
    where: { lessonId },
  });
}

// Find vocab by word to get its ID
export async function findVocabByWord(word: string) {
  return prisma.vocabEntry.findFirst({
    where: { word },
  });
}

/**
 * Get vocabulary entries for a lesson by its slug
 * @param slug The lesson slug
 * @returns Array of vocabulary entries formatted for the frontend
 */
export async function getVocabByLessonSlug(slug: string) {
  try {
    // First find the lesson by its slug
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
    });

    if (!lesson) {
      console.error(`Lesson with slug "${slug}" not found`);
      return [];
    }

    // Then get all vocabulary entries for that lesson, ordered by the order field
    const vocabEntries = await prisma.vocabEntry.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: "asc" },
    });

    // Transform the data to match the VocabEntry type expected by the frontend
    return vocabEntries.map((entry) => ({
      word: entry.word,
      reading: entry.reading,
      meaning: entry.definition,
      type: entry.type as "noun" | "verb",
      category: entry.type, // Using type as category since we don't have category in the database
      order: entry.order,
    }));
  } catch (error) {
    console.error("Error fetching vocabulary:", error);
    return [];
  }
}

export async function getLessons() {
  return prisma.lesson.findMany();
}

export async function getLessonBySlug(slug: string) {
  return prisma.lesson.findUnique({
    where: { slug },
  });
}

export default prisma;
