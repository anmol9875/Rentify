import { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext.jsx'
import { getDamageReports, getRentals } from '../services/api.js'

export default function MyRentals({
  rentals: propsRentals,
  damageReports: propsDamageReports = [],
  onReturnClick,
  onViewDamageReport,
  inDashboard = false,
  isLoading: propsIsLoading = false,
}) {
  const { user } = useContext(AuthContext)
  const [rentals, setRentals] = useState([])
  const [damageReports, setDamageReports] = useState(propsDamageReports)
  const [isLoading, setIsLoading] = useState(propsIsLoading)

  useEffect(() => {
    setIsLoading(propsIsLoading)
  }, [propsIsLoading])

  useEffect(() => {
    setDamageReports(propsDamageReports)
  }, [propsDamageReports])

  const getReportForRental = (rentalId) => (
    damageReports.find((report) => {
      const reportRentalId =
        typeof report.rental === 'object' ? report.rental?._id || report.rental?.id : report.rental

      return String(reportRentalId) === String(rentalId)
    })
  )

  // Fetch rentals from API if not provided as props
  useEffect(() => {
    if (propsRentals) {
      setRentals(propsRentals)
      setIsLoading(propsIsLoading)
      return
    }

    if (!user?.id) return

    const fetchRentals = async () => {
      try {
        setIsLoading(true)
        const [response, reportsResponse] = await Promise.all([
          getRentals({ role: 'buyer' }),
          getDamageReports({ role: 'buyer' }),
        ])
        setDamageReports(reportsResponse.reports || [])
        if (response.rentals && Array.isArray(response.rentals)) {
          // Transform backend rental format to component format
          const transformedRentals = response.rentals.map((rental) => ({
            id: rental._id || rental.rentalId,
            name: rental.product?.title || 'Unknown Item',
            image: rental.product?.image || '/placeholder.jpg',
            startDate: new Date(rental.startDate).toISOString().split('T')[0],
            endDate: new Date(rental.endDate).toISOString().split('T')[0],
            totalCost: rental.totalCost || 0,
            penalty: rental.penalty || 0,
            notes: rental.notes || '',
            status: rental.status || 'Pending',
            statusBg: getStatusBg(rental.status, rental.penalty),
            statusText: getStatusText(rental.status, rental.penalty),
            action: getActionText(rental.status, rental.penalty),
            actionType: getActionType(rental.status),
          }))
          setRentals(transformedRentals)
        }
      } catch (error) {
        console.error('Failed to fetch rentals:', error)
        setRentals([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRentals()
  }, [user?.id, propsRentals])

  const getStatusBg = (status, penalty = 0) => {
    if (status === 'Completed' && penalty > 0) {
      return 'bg-red-100'
    }
    switch (status) {
      case 'Active':
        return 'bg-blue-100'
      case 'Completed':
        return 'bg-green-100'
      case 'Under Inspection':
        return 'bg-yellow-100'
      case 'Pending':
        return 'bg-gray-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getStatusText = (status, penalty = 0) => {
    if (status === 'Completed' && penalty > 0) {
      return 'text-red-800'
    }
    switch (status) {
      case 'Active':
        return 'text-blue-800'
      case 'Completed':
        return 'text-green-800'
      case 'Under Inspection':
        return 'text-yellow-800'
      case 'Pending':
        return 'text-gray-800'
      default:
        return 'text-gray-800'
    }
  }

  const getActionText = (status, penalty = 0) => {
    if (status === 'Completed' && penalty > 0) {
      return `Penalty Applied: Rs. ${Number(penalty).toFixed(2)}`
    }
    switch (status) {
      case 'Active':
        return 'Return Item'
      case 'Completed':
        return 'View Details'
      case 'Under Inspection':
        return 'Awaited Inspection'
      default:
        return 'Pending'
    }
  }

  const getActionType = (status) => {
    return status === 'Active' ? 'button' : 'text'
  }

  const content = (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#2d2d2d] mb-2">My Rentals</h2>
        <p className="text-[#6B6B6B]">Track and manage your rental items</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Loading your rentals...</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m0 0l8 4m0-4l8 4m0 0v10l-8 4m0-4l-8 4m0-4v10m8-20l8 4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#2d2d2d] mb-2">No Rentals Yet</h3>
          <p className="text-[#6B6B6B] mb-6">Start exploring items and create your first rental!</p>
          <a
            href="/collections"
            className="inline-block px-6 py-2 bg-[#D2B48C] text-white font-medium rounded-lg hover:bg-[#b8966b] transition-colors"
          >
            Browse Items
          </a>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="col-span-3">
                <span className="text-sm font-semibold text-[#2d2d2d]">Item</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-[#2d2d2d]">Rental Period</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-[#2d2d2d]">Total Cost</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-[#2d2d2d]">Status</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-semibold text-[#2d2d2d]">Actions</span>
              </div>
            </div>

            {/* Rental Items */}
            <div className="divide-y divide-gray-100">
              {rentals.map((rental) => (
            (() => {
              const damageReport = getReportForRental(rental.id)
              const hasAnalyzedReport = Boolean(damageReport?.aiAnalysis)

              return (
            <div
              key={rental.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors"
            >
              {/* Item */}
              <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden shrink-0">
                  <img
                    src={rental.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2d2d2d]">{rental.name}</p>
                  <p className="text-xs text-[#6B6B6B]">ID: {rental.id}</p>
                </div>
              </div>

              {/* Rental Period */}
              <div className="col-span-1 md:col-span-2 flex items-center">
                <span className="text-sm text-[#2d2d2d]">
                  {rental.startDate} <span className="text-[#6B6B6B]">to</span> {rental.endDate}
                </span>
              </div>

              {/* Total Cost */}
              <div className="col-span-1 md:col-span-2 flex items-center">
                <div>
                  <span className="text-sm font-medium text-[#2d2d2d]">Rs. {Number(rental.totalCost).toFixed(2)}</span>
                  {Number(rental.penalty || 0) > 0 ? (
                    <p className="mt-1 text-xs text-red-700">Penalty: Rs. {Number(rental.penalty).toFixed(2)}</p>
                  ) : null}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1 md:col-span-2 flex items-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${rental.statusBg} ${rental.statusText}`}
                >
                  {rental.status}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 md:col-span-3 flex items-center">
                {rental.actionType === 'button' ? (
                  <button
                    type="button"
                    onClick={() => onReturnClick(rental)}
                    className="px-4 py-2 bg-[#D2B48C] text-white text-sm font-medium rounded-lg hover:bg-[#b8966b] transition-colors"
                  >
                    {rental.action}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <span className="text-sm text-[#6B6B6B]">{rental.action}</span>
                    {hasAnalyzedReport && onViewDamageReport ? (
                      <button
                        type="button"
                        onClick={() => onViewDamageReport(rental, damageReport)}
                        className="block text-sm font-medium text-[#4b3b2a] underline-offset-4 hover:underline"
                      >
                        View Damage Report
                      </button>
                    ) : null}
                    {rental.notes ? (
                      <p className="mt-1 text-xs text-[#6B6B6B]">{rental.notes}</p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
              )
            })()
          ))}
            </div>
          </div>
        </>
      )}
    </>
  )

  if (inDashboard) {
    // Render only inner content when embedded in dashboard's beige section
    return <div>{content}</div>
  }

  return (
    <section className="bg-[#f5f1ea] py-10 md:py-14" aria-label="My rentals">
      <div className="max-w-7xl mx-auto px-6">{content}</div>
    </section>
  )
}
