import { PrismaClient } from "@prisma/client";
import { createLesson, addVocabToLesson, addKanjiToLesson } from "@/lib/db";
import { lesson2Vocab } from "@/data/vocab/lesson2";
import { VocabEntry } from "@/types/lessonTypes";

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

// Lesson data configuration - change this to add different lessons
const lessonData = {
  title: "Lesson 2", // Change to the lesson you want to add
  slug: "lesson2",
  description: "Shopping",
  number: 2,
  locked: false, // Set to false to make it available immediately
  vocabData: lesson2Vocab, // lesson2Vocab doesn't have order properties, they'll be auto-assigned
  // kanjiData: lesson2Kanji, // Uncomment when you have kanji data
};

/**
 * Ensures all vocabulary entries have an order number
 * If an entry doesn't have an order, it will be assigned one automatically
 */
function ensureVocabOrder(vocabEntries: VocabEntry[]): VocabEntry[] {
  return vocabEntries.map((entry, index) => {
    if (entry.order === undefined) {
      return { ...entry, order: index + 1 };
    }
    return entry;
  });
}

/**
 * Deletes a lesson and all its associated vocabulary and kanji entries
 */
async function deleteExistingLesson(
  prisma: PrismaClient,
  slug: string
): Promise<void> {
  try {
    // Find the lesson first
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
    });

    if (!lesson) {
      console.log(
        `No existing lesson with slug "${slug}" found. Creating new lesson.`
      );
      return;
    }

    // Delete the lesson (this will cascade delete vocab and kanji if you have cascade set in your schema)
    await prisma.lesson.delete({
      where: { id: lesson.id },
    });

    console.log(`Deleted existing lesson: ${lesson.title} with slug "${slug}"`);
  } catch (error) {
    console.error(`Error deleting existing lesson with slug "${slug}":`, error);
    throw error; // Re-throw to handle in the main function
  }
}

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check for and delete existing lesson with the same slug
    await deleteExistingLesson(prisma, lessonData.slug);

    // Create the lesson
    const newLesson = await createLesson(
      lessonData.title,
      lessonData.slug,
      lessonData.description,
      lessonData.locked,
      lessonData.number
    );

    console.log(`Created lesson: ${newLesson.title} with ID: ${newLesson.id}`);

    // Add vocabulary to the lesson
    if (lessonData.vocabData && lessonData.vocabData.length > 0) {
      // Ensure all vocab entries have an order number
      const orderedVocabData = ensureVocabOrder(lessonData.vocabData);
      await addVocabToLesson(newLesson.id, orderedVocabData);
      console.log(
        `Added ${orderedVocabData.length} vocabulary entries to ${newLesson.title}`
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
    await prisma.$disconnect();
  }
}

// Execute the script
main();
