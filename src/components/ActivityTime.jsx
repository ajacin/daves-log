import React, { useState, useEffect, useCallback, useMemo } from "react";
import LastActivity from "./LastActivity";

const ActivityTime = ({ activityName, activityTime }) => {
  const activityDate = useMemo(() => new Date(activityTime), [activityTime]);

  const getTimeDifference = useCallback(() => {
    const now = new Date();
    const timeDifference = (now - activityDate) / (1000 * 60 * 60); // returns time difference in hours
    return timeDifference;
  }, [activityDate]);

  const [timeDifference, setTimeDifference] = useState(() =>
    getTimeDifference()
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeDifference(getTimeDifference());
    }, 1000);

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [getTimeDifference]);

  const cutOffTime = useMemo(() => {
    switch (activityName) {
      case "Feed":
        return 3;
      case "Diaper":
        return 5;
      case "Vitamin D":
        return 24;
      default:
        return 24;
    }
  }, [activityName]);

  return (
    <div
      className={`${
        timeDifference > cutOffTime ? "text-red-500" : "text-green-500"
      }`}
    >
      {activityDate && (
        <LastActivity name={activityName} isOnlyTime></LastActivity>
      )}
      {/* <p> / {cutOffTime} hours </p> */}
    </div>
  );
};

export default ActivityTime;
