import React from "react";
import { useBabyActivities } from "../lib/context/activities";
import { useUser } from "../lib/context/user";
import ActivityTime from "../components/ActivityTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faBaby,
  faCapsules,
  faSun,
} from "@fortawesome/free-solid-svg-icons";

export function ViewActivities() {
  const activities = useBabyActivities();
  const user = useUser();

  const renderActivityTime = (activityName, activityTime) => {
    const now = new Date();
    const activityDate = new Date(activityTime);
    const timeDifference = (now - activityDate) / (1000 * 60 * 60);

    const cutOffTime =
      activityName === "Feed"
        ? 3
        : activityName === "Diaper"
        ? 5
        : activityName === "Vitamin D"
        ? 24
        : 24;

    return (
      <div
        className={` ${
          timeDifference > cutOffTime ? "text-red-500" : "text-green-500"
        }`}
      >
        {activityDate.toLocaleTimeString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    );
  };

  const deleteActivity = (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      if (user.current) {
        activities.remove(id);
      } else {
        alert("Please login to delete an activity.");
        return;
      }
    }
  };

  const renderActivityIcon = (activityName) => {
    const iconColor = "purple";
    switch (activityName) {
      case "Feed":
        return (
          <FontAwesomeIcon
            color={iconColor}
            icon={faUtensils}
            className="h-6 w-6"
          />
        );
      case "Diaper":
        return (
          <FontAwesomeIcon
            color={iconColor}
            icon={faBaby}
            className="h-6 w-6"
          />
        );
      case "Vitamin D":
        return (
          <FontAwesomeIcon color={iconColor} icon={faSun} className="h-6 w-6" />
        );
      case "Medicine":
        return (
          <FontAwesomeIcon
            color={iconColor}
            icon={faCapsules}
            className="h-6 w-6"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Latest Activities
        </h2>
        <div className="bg-white shadow-md rounded m-4">
          {activities.current
            .sort((a, b) => new Date(b.activityTime) - new Date(a.activityTime))
            .map((activity) => (
              <div
                className="flex flex-col sm:flex-row border-b border-grey-light py-4 m-2 relative"
                key={activity.$id}
              >
                <div className="w-full sm:w-1/4 px-6 mb-4 sm:mb-0">
                  <h4 className=" hidden md:flex font-bold uppercase text-sm text-grey">
                    Activity
                  </h4>
                  <p className="font-bold text-2xl md:text-lg">
                    {renderActivityIcon(activity.activityName)}{" "}
                    {activity.activityName}
                  </p>
                </div>
                <div className="w-full sm:w-1/4 px-6 mb-2 sm:mb-0">
                  <h4 className="hidden md:flex font-bold uppercase text-sm text-grey">
                    Description
                  </h4>
                  <p>
                    {activity.value} {activity.unit}
                  </p>
                </div>
                <div className="w-full sm:w-1/4 px-6 mb-4 sm:mb-0">
                  <h4 className="hidden md:flex font-bold uppercase text-sm text-grey">
                    Time
                  </h4>
                  <div className="">
                    {renderActivityTime(
                      activity.activityName,
                      activity.activityTime
                    )}
                  </div>
                  <ActivityTime
                    className=" top-0"
                    activityName={activity.activityName}
                    activityTime={activity.activityTime}
                  />
                </div>
                <div className="w-full sm:w-1/4 px-6">
                  <h4 className="hidden md:flex font-bold uppercase text-sm text-grey">
                    Actions
                  </h4>
                  <button
                    className="text-red-400 border border-red-400 rounded px-2 py-1 hover:bg-red-400 hover:text-white transition duration-300 ease-in-out"
                    onClick={() => deleteActivity(activity.$id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
