import React from "react";
import Draggable from "react-draggable";

const FloatingActionButton = ({ onDrag, onStop, icon, onClick }) => {
  return (
    <Draggable
      // onStart={(e, ui) => onDrag(e, ui)}
      // onStop={(e, ui) => onStop(e, ui)}
      defaultPosition={{ x: 0, y: 0 }}
      bounds="body"
      onClick={onClick}
    >
      <button
        onClick={onClick}
        className="fixed bottom-8 right-8 bg-purple-500 p-4 rounded-full cursor-pointer"
      >
        {icon}
      </button>
    </Draggable>
  );
};

export default FloatingActionButton;
