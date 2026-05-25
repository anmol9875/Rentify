import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import RentalInventory from '../components/RentalInventory.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import WhyRentHero from '../components/WhyRentHero.jsx'
import Footer from '../components/Footer.jsx'
import { getAllProducts } from '../services/api.js'

export default function Home() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const response = await getAllProducts()
        setProducts(response.products || [])
      } catch (error) {
        console.error('Failed to load products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <Hero />
      <RentalInventory products={products} isLoading={isLoading} showTitle />
      <WhyRentHero />
      <HowItWorks />
      <Footer />
    </div>
  )
}

