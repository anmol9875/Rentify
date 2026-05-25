// Utility functions for validating and hashing user passwords, email, phone, and address.
import bcrypt from 'bcryptjs'

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  // Pakistani phone format
  const phoneRegex = /^(\+92|0)[0-9]{10}$|^(\+92\s[0-9]{3}\s[0-9]{7})$/
  const cleanPhone = phone.replace(/\s/g, '')
  return /^(\+92|0)[0-9]{10}$/.test(cleanPhone)
}

export const validatePassword = (password) => {
  if (password.length < 8) return false
  if (!/(?=.*[a-z])/.test(password)) return false
  if (!/(?=.*[A-Z])/.test(password)) return false
  if (!/(?=.*\d)/.test(password)) return false
  return true
}

export const validateAddress = (address) => {
  return address && address.trim().length >= 5
}
