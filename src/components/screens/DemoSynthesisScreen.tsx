import { Theater, ArrowRight } from "lucide-react";

export const DemoSynthesisScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 overflow-hidden">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Theater className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide uppercase">The Director's Playbook</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            What Did We Learn?
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every demo was a <span className="text-primary font-semibold">rehearsal</span>—exploring possibilities before the performance.
          </p>
        </div>

        {/* Transition prompt */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent/10 border border-accent/30 rounded-full text-accent">
            <span className="text-xl font-semibold">Let's name the patterns we used</span>
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
