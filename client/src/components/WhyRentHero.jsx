export default function WhyRentHero() {
  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-20"
      aria-label="Why rent with us"
    >
      {/* Background image with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)`,
        }}
        aria-hidden="true"
      />
      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
      />
      {/* Blur effect */}
      <div
        className="absolute inset-0 backdrop-blur-[0px]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Main Heading */}
        <h2 className="font-serif text-4xl font-extrabold text-white drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl">
          Why Rent with Us?
        </h2>

        {/* Benefit List */}
        <ul className="mx-auto mt-12 w-full max-w-xl space-y-4 text-left sm:space-y-5">
          <li className="font-sans text-lg font-medium text-white sm:text-xl md:text-2xl">
            - It is easy! Rent anytime, from anywhere
          </li>
          <li className="font-sans text-lg font-medium text-white sm:text-xl md:text-2xl">
            - Save time & money
          </li>
          <li className="font-sans text-lg font-medium text-white sm:text-xl md:text-2xl">
            - Space saving & sustainable
          </li>
        </ul>

        {/* CTA Button */}
        <a
          href="#rentals"
          className="mt-12 inline-block rounded-lg bg-[#E4CCAA] px-8 py-4 text-base font-semibold text-[#2d2d2d] shadow-md transition-colors hover:bg-[#D9BF9B] sm:text-lg"
        >
          Explore Our Decor Rentals
        </a>
      </div>
    </section>
  )
}
