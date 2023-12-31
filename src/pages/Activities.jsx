import { useState } from "react";
import { useBabyActivities } from "../lib/context/activities";
import SelectBox from "../components/SelectBox";
import { useUser } from "../lib/context/user";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LastActivity from "../components/LastActivity";
import { Vortex } from "react-loader-spinner";

export function Activities() {
  const babyActivities = useBabyActivities();
  const user = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSuccessAdd = (activityName) => {
    setIsLoading(false);
    // https://react-hot-toast.com/docs/toast
    toast.success(`${activityName} added!`, {
      id: "saveActivitySuccessToast",
      duration: 4000,
    });
  };

  function pad(num) {
    let norm = Math.floor(Math.abs(num));
    return (norm < 10 ? "0" : "") + norm;
  }

  function getLocalDateTime() {
    const now = new Date();
    // let tzo = -now.getTimezoneOffset(),
    //   dif = tzo >= 0 ? "+" : "-";

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

  const [activityName, setActivityName] = useState("Feed");
  const [activityTime, setActivityTime] = useState(getLocalDateTime());
  const [value, setValue] = useState("90");
  const [unit, setUnit] = useState("mL");
  const [remarks, setRemarks] = useState("");

  // Assuming you have these lists
  const activityNames = ["Feed", "Diaper", "Vitamin D", "Medicine"];
  const unitOptions = ["mL", "drops", "unit"];
  const [selectedTimeDiff, setSelectedTimeDiff] = useState(null);
  const timeDifferences = [5, 10, 15, 30, 60]; // time differences in minutes

  const onActivityNameChange = (event) => {
    const selectedActivity = event.target.value;
    setActivityName(selectedActivity);

    if (selectedActivity === "Feed") {
      setValue("90");
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

  const quickValues = [60, 70, 80, 90, 1];
  if (!user.current) {
    navigate("/login");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Vortex
          visible={true}
          height="80"
          width="80"
          ariaLabel="vortex-loading"
          wrapperStyle={{}}
          wrapperClass="vortex-wrapper"
          colors={["red", "green", "blue", "yellow", "orange", "purple"]}
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
          <LastActivity name={activityName} />
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
          <div className="mt-2">
            {quickValues.map((qv) => (
              <button
                key={qv}
                type="button"
                disabled={
                  activityName === "Vitamin D" || activityName === "Diaper"
                }
                onClick={() => setValue(qv)}
                className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded inline-flex items-center"
              >
                <div
                  className={` ${
                    qv === value
                      ? "bg-blue-500 py-2 px-4"
                      : "bg-gray-200 py-2 px-4"
                  }`}
                >
                  {qv}
                </div>
              </button>
            ))}
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
          <textarea
            id="remarks"
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
          />
        </div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-3"
            type="button"
            onClick={() => {
              const now = new Date();
              let activityDate = new Date(activityTime);

              if (activityDate > now) {
                activityDate = now; // reset to current date and time
                alert(
                  "Future dates are not allowed. The activity time has been reset to the current date and time."
                );
                return;
              }

              toast.loading(`Saving ${activityName}`, {
                id: "saveActivitySuccessToast",
                position: "center",
              });
              setIsLoading(true);

              babyActivities.add(
                {
                  activityName,
                  activityTime: activityDate, // use the possibly reset date
                  value: value.toString(),
                  unit,
                  remarks,
                },
                onSuccessAdd
              );

              // Reset form
              setActivityName("Feed");
              setActivityTime(getLocalDateTime());
              setValue("90");
              setUnit("mL");
              setRemarks("");
              setSelectedTimeDiff(null);
            }}
          >
            {getButtonLabel()}
          </button>
        </div>
      </form>
    </section>
  );
}
