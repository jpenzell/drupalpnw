import { createContext, useContext, useState, ReactNode } from "react";

interface Beat {
  want: string;
  action: string;
  obstacle: string;
}

interface Character {
  name: string;
  overallWant: string;
  beats: Beat[];
}

interface Scene {
  name: string;
  characters: Character[];
}

interface CanvasState {
  play: string;
  show: string;
  scenes: Scene[];
}

interface SceneCanvasContextType {
  canvas: CanvasState | null;
  setCanvas: (c: CanvasState | null) => void;
}

const SceneCanvasContext = createContext<SceneCanvasContextType>({
  canvas: null,
  setCanvas: () => {},
});

export const useSceneCanvas = () => useContext(SceneCanvasContext);

export const SceneCanvasProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<CanvasState | null>(null);
  return (
    <SceneCanvasContext.Provider value={{ canvas, setCanvas }}>
      {children}
    </SceneCanvasContext.Provider>
  );
};
