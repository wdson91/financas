import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard-content"

export default function HomePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
