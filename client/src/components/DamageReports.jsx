import { useState } from 'react'
import DamageInspectionModal from './DamageInspectionModal.jsx'

function CheckIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.061-1.061l3.845 3.845 7.572-9.992a.75.75 0 011.052-.143z" clipRule="evenodd" />
    </svg>
  )
}

function AlertTriangleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M9.401 3.003c1.492-2.011 4.106-2.011 5.598 0l7.894 10.675c1.492 2.011.399 4.902-1.898 4.902H4.305c-2.297 0-3.39-2.891-1.898-4.902L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  )
}

export default function DamageReports({ reports = [], rentals = [], isLoading = false, onRefresh }) {
  const [selectedReport, setSelectedReport] = useState(null)
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)

  const pendingReports = reports.filter((report) => report.status === 'pending')
  const confirmedReports = reports.filter((report) => report.status !== 'pending')
  const pendingRentalReviews = rentals.filter((rental) =>
    rental.status === 'Pending' || rental.status === 'Under Inspection'
  )
  const reportRentalIds = new Set(
    pendingReports.map((report) => String(report.rental?._id || report.rental))
  )
  const rentalOnlyPendingReviews = pendingRentalReviews.filter(
    (rental) => !reportRentalIds.has(String(rental._id))
  )
  const pendingReviewCount = pendingReports.length + rentalOnlyPendingReviews.length

  const handleReviewAndDecide = (card) => {
    setSelectedReport(card)
    setInspectionModalOpen(true)
  }

  const handleCloseInspection = () => {
    setInspectionModalOpen(false)
    setSelectedReport(null)
  }

  const handleUpdateRental = (payload) => {
    if (payload?.type === 'analysis-complete') {
      setSelectedReport((current) =>
        current
          ? {
              ...current,
              modalData: {
                ...current.modalData,
                reportId: payload.reportId,
                afterImage: current.modalData.afterImage,
              },
            }
          : current
      )
      onRefresh?.()
      return
    }

    onRefresh?.()
    handleCloseInspection()
  }

  const reviewCards = [
    ...rentalOnlyPendingReviews.map((rental) => ({
      key: rental._id,
      type: 'rental',
      title: rental.product?.title || 'Unknown Item',
      reportLabel: `Rental ID: ${rental.rentalId || rental._id}`,
      status: rental.status,
      beforeImage: rental.product?.image,
      afterImage: rental.product?.image,
      confidence: 'Awaiting review',
      severity: rental.status === 'Under Inspection' ? 'Inspection Needed' : 'Pending',
      penalty: `Rs. ${Number(rental.penalty || 0).toFixed(2)}`,
      modalData: {
        id: rental._id,
        reportId: rental.damageReport || null,
        item: rental.product?.title || 'Unknown Item',
        buyer: rental.buyer?.fullName || rental.buyer?.email || 'Unknown Buyer',
        period: rental.startDate && rental.endDate
          ? `${new Date(rental.startDate).toLocaleDateString()} to ${new Date(rental.endDate).toLocaleDateString()}`
          : 'N/A',
        amount: `Rs. ${Number(rental.totalCost || 0).toFixed(2)}`,
        beforeImage: rental.product?.image || null,
        afterImage: null,
        aiAnalysis: null,
      },
    })),
    ...pendingReports.map((report) => ({
      key: report._id,
      type: 'report',
      title: report.product?.title || 'Unknown Item',
      reportLabel: `Report ID: ${report.reportId}`,
      status: 'Pending',
      beforeImage: report.beforeImages?.[0] || report.product?.image,
      afterImage: report.afterImages?.[0] || report.product?.image,
      confidence: `${report.aiAnalysis?.confidence ?? 0}%`,
      severity: report.aiAnalysis?.severity || 'Pending',
      penalty: `Rs. ${Number(report.aiAnalysis?.suggestedPenalty || 0).toFixed(2)}`,
      modalData: {
        id: report.rental?._id || report._id,
        reportId: report._id,
        item: report.product?.title || 'Unknown Item',
        buyer: report.buyer?.fullName || report.buyer?.email || 'Unknown Buyer',
        period: report.rental?.startDate && report.rental?.endDate
          ? `${new Date(report.rental.startDate).toLocaleDateString()} to ${new Date(report.rental.endDate).toLocaleDateString()}`
          : 'N/A',
        amount: `Rs. ${Number(report.rental?.totalCost || 0).toFixed(2)}`,
        beforeImage: report.product?.image || report.beforeImages?.[0] || null,
        afterImage: report.afterImages?.[0] || null,
        aiAnalysis: report.aiAnalysis || null,
      },
    })),
  ]

  return (
    <section className="py-8 md:py-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#4b3b2a] mb-2">
        Damage Reports
      </h2>
      <p className="text-[#6b6b6b] mb-8">Review AI-generated damage detection reports</p>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#D2B48C] rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-sm font-medium text-[#6b6b6b] mb-2">Pending Review</div>
          <div className="text-3xl font-bold text-[#2d2d2d]">{pendingReviewCount}</div>
        </div>
        <div className="bg-[#D2B48C] rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-sm font-medium text-[#6b6b6b] mb-2">Confirmed</div>
          <div className="text-3xl font-bold text-[#2d2d2d]">{confirmedReports.length}</div>
        </div>
        <div className="bg-[#D2B48C] rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-sm font-medium text-[#6b6b6b] mb-2">Disputed</div>
          <div className="text-3xl font-bold text-[#2d2d2d]">0</div>
        </div>
      </div>

      {/* Pending Reports */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangleIcon className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-[#2c2c2c]">
            Pending Review ({pendingReviewCount})
          </h3>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-[#6b6b6b]">
            Loading damage reports...
          </div>
        ) : reviewCards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-[#6b6b6b]">
            No pending damage reports.
          </div>
        ) : (
          <>
            {reviewCards.map((card) => (
              <div
                key={card.key}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[#2c2c2c]">{card.title}</h4>
                    <p className="text-sm text-[#6b6b6b]">{card.reportLabel}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    {card.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-[#2c2c2c] text-center mb-2">Before</p>
                    <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                      {card.beforeImage ? (
                        <img src={card.beforeImage} alt="Before" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm text-gray-500">No image</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2c2c2c] text-center mb-2">After</p>
                    <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                      {card.afterImage ? (
                        <img src={card.afterImage} alt="After" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm text-gray-500">No image</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-700">Pending Seller Review</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[#6b6b6b]">AI Confidence</p>
                      <p className="font-semibold text-[#2c2c2c]">{card.confidence}</p>
                    </div>
                    <div>
                      <p className="text-[#6b6b6b]">Severity</p>
                      <p className="font-semibold text-[#2c2c2c]">{card.severity}</p>
                    </div>
                    <div>
                      <p className="text-[#6b6b6b]">Penalty</p>
                      <p className="font-semibold text-red-600">{card.penalty}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReviewAndDecide(card)}
                  className="w-full bg-[#2c2c2c] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1a1a1a] transition flex items-center justify-center gap-2"
                >
                  Review & Decide
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Confirmed Reports */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <CheckIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-[#2c2c2c]">
            Confirmed Reports ({confirmedReports.length})
          </h3>
        </div>

        {!isLoading && confirmedReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-[#6b6b6b]">
            No confirmed damage reports yet.
          </div>
        ) : !isLoading && confirmedReports.map((report) => (
          <div
            key={report._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-[#2c2c2c]">{report.product?.title || 'Unknown Item'}</h4>
                <p className="text-sm text-[#6b6b6b]">Report ID: {report.reportId}</p>
              </div>
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                {report.status}
              </span>
            </div>

            {/* Before/After Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-[#2c2c2c] text-center mb-2">Before</p>
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                  {!!report.beforeImages?.[0] && (
                    <img src={report.beforeImages[0]} alt="Before" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#2c2c2c] text-center mb-2">After</p>
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                  {!!report.afterImages?.[0] && (
                    <img src={report.afterImages[0]} alt="After" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            </div>

            {report.aiAnalysis?.damageDetected === false ? (
              <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-700">No Damage Detected</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#6b6b6b]">AI Confidence</p>
                    <p className="font-semibold text-[#2c2c2c]">{report.aiAnalysis?.confidence ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-[#6b6b6b]">Penalty Applied: No</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200 text-sm text-red-700">
                Damage confirmed. Suggested penalty: Rs. {Number(report.aiAnalysis?.suggestedPenalty || report.finalPenalty || 0).toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Damage Inspection Modal */}
      {inspectionModalOpen && selectedReport && (
        <DamageInspectionModal
          rental={selectedReport.modalData}
          onClose={handleCloseInspection}
          onUpdateRental={handleUpdateRental}
        />
      )}
    </section>
  )
}
