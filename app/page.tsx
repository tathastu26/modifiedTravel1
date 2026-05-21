'use client'

import { MainLayout } from '@/components/main-layout'
import { DashboardMap } from '@/components/dashboard/dashboard-map'

export default function Dashboard() {
  return (
    <MainLayout>
      <DashboardMap />
    </MainLayout>
  )
}
