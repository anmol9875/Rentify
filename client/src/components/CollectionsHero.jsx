export default function CollectionsHero() {
  return (
    <section
      className="relative flex min-h-[260px] w-full flex-col justify-end overflow-hidden bg-[#f5f0e8]"
      aria-label="Collections hero"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        }}
        aria-hidden="true"
      />
      {/* Beige overlay + blur for readability */}
      <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
      <div className="absolute inset-0 bg-linear-to-b from-[#bdab94] via-[#f5f0e821] to-[#f5f0e880]" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />

      {/* Content row: page title */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-10 pb-30">
        <h1 className="mb-6 text-6xl font-serif font-extrabold tracking-wide text-[#4b3b2a]">
          Collections
        </h1>
      </div>
    </section>
  )
}

