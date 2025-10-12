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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Activity History</h1>
          <p className="text-sm lg:text-base text-slate-600 mt-1">View all your baby's logged activities</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6">
              <div
                className={`border-l-4 p-4 rounded-r-xl ${
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
                          className="ml-2 underline hover:text-blue-900 transition-colors duration-200"
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

          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">All Activities</h2>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faList} className="text-slate-500" />
                  <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded-full">
                    {activities.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faList} className="text-slate-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">No activities yet</h3>
                  <p className="text-slate-500">Start logging activities to see them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities
                    .sort(
                      (a, b) => new Date(b.activityTime) - new Date(a.activityTime)
                    )
                    .map((activity) => (
                      <div
                        key={activity.$id}
                        className="relative bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors duration-200"
                      >
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(activity.$id)}
                              className="p-1 hover:bg-slate-200 rounded-full transition-colors duration-200"
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisV}
                                className="h-4 w-4 text-slate-600"
                              />
                            </button>
                            {selectedActivity === activity.$id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
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

                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <ActivityIcon activityName={activity.activityName} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-slate-800 text-lg">
                                {activity.activityName}
                              </h3>
                              {renderActivityTime(
                                activity.activityName,
                                activity.activityTime,
                                true
                              )}
                            </div>

                            <div className="space-y-2">
                              {activity.value && (
                                <div className="flex items-center space-x-2 text-slate-600">
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
                                <div className="flex items-start space-x-2 text-slate-600">
                                  <FontAwesomeIcon
                                    icon={faListCheck}
                                    className="h-4 w-4 mt-1"
                                  />
                                  <p className="text-sm">{activity.remarks}</p>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>
                                  {new Date(activity.activityTime).toLocaleDateString(
                                    undefined,
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                                <ActivityTime
                                  activityName={activity.activityName}
                                  activityTime={activity.activityTime}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
