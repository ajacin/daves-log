import { useState, useEffect } from "react";
import { useBabyActivities } from "../lib/context/activities";
import SelectBox from "../components/SelectBox";
import { useUser } from "../lib/context/user";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LastActivity from "../components/LastActivity";
import { ColorRing } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"; // Import plus and minus icons

export function Activities() {
  const babyActivities = useBabyActivities();
  const user = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [existingActivities, setExistingActivities] = useState([]);
  const [activityName, setActivityName] = useState("Feed");
  const [activityTime, setActivityTime] = useState(getLocalDateTime());
  const [value, setValue] = useState("120"); // Default value changed to 120
  const [unit, setUnit] = useState("mL");
  const [remarks, setRemarks] = useState("");
  const [selectedTimeDiff, setSelectedTimeDiff] = useState(null);

  useEffect(() => {
    const fetchExistingActivities = async () => {
      try {
        // Fetch activities from the past one hour
        const activities = await babyActivities.getNActivitiesLastXHours(
          activityName
        );

        setExistingActivities(activities);
      } catch (error) {
        console.error("Error fetching existing activities:", error);
      }
    };

    // Fetch existing activities when component mounts
    fetchExistingActivities();
  }, [babyActivities, activityName]);

  const onSuccessAdd = (activityName) => {
    setIsLoading(false);
    toast(
      <div className="bg-green-600 border border-green-600 rounded p-2 text-white">
        <h3>{`${activityName} saved`}</h3>
      </div>,
      {
        icon: (
          <FontAwesomeIcon
            color={"green"}
            icon={faCheck}
            className="h-6 w-6 mr-2"
          />
        ),
        position: "top-center",
        id: "saveActivitySuccessToast",
        duration: 6000,
      }
    );
  };

  function pad(num) {
    let norm = Math.floor(Math.abs(num));
    return (norm < 10 ? "0" : "") + norm;
  }

  function getLocalDateTime() {
    const now = new Date();
    return (
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      "T" +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes())
    );
  }

  const activityNames = ["Feed", "Diaper", "Vitamin D", "Medicine"];
  const unitOptions = ["mL", "drops", "unit"];
  const timeDifferences = [5, 10, 15, 30, 60];

  const onActivityNameChange = (event) => {
    const selectedActivity = event.target.value;
    setActivityName(selectedActivity);

    if (selectedActivity === "Feed") {
      setValue("120"); // Default value changed to 120
      setUnit("mL");
    } else if (selectedActivity === "Diaper") {
      setValue("1");
      setUnit("unit");
    } else if (selectedActivity === "Vitamin D") {
      setValue("1");
      setUnit("drops");
    } else {
      setUnit("unit");
    }
  };

  const onUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const getButtonLabel = () => {
    let label = "";

    if (activityName === "Feed") {
      label = `Log ${value}${unit} Feed`;
    } else if (activityName === "Diaper") {
      label = "Log Diaper Change";
    } else if (activityName === "Vitamin D") {
      label = "Log Vitamin D";
    } else {
      label = "Log Activity";
    }

    if (selectedTimeDiff) {
      label += ` (${
        selectedTimeDiff === "NOW" ? "NOW" : `${selectedTimeDiff} mins ago`
      })`;
    }

    return label;
  };

  const handleClickSave = () => {
    const now = new Date();
    let activityDate = new Date(activityTime);

    if (activityDate > now) {
      activityDate = now;
      alert(
        "Future dates are not allowed. The activity time has been reset to the current date and time."
      );
      return;
    }

    if (activityName === "Medicine" && !remarks.trim()) {
      alert("Please enter the medicine name in the Remarks field");
      return;
    }

    // Check if the same activity exists within the past one hour
    console.log({ existingActivities });
    console.log({ activityName });
    const isDuplicate = existingActivities.some((activity) => {
      const timeDifference = now - new Date(activity.activityTime);
      return (
        activity.activityName === activityName &&
        timeDifference <= 60 * 60 * 1000 // Within the past one hour
      );
    });

    if (isDuplicate) {
      const result = window.confirm(
        ` You have logged ${existingActivities[0].activityName} within the last one hour. Sure you want to proceed?`
      );
      if (result) {
        // Code to execute if user clicks OK
        console.log("User clicked OK");
      } else {
        // Code to execute if user clicks Cancel
        console.log("User clicked Cancel");
        return;
      }
    }

    toast.loading(`Saving ${activityName}`, {
      id: "saveActivitySuccessToast",
      position: "center",
    });
    setIsLoading(true);

    babyActivities.add(
      {
        activityName,
        activityTime: activityDate,
        value: value.toString(),
        unit,
        remarks,
      },
      onSuccessAdd
    );

    // Reset form
    setActivityName("Feed");
    setActivityTime(getLocalDateTime());
    setValue("120"); // Default value changed to 120
    setUnit("mL");
    setRemarks("");
    setSelectedTimeDiff(null);
  };

  if (!user.current) {
    navigate("/login");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center p-2">
      <h1 className="mb-6 text-3xl font-bold text-gray-700">Activities Log</h1>
      <form className="w-full max-w-xl">
        <div className="mb-4">
          <label
            htmlFor="activityName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Activity Name
          </label>
          <SelectBox
            id="activityName"
            onChange={onActivityNameChange}
            value={activityName}
            options={activityNames}
          />
          <LastActivity isOnlyTime name={activityName} />
        </div>
        <div className="mb-4">
          <label
            htmlFor="activityTime"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Activity Time
          </label>
          <input
            id="activityTime"
            type="datetime-local"
            value={activityTime}
            onChange={(event) => {
              setActivityTime(event.target.value);
              setSelectedTimeDiff(null); // reset selected time difference
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div className="mt-2  whitespace-nowrap group overflow-x-scroll">
            <button
              type="button"
              onClick={() => {
                setActivityTime(getLocalDateTime());
                setSelectedTimeDiff("NOW");
              }}
              className={`mr-2  hover:bg-blue-500 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center ${
                selectedTimeDiff === "NOW" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              NOW
            </button>
            {timeDifferences.map((timeDiff) => (
              <button
                key={timeDiff}
                type="button"
                onClick={() => {
                  const time = new Date(Date.now() - timeDiff * 60000);
                  setActivityTime(
                    [
                      time.getFullYear(),
                      pad(time.getMonth() + 1),
                      pad(time.getDate()),
                    ].join("-") +
                      "T" +
                      [pad(time.getHours()), pad(time.getMinutes())].join(":")
                  );
                  setSelectedTimeDiff(timeDiff);
                }}
                className={`mr-2 hover:bg-blue-500 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center ${
                  selectedTimeDiff === timeDiff ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                {timeDiff < 60
                  ? `${timeDiff} mins ago`
                  : `${timeDiff / 60} hr ago`}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="value"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Value
          </label>
          <input
            id="value"
            type="text"
            value={value}
            disabled={activityName === "Vitamin D" || activityName === "Diaper"}
            onChange={(event) => {
              setValue(event.target.value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div className="mt-2 flex justify-center items-center">
            <button
              type="button"
              onClick={() =>
                setValue((prev) =>
                  prev === "1"
                    ? "10"
                    : String(Math.max(parseInt(prev, 10) + 10, 1))
                )
              } // Increment by 10 until 10, then set to 1
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full h-10 w-10 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <span className="mx-4 text-gray-700 font-bold">{value}</span>
            <button
              type="button"
              onClick={() =>
                setValue((prev) =>
                  prev === "10"
                    ? "1"
                    : String(Math.max(parseInt(prev, 10) - 10, 1))
                )
              } // Decrement by 10 until 1, then set to 10
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full h-10 w-10 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="unit"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Unit
          </label>
          <SelectBox
            id="unit"
            onChange={onUnitChange}
            value={unit}
            options={unitOptions}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="remarks"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Remarks
          </label>
          <input
            id="remarks"
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-10"
          />
        </div>
        <div>
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-3"
            type="button"
            onClick={handleClickSave}
          >
            {getButtonLabel()}
          </button>
        </div>
      </form>
    </section>
  );
}
