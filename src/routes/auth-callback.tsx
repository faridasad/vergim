import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { verifyPosterAuth, storeAuthData, type AuthData } from '@/lib/auth'

const authSearchSchema = z.object({
  code: z.string(),
  account: z.string(),
})

export const Route = createFileRoute('/auth-callback')({
  validateSearch: authSearchSchema,
  component: AuthCallbackComponent,
})

function AuthCallbackComponent() {
  const { code, account } = Route.useSearch()
  console.log(code);

  const navigate = Route.useNavigate()
  const { queryClient } = Route.useRouteContext()

  const mutation = useMutation({
    mutationFn: () => verifyPosterAuth(code, account),
    onSuccess: (data: AuthData) => {
      storeAuthData(data)
      queryClient.setQueryData<AuthData>(['auth'], data)
      navigate({ to: '/home', replace: true })
    },
  })

  useEffect(() => {
    //if (!mutation.isPending && !mutation.isSuccess) mutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      {mutation.isError ? 'Auth failed' : 'Signing in...'}
    </div>
  )
}
