export default function BuyerDamageReportModal({ rental, report, onClose, onReviewSeller }) {
  if (!rental || !report) return null

  const analysis = report.aiAnalysis || {}
  const detected = analysis.damageDetected === true
  const statusLabel = detected ? 'Damage detected' : 'No damage detected'
  const statusClass = detected ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
  const finalPenalty = Number(report.finalPenalty || rental.penalty || analysis.suggestedPenalty || 0)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="border-b border-gray-100 bg-[#D2B48C] px-6 py-5">
            <h2 className="text-2xl font-bold text-[#4b3b2a]">Damage Report</h2>
            <p className="mt-1 text-sm text-[#5C534D]">{rental.name}</p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className={`rounded-lg border p-4 ${statusClass}`}>
              <p className="text-sm font-semibold">{statusLabel}</p>
              <p className="mt-1 text-sm">
                Confidence: {Number(analysis.confidence || 0).toFixed(0)}%
                {analysis.severity ? ` · Severity: ${analysis.severity}` : ''}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase text-[#6B6B6B]">Suggested Penalty</p>
                <p className="mt-1 text-xl font-bold text-[#2d2d2d]">
                  Rs. {Number(analysis.suggestedPenalty || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase text-[#6B6B6B]">Final Penalty</p>
                <p className="mt-1 text-xl font-bold text-[#2d2d2d]">Rs. {finalPenalty.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase text-[#6B6B6B]">Decision</p>
                <p className="mt-1 text-xl font-bold capitalize text-[#2d2d2d]">
                  {report.sellerDecision || report.status || 'Pending'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-[#f9f7f4] p-4">
              <p className="text-sm font-semibold text-[#2d2d2d]">AI Analysis</p>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                {analysis.analysis || 'The AI analysis is not available yet.'}
              </p>
              {report.sellerNotes ? (
                <p className="mt-3 text-sm text-[#6B6B6B]">
                  <span className="font-semibold text-[#2d2d2d]">Seller notes:</span> {report.sellerNotes}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {report.beforeImages?.[0] ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#2d2d2d]">Before</p>
                  <img src={report.beforeImages[0]} alt="Before inspection" className="h-56 w-full rounded-lg object-cover" />
                </div>
              ) : null}
              {report.afterImages?.[0] ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#2d2d2d]">After</p>
                  <img src={report.afterImages[0]} alt="After inspection" className="h-56 w-full rounded-lg object-cover" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#2d2d2d] transition-colors hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onReviewSeller}
              className="rounded-lg bg-[#4b3b2a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3B2A22]"
            >
              Review Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
