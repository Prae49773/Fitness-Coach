import Navbar from '../Navbar'
import Footer from '../Footer'

export default function AppLayout({
  children,
  showNavbar = false,
  showFooter = false,
  centered = false,
  className = '',
}) {
  return (
    <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      {showNavbar && <Navbar />}
      <main className={`flex-1 w-full ${centered ? 'flex items-center justify-center' : 'page-container py-8 lg:py-12'}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
