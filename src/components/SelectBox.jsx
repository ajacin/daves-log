import React from "react";
import { ActivityIcon } from "./ActivityIcon";

const SelectBox = ({ onChange, value, options }) => {
  return (
    <div className="flex space-x-4">
      {options.map((option) => (
        <div
          key={option}
          onClick={() => onChange({ target: { value: option } })}
          className={`cursor-pointer border p-2 rounded-lg min-w-16 justify-center items-center flex flex-col ${
            value === option ? "text-purple-700 bg-purple-300" : "text-gray-500"
          }`}
        >
          <ActivityIcon activityName={option}></ActivityIcon>
          <span>{option}</span>
        </div>
      ))}
    </div>
  );
};

export default SelectBox;
