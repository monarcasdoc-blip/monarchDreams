import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getApprovedMilkweedPins } from "@/lib/milkweed";
import MilkweedMapLoader from "@/components/MilkweedMapLoader";

export const metadata: Metadata = {
  title: "Milkweed Map | Sueños de una Monarca",
};

export default async function MilkweedMapPage() {
  const t = await getTranslations("MilkweedMap");
  const pins = await getApprovedMilkweedPins();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl mb-3 text-center">
        {t("title")}
      </h1>
      <p className="text-center text-monarch-black/70 max-w-xl mx-auto mb-8">
        {t("intro")}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <p className="text-milkweed-green font-semibold">
          {pins.length}+ {t("pinCount")}
        </p>
        <Link
          href="/milkweed-map/submit"
          className="bg-monarch-orange hover:bg-monarch-orange-dark transition-colors text-cream px-7 py-3 rounded-full font-medium"
        >
          {t("addButton")}
        </Link>
      </div>

      {pins.length === 0 && (
        <p className="text-center text-monarch-black/60 italic mb-4">
          {t("emptyState")}
        </p>
      )}

      {/* relative z-0 traps Leaflet's hardcoded pane/control z-indexes (400-1000)
          in their own stacking context, so they can't paint over the sticky nav. */}
      <div className="relative z-0 h-[500px] w-full">
        <MilkweedMapLoader pins={pins} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6">
        <p className="flex items-center gap-2 text-sm text-monarch-black/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/milkweed-butterfly.svg" alt="" className="h-6 w-auto" />
          {t("legendCommunity")}
        </p>
        <p className="flex items-center gap-2 text-sm text-monarch-black/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/milkweed-marker.svg" alt="" className="h-6 w-auto" />
          {t("legendOfficial")}
        </p>
      </div>
    </div>
  );
}
