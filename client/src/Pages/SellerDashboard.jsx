import { useEffect, useState } from 'react'
import SellerMetrics from '../components/SellerMetrics.jsx'
import SellerRentals from '../components/SellerRentals.jsx'
import DamageReports from '../components/DamageReports.jsx'
import { getCurrentUser, getDamageReports, getMyProducts, getRentals } from '../services/api.js'

export default function SellerDashboard() {
  const [products, setProducts] = useState([])
  const [rentals, setRentals] = useState([])
  const [reports, setReports] = useState([])
  const [sellerProfile, setSellerProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSellerDashboard = async (showLoading = false, isMounted = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }

      const productsResponse = await getMyProducts()

      const [rentalsResponse, reportsResponse, profileResponse] = await Promise.all([
        getRentals({ role: 'seller' }),
        getDamageReports({ role: 'seller' }),
        getCurrentUser(),
      ])

      if (!isMounted) return

      setProducts(productsResponse?.products || [])
      setRentals(rentalsResponse?.rentals || [])
      setReports(reportsResponse?.reports || [])
      setSellerProfile(profileResponse?.user || null)
    } catch (error) {
      console.error('Failed to load seller dashboard:', error)
      if (!isMounted) return
      setProducts([])
      setRentals([])
      setReports([])
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    loadSellerDashboard(true, isMounted)

    const refreshInterval = window.setInterval(() => {
      loadSellerDashboard(false, isMounted)
    }, 15000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSellerDashboard(false, isMounted)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      window.clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="space-y-12">
      <SellerMetrics
        products={products}
        rentals={rentals}
        reports={reports}
        sellerProfile={sellerProfile}
        isLoading={isLoading}
      />
      <SellerRentals rentals={rentals} isLoading={isLoading} />
      <DamageReports
        reports={reports}
        rentals={rentals}
        isLoading={isLoading}
        onRefresh={() => loadSellerDashboard(false, true)}
      />
    </div>
  )
}
