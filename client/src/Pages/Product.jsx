import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import RentalBar from '../components/RentalBar.jsx'
import CartModal from '../components/CartModal.jsx'
import { getAllProducts, getProduct } from '../services/api.js'
import AuthContext from '../context/AuthContext.jsx'

function StarIcon({ filled = false, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCart, setShowCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { isLoggedIn } = useContext(AuthContext)
  const availableQuantity = Math.max(0, Number(product?.inventory?.available) || 0)
  const isAvailable = availableQuantity > 0
  const ratingAverage = Number(product?.rating?.average || 0)
  const ratingCount = Number(product?.rating?.count || 0)

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true)
        const [productResponse, productsResponse] = await Promise.all([
          getProduct(id),
          getAllProducts(),
        ])

        const currentProduct = productResponse?.product || null
        const allProducts = productsResponse?.products || []

        setProduct(currentProduct)
        setRelatedProducts(
          allProducts
            .filter((item) => String(item._id) !== String(currentProduct?._id))
            .slice(0, 4)
        )
      } catch (error) {
        console.error('Error loading product:', error)
        setProduct(null)
        setRelatedProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProductData()
  }, [id])

  const addToCart = () => {
    if (!product) return

    if (!isLoggedIn) {
      navigate(`/profile?auth=login&redirect=${encodeURIComponent(`/product/${id}`)}`)
      return
    }

    if (!isAvailable) {
      return
    }

    const normalizedQuantity = Math.min(Math.max(1, quantity), availableQuantity)

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      cart.push({
        id: product._id,
        catalogProductId: product.catalogId || product._id,
        title: product.title,
        price: product.price,
        quantity: normalizedQuantity,
        availability: availableQuantity,
        image: product.image,
        description: product.description,
        duration: product.duration,
      })
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      setShowCart(true)
    } catch (e) {
      console.error('Error adding to cart:', e)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-[#6b6b6b]">Loading product...</div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 text-center text-[#6b6b6b]">
          Product not found.
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <section className="bg-[#f5f1ea] py-6">
        <div className="max-w-7xl mx-auto px-6">
          <RentalBar />
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="aspect-4/5 max-w-md mx-auto bg-[#fafafa] rounded overflow-hidden">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <br />
            <h1 className="text-4xl font-bold text-[#4b3b2a] mb-4">{product.title}</h1>
            <p className="text-xl text-[#4b3b2a] font-semibold mb-4">
              from Rs. {Number(product.price).toFixed(2)} / {product.duration}
            </p>
            <br />
            <p className="text-[#4b3b2a] mb-6">{product.description}</p>

            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${
                isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {isAvailable ? `${availableQuantity} available` : 'Unavailable'}
              </span>
              <div className="mt-3 flex items-center gap-2 text-[#4b3b2a]">
                <div className="flex items-center gap-0.5 text-[#d4af7a]" aria-label={`${ratingAverage.toFixed(1)} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={ratingAverage >= star - 0.25} />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {ratingCount > 0 ? `${ratingAverage.toFixed(1)} (${ratingCount} review${ratingCount === 1 ? '' : 's'})` : 'No reviews yet'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">-</button>
                <input
                  className="w-12 text-center"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1
                    setQuantity(Math.min(availableQuantity || 1, Math.max(1, val)))
                  }}
                />
                <button onClick={() => setQuantity(Math.min(availableQuantity || 1, quantity + 1))} className="px-3 py-2">+</button>
              </div>

              <button
                onClick={addToCart}
                disabled={!isAvailable}
                className="ml-4 bg-[#c49a5f] hover:bg-[#b8966b] text-white px-40 py-3 rounded font-medium disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isAvailable ? 'Add to cart' : 'Unavailable'}
              </button>
            </div>

            <div>
              <button onClick={() => navigate(-1)} className="text-sm text-[#6b6b6b]">Back</button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#4b3b2a] mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <a key={item._id} href={`/product/${item._id}`} className="block">
                <div className="aspect-4/5 w-full bg-[#fafafa] rounded overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm mt-2 text-[#4b3b2a]">{item.title}</p>
                <p className="text-sm text-[#6b6b6b]">Rs. {Number(item.price).toFixed(2)}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </div>
  )
}
