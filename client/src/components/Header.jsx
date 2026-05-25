import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import CartModal from './CartModal'
import SellerWalletModal from './SellerWalletModal'
import BuyerWalletModal from './BuyerWalletModal'
import AuthContext from '../context/AuthContext'

const NAV_LINKS = ['Home', 'Collections', 'Dashboard', 'FAQ', 'Profile']

function SearchIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function CartIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function WalletIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} aria-hidden="true">
      {/* Wallet body */}
      <path d="M4 8c0-1.5 1-2.5 2.5-2.5h11c1.5 0 2.5 1 2.5 2.5v10c0 1.5-1 2.5-2.5 2.5h-11c-1.5 0-2.5-1-2.5-2.5V8z" />
      {/* Money bills on top */}
      <path d="M8 4l2 3.5" />
      <path d="M12 3l2 4" />
      <path d="M15 4.5l1.5 3" />
      {/* Wallet coin/lock detail */}
      <circle cx="16.5" cy="14" r="1.5" />
    </svg>
  )
}

function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function BooqableIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.32-2.33c.752.093 1.424.33 1.952.65l-.744 1.588a3.75 3.75 0 00-1.5-.354 3.75 3.75 0 00-3.75 3.75 3.75 3.75 0 003.75 3.75 3.75 3.75 0 001.5-.354l.744 1.588a5.25 5.25 0 01-1.952.65 4.5 4.5 0 01-5.32-5.32z" />
    </svg>
  )
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [buyerWalletOpen, setBuyerWalletOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn } = useContext(AuthContext)

  // Check if user is a seller
  const isSeller = user?.role === 'seller'

  // Helper to get nav link path
  const getNavPath = (label) => {
    const paths = {
      'Home': '/',
      'Collections': '/collections',
      'Dashboard': '/dashboard',
      'FAQ': '/faq',
      'Profile': '/profile',
    }
    return paths[label] || null
  }

  // Check if current path matches nav link
  const isActive = (label) => {
    const path = getNavPath(label)
    return path === location.pathname
  }

  // Build nav link className
  const getNavLinkClass = (label) => {
    const active = isActive(label)
    return `font-semibold text-sm tracking-[0.08em] uppercase text-[#4b3b2a] hover:text-[#b8966b] transition-all pb-1 border-b-2 ${
      active ? 'border-[#4b3b2a]' : 'border-transparent hover:border-[#4b3b2a]'
    }`
  }

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        setCartCount(cart.length)
      } catch (e) {
        console.error('Error loading cart:', e)
        setCartCount(0)
      }
    }

    updateCartCount()
    
    // Listen for custom cart update event
    window.addEventListener('cartUpdated', updateCartCount)
    
    // Also listen for storage events (from other tabs)
    window.addEventListener('storage', updateCartCount)
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  useEffect(() => {
    if (!searchOpen) {
      setSearchError('')
    }
  }, [searchOpen])

  const handleSearchSubmit = (event) => {
    event?.preventDefault()

    const normalizedQuery = searchQuery.trim()

    if (!normalizedQuery) {
      setSearchError('Please enter a product name to search.')
      return
    }

    if (!/^[A-Za-z\s]+$/.test(normalizedQuery)) {
      setSearchError('Only letters and spaces are allowed in search.')
      return
    }

    setSearchError('')
    setSearchOpen(false)
    navigate(`/collections?search=${encodeURIComponent(normalizedQuery)}`)
  }

  return (
    <>
      <header className="relative bg-white">
        {/* Top thin stripe */}
        <div className="h-0.75 w-full bg-[#4b3b2a]" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex flex-col shrink-0 group text-left"
            >
              <span className="font-bold text-2xl md:text-3xl tracking-[0.02em] uppercase text-[#4b3b2a] font-sans">
                RENTIFY
              </span>
              <span className="block w-full max-w-30 h-px bg-[#3B2A22] mt-0.5" aria-hidden="true" />
            </button>

            {/* Nav links - visible when search is closed */}
            {!searchOpen && (
              <nav className="hidden md:flex items-center justify-center gap-8 flex-1" aria-label="Main">
                {NAV_LINKS.map((label) => {
                  const path = getNavPath(label)
                  if (!path) return null

                  return (
                    <Link
                      key={label}
                      to={path}
                      className={getNavLinkClass(label)}
                    >
                      {label}
                    </Link>
                  )
                })}
              </nav>
            )}

            {/* Search bar (expanded) */}
            {searchOpen && (
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center justify-center max-w-xl mx-auto">
                <div className="w-full">
                  <div className="flex items-center">
                    <input
                      type="search"
                      placeholder="Search by product name..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (searchError) setSearchError('')
                      }}
                      className="w-full px-4 py-2 border border-[#4b3b2a]/50 rounded focus:outline-none focus:ring-1 focus:ring-[#4b3b2a] focus:border-[#4b3b2a] text-[#4A4A4A] placeholder-[#4b3b2a]/70"
                      autoFocus
                      aria-label="Search"
                    />
                    <button
                      type="submit"
                      className="ml-2 p-2 text-[#4b3b2a] hover:text-[#b8966b] transition-colors"
                      aria-label="Submit search"
                    >
                      <SearchIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="ml-2 p-2 text-[#4A4A4A] hover:bg-[#f5f5f5] rounded"
                      aria-label="Close search"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {searchError && (
                    <p className="mt-2 text-sm text-red-500">{searchError}</p>
                  )}
                </div>
              </form>
            )}

            {/* Right: Search, auth, and account actions */}
            <div className="flex items-center gap-5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (searchOpen) {
                    handleSearchSubmit()
                  } else {
                    setSearchOpen(true)
                  }
                }}
                className="p-1.5 text-[#4b3b2a] hover:text-[#b8966b] transition-colors"
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                aria-expanded={searchOpen}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              {!isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    to="/profile?auth=login"
                    className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#4b3b2a] border border-[#4b3b2a]/35 rounded hover:border-[#4b3b2a] hover:bg-[#f5f1ea] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/profile?auth=register"
                    className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white bg-[#4b3b2a] rounded hover:bg-[#6f563d] transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <>
                  {!isSeller && (
                    <button
                      type="button"
                      onClick={() => setBuyerWalletOpen(true)}
                      className="p-1.5 text-[#4b3b2a] hover:text-[#b8966b] transition-colors"
                      aria-label="Open buyer wallet"
                    >
                      <WalletIcon className="w-5 h-5" />
                    </button>
                  )}
                  {isSeller ? (
                    <button
                      type="button"
                      onClick={() => setWalletOpen(true)}
                      className="p-1.5 text-[#4b3b2a] hover:text-[#b8966b] transition-colors"
                      aria-label="Open seller wallet"
                    >
                      <WalletIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCartOpen(true)}
                      className="p-1.5 text-[#4b3b2a] hover:text-[#b8966b] transition-colors relative"
                      aria-label="Open cart"
                    >
                      <CartIcon className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart modal */}
      {cartOpen && <CartModal onClose={() => setCartOpen(false)} />}

      {/* Seller Wallet modal */}
      {walletOpen && <SellerWalletModal onClose={() => setWalletOpen(false)} />}

      {/* Buyer Wallet modal */}
      {buyerWalletOpen && <BuyerWalletModal onClose={() => setBuyerWalletOpen(false)} />}
    </>
  )
}
