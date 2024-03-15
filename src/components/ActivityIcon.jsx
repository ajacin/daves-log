import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faBaby,
  faCapsules,
  faSun,
  faCircle,
  faDroplet,
  faListNumeric,
  faRuler,
} from "@fortawesome/free-solid-svg-icons";
export const ActivityIcon = ({ activityName }) => {
  const iconColor = "purple";
  switch (activityName) {
    case "Feed":
      return (
        <FontAwesomeIcon
          color={iconColor}
          icon={faUtensils}
          className="h-6 w-6"
        />
      );
    case "Diaper":
      return (
        <FontAwesomeIcon color={iconColor} icon={faBaby} className="h-6 w-6" />
      );
    case "Vitamin D":
      return (
        <FontAwesomeIcon color={iconColor} icon={faSun} className="h-6 w-6" />
      );
    case "Medicine":
      return (
        <FontAwesomeIcon
          color={iconColor}
          icon={faCapsules}
          className="h-6 w-6"
        />
      );
    case "drops":
      return (
        <FontAwesomeIcon
          color={iconColor}
          icon={faDroplet}
          className="h-6 w-6"
        />
      );
    case "mL":
      return (
        <FontAwesomeIcon color={iconColor} icon={faRuler} className="h-6 w-6" />
      );
    case "unit":
      return (
        <FontAwesomeIcon
          color={iconColor}
          icon={faListNumeric}
          className="h-6 w-6"
        />
      );
    default:
      return (
        <FontAwesomeIcon
          color={iconColor}
          icon={faCircle}
          className="h-6 w-6"
        />
      );
  }
};
