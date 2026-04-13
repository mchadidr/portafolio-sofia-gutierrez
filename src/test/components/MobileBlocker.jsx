import './MobileBlocker.css'

function MobileBlocker({ t }) {
  return (
    <div className="mobile-blocker" role="alert" aria-live="polite">
      <p className="mobile-blocker__message">
        {t.mobileBlocker.line1}
        <br />
        {t.mobileBlocker.line2}
      </p>
    </div>
  )
}

export default MobileBlocker
