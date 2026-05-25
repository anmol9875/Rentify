import { useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ProfileHero from '../components/ProfileHero.jsx'
import ProfileNavigation from '../components/ProfileNavigation.jsx'
import ProfileInformation from '../components/ProfileInformation.jsx'
import ChangePassword from '../components/ChangePassword.jsx'
import NotificationPreferences from '../components/NotificationPreferences.jsx'
import LoginRegister from '../components/LoginRegister.jsx'
import Footer from '../components/Footer.jsx'
import AuthContext from '../context/AuthContext.jsx'
import SellerDashboard from './SellerDashboard.jsx'

const PROFILE_AUTH_IMAGE = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'

function LoggedOutProfile({ searchParams, setSearchParams }) {
  const [selectedAuthMode, setSelectedAuthMode] = useState(null)
  const showAuthForm = selectedAuthMode === 'login' || selectedAuthMode === 'register'

  const openAuthMode = (mode) => {
    const redirectPath = searchParams.get('redirect')
    setSelectedAuthMode(mode)
    setSearchParams({
      auth: mode,
      ...(redirectPath ? { redirect: redirectPath } : {}),
    })
  }

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[#f5f0e8]"
      aria-label="Account access"
    >
      <div
        className="absolute -inset-8 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${PROFILE_AUTH_IMAGE})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#3B2A22]/35" aria-hidden="true" />
      <div className="absolute inset-0 bg-linear-to-r from-[#f5f0e8]/5 via-[#f5f0e8]/20 to-[#f5f0e8]/72" aria-hidden="true" />
      <div
        className="absolute inset-y-0 right-0 hidden w-[70%] bg-[#f5f0e8]/45 backdrop-blur-[6px] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.18)_22%,rgba(0,0,0,0.75)_48%,#000_100%)] md:block"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-end px-6 py-12 md:py-16">
        <div className="w-full max-w-lg">
          <div className={showAuthForm ? 'mb-6' : 'rounded-lg bg-white/45 p-6 text-right md:bg-transparent md:p-0'}>
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-wide text-[#3B2A22] md:text-5xl">
              Manage your account settings and preferences
            </h1>
            <p className="mt-4 text-base leading-7 text-[#4b3b2a]">
              Sign in to manage rentals, wallet activity, profile details, and saved bookings.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => openAuthMode('login')}
                className={`rounded px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
                  selectedAuthMode === 'login'
                    ? 'bg-[#3B2A22] text-white'
                    : 'border border-[#3B2A22]/40 bg-white/80 text-[#3B2A22] hover:bg-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openAuthMode('register')}
                className={`rounded px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
                  selectedAuthMode === 'register'
                    ? 'bg-[#3B2A22] text-white'
                    : 'border border-[#3B2A22]/40 bg-white/80 text-[#3B2A22] hover:bg-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {showAuthForm && <LoginRegister variant="overlay" />}
        </div>
      </div>
    </section>
  )
}

function LoggedInProfileLayout({ activeTab, onTabChange, onLogout, children }) {
  return (
    <>
      <ProfileHero />
      <section className="bg-[#f5f1ea] py-10 md:py-14 flex-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="overflow-hidden rounded-lg border border-[#4b3b2a]/20 bg-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="border-b border-[#4b3b2a]/15 lg:border-b-0 lg:border-r">
                <ProfileNavigation
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                  onLogout={onLogout}
                  variant="panel"
                />
              </aside>
              <main className="bg-white p-4 md:p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function Profile() {
  const { isLoggedIn, user, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('profile')
  const [searchParams, setSearchParams] = useSearchParams()

  const handleLogout = () => {
    if (typeof logout === 'function') logout()
    setActiveTab('profile')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInformation />
      case 'password':
        return <ChangePassword />
      case 'notifications':
        return <NotificationPreferences />
      case 'dashboard':
        return <SellerDashboard />
      default:
        return <ProfileInformation />
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {!isLoggedIn ? (
        <LoggedOutProfile searchParams={searchParams} setSearchParams={setSearchParams} />
      ) : user?.role === 'buyer' ? (
        <LoggedInProfileLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
          {renderContent()}
        </LoggedInProfileLayout>
      ) : user?.role === 'seller' ? (
        <LoggedInProfileLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
          {renderContent()}
        </LoggedInProfileLayout>
      ) : null}
      
      <Footer />
    </div>
  )
}
