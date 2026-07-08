import Image from "next/image";

export default function CrewCard({
  name,
  headshot,
  role,
  bio,
  objectPosition,
}: {
  name: string;
  headshot: string;
  role: string;
  bio: string;
  objectPosition?: string;
}) {
  return (
    <div className="text-center">
      <div className="relative mx-auto h-36 w-36 sm:h-40 sm:w-40 rounded-full overflow-hidden ring-4 ring-monarch-orange/20">
        <Image
          src={headshot}
          alt={name}
          fill
          sizes="160px"
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
        />
      </div>
      <h3 className="mt-4 font-display text-lg">{name}</h3>
      <p className="text-monarch-orange text-sm font-medium mb-2">{role}</p>
      <p className="text-sm text-monarch-black/70 leading-relaxed max-w-xs mx-auto">
        {bio}
      </p>
    </div>
  );
}
