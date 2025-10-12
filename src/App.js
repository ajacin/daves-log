import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { Dashboard } from './pages/Dashboard';
import { ViewActivities } from "./pages/ViewActivities";
import { Activities } from "./pages/Activities";
import { Ideas } from "./pages/Ideas";
import { Automations } from "./pages/Automations";
import { Invitees } from "./pages/Invitees";
import { Settings } from "./pages/Settings";
import { useUser } from "./lib/context/user";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { UserProvider } from "./lib/context/user";
import { IdeasProvider } from "./lib/context/ideas";
import { BabyActivitiesProvider } from "./lib/context/activities";
import { AutomationsProvider } from "./lib/context/automations";
import { InviteesProvider } from "./lib/context/invitees";
import { Toaster } from "react-hot-toast";

// Protected routes component
function ProtectedRoutes() {
  return (
    <ProtectedLayout>
      <Routes>
        <Route index element={<Ideas />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activities" element={<Activities />} />
        <Route path="view-activities" element={<ViewActivities />} />
        <Route path="ideas" element={<Ideas />} />
        <Route path="automations" element={<Automations />} />
        <Route path="invitees" element={<Invitees />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </ProtectedLayout>
  );
}

function App() {
  return (
    <UserProvider>
      {/* Root route component to handle authentication state */}
      <AppRoutes />
    </UserProvider>
  );
}

// Moving inside UserProvider to avoid circular dependency
function AppRoutes() {
  const { current: user } = useUser();
  
  return (
    <IdeasProvider>
      <BabyActivitiesProvider>
        <AutomationsProvider>
          <InviteesProvider>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
              <Route path="/dashboard/*" element={<ProtectedRoutes />} />
            </Routes>
            <Toaster position="top-right" />
          </InviteesProvider>
        </AutomationsProvider>
      </BabyActivitiesProvider>
    </IdeasProvider>
  );
}

export default App;
