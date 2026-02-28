import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomTabBar } from './BottomTabBar'
import { ToastContainer } from '../ui/Toast'
import { useEffect } from 'react'
import { preloadModel } from '../../lib/tfClassifier'

export function AppShell() {
  useEffect(() => {
    preloadModel()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-background-dark">
      <TopNav />
      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomTabBar />
      <ToastContainer />
    </div>
  )
}
