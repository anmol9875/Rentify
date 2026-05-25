import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext.jsx'
import { changePassword } from '../services/api.js'
import PasswordField from './PasswordField.jsx'
import {
  validateCurrentPassword,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation.js'

function LockIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

export default function ChangePassword() {
  const auth = useContext(AuthContext)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [isChanging, setIsChanging] = useState(false)
  const [changeSuccess, setChangeSuccess] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field] || errors.submit) {
      setErrors((prev) => ({ ...prev, [field]: null, submit: null }))
    }
    setChangeSuccess(false)
  }

  const validateForm = () => {
    const newErrors = {}
    const currentPasswordError = validateCurrentPassword(formData.currentPassword)
    const newPasswordError = validatePassword(formData.newPassword)
    const confirmPasswordError = validatePasswordMatch(
      formData.newPassword,
      formData.confirmPassword
    )

    if (currentPasswordError) newErrors.currentPassword = currentPasswordError
    if (newPasswordError) newErrors.newPassword = newPasswordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    // Check if new password is same as current
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsChanging(true)
    setErrors({})

    try {
      const userId = auth?.user?.id
      if (!userId) {
        throw new Error('Please log in again before changing your password.')
      }

      await changePassword(
        userId,
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      )

      setChangeSuccess(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setChangeSuccess(false), 3000)
    } catch (error) {
      setChangeSuccess(false)
      setErrors({
        submit: error.message || 'Failed to change password. Please try again.',
      })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-[#4b3b2a] mb-2">Change Password</h2>
      <p className="text-sm text-[#6B6B6B] mb-6">Update your password to keep your account secure</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Current Password
          </label>
          <PasswordField
            id="currentPassword"
            value={formData.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C] ${
              errors.currentPassword ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            New Password
          </label>
          <PasswordField
            id="newPassword"
            value={formData.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C] ${
              errors.newPassword ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
          {!errors.newPassword && formData.newPassword && (
            <p className="mt-1 text-xs text-[#6B6B6B]">
              Password must be at least 8 characters with uppercase, lowercase, and number
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2d2d2d] mb-2">
            Confirm New Password
          </label>
          <PasswordField
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-[#D2B48C] ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Change Password Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isChanging}
            className="px-6 py-2 bg-[#4b3b2a] text-white text-sm font-medium rounded-lg hover:bg-[#3B2A22] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LockIcon className="w-4 h-4" />
            {isChanging ? 'Changing...' : 'Change Password'}
          </button>
          {changeSuccess && (
            <span className="text-sm text-green-600">Password changed successfully!</span>
          )}
        </div>
        {errors.submit && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </div>
  )
}
