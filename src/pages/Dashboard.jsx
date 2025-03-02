import React, { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useBabyActivities } from "../lib/context/activities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBucket,
  faEye,
  faNavicon,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import LastActivity from "../components/LastActivity";
import { ColorRing } from "react-loader-spinner";
import { Fab, Action } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";

export function Dashboard() {
  const { current: user } = useUser();
  const activities = useBabyActivities();
  const navigate = useNavigate();
  const [latestActivities, setLatestActivities] = useState([]);

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
    if (!activities?.current) return;

    try {
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
    } catch (error) {
      console.error("Error processing activities:", error);
      setLatestActivities([]);
    }
  }, [activities]);

  if (activities.isLoading) {
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
              Welcome back, {user?.name || 'User'}!
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
    </div>
  );
} 