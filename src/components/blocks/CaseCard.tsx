import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface CaseCardProps {
  title: string;
  category: string;
  bullets: string[];
  takeaway: string;
  sourceUrl?: string;
}

export const CaseCard = ({
  title,
  category,
  bullets,
  takeaway,
  sourceUrl,
}: CaseCardProps) => {
  return (
    <Card className="p-8 hover:shadow-xl transition-all hover:scale-[1.01] border-2 hover:border-primary/30">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
            {category}
          </Badge>
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        </div>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        )}
      </div>

      <ul className="space-y-2 mb-4">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span className="text-foreground">{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          So what?
        </p>
        <p className="text-foreground">{takeaway}</p>
      </div>
    </Card>
  );
};
