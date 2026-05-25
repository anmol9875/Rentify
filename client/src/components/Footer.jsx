const QUICK_LINKS = [
  'Our Story',
  'Rentals',
  'Styling & Planning',
  'FAQ',
  'Contact Us',
]

const SOCIAL_LINKS = [
  { name: 'Instagram', href: '#', Icon: InstagramIcon },
  { name: 'Pinterest', href: '#', Icon: PinterestIcon },
  { name: 'LinkedIn', href: '#', Icon: LinkedInIcon },
]

function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="6" r="1.25" fill="currentColor" />
    </svg>
  )
}

function PinterestIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9.5 8v8M9.5 8h2.5a2.5 2.5 0 010 5H9.5" />
    </svg>
  )
}

function LinkedInIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-[#B0B0B0]">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Left: Logo + tagline */}
          <div className="space-y-3">
            <a href="/" className="inline-block group">
              <span className="font-bold [350] text-xl md:text-2xl tracking-[0.02em] uppercase text-[#D2B48C] font-sans">
                RENTIFY
              </span>
              <span className="block w-full max-w-25 h-px bg-[#B0B0B0] mt-1.5" aria-hidden="true" />
            </a>
            <p className="text-sm leading-relaxed text-[#B0B0B0] max-w-sm pt-1">
              Creating unforgettable moments through bespoke event styling and furniture hire.
            </p>
          </div>

          {/* Center: Quick Links */}
          <div>
            <h3 className="font-[350] text-sm tracking-[0.08em] uppercase text-[#D2B48C] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((label) => (
                <li key={label}>
                  <a
                    href={`#${label.toLowerCase().replace(/\s/g, '-').replace('&', '')}`}
                    className="text-sm text-[#B0B0B0] hover:text-[#D2B48C] transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Connect / social */}
          <div>
            <h3 className="font-[350] text-sm tracking-[0.08em] uppercase text-[#D2B48C] mb-4">
              Connect
            </h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#2C2C2C] transition-colors"
                  aria-label={name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#4A4A4A]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-[#B0B0B0]">
            © 2025 Rentify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
