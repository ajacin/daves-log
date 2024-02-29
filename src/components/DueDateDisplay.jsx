import React from "react";

const DueDateDisplay = ({ title, date }) => {
  // Calculate the difference in milliseconds between the current date and the due date
  const timeDiff = new Date(date) - new Date();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let displayText;
  let displayClass;
  if (daysDiff > 0) {
    displayText = `${title} due in ${daysDiff} days`;
  } else if (daysDiff === 0) {
    displayText = `${title} is due today`;
  } else {
    displayText = `${title} was due on ${new Date(date).toLocaleDateString()}`;
    displayClass = `text-red-500`;
  }

  return <div className={displayClass}>{displayText}</div>;
};

export default DueDateDisplay;
