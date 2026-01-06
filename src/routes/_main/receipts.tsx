import { ReceiptsPage } from '@/features/receipts/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/receipts')({
  component: ReceiptsRoute,
})

function ReceiptsRoute() {
  return <ReceiptsPage />
}
