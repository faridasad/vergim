import Header from '@/components/layout/header'
import Tabs from '@/components/layout/tabs'
import { AuthGuard } from '@/lib/auth-guards'

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SignalRProvider } from '@/contexts/SignalRContext'


export const Route = createFileRoute('/_main')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard>
      <SignalRProvider>
        <div className="pb-20">
          <Header />
          <Outlet />
          <Tabs />
        </div>
      </SignalRProvider>
    </AuthGuard>
  )
}
