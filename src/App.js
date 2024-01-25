import { Route, Routes } from "react-router-dom";
import { ViewActivities } from "./pages/ViewActivities";
import { Activities } from "./pages/Activities";
import { Login } from "./pages/Login";
import { Ideas } from "./pages/Ideas";
import { Home } from "./pages/Home";
import AppDrawer from "./components/drawer/Drawer";
import { useUser } from "./lib/context/user";

export default function App() {
  const user = useUser();
  return (
    <div>
      <div className="bg-gray-800 p-2 mt-0 fixed w-full z-10 top-0 mb-4">
        <div className="container mx-auto flex flex-wrap items-center">
          <div className="flex w-full md:w-auto text-white gap-2 items-center justify-start">
            <AppDrawer></AppDrawer>
            <h1>DAVE'S LOG</h1>
            {user.current ? (
              <span className="bg-red-100self-end text-purple-300">
                {" | "} {user.current.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/view-activities" element={<ViewActivities />} />
        </Routes>
      </div>
    </div>
  );
}
