import React from "react";
import { useLocation, Link } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path
      ? "active border border-xl rounded-xl"
      : "";
  };

  return (
    <div className="btm-nav">
      <Link to="/" className={` text-pink-600 ${isActive("/")}`}>
        <span className="btm-nav-label">Home</span>
      </Link>
      <Link
        to="/activities"
        className={` text-blue-600 border-blue-600 ${isActive("/activities")}`}
      >
        <span className="btm-nav-label">Activities</span>
      </Link>
      <Link
        to="/view-activities"
        className={` text-teal-600 ${isActive("/view-activities")}`}
      >
        <span className="btm-nav-label">View</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
