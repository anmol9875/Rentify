export default function ProfileHero() {
  return (
    <section
      className="relative flex min-h-[200px] w-full flex-col justify-end overflow-hidden bg-[#f5f0e8]"
      aria-label="Profile hero"
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
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      <div className="absolute inset-0 bg-linear-to-b from-[#baa37e80] via-[#f5f0e890] to-[#f5f0e8bd]" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[1px]" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-30">
        <h1 className="text-4xl font-serif font-bold tracking-wide text-[#3B2A22] drop-shadow-sm">
          Manage your account settings and preferences
        </h1>
      </div>
    </section>
  )
}
