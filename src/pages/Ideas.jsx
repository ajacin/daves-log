import { useEffect, useState } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faTrash,
  faPlus,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export function Ideas() {
  const user = useUser();
  const ideas = useIdeas();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!user.current) {
      navigate("/login");
    } else {
      ideas.init();
    }
  }, [ideas, navigate, user]);

  const handleRemove = (ideaId) => {
    ideas.remove(ideaId);
    setSelectedIdea(null);
  };

  const cancelResetForm = () => {
    setTitle("");
    setDescription("");
    setIsFormOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    return date.toLocaleString(undefined, options);
  };

  const handleFormSubmit = () => {
    // Basic validation
    if (!title || !description) {
      alert("Please enter both title and description.");
      return;
    }
    if (description.length > 500) {
      alert(`Enter less than 500 chars for description`);
      return;
    }

    const entryDate = new Date().toISOString(); // Capture current date and time
    ideas.add({ userId: user.current.$id, title, description, entryDate });
    cancelResetForm();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {user.current && (
        <section className="mt-8">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Idea
          </button>
          {isFormOpen && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Add Idea</h2>
              <form>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full p-2 mb-4 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full p-2 mb-4 border rounded"
                />
                <span className={description?.length > 500 ? "text-red-500":"text-black"}
>{description?.length} characters</span><br/>
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  className="m-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={cancelResetForm}
                  className="m-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </section>
      )}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Latest Ideas</h2>
        <div className="flex flex-wrap gap-2">
          {ideas.current.map((idea) => (
            <div
              key={idea.$id}
              className="relative flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 rounded-md shadow-md border border-gray-300"
            >
              <div>
                <strong>{idea.title}</strong>
              </div>
              <div className="mt-2">
                <p>{idea.description}</p>
                <p className="text-xs	text-blue-600 mt-2 border border-blue-200 bg-blue-100">
                  {formatDate(idea.entryDate)}
                </p>
              </div>
              {user.current && user.current.$id === idea.userId && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() =>
                      setSelectedIdea(
                        selectedIdea === idea.$id ? null : idea.$id
                      )
                    }
                    className="focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                  </button>
                  {selectedIdea === idea.$id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <div className="flex gap-1 items-center m-1 justify-center">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="h-4 w-4"
                        />
                        <span>Your note</span>
                      </div>

                      <button
                        onClick={() => handleRemove(idea.$id)}
                        className="block w-full py-2 px-4 text-left text-red-700 hover:bg-gray-100"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
