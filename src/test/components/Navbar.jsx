import './Navbar.css'

function Navbar({ t, lang, setLang }) {
  const isSpanish = lang === 'es'
  const cvLabel = isSpanish ? 'CV' : 'Resume'

  const toggleLanguage = () => {
    setLang(isSpanish ? 'en' : 'es')
  }

  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label={t.navbar.ariaMainNavigation}>
        {/* ── Left side: wordmark + separator + nav links ── */}
        <div className="navbar__left">
          <a href="/test" className="navbar__wordmark" aria-label={t.navbar.wordmarkAria}>
            {t.navbar.wordmark}
          </a>

          <span className="navbar__separator" aria-hidden="true" />

          <ul className="navbar__links" role="list">
            <li><a href="/test#about" className="navbar__link">{t.navbar.links.about}</a></li>
            <li><a href="/test#projects" className="navbar__link">{t.navbar.links.projects}</a></li>
            <li><a href="/test#contact" className="navbar__link">{t.navbar.links.contact}</a></li>
          </ul>
        </div>

        {/* ── Right side: language toggle ── */}
        <div className="navbar__right">
          <a href="/cv" className="navbar__cv-link">
            {cvLabel}
          </a>

          <span className="navbar__right-separator" aria-hidden="true" />

          <button
            type="button"
            className="navbar__lang-toggle"
            aria-label={t.navbar.language.ariaToggle}
            onClick={toggleLanguage}
          >
            <span className="navbar__lang-option">{t.navbar.language.esLabel}</span>
            <span className="navbar__lang-track" aria-hidden="true">
              <span className={`navbar__lang-thumb${isSpanish ? ' is-es' : ''}`} />
            </span>
            <span className="navbar__lang-option">{t.navbar.language.enLabel}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
