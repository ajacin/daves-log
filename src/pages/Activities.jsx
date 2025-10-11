import { useState } from "react";
import { ActivityForm } from "../components/activities/ActivityForm";
import { QuickAdd } from "../components/activities/QuickAdd";
import { useBabyActivities } from "../lib/context/activities";
import { ActivityIcon } from "../components/ActivityIcon";
import TimeAgo from "../components/TImeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faHistory, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export function Activities() {
  const babyActivities = useBabyActivities();
  const [showForm, setShowForm] = useState(false);
  const [showRecent, setShowRecent] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-md mx-auto lg:max-w-none">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center">Activities</h1>
            <p className="text-sm lg:text-base text-slate-600 text-center mt-1">Track your baby's daily activities</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-md mx-auto lg:max-w-none lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column - Recent Activities */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm">
              <button
                onClick={() => setShowRecent(!showRecent)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faHistory} className="text-slate-500" />
                  <h2 className="text-lg font-semibold text-slate-800">Recent Activities</h2>
                  <span className="bg-emerald-100 text-emerald-600 text-xs font-medium px-2 py-1 rounded-full">
                    {babyActivities.current.length}
                  </span>
                </div>
                <FontAwesomeIcon 
                  icon={showRecent ? faChevronUp : faChevronDown} 
                  className="text-slate-400" 
                />
              </button>
              
              {showRecent && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                  {babyActivities.current.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faHistory} className="text-slate-400 text-xl" />
                      </div>
                      <p className="text-slate-500 text-sm">No activities logged yet</p>
                      <p className="text-slate-400 text-xs mt-1">Start by adding your first activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {babyActivities.current.slice(0, 5).map((activity, index) => (
                        <div 
                          key={activity.$id} 
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <ActivityIcon activityName={activity.activityName} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{activity.activityName}</p>
                              <p className="text-xs text-slate-500">
                                {activity.value} {activity.unit}
                                {activity.remarks && ` • ${activity.remarks}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <TimeAgo date={new Date(activity.activityTime)} />
                            {index === 0 && (
                              <span className="block text-xs text-emerald-600 font-medium mt-1">Latest</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Add Activity */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faPlus} className="text-emerald-500" />
                </div>
              </div>
              <QuickAdd />
            </div>

            {/* Add New Activity - Primary Action */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Add New Activity</h2>
                <p className="text-slate-600 text-sm">Log a new activity for your baby</p>
              </div>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>{showForm ? 'Hide Form' : 'Add New Activity'}</span>
              </button>
            </div>

            {/* Activity Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-in slide-in-from-top-2 duration-300">
                <ActivityForm onClose={() => setShowForm(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}