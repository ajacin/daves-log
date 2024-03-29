import React, { useEffect, useState } from "react";
import { useBabyActivities } from "../lib/context/activities";
import { useUser } from "../lib/context/user";
// import ReactTimeAgo from "react-time-ago";
import TimeAgo from "./TImeAgo";
const LastActivity = ({ name, isOnlyTime = false, threshold = 0 }) => {
  const user = useUser();
  const activities = useBabyActivities();
  const [lastActivity, setLastActivity] = useState(null);
  useEffect(() => {
    setLastActivity(
      activities.current.filter((activity) => activity.activityName === name)[0]
    );
  }, [activities, name]);

  if (!lastActivity || !user.current) {
    return <div>{"..."}</div>;
  }
  return (
    <div className="flex-col items-center space-x-1">
      {/* {isOnlyTime ? null : <span>{"Last"}</span>} */}
      {isOnlyTime ? null : (
        <div className="text-purple-600 text-lg">
          {lastActivity.activityName}
        </div>
      )}

      {/* <ReactTimeAgo date={lastActivity.activityTime} locale="en-US" /> */}
      <TimeAgo
        date={new Date(lastActivity.activityTime)}
        threshold={threshold}
      />
    </div>
  );
};

export default LastActivity;
