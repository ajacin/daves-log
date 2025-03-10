import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../lib/context/user";
import { useBabyActivities } from "../lib/context/activities";
import { useIdeas } from "../lib/context/ideas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBucket,
  faEye,
  faNavicon,
  faPlus,
  faListUl,
  faCircleCheck,
  faCircleXmark,
  faUser,
  faCalendarDay,
  faExclamationTriangle,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import LastActivity from "../components/LastActivity";
import { ColorRing } from "react-loader-spinner";
import { Fab, Action } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import toast from 'react-hot-toast';

export function Dashboard() {
  const { current: user } = useUser();
  const activities = useBabyActivities();
  const ideas = useIdeas();
  const navigate = useNavigate();
  const [latestActivities, setLatestActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  // FAB Configuration
  const mainButtonStyles = {
    backgroundColor: "#007BFF",
    color: "white",
  };

  const actionButtonStyles = {
    backgroundColor: "#fff",
    color: "white",
  };

  const style = {
    position: "fixed",
    bottom: 10,
    right: 10,
  };

  const event = "click";

  const handleAddOnClick = () => {
    navigate("/dashboard/activities");
  };

  const handleHelpOnClick = () => {
    navigate("/dashboard/view-activities");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const initializeIdeas = async () => {
      if (!initRef.current && !ideas.initialized) {
        setIsLoading(true);
        try {
          await ideas.init();
        } catch (error) {
          console.error("Error initializing ideas:", error);
          toast.error("Failed to load tasks. Please try again.");
        } finally {
          setIsLoading(false);
          initRef.current = true;
        }
      }
    };

    initializeIdeas();
  }, [navigate, user, ideas]);

  useEffect(() => {
    if (!activities?.current) return;

    const filterFeedDiaperVitaminD = activities.current.filter(
      (each) =>
        each.activityName === "Feed" ||
        each.activityName === "Diaper" ||
        each.activityName === "Vitamin D"
    );
    const sortedActivities = filterFeedDiaperVitaminD.sort(
      (a, b) => new Date(b.activityTime) - new Date(a.activityTime)
    );
    const activitiesByName = sortedActivities.reduce((acc, activity) => {
      if (!acc[activity.activityName]) {
        acc[activity.activityName] = activity;
      }
      return acc;
    }, {});
    setLatestActivities(Object.values(activitiesByName));
    window.scrollTo(0, 0);
  }, [activities]);

  // Calculate dashboard statistics
  const dashboardStats = {
    totalTasks: ideas.current?.length || 0,
    completedTasks: ideas.current?.filter(idea => idea.completed).length || 0,
    completedToday: ideas.current?.filter(idea => {
      if (!idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedDate = new Date(idea.completedAt || idea.entryDate);
      return completedDate >= today;
    }).length || 0,
    completedByMe: ideas.current?.filter(idea => 
      idea.completed && idea.userId === user?.$id
    ).length || 0,
    pendingTasks: ideas.current?.filter(idea => !idea.completed).length || 0,
    overdueTasks: ideas.current?.filter(idea => {
      if (!idea.dueDate || idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(idea.dueDate);
      return dueDate < today;
    }).length || 0,
    tasksDueToday: ideas.current?.filter(idea => {
      if (!idea.dueDate || idea.completed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(idea.dueDate);
      return dueDate.getTime() === today.getTime();
    }).length || 0,
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Welcome back, {user.name || 'User'}!
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 justify-center items-center">
              {!activities.hasPermission ? (
                <div className="text-gray-500 text-center py-4 bg-white rounded-lg shadow-md mt-8">
                  You don't have permission to view baby activities
                </div>
              ) : (
                <section className="mt-8 border-xl p-4 rounded">
                  <strong className="text-lg font-bold mb-4">Last 24 Hours</strong>
                  {latestActivities.length > 0 ? (
                    latestActivities.map((activity) => {
                      const now = new Date();
                      const activityDate = new Date(activity.activityTime);
                      const cutOffTime =
                        activity.activityName === "Feed"
                          ? 3
                          : activity.activityName === "Diaper"
                          ? 5
                          : activity.activityName === "Vitamin D"
                          ? 24
                          : 24;
                      const timeDifference = (now - activityDate) / (1000 * 60 * 60);

                      return (
                        <div key={activity.activityTime} className="p-6 max-w-sm w-full md-w-auto mx-auto bg-white rounded-xl shadow-md flex space-x-4 mt-6">
                          <div className="flex-shrink-0">
                            <ActivityIcon
                              activityName={activity.activityName}
                              color={timeDifference > cutOffTime ? "red" : "green"}
                            />
                          </div>
                          <div>
                            <LastActivity
                              name={activity.activityName}
                              threshold={cutOffTime}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No recent activities found
                    </div>
                  )}
                </section>
              )}

              <section className="mt-6">
                <div className="flex justify-start items-start">
                  <a
                    href="https://ajacin.notion.site/Thermometer-Reading-87631db6625c45608bc21d895b4ab917"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-black hover:bg-blue-600 transition-colors duration-200 flex items-center"
                  >
                    <FontAwesomeIcon icon={faBook} className="h-6 w-6 mr-2" />
                    Thermometer Manual
                  </a>
                  <a
                    href="https://ajacin.notion.site/Bucket-List-of-Places-2024-f800a995a8f943139d45cd1f7b638b50?pvs=4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-black hover:bg-blue-600 transition-colors duration-200 flex items-center"
                  >
                    <FontAwesomeIcon icon={faBucket} className="h-6 w-6 mr-2" />
                    Bucket list
                  </a>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {activities.hasPermission && (
        <Fab
          mainButtonStyles={mainButtonStyles}
          actionButtonStyles={actionButtonStyles}
          style={style}
          icon={<FontAwesomeIcon icon={faNavicon} className="h-6 w-6" />}
          event={event}
          alwaysShowTitle={true}
        >
          <Action
            text="Add"
            onClick={handleAddOnClick}
            style={actionButtonStyles}
          >
            <FontAwesomeIcon color="purple" icon={faPlus} className="h-6 w-6" />
          </Action>
          <Action
            text="View"
            onClick={handleHelpOnClick}
            style={actionButtonStyles}
          >
            <FontAwesomeIcon color="purple" icon={faEye} className="h-6 w-6" />
          </Action>
        </Fab>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          
          {!ideas.hasPermission && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Permission Error!</strong>
              <span className="block sm:inline"> You don't have permission to perform this action.</span>
              <button
                onClick={() => ideas.retry()}
                className="ml-4 text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          )}

          {ideas.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {ideas.error}</span>
              <button
                onClick={() => ideas.retry()}
                className="ml-4 text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Tasks</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{dashboardStats.totalTasks}</h3>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faListUl} className="text-blue-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Completed Today</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{dashboardStats.completedToday}</h3>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Completed by Me</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{dashboardStats.completedByMe}</h3>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faUser} className="text-purple-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending Tasks</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{dashboardStats.pendingTasks}</h3>
                </div>
                <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Due Today</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{dashboardStats.tasksDueToday}</h3>
                </div>
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faCalendarDay} className="text-yellow-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Overdue Tasks</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{dashboardStats.overdueTasks}</h3>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                    {Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100)}%
                  </h3>
                </div>
                <div className="bg-indigo-100 p-2 sm:p-3 rounded-full">
                  <FontAwesomeIcon icon={faChartLine} className="text-indigo-500 text-sm sm:text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 