import React, { useEffect, useState, useRef } from "react";

const TimeAgo = ({ date, threshold }) => {
  const [formattedTime, setFormattedTime] = useState("");
  const hoursRef = useRef(0);
  const minutesRef = useRef(0);

  useEffect(() => {
    const calculateTimeDifference = () => {
      const now = new Date();
      const timeDifference = Math.abs(now - date);

      hoursRef.current = Math.floor(timeDifference / (1000 * 60 * 60));
      minutesRef.current = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );

      const isPast = date < now;

      if (hoursRef.current > 0 && minutesRef.current > 0) {
        setFormattedTime(
          isPast
            ? `${hoursRef.current} hours and ${minutesRef.current} minutes ago`
            : `in ${hoursRef.current} hours and ${minutesRef.current} minutes`
        );
      } else if (hoursRef.current > 0) {
        setFormattedTime(
          isPast
            ? `${hoursRef.current} hours ago`
            : `in ${hoursRef.current} hours`
        );
      } else {
        setFormattedTime(
          isPast
            ? `${minutesRef.current} minutes ago`
            : `in ${minutesRef.current} minutes`
        );
      }
    };

    calculateTimeDifference();
  }, [date]);

  return (
    <span
      className={`text-${
        formattedTime.includes("ago") &&
        (hoursRef.current > threshold ||
          (hoursRef.current === threshold && minutesRef.current > 0))
          ? "red"
          : "green"
      }`}
    >
      {formattedTime}
    </span>
  );
};

export default TimeAgo;
