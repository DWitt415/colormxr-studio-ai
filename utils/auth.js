import { useEffect, useState, createContext, useContext } from 'react'
import supabase from './supabase'

/**
 * Context to manage authentication state across the application
 */
export const AuthContext = createContext({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

/**
 * Provider component that wraps your app and makes auth object available
 * to any child component that calls useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get session data
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession()
      
      // Set the user and session if there is one
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Supabase auth event: ${event}`)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    // Cleanup subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  // Expose signOut function to components
  const value = {
    user,
    session,
    isLoading,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook for components to get the auth object and re-render when it changes.
 */
export const useAuth = () => {
  return useContext(AuthContext)
}

/**
 * Redirect helper function for protected routes
 */
export const redirectIfNotAuthenticated = async () => {
  const { data } = await supabase.auth.getSession()
  
  if (!data.session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  
  return {
    props: {},
  }
}
