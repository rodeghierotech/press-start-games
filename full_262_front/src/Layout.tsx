import Titulo from './components/Titulo.tsx'
import Footer from './components/Footer.tsx'
import { Outlet } from 'react-router-dom'

import { Toaster } from 'sonner'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Titulo />
      <Outlet />
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  )
}
