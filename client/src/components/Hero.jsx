export default function Hero() {
  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden px-6 text-white"
      aria-label="Hero"
    >
      {/* Background image with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 backdrop-blur-[0px]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="font-serif text-4xl font-extrabold tracking-[0.02em] text-white drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl">
          RENTIFY
        </h1>
        <p className="mt-6 text-lg font-light text-white/95 tracking-wide sm:text-xl md:text-2xl">
          Offering unique and on-trend decor rentals
        </p>
        <a
          href="#rentals"
          className="mt-10 inline-block rounded-lg bg-[#D6C2A8] px-8 py-4 text-base font-semibold text-[#3B2A22] shadow-md transition-colors hover:bg-[#c3a06f] sm:text-lg"
        >
          Checkout Products
        </a>

        <div className="mt-14 overflow-hidden rounded-full pt-5">
          <div className="relative">
            <div className="hero-marquee flex min-w-full items-center gap-16 whitespace-nowrap text-sm uppercase tracking-[0.24em] text-white">
              <span className="inline-flex">Luxury Event Rentals • Exclusive Decor Pieces • Wedding Essentials • Party Furniture • Event Accessories •</span>
              <span className="inline-flex">Luxury Event Rentals • Exclusive Decor Pieces • Wedding Essentials • Party Furniture • Event Accessories •</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
