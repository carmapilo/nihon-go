import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
export default function Card({
  word,
  reading,
  meaning,
  category,
}: {
  word: string;
  reading: string;
  meaning: string;
  category: string;
}) {
  return (
    <div className="flex flex-col gap-4 bg-white shadow-md rounded-lg p-12 border-2 border-gray-300 w-full max-w-md h-full justify-center items-center">
      <h1 className="text-3xl font-bold mb-2">{word}</h1>
      <p className="text-xl text-gray-600">{reading}</p>
      <p className="text-xl text-gray-700 font-medium">{meaning}</p>
      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
        {category}
      </span>
    </div>
  );
}
