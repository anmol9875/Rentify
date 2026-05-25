import { useState } from 'react'

function EyeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9.08 5.68A9.38 9.38 0 0112 5.25c6 0 9.75 6.75 9.75 6.75a18.2 18.2 0 01-2.71 3.38M6.22 7.72A18.44 18.44 0 002.25 12S6 18.75 12 18.75a9.27 9.27 0 004.02-.9" />
    </svg>
  )
}

export default function PasswordField({ className = '', ...props }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6b6b6b] transition hover:bg-[#f5f1ea] hover:text-[#4b3b2a] focus:outline-none focus:ring-2 focus:ring-[#D2B48C]"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        title={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}
