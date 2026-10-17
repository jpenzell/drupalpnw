import { Sparkles, ArrowRightLeft, MessageSquare, GraduationCap, Wine } from "lucide-react";
import zooxVehicle from "@/assets/zoox-vehicle.jpg";
import { usePresentationMode } from "@/contexts/PresentationModeContext";

export const ClosingScreen = () => {
  const closingCallback = "Your next AI conversation is a rehearsal—what will you explore?";
  const isEducator = false;

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-5xl mx-auto px-4 space-y-8">
        {/* Callback to Opening */}
        <div className="flex justify-center">
          <div className="relative overflow-hidden rounded-2xl border border-muted/30 bg-muted/10">
            <img
              src={zooxVehicle}
              alt="Zoox autonomous vehicle"
              className="w-48 h-28 object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground italic">
                Remember this?
              </p>
            </div>
          </div>
        </div>

        {/* Core Message */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-secondary/10 border border-secondary/30 rounded-full">
            {isEducator ? (
              <GraduationCap className="h-4 w-4 text-secondary" />
            ) : (
              <Sparkles className="h-4 w-4 text-secondary" />
            )}
            <span className="text-secondary font-semibold tracking-wide text-sm uppercase">
              {isEducator ? "Agile Intelligence" : "Artistic Intelligence"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            The Mindset Shift
          </h1>
        </div>

        {/* Editor → Director Callback */}
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-muted-foreground/60 line-through decoration-2">
              {isEducator ? "Static Lessons" : "Editor"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isEducator ? "fixed curriculum" : "static plans"}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center ring-2 ring-secondary/50">
              <ArrowRightLeft className="h-6 w-6 text-secondary" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              {isEducator ? "Adaptive Teaching" : "Director"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isEducator ? "responsive pedagogy" : "dynamic responses"}
            </p>
          </div>
        </div>

        {/* Key Insight */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-8 py-5 max-w-3xl mx-auto">
          <p className="text-center text-lg text-foreground/90">
            <span className="font-semibold text-primary">
              {isEducator ? "Agile Intelligence" : "Artistic Intelligence"}
            </span> isn't about AI proficiency—
            it's about thinking <span className="text-secondary font-semibold">differently</span> with a creative partner.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-card border-2 border-secondary/40 rounded-2xl shadow-lg">
            <MessageSquare className="h-6 w-6 text-secondary" />
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              Your next AI conversation is a <span className="text-secondary">rehearsal</span>.
            </p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-primary">
            {isEducator ? "What will you explore with your students?" : "What will you explore?"}
          </p>
        </div>
      </div>
    </div>
  );
};
