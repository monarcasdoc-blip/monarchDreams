import Image from "next/image";

export default function HeroImage({
  src,
  objectPosition,
}: {
  src: string;
  objectPosition?: string;
}) {
  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
      <div className="absolute inset-0 bg-monarch-black/45" />
    </div>
  );
}
