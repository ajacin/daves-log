import React, { useState, useEffect } from "react";
import ReactTimeAgo from "react-time-ago";

const ActivityTime = ({ activityName, activityTime }) => {
  const getTimeDifference = (activityTime) => {
    const now = new Date();
    const activityDate = new Date(activityTime);
    const timeDifference = (now - activityDate) / (1000 * 60 * 60); // returns time difference in hours
    return timeDifference;
  };

  const [timeDifference, setTimeDifference] = useState(() =>
    getTimeDifference(activityTime)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeDifference(getTimeDifference(activityTime));
    }, 1000);

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [activityTime]);

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
      <ReactTimeAgo date={activityTime} locale="en-US" />
      {/* <p> / {cutOffTime} hours </p> */}
    </div>
  );
};

export default ActivityTime;
