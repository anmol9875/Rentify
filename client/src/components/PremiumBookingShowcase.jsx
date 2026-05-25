import { useEffect, useMemo, useRef, useState } from 'react'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'

const CALENDAR_DATES = Array.from({ length: 14 }, (_, index) => ({
  day: 12 + index,
  label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
}))

const STEP_TITLES = ['Dates', 'Items', 'Checkout']

const SERVICES = [
  {
    title: 'Delivery',
    text: 'Timed drop-offs with route-aware coordination and live dispatch visibility.',
  },
  {
    title: 'Operators',
    text: 'On-site setup crews for premium installs, strikes, and event-day support.',
  },
  {
    title: 'Maintenance',
    text: 'Pre-event inspection and rapid replacement handling for critical rentals.',
  },
]

const BLOGS = [
  {
    title: 'How to plan decor rentals without last-minute cost spikes',
    tag: 'Planning',
  },
  {
    title: 'What premium booking flows do better than static catalogs',
    tag: 'Product',
  },
  {
    title: 'Reducing event-day friction with live rental timelines',
    tag: 'Operations',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sana Iqbal',
    role: 'Event Planner, Islamabad',
    quote: 'The flow feels premium. Dates, quantities, and totals stay visible without slowing the booking.',
  },
  {
    name: 'Maham Aziz',
    role: 'Venue Partner, Lahore',
    quote: 'The UI feels expensive and practical at the same time. It removes hesitation during checkout.',
  },
  {
    name: 'Hajira Malik',
    role: 'Seller, Rentify',
    quote: 'This is the first section that explains the system visually instead of forcing users to guess.',
  },
]

const METRICS = [
  { label: 'Years in business', value: 12, suffix: '+' },
  { label: 'Machines available', value: 180, suffix: '+' },
  { label: 'Happy clients', value: 460, suffix: '+' },
  { label: 'Cities served', value: 9, suffix: '' },
]

function ArrowDownIcon() {
  return (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.5v15m0 0-5.25-5.25M12 19.5l5.25-5.25" />
    </svg>
  )
}

function CalendarIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  )
}

function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3.75 4.5h1.386c.51 0 .955.343 1.085.837l.383 1.455m0 0H18.75l-1.503 6.01a1.125 1.125 0 0 1-1.091.853H8.25a1.125 1.125 0 0 1-1.091-.853L5.618 6.792Zm1.125 11.958a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm9.75 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" />
    </svg>
  )
}

function SparkleParticles({ particles, darkMode }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`absolute rounded-full animate-[particleFloat_var(--particle-duration)_ease-in-out_infinite] ${
            darkMode
              ? 'bg-[rgba(255,243,222,0.72)] shadow-[0_0_20px_rgba(210,180,140,0.28)]'
              : 'bg-[rgba(59,42,34,0.16)] shadow-[0_0_16px_rgba(59,42,34,0.14)]'
          }`}
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: particle.delay,
            ['--particle-duration']: particle.duration,
          }}
        />
      ))}
    </div>
  )
}

function CounterCard({ label, value, suffix, active, darkMode, delay }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!active) return

    const duration = 850
    const start = performance.now()
    let frameId = 0

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      setDisplayValue(Math.round(value * progress))
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [active, value])

  return (
    <article
      className={`premium-rise-up rounded-[24px] border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${
        darkMode
          ? 'border-white/12 bg-[rgba(17,17,17,0.5)] shadow-[0_24px_56px_rgba(8,8,8,0.28)]'
          : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.78)] shadow-[0_24px_56px_rgba(59,42,34,0.12)]'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-[#111111]'}`}>
        {displayValue}
        {suffix}
      </p>
      <p className={`mt-2 text-sm ${darkMode ? 'text-white/68' : 'text-[#5C534D]'}`}>{label}</p>
    </article>
  )
}

function formatDateValue(day) {
  return `May ${String(day).padStart(2, '0')}, 2026`
}

