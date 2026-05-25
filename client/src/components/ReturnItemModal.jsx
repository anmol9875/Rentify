import { useState, useRef } from 'react'

function UploadIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function ImageIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

export default function ReturnItemModal({ rental, onClose, onSubmit }) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    const files = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length > 0) {
      setUploadedFiles((prev) => prev.concat(files))
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setUploadedFiles(files)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setUploadedFiles(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSubmit = () => {
    if (uploadedFiles.length > 0) {
      onSubmit(rental.id, uploadedFiles)
    }
  }

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e0d5c7]">
          <h2 className="text-4xl font-extrabold text-[#4b3b2a]" style={{ fontFamily: 'Cormorant Garamond' }}>Return Item</h2>
          <p className="text-sm text-[#6b6b6b] mt-1" style={{ fontFamily: 'Jost' }}>Upload photos of the item after use</p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Rental Information Card */}
          <div className="bg-[#f5f1ea] rounded-lg p-5 border border-[#e0d5c7]">
            <h3 className="text-lg font-semibold text-[#2c2c2c] mb-4" style={{ fontFamily: 'Jost' }}>Rental Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#6b6b6b] mb-1" style={{ fontFamily: 'Jost' }}>Item</p>
                <p className="text-sm font-medium text-[#2c2c2c]" style={{ fontFamily: 'Jost' }}>{rental.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#6b6b6b] mb-1" style={{ fontFamily: 'Jost' }}>Rental ID</p>
                <p className="text-sm font-medium text-[#2c2c2c]" style={{ fontFamily: 'Jost' }}>{rental.id}</p>
              </div>
              <div>
                <p className="text-xs text-[#6b6b6b] mb-1" style={{ fontFamily: 'Jost' }}>Rental Period</p>
                <p className="text-sm font-medium text-[#2c2c2c]" style={{ fontFamily: 'Jost' }}>
                  {rental.startDate} to {rental.endDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6b6b6b] mb-1" style={{ fontFamily: 'Jost' }}>Total Cost</p>
                <p className="text-sm font-medium text-[#2c2c2c]" style={{ fontFamily: 'Jost' }}>${rental.totalCost}</p>
              </div>
            </div>
          </div>

          {/* Upload After-Use Photos Card */}
          <div className="bg-white rounded-lg border border-[#e0d5c7] p-5">
            <h3 className="text-lg font-semibold text-[#4b3b2a] mb-2" style={{ fontFamily: 'Jost' }}>Upload After-Use Photos</h3>
            <p className="text-sm text-[#6b6b6b] mb-4" style={{ fontFamily: 'Jost' }}>
              Please upload clear photos of the item from multiple angles. These will be used for damage inspection.
            </p>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-[#d4af7a] rounded-lg p-8 text-center cursor-pointer hover:border-[#d4af7a] hover:bg-[#f9f5f0] transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              onPaste={handlePaste}
              tabIndex={0}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedFiles.length === 0 ? (
                <>
                  <UploadIcon className="w-12 h-12 text-[#d4af7a] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#2c2c2c] mb-1" style={{ fontFamily: 'Jost' }}>Click or paste images</p>
                  <p className="text-xs text-[#6b6b6b]" style={{ fontFamily: 'Jost' }}>PNG, JPG up to 10MB each — or paste from clipboard</p>
                </>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#f5f1ea] p-2 rounded">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#d4af7a]" />
                        <span className="text-sm text-[#2c2c2c]" style={{ fontFamily: 'Jost' }}>{file.name}</span>
                        <span className="text-xs text-[#6b6b6b]" style={{ fontFamily: 'Jost' }}>
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Damage Detection Info */}
            <div className="mt-4 bg-[#f9f5f0] rounded-lg p-4 border border-[#d4af7a]">
              <div className="flex items-start gap-3">
                <ImageIcon className="w-5 h-5 text-[#d4af7a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#2c2c2c] mb-1" style={{ fontFamily: 'Jost' }}>AI Damage Detection</h4>
                  <p className="text-xs text-[#6b6b6b]" style={{ fontFamily: 'Jost' }}>
                    Your photos will be analyzed by our AI system to detect any damage. The seller will review the
                    results and confirm. If no damage is found, your escrow payment will be released immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-[#e0d5c7] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#d4af7a] text-[#d4af7a] text-sm font-medium rounded-lg hover:bg-[#f9f5f0] transition-colors"
            style={{ fontFamily: 'Jost' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              uploadedFiles.length > 0
                ? 'bg-[#d4af7a] text-white hover:bg-[#c49a5f]'
                : 'bg-[#e0d5c7] text-[#999] cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Jost' }}
          >
            <CheckIcon className="w-4 h-4" />
            Submit Return
          </button>
        </div>
      </div>
    </div>
  )
}
