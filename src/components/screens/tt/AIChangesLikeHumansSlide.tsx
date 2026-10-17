import openaiQuoteImg from "@/assets/openai-gpt55-prompting.jpeg";
import { ScriptOverlay } from "@/components/blocks/ScriptOverlay";

export const AIChangesLikeHumansSlide = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 overflow-hidden animate-fade-in">
      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="flex justify-center">
          <img
            src={openaiQuoteImg}
            alt="OpenAI Developers note on GPT-5.5 prompting changes"
            loading="eager"
            decoding="sync"
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="high"
            className="rounded-2xl shadow-2xl border-2 border-border max-h-[70vh] w-auto object-contain bg-white"
          />
        </div>

        {/* Takeaway */}
        <div className="space-y-6 text-center md:text-left">
          <p className="slide-chrome uppercase tracking-widest text-muted-foreground font-semibold">
            OpenAI · GPT-5.5 release notes
          </p>
          <h1 className="slide-title font-display font-bold text-foreground leading-tight">
            Like humans, AI <span className="text-primary">changes</span>.
          </h1>
          <p className="slide-body text-foreground/80 leading-relaxed">
            Yesterday's playbook becomes today's <em>noise</em>.
          </p>
          <div className="bg-secondary/10 border-l-4 border-secondary px-6 py-4 rounded-r-xl">
            <p className="slide-body font-display italic text-foreground">
              An <span className="text-secondary font-bold">ongoing rehearsal</span> —<br />
              not a one-time lesson.
            </p>
          </div>
        </div>
      </div>
      <ScriptOverlay />
    </div>
  );
};
