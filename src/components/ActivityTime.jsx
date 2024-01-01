import React, { useState, useEffect } from "react";

const ActivityTime = ({ activityName,activityTime }) => {
  const getTimeDifference = (activityTime) => {
    const now = new Date();
    const activityDate = new Date(activityTime);
    const timeDifference = ((now - activityDate) / (1000 * 60 * 60));  // returns time difference in hours
    return timeDifference;
  }

  const [timeDifference, setTimeDifference] = useState(() => getTimeDifference(activityTime));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeDifference(getTimeDifference(activityTime));
    }, 1000);

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [activityTime]);

  const renderTime = () => {
    if (timeDifference < 1) {
      return "Less than an hour";
    } else if (timeDifference < 2) {
      return "1 - 2 hours";
    } else if (timeDifference < 3) {
      return "2 - 3 hours";
    } else if (timeDifference < 4) {
      return "3 - 4 hours";
    } else if (timeDifference < 5) {
      return "4 - 5 hours";
    } else if (timeDifference < 24) {
      return "More than 5 hours";
    } else {
      return "More than a day";
    }
  }

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
      {renderTime()} / {cutOffTime} hours
    </div>
  );
};

export default ActivityTime;