import { useState, useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext.jsx'
import { updateProfile, getProfile } from '../services/api.js'
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePhone,
  validateAddress,
} from '../utils/validation.js'

function SaveIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function ProfileInformation() {
  const { user } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressCity: '',
    addressZipCode: '',
  })

  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load user profile data when component mounts or user changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const response = await getProfile(user.id)
        
        if (response.user) {
          const userData = response.user
          setFormData({
            fullName: userData.fullName || '',
            username: userData.username || userData.email?.split('@')[0] || '',
            email: userData.email || '',
            phone: userData.phone || '',
            addressStreet: userData.address?.street || '',
            addressCity: userData.address?.city || '',
            addressZipCode: userData.address?.zipCode || '',
          })
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        // Set from context as fallback
        if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.fullName || '',
            email: user.email || '',
            username: user.email?.split('@')[0] || '',
          }))
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [user?.id, user])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
    setSaveSuccess(false)
  }

  const validateForm = () => {
    const newErrors = {}
    const fullNameError = validateFullName(formData.fullName)
    const usernameError = validateUsername(formData.username)
    const emailError = validateEmail(formData.email)
    const phoneError = validatePhone(formData.phone)
    const addressError = validateAddress(formData.addressStreet)

    if (fullNameError) newErrors.fullName = fullNameError
    if (usernameError) newErrors.username = usernameError
    if (emailError) newErrors.email = emailError
    if (phoneError) newErrors.phone = phoneError
    if (addressError) newErrors.address = addressError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    if (!user?.id) {
      setErrors({ submit: 'User not found' })
      return
    }

    setIsSaving(true)
    
    try {
      const response = await updateProfile(user.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: {
          street: formData.addressStreet,
          city: formData.addressCity,
          zipCode: formData.addressZipCode,
          country: 'Pakistan',
        },
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrors({ submit: error.message || 'Failed to save changes' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#4b3b2a]">Profile Information</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Update your personal information</p>
          </div>
          {user?.role === 'seller' && (
            <span className="inline-block px-4 py-2 bg-[#d4af7a] text-white rounded-lg font-semibold text-sm">
              Seller Account
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C] ${
              errors.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            readOnly
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            readOnly
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C] ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {/* Address - Street */}
        <div>
          <label htmlFor="addressStreet" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Street Address
          </label>
          <input
            type="text"
            id="addressStreet"
            value={formData.addressStreet}
            onChange={(e) => handleChange('addressStreet', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C]"
          />
        </div>

        {/* Address - City */}
        <div>
          <label htmlFor="addressCity" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            City
          </label>
          <input
            type="text"
            id="addressCity"
            value={formData.addressCity}
            onChange={(e) => handleChange('addressCity', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C]"
          />
        </div>

        {/* Address - Zip Code */}
        <div>
          <label htmlFor="addressZipCode" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Zip Code
          </label>
          <input
            type="text"
            id="addressZipCode"
            value={formData.addressZipCode}
            onChange={(e) => handleChange('addressZipCode', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C]"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-[#4b3b2a] text-white text-sm font-medium rounded-lg hover:bg-[#3B2A22] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {saveSuccess && (
            <span className="text-sm text-green-600">Changes saved successfully!</span>
          )}
        </div>
        </form>
      )}
    </div>
  )
}
