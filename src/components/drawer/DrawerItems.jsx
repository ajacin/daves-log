import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "../Navbar";
import { useUser } from "../../lib/context/user";
import { useSettings } from "../../lib/context/settings";

const DrawerItems = ({ setIsDrawerOpen, toggleDrawer }) => {
  const { logout, current: user } = useUser();
  const { sidePanelMode } = useSettings();
  const isPinned = sidePanelMode === 'pinned';

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
          className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isPinned ? 'sidebar-header' : ''}`}
          onClick={isPinned ? null : toggleDrawer}
        >
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faBars}
              className="text-cyan-600"
              size="xl"
              fixedWidth
            />
            <h1 className={`text-xl font-bold text-cyan-600 ml-3 ${isPinned ? 'sidebar-text' : ''}`}>
              FALCONS
            </h1>
          </div>
          <span className={`text-sm text-gray-600 ${isPinned ? 'sidebar-text' : ''}`}>
            {isPinned ? '' : user?.name}
          </span>
        </div>
        <div className="py-2">
          <Navbar setIsDrawerOpen={setIsDrawerOpen} />
        </div>
      </div>
      <div className="border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-4 text-red-600 hover:bg-red-50 transition-colors duration-200 ${isPinned ? 'justify-center' : 'justify-start'}`}
        >
          <FontAwesomeIcon
            icon={faPowerOff}
            className="text-red-600"
            fixedWidth
          />
          <span className={`ml-3 ${isPinned ? 'sidebar-text' : ''}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DrawerItems;