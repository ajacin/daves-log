import React, { useState, useCallback, useEffect } from "react";
import { useBabyActivities } from "../lib/context/activities";
import ActivityTime from "../components/ActivityTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faClock,
  faListCheck,
  faDroplet,
  faRuler,
  faExclamationTriangle,
  faWifi,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { ActivityIcon } from "../components/ActivityIcon";
// import Clock from "../components/Clock";

const getActivityCardColor = (activityName) => {
  switch (activityName) {
    case "Feed":
      return "from-blue-50 to-blue-100 border-blue-500";
    case "Diaper":
      return "from-violet-50 to-violet-100 border-violet-500";
    case "Vitamin D":
      return "from-pink-50 to-pink-100 border-pink-500";
    case "Medicine":
      return "from-purple-50 to-purple-100 border-purple-500";
    default:
      return "from-gray-50 to-gray-100 border-gray-500";
  }
};

const getUnitIcon = (unit) => {
  switch (unit?.toLowerCase()) {
    case "ml":
      return faDroplet;
    case "unit":
      return faRuler;
    default:
      return null;
  }
};

export function ViewActivities() {
  const {
    current: activities,
    remove: deleteActivity,
    isLoading,
    error,
    hasPermission,
    isOffline,
    retry,
  } = useBabyActivities();

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
          className={`flex gap-1 text-sm font-medium rounded-full px-3 py-1 items-center ${
            cutOffPassed
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <FontAwesomeIcon icon={faClock} className="mr-1" size="sm" />
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

  const toggleMenu = useCallback((id) => {
    setSelectedActivity((prev) => (prev === id ? null : id));
  }, []);

  // Add auto-retry on regaining connection
  useEffect(() => {
    const handleOnline = () => {
      retry();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [retry]);

  if (!hasPermission) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="h-5 w-5 text-yellow-400"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have permission to view activities. Please contact an
                administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-4">
          <div
            className={`border-l-4 p-4 ${
              isOffline
                ? "bg-blue-50 border-blue-400"
                : "bg-red-50 border-red-400"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon
                  icon={isOffline ? faWifi : faExclamationTriangle}
                  className={`h-5 w-5 ${
                    isOffline ? "text-blue-400" : "text-red-400"
                  }`}
                />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    isOffline ? "text-blue-700" : "text-red-700"
                  }`}
                >
                  {error}
                  {isOffline && (
                    <button
                      onClick={retry}
                      className="ml-2 underline hover:text-blue-900"
                    >
                      Retry
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Last 24 hours</h2>
          {/* <Clock></Clock> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <FontAwesomeIcon
                icon={faList}
                className="h-12 w-12 text-gray-400 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No activities found
              </h3>
              <p className="text-gray-500">
                Activities from the last 24 hours will appear here.
              </p>
            </div>
          ) : (
            activities
              .sort(
                (a, b) => new Date(b.activityTime) - new Date(a.activityTime)
              )
              .map((activity) => (
                <div
                  key={activity.$id}
                  className={`relative flex flex-col bg-gradient-to-br shadow-lg rounded-xl overflow-hidden border-l-4 ${getActivityCardColor(
                    activity.activityName
                  )}`}
                >
                  <div className="absolute top-3 right-3">
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(activity.$id)}
                        className="p-1 hover:bg-black/5 rounded-full transition-colors duration-200"
                      >
                        <FontAwesomeIcon
                          icon={faEllipsisV}
                          className="h-4 w-4 text-gray-600"
                        />
                      </button>
                      {selectedActivity === activity.$id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => deleteActivity(activity.$id)}
                            className="block w-full py-2 px-4 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <ActivityIcon activityName={activity.activityName} />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {activity.activityName}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activity.value && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          {getUnitIcon(activity.unit) && (
                            <FontAwesomeIcon
                              icon={getUnitIcon(activity.unit)}
                              className="h-4 w-4"
                            />
                          )}
                          <span className="font-medium">
                            {activity.value} {activity.unit}
                          </span>
                        </div>
                      )}

                      {activity.remarks && (
                        <div className="flex items-start space-x-2 text-gray-600">
                          <FontAwesomeIcon
                            icon={faListCheck}
                            className="h-4 w-4 mt-1"
                          />
                          <p className="text-sm">{activity.remarks}</p>
                        </div>
                      )}

                      <div className="flex flex-col space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {new Date(activity.activityTime).toLocaleTimeString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          {renderActivityTime(
                            activity.activityName,
                            activity.activityTime,
                            true
                          )}
                        </div>
                        <div className="text-sm">
                          <ActivityTime
                            activityName={activity.activityName}
                            activityTime={activity.activityTime}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
}
