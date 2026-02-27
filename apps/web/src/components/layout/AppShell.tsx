import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomTabBar } from './BottomTabBar'
import { ToastContainer } from '../ui/Toast'
import { useEffect } from 'react'
import { preloadModel } from '../../lib/tfClassifier'

export function AppShell() {
  // Preload TF.js model as early as possible
  useEffect(() => {
    preloadModel()
  }, [])

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomTabBar />
      <ToastContainer />
    </div>
  )
}
