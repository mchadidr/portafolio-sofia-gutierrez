import Navbar from './components/Navbar'
import Hero from './components/Hero'
import './App.css'

function App() {
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
