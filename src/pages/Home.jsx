import React, { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useBabyActivities } from "../lib/context/activities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faEye,
  faLightbulb,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import LastActivity from "../components/LastActivity";
import { ColorRing } from "react-loader-spinner";
import BucketList from "../components/BucketList";
import { Fab, Action } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";
import { useNavigate } from "react-router-dom";

export function Home() {
  const user = useUser();
  const activities = useBabyActivities();
  const navigate = useNavigate();
  const [latestActivities, setLatestActivities] = useState([]);

  ///FAB
  // Placeholder values for FAB
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
    bottom: 20,
    right: 20,
  };

  const event = "click";

  // Placeholder function for FAB main button
  // const someFunctionForTheMainButton = () => {
  //   console.log("Main button clicked");
  //   // Add your logic here
  // };

  // Placeholder function for FAB action button
  const handleAddOnClick = () => {
    navigate("/activities");
  };

  // Placeholder function for another FAB action button
  const handleHelpOnClick = () => {
    console.log("Help action clicked");
    navigate("/view-activities");
    // Add your logic here
  };

  // Placeholder function for a custom FAB action button
  // const handleTheFooBarOnClick = () => {
  //   console.log("FooBar action clicked");
  //   // Add your logic here
  // };
  ///END OF FAB

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 justify-center items-center">
      {user.current ? (
        <>
          <section className="mt-8 border-xl p-4 rounded">
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
                <div class="p-6 max-w-sm w-full md-w-auto mx-auto bg-white rounded-xl shadow-md flex space-x-4 mt-6">
                  <div class="flex-shrink-0">
                    <svg
                      class={
                        timeDifference > cutOffTime
                          ? "h-12 w-12 text-red-200"
                          : "h-12 w-12 text-green-500"
                      }
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <LastActivity
                      name={activity.activityName}
                      threshold={cutOffTime}
                    />
                  </div>
                </div>
              );
            })}
          </section>
          <section className="mt-6">
            <div className="flex justify-start items-start">
              <a
                href="https://ajacin.notion.site/Thermometer-Reading-87631db6625c45608bc21d895b4ab917"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-black  hover:bg-blue-600 transition-colors duration-200 flex items-center"
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
        <div className="flex w-full h-screen justify-center items-center">
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
      )}

      {user?.current?.labels.includes("admin") && (
        <Fab
          mainButtonStyles={mainButtonStyles}
          actionButtonStyles={actionButtonStyles}
          style={style}
          icon={<FontAwesomeIcon icon={faLightbulb} className="h-6 w-6" />}
          event={event}
          alwaysShowTitle={true}
          v
          // onClick={someFunctionForTheMainButton}
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
          {/* add custom components */}
          {/* <div text="Quick Actions" onClick={handleTheFooBarOnClick}>
            <i className="fa fa-foo-bar-fa-foo" />
          </div> */}
        </Fab>
      )}
    </div>
  );
}
