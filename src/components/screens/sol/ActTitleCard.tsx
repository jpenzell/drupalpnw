import { Theater } from "lucide-react";

interface ActTitleCardProps {
  number: "ONE" | "TWO" | "THREE" | "FOUR";
  title: string;
  subtitle?: string;
}

export const ActTitleCard = ({ number, title, subtitle }: ActTitleCardProps) => (
  <div className="flex-1 flex items-center justify-center bg-curtain">
    <div className="text-center space-y-8 px-6">
      <div className="inline-flex items-center gap-3 px-5 py-2 bg-black/40 rounded-full border border-spotlight/40">
        <Theater className="h-5 w-5 text-spotlight" />
        <span className="text-curtain-foreground/90 text-sm font-mono tracking-[0.3em] uppercase">
          ACT {number}
        </span>
      </div>
      <h1 className="slide-title-lg font-display font-light text-curtain-foreground spotlight-glow leading-tight italic">
        {title}
      </h1>
      {subtitle && (
        <p className="slide-body-lg text-curtain-foreground/70 font-light max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);
