import { useBabyActivities } from "../../lib/context/activities";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaby, faPills, faDroplet } from "@fortawesome/free-solid-svg-icons";

export function QuickAdd() {
  const babyActivities = useBabyActivities();

  const onSuccessAdd = (activityName) => {
    toast.success(`${activityName} saved`, {
      id: "saveActivitySuccessToast",
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    });
  };

  const handleQuickAdd = async (activityName, value, unit) => {
    // Dismiss any existing notifications with the same ID
    toast.dismiss("saveActivitySuccessToast");
    
    toast.loading(`Saving ${activityName}`, {
      id: "saveActivitySuccessToast",
    });

    const success = await babyActivities.add(
      {
        activityName,
        activityTime: new Date(),
        value: value.toString(),
        unit,
        remarks: "",
      },
      onSuccessAdd
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
    }
  };

  const quickActions = [
    {
      name: "Diaper Change",
      icon: faBaby,
      color: "from-amber-400 to-orange-500",
      hoverColor: "hover:from-amber-500 hover:to-orange-600",
      onClick: () => handleQuickAdd("Diaper", "1", "unit")
    },
    {
      name: "Vitamin D",
      icon: faPills,
      color: "from-emerald-400 to-teal-500",
      hoverColor: "hover:from-emerald-500 hover:to-teal-600",
      onClick: () => handleQuickAdd("Vitamin D", "1", "drops")
    },
    {
      name: "Feed (120mL)",
      icon: faDroplet,
      color: "from-blue-400 to-indigo-500",
      hoverColor: "hover:from-blue-500 hover:to-indigo-600",
      onClick: () => handleQuickAdd("Feed", "120", "mL")
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {quickActions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`bg-gradient-to-r ${action.color} ${action.hoverColor} text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex flex-col items-center space-y-2 min-h-[80px]`}
        >
          <div className="flex items-center justify-center w-8 h-8">
            <FontAwesomeIcon icon={action.icon} className="text-lg" />
          </div>
          <span className="text-xs text-center leading-tight px-1">{action.name}</span>
        </button>
      ))}
    </div>
  );
}
