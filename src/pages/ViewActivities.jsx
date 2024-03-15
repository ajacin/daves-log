import React, { useState } from "react";
import { useBabyActivities } from "../lib/context/activities";
import { useUser } from "../lib/context/user";
import ActivityTime from "../components/ActivityTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faClock,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { ActivityIcon } from "../components/ActivityIcon";
// import Clock from "../components/Clock";

const getActivityCardColor = (activityName) => {
  switch (activityName) {
    case "Feed":
      // return "bg-blue-100";
      return "border-blue-500";
    case "Diaper":
      return "border-violet-500";
    case "Vitamin D":
      return "border-pink-500";
    case "Medicine":
      return "border-purple-500";
    default:
      return "border-gray-500";
  }
};

export function ViewActivities() {
  const activities = useBabyActivities();
  const user = useUser();
  const [selectedActivity, setSelectedActivity] = useState(null);

  const renderActivityTime = (
    activityName,
    activityTime,
    displayTimeOnly = false
  ) => {
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

    const cutOffPassed = timeDifference > cutOffTime;

    if (displayTimeOnly) {
      return (
        <div
          className={`flex gap-1 text-lg text-center rounded-md border-x-4 font-digital-7 text-black pr-1 items-center ${
            cutOffPassed ? "border-red-400" : "border-green-400"
          } `}
        >
          <FontAwesomeIcon
            // color={"whi}
            icon={faClock}
            className="m-1"
            size="sm"
          />
          {activityDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      );
    }

    return (
      <div className={`${cutOffPassed ? "text-red-500" : "text-green-500"}`}>
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

  // const ActivityIcon = ({ activityName }) => {
  //   const iconColor = "purple";
  //   switch (activityName) {
  //     case "Feed":
  //       return (
  //         <FontAwesomeIcon
  //           color={iconColor}
  //           icon={faUtensils}
  //           className="h-6 w-6"
  //         />
  //       );
  //     case "Diaper":
  //       return (
  //         <FontAwesomeIcon
  //           color={iconColor}
  //           icon={faBaby}
  //           className="h-6 w-6"
  //         />
  //       );
  //     case "Vitamin D":
  //       return (
  //         <FontAwesomeIcon color={iconColor} icon={faSun} className="h-6 w-6" />
  //       );
  //     case "Medicine":
  //       return (
  //         <FontAwesomeIcon
  //           color={iconColor}
  //           icon={faCapsules}
  //           className="h-6 w-6"
  //         />
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const toggleMenu = (activityId) => {
    setSelectedActivity(selectedActivity === activityId ? null : activityId);
  };

  return (
    <div className="container mx-auto p-4 sm:px-6 lg:px-8">
      <section className="mt-12">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Last 24 hours
          </h2>
          {/* <Clock></Clock> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activities.current
            .sort((a, b) => new Date(b.activityTime) - new Date(a.activityTime))
            .map((activity) => (
              <div
                key={activity.$id}
                className={`flex flex-col bg-white shadow-xl  rounded-md p-4 border-l-8 border-solid ${getActivityCardColor(
                  activity.activityName
                )}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-lg w-[55%]">
                    <ActivityIcon activityName={activity.activityName} />{" "}
                    {activity.activityName}
                  </p>
                  <div>
                    {renderActivityTime(
                      activity.activityName,
                      activity.activityTime,
                      true
                    )}
                  </div>
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
                <div>
                  {activity.remarks ? (
                    <div>
                      {" "}
                      <FontAwesomeIcon icon={faListCheck} className="mr-2" />
                      {activity.remarks}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
