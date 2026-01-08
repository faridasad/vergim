import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/shared/button'
import { Receipt } from 'lucide-react'
import type { AuthData } from '@/lib/auth'

export const Route = createFileRoute('/_main/home')({
  component: HomeComponent,
})

function HomeComponent() {
  const { data: auth } = useQuery<AuthData>({
    queryKey: ['auth'],
  })

  if (!auth) return null

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-gray-500">You are successfully signed in.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg border-b pb-2">Account Details</h2>
        <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
          <span className="text-gray-500">Account Number:</span>
          <span className="font-mono font-medium">{auth.account_number}</span>

          <span className="text-gray-500">Name:</span>
          <span className="font-medium">{auth.ownerInfo.name}</span>

          <span className="text-gray-500">Company:</span>
          <span className="font-medium">{auth.ownerInfo.company_name}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/receipts">
          <Button className="gap-2">
            <Receipt className="w-4 h-4" />
            Go to Receipts
          </Button>
        </Link>
      </div>
    </div>
  )
}
