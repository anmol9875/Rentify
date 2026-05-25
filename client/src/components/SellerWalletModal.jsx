import { useState } from 'react'

function XIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.921 2.164a.75.75 0 00-.707.707v.75H4.5a2.25 2.25 0 00-2.25 2.25v12a2.25 2.25 0 002.25 2.25h13.714v.75a.75.75 0 001.5 0V2.75a.75.75 0 00-.793-.586zM4.5 5.164h13.5v9a2.25 2.25 0 01-2.25 2.25H4.5a.75.75 0 01-.75-.75v-10.5a.75.75 0 01.75-.75z" />
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

export default function SellerWalletModal({ onClose }) {
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null)

  // Mock data - in real app this would come from context/API
  const availableBalance = 3500.00
  const totalEarnings = 12500.00

  const withdrawalMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Transfer to bank account',
      icon: '🏦',
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      description: 'Withdraw to EasyPaisa wallet',
      icon: '📱',
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      description: 'Withdraw to JazzCash wallet',
      icon: '💳',
    },
  ]

  const quickAmounts = [500, 1000, 2000]

  const handleQuickAmount = (amount) => {
    setSelectedQuickAmount(amount)
    setWithdrawAmount(amount.toString())
  }

  const handleAllAmount = () => {
    setSelectedQuickAmount('all')
    setWithdrawAmount(availableBalance.toString())
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || !selectedMethod) {
      alert('Please select withdrawal method and amount')
      return
    }

    const amount = parseFloat(withdrawAmount)
    if (amount <= 0 || amount > availableBalance) {
      alert('Invalid withdrawal amount')
      return
    }

    // Here you'd make an API call to process the withdrawal
    console.log('Withdraw', amount, 'to', selectedMethod)
    alert(`Withdrawal of $${amount.toFixed(2)} to ${selectedMethod} submitted!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content - slide from right */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-[#D6C2A8] rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#4b3b2a] px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f5f1ea] rounded-lg">
                <WalletIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#ffffff]">Seller Wallet</h2>
                <p className="text-xs text-gray-100">Manage your earnings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Available Balance */}
            <div className="bg-[#4b3b2a] rounded-lg p-6 text-white">
              <p className="text-medium font-medium opacity-90">Available Balance</p>
              <p className="text-4xl font-bold mt-2">${availableBalance.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <TrendIcon />
                <span>Total earnings from rentals</span>
              </div>
            </div>

            {/* Withdraw Funds Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#2c2c2c] mb-4">Withdraw Funds</h3>

              {/* Quick Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2c2c2c] mb-3">
                  Quick Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAmount(amount)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedQuickAmount === amount
                          ? 'bg-[#D2B48C] text-white border-[#D2B48C]'
                          : 'border-[#4b3b2a] text-[#2c2c2c] hover:border-[#ffffff]'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    onClick={handleAllAmount}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedQuickAmount === 'all'
                        ? 'bg-[#D2B48C] text-white border-[#D2B48C]'
                        : 'border-[#4b3b2a] text-[#2c2c2c] hover:border-[#ffffff]'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                  Withdrawal Amount
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[#2c2c2c]">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value)
                      setSelectedQuickAmount(null)
                    }}
                    step="0.01"
                    min="0"
                    max={availableBalance}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-[#4b3b2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] text-[#2c2c2c]"
                  />
                </div>
                {withdrawAmount && parseFloat(withdrawAmount) > availableBalance && (
                  <p className="text-red-500 text-xs mt-1">Amount exceeds available balance</p>
                )}
              </div>

              {/* Select Withdrawal Method */}
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-3">
                  Select Withdrawal Method
                </label>
                <div className="space-y-2">
                  {withdrawalMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedMethod === method.id
                          ? 'border-[#D2B48C] bg-[#f9f7f4]'
                          : 'border-[#4b3b2a] hover:border-[#ffffff]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium text-[#2c2c2c]">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[#4b3b2a] text-[#2c2c2c] font-medium rounded-lg hover:bg-[#ffffff] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !selectedMethod}
                className={`flex-1 px-4 py-3 text-white font-medium rounded-lg transition-colors ${
                  withdrawAmount && selectedMethod
                    ? 'bg-[#8B8B8B] hover:bg-[#7A7A7A]'
                    : 'bg-[#4b3b2a] cursor-not-allowed'
                }`}
              >
                Withdraw ${withdrawAmount || '0.00'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
