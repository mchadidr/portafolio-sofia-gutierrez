import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Main navigation">
        {/* ── Left side: wordmark + separator + nav links ── */}
        <div className="navbar__left">
          <a href="#" className="navbar__wordmark" aria-label="Sofia Gutierrez home">
            {/* WORDMARK — replace text with an SVG logo or styled typeface when final branding is ready */}
            Sofia Gutierrez
          </a>

          <span className="navbar__separator" aria-hidden="true" />

          <ul className="navbar__links" role="list">
            <li><a href="#about" className="navbar__link">About</a></li>
            <li><a href="#projects" className="navbar__link">Projects</a></li>
            <li><a href="#contact" className="navbar__link">Contact</a></li>
          </ul>
        </div>

        {/* ── Right side: CTA button ── */}
        <div className="navbar__right">
          <a href="#contact" className="navbar__cta">
            Get in Touch
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
