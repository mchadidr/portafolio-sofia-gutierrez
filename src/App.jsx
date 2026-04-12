import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MobileBlocker from './components/MobileBlocker'
import { translations } from './translations.jsx'
import './App.css'

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [lang, setLang] = useState(() => {
    const savedLang = window.localStorage.getItem('site-lang')
    return savedLang === 'es' ? 'es' : 'en'
  })

  const t = translations[lang] ?? translations.en

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('site-lang', lang)
    document.documentElement.lang = lang
    document.title = t.meta.title
  }, [lang, t.meta.title])

  if (isMobile) {
    return <MobileBlocker t={t} />
  }

  return (
    <div className="app">
      <Navbar t={t} lang={lang} setLang={setLang} />
      <main className="main-content">
        <Hero t={t} lang={lang} />
      </main>
    </div>
  )
}

export default App
