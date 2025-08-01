import { PrismaClient } from "@prisma/client";
import { lesson1Vocab } from "@/data/vocab/lesson1";

/**
 * Script to update an existing lesson's vocabulary
 *
 * Usage:
 * 1. Update your vocabulary data file (e.g., lesson1.ts)
 * 2. Update the lessonData object with the lesson slug you want to update
 * 3. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' src/scripts/update-lesson.ts
 */

// Lesson data configuration - change this to update different lessons
const lessonData = {
  slug: "lesson1",
  vocabData: lesson1Vocab,
  // kanjiData: lesson1Kanji, // Uncomment when you have kanji data
};

const prisma = new PrismaClient();

async function updateLesson() {
  try {
    // Get the lesson by slug
    const lesson = await prisma.lesson.findUnique({
      where: { slug: lessonData.slug },
    });

    if (!lesson) {
      console.error(`Lesson with slug "${lessonData.slug}" not found`);
      return;
    }

    // Update vocabulary
    if (lessonData.vocabData && lessonData.vocabData.length > 0) {
      // Delete all existing vocab for this lesson
      await prisma.vocabEntry.deleteMany({
        where: { lessonId: lesson.id },
      });

      // Add the updated vocab
      for (const vocab of lessonData.vocabData) {
        await prisma.vocabEntry.create({
          data: {
            word: vocab.word,
            reading: vocab.reading,
            definition: vocab.meaning,
            type: vocab.type,
            lessonId: lesson.id,
            order: vocab.order,
          },
        });
      }

      console.log(
        `Updated ${lessonData.vocabData.length} vocabulary entries for "${lesson.title}"`
      );
    }

    // Update kanji (when available)
    // if (lessonData.kanjiData && lessonData.kanjiData.length > 0) {
    //   // Delete all existing kanji for this lesson
    //   await prisma.kanjiEntry.deleteMany({
    //     where: { lessonId: lesson.id }
    //   })
    //
    //   // Add the updated kanji
    //   for (const kanji of lessonData.kanjiData) {
    //     await prisma.kanjiEntry.create({
    //       data: {
    //         kanji: kanji.kanji,
    //         definition: kanji.meaning,
    //         onyomi: kanji.onyomi || [],
    //         kunyomi: kanji.kunyomi || [],
    //         lessonId: lesson.id
    //       }
    //     })
    //   }
    //
    //   console.log(`Updated ${lessonData.kanjiData.length} kanji entries for "${lesson.title}"`)
    // }

    console.log("Lesson update completed successfully");
  } catch (error) {
    console.error("Error updating lesson:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
updateLesson();
