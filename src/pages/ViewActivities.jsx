import React, { useState } from "react";
import { useBabyActivities } from "../lib/context/activities";
import { useUser } from "../lib/context/user";
import ActivityTime from "../components/ActivityTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faBaby,
  faCapsules,
  faSun,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

const getActivityCardColor = (activityName) => {
  switch (activityName) {
    case "Feed":
      return "bg-blue-100";
    case "Diaper":
      return "bg-green-100";
    case "Vitamin D":
      return "bg-yellow-100";
    case "Medicine":
      return "bg-purple-100";
    default:
      return "bg-gray-100";
  }
};

export function ViewActivities() {
  const activities = useBabyActivities();
  const user = useUser();
  const [selectedActivity, setSelectedActivity] = useState(null);

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
        className={`${
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
    setSelectedActivity(null);
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

  const toggleMenu = (activityId) => {
    setSelectedActivity(selectedActivity === activityId ? null : activityId);
  };

  return (
    <div className="container mx-auto p-4 sm:px-6 lg:px-8">
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Latest Activities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activities.current
            .sort((a, b) => new Date(b.activityTime) - new Date(a.activityTime))
            .map((activity) => (
              <div
                key={activity.$id}
                className={`flex flex-col border border-gray-200 rounded-md p-4 ${getActivityCardColor(
                  activity.activityName
                )}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-lg">
                    {renderActivityIcon(activity.activityName)}{" "}
                    {activity.activityName}
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(activity.$id)}
                      className="focus:outline-none"
                    >
                      <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                    </button>
                    {selectedActivity === activity.$id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => deleteActivity(activity.$id)}
                          className="block w-full py-2 px-4 text-left text-gray-700 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p>
                  {/* <span className="font-bold">Quantity / Unit:</span>{" "} */}
                  {activity.value} {activity.unit}
                </p>
                <div className="mt-2">
                  {/* <span className="font-bold">Time:</span>{" "} */}
                  {renderActivityTime(
                    activity.activityName,
                    activity.activityTime
                  )}
                </div>
                <ActivityTime
                  className="mt-2"
                  activityName={activity.activityName}
                  activityTime={activity.activityTime}
                />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
