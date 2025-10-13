import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faListCheck, 
  faGaugeHigh, 
  faNotesMedical, 
  faCalendarDays, 
  faRobot, 
  faUserGroup,
  faGear
} from "@fortawesome/free-solid-svg-icons";
import { useSettings } from "../lib/context/settings";

export function Navbar({ setIsDrawerOpen }) {
  const { sidePanelMode } = useSettings();
  const isPinned = sidePanelMode === 'pinned';
  
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  
  const navItems = [
    { 
      to: "/dashboard", 
      icon: faListCheck, 
      text: "Tasks",
      color: "text-emerald-600" 
    },
    { 
      to: "/dashboard/dashboard", 
      icon: faGaugeHigh, 
      text: "Dashboard",
      color: "text-cyan-600" 
    },
    { 
      to: "/dashboard/activities", 
      icon: faNotesMedical, 
      text: "Log Activities",
      color: "text-blue-600" 
    },
    { 
      to: "/dashboard/view-activities", 
      icon: faCalendarDays, 
      text: "View Activities",
      color: "text-indigo-600" 
    },
    { 
      to: "/dashboard/automations", 
      icon: faRobot, 
      text: "Automations",
      color: "text-purple-600" 
    },
    { 
      to: "/dashboard/invitees", 
      icon: faUserGroup, 
      text: "Invitees",
      color: "text-pink-600" 
    },
    { 
      to: "/dashboard/settings", 
      icon: faGear, 
      text: "Settings",
      color: "text-gray-600" 
    }
  ];
  
  return (
    <nav className={`p-2 mt-0 mb-4 ${isPinned ? 'sidebar-nav' : ''}`}>
      <div className="container mx-auto flex flex-wrap items-center">
        <div className="flex w-full">
          <ul className="flex flex-col pl-0 mb-0 list-none text-gray-700 w-full">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link
                  onClick={closeDrawer}
                  className={`px-3 py-3 flex items-center text-xs uppercase font-bold leading-snug hover:bg-gray-50 rounded-lg my-1 transition-all duration-200 ${
                    item.to === "/dashboard" ? "text-blue-600 hover:text-blue-800" : "hover:opacity-90"
                  }`}
                  to={item.to}
                  title={item.text}
                >
                  <div className={`flex items-center ${isPinned ? 'justify-center w-full' : 'justify-start w-full'}`}>
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className={`${item.color} ${isPinned ? 'text-xl' : ''}`}
                      fixedWidth
                    />
                    <span className={`text-base transition-all duration-200 ml-3 ${isPinned ? 'sidebar-text' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <style jsx global>{`
        @media (max-width: 767px) {
          .sidebar-layout .sidebar {
            width: 70px !important;
          }
          
          .sidebar-layout {
            padding-left: 70px !important;
          }
          
          .sidebar-nav .sidebar-text {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}