import { lessons } from "@/data/lessons";

export default function HiraganaPage({
  params,
}: {
  params: { slug: string; section: string };
}) {
  const lesson = lessons.find((lesson) => lesson.slug === params.slug);
  return <div>HiraganaPage</div>;
}
