import { Link } from "react-router-dom";

export function Navbar({ setIsDrawerOpen }) {
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  return (
    <nav className=" p-2 mt-0 mb-4">
      <div className="container mx-auto flex flex-wrap items-center">
        <div className="flex w-full md:w-auto">
          <ul className="flex flex-col pl-0 mb-0 list-none text-gray-700">
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-blue-600 hover:text-blue-800"
                to="/dashboard"
              >
                <div className="text-lg">Tasks</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/dashboard/dashboard"
              >
                <div className="text-lg">Dashboard</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/dashboard/activities"
              >
                <div className="text-lg">Log Activities</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/dashboard/view-activities"
              >
                <div className="text-lg">View Activities</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/dashboard/automations"
              >
                <div className="text-lg">Automations</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/dashboard/invitees"
              >
                <div className="text-lg">Invitees</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/dashboard/settings"
              >
                <div className="text-lg">Settings</div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
