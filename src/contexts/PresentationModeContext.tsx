import { createContext, useContext, ReactNode } from "react";

interface PresentationModeContextType {
  presentationTitle: string;
  presentationSubtitle: string;
  presenterName: string;
  presenterCompany: string;
  eventName: string;
  eventWhen: string;
}

const contextValue: PresentationModeContextType = {
  presentationTitle: "AI for All Minds",
  presentationSubtitle: "How cognitive diversity creates blind spots and breakthroughs",
  presenterName: "Josh Penzell",
  presenterCompany: "Imagination Applied",
  eventName: "Keynote · BCIT Downtown · Room 280",
  eventWhen: "Saturday, October 17, 2026 · 11:30 a.m.–12:15 p.m.",
};

export const PresentationModeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <PresentationModeContext.Provider value={contextValue}>
      {children}
    </PresentationModeContext.Provider>
  );
};

export const usePresentationMode = () => {
  const context = useContext(PresentationModeContext);
  if (!context) {
    throw new Error("usePresentationMode must be used within PresentationModeProvider");
  }
  return context;
};
