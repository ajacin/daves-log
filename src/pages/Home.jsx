import React, { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useBabyActivities } from "../lib/context/activities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faBook } from "@fortawesome/free-solid-svg-icons";
import LastActivity from "../components/LastActivity";
import { LineWave } from "react-loader-spinner";
import BucketList from "../components/BucketList";

export function Home() {
  const user = useUser();
  const activities = useBabyActivities();
  const [latestActivities, setLatestActivities] = useState([]);

  useEffect(() => {
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
  }, [activities]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {user.current ? (
        <>
          <section className="mt-8 bg-purple-100 p-4 rounded">
            <strong className="text-lg font-bold mb-4">Last 24 Hours</strong>
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
                <div key={activity.$id} className="flex items-center m-2">
                  <FontAwesomeIcon
                    color={timeDifference > cutOffTime ? "red" : "green"}
                    icon={faExclamationCircle}
                    className="h-6 w-6 mr-2"
                  />
                  <LastActivity name={activity.activityName} />
                </div>
              );
            })}
          </section>
          <section className="mt-6">
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <a
                href="https://ajacin.notion.site/Thermometer-Reading-87631db6625c45608bc21d895b4ab917"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-white bg-blue-500 rounded-lg shadow-lg text-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
              >
                <FontAwesomeIcon icon={faBook} className="h-6 w-6 mr-2" />
                Thermometer Manual
              </a>
            </div>
          </section>
          <section className="mt-6">
            <BucketList />
          </section>
        </>
      ) : (
        <section className="flex justify-center items-center mt-8">
          <LineWave
            visible={true}
            height={200}
            width={200}
            color="#4fa94d"
            ariaLabel="line-wave-loading"
            wrapperStyle={{}}
            wrapperClass=""
            firstLineColor="red"
            middleLineColor="blue"
            lastLineColor="green"
          />
        </section>
      )}
    </div>
  );
}
