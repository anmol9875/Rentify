import Header from '../components/Header.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Footer from '../components/Footer.jsx'

export default function Faq() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

