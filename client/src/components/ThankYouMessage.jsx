export default function ThankYouMessage({ onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-[#b8966b] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#4b3b2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#4b3b2a] mb-2">Thank You!</h2>
        <p className="text-sm text-[#6B6B6B] mb-6">
          Thank you for submitting your return. Your item photos have been received and will now go through our AI
          inspection process. You will be notified once the inspection is complete.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="px-6 py-2 bg-[#D2B48C] text-white text-sm font-medium rounded-lg hover:bg-[#b8966b] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
