import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedParticipantRoute } from "@/components/ProtectedParticipantRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load route components to reduce initial bundle size
const Index = lazy(() => import("./pages/Index"));
const Pathways = lazy(() => import("./pages/Pathways"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const EligibilityAssessment = lazy(() => import("./pages/EligibilityAssessment"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Consultation = lazy(() => import("./pages/Consultation"));
const PathwayDetails = lazy(() => import("./pages/PathwayDetails"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const AccessibilityStatement = lazy(() => import("./pages/Accessibility"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FAQ = lazy(() => import("./pages/FAQ"));
const SDAGuides = lazy(() => import("./pages/SDAGuides"));
const NDISInformation = lazy(() => import("./pages/NDISInformation"));
const NotFoundImproved = lazy(() => import("./pages/NotFoundImproved"));

// Admin routes
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const PropertyNew = lazy(() => import("./pages/admin/PropertyNew"));
const PropertyEdit = lazy(() => import("./pages/admin/PropertyEdit"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

// Admin: Participants
const ParticipantList = lazy(() => import("./pages/admin/participants/ParticipantList"));
const ParticipantForm = lazy(() => import("./pages/admin/participants/ParticipantForm"));
const AdminParticipantProfile = lazy(() => import("./pages/admin/participants/ParticipantProfile"));

// Admin: Landlords
const LandlordList = lazy(() => import("./pages/admin/landlords/LandlordList"));
const LandlordForm = lazy(() => import("./pages/admin/landlords/LandlordForm"));
const LandlordProfile = lazy(() => import("./pages/admin/landlords/LandlordProfile"));

// Admin: Jobs
const JobList = lazy(() => import("./pages/admin/jobs/JobList"));
const JobForm = lazy(() => import("./pages/admin/jobs/JobForm"));
const JobDetail = lazy(() => import("./pages/admin/jobs/JobDetail"));

// Admin: Investors
const InvestorList = lazy(() => import("./pages/admin/investors/InvestorList"));
const InvestorForm = lazy(() => import("./pages/admin/investors/InvestorForm"));

// Admin: Tenancies
const TenancyList = lazy(() => import("./pages/admin/tenancies/TenancyList"));

// Admin: NDIA Payments
const NDIABatchList = lazy(() => import("./pages/admin/payments/NDIABatchList"));

// Participant routes
const ParticipantSignup = lazy(() => import("./pages/participant/Signup"));
const ParticipantLogin = lazy(() => import("./pages/participant/Login"));
const ParticipantDashboard = lazy(() => import("./pages/participant/Dashboard"));
const ParticipantMatches = lazy(() => import("./pages/participant/Matches"));
const ParticipantProfile = lazy(() => import("./pages/participant/Profile"));
const ParticipantDocuments = lazy(() => import("./pages/participant/Documents"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pathways" element={<Pathways />} />
            <Route path="/pathways/:pathway" element={<PathwayDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/eligibility" element={<EligibilityAssessment />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/accessibility" element={<AccessibilityStatement />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            {/* Temporarily hidden until PDF resources are ready */}
            {/* <Route path="/sda-guides" element={<SDAGuides />} /> */}
            <Route path="/ndis-information" element={<NDISInformation />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/properties/new" element={
              <ProtectedRoute>
                <PropertyNew />
              </ProtectedRoute>
            } />
            <Route path="/admin/properties/edit/:id" element={
              <ProtectedRoute>
                <PropertyEdit />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            } />

            {/* Admin: Participant Management */}
            <Route path="/admin/participants" element={
              <ProtectedRoute>
                <ParticipantList />
              </ProtectedRoute>
            } />
            <Route path="/admin/participants/new" element={
              <ProtectedRoute>
                <ParticipantForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/participants/:id" element={
              <ProtectedRoute>
                <AdminParticipantProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/participants/:id/edit" element={
              <ProtectedRoute>
                <ParticipantForm />
              </ProtectedRoute>
            } />

            {/* Admin: Landlord Management */}
            <Route path="/admin/landlords" element={
              <ProtectedRoute>
                <LandlordList />
              </ProtectedRoute>
            } />
            <Route path="/admin/landlords/new" element={
              <ProtectedRoute>
                <LandlordForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/landlords/:id" element={
              <ProtectedRoute>
                <LandlordProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/landlords/:id/edit" element={
              <ProtectedRoute>
                <LandlordForm />
              </ProtectedRoute>
            } />

            {/* Admin: Job Management */}
            <Route path="/admin/jobs" element={
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs/new" element={
              <ProtectedRoute>
                <JobForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs/:id" element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs/:id/edit" element={
              <ProtectedRoute>
                <JobForm />
              </ProtectedRoute>
            } />

            {/* Admin: Investor Management */}
            <Route path="/admin/investors" element={
              <ProtectedRoute>
                <InvestorList />
              </ProtectedRoute>
            } />
            <Route path="/admin/investors/new" element={
              <ProtectedRoute>
                <InvestorForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/investors/:id/edit" element={
              <ProtectedRoute>
                <InvestorForm />
              </ProtectedRoute>
            } />

            {/* Admin: Tenancy Management */}
            <Route path="/admin/tenancies" element={
              <ProtectedRoute>
                <TenancyList />
              </ProtectedRoute>
            } />

            {/* Admin: NDIA Payment Batches */}
            <Route path="/admin/payments/ndia-batches" element={
              <ProtectedRoute>
                <NDIABatchList />
              </ProtectedRoute>
            } />

            {/* Participant routes */}
            <Route path="/participant/signup" element={<ParticipantSignup />} />
            <Route path="/participant/login" element={<ParticipantLogin />} />
            <Route path="/participant/dashboard" element={
              <ProtectedParticipantRoute>
                <ParticipantDashboard />
              </ProtectedParticipantRoute>
            } />
            <Route path="/participant/matches" element={
              <ProtectedParticipantRoute>
                <ParticipantMatches />
              </ProtectedParticipantRoute>
            } />
            <Route path="/participant/profile" element={
              <ProtectedParticipantRoute>
                <ParticipantProfile />
              </ProtectedParticipantRoute>
            } />
            <Route path="/participant/documents" element={
              <ProtectedParticipantRoute>
                <ParticipantDocuments />
              </ProtectedParticipantRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFoundImproved />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
