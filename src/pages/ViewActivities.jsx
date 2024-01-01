import React from "react";
import { useBabyActivities } from "../lib/context/activities";
import { useUser } from "../lib/context/user";
import ActivityTime from "../components/ActivityTime";

export function ViewActivities() {
  const activities = useBabyActivities();
  const user = useUser();

  const renderActivityTime = (activityTime) => {
    const now = new Date();
    const activityDate = new Date(activityTime);
    const timeDifference = (now - activityDate) / (1000 * 60 * 60);

    return (
      <div
        className={` ${
          timeDifference > 3 ? "text-red-500" : "text-green-500"
        }`}
      >
        {activityDate.toLocaleString()}
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Latest Activities
        </h2>
        <div className="bg-white shadow-md rounded m-4">
          {activities.current.map((activity) => (
            <div
              className="flex flex-col sm:flex-row border-b border-grey-light py-4 m-2 relative"
              key={activity.$id}
            >
              <div className="w-full sm:w-1/4 px-6 mb-4 sm:mb-0">
                <h4 className="font-bold uppercase text-sm text-grey">
                  Activity
                </h4>
                <p>{activity.activityName}</p>
              </div>
              <div className="w-full sm:w-1/4 px-6 mb-4 sm:mb-0">
                <h4 className="font-bold uppercase text-sm text-grey">
                  Description
                </h4>
                <p>
                  {activity.value} {activity.unit}
                </p>
              </div>
              <div className="w-full sm:w-1/4 px-6 mb-4 sm:mb-0">
                <h4 className="font-bold uppercase text-sm text-grey">
                  Time
                </h4>
                <p>{renderActivityTime(activity.activityTime)}</p>
                
              </div>
              <div className="w-full sm:w-1/4 px-6">
                <h4 className="font-bold uppercase text-sm text-grey">
                  Actions
                </h4>
                <button
                  className="text-red-400"
                  onClick={() => deleteActivity(activity.$id)}
                >
                  Delete
                </button>
              </div>
              <ActivityTime className="absolute right-1 top-0" activityTime={activity.activityTime} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}