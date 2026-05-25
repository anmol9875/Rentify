import { useState } from 'react'

function CheckIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    email: {
      newBookings: true,
      returnNotifications: true,
      damageReports: true,
    },
    push: {
      newBookings: false,
      returnNotifications: true,
      damageReports: false,
    },
  })

  const [saveSuccess, setSaveSuccess] = useState(false)

  const togglePreference = (category, key) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }))
    setSaveSuccess(false)
  }

  const handleSave = () => {
    // Simulate API call
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-[#4b3b2a] mb-2">Notification Preferences</h2>
      <p className="text-sm text-[#6B6B6B] mb-6">Choose how you want to be notified</p>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Email Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'newBookings', label: 'New bookings' },
              { key: 'returnNotifications', label: 'Return notifications' },
              { key: 'damageReports', label: 'Damage reports' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => togglePreference('email', item.key)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-[#2d2d2d]">{item.label}</span>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.email[item.key]
                      ? 'bg-[#D2B48C] border-[#D2B48C]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {preferences.email[item.key] && (
                    <CheckIcon className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-base font-semibold text-[#2C2C2C] mb-4">Push Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'newBookings', label: 'New bookings' },
              { key: 'returnNotifications', label: 'Return notifications' },
              { key: 'damageReports', label: 'Damage reports' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => togglePreference('push', item.key)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-[#2d2d2d]">{item.label}</span>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.push[item.key]
                      ? 'bg-[#D2B48C] border-[#D2B48C]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {preferences.push[item.key] && <CheckIcon className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-[#4b3b2a] text-white text-sm font-medium rounded-lg hover:bg-[#b8966b] transition-colors"
          >
            Save Preferences
          </button>
          {saveSuccess && (
            <span className="text-sm text-green-600">Preferences saved successfully!</span>
          )}
        </div>
      </div>
    </div>
  )
}
