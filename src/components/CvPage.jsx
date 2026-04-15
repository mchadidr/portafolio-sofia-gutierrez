
import { translations } from '../translations.jsx'
import './CvPage.css'

function CvPage({ lang }) {
  const t = translations[lang] ?? translations.en
  const basePath = import.meta.env.BASE_URL
  const backgroundSrc = `${basePath}images/background.svg`
  // Use CV.svg for Spanish, resume.svg for English
  const imageSrc = lang === 'es'
    ? `${basePath}images/CV.svg`
    : `${basePath}images/resume.svg`
  const pageLabel = lang === 'es' ? 'CV' : 'Resume'

  const [showPopup, setShowPopup] = useState(false)

  // PDF download path
  const pdfPath = lang === 'es'
    ? `${basePath}images/CV - Sofía Gutiérrez Bohórquez.pdf`
    : `${basePath}images/Resume - Sofía Gutiérrez Bohórquez.pdf`


  // Show popup on click
  const handleImageClick = () => {
    setShowPopup(true)
  }

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false)
  }

  // Disable scrolling when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showPopup])

  // Download PDF
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfPath
    link.download = lang === 'es'
      ? 'CV - Sofía Gutiérrez Bohórquez.pdf'
      : 'Resume - Sofía Gutiérrez Bohórquez.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowPopup(false)
  }

  // Go back (now closes popup)
  const handleGoBack = () => {
    setShowPopup(false)
  }

  const handleError = () => {
    setSourceIndex((previousIndex) => {
      if (previousIndex >= sourceCandidates.length - 1) {
        return previousIndex
      }

      return previousIndex + 1
    })
  }

  return (
    <>
      <div 
        className="cv-page__background" 
        aria-hidden="true" 
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      />
      <section className="cv-page" aria-label={pageLabel}>
        <div className="cv-page__canvas" style={{position: 'relative'}}>
          <img
            className="cv-page__image"
            src={imageSrc}
            alt={pageLabel}
            loading="eager"
            style={{cursor: 'pointer'}}
            tabIndex={0}
            onClick={handleImageClick}
          />
          {showPopup && (
            <>
              <div
                className={`cv-page__popup-backdrop cv-page__popup-backdrop--visible`}
                onClick={handleClosePopup}
              />
              <div
                className={`cv-page__popup cv-page__popup--centered cv-page__popup--visible`}
                role="dialog"
                aria-modal="true"
              >
                <div className="cv-page__popup-btn-row cv-page__popup-btn-row--vertical-center">
                  <button className="cv-page__popup-btn" onClick={handleDownload}>
                    {lang === 'es' ? 'Descargar CV' : 'Download Resume'}
                  </button>
                </div>
                <button className="cv-page__popup-close" onClick={handleClosePopup} aria-label="Close">×</button>
              </div>
            </>
          )}
        </div>
        <footer className="cv-page__copyright" style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.95em', color: '#888'}}>
          {t.hero.slide17?.copyright}
        </footer>
      </section>
    </>
  )
}

export default CvPage
