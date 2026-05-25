export default function DashboardHero() {
  return (
    <section
      className="relative flex min-h-[260px] w-full flex-col justify-end overflow-hidden bg-[#f5f0e8]"
      aria-label="Dashboard hero"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(./public/dashboardHero.webp)',
        }}
        aria-hidden="true"
      />
      {/* Beige overlay + blur for readability */}
      <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
      <div className="absolute inset-0 bg-linear-to-b from-[#bdab94] via-[#f5f0e860] to-[#f5f0e880]" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />

      {/* Content row: page title */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-10 pb-30">
        <h1 className="mb-4 text-6xl font-serif font-extrabold tracking-wide text-[#4b3b2a]">
          Dashboard
        </h1>
      </div>
    </section>
  )
}
