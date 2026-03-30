import React, { useState } from "react";
import Drawer from "react-modern-drawer";
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
        className="fixed z-[1001] p-2 rounded border border-td-border bg-td-bg hover:bg-td-hover transition-colors cursor-pointer focus:outline-none left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))]"
        aria-label="Menu"
      >
        <FontAwesomeIcon
          icon={faBars}
          className="w-3.5 h-3.5 text-td-muted"
        />
      </button>

      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        size={240}
        zIndex={1000}
        className="drawer-content"
      >
        <DrawerItems setIsDrawerOpen={setIsOpen} toggleDrawer={toggleDrawer} />
      </Drawer>

      <style jsx global>{`
        .drawer-content {
          background-color: white !important;
          border-right: 1px solid var(--td-border) !important;
        }
        .EZDrawer__overlay {
          z-index: 999 !important;
          background-color: rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </>
  );
};

export default AppDrawer;
