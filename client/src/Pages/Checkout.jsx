import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { checkoutValidation } from '../utils/checkoutValidation.js'
import AuthContext from '../context/AuthContext.jsx'
import { createRental, getProfile, updateWalletBalance } from '../services/api.js'
import { MAX_RENTAL_MONTHS, isRentalRangeLongerThanMax } from '../utils/rentalPeriod.js'
import { getSecurityDeposit } from '../utils/pricing.js'

export default function Checkout() {
  const navigate = useNavigate()
  const { user, updateWallet, refreshUser } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState([])
  const [selectedRange, setSelectedRange] = useState(null)
  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState('')
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [completedTotal, setCompletedTotal] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'Pakistan',
    address: '',
    address2: '',
    city: '',
    zipCode: '',
    phone: '',
  })

  useEffect(() => {
    loadCartAndDates()
  }, [])

  useEffect(() => {
    const loadSavedProfileDetails = async () => {
      if (!user?.id) return

      try {
        const response = await getProfile(user.id)
        const profile = response?.user

        if (!profile) return

        setFormData((prev) => ({
          ...prev,
          name: prev.name || profile.fullName || user.fullName || '',
          email: prev.email || profile.email || user.email || '',
          address: prev.address || profile.address?.street || '',
          city: prev.city || profile.address?.city || '',
          zipCode: prev.zipCode || profile.address?.zipCode || '',
          phone: prev.phone || profile.phone || '',
          country: prev.country || profile.address?.country || 'Pakistan',
        }))
      } catch (error) {
        console.error('Failed to load saved checkout details:', error)
        setFormData((prev) => ({
          ...prev,
          name: prev.name || user.fullName || '',
          email: prev.email || user.email || '',
        }))
      }
    }

    loadSavedProfileDetails()
  }, [user?.id, user?.fullName, user?.email])

  const loadCartAndDates = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)

      const stored = localStorage.getItem('selectedRange')
      if (stored) {
        const parsed = JSON.parse(stored)
        setSelectedRange({
          start: new Date(parsed.start),
          end: new Date(parsed.end),
        })
      }
    } catch (e) {
      console.error('Error loading cart:', e)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessError('')

    const validation = checkoutValidation.validateCheckoutForm(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    if (!user) {
      setProcessError('Please log in to complete your order')
      return
    }

    if (!cartItems.length) {
      setProcessError('Your cart is empty. Please add at least one product.')
      return
    }

    const overAvailableItem = cartItems.find((item) => {
      const available = Number(item.availability)
      return Number.isFinite(available) && available > 0 && Number(item.quantity) > available
    })

    if (overAvailableItem) {
      setProcessError(`${overAvailableItem.title} only has ${overAvailableItem.availability} available.`)
      return
    }

    if (!selectedRange?.start || !selectedRange?.end) {
      setProcessError('Please select a reservation time period before completing your order.')
      return
    }

    if (isRentalRangeLongerThanMax(selectedRange.start, selectedRange.end)) {
      setProcessError(`Rental period cannot be longer than ${MAX_RENTAL_MONTHS} months.`)
      return
    }

    // Refresh user data to get latest wallet balance
    const refreshedUser = await refreshUser()
    const currentBalance = refreshedUser ? refreshedUser.walletBalance : user.walletBalance

    if (currentBalance < total) {
      setProcessError('Insufficient wallet balance. Please add funds to your wallet.')
      return
    }

    setIsProcessing(true)

    try {
      // Format delivery address
      const deliveryAddress = {
        street: formData.address + (formData.address2 ? `, ${formData.address2}` : ''),
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
      }

      const rentalPromises = cartItems.map((item) =>
        createRental({
          productId: item.id,
          catalogProductId: item.catalogProductId || item.id,
          productSnapshot: {
            title: item.title,
            description: item.description || `${item.title} available for rent.`,
            price: Number(item.price) || 0,
            image: item.image,
            duration: item.duration || '5 day',
          },
          startDate: selectedRange.start.toISOString(),
          endDate: selectedRange.end.toISOString(),
          quantity: item.quantity,
          deliveryAddress,
        })
      )

      await Promise.all(rentalPromises)

      // Debit from wallet
      await updateWalletBalance(user.id, total, 'debit')

      // Update local wallet balance
      updateWallet(-total)

      // Clear cart and selected range
      localStorage.removeItem('cart')
      localStorage.removeItem('selectedRange')
      window.dispatchEvent(new Event('cartUpdated'))

      setCompletedTotal(total)
      setShowSuccessOverlay(true)

    } catch (error) {
      console.error('Order processing error:', error)
      setProcessError(error.message || 'Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const securityDeposit = getSecurityDeposit(cartItems)
  const total = subtotal + tax + securityDeposit

  const formatDateRange = () => {
    if (!selectedRange) return ''
    const start = selectedRange.start.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })
    const end = selectedRange.end.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })
    return { start, end }
  }

  const dateRange = formatDateRange()

  const handleEditReservation = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Header />

      <div className={`flex-1 max-w-7xl mx-auto w-full px-6 py-12 transition-all ${showSuccessOverlay ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {/* Back to cart link */}
        <button
          onClick={() => navigate('/')}
          className="text-[#0066cc] hover:text-[#0052a3] font-medium mb-8 inline-block"
        >
          ← Back to cart
        </button>

        <div className="grid grid-cols-3 gap-8">
          {/* Left side - Form (2 columns) */}
          <div className="col-span-2">

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  Country<span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled
                >
                  <option value="Pakistan">Pakistan</option>
                </select>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>

              {/* Address line 2 */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Address line 2</label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f]"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              {/* City and Postal Code row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    City<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Karachi"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                    Postal Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="75000"
                  />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+92 333 1560377"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#c49a5f] hover:bg-[#b8966b] disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors mt-8"
              >
                {isProcessing ? 'Processing Order...' : 'Complete Order'}
              </button>

              {processError && <p className="text-red-500 text-sm mt-2">{processError}</p>}
            </form>
          </div>

          {/* Right side - Order Summary (1 column) */}
          <div className="col-span-1">
            <div className="bg-[#f9f7f4] p-6 rounded-lg sticky top-6">
              <h2 className="text-lg font-semibold text-[#2c2c2c] mb-6">Your reservation</h2>

              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#2c2c2c]">Reservation period</h3>
                <button
                  type="button"
                  onClick={handleEditReservation}
                  className="text-sm font-medium text-[#0066cc] hover:text-[#0052a3]"
                >
                  Edit
                </button>
              </div>

              {!selectedRange && (
                <p className="mb-4 text-sm text-red-500">Please select a rental period before checkout.</p>
              )}

              {/* Date range */}
              {selectedRange && dateRange && (
                <div className="mb-6 pb-6 border-b border-gray-300">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[#2c2c2c]">📅</span>
                      <span className="font-medium text-[#2c2c2c]">{dateRange.start}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-[#2c2c2c]">{dateRange.end}</span>
                  </div>
                </div>
              )}

              {/* Cart items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2c2c2c] text-sm line-clamp-2">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.quantity}x</p>
                    </div>
                    <p className="font-semibold text-[#2c2c2c] text-sm">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-[#2c2c2c] font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-[#2c2c2c] font-medium">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-300 pb-3">
                  <span className="text-gray-600">Total</span>
                  <span className="text-[#2c2c2c] font-semibold">Rs. {(subtotal + tax).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pt-3">
                  <span className="text-gray-600">Refundable security deposit</span>
                  <span className="text-[#2c2c2c] font-medium">Rs. {securityDeposit.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300">
                  <span className="text-[#2c2c2c]">Total due</span>
                  <span className="text-[#c49a5f]">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">Full prepayment, including security deposit</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
            <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-green-100">
              <svg className="h-9 w-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#2c2c2c] mb-3">Order completed successfully</h2>
            <p className="text-gray-600 mb-2">
              Your reservation has been placed and your dashboard will reflect the new order.
            </p>
            <p className="text-sm text-[#c49a5f] font-semibold mb-6">Amount deducted: Rs. {completedTotal.toFixed(2)}</p>
            <button
              type="button"
              onClick={() => navigate('/thank-you', { state: { deductedAmount: completedTotal } })}
              className="w-full rounded-lg bg-[#c49a5f] px-4 py-3 font-medium text-white transition-colors hover:bg-[#b8966b]"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
