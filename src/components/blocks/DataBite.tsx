import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DataBiteProps {
  stat: string;
  description: string;
  source: string;
  sourceUrl?: string;
}

export const DataBite = ({ stat, description, source, sourceUrl }: DataBiteProps) => {
  return (
    <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">{stat}</div>
          <p className="text-foreground text-lg leading-relaxed mb-4">{description}</p>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Source: {source}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Source: {source}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
