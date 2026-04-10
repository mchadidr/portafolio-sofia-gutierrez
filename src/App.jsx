import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MobileBlocker from './components/MobileBlocker'
import './App.css'

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobile) {
    return <MobileBlocker />
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Hero />
      </main>
    </div>
  )
}

export default App
