import React, { createContext, useContext, useState, useCallback } from 'react'

interface User {
  username: string
  fullName: string
  roles: string[]
  token: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cc_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = useCallback((userData: User) => {
    localStorage.setItem('cc_token', userData.token)
    localStorage.setItem('cc_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token')
    localStorage.removeItem('cc_user')
    setUser(null)
  }, [])

  const isRole = useCallback((role: string) => {
    return user?.roles?.some(r => r.includes(role.toUpperCase())) ?? false
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
