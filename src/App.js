import { Route, Routes } from "react-router-dom";
import { ViewActivities } from "./pages/ViewActivities";
import { Activities } from "./pages/Activities";
import { Login } from "./pages/Login";
import { Ideas } from "./pages/Ideas";
import { Home } from "./pages/Home";
import AppDrawer from "./components/drawer/Drawer";
import { useUser } from "./lib/context/user";
import { Resources } from "./pages/Resources";
import { DueDates } from "./pages/DueDates";
import Automations from "./pages/Automations";

export default function App() {
  const user = useUser();
  return (
    <div>
      {user.current && (
        <div className="bg-gray-800 p-2 mt-0 fixed w-full z-10 top-0 mb-4">
          <div className="container mx-auto flex flex-wrap items-center">
            <div className="flex w-full md:w-auto text-white gap-2 items-center justify-start">
              <AppDrawer></AppDrawer>
              <h1>4292 FALCONS</h1>
              <span className="bg-red-100self-end text-purple-300">
                {" | "} {user.current.name}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className={user.current ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/due-dates" element={<DueDates />} />
          <Route path="/view-activities" element={<ViewActivities />} />
          <Route path="/automations" element={<Automations />} />
        </Routes>
      </div>
    </div>
  );
}
