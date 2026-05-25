const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to make API calls with token
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add JWT token if available
  const token = localStorage.getItem('rentify_token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const responseText = await response.text()
    let data = null

    try {
      data = responseText ? JSON.parse(responseText) : null
    } catch {
      data = null
    }

    if (!response.ok) {
      throw new Error(data?.error || responseText || 'API Error')
    }

    return data ?? {}
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Auth endpoints
export const register = async (email, password, fullName, role) => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      confirmPassword: password,
      fullName,
      role,
    }),
  })
}

export const login = async (email, password) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export const getCurrentUser = async () => {
  return apiCall('/auth/me', {
    method: 'GET',
  })
}

// User endpoints
export const getProfile = async (userId) => {
  return apiCall(`/users/${userId}`, {
    method: 'GET',
  })
}

export const updateProfile = async (userId, data) => {
  return apiCall(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const changePassword = async (userId, currentPassword, newPassword, confirmPassword) => {
  return apiCall(`/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  })
}

export const getWalletBalance = async (userId) => {
  return apiCall(`/users/${userId}/wallet`, {
    method: 'GET',
  })
}

export const updateWalletBalance = async (userId, amount, action) => {
  return apiCall(`/users/${userId}/wallet`, {
    method: 'PUT',
    body: JSON.stringify({ amount, action }),
  })
}

// Product endpoints
export const getAllProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  return apiCall(`/products?${params.toString()}`, {
    method: 'GET',
  })
}

export const getProduct = async (productId) => {
  return apiCall(`/products/${productId}`, {
    method: 'GET',
  })
}

export const getMyProducts = async () => {
  return apiCall('/products/my-products', {
    method: 'GET',
  })
}

export const createProduct = async (productData) => {
  return apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  })
}

export const updateProduct = async (productId, productData) => {
  return apiCall(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  })
}

export const deleteProduct = async (productId) => {
  return apiCall(`/products/${productId}`, {
    method: 'DELETE',
  })
}

// Rental endpoints
export const createRental = async (rentalData) => {
  return apiCall('/rentals', {
    method: 'POST',
    body: JSON.stringify(rentalData),
  })
}

export const getRentals = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const query = params.toString()

  return apiCall(`/rentals${query ? `?${query}` : ''}`, {
    method: 'GET',
  })
}

export const getRental = async (rentalId) => {
  return apiCall(`/rentals/${rentalId}`, {
    method: 'GET',
  })
}

export const updateRentalStatus = async (rentalId, status) => {
  return apiCall(`/rentals/${rentalId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

// Transaction endpoints
export const getTransactions = async () => {
  return apiCall('/transactions', {
    method: 'GET',
  })
}

// Damage Report endpoints
export const analyzeDamage = async ({ rentalId, reportId, beforeImage, afterImage }) => {
  return apiCall('/damage-reports/analyze', {
    method: 'POST',
    body: JSON.stringify({
      rentalId,
      reportId,
      beforeImage,
      afterImage,
    }),
  })
}

export const getDamageReports = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const query = params.toString()

  return apiCall(`/damage-reports${query ? `?${query}` : ''}`, {
    method: 'GET',
  })
}

export const approveDamageReport = async (damageReportId, decision, notes = '') => {
  return apiCall(`/damage-reports/${damageReportId}/decide`, {
    method: 'POST',
    body: JSON.stringify({
      reportId: damageReportId,
      decision,
      notes,
    }),
  })
}

export const createDamageReport = async ({ rentalId, beforeImages, afterImages }) => {
  return apiCall('/damage-reports', {
    method: 'POST',
    body: JSON.stringify({
      rentalId,
      beforeImages,
      afterImages,
    }),
  })
}

// Review endpoints
export const submitReview = async ({ rentalId, rating, review }) => {
  return apiCall('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      rentalId,
      rating,
      review,
    }),
  })
}
