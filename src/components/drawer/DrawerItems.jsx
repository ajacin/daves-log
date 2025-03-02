import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "../Navbar";
import { useUser } from "../../lib/context/user";

const DrawerItems = ({ setIsDrawerOpen, toggleDrawer }) => {
  const { logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-grow">
        <div
          className="flex items-center gap-2 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={toggleDrawer}
        >
          <FontAwesomeIcon
            icon={faBars}
            className="text-cyan-600"
            size="xl"
          />
          <h1 className="text-xl font-bold text-cyan-600">4292 FALCONS</h1>
        </div>
        <div className="py-2">
          <Navbar setIsDrawerOpen={setIsDrawerOpen} />
        </div>
      </div>
      <div className="border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full p-4 text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <FontAwesomeIcon
            icon={faPowerOff}
            className="text-red-600"
          />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DrawerItems;
