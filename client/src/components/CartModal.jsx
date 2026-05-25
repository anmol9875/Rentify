import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MAX_RENTAL_MONTHS,
  getOrderedRentalRange,
  isRentalRangeLongerThanMax,
  normalizeDate,
} from '../utils/rentalPeriod.js'
import { getSecurityDeposit } from '../utils/pricing.js'

function XIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function RemoveIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  )
}

function AddIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function CalendarIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

export default function CartModal({ onClose }) {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [selectedRange, setSelectedRange] = useState(null)
  const [periodOpen, setPeriodOpen] = useState(false)
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [periodError, setPeriodError] = useState('')

  useEffect(() => {
    loadCart()
    loadDates()
  }, [])

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    }
  }

  const loadDates = () => {
    try {
      const stored = localStorage.getItem('selectedRange')
      if (!stored) return

      const parsed = JSON.parse(stored)
      const range = {
        start: new Date(parsed.start),
        end: new Date(parsed.end),
      }

      setSelectedRange(range)
      setPickup(range.start)
      setDropoff(range.end)
    } catch (error) {
      console.error('Error loading dates:', error)
    }
  }

  const notifyCartUpdate = () => {
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return

    const updated = [...cartItems]
    const available = Number(updated[index].availability)
    const maxQuantity = Number.isFinite(available) && available > 0 ? available : newQuantity
    updated[index].quantity = Math.min(newQuantity, maxQuantity)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    notifyCartUpdate()
  }

  const removeItem = (index) => {
    const updated = cartItems.filter((_, itemIndex) => itemIndex !== index)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    notifyCartUpdate()
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const securityDeposit = getSecurityDeposit(cartItems)

  const formatDateRange = () => {
    if (!selectedRange) return ''
    const start = selectedRange.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const end = selectedRange.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return `${start} - ${end}`
  }

  const handleDateClick = (cell) => {
    const today = normalizeDate(new Date())
    const currentCell = normalizeDate(cell)

    if (currentCell < today) return

    if (!pickup || (pickup && dropoff)) {
      setPickup(cell)
      setDropoff(null)
      setPeriodError('')
      return
    }

    if (cell < pickup) {
      const range = getOrderedRentalRange(cell, pickup)
      if (isRentalRangeLongerThanMax(range.start, range.end)) {
        setPeriodError(`Rental period cannot be longer than ${MAX_RENTAL_MONTHS} months.`)
        return
      }

      setDropoff(pickup)
      setPickup(cell)
      setPeriodError('')
      return
    }

    if (isRentalRangeLongerThanMax(pickup, cell)) {
      setPeriodError(`Rental period cannot be longer than ${MAX_RENTAL_MONTHS} months.`)
      return
    }

    setDropoff(cell)
    setPeriodError('')
  }

  const clearSelectedRange = () => {
    setPickup(null)
    setDropoff(null)
    setSelectedRange(null)
    setPeriodError('')
    localStorage.removeItem('selectedRange')
    window.dispatchEvent(new Event('rentalPeriodUpdated'))
  }

  const applySelectedRange = () => {
    if (!pickup) return

    const range = {
      start: pickup,
      end: dropoff || pickup,
    }

    if (isRentalRangeLongerThanMax(range.start, range.end)) {
      setPeriodError(`Rental period cannot be longer than ${MAX_RENTAL_MONTHS} months.`)
      return
    }

    setSelectedRange(range)
    localStorage.setItem('selectedRange', JSON.stringify({
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    }))
    window.dispatchEvent(new Event('rentalPeriodUpdated'))
    setCheckoutMessage('')
    setPeriodError('')
    setPeriodOpen(false)
  }

  const handleCheckout = () => {
    if (!selectedRange?.start || !selectedRange?.end) {
      setCheckoutMessage('Please select a rental period before checkout.')
      return
    }

    if (isRentalRangeLongerThanMax(selectedRange.start, selectedRange.end)) {
      setCheckoutMessage(`Rental period cannot be longer than ${MAX_RENTAL_MONTHS} months.`)
      return
    }

    setCheckoutMessage('')
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-[#D2B48C] p-4">
            <h2 className="text-2xl font-semibold text-[#4b3b2a]">Cart</h2>
            <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
              <XIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <button
                type="button"
                onClick={() => setPeriodOpen(true)}
                className="mb-4 flex w-full items-center justify-center gap-3 bg-[#c49a5f] px-4 py-3 text-center text-[#2c1f12] transition-colors hover:bg-[#b8966b]"
              >
                <CalendarIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {selectedRange ? formatDateRange() : 'Select a rental period'}
                </span>
              </button>

              {cartItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                  <p className="mb-6 text-center font-medium text-[#2c2c2c]">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-[#c49a5f] px-6 py-3 font-medium text-[#c49a5f] transition-colors hover:bg-[#f9f5f0]"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex gap-3 overflow-hidden rounded-lg border border-gray-200">
                      <div className="h-24 w-20 shrink-0 bg-gray-100">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-semibold text-[#2c2c2c]">{item.title}</h3>
                          <p className="mt-1 text-xs text-green-600">● {item.availability || 1} available</p>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-sm border border-gray-300 text-xs">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center p-1 hover:bg-gray-100"
                            >
                              <RemoveIcon className="w-3 h-3" />
                            </button>
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10) || 1
                                updateQuantity(index, Math.max(1, value))
                              }}
                              className="w-6 border-l border-r border-gray-300 py-1 text-center text-xs"
                            />
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={Number(item.availability) > 0 && item.quantity >= Number(item.availability)}
                              className="flex h-6 w-6 items-center justify-center p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              <AddIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-[#2c2c2c]">
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center pr-2">
                        <button
                          onClick={() => removeItem(index)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Remove"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="space-y-4 border-t border-gray-200 bg-white p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-[#2c2c2c]">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security deposit</span>
                  <span className="font-medium text-[#2c2c2c]">Rs. {securityDeposit.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className={`w-full rounded px-4 py-3 text-sm font-medium transition-colors ${
                    selectedRange?.start && selectedRange?.end
                      ? 'bg-[#c49a5f] text-white hover:bg-[#b8966b]'
                      : 'bg-[#e0d5c7] text-[#8f7a5d] hover:bg-[#d8c5a8]'
                  }`}
                >
                  Checkout
                </button>
                {checkoutMessage && (
                  <p className="text-sm text-red-500">{checkoutMessage}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {periodOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setPeriodOpen(false)} />
          <div className="fixed inset-0 z-[61] flex items-start justify-center p-6">
            <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 bg-[#D2B48C] p-4">
                <h3 className="text-2xl font-semibold text-[#4b3b2a]">Select rental period</h3>
                <button
                  type="button"
                  onClick={() => setPeriodOpen(false)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#fbf7f1] px-6 pt-6 pb-4">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-xs text-[#6b6b6b]">Pickup</p>
                    <p className="font-medium text-[#2c2c2c]">{pickup ? pickup.toLocaleDateString() : 'Select date'}</p>
                  </div>
                  <div className="text-[#9C7A50]">→</div>
                  <div className="text-right">
                    <p className="text-xs text-[#6b6b6b]">Return</p>
                    <p className="font-medium text-[#2c2c2c]">{dropoff ? dropoff.toLocaleDateString() : 'Select date'}</p>
                  </div>
                </div>
                {periodError && (
                  <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {periodError}
                  </p>
                )}
                <p className="mb-4 text-xs text-[#6b6b6b]">
                  Rentals can be reserved for up to {MAX_RENTAL_MONTHS} months.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1].map((offset) => {
                    const monthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
                    const year = monthDate.getFullYear()
                    const month = monthDate.getMonth()
                    const monthName = monthDate.toLocaleString(undefined, { month: 'long' })
                    const firstDay = new Date(year, month, 1).getDay()
                    const daysInMonth = new Date(year, month + 1, 0).getDate()
                    const cells = []

                    for (let i = 0; i < firstDay; i += 1) cells.push(null)
                    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day))

                    return (
                      <div key={offset}>
                        <h4 className="mb-2 text-center text-sm font-medium text-[#2c2c2c]">{monthName} {year}</h4>
                        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] text-[#6b6b6b]">
                          {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((dayName) => (
                            <div key={dayName} className="py-1">{dayName}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {cells.map((cell, index) => {
                            if (!cell) return <div key={`${offset}-${index}`} className="h-8" />

                            const today = normalizeDate(new Date())
                            const normalizedCell = normalizeDate(cell)
                            const isBeforeToday = normalizedCell < today
                            const comparedRange = pickup && !dropoff
                              ? getOrderedRentalRange(pickup, normalizedCell)
                              : null
                            const exceedsMaxRange = comparedRange
                              ? isRentalRangeLongerThanMax(comparedRange.start, comparedRange.end)
                              : false
                            const isPickup = pickup && cell.toDateString() === pickup.toDateString()
                            const isDropoff = dropoff && cell.toDateString() === dropoff.toDateString()
                            let inRange = false

                            if (pickup && dropoff) {
                              const start = pickup < dropoff ? pickup : dropoff
                              const end = pickup < dropoff ? dropoff : pickup
                              inRange = cell > start && cell < end
                            }

                            const baseClasses = 'flex h-8 w-full items-center justify-center rounded'
                            const className = isBeforeToday || exceedsMaxRange
                              ? `${baseClasses} cursor-not-allowed text-[#c0c0c0]`
                              : isPickup || isDropoff
                                ? `${baseClasses} border-2 border-[#1E90FF] bg-white font-semibold text-[#2c2c2c]`
                                : inRange
                                  ? `${baseClasses} bg-[#e8f3ff] text-[#2c2c2c]`
                                  : `${baseClasses} cursor-pointer text-[#2c2c2c] hover:bg-[#f3f7fb]`

                            return (
                              <button
                                key={`${offset}-${index}`}
                                type="button"
                                onClick={() => handleDateClick(cell)}
                                disabled={isBeforeToday || exceedsMaxRange}
                                className={className}
                                title={exceedsMaxRange ? `Maximum rental period is ${MAX_RENTAL_MONTHS} months` : undefined}
                              >
                                {cell.getDate()}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearSelectedRange}
                    className="text-sm text-[#6b6b6b] hover:text-[#2c2c2c]"
                  >
                    Clear dates
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      onClick={applySelectedRange}
                      className={`rounded px-4 py-2 text-sm font-medium ${
                        pickup ? 'bg-[#c49a5f] text-white hover:bg-[#b8966b]' : 'cursor-not-allowed bg-[#e0d5c7] text-[#999]'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
