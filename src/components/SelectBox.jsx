import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const SelectBox = ({ onChange, value, options }) => {
  return (
    <div className="flex space-x-4">
      {options.map((option) => (
        <div
          key={option}
          onClick={() => onChange({ target: { value: option } })}
          className={`cursor-pointer flex flex-col ${
            value === option ? "text-purple-500" : "text-gray-500"
          }`}
        >
          <FontAwesomeIcon icon={faCircle} size="2x" />
          <span>{option}</span>
        </div>
      ))}
    </div>
  );
};

export default SelectBox;
