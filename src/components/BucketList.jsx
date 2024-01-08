import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
const BucketList = () => {
  const placesToVisit = Array.from(
    { length: 10 },
    (_, index) => `Place ${index + 1}`
  );

  return (
    <div className="container mx-auto py-8">
      <h3 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Before Next Winter
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {placesToVisit.map((place, index) => (
          <li
            key={index}
            className="bg-white p-4 shadow-md rounded-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            {/* <FaSquare className="text-gray-500 mr-2" /> Unchecked icon */}
            <FontAwesomeIcon
              icon={faSquare}
              color="#ccc"
              className="h-6 w-6 m-2"
            />
            <div>
              <h2 className="text-lg font-semibold">{place}</h2>
              {/* You can add additional icons, buttons, or information here */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BucketList;
