import { lessons } from "@/data/lessons";

export default function KatakanaPage({
  params,
}: {
  params: { slug: string; section: string };
}) {
  const lesson = lessons.find((lesson) => lesson.slug === params.slug);
  return <div>KatakanaPage</div>;
}
