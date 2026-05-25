function BoxIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  )
}

function ShoppingBagIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function DollarIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AlertIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        fill="currentColor"
        d="M10.45 6.25c-.08-.9.63-1.68 1.55-1.68s1.63.78 1.55 1.68l-.64 7.25a.91.91 0 01-1.82 0l-.64-7.25zM12 20.05a2.05 2.05 0 110-4.1 2.05 2.05 0 010 4.1z"
      />
    </svg>
  )
}

export default function SellerMetrics({ products = [], rentals = [], reports = [], sellerProfile = null, isLoading = false }) {
  const activeRentals = rentals.filter((rental) => !['Completed', 'Cancelled'].includes(rental.status)).length
  const rentalRevenue = rentals
    .filter((rental) => rental.status !== 'Cancelled')
    .reduce((sum, rental) => sum + Number(rental.totalCost || 0), 0)
  const penaltyRevenue = rentals
    .filter((rental) => rental.status === 'Completed')
    .reduce((sum, rental) => sum + Number(rental.penalty || 0), 0)
  const totalEarnings = rentalRevenue + penaltyRevenue
  const pendingReports = reports.filter((report) => report.status === 'pending').length
  const completedOrders = rentals.filter((rental) => rental.status === 'Completed').length

  const metrics = [
    {
      label: 'Total Items',
      value: String(products.length),
      icon: BoxIcon,
      bgColor: 'bg-[#D2B48C]',
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#4b3b2a]',
    },
    {
      label: 'Active Rentals',
      value: String(activeRentals),
      icon: ShoppingBagIcon,
      bgColor: 'bg-[#D2B48C]',
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#4b3b2a]',
    },
    {
      label: 'Total Earnings',
      value: `Rs. ${Number(totalEarnings).toFixed(2)}`,
      icon: DollarIcon,
      bgColor: 'bg-[#D2B48C]',
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#4b3b2a]',
    },
    {
      label: 'Damage Reports',
      value: String(pendingReports),
      icon: AlertIcon,
      bgColor: 'bg-[#D2B48C]',
      iconBg: 'bg-orange-50',
      iconColor: 'text-[#4b3b2a]',
      subtext: completedOrders > 0 ? `${completedOrders} completed orders` : null,
    },
  ]

  return (
    <section className="py-8 md:py-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#4b3b2a] mb-8">
        Manage your inventory and rentals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className={`${metric.bgColor} rounded-lg p-6 shadow-sm border border-gray-100`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#6b6b6b] text-sm font-medium">{metric.label}</p>
                  <p className="text-3xl md:text-4xl font-bold text-[#2c2c2c] mt-2">
                    {isLoading ? '...' : metric.value}
                  </p>
                  {!isLoading && metric.subtext ? (
                    <p className="mt-2 text-xs text-[#6b6b6b]">{metric.subtext}</p>
                  ) : null}
                </div>
                <div className={`${metric.iconBg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
