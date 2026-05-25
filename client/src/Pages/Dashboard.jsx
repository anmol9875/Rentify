import { useState, useContext, useEffect } from 'react'
import Header from '../components/Header.jsx'
import DashboardHero from '../components/DashboardHero.jsx'
import DashboardMetrics from '../components/DashboardMetrics.jsx'
import MyRentals from '../components/MyRentals.jsx'
import ReturnItemModal from '../components/ReturnItemModal.jsx'
import ThankYouMessage from '../components/ThankYouMessage.jsx'
import ReviewForm from '../components/ReviewForm.jsx'
import BuyerDamageReportModal from '../components/BuyerDamageReportModal.jsx'
import Footer from '../components/Footer.jsx'
import AuthContext from '../context/AuthContext.jsx'
import LoginRegister from '../components/LoginRegister.jsx'
import SellerDashboard from './SellerDashboard.jsx'
import { getDamageReports, getRentals, submitReview } from '../services/api.js'

function BuyerPenaltyNoticeModal({ rental, onClose }) {
  if (!rental) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
          <div className="border-b border-red-100 bg-red-50 px-6 py-5">
            <h2 className="text-2xl font-bold text-[#7a2f2f]">Damage Penalty Approved</h2>
            <p className="mt-1 text-sm text-[#7a2f2f]">
              A seller has approved a damage charge for one of your rentals.
            </p>
          </div>
          <div className="space-y-4 px-6 py-6 text-sm text-[#2d2d2d]">
            <div className="rounded-lg border border-gray-200 bg-[#f9f7f4] p-4">
              <p className="font-semibold">{rental.name}</p>
              <p className="mt-1 text-[#6B6B6B]">
                Rental period: {rental.startDate} to {rental.endDate}
              </p>
              {rental.notes ? (
                <p className="mt-2 text-[#6B6B6B]">{rental.notes}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">Penalty</p>
                <p className="mt-1 text-2xl font-bold text-red-700">
                  Rs. {Number(rental.penalty || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">Status</p>
                <p className="mt-1 text-2xl font-bold text-[#2d2d2d]">{rental.status}</p>
              </div>
            </div>
            <p className="text-[#6B6B6B]">
              The approved penalty has been deducted from your held security deposit / wallet balance and credited to the seller.
            </p>
          </div>
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-[#D2B48C] px-4 py-3 font-medium text-white transition-colors hover:bg-[#b8966b]"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { isLoggedIn, isAuthReady, user, refreshUser } = useContext(AuthContext)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [selectedRental, setSelectedRental] = useState(null)
  const [returnedFiles, setReturnedFiles] = useState(null)
  const [rentals, setRentals] = useState([])
  const [damageReports, setDamageReports] = useState([])
  const [isLoadingRentals, setIsLoadingRentals] = useState(false)
  const [penaltyNoticeRental, setPenaltyNoticeRental] = useState(null)
  const [selectedDamageReport, setSelectedDamageReport] = useState(null)
  const [reviewContext, setReviewContext] = useState(null)

  useEffect(() => {
    if (!isAuthReady) {
      return
    }

    if (!isLoggedIn || user?.role !== 'buyer') {
      setRentals([])
      setDamageReports([])
      return
    }

    let isMounted = true

    const fetchRentals = async () => {
      try {
        setIsLoadingRentals(true)
        const [response, reportsResponse] = await Promise.all([
          getRentals({ role: 'buyer' }),
          getDamageReports({ role: 'buyer' }),
          refreshUser?.(),
        ])

        if (!isMounted) return

        if (response.rentals && Array.isArray(response.rentals)) {
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
        setDamageReports(reportsResponse?.reports || [])
      } catch (error) {
        console.error('Failed to fetch rentals:', error)
        setRentals([])
        setDamageReports([])
      } finally {
        if (isMounted) {
          setIsLoadingRentals(false)
        }
      }
    }

    fetchRentals()

    const refreshInterval = window.setInterval(() => {
      fetchRentals()
    }, 15000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRentals()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      window.clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthReady, isLoggedIn, user?.id, user?.role, refreshUser])

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'buyer' || rentals.length === 0) {
      setPenaltyNoticeRental(null)
      return
    }

    const seenKey = `rentify_seen_penalties_${user?.id || 'buyer'}`
    let seenPenaltyIds = []

    try {
      seenPenaltyIds = JSON.parse(localStorage.getItem(seenKey) || '[]')
    } catch (error) {
      seenPenaltyIds = []
    }

    const latestUnseenPenalty = rentals.find(
      (rental) => rental.status === 'Completed' && Number(rental.penalty) > 0 && !seenPenaltyIds.includes(rental.id)
    )

    if (latestUnseenPenalty) {
      setPenaltyNoticeRental(latestUnseenPenalty)
    }
  }, [rentals, isLoggedIn, user?.id, user?.role])

  const handleClosePenaltyNotice = () => {
    if (penaltyNoticeRental && user?.id) {
      const seenKey = `rentify_seen_penalties_${user.id}`
      try {
        const existing = JSON.parse(localStorage.getItem(seenKey) || '[]')
        const updated = Array.from(new Set([...existing, penaltyNoticeRental.id]))
        localStorage.setItem(seenKey, JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to persist seen penalty notice', error)
      }
    }

    setPenaltyNoticeRental(null)
  }

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

  const handleReturnClick = (rental) => {
    setSelectedRental(rental)
    setShowReturnModal(true)
  }

  const handleReturnSubmit = (rentalId, files) => {
    // store returned files for potential upload/processing
    setReturnedFiles(files || null)
    setShowReturnModal(false)
    setShowThankYou(true)
  }

  const handleThankYouContinue = () => {
    setShowThankYou(false)
    setReviewContext('return')
    setShowReview(true)
  }

  const handleReviewSubmit = (reviewData) => {
    if (selectedRental?.id) {
      submitReview({
        rentalId: selectedRental.id,
        rating: reviewData.rating,
        review: reviewData.review,
      }).catch((error) => {
        console.error('Failed to submit review:', error)
      })
    }

    if (reviewContext === 'damage-report') {
      setShowReview(false)
      setSelectedRental(null)
      setReturnedFiles(null)
      setReviewContext(null)
      return
    }

    // Update rental status
    setRentals((prev) =>
      prev.map((rental) =>
        rental.id === selectedRental?.id
          ? {
              ...rental,
              status: 'Under Inspection',
              statusBg: 'bg-yellow-100',
              statusText: 'text-yellow-800',
              action: 'Awaited Inspection',
              actionType: 'text',
            }
          : rental
      )
    )
    setShowReview(false)
    setSelectedRental(null)
    setReturnedFiles(null)
    setReviewContext(null)
  }

  const handleReviewSkip = () => {
    if (reviewContext === 'damage-report') {
      setShowReview(false)
      setSelectedRental(null)
      setReturnedFiles(null)
      setReviewContext(null)
      return
    }

    // Update rental status even if skipped
    setRentals((prev) =>
      prev.map((rental) =>
        rental.id === selectedRental?.id
          ? {
              ...rental,
              status: 'Under Inspection',
              statusBg: 'bg-yellow-100',
              statusText: 'text-yellow-800',
              action: 'Awaited Inspection',
              actionType: 'text',
            }
          : rental
      )
    )
    setShowReview(false)
    setSelectedRental(null)
    setReturnedFiles(null)
    setReviewContext(null)
  }

  const handleViewDamageReport = (rental, report) => {
    setSelectedRental(rental)
    setSelectedDamageReport(report)
  }

  const handleCloseDamageReport = () => {
    setSelectedDamageReport(null)
    setSelectedRental(null)
  }

  const handleReviewSellerFromDamageReport = () => {
    setSelectedDamageReport(null)
    setReviewContext('damage-report')
    setShowReview(true)
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] flex flex-col">
      <Header />
      <DashboardHero />

      {/* Content area - render differently for guest / buyer / seller */}
      {!isAuthReady ? (
        <section className="bg-[#f5f1ea] py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">Loading your dashboard...</p>
            </div>
          </div>
        </section>
      ) : !isLoggedIn ? (
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <LoginRegister />
        </div>
      ) : user?.role === 'buyer' ? (
        <>
          {/* Metrics section should sit directly under the hero to avoid white gap.
              Embed MyRentals inside DashboardMetrics so both share the beige background. */}
          {/* compute metrics from rentals and user */}
          {(() => {
            const activeCount = rentals.filter(
              (r) => r.status === 'Active' || r.status === 'Pending'
            ).length
            const completedCount = rentals.filter((r) => r.status === 'Completed').length
            // totalPenalties: sum rental.penalty if present
            const totalPenalties = rentals.reduce((sum, r) => sum + (r.penalty || 0), 0)
            const wallet = user?.walletBalance ?? 0
            const latestPenaltyRental = rentals.find((r) => r.status === 'Completed' && Number(r.penalty) > 0)

            return (
              <DashboardMetrics
                activeRentals={activeCount}
                completedRentals={completedCount}
                totalPenalties={totalPenalties}
                walletBalance={wallet}
              >
                {latestPenaltyRental ? (
                  <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-[#7a2f2f]">
                    <p className="text-sm font-semibold">Penalty Notice</p>
                    <p className="mt-1 text-sm">
                      A damage penalty of Rs. {Number(latestPenaltyRental.penalty).toFixed(2)} was approved for{' '}
                      {latestPenaltyRental.name}. The amount has been deducted from your held wallet/security deposit
                      balance and credited to the seller.
                    </p>
                  </div>
                ) : null}
                <div className="mt-10">{/* spacing between cards and rentals */}
                  <MyRentals
                    rentals={rentals}
                    damageReports={damageReports}
                    onReturnClick={handleReturnClick}
                    onViewDamageReport={handleViewDamageReport}
                    inDashboard
                    isLoading={isLoadingRentals}
                  />
                </div>
              </DashboardMetrics>
            )
          })()}
        </>
      ) : user?.role === 'seller' ? (
        /* Seller dashboard uses same beige background as metrics */
        <section className="bg-[#f5f1ea] py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-6">
            <SellerDashboard />
          </div>
        </section>
      ) : (
        null
      )}

      <Footer />

      {/* Modals */}
      {showReturnModal && selectedRental && (
        <ReturnItemModal
          rental={selectedRental}
          onClose={() => {
            setShowReturnModal(false)
            setSelectedRental(null)
          }}
          onSubmit={handleReturnSubmit}
        />
      )}

      {showThankYou && <ThankYouMessage onContinue={handleThankYouContinue} />}

      {showReview && selectedRental && (
        <ReviewForm
          itemName={selectedRental.name}
          onSubmit={handleReviewSubmit}
          onSkip={handleReviewSkip}
        />
      )}

      {penaltyNoticeRental && (
        <BuyerPenaltyNoticeModal rental={penaltyNoticeRental} onClose={handleClosePenaltyNotice} />
      )}

      {selectedDamageReport && selectedRental && (
        <BuyerDamageReportModal
          rental={selectedRental}
          report={selectedDamageReport}
          onClose={handleCloseDamageReport}
          onReviewSeller={handleReviewSellerFromDamageReport}
        />
      )}
    </div>
  )
}
  
