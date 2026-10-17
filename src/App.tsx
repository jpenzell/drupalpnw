import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { PollProvider } from "@/contexts/PollContext";
import { PresentationModeProvider } from "@/contexts/PresentationModeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CanvasTemplate from "./pages/CanvasTemplate";
import RehearsalTool from "./pages/RehearsalTool";
import Connect from "./pages/Connect";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PresentationModeProvider>
        <SessionProvider>
          <PollProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/canvas" element={<CanvasTemplate />} />
                <Route path="/rehearsal" element={<RehearsalTool />} />
                <Route path="/connect" element={<Connect />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/email-unsubscribe" element={<Unsubscribe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PollProvider>
        </SessionProvider>
      </PresentationModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
