import { createContext, useContext, ReactNode } from "react";

interface PresentationModeContextType {
  presentationTitle: string;
  presenterName: string;
  presenterCompany: string;
  eventName: string;
}

const PresentationModeContext = createContext<PresentationModeContextType | undefined>(undefined);

const contextValue: PresentationModeContextType = {
  presentationTitle: "Rehearsing the Future",
  presenterName: "Josh Penzell",
  presenterCompany: "Imagination Applied",
  eventName: "Minnesota Chapter of ISPI · Digital Learning Forum",
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
