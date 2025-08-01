import { PrismaClient } from "@prisma/client";
import { createLesson, addVocabToLesson, addKanjiToLesson } from "@/lib/db";
import { lesson1Vocab } from "@/data/vocab/lesson1";

/**
 * Script to add lessons with vocabulary and kanji to the database
 *
 * Usage:
 * 1. Import your vocab and kanji data
 * 2. Update the lessonData object with your lesson details
 * 3. Run with: npm run add-lesson
 *
 * To add a new lesson:
 * 1. Create a new data file (e.g., lesson2.ts) following the same structure as lesson1.ts
 * 2. Import the new data file
 * 3. Update the lessonData object with the new lesson details
 * 4. Run the script again
 */

// Lesson data configuration
const lessonData = {
  title: "Lesson 1",
  slug: "lesson1",
  description: "New friends: greetings, self-introduction, family",
  locked: false, // Set to false to make it available immediately
  vocabData: lesson1Vocab,
  // kanjiData: lesson1Kanji, // Uncomment when you have kanji data
};

async function main() {
  try {
    // Create the lesson
    const newLesson = await createLesson(
      lessonData.title,
      lessonData.slug,
      lessonData.description,
      lessonData.locked
    );

    console.log(`Created lesson: ${newLesson.title} with ID: ${newLesson.id}`);

    // Add vocabulary to the lesson
    if (lessonData.vocabData && lessonData.vocabData.length > 0) {
      await addVocabToLesson(newLesson.id, lessonData.vocabData);
      console.log(
        `Added ${lessonData.vocabData.length} vocabulary entries to ${newLesson.title}`
      );
    }

    // Add kanji to the lesson (when available)
    // if (lessonData.kanjiData && lessonData.kanjiData.length > 0) {
    //   await addKanjiToLesson(newLesson.id, lessonData.kanjiData)
    //   console.log(`Added ${lessonData.kanjiData.length} kanji entries to ${newLesson.title}`)
    // }

    console.log("Lesson creation completed successfully");
  } catch (error) {
    console.error("Error adding lesson:", error);
  } finally {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  }
}

// Execute the script
main();
