import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import CommunityLeaderDashboard from "./pages/CommunityLeaderDashboard";
import CollaboratorDashboard from "./pages/CollaboratorDashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import SimpleNetworkingDashboard from "./pages/SimpleNetworkingDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/community-leader" element={<CommunityLeaderDashboard />} />
            <Route path="/collaborator" element={<CollaboratorDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/networking" element={<SimpleNetworkingDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
