import { useEffect, useState } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faTrash,
  faPlus,
  faClock,
  faCalendarAlt,
  faCircleCheck,
  faCircleXmark,
  faFilter,
  faUser,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { account } from "../lib/appwrite";

const PREDEFINED_TAGS = [
  "walmart",
  "costco",
  "dollarama",
  "shopping",
  "foodco",
  "school",
];

export function Ideas() {
  const user = useUser();
  const ideas = useIdeas();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [isMinimalView, setIsMinimalView] = useState(false);

  useEffect(() => {
    if (!user.current) {
      navigate("/login");
    } else {
      ideas.init();
    }
  }, [ideas, navigate, user]);

  // Fetch user names for ideas
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!ideas.current.length) return;

      const uniqueUserIds = [
        ...new Set(ideas.current.map((idea) => idea.userId)),
      ];
      const newUserIds = uniqueUserIds.filter((userId) => !userNames[userId]);

      if (newUserIds.length === 0) return;

      try {
        const userDetailsPromises = newUserIds.map(async (userId) => {
          try {
            const userDetails = await account.get(userId);
            return [userId, userDetails.name];
          } catch (error) {
            console.error(`Error fetching user details for ${userId}:`, error);
            return [userId, "Unknown User"];
          }
        });

        const userDetailsResults = await Promise.all(userDetailsPromises);
        const newUserNames = Object.fromEntries(userDetailsResults);

        setUserNames((prev) => ({
          ...prev,
          ...newUserNames,
        }));
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserNames();
  }, [ideas, userNames]);

  const handleRemove = (ideaId) => {
    ideas.remove(ideaId);
    setSelectedIdea(null);
  };

  const handleToggleComplete = (ideaId) => {
    ideas.toggleComplete(ideaId);
    setSelectedIdea(null);
  };

  const handleTagToggle = (tag) => {
    setTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleFilterTagToggle = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const cancelResetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setDueDate("");
    setIsFormOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  };

  const handleFormSubmit = () => {
    if (!title || !description) {
      alert("Please enter both title and description.");
      return;
    }
    if (description.length > 500) {
      alert(`Enter less than 500 chars for description`);
      alert(`Enter less than 500 chars for description`);
      return;
    }

    const entryDate = new Date().toISOString();
    ideas.add({
      userId: user.current.$id,
      title,
      description,
      entryDate,
      tags,
      dueDate: dueDate || null,
      completed: false,
    });
    cancelResetForm();
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600";
    if (diffDays === 0) return "text-yellow-600";
    if (diffDays <= 3) return "text-orange-600";
    return "text-green-600";
  };

  // Filter and sort ideas
  const filteredAndSortedIdeas = ideas.current
    .filter((idea) => {
      // First filter by completion status if hideCompleted is true
      if (hideCompleted && idea.completed) {
        return false;
      }
      // Then filter by tags
      return (
        selectedTags.length === 0 ||
        idea.tags?.some((tag) => selectedTags.includes(tag))
      );
    })
    .sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by tags
      const aTags = a.tags?.join(",") || "";
      const bTags = b.tags?.join(",") || "";
      return aTags.localeCompare(bTags);
    });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {user.current && (
        <section className="mt-8 relative z-10">
          <div className="flex justify-end pr-4 sm:pr-6 lg:pr-8">
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 transition-colors duration-200 shadow-sm"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Task</span>
            </button>
          </div>
          {isFormOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Task</h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter task description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                    <span
                      className={
                        description?.length > 500
                          ? "text-red-500"
                          : "text-gray-500"
                      }
                    >
                      {description?.length} / 500 characters
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            tags.includes(tag)
                              ? "bg-purple-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={cancelResetForm}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Task List</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 ${
                  hideCompleted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={
                  hideCompleted
                    ? "Show completed tasks"
                    : "Hide completed tasks"
                }
              >
                <FontAwesomeIcon icon={hideCompleted ? faEyeSlash : faEye} />
                <span className="hidden sm:inline">
                  {hideCompleted ? "Show Completed" : "Hide Completed"}
                </span>
              </button>

              <button
                onClick={() => setIsMinimalView(!isMinimalView)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors duration-200 ${
                  isMinimalView
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={isMinimalView ? "Show full view" : "Show minimal view"}
              >
                <FontAwesomeIcon icon={isMinimalView ? faEye : faEyeSlash} />
                <span className="hidden sm:inline">
                  {isMinimalView ? "Full View" : "Minimal View"}
                </span>
              </button>

              <div className="flex items-center gap-4 text-sm border-l border-gray-200 pl-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-green-500"
                  />
                  <span className="hidden sm:inline">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="text-red-500"
                  />
                  <span className="hidden sm:inline">Pending</span>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                  showFilters || selectedTags.length > 0
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">
                  Filter
                  {selectedTags.length > 0 ? ` (${selectedTags.length})` : ""}
                </span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleFilterTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Minimal View */}
        {isMinimalView ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredAndSortedIdeas.map((idea) => (
              <div
                key={idea.$id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  idea.completed
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(idea.$id)}
                    className={`p-1 rounded-full transition-colors duration-200 ${
                      idea.completed
                        ? "text-green-500 hover:text-green-600"
                        : "text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={idea.completed ? faCircleCheck : faCircleXmark}
                      className="h-5 w-5"
                    />
                  </button>
                  <span
                    className={`${
                      idea.completed
                        ? "text-green-700 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {idea.title}
                  </span>
                </div>
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex gap-1">
                    {idea.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          idea.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedIdeas.map((idea) => (
              <div
                key={idea.$id}
                className={`relative bg-white rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02] ${
                  idea.completed
                    ? "border-2 border-green-500 bg-green-50"
                    : "border-2 border-red-200 bg-white"
                }`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    idea.completed ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="absolute top-4 left-4">
                  <FontAwesomeIcon
                    icon={idea.completed ? faCircleCheck : faCircleXmark}
                    className={`${
                      idea.completed ? "text-green-500" : "text-red-500"
                    } h-5 w-5`}
                  />
                </div>
                <div className="p-4 pt-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="pl-6">
                      <h3
                        className={`font-semibold ${
                          idea.completed ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        {idea.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        <span>
                          Added by{" "}
                          {idea.userId === user.current.$id
                            ? "you"
                            : userNames[idea.userId] || "Loading..."}
                        </span>
                      </div>
                    </div>
                    {user.current && user.current.$id === idea.userId && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setSelectedIdea(
                              selectedIdea === idea.$id ? null : idea.$id
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <FontAwesomeIcon
                            icon={faEllipsisV}
                            className="h-4 w-4 text-gray-600"
                          />
                        </button>
                        {selectedIdea === idea.$id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleToggleComplete(idea.$id)}
                              className={`block w-full py-2 px-4 text-left hover:bg-gray-100 ${
                                idea.completed
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  idea.completed ? faCircleXmark : faCircleCheck
                                }
                                className="mr-2"
                              />
                              {idea.completed
                                ? "Mark Incomplete"
                                : "Mark Complete"}
                            </button>
                            <button
                              onClick={() => handleRemove(idea.$id)}
                              className="block w-full py-2 px-4 text-left text-red-600 hover:bg-gray-100 border-t border-gray-100"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2"
                              />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p
                    className={`text-sm mb-3 pl-6 ${
                      idea.completed ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {idea.description}
                  </p>

                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 pl-6">
                      {idea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            idea.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pl-6">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      {formatDate(idea.entryDate)}
                    </div>
                    {idea.dueDate && (
                      <div
                        className={`flex items-center ${getDueDateStatus(
                          idea.dueDate
                        )}`}
                      >
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-1"
                        />
                        Due: {formatDate(idea.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
