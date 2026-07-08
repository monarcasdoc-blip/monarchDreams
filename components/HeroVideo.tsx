export default function HeroVideo({
  src,
  objectPosition = "center",
}: {
  src: string;
  objectPosition?: string;
}) {
  return (
    <div className="absolute inset-0">
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
        style={{ objectPosition }}
      />
      <div className="absolute inset-0 bg-monarch-black/45" />
    </div>
  );
}
