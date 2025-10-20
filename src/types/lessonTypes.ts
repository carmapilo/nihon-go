export interface Lesson {
  title: string;
  slug: string;
  description: string;
  locked: boolean;
  completed: boolean;
  progress: number;
}

export interface Section {
  lesson: Lesson;
  name: string;
  url: string;
}

export interface VocabEntry {
  word: string;
  reading: string;
  meaning: string;
  type: string;
  category?: string;
  order?: number; // Made optional so it can be automatically assigned
}

export interface KanjiEntry {
  kanji: string;
  meaning: string;
}
