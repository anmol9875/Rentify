export const checkoutValidation = {
  validateName: (name) => {
    if (!name || name.trim() === '') {
      return 'Name is required'
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters'
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
    return ''
  },

  validateEmail: (email) => {
    if (!email || email.trim() === '') {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return ''
  },

  validateAddress: (address) => {
    if (!address || address.trim() === '') {
      return 'Address is required'
    }
    if (address.trim().length < 5) {
      return 'Address must be at least 5 characters'
    }
    return ''
  },

  validateCity: (city) => {
    if (!city || city.trim() === '') {
      return 'City is required'
    }
    if (!/^[a-zA-Z\s'-]+$/.test(city)) {
      return 'City name is invalid'
    }
    return ''
  },

  validateZipCode: (zipCode) => {
    if (!zipCode || zipCode.trim() === '') {
      return 'Postal code is required'
    }
    if (!/^\d{5}$/.test(zipCode)) {
      return 'Please enter a valid Pakistani postal code (5 digits)'
    }
    return ''
  },

  validatePhoneNumber: (phone) => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required'
    }
    // Pakistani phone number validation
    // Accepts formats like +92 333 1560377 or +923331560377 or 03331560377
    const phoneRegex = /^(\+92|0)[0-9]{10}$|^(\+92\s[0-9]{3}\s[0-9]{7})$/
    const cleanPhone = phone.replace(/\s/g, '')
    
    if (!/^(\+92|0)[0-9]{10}$/.test(cleanPhone)) {
      return 'Please enter a valid Pakistani phone number (e.g., +92 333 1560377 or 03331560377)'
    }
    return ''
  },

  validateCountry: (country) => {
    if (!country || country.trim() === '') {
      return 'Country is required'
    }
    if (country !== 'Pakistan') {
      return 'Only Pakistan is available'
    }
    return ''
  },

  validateCheckoutForm: (formData) => {
    const errors = {}

    const nameError = checkoutValidation.validateName(formData.name)
    if (nameError) errors.name = nameError

    const emailError = checkoutValidation.validateEmail(formData.email)
    if (emailError) errors.email = emailError

    const addressError = checkoutValidation.validateAddress(formData.address)
    if (addressError) errors.address = addressError

    const cityError = checkoutValidation.validateCity(formData.city)
    if (cityError) errors.city = cityError

    const zipError = checkoutValidation.validateZipCode(formData.zipCode)
    if (zipError) errors.zipCode = zipError

    const phoneError = checkoutValidation.validatePhoneNumber(formData.phone)
    if (phoneError) errors.phone = phoneError

    const countryError = checkoutValidation.validateCountry(formData.country)
    if (countryError) errors.country = countryError

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  },
}
