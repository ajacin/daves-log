import { useEffect, useState } from "react";
import { useUser } from "../lib/context/user";
import { useAutomations } from "../lib/context/automations";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faEdit,
  faLightbulb,
  faVolumeUp,
  faDoorOpen,
  faThermometerHalf,
  faFan,
  faTv,
  faCog,
  faPowerOff,
  faSun,
  faMoon,
  faMusic,
  faLock,
  faUnlock,
  faWindowMaximize,
  faWindowMinimize,
  faTemperatureHigh,
  faTemperatureLow,
  faVolumeMute,
  faPlay,
  faPause,
  faStop,
  faForward,
  faBackward,
  faShieldAlt,
  faCamera,
  faMicrophone,
  faVideo,
  faDesktop,
  faMobileAlt,
  faTabletAlt,
  faLaptop,
  faKeyboard,
  faMouse,
  faHeadphones,
  faMicrophoneAlt,
  faMicrophoneAltSlash,
  faBell,
  faBellSlash,
  faWifi,
  faSignal,
  faBatteryFull,
  faBatteryThreeQuarters,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryEmpty,
  faPlug,
  faEllipsisV,
  faExclamationTriangle,
  faLockOpen,
  faCopy,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "bulb", name: "Light", icon: faLightbulb },
  { id: "speaker", name: "Speaker", icon: faVolumeUp },
  { id: "door", name: "Door", icon: faDoorOpen },
  { id: "thermostat", name: "Thermostat", icon: faThermometerHalf },
  { id: "fan", name: "Fan", icon: faFan },
  { id: "tv", name: "TV", icon: faTv },
  { id: "other", name: "Other", icon: faCog },
];

const ROOMS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Office",
  "Garage",
  "Outdoor",
];

const ICONS = [
  { id: "fa-lightbulb", name: "Light Bulb", icon: faLightbulb },
  { id: "fa-volume-up", name: "Volume Up", icon: faVolumeUp },
  { id: "fa-door-open", name: "Door Open", icon: faDoorOpen },
  { id: "fa-thermometer-half", name: "Thermometer", icon: faThermometerHalf },
  { id: "fa-fan", name: "Fan", icon: faFan },
  { id: "fa-tv", name: "TV", icon: faTv },
  { id: "fa-power-off", name: "Power", icon: faPowerOff },
  { id: "fa-sun", name: "Sun", icon: faSun },
  { id: "fa-moon", name: "Moon", icon: faMoon },
  { id: "fa-music", name: "Music", icon: faMusic },
  { id: "fa-lock", name: "Lock", icon: faLock },
  { id: "fa-unlock", name: "Unlock", icon: faUnlock },
  { id: "fa-window-maximize", name: "Window Max", icon: faWindowMaximize },
  { id: "fa-window-minimize", name: "Window Min", icon: faWindowMinimize },
  { id: "fa-temperature-high", name: "Temperature High", icon: faTemperatureHigh },
  { id: "fa-temperature-low", name: "Temperature Low", icon: faTemperatureLow },
  { id: "fa-volume-mute", name: "Volume Mute", icon: faVolumeMute },
  { id: "fa-play", name: "Play", icon: faPlay },
  { id: "fa-pause", name: "Pause", icon: faPause },
  { id: "fa-stop", name: "Stop", icon: faStop },
  { id: "fa-forward", name: "Forward", icon: faForward },
  { id: "fa-backward", name: "Backward", icon: faBackward },
  { id: "fa-shield-alt", name: "Shield", icon: faShieldAlt },
  { id: "fa-camera", name: "Camera", icon: faCamera },
  { id: "fa-microphone", name: "Microphone", icon: faMicrophone },
  { id: "fa-video", name: "Video", icon: faVideo },
  { id: "fa-desktop", name: "Desktop", icon: faDesktop },
  { id: "fa-mobile-alt", name: "Mobile", icon: faMobileAlt },
  { id: "fa-tablet-alt", name: "Tablet", icon: faTabletAlt },
  { id: "fa-laptop", name: "Laptop", icon: faLaptop },
  { id: "fa-keyboard", name: "Keyboard", icon: faKeyboard },
  { id: "fa-mouse", name: "Mouse", icon: faMouse },
  { id: "fa-headphones", name: "Headphones", icon: faHeadphones },
  { id: "fa-microphone-alt", name: "Microphone Alt", icon: faMicrophoneAlt },
  { id: "fa-microphone-alt-slash", name: "Microphone Muted", icon: faMicrophoneAltSlash },
  { id: "fa-bell", name: "Bell", icon: faBell },
  { id: "fa-bell-slash", name: "Bell Muted", icon: faBellSlash },
  { id: "fa-wifi", name: "WiFi", icon: faWifi },
  { id: "fa-wifi-slash", name: "WiFi Off", icon: faWifi, style: { transform: 'rotate(45deg)' } },
  { id: "fa-bluetooth", name: "Bluetooth", icon: faSignal },
  { id: "fa-bluetooth-b", name: "Bluetooth B", icon: faSignal },

  { id: "fa-battery-full", name: "Battery Full", icon: faBatteryFull },
  { id: "fa-battery-three-quarters", name: "Battery 75%", icon: faBatteryThreeQuarters },
  { id: "fa-battery-half", name: "Battery 50%", icon: faBatteryHalf },
  { id: "fa-battery-quarter", name: "Battery 25%", icon: faBatteryQuarter },
  { id: "fa-battery-empty", name: "Battery Empty", icon: faBatteryEmpty },
  { id: "fa-plug", name: "Plug", icon: faPlug },
];

