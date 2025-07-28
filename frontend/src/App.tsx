import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientList from "./pages/PatientList";
import PatientDetails from "./pages/PatientDetails";
import PatientForm from "./pages/PatientForm";
import TestSelection from "./pages/TestSelection";
import VideoRecording from "./pages/VideoRecording";
import VideoSummary from "./pages/VideoSummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PatientList />} />
          <Route path="/patient/:id" element={<PatientDetails />} />
          <Route path="/patient-form" element={<PatientForm />} />
          <Route path="/patient/:id/edit" element={<PatientForm />} />
          <Route path="/patient/:id/test-selection" element={<TestSelection />} />
          <Route path="/patient/:id/video-recording/:testId" element={<VideoRecording />} />
          <Route path="/patient/:id/video-summary/:testId" element={<VideoSummary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
