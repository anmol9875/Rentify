import { useState, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import CollectionsHero from '../components/CollectionsHero.jsx'
import RentalInventory from '../components/RentalInventory.jsx'
import AddProductModal from '../components/AddProductModal.jsx'
import Footer from '../components/Footer.jsx'
import AuthContext from '../context/AuthContext.jsx'
import { createProduct, deleteProduct, getAllProducts, getMyProducts, updateProduct } from '../services/api.js'

export default function Collections() {
  const { user, isAuthReady } = useContext(AuthContext)
  const location = useLocation()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const isSeller = user?.role === 'seller' || false
  const searchQuery = new URLSearchParams(location.search).get('search')?.trim() || ''
  const normalizedSearchQuery = searchQuery.toLowerCase()
  const isOwnedByCurrentSeller = (product) => {
    const sellerId =
      typeof product?.seller === 'object' ? product.seller?._id || product.seller?.id : product?.seller

    return Boolean(user?.id && sellerId && String(sellerId) === String(user.id))
  }

  useEffect(() => {
    if (!isAuthReady) return

    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const response = isSeller ? await getMyProducts() : await getAllProducts()
        const loadedProducts = response.products || []
        setProducts(isSeller ? loadedProducts.filter(isOwnedByCurrentSeller) : loadedProducts)
      } catch (e) {
        console.error('Error loading products:', e)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [isAuthReady, isSeller, user?.id])

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setAddModalOpen(false)
    setEditingProduct(null)
  }

  const handleAddProduct = async (newProduct) => {
    const response = await createProduct(newProduct)
    if (response?.product) {
      setProducts((prev) => [response.product, ...prev])
    }
  }

  const handleOpenEditModal = (product) => {
    setEditingProduct(product)
    setAddModalOpen(true)
  }

  const handleUpdateProduct = async (updatedProduct) => {
    const productId = editingProduct?._id || editingProduct?.id
    const response = await updateProduct(productId, updatedProduct)

    if (response?.product) {
      setProducts((prev) => prev.map((product) => (
        String(product._id || product.id) === String(response.product._id || response.product.id)
          ? response.product
          : product
      )))
    }
  }

  const handleRemoveProduct = async (productId) => {
    await deleteProduct(productId)
    setProducts((prev) => prev.filter((p) => p._id !== productId))
  }

  const filteredProducts = normalizedSearchQuery
    ? products.filter((product) => {
        const haystack = [
          product.title,
          product.description,
          product.duration,
          product.category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const searchWords = normalizedSearchQuery.split(/\s+/).filter(Boolean)

        return haystack.includes(normalizedSearchQuery) || searchWords.some((word) => haystack.includes(word))
      })
    : products

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <CollectionsHero />
      {searchQuery && (
        <section className="bg-[#f5f1ea] py-4">
          <div className="max-w-7xl mx-auto px-6">
            {filteredProducts.length > 0 ? (
              <p className="text-sm text-[#4b3b2a]">
                Showing {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} for "{searchQuery}"
              </p>
            ) : (
              <p className="text-sm text-red-500">
                No products found for "{searchQuery}". Try a different product name.
              </p>
            )}
          </div>
        </section>
      )}
      <RentalInventory
        products={filteredProducts}
        onAddProductClick={handleOpenAddModal}
        onEditProduct={handleOpenEditModal}
        onRemoveProduct={handleRemoveProduct}
        isSeller={isSeller}
        isLoading={isLoading}
      />
      {addModalOpen && (
        <AddProductModal
          onClose={handleCloseAddModal}
          onAddProduct={editingProduct ? handleUpdateProduct : handleAddProduct}
          initialProduct={editingProduct}
        />
      )}
      <Footer />
    </div>
  )
}

