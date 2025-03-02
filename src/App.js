import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ViewActivities } from "./pages/ViewActivities";
import { Activities } from "./pages/Activities";
import { Ideas } from "./pages/Ideas";
import { Resources } from "./pages/Resources";
import { DueDates } from "./pages/DueDates";
import Automations from "./pages/Automations";
import AppDrawer from "./components/drawer/Drawer";
import { useUser } from "./lib/context/user";

// Wrapper component for protected routes
function ProtectedLayout({ children }) {
  const { current: user } = useUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppDrawer />
      <main>
        {children}
      </main>
    </div>
  );
}

// Protected routes component
function ProtectedRoutes() {
  return (
    <ProtectedLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="activities" element={<Activities />} />
        <Route path="view-activities" element={<ViewActivities />} />
        <Route path="ideas" element={<Ideas />} />
        <Route path="resources" element={<Resources />} />
        <Route path="due-dates" element={<DueDates />} />
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
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default App;
