import { useState } from 'react'
import DamageInspectionModal from './DamageInspectionModal.jsx'

export default function SellerRentals({ rentals = [], isLoading = false }) {
  const [selectedRental, setSelectedRental] = useState(null)
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)

  const getStatusBg = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-50 text-blue-700'
      case 'Under Inspection':
        return 'bg-yellow-50 text-yellow-700'
      case 'Completed':
        return 'bg-green-50 text-green-700'
      case 'Pending':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (amount, penalty = 0) => {
    const base = `Rs. ${Number(amount || 0).toFixed(2)}`
    return penalty > 0 ? `${base} + Rs. ${Number(penalty).toFixed(2)} penalty` : base
  }

  const mappedRentals = rentals.map((rental) => ({
    id: rental.rentalId || rental._id,
    item: rental.product?.title || 'Unknown Item',
    buyer: rental.buyer?.fullName || rental.buyer?.email || 'Unknown Buyer',
    period: `${new Date(rental.startDate).toLocaleDateString()} to ${new Date(rental.endDate).toLocaleDateString()}`,
    amount: formatCurrency(rental.totalCost, rental.penalty),
    status: rental.status,
    badgeClass: getStatusBg(rental.status),
    action: rental.status === 'Under Inspection' ? 'Inspect' : rental.status === 'Completed' ? 'Completed' : 'In progress',
    actionType: rental.status === 'Under Inspection' ? 'button' : 'text',
  }))

  const handleInspectClick = (rental) => {
    setSelectedRental(rental)
    setInspectionModalOpen(true)
  }

  const handleCloseInspection = () => {
    setInspectionModalOpen(false)
    setSelectedRental(null)
  }

  return (
    <section className="py-8 md:py-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#4b3b2a] mb-8">
        Rental Transactions
      </h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-[#6b6b6b]">Loading seller rentals...</div>
        ) : mappedRentals.length === 0 ? (
          <div className="p-8 text-center text-[#6b6b6b]">No rentals yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Rental ID</th>
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Item</th>
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Buyer</th>
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Period</th>
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-[#2c2c2c]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappedRentals.map((rental) => (
                <tr key={rental.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-[#d4af7a]">{rental.id}</td>
                  <td className="px-6 py-4 text-[#2c2c2c]">{rental.item}</td>
                  <td className="px-6 py-4 text-[#6b6b6b]">{rental.buyer}</td>
                  <td className="px-6 py-4 text-[#6b6b6b] text-xs">{rental.period}</td>
                  <td className="px-6 py-4 font-semibold text-[#2c2c2c]">{rental.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${rental.badgeClass}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {rental.actionType === 'button' ? (
                      <button
                        onClick={() => handleInspectClick(rental)}
                        className="px-4 py-2 bg-[#2c2c2c] text-white rounded font-medium text-xs hover:bg-[#1a1a1a] transition"
                      >
                        {rental.action}
                      </button>
                    ) : (
                      <span className="text-[#6b6b6b] text-xs">{rental.action}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {inspectionModalOpen && selectedRental && (
        <DamageInspectionModal
          rental={selectedRental}
          onClose={handleCloseInspection}
          onUpdateRental={() => {}}
        />
      )}
    </section>
  )
}
