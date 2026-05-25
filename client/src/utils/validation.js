// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return 'Email is required'
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  if (!phone) {
    return 'Phone number is required'
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return 'Please enter a valid phone number'
  }
  if (!phoneRegex.test(phone)) {
    return 'Phone number contains invalid characters'
  }
  return null
}

export const validateFullName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Full name is required'
  }
  if (name.trim().length < 2) {
    return 'Full name must be at least 2 characters'
  }
  return null
}

export const validateUsername = (username) => {
  if (!username || username.trim().length === 0) {
    return 'Username is required'
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters'
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores'
  }
  return null
}

export const validateAddress = (address) => {
  if (!address || address.trim().length === 0) {
    return 'Address is required'
  }
  if (address.trim().length < 5) {
    return 'Please enter a valid address'
  }
  return null
}

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required'
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}

export const validateCurrentPassword = (currentPassword) => {
  if (!currentPassword) {
    return 'Current password is required'
  }
  return null
}
