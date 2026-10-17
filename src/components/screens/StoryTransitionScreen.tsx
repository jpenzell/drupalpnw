import wineTimeline from "@/assets/wine-timeline.jpeg";

export const StoryTransitionScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-5xl mx-auto px-4">
        <img 
          src={wineTimeline} 
          alt="Wine lifecycle timeline"
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};
