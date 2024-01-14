import React from "react";

// import component 👇
import Drawer from "react-modern-drawer";

//import styles 👇
import "react-modern-drawer/dist/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "./Navbar";

const AppDrawer = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <button onClick={toggleDrawer}>
        <FontAwesomeIcon
          color={"white"}
          icon={faBars}
          className="m-1"
          size="small"
        />
      </button>
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="left"
        className="text-white"
      >
        <div className="flex flex-col gap-1 align-start justify-start text-black">
          <div className="flex justify-start gap-2 m-2">
            <FontAwesomeIcon
              color={"RED"}
              icon={faBars}
              className="m-1"
              size="small"
            />
            <p>DAVE'S LOG</p>
          </div>
          <Navbar></Navbar>
        </div>
      </Drawer>
    </>
  );
};

export default AppDrawer;
