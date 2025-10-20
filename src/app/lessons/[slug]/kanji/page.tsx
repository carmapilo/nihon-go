import { lessons } from "@/data/lessons";

export default function KanjiPage({ params }: { params: { slug: string } }) {
  const lesson = lessons.find((lesson) => lesson.slug === params.slug);
  return <div>KanjiPage</div>;
}
