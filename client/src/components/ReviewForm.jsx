import { useState } from 'react'

function StarIcon({ filled = false, className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function PaperPlaneIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

export default function ReviewForm({ itemName, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({ rating, review })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f5f1ea] rounded-lg shadow-xl max-w-2xl w-full p-8">
        <h2 className="text-4xl font-extrabold text-[#4b3b2a] mb-2" style={{ fontFamily: 'Cormorant Garamond' }}>Rate Your Experience</h2>
        <p className="text-sm text-[#6b6b6b] mb-6" style={{ fontFamily: 'Jost' }}>How was your experience with {itemName}?</p>

        {/* Rating Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2c2c2c] mb-2" style={{ fontFamily: 'Jost' }}>
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-[#e0d5c7] hover:text-[#d4af7a] transition-colors"
              >
                <StarIcon
                  filled={star <= (hoveredRating || rating)}
                  className="w-8 h-8"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2c2c2c] mb-2" style={{ fontFamily: 'Jost' }}>
            Your Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this rental..."
            className="w-full px-4 py-3 border border-[#e0d5c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af7a] focus:border-[#d4af7a] resize-none"
            style={{ fontFamily: 'Jost' }}
            rows={5}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 border border-[#d4af7a] text-[#d4af7a] text-sm font-medium rounded-lg hover:bg-[#f9f5f0] transition-colors"
            style={{ fontFamily: 'Jost' }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              rating > 0
                ? 'bg-[#d4af7a] text-white hover:bg-[#c49a5f]'
                : 'bg-[#e0d5c7] text-[#999] cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Jost' }}
          >
            <PaperPlaneIcon className="w-4 h-4" />
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}
