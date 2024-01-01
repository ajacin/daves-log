import { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useBabyActivities } from "../lib/context/activities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export function Home() {
  const user = useUser();
  const activities = useBabyActivities();
  const [latestActivities, setLatestActivities] = useState([]);

  useEffect(() => {
    const filterFeedDiaperVitamind = activities.current.filter(
      (each) =>
        each.activityName === "Feed" ||
        each.activityName === "Diaper" ||
        each.activityName === "Vitamin D"
    );
    const sortedActivities = filterFeedDiaperVitamind.sort(
      (a, b) => new Date(b.activityTime) - new Date(a.activityTime)
    );
    const activitiesByName = sortedActivities.reduce((acc, activity) => {
      if (!acc[activity.activityName]) {
        acc[activity.activityName] = activity;
      }
      return acc;
    }, {});
    setLatestActivities(Object.values(activitiesByName));
  }, [activities]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {user.current ? (
        <section className="mt-8 border border-purple-700 p-2 rounded">
          <strong className="text-md font-bold mb-4">
            Latest Stats from last 10 activities
          </strong>
          {latestActivities.map((activity) => {
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
              <div className="flex gap-2 m-2">
                <FontAwesomeIcon
                  color={timeDifference > cutOffTime ? "red" : "green"}
                  icon={faExclamationCircle}
                  className="h-6 w-6"
                />

                <p key={activity.id}>
                  {activity.activityName}
                  {/* {activityDate.toLocaleTimeString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })} */}
                </p>
                <p
                  className={` ${
                    timeDifference > cutOffTime
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {timeDifference > cutOffTime ? "NOT OK" : "OK"}
                </p>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="mt-8">
          <p className="text-lg">Please login to view dashboard.</p>
        </section>
      )}
    </div>
  );
}
