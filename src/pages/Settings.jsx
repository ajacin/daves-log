import { useSettings } from '../lib/context/settings';

export function Settings() {
  const { sidePanelMode, setSidePanelMode } = useSettings();

  const options = [
    { value: 'auto', label: 'Automatic', description: "Automatically hide the menu when I'm working or switch screens" },
    { value: 'pinned', label: 'Pinned', description: 'Always keep the menu open' },
    { value: 'manual', label: 'Manual', description: 'Show the menu only when I tap the icon' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-md mx-auto lg:max-w-none">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 text-center">Settings</h1>
            <p className="text-sm lg:text-base text-slate-600 text-center mt-1">Customize your experience</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Side Panel Display</h2>
          <div className="space-y-4">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => setSidePanelMode(option.value)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  sidePanelMode === option.value
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-transparent'
                }`}
              >
                <p className="font-medium text-slate-800">{option.label}</p>
                <p className="text-sm text-slate-600">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}