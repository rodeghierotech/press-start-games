import PressStartHeader from './components/ui/header-1'
import Footer from './components/Footer.tsx'
import { Outlet } from 'react-router-dom'

import { Toaster } from 'sonner'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <PressStartHeader />
      <Outlet />
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  )
}