export default function PremiumBookingShowcase() {
  const sectionRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [darkMode, setDarkMode] = useState(true)
  const [rangeStart, setRangeStart] = useState(18)
  const [rangeEnd, setRangeEnd] = useState(22)
  const [selectedQuantity, setSelectedQuantity] = useState(2)
  const [currentStep, setCurrentStep] = useState(2)
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [metricsVisible, setMetricsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height * 0.18)))
      setScrollProgress(progress)
      setMetricsVisible(rect.top < viewportHeight * 0.78)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((previous) => (previous + 1) % TESTIMONIALS.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [])

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        left: `${5 + ((index * 4.7) % 90)}%`,
        top: `${7 + ((index * 8.2) % 78)}%`,
        size: 2 + (index % 4),
        delay: `${(index % 7) * 0.6}s`,
        duration: `${6 + (index % 5)}s`,
      })),
    []
  )

  const sortedRange = [rangeStart, rangeEnd].sort((left, right) => left - right)
  const nights = sortedRange[1] - sortedRange[0] + 1
  const subtotal = selectedQuantity * 40 * nights
  const tax = subtotal * 0.1
  const deposit = 100
  const totalDue = subtotal + tax + deposit
  const progressPercent = ((currentStep + 1) / STEP_TITLES.length) * 100

  useEffect(() => {
    const frameCount = 24
    const increment = (totalDue - animatedTotal) / frameCount
    let currentFrame = 0

    const timer = window.setInterval(() => {
      currentFrame += 1
      if (currentFrame >= frameCount) {
        setAnimatedTotal(totalDue)
        window.clearInterval(timer)
        return
      }
      setAnimatedTotal((previous) => Number((previous + increment).toFixed(2)))
    }, 18)

    return () => window.clearInterval(timer)
  }, [totalDue])

  const overlayOpacity = 0.68 - scrollProgress * 0.26
  const blurAmount = Math.max(0, 5 - scrollProgress * 5)
  const imageScale = 1.04 + (1 - scrollProgress) * 0.04
  const sectionTone = darkMode ? 'bg-[#201712]' : 'bg-[#F3F1EE]'
  const topBarStyle = scrollProgress > 0.08
    ? darkMode
      ? 'bg-[rgba(32,23,18,0.84)] shadow-[0_18px_40px_rgba(8,8,8,0.28)]'
      : 'bg-[rgba(243,241,238,0.82)] shadow-[0_18px_40px_rgba(59,42,34,0.14)]'
    : darkMode
      ? 'bg-[rgba(32,23,18,0.24)]'
      : 'bg-[rgba(255,255,255,0.22)]'

  const handleDateClick = (day) => {
    if (day === rangeStart && day === rangeEnd) {
      return
    }

    if (day <= rangeStart || rangeStart === rangeEnd) {
      setRangeStart(day)
      if (day > rangeEnd) {
        setRangeEnd(day)
      }
      setCurrentStep(0)
      return
    }

    setRangeEnd(day)
    setCurrentStep(1)
  }

  const handleQuantityChange = (delta) => {
    setSelectedQuantity((previous) => Math.max(1, Math.min(5, previous + delta)))
    setCurrentStep(1)
  }

  return (
    <section ref={sectionRef} className={`relative overflow-hidden ${sectionTone}`} aria-label="Amazing booking system showcase">
      <div className="relative min-h-[180vh]">
        <div className="pointer-events-none sticky top-0 h-screen overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
            style={{
              backgroundImage: `url(${HERO_IMAGE})`,
              transform: `scale(${imageScale})`,
              filter: `saturate(${0.95 + scrollProgress * 0.16})`,
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-[180vh] flex-col">
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, rgba(14,11,10,0.82), rgba(59,42,34,0.5), rgba(176,137,104,0.16))'
                : 'linear-gradient(135deg, rgba(243,241,238,0.78), rgba(232,221,208,0.58), rgba(255,255,255,0.22))',
              opacity: overlayOpacity,
            }}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute inset-0 animate-[heroGradientShift_11s_ease-in-out_infinite] ${
              darkMode
                ? 'bg-[linear-gradient(120deg,rgba(210,180,140,0.12),rgba(255,255,255,0.03),rgba(59,42,34,0.24))]'
                : 'bg-[linear-gradient(120deg,rgba(255,255,255,0.32),rgba(176,137,104,0.08),rgba(232,221,208,0.28))]'
            }`}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 backdrop-blur-[var(--showcase-blur)] transition-all duration-700"
            style={{ ['--showcase-blur']: `${blurAmount}px` }}
            aria-hidden="true"
          />
          <SparkleParticles particles={particles} darkMode={darkMode} />

          <div className={`premium-nav-enter sticky top-0 z-30 border-b backdrop-blur-xl transition-all duration-300 ${topBarStyle} ${darkMode ? 'border-white/10' : 'border-[#DDD6CF]'}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.32em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Rentify</p>
                <p className={`mt-1 text-xs tracking-[0.22em] ${darkMode ? 'text-white/65' : 'text-[#5C534D]'}`}>Booking Experience</p>
              </div>

              <nav className="hidden items-center gap-8 lg:flex">
                {['Calendar Demo', 'Trust', 'Services', 'Testimonials'].map((item) => (
                  <span
                    key={item}
                    className={`group relative cursor-default text-sm font-medium tracking-[0.08em] transition-colors ${
                      darkMode ? 'text-white/88 hover:text-[#D6C2A8]' : 'text-[#3B2A22] hover:text-[#D6C2A8]'
                    }`}
                  >
                    {item}
                    <span className={`absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${darkMode ? 'bg-[#D6C2A8]' : 'bg-[#D6C2A8]'}`} />
                  </span>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDarkMode((previous) => !previous)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                    darkMode
                      ? 'border-white/16 bg-white/8 text-white hover:bg-white/14'
                      : 'border-[#DDD6CF] bg-white/80 text-[#3B2A22] hover:bg-white'
                  }`}
                >
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#3B2A22] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(59,42,34,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D6C2A8] hover:text-[#3B2A22] hover:shadow-[0_22px_44px_rgba(59,42,34,0.28)]"
                >
                  Reserve Now
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-6 pt-16 pb-24">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center">
              <div className="premium-fade-up max-w-4xl">
                <p className={`mb-4 text-sm font-semibold uppercase tracking-[0.4em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>
                  Premium Booking Flow
                </p>
                <h2 className={`text-5xl font-extrabold leading-[0.94] drop-shadow-[0_22px_34px_rgba(17,17,17,0.34)] sm:text-6xl lg:text-7xl ${darkMode ? 'text-white' : 'text-[#111111]'}`}>
                  Amazing Booking System
                </h2>
                <p className={`mx-auto mt-6 max-w-3xl text-xl leading-relaxed sm:text-2xl ${darkMode ? 'text-white/88' : 'text-[#5C534D]'}`}>
                  We&apos;ve included a fully functional booking system for easy and hassle-free rental bookings.
                </p>
              </div>

              <div className="premium-fade-up mt-10 [animation-delay:180ms]">
                <div className={`inline-flex animate-[arrowBounce_2.4s_ease-in-out_infinite] items-center justify-center rounded-full border p-3 shadow-[0_10px_24px_rgba(17,17,17,0.22)] ${
                  darkMode
                    ? 'border-[#D6C2A8]/35 bg-[rgba(17,17,17,0.18)] text-[#D6C2A8]'
                    : 'border-[#B08968]/35 bg-white/70 text-[#3B2A22]'
                }`}>
                  <ArrowDownIcon />
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-[26rem] z-20 mx-auto max-w-7xl px-6">
            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <div className={`premium-rise-up pointer-events-auto rounded-[28px] border p-5 shadow-[0_32px_70px_rgba(17,17,17,0.28)] backdrop-blur-2xl [animation-delay:240ms] ${
                darkMode
                  ? 'border-white/14 bg-[rgba(250,247,242,0.92)]'
                  : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.9)]'
              }`}>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A817A]">Booking System Highlight</p>
                    <h3 className="mt-1 text-2xl font-bold text-[#3B2A22]">Interactive calendar picker demo</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8DDD0] text-[#3B2A22]">
                    <CalendarIcon />
                  </div>
                </div>

                <div className="mb-5 rounded-[22px] border border-[#E7E0D9] bg-[#FBF8F5] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    {STEP_TITLES.map((step, index) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setCurrentStep(index)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                          currentStep >= index ? 'bg-[#3B2A22] text-white' : 'bg-[#E8DDD0] text-[#5C534D]'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="hidden text-sm font-medium text-[#3B2A22] sm:block">{step}</span>
                      </button>
                    ))}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E8DDD0]">
                    <div
                      className="h-full rounded-full bg-[#B08968] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[24px] border border-[#E7E0D9] bg-white p-4 shadow-[0_18px_40px_rgba(59,42,34,0.08)]">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#3B2A22]">Select rental period</p>
                        <p className="text-xs text-[#8A817A]">Pickup and return dates</p>
                      </div>
                      <span className="rounded-full bg-[#F3F1EE] px-3 py-1 text-xs font-semibold text-[#5C534D]">{nights} days</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {CALENDAR_DATES.map((date) => {
                        const isSelected = date.day >= sortedRange[0] && date.day <= sortedRange[1]
                        const isEdge = date.day === sortedRange[0] || date.day === sortedRange[1]

                        return (
                          <button
                            key={date.day}
                            type="button"
                            onClick={() => handleDateClick(date.day)}
                            className={`rounded-2xl border px-2 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 ${
                              isSelected
                                ? isEdge
                                  ? 'border-[#3B2A22] bg-[#3B2A22] text-white'
                                  : 'border-[#3B2A22] bg-[#D6C2A8] text-[#3B2A22]'
                                : 'border-[#E7E0D9] bg-[#FBF8F5] text-[#5C534D] hover:border-[#B08968]'
                            }`}
                          >
                            <span className="block text-[10px] uppercase tracking-[0.12em]">{date.label}</span>
                            <span className="mt-1 block text-sm font-semibold">{date.day}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F8F5F1] px-4 py-3 text-sm text-[#3B2A22]">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="font-semibold">{formatDateValue(sortedRange[0])}</span>
                      </div>
                      <span className="text-[#8A817A]">to</span>
                      <span className="font-semibold">{formatDateValue(sortedRange[1])}</span>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#E7E0D9] bg-white p-4 shadow-[0_18px_40px_rgba(59,42,34,0.08)]">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#3B2A22]">Cart summary</p>
                        <p className="text-xs text-[#8A817A]">Animated subtotal preview</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8DDD0] text-[#3B2A22]">
                        <CartIcon />
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-2xl border border-[#E7E0D9] bg-[#FBF8F5] p-3">
                      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#E8DDD0]">
                        <img src={HERO_IMAGE} alt="Decor rental preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-[#111111]">Welcome Sign with Customized Planter</h4>
                          <p className="mt-1 text-xs text-[#8A817A]">Rs. 40 per day</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-xl border border-[#DDD6CF]">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(-1)}
                              className="px-3 py-2 text-[#5C534D] transition-colors hover:bg-[#F3F1EE]"
                            >
                              -
                            </button>
                            <span className="border-x border-[#DDD6CF] px-4 py-2 text-sm text-[#111111]">{selectedQuantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(1)}
                              className="px-3 py-2 text-[#5C534D] transition-colors hover:bg-[#F3F1EE]"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-[#111111]">Rs. {subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 rounded-2xl border border-[#E7E0D9] bg-white p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5C534D]">Subtotal</span>
                        <span className="font-medium text-[#111111]">Rs. {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5C534D]">Tax</span>
                        <span className="font-medium text-[#111111]">Rs. {tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5C534D]">Security deposit</span>
                        <span className="font-medium text-[#111111]">Rs. {deposit.toFixed(2)}</span>
                      </div>
                      <div className="rounded-2xl bg-[#3B2A22] px-4 py-4 text-white shadow-[0_18px_36px_rgba(59,42,34,0.24)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/64">Animated total due</p>
                        <p className="mt-2 text-3xl font-extrabold">Rs. {animatedTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <div className={`premium-rise-up pointer-events-auto rounded-[28px] border p-5 shadow-[0_32px_70px_rgba(17,17,17,0.22)] backdrop-blur-2xl [animation-delay:120ms] ${
                  darkMode
                    ? 'border-white/14 bg-[rgba(255,255,255,0.9)]'
                    : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.86)]'
                }`}>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A817A]">Reservation panel</p>
                      <h3 className="mt-1 text-2xl font-bold text-[#3B2A22]">Full booking visibility</h3>
                    </div>
                    <button type="button" className="text-sm font-semibold text-[#B08968] transition-colors hover:text-[#3B2A22]">
                      Edit
                    </button>
                  </div>

                  <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#E7E0D9] bg-[#F8F5F1] px-4 py-3">
                    <div className="flex items-center gap-2 text-[#3B2A22]">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold">{formatDateValue(sortedRange[0])}</span>
                    </div>
                    <span className="text-[#8A817A]">to</span>
                    <span className="text-sm font-semibold text-[#3B2A22]">{formatDateValue(sortedRange[1])}</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5C534D]">Progress</span>
                      <span className="font-medium text-[#111111]">{STEP_TITLES[currentStep]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C534D]">Quantity</span>
                      <span className="font-medium text-[#111111]">{selectedQuantity} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C534D]">Availability</span>
                      <span className="rounded-full bg-[#E5F6EA] px-3 py-1 text-xs font-semibold text-[#137B39]">Live inventory</span>
                    </div>
                    <div className="h-16 overflow-hidden rounded-2xl border border-[#E7E0D9] bg-[#FBF8F5] p-4">
                      <div className="h-3 w-1/3 animate-pulse rounded-full bg-[#E8DDD0]" />
                      <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-[#F0E7DE]" />
                    </div>
                  </div>
                </div>

                <div className={`premium-rise-up pointer-events-auto rounded-[28px] border p-5 backdrop-blur-2xl [animation-delay:200ms] ${
                  darkMode
                    ? 'border-white/12 bg-[rgba(17,17,17,0.56)] shadow-[0_24px_58px_rgba(17,17,17,0.24)]'
                    : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.78)] shadow-[0_24px_58px_rgba(59,42,34,0.12)]'
                }`}>
                  <p className={`text-sm font-semibold uppercase tracking-[0.32em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Why choose us</p>
                  <h3 className={`mt-3 text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-[#111111]'}`}>
                    Trust signals that animate on scroll
                  </h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {METRICS.map((metric, index) => (
                      <CounterCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        suffix={metric.suffix}
                        active={metricsVisible}
                        darkMode={darkMode}
                        delay={index * 120}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 px-6 pb-20 pt-[44rem] sm:pt-[50rem] xl:pt-[36rem]">
            <div className="mx-auto max-w-7xl space-y-16">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section>
                  <p className={`premium-fade-up mb-3 text-sm font-semibold uppercase tracking-[0.32em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Client voice</p>
                  <h3 className={`premium-fade-up text-4xl font-extrabold sm:text-5xl ${darkMode ? 'text-white' : 'text-[#111111]'}`}>
                    Testimonials and trust, without template styling
                  </h3>
                  <div className={`premium-rise-up mt-8 overflow-hidden rounded-[28px] border p-6 backdrop-blur-xl ${
                    darkMode
                      ? 'border-white/12 bg-[rgba(17,17,17,0.52)] shadow-[0_28px_60px_rgba(8,8,8,0.28)]'
                      : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.82)] shadow-[0_28px_60px_rgba(59,42,34,0.12)]'
                  }`}>
                    <div className="relative min-h-[220px]">
                      {TESTIMONIALS.map((testimonial, index) => (
                        <article
                          key={testimonial.name}
                          className={`absolute inset-0 transition-all duration-500 ${
                            activeTestimonial === index
                              ? 'translate-y-0 opacity-100'
                              : 'pointer-events-none translate-y-4 opacity-0'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#E8DDD0] shadow-[0_12px_24px_rgba(59,42,34,0.14)]">
                              <img src={HERO_IMAGE} alt={testimonial.name} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-[#111111]'}`}>{testimonial.name}</p>
                              <p className={`${darkMode ? 'text-white/62' : 'text-[#5C534D]'}`}>{testimonial.role}</p>
                            </div>
                          </div>
                          <p className={`mt-6 max-w-2xl text-xl leading-relaxed ${darkMode ? 'text-white/88' : 'text-[#3B2A22]'}`}>
                            "{testimonial.quote}"
                          </p>
                        </article>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      {TESTIMONIALS.map((testimonial, index) => (
                        <button
                          key={testimonial.name}
                          type="button"
                          onClick={() => setActiveTestimonial(index)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            activeTestimonial === index ? 'w-10 bg-[#3B2A22]' : 'w-2.5 bg-white/30'
                          }`}
                          aria-label={`Show testimonial ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid gap-4">
                  <div className={`premium-rise-up rounded-[28px] border p-6 backdrop-blur-xl ${
                    darkMode
                      ? 'border-white/12 bg-[rgba(17,17,17,0.52)] shadow-[0_28px_60px_rgba(8,8,8,0.24)]'
                      : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.82)] shadow-[0_28px_60px_rgba(59,42,34,0.12)]'
                  }`}>
                    <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Client logos</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {['Atlas', 'Vertex', 'Nexa', 'NorthCo'].map((brand) => (
                        <div
                          key={brand}
                          className={`rounded-2xl border px-4 py-5 text-center text-sm font-semibold transition-all duration-300 hover:-translate-y-1 ${
                            darkMode
                              ? 'border-white/12 bg-white/6 text-white/84'
                              : 'border-[#E7E0D9] bg-[#FBF8F5] text-[#3B2A22]'
                          }`}
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`premium-rise-up rounded-[28px] border p-6 backdrop-blur-xl ${
                    darkMode
                      ? 'border-white/12 bg-[rgba(17,17,17,0.52)] shadow-[0_28px_60px_rgba(8,8,8,0.24)]'
                      : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.82)] shadow-[0_28px_60px_rgba(59,42,34,0.12)]'
                  }`}>
                    <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Glimpse below fold</p>
                    <p className={`mt-3 text-lg leading-relaxed ${darkMode ? 'text-white/82' : 'text-[#5C534D]'}`}>
                      Designed to feel like premium SaaS with industrial discipline: cinematic visuals, strong conversion cues, fast scanning, and clean operational signals.
                    </p>
                  </div>
                </section>
              </div>

              <section>
                <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.32em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Services</p>
                <div className="grid gap-5 lg:grid-cols-3">
                  {SERVICES.map((service, index) => (
                    <article
                      key={service.title}
                      className={`premium-rise-up rounded-[26px] border p-6 transition-all duration-300 hover:-translate-y-2 ${
                        darkMode
                          ? 'border-white/12 bg-[rgba(17,17,17,0.56)] shadow-[0_24px_58px_rgba(17,17,17,0.24)]'
                          : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.84)] shadow-[0_24px_58px_rgba(59,42,34,0.12)]'
                      }`}
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${darkMode ? 'bg-[rgba(214,194,168,0.14)] text-[#D6C2A8]' : 'bg-[#E8DDD0] text-[#3B2A22]'}`}>
                        <span className="text-lg font-bold">{index + 1}</span>
                      </div>
                      <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#111111]'}`}>{service.title}</h4>
                      <p className={`mt-3 leading-relaxed ${darkMode ? 'text-white/72' : 'text-[#5C534D]'}`}>{service.text}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.32em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Latest blog and news</p>
                  <h3 className={`text-4xl font-extrabold sm:text-5xl ${darkMode ? 'text-white' : 'text-[#111111]'}`}>
                    Supporting sections ready for development
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {BLOGS.map((blog) => (
                    <article
                      key={blog.title}
                      className={`group rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-2 ${
                        darkMode
                          ? 'border-white/12 bg-[rgba(17,17,17,0.54)] shadow-[0_24px_58px_rgba(17,17,17,0.22)]'
                          : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.84)] shadow-[0_24px_58px_rgba(59,42,34,0.12)]'
                      }`}
                    >
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        darkMode ? 'bg-white/8 text-[#D6C2A8]' : 'bg-[#F3F1EE] text-[#3B2A22]'
                      }`}>
                        {blog.tag}
                      </span>
                      <p className={`mt-4 text-lg font-semibold leading-relaxed transition-colors duration-300 ${
                        darkMode ? 'text-white group-hover:text-[#D6C2A8]' : 'text-[#111111] group-hover:text-[#D6C2A8]'
                      }`}>
                        {blog.title}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <footer className={`rounded-[30px] border px-6 py-8 backdrop-blur-xl ${
                darkMode
                  ? 'border-white/12 bg-[rgba(17,17,17,0.54)] shadow-[0_24px_58px_rgba(17,17,17,0.22)]'
                  : 'border-[#DDD6CF] bg-[rgba(255,255,255,0.84)] shadow-[0_24px_58px_rgba(59,42,34,0.12)]'
              }`}>
                <div className="grid gap-8 md:grid-cols-4">
                  <div>
                    <p className={`text-lg font-extrabold ${darkMode ? 'text-white' : 'text-[#111111]'}`}>Rentify</p>
                    <p className={`mt-3 text-sm leading-relaxed ${darkMode ? 'text-white/68' : 'text-[#5C534D]'}`}>
                      Premium rental booking experience, designed to feel fast, clear, and high-trust across desktop and mobile.
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Quick links</p>
                    <div className={`mt-3 space-y-2 text-sm ${darkMode ? 'text-white/72' : 'text-[#5C534D]'}`}>
                      <p>Collections</p>
                      <p>Rental period</p>
                      <p>Checkout flow</p>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Contact</p>
                    <div className={`mt-3 space-y-2 text-sm ${darkMode ? 'text-white/72' : 'text-[#5C534D]'}`}>
                      <p>support@rentify.com</p>
                      <p>+92 300 0000000</p>
                      <p>Islamabad, Pakistan</p>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${darkMode ? 'text-[#D6C2A8]' : 'text-[#3B2A22]'}`}>Social</p>
                    <div className="mt-3 flex gap-3">
                      {['In', 'Fb', 'Ig'].map((social) => (
                        <span
                          key={social}
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 hover:-translate-y-1 ${
                            darkMode
                              ? 'border-white/12 bg-white/6 text-white/84'
                              : 'border-[#DDD6CF] bg-[#FBF8F5] text-[#3B2A22]'
                          }`}
                        >
                          {social}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
