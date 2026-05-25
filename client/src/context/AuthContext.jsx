import { createContext, useState, useEffect, useCallback } from 'react'
import { getCurrentUser } from '../services/api.js'

export const AuthContext = createContext(null)

const normalizeUser = (userData, fallback = null) => {
  if (!userData) return null

  return {
    ...userData,
    id: userData.id || userData._id || fallback?.id || fallback?._id,
    role: userData.role || userData.userType || fallback?.role || fallback?.userType || 'buyer',
    walletBalance: Number(userData.walletBalance) || 0,
  }
}

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('rentify_token')
    const rawUser = localStorage.getItem('rentify_user')
    const storedUser = rawUser ? normalizeUser(JSON.parse(rawUser)) : null

    return {
      token,
      user: token && storedUser ? storedUser : null,
    }
  } catch (e) {
    console.warn('Failed to read stored auth', e)
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth()
  const [user, setUser] = useState(storedAuth.user)
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(storedAuth.token && storedAuth.user))
  const [isAuthReady, setIsAuthReady] = useState(!storedAuth.token)

  useEffect(() => {
    const init = async () => {
      const { token, user: storedUser } = getStoredAuth()

      if (!token) {
        setUser(null)
        setIsLoggedIn(false)
        setIsAuthReady(true)
        return
      }

      if (storedUser) {
        setUser(storedUser)
        setIsLoggedIn(true)
      }

      try {
        const resp = await getCurrentUser()
        if (resp && resp.user) {
          const normalized = normalizeUser(resp.user, storedUser)
          setUser(normalized)
          setIsLoggedIn(true)
          try {
            localStorage.setItem('rentify_user', JSON.stringify(normalized))
          } catch (e) {
            console.warn('Failed to persist refreshed user', e)
          }
        }
      } catch (e) {
        console.warn('Failed to initialize auth from token', e)
        if (!storedUser) {
          setUser(null)
          setIsLoggedIn(false)
        }
      } finally {
        setIsAuthReady(true)
      }
    }

    init()
  }, [])

  const login = (userData) => {
    const userWithRole = normalizeUser(userData)
    setUser(userWithRole)
    setIsLoggedIn(true)
    setIsAuthReady(true)
    try {
      localStorage.setItem('rentify_user', JSON.stringify(userWithRole))
    } catch (e) {
      console.warn('Failed to persist auth', e)
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    setIsAuthReady(true)
    try {
      localStorage.removeItem('rentify_user')
      localStorage.removeItem('rentify_token')
    } catch (e) {
      console.warn('Failed to remove auth', e)
    }
  }

  const refreshUser = useCallback(async () => {
    try {
      const resp = await getCurrentUser()
      if (resp && resp.user) {
        const normalized = normalizeUser(resp.user)
        setUser(normalized)
        setIsLoggedIn(true)
        try {
          localStorage.setItem('rentify_user', JSON.stringify(normalized))
        } catch (e) {
          console.warn('Failed to persist refreshed user', e)
        }
        return normalized
      }
    } catch (e) {
      console.warn('Failed to refresh user', e)
    }
    return null
  }, [])

  const updateWallet = (delta) => {
    setUser((prev) => {
      if (!prev) return prev
      const currentBalance = Number(prev.walletBalance) || 0
      const updated = { ...prev, walletBalance: currentBalance + Number(delta) }
      try {
        localStorage.setItem('rentify_user', JSON.stringify(updated))
      } catch (e) {
        console.warn('Failed to persist wallet update', e)
      }
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAuthReady, login, logout, refreshUser, updateWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
