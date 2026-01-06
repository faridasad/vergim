import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { getAuthData, type AuthData } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = getAuthData()

    if (!auth) {
      navigate({ to: '/onboarding/splash', replace: true })
      return
    }

    qc.setQueryData<AuthData>(['auth'], auth)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prevent rendering protected UI until we've checked localStorage
  if (!ready) return null // or spinner

  return <>{children}</>
}
