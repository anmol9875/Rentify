export const productValidation = {
  validateProductName: (name) => {
    if (!name || name.trim() === '') {
      return 'Product name is required'
    }
    if (name.trim().length < 3) {
      return 'Product name must be at least 3 characters'
    }
    if (name.trim().length > 100) {
      return 'Product name must be less than 100 characters'
    }
    return ''
  },

  validateDescription: (description) => {
    if (!description || description.trim() === '') {
      return 'Description is required'
    }
    if (description.trim().length < 10) {
      return 'Description must be at least 10 characters'
    }
    if (description.trim().length > 500) {
      return 'Description must be less than 500 characters'
    }
    return ''
  },

  validatePrice: (price) => {
    if (!price || price === '') {
      return 'Price is required'
    }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum)) {
      return 'Price must be a valid number'
    }
    if (priceNum <= 0) {
      return 'Price must be greater than 0'
    }
    if (priceNum > 100000) {
      return 'Price is too high'
    }
    return ''
  },

  validateCategory: (category) => {
    if (!category || category.trim() === '') {
      return 'Category is required'
    }
    return ''
  },

  validateQuantity: (quantity) => {
    if (!quantity || quantity === '') {
      return 'Quantity is required'
    }
    const quantityNum = parseInt(quantity, 10)
    if (isNaN(quantityNum)) {
      return 'Quantity must be a valid number'
    }
    if (quantityNum <= 0) {
      return 'Quantity must be at least 1'
    }
    if (quantityNum > 1000) {
      return 'Quantity is too high'
    }
    return ''
  },

  validateAddProduct: (formData) => {
    const errors = {}

    const nameError = productValidation.validateProductName(formData.name)
    if (nameError) errors.name = nameError

    const descError = productValidation.validateDescription(formData.description)
    if (descError) errors.description = descError

    const priceError = productValidation.validatePrice(formData.price)
    if (priceError) errors.price = priceError

    const categoryError = productValidation.validateCategory(formData.category)
    if (categoryError) errors.category = categoryError

    const quantityError = productValidation.validateQuantity(formData.quantity)
    if (quantityError) errors.quantity = quantityError

    // Validate image
    if (!formData.image || formData.image.trim() === '') {
      errors.image = 'Product image is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  },
}
