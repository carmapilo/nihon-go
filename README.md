This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project uses PostgreSQL with Prisma ORM and Supabase. Follow these steps to set up the database:

1. Make sure your Supabase project is set up with the correct connection details.

2. Create a `.env` file in the root directory with your Supabase connection strings:

   ```
   DATABASE_URL="your-supabase-connection-string"
   DIRECT_URL="your-supabase-direct-connection-string"
   ```

3. Run the Prisma migrations to create the database schema:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Add lesson data to the database:
   ```bash
   npm run add-lesson
   ```

## Adding New Lessons

To add new lessons with vocabulary and kanji:

1. Create new data files in `src/data/vocab/` and `src/data/kanji/` following the existing patterns.

2. Update the `lessonData` object in `src/scripts/add-lesson.ts` with your new lesson details and data imports.

3. Run the add-lesson script:
   ```bash
   npm run add-lesson
   ```

## Updating Existing Lessons

If you need to update vocabulary in an existing lesson:

1. Update your vocabulary data file (e.g., `src/data/vocab/lesson1.ts`).

2. Update the `lessonData` object in `src/scripts/update-lesson.ts` with the lesson slug you want to update.

3. Run the update-lesson script:
   ```bash
   npm run update-lesson
   ```

This will replace all vocabulary for the specified lesson with your updated data.

## Managing Vocabulary

The `lib/db.ts` file contains helper functions for managing vocabulary:

- `createLesson`: Create a new lesson
- `addVocabToLesson`: Add vocabulary entries to a lesson
- `deleteVocabEntry`: Delete a specific vocabulary entry by ID
- `deleteAllVocabForLesson`: Delete all vocabulary for a specific lesson
- `findVocabByWord`: Find a vocabulary entry by word (useful for getting IDs)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
