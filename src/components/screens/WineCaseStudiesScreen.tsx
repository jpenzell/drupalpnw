import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, BarChart3, Wine, Lightbulb, Store, ExternalLink } from "lucide-react";

export const WineCaseStudiesScreen = () => {
  const cases = [
    {
      id: "treasury-wines",
      title: "Treasury Wine Estates",
      subtitle: "GenAI Data Platform",
      category: "Data & Insights",
      icon: BarChart3,
      iconColor: "text-blue-500",
      bgColor: "from-blue-500/20 to-blue-500/5",
      visualStat: "TWE",
      visualLabel: "Global",
      takeaway: "Consolidated global data into actionable insights",
      sourceUrl: "https://www.foodanddrinkbusiness.com.au/news/treasury-wines-introduces-ai-data-tool",
    },
    {
      id: "drinks-recommend",
      title: "DRINKS Recommend",
      subtitle: "AI Wine Recommendations",
      category: "E-Commerce",
      icon: Wine,
      iconColor: "text-red-500",
      bgColor: "from-red-500/20 to-red-500/5",
      visualStat: "175%",
      visualLabel: "↑ Conversions",
      takeaway: "AI personalization outperforms bestseller lists",
      sourceUrl: "https://www.prnewswire.com/news-releases/new-data-shows-drinks-ai-powered-personalized-wine-recommendations-deliver-surge-in-online-wine-sales-302067714.html",
    },
    {
      id: "pernod-ricard",
      title: "Pernod Ricard",
      subtitle: "AI Strategy & Marketing Mix",
      category: "Strategic Planning",
      icon: Lightbulb,
      iconColor: "text-yellow-500",
      bgColor: "from-yellow-500/20 to-yellow-500/5",
      visualStat: "3yr",
      visualLabel: "Data Model",
      takeaway: "AI balances profit margins and market share",
      sourceUrl: "https://aiexpert.network/case-study-pernod-ricard-harmonizes-strategy-and-efficiency-with-ai/",
    },
    {
      id: "abinbev",
      title: "AB InBev",
      subtitle: "AI-Powered Brand Analytics",
      category: "Brand Insights",
      icon: TrendingUp,
      iconColor: "text-purple-500",
      bgColor: "from-purple-500/20 to-purple-500/5",
      visualStat: "100%",
      visualLabel: "Consistency",
      takeaway: "Automated reporting freed analysts for strategy",
      sourceUrl: "https://answerrocket.com/abinbev-case-study/",
    },
    {
      id: "trax-beverage",
      title: "Global Beverage Co.",
      subtitle: "In-Store Execution",
      category: "Retail Execution",
      icon: Store,
      iconColor: "text-green-500",
      bgColor: "from-green-500/20 to-green-500/5",
      visualStat: "3x",
      visualLabel: "Growth",
      takeaway: "AI shelf insights enable targeted execution",
      sourceUrl: "https://traxretail.com/case-studies/leading-beverage-alcohol-company/",
    },
    {
      id: "polestar-promo",
      title: "Major Alcobev",
      subtitle: "Trade Promotion Optimization",
      category: "Promotions",
      icon: DollarSign,
      iconColor: "text-orange-500",
      bgColor: "from-orange-500/20 to-orange-500/5",
      visualStat: "ROI",
      visualLabel: "Optimized",
      takeaway: "Historical data + AI = smarter promo spend",
      sourceUrl: "https://polestarllp.com/case-study/smart-promotions-stronger-sales-data-science-in-alcobev-trade-optimization",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-slide-in">
      <div className="max-w-7xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <Wine className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Verified Case Studies</span>
          </div>
          <h1 className="slide-body-lg font-bold text-foreground">
            AI in Beverage Alcohol
          </h1>
          <p className="text-base text-muted-foreground">
            Real results from the industry
          </p>
        </div>

        {/* Card Grid - 3x2 layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {cases.map((caseStudy) => {
            const Icon = caseStudy.icon;
            return (
              <a
                key={caseStudy.id}
                href={caseStudy.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-gradient-to-br ${caseStudy.bgColor} border-2 border-border hover:border-primary/50 rounded-xl p-4 transition-all hover:shadow-lg hover:scale-[1.02]`}
              >
                {/* Stat badge - top right */}
                <div className="absolute top-3 right-3 flex flex-col items-center">
                  <span className={`slide-body font-black ${caseStudy.iconColor}`}>
                    {caseStudy.visualStat}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{caseStudy.visualLabel}</span>
                </div>

                {/* Content */}
                <div className="space-y-2 pr-16">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${caseStudy.iconColor}`} />
                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                      {caseStudy.category}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {caseStudy.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{caseStudy.subtitle}</p>
                  </div>

                  <p className="text-xs md:text-sm text-foreground/80 leading-snug">
                    {caseStudy.takeaway}
                  </p>
                </div>

                {/* Link indicator */}
                <ExternalLink className="absolute bottom-3 right-3 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
};