export function Automations() {
  const user = useUser();
  const automations = useAutomations();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("fa-lightbulb");
  const [category, setCategory] = useState("bulb");
  const [room, setRoom] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [topAutomations, setTopAutomations] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailAutomation, setDetailAutomation] = useState(null);
  const [detailLocked, setDetailLocked] = useState(true);
  const [detailName, setDetailName] = useState("");
  const [detailUrl, setDetailUrl] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [detailIcon, setDetailIcon] = useState("fa-lightbulb");
  const [detailCategory, setDetailCategory] = useState("bulb");
  const [detailRoom, setDetailRoom] = useState("");
  const [detailShowIconPicker, setDetailShowIconPicker] = useState(false);

  useEffect(() => {
    if (!user.current) {
      navigate("/login");
      return;
    }
  }, [navigate, user]);

  useEffect(() => {
    // Update top automations whenever automations.current changes
    const sorted = [...automations.current].sort((a, b) => (b.clickedTimes || 0) - (a.clickedTimes || 0));
    setTopAutomations(sorted.slice(0, 10));
  }, [automations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const automationData = {
      name,
      url,
      description,
      icon,
      category,
      room,
    };

    // Check if this is a duplicate operation (no $id means it's a new automation)
    if (editingAutomation && !editingAutomation.$id) {
      // This is a duplicate - create new automation
      const success = await automations.add(automationData);
      if (success) {
        toast.success("Automation duplicated successfully");
        resetForm();
      } else {
        toast.error("Failed to duplicate automation");
      }
    } else if (editingAutomation) {
      // This is an update - modify existing automation
      const success = await automations.update(editingAutomation.$id, automationData);
      if (success) {
        toast.success("Automation updated successfully");
        resetForm();
      } else {
        toast.error("Failed to update automation");
      }
    } else {
      // This is a new automation
      const success = await automations.add(automationData);
      if (success) {
        toast.success("Automation added successfully");
        resetForm();
      } else {
        toast.error("Failed to add automation");
      }
    }
  };

  const handleDelete = async (id) => {
    setDeleteModalOpen(true);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      const success = await automations.remove(deleteId);
      if (success) {
        toast.success("Automation deleted successfully");
      } else {
        toast.error("Failed to delete automation");
      }
    }
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleEdit = (automation) => {
    setEditingAutomation(automation);
    setName(automation.name);
    setUrl(automation.url);
    setDescription(automation.description || "");
    setIcon(automation.icon);
    setCategory(automation.category);
    setRoom(automation.room);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setDescription("");
    setIcon("fa-lightbulb");
    setCategory("bulb");
    setRoom("");
    setEditingAutomation(null);
    setIsFormOpen(false);
    setShowIconPicker(false);
  };

  const handleIconSelect = (iconId) => {
    setIcon(iconId);
    setShowIconPicker(false);
  };

  const handleAutomationClick = async (automation) => {
    try {
      // Fire and forget the automation trigger
      const img = new Image();
      img.onerror = () => {}; // Handle image load error silently
      img.src = automation.url;
      toast.success(`${automation.name} triggered successfully`);
      
      // Update the click count
      const updatedAutomation = {
        name: automation.name,
        url: automation.url,
        description: automation.description,
        icon: automation.icon,
        category: automation.category,
        room: automation.room,
        clickedTimes: (automation.clickedTimes || 0) + 1
      };
      
      // Update in database
      const success = await automations.update(automation.$id, updatedAutomation);
      if (success) {
        await automations.init();
      }
    } catch (error) {
      console.error('Error updating click count:', error);
      toast.error(`Failed to update click count for ${automation.name}`);
    }
  };

  const handleOpenDetailModal = (automation) => {
    setDetailAutomation(automation);
    setDetailName(automation.name);
    setDetailUrl(automation.url);
    setDetailDescription(automation.description || "");
    setDetailIcon(automation.icon);
    setDetailCategory(automation.category);
    setDetailRoom(automation.room);
    setDetailShowIconPicker(false);
    setDetailLocked(true);
    setDetailModalOpen(true);
  };

  const handleSaveDetailChanges = async () => {
    if (!detailAutomation || !detailName.trim() || !detailUrl.trim() || !detailRoom.trim()) return;

    const success = await automations.update(detailAutomation.$id, {
      name: detailName.trim(),
      url: detailUrl.trim(),
      description: detailDescription.trim(),
      icon: detailIcon,
      category: detailCategory,
      room: detailRoom,
    });

    if (success) {
      toast.success("Automation updated successfully!");
      setDetailLocked(true);
      await automations.init();
    } else {
      toast.error("Failed to update automation");
    }
  };

  const handleDuplicateAutomation = () => {
    if (!detailAutomation) return;
    
    // Open the form with pre-filled data for duplication
    setEditingAutomation({
      name: detailName.trim() + " (Copy)",
      url: detailUrl.trim(),
      description: detailDescription.trim(),
      icon: detailIcon,
      category: detailCategory,
      room: detailRoom,
      // No $id means this is a duplicate operation
    });
    setName(detailName.trim() + " (Copy)");
    setUrl(detailUrl.trim());
    setDescription(detailDescription.trim());
    setIcon(detailIcon);
    setCategory(detailCategory);
    setRoom(detailRoom);
    setIsFormOpen(true);
    setDetailModalOpen(false);
  };

  const handleDetailIconSelect = (iconId) => {
    setDetailIcon(iconId);
    setDetailShowIconPicker(false);
  };

  const filteredAutomations = automations.current.filter((automation) => {
    if (!category) return true;
    return automation.category === category;
  });

  const selectedIcon = ICONS.find((i) => i.id === icon)?.icon || faLightbulb;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Automation
        </button>
      </div>

      {/* Top Automations Section */}
      {!automations.isLoading && topAutomations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Used Automations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAutomations.map((automation) => {
              const automationIcon = ICONS.find((i) => i.id === automation.icon)?.icon || faLightbulb;
              return (
                <div
                  key={`top-${automation.$id}`}
                  className="bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-all relative group cursor-pointer"
                  onClick={() => handleOpenDetailModal(automation)}
                >
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                    <div className="text-sm font-medium text-blue-600">
                      {automation.clickedTimes || 0} clicks
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutomationClick(automation);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-transform"
                      title="Trigger automation"
                    >
                      <FontAwesomeIcon icon={faPowerOff} className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="w-full h-full p-4 text-left">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={automationIcon}
                        className="h-6 w-6 text-blue-500 mr-2"
                      />
                      <h3 
                        className="text-md font-medium text-gray-900 truncate"
                        title={automation.name}
                      >
                        {automation.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingAutomation && !editingAutomation.$id ? "Duplicate Automation" : 
               editingAutomation ? "Edit Automation" : "Add New Automation"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter a description for this automation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FontAwesomeIcon icon={selectedIcon} className="h-5 w-5" />
                    <span>Select Icon</span>
                  </button>
                </div>
                {showIconPicker && (
                  <div className="mt-2 p-4 border border-gray-300 rounded-md bg-white max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-6 gap-2">
                      {ICONS.map((iconOption) => (
                        <button
                          key={iconOption.id}
                          type="button"
                          onClick={() => handleIconSelect(iconOption.id)}
                          className={`p-2 rounded-md ${
                            icon === iconOption.id
                              ? "bg-blue-100 text-blue-600"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <FontAwesomeIcon icon={iconOption.icon} className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a room</option>
                  {ROOMS.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  {editingAutomation && !editingAutomation.$id ? "Create Duplicate" : 
                   editingAutomation ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : automations.error ? (
          <div className="col-span-full text-center py-8">
            <div className="text-red-500 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Automations</h3>
            <p className="text-gray-500 mb-4">{automations.error}</p>
            <button
              onClick={() => automations.retry()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <FontAwesomeIcon
              icon={faLightbulb}
              className="h-12 w-12 text-gray-400 mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No automations found
            </h3>
            <p className="text-gray-500">
              Add your first automation by clicking the "Add Automation" button.
            </p>
          </div>
        ) : (
          filteredAutomations.map((automation) => {
            const automationIcon = ICONS.find(
              (i) => i.id === automation.icon
            )?.icon || faLightbulb;

            return (
              <div
                key={automation.$id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all relative group cursor-pointer"
                onClick={() => handleOpenDetailModal(automation)}
              >
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAutomationClick(automation);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-transform"
                    title="Trigger automation"
                  >
                    <FontAwesomeIcon icon={faPowerOff} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === automation.$id ? null : automation.$id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  {activeDropdown === automation.$id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(automation);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(automation.$id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full h-full p-6 text-left">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon
                      icon={automationIcon}
                      className="h-8 w-8 text-blue-500 mr-3"
                    />
                    <h3 
                      className="text-lg font-medium text-gray-900 truncate"
                      title={automation.name}
                    >
                      {automation.name}
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>
                      <span className="font-medium">Room:</span> {automation.room}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {CATEGORIES.find((cat) => cat.id === automation.category)?.name}
                    </p>
                    <p>
                      <span className="font-medium">Times Used:</span>{" "}
                      {automation.clickedTimes || 0}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Automation Detail Modal */}
      {detailModalOpen && detailAutomation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Automation Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailLocked(!detailLocked)}
                  className={`p-2 rounded-lg transition-colors ${
                    detailLocked 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  title={detailLocked ? 'Click to unlock and edit' : 'Click to lock'}
                >
                  <FontAwesomeIcon icon={detailLocked ? faLock : faLockOpen} className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setDetailLocked(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Usage Stats */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 font-medium">Times Used</div>
                          <div className="text-2xl font-bold text-blue-600 mt-1">
                            {detailAutomation.clickedTimes || 0}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAutomationClick(detailAutomation)}
                          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-transform shadow-lg"
                          title="Trigger automation"
                        >
                          <FontAwesomeIcon icon={faPowerOff} className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={detailName}
                        onChange={(e) => setDetailName(e.target.value)}
                        disabled={detailLocked}
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                          detailLocked 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Enter automation name"
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={detailDescription}
                        onChange={(e) => setDetailDescription(e.target.value)}
                        disabled={detailLocked}
                        rows="3"
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none ${
                          detailLocked 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Add a detailed description..."
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={detailUrl}
                        onChange={(e) => setDetailUrl(e.target.value)}
                        disabled={detailLocked}
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 font-mono text-sm ${
                          detailLocked 
                            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="https://example.com/automation"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Icon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      {detailLocked ? (
                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <FontAwesomeIcon 
                            icon={ICONS.find((i) => i.id === detailIcon)?.icon || faLightbulb} 
                            className="h-5 w-5 text-blue-500" 
                          />
                          <span className="text-sm text-gray-700">
                            {ICONS.find((i) => i.id === detailIcon)?.name || 'Light Bulb'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setDetailShowIconPicker(!detailShowIconPicker)}
                            className="flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FontAwesomeIcon 
                              icon={ICONS.find((i) => i.id === detailIcon)?.icon || faLightbulb} 
                              className="h-4 w-4" 
                            />
                            <span>Select Icon</span>
                          </button>
                          {detailShowIconPicker && (
                            <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                              <div className="grid grid-cols-6 gap-2">
                                {ICONS.map((iconOption) => (
                                  <button
                                    key={iconOption.id}
                                    type="button"
                                    onClick={() => handleDetailIconSelect(iconOption.id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      detailIcon === iconOption.id
                                        ? "bg-blue-100 text-blue-600"
                                        : "hover:bg-gray-100"
                                    }`}
                                    title={iconOption.name}
                                  >
                                    <FontAwesomeIcon icon={iconOption.icon} className="h-4 w-4" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Category and Room */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={detailCategory}
                          onChange={(e) => setDetailCategory(e.target.value)}
                          disabled={detailLocked}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            detailLocked 
                              ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={detailRoom}
                          onChange={(e) => setDetailRoom(e.target.value)}
                          disabled={detailLocked}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            detailLocked 
                              ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                              : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        >
                          <option value="">Select a room</option>
                          {ROOMS.map((room) => (
                            <option key={room} value={room}>
                              {room}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!detailLocked ? (
                      <>
                        <button
                          onClick={handleSaveDetailChanges}
                          disabled={!detailName.trim() || !detailUrl.trim() || !detailRoom.trim()}
                          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setDetailName(detailAutomation.name);
                            setDetailUrl(detailAutomation.url);
                            setDetailDescription(detailAutomation.description || "");
                            setDetailIcon(detailAutomation.icon);
                            setDetailCategory(detailAutomation.category);
                            setDetailRoom(detailAutomation.room);
                            setDetailLocked(true);
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleDuplicateAutomation}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            setDetailModalOpen(false);
                            handleDelete(detailAutomation.$id);
                          }}
                          className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Automation"
        message="Are you sure you want to delete this automation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
