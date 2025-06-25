import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MainHeader() {
  return (
    <header className="flex justify-between items-center p-2 px-9 gap-4 sticky top-0 bg-background border-b border-border">
      <Button asChild variant="ghost" className="p-2 h-auto">
        <Link href="/" className="flex gap-0">
          <div className="relative w-14 h-14">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              className="object-contain"
              //   sizes="64px"
            />
          </div>
          <div className="relative w-20 h-14">
            <Image
              src="/logo-text.png"
              alt="logo text"
              fill
              className="object-contain"
              //   sizes="96px"
            />
          </div>
        </Link>
      </Button>
      <div className="flex gap-20">
        <Button variant="link" className="text-lg">
          <Link href="/lessons">Lessons (レッスン)</Link>
        </Button>
        <Button variant="link" className="text-lg">
          <Link href="/practice">Practice (練習する)</Link>
        </Button>
        <Button variant="link" className="text-lg">
          <Link href="/kanji">Kanji (漢字)</Link>
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost">
          <Link href="/account">
            {" "}
            <UserIcon className="w-6 h-6" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
