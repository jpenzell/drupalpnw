import { Citation } from "@/components/blocks/Citation";

export const RussianBluesClaimSlide = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center px-16 py-12 bg-background">
    <div className="max-w-5xl w-full text-center">
      <p className="slide-kicker text-accent mb-6">A demonstration · Russian Blues</p>

      <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-border flex h-56 lg:h-64 mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "#7FB5E6" }}>
          <p className="slide-title font-display" style={{ color: "#0a1f3d" }}>голубой</p>
          <p className="mt-2 slide-caption" style={{ color: "#0a1f3d", opacity: 0.8 }}>light blue</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "#1B3A8A" }}>
          <p className="slide-title font-display" style={{ color: "#FFFFFF" }}>синий</p>
          <p className="mt-2 slide-caption" style={{ color: "rgba(255,255,255,0.85)" }}>dark blue</p>
        </div>
      </div>

      <h2 className="slide-title font-display text-foreground mt-10 leading-snug">
        Language doesn't describe thought. <span className="italic text-spotlight">It shapes it.</span>
      </h2>

      <p className="slide-body text-muted-foreground mt-6 max-w-3xl mx-auto">
        Russian speakers distinguish these as two colors faster than English speakers do.
      </p>

      <div className="mt-10">
        <Citation sources={["Winawer et al. (2007). PNAS, 104(19), 7780–7785."]} />
      </div>
    </div>
  </div>
);
