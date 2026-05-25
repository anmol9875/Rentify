import { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AuthContext from '../context/AuthContext.jsx'

export default function ThankYou() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [deductedAmount, setDeductedAmount] = useState(0)

  useEffect(() => {
    if (location.state?.deductedAmount) {
      setDeductedAmount(location.state.deductedAmount)
    }
  }, [location.state])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#2c2c2c] mb-4">Order Completed!</h1>

          <p className="text-gray-600 mb-6">
            Your rental order has been successfully placed. You can view your rentals in your dashboard.
          </p>

          <div className="bg-[#f9f7f4] rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Deducted:</span>
                <span className="font-semibold text-red-600">-${deductedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Wallet Balance:</span>
                <span className="font-semibold text-[#c49a5f]">${(user?.walletBalance || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#c49a5f] hover:bg-[#b8966b] text-white py-3 rounded-lg font-medium transition-colors"
            >
              View My Rentals
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}