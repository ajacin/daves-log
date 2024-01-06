import React, { useEffect, useState } from "react";
import { useBabyActivities } from "../lib/context/activities";
import { useUser } from "../lib/context/user";
import ReactTimeAgo from "react-time-ago";
const LastActivity = ({ name, isOnlyTime = false }) => {
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
    <div className="flex items-center space-x-1">
      {isOnlyTime ? null : <span>{"Last"}</span>}
      {isOnlyTime ? null : (
        <span>{lastActivity.activityName.toLowerCase()}</span>
      )}

      <ReactTimeAgo date={lastActivity.activityTime} locale="en-US" />
    </div>
  );
};

export default LastActivity;
