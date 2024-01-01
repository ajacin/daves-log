import React, { useState, useEffect } from "react";

const ActivityTime = ({ activityTime }) => {
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
      return "less than an hour ago";
    } else if (timeDifference < 2) {
      return "less than 2 hours ago";
    } else if (timeDifference < 3) {
      return "less than 3 hours ago";
    } else {
      return "more than 3 hours ago";
    }
  }

  return (
    <div
      className={`py-4 px-6 border-b border-grey-light ${
        timeDifference > 3 ? "text-red-500" : "text-green-500"
      }`}
    >
      {renderTime()}
    </div>
  );
};

export default ActivityTime;