import Image from "next/image";
import type { Screening } from "@/data/content";

export default function ScreeningCard({ screening }: { screening: Screening }) {
  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-monarch-black/10 bg-white p-5 h-full transition-shadow hover:shadow-md">
      {screening.laurel && (
        <div className="relative h-16 w-16 shrink-0">
          <Image src={screening.laurel} alt="" fill sizes="64px" className="object-contain" />
        </div>
      )}
      <div>
        <p className="font-display text-lg leading-snug">{screening.festival}</p>
        <p className="text-sm text-monarch-black/60">{screening.location}</p>
        <p className="text-sm text-monarch-orange font-medium">{screening.date}</p>
      </div>
    </div>
  );

  if (screening.url) {
    return (
      <a href={screening.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return content;
}
