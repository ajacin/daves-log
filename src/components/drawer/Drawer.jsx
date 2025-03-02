import React, { useState } from "react";

// import component 👇
import Drawer from "react-modern-drawer";

//import styles 👇
import "react-modern-drawer/dist/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import DrawerItems from "./DrawerItems";

const AppDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <button
        onClick={toggleDrawer}
        className="fixed left-4 top-4 z-[1001] p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg shadow-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 cursor-pointer md:left-6 md:top-6 md:p-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 active:scale-95"
      >
        <FontAwesomeIcon
          color="white"
          icon={faBars}
          size="xl"
          className="w-5 h-5 md:w-6 md:h-6"
        />
      </button>

      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        size={280}
        zIndex={1000}
        className="drawer-content"
      >
        <DrawerItems setIsDrawerOpen={setIsOpen} toggleDrawer={toggleDrawer} />
      </Drawer>

      <style jsx global>{`
        .drawer-content {
          background-color: white !important;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        }
        .EZDrawer__overlay {
          z-index: 999 !important;
          background-color: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(2px) !important;
        }
      `}</style>
    </>
  );
};

export default AppDrawer;
