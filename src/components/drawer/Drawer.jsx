import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from '../../lib/context/settings';
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import DrawerItems from "./DrawerItems";

const AppDrawer = () => {
  const { sidePanelMode } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Set drawer to open by default on desktop
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop && sidePanelMode === 'auto') {
      setIsOpen(true);
    }
  }, [sidePanelMode]);

  // Auto-close on mobile when route changes
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && sidePanelMode === 'auto') {
      setIsOpen(false);
    }
  }, [location.pathname, sidePanelMode]);

  // Apply layout class for sidebar mode
  useEffect(() => {
    if (sidePanelMode === 'pinned') {
      document.body.classList.add('sidebar-layout');
    } else {
      document.body.classList.remove('sidebar-layout');
    }
    
    return () => {
      document.body.classList.remove('sidebar-layout');
    };
  }, [sidePanelMode]);

  // Handle focus out for 'auto' mode
  useEffect(() => {
    if (sidePanelMode !== 'auto') return
    if (!isOpen) return
    const handleClick = (e) => {
      if (!document.querySelector('.drawer-content')?.contains(e.target)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [sidePanelMode, isOpen])

  const toggleDrawer = () => setIsOpen((prev) => !prev)

  // Render sidebar for 'pinned' mode
  if (sidePanelMode === 'pinned') {
    return (
      <>
        <div className="sidebar">
          <DrawerItems setIsDrawerOpen={() => {}} toggleDrawer={() => {}} />
        </div>
        <style jsx global>{`
          .sidebar {
            width: 280px;
            height: 100vh;
            background-color: white;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
            position: fixed;
            left: 0;
            top: 0;
            z-index: 1000;
          }
          
          .sidebar-layout {
            padding-left: 280px;
          }
          
          @media (max-width: 767px) {
            .sidebar {
              width: 240px;
            }
            
            .sidebar-layout {
              padding-left: 240px;
            }
          }
        `}</style>
      </>
    );
  }

  // Render drawer for other modes
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
        }
        
        @media (min-width: 768px) {
          body:not(.sidebar-layout) .drawer-content {
            position: fixed !important;
          }
        }
      `}</style>
    </>
  )
}

export default AppDrawer;