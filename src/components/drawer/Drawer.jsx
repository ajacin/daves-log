import React from "react";

// import component 👇
import Drawer from "react-modern-drawer";

//import styles 👇
import "react-modern-drawer/dist/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import DrawerItems from "./DrawerItems";

const AppDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const toggleDrawer = () => {
    setIsDrawerOpen((prevState) => !prevState);
  };

  return (
    <>
      <button onClick={toggleDrawer} className=" p-2">
        <FontAwesomeIcon
          color={"white"}
          icon={faBars}
          className="m-1"
          size="xl"
        />
      </button>
      <Drawer
        open={isDrawerOpen}
        onClose={toggleDrawer}
        direction="left"
        className="text-white"
        overlayColor={"purple"}
      >
        <DrawerItems
          setIsDrawerOpen={setIsDrawerOpen}
          toggleDrawer={toggleDrawer}
        ></DrawerItems>
      </Drawer>
    </>
  );
};

export default AppDrawer;
