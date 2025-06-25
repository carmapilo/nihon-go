export interface Lesson {
  title: string;
  slug: string;
  description: string;
  locked: boolean;
  hasKanji: boolean;
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
  type: "noun" | "verb";
  category: string;
}

export interface KanjiEntry {
  kanji: string;
  meaning: string;
}
