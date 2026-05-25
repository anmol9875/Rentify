import { useContext, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import RentalBar from './RentalBar.jsx'
import AuthContext from '../context/AuthContext.jsx'

export default function RentalInventory({ products = [], onAddProductClick, onEditProduct, onRemoveProduct, isSeller, isLoading = false, showTitle = false }) {
  const { user } = useContext(AuthContext)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    })
  }, [])

  function PlusIcon({ className = 'w-5 h-5' }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  }

  function ChevronRightIcon({ className = 'w-5 h-5' }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    )
  }

  function XIcon({ className = 'w-5 h-5' }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  function PencilIcon({ className = 'w-5 h-5' }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.651-1.651a2.121 2.121 0 113 3L9.75 18.6 4.5 20.25l1.65-5.25L16.862 4.487z" />
      </svg>
    )
  }

  const isOwnedByCurrentSeller = (product) => {
    const sellerId =
      typeof product?.seller === 'object' ? product.seller?._id || product.seller?.id : product?.seller

    return Boolean(user?.id && sellerId && String(sellerId) === String(user.id))
  }

  return (
    <section id="rentals" className="relative z-10 -mt-10 bg-[#D6C2A8] pt-0 pb-10 md:pb-14" aria-label="Rental inventory">
      <div className="max-w-7xl mx-auto px-6">
        {isSeller ? (
          <button
            type="button"
            onClick={onAddProductClick}
            className="group flex w-full items-center justify-between rounded-t-[20px] bg-[#3B2A22] px-6 py-4 text-left text-white transition-colors hover:bg-[#D6C2A8] hover:text-[#3B2A22]"
            aria-label="Add a new product"
          >
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-inherit" aria-hidden="true">
                <PlusIcon className="h-6 w-6" />
              </span>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[15px] leading-snug font-bold text-inherit">
                  Add Product or Item
                </span>
                <span className="text-[13px] leading-snug font-normal text-white/78 group-hover:text-[#5C534D]">
                  List a new item for rental
                </span>
              </div>
            </div>
            <span className="shrink-0 text-inherit" aria-hidden="true">
              <ChevronRightIcon className="h-5 w-5" />
            </span>
          </button>
        ) : (
          <RentalBar />
        )}

        {showTitle && (
          <div className="mt-8 " data-aos="fade-down">
            <h2 className="font-serif text-4xl font-extrabold text-[#3B2A22] tracking-[0.02em] drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl">
              Popular Products
            </h2>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full rounded-lg border border-[#3B2A22]/30 bg-white/85 p-8 text-center text-[#5C534D]">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full rounded-lg border border-[#3B2A22]/30 bg-white/85 p-8 text-center text-[#5C534D]">
              {isSeller ? 'Add products to start selling.' : 'No products available yet.'}
            </div>
          ) : (
            products.map((product) => (
              <article
                key={product._id || product.catalogId || product.id}
                data-aos="fade-up"
                className="relative group overflow-hidden rounded-lg border border-[#3B2A22]/25 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                {isSeller && isOwnedByCurrentSeller(product) && (
                  <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {onEditProduct && (
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="rounded-full bg-[#4b3b2a] p-1.5 text-white transition-colors hover:bg-[#3B2A22]"
                        aria-label="Edit product"
                        title="Edit product"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onRemoveProduct && (
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(product._id)}
                        className="rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600"
                        aria-label="Remove product"
                        title="Remove product"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                <a href={`/product/${product._id || product.catalogId || product.id}`} className="block">
                  <div className="aspect-4/5 w-full bg-[#fafafa]">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-medium text-[#3B2A22]">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#5C534D]">
                      Rs. {Number(product.price).toFixed(2)} / {product.duration}
                    </p>
                  </div>
                </a>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
