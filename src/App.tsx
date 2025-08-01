import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import EnergySourcesPage from "./pages/EnergySourcesPage";
import RegionalMarketPage from "./pages/RegionalMarketPage";
import DAMForecastPage from "./pages/DAMForecastPage";
import GDAMForecastPage from "./pages/GDAMForecastPage";
import WeatherPage from "./pages/WeatherPage";
import NotFound from "./pages/NotFound";
import Map from "./pages/Map";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/energy-sources" element={<EnergySourcesPage />} />
            <Route path="/regional-market" element={<RegionalMarketPage />} />
            <Route path="/dam-forecast" element={<DAMForecastPage />} />
            <Route path="/gdam-forecast" element={<GDAMForecastPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/temp" element={<Map />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
