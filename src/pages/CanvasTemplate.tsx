import { useRef } from "react";

const CanvasTemplate = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-secondary/90 transition-colors shadow-lg"
        >
          ⬇ Download / Print as PDF
        </button>
      </div>

      <div ref={printRef} className="min-h-screen bg-white text-black p-8 print:p-6 max-w-[850px] mx-auto">
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Scene Sprint Canvas</h1>
          <p className="text-sm text-gray-600 mt-1">TheaterThink® by Josh Penzell · imaginationapplied.com</p>
        </div>

        {/* Play / Show */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border-2 border-black rounded-lg p-4">
            <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">The Play</label>
            <p className="text-xs text-gray-400 italic mb-1">The initiative as written — the official plan</p>
            <div className="border-b border-gray-300 min-h-[60px]" />
          </div>
          <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
            <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">The Show</label>
            <p className="text-xs text-gray-400 italic mb-1">The pattern people are actually living</p>
            <div className="border-b border-gray-300 min-h-[60px]" />
          </div>
        </div>

        {/* Scenes */}
        {[1, 2, 3].map((sceneNum) => (
          <div key={sceneNum} className="border-2 border-black rounded-lg p-4 mb-4 break-inside-avoid">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Scene {sceneNum}</span>
              <div className="flex-1 border-b border-gray-300" />
            </div>

            {/* Characters */}
            {[1, 2].map((charNum) => (
              <div key={charNum} className="border border-gray-300 rounded-md p-3 mb-3 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Character</label>
                    <div className="border-b border-gray-300 min-h-[24px] mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Overall Want / Need</label>
                    <div className="border-b border-gray-300 min-h-[24px] mt-1" />
                  </div>
                </div>

                {/* Beats */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Beats</label>
                  {[1, 2].map((beatNum) => (
                    <div key={beatNum} className="grid grid-cols-3 gap-2 pl-3 border-l-2 border-gray-400">
                      <div>
                        <label className="text-[9px] uppercase text-gray-400">Want</label>
                        <div className="border-b border-gray-300 min-h-[20px]" />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase text-gray-400">Action / Tactic</label>
                        <div className="border-b border-gray-300 min-h-[20px]" />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase text-gray-400">Obstacle</label>
                        <div className="border-b border-gray-300 min-h-[20px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Dialogue */}
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Dialogue — How does this scene sound?</label>
              {[1, 2, 3, 4].map((lineNum) => (
                <div key={lineNum} className="flex gap-2 mb-1.5">
                  <div className="border-b border-gray-300 w-24 min-h-[18px]" />
                  <span className="text-gray-400 text-xs shrink-0">:</span>
                  <div className="border-b border-gray-300 flex-1 min-h-[18px]" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* The Real Scene + The Move */}
        <div className="grid grid-cols-2 gap-4 mt-6 break-inside-avoid">
          <div className="border-2 border-black rounded-lg p-4">
            <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">The Real Scene</label>
            <p className="text-xs text-gray-400 italic mb-1">What's actually going on underneath?</p>
            <div className="border-b border-gray-300 min-h-[60px]" />
          </div>
          <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
            <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">The Move</label>
            <p className="text-xs text-gray-400 italic mb-1">One directing move you'd make right now</p>
            <div className="border-b border-gray-300 min-h-[60px]" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-gray-300 text-center text-xs text-gray-400">
          <p>TheaterThink® Scene Sprint Canvas · Josh Penzell · joshpenzell.com · presentations.joshpenzell.com</p>
        </div>
      </div>
    </>
  );
};

export default CanvasTemplate;
