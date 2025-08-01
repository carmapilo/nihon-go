import { PrismaClient } from "@prisma/client";
import { lessons } from "@/data/lessons";
import { createLesson, addVocabToLesson } from "@/lib/db";

// Import your vocab data files
import lesson1Vocab from "@/data/vocab/lesson1";
// Add imports for other lesson vocab files as needed

const prisma = new PrismaClient();

/**
 * Delete a lesson by slug
 * This will cascade delete all associated vocab and kanji entries
 */
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

// Choose which operation to run
async function main() {
  // Uncomment the operation you want to run

  // Delete a specific lesson
  await deleteLesson("lesson-1");

  // Add all lessons from static data
  // await addAllLessons();

  await prisma.$disconnect();
}

// Run the script
main();
