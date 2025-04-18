import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ViewActivities } from "./pages/ViewActivities";
import { Activities } from "./pages/Activities";
import { Ideas } from "./pages/Ideas";
import { Automations } from "./pages/Automations";
import { useUser } from "./lib/context/user";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { UserProvider } from "./lib/context/user";
import { IdeasProvider } from "./lib/context/ideas";
import { BabyActivitiesProvider } from "./lib/context/activities";
import { AutomationsProvider } from "./lib/context/automations";
import { Toaster } from "react-hot-toast";

// Protected routes component
function ProtectedRoutes() {
  return (
    <ProtectedLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="activities" element={<Activities />} />
        <Route path="view-activities" element={<ViewActivities />} />
        <Route path="ideas" element={<Ideas />} />
        <Route path="automations" element={<Automations />} />
      </Routes>
    </ProtectedLayout>
  );
}

// Root route component to handle authentication state
function RootRoute() {
  const { current: user } = useUser();
  return user ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function App() {
  const { current: user } = useUser();

  return (
    <UserProvider>
      <IdeasProvider>
        <BabyActivitiesProvider>
          <AutomationsProvider>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
              <Route path="/dashboard/*" element={<ProtectedRoutes />} />
            </Routes>
            <Toaster position="top-right" />
          </AutomationsProvider>
        </BabyActivitiesProvider>
      </IdeasProvider>
    </UserProvider>
  );
}

export default App;
