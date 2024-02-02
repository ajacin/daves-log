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
    window.scrollTo(0, 0);
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

              /*
              <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
  <div class="flex-shrink-0">
    <svg class="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
  <div>
    <div class="text-xl font-medium text-black">Last Feed</div>
    <p class="text-gray-500">Fed 2 hours and 3 minutes ago.</p>
  </div>
</div>

<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 mt-6">
  <div class="flex-shrink-0">
    <svg class="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
  <div>
    <div class="text-xl font-medium text-black">Last Diaper Change</div>
    <p class="text-gray-500">Changed 1 hour and 30 minutes ago.</p>
  </div>
</div>

<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 mt-6">
  <div class="flex-shrink-0">
    <svg class="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
  <div>
    <div class="text-xl font-medium text-black">Last Vitamin D Intake</div>
    <p class="text-gray-500">Taken 3 hours and 15 minutes ago.</p>
  </div>
</div>
              */

              return (
                <div key={activity.$id} className="flex items-center m-2">
                  <FontAwesomeIcon
                    color={timeDifference > cutOffTime ? "red" : "green"}
                    icon={faExclamationCircle}
                    className="h-6 w-6 mr-2"
                  />
                  <LastActivity
                    name={activity.activityName}
                    threshold={cutOffTime}
                  />
                </div>
              );
            })}
          </section>
          <section className="mt-6">
            <div className="flex justify-center items-center bg-gray-100 border border-red-300 rounded">
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
