import { Brain, HelpCircle } from "lucide-react";

export const ImpartaSkillsStudyScreen = () => {
  return (
    <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden animate-fade-in">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-6">
          <p className="text-base text-muted-foreground uppercase tracking-widest mb-1">
            Imparta & Carnegie Mellon • 2025
          </p>
          <h1 className="slide-subtitle font-bold text-foreground">
            When AI <span className="text-secondary">Thinks For You</span>
          </h1>
          <p className="slide-caption text-muted-foreground mt-2 max-w-3xl mx-auto">
            fMRI study of professionals writing with AI assistance—measured neural activity and recall
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary/10 border-[3px] border-primary/40 rounded-2xl p-8 text-center">
            <Brain className="h-14 w-14 text-primary mx-auto mb-3" />
            <div className="slide-title-lg font-black text-primary mb-2">47%</div>
            <p className="slide-caption text-foreground font-semibold">Drop in Brain Activity</p>
            <p className="text-base text-muted-foreground mt-1">When AI drafted content</p>
          </div>

          <div className="bg-secondary/10 border-[3px] border-secondary/40 rounded-2xl p-8 text-center">
            <HelpCircle className="h-14 w-14 text-secondary mx-auto mb-3" />
            <div className="slide-title-lg font-black text-secondary mb-2">80%</div>
            <p className="slide-caption text-foreground font-semibold">Couldn't Recall</p>
            <p className="text-base text-muted-foreground mt-1">What they "wrote" with AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};
