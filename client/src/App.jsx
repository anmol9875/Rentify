import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Collections from './Pages/Collections.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import Profile from './Pages/Profile.jsx'
import Faq from './Pages/Faq.jsx'
import Product from './Pages/Product.jsx'
import Checkout from './Pages/Checkout.jsx'
import ThankYou from './Pages/ThankYou.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  )
}
