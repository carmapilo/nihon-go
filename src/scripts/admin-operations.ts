import { PrismaClient } from "@prisma/client";
import { lessons } from "@/data/lessons";
import { createLesson, addVocabToLesson } from "@/lib/db";

// Import your vocab data files
import { lesson1Vocab } from "@/data/vocab/lesson1";
// Add imports for other lesson vocab files as needed

const prisma = new PrismaClient();

/**
 * Delete a lesson by slug
 * This will cascade delete all associated vocab and kanji entries
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteLesson(slug: string) {
  try {
    // Find the lesson first
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
    });

    if (!lesson) {
      console.log(`Lesson with slug "${slug}" not found`);
      return;
    }

    // Delete the lesson (this will cascade delete vocab and kanji if you have cascade set in your schema)
    await prisma.lesson.delete({
      where: { id: lesson.id },
    });

    console.log(`Deleted lesson: ${lesson.title}`);
  } catch (error) {
    console.error("Error deleting lesson:", error);
  }
}

/**
 * Add all lessons from the static data file
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addAllLessons() {
  try {
    for (const lessonData of lessons) {
      // Create the lesson
      const lesson = await createLesson(
        lessonData.title,
        lessonData.slug,
        lessonData.description,
        lessonData.locked
      );

      console.log(`Created lesson: ${lesson.title}`);

      // Add vocab based on the lesson slug
      // This assumes your vocab files match the lesson slugs
      let vocabData;

      try {
        // You might need to adjust this based on how your imports work
        switch (lessonData.slug) {
          case "lesson1":
            vocabData = lesson1Vocab;
            break;
          // Add cases for other lessons
          // case 'lesson2':
          //   vocabData = lesson2Vocab;
          //   break;
          default:
            console.log(`No vocab data found for ${lessonData.slug}`);
            continue;
        }

        if (vocabData && vocabData.length > 0) {
          await addVocabToLesson(lesson.id, vocabData);
          console.log(
            `Added ${vocabData.length} vocabulary entries to ${lesson.title}`
          );
        }
      } catch (error) {
        console.error(`Error adding vocab for ${lessonData.slug}:`, error);
      }
    }

    console.log("All lessons added successfully");
  } catch (error) {
    console.error("Error adding lessons:", error);
  }
}

/**
 * Update the order numbers for all vocabulary entries in a lesson
 * This will automatically assign sequential order numbers (1, 2, 3, etc.)
 * based on the current order in the database
 */
async function updateVocabOrder(slug: string) {
  try {
    // Find the lesson first
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
    });

    if (!lesson) {
      console.log(`Lesson with slug "${slug}" not found`);
      return;
    }

    // Get all vocab entries for this lesson
    const vocabEntries = await prisma.vocabEntry.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: "asc" }, // Order by existing order field
    });

    console.log(
      `Found ${vocabEntries.length} vocabulary entries for lesson "${lesson.title}"`
    );

    // Update each entry with a new sequential order number
    for (let i = 0; i < vocabEntries.length; i++) {
      const entry = vocabEntries[i];
      const newOrder = i + 1;

      if (entry.order !== newOrder) {
        await prisma.vocabEntry.update({
          where: { id: entry.id },
          data: { order: newOrder },
        });
        console.log(
          `Updated order for "${entry.word}" from ${entry.order} to ${newOrder}`
        );
      }
    }

    console.log(
      `Successfully updated order numbers for all vocabulary in lesson "${lesson.title}"`
    );
  } catch (error) {
    console.error("Error updating vocabulary order:", error);
  }
}

// Choose which operation to run
async function main() {
  // Uncomment the operation you want to run

  // Delete a specific lesson
  // await deleteLesson("lesson-1");

  // Add all lessons from static data
  // await addAllLessons();

  // Update vocabulary order numbers for a specific lesson
  await updateVocabOrder("lesson1");

  await prisma.$disconnect();
}

// Run the script
main();
