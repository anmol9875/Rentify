import { useState } from 'react'

const STEPS = [
  {
    id: 1,
    title: '1 - Browse Inventory Collection',
    body:
      'Select the dates for your 5-day rental in the online calendar. Choose your pickup date and it will autofill your return date. You can also choose your desired pickup and return appointment times. Once your dates are selected the availability of items will show.\n\nHave fun exploring our full rental collection online and selecting your favourite items!',
  },
  {
    id: 2,
    title: '2 - Add Items to Cart',
    body:
      'Add your favourite decor and furniture pieces to the cart. You can adjust quantities, browse related items, and save your selections while you continue exploring the collection.',
  },
  {
    id: 3,
    title: '3 - Complete your Order',
    body:
      'Review your rental dates and items, then securely complete checkout online. You will receive an instant confirmation email with all of your rental details.',
  },
  {
    id: 4,
    title: '4 - Pick up, Enjoy & Return',
    body:
      'Pick up your rentals at the scheduled time (or arrange delivery where available), enjoy them at your event, then return them according to the agreed schedule—simple and stress-free.',
  },
]

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 transform transition-transform duration-200 ${
        open ? 'rotate-180' : 'rotate-0'
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HowItWorks() {
  const [openId, setOpenId] = useState(null)

  return (
    <section
      className="relative bg-[#D6C2A8] px-4 py-16 md:px-6 md:py-20"
      aria-label="How Rentify works"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-serif  text-4xl font-extrabold tracking-[0.12em] text-[#4B544C] sm:text-5xl md:text-6xl lg:text-6xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm font-medium tracking-[0.14em] text-[#9BA59C] uppercase">
          4 Step Guide to our Easy Online Rental Process
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl space-y-3">
        {STEPS.map((step) => {
          const isOpen = openId === step.id
          return (
            <div
              key={step.id}
              className="overflow-hidden rounded border border-[#e0d6cc] bg-[#fdf8f3] shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : step.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-[#4B544C]"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium md:text-base">
                  {step.title}
                </span>
                <span className="text-[#9BA59C]">
                  <ChevronIcon open={isOpen} />
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-[#e0d6cc] bg-[#fdf8f3] px-5 pb-5 pt-3 text-left">
                  {step.body.split('\n\n').map((para) => (
                    <p
                      key={para}
                      className="mb-3 text-sm leading-relaxed text-[#7b827a] last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
