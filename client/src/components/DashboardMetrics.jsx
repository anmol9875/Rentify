function CartIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function WalletIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  )
}

function CheckIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function ExclamationIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}

const METRICS = [
  {
    id: 1,
    title: 'Active Rentals',
    value: '1',
    icon: CartIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 2,
    title: 'Wallet Balance',
    value: 'Rs. 2500',
    icon: WalletIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 3,
    title: 'Completed Rentals',
    value: '1',
    icon: CheckIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 4,
    title: 'Total Penalties',
    value: 'Rs. 50',
    icon: ExclamationIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
]

export default function DashboardMetrics({ children = null, activeRentals = null, walletBalance = null, completedRentals = null, totalPenalties = null }) {
  return (
    <section className="bg-[#f5f1ea] py-10 md:py-14" aria-label="Dashboard metrics">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric) => {
            const Icon = metric.icon
            // allow overriding values via props
            let displayValue = metric.value
            if (metric.title === 'Active Rentals' && activeRentals !== null) displayValue = String(activeRentals)
            if (metric.title === 'Wallet Balance' && walletBalance !== null) displayValue = `Rs. ${Number(walletBalance).toFixed(2)}`
            if (metric.title === 'Completed Rentals' && completedRentals !== null) displayValue = String(completedRentals)
            if (metric.title === 'Total Penalties' && totalPenalties !== null) displayValue = `Rs. ${Number(totalPenalties).toFixed(2)}`

            return (
              <div
                key={metric.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-start justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="text-sm text-[#6B6B6B] mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold text-[#2d2d2d]">{displayValue}</p>
                </div>
                <div className={`${metric.iconBg} ${metric.iconColor} rounded-lg p-2 shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Render any children (e.g. MyRentals) inside the same beige section to avoid white gaps */}
        {children}
      </div>
    </section>
  )
}
