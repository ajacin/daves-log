import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "../Navbar";
import { useUser } from "../../lib/context/user";

const DrawerItems = ({ setIsDrawerOpen, toggleDrawer }) => {
  const user = useUser();
  return (
    <div className="flex flex-col gap-1 align-start justify-between text-black h-screen">
      <div>
        <div
          className="flex justify-start gap-2 m-2 items-center"
          onClick={toggleDrawer}
        >
          <FontAwesomeIcon
            color={"RED"}
            icon={faBars}
            className="m-1"
            size="xl"
          />
          <p>DAVE'S LOG</p>
        </div>
        <div className="border"></div>
        <Navbar setIsDrawerOpen={setIsDrawerOpen}></Navbar>
      </div>
      <div>
        <div className="flex justify-start gap-2 justify-self-end  m-2">
          <FontAwesomeIcon
            color={"RED"}
            icon={faPowerOff}
            className="m-1"
            //   size="small"
          />
          <button onClick={() => user.logout()}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default DrawerItems;
