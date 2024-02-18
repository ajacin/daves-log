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
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/"
              >
                <div className="text-lg">Home</div>
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/login"
              >
                Login
              </Link>
            </li> */}
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/ideas"
              >
                <div className="text-lg">Ideas</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/resources"
              >
                <div className="text-lg">Resources</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/activities"
              >
                <div className="text-lg">Log Activities</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/view-activities"
              >
                <div className="text-lg">View Activities</div>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                onClick={closeDrawer}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug  hover:opacity-75"
                to="/due-dates"
              >
                <div className="text-lg">Due Dates</div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
