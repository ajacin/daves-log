import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faTv } from "@fortawesome/free-solid-svg-icons";

const Automations = () => {
  const livingRoomButtons = [
    {
      name: "OFF",
      url: "https://www.virtualsmarthome.xyz/url_routine_trigger/activate.php?trigger=1354cb09-ce85-4af2-84cf-0f86bd43c99d&token=60b9d503-b279-4fe7-b362-8b5f31538389&response=smartphone",
      icon: faLightbulb,
    },
    {
      name: "ON",
      url: "https://www.virtualsmarthome.xyz/url_routine_trigger/activate.php?trigger=f6457f0c-c6b8-425c-919c-8553dbf4ba36&token=028ee550-dd42-4a7b-ac7d-696c9634230a&response=smartphone",
      icon: faLightbulb,
    },
    {
      name: "Living Light 6",
      url: "https://example.com/living_light6",
      icon: faLightbulb,
    },
  ];

  const bedroomButtons = [
    {
      name: "Bedroom Light 2",
      url: "https://example.com/bedroom_light2",
      icon: faLightbulb,
    },
    {
      name: "Bedroom Light 3",
      url: "https://example.com/bedroom_light3",
      icon: faLightbulb,
    },
  ];

  const kitchenButtons = [
    {
      name: "Kitchen Light 4",
      url: "https://example.com/kitchen_light4",
      icon: faLightbulb,
    },
  ];

  const tvControls = [
    { name: "Turn On TV", url: "https://example.com/turn_on_tv", icon: faTv },
    { name: "Turn Off TV", url: "https://example.com/turn_off_tv", icon: faTv },
  ];

  const handleButtonClick = (url) => {
    fetch(url, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        console.log("Request successful");
        // Optionally, you can add further handling here if needed
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl text-gray-800 mb-6">Automations</h1>
        <div className="mb-8">
          <h2 className="text-xl text-gray-800 mb-4">Living Room</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            {livingRoomButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(button.url)}
                className="flex flex-col items-center justify-center p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-semibold focus:outline-none"
              >
                <FontAwesomeIcon icon={button.icon} className="h-6 w-6" />
                <span className="mt-2">{button.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xl text-gray-800 mb-4">Bedroom</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            {bedroomButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(button.url)}
                className="flex flex-col items-center justify-center p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-semibold focus:outline-none"
              >
                <FontAwesomeIcon icon={button.icon} className="h-6 w-6" />
                <span className="mt-2">{button.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xl text-gray-800 mb-4">Kitchen</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            {kitchenButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(button.url)}
                className="flex flex-col items-center justify-center p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-semibold focus:outline-none"
              >
                <FontAwesomeIcon icon={button.icon} className="h-6 w-6" />
                <span className="mt-2">{button.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl text-gray-800 mb-4">TV Controls</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            {tvControls.map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(button.url)}
                className="flex flex-col items-center justify-center p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-semibold focus:outline-none"
              >
                <FontAwesomeIcon icon={button.icon} className="h-6 w-6" />
                <span className="mt-2">{button.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automations;
