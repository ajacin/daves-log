import React from "react";
import { ActivityIcon } from "./ActivityIcon";

const SelectBox = ({ onChange, value, options }) => {
  return (
    <div className="flex space-x-4">
      {options.map((option) => (
        <div
          key={option}
          onClick={() => onChange({ target: { value: option } })}
          className={`cursor-pointer border-2 p-2 rounded-lg min-w-16 justify-center items-center flex flex-col ${
            value === option
              ? "text-white bg-purple-600 border-purple-700"
              : "text-gray-500 border-gray-300"
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
