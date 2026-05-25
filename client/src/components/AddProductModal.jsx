import { useState } from 'react'
import { productValidation } from '../utils/productValidation.js'

const MAX_PRODUCT_IMAGE_SIZE = 1200
const PRODUCT_IMAGE_QUALITY = 0.82

const readFileAsDataUrl = (file) => (
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result)
    reader.onerror = () => reject(new Error('Could not read image file. Please try another image.'))
    reader.readAsDataURL(file)
  })
)

const loadImage = (src) => (
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not process image file. Please try another image.'))
    image.src = src
  })
)

const resizeImage = async (file) => {
  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const scale = Math.min(1, MAX_PRODUCT_IMAGE_SIZE / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Image processing is not supported in this browser.')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', PRODUCT_IMAGE_QUALITY)
}

function XIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function AddProductModal({ onClose, onAddProduct, initialProduct = null }) {
  const isEditing = Boolean(initialProduct)
  const [errors, setErrors] = useState({})
  const [previewImage, setPreviewImage] = useState(initialProduct?.image || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: initialProduct?.title || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price ? String(initialProduct.price) : '',
    category: initialProduct?.category || 'General',
    quantity: initialProduct?.inventory?.total ? String(initialProduct.inventory.total) : '1',
    image: initialProduct?.image || '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          image: 'Please upload a valid image file',
        }))
        return
      }

      setIsProcessingImage(true)
      try {
        const compressedImage = await resizeImage(file)
        setPreviewImage(compressedImage)
        setFormData((prev) => ({
          ...prev,
          image: compressedImage,
        }))
        // Clear image error when user selects an image
        if (errors.image) {
          setErrors((prev) => ({
            ...prev,
            image: '',
          }))
        }
      } catch (error) {
        setPreviewImage(null)
        setFormData((prev) => ({
          ...prev,
          image: '',
        }))
        setErrors((prev) => ({
          ...prev,
          image: error.message || 'Failed to process image. Please try another image.',
        }))
      } finally {
        setIsProcessingImage(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = productValidation.validateAddProduct(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    const productData = {
      title: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      quantity: parseInt(formData.quantity, 10),
      duration: initialProduct?.duration || '5 day',
      image: formData.image || 'https://images.unsplash.com/photo-1525101092490-eb2e-4ad61-a8b3-c1e65cce4de0?w=600&q=80',
    }

    try {
      await onAddProduct(productData)

      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'General',
        quantity: '1',
        image: '',
      })
      setPreviewImage(null)
      setErrors({})
      onClose()
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to save product. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[#D2B48C] px-8 py-6 flex items-center justify-between border-b border-gray-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#4b3b2a]">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? 'Update your listing details' : 'List your item on Rentify'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-300 rounded-full transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-0 bg-[#f5f1ea] px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-[#4b3b2a] mb-2">
                  Product Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Elegant Chiavari Chair"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#4b3b2a] mb-2">
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your product in detail. Include condition, features, and rental duration..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#4b3b2a] mb-2">
                  Category<span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="General">General</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Party Supplies">Party Supplies</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Decor">Decor</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[#4b3b2a] mb-2">
                  Available Quantity<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 5"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-[#4b3b2a] mb-2">
                  Product Image<span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-3">
                  {isProcessingImage ? (
                    <div className="flex h-48 w-full max-w-xs items-center justify-center rounded-lg border border-gray-300 bg-white text-sm text-[#6b6b6b]">
                      Preparing image...
                    </div>
                  ) : previewImage ? (
                    <div className="relative z-0 w-full max-w-xs overflow-hidden rounded-lg">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null)
                          setFormData((prev) => ({ ...prev, image: '' }))
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c49a5f] hover:bg-[#f9f7f4] transition-colors">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF</p>
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-[#4b3b2a] mb-2">
                  Price per Day (PKR)<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[#2c2c2c] font-medium">Rs.</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c49a5f] ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              {/* Info text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Product images can be updated after creation.
                </p>
              </div>

              {errors.submit && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {errors.submit}
                </div>
              )}

              {/* Submit button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border bg-grey-100 border-gray-700 text-[#2c2c2c] font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingImage}
                  className="flex-1 px-4 py-3 bg-[#c49a5f] hover:bg-[#b8966b] text-white font-medium rounded-lg transition-colors"
                >
                  {isProcessingImage ? 'Preparing image...' : isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
