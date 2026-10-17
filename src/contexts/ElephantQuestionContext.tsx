import { createContext, useContext, useState, ReactNode } from "react";

interface ElephantQuestionContextType {
  city: string;
  stadium: string;
  setCity: (city: string) => void;
  setStadium: (stadium: string) => void;
}

const ElephantQuestionContext = createContext<ElephantQuestionContextType | undefined>(undefined);

export const ElephantQuestionProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState("Minneapolis, Minnesota");
  const [stadium, setStadium] = useState("U.S. Bank Stadium");

  return (
    <ElephantQuestionContext.Provider value={{ city, stadium, setCity, setStadium }}>
      {children}
    </ElephantQuestionContext.Provider>
  );
};

export const useElephantQuestion = () => {
  const context = useContext(ElephantQuestionContext);
  if (!context) {
    throw new Error("useElephantQuestion must be used within ElephantQuestionProvider");
  }
  return context;
};
