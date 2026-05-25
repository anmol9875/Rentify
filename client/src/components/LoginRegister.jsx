import { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { validateEmail, validatePassword, validateFullName } from '../utils/validation.js'
import AuthContext from '../context/AuthContext.jsx'
import { register as apiRegister, login as apiLogin } from '../services/api.js'
import PasswordField from './PasswordField.jsx'

function LoginRegister({ onLogin, variant = 'page' }) {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState('buyer')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = useContext(AuthContext)

  useEffect(() => {
    const authMode = searchParams.get('auth')

    if (authMode === 'register') {
      setIsLogin(false)
    } else if (authMode === 'login') {
      setIsLogin(true)
    }
  }, [searchParams])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!isLogin) {
      const nameError = validateFullName(formData.fullName)
      if (nameError) newErrors.fullName = nameError
    }

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    if (!isLogin) {
      const passwordError = validatePassword(formData.password)
      if (passwordError) newErrors.password = passwordError

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let response

      if (isLogin) {
        // Call backend login
        response = await apiLogin(formData.email, formData.password)
      } else {
        // Call backend register
        response = await apiRegister(
          formData.email,
          formData.password,
          formData.fullName,
          userType
        )
      }

      // Store token
      if (response.token) {
        localStorage.setItem('rentify_token', response.token)
      }

      // Create user object for context
      const userData = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        role: response.user.role,
        isLoggedIn: true,
      }

      // Use context login if available
      if (auth && typeof auth.login === 'function') {
        auth.login(userData)
      }

      if (typeof onLogin === 'function') {
        onLogin(userData)
      }

      const redirectPath = searchParams.get('redirect')
      if (redirectPath?.startsWith('/')) {
        navigate(redirectPath)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({
        submit: error.message || 'Authentication failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isOverlay = variant === 'overlay'

  const content = (
    <div className={isOverlay ? 'w-full' : 'max-w-md mx-auto px-6'}>
      <div className={isOverlay ? 'bg-white/94 rounded-lg shadow-2xl p-6 md:p-8 backdrop-blur-sm' : 'bg-white rounded-lg shadow-lg p-8'}>
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2c2c2c] mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#6b6b6b] text-center mb-8">
            {isLogin ? 'Sign in to your account' : 'Join us as a ' + userType}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('buyer')}
                    className={`py-3 px-4 rounded-lg font-medium transition ${
                      userType === 'buyer'
                        ? 'bg-[#4b3b2a] text-white'
                        : 'bg-[#f5f1ea] text-[#2c2c2c] border border-[#e0d5c7]'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('seller')}
                    className={`py-3 px-4 rounded-lg font-medium transition ${
                      userType === 'seller'
                        ? 'bg-[#4b3b2a] text-white'
                        : 'bg-[#f5f1ea] text-[#2c2c2c] border border-[#e0d5c7]'
                    }`}
                  >
                    Seller
                  </button>
                </div>
              </div>
            )}

            {/* Full Name (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b3b2a] transition ${
                    errors.fullName ? 'border-red-500' : 'border-[#e0d5c7]'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2c2c2c] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b3b2a] transition ${
                  errors.email ? 'border-red-500' : 'border-[#e0d5c7]'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2c2c2c] mb-2">
                Password
              </label>
              <PasswordField
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b3b2a] transition ${
                  errors.password ? 'border-red-500' : 'border-[#e0d5c7]'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  Confirm Password
                </label>
                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b3b2a] transition ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#e0d5c7]'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4b3b2a] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#3B2A22] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-[#6b6b6b]">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  const nextIsLogin = !isLogin
                  const redirectPath = searchParams.get('redirect')
                  setIsLogin(nextIsLogin)
                  setSearchParams({
                    auth: nextIsLogin ? 'login' : 'register',
                    ...(redirectPath ? { redirect: redirectPath } : {}),
                  })
                  setErrors({})
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    fullName: '',
                  })
                }}
                className="text-[#4b3b2a] font-semibold hover:underline"
              >
                {isLogin ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
      </div>
    </div>
  )

  if (isOverlay) {
    return content
  }

  return (
    <section className="bg-[#f5f1ea] py-12 md:py-16 flex-1">
      {content}
    </section>
  )
}

export default LoginRegister
