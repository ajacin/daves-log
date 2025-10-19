import { useState, useEffect } from "react";
import { useBabyActivities } from "../../lib/context/activities";
import SelectBox from "../SelectBox";
import { useUser } from "../../lib/context/user";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LastActivity from "../LastActivity";
import { ColorRing } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"; // Import plus and minus icons
import { ConfirmationModal } from "../ConfirmationModal";
import { SuccessModal } from "../SuccessModal";

export function ActivityForm({ onClose }) {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [successActivityDetails, setSuccessActivityDetails] = useState(null);
  const [bypassDuplicateCheck, setBypassDuplicateCheck] = useState(false);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);

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

  const onSuccessAdd = (activityName, activityData) => {
    setIsLoading(false);
    setSuccessActivityDetails(activityData);
    setShowSuccessModal(true);
    // Reset form after successful save
    setActivityName("Feed");
    setActivityTime(getLocalDateTime());
    setValue("120");
    setUnit("mL");
    setRemarks("");
    setSelectedTimeDiff(null);
    setBypassDuplicateCheck(false);
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
  
  // Common drugs list for Medicine activity
  const commonDrugs = [
    "Tylenol (Acetaminophen)",
    "Advil (Ibuprofen)", 
    "Motrin (Ibuprofen)",
    "Benadryl (Diphenhydramine)",
    "Nasal Drops (Saline)",
    "Antibiotics (Amoxicillin)",
    "Antibiotics (Azithromycin)",
    "Cough Syrup",
    "Fever Reducer",
    "Pain Reliever",
    "Vitamins",
    "Probiotics",
    "Gas Drops (Simethicone)",
    "Teething Gel",
    "Cream/Ointment"
  ];

  const onActivityNameChange = (event) => {
    const selectedActivity = event.target.value;
    setActivityName(selectedActivity);
    setBypassDuplicateCheck(false);
    setShowDrugSuggestions(false);

    // Reset form based on activity type
    if (selectedActivity === "Feed") {
      setValue("120");
      setUnit("mL");
    } else if (selectedActivity === "Diaper") {
      setValue("1");
      setUnit("unit");
    } else if (selectedActivity === "Vitamin D") {
      setValue("1");
      setUnit("drops");
    } else if (selectedActivity === "Medicine") {
      setValue("1");
      setUnit("unit"); // Medicine should use "unit" not "mL"
    } else {
      setValue("1");
      setUnit("unit");
    }
  };

  const onUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const handleDrugSelect = (drug) => {
    setRemarks(drug);
    setShowDrugSuggestions(false);
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

  const handleClickSave = async () => {
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
      setShowMedicineModal(true);
      return;
    }

    // Check if the same activity exists within the past one hour
    const isDuplicate = existingActivities.some((activity) => {
      const timeDifference = now - new Date(activity.activityTime);
      return (
        activity.activityName === activityName &&
        timeDifference <= 60 * 60 * 1000 // Within the past one hour
      );
    });

    if (isDuplicate && !bypassDuplicateCheck) {
      setShowDuplicateModal(true);
      return;
    }

    // Dismiss any existing notifications with the same ID
    toast.dismiss("saveActivitySuccessToast");
    
    toast.loading(`Saving ${activityName}`, {
      id: "saveActivitySuccessToast",
    });
    setIsLoading(true);

    const activityData = {
      activityName,
      activityTime: activityDate,
      value: value.toString(),
      unit,
      remarks,
    };

    const success = await babyActivities.add(
      activityData,
      () => onSuccessAdd(activityName, activityData)
    );

    if (!success) {
      toast.error(`Failed to save ${activityName}`, {
        id: "saveActivitySuccessToast",
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: 'bold',
        },
      });
      setIsLoading(false);
      return;
    }

    // If successful, the onSuccessAdd callback will handle showing the success modal
    // and resetting the loading state, so we don't need to do anything else here
  };

  const handleDuplicateConfirm = () => {
    setShowDuplicateModal(false);
    setBypassDuplicateCheck(true);
    // Proceed with saving the activity
    handleClickSave();
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (onClose) {
      onClose();
    }
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Reset form for new entry
    setActivityName("Feed");
    setActivityTime(getLocalDateTime());
    setValue("120");
    setUnit("mL");
    setRemarks("");
    setSelectedTimeDiff(null);
    setBypassDuplicateCheck(false);
  };
  useEffect(() => {
    if (!user.current) {
      navigate("/login");
    }
  }, [user, navigate]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Add Activity</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faMinus} className="text-lg" />
          </button>
        )}
      </div>

      <form className="space-y-6">
        {/* Activity Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            What did your baby do?
          </label>
          <SelectBox
            id="activityName"
            onChange={onActivityNameChange}
            value={activityName}
            options={activityNames}
          />
          <LastActivity isOnlyTime name={activityName} />
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            When did this happen?
          </label>
          
          {/* Quick Time Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActivityTime(getLocalDateTime());
                setSelectedTimeDiff("NOW");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTimeDiff === "NOW" 
                  ? "bg-emerald-500 text-white shadow-md" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Now
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTimeDiff === timeDiff 
                    ? "bg-emerald-500 text-white shadow-md" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {timeDiff < 60 ? `${timeDiff}m` : `${timeDiff / 60}h`}
              </button>
            ))}
          </div>

          {/* Custom Time Input */}
          <input
            id="activityTime"
            type="datetime-local"
            value={activityTime}
            onChange={(event) => {
              setActivityTime(event.target.value);
              setSelectedTimeDiff(null);
            }}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Value and Unit */}
        <div className="space-y-6">
          {/* Amount Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              How much?
            </label>
            {activityName === "Vitamin D" || activityName === "Diaper" ? (
              <div className="px-4 py-3 bg-slate-100 rounded-lg text-slate-500 text-center">
                {activityName === "Diaper" ? "1" : "1"}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() =>
                    setValue((prev) =>
                      prev === "1"
                        ? "10"
                        : String(Math.max(parseInt(prev, 10) + 10, 1))
                    )
                  }
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-sm" />
                </button>
                <input
                  id="value"
                  type="text"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() =>
                    setValue((prev) =>
                      prev === "10"
                        ? "1"
                        : String(Math.max(parseInt(prev, 10) - 10, 1))
                    )
                  }
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-sm" />
                </button>
              </div>
            )}
          </div>

          {/* Unit Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Unit of measurement
            </label>
            <SelectBox
              id="unit"
              onChange={onUnitChange}
              value={unit}
              options={unitOptions}
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            {activityName === "Medicine" ? "Medicine name (Required)" : "Additional notes (Optional)"}
          </label>
          
          {activityName === "Medicine" && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowDrugSuggestions(!showDrugSuggestions)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {showDrugSuggestions ? "Hide" : "Show"} common drugs
              </button>
              
              {showDrugSuggestions && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-2">Tap to select:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {commonDrugs.map((drug, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDrugSelect(drug)}
                        className="text-xs px-2 py-1 bg-white border border-slate-200 rounded hover:bg-emerald-50 hover:border-emerald-300 transition-colors duration-200 text-left"
                      >
                        {drug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <input
            id="remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder={activityName === "Medicine" ? "Enter medicine name..." : "Add any additional notes..."}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Save Button */}
        <button
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={handleClickSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : getButtonLabel()}
        </button>
      </form>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onConfirm={handleDuplicateConfirm}
        title="Duplicate Activity Detected"
        message={`You have logged ${existingActivities[0]?.activityName} within the last one hour. Are you sure you want to proceed?`}
        confirmText="Yes, Continue"
        cancelText="Cancel"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showMedicineModal}
        onClose={() => setShowMedicineModal(false)}
        onConfirm={() => setShowMedicineModal(false)}
        title="Medicine Name Required"
        message="Please enter the medicine name in the Additional notes field before logging this activity."
        confirmText="OK"
        cancelText=""
        type="info"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        onAddMore={handleAddMore}
        activityName={successActivityDetails?.activityName}
        activityDetails={successActivityDetails ? `${successActivityDetails.value} ${successActivityDetails.unit}${successActivityDetails.remarks ? ` • ${successActivityDetails.remarks}` : ''}` : null}
      />
    </div>
  );
}
