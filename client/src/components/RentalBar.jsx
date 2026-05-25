import { useEffect, useState } from 'react'
import {
  MAX_RENTAL_MONTHS,
  getOrderedRentalRange,
  isRentalRangeLongerThanMax,
  normalizeDate,
} from '../utils/rentalPeriod.js'

function CalendarIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

export default function RentalBar() {
  const [periodOpen, setPeriodOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState(null)
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [periodError, setPeriodError] = useState('')
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
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
      console.error('Error loading selected rental period:', error)
    }
  }, [])

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
    setPeriodError('')
    setPeriodOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPeriodOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-t-[20px] bg-[#4b3b2a] px-6 py-4 text-left transition-colors hover:bg-[#e2cfbc]"
        aria-expanded={periodOpen}
        aria-haspopup="dialog"
      >
        <div className="flex items-center gap-4">
          <span className="text-[#ffffff] shrink-0" aria-hidden="true">
            <CalendarIcon className="h-6 w-6" />
          </span>
          {selectedRange ? (
            <div className="flex gap-6 w-full items-stretch">
              <div className="w-full bg-[#D6C2A8] border-t border-b border-[#9C7A50] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2">
                  <div className="pr-4 border-r border-[#D2B48C]/20">
                    <p className="text-xs text-[#6b6b6b]">Pickup date</p>
                    <p className="text-sm font-medium text-[#2c2c2c] mt-1">
                      {selectedRange.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="pl-4">
                    <p className="text-xs text-[#6b6b6b]">Return date</p>
                    <p className="text-sm font-medium text-[#2c2c2c] mt-1">
                      {(selectedRange.end || selectedRange.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-[#ffffff] font-bold text-[15px] leading-snug">
                Select a rental period
              </span>
              <span className="text-[#b8b8b8] text-[13px] leading-snug font-normal">
                View prices and availability
              </span>
            </div>
          )}
        </div>
        <span className="text-[#ffffff] shrink-0" aria-hidden="true">
          <ChevronRightIcon className="h-5 w-5" />
        </span>
      </button>

      {periodOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setPeriodOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
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
                            const exceedsMaxRange = pickup && !dropoff
                              ? isRentalRangeLongerThanMax(
                                getOrderedRentalRange(pickup, normalizedCell).start,
                                getOrderedRentalRange(pickup, normalizedCell).end
                              )
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
