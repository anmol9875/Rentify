import { useState, useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext.jsx'
import { getTransactions, updateWalletBalance } from '../services/api.js'

function XIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} aria-hidden="true">
      <path d="M4 8c0-1.5 1-2.5 2.5-2.5h11c1.5 0 2.5 1 2.5 2.5v10c0 1.5-1 2.5-2.5 2.5h-11c-1.5 0-2.5-1-2.5-2.5V8z" />
      <path d="M8 4l2 3.5" />
      <path d="M12 3l2 4" />
      <path d="M15 4.5l1.5 3" />
      <circle cx="16.5" cy="14" r="1.5" />
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

export default function BuyerWalletModal({ onClose }) {
  const { user, updateWallet } = useContext(AuthContext)
  const [selectedTab, setSelectedTab] = useState('balance')
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  // Use real wallet balance from user
  const walletBalance = user?.walletBalance || 0
  const totalSpent = 5400.00 // This could be calculated from transactions

  const paymentMethods = [
    {
      id: 'card',
      name: 'Visa Card',
      description: '•••• •••• •••• 4242',
      icon: '💳',
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      description: 'Mobile wallet',
      icon: '📱',
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      description: 'Mobile wallet',
      icon: '💳',
    },
  ]

  const amountOptions = [500, 1000, 2000, 5000]

  const handlePaymentMethodClick = (method) => {
    setSelectedMethod(method)
  }

  const handleAmountSelect = async (amount) => {
    if (!user) return

    setIsProcessing(true)
    try {
      await updateWalletBalance(user.id, amount, 'credit')
      updateWallet(amount) // Update local wallet balance
      setSelectedMethod(null) // Reset selection
      alert(`Successfully added Rs. ${amount} to your wallet!`)
    } catch (error) {
      console.error('Error adding funds:', error)
      alert('Failed to add funds. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoadingTransactions(true)
        const response = await getTransactions()
        const transactions = Array.isArray(response?.transactions) ? response.transactions : []
        const mappedTransactions = transactions.slice(0, 10).map((transaction) => ({
          id: transaction._id || transaction.transactionId,
          type: transaction.type,
          description: transaction.description || transaction.type,
          amount:
            transaction.type === 'refund'
              ? Number(transaction.amount || 0)
              : -Number(transaction.amount || 0),
          date: transaction.createdAt
            ? new Date(transaction.createdAt).toLocaleDateString()
            : '',
        }))
        setRecentTransactions(mappedTransactions)
      } catch (error) {
        console.error('Failed to fetch wallet transactions:', error)
        setRecentTransactions([])
      } finally {
        setIsLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-[#f5f1ea] rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#D2B48C] px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f5f1ea] rounded-lg">
                <WalletIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#4b3b2a]">Buyer Wallet</h2>
                <p className="text-xs text-gray-600">Manage your payments</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#e2cfbc] rounded-full transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Wallet Balance */}
            <div className="bg-[#D2B48C] rounded-lg p-6 text-white">
              <p className="text-sm font-medium opacity-90">Wallet Balance</p>
              <p className="text-4xl font-bold mt-2">Rs. {walletBalance.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <TrendIcon />
                <span>Total spent on rentals</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-300">
              <button
                onClick={() => setSelectedTab('balance')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  selectedTab === 'balance'
                    ? 'text-[#D2B48C] border-b-2 border-[#D2B48C]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Balance
              </button>
              <button
                onClick={() => setSelectedTab('methods')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  selectedTab === 'methods'
                    ? 'text-[#D2B48C] border-b-2 border-[#D2B48C]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setSelectedTab('transactions')}
                className={`pb-3 px-2 font-medium text-sm transition-colors ${
                  selectedTab === 'transactions'
                    ? 'text-[#D2B48C] border-b-2 border-[#D2B48C]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Transactions
              </button>
            </div>

            {/* Balance Tab */}
            {selectedTab === 'balance' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Current Balance</div>
                  <div className="text-2xl font-bold text-[#2c2c2c]">Rs. {walletBalance.toFixed(2)}</div>
                </div>
                <button 
                  onClick={() => setSelectedTab('methods')}
                  className="w-full bg-[#D2B48C] hover:bg-[#c49a5f] text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Add Funds
                </button>
              </div>
            )}

            {/* Payment Methods Tab */}
            {selectedTab === 'methods' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#2c2c2c]">Select Payment Methods</h3>
                {selectedMethod ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#D2B48C] text-white rounded-lg">
                      <span className="text-2xl">{selectedMethod.icon}</span>
                      <div>
                        <p className="font-medium">{selectedMethod.name}</p>
                        <p className="text-xs opacity-90">{selectedMethod.description}</p>
                      </div>
                    </div>
                    <h4 className="font-medium text-[#2c2c2c]">Select Amount to Add</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {amountOptions.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAmountSelect(amount)}
                          disabled={isProcessing}
                          className="p-3 bg-white border border-gray-300 rounded-lg hover:border-[#D2B48C] hover:bg-[#f9f7f4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <p className="font-semibold text-[#2c2c2c]">Rs. {amount}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedMethod(null)}
                      className="w-full mt-3 py-2 text-[#D2B48C] font-medium hover:underline"
                    >
                      ← Back to Payment Methods
                    </button>
                  </div>
                ) : (
                  paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodClick(method)}
                      className="w-full p-4 rounded-lg border-2 border-gray-300 hover:border-[#D2B48C] text-left transition-all hover:bg-[#f9f7f4]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium text-[#2c2c2c]">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {selectedTab === 'transactions' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#2c2c2c]">Recent Transactions</h3>
                {isLoadingTransactions ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
                    Loading transactions...
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
                    No transactions yet.
                  </div>
                ) : recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-[#2c2c2c]">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                    <span className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : '-'} Rs. {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Close button */}
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 border border-gray-300 text-[#2c2c2c] font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
