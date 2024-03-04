import React, { useState } from "react";

// Configuration object for dim levels and URLs
const config = {
  dimLevels: [0, 10, 50, 100],
  dimValues: {
    livingRoom: { 1: true, 5: true, 6: true },
    bedroom: { 2: true, 3: true },
    kitchen: { 4: true },
  },
  urls: {
    turnOn: {
      livingRoom: "https://example.com/api/turn-on",
      bedroom: "https://example.com/api/turn-on",
      kitchen: "https://example.com/api/turn-on",
    },
    turnOff: {
      livingRoom: "https://example.com/api/turn-off",
      bedroom: "https://example.com/api/turn-off",
      kitchen: "https://example.com/api/turn-off",
    },
    dim: {
      livingRoom: "https://example.com/api/dim",
      bedroom: "https://example.com/api/dim",
      kitchen: "https://example.com/api/dim",
    },
  },
};

const Automations = () => {
  // State for dim value of each light
  const [dimValues, setDimValues] = useState({
    livingRoom: { 1: 100, 5: 100, 6: 100 },
    bedroom: { 2: 100, 3: 100 },
    kitchen: { 4: 100 },
  });

  // State to track currently highlighted level for each light
  const [highlightedLevels, setHighlightedLevels] = useState({
    livingRoom: { 1: null, 5: null, 6: null },
    bedroom: { 2: null, 3: null },
    kitchen: { 4: null },
  });

  // Function to update dim value of a light
  const handleDimChange = (room, light, value) => {
    setDimValues((prevState) => ({
      ...prevState,
      [room]: {
        ...prevState[room],
        [light]: value,
      },
    }));
    setHighlightedLevels((prevState) => ({
      ...prevState,
      [room]: {
        ...prevState[room],
        [light]: value,
      },
    }));
  };

  // Function to trigger URL based on action and room/light
  const triggerUrl = (action, room, light) => {
    const url = config.urls[action][room];
    if (url) {
      const queryParams = `?light=${light}&level=${dimValues[room][light]}`;
      const finalUrl = url + queryParams;
      // Execute the API call with finalUrl
      console.log("API Call:", finalUrl);
    }
  };

  // Function to handle turning on, turning off, and dimming lights
  const handleAction = (action, room, light) => {
    triggerUrl(action, room, light);
    if (action === "turnOn") {
      // If turning on, set dim value to 100
      handleDimChange(room, light, 100);
    } else if (action === "turnOff") {
      // If turning off, set dim value to 0
      handleDimChange(room, light, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Home Automations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Living Room */}
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Living Room</h3>
            <div className="flex flex-col space-y-4">
              {[1, 5, 6].map((light) => (
                <div key={light} className="flex items-center">
                  <label className="mr-4">Light {light}</label>
                  <div className="flex items-center">
                    {config.dimLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          config.dimValues.livingRoom[light] &&
                          handleDimChange("livingRoom", light, level)
                        }
                        className={`px-2 py-1 mr-2 rounded ${
                          highlightedLevels.livingRoom[light] === level
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAction("turnOn", "livingRoom", light)}
                    className="px-2 py-1 mr-2 rounded bg-green-500 text-white"
                  >
                    <i className="fas fa-power-off mr-1"></i> ON
                  </button>
                  <button
                    onClick={() => handleAction("turnOff", "livingRoom", light)}
                    className="px-2 py-1 mr-2 rounded bg-red-500 text-white"
                  >
                    <i className="fas fa-power-off mr-1"></i> Off
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bedroom */}
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Bedroom</h3>
            <div className="flex flex-col space-y-4">
              {[2, 3].map((light) => (
                <div key={light} className="flex items-center">
                  <label className="mr-4">Light {light}</label>
                  <div className="flex items-center">
                    {config.dimLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          config.dimValues.bedroom[light] &&
                          handleDimChange("bedroom", light, level)
                        }
                        className={`px-2 py-1 mr-2 rounded ${
                          highlightedLevels.bedroom[light] === level
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAction("turnOn", "bedroom", light)}
                    className="px-2 py-1 mr-2 rounded bg-green-500 text-white"
                  >
                    <i className="fas fa-power-off mr-1"></i> ON
                  </button>
                  <button
                    onClick={() => handleAction("turnOff", "bedroom", light)}
                    className="px-2 py-1 mr-2 rounded bg-red-500 text-white"
                  >
                    <i className="fas fa-power-off mr-1"></i> Off
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kitchen */}
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Kitchen</h3>
            <div className="flex flex-col space-y-4">
              {[4].map((light) => (
                <div key={light} className="flex items-center">
                  <label className="mr-4">Light {light}</label>
                  <div className="flex items-center">
                    {config.dimLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          config.dimValues.kitchen[light] &&
                          handleDimChange("kitchen", light, level)
                        }
                        className={`px-2 py-1 mr-2 rounded ${
                          highlightedLevels.kitchen[light] === level
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAction("turnOn", "kitchen", light)}
                    className="px-2 py-1 mr-2 rounded bg-green-500 text-white"
                  >
                    <i className="fas fa-power-off mr-1"></i> ON
                  </button>
                  <button
                    onClick={() => handleAction("turnOff", "kitchen", light)}
                    className="px-2 py-1 mr-2 rounded bg-red-500 text-white"
                  >
                    <i className="fas fa-power-off mr-1"></i> Off
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Automations;
